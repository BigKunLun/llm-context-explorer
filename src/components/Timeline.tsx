// src/components/Timeline.tsx
import { useRef, useEffect, useCallback } from 'react';
import type { Step, PlaybackMode } from '../types';
import { STEP_TYPE_STYLES } from '../constants/stepStyles';
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
  /** 步骤元素的 ref 数组，用于自动滚动 */
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** 设置步骤元素 ref 的回调 */
  const setStepRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      stepRefs.current[index] = el;
    },
    [],
  );

  /** 当 currentIndex 变化时，自动滚动到当前步骤 */
  useEffect(() => {
    const currentEl = stepRefs.current[currentIndex];
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

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
    <div className="h-full overflow-y-auto pr-2 smooth-scroll">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isLast = index === steps.length - 1;
        const style = STEP_TYPE_STYLES[step.type];

        // 圆点颜色：已完成用蓝色，当前用步骤类型色，未到达用灰色
        const dotColor = isCompleted
          ? 'bg-blue-500'
          : isActive
            ? style.bg.replace('/20', '')
            : 'bg-gray-600';

        // 连接线颜色：已完成步骤间用蓝色，否则灰色
        const lineColor = isCompleted ? 'bg-blue-500/50' : 'bg-gray-700';

        return (
          <div key={step.id} ref={setStepRef(index)} className="relative flex items-stretch">
            {/* 左侧轨道：圆点 + 连接线 */}
            <div className="flex flex-col items-center mr-3 pt-4">
              {/* 圆点指示器 */}
              <div
                className={`w-3 h-3 rounded-full shrink-0 ring-2 ring-gray-800 ${dotColor}`}
              />
              {/* 竖线（最后一个步骤不显示） */}
              {!isLast && (
                <div className={`w-0.5 flex-1 mt-1 ${lineColor}`} />
              )}
            </div>
            {/* 步骤卡片 */}
            <div className="flex-1 pb-2">
              <StepCard
                step={step}
                index={index}
                isActive={isActive}
                isCompleted={isCompleted}
                onClick={() => handleStepClick(index)}
                animate={animate}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
