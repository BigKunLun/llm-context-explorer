// src/components/Timeline.tsx
import type { Step, PlaybackMode } from '../types';
import { StepCard } from './StepCard';

interface TimelineProps {
  /** 所有步骤 */
  steps: Step[];
  /** 当前选中的步骤索引 */
  currentIndex: number;
  /** 选中步骤的回调函数 */
  onSelect: (index: number) => void;
  /** 播放模式 */
  playbackMode?: PlaybackMode;
  /** 是否处于播放活动状态 */
  isPlaybackActive?: boolean;
  /** 停止播放的回调函数 */
  onPlaybackStop?: () => void;
  /** 是否启用动画 */
  animate?: boolean;
}

export function Timeline({
  steps,
  currentIndex,
  onSelect,
  playbackMode = 'pause',
  isPlaybackActive = false,
  onPlaybackStop,
  animate = true,
}: TimelineProps) {
  /** 是否处于播放模式 */
  const isPlaybackMode = playbackMode === 'play' && isPlaybackActive;

  /** 处理步骤点击 */
  const handleStepClick = (index: number) => {
    // 如果当前处于播放模式且点击的不是当前活动步骤，则停止播放
    if (isPlaybackMode && index !== currentIndex && onPlaybackStop) {
      onPlaybackStop();
    }
    onSelect(index);
  };

  return (
    <div className="h-full overflow-y-auto pr-2 space-y-2 smooth-scroll">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            isActive={isActive}
            isCompleted={isCompleted}
            onClick={() => handleStepClick(index)}
            animate={animate}
          />
        );
      })}
    </div>
  );
}
