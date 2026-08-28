"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TripForm from "@/components/TripForm";
import { generateTrip } from "@/services/tripService";
import type { TripRequest } from "@/types/trip";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastPayload, setLastPayload] = useState<TripRequest | null>(null);

  async function handleGenerate(payload: TripRequest) {
    setLastPayload(payload);
    setLoading(true);
    setError("");

    try {
      await generateTrip(payload);
      router.push("/trips");
    } catch (requestError) {
      setLoading(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate the trip."
      );
    }
  }

  function handleRetry() {
    if (lastPayload) {
      handleGenerate(lastPayload);
    }
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full max-w-6xl flex-col justify-between px-4 py-4 sm:px-6 sm:py-6 lg:px-8 box-border">
      {/* Header */}
      <header className="intro mb-3 border-b-2 border-slate-900 pb-2.5 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow !mb-0.5 !text-[11px]">AI travel planner</p>
          <div className="flex items-center gap-2.5">
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-[#f4dc4d] px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_#176b50] transition-all hover:bg-[#fae255] active:translate-x-0.5 active:translate-y-0.5 no-underline"
            >
              <span>MY TRIPS</span>
              <span aria-hidden="true">→</span>
            </Link>
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
              Beta
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mt-0.5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tight">
            Kelana<span>AI</span>
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Plan your next adventure with a personalized itinerary.
          </p>
        </div>
      </header>

      {/* Error notification if any */}
      {error && (
        <div className="mb-2 flex items-center justify-between border-2 border-red-500 bg-red-50 p-2.5 text-xs text-red-800 shadow-[3px_3px_0_#f15b45] shrink-0">
          <div>
            <strong>Error: </strong> {error}
          </div>
          <button
            onClick={handleRetry}
            className="ml-3 border border-red-800 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Grid (Hero Image + Form) */}
      <div className="content-grid mb-2 flex-1 min-h-0 items-stretch gap-4">
        <div className="hero-image relative h-full min-h-[220px] overflow-hidden border-2 border-slate-900 bg-slate-200 shadow-[6px_6px_0_#176b50]">
          <Image
            src="/petadunia.webp"
            alt="A globe representing worldwide travel"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover p-8"
          />
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/75 p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-300">
              Your next chapter
            </p>
            <p className="mt-0.5 max-w-md text-base sm:text-lg lg:text-xl font-bold leading-tight">
              Go somewhere that gives you a story to tell.
            </p>
          </div>
        </div>

        <TripForm onGenerate={handleGenerate} loading={loading} />
      </div>

      {/* Loading Modal / Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="flex flex-col items-center gap-4 border-2 border-slate-900 bg-[#fffdf8] p-8 text-center shadow-[10px_10px_0_#176b50] max-w-md w-full">
            <div className="loading-spinner" />
            <h3 className="text-2xl font-black text-slate-900">Crafting Your Journey...</h3>
            <p className="text-sm text-slate-600">
              Generating your personalized AI itinerary and saving it to your trips.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer mt-auto shrink-0 flex flex-col gap-2 border-t-2 border-slate-900 pt-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>
          KelanaAI <span>·</span> AI-powered travel planning
        </span>
        <nav className="flex gap-4">
          <Link href="/trips">My Trips</Link>
          <a href="mailto:hello@kelana.ai">Contact</a>
        </nav>
        <span>&copy; 2026 KelanaAI</span>
      </footer>
    </main>
  );
}
