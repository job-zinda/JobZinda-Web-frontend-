"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { contentApi, userApi } from "@/lib/api/endpoints";
import { getPosition, useDebounced } from "@/lib/hooks";
import { coordsOf, distanceKm, formatDistance, type Place } from "@/lib/geo";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
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

const DISTANCES = [10, 20, 30];
const DEFAULT_FILTERS: Filters = { distanceInKm: 10, gender: "", rating: "", projects: "", professionId: "" };
const PROJECT_RANGES: Record<string, [number, number]> = { "1-5": [1, 5], "6-20": [6, 20], "21+": [21, 1000] };
const LOCAL_MAX_KM = 200;

export default function MapPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [locLabel, setLocLabel] = useState("");
  const [query, setQuery] = useState("");
  const searchTag = useDebounced(query.trim(), 400);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const categories = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories, staleTime: 600_000 });

  const applyPosition = useCallback((p: Awaited<ReturnType<typeof getPosition>>) => {
    setCenter([p.lat, p.lng]);
    setLocLabel(p.fallback ? "India" : "Your location");
    // Without a real position we centre on India, so search the whole country.
    setFilters((f) => ({
      ...f,
      distanceInKm: p.fallback ? 1500 : f.distanceInKm > LOCAL_MAX_KM ? DEFAULT_FILTERS.distanceInKm : f.distanceInKm,
    }));
  }, []);

  useEffect(() => {
    void getPosition().then(applyPosition);
  }, [applyPosition]);

  const pickPlace = (p: Place) => {
    setCenter([p.lat, p.lng]);
    setLocLabel(p.label.split(",")[0]);
    if (filters.distanceInKm > LOCAL_MAX_KM) setFilters((f) => ({ ...f, distanceInKm: DEFAULT_FILTERS.distanceInKm }));
    setLocationOpen(false);
  };

  const range = PROJECT_RANGES[filters.projects];
  const nearby = useQuery({
    queryKey: ["nearby", isAuthenticated, center, filters, searchTag],
    queryFn: () =>
      userApi.nearby(
        {
          lat: center![0],
          lng: center![1],
          distanceInKm: filters.distanceInKm,
          searchTag: searchTag || undefined,
          gender: filters.gender || undefined,
          rating: filters.rating ? Number(filters.rating) : undefined,
          handledProjectsCountFrom: range?.[0],
          handledProjectsCountTo: range?.[1] ?? 1000,
          professionId: filters.professionId || undefined,
        },
        !isAuthenticated,
      ),
    enabled: !!center && !isLoading,
    placeholderData: keepPreviousData,
  });

  const profiles = useMemo(() => nearby.data?.items ?? [], [nearby.data]);
  const searching = nearby.isLoading || !center;
  const countLabel = searching
    ? "Searching…"
    : `${profiles.length} freelancer${profiles.length === 1 ? "" : "s"} available`;
  const activeFilters =
    Number(!DISTANCES.includes(filters.distanceInKm)) + Number(!!filters.gender) + Number(!!filters.rating) + Number(!!filters.projects) + Number(!!filters.professionId);

  const distanceOf = (p: Profile) => {
    const pos = coordsOf(p);
    return pos && center ? formatDistance(distanceKm(center, pos)) : undefined;
  };

  return (
    // `isolate` keeps Leaflet's pane z-indexes (400+) below dialogs and the app shell.
    <div className="relative isolate h-[calc(100dvh-4rem-4.5rem)] overflow-hidden md:h-[calc(100dvh-4rem)]">
      {center ? (
        <NearbyMap center={center} radiusKm={Math.min(filters.distanceInKm, LOCAL_MAX_KM)} profiles={profiles} activeId={active} />
      ) : (
        <div className="flex h-full items-center justify-center bg-surface-container text-sm text-on-surface-variant">
          Finding your location…
        </div>
      )}

      {/* Header + distance selector, as in the mobile app */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500]">
        <div className="pointer-events-auto rounded-b-[22px] bg-gradient-to-b from-primary to-primary-dim pb-3.5 pt-3 shadow-[0_4px_10px_rgba(114,48,230,0.2)]">
          <div className="mx-auto flex max-w-3xl gap-2.5 px-3.5">
            <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-container-lowest pl-3 pr-3.5 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              <Icon name="person" filled className="text-2xl text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people, skills, profession…"
                aria-label="Search people, skills, profession"
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:font-normal placeholder:text-on-surface-variant/70"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="rounded-full p-0.5 text-on-surface-variant hover:bg-surface-container"
                >
                  <Icon name="close" className="text-lg" />
                </button>
              )}
              <Icon name="search" className="text-[22px] text-on-surface-variant" />
            </label>
            <button
              onClick={() => setLocationOpen(true)}
              aria-label="Change location"
              title={locLabel || "Change location"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-transform active:scale-95"
            >
              <Icon name="location_on" filled className="text-[26px] text-[#e53935]" />
            </button>
          </div>
        </div>

        <div className="mx-auto mt-2.5 flex max-w-3xl gap-2 px-3.5">
          <div
            role="group"
            aria-label="Distance"
            className="pointer-events-auto flex h-[38px] flex-1 rounded-full bg-surface-container-lowest p-0.5 shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
          >
            {DISTANCES.map((d, i) => {
              const on = filters.distanceInKm === d;
              const divider = i > 0 && !on && filters.distanceInKm !== DISTANCES[i - 1];
              return (
                <button
                  key={d}
                  onClick={() => setFilters((f) => ({ ...f, distanceInKm: d }))}
                  aria-pressed={on}
                  className={cn(
                    "relative flex-1 rounded-full text-[13px] transition-colors",
                    on
                      ? "bg-primary font-bold text-white shadow-[0_2px_6px_rgba(114,48,230,0.35)]"
                      : "font-medium text-on-surface-variant hover:text-primary",
                    divider && "before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-outline-variant/50",
                  )}
                >
                  {d}Km
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              setDraft(filters);
              setFilterOpen(true);
            }}
            aria-label="Filters"
            className="pointer-events-auto relative flex h-[38px] w-11 shrink-0 items-center justify-center rounded-[14px] bg-surface-container-lowest text-primary shadow-[0_2px_4px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
          >
            <Icon name="tune" className="text-xl" />
            {activeFilters > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      {!listOpen && (
        <button
          onClick={() => setListOpen(true)}
          className="absolute bottom-6 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-surface-container-lowest py-2.5 pl-4 pr-3 text-sm font-bold text-on-surface shadow-[0_8px_24px_-6px_rgba(52,49,58,0.35)] ring-1 ring-black/5 transition-colors hover:text-primary"
        >
          {nearby.isFetching ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Icon name="format_list_bulleted" className="text-lg text-primary" />
          )}
          {countLabel}
          <Icon name="expand_less" className="text-lg text-on-surface-variant" />
        </button>
      )}

      {listOpen && (
        <aside className="absolute inset-x-0 bottom-0 z-[600] flex max-h-[70%] flex-col rounded-t-3xl bg-background shadow-[0_-8px_24px_-12px_rgba(52,49,58,0.3)] lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-36 lg:max-h-none lg:w-[380px] lg:rounded-3xl lg:shadow-xl">
          <div className="flex items-start gap-3 px-5 pb-3 pt-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-on-surface-variant">Showing total results</p>
              <h2 className="text-lg font-extrabold">{countLabel}</h2>
              <p className="truncate text-xs text-on-surface-variant">
                Within {filters.distanceInKm} km of {locLabel || "you"}
              </p>
            </div>
            <button
              onClick={() => setListOpen(false)}
              aria-label="Close list"
              className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-5">
            {searching ? (
              Array.from({ length: 4 }, (_, i) => <ProfileCardSkeleton key={i} />)
            ) : profiles.length === 0 ? (
              <EmptyState icon="location_off" title="No one nearby yet" description="Increase the distance or search another area." />
            ) : (
              profiles.map((p) => (
                <div key={p._id} onMouseEnter={() => setActive(p._id)} onMouseLeave={() => setActive(null)}>
                  <ProfileCard profile={p} distance={distanceOf(p)} />
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      <Dialog open={locationOpen} onClose={() => setLocationOpen(false)} title="Choose location">
        <div className="min-h-[25rem] space-y-2 p-6">
          <PlaceSearch onPick={pickPlace} />
          <button
            onClick={() => {
              void getPosition().then(applyPosition);
              setLocationOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-primary/5"
          >
            <Icon name="my_location" />
            Use my current location
          </button>
        </div>
      </Dialog>

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
