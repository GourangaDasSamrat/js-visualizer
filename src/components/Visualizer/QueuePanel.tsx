import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { QueueEntry } from '../../types/execution';

interface QueuePanelProps {
  entries: QueueEntry[];
  type: 'task' | 'microtask';
}

export function QueuePanel({ entries, type }: QueuePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEntriesRef = useRef<QueueEntry[]>([]);

  const isMicro = type === 'microtask';
  const color = isMicro ? 'purple' : 'rose';

  const colorMap = {
    purple: {
      dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
      badge: 'bg-purple-500/20 text-purple-300',
      card: 'bg-purple-500/10 border-purple-400/30',
      cardFirst: 'bg-purple-500/20 border-purple-400/50 shadow-[0_0_10px_rgba(192,132,252,0.15)]',
      tag: 'bg-purple-500/20 text-purple-300',
      text: 'text-purple-300',
      label: 'Microtask Queue',
      sublabel: 'Promises, MutationObserver',
    },
    rose: {
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
      badge: 'bg-rose-500/20 text-rose-300',
      card: 'bg-white/5 border-white/10',
      cardFirst: 'bg-rose-500/10 border-rose-400/40 shadow-[0_0_10px_rgba(251,113,133,0.1)]',
      tag: 'bg-rose-500/20 text-rose-300',
      text: 'text-rose-300',
      label: 'Task Queue',
      sublabel: 'setTimeout, setInterval, I/O',
    },
  };

  const c = colorMap[color];

  useEffect(() => {
    const prev = prevEntriesRef.current;
    const newEntries = entries.filter((e) => !prev.find((p) => p.id === e.id));

    if (containerRef.current && newEntries.length > 0) {
      const els = newEntries
        .map((e) => containerRef.current!.querySelector(`[data-queue-id="${e.id}"]`))
        .filter(Boolean);
      gsap.fromTo(
        els,
        { opacity: 0, x: 20, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power2.out', stagger: 0.04 }
      );
    }

    prevEntriesRef.current = [...entries];
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">{c.label}</h3>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-mono ${c.badge}`}>
          {entries.length}
        </span>
      </div>
      <p className="text-[9px] text-white/25 mb-2 font-mono">{c.sublabel}</p>

      <div ref={containerRef} className="flex-1 flex flex-col gap-1.5 overflow-auto min-h-0">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-white/20 font-mono italic">empty</span>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.id}
              data-queue-id={entry.id}
              className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                i === 0 ? c.cardFirst : c.card
              }`}
            >
              <div className="flex items-center gap-2">
                {i === 0 && (
                  <span className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded ${c.tag}`}>
                    NEXT
                  </span>
                )}
                <span className="text-xs font-mono text-white/70 truncate">{entry.name}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-1 mt-2">
        <div className={`flex-1 h-px bg-gradient-to-r from-transparent to-transparent ${
          isMicro ? 'via-purple-400/20' : 'via-rose-400/20'
        }`} />
        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">FIFO</span>
        <div className={`flex-1 h-px bg-gradient-to-r from-transparent to-transparent ${
          isMicro ? 'via-purple-400/20' : 'via-rose-400/20'
        }`} />
      </div>
    </div>
  );
}
