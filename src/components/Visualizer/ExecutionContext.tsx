import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { ExecutionFrame } from '../../types/execution';

interface ExecutionContextProps {
  frames: ExecutionFrame[];
}

export function ExecutionContext({ frames }: ExecutionContextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFramesRef = useRef<ExecutionFrame[]>([]);

  useEffect(() => {
    const prev = prevFramesRef.current;
    const newFrames = frames.filter((f) => !prev.find((p) => p.id === f.id));

    if (containerRef.current && newFrames.length > 0) {
      const els = newFrames
        .map((f) => containerRef.current!.querySelector(`[data-frame-id="${f.id}"]`))
        .filter(Boolean);
      gsap.fromTo(
        els,
        { opacity: 0, x: -15, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power2.out', stagger: 0.06 }
      );
    }

    prevFramesRef.current = [...frames];
  }, [frames]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
          Execution Context
        </h3>
        <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
          {frames.length}
        </span>
      </div>

      <div ref={containerRef} className="flex-1 flex flex-col gap-2 overflow-auto min-h-0">
        {frames.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-white/20 font-mono italic">none</span>
          </div>
        ) : (
          frames.map((frame, i) => (
            <div
              key={frame.id}
              data-frame-id={frame.id}
              className={`rounded-lg border p-3 transition-all duration-300 ${
                i === frames.length - 1
                  ? 'bg-emerald-500/10 border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                  : 'bg-white/3 border-white/8'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-300 font-mono">
                  {frame.name}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    frame.type === 'global'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : frame.type === 'async'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {frame.type}
                </span>
              </div>

              {Object.keys(frame.variables).length > 0 && (
                <div className="space-y-1">
                  {Object.entries(frame.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-white/50">{key}</span>
                      <span className="text-[10px] font-mono text-amber-300/80 truncate max-w-[100px]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {Object.keys(frame.variables).length === 0 && (
                <span className="text-[10px] text-white/20 italic">no variables</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
