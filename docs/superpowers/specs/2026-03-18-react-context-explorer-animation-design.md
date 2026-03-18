# React Context Explorer 动画增强设计

> **日期**: 2026-03-18
> **目标**: 在现有 MVP 基础上增加动画和播放控制，增强上下文变化的过程感
> **风格**: 温暖教学风

---

## 一、设计目标

### 1.1 核心诉求

让用户**直观感受到** Agent 执行过程中上下文的**累积与生长**，而非静态切换。

### 1.2 使用场景

- **自学**: 深入理解 Agent 内部机制
- **教学**: 生动演示给别人看

### 1.3 成功标准

1. 用户能坐下来一键观看完整流程，像看电影一样流畅
2. 上下文变化有明确的视觉反馈（滑入 + 高亮）
3. Agent 当前状态清晰可见（思考/调用/观察/回答）
4. 可自由控制播放节奏（暂停、变速、跳转）

---

## 二、架构设计

### 2.1 组件树

```
App (播放控制器)
│
├── Header
│   └── AgentStatusBar (新增) - 顶部状态栏
│
├── PlaybackBar (新增) - 底部播放控制
│
├── Timeline (动画增强)
│   └── StepCard[] (播放模式时自动高亮当前步骤)
│
└── StepDetail
    ├── StepHeader (包含状态指示)
    └── ContextViewer (消息滑入动画)
        └── ContextMessage[] (单条消息独立动画)
```

### 2.2 类型定义（新增到 src/types/index.ts）

```typescript
// === 播放控制相关 ===
export type PlaybackMode = 'playing' | 'paused' | 'stopped';
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface PlaybackState {
  mode: PlaybackMode;
  speed: PlaybackSpeed;
  currentStepIndex: number;
  isAnimating: boolean;
}

export const SPEED_MAP: Record<PlaybackSpeed, number> = {
  0.5: 3000,  // 单步间隔 3 秒
  1: 1500,    // 单步间隔 1.5 秒
  1.5: 1000,  // 单步间隔 1 秒
  2: 750,      // 单步间隔 0.75 秒
};

// === Agent 状态相关 ===
export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'observing' | 'answering';

export interface AgentState {
  status: AgentStatus;
  message: string;
}

export const AGENT_STATUS_CONFIG: Record<AgentStatus, { icon: string; text: string; color: string }> = {
  idle: { icon: '', text: '就绪', color: 'slate-500' },
  thinking: { icon: '🧠', text: '思考中...', color: 'violet-500' },
  acting: { icon: '⚡', text: '调用工具中...', color: 'sky-500' },
  observing: { icon: '👁️', text: '观察结果中...', color: 'emerald-500' },
  answering: { icon: '💬', text: '生成回答中...', color: 'amber-500' },
};

// === 场景相关 ===
export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: Step[];
}

export interface Step {
  id: string;
  type: 'THOUGHT' | 'ACTION' | 'OBSERVATION' | 'ANSWER';
  title: string;
  description: string;
  /** 该步骤结束时的完整上下文快照 */
  contextSnapshot: ContextMessage[];
  /** 该步骤新增的上下文内容（用于动画） */
  contextDiff: ContextMessage[];
  /** token 统计 */
  tokens: {
    used: number;
    limit: number;
  };
}

export interface ContextMessage {
  role: 'system' | 'user' | 'assistant' | 'tool_call' | 'tool_result';
  content: string;
  /** 是否为当前步骤新增（用于高亮） */
  isNew?: boolean;
}
```

### 2.4 App 状态管理

```typescript
// App 持有
const [playback, setPlayback] = useState<PlaybackState>({
  mode: 'stopped',
  speed: 1,
  currentStepIndex: 0,
  isAnimating: false,
});

const [agentState, setAgentState] = useState<AgentState>({
  status: 'idle',
  message: '',
});

const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
```

---

## 三、播放流程

```
┌─────────────────────────────────────────────────────────────────────┐
│  用户点击播放                                              │
│      ↓                                                     │
│  mode: 'playing'                                         │
│      ↓                                                     │
│  启动定时器 (根据 speed 计算间隔)                          │
│      ↓                                                     │
│  ┌─────────┐                                             │
│  │ 当前step │ 1. 更新 AgentState (思考中...)               │
│  │ 开始    │ 2. 逐步触发消息进场动画                        │
│  └─────────┘ 3. 动画完成后更新进度                        │
│      ↓                                                     │
│  全部完成? ─No──> 继续下一步                           │
│      │Yes                                                   │
│      ↓                                                     │
│  mode: 'stopped'                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 四、组件设计

### 3.1 AgentStatusBar (新增)

**位置**: Header 下方固定

**界面**:
```
┌──────────────────────────────────────────────────────────────────────┐
│  🧠 Agent 正在思考...                      Token: 156 / 4096  │
└──────────────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
import type { AgentStatus } from '../types';

interface AgentStatusBarProps {
  status: AgentStatus;
  message: string;
  tokens: { used: number; limit: number };
}
```

**状态映射**（使用 AGENT_STATUS_CONFIG）:
| status | 图标 | 文本 | 颜色 |
|--------|------|------|------|
| idle | - | 就绪 | slate-500 |
| thinking | 🧠 | 思考中... | violet-500 |
| acting | ⚡ | 调用工具中... | sky-500 |
| observing | 👁️ | 观察结果中... | emerald-500 |
| answering | 💬 | 生成回答中... | amber-500 |

### 3.2 PlaybackBar (新增)

**位置**: 底部固定或内容区底部

**界面**:
```
┌──────────────────────────────────────────────────────────────────────┐
│  ⏮️  ⏸️  ⏯️  ⏭️    进度条 ▓▓▓▓▓░░░  1.0x ▼    │
└──────────────────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
import type { PlaybackMode, PlaybackSpeed } from '../types';

interface PlaybackBarProps {
  mode: PlaybackMode;
  speed: PlaybackSpeed;
  progress: number; // 0-1
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (progress: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}
```

### 3.3 ContextViewer (动画增强)

**动画效果**:

1. **新消息进场**: 从右侧滑入 + 淡入
2. **高亮闪烁**: 进场后蓝色背景闪烁 1 次

**CSS**:
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes highlight {
  0%, 100% {
    background-color: rgba(99, 102, 241, 0.1);
  }
  50% {
    background-color: rgba(99, 102, 241, 0.3);
  }
}

.context-message.new {
  animation:
    slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    highlight 1s ease-in-out;
}
```

**Props 变化**:
```typescript
interface ContextViewerProps {
  messages: ContextMessage[];
  tokens: { used: number; limit: number };
  animateMode?: boolean; // 控制是否启用动画
  animatingIndices?: Set<number>; // 正在播放动画的消息索引
  onAnimationComplete?: (index: number) => void; // 动画完成回调
}

// 动画生命周期
// 1. 父组件设置 animatingIndices = Set(index)
// 2. ContextMessage 获得动画类名，开始播放
// 3. 动画完成后触发 onAnimationComplete(index)
// 4. 父组件从 animatingIndices 中移除该索引
```

### 3.4 StepCard (播放模式增强)

**Props**:
```typescript
interface StepCardProps {
  step: Step;
  index: number;
  isActive: boolean;
  isPlaying?: boolean; // 是否处于播放模式
  onClick: () => void;
}
```

**播放模式时**:
- 当前步骤自动高亮（无需点击）
- 非当前步骤淡化显示
- 有"播放中"微动画（光标闪烁或边缘发光）

### 3.5 StepDetail (Props 扩展)

**Props**:
```typescript
interface StepDetailProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isPlaying?: boolean; // 播放模式下禁用手动导航
  animateMode?: boolean; // 是否启用动画
}
```

### 3.6 Timeline (播放模式增强)

**Props**:
```typescript
interface TimelineProps {
  steps: Step[];
  currentIndex: number;
  onSelect: (index: number) => void;
  playbackMode?: boolean; // 是否处于播放模式
  isPlaybackActive?: boolean; // 播放是否正在进行（用于处理点击冲突）
  onPlaybackStop?: () => void; // 播放中手动跳转时停止播放
}
```

**播放/手动切换冲突处理**:
```typescript
const handleStepSelect = (index: number) => {
  // 如果正在播放，先停止播放
  if (isPlaybackActive) {
    onPlaybackStop?.(); // 通知父组件停止播放
  }
  onSelect(index);
};
```

---

## 五、视觉风格

### 4.1 配色方案（温暖教学风）

| 用途 | Tailwind 类 |
|------|------------|
| 背景 | `bg-slate-900` |
| 卡片背景 | `bg-slate-800/80` |
| 主要文字 | `text-slate-100` |
| 次要文字 | `text-slate-400` |
| 强调色 | `indigo-500` |
| 思考 | `violet-500` |
| 动作 | `sky-500` |
| 观察 | `emerald-500` |
| 回答 | `amber-500` |

### 4.2 圆角与间距

- 卡片圆角: `rounded-xl`
- 按钮圆角: `rounded-lg`
- 卡片间距: `gap-3` 或 `space-y-3`
- 内边距: `p-4` ~ `p-6`

### 4.3 图标

使用 emoji 作为图标，保持轻量和友好：
- 🧠 思考
- ⚡ 动作
- 👁️ 观察
- 💬 回答
- ⏮️ 重播
- ⏸️ 暂停
- ⏯️ 停止
- ⏭️ 下一步

---

## 六、播放控制功能

### 5.1 基础控制

| 功能 | 描述 |
|------|------|
| 播放/暂停 | 切换 playing/paused 状态 |
| 停止 | 停止播放，回到第一步 |
| 上一步/下一步 | 手动单步控制 |
| 进度条拖拽 | 直接跳转到指定位置 |

### 5.2 速度控制

| 倍速 | 单步间隔 | 用途 |
|------|----------|------|
| 0.5x | 3000ms | 慢速演示，适合教学 |
| 1x | 1500ms | 正常速度 |
| 1.5x | 1000ms | 快速预览 |
| 2x | 750ms | 极速浏览 |

### 5.3 自动播放逻辑

```typescript
function usePlayback(scenario: Scenario, onStepComplete: () => void) {
  const timerRef = useRef<number>();
  const { currentStepIndex, mode, speed } = playback;

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startPlayback = (speed: PlaybackSpeed) => {
    const interval = SPEED_MAP[speed]; // 使用预定义的间隔时间
    timerRef.current = setInterval(() => {
      executeNextStepAnimation();
    }, interval);
  };

  const stopPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  };

  // 触发消息进场动画
  const triggerMessageAnimations = (diff: ContextMessage[]) => {
    // 计算新增消息在完整上下文中的索引
    const baseIndex = scenario.steps[currentStepIndex].contextSnapshot.length - diff.length;
    const newIndices = diff.map((_, i) => baseIndex + i);

    // 将新消息索引加入动画状态
    setAnimatingIndices(new Set(newIndices));
  };

  // 执行下一步动画
  const executeNextStepAnimation = () => {
    const step = scenario.steps[currentStepIndex];

    // 1. 触发消息动画进场
    triggerMessageAnimations(step.contextDiff);

    // 2. 动画完成后触发回调
    // 延迟时间由 SPEED_MAP 控制，确保动画完整播放
    setTimeout(() => {
      onStepComplete();
    }, SPEED_MAP[speed] * 0.5); // 动画在单步间隔的一半时间完成
  };

  return { startPlayback, stopPlayback, triggerMessageAnimations };
}
```

**说明**：
- `SPEED_MAP` 控制单步之间的间隔时间（决定播放节奏）
- `SPEED_MAP[speed] * 0.5` 控制动画在单步间隔内的完成时间（确保动画有足够时间播放完）
- 例如 1x 速度：单步间隔 1500ms，动画 750ms 内完成

---

## 七、数据流与动画时序

### 6.1 单步执行时序（基础速度 1x）

```
时刻 0ms (speed * 1):
  ├─ AgentState: thinking → "分析用户请求..."
  ├─ Timeline: 高亮当前步骤
  └─ StepDetail: 显示标题

时刻 300ms (speed * 1):
  ├─ ContextViewer: 新消息滑入动画开始
  └─ ContextViewer: 新消息高亮闪烁

时刻 800ms (speed * 1):
  ├─ 动画完成
  ├─ AgentState: acting → "调用天气工具"
  └─ ContextViewer: 下一新消息滑入

时刻 1300ms (speed * 1):
  ├─ 动画完成
  ├─ AgentState: observing → "获取天气结果"
  └─ ContextViewer: 工具结果滑入

时刻 1800ms (speed * 1):
  └─ 准备下一步

// 速度为 0.5x 时，所有时刻乘以 2
// 速度为 1.5x 时，所有时刻除以 1.5
// 速度为 2x 时，所有时刻除以 2
```

### 6.2 播放/暂停/跳转处理

**暂停时**:
- 停止定时器
- 保持当前界面状态
- 暂停按钮变为播放图标

**继续播放时**:
- 从当前步骤继续
- 速度设置保持不变

**手动跳转时**:
```typescript
const handleStepSeek = (index: number) => {
  // 如果正在播放，先停止
  if (playback.mode === 'playing') {
    stopPlayback();
    setPlayback(prev => ({ ...prev, mode: 'paused' }));
  }

  // 直接跳到目标步骤（不播放动画）
  setStepIndex(index);

  // 停止所有正在进行的动画
  setAnimatingIndices(new Set());
};
```

---

## 八、实现边界

### 7.1 不包含（后续迭代）

- ❌ 自定义场景编辑器
- ❌ 分支探索（if/else 路径）
- ❌ 真实 LLM API 集成
- ❌ 音效/语音解说
- ❌ 导出为视频/GIF

### 7.2 MVP 范围

- ✅ 自动播放功能
- ✅ 消息滑入动画
- ✅ 消息高亮闪烁
- ✅ Agent 状态栏
- ✅ 播放控制条
- ✅ 速度调节
- ✅ 进度条跳转
- ✅ 温暖教学风格配色

---

## 九、技术实现要点

### 8.1 动画库选择

使用 CSS 动画（原生），无需额外依赖：
- 性能好，浏览器原生优化
- 代码量少，维护简单
- 与 Tailwind 配合良好

### 8.2 定时器处理

使用 `requestAnimationFrame` 或 `setTimeout` 实现精确控制：
```typescript
const scheduleNextStep = (delay: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay / speed);
  });
};
```

### 8.3 动画状态同步

使用 `useEffect` 监听播放状态变化：
```typescript
useEffect(() => {
  if (playback.mode === 'playing') {
    startPlayback();
  } else {
    stopPlayback();
  }
  return () => stopPlayback();
}, [playback.mode, playback.speed]);
```

---

## 十、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/App.tsx` | 修改 | 增加 PlaybackState, AgentState，整合播放控制逻辑 |
| `src/components/AgentStatusBar.tsx` | 新增 | 顶部状态栏组件 |
| `src/components/PlaybackBar.tsx` | 新增 | 底部播放控制组件 |
| `src/components/ContextViewer.tsx` | 修改 | 增加消息滑入动画、动画状态管理 |
| `src/components/StepCard.tsx` | 修改 | 增加 isPlaying, isPlaybackActive 支持 |
| `src/components/Timeline.tsx` | 修改 | 增加 playbackMode, isPlaybackActive 支持，处理播放/点击冲突 |
| `src/components/StepDetail.tsx` | 修改 | 增加 isPlaying, animateMode Props |
| `src/types/index.ts` | 修改 | 新增 PlaybackMode, PlaybackSpeed, AgentStatus, SPEED_MAP, AGENT_STATUS_CONFIG |
| `src/styles/index.css` | 修改 | 添加 slideIn, highlight 动画关键帧 |
