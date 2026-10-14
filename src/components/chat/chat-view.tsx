"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { chatApi, userApi } from "@/lib/api/endpoints";
import { uploadFile } from "@/lib/api/client";
import { formatDate, profileUrl, refId, timeAgo } from "@/lib/format";
import { tooLarge, useFilePicker } from "@/lib/use-file-picker";
import type { ChatMessage, Conversation, MessageType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { errorMessage, useToast } from "@/components/ui/toast";
import { useUnreadCounts } from "@/components/app-shell";

export const SUPPORT_ID = "support";
const THREAD_POLL_MS = 5000;
const LIST_POLL_MS = 15000;

function otherParticipant(c: Conversation, myId?: string) {
  return c.participants.find((p) => p.userId && p.userId._id !== myId)?.userId;
}

function lastText(c: Conversation) {
  const m = c.lastMessage?.messageId;
  const type = m?.messageType;
  if (type === "image") return "📷 Photo";
  if (type === "audio") return "🎤 Voice message";
  if (type === "video") return "🎬 Video";
  return m?.content ?? c.lastMessage?.content ?? "";
}

/** Two-pane inbox: conversation list + the open thread (`activeId` = profileId or "support"). */
export function ChatView({ activeId }: { activeId?: string }) {
  const { user } = useAuth();
  const counts = useUnreadCounts();
  const [tab, setTab] = useState<"primary" | "support">(activeId === SUPPORT_ID ? "support" : "primary");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = useQuery({
    queryKey: ["conversations", filter],
    queryFn: () => chatApi.conversations(filter).then((r) => r.items),
    refetchInterval: LIST_POLL_MS,
  });

  return (
    <div className="flex h-[calc(100dvh-4rem-4.5rem)] md:h-[calc(100dvh-4rem)]">
      <aside
        className={cn(
          "flex w-full flex-col border-r border-surface-container-high bg-surface-container-lowest md:w-[340px] lg:w-[380px]",
          activeId && "hidden md:flex",
        )}
      >
        <div className="space-y-3 p-4">
          <h1 className="text-2xl font-extrabold">Messages</h1>
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "primary", label: "Primary", badge: counts.chatDetail?.primary },
              { value: "support", label: "Lets plan", badge: counts.chatDetail?.support },
            ]}
          />
          {tab === "primary" && (
            <div className="flex gap-2">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-bold capitalize",
                    filter === f ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          {tab === "support" ? (
            <Link
              href={`/chat/${SUPPORT_ID}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-3 hover:bg-surface-container-low",
                activeId === SUPPORT_ID && "bg-primary/8",
              )}
            >
              <img src="/logo.png" alt="" className="h-12 w-12 rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">Job Zinda Admin</p>
                <p className="truncate text-sm text-on-surface-variant">Plan your project with our team</p>
              </div>
              {!!counts.chatDetail?.support && (
                <span className="rounded-full bg-primary px-2 text-xs font-bold leading-5 text-white">{counts.chatDetail.support}</span>
              )}
            </Link>
          ) : list.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : !list.data?.length ? (
            <div className="px-4 py-10 text-center text-sm text-on-surface-variant">
              {filter === "unread" ? "You're all caught up." : "No conversations yet. Message a freelancer from their profile."}
            </div>
          ) : (
            list.data.map((c) => {
              const other = otherParticipant(c, user?._id);
              if (!other) return null;
              const unread = c.unreadCount ?? 0;
              return (
                <Link
                  key={c._id}
                  href={`/chat/${other._id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3 hover:bg-surface-container-low",
                    activeId === other._id && "bg-primary/8",
                  )}
                >
                  <Avatar src={other.profileImageUrl} name={other.name} size="md" className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn("truncate", unread ? "font-extrabold" : "font-bold")}>{other.name}</p>
                      <span className="shrink-0 text-[11px] text-on-surface-variant">
                        {timeAgo(c.lastMessage?.createdAt ?? c.lastMessage?.messageId?.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-sm", unread ? "font-semibold text-on-surface" : "text-on-surface-variant")}>
                        {lastText(c)}
                      </p>
                      {unread > 0 && <span className="rounded-full bg-primary px-2 text-[11px] font-bold leading-5 text-white">{unread}</span>}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      <section className={cn("min-w-0 flex-1 flex-col bg-surface-container-low", activeId ? "flex" : "hidden md:flex")}>
        {activeId ? (
          <Thread key={activeId} peerId={activeId} conversations={list.data} />
        ) : (
          <div className="m-auto max-w-sm p-6">
            <EmptyState icon="forum" title="Your messages" description="Pick a conversation to start chatting." />
          </div>
        )}
      </section>
    </div>
  );
}

function Thread({ peerId, conversations }: { peerId: string; conversations?: Conversation[] }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const pick = useFilePicker();
  const isSupport = peerId === SUPPORT_ID;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const lastReadRef = useRef<string | null>(null);

  const fromList = conversations?.map((c) => otherParticipant(c, user?._id)).find((p) => p?._id === peerId);
  const peer = useQuery({
    queryKey: ["profile", peerId, false],
    queryFn: () => userApi.profile(peerId, false),
    enabled: !isSupport && !fromList,
  });
  const peerInfo = isSupport
    ? { name: "Job Zinda Admin", profileImageUrl: "/logo.png" }
    : (fromList ?? (peer.data ? { name: peer.data.name, profileImageUrl: peer.data.profileImageUrl } : undefined));

  const threadKey = useMemo(() => ["thread", peerId], [peerId]);
  const messages = useQuery({
    queryKey: threadKey,
    queryFn: () => (isSupport ? chatApi.supportMessages() : chatApi.messagesWith(peerId)).then((r) => r.items),
    refetchInterval: THREAD_POLL_MS,
  });

  // Keep scrolled to the newest message and mark the thread as read.
  const items = messages.data ?? [];
  const last = items[items.length - 1];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
    if (!last || last._id === lastReadRef.current) return;
    lastReadRef.current = last._id;
    const conversationId = last.conversationId;
    if (conversationId && !isSupport) {
      void chatApi.markRead(conversationId, last._id).then(() => {
        void qc.invalidateQueries({ queryKey: ["chat-unread"] });
        void qc.invalidateQueries({ queryKey: ["conversations"] });
      });
    }
  }, [last, isSupport, qc]);

  const send = useMutation({
    mutationFn: async ({ content, type }: { content: string; type: MessageType }) =>
      isSupport ? chatApi.sendSupport(content, type) : chatApi.send(peerId, content, type),
    onMutate: ({ content, type }) => {
      const optimistic: ChatMessage = {
        _id: `tmp-${Date.now()}`,
        content,
        messageType: type,
        senderId: user?._id,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<ChatMessage[]>(threadKey, (m) => [...(m ?? []), optimistic]);
    },
    onError: (err) => toast(errorMessage(err), "error"),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: threadKey });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const sendText = () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    send.mutate({ content: value, type: "text" });
  };

  const sendImage = async () => {
    const file = await pick("image/*");
    if (!file) return;
    if (tooLarge(file, 20)) return toast("Images must be under 20 MB.", "error");
    try {
      const url = await uploadFile(file, "media");
      send.mutate({ content: url, type: "image" });
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  return (
    <>
      <header className="flex items-center gap-3 border-b border-surface-container-high bg-surface-container-lowest px-4 py-3">
        <Link href="/chat" className="rounded-full p-1.5 hover:bg-surface-container md:hidden" aria-label="Back">
          <Icon name="arrow_back" />
        </Link>
        {isSupport ? (
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-bold">Job Zinda Admin</p>
              <p className="text-xs text-on-surface-variant">Lets plan — we usually reply within a day</p>
            </div>
          </div>
        ) : (
          <Link href={profileUrl(peerId)} className="flex items-center gap-3">
            <Avatar src={peerInfo?.profileImageUrl} name={peerInfo?.name} size="sm" className="h-10 w-10" />
            <p className="font-bold">{peerInfo?.name ?? "…"}</p>
          </Link>
        )}
      </header>

      <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
        {messages.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-on-surface-variant">
            {isSupport ? "Tell us what you're planning — our team will help." : `Say hi to ${peerInfo?.name ?? "them"} 👋`}
          </p>
        ) : (
          items.map((m, i) => {
            const mine = refId(m.senderId) === user?._id;
            const prev = items[i - 1];
            const newDay = !prev || new Date(prev.createdAt ?? 0).toDateString() !== new Date(m.createdAt ?? 0).toDateString();
            return (
              <div key={m._id}>
                {newDay && (
                  <p className="my-3 text-center text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {formatDate(m.createdAt)}
                  </p>
                )}
                <Bubble message={m} mine={mine} pending={m._id.startsWith("tmp-")} />
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendText();
        }}
        className="flex items-end gap-2 border-t border-surface-container-high bg-surface-container-lowest p-3"
      >
        <button type="button" onClick={sendImage} aria-label="Send photo" className="rounded-full p-2.5 text-on-surface-variant hover:bg-surface-container hover:text-primary">
          <Icon name="image" />
        </button>
        <VoiceRecorder onRecorded={(url) => send.mutate({ content: url, type: "audio" })} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendText();
            }
          }}
          rows={1}
          placeholder="Type a message"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl bg-surface-container px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send"
          className="primary-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
        >
          <Icon name="send" />
        </button>
      </form>
    </>
  );
}

function Bubble({ message, mine, pending }: { message: ChatMessage; mine: boolean; pending?: boolean }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-3xl px-4 py-2.5 text-sm shadow-sm",
          mine ? "primary-gradient rounded-br-md text-white" : "rounded-bl-md bg-surface-container-lowest text-on-surface",
          pending && "opacity-60",
          message.messageType === "image" && "p-1.5",
        )}
      >
        {message.messageType === "image" ? (
          <a href={message.content} target="_blank" rel="noreferrer">
            <img src={message.content} alt="" className="max-h-72 rounded-2xl object-cover" />
          </a>
        ) : message.messageType === "audio" ? (
          <audio src={message.content} controls className="h-10 w-60 max-w-full" />
        ) : message.messageType === "video" ? (
          <video src={message.content} controls className="max-h-72 rounded-2xl" />
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <p className={cn("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-on-surface-variant", message.messageType === "image" && "px-2 pb-1")}>
          {message.createdAt && new Date(message.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function VoiceRecorder({ onRecorded }: { onRecorded: (url: string) => void }) {
  const toast = useToast();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        if (blob.size < 1000) return;
        setUploading(true);
        try {
          const ext = type.includes("mp4") ? "m4a" : "webm";
          onRecorded(await uploadFile(blob, "audio", `voice.${ext}`));
        } catch (err) {
          toast(errorMessage(err), "error");
        } finally {
          setUploading(false);
        }
      };
      rec.start();
      recorder.current = rec;
      setSeconds(0);
      setRecording(true);
    } catch {
      toast("Microphone access is needed to record voice messages.", "error");
    }
  };

  const stop = () => {
    recorder.current?.stop();
    setRecording(false);
  };

  if (uploading) return <Spinner className="m-2.5 h-5 w-5" />;
  return recording ? (
    <button type="button" onClick={stop} className="flex h-11 items-center gap-2 rounded-full bg-error/10 px-3 text-sm font-bold text-error">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-error" />
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      <Icon name="stop_circle" filled />
    </button>
  ) : (
    <button type="button" onClick={start} aria-label="Record voice message" className="rounded-full p-2.5 text-on-surface-variant hover:bg-surface-container hover:text-primary">
      <Icon name="mic" />
    </button>
  );
}
