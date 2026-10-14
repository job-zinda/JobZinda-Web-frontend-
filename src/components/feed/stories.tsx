"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { storyApi } from "@/lib/api/endpoints";
import { profileUrl, refId, timeAgo } from "@/lib/format";
import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { errorMessage, useToast } from "@/components/ui/toast";

const IMAGE_MS = 5000;

/** Stories row on the home feed: "your story" + stories of people you follow. */
export function StoryRow() {
  const { user, isAuthenticated, isNormalAccount } = useAuth();
  const mine = useQuery({ queryKey: ["story", "mine"], queryFn: storyApi.mine, enabled: isAuthenticated });
  const list = useQuery({
    queryKey: ["stories"],
    queryFn: () => storyApi.list({ pageNumber: 1 }).then((r) => r.items),
    enabled: isAuthenticated,
  });
  const [open, setOpen] = useState<{ stories: Story[]; index: number } | null>(null);

  if (!isAuthenticated) return null;
  const myStory = mine.data && mine.data.media?.length ? mine.data : null;
  const stories = (list.data ?? []).filter((s) => s.media?.length && refId(s.user) !== user?._id);
  if (!myStory && !stories.length && isNormalAccount) return null;

  const all = [...(myStory ? [{ ...myStory, userName: "Your story", userProfileImg: user?.profileImageUrl }] : []), ...stories];

  return (
    <>
      <div className="no-scrollbar flex gap-4 overflow-x-auto rounded-3xl bg-surface-container-lowest px-5 py-4 shadow-sm">
        {!myStory && !isNormalAccount && (
          <Link href="/create?tab=story" className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            <div className="relative">
              <Avatar src={user?.profileImageUrl} name={user?.name} size="lg" />
              <span className="primary-gradient absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white">
                <Icon name="add" className="text-base" />
              </span>
            </div>
            <span className="w-full truncate text-center text-[11px] font-semibold">Add story</span>
          </Link>
        )}
        {all.map((s, i) => (
          <button key={s._id} onClick={() => setOpen({ stories: all, index: i })} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            <span className="story-ring rounded-full p-[2.5px]">
              <span className="block rounded-full bg-white p-[2px]">
                <Avatar src={s.userProfileImg} name={s.userName} size="lg" className="h-[58px] w-[58px]" />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px] font-semibold">{s.userName}</span>
          </button>
        ))}
      </div>
      {open && <StoryViewer stories={open.stories} startIndex={open.index} onClose={() => setOpen(null)} />}
    </>
  );
}

function StoryViewer({ stories, startIndex, onClose }: { stories: Story[]; startIndex: number; onClose: () => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [storyIdx, setStoryIdx] = useState(startIndex);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const story = stories[storyIdx];
  const media = story?.media[mediaIdx];
  const isMine = refId(story?.user) === user?._id;

  const next = useCallback(() => {
    setProgress(0);
    if (mediaIdx < story.media.length - 1) setMediaIdx((m) => m + 1);
    else if (storyIdx < stories.length - 1) {
      setStoryIdx((s) => s + 1);
      setMediaIdx(0);
    } else onClose();
  }, [mediaIdx, story, storyIdx, stories.length, onClose]);

  const prev = () => {
    setProgress(0);
    if (mediaIdx > 0) setMediaIdx((m) => m - 1);
    else if (storyIdx > 0) {
      setStoryIdx((s) => s - 1);
      setMediaIdx(0);
    }
  };

  // Record the view.
  useEffect(() => {
    if (story && media && !isMine) void storyApi.markViewed(story._id, media._id).catch(() => undefined);
  }, [story, media, isMine]);

  // Image timer; videos advance on `ended`.
  useEffect(() => {
    if (!media || media.mediaType === "video" || paused) return;
    const started = Date.now() - (progress / 100) * IMAGE_MS;
    const t = setInterval(() => {
      const p = ((Date.now() - started) / IMAGE_MS) * 100;
      if (p >= 100) {
        clearInterval(t);
        next();
      } else setProgress(p);
    }, 50);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, paused, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const remove = useMutation({
    mutationFn: () => storyApi.removeMedia(story._id, media!._id),
    onSuccess: () => {
      toast("Story removed", "success");
      void qc.invalidateQueries({ queryKey: ["story", "mine"] });
      onClose();
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  if (!story || !media) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95">
      <div className="relative h-full w-full max-w-md overflow-hidden bg-black sm:h-[92vh] sm:rounded-3xl">
        <div className="absolute inset-x-0 top-0 z-10 space-y-3 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex gap-1">
            {story.media.map((m, i) => (
              <div key={m._id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full bg-white"
                  style={{ width: i < mediaIdx ? "100%" : i === mediaIdx ? `${progress}%` : "0%" }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-white">
            <Link href={profileUrl(refId(story.user))} onClick={onClose} className="flex flex-1 items-center gap-2.5">
              <Avatar src={story.userProfileImg} name={story.userName} size="sm" />
              <div>
                <p className="text-sm font-bold">{story.userName}</p>
                <p className="text-xs text-white/70">{timeAgo(media.postedAt)}</p>
              </div>
            </Link>
            {isMine && (
              <button onClick={() => remove.mutate()} aria-label="Delete story" className="rounded-full p-2 hover:bg-white/10">
                <Icon name="delete" />
              </button>
            )}
            <button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div
          className="flex h-full w-full items-center justify-center"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {media.mediaType === "video" ? (
            <video
              key={media._id}
              ref={videoRef}
              src={media.content}
              autoPlay
              playsInline
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setProgress((v.currentTime / v.duration) * 100);
              }}
              onEnded={next}
              className="max-h-full w-full object-contain"
            />
          ) : (
            <img key={media._id} src={media.content} alt="" className="max-h-full w-full object-contain" />
          )}
        </div>

        {story.description && (
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center text-sm text-white">
            {story.description}
          </p>
        )}

        <button aria-label="Previous" onClick={prev} className="absolute left-0 top-20 bottom-20 w-1/3" />
        <button aria-label="Next" onClick={next} className={cn("absolute right-0 top-20 bottom-20 w-1/3")} />
      </div>
    </div>,
    document.body,
  );
}
