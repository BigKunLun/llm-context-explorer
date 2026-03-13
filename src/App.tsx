import { useState, useMemo } from 'react';
import { scenarios, getScenarioById } from './data/scenarios';
import { ScenarioSelect } from './components/ScenarioSelect';
import { Timeline } from './components/Timeline';
import { StepDetail } from './components/StepDetail';

function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);

  const currentScenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const currentStep = currentScenario?.steps[stepIndex];

  const handleScenarioChange = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };

  const handleStepSelect = (index: number) => {
    setStepIndex(index);
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleNext = () => {
    if (currentScenario && stepIndex < currentScenario.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  if (!currentScenario || !currentStep) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white">加载中...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">ReAct Context Explorer</h1>
          <div className="w-64">
            <ScenarioSelect
              scenarios={scenarios}
              currentId={scenarioId}
              onChange={handleScenarioChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Left: Timeline */}
          <aside className="w-72 flex-shrink-0">
            <Timeline
              steps={currentScenario.steps}
              currentIndex={stepIndex}
              onSelect={handleStepSelect}
            />
          </aside>

          {/* Right: Step Detail */}
          <section className="flex-1 min-w-0">
            <StepDetail
              step={currentStep}
              stepIndex={stepIndex}
              totalSteps={currentScenario.steps.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
