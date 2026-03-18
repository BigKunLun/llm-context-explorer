# React Context Explorer 动画增强实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 MVP 基础上增加动画和播放控制，增强上下文变化的过程感，实现温暖教学风格的视觉体验。

**Architecture:** 渐进式增强架构，在现有组件上添加动画层和播放控制，保持数据结构兼容性。

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, 原生 CSS 动画

---

## 文件结构映射

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/types/index.ts` | 修改 | 播放控制、Agent 状态类型定义 |
| `src/styles/index.css` | 修改 | 动画关键帧（slideIn, highlight） |
| `src/components/AgentStatusBar.tsx` | 新增 | 顶部 Agent 状态显示 |
| `src/components/PlaybackBar.tsx` | 新增 | 底部播放控制条 |
| `src/components/ContextViewer.tsx` | 修改 | 消息滑入动画、动画状态管理 |
| `src/components/StepCard.tsx` | 修改 | 播放模式视觉增强 |
| `src/components/Timeline.tsx` | 修改 | 播放模式、冲突处理 |
| `src/components/StepDetail.tsx` | 修改 | Props 扩展、播放模式支持 |
| `src/App.tsx` | 修改 | 播放状态管理、逻辑整合 |
| `src/data/scenarios.ts` | 修改 | 更新类型导入 |

---

## Chunk 1: 类型定义与动画基础

### Task 1: 扩展类型定义

**Files:**
- Modify: `src/types/index.ts`

**步骤**:

- [ ] **Step 1: 添加播放控制相关类型**

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
  0.5: 3000,
  1: 1500,
  1.5: 1000,
  2: 750,
};
```

- [ ] **Step 2: 添加 Agent 状态相关类型**

```typescript
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
```

- [ ] **Step 3: Commit 类型定义**

```bash
git add src/types/index.ts
git commit -m "feat: 添加播放控制和 Agent 状态类型定义"
```

---

### Task 2: 添加动画 CSS

**Files:**
- Modify: `src/styles/index.css`

**步骤**:

- [ ] **Step 1: 添加 slideIn 动画关键帧**

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
```

- [ ] **Step 2: 添加 highlight 动画关键帧**

```css
@keyframes highlight {
  0%, 100% {
    background-color: rgba(99, 102, 241, 0.1);
  }
  50% {
    background-color: rgba(99, 102, 241, 0.3);
  }
}
```

- [ ] **Step 3: 添加新消息动画类**

```css
.context-message-new {
  animation:
    slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    highlight 1s ease-in-out;
}
```

- [ ] **Step 4: Commit 动画样式**

```bash
git add src/styles/index.css
git commit -m "feat: 添加消息进场和闪高亮动画"
```

---

## Chunk 2: 新增播放控制组件

### Task 3: AgentStatusBar 组件

**Files:**
- Create: `src/components/AgentStatusBar.tsx`

**步骤**:

- [ ] **Step 1: 创建组件基础结构**

```tsx
// src/components/AgentStatusBar.tsx
import type { AgentStatus } from '../types';
import { AGENT_STATUS_CONFIG } from '../types';

interface AgentStatusBarProps {
  status: AgentStatus;
  message: string;
  tokens: { used: number; limit: number };
}

export function AgentStatusBar({ status, message, tokens }: AgentStatusBarProps) {
  const config = AGENT_STATUS_CONFIG[status];

  return (
    <div className="bg-slate-800/50 border-y border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <span className={`font-medium ${config.color}`}>{config.text}</span>
          {message && <span className="text-slate-400 ml-2">{message}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            Tokens: <span className="font-mono text-slate-100">{tokens.used}</span> / {tokens.limit}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit 组件**

```bash
git add src/components/AgentStatusBar.tsx
git commit -m "feat: 添加 AgentStatusBar 组件"
```

---

### Task 4: PlaybackBar 组件

**Files:**
- Create: `src/components/PlaybackBar.tsx`

**步骤**:

- [ ] **Step 1: 创建播放条基础结构**

```tsx
// src/components/PlaybackBar.tsx
import type { PlaybackMode, PlaybackSpeed } from '../types';

interface PlaybackBarProps {
  mode: PlaybackMode;
  speed: PlaybackSpeed;
  progress: number; // 0-1
  totalSteps: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (progress: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackBar({
  mode, speed, progress, totalSteps,
  onTogglePlay, onPrev, onNext, onSeek, onSpeedChange
}: PlaybackBarProps) {
  const progressPercent = progress * 100;
  const isPlaying = mode === 'playing';

  return (
    <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        {/* 播放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="上一步"
          >
            ⏮️
          </button>
          <button
            onClick={onTogglePlay}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying ? 'hover:bg-slate-700' : 'hover:bg-slate-700 bg-indigo-500'
            }`}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={onNext}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="下一步"
          >
            ⏭️
          </button>
        </div>

        {/* 进度条 */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={(e) => onSeek(Number(e.target.value) / 100)}
            className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, indigo-500 0%, indigo-500 ${progressPercent}%, slate-700 ${progressPercent}%, slate-700 100%)`
            }}
          />
          <span className="text-sm text-slate-400 w-12">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* 速度控制 */}
        <select
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value) as PlaybackSpeed)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SPEED_OPTIONS.map(s => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit 组件**

```bash
git add src/components/PlaybackBar.tsx
git commit -m "feat: 添加 PlaybackBar 组件"
```

---

## Chunk 3: 增强现有组件

### Task 5: 增强 ContextViewer 组件

**Files:**
- Modify: `src/components/ContextViewer.tsx`

**步骤**:

- [ ] **Step 1: 添加动画相关 Props**

```tsx
// src/components/ContextViewer.tsx - 添加到现有 interface ContextViewerProps
animateMode?: boolean; // 控制是否启用动画
animatingIndices?: Set<number>; // 正在播放动画的消息索引
onAnimationComplete?: (index: number) => void; // 动画完成回调
```

- [ ] **Step 2: 添加动画类名计算函数**

```tsx
// src/components/ContextViewer.tsx - 添加组件内函数

const getAnimationClassName = (index: number): string => {
  if (!animateMode) return '';
  if (animatingIndices?.has(index)) {
    return 'new context-message-new';
  }
  return '';
};

const handleAnimationEnd = (index: number) => {
  onAnimationComplete?.(index);
};
```

- [ ] **Step 3: 更新消息渲染添加动画类名和事件**

```tsx
// src/components/ContextViewer.tsx - 在消息 div 上添加条件类名和事件
<div
  key={index}
  onAnimationEnd={() => handleAnimationEnd(index)}
  className={`p-3 ${getAnimationClassName(index)}`}
>
```

- [ ] **Step 4: Commit 修改**

```bash
git add src/components/ContextViewer.tsx
git commit -m "feat: ContextViewer 支持消息进场动画"
```

---

### Task 6: 增强 StepCard 组件

**Files:**
- Modify: `src/components/StepCard.tsx`

**步骤**:

- [ ] **Step 1: 添加播放模式 Props**

```tsx
// src/components/StepCard.tsx - 添加到 interface StepCardProps
isPlaying?: boolean; // 是否处于播放模式
```

- [ ] **Step 2: 更新样式以支持播放模式**

```tsx
// src/components/StepCard.tsx - 更新 className 添加播放模式条件
className={`
  w-full text-left p-3 rounded-xl border transition-all
  ${isActive
    ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500'
    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
  }
  ${isPlaying && !isActive ? 'opacity-50' : ''}
`}
```

- [ ] **Step 3: Commit 修改**

```bash
git add src/components/StepCard.tsx
git commit -m "feat: StepCard 支持播放模式"
```

---

### Task 7: 增强 Timeline 组件

**Files:**
- Modify: `src/components/Timeline.tsx`

**步骤**:

- [ ] **Step 1: 添加播放模式 Props**

```tsx
// src/components/Timeline.tsx - 添加到 interface TimelineProps
playbackMode?: boolean; // 是否处于播放模式
isPlaybackActive?: boolean; // 播放是否正在进行（用于处理点击冲突）
onPlaybackStop?: () => void; // 播放中手动跳转时停止播放
```

- [ ] **Step 2: 处理播放/点击冲突**

```tsx
// src/components/Timeline.tsx - 更新 handleStepSelect 函数
const handleStepSelect = (index: number) => {
  // 如果正在播放，先停止播放
  if (isPlaybackActive && onPlaybackStop) {
    onPlaybackStop();
  }
  onSelect(index);
};
```

- [ ] **Step 3: Commit 修改**

```bash
git add src/components/Timeline.tsx
git commit -m "feat: Timeline 支持播放模式和冲突处理"
```

---

### Task 8: 增强 StepDetail 组件

**Files:**
- Modify: `src/components/StepDetail.tsx`

**步骤**:

- [ ] **Step 1: 添加播放模式 Props**

```tsx
// src/components/StepDetail.tsx - 添加到 interface StepDetailProps
isPlaying?: boolean; // 播放模式下禁用手动导航
animateMode?: boolean; // 是否启用动画
```

- [ ] **Step 2: 传递 Props 给子组件**

```tsx
// src/components/StepDetail.tsx - 传递 props 给 ContextViewer
<ContextViewer
  messages={step.contextSnapshot}
  tokens={step.tokens}
  animateMode={animateMode}
/>

// 播放模式下隐藏或禁用手动导航按钮
{!isPlaying && (
  // 现有导航按钮
)}
```

- [ ] **Step 3: Commit 修改**

```bash
git add src/components/StepDetail.tsx
git commit -m "feat: StepDetail 支持播放模式"
```

---

## Chunk 4: 整合播放逻辑

### Task 9: 整合播放控制到 App

**Files:**
- Modify: `src/App.tsx`

**步骤**:

- [ ] **Step 1: 添加播放状态导入和初始化**

```tsx
// src/App.tsx - 添加导入
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { scenarios, getScenarioById } from './data/scenarios';
import { ScenarioSelect } from './components/ScenarioSelect';
import { Timeline } from './components/Timeline';
import { StepDetail } from './components/StepDetail';
import { AgentStatusBar } from './components/AgentStatusBar';
import { PlaybackBar } from './components/PlaybackBar';
import type { PlaybackState, PlaybackSpeed, PlaybackMode, AgentStatus } from './types';
import { SPEED_MAP, AGENT_STATUS_CONFIG } from './types';

// 添加状态初始化
const [animateMode, setAnimateMode] = useState(false);
const [playback, setPlayback] = useState<PlaybackState>({
  mode: 'stopped',
  speed: 1,
  currentStepIndex: 0,
  isAnimating: false,
});
const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
const [agentMessage, setAgentMessage] = useState('');
const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
const timerRef = useRef<NodeJS.Timeout>();
```

- [ ] **Step 2: 添加播放控制函数**

```tsx
// src/App.tsx - 添加播放控制函数

const currentScenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
const currentStep = currentScenario?.steps[stepIndex];

// 场景切换
const handleScenarioChange = useCallback((id: string) => {
  setScenarioId(id);
  setStepIndex(0);
  stopPlayback();
  setAnimateMode(false);
}, [stopPlayback]);

// 手动步骤选择
const handleStepSelect = useCallback((index: number) => {
  setStepIndex(index);
}, []);

// 播放控制
const handleTogglePlay = useCallback(() => {
  if (playback.mode === 'playing') {
    stopPlayback();
  } else {
    startPlayback();
  }
}, [playback.mode]);

const handlePrev = useCallback(() => {
  if (stepIndex > 0) {
    stopPlayback();
    setStepIndex(stepIndex - 1);
  }
}, [stepIndex, stopPlayback]);

const handleNext = useCallback(() => {
  if (currentScenario && stepIndex < currentScenario.steps.length - 1) {
    stopPlayback();
    setStepIndex(stepIndex + 1);
  }
}, [stepIndex, currentScenario, stopPlayback]);

const handleSeek = useCallback((progress: number) => {
  stopPlayback();
  const targetIndex = Math.floor(progress * (currentScenario?.steps.length || 0));
  setStepIndex(targetIndex);
  setAnimatingIndices(new Set());
}, [currentScenario, stopPlayback]);

const handleSpeedChange = useCallback((speed: PlaybackSpeed) => {
  setPlayback(prev => ({ ...prev, speed }));
}, []);
```

- [ ] **Step 3: 实现播放核心逻辑**

```tsx
// src/App.tsx - 添加播放核心函数

const startPlayback = useCallback(() => {
  if (!currentScenario) return;

  setAnimateMode(true);
  setPlayback(prev => ({ ...prev, mode: 'playing', isAnimating: true }));

  // 更新 Agent 状态为思考
  setAgentStatus('thinking');
  setAgentMessage('分析用户请求...');

  // 延迟执行第一步，确保状态更新
  setTimeout(() => {
    triggerStepAnimation(stepIndex);
  }, 0);
}, [currentScenario, stepIndex, triggerStepAnimation]);

const stopPlayback = useCallback(() => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }
  setPlayback(prev => ({ ...prev, mode: 'paused', isAnimating: false }));
  setAgentStatus('idle');
  setAgentMessage('');
  setAnimatingIndices(new Set());
}, []);

// 触发单步动画（包括 Agent 状态更新和消息动画）
const triggerStepAnimation = useCallback((stepIndexToExecute: number) => {
  if (!currentScenario || !playback.isAnimating) return;

  const step = currentScenario.steps[stepIndexToExecute];
  if (!step) {
    stopPlayback();
    return;
  }

  // 根据步骤类型更新 Agent 状态
  const statusMap: Record<Step['type'], AgentStatus> = {
    THOUGHT: 'thinking',
    ACTION: 'acting',
    OBSERVATION: 'observing',
    ANSWER: 'answering',
  };
  const status = statusMap[step.type];
  setAgentStatus(status);
  setAgentMessage(step.title);

  // 触发消息进场动画
  const newIndices = step.contextDiff.map((_, i) => {
    return step.contextSnapshot.length - step.contextDiff.length + i;
  });
  setAnimatingIndices(new Set(newIndices));

  // 设置完成后准备下一步
  const animationDuration = SPEED_MAP[playback.speed] * 0.5;
  timerRef.current = setTimeout(() => {
    setAnimatingIndices(new Set());
    const nextIndex = stepIndexToExecute + 1;
    if (nextIndex < currentScenario.steps.length) {
      triggerStepAnimation(nextIndex);
    } else {
      stopPlayback();
    }
  }, animationDuration);
}, [currentScenario, playback.speed, playback.isAnimating]);
```

- [ ] **Step 4: 添加 useEffect 监听 stepIndex 变化**

```tsx
// src/App.tsx - 添加 useEffect 监听 stepIndex（在其他 hooks 之后）

// 监听 stepIndex 变化，播放时触发对应步骤动画
useEffect(() => {
  if (animateMode && playback.mode === 'playing' && currentScenario) {
    triggerStepAnimation(stepIndex);
  }
}, [stepIndex, animateMode, playback.mode, currentScenario]);

// 清理定时器
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, []);
```

- [ ] **Step 5: 更新 JSX 结构**

```tsx
// src/App.tsx - 更新背景色为温暖教学风（slate 系列）
// 更新圆角为 rounded-xl, rounded-lg
// 强调色改为 indigo-500

// 更新 Header 部分添加 AgentStatusBar
// 更新 main 添加底部内边距
// 更新 Timeline 添加播放模式相关 props
// 更新 StepDetail 添加播放模式和 animateMode props
// 添加 PlaybackBar 显示在底部
// 添加"开始演示"按钮（非播放模式时显示）
```

- [ ] **Step 6: Commit 整合**

```bash
git add src/App.tsx
git commit -m "feat: 整合播放控制逻辑，支持动画演示"
```

---

## 验收测试

### Task 10: 端到端测试

**步骤**:

- [ ] **Step 1: 测试完整播放流程**

1. 启动应用
2. 点击"开始演示"按钮
3. 观察消息是否逐条滑入
4. 观察 Agent 状态栏是否正确显示当前状态
5. 观察进度条是否实时更新
6. 播放完成后是否停止

- [ ] **Step 2: 测试播放控制**

1. 暂停后继续播放
2. 调整播放速度（0.5x, 1.5x, 2x）
3. 拖动进度条跳转
4. 点击 Timeline 步骤跳转（应停止播放）

- [ ] **Step 3: 测试场景切换**

1. 播放中切换场景
2. 验证是否正确重置状态

- [ ] **Step 4: 测试手动导航**

1. 播放模式外使用上一步/下一步
2. 验证消息是否正确显示（无动画）

- [ ] **Step 5: 提交完成**

```bash
git add .
git commit -m "feat: 完成动画增强功能"
```

---

## 完成清单

- [ ] Chunk 1: 类型定义与动画基础
  - [ ] Task 1: 扩展类型定义
  - [ ] Task 2: 添加动画 CSS

- [ ] Chunk 2: 新增播放控制组件
  - [ ] Task 3: AgentStatusBar 组件
  - [ ] Task 4: PlaybackBar 组件

- [ ] Chunk 3: 增强现有组件
  - [ ] Task 5: 增强 ContextViewer 组件
  - [ ] Task 6: 增强 StepCard 组件
  - [ ] Task 7: 增强 Timeline 组件
  - [ ] Task 8: 增强 StepDetail 组件

- [ ] Chunk 4: 整合播放逻辑
  - [ ] Task 9: 整合播放控制到 App

- [ ] Task 10: 端到端测试
