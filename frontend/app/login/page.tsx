"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
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
      await login(email, password);
      router.push("/trips");
    } catch (err: any) {
      setError(err.message || "Email atau password yang Anda masukkan salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#18221f] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#d8d3c8] rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#176b50]/10 text-[#176b50] font-bold text-xl mb-2">
            ✈️
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#176b50]">KelanaAI</h1>
          <p className="text-sm text-gray-600">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
        </div>

        {error && (
          <div className="bg-[#f15b45]/10 border border-[#f15b45]/30 text-[#f15b45] text-sm p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <span>Masuk Ke Dashboard</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#176b50] font-semibold hover:underline">
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </main>
  );
}
