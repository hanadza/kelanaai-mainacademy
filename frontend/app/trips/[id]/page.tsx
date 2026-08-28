import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Recommendation from "@/components/Recommendation";
import DeleteTripButton from "@/components/DeleteTripButton";
import { getDestinationImage } from "@/lib/destinationImage";
import { getDestinationFlag, formatBudget } from "@/lib/destinationHelpers";
import { getTrip } from "@/services/tripService";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

// The [id] folder name is a dynamic segment - Next.js reads it from the
// URL and passes it here as a prop. One template, many pages: /trips/1,
// /trips/2, /trips/100... all render through this same file (Part 5).
export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const tripId = Number(id);

  if (Number.isNaN(tripId)) {
    notFound();
  }

  const trip = await getTrip(tripId);

  if (!trip) {
    notFound();
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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

      <div className="trip-result">
        <div className="destination-image relative h-40 overflow-hidden sm:h-52">
          <Image
            src={getDestinationImage(trip.destination)}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover"
            alt={`Travel view for ${trip.destination}`}
            unoptimized
          />
        </div>

        <h2 className="flex items-center gap-3">
          <span>{getDestinationFlag(trip.destination)}</span>
          <span>{trip.destination}</span>
        </h2>

        <div className="detail-grid">
          <div>
            <span>Budget</span>
            <strong>{formatBudget(trip.budget)}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{trip.category}</strong>
          </div>
          <div>
            <span>Travel Style</span>
            <strong>{trip.travel_style}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{trip.days} days ({trip.month})</strong>
          </div>
        </div>

        {trip.ai_recommendation ? (
          <Recommendation content={trip.ai_recommendation} />
        ) : (
          <p className="no-recommendation">
            No AI recommendation saved for this trip yet.
          </p>
        )}
      </div>
    </main>
  );
}
