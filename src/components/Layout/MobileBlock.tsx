export function MobileBlock() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0c14] p-8 md:hidden">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Desktop Only</h2>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
            JS Visualizer is optimized for desktop use. Please open this application on a
            larger screen for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
}
