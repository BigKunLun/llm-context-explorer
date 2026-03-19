// src/components/PlaybackBar.tsx
import type { PlaybackSpeed, PlaybackState } from '../types';

interface PlaybackBarProps {
  /** 当前播放状态 */
  state: PlaybackState;
  /** 播放/暂停回调 */
  onTogglePlay: () => void;
  /** 上一步回调 */
  onPrevious: () => void;
  /** 下一步回调 */
  onNext: () => void;
  /** 速度变更回调 */
  onSpeedChange: (speed: PlaybackSpeed) => void;
  /** 进度跳转回调 */
  onSeek: (index: number) => void;
  /** 是否禁用上一步 */
  disabledPrevious?: boolean;
  /** 是否禁用下一步 */
  disabledNext?: boolean;
}

/** 播放速度选项 */
const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

export function PlaybackBar({
  state,
  onTogglePlay,
  onPrevious,
  onNext,
  onSpeedChange,
  onSeek,
  disabledPrevious = false,
  disabledNext = false,
}: PlaybackBarProps) {
  const { mode, speed, currentStepIndex, totalSteps } = state;
  const isPlaying = mode === 'play';
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      {/* 进度条 */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500 hover:accent-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
          aria-label="进度条"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>步骤 {currentStepIndex + 1} / {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 控制按钮和速度选择器 */}
      <div className="flex items-center justify-between">
        {/* 播放控制按钮 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={disabledPrevious}
            className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="上一步"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <svg
                className="w-5 h-5 text-gray-200"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-200 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={disabledNext}
            className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="下一步"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 速度选择器 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">速度:</span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(e.target.value as unknown as PlaybackSpeed)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer hover:border-gray-500"
            aria-label="播放速度"
          >
            {SPEED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
