"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { subscriptionApi } from "@/lib/api/endpoints";
import { payWithRazorpay } from "@/lib/razorpay";
import { formatDate, money } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, useToast } from "@/components/ui/toast";

const PERKS = [
  { icon: "dynamic_feed", title: "Post your work", text: "Share photos, videos and stories with clients." },
  { icon: "location_on", title: "Appear on the map", text: "Clients nearby can discover and contact you." },
  { icon: "monitoring", title: "Profile analytics", text: "See who views and follows your profile." },
  { icon: "verified", title: "Stand out", text: "Premium profiles get priority in search." },
];

export default function PlansPage() {
  return (
    <RequireAuth reason="Log in to see subscription plans.">
      <Plans />
    </RequireAuth>
  );
}

function Plans() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [buying, setBuying] = useState<string | null>(null);
  const plans = useQuery({ queryKey: ["plans"], queryFn: subscriptionApi.plans });
  const mine = useQuery({ queryKey: ["my-subscription"], queryFn: () => subscriptionApi.mine().catch(() => null) });

  const buy = useMutation({
    mutationFn: async (plan: Plan) => {
      setBuying(plan._id);
      const order = await subscriptionApi.create(plan._id);
      const paid = await payWithRazorpay(order, {
        description: plan.planName,
        prefill: { name: user?.name, email: user?.email, contact: user?.mobileNumber },
      });
      await subscriptionApi.verify(paid.razorpay_order_id, paid.razorpay_payment_id, paid.razorpay_signature);
    },
    onSuccess: async () => {
      toast("Payment successful — welcome to premium!", "success");
      await refreshProfile();
      void qc.invalidateQueries({ queryKey: ["plans"] });
      void qc.invalidateQueries({ queryKey: ["my-subscription"] });
      // Same as the Flutter app: go complete the freelancer profile.
      router.push("/profile/edit");
    },
    onError: (err) => {
      const msg = errorMessage(err);
      if (msg !== "Payment cancelled") toast(msg, "error");
    },
    onSettled: () => setBuying(null),
  });

  const active = mine.data;
  const activeEnd = active && (active.endDate || active.expiryDate);

  return (
    <Page title="Plans for freelancers" subtitle="Upgrade to get discovered and grow your business">
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PERKS.map((p) => (
          <div key={p.title} className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-primary">
              <Icon name={p.icon} />
            </span>
            <p className="mt-3 text-sm font-bold">{p.title}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{p.text}</p>
          </div>
        ))}
      </div>

      {active && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <Icon name="workspace_premium" filled className="text-2xl" />
          <p>
            <b>Your subscription is active</b>
            {activeEnd ? ` until ${formatDate(String(activeEnd))}` : ""}.
          </p>
        </div>
      )}

      {plans.isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-96 rounded-3xl" />
          ))}
        </div>
      ) : plans.isError ? (
        <ErrorState error={plans.error} onRetry={() => plans.refetch()} />
      ) : !plans.data?.length ? (
        <EmptyState icon="workspace_premium" title="No plans available right now" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.data.map((plan, i) => {
            const isFree = plan.planType?.toLowerCase() === "free";
            const featured = !isFree && i === Math.min(1, plans.data.length - 1);
            const symbol = plan.currencySymbol || "₹";
            const price = plan.billableAmount ?? plan.amount;
            return (
              <div
                key={plan._id}
                className={cn(
                  "relative flex flex-col rounded-3xl p-7 shadow-sm",
                  featured ? "primary-gradient text-white shadow-xl shadow-primary/25" : "bg-surface-container-lowest",
                )}
              >
                {plan.isSubscribed && (
                  <span className="absolute right-5 top-5 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-extrabold uppercase text-amber-900">
                    Current
                  </span>
                )}
                {plan.planIcon && <img src={plan.planIcon} alt="" className="mb-4 h-12 w-12 rounded-xl object-cover" />}
                <p className={cn("text-xs font-bold uppercase tracking-widest", featured ? "text-white/80" : "text-primary")}>
                  {plan.planTag || plan.planType || "Plan"}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">{plan.planName}</h2>
                <div className="mt-4 flex items-end gap-2">
                  {isFree ? (
                    <span className="text-4xl font-extrabold">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold">{money(price, symbol)}</span>
                      {plan.planAmountPer && <span className={cn("pb-1 text-sm", featured ? "text-white/75" : "text-on-surface-variant")}>/ {plan.planAmountPer}</span>}
                    </>
                  )}
                </div>
                {!isFree && !!plan.amountMRP && plan.amountMRP > (price ?? 0) && (
                  <p className={cn("mt-1 text-sm", featured ? "text-white/75" : "text-on-surface-variant")}>
                    <span className="line-through">{money(plan.amountMRP, symbol)}</span>
                    {!!plan.discountPercentage && <span className="ml-2 font-bold">{plan.discountPercentage}% off</span>}
                  </p>
                )}
                {!!plan.durationDays && (
                  <p className={cn("mt-1 text-xs font-semibold", featured ? "text-white/75" : "text-on-surface-variant")}>
                    Valid for {plan.durationDays} days
                  </p>
                )}
                <ul className="mt-6 flex-1 space-y-2.5">
                  {(plan.planFeatures ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Icon name="check_circle" filled className={cn("text-lg", featured ? "text-white" : "text-primary")} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("mt-7 w-full", featured && "border-0 text-primary hover:bg-white/90")}
                  variant={featured || isFree ? "outline" : "default"}
                  disabled={isFree || buy.isPending}
                  loading={buying === plan._id}
                  onClick={() => buy.mutate(plan)}
                >
                  {isFree ? (plan.isSubscribed ? "Your free plan" : "Free plan") : plan.isSubscribed ? "Renew / upgrade" : "Upgrade now"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-center text-xs text-on-surface-variant">Payments are processed securely by Razorpay.</p>
    </Page>
  );
}
