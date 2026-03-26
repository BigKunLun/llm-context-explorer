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

// ==================== 播放控制类型 ====================

/** 播放模式 */
export type PlaybackMode = 'play' | 'pause';

/** 播放速度倍数 */
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

/** 播放状态 */
export interface PlaybackState {
  mode: PlaybackMode;
  speed: PlaybackSpeed;
  /** 当前步骤索引 */
  currentStepIndex: number;
  /** 总步骤数 */
  totalSteps: number;
}

// ==================== Agent 状态类型 ====================

/** Agent 状态类型 */
export type AgentStatus =
  | 'idle'         // 空闲，未开始
  | 'thinking'     // 思考中
  | 'acting'       // 执行动作中
  | 'observing'    // 观察结果中
  | 'answering'    // 生成回答中
  | 'completed';   // 已完成

/** Agent 完整状态 */
export interface AgentState {
  status: AgentStatus;
  currentStep: number;
  totalSteps: number;
  error?: string;
}

/** Agent 状态配置映射 */
export const AGENT_STATUS_CONFIG = {
  idle: {
    label: '空闲',
    icon: '●',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
  },
  thinking: {
    label: '思考中',
    icon: '◉',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
  },
  acting: {
    label: '执行中',
    icon: '◉',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400',
  },
  observing: {
    label: '观察中',
    icon: '◉',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400',
  },
  answering: {
    label: '回答中',
    icon: '◉',
    color: 'text-green-400',
    bgColor: 'bg-green-400',
  },
  completed: {
    label: '已完成',
    icon: '✓',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
} as const satisfies Record<AgentStatus, { label: string; icon: string; color: string; bgColor: string }>;
