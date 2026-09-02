"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, login, loginWithGoogle } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Register user
      await register(name, email, password);
      // 2. Auto-login after successful registration
      await login(email, password);
      router.push("/assistant");
    } catch (err: any) {
      setError(err.message || "Gagal melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const userEmail = email || `user.${Date.now().toString().slice(-5)}@gmail.com`;
      const userName = name || "Google Traveler";
      await loginWithGoogle(userName, userEmail);
      router.push("/assistant");
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar dengan akun Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#18221f] flex flex-col justify-center items-center p-4">
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176b50] hover:text-[#0f4333] hover:underline border-2 border-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-[3px_3px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#176b50] transition-all no-underline"
        >
          <span>← Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-[#d8d3c8] rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block no-underline group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#176b50]/10 text-[#176b50] font-bold text-xl mb-2 group-hover:scale-105 transition-transform">
              ✨
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#176b50] group-hover:underline">Daftar KelanaAI</h1>
          </Link>
          <p className="text-sm text-gray-600">Buat akun untuk merencanakan perjalanan & bertanya ke AI Assistant.</p>
        </div>

        {error && (
          <div className="bg-[#f15b45]/10 border border-[#f15b45]/30 text-[#f15b45] text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Google Register Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-2.5 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl shadow-[3px_3px_0_#176b50] flex items-center justify-center gap-3 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Daftar dengan Google</span>
        </button>

        <div className="flex items-center gap-3 my-2 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span>ATAU</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Nama Lengkap
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
              <span className="text-base select-none shrink-0" aria-hidden="true">👤</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice"
                className="w-full bg-transparent text-sm text-[#18221f] placeholder:text-gray-400 focus:outline-none border-none p-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
              <span className="text-base select-none shrink-0" aria-hidden="true">📧</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@email.com"
                className="w-full bg-transparent text-sm text-[#18221f] placeholder:text-gray-400 focus:outline-none border-none p-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
              <span className="text-base select-none shrink-0" aria-hidden="true">🔑</span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-[#18221f] placeholder:text-gray-400 focus:outline-none border-none p-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm select-none shrink-0 opacity-70 hover:opacity-100 transition cursor-pointer p-0.5"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 font-bold uppercase tracking-wider rounded-xl shadow-[4px_4px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#176b50] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#176b50] font-semibold hover:underline">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </main>
  );
}
