"use client";

import { RequireAuth } from "@/components/app-shell";
import { ChatView } from "@/components/chat/chat-view";

export default function ChatPage() {
  return (
    <RequireAuth reason="Log in to chat with freelancers.">
      <ChatView />
    </RequireAuth>
  );
}
