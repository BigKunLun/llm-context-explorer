# ReAct Context Explorer 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个 ReAct Agent 上下文变化可视化演示工具，帮助学习者理解 Agent 执行过程中上下文如何堆叠。

**Architecture:** 左右分栏布局，左侧为可交互的时间线，右侧展示当前步骤的上下文详情。使用预设场景数据模拟 Agent 执行过程，无需真实 API 调用。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- Create: `src/main.tsx`, `src/styles/index.css`

**Step 1: 创建 Vite + React + TypeScript 项目**

```bash
npm create vite@latest . -- --template react-ts
```

Expected: 项目结构创建完成

**Step 2: 安装 Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Expected: `tailwind.config.js` 和 `postcss.config.js` 创建完成

**Step 3: 配置 Tailwind**

修改 `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 4: 添加 Tailwind 指令到 CSS**

修改 `src/index.css` (重命名为 `src/styles/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-900 text-gray-100;
}
```

**Step 5: 创建目录结构**

```bash
mkdir -p src/components src/data src/types src/styles
```

**Step 6: 验证项目启动**

```bash
npm run dev
```

Expected: 开发服务器启动，浏览器能访问

**Step 7: Commit**

```bash
git add .
git commit -m "chore: 初始化 Vite + React + TypeScript + Tailwind 项目"
```

---

## Task 2: 类型定义

**Files:**
- Create: `src/types/index.ts`

**Step 1: 创建类型定义文件**

```typescript
// src/types/index.ts

/** ReAct 步骤类型 */
export type StepType = 'THOUGHT' | 'ACTION' | 'OBSERVATION' | 'ANSWER';

/** 上下文消息角色 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool_call' | 'tool_result';

/** 单条上下文消息 */
export interface ContextMessage {
  role: MessageRole;
  content: string;
  /** 是否为当前步骤新增（用于高亮） */
  isNew?: boolean;
}

/** 单个执行步骤 */
export interface Step {
  id: string;
  type: StepType;
  title: string;
  description: string;
  /** 该步骤结束时的完整上下文快照 */
  contextSnapshot: ContextMessage[];
  /** 该步骤新增的上下文内容 */
  contextDiff: ContextMessage[];
  /** token 统计 */
  tokens: {
    used: number;
    limit: number;
  };
}

/** 一个完整场景 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: Step[];
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: 添加核心类型定义"
```

---

## Task 3: 预设场景数据

**Files:**
- Create: `src/data/scenarios.ts`

**Step 1: 创建场景数据文件**

```typescript
// src/data/scenarios.ts
import type { Scenario, ContextMessage } from '../types';

/** 创建初始上下文的辅助函数 */
const createSystemMessage = (): ContextMessage => ({
  role: 'system',
  content: '你是一个智能助手，可以帮助用户完成各种任务。当需要外部信息时，你可以使用提供的工具来获取。',
});

/** 场景 1: 简单查天气 */
const weatherScenario: Scenario = {
  id: 'weather-simple',
  name: '简单查天气',
  description: '用户询问北京天气，Agent 调用天气工具获取信息并回答',
  steps: [
    {
      id: 'step-1',
      type: 'THOUGHT',
      title: '理解用户需求',
      description: '用户想查询北京的天气信息。我有一个 get_weather 工具可以获取指定城市的天气数据。',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '北京今天天气怎么样？', isNew: true },
      ],
      contextDiff: [
        { role: 'user', content: '北京今天天气怎么样？', isNew: true },
      ],
      tokens: { used: 156, limit: 4096 },
    },
    {
      id: 'step-2',
      type: 'ACTION',
      title: '调用天气工具',
      description: '调用 get_weather 工具，参数 city="北京"',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '北京今天天气怎么样？' },
        { role: 'assistant', content: '我需要查询北京的天气信息。', isNew: true },
        { role: 'tool_call', content: 'get_weather(city="北京")', isNew: true },
      ],
      contextDiff: [
        { role: 'assistant', content: '我需要查询北京的天气信息。', isNew: true },
        { role: 'tool_call', content: 'get_weather(city="北京")', isNew: true },
      ],
      tokens: { used: 234, limit: 4096 },
    },
    {
      id: 'step-3',
      type: 'OBSERVATION',
      title: '获取天气数据',
      description: '工具返回北京今天的天气信息：温度 15°C，晴天',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '北京今天天气怎么样？' },
        { role: 'assistant', content: '我需要查询北京的天气信息。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 15, "weather": "晴", "humidity": 45}', isNew: true },
      ],
      contextDiff: [
        { role: 'tool_result', content: '{"city": "北京", "temp": 15, "weather": "晴", "humidity": 45}', isNew: true },
      ],
      tokens: { used: 312, limit: 4096 },
    },
    {
      id: 'step-4',
      type: 'ANSWER',
      title: '回答用户',
      description: '根据天气数据，北京今天温度 15°C，晴天，湿度 45%。天气不错，适合出行。',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '北京今天天气怎么样？' },
        { role: 'assistant', content: '我需要查询北京的天气信息。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 15, "weather": "晴", "humidity": 45}' },
        { role: 'assistant', content: '北京今天天气不错！温度 15°C，晴天，湿度 45%。适合外出活动，建议穿着轻薄外套。', isNew: true },
      ],
      contextDiff: [
        { role: 'assistant', content: '北京今天天气不错！温度 15°C，晴天，湿度 45%。适合外出活动，建议穿着轻薄外套。', isNew: true },
      ],
      tokens: { used: 423, limit: 4096 },
    },
  ],
};

/** 场景 2: 多工具协作 */
const multiToolScenario: Scenario = {
  id: 'multi-tool',
  name: '多工具协作',
  description: '用户想要穿搭建议，Agent 需要查询天气和行程，综合分析后给出建议',
  steps: [
    {
      id: 'step-1',
      type: 'THOUGHT',
      title: '分析任务需求',
      description: '用户需要穿搭建议。要给出好的建议，我需要知道：1) 今天天气如何 2) 用户今天的行程安排。我有 get_weather 和 get_schedule 两个工具可用。',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议', isNew: true },
      ],
      contextDiff: [
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议', isNew: true },
      ],
      tokens: { used: 189, limit: 4096 },
    },
    {
      id: 'step-2',
      type: 'ACTION',
      title: '调用天气工具',
      description: '先查询北京今天的天气情况',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议' },
        { role: 'assistant', content: '我先帮您查询北京今天的天气。', isNew: true },
        { role: 'tool_call', content: 'get_weather(city="北京")', isNew: true },
      ],
      contextDiff: [
        { role: 'assistant', content: '我先帮您查询北京今天的天气。', isNew: true },
        { role: 'tool_call', content: 'get_weather(city="北京")', isNew: true },
      ],
      tokens: { used: 278, limit: 4096 },
    },
    {
      id: 'step-3',
      type: 'OBSERVATION',
      title: '获取天气结果',
      description: '天气工具返回：北京今天 18°C，多云转晴',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议' },
        { role: 'assistant', content: '我先帮您查询北京今天的天气。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 18, "weather": "多云转晴", "humidity": 55}', isNew: true },
      ],
      contextDiff: [
        { role: 'tool_result', content: '{"city": "北京", "temp": 18, "weather": "多云转晴", "humidity": 55}', isNew: true },
      ],
      tokens: { used: 367, limit: 4096 },
    },
    {
      id: 'step-4',
      type: 'THOUGHT',
      title: '规划下一步',
      description: '已获取天气信息：18°C，多云转晴。为了给出更精准的穿搭建议，我还需要了解用户今天的行程安排。',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议' },
        { role: 'assistant', content: '我先帮您查询北京今天的天气。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 18, "weather": "多云转晴", "humidity": 55}' },
        { role: 'assistant', content: '天气已获取。接下来查询您的行程安排，以便给出更合适的穿搭建议。', isNew: true },
      ],
      contextDiff: [
        { role: 'assistant', content: '天气已获取。接下来查询您的行程安排，以便给出更合适的穿搭建议。', isNew: true },
      ],
      tokens: { used: 456, limit: 4096 },
    },
    {
      id: 'step-5',
      type: 'ACTION',
      title: '调用行程工具',
      description: '查询用户今天的日程安排',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议' },
        { role: 'assistant', content: '我先帮您查询北京今天的天气。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 18, "weather": "多云转晴", "humidity": 55}' },
        { role: 'assistant', content: '天气已获取。接下来查询您的行程安排，以便给出更合适的穿搭建议。' },
        { role: 'tool_call', content: 'get_schedule(date="today")', isNew: true },
      ],
      contextDiff: [
        { role: 'tool_call', content: 'get_schedule(date="today")', isNew: true },
      ],
      tokens: { used: 534, limit: 4096 },
    },
    {
      id: 'step-6',
      type: 'OBSERVATION',
      title: '获取行程结果',
      description: '行程工具返回：下午 2 点有户外团队建设活动',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议' },
        { role: 'assistant', content: '我先帮您查询北京今天的天气。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 18, "weather": "多云转晴", "humidity": 55}' },
        { role: 'assistant', content: '天气已获取。接下来查询您的行程安排，以便给出更合适的穿搭建议。' },
        { role: 'tool_call', content: 'get_schedule(date="today")' },
        { role: 'tool_result', content: '{"events": [{"time": "14:00", "title": "团队建设活动", "location": "户外公园"}]}', isNew: true },
      ],
      contextDiff: [
        { role: 'tool_result', content: '{"events": [{"time": "14:00", "title": "团队建设活动", "location": "户外公园"}]}', isNew: true },
      ],
      tokens: { used: 645, limit: 4096 },
    },
    {
      id: 'step-7',
      type: 'ANSWER',
      title: '综合建议',
      description: '综合天气和行程：18°C 多云转晴，下午有户外活动。建议穿着舒适运动装，带一件薄外套应对温差。',
      contextSnapshot: [
        createSystemMessage(),
        { role: 'user', content: '帮我看看今天北京天气，给我一些穿搭建议' },
        { role: 'assistant', content: '我先帮您查询北京今天的天气。' },
        { role: 'tool_call', content: 'get_weather(city="北京")' },
        { role: 'tool_result', content: '{"city": "北京", "temp": 18, "weather": "多云转晴", "humidity": 55}' },
        { role: 'assistant', content: '天气已获取。接下来查询您的行程安排，以便给出更合适的穿搭建议。' },
        { role: 'tool_call', content: 'get_schedule(date="today")' },
        { role: 'tool_result', content: '{"events": [{"time": "14:00", "title": "团队建设活动", "location": "户外公园"}]}' },
        { role: 'assistant', content: '根据今天北京的天气和您的行程，我的穿搭建议如下：\n\n天气：18°C，多云转晴\n行程：下午 2 点户外团队建设活动\n\n建议：\n- 穿着舒适的运动装或休闲装\n- 带一件薄外套，户外活动结束后可保暖\n- 穿运动鞋，方便户外活动\n- 天气多云转晴，可不带雨具', isNew: true },
      ],
      contextDiff: [
        { role: 'assistant', content: '根据今天北京的天气和您的行程，我的穿搭建议如下：\n\n天气：18°C，多云转晴\n行程：下午 2 点户外团队建设活动\n\n建议：\n- 穿着舒适的运动装或休闲装\n- 带一件薄外套，户外活动结束后可保暖\n- 穿运动鞋，方便户外活动\n- 天气多云转晴，可不带雨具', isNew: true },
      ],
      tokens: { used: 856, limit: 4096 },
    },
  ],
};

export const scenarios: Scenario[] = [weatherScenario, multiToolScenario];

export const getScenarioById = (id: string): Scenario | undefined => {
  return scenarios.find(s => s.id === id);
};
```

**Step 2: Commit**

```bash
git add src/data/scenarios.ts
git commit -m "feat: 添加预设场景数据（简单查天气 + 多工具协作）"
```

---

## Task 4: ScenarioSelect 组件

**Files:**
- Create: `src/components/ScenarioSelect.tsx`

**Step 1: 创建场景选择组件**

```tsx
// src/components/ScenarioSelect.tsx
import type { Scenario } from '../types';

interface ScenarioSelectProps {
  scenarios: Scenario[];
  currentId: string;
  onChange: (id: string) => void;
}

export function ScenarioSelect({ scenarios, currentId, onChange }: ScenarioSelectProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        选择场景
      </label>
      <select
        value={currentId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>
      {scenarios.find(s => s.id === currentId)?.description && (
        <p className="mt-2 text-sm text-gray-500">
          {scenarios.find(s => s.id === currentId)?.description}
        </p>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ScenarioSelect.tsx
git commit -m "feat: 添加 ScenarioSelect 组件"
```

---

## Task 5: StepCard 组件

**Files:**
- Create: `src/components/StepCard.tsx`

**Step 1: 创建步骤卡片组件**

```tsx
// src/components/StepCard.tsx
import type { Step, StepType } from '../types';

const stepTypeStyles: Record<StepType, { bg: string; text: string; icon: string }> = {
  THOUGHT: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '🧠' },
  ACTION: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '⚡' },
  OBSERVATION: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '👁️' },
  ANSWER: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '💬' },
};

interface StepCardProps {
  step: Step;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function StepCard({ step, index, isActive, onClick }: StepCardProps) {
  const style = stepTypeStyles[step.type];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${isActive
          ? 'bg-gray-800 border-blue-500 ring-1 ring-blue-500'
          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
          {style.icon} {step.type}
        </span>
        <span className="text-xs text-gray-500">#{index + 1}</span>
      </div>
      <div className="text-sm font-medium text-white truncate">
        {step.title}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">
          Tokens: {step.tokens.used}
        </span>
      </div>
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/StepCard.tsx
git commit -m "feat: 添加 StepCard 组件"
```

---

## Task 6: Timeline 组件

**Files:**
- Create: `src/components/Timeline.tsx`

**Step 1: 创建时间线组件**

```tsx
// src/components/Timeline.tsx
import type { Step } from '../types';
import { StepCard } from './StepCard';

interface TimelineProps {
  steps: Step[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function Timeline({ steps, currentIndex, onSelect }: TimelineProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        执行时间线
      </h3>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* 连接线 */}
          {index < steps.length - 1 && (
            <div className="absolute left-6 top-14 w-0.5 h-2 bg-gray-700" />
          )}
          <StepCard
            step={step}
            index={index}
            isActive={index === currentIndex}
            onClick={() => onSelect(index)}
          />
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "feat: 添加 Timeline 组件"
```

---

## Task 7: ContextViewer 组件

**Files:**
- Create: `src/components/ContextViewer.tsx`

**Step 1: 创建上下文查看器组件**

```tsx
// src/components/ContextViewer.tsx
import type { ContextMessage, MessageRole } from '../types';

const roleLabels: Record<MessageRole, { label: string; color: string }> = {
  system: { label: 'System', color: 'bg-gray-600 text-gray-200' },
  user: { label: 'User', color: 'bg-blue-600 text-blue-100' },
  assistant: { label: 'Assistant', color: 'bg-green-600 text-green-100' },
  tool_call: { label: 'Tool Call', color: 'bg-purple-600 text-purple-100' },
  tool_result: { label: 'Tool Result', color: 'bg-amber-600 text-amber-100' },
};

interface ContextViewerProps {
  messages: ContextMessage[];
  tokens: { used: number; limit: number };
}

export function ContextViewer({ messages, tokens }: ContextViewerProps) {
  const tokenPercentage = (tokens.used / tokens.limit) * 100;

  return (
    <div>
      {/* Token 统计 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          当前上下文
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Tokens: <span className="text-white font-mono">{tokens.used}</span> / {tokens.limit}
          </span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                tokenPercentage > 80 ? 'bg-red-500' : tokenPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 divide-y divide-gray-700/50">
        {messages.map((msg, index) => {
          const roleStyle = roleLabels[msg.role];
          return (
            <div
              key={index}
              className={`p-3 ${msg.isNew ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleStyle.color}`}>
                  {roleStyle.label}
                </span>
                {msg.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500 text-white">
                    NEW
                  </span>
                )}
              </div>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono break-all">
                {msg.content}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ContextViewer.tsx
git commit -m "feat: 添加 ContextViewer 组件（支持新增高亮）"
```

---

## Task 8: StepDetail 组件

**Files:**
- Create: `src/components/StepDetail.tsx`

**Step 1: 创建步骤详情组件**

```tsx
// src/components/StepDetail.tsx
import type { Step, StepType } from '../types';
import { ContextViewer } from './ContextViewer';

const stepTypeLabels: Record<StepType, { label: string; color: string; icon: string }> = {
  THOUGHT: { label: '思考', color: 'text-purple-400', icon: '🧠' },
  ACTION: { label: '动作', color: 'text-blue-400', icon: '⚡' },
  OBSERVATION: { label: '观察', color: 'text-green-400', icon: '👁️' },
  ANSWER: { label: '回答', color: 'text-amber-400', icon: '💬' },
};

interface StepDetailProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

export function StepDetail({ step, stepIndex, totalSteps, onPrev, onNext }: StepDetailProps) {
  const style = stepTypeLabels[step.type];

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{style.icon}</span>
          <h2 className={`text-xl font-bold ${style.color}`}>
            Step {stepIndex + 1}: {style.label}
          </h2>
        </div>
        <h3 className="text-lg text-white font-medium">{step.title}</h3>
      </div>

      {/* 上下文查看器 */}
      <div className="flex-1 mb-6 overflow-auto">
        <ContextViewer
          messages={step.contextSnapshot}
          tokens={step.tokens}
        />
      </div>

      {/* 本步解析 */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          📝 本步解析
        </h4>
        <p className="text-gray-300 leading-relaxed">{step.description}</p>
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
        >
          ← 上一步
        </button>
        <span className="text-gray-500 self-center">
          {stepIndex + 1} / {totalSteps}
        </span>
        <button
          onClick={onNext}
          disabled={stepIndex === totalSteps - 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/StepDetail.tsx
git commit -m "feat: 添加 StepDetail 组件"
```

---

## Task 9: App 主组件

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Step 1: 更新 main.tsx**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 2: 创建 App 组件**

```tsx
// src/App.tsx
import { useState, useMemo } from 'react';
import { scenarios, getScenarioById } from './data/scenarios';
import { ScenarioSelect } from './components/ScenarioSelect';
import { Timeline } from './components/Timeline';
import { StepDetail } from './components/StepDetail';

function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);

  const currentScenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const currentStep = currentScenario?.steps[stepIndex];

  const handleScenarioChange = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };

  const handleStepSelect = (index: number) => {
    setStepIndex(index);
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentScenario && stepIndex < currentScenario.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  if (!currentScenario || !currentStep) {
    return <div className="p-8 text-white">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            ReAct Context Explorer
          </h1>
          <div className="w-64">
            <ScenarioSelect
              scenarios={scenarios}
              currentId={scenarioId}
              onChange={handleScenarioChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left: Timeline */}
          <aside className="w-72 flex-shrink-0">
            <Timeline
              steps={currentScenario.steps}
              currentIndex={stepIndex}
              onSelect={handleStepSelect}
            />
          </aside>

          {/* Right: Step Detail */}
          <section className="flex-1 min-w-0">
            <StepDetail
              step={currentStep}
              stepIndex={stepIndex}
              totalSteps={currentScenario.steps.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
```

**Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: 完成 App 主组件，整合所有组件"
```

---

## Task 10: 清理与验证

**Step 1: 删除 Vite 默认文件**

```bash
rm -f src/App.css
```

**Step 2: 更新 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ReAct Context Explorer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 3: 验证项目运行**

```bash
npm run dev
```

Expected:
- 开发服务器启动
- 浏览器访问显示完整界面
- 可以切换场景
- 可以点击时间线跳转
- 上下文高亮正常显示

**Step 4: 最终 Commit**

```bash
git add .
git commit -m "chore: 清理默认文件，完成 MVP"
```

---

## 完成清单

- [ ] 项目初始化 (Vite + React + TypeScript + Tailwind)
- [ ] 类型定义
- [ ] 预设场景数据
- [ ] ScenarioSelect 组件
- [ ] StepCard 组件
- [ ] Timeline 组件
- [ ] ContextViewer 组件
- [ ] StepDetail 组件
- [ ] App 主组件
- [ ] 清理与验证
