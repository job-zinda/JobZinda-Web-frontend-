"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { walletApi } from "@/lib/api/endpoints";
import { formatDate, money, SUPPORT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { errorMessage, useToast } from "@/components/ui/toast";

const MIN_WITHDRAWAL = 100;

export default function WalletPage() {
  return (
    <RequireAuth>
      <Wallet />
    </RequireAuth>
  );
}

function Wallet() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<"transactions" | "withdrawals">("transactions");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const userId = user!._id;

  const txns = useQuery({ queryKey: ["wallet-txns", userId], queryFn: () => walletApi.transactions(userId, 100) });
  const withdrawals = useQuery({ queryKey: ["withdrawals"], queryFn: walletApi.withdrawals });

  const balance = withdrawals.data?.summary?.currentWalletBalance ?? user?.walletBalance ?? 0;
  const earned = (txns.data ?? []).filter((t) => t.transactionType === "credit").reduce((s, t) => s + (t.amount || 0), 0);
  const pending = withdrawals.data?.summary?.pendingAmount ?? 0;

  const shareWallet = async () => {
    const text = `I've earned ${money(earned)} on Job Zinda! Join with my referral code ${user?.referralCode ?? ""} and start earning: ${SUPPORT.playStore}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast("Copied — paste it anywhere to share", "success");
      }
    } catch {
      // cancelled
    }
  };

  return (
    <Page narrow title="Wallet">
      <section className="primary-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-primary/25">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm font-semibold text-white/80">Available balance</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums">{money(balance)}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <p className="text-white/75">Total earned</p>
            <p className="text-lg font-bold">{money(earned)}</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <p className="text-white/75">Pending withdrawal</p>
            <p className="text-lg font-bold">{money(pending)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setWithdrawOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary hover:bg-white/90"
          >
            <Icon name="payments" className="text-lg" /> Withdraw
          </button>
          <button onClick={shareWallet} className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold backdrop-blur hover:bg-white/25">
            <Icon name="share" className="text-lg" /> Share &amp; invite
          </button>
        </div>
      </section>

      <Tabs
        className="my-6"
        value={tab}
        onChange={setTab}
        options={[
          { value: "transactions", label: "Transactions" },
          { value: "withdrawals", label: "Withdrawals" },
        ]}
      />

      {tab === "transactions" ? (
        txns.isLoading ? (
          <PageSpinner />
        ) : !txns.data?.length ? (
          <EmptyState icon="receipt_long" title="No transactions yet" description="Earn by completing tasks and referring friends." />
        ) : (
          <ul className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
            {txns.data.map((t) => {
              const credit = t.transactionType === "credit";
              return (
                <li key={t._id} className="flex items-center gap-3 border-b border-surface-container px-5 py-4 last:border-0">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", credit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                    <Icon name={credit ? "south_west" : "north_east"} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold capitalize">{t.message || t.source?.replace(/_/g, " ") || (credit ? "Credit" : "Debit")}</p>
                    <p className="text-xs text-on-surface-variant">
                      {formatDate(t.createdAt, true)}
                      {t.status && ` · ${t.status}`}
                    </p>
                  </div>
                  <p className={cn("text-sm font-extrabold tabular-nums", credit ? "text-emerald-700" : "text-rose-700")}>
                    {credit ? "+" : "−"}
                    {money(t.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )
      ) : withdrawals.isLoading ? (
        <PageSpinner />
      ) : !withdrawals.data?.withdrawals?.length ? (
        <EmptyState icon="account_balance" title="No withdrawal requests" />
      ) : (
        <ul className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
          {withdrawals.data.withdrawals.map((w) => (
            <li key={w._id} className="flex items-center gap-3 border-b border-surface-container px-5 py-4 last:border-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-primary">
                <Icon name="account_balance" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{w.upiId || "UPI"}</p>
                <p className="text-xs text-on-surface-variant">{formatDate(w.createdAt, true)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold tabular-nums">{money(w.amount)}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    w.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {w.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <WithdrawDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        userId={userId}
        balance={balance}
        onDone={() => {
          void refreshProfile();
        }}
      />
    </Page>
  );
}

function WithdrawDialog({
  open,
  onClose,
  userId,
  balance,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  balance: number;
  onDone: () => void;
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const submit = useMutation({
    mutationFn: () => {
      const value = Number(amount);
      if (!value || value < MIN_WITHDRAWAL) throw new Error(`Minimum withdrawal is ${money(MIN_WITHDRAWAL)}.`);
      if (value > balance) throw new Error("Amount is more than your balance.");
      const id = upi.trim();
      // UPI ID (name@bank) or a 10-digit GPay/PhonePe/Paytm number, as in the app.
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(id) && !/^\d{10}$/.test(id)) throw new Error("Enter a valid UPI ID or 10-digit number.");
      return walletApi.requestWithdrawal(userId, value, id);
    },
    onSuccess: () => {
      toast("Withdrawal requested — usually paid within 2–3 days", "success");
      void qc.invalidateQueries({ queryKey: ["withdrawals"] });
      void qc.invalidateQueries({ queryKey: ["wallet-txns"] });
      setAmount("");
      onDone();
      onClose();
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <Dialog open={open} onClose={onClose} title="Withdraw money">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-4 p-6"
      >
        <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm">
          Available: <b>{money(balance)}</b> · Minimum {money(MIN_WITHDRAWAL)}
        </p>
        <Field label="Amount (₹)" htmlFor="amount">
          <Input id="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="500" />
        </Field>
        <Field label="UPI ID or phone number" htmlFor="upi" hint="e.g. name@okaxis or your GPay / PhonePe / Paytm number">
          <Input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@bank" />
        </Field>
        <Button type="submit" className="w-full" loading={submit.isPending}>
          Request withdrawal
        </Button>
      </form>
    </Dialog>
  );
}

