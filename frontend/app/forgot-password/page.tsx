"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  requestForgotPassword,
  verifyOTP,
  resetPassword,
} from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard Steps: 1 = Enter Email, 2 = Enter OTP, 3 = Enter New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Format email tidak valid (contoh: user@email.com).");
      return;
    }

    setLoading(true);

    try {
      const res = await requestForgotPassword(cleanEmail);
      if (res.otp) {
        setDemoOtp(res.otp);
      }
      setSuccessMsg(`Kode OTP 6-digit telah dikirimkan ke email ${cleanEmail}.`);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Gagal meminta kode OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError("Masukkan 6-digit kode OTP.");
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(email.trim().toLowerCase(), cleanOtp);
      setSuccessMsg("Kode OTP terverifikasi! Silakan buat password baru.");
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Kode OTP salah atau telah kadaluarsa.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      setSuccessMsg("Password Anda berhasil diperbarui!");
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Gagal menyetel ulang password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#18221f] flex flex-col justify-center items-center p-4">
      {/* Back Link */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176b50] hover:text-[#0f4333] hover:underline border-2 border-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-[3px_3px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#176b50] transition-all no-underline"
        >
          <span>← Kembali ke Login</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-[#d8d3c8] rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block no-underline group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#176b50]/10 text-[#176b50] font-bold text-xl mb-2 group-hover:scale-105 transition-transform">
              🔐
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#176b50] group-hover:underline">
              Reset Password
            </h1>
          </Link>
          <p className="text-sm text-gray-600">
            {step === 1 && "Masukkan email terdaftar Anda untuk menerima kode OTP."}
            {step === 2 && "Masukkan 6-digit kode OTP yang telah dikirim ke email Anda."}
            {step === 3 && "Buat password baru yang aman untuk akun Anda."}
            {step === 4 && "Password berhasil diperbarui! Silakan masuk kembali."}
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className={`h-2.5 flex-1 rounded-full ${step >= 1 ? "bg-[#176b50]" : "bg-gray-200"}`} />
            <div className={`h-2.5 flex-1 rounded-full ${step >= 2 ? "bg-[#176b50]" : "bg-gray-200"}`} />
            <div className={`h-2.5 flex-1 rounded-full ${step >= 3 ? "bg-[#176b50]" : "bg-gray-200"}`} />
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-[#f15b45]/10 border border-[#f15b45]/30 text-[#f15b45] text-sm p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && step !== 4 && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-lg text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Email Address Terdaftar
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
                <span className="text-base select-none shrink-0" aria-hidden="true">📧</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="w-full bg-transparent text-sm text-[#18221f] placeholder:text-gray-400 focus:outline-none border-none p-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 font-bold uppercase tracking-wider rounded-xl shadow-[4px_4px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#176b50] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <span>Mengirim Kode OTP...</span> : <span>Kirim Kode OTP →</span>}
            </button>
          </form>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            {demoOtp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-center text-xs space-y-1">
                <p className="font-bold">🔑 Kode OTP Pengujian (Dev Mode):</p>
                <p className="text-lg font-mono font-extrabold tracking-widest text-[#176b50]">{demoOtp}</p>
                <p className="text-[11px] text-gray-500">Salin kode 6-digit di atas untuk verifikasi cepat.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Kode OTP 6-Digit
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
                <span className="text-base select-none shrink-0" aria-hidden="true">🔢</span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full bg-transparent text-lg font-mono tracking-widest font-bold text-[#18221f] placeholder:text-gray-300 focus:outline-none border-none p-0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setError(null); setStep(1); }}
                className="w-1/3 py-3 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                ← Ulangi
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 font-bold uppercase tracking-wider rounded-xl shadow-[3px_3px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#176b50] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {loading ? <span>Memeriksa...</span> : <span>Verifikasi Kode OTP →</span>}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ENTER NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Password Baru
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
                <span className="text-base select-none shrink-0" aria-hidden="true">🔑</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-[#18221f] placeholder:text-gray-400 focus:outline-none border-none p-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm select-none shrink-0 opacity-70 hover:opacity-100 transition cursor-pointer p-0.5"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (() => {
                let score = 0;
                if (newPassword.length >= 6) score += 1;
                if (newPassword.length >= 8) score += 1;
                if (/[0-9]/.test(newPassword)) score += 1;
                if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 1;
                if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

                let label = "Lemah 🔴";
                let color = "text-red-600 bg-red-50 border-red-200";
                let barColor = "bg-red-500";
                let barWidth = "w-1/3";

                if (score >= 4) {
                  label = "Kuat 🟢";
                  color = "text-emerald-700 bg-emerald-50 border-emerald-200";
                  barColor = "bg-emerald-500";
                  barWidth = "w-full";
                } else if (score >= 2) {
                  label = "Sedang 🟡";
                  color = "text-amber-700 bg-amber-50 border-amber-200";
                  barColor = "bg-amber-500";
                  barWidth = "w-2/3";
                }

                return (
                  <div className="mt-2 space-y-1.5 bg-gray-50/80 p-2.5 rounded-xl border border-gray-200/60">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-500">Kekuatan Password:</span>
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${color}`}>
                        {label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} ${barWidth} transition-all duration-300 rounded-full`} />
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Konfirmasi Password Baru
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-[#d8d3c8] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#176b50] focus-within:bg-white transition">
                <span className="text-base select-none shrink-0" aria-hidden="true">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-[#18221f] placeholder:text-gray-400 focus:outline-none border-none p-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 font-bold uppercase tracking-wider rounded-xl shadow-[4px_4px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#176b50] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <span>Menyimpan Password...</span> : <span>Simpan Password Baru →</span>}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS STATE */}
        {step === 4 && (
          <div className="text-center space-y-5 py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl font-bold border-2 border-emerald-300">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Password Berhasil Diubah!</h2>
              <p className="text-xs text-gray-600">
                Password baru Anda telah disimpan. Silakan masuk kembali menggunakan akun Anda.
              </p>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-slate-900 font-bold uppercase tracking-wider rounded-xl shadow-[4px_4px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#176b50] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#176b50] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk Ke Akun Anda</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
