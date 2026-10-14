"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { postApi, userApi } from "@/lib/api/endpoints";
import { uploadFile } from "@/lib/api/client";
import { profileUrl, publicUrl, shareLink } from "@/lib/format";
import { tooLarge, useFilePicker } from "@/lib/use-file-picker";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { errorMessage, useToast } from "@/components/ui/toast";
import { AboutCard, PostGrid, ProfileHeader, ProfileStats } from "@/components/profile/profile-view";

export default function MyProfilePage() {
  return (
    <RequireAuth reason="Log in to see and edit your profile.">
      <MyProfile />
    </RequireAuth>
  );
}

function MyProfile() {
  const { user, isNormalAccount, refreshProfile } = useAuth();
  const toast = useToast();
  const pick = useFilePicker();
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);

  const changeImage = useMutation({
    mutationFn: async (kind: "avatar" | "cover") => {
      const file = await pick("image/*");
      if (!file) return false;
      if (tooLarge(file, 10)) throw new Error("Please choose an image under 10 MB.");
      setUploading(kind);
      const url = await uploadFile(file, "media");
      if (kind === "avatar") await userApi.updateImage(url);
      else await userApi.updateCover(url);
      await refreshProfile();
      return true;
    },
    onSuccess: (changed) => changed && toast("Profile updated", "success"),
    onError: (err) => toast(errorMessage(err), "error"),
    onSettled: () => setUploading(null),
  });

  if (!user) return null;

  const share = async () => {
    const r = await shareLink(publicUrl(profileUrl(user._id)), `${user.name} on Job Zinda`);
    if (r === "copied") toast("Profile link copied", "success");
  };

  return (
    <Page>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <ProfileHeader
            profile={user}
            onEditAvatar={() => changeImage.mutate("avatar")}
            onEditCover={() => changeImage.mutate("cover")}
            stats={<ProfileStats profile={user} followersHref="/profile/connections" feedbackHref={`/profile/${user._id}/feedback`} />}
            actions={
              <>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/profile/edit">
                    <Icon name="edit" className="text-base" /> Edit profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={share}>
                  <Icon name="share" className="text-base" /> Share
                </Button>
              </>
            }
          />
          {uploading && (
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Uploading {uploading === "avatar" ? "profile photo" : "cover image"}…
            </p>
          )}

          {isNormalAccount && <UpgradeCard />}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">My posts</h2>
              {!isNormalAccount && (
                <Link href="/create" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                  <Icon name="add" className="text-lg" /> New post
                </Link>
              )}
            </div>
            <PostGrid
              queryKey={["mine", user._id]}
              fetchPage={(pageNumber) => postApi.mine({ pageNumber })}
              owner={user}
              emptyText={isNormalAccount ? "Upgrade to start posting your work" : "Share your first post"}
            />
          </section>
        </div>

        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Tile href="/profile/analytics" icon="monitoring" label="Analytics" />
            <Tile href="/profile/connections" icon="group" label="Followers" />
            <Tile href="/plans" icon="workspace_premium" label="Subscription" />
            <Tile href="/wallet" icon="account_balance_wallet" label="Wallet" />
            <Tile href="/course" icon="school" label="Courses" />
            <Tile href="/help" icon="support_agent" label="Help" />
          </div>
          <AboutCard profile={user} />
        </aside>
      </div>
    </Page>
  );
}

function Tile({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-2 rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-primary">
        <Icon name={icon} className="text-xl" />
      </span>
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
}

function UpgradeCard() {
  return (
    <section className="primary-gradient relative overflow-hidden rounded-3xl p-6 text-white shadow-lg shadow-primary/25">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
            <Icon name="workspace_premium" className="text-base" /> Go premium
          </p>
          <h2 className="mt-1 text-xl font-extrabold">Become a listed freelancer</h2>
          <p className="mt-1 text-sm text-white/85">
            Post your work, appear on the map and in search, and get analytics on who views your profile.
          </p>
        </div>
        <Link href="/plans" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-md hover:bg-white/90">
          See plans
        </Link>
      </div>
    </section>
  );
}
