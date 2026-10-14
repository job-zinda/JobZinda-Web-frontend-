"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/endpoints";
import { compact } from "@/lib/format";
import { Page, RequireAuth } from "@/components/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type Range = "7days" | "1month" | "all";

export default function AnalyticsPage() {
  return (
    <RequireAuth>
      <Analytics />
    </RequireAuth>
  );
}

function Analytics() {
  const [range, setRange] = useState<Range>("7days");
  const q = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => userApi.analytics(range === "all" ? undefined : range),
  });
  const a = q.data;

  const tiles = [
    { icon: "group", label: "Total followers", value: a?.totalFollowers, tint: "bg-secondary-container text-primary" },
    { icon: "person_add", label: "New followers", value: a?.filteredFollowers ?? a?.followersGrowth, tint: "bg-emerald-100 text-emerald-700" },
    { icon: "person_remove", label: "Unfollows", value: a?.unFollowCount, tint: "bg-rose-100 text-rose-700" },
    { icon: "visibility", label: "Profile views", value: a?.totalProfileViews, tint: "bg-sky-100 text-sky-700" },
    { icon: "reviews", label: "Feedbacks", value: a?.totalFeedback ?? a?.totalRatings, tint: "bg-amber-100 text-amber-700" },
    { icon: "work", label: "Projects", value: a?.totalProjects, tint: "bg-tertiary-container text-on-tertiary-container" },
  ];

  return (
    <Page narrow title="Profile analytics" subtitle="How people are discovering you">
      <Tabs
        className="mb-6"
        value={range}
        onChange={setRange}
        options={[
          { value: "7days", label: "Last 7 days" },
          { value: "1month", label: "Last month" },
          { value: "all", label: "All time" },
        ]}
      />
      {q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.tint}`}>
                  <Icon name={t.icon} />
                </span>
                {q.isLoading ? (
                  <Skeleton className="mt-4 h-8 w-16" />
                ) : (
                  <p className="mt-4 text-3xl font-extrabold tabular-nums">{compact(t.value ?? 0)}</p>
                )}
                <p className="mt-0.5 text-xs font-semibold text-on-surface-variant">{t.label}</p>
              </div>
            ))}
          </div>
          {!!a?.averageRating && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
              <Icon name="star" filled className="text-3xl text-amber-500" />
              <div>
                <p className="text-xl font-extrabold">{a.averageRating.toFixed(1)} / 5</p>
                <p className="text-xs text-on-surface-variant">Average rating from {a.totalRatings ?? 0} reviews</p>
              </div>
            </div>
          )}
        </>
      )}
    </Page>
  );
}
