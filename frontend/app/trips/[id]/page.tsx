"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Recommendation from "@/components/Recommendation";
import DeleteTripButton from "@/components/DeleteTripButton";
import { getDestinationImage } from "@/lib/destinationImage";
import { getDestinationFlag, formatBudget } from "@/lib/destinationHelpers";
import { getTrip } from "@/services/tripService";
import { getToken, logout } from "@/services/authService";
import type { Trip } from "@/types/trip";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const tripId = Number(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (Number.isNaN(tripId)) {
      setError("ID Trip tidak valid");
      setLoading(false);
      return;
    }

    getTrip(tripId)
      .then((data) => {
        if (!data) {
          setError("Trip tidak ditemukan.");
        } else {
          setTrip(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Gagal memuat rincian trip.";
        if (msg.includes("401")) {
          logout();
        } else {
          setError(msg);
        }
        setLoading(false);
      });
  }, [tripId, router]);

  if (loading) {
    return (
      <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-[#18221f]">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#176b50] border-t-transparent"></div>
          <span className="text-[#176b50] font-medium">Memuat rekomendasi trip AI...</span>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8">
        <div className="mb-6">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_#176b50] no-underline"
          >
            ← BACK TO TRIPS
          </Link>
        </div>
        <div className="bg-red-50 border-2 border-red-500 p-6 text-red-900 shadow-[4px_4px_0_#f15b45] rounded-xl text-center">
          <h3 className="text-lg font-bold">Gagal Memuat Trip</h3>
          <p className="text-xs text-red-700 mt-1">{error || "Trip tidak ditemukan."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Back and Action Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[4px_4px_0_#176b50] transition-all hover:bg-[#fae255] active:translate-x-0.5 active:translate-y-0.5 no-underline"
        >
          <span aria-hidden="true">←</span> BACK TO TRIPS
        </Link>
        <DeleteTripButton
          tripId={trip.id}
          destination={trip.destination}
          redirectToTrips={true}
          variant="button"
        />
      </div>

      <div className="trip-result border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0_#176b50] rounded-xl">
        <div className="destination-image relative h-40 overflow-hidden sm:h-52 rounded-lg border-2 border-slate-900 mb-4">
          <Image
            src={getDestinationImage(trip.destination)}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover"
            alt={`Travel view for ${trip.destination}`}
            unoptimized
          />
        </div>

        <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-slate-900 mb-4">
          <span>{getDestinationFlag(trip.destination)}</span>
          <span>{trip.destination}</span>
        </h2>

        {/* Trip Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border-2 border-slate-900 p-4 rounded-xl mb-6 shadow-[3px_3px_0_#176b50]">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Budget</span>
            <strong className="text-sm sm:text-base font-extrabold text-[#176b50]">{formatBudget(trip.budget)}</strong>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</span>
            <strong className="text-sm font-extrabold text-slate-900">{trip.category}</strong>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Travel Style</span>
            <strong className="text-sm font-extrabold text-slate-900">{trip.travel_style}</strong>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</span>
            <strong className="text-sm font-extrabold text-slate-900">{trip.days} days ({trip.month})</strong>
          </div>
        </div>

        {/* AI Itinerary Recommendation */}
        <Recommendation content={trip.ai_recommendation || ""} />
      </div>
    </main>
  );
}
