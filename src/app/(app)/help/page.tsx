"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { extrasApi, userApi } from "@/lib/api/endpoints";
import { SUPPORT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Page } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/dialog";
import { errorMessage, useToast } from "@/components/ui/toast";

export default function HelpPage() {
  const { isAuthenticated, logout, requireAuth } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const feedback = useMutation({
    mutationFn: () => extrasApi.rateApp(rating, review.trim()),
    onSuccess: () => {
      toast("Thanks for your feedback!", "success");
      setRating(0);
      setReview("");
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const deleteAccount = useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: async () => {
      toast("Your account has been deleted", "success");
      await logout();
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const contacts = [
    { icon: "chat", label: "Chat on WhatsApp", sub: "Fastest way to reach us", href: SUPPORT.whatsappDm, tint: "bg-[#25D366]/15 text-[#128C7E]" },
    { icon: "call", label: "Call us", sub: SUPPORT.phone, href: `tel:${SUPPORT.phone}`, tint: "bg-sky-100 text-sky-700" },
    { icon: "mail", label: "Email", sub: SUPPORT.email, href: `mailto:${SUPPORT.email}`, tint: "bg-amber-100 text-amber-700" },
    { icon: "groups", label: "Community group", sub: "Join other freelancers", href: SUPPORT.whatsappGroup, tint: "bg-secondary-container text-primary" },
  ];

  return (
    <Page narrow title="Help & Support" subtitle="We're here to help">
      <div className="grid gap-3 sm:grid-cols-2">
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", c.tint)}>
              <Icon name={c.icon} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{c.label}</p>
              <p className="truncate text-xs text-on-surface-variant">{c.sub}</p>
            </div>
          </a>
        ))}
      </div>

      {isAuthenticated && (
        <Link
          href="/chat/support"
          className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm hover:shadow-md"
        >
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <p className="text-sm font-bold">Lets plan — message our team</p>
            <p className="text-xs text-on-surface-variant">Plan your project or ask anything in-app</p>
          </div>
          <Icon name="chevron_right" className="text-outline" />
        </Link>
      )}

      <section className="mt-6 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="text-base font-extrabold">Rate your experience</h2>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
              <Icon name="star" filled={n <= rating} className={cn("text-3xl", n <= rating ? "text-amber-500" : "text-outline-variant")} />
            </button>
          ))}
        </div>
        <Textarea className="mt-3" value={review} onChange={(e) => setReview(e.target.value)} placeholder="Tell us what you like or what we can improve" maxLength={1000} />
        <Button
          className="mt-3"
          disabled={!rating}
          loading={feedback.isPending}
          onClick={() => requireAuth("Log in to send feedback.") && feedback.mutate()}
        >
          Send feedback
        </Button>
      </section>

      <nav className="mt-6 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
        {[
          { label: "FAQ", href: SUPPORT.faq, icon: "quiz", external: true },
          { label: "Terms & Conditions", href: "/help/terms", icon: "gavel" },
          { label: "Privacy Policy", href: SUPPORT.privacy, icon: "shield", external: true },
          { label: "Get the Android app", href: SUPPORT.playStore, icon: "android", external: true },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.external ? "_blank" : undefined}
            rel="noreferrer"
            className="flex items-center gap-3 border-b border-surface-container px-5 py-4 text-sm font-semibold last:border-0 hover:bg-surface-container-low"
          >
            <Icon name={l.icon} className="text-primary" />
            <span className="flex-1">{l.label}</span>
            <Icon name={l.external ? "open_in_new" : "chevron_right"} className="text-lg text-outline" />
          </a>
        ))}
      </nav>

      {isAuthenticated && (
        <section className="mt-6 rounded-3xl border border-error/20 bg-error/[0.03] p-6">
          <h2 className="text-base font-extrabold text-error">Delete account</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Your profile, posts and chats will be removed. This can&apos;t be undone.</p>
          <Button variant="destructive" size="sm" className="mt-4" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </Button>
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteAccount.mutate()}
        loading={deleteAccount.isPending}
        title="Delete your account?"
        description="This permanently removes your Job Zinda profile."
        confirmLabel="Delete account"
        destructive
      />
    </Page>
  );
}
