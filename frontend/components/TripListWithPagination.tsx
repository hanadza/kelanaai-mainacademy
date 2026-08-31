"use client";

import { useState } from "react";
import type { Trip } from "@/types/trip";
import TripCard from "@/components/TripCard";
import EmptyState from "@/components/EmptyState";

interface TripListWithPaginationProps {
  trips: Trip[];
  itemsPerPage?: number;
}

export default function TripListWithPagination({
  trips,
  itemsPerPage = 10,
}: TripListWithPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  if (trips.length === 0) {
    return (
      <EmptyState
        icon="✈"
        title="No trips found."
        message="Create your first itinerary."
        actionLabel="Generate a Trip"
        actionHref="/"
      />
    );
  }

  // Filter trips by destination keyword (case-insensitive)
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredTrips = trimmedQuery
    ? trips.filter((trip) => trip.destination.toLowerCase().includes(trimmedQuery))
    : trips;

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  // Ensure current page stays within valid bounds
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTrips.length);
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Retro Search Bar for Destination Filtering */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#fffdf8] border-2 border-slate-900 p-3 shadow-[4px_4px_0_#176b50]">
        <div className="flex-1 flex items-center gap-2.5 bg-white border border-slate-300 px-3 py-2 focus-within:ring-2 focus-within:ring-[#176b50] transition">
          <span className="text-base select-none shrink-0" aria-hidden="true">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari destinasi trip (misal: Japan, Bali, Italy)..."
            className="w-full bg-transparent text-sm text-[#18221f] font-medium placeholder:text-slate-400 focus:outline-none border-none p-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-800 shrink-0 cursor-pointer p-0.5"
              title="Clear Search"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="text-xs font-bold text-[#176b50] bg-emerald-50 border border-emerald-300 px-3 py-2 text-center sm:text-left shrink-0">
            {filteredTrips.length} trip ditemukan
          </div>
        )}
      </div>

      {/* No Search Results Fallback */}
      {filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-900 shadow-[4px_4px_0_#176b50] text-center space-y-3 my-2">
          <span className="text-3xl select-none">🔍</span>
          <h3 className="text-lg font-bold text-slate-900">Destinasi &quot;{searchQuery}&quot; tidak ditemukan</h3>
          <p className="text-xs text-slate-600">Tidak ada riwayat perjalanan dengan nama destinasi tersebut.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-slate-900 bg-[#f4dc4d] hover:bg-[#fae255] text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#176b50] cursor-pointer"
          >
            Tampilkan Semua Trip
          </button>
        </div>
      ) : (
        /* Trip List Grid */
        <div className="trip-grid flex flex-col gap-4">
          {currentTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {/* Pagination Controls - only shown when items exceed itemsPerPage */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t-2 border-slate-900 pt-6 sm:flex-row">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Showing <span className="text-slate-900 font-bold">{startIndex + 1}</span> to{" "}
            <span className="text-slate-900 font-bold">{endIndex}</span> of{" "}
            <span className="text-slate-900 font-bold">{filteredTrips.length}</span> trips
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="flex h-9 items-center justify-center border-2 border-slate-900 bg-[#fffdf8] px-3 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#18221f] transition-all hover:bg-yellow-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = page === safeCurrentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`flex h-9 w-9 items-center justify-center border-2 border-slate-900 text-xs font-bold transition-all shadow-[2px_2px_0_#18221f] ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-[#fffdf8] text-slate-900 hover:bg-yellow-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="flex h-9 items-center justify-center border-2 border-slate-900 bg-[#fffdf8] px-3 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#18221f] transition-all hover:bg-yellow-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
