import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface EventLoopProps {
  active: boolean;
  stepIndex: number;
}

export function EventLoop({ active, stepIndex }: EventLoopProps) {
  const loopRef = useRef<SVGCircleElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (!ringRef.current) return;

    if (active && !prevActiveRef.current) {
      // Animate ring glow on activation
      gsap.fromTo(
        ringRef.current,
        { boxShadow: '0 0 0px rgba(251,191,36,0)' },
        {
          boxShadow: '0 0 30px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2)',
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    } else if (!active && prevActiveRef.current) {
      gsap.to(ringRef.current, {
        boxShadow: '0 0 0px rgba(251,191,36,0)',
        duration: 0.5,
      });
    }

    prevActiveRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!loopRef.current || !active) return;

    // Spin animation on loop tick
    gsap.fromTo(
      loopRef.current,
      { rotation: 0 },
      { rotation: 360, duration: 0.8, ease: 'power1.inOut', transformOrigin: 'center center' }
    );
  }, [stepIndex, active]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            active
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              : 'bg-amber-400/30'
          }`}
        />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Event Loop</h3>
      </div>

      {/* Circular visualization */}
      <div
        ref={ringRef}
        className={`relative w-20 h-20 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
          active
            ? 'border-amber-400/60 bg-amber-400/10'
            : 'border-white/10 bg-white/3'
        }`}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className={active ? 'opacity-100' : 'opacity-30'}
        >
          <circle
            ref={loopRef}
            cx="30"
            cy="30"
            r="22"
            fill="none"
            stroke={active ? '#fbbf24' : '#6b7280'}
            strokeWidth="2"
            strokeDasharray="8 4"
            strokeLinecap="round"
            style={{ transformOrigin: '30px 30px' }}
            className={active ? 'animate-spin' : ''}
          />
          <circle
            cx="30"
            cy="8"
            r="3"
            fill={active ? '#fbbf24' : '#6b7280'}
            className={active ? 'animate-pulse' : ''}
          />
        </svg>

        {active && (
          <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/10" />
        )}
      </div>

      <div
        className={`text-center transition-all duration-300 ${active ? 'opacity-100' : 'opacity-30'}`}
      >
        <p className={`text-[10px] font-mono font-semibold ${active ? 'text-amber-400' : 'text-white/40'}`}>
          {active ? 'TICKING' : 'WAITING'}
        </p>
        <p className="text-[9px] text-white/30 mt-0.5 font-mono">
          {active ? 'Checking queues...' : 'Stack busy'}
        </p>
      </div>

      {/* Flow diagram */}
      <div ref={arrowRef} className="w-full space-y-1">
        {[
          { label: 'Microtask Q', priority: 1, color: 'purple' },
          { label: 'Task Queue', priority: 2, color: 'rose' },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-[9px] font-mono transition-all duration-200 ${
              active
                ? item.color === 'purple'
                  ? 'bg-purple-500/10 border-purple-400/20 text-purple-300'
                  : 'bg-rose-500/10 border-rose-400/20 text-rose-300'
                : 'bg-white/3 border-white/8 text-white/30'
            }`}
          >
            <span className="opacity-60">#{item.priority}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
