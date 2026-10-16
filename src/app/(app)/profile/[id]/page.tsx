"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { postApi, socialApi, userApi } from "@/lib/api/endpoints";
import { profileUrl, publicUrl, shareLink, whatsappLink } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Page } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/ui/empty-state";
import { errorMessage, useToast } from "@/components/ui/toast";
import { AboutCard, PostGrid, ProfileHeader, ProfileSkeleton, ProfileStats } from "@/components/profile/profile-view";
import { cn } from "@/lib/utils";

export default function OtherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const guest = !isAuthenticated;

  useEffect(() => {
    if (user && user._id === id) router.replace("/profile");
  }, [user, id, router]);

  const profile = useQuery({
    queryKey: ["profile", id, guest],
    queryFn: () => userApi.profile(id, guest),
    enabled: !isLoading,
  });

  // Record the profile view once (logged-in only).
  useEffect(() => {
    if (isAuthenticated && user?._id !== id) void userApi.visit(id).catch(() => undefined);
  }, [isAuthenticated, id, user?._id]);

  return (
    <Page>
      {profile.isLoading || isLoading ? (
        <ProfileSkeleton />
      ) : profile.isError || !profile.data ? (
        <ErrorState error={profile.error ?? new Error("Profile not found")} onRetry={() => profile.refetch()} />
      ) : (
        <ProfileContent profile={profile.data} guest={guest} />
      )}
    </Page>
  );
}

function ProfileContent({ profile, guest }: { profile: Profile; guest: boolean }) {
  const { requireAuth } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const key = ["profile", profile._id, guest];

  const setProfile = (fn: (p: Profile) => Profile) => qc.setQueryData<Profile>(key, (p) => (p ? fn(p) : p));

  const follow = useMutation({
    mutationFn: () => (profile.isFollowing ? socialApi.unfollow(profile._id) : socialApi.follow(profile._id)),
    onMutate: () =>
      setProfile((p) => ({
        ...p,
        isFollowing: !p.isFollowing,
        followersCount: Math.max(0, (p.followersCount ?? 0) + (p.isFollowing ? -1 : 1)),
      })),
    onError: (err) => {
      setProfile((p) => ({
        ...p,
        isFollowing: !p.isFollowing,
        followersCount: Math.max(0, (p.followersCount ?? 0) + (p.isFollowing ? -1 : 1)),
      }));
      toast(errorMessage(err), "error");
    },
  });

  const block = useMutation({
    mutationFn: () => (profile.isBlocked ? socialApi.unblock(profile._id) : socialApi.block(profile._id)),
    onSuccess: () => {
      toast(profile.isBlocked ? "User unblocked" : "User blocked", "success");
      setProfile((p) => ({ ...p, isBlocked: !p.isBlocked }));
      setConfirmBlock(false);
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const report = useMutation({
    mutationFn: () => socialApi.report(profile._id),
    onSuccess: () => toast("Thanks — our team will review this profile.", "success"),
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const share = async () => {
    const r = await shareLink(publicUrl(profileUrl(profile._id)), `${profile.name} on Job Zinda`);
    if (r === "copied") toast("Profile link copied", "success");
  };

  const call = profile.contactNumber || profile.mobileNumber;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-6">
        <ProfileHeader
          profile={profile}
          stats={<ProfileStats profile={profile} feedbackHref={`/profile/${profile._id}/feedback`} />}
          actions={
            <>
              <Button
                size="sm"
                variant={profile.isFollowing ? "secondary" : "default"}
                onClick={() => requireAuth("Log in to follow freelancers.") && follow.mutate()}
                disabled={profile.isBlocked}
              >
                <Icon name={profile.isFollowing ? "how_to_reg" : "person_add"} className="text-base" />
                {profile.isFollowing ? "Following" : "Follow"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={profile.isBlocked}
                onClick={() => requireAuth("Log in to message freelancers.") && router.push(`/chat/${profile._id}`)}
              >
                <Icon name="chat" className="text-base" /> Message
              </Button>
              {call && (
                <Button asChild size="icon" variant="outline" className="h-9 w-9">
                  <a href={`tel:${call}`} aria-label="Call">
                    <Icon name="call" className="text-lg" />
                  </a>
                </Button>
              )}
              {profile.whatsappNumber && (
                <Button asChild size="icon" variant="outline" className="h-9 w-9">
                  <a href={whatsappLink(profile.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                    <Icon name="sms" className="text-lg text-[#25D366]" />
                  </a>
                </Button>
              )}
              <div className="relative">
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setMenu((m) => !m)} aria-label="More">
                  <Icon name="more_vert" className="text-lg" />
                </Button>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-2xl bg-surface-container-lowest py-1 shadow-xl ring-1 ring-outline-variant/20">
                      <MenuItem icon="share" label="Share profile" onClick={() => { setMenu(false); void share(); }} />
                      <MenuItem
                        icon="star"
                        label="Rate & review"
                        onClick={() => {
                          setMenu(false);
                          if (requireAuth("Log in to leave a review.")) setRateOpen(true);
                        }}
                      />
                      <MenuItem
                        icon="flag"
                        label="Report"
                        onClick={() => {
                          setMenu(false);
                          if (requireAuth("Log in to report profiles.")) report.mutate();
                        }}
                      />
                      <MenuItem
                        icon="block"
                        label={profile.isBlocked ? "Unblock" : "Block"}
                        danger
                        onClick={() => {
                          setMenu(false);
                          if (requireAuth("Log in to block users.")) setConfirmBlock(true);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          }
        />

        {profile.isBlocked ? (
          <div className="rounded-3xl bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
            You blocked this user. Unblock them to see their posts.
          </div>
        ) : (
          <section>
            <h2 className="mb-3 text-lg font-extrabold">Posts</h2>
            <PostGrid
              queryKey={["profile", profile._id, guest]}
              fetchPage={(pageNumber) => postApi.ofProfile(profile._id, { pageNumber }, guest)}
              owner={profile}
            />
          </section>
        )}
      </div>
      <aside className="space-y-4">
        <AboutCard profile={profile} />
        <Link
          href={`/profile/${profile._id}/feedback`}
          className="flex items-center justify-between rounded-2xl bg-surface-container-lowest p-4 shadow-sm hover:shadow-md"
        >
          <span className="flex items-center gap-3 text-sm font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Icon name="reviews" />
            </span>
            Reviews &amp; feedback
          </span>
          <Icon name="chevron_right" className="text-outline" />
        </Link>
      </aside>

      <RateDialog open={rateOpen} onClose={() => setRateOpen(false)} profileId={profile._id} name={profile.name} />
      <ConfirmDialog
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        onConfirm={() => block.mutate()}
        loading={block.isPending}
        title={profile.isBlocked ? `Unblock ${profile.name}?` : `Block ${profile.name}?`}
        description={profile.isBlocked ? "They'll be able to see your posts and message you again." : "They won't be able to message you or see your posts."}
        confirmLabel={profile.isBlocked ? "Unblock" : "Block"}
        destructive={!profile.isBlocked}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold hover:bg-surface-container-low",
        danger ? "text-error" : "text-on-surface",
      )}
    >
      <Icon name={icon} className="text-lg" />
      {label}
    </button>
  );
}

function RateDialog({ open, onClose, profileId, name }: { open: boolean; onClose: () => void; profileId: string; name?: string }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const submit = useMutation({
    mutationFn: () => userApi.rate(profileId, rating, review.trim()),
    onSuccess: () => {
      toast("Thanks for your review!", "success");
      void qc.invalidateQueries({ queryKey: ["feedbacks", profileId] });
      void qc.invalidateQueries({ queryKey: ["profile", profileId] });
      setRating(0);
      setReview("");
      onClose();
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <Dialog open={open} onClose={onClose} title={`Rate ${name ?? "this freelancer"}`}>
      <div className="space-y-5 p-6">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
              <Icon name="star" filled={n <= rating} className={cn("text-4xl", n <= rating ? "text-amber-500" : "text-outline-variant")} />
            </button>
          ))}
        </div>
        <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Share your experience (optional)" maxLength={500} />
        <Button className="w-full" disabled={!rating} loading={submit.isPending} onClick={() => submit.mutate()}>
          Submit review
        </Button>
      </div>
    </Dialog>
  );
}
