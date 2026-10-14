"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { socialApi } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { formatDate, profileUrl } from "@/lib/format";
import { Page, RequireAuth } from "@/components/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Spinner, PageSpinner } from "@/components/ui/spinner";

export default function ConnectionsPage() {
  return (
    <RequireAuth>
      <Connections />
    </RequireAuth>
  );
}

function Connections() {
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const [q, setQ] = useState("");
  const [searchTag, setSearchTag] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchTag(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const list = usePaged(["connections", tab, searchTag], (pageNumber) =>
    tab === "followers" ? socialApi.followers({ pageNumber, searchTag }) : socialApi.following({ pageNumber, searchTag }),
  );
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), !!list.hasNextPage);

  return (
    <Page narrow title="Connections">
      <div className="space-y-4">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "followers", label: "Followers" },
            { value: "following", label: "Following" },
          ]}
        />
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name"
            className="h-12 w-full rounded-2xl bg-surface-container-lowest pl-12 pr-4 text-sm shadow-sm outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {list.isLoading ? (
          <PageSpinner />
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={() => list.refetch()} />
        ) : list.items.length === 0 ? (
          <EmptyState icon="group" title={tab === "followers" ? "No followers yet" : "You're not following anyone yet"} />
        ) : (
          <ul className="divide-y divide-surface-container rounded-2xl bg-surface-container-lowest shadow-sm">
            {list.items.map((f) => {
              // followingDetails holds the *other* person in both lists.
              const person = f.followingDetails;
              const id = person?._id ?? (tab === "followers" ? f.followerId : f.followingId) ?? "";
              return (
                <li key={f._id}>
                  <Link href={profileUrl(id)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low">
                    <Avatar src={person?.profileImageUrl} name={person?.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{person?.name ?? "Member"}</p>
                      {f.followedOn && <p className="text-xs text-on-surface-variant">Since {formatDate(f.followedOn)}</p>}
                    </div>
                    <Icon name="chevron_right" className="text-outline" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={sentinel} />
        {list.isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
      </div>
    </Page>
  );
}
