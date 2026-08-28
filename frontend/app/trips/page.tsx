import Link from "next/link";
import TripListWithPagination from "@/components/TripListWithPagination";
import { getTrips } from "@/services/tripService";

export const metadata = {
  title: "Trip History · KelanaAI",
};

// A Server Component: it runs on the Next.js server, calls getTrips()
// directly (no useState/useEffect needed), and streams the finished HTML
// to the browser. This is a "browse" read - PostgreSQL only, no Bedrock.
export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="trips-header">
        <div>
          <p className="eyebrow">My trips</p>
          <h1 className="trips-title">Trip History</h1>
          <p className="trips-subtitle">
            {trips.length} saved itinerar{trips.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-[#f4dc4d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[4px_4px_0_#176b50] transition-all hover:bg-[#fae255] active:translate-x-0.5 active:translate-y-0.5 no-underline"
        >
          <span aria-hidden="true">+</span> NEW TRIP
        </Link>
      </header>

      <TripListWithPagination trips={trips} itemsPerPage={10} />
    </main>
  );
}
