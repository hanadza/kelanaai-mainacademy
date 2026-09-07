"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, User } from "@/services/authService";

export default function AboutPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 box-border">
      {/* Navigation Header */}
      <header className="mb-8 border-b-2 border-slate-900 pb-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="no-underline">
              <h1 className="text-3xl sm:text-4xl font-black leading-none tracking-tight text-slate-900">
                Kelana<span className="text-[#176b50]">AI</span>
              </h1>
            </Link>
            <span className="border border-slate-900 bg-[#f4dc4d] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-[2px_2px_0_#176b50]">
              ABOUT
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_#18221f] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#18221f] transition-all no-underline"
            >
              <span>BERANDA</span>
            </Link>

            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#176b50] transition-all no-underline"
            >
              <span>MY TRIPS</span>
            </Link>

            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-[#176b50] hover:bg-[#0f4333] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_#0f4333] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0f4333] transition-all no-underline"
            >
              <span>ASSISTANT 🤖</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="mb-8 border-4 border-slate-900 bg-[#fffdf8] p-6 sm:p-10 shadow-[8px_8px_0_#176b50]">
        <div className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f15b45] px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0_#18221f] mb-4">
          <span>TENTANG KELANA AI</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Revolusi Perencanaan Perjalanan dengan Kecerdasan Buatan 🌍
        </h2>

        <p className="text-base sm:text-lg text-slate-700 font-sans leading-relaxed max-w-3xl">
          <strong>KelanaAI</strong> adalah platform perencanaan wisata berbasis Artificial Intelligence yang dirancang khusus untuk mempermudah wisatawan merancang itinerari yang personal, efisien, dan kaya akan pengalaman bermakna. Dari destinasi populer hingga permata tersembunyi (*hidden gems*), KelanaAI menyajikan petunjuk lengkap perjalanan dalam hitungan detik.
        </p>
      </section>

      {/* Core Features Grid */}
      <section className="mb-10">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6 flex items-center gap-2">
          <span className="h-4 w-4 bg-[#f15b45] border-2 border-slate-900 inline-block"></span>
          Fitur Utama KelanaAI
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="border-3 border-slate-900 bg-white p-6 shadow-[5px_5px_0_#176b50] hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">🗺️</div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Smart Itinerary Generator</h4>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Hasilkan rencana perjalanan detail dari hari ke hari berdasarkan destinasi pilihan, jumlah hari, anggaran (*budget*), serta tipe aktivitas yang Anda sukai.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border-3 border-slate-900 bg-white p-6 shadow-[5px_5px_0_#176b50] hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">AI Travel Assistant</h4>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Tanyakan rekomendasi kuliner lokal, informasi transportasi, estimasi biaya, atau etiket budaya. Asisten virtual kami siap menjawab dengan Knowledge Base terverifikasi.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border-3 border-slate-900 bg-white p-6 shadow-[5px_5px_0_#176b50] hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">📚</div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Personal Trip History</h4>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Simpan semua rencana perjalanan yang telah dibuat ke akun Anda, tinjau kembali jadwal perjalanan, dan hapus trip yang tidak diperlukan kapan saja.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="border-3 border-slate-900 bg-white p-6 shadow-[5px_5px_0_#176b50] hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Modern & Responsive Design</h4>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Tampilan berestetika *Retro Brutalism* yang ramah pengguna, cepat diakses di perangkat seluler maupun desktop, serta bebas gangguan.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="mb-10 border-3 border-slate-900 bg-[#f4dc4d] p-6 sm:p-8 shadow-[6px_6px_0_#18221f]">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4 flex items-center gap-2">
          <span>🛠️</span> Arsitektur & Teknologi
        </h3>
        <p className="text-sm text-slate-900 font-sans leading-relaxed mb-6">
          KelanaAI dibangun menggunakan teknologi mutakhir standar industri untuk performa tinggi, keamanan, dan skalabilitas:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-bold text-xs uppercase tracking-wider">
          <div className="border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0_#18221f]">
            <div className="text-lg mb-1">⚛️</div>
            <span>Next.js 15 App Router</span>
          </div>

          <div className="border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0_#18221f]">
            <div className="text-lg mb-1">🐍</div>
            <span>Python FastAPI</span>
          </div>

          <div className="border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0_#18221f]">
            <div className="text-lg mb-1">🧠</div>
            <span>Google Gemini AI</span>
          </div>

          <div className="border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0_#18221f]">
            <div className="text-lg mb-1">🎨</div>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="border-4 border-slate-900 bg-[#176b50] p-6 sm:p-8 text-white text-center shadow-[6px_6px_0_#18221f]">
        <h3 className="text-2xl sm:text-3xl font-black mb-3">
          Siap Memulai Petualangan Anda? 🚀
        </h3>
        <p className="text-sm text-slate-100 font-sans mb-6 max-w-xl mx-auto">
          Rencanakan liburan impian Anda dalam hitungan detik bersama KelanaAI.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 px-6 py-3 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#18221f] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#18221f] transition-all no-underline"
          >
            <span>✨ Buat Itinerari Sekarang</span>
          </Link>

          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#18221f] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#18221f] transition-all no-underline"
          >
            <span>🤖 Tanya AI Assistant</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
