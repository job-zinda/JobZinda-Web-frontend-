"use client";

import Link from "next/link";
import { Page, RequireAuth } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";

export default function JobsPage() {
  return (
    <RequireAuth reason="Log in to post a job requirement or job search.">
      <Page narrow title="Looking for job / employer" subtitle="Tell us what you need — our team will connect you with the right people">
        <img src="/images/looking_for_job.jpg" alt="" className="mb-6 aspect-[21/9] w-full rounded-3xl object-cover" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/jobs/apply" className="group rounded-3xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="primary-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
              <Icon name="edit_note" className="text-2xl" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold">New submission</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Looking for work, or hiring? Fill a short form.</p>
          </Link>
          <Link href="/jobs/my-submissions" className="group rounded-3xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-primary">
              <Icon name="assignment" className="text-2xl" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold">My submissions</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Track the status of what you&apos;ve submitted.</p>
          </Link>
        </div>
      </Page>
    </RequireAuth>
  );
}
