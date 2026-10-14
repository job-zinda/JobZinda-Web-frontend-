"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { courseApi } from "@/lib/api/endpoints";
import { payWithRazorpay } from "@/lib/razorpay";
import { formatDate, money } from "@/lib/format";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { PageSpinner } from "@/components/ui/spinner";
import { errorMessage, useToast } from "@/components/ui/toast";

export default function CoursePage() {
  return (
    <RequireAuth>
      <Course />
    </RequireAuth>
  );
}

function Course() {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [referral, setReferral] = useState("");
  const purchase = useQuery({ queryKey: ["course-purchase"], queryFn: courseApi.mine });

  const buy = useMutation({
    mutationFn: async () => {
      const order = await courseApi.createOrder(user!._id, referral.trim());
      const paid = await payWithRazorpay(order, {
        description: "Job Zinda course",
        prefill: { name: user?.name, email: user?.email, contact: user?.mobileNumber },
      });
      const res = await courseApi.verify(user!._id, paid.razorpay_order_id, paid.razorpay_payment_id, paid.razorpay_signature);
      if (!res.success) throw new Error("Payment couldn't be verified. Contact support if money was deducted.");
    },
    onSuccess: () => {
      toast("Course purchased!", "success");
      void qc.invalidateQueries({ queryKey: ["course-purchase"] });
    },
    onError: (err) => {
      const msg = errorMessage(err);
      if (msg !== "Payment cancelled") toast(msg, "error");
    },
  });

  if (purchase.isLoading) return <PageSpinner />;
  const p = purchase.data;

  if (p) {
    const receipt = `Job Zinda course purchase\nAmount: ${money(p.amount)}\nOrder: ${p.orderId}\nPayment: ${p.paymentId}\nDate: ${formatDate(p.createdAt, true)}`;
    return (
      <Page narrow title="Your course">
        <section className="rounded-3xl bg-surface-container-lowest p-7 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Icon name="check_circle" filled className="text-4xl" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold">Purchase confirmed</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Our team will reach out with course access details.</p>
          <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl bg-surface-container-low p-4 text-left text-sm">
            <Row label="Amount" value={money(p.amount)} />
            <Row label="Order ID" value={p.orderId} />
            <Row label="Payment ID" value={p.paymentId} />
            <Row label="Date" value={formatDate(p.createdAt, true)} />
            <Row label="Status" value={p.paymentStatus} />
          </dl>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(receipt)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
          >
            <Icon name="share" className="text-lg" /> Share to WhatsApp
          </a>
        </section>
      </Page>
    );
  }

  return (
    <Page narrow title="Purchase course" subtitle="Learn the skills to grow as a freelancer">
      <section className="space-y-5 rounded-3xl bg-surface-container-lowest p-7 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="primary-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-white">
            <Icon name="school" className="text-3xl" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold">Job Zinda course</h2>
            <p className="text-sm text-on-surface-variant">One-time payment via Razorpay</p>
          </div>
        </div>
        <Field label="Referral code" htmlFor="ref" hint="Optional — the person who referred you earns a reward">
          <Input id="ref" value={referral} onChange={(e) => setReferral(e.target.value)} />
        </Field>
        <Button className="w-full" size="lg" loading={buy.isPending} onClick={() => buy.mutate()}>
          Pay &amp; enroll
        </Button>
      </section>
    </Page>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="truncate font-semibold">{value || "—"}</dd>
    </div>
  );
}
