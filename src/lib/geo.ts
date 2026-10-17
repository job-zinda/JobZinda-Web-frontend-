// Location search via OpenStreetMap Nominatim (replaces the Flutter app's
// hard-coded Google Places key). Keep requests user-initiated and debounced
// per Nominatim's usage policy.

import type { Profile } from "./types";

export function coordsOf(p: Profile): [number, number] | null {
  const c = p.location?.coordinates;
  if (c && c.length === 2 && (c[0] || c[1])) return [c[1], c[0]]; // GeoJSON is [lng, lat]
  if (p.lat && p.lng) return [p.lat, p.lng];
  return null;
}

export interface Place {
  label: string;
  lat: number;
  lng: number;
  state?: string;
  district?: string;
  zipcode?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

function toPlace(r: NominatimResult): Place {
  const a = r.address ?? {};
  return {
    label: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    state: a.state,
    district: a.state_district || a.county || a.city_district || a.city,
    zipcode: a.postcode,
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  if (query.trim().length < 3) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("limit", "6");
  url.searchParams.set("q", query);
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  return ((await res.json()) as NominatimResult[]).map(toPlace);
}

export async function reversePlace(lat: number, lng: number): Promise<Place | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  const res = await fetch(url, { headers: { "Accept-Language": "en" } }).catch(() => null);
  if (!res?.ok) return null;
  return toPlace((await res.json()) as NominatimResult);
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Great-circle distance in km. */
export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
