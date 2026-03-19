// src/components/ScenarioSelect.tsx
import type { Scenario } from '../types';

interface ScenarioSelectProps {
  scenarios: Scenario[];
  currentId: string;
  onChange: (id: string) => void;
}

export function ScenarioSelect({ scenarios, currentId, onChange }: ScenarioSelectProps) {
  const current = scenarios.find(s => s.id === currentId);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        选择场景
      </label>
      <select
        value={currentId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>
      {current?.description && (
        <p className="mt-2 text-sm text-gray-500">
          {current.description}
        </p>
      )}
    </div>
  );
}
