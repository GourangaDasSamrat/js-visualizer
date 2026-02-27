import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ConsolePanelProps {
  output: string[];
}

export function ConsolePanel({ output }: ConsolePanelProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const prevOutputRef = useRef<string[]>([]);

  useEffect(() => {
    if (!listRef.current) return;
    const newCount = output.length - prevOutputRef.current.length;

    if (newCount > 0) {
      const items = listRef.current.querySelectorAll('li');
      const newItems = Array.from(items).slice(-newCount);
      gsap.fromTo(
        newItems,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 }
      );
      // Scroll to bottom
      listRef.current.parentElement?.scrollTo({
        top: listRef.current.parentElement.scrollHeight,
        behavior: 'smooth',
      });
    }

    prevOutputRef.current = [...output];
  }, [output]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Console</h3>
        {output.length > 0 && (
          <span className="ml-auto text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono">
            {output.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto min-h-0 bg-black/30 rounded-lg border border-white/8 p-3">
        {output.length === 0 ? (
          <span className="text-xs text-white/20 font-mono italic">No output yet</span>
        ) : (
          <ul ref={listRef} className="space-y-1">
            {output.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-400/60 font-mono text-[10px] mt-0.5 flex-shrink-0">›</span>
                <span className="text-xs font-mono text-teal-300/90 break-all">{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
