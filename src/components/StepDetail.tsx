// src/components/StepDetail.tsx
import { useState } from 'react';
import type { Step } from '../types';
import { STEP_TYPE_STYLES } from '../constants/stepStyles';
import { ContextViewer } from './ContextViewer';

interface StepDetailProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  /** 是否启用动画 */
  animate?: boolean;
  /** 是否隐藏导航栏（播放模式时） */
  hideNav?: boolean;
}

export function StepDetail({
  step,
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
  animate = true,
  hideNav = false,
}: StepDetailProps) {
  const [viewMode, setViewMode] = useState<'snapshot' | 'diff'>('snapshot');
  const style = STEP_TYPE_STYLES[step.type];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

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

      {/* 视图模式切换 */}
      <div className="flex mb-4">
        <div className="inline-flex rounded-lg bg-gray-800 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'snapshot'}
            onClick={() => setViewMode('snapshot')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'snapshot'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            完整快照
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'diff'}
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'diff'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            增量变化
          </button>
        </div>
      </div>

      {/* 上下文快照 */}
      <div className="flex-1 overflow-auto mb-6" role="tabpanel">
        <ContextViewer
          messages={viewMode === 'snapshot' ? step.contextSnapshot : step.contextDiff}
          newMessages={viewMode === 'snapshot' ? step.contextDiff : step.contextDiff}
          tokens={step.tokens}
          animate={animate}
        />
      </div>

      {/* 导航按钮 - 播放模式下隐藏 */}
      {!hideNav && (
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
      )}
    </div>
  );
}
