"use client";

import { useState } from "react";
import { extrasApi } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import type { FreelancerMessage } from "@/lib/types";
import { Page, RequireAuth } from "@/components/app-shell";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageSpinner, Spinner } from "@/components/ui/spinner";

export default function PlansForYouPage() {
  return (
    <RequireAuth>
      <PlansForYou />
    </RequireAuth>
  );
}

function PlansForYou() {
  const list = usePaged(["plans-for-you"], (pageNumber) => extrasApi.plansForYou({ pageNumber }));
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), !!list.hasNextPage);
  const [open, setOpen] = useState<FreelancerMessage | null>(null);

  return (
    <Page title="Plans for you" subtitle="Opportunities and updates from the Job Zinda team">
      {list.isLoading ? (
        <PageSpinner />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : list.items.length === 0 ? (
        <EmptyState icon="campaign" title="Nothing here yet" description="We'll post opportunities matched to you here." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((m) => (
            <button
              key={m._id}
              onClick={() => setOpen(m)}
              className="group overflow-hidden rounded-3xl bg-surface-container-lowest text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {m.imageUrl ? (
                <img src={m.imageUrl} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <div className="primary-gradient flex aspect-video items-center justify-center text-white">
                  <Icon name="campaign" className="text-5xl" />
                </div>
              )}
              <div className="p-5">
                <p className="text-xs text-on-surface-variant">{formatDate(m.createdAt)}</p>
                <h2 className="mt-1 line-clamp-2 font-bold">{m.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{m.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <div ref={sentinel} />
      {list.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}

      <Dialog open={!!open} onClose={() => setOpen(null)} title={open?.title} wide>
        {open && (
          <div>
            {open.imageUrl && <img src={open.imageUrl} alt="" className="max-h-96 w-full object-cover" />}
            <div className="space-y-4 p-6">
              <p className="whitespace-pre-line text-sm leading-relaxed">{open.description}</p>
              {open.whatsappLink && (
                <a
                  href={open.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
                >
                  <Icon name="group" className="text-lg" /> Join WhatsApp group
                </a>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </Page>
  );
}
