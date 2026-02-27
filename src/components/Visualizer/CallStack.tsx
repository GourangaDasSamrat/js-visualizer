import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { CallStackEntry } from '../../types/execution';

interface CallStackProps {
  entries: CallStackEntry[];
  isAnimating?: boolean;
}

export function CallStack({ entries, isAnimating }: CallStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEntriesRef = useRef<CallStackEntry[]>([]);

  useEffect(() => {
    const prev = prevEntriesRef.current;
    const curr = entries;

    // Find new entries (push)
    const newItems = curr.filter((e) => !prev.find((p) => p.id === e.id));
    // Find removed entries (pop)
    const removedItems = prev.filter((e) => !curr.find((c) => c.id === e.id));

    if (containerRef.current) {
      if (newItems.length > 0) {
        const selector = newItems
          .map((e) => `[data-stack-id="${e.id}"]`)
          .join(', ');
        const els = containerRef.current.querySelectorAll(selector);
        gsap.fromTo(
          els,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)', stagger: 0.05 }
        );
      }

      if (removedItems.length > 0 && isAnimating) {
        // Animate out happens before state update, but we handle it via CSS classes
      }
    }

    prevEntriesRef.current = [...entries];
  }, [entries, isAnimating]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Call Stack</h3>
        <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
          {entries.length}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex flex-col-reverse gap-1.5 overflow-auto min-h-0"
      >
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-white/20 font-mono italic">empty</span>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.id}
              data-stack-id={entry.id}
              className={`relative px-3 py-2.5 rounded-lg border transition-all duration-300 ${
                i === entries.length - 1
                  ? 'bg-blue-500/20 border-blue-400/50 shadow-[0_0_12px_rgba(96,165,250,0.2)]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-semibold ${
                    i === entries.length - 1 ? 'text-blue-300' : 'text-white/70'
                  }`}
                >
                  {entry.name}
                </span>
                <div className="flex items-center gap-1.5">
                  {entry.type === 'async' && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded font-mono">
                      async
                    </span>
                  )}
                  {entry.line > 0 && (
                    <span className="text-[9px] text-white/30 font-mono">L{entry.line}</span>
                  )}
                </div>
              </div>
              {i === entries.length - 1 && (
                <div className="absolute inset-0 rounded-lg bg-blue-400/5 animate-pulse pointer-events-none" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Stack base */}
      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      <div className="text-center mt-1">
        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">LIFO</span>
      </div>
    </div>
  );
}
