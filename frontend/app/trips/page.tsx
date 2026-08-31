"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TripListWithPagination from "@/components/TripListWithPagination";
import { getTrips } from "@/services/tripService";
import { getCurrentUser, logout, getToken, User } from "@/services/authService";
import type { Trip } from "@/types/trip";

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Fetch authenticated user's trips
    getTrips()
      .then((data) => {
        setTrips(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load trips");
        setLoading(false);
        if (err.message?.includes("401")) {
          logout();
        }
      });
  }, [router]);

  if (loading) {
    return (
      <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-[#18221f]">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#176b50] border-t-transparent"></div>
          <span className="text-[#176b50] font-medium">Memuat trip Anda...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header section with User badge & Logout (Part 8) */}
      <header className="trips-header flex flex-wrap items-center justify-between gap-4 border-b border-[#d8d3c8] pb-6 mb-6">
        <div>
          <p className="eyebrow text-xs uppercase tracking-widest text-[#176b50] font-bold">My trips only</p>
          <h1 className="trips-title text-3xl font-serif font-bold text-[#18221f]">Trip History</h1>
          <p className="trips-subtitle text-sm text-gray-600">
            {trips.length} saved itinerar{trips.length === 1 ? "y" : "ies"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#fffdf8] hover:bg-yellow-50 px-3 py-2 text-xs font-bold text-[#176b50] shadow-[3px_3px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#176b50] transition-all duration-150 no-underline"
              title="Lihat Profil"
            >
              <span className="h-2.5 w-2.5 bg-emerald-500 border border-slate-900 shrink-0"></span>
              <span>Welcome back, {user.name} 👋</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-red-100 hover:bg-red-200 text-red-950 px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0_#f15b45] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f15b45] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#f15b45] transition-all duration-150 cursor-pointer"
          >
            🚪 Logout
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_#176b50] hover:bg-[#fae255] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#176b50] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#176b50] transition-all duration-150 no-underline"
          >
            <span aria-hidden="true">+</span> NEW TRIP
          </Link>
        </div>
      </header>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : (
        <TripListWithPagination trips={trips} itemsPerPage={10} />
      )}
    </main>
  );
}
