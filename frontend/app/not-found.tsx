import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl border-4 border-slate-900 bg-[#fffdf8] p-6 sm:p-10 shadow-[8px_8px_0_#176b50] text-center">
        {/* Badge & Icon */}
        <div className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f15b45] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0_#18221f] mb-6">
          <span>ERROR 404</span>
          <span className="h-2 w-2 rounded-full bg-yellow-300"></span>
        </div>

        {/* Large 404 Header */}
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 mb-2">
          404 <span className="text-[#176b50]">🗺️</span>
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 mb-4">
          Tersesat di Peta? (Page Not Found)
        </h2>

        <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed mb-8 max-w-md mx-auto">
          Halaman atau destinasi yang Anda cari tidak ditemukan. Mungkin tautan telah berubah atau belum dipetakan oleh sistem KelanaAI.
        </p>

        {/* Action Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 no-underline"
          >
            <span>🏠 Beranda</span>
          </Link>
          
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#176b50] hover:bg-[#0f4333] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#0f4333] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#0f4333] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 no-underline"
          >
            <span>✈️ My Trips</span>
          </Link>

          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#18221f] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#18221f] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 no-underline"
          >
            <span>🤖 AI Assistant</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
