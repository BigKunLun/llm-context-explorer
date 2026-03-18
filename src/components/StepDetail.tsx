// src/components/StepDetail.tsx
import type { Step, StepType } from '../types';
import { ContextViewer } from './ContextViewer';

const stepTypeStyles: Record<StepType, {
  bg: string;
  text: string;
  icon: string;
  label: string;
  activeBg: string;
}> = {
  THOUGHT: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    icon: '🧠',
    label: '思考',
    activeBg: 'bg-purple-500/30',
  },
  ACTION: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    icon: '⚡',
    label: '行动',
    activeBg: 'bg-blue-500/30',
  },
  OBSERVATION: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    icon: '👁️',
    label: '观察',
    activeBg: 'bg-green-500/30',
  },
  ANSWER: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    icon: '💬',
    label: '回答',
    activeBg: 'bg-amber-500/30',
  },
};

interface StepDetailProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  /** 是否启用动画 */
  animate?: boolean;
  /** 导航按钮禁用状态 */
  disabledPrev?: boolean;
  disabledNext?: boolean;
}

export function StepDetail({
  step,
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
  animate = true,
  disabledPrev = false,
  disabledNext = false,
}: StepDetailProps) {
  const style = stepTypeStyles[step.type];
  const isFirst = stepIndex === 0 || disabledPrev;
  const isLast = stepIndex === totalSteps - 1 || disabledNext;

  return (
    <div className={`
      h-full flex flex-col
      ${animate ? 'step-detail-container' : ''}
    `}>
      {/* 步骤头部信息 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`
              step-detail-badge px-3 py-1 rounded-lg text-sm font-medium
              ${style.activeBg} ${style.text}
            `}>
              {style.icon} {style.label}
            </span>
            <span className="text-gray-500 text-sm">
              步骤 {stepIndex + 1} / {totalSteps}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Tokens: <span className="text-white font-mono">{step.tokens.used}</span> / {step.tokens.limit}
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          {step.title}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* 上下文快照 */}
      <div className="flex-1 overflow-auto mb-6">
        <ContextViewer
          messages={step.contextSnapshot}
          tokens={step.tokens}
          animate={animate}
        />
      </div>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className={`
            nav-button px-4 py-2 rounded-lg font-medium text-sm
            ${isFirst
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
            }
          `}
        >
          ← 上一步
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`
                nav-dot w-2 h-2 rounded-full
                ${i === stepIndex
                  ? 'bg-blue-500 is-active'
                  : 'bg-gray-600'
                }
              `}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className={`
            nav-button px-4 py-2 rounded-lg font-medium text-sm
            ${isLast
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
            }
          `}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}
