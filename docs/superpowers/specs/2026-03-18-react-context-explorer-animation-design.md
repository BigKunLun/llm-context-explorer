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

### 2.2 状态管理

```typescript
interface PlaybackState {
  mode: 'playing' | 'paused' | 'stopped';
  speed: 0.5 | 1 | 1.5 | 2;
  currentStepIndex: number;
  isAnimating: boolean;
}

interface AgentState {
  status: 'idle' | 'thinking' | 'acting' | 'observing' | 'answering';
  message: string;
}

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
```

### 2.3 播放流程

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

## 三、组件设计

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
interface AgentStatusBarProps {
  status: AgentStatus;
  message: string;
  tokens: { used: number; limit: number };
}

type AgentStatus = 'idle' | 'thinking' | 'acting' | 'observing' | 'answering';
```

**状态映射**:
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

type PlaybackMode = 'playing' | 'paused' | 'stopped';
type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;
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
  animateMode?: boolean; // 新增：控制是否启用动画
  newMessageIndex?: number; // 新增：指定哪条消息是新的
}
```

### 3.4 StepCard (播放模式增强)

**播放模式时**:
- 当前步骤自动高亮（无需点击）
- 非当前步骤淡化显示
- 有"播放中"微动画（光标闪烁或边缘发光）

### 3.5 Timeline (播放模式增强)

**Props**:
```typescript
interface TimelineProps {
  steps: Step[];
  currentIndex: number;
  onSelect: (index: number) => void;
  playbackMode?: boolean; // 新增：是否处于播放模式
}
```

---

## 四、视觉风格

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

## 五、播放控制功能

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
function usePlayback(scenario: Scenario) {
  const timerRef = useRef<number>();

  const startPlayback = (speed: PlaybackSpeed) => {
    const interval = SPEED_MAP[speed]; // 1500ms for 1x
    timerRef.current = setInterval(() => {
      // 执行下一步动画
      executeNextStepAnimation();
    }, interval);
  };

  const stopPlayback = () => {
    clearInterval(timerRef.current);
  };

  return { startPlayback, stopPlayback };
}
```

---

## 六、数据流与动画时序

### 6.1 单步执行时序

```
时刻 0ms:
  ├─ AgentState: thinking → "分析用户请求..."
  ├─ Timeline: 高亮当前步骤
  └─ StepDetail: 显示标题

时刻 300ms:
  ├─ ContextViewer: 新消息滑入动画开始
  └─ ContextViewer: 新消息高亮闪烁

时刻 800ms:
  ├─ 动画完成
  ├─ AgentState: acting → "调用天气工具"
  └─ ContextViewer: 下一新消息滑入

时刻 1300ms:
  ├─ 动画完成
  ├─ AgentState: observing → "获取天气结果"
  └─ ContextViewer: 工具结果滑入

时刻 1800ms:
  └─ 准备下一步
```

### 6.2 播放/暂停处理

**暂停时**:
- 停止定时器
- 保持当前界面状态
- 暂停按钮变为播放图标

**继续播放时**:
- 从当前步骤继续
- 速度设置保持不变

**跳转时**:
- 停止当前动画
- 直接跳到目标步骤的最终状态
- 重置播放状态为 paused

---

## 七、实现边界

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

## 八、技术实现要点

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

## 九、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/App.tsx` | 修改 | 增加 PlaybackState, AgentState |
| `src/components/AgentStatusBar.tsx` | 新增 | 顶部状态栏组件 |
| `src/components/PlaybackBar.tsx` | 新增 | 底部播放控制组件 |
| `src/components/ContextViewer.tsx` | 修改 | 增加动画效果 |
| `src/components/StepCard.tsx` | 修改 | 播放模式增强 |
| `src/components/Timeline.tsx` | 修改 | 播放模式增强 |
| `src/types/index.ts` | 修改 | 新增相关类型 |
| `src/styles/index.css` | 修改 | 动画关键帧 |
