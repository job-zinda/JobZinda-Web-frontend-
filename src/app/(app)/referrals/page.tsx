"use client";

import { useAuth } from "@/lib/auth-context";
import { referralApi } from "@/lib/api/endpoints";
import { usePaged, useInView } from "@/lib/hooks";
import { formatDate, publicUrl, SUPPORT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Page, RequireAuth } from "@/components/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

export default function ReferralsPage() {
  return (
    <RequireAuth>
      <Referrals />
    </RequireAuth>
  );
}

function Referrals() {
  const { user } = useAuth();
  const toast = useToast();
  const code = user?.referralCode ?? "";
  const list = usePaged(["referrals"], (pageNumber) => referralApi.mine({ pageNumber }));
  const sentinel = useInView<HTMLDivElement>(() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage(), !!list.hasNextPage);

  const signupLink = publicUrl(`/signup?ref=${encodeURIComponent(code)}`);
  const inviteText = `Join me on Job Zinda — use my referral code ${code}.\nWeb: ${signupLink}\nApp: ${SUPPORT.playStore}`;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied`, "success");
    } catch {
      toast("Couldn't copy", "error");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text: inviteText });
      else await copy(inviteText, "Invite");
    } catch {
      // cancelled
    }
  };

  return (
    <Page narrow title="Refer & earn" subtitle="Invite friends to Job Zinda and earn rewards in your wallet">
      <section className="rounded-3xl bg-surface-container-lowest p-6 text-center shadow-sm">
        <div className="primary-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25">
          <Icon name="redeem" className="text-4xl" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Your referral code</p>
        {code ? (
          <button
            onClick={() => copy(code, "Code")}
            className="mx-auto mt-2 flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-3 font-mono text-2xl font-extrabold tracking-widest text-primary"
          >
            {code}
            <Icon name="content_copy" className="text-xl" />
          </button>
        ) : (
          <p className="mt-2 text-sm text-on-surface-variant">Your code will appear here once your account is set up.</p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button onClick={share} className="primary-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white">
            <Icon name="share" className="text-lg" /> Share invite
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(inviteText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
          >
            <Icon name="chat" className="text-lg" /> WhatsApp
          </a>
          <button onClick={() => copy(signupLink, "Link")} className="flex items-center gap-2 rounded-xl bg-secondary-container px-5 py-2.5 text-sm font-bold text-on-secondary-container">
            <Icon name="link" className="text-lg" /> Copy link
          </button>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-lg font-extrabold">People you referred</h2>
      {list.isLoading ? (
        <PageSpinner />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : list.items.length === 0 ? (
        <EmptyState icon="group_add" title="No referrals yet" description="Share your code — rewards land in your wallet when friends join." />
      ) : (
        <ul className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
          {list.items.map((r) => (
            <li key={r._id} className="flex items-center gap-3 border-b border-surface-container px-5 py-4 last:border-0">
              <Avatar src={r.profileImageUrl} name={r.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{r.name || r.email || "New member"}</p>
                <p className="text-xs text-on-surface-variant">Joined {formatDate(r.createdAt)}</p>
              </div>
              <div className="text-right">
                {!!r.referralCoins && <p className="text-sm font-extrabold text-primary">+{r.referralCoins}</p>}
                {r.claimStatus && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      /approved|claimed|paid/i.test(r.claimStatus) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {r.claimStatus}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div ref={sentinel} />
      {list.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
    </Page>
  );
}
