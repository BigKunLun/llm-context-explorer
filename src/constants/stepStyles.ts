import type { StepType } from '../types';

export const STEP_TYPE_STYLES: Record<StepType, {
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
