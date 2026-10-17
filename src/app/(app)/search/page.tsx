"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { contentApi, userApi } from "@/lib/api/endpoints";
import { useDebounced, usePaged, useInView } from "@/lib/hooks";
import { Page } from "@/components/app-shell";
import { Chips } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ProfileCard, ProfileCardSkeleton } from "@/components/profile/profile-card";

export default function SearchPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [q, setQ] = useState("");
  const [professionId, setProfessionId] = useState("all");
  const searchTag = useDebounced(q.trim());
  const categories = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories, staleTime: 600_000 });

  const results = usePaged(
    ["people", isAuthenticated, searchTag, professionId],
    (pageNumber) =>
      userApi.search(
        { pageNumber, searchTag, professionId: professionId === "all" ? undefined : professionId },
        !isAuthenticated,
      ),
    { enabled: !isLoading },
  );
  const sentinel = useInView<HTMLDivElement>(
    () => results.hasNextPage && !results.isFetchingNextPage && results.fetchNextPage(),
    !!results.hasNextPage,
  );

  return (
    <Page title="Search" subtitle="Find freelancers by name, role or skill">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “videographer”, “react, designer”…"
              className="h-14 w-full rounded-2xl bg-surface-container-lowest pl-12 pr-12 text-[15px] shadow-sm outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <Icon name="close" />
              </button>
            )}
          </div>
          {!!categories.data?.length && (
            <Chips
              value={professionId}
              onChange={setProfessionId}
              options={[{ value: "all", label: "All roles" }, ...categories.data.map((c) => ({ value: c._id, label: c.name }))]}
            />
          )}

          <div className="space-y-3">
            {results.isLoading || isLoading ? (
              Array.from({ length: 5 }, (_, i) => <ProfileCardSkeleton key={i} />)
            ) : results.isError ? (
              <ErrorState error={results.error} onRetry={() => results.refetch()} />
            ) : results.items.length === 0 ? (
              <EmptyState icon="person_search" title="No freelancers found" description="Try a different name, role or skill." />
            ) : (
              results.items.map((p) => <ProfileCard key={p._id} profile={p} />)
            )}
            <div ref={sentinel} />
            {results.isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Link href="/map" className="group relative block overflow-hidden rounded-3xl">
            <img src="/images/search_freelancer.jpg" alt="" className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
              <p className="text-lg font-extrabold">Freelancers near you</p>
              <p className="text-sm text-white/80">Explore on the map</p>
            </div>
          </Link>
          <Link href="/jobs" className="group relative block overflow-hidden rounded-3xl">
            <img src="/images/looking_for_job.jpg" alt="" className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
              <p className="text-lg font-extrabold">Looking for job / employer</p>
              <p className="text-sm text-white/80">Submit your requirement — we&apos;ll connect you</p>
            </div>
          </Link>
          <img src="/images/career_growth_banner.jpg" alt="Grow your career with Job Zinda" className="w-full rounded-3xl" />
        </aside>
      </div>
    </Page>
  );
}
