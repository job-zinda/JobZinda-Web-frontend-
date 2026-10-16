// Razorpay Standard Checkout (web counterpart of razorpay_flutter).

import type { RazorpayOrder } from "./types";

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;

function loadScript() {
  if (window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("Couldn't load the payment gateway. Check your connection."));
    };
    document.body.appendChild(s);
  });
  return loader;
}

/** Opens checkout for a backend-created order; resolves on success, rejects on failure/dismiss. */
export async function payWithRazorpay(
  order: RazorpayOrder,
  opts: { description: string; prefill?: { name?: string; email?: string; contact?: string } },
): Promise<RazorpaySuccess> {
  await loadScript();
  if (!order.key_id) throw new Error("Payment gateway is not configured.");
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: order.key_id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency ?? "INR",
      name: "Job Zinda",
      description: opts.description,
      image: `${window.location.origin}/logo.png`,
      prefill: {
        name: opts.prefill?.name ?? order.notes?.fullName,
        email: opts.prefill?.email ?? order.notes?.email,
        contact: opts.prefill?.contact ?? order.notes?.phone,
      },
      theme: { color: "#7230e6" },
      handler: (resp: RazorpaySuccess) => resolve(resp),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed")));
    rzp.open();
  });
}
