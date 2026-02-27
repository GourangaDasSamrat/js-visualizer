import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { EditorPanel } from '../Editor/EditorPanel';
import { CallStack } from '../Visualizer/CallStack';
import { ExecutionContext } from '../Visualizer/ExecutionContext';
import { WebApis } from '../Visualizer/WebApis';
import { QueuePanel } from '../Visualizer/QueuePanel';
import { EventLoop } from '../Visualizer/EventLoop';
import { ConsolePanel } from '../Visualizer/ConsolePanel';
import { Controls } from '../Controls/Controls';
import { useExecutionStore } from '../../store/executionStore';

export function AppLayout() {
  const { currentStep, currentStepIndex } = useExecutionStore();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0a0c14] text-white overflow-hidden select-none">
      {/* Header */}
      <header
        ref={headerRef}
        className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-[#0f1117] border-b border-white/8 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">JS Visualizer</h1>
              <p className="text-[9px] text-white/30 font-mono tracking-wider">EVENT LOOP DEBUGGER</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/25">
            <span className="px-2 py-1 bg-white/5 rounded text-white/40">Desktop Only</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/40 font-mono">WASM Engine</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Editor */}
        <div className="flex flex-col w-[42%] border-r border-white/8 min-h-0">
          <div className="flex-1 overflow-hidden p-4">
            <EditorPanel className="h-full" />
          </div>
          <Controls />
        </div>

        {/* Right: Visualizer panels */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top row: Call Stack, Execution Context, Web APIs, Event Loop */}
          <div className="flex h-[55%] border-b border-white/8 min-h-0">
            {/* Call Stack */}
            <div className="flex-1 border-r border-white/8 p-4 min-h-0 overflow-hidden">
              <CallStack
                entries={currentStep?.callStack ?? []}
                isAnimating={!!currentStep}
              />
            </div>

            {/* Execution Context */}
            <div className="w-[28%] border-r border-white/8 p-4 min-h-0 overflow-hidden">
              <ExecutionContext frames={currentStep?.executionContext ?? []} />
            </div>

            {/* Web APIs */}
            <div className="w-[24%] border-r border-white/8 p-4 min-h-0 overflow-hidden">
              <WebApis entries={currentStep?.webApis ?? []} />
            </div>

            {/* Event Loop */}
            <div className="w-[22%] p-4 min-h-0 overflow-hidden">
              <EventLoop
                active={currentStep?.eventLoopActive ?? false}
                stepIndex={currentStepIndex}
              />
            </div>
          </div>

          {/* Bottom row: Task Queue, Microtask Queue, Console */}
          <div className="flex h-[45%] min-h-0">
            {/* Task Queue */}
            <div className="flex-1 border-r border-white/8 p-4 min-h-0 overflow-hidden">
              <QueuePanel entries={currentStep?.taskQueue ?? []} type="task" />
            </div>

            {/* Microtask Queue */}
            <div className="flex-1 border-r border-white/8 p-4 min-h-0 overflow-hidden">
              <QueuePanel entries={currentStep?.microtaskQueue ?? []} type="microtask" />
            </div>

            {/* Console */}
            <div className="flex-1 p-4 min-h-0 overflow-hidden">
              <ConsolePanel output={currentStep?.consoleOutput ?? []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
