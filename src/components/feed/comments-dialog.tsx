"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { commentApi } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { profileUrl, timeAgo } from "@/lib/format";
import type { Comment } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage, useToast } from "@/components/ui/toast";

export function CommentsDialog({
  postId,
  open,
  onClose,
  onCountChange,
}: {
  postId: string;
  open: boolean;
  onClose: () => void;
  onCountChange?: (delta: number) => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const key = ["comments", postId];
  const list = usePaged(key, (pageNumber) => commentApi.list(postId, { pageNumber }));
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), open);

  const send = useMutation({
    mutationFn: async () => {
      const value = text.trim();
      if (replyTo) await commentApi.reply(replyTo._id, value);
      else await commentApi.add(postId, value);
    },
    onSuccess: () => {
      setText("");
      if (replyTo) {
        void qc.invalidateQueries({ queryKey: ["replies", replyTo._id] });
        setReplyTo(null);
      } else onCountChange?.(1);
      void qc.invalidateQueries({ queryKey: key });
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <Dialog open={open} onClose={onClose} title="Comments" wide className="sm:h-[80vh]">
      <div className="flex min-h-[50vh] flex-col">
        <div className="flex-1 space-y-5 px-6 py-5">
          {list.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : list.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">No comments yet. Start the conversation!</p>
          ) : (
            list.items.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                onReply={() => setReplyTo(c)}
                onDeleted={() => {
                  onCountChange?.(-1);
                  void qc.invalidateQueries({ queryKey: key });
                }}
              />
            ))
          )}
          <div ref={sentinel} />
          {list.isFetchingNextPage && (
            <div className="flex justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) send.mutate();
          }}
          className="sticky bottom-0 border-t border-surface-container-high bg-surface-container-lowest px-4 py-3"
        >
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-1.5 text-xs">
              <span className="text-on-surface-variant">
                Replying to <b className="text-on-surface">{replyTo.commentedBy?.name}</b>
              </span>
              <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                <Icon name="close" className="text-base" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
              className="h-11 flex-1 rounded-full bg-surface-container px-5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!text.trim() || send.isPending}
              aria-label="Send"
              className="primary-gradient flex h-11 w-11 items-center justify-center rounded-full text-white disabled:opacity-40"
            >
              {send.isPending ? <Spinner className="h-4 w-4 border-2 border-white border-t-transparent" /> : <Icon name="send" />}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

function CommentItem({ comment, onReply, onDeleted }: { comment: Comment; onReply: () => void; onDeleted: () => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const isMine = comment.commentedBy?._id === user?._id;

  const replies = useQuery({
    queryKey: ["replies", comment._id],
    queryFn: () => commentApi.replies(comment._id).then((r) => r.items),
    enabled: showReplies,
  });

  const remove = useMutation({
    mutationFn: () => commentApi.remove(comment._id),
    onSuccess: onDeleted,
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const removeReply = useMutation({
    mutationFn: (id: string) => commentApi.removeReply(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["replies", comment._id] }),
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <div className="flex gap-3">
      <Link href={profileUrl(comment.commentedBy?._id ?? "")}>
        <Avatar src={comment.commentedBy?.profileImageUrl} name={comment.commentedBy?.name} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-2.5">
          <p className="text-xs font-bold">{comment.commentedBy?.name}</p>
          <p className="mt-0.5 whitespace-pre-line text-sm text-on-surface">{comment.comment}</p>
        </div>
        <div className="mt-1 flex items-center gap-4 px-2 text-xs font-semibold text-on-surface-variant">
          <span>{timeAgo(comment.createdAt)}</span>
          <button onClick={onReply} className="hover:text-primary">
            Reply
          </button>
          {isMine && (
            <button onClick={() => remove.mutate()} disabled={remove.isPending} className="hover:text-error">
              Delete
            </button>
          )}
        </div>
        {(comment.replyCount ?? 0) > 0 && !showReplies && (
          <button onClick={() => setShowReplies(true)} className="mt-2 px-2 text-xs font-bold text-primary">
            View {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
          </button>
        )}
        {showReplies && (
          <div className="mt-3 space-y-3">
            {replies.isLoading && <Spinner className="h-4 w-4" />}
            {replies.data?.map((r) => (
              <div key={r._id} className="flex gap-2.5">
                <Avatar src={r.repliedBy?.profileImageUrl} name={r.repliedBy?.name} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-sm bg-surface-container-low px-3.5 py-2">
                    <p className="text-xs font-bold">{r.repliedBy?.name}</p>
                    <p className="text-sm">{r.reply}</p>
                  </div>
                  {r.repliedBy?._id === user?._id && (
                    <button
                      onClick={() => removeReply.mutate(r._id)}
                      className="mt-1 px-2 text-xs font-semibold text-on-surface-variant hover:text-error"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
