"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTrip } from "@/services/tripService";

interface DeleteTripButtonProps {
  tripId: number;
  destination: string;
  redirectToTrips?: boolean;
  variant?: "icon" | "button";
}

export default function DeleteTripButton({
  tripId,
  destination,
  redirectToTrips = false,
  variant = "icon",
}: DeleteTripButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      await deleteTrip(tripId);
      setShowConfirm(false);
      if (redirectToTrips) {
        router.push("/trips");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete trip");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleOpenConfirm}
          disabled={loading}
          title={`Delete ${destination}`}
          className="delete-icon-btn flex h-10 w-10 shrink-0 items-center justify-center border-2 border-slate-900 bg-[#fffdf8] text-slate-700 shadow-[3px_3px_0_#f15b45] transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-[4px_4px_0_#f15b45] active:translate-x-0.5 active:translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenConfirm}
          disabled={loading}
          className="delete-text-btn inline-flex items-center gap-2 border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[4px_4px_0_#f15b45] transition-all hover:bg-[#fae255] active:translate-x-0.5 active:translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          DELETE TRIP
        </button>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          onClick={handleCancel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col gap-4 border-2 border-slate-900 bg-[#fffdf8] p-6 text-left shadow-[8px_8px_0_#f15b45] max-w-sm w-full"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
                !
              </span>
              <h4 className="text-xl font-bold text-slate-900">Delete Trip?</h4>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete your trip to <strong>{destination}</strong>? This action cannot be undone.
            </p>
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="border-2 border-slate-900 bg-[#f15b45] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_#18221f] hover:bg-red-600"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
