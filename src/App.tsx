import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { scenarios, getScenarioById } from './data/scenarios';
import { ScenarioSelect } from './components/ScenarioSelect';
import { Timeline } from './components/Timeline';
import { StepDetail } from './components/StepDetail';
import { AgentStatusBar } from './components/AgentStatusBar';
import { PlaybackBar } from './components/PlaybackBar';
import type { PlaybackSpeed, AgentStatus, AgentState, PlaybackState, StepType } from './types';

/** 播放速度对应的毫秒间隔 */
const SPEED_MS: Record<PlaybackSpeed, number> = {
  0.5: 3000,
  1: 1500,
  1.5: 1000,
  2: 750,
};

/** 步骤类型 -> Agent 状态映射 */
const STEP_TYPE_TO_STATUS: Record<StepType, AgentStatus> = {
  THOUGHT: 'thinking',
  ACTION: 'acting',
  OBSERVATION: 'observing',
  ANSWER: 'answering',
};

function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const currentStep = currentScenario?.steps[stepIndex];
  const totalSteps = currentScenario?.steps.length ?? 0;

  // 构造 PlaybackBar 所需的状态对象
  const playbackState: PlaybackState = {
    mode: isPlaying ? 'play' : 'pause',
    speed,
    currentStepIndex: stepIndex,
    totalSteps,
  };

  // 构造 AgentStatusBar 所需的状态对象
  const agentState: AgentState = {
    status: isPlaying
      ? STEP_TYPE_TO_STATUS[currentStep?.type ?? 'THOUGHT']
      : stepIndex === totalSteps - 1 && totalSteps > 0
        ? 'completed'
        : 'idle',
    currentStep: stepIndex,
    totalSteps,
  };

  // 停止播放
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 自动播放：步骤推进
  useEffect(() => {
    if (!isPlaying || !currentScenario) return;

    // 到达最后一步，停止
    if (stepIndex >= currentScenario.steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, SPEED_MS[speed]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIndex, speed, currentScenario]);

  const handleScenarioChange = useCallback((id: string) => {
    stopPlayback();
    setScenarioId(id);
    setStepIndex(0);
  }, [stopPlayback]);

  const handleStepSelect = useCallback((index: number) => {
    setStepIndex(index);
  }, []);

  const handleTogglePlay = useCallback(() => {
    // 如果当前在最后一步且要开始播放，重置到第一步
    if (!isPlaying && stepIndex >= totalSteps - 1 && totalSteps > 0) {
      setStepIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying, stepIndex, totalSteps]);

  const handlePrev = useCallback(() => {
    stopPlayback();
    setStepIndex(prev => Math.max(0, prev - 1));
  }, [stopPlayback]);

  const handleNext = useCallback(() => {
    stopPlayback();
    setStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
  }, [stopPlayback, totalSteps]);

  // 键盘快捷键：← 上一步, → 下一步, 空格 播放/暂停
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在 input/select 等表单元素中的按键
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault(); // 防止空格滚动页面
          handleTogglePlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, handleTogglePlay]);

  const handleSeek = useCallback((index: number) => {
    stopPlayback();
    setStepIndex(index);
  }, [stopPlayback]);

  const handleSpeedChange = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed);
  }, []);

  if (!currentScenario || !currentStep) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">ReAct Context Explorer</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleTogglePlay}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPlaying
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {isPlaying ? '⏸ 暂停' : '▶ 开始演示'}
            </button>
            <div className="w-64">
              <ScenarioSelect
                scenarios={scenarios}
                currentId={scenarioId}
                onChange={handleScenarioChange}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Agent Status Bar - 仅播放中显示 */}
      {isPlaying && (
        <AgentStatusBar
          state={agentState}
          currentStepTitle={currentStep.title}
          compact
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* 场景信息条 */}
        <div className="mb-4 px-4 py-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-medium">{currentScenario.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{currentScenario.description}</p>
            </div>
            <span className="text-sm text-gray-500">共 {totalSteps} 步</span>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-240px)]">
          {/* Left: Timeline */}
          <aside className="w-72 flex-shrink-0">
            <Timeline
              steps={currentScenario.steps}
              currentIndex={stepIndex}
              onSelect={handleStepSelect}
              playbackMode={isPlaying ? 'play' : 'pause'}
              isPlaybackActive={isPlaying}
              onPlaybackStop={stopPlayback}
            />
          </aside>

          {/* Right: Step Detail */}
          <section className="flex-1 min-w-0">
            <StepDetail
              key={currentStep.id}
              step={currentStep}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              onPrev={handlePrev}
              onNext={handleNext}
              hideNav={isPlaying}
            />
          </section>
        </div>
      </main>

      {/* Playback Bar - 底部固定 */}
      <div className="sticky bottom-0 z-10 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <PlaybackBar
            state={playbackState}
            onTogglePlay={handleTogglePlay}
            onPrevious={handlePrev}
            onNext={handleNext}
            onSpeedChange={handleSpeedChange}
            onSeek={handleSeek}
            disabledPrevious={stepIndex === 0}
            disabledNext={stepIndex >= totalSteps - 1}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
