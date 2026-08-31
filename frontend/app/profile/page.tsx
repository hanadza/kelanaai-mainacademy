"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile, getToken, logout, UserProfile } from "@/services/authService";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    getProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat profil");
        setLoading(false);
        if (err.message?.includes("401")) {
          logout();
        }
      });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f1e9] text-[#18221f] flex flex-col justify-center items-center p-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#176b50] border-t-transparent"></div>
          <span className="text-[#176b50] font-medium">Memuat data profil...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#18221f] flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Navigation bar header */}
        <header className="flex items-center justify-between border-b border-[#d8d3c8] pb-4">
          <Link href="/trips" className="text-sm font-bold text-[#176b50] hover:underline flex items-center gap-1">
            ← Kembali ke Trips
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#176b50] shadow-[3px_3px_0_#176b50]">
              <span className="h-2 w-2 bg-emerald-500 border border-slate-900 shrink-0"></span>
              <span>Welcome back, {profile?.name} 👋</span>
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 border-2 border-slate-900 bg-red-100 hover:bg-red-200 text-red-950 px-2.5 py-1 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0_#f15b45] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f15b45] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#f15b45] transition-all duration-150 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          profile && (
            <div className="bg-white border border-[#d8d3c8] rounded-2xl shadow-xl p-8 space-y-8">
              {/* Profile Header Card */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#176b50] to-[#25a17a] flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h1 className="text-3xl font-serif font-bold text-[#18221f]">{profile.name}</h1>
                  <p className="text-sm text-gray-500 font-mono">{profile.email}</p>
                  <div className="pt-1">
                    <span className="inline-block bg-[#176b50]/10 text-[#176b50] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      KelanaAI Traveler
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#176b50]">
                    Total Trips Generated
                  </p>
                  <p className="text-4xl font-extrabold text-[#176b50] mt-1">{profile.total_trips}</p>
                  <p className="text-xs text-gray-500 mt-1">Perjalanan tersimpan di akun Anda</p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-xl text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Account Identity
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-2">ID User: #{profile.id}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Terautentikasi via JWT Secure Token
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/"
                  className="flex-1 text-center py-3 bg-[#176b50] hover:bg-[#12523d] text-white font-medium rounded-xl shadow transition"
                >
                  + Rencanakan Perjalanan Baru
                </Link>
                <Link
                  href="/trips"
                  className="flex-1 text-center py-3 bg-[#f4dc4d] hover:bg-[#ebd23f] text-slate-900 font-bold rounded-xl shadow border border-slate-900 transition"
                >
                  Lihat Riwayat Trips ({profile.total_trips})
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
