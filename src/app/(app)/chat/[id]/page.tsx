"use client";

import { use } from "react";
import { RequireAuth } from "@/components/app-shell";
import { ChatView } from "@/components/chat/chat-view";

export default function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireAuth reason="Log in to chat with freelancers.">
      <ChatView activeId={id} />
    </RequireAuth>
  );
}
