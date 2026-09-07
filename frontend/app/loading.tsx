export default function Loading() {
  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-slate-900">
      <div className="w-full max-w-md border-4 border-slate-900 bg-[#fffdf8] p-8 shadow-[8px_8px_0_#176b50] text-center">
        {/* Animated Icon Container */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-slate-900 bg-[#f4dc4d] shadow-[4px_4px_0_#18221f]">
          <div className="h-10 w-10 animate-spin text-slate-900">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
        </div>

        {/* Brand Text */}
        <div className="inline-block border-2 border-slate-900 bg-[#176b50] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0_#18221f] mb-3">
          KELANA AI
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Memuat Pengalaman Jelajah...
        </h2>

        <p className="text-xs text-slate-600 font-sans mb-6">
          Menyiapkan rekomendasi tempat dan itinerari petualangan Anda.
        </p>

        {/* Skeleton animation bar */}
        <div className="w-full bg-slate-200 border-2 border-slate-900 h-3 overflow-hidden p-0.5 shadow-[2px_2px_0_#18221f]">
          <div className="bg-[#176b50] h-full w-2/3 animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
