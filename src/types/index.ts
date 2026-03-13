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
