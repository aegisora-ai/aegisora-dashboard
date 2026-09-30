export function RouteLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00030b]"
    >
      <style>{`
        @keyframes aeg-draw { 0%{stroke-dashoffset:140} 60%,100%{stroke-dashoffset:0} }
        @keyframes aeg-check { 0%,35%{stroke-dashoffset:40} 75%,100%{stroke-dashoffset:0} }
        @keyframes aeg-pulse { 0%,100%{transform:scale(.92);opacity:.5} 50%{transform:scale(1.06);opacity:1} }
        @keyframes aeg-ring { to{transform:rotate(360deg)} }
        @keyframes aeg-bar { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
        .aeg-draw{stroke-dasharray:140;animation:aeg-draw 1.8s ease-in-out infinite}
        .aeg-check{stroke-dasharray:40;animation:aeg-check 1.8s ease-in-out infinite}
        .aeg-pulse{animation:aeg-pulse 2.4s ease-in-out infinite}
        .aeg-ring{animation:aeg-ring 6s linear infinite;border-style:dashed}
        .aeg-bar{animation:aeg-bar 1.4s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){.aeg-draw,.aeg-check,.aeg-pulse,.aeg-ring,.aeg-bar{animation:none}}
      `}</style>
      <div className="flex flex-col items-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <span className="aeg-pulse absolute inset-0 rounded-full bg-blue-500/10" />
          <span className="aeg-ring absolute inset-5 rounded-full border border-blue-500/40" />
          <svg viewBox="0 0 48 48" className="relative h-12 w-12 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path className="aeg-draw" d="M24 4 L40 10 V22 C40 32 33 40 24 44 C15 40 8 32 8 22 V10 Z" />
            <path className="aeg-check" d="M16 24 l6 6 l11 -12" />
          </svg>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-white">Aegisora</span>
          <span className="text-[10px] tracking-[0.2em] text-slate-500">CONTROL</span>
        </div>
        <div className="mt-3 h-px w-28 overflow-hidden bg-slate-800">
          <span className="aeg-bar block h-px w-10 bg-blue-500" />
        </div>
      </div>
    </div>
  );
}