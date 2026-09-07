interface LoadingStateProps {
  label?: string;
  hint?: string;
}

export default function LoadingState({
  label = "Merancang itinerari impian Anda...",
  hint = "AI sedang menyusun estimasi biaya, rekomendasi tempat, dan jadwal perjalanan.",
}: LoadingStateProps) {
  return (
    <div
      className="my-4 border-3 border-slate-900 bg-[#fffdf8] p-6 shadow-[6px_6px_0_#176b50] text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-slate-900 bg-[#f4dc4d] shadow-[3px_3px_0_#18221f]">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-900 border-t-transparent"></div>
      </div>

      <strong className="block text-base font-black text-slate-900 tracking-tight mb-1">
        {label}
      </strong>

      <p className="text-xs text-slate-600 font-sans mb-4 max-w-sm mx-auto">
        {hint}
      </p>

      {/* Skeleton cards preview */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="h-4 bg-slate-200 border border-slate-900 animate-pulse w-3/4 mx-auto"></div>
        <div className="h-3 bg-slate-200 border border-slate-900 animate-pulse w-1/2 mx-auto"></div>
      </div>
    </div>
  );
}
