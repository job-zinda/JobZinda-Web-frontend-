"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { jobSeekerApi } from "@/lib/api/endpoints";
import type { JobSeeker, JobType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { errorMessage, useToast } from "@/components/ui/toast";

// Option values match JobSeekerFormScreen in the Flutter app.
export const EXPERIENCE = [
  ["fresher", "Fresher"],
  ["1-3", "1–3 years"],
  ["3-5", "3–5 years"],
  ["5+", "5+ years"],
] as const;
export const SALARY = [
  ["below_10k", "Below ₹10k"],
  ["10k-25k", "₹10k – ₹25k"],
  ["25k-50k", "₹25k – ₹50k"],
  ["50k-1lakh", "₹50k – ₹1 lakh"],
  ["above_1lakh", "Above ₹1 lakh"],
] as const;
export const WORK_MODE = [
  ["onsite", "On-site"],
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
  ["freelance", "Freelance"],
] as const;
export const AVAILABILITY = [
  ["immediate", "Immediately"],
  ["1_week", "Within a week"],
  ["1_month", "Within a month"],
] as const;

export function labelOf(list: readonly (readonly [string, string])[], value?: string) {
  return list.find(([v]) => v === value)?.[1] ?? value ?? "";
}

export function JobSeekerForm({ initial }: { initial?: JobSeeker }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<JobSeeker>(
    initial ?? {
      fullName: user?.name ?? "",
      phone: user?.mobileNumber ?? "",
      email: user?.email ?? "",
      whatsappNumber: user?.whatsappNumber ?? "",
      location: [user?.district, user?.state].filter(Boolean).join(", "),
      jobType: "looking_for_job",
      desiredRole: "",
      skills: user?.skills ?? [],
      experienceLevel: "",
      expectedSalary: "",
      workMode: "",
      availability: "",
    },
  );
  const [skills, setSkills] = useState(form.skills.join(", "));
  const seeking = form.jobType === "looking_for_job";

  const set = <K extends keyof JobSeeker>(k: K, v: JobSeeker[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const body: JobSeeker = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
        whatsappNumber: form.whatsappNumber?.trim() || undefined,
        location: form.location.trim(),
        jobType: form.jobType,
        desiredRole: form.desiredRole.trim(),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceLevel: form.experienceLevel,
        expectedSalary: form.expectedSalary,
        workMode: form.workMode,
        availability: form.availability,
      };
      if (!body.fullName || !/^\d{10}$/.test(body.phone) || !body.location || !body.desiredRole)
        throw new Error("Fill in your name, a 10-digit phone, location and role.");
      if (!body.experienceLevel || !body.expectedSalary || !body.workMode || !body.availability)
        throw new Error("Choose experience, salary, work mode and availability.");
      return initial?._id ? jobSeekerApi.update(initial._id, body) : jobSeekerApi.submit(body);
    },
    onSuccess: () => {
      toast(initial ? "Submission updated" : "Submitted! Our team will review it shortly.", "success");
      void qc.invalidateQueries({ queryKey: ["job-submissions"] });
      router.push("/jobs/my-submissions");
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["looking_for_job", "work", "I'm looking for a job"],
            ["looking_for_employee", "person_search", "I'm hiring"],
          ] as [JobType, string, string][]
        ).map(([value, icon, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => set("jobType", value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl p-5 text-sm font-bold ring-2 transition-all",
              form.jobType === value ? "bg-primary/5 text-primary ring-primary" : "bg-surface-container-lowest text-on-surface-variant ring-transparent hover:ring-outline-variant/40",
            )}
          >
            <Icon name={icon} className="text-3xl" />
            {label}
          </button>
        ))}
      </div>

      <section className="space-y-4 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-extrabold">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={seeking ? "Full name" : "Company / your name"} htmlFor="name">
            <Input id="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
          </Field>
          <Field label="Email" htmlFor="email" hint="Optional">
            <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="WhatsApp" htmlFor="wa" hint="Optional">
            <Input id="wa" inputMode="numeric" value={form.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} />
          </Field>
        </div>
        <Field label="Location / city" htmlFor="loc">
          <Input id="loc" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Kochi, Kerala" />
        </Field>
      </section>

      <section className="space-y-4 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-extrabold">{seeking ? "The job you want" : "The person you need"}</h2>
        <Field label={seeking ? "Desired role" : "Role to fill"} htmlFor="role">
          <Input id="role" value={form.desiredRole} onChange={(e) => set("desiredRole", e.target.value)} placeholder="e.g. Video editor" />
        </Field>
        <Field label="Skills" htmlFor="skills" hint="Separate with commas">
          <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Premiere Pro, After Effects" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Experience" htmlFor="exp">
            <Select id="exp" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
              <option value="">Select</option>
              {EXPERIENCE.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={seeking ? "Expected salary" : "Budget"} htmlFor="salary">
            <Select id="salary" value={form.expectedSalary} onChange={(e) => set("expectedSalary", e.target.value)}>
              <option value="">Select</option>
              {SALARY.map(([v, l]) => (
                <option key={v} value={v}>
                  {l} / month
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Work mode" htmlFor="mode">
            <Select id="mode" value={form.workMode} onChange={(e) => set("workMode", e.target.value)}>
              <option value="">Select</option>
              {WORK_MODE.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={seeking ? "Available to join" : "Needed by"} htmlFor="avail">
            <Select id="avail" value={form.availability} onChange={(e) => set("availability", e.target.value)}>
              <option value="">Select</option>
              {AVAILABILITY.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <Button type="submit" size="lg" className="w-full" loading={save.isPending}>
        {initial ? "Save changes" : "Submit"}
      </Button>
    </form>
  );
}
