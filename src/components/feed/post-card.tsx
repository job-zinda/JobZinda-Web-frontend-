"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { postApi, socialApi } from "@/lib/api/endpoints";
import { compact, postAuthor, profileUrl, publicUrl, shareLink, timeAgo } from "@/lib/format";
import type { Paged, Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/dialog";
import { errorMessage, useToast } from "@/components/ui/toast";
import { CommentsDialog } from "./comments-dialog";

/** Applies `fn` to the matching post in every cached post list / detail. */
export function usePatchPost() {
  const qc = useQueryClient();
  return (postId: string, fn: (p: Post) => Post | null) => {
    qc.setQueriesData<InfiniteData<Paged<Post>>>({ queryKey: ["posts"] }, (data) => {
      if (!data?.pages) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.flatMap((p) => (p._id === postId ? (fn(p) ?? []) : [p])),
        })),
      };
    });
    qc.setQueryData<Post>(["post", postId], (p) => (p ? (fn(p) ?? undefined) : p));
  };
}

const BIO_LIMIT = 220;

export function PostCard({ post, ownerFallback }: { post: Post; ownerFallback?: { _id?: string; name?: string; profileImageUrl?: string } }) {
  const { user, requireAuth } = useAuth();
  const toast = useToast();
  const patch = usePatchPost();
  const author = postAuthor(post, ownerFallback);
  const isMine = !!user && author._id === user._id;
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const like = useMutation({
    mutationFn: () => postApi.toggleLike(post._id),
    onMutate: () => {
      patch(post._id, (p) => ({
        ...p,
        isLiked: !p.isLiked,
        likesCount: Math.max(0, (p.likesCount ?? 0) + (p.isLiked ? -1 : 1)),
      }));
    },
    onError: (err) => {
      patch(post._id, (p) => ({
        ...p,
        isLiked: !p.isLiked,
        likesCount: Math.max(0, (p.likesCount ?? 0) + (p.isLiked ? -1 : 1)),
      }));
      toast(errorMessage(err), "error");
    },
  });

  const remove = useMutation({
    mutationFn: () => postApi.remove(post._id),
    onSuccess: () => {
      patch(post._id, () => null);
      toast("Post deleted", "success");
      setConfirmDelete(false);
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const report = useMutation({
    mutationFn: () => socialApi.report(author._id, "Reported from post"),
    onSuccess: () => toast("Thanks — we'll review this profile.", "success"),
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const onShare = async () => {
    const r = await shareLink(publicUrl(`/post/${post._id}`), "Check out this post on Job Zinda");
    if (r === "copied") toast("Link copied", "success");
  };

  const bio = post.bio ?? "";
  const longBio = bio.length > BIO_LIMIT;

  return (
    <article className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_8px_24px_-12px_rgba(114,48,230,0.10)]">
      <header className="flex items-center gap-3 px-5 pt-5">
        <Link href={profileUrl(author._id)} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar src={author.userProfilePicture} name={author.userName} size="md" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-bold text-on-surface">
              {author.userName || "Job Zinda member"}
              {author.isVerified && <Icon name="verified" filled className="text-base text-primary" />}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {[author.professionName, timeAgo(post.createdAt)].filter(Boolean).join(" · ")}
              {post.sharedWith === "followers" && " · Followers"}
            </p>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            aria-label="Post options"
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="more_horiz" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-2xl bg-surface-container-lowest py-1 shadow-xl ring-1 ring-outline-variant/20">
                <MenuItem icon="link" label="Copy link" onClick={() => { setMenu(false); void onShare(); }} />
                {isMine ? (
                  <MenuItem icon="delete" label="Delete post" danger onClick={() => { setMenu(false); setConfirmDelete(true); }} />
                ) : (
                  <MenuItem
                    icon="flag"
                    label="Report profile"
                    danger
                    onClick={() => {
                      setMenu(false);
                      if (requireAuth("Log in to report content.")) report.mutate();
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {bio && (
        <p className={cn("whitespace-pre-line px-5 pt-3 text-[15px] leading-relaxed text-on-surface", post.mediaType === "text" && "text-lg font-medium")}>
          {expanded || !longBio ? bio : bio.slice(0, BIO_LIMIT).trimEnd() + "… "}
          {longBio && (
            <button onClick={() => setExpanded((e) => !e)} className="font-bold text-primary">
              {expanded ? " Show less" : "View more"}
            </button>
          )}
        </p>
      )}

      {post.mediaType !== "text" && post.mediaUrl && (
        <div className="mt-4 bg-inverse-surface/5">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              poster={post.thumbnail}
              controls
              playsInline
              preload="metadata"
              className="max-h-[560px] w-full bg-black object-contain"
            />
          ) : (
            <Link href={`/post/${post._id}`}>
              <img src={post.mediaUrl} alt="" loading="lazy" className="max-h-[560px] w-full object-cover" />
            </Link>
          )}
        </div>
      )}

      <footer className="flex items-center gap-1 px-3 py-2.5">
        <ActionButton
          icon="favorite"
          active={post.isLiked}
          label={compact(post.likesCount)}
          onClick={() => requireAuth("Log in to like posts.") && like.mutate()}
          activeClass="text-error"
        />
        <ActionButton
          icon="chat_bubble"
          label={compact(post.commentsCount)}
          onClick={() => requireAuth("Log in to see and add comments.") && setCommentsOpen(true)}
        />
        <ActionButton icon="share" label="Share" onClick={onShare} />
      </footer>

      {commentsOpen && (
        <CommentsDialog
          postId={post._id}
          open={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          onCountChange={(delta) => patch(post._id, (p) => ({ ...p, commentsCount: Math.max(0, (p.commentsCount ?? 0) + delta) }))}
        />
      )}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title="Delete this post?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
      />
    </article>
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

function ActionButton({
  icon,
  label,
  onClick,
  active,
  activeClass,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-container-low",
        active ? activeClass : "text-on-surface-variant",
      )}
    >
      <Icon name={icon} filled={active} className="text-[22px]" />
      {label}
    </button>
  );
}

export function PostSkeleton() {
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-surface-container-high" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-container-high" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-surface-container-high" />
        </div>
      </div>
      <div className="mt-4 h-64 animate-pulse rounded-2xl bg-surface-container-high" />
    </div>
  );
}

