// src/components/StepCard.tsx
import type { Step } from '../types';
import { STEP_TYPE_STYLES } from '../constants/stepStyles';

interface StepCardProps {
  step: Step;
  index: number;
  isActive: boolean;
  onClick: () => void;
  /** 是否启用动画 */
  animate?: boolean;
  /** 是否已完成 */
  isCompleted?: boolean;
}

export function StepCard({
  step,
  index,
  isActive,
  onClick,
  animate = true,
  isCompleted = false,
}: StepCardProps) {
  const style = STEP_TYPE_STYLES[step.type];

  return (
    <button
      onClick={onClick}
      className={`
        step-card w-full text-left p-3 rounded-lg border relative overflow-hidden
        ${isActive
          ? 'is-active bg-gray-800 border-blue-500 shadow-lg shadow-blue-500/20'
          : isCompleted
            ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600'
            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
        }
        ${!animate ? 'animation-none' : ''}
      `}
      type="button"
    >
      {/* 活动状态下的左侧指示条 */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
      )}

      {/* 步骤序号 */}
      <div className="absolute top-2 right-2">
        <span className={`
          text-xs font-mono
          ${isActive ? 'text-blue-400' : 'text-gray-600'}
        `}>
          #{index + 1}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className={`
          step-type-badge px-2 py-0.5 rounded text-xs font-medium
          ${isActive ? `${style.activeBg} ${style.text} scale-105` : `${style.bg} ${style.text}`}
        `}>
          {style.icon} {step.type}
        </span>
      </div>

      <div className={`
        text-sm font-medium truncate pr-8
        ${isActive ? 'text-white' : 'text-gray-300'}
      `}>
        {step.title}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className={`
          text-xs font-mono
          ${isActive ? 'text-gray-400' : 'text-gray-500'}
        `}>
          Tokens: {step.tokens.used}
        </span>
      </div>

      {/* 完成状态指示 */}
      {isCompleted && !isActive && (
        <span className="absolute bottom-2 right-2 text-green-500/50 text-sm">✓</span>
      )}
    </button>
  );
}
