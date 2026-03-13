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
