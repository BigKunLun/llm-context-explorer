// src/components/AgentStatusBar.tsx
import type { AgentState } from '../types';
import { AGENT_STATUS_CONFIG } from '../types';

interface AgentStatusBarProps {
  /** Agent 当前状态 */
  state: AgentState;
  /** 当前步骤标题（可选） */
  currentStepTitle?: string;
  /** 是否紧凑显示 */
  compact?: boolean;
}

export function AgentStatusBar({
  state,
  currentStepTitle,
  compact = false,
}: AgentStatusBarProps) {
  const { status, currentStep, totalSteps, error } = state;
  const config = AGENT_STATUS_CONFIG[status];

  // 判断是否需要动画效果
  const isAnimating = status === 'thinking' ||
                      status === 'acting' ||
                      status === 'observing' ||
                      status === 'answering';

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
        {/* 状态图标和标签 */}
        <div className={`flex items-center gap-2 ${config.color}`}>
          <span className={isAnimating ? 'animate-pulse' : ''}>{config.icon}</span>
          <span className="text-sm font-medium">{config.label}</span>
        </div>

        {/* 错误信息 */}
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}

        {/* 步骤进度 */}
        <span className="text-xs text-gray-400 ml-auto">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        {/* 状态显示 */}
        <div className="flex items-center gap-3">
          {/* 状态图标 */}
          <div className={`${config.color} ${isAnimating ? 'animate-pulse' : ''} text-xl`}>
            {config.icon}
          </div>

          {/* 状态信息 */}
          <div>
            <div className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              步骤 {currentStep + 1} / {totalSteps}
            </div>
            {currentStepTitle && (
              <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                {currentStepTitle}
              </div>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex-1 ml-6 max-w-xs">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`
                h-full transition-all duration-300
                ${status === 'completed' ? 'bg-green-500' : config.bgColor}
              `}
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded">
          <div className="flex items-center gap-2">
            <span className="text-red-400">✕</span>
            <span className="text-sm text-red-400">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
