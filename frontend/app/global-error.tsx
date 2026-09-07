"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f4f1e9] min-h-screen flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="w-full max-w-md border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0_#f15b45] text-center">
          <div className="inline-block border-2 border-slate-900 bg-red-500 text-white font-black text-xs px-3 py-1 uppercase tracking-widest mb-4">
            Critical System Error
          </div>
          <h1 className="text-3xl font-black mb-2">KelanaAI</h1>
          <p className="text-sm text-slate-600 mb-6">
            Terjadi masalah utama pada aplikasi.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2 text-xs font-bold uppercase shadow-[3px_3px_0_#176b50]"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="border-2 border-slate-900 bg-[#176b50] text-white px-4 py-2 text-xs font-bold uppercase shadow-[3px_3px_0_#0f4333]"
            >
              Beranda
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
