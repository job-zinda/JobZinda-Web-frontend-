import Link from "next/link";
import type { Profile } from "@/lib/types";
import { compact, profileUrl } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";

/** Freelancer result card (search, map list). */
export function ProfileCard({ profile, distance }: { profile: Profile; distance?: string }) {
  return (
    <Link
      href={profileUrl(profile._id)}
      className="group flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-transparent transition-all hover:shadow-[0_8px_24px_-8px_rgba(114,48,230,0.18)] hover:ring-primary/10"
    >
      <Avatar src={profile.profileImageUrl} name={profile.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate font-bold text-on-surface">
          {profile.name}
          {profile.isVerified && <Icon name="verified" filled className="text-base text-primary" />}
        </p>
        <p className="truncate text-sm text-on-surface-variant">{profile.profession || "Freelancer"}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Icon name="group" className="text-sm" />
            {compact(profile.followersCount)} followers
          </span>
          {!!profile.rating && (
            <span className="flex items-center gap-1">
              <Icon name="star" filled className="text-sm text-amber-500" />
              {profile.rating.toFixed(1)}
            </span>
          )}
          {!!profile.projectsCount && (
            <span className="flex items-center gap-1">
              <Icon name="work" className="text-sm" />
              {profile.projectsCount} projects
            </span>
          )}
          {distance && (
            <span className="flex items-center gap-1">
              <Icon name="near_me" className="text-sm" />
              {distance}
            </span>
          )}
        </div>
      </div>
      <Icon name="chevron_right" className="text-outline transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-4">
      <div className="h-16 w-16 animate-pulse rounded-full bg-surface-container-high" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-surface-container-high" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-surface-container-high" />
      </div>
    </div>
  );
}
