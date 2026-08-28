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

  const totalPages = Math.ceil(trips.length / itemsPerPage);
  // Ensure current page stays within valid bounds (especially after deletions)
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, trips.length);
  const currentTrips = trips.slice(startIndex, endIndex);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Trip List Grid */}
      <div className="trip-grid flex flex-col gap-4">
        {currentTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {/* Pagination Controls - only shown when items exceed itemsPerPage */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t-2 border-slate-900 pt-6 sm:flex-row">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Showing <span className="text-slate-900 font-bold">{startIndex + 1}</span> to{" "}
            <span className="text-slate-900 font-bold">{endIndex}</span> of{" "}
            <span className="text-slate-900 font-bold">{trips.length}</span> trips
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
