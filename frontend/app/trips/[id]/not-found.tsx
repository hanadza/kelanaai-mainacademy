import Link from "next/link";

export default function TripNotFound() {
  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-8 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-4xl font-black">Trip not found</h1>
      <p className="mt-4 max-w-md text-slate-600">
        This trip may have been deleted, or the link you followed is incorrect.
      </p>
      <Link href="/trips" className="trips-new-link mt-6">
        <span aria-hidden="true">←</span> Back to Trip History
      </Link>
    </main>
  );
}
