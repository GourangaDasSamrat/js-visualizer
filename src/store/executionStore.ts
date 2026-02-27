import { create } from 'zustand';
import type { ExecutionStep } from '../types/execution';
import { ExecutionEngine } from '../engine/ExecutionEngine';

export type AppTheme = 'dracula' | 'catppuccin';
export type AppStatus = 'idle' | 'running' | 'paused' | 'complete';

interface ExecutionStore {
  // Code
  code: string;
  setCode: (code: string) => void;

  // Steps
  steps: ExecutionStep[];
  currentStepIndex: number;
  currentStep: ExecutionStep | null;
  totalSteps: number;

  // Status
  status: AppStatus;

  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

  // Actions
  runCode: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  goToStep: (index: number) => void;
}

const DEFAULT_CODE = `// JavaScript Event Loop Visualizer
// Click Run to see how this code executes!

console.log("1: Script starts");

setTimeout(function timeoutCallback() {
  console.log("4: setTimeout fires");
}, 0);

Promise.resolve()
  .then(function promiseCallback() {
    console.log("3: Promise resolved");
  });

console.log("2: Script ends");`;

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  code: DEFAULT_CODE,
  steps: [],
  currentStepIndex: -1,
  currentStep: null,
  totalSteps: 0,
  status: 'idle',
  theme: 'dracula',

  setCode: (code) => set({ code }),
  setTheme: (theme) => set({ theme }),

  runCode: () => {
    const { code } = get();
    const engine = new ExecutionEngine();
    const steps = engine.analyze(code);

    set({
      steps,
      totalSteps: steps.length,
      currentStepIndex: 0,
      currentStep: steps[0] ?? null,
      status: 'paused',
    });
  },

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    const next = currentStepIndex + 1;
    if (next < steps.length) {
      set({
        currentStepIndex: next,
        currentStep: steps[next],
        status: next === steps.length - 1 ? 'complete' : 'paused',
      });
    }
  },

  prevStep: () => {
    const { currentStepIndex, steps } = get();
    const prev = currentStepIndex - 1;
    if (prev >= 0) {
      set({
        currentStepIndex: prev,
        currentStep: steps[prev],
        status: 'paused',
      });
    }
  },

  goToStep: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({
        currentStepIndex: index,
        currentStep: steps[index],
        status: index === steps.length - 1 ? 'complete' : 'paused',
      });
    }
  },

  reset: () => {
    set({
      steps: [],
      currentStepIndex: -1,
      currentStep: null,
      totalSteps: 0,
      status: 'idle',
    });
  },
}));
