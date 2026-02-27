import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useExecutionStore } from '../../store/executionStore';
import toast from 'react-hot-toast';

export function Controls() {
  const {
    status,
    currentStep,
    currentStepIndex,
    totalSteps,
    runCode,
    nextStep,
    prevStep,
    reset,
    goToStep,
  } = useExecutionStore();

  const descRef = useRef<HTMLParagraphElement>(null);
  const prevDescRef = useRef<string>('');

  useEffect(() => {
    if (descRef.current && currentStep && currentStep.description !== prevDescRef.current) {
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
      prevDescRef.current = currentStep.description;
    }
  }, [currentStep]);

  const handleRun = () => {
    runCode();
    toast.success('Execution started! Use Next/Prev to step through.', {
      duration: 3000,
      style: {
        background: '#1e2030',
        color: '#cad3f5',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '13px',
      },
    });
  };

  const handleReset = () => {
    reset();
    toast('Reset. Edit your code and run again.', {
      icon: '↺',
      duration: 2000,
      style: {
        background: '#1e2030',
        color: '#cad3f5',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '13px',
      },
    });
  };

  const progress = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 bg-[#0f1117] border-t border-white/8 px-6 py-4 flex-shrink-0">
      {/* Step description */}
      <div className="min-h-[40px] flex items-start gap-3">
        {currentStep ? (
          <>
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <p
              ref={descRef}
              className="text-sm text-white/75 leading-relaxed font-mono"
            >
              {currentStep.description}
            </p>
          </>
        ) : (
          <p className="text-sm text-white/30 italic font-mono">
            Paste your JavaScript code above, then click Run to start the visualization.
          </p>
        )}
      </div>

      {/* Progress bar */}
      {status !== 'idle' && totalSteps > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/30 font-mono">Progress</span>
            <span className="text-[10px] text-white/40 font-mono">
              Step {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Clickable step markers */}
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: Math.min(totalSteps, 40) }).map((_, i) => {
              const stepI = Math.floor((i / 40) * totalSteps);
              return (
                <button
                  key={i}
                  onClick={() => goToStep(stepI)}
                  className={`flex-1 h-1 rounded-sm transition-all duration-150 cursor-pointer ${
                    stepI <= currentStepIndex
                      ? 'bg-blue-500/70 hover:bg-blue-400'
                      : 'bg-white/10 hover:bg-white/25'
                  }`}
                  title={`Step ${stepI + 1}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {status === 'idle' || status === 'complete' ? (
          <button
            onClick={status === 'idle' ? handleRun : handleReset}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              status === 'idle'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/10 hover:bg-white/15 text-white/70'
            }`}
          >
            {status === 'idle' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Run Visualization
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16v16H4z" />
                </svg>
                Reset
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={prevStep}
              disabled={currentStepIndex <= 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/8 hover:bg-white/12 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19,3 5,12 19,21" />
              </svg>
              Prev
            </button>

            <button
              onClick={nextStep}
              disabled={currentStepIndex >= totalSteps - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>

            <button
              onClick={handleReset}
              className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-all duration-200"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
              </svg>
              Reset
            </button>
          </>
        )}

        {status === 'complete' && (
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Complete
          </span>
        )}
      </div>
    </div>
  );
}
