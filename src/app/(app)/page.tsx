"use client";

import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { contentApi, postApi, userApi, type FeedKind } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { profileUrl } from "@/lib/format";
import { Chips, Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { PostCard, PostSkeleton } from "@/components/feed/post-card";
import { BannerCarousel, InlineBanner } from "@/components/feed/banners";
import { StoryRow } from "@/components/feed/stories";

const BANNER_EVERY = 5;

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useState<"suggested" | "following">("suggested");
  const [category, setCategory] = useState("all");
  const kind: FeedKind = isAuthenticated ? tab : "public";

  const banners = useQuery({
    queryKey: ["banners", isAuthenticated],
    queryFn: () => contentApi.banners(!isAuthenticated),
    enabled: !isLoading,
  });
  const categories = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories, staleTime: 600_000 });
  const categoryName = categories.data?.find((c) => c._id === category)?.name;

  // For you + "All": the backend narrows suggestions to the viewer's own
  // profession, which is often empty. Fall back to every public post then.
  const allSource = useRef<FeedKind>("suggested");
  const feed = usePaged(
    ["posts", "feed", kind, category],
    async (pageNumber) => {
      if (kind !== "suggested" || categoryName) return postApi.feed(kind, { pageNumber, category: categoryName });
      if (pageNumber === 1) {
        const first = await postApi.feed("suggested", { pageNumber });
        allSource.current = first.items.length ? "suggested" : "public";
        if (first.items.length) return first;
      }
      return postApi.feed(allSource.current, { pageNumber });
    },
    { enabled: !isLoading },
  );
  const sentinel = useInView<HTMLDivElement>(
    () => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage(),
    !!feed.hasNextPage,
  );

  const posts = feed.items;
  const top = (banners.data ?? []).filter((b) => !b.position || b.position === "top");
  const inline = (banners.data ?? []).filter((b) => b.position && b.position !== "top");

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-2xl min-w-0 space-y-5">
        <BannerCarousel banners={top} />
        <StoryRow />

        <div className="space-y-3">
          {isAuthenticated && (
            <Tabs
              value={tab}
              onChange={setTab}
              options={[
                { value: "suggested", label: "For you" },
                { value: "following", label: "Following" },
              ]}
            />
          )}
          {!!categories.data?.length && (
            <Chips
              value={category}
              onChange={setCategory}
              options={[{ value: "all", label: "All" }, ...categories.data.map((c) => ({ value: c._id, label: c.name }))]}
            />
          )}
        </div>

        {feed.isLoading || isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : feed.isError ? (
          <ErrorState error={feed.error} onRetry={() => feed.refetch()} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="dynamic_feed"
            title={tab === "following" ? "Nothing from people you follow yet" : "No posts found"}
            description={tab === "following" ? "Follow freelancers to see their work here." : "Try another category."}
            action={
              <Link href="/search" className="text-sm font-bold text-primary hover:underline">
                Find people to follow
              </Link>
            }
          />
        ) : (
          posts.map((post, i) => (
            <Fragment key={post._id}>
              <PostCard post={post} />
              {(i + 1) % BANNER_EVERY === 0 && inline[((i + 1) / BANNER_EVERY - 1) % inline.length] && (
                <InlineBanner banner={inline[((i + 1) / BANNER_EVERY - 1) % inline.length]} />
              )}
            </Fragment>
          ))
        )}
        <div ref={sentinel} />
        {feed.isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
      </div>

      <aside className="sticky top-24 hidden h-fit w-80 shrink-0 space-y-5 xl:block">
        <QuickLinks />
        <SuggestedPeople />
      </aside>
    </div>
  );
}

function QuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/search" className="group relative overflow-hidden rounded-2xl">
        <img src="/images/search_freelancer.jpg" alt="" className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
        <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-bold text-white">
          Search freelancers
        </span>
      </Link>
      <Link href="/jobs" className="group relative overflow-hidden rounded-2xl">
        <img src="/images/looking_for_job.jpg" alt="" className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
        <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-bold text-white">
          Looking for job / employer
        </span>
      </Link>
    </div>
  );
}

function SuggestedPeople() {
  const { isAuthenticated, isLoading } = useAuth();
  const people = useQuery({
    queryKey: ["suggested-people", isAuthenticated],
    queryFn: () => userApi.search({ pageNumber: 1, pageSize: 5 }, !isAuthenticated).then((r) => r.items),
    enabled: !isLoading,
  });
  if (!people.data?.length) return null;
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Freelancers to follow</h3>
        <Link href="/search" className="text-xs font-bold text-primary hover:underline">
          See all
        </Link>
      </div>
      <ul className="space-y-3.5">
        {people.data.map((p) => (
          <li key={p._id}>
            <Link href={profileUrl(p._id)} className="flex items-center gap-3">
              <Avatar src={p.profileImageUrl} name={p.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-bold">
                  {p.name}
                  {p.isVerified && <Icon name="verified" filled className="text-sm text-primary" />}
                </p>
                <p className="truncate text-xs text-on-surface-variant">{p.profession || "Freelancer"}</p>
              </div>
              <Icon name="chevron_right" className="text-outline" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
