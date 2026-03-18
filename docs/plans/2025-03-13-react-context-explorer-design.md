# ReAct Context Explorer - 设计文档

## 项目概述

一个用于教学和演示 ReAct (Reasoning + Acting) Agent 范式中上下文变化过程的可视化工具。

**核心价值**：让学习者直观理解 Agent 执行过程中上下文是如何一步步堆叠的，这是学习 Agent 开发最关键但最难理解的部分。

## MVP 目标

- 模拟演示器（不接入真实 LLM API）
- 2 个预设场景
- 时间线交互，可跳转查看每步的上下文状态
- 高亮每步新增的上下文内容

## 技术选型

| 层面 | 选择 | 理由 |
|------|------|------|
| 框架 | React 18 | 组件化，生态丰富 |
| 构建 | Vite + SWC | 快速，现代 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS | 快速迭代 |
| 状态 | useState + useContext | MVP 足够，不引入额外复杂度 |

## 项目结构

```
react-context-explorer/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx              # 入口
│   ├── App.tsx               # 主应用，持有全局状态
│   ├── components/
│   │   ├── Timeline.tsx      # 左侧时间线
│   │   ├── StepCard.tsx      # 时间线单个步骤卡片
│   │   ├── StepDetail.tsx    # 右侧步骤详情
│   │   ├── ContextViewer.tsx # 上下文查看器（带高亮）
│   │   └── ScenarioSelect.tsx # 场景选择器
│   ├── data/
│   │   └── scenarios.ts      # 预设场景数据
│   ├── types/
│   │   └── index.ts          # 类型定义
│   └── styles/
│       └── index.css         # 全局样式 + Tailwind
└── docs/
    └── plans/                # 设计文档
```

## 数据模型

```typescript
// types/index.ts

/** ReAct 步骤类型 */
type StepType = 'THOUGHT' | 'ACTION' | 'OBSERVATION' | 'ANSWER';

/** 单条上下文消息 */
interface ContextMessage {
  role: 'system' | 'user' | 'assistant' | 'tool_call' | 'tool_result';
  content: string;
  /** 是否为当前步骤新增（用于高亮） */
  isNew?: boolean;
}

/** 单个执行步骤 */
interface Step {
  id: string;
  type: StepType;
  title: string;           // 简短描述，如"判断任务类型"
  description: string;     // 详细解析
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
interface Scenario {
  id: string;
  name: string;
  description: string;
  /** 执行步骤序列 */
  steps: Step[];
}
```

## 组件设计

### 组件树

```
App.tsx
   │
   ├── ScenarioSelect    选择场景
   │
   ├── Timeline          展示步骤列表
   │   └── StepCard[]    单个步骤卡片
   │
   └── StepDetail        展示当前步骤详情
       ├── ContextViewer  上下文内容
       └── 导航按钮
```

### 组件职责

| 组件 | Props | 职责 |
|------|-------|------|
| `ScenarioSelect` | `scenarios`, `currentId`, `onChange` | 场景下拉选择 |
| `Timeline` | `steps`, `currentIndex`, `onSelect` | 渲染时间线，高亮当前步骤 |
| `StepCard` | `step`, `isActive`, `onClick` | 单个步骤的缩略展示 |
| `StepDetail` | `step` | 当前步骤的完整信息 |
| `ContextViewer` | `messages` | 上下文消息列表，高亮 `isNew` 的消息 |

### 状态管理

- `App.tsx` 持有：
  - `currentScenarioId: string`
  - `currentStepIndex: number`
- 所有状态变化在 App 层处理，子组件只负责渲染

## UI 布局

左右分栏布局：

```
┌─────────────────────────────────────────────────────────────────┐
│  ReAct Context Explorer                    [场景选择 ▼]         │
├───────────────────┬─────────────────────────────────────────────┤
│                   │                                             │
│   📍 场景选择      │   Step 3: OBSERVATION                       │
│   ○ 查天气        │   ─────────────────────────────────────     │
│   ● 多工具协作    │                                             │
│                   │   📦 当前上下文 (Tokens: 342 / 4096)         │
│   ───────────────│   ┌─────────────────────────────────────┐   │
│                   │   │ System: 你是一个智能助手...          │   │
│   📋 执行时间线    │   │ User: 帮我查北京天气并给穿搭建议      │   │
│                   │   │ Assistant: 我需要调用天气工具...     │   │
│   ① THOUGHT      │   │ Tool: get_weather                   │   │
│   ② ACTION  ←    │   │ Tool Result: {"temp": 15, ...}      │   │
│   ③ OBSERVATION  │   │ [新增内容高亮显示]                    │   │
│   ④ ANSWER       │   └─────────────────────────────────────┘   │
│                   │                                             │
│                   │   📝 本步解析                               │
│                   │   工具返回了北京天气信息...                  │
│                   │                                             │
│                   │                    [上一步] [下一步]         │
└───────────────────┴─────────────────────────────────────────────┘
```

## 预设场景

### 场景 1：简单查天气（4 步）

| 步骤 | 类型 | 内容概要 | 上下文变化 |
|------|------|---------|-----------|
| 1 | THOUGHT | 用户想查天气，需要调用天气工具 | + System, + User |
| 2 | ACTION | 调用 `get_weather(city="北京")` | + Assistant(tool_call) |
| 3 | OBSERVATION | 返回 `{"temp": 15, "weather": "晴"}` | + Tool Result |
| 4 | ANSWER | 北京今天 15°C，晴天，适合出行 | + Assistant(final) |

### 场景 2：多工具协作（7 步）

| 步骤 | 类型 | 内容概要 | 上下文变化 |
|------|------|---------|-----------|
| 1 | THOUGHT | 分析用户需求，需要天气和行程信息 | + System, + User |
| 2 | ACTION | 调用 `get_weather(city="北京")` | + Assistant(tool_call) |
| 3 | OBSERVATION | 返回天气数据 | + Tool Result |
| 4 | THOUGHT | 天气已获取，现在查行程 | + Assistant(thought) |
| 5 | ACTION | 调用 `get_schedule(date="today")` | + Assistant(tool_call) |
| 6 | OBSERVATION | 返回行程：下午有户外会议 | + Tool Result |
| 7 | ANSWER | 综合建议：晴天但有户外会议，建议带外套 | + Assistant(final) |

## MVP 边界

### 包含
- ✅ 2 个预设场景
- ✅ 时间线跳转交互
- ✅ 上下文变化可视化
- ✅ Token 计数展示
- ✅ 新增内容高亮

### 不包含（后续迭代）
- ❌ 真实 LLM API 调用
- ❌ 分支/回滚探索
- ❌ 自定义场景编辑
- ❌ 移动端适配
- ❌ 错误/重试场景

## 成功标准

1. 用户能在 5 分钟内理解 ReAct 的基本执行流程
2. 每一步的上下文变化清晰可见
3. Token 膨胀过程直观展示
4. 多工具协作时的"记忆"机制可理解
