"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth-context";
import { Page, RequireAuth } from "@/components/app-shell";
import { PostCard, PostSkeleton } from "@/components/feed/post-card";
import { ErrorState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const post = useQuery({ queryKey: ["post", id], queryFn: () => postApi.details(id), enabled: !!user });

  return (
    <Page narrow>
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
      >
        <Icon name="arrow_back" className="text-lg" /> Back
      </button>
      <RequireAuth reason="Log in to view this post.">
        {post.isLoading ? (
          <PostSkeleton />
        ) : post.isError || !post.data ? (
          <ErrorState error={post.error ?? new Error("Post not found")} onRetry={() => post.refetch()} />
        ) : (
          <PostCard post={post.data} ownerFallback={user ?? undefined} />
        )}
      </RequireAuth>
    </Page>
  );
}
