"use client";

import Link from "next/link";
import { use } from "react";
import { useAuth } from "@/lib/auth-context";
import { userApi } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { profileUrl, timeAgo } from "@/lib/format";
import { Page } from "@/components/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Spinner, PageSpinner } from "@/components/ui/spinner";

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const list = usePaged(
    ["feedbacks", id, isAuthenticated],
    (pageNumber) => userApi.feedbacks(id, { pageNumber }, !isAuthenticated),
    { enabled: !isLoading },
  );
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), !!list.hasNextPage);
  const avg = list.items.length ? list.items.reduce((s, f) => s + (f.rating || 0), 0) / list.items.length : 0;

  return (
    <Page
      narrow
      title="Reviews & feedback"
      subtitle={list.items.length ? `${avg.toFixed(1)} average from ${list.data?.pages[0]?.totalCount ?? list.items.length} reviews` : undefined}
      action={
        <Link href={profileUrl(id)} className="text-sm font-bold text-primary hover:underline">
          View profile
        </Link>
      }
    >
      {list.isLoading || isLoading ? (
        <PageSpinner />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : list.items.length === 0 ? (
        <EmptyState icon="reviews" title="No reviews yet" />
      ) : (
        <ul className="space-y-3">
          {list.items.map((f) => (
            <li key={f._id} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Link href={profileUrl(f.rater?._id ?? "")}>
                  <Avatar src={f.rater?.profileImageUrl} name={f.rater?.name} size="sm" />
                </Link>
                <div className="flex-1">
                  <p className="text-sm font-bold">{f.rater?.name ?? "Member"}</p>
                  <p className="text-xs text-on-surface-variant">{timeAgo(f.createdAt)}</p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon key={n} name="star" filled={n <= f.rating} className={n <= f.rating ? "text-lg text-amber-500" : "text-lg text-outline-variant"} />
                  ))}
                </div>
              </div>
              {f.review && <p className="mt-3 text-sm leading-relaxed">{f.review}</p>}
            </li>
          ))}
        </ul>
      )}
      <div ref={sentinel} />
      {list.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
    </Page>
  );
}
