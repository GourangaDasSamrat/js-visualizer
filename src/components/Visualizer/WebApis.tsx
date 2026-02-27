import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { WebApiEntry } from '../../types/execution';

const API_ICONS: Record<string, string> = {
  setTimeout: '⏱',
  setInterval: '🔄',
  fetch: '🌐',
  promise: '⚡',
  event: '📡',
};

interface WebApisProps {
  entries: WebApiEntry[];
}

export function WebApis({ entries }: WebApisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEntriesRef = useRef<WebApiEntry[]>([]);

  useEffect(() => {
    const prev = prevEntriesRef.current;
    const newEntries = entries.filter((e) => !prev.find((p) => p.id === e.id));

    if (containerRef.current && newEntries.length > 0) {
      const els = newEntries
        .map((e) => containerRef.current!.querySelector(`[data-api-id="${e.id}"]`))
        .filter(Boolean);
      gsap.fromTo(
        els,
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)', stagger: 0.06 }
      );
    }

    // Animate resolving entries
    const resolving = entries.filter((e) => {
      const old = prev.find((p) => p.id === e.id);
      return old && old.status !== 'resolved' && e.status === 'resolved';
    });

    if (containerRef.current && resolving.length > 0) {
      const els = resolving
        .map((e) => containerRef.current!.querySelector(`[data-api-id="${e.id}"]`))
        .filter(Boolean);
      gsap.to(els, {
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        borderColor: 'rgba(52, 211, 153, 0.5)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    prevEntriesRef.current = [...entries];
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Web APIs</h3>
        <span className="ml-auto text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-mono">
          {entries.length}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex flex-col gap-1.5 overflow-auto min-h-0"
      >
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-white/20 font-mono italic">idle</span>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              data-api-id={entry.id}
              className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                entry.status === 'resolved'
                  ? 'bg-emerald-500/10 border-emerald-400/30'
                  : entry.status === 'resolving'
                    ? 'bg-orange-500/10 border-orange-400/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{API_ICONS[entry.type] ?? '🔧'}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-white/80 truncate block">{entry.name}</span>
                  {entry.delay !== undefined && (
                    <span className="text-[9px] text-white/30 font-mono">{entry.delay}ms timer</span>
                  )}
                </div>
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    entry.status === 'resolved'
                      ? 'bg-emerald-400'
                      : entry.status === 'resolving'
                        ? 'bg-yellow-400 animate-pulse'
                        : 'bg-orange-400/60 animate-pulse'
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
