import type { Trip, TripRequest } from "@/types/trip";
import { getAuthHeaders } from "./authService";

// Read from .env (frontend/.env.local -> NEXT_PUBLIC_API_URL). Update ONE
// file when the backend URL changes - not every page (Session 7, Part 3).
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * GET /api/v1/trips
 * Used by the /trips dashboard - reads from PostgreSQL,
 * fast and free, no Bedrock call involved (Part 1: "two read paths").
 */
export async function getTrips(): Promise<Trip[]> {
  const res = await fetch(`${API_URL}/trips`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load trips (HTTP ${res.status}).`);
  }

  return res.json();
}

/**
 * GET /api/v1/trips/{id}
 * Used by the /trips/[id] detail page. Returns null on 404 so pages can
 * decide how to handle a missing trip (e.g. notFound()).
 */
export async function getTrip(id: number): Promise<Trip | null> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load trip ${id} (HTTP ${res.status}).`);
  }

  return res.json();
}

/**
 * POST /api/v1/trips
 * Generates a new trip with Bedrock recommendation and associates user_id from JWT.
 */
export async function generateTrip(data: TripRequest): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      body?.detail || `Failed to generate trip (HTTP ${res.status}).`
    );
  }

  return body;
}

/**
 * DELETE /api/v1/trips/{id}
 * Deletes a trip from PostgreSQL database.
 */
export async function deleteTrip(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.detail || `Failed to delete trip ${id} (HTTP ${res.status}).`
    );
  }

  return res.json();
}



