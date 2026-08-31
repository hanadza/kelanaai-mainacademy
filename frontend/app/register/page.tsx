"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, login } from "@/services/authService";

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
      router.push("/trips");
    } catch (err: any) {
      setError(err.message || "Gagal melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#18221f] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#d8d3c8] rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#176b50]/10 text-[#176b50] font-bold text-xl mb-2">
            ✨
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#176b50]">Daftar KelanaAI</h1>
          <p className="text-sm text-gray-600">Buat akun untuk merencanakan perjalanan AI Anda.</p>
        </div>

        {error && (
          <div className="bg-[#f15b45]/10 border border-[#f15b45]/30 text-[#f15b45] text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

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

            {/* Indikator Kekuatan Password & Rekomendasi */}
            {password.length > 0 && (() => {
              const hasLower = /[a-z]/.test(password);
              const hasUpper = /[A-Z]/.test(password);
              const hasNumber = /[0-9]/.test(password);
              const hasSymbol = /[^A-Za-z0-9]/.test(password);
              const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

              let strengthLabel = "Lemah";
              let strengthColor = "bg-red-500";
              let strengthTextColor = "text-red-600";
              let strengthWidth = "w-1/3";

              if (score >= 4 && password.length >= 8) {
                strengthLabel = "Kuat";
                strengthColor = "bg-emerald-500";
                strengthTextColor = "text-emerald-600";
                strengthWidth = "w-full";
              } else if (score >= 2) {
                strengthLabel = "Sedang";
                strengthColor = "bg-amber-500";
                strengthTextColor = "text-amber-600";
                strengthWidth = "w-2/3";
              }

              return (
                <div className="mt-2.5 space-y-2 bg-slate-50/90 p-3 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-500">Kekuatan Password:</span>
                    <span className={`font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300 rounded-full`} />
                  </div>

                  {/* Recommendations Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                      <span>{hasLower ? "✓" : "•"}</span>
                      <span>Huruf kecil (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                      <span>{hasUpper ? "✓" : "•"}</span>
                      <span>Huruf besar (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                      <span>{hasNumber ? "✓" : "•"}</span>
                      <span>Angka (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                      <span>{hasSymbol ? "✓" : "•"}</span>
                      <span>Simbol (@#$...)</span>
                    </div>
                  </div>
                </div>
              );
            })()}
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
