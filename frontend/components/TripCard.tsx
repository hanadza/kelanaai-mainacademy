import Link from "next/link";
import type { Trip } from "@/types/trip";
import DeleteTripButton from "@/components/DeleteTripButton";
import { getDestinationFlag, formatBudget } from "@/lib/destinationHelpers";

// Color-coded styling for budget categories
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  backpacker: {
    bg: "bg-amber-100",
    text: "text-amber-900",
    border: "border-amber-300",
  },
  standart: {
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300",
  },
  standard: {
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300",
  },
  luxury: {
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-300",
  },
};

// Color-coded styling for travel styles
const TRAVEL_STYLE_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  family: {
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-300",
    icon: "👨‍👩‍👧‍👦",
  },
  solo: {
    bg: "bg-teal-100",
    text: "text-teal-900",
    border: "border-teal-300",
    icon: "🎒",
  },
  couple: {
    bg: "bg-rose-100",
    text: "text-rose-900",
    border: "border-rose-300",
    icon: "💑",
  },
  adventure: {
    bg: "bg-orange-100",
    text: "text-orange-900",
    border: "border-orange-300",
    icon: "🧗",
  },
  cultural: {
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    border: "border-indigo-300",
    icon: "🏛️",
  },
  relaxing: {
    bg: "bg-cyan-100",
    text: "text-cyan-900",
    border: "border-cyan-300",
    icon: "🏖️",
  },
};

export default function TripCard({ trip }: { trip: Trip }) {
  const categoryKey = trip.category?.toLowerCase() ?? "standard";
  const catStyle = CATEGORY_STYLES[categoryKey] ?? {
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300",
  };

  const styleKey = trip.travel_style?.toLowerCase() ?? "";
  const travelStyleConfig = TRAVEL_STYLE_STYLES[styleKey] ?? {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
    icon: "🏷️",
  };

  const flag = getDestinationFlag(trip.destination);
  const formattedBudget = formatBudget(trip.budget);

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/trips/${trip.id}`}
        className="group relative flex flex-1 min-w-0 flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-slate-900 bg-[#fffdf8] p-5 shadow-[6px_6px_0_rgba(23,107,80,0.15)] transition-all hover:shadow-[8px_8px_0_#176b50] hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Destination Flag / Icon avatar */}
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border-2 border-slate-900 bg-[#f4f1e9] text-2xl shadow-[2px_2px_0_#18221f]"
            aria-hidden="true"
          >
            {flag}
          </span>

          <div className="min-w-0 flex-1">
            {/* Title with Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-xl font-bold text-slate-900 truncate">
                {trip.destination}
              </h3>

              {/* Category Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              >
                {trip.category}
              </span>

              {/* Travel Style Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold tracking-wide border ${travelStyleConfig.bg} ${travelStyleConfig.text} ${travelStyleConfig.border}`}
              >
                <span className="text-xs">{travelStyleConfig.icon}</span>
                <span>{trip.travel_style}</span>
              </span>
            </div>

            {/* Metadata (Duration, Budget, Season/Month) */}
            <p className="text-xs sm:text-sm font-medium text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📅 {trip.days} Days</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-900">💰 {formattedBudget}</span>
              {trip.month && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>🗓️ {trip.month}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <span className="inline-flex shrink-0 self-start sm:self-center items-center gap-1.5 border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0_#18221f] transition-colors group-hover:bg-[#fae255]">
          View Details <span aria-hidden="true">→</span>
        </span>
      </Link>

      {/* Delete Button */}
      <DeleteTripButton
        tripId={trip.id}
        destination={trip.destination}
        variant="icon"
      />
    </div>
  );
}
