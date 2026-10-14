"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { contentApi, userApi } from "@/lib/api/endpoints";
import { getPosition } from "@/lib/hooks";
import { coordsOf, distanceKm } from "@/lib/geo";
import { Icon } from "@/components/ui/icon";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileCard, ProfileCardSkeleton } from "@/components/profile/profile-card";
import { PlaceSearch } from "@/components/map/place-search";

const NearbyMap = dynamic(() => import("@/components/map/nearby-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-container" />,
});

interface Filters {
  distanceInKm: number;
  gender: string;
  rating: string;
  projects: string;
  professionId: string;
}

const DEFAULT_FILTERS: Filters = { distanceInKm: 10, gender: "", rating: "", projects: "", professionId: "" };
const PROJECT_RANGES: Record<string, [number, number]> = { "1-5": [1, 5], "6-20": [6, 20], "21+": [21, 1000] };

export default function MapPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [locLabel, setLocLabel] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const categories = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories, staleTime: 600_000 });

  useEffect(() => {
    void getPosition().then((p) => {
      setCenter([p.lat, p.lng]);
      setLocLabel(p.fallback ? "India" : "Your location");
      if (p.fallback) setFilters((f) => ({ ...f, distanceInKm: 1500 }));
    });
  }, []);

  const range = PROJECT_RANGES[filters.projects];
  const nearby = useQuery({
    queryKey: ["nearby", isAuthenticated, center, filters],
    queryFn: () =>
      userApi.nearby(
        {
          lat: center![0],
          lng: center![1],
          distanceInKm: filters.distanceInKm,
          gender: filters.gender || undefined,
          rating: filters.rating ? Number(filters.rating) : undefined,
          handledProjectsCountFrom: range?.[0],
          handledProjectsCountTo: range?.[1] ?? 1000,
          professionId: filters.professionId || undefined,
        },
        !isAuthenticated,
      ),
    enabled: !!center && !isLoading,
  });

  const profiles = useMemo(() => nearby.data?.items ?? [], [nearby.data]);
  const activeFilters =
    Number(filters.distanceInKm !== DEFAULT_FILTERS.distanceInKm) + Number(!!filters.gender) + Number(!!filters.rating) + Number(!!filters.projects) + Number(!!filters.professionId);

  const distanceLabel = (id: string) => {
    const p = profiles.find((x) => x._id === id);
    const pos = p && coordsOf(p);
    if (!pos || !center) return undefined;
    const d = distanceKm(center, pos);
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  return (
    <div className="relative flex h-[calc(100dvh-4rem-4.5rem)] flex-col md:h-[calc(100dvh-4rem)] lg:flex-row">
      <div className="relative min-h-[45%] flex-1">
        {center ? (
          <NearbyMap
            center={center}
            radiusKm={Math.min(filters.distanceInKm, 200)}
            profiles={profiles}
            activeId={active}
            onSelect={(id) => {
              setActive(id);
              document.getElementById(`nearby-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-container text-sm text-on-surface-variant">
            Finding your location…
          </div>
        )}
        <div className="absolute inset-x-4 top-4 z-[500] flex gap-2">
          <PlaceSearch
            className="flex-1"
            onPick={(p) => {
              setCenter([p.lat, p.lng]);
              setLocLabel(p.label.split(",")[0]);
              if (filters.distanceInKm > 200) setFilters((f) => ({ ...f, distanceInKm: 25 }));
            }}
          />
          <button
            onClick={() =>
              void getPosition().then((p) => {
                setCenter([p.lat, p.lng]);
                setLocLabel(p.fallback ? "India" : "Your location");
              })
            }
            aria-label="Use my location"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/30"
          >
            <Icon name="my_location" />
          </button>
          <button
            onClick={() => {
              setDraft(filters);
              setFilterOpen(true);
            }}
            aria-label="Filters"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/30"
          >
            <Icon name="tune" />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      <aside className="custom-scrollbar flex max-h-[55%] flex-col overflow-y-auto rounded-t-3xl bg-background px-4 pb-6 pt-5 shadow-[0_-8px_24px_-12px_rgba(52,49,58,0.2)] lg:max-h-none lg:w-[400px] lg:rounded-none lg:shadow-none">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold">
            {nearby.isLoading ? "Searching…" : `${profiles.length} freelancer${profiles.length === 1 ? "" : "s"} available`}
          </h1>
          <p className="text-sm text-on-surface-variant">
            Within {filters.distanceInKm} km of {locLabel || "you"}
          </p>
        </div>
        <div className="space-y-3">
          {nearby.isLoading || !center ? (
            Array.from({ length: 4 }, (_, i) => <ProfileCardSkeleton key={i} />)
          ) : profiles.length === 0 ? (
            <EmptyState icon="location_off" title="No one nearby yet" description="Increase the distance or search another area." />
          ) : (
            profiles.map((p) => (
              <div
                key={p._id}
                id={`nearby-${p._id}`}
                onMouseEnter={() => setActive(p._id)}
                className={active === p._id ? "rounded-2xl ring-2 ring-primary" : undefined}
              >
                <ProfileCard profile={p} distance={distanceLabel(p._id)} />
              </div>
            ))
          )}
        </div>
      </aside>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter freelancers">
        <div className="space-y-5 p-6">
          <Field label={`Distance — ${draft.distanceInKm} km`}>
            <input
              type="range"
              min={1}
              max={500}
              value={Math.min(draft.distanceInKm, 500)}
              onChange={(e) => setDraft((d) => ({ ...d, distanceInKm: Number(e.target.value) }))}
              className="accent-primary"
            />
          </Field>
          <Field label="Role">
            <Select value={draft.professionId} onChange={(e) => setDraft((d) => ({ ...d, professionId: e.target.value }))}>
              <option value="">Any</option>
              {categories.data?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender">
              <Select value={draft.gender} onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value }))}>
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field label="Min. rating">
              <Select value={draft.rating} onChange={(e) => setDraft((d) => ({ ...d, rating: e.target.value }))}>
                <option value="">Any</option>
                {[4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r}★ &amp; up
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Projects handled">
            <Select value={draft.projects} onChange={(e) => setDraft((d) => ({ ...d, projects: e.target.value }))}>
              <option value="">Any</option>
              {Object.keys(PROJECT_RANGES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDraft(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setFilters(draft);
                setFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

