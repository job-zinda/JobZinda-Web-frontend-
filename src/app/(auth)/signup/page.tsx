"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPosition } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { errorMessage, useToast } from "@/components/ui/toast";

function deviceId() {
  try {
    let id = localStorage.getItem("jz_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("jz_device_id", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

type Form = {
  name: string;
  username: string;
  password: string;
  confirm: string;
  mobileNumber: string;
  email: string;
  referralCode: string;
  contactNumber: string;
  whatsappNumber: string;
};

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(f.username.trim()))
    e.username = "3–30 characters: letters, numbers, dot, dash or underscore.";
  if (f.password.length < 8 || !/[A-Z]/.test(f.password) || !/\d/.test(f.password))
    e.password = "At least 8 characters with one uppercase letter and one number.";
  if (f.confirm !== f.password) e.confirm = "Passwords don't match.";
  if (!/^\d{10}$/.test(f.mobileNumber)) e.mobileNumber = "Enter a 10-digit mobile number.";
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email.";
  if (f.contactNumber && !/^\d{10}$/.test(f.contactNumber)) e.contactNumber = "Enter a 10-digit number.";
  if (f.whatsappNumber && !/^\d{10}$/.test(f.whatsappNumber)) e.whatsappNumber = "Enter a 10-digit number.";
  return e;
}

function SignupForm() {
  const params = useSearchParams();
  const verifiedEmail = params.get("email") || "";
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<Form>({
    name: "",
    username: "",
    password: "",
    confirm: "",
    mobileNumber: "",
    email: verifiedEmail,
    referralCode: params.get("ref") || "",
    contactNumber: "",
    whatsappNumber: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = ["mobileNumber", "contactNumber", "whatsappNumber"].includes(k);
    setForm((f) => ({ ...f, [k]: digitsOnly ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const pos = await getPosition();
      const res = await register({
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password,
        countryCode: "91",
        mobileNumber: form.mobileNumber,
        email: form.email.trim().toLowerCase() || undefined,
        referralCode: form.referralCode.trim() || undefined,
        contactNumber: form.contactNumber || undefined,
        whatsappNumber: form.whatsappNumber || undefined,
        lat: pos.fallback ? undefined : pos.lat,
        lng: pos.fallback ? undefined : pos.lng,
        deviceId: deviceId(),
      });
      const reward = res.referralReward ?? res.reward;
      toast(reward ? `Welcome! ₹${reward} credited to your wallet.` : "Welcome to Job Zinda!", "success");
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-on-surface-variant">Join thousands of freelancers and professionals.</p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" autoComplete="name" value={form.name} onChange={set("name")} placeholder="Your name" />
          </Field>
        </div>
        <Field label="Username" htmlFor="username" error={errors.username}>
          <Input id="username" autoComplete="username" value={form.username} onChange={set("username")} placeholder="your.username" />
        </Field>
        <Field label="Mobile number" htmlFor="mobile" error={errors.mobileNumber}>
          <div className="flex">
            <span className="flex items-center rounded-l-xl border border-r-0 border-outline-variant/40 bg-surface-container px-3 text-sm font-semibold text-on-surface-variant">
              +91
            </span>
            <Input
              id="mobile"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.mobileNumber}
              onChange={set("mobileNumber")}
              placeholder="9876543210"
              className="rounded-l-none"
            />
          </div>
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
            >
              <Icon name={show ? "visibility_off" : "visibility"} className="text-xl" />
            </button>
          </div>
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
          <Input id="confirm" type={show ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Email" htmlFor="email" error={errors.email} hint={verifiedEmail ? "Verified" : "Optional"}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              readOnly={!!verifiedEmail}
              placeholder="you@example.com"
            />
          </Field>
        </div>
        <Field label="Call number" htmlFor="contact" error={errors.contactNumber} hint="Optional">
          <Input id="contact" inputMode="numeric" value={form.contactNumber} onChange={set("contactNumber")} />
        </Field>
        <Field label="WhatsApp number" htmlFor="whatsapp" error={errors.whatsappNumber} hint="Optional">
          <Input id="whatsapp" inputMode="numeric" value={form.whatsappNumber} onChange={set("whatsappNumber")} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Referral code" htmlFor="ref" hint="Optional — got a code from a friend?">
            <Input id="ref" value={form.referralCode} onChange={set("referralCode")} />
          </Field>
        </div>

        {error && (
          <p className="rounded-xl bg-error/8 px-4 py-3 text-sm font-medium text-error sm:col-span-2">{error}</p>
        )}

        <p className="text-xs text-on-surface-variant sm:col-span-2">
          By creating an account you agree to our{" "}
          <Link href="/help/terms" className="font-bold text-primary hover:underline">
            Terms &amp; Conditions
          </Link>
          .
        </p>

        <Button type="submit" size="lg" loading={loading} className="sm:col-span-2">
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
