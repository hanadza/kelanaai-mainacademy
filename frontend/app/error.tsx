"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error("App Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl border-4 border-slate-900 bg-[#fffdf8] p-6 sm:p-10 shadow-[8px_8px_0_#f15b45] text-center">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f15b45] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0_#18221f] mb-6">
          <span>SYSTEM ERROR 500</span>
        </div>

        {/* Header */}
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 mb-2">
          Ups! Terjadi Gangguan <span className="text-[#f15b45]">⚠️</span>
        </h1>

        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 mb-4">
          Aplikasi mengalami kendala teknis saat memproses permintaan Anda.
        </h2>

        {error?.message && (
          <div className="mb-6 border-2 border-slate-900 bg-red-50 p-3 text-xs font-mono text-red-900 text-left overflow-x-auto shadow-[3px_3px_0_#18221f]">
            <strong>Detail Masalah:</strong> {error.message}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>🔄 Coba Lagi (Retry)</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#176b50] hover:bg-[#0f4333] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#0f4333] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#0f4333] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 no-underline"
          >
            <span>🏠 Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
