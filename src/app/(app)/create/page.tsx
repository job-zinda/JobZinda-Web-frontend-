"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { contentApi, postApi, storyApi } from "@/lib/api/endpoints";
import { uploadFile } from "@/lib/api/client";
import { mediaKind, videoThumbnail } from "@/lib/media";
import { tooLarge, useFilePicker } from "@/lib/use-file-picker";
import { Page, RequireAuth } from "@/components/app-shell";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { errorMessage, useToast } from "@/components/ui/toast";

type Tab = "post" | "story";

export default function CreatePage() {
  return (
    <RequireAuth reason="Log in to share posts and stories.">
      <Suspense>
        <Create />
      </Suspense>
    </RequireAuth>
  );
}

function Create() {
  const { isNormalAccount } = useAuth();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "story" ? "story" : "post");

  if (isNormalAccount)
    return (
      <Page narrow>
        <div className="primary-gradient rounded-3xl p-8 text-center text-white shadow-lg shadow-primary/25">
          <Icon name="workspace_premium" className="text-5xl" />
          <h1 className="mt-3 text-2xl font-extrabold">Posting is for premium members</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
            Upgrade to a plan to share your work, post stories and get discovered by clients.
          </p>
          <Link href="/plans" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary">
            View plans
          </Link>
        </div>
      </Page>
    );

  return (
    <Page narrow title="Create">
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        options={[
          { value: "post", label: "New post" },
          { value: "story", label: "Story" },
        ]}
      />
      {tab === "post" ? <PostForm /> : <StoryForm />}
    </Page>
  );
}

function useMediaPick() {
  const pick = useFilePicker();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const choose = async (accept = "image/*,video/*") => {
    const f = await pick(accept);
    if (!f) return;
    if (!mediaKind(f)) return toast("Choose an image or a video.", "error");
    if (tooLarge(f)) return toast("Files must be under 100 MB.", "error");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const clear = () => {
    setFile(null);
    setPreview(null);
  };
  return { file, preview, kind: file ? mediaKind(file) : null, choose, clear };
}

function MediaPreview({ media, onPick }: { media: ReturnType<typeof useMediaPick>; onPick: () => void }) {
  if (!media.preview)
    return (
      <button
        type="button"
        onClick={onPick}
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/60 bg-surface-container-low text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <Icon name="add_photo_alternate" className="text-4xl" />
        <span className="text-sm font-bold">Add a photo or video</span>
        <span className="text-xs">Up to 100 MB</span>
      </button>
    );
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      {media.kind === "video" ? (
        <video src={media.preview} controls className="max-h-[480px] w-full object-contain" />
      ) : (
        <img src={media.preview} alt="" className="max-h-[480px] w-full object-contain" />
      )}
      <button
        type="button"
        onClick={media.clear}
        aria-label="Remove media"
        className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white backdrop-blur"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

function PostForm() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const media = useMediaPick();
  const [bio, setBio] = useState("");
  const [sharedWith, setSharedWith] = useState<"all" | "followers">("all");
  const [category, setCategory] = useState(user?.profession ?? "");
  const [step, setStep] = useState("");
  const categories = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories, staleTime: 600_000 });

  const submit = useMutation({
    mutationFn: async () => {
      if (!media.file && !bio.trim()) throw new Error("Write something or add a photo/video.");
      let mediaUrl: string | undefined;
      let thumbnail: string | undefined;
      let duration: number | undefined;
      if (media.file && media.kind === "video") {
        setStep("Preparing video…");
        const thumb = await videoThumbnail(media.file);
        duration = thumb.duration;
        setStep("Uploading thumbnail…");
        thumbnail = await uploadFile(thumb.blob, "media", "thumbnail.jpg");
      }
      if (media.file) {
        setStep(media.kind === "video" ? "Uploading video…" : "Uploading photo…");
        mediaUrl = await uploadFile(media.file, "media");
      }
      setStep("Publishing…");
      return postApi.create({
        mediaType: media.kind ?? "text",
        mediaUrl,
        thumbnail,
        duration,
        bio: bio.trim(),
        sharedWith,
        category: category || undefined,
      });
    },
    onSuccess: () => {
      toast("Post shared!", "success");
      void qc.invalidateQueries({ queryKey: ["posts"] });
      router.push("/profile");
    },
    onError: (err) => toast(errorMessage(err), "error"),
    onSettled: () => setStep(""),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
      className="space-y-5 rounded-3xl bg-surface-container-lowest p-6 shadow-sm"
    >
      <MediaPreview media={media} onPick={() => media.choose()} />
      <Field label="Description" htmlFor="bio" hint={`${bio.length}/2000`}>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={2000} placeholder="Tell people about your work…" className="min-h-32" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">None</option>
            {categories.data?.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Who can see this" htmlFor="shared">
          <Select id="shared" value={sharedWith} onChange={(e) => setSharedWith(e.target.value as "all" | "followers")}>
            <option value="all">Anyone</option>
            <option value="followers">Followers only</option>
          </Select>
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={submit.isPending}>
        {step || "Share post"}
      </Button>
    </form>
  );
}

function StoryForm() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const media = useMediaPick();
  const [caption, setCaption] = useState("");
  const submit = useMutation({
    mutationFn: async () => {
      if (!media.file || !media.kind) throw new Error("Choose a photo or video for your story.");
      const url = await uploadFile(media.file, media.kind === "video" ? "stories/videos" : "stories/images");
      return storyApi.create({ mediaType: media.kind, content: url }, caption.trim());
    },
    onSuccess: () => {
      toast("Story posted — visible for 24 hours", "success");
      void qc.invalidateQueries({ queryKey: ["story", "mine"] });
      router.push("/");
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
      className="space-y-5 rounded-3xl bg-surface-container-lowest p-6 shadow-sm"
    >
      <MediaPreview media={media} onPick={() => media.choose()} />
      <Field label="Caption" htmlFor="caption" hint="Optional">
        <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} className="min-h-16" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submit.isPending} disabled={!media.file}>
        Share to story
      </Button>
    </form>
  );
}
