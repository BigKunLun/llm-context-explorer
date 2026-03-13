// src/components/Timeline.tsx
import type { Step } from '../types';
import { StepCard } from './StepCard';

interface TimelineProps {
  /** 所有步骤 */
  steps: Step[];
  /** 当前选中的步骤索引 */
  currentIndex: number;
  /** 选中步骤的回调函数 */
  onSelect: (index: number) => void;
}

export function Timeline({ steps, currentIndex, onSelect }: TimelineProps) {
  return (
    <div className="h-full overflow-y-auto pr-2 space-y-2">
      {steps.map((step, index) => (
        <StepCard
          key={step.id}
          step={step}
          index={index}
          isActive={index === currentIndex}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
