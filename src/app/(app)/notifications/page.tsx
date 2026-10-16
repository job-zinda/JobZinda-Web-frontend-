"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { notificationApi } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Page, RequireAuth } from "@/components/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { errorMessage, useToast } from "@/components/ui/toast";

type Filter = "" | "comment" | "profile_view" | "follow";

const TYPE_ICON: Record<string, { icon: string; tint: string }> = {
  follow: { icon: "person_add", tint: "bg-sky-500" },
  profile_view: { icon: "visibility", tint: "bg-indigo-500" },
  comment: { icon: "chat_bubble", tint: "bg-emerald-500" },
  reply: { icon: "reply", tint: "bg-emerald-500" },
  like: { icon: "favorite", tint: "bg-rose-500" },
  task: { icon: "task_alt", tint: "bg-amber-500" },
  wallet: { icon: "account_balance_wallet", tint: "bg-teal-500" },
  referral: { icon: "group_add", tint: "bg-fuchsia-500" },
  subscription: { icon: "workspace_premium", tint: "bg-primary" },
};

/** Where tapping a notification goes (mirrors FCMService routing in the Flutter app). */
function targetOf(n: AppNotification, myId?: string): string | null {
  const postId = n.connectedPostId?._id;
  const profileId = n.connectedProfileId?._id || n.sender?._id;
  switch (n.onTapNavigate) {
    case "post":
    case "comment":
    case "reply":
      return postId ? `/post/${postId}` : null;
    case "otherProfile":
      return profileId && profileId !== myId ? `/profile/${profileId}` : "/profile";
    case "myProfile":
      return "/profile";
    case "task":
      return "/tasks";
    case "wallet":
      return "/wallet";
    case "referral":
      return "/referrals";
    case "subscription":
      return "/plans";
  }
  if (postId) return `/post/${postId}`;
  if (profileId) return `/profile/${profileId}`;
  return null;
}

export default function NotificationsPage() {
  return (
    <RequireAuth reason="Log in to see your notifications.">
      <Notifications />
    </RequireAuth>
  );
}

function Notifications() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("");
  const [confirmClear, setConfirmClear] = useState(false);
  const list = usePaged(["notifications", filter], (pageNumber) =>
    notificationApi.list({ pageNumber, notificationType: filter || undefined }),
  );
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), !!list.hasNextPage);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["notifications"] });
    void qc.invalidateQueries({ queryKey: ["notification-count"] });
  };
  const markAll = useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: refresh, onError: (e) => toast(errorMessage(e), "error") });
  const clearAll = useMutation({
    mutationFn: notificationApi.removeAll,
    onSuccess: () => {
      setConfirmClear(false);
      refresh();
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });
  const remove = useMutation({ mutationFn: notificationApi.remove, onSuccess: refresh, onError: (e) => toast(errorMessage(e), "error") });

  const open = (n: AppNotification) => {
    if (!n.viewStatus) void notificationApi.markRead(n._id).then(refresh);
    const target = targetOf(n, user?._id);
    if (target) router.push(target);
  };

  return (
    <Page
      narrow
      title="Notifications"
      action={
        <div className="flex gap-1">
          <button onClick={() => markAll.mutate()} className="rounded-xl px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5">
            Mark all read
          </button>
          <button onClick={() => setConfirmClear(true)} className="rounded-xl px-3 py-2 text-xs font-bold text-error hover:bg-error/5">
            Clear all
          </button>
        </div>
      }
    >
      <Tabs
        className="mb-5"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "", label: "All" },
          { value: "comment", label: "Comments" },
          { value: "profile_view", label: "Profile views" },
          { value: "follow", label: "Follows" },
        ]}
      />

      {list.isLoading ? (
        <PageSpinner />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : list.items.length === 0 ? (
        <EmptyState icon="notifications_off" title="No notifications" description="When people follow, view or comment, you'll see it here." />
      ) : (
        <ul className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
          {list.items.map((n) => {
            const meta = TYPE_ICON[n.notificationType ?? ""] ?? { icon: "notifications", tint: "bg-outline" };
            const who = n.sender ?? n.connectedProfileId;
            return (
              <li key={n._id} className={cn("group flex items-start gap-3 border-b border-surface-container px-4 py-4 last:border-0", !n.viewStatus && "bg-primary/[0.04]")}>
                <button onClick={() => open(n)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <div className="relative">
                    {who ? <Avatar src={who.profileImageUrl} name={who.name} size="md" /> : <img src="/logo.png" alt="" className="h-11 w-11 rounded-full" />}
                    <span className={cn("absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white", meta.tint)}>
                      <Icon name={meta.icon} filled className="text-[12px]" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-bold">{n.title}</span>
                      {n.description && <span className="text-on-surface-variant"> — {n.description}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{timeAgo(n.sentOn)}</p>
                  </div>
                  {(n.mediaUrl || n.connectedPostId?.mediaUrl) && (
                    <img src={n.mediaUrl || n.connectedPostId?.mediaUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  )}
                </button>
                <div className="flex items-center gap-1">
                  {!n.viewStatus && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
                  <button
                    onClick={() => remove.mutate(n._id)}
                    aria-label="Delete notification"
                    className="rounded-full p-1.5 text-on-surface-variant opacity-60 hover:bg-surface-container hover:text-error group-hover:opacity-100"
                  >
                    <Icon name="close" className="text-lg" />
                  </button>
                </div>
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

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => clearAll.mutate()}
        loading={clearAll.isPending}
        title="Clear all notifications?"
        confirmLabel="Clear all"
        destructive
      />
    </Page>
  );
}
