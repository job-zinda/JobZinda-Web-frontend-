"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api/endpoints";
import type { AuthResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { errorMessage } from "@/components/ui/toast";

const RESEND_SECONDS = 30;

function EmailLogin() {
  const { startSession } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email.trim().toLowerCase());
      setStep("otp");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 4) {
      setError("Enter the code we emailed you.");
      return;
    }
    setLoading(true);
    try {
      const addr = email.trim().toLowerCase();
      const res = await authApi.verifyEmailOtp(addr, otp.trim());
      if (res.isNewUser || !res.tokens) {
        router.replace(`/signup?email=${encodeURIComponent(res.verifiedEmail || addr)}`);
        return;
      }
      startSession(res as AuthResult);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary">
        <Icon name="arrow_back" className="text-lg" /> Back
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">{step === "email" ? "Continue with email" : "Check your inbox"}</h1>
      <p className="mt-1.5 text-sm text-on-surface-variant">
        {step === "email" ? (
          "We'll email you a one-time code to sign in or create your account."
        ) : (
          <>
            Enter the code sent to <span className="font-bold text-on-surface">{email}</span>
          </>
        )}
      </p>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="mt-8 flex flex-col gap-5">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </Field>
          {error && <p className="rounded-xl bg-error/8 px-4 py-3 text-sm font-medium text-error">{error}</p>}
          <Button type="submit" size="lg" loading={loading}>
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 flex flex-col gap-5">
          <Field label="Verification code" htmlFor="otp">
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="h-14 text-center text-2xl font-bold tracking-[0.5em]"
              autoFocus
            />
          </Field>
          {error && <p className="rounded-xl bg-error/8 px-4 py-3 text-sm font-medium text-error">{error}</p>}
          <Button type="submit" size="lg" loading={loading}>
            Verify &amp; continue
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              className="font-semibold text-on-surface-variant hover:text-primary"
            >
              Change email
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={() => sendOtp()}
              className="font-bold text-primary disabled:text-outline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default function EmailLoginPage() {
  return (
    <Suspense>
      <EmailLogin />
    </Suspense>
  );
}
