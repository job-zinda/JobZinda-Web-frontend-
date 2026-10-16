"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Post, Profile } from "@/lib/types";
import { compact, whatsappLink } from "@/lib/format";
import { usePaged, useInView } from "@/lib/hooks";
import type { Paged } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { PostCard } from "@/components/feed/post-card";
import { cn } from "@/lib/utils";

export function ProfileHeader({
  profile,
  actions,
  onEditAvatar,
  onEditCover,
  stats,
}: {
  profile: Profile;
  actions?: ReactNode;
  onEditAvatar?: () => void;
  onEditCover?: () => void;
  stats?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
      <div className="relative h-40 md:h-56">
        {profile.coverImage ? (
          <img src={profile.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="primary-gradient h-full w-full opacity-90" />
        )}
        {onEditCover && (
          <button
            onClick={onEditCover}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-black/55"
          >
            <Icon name="photo_camera" className="text-base" /> Edit cover
          </button>
        )}
      </div>
      <div className="px-5 pb-6 md:px-8">
        <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
          <div className="relative">
            <Avatar src={profile.profileImageUrl} name={profile.name} size="xl" className="ring-4 ring-surface-container-lowest" />
            {onEditAvatar && (
              <button
                onClick={onEditAvatar}
                aria-label="Change profile photo"
                className="primary-gradient absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-surface-container-lowest"
              >
                <Icon name="photo_camera" className="text-lg" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
        <div className="mt-4">
          <h1 className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight">
            {profile.name || "Unnamed"}
            {profile.isVerified && <Icon name="verified" filled className="text-xl text-primary" />}
          </h1>
          <p className="mt-0.5 text-sm font-semibold text-primary">{profile.profession || (profile.accountType === "Freelancer" ? "Freelancer" : "Member")}</p>
          {(profile.district || profile.state) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
              <Icon name="location_on" className="text-base" />
              {[profile.district, profile.state].filter(Boolean).join(", ")}
            </p>
          )}
          {profile.bio && <p className="mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-on-surface">{profile.bio}</p>}
        </div>
        {stats ?? <ProfileStats profile={profile} />}
      </div>
    </section>
  );
}

export function ProfileStats({ profile, followersHref, feedbackHref }: { profile: Profile; followersHref?: string; feedbackHref?: string }) {
  const items = [
    { label: "Followers", value: compact(profile.followersCount), href: followersHref },
    { label: "Projects", value: compact(profile.projectsCount) },
    { label: "Rating", value: profile.rating ? profile.rating.toFixed(1) : "—", href: feedbackHref, star: true },
  ];
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-surface-container-low p-2">
      {items.map((s) => {
        const body = (
          <>
            <span className="flex items-center gap-1 text-lg font-extrabold text-on-surface">
              {s.star && profile.rating ? <Icon name="star" filled className="text-base text-amber-500" /> : null}
              {s.value}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">{s.label}</span>
          </>
        );
        return s.href ? (
          <Link key={s.label} href={s.href} className="flex flex-col items-center rounded-xl py-2 hover:bg-surface-container-lowest">
            {body}
          </Link>
        ) : (
          <div key={s.label} className="flex flex-col items-center py-2">
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function AboutCard({ profile, showContact = true }: { profile: Profile; showContact?: boolean }) {
  const call = profile.contactNumber || profile.mobileNumber;
  const wa = profile.whatsappNumber;
  const hasSkills = !!profile.skills?.length;
  if (!hasSkills && !showContact) return null;
  return (
    <section className="space-y-5 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
      {hasSkills && (
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-on-surface-variant">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills!.map((s) => (
              <span key={s} className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {showContact && (call || wa || profile.email) && (
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-on-surface-variant">Contact</h2>
          <div className="flex flex-col gap-2">
            {call && <ContactRow icon="call" label={`+${profile.countryCode || "91"} ${call}`} href={`tel:${call}`} />}
            {wa && <ContactRow icon="chat" label="WhatsApp" href={whatsappLink(wa)} external />}
            {profile.email && <ContactRow icon="mail" label={profile.email} href={`mailto:${profile.email}`} />}
          </div>
        </div>
      )}
    </section>
  );
}

function ContactRow({ icon, label, href, external }: { icon: string; label: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-surface-container-low"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container text-primary">
        <Icon name={icon} className="text-lg" />
      </span>
      <span className="truncate">{label}</span>
    </a>
  );
}

/** Instagram-style grid of a profile's posts; click opens the full post. */
export function PostGrid({
  queryKey,
  fetchPage,
  owner,
  emptyText = "No posts yet",
}: {
  queryKey: unknown[];
  fetchPage: (pageNumber: number) => Promise<Paged<Post>>;
  owner?: { _id?: string; name?: string; profileImageUrl?: string };
  emptyText?: string;
}) {
  const list = usePaged(["posts", ...queryKey], fetchPage);
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), !!list.hasNextPage);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = list.items.find((p) => p._id === openId);

  if (list.isLoading)
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    );
  if (!list.items.length) return <EmptyState icon="photo_library" title={emptyText} />;

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {list.items.map((p) => (
          <button
            key={p._id}
            onClick={() => setOpenId(p._id)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container"
          >
            {p.mediaType === "text" ? (
              <div className={cn("primary-gradient flex h-full w-full items-center justify-center p-3 text-left text-xs font-semibold text-white")}>
                <span className="line-clamp-5">{p.bio}</span>
              </div>
            ) : (
              <img src={p.mediaType === "video" ? p.thumbnail || "" : p.mediaUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            )}
            {p.mediaType === "video" && <Icon name="play_circle" filled className="absolute right-2 top-2 text-2xl text-white drop-shadow" />}
            <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex items-center gap-1">
                <Icon name="favorite" filled className="text-lg" /> {compact(p.likesCount)}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="chat_bubble" filled className="text-lg" /> {compact(p.commentsCount)}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div ref={sentinel} />
      {list.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      <Dialog open={!!open} onClose={() => setOpenId(null)} wide>
        {open && (
          <div className="relative">
            <button
              onClick={() => setOpenId(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full bg-surface-container-lowest/90 p-1.5 shadow"
            >
              <Icon name="close" />
            </button>
            <PostCard post={open} ownerFallback={owner} />
          </div>
        )}
      </Dialog>
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface-container-lowest">
      <div className="h-40 animate-pulse bg-surface-container-high md:h-56" />
      <div className="space-y-3 p-6">
        <div className="-mt-16 h-28 w-28 animate-pulse rounded-full bg-surface-container-highest ring-4 ring-white" />
        <div className="h-5 w-48 animate-pulse rounded bg-surface-container-high" />
        <div className="h-4 w-32 animate-pulse rounded bg-surface-container-high" />
      </div>
    </div>
  );
}
