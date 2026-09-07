interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorState({
  message,
  onRetry,
  title = "Gagal Memuat Data",
}: ErrorStateProps) {
  return (
    <div
      className="my-4 border-3 border-slate-900 bg-red-50 p-4 sm:p-5 shadow-[5px_5px_0_#f15b45] text-slate-900"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-slate-900 bg-[#f15b45] text-white font-black text-sm shrink-0 shadow-[2px_2px_0_#18221f]">
          !
        </div>
        <div className="flex-1">
          <strong className="block text-sm font-black uppercase tracking-tight text-red-950 mb-1">
            {title}
          </strong>
          <p className="text-xs text-red-900 font-sans leading-relaxed">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 border-2 border-slate-900 bg-white hover:bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-950 shadow-[2px_2px_0_#18221f] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <span>🔄 Coba Lagi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
