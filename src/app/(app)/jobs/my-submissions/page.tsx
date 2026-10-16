"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobSeekerApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/format";
import type { JobSeeker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { errorMessage, useToast } from "@/components/ui/toast";
import { AVAILABILITY, EXPERIENCE, labelOf, SALARY, WORK_MODE } from "@/components/jobs/job-seeker-form";

const STATUS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function MySubmissionsPage() {
  return (
    <RequireAuth>
      <MySubmissions />
    </RequireAuth>
  );
}

function MySubmissions() {
  const toast = useToast();
  const qc = useQueryClient();
  const subs = useQuery({ queryKey: ["job-submissions"], queryFn: jobSeekerApi.mine });
  const [deleting, setDeleting] = useState<JobSeeker | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => jobSeekerApi.remove(id),
    onSuccess: () => {
      toast("Submission deleted", "success");
      setDeleting(null);
      void qc.invalidateQueries({ queryKey: ["job-submissions"] });
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <Page
      narrow
      title="My submissions"
      action={
        <Button asChild size="sm">
          <Link href="/jobs/apply">
            <Icon name="add" className="text-base" /> New
          </Link>
        </Button>
      }
    >
      {subs.isLoading ? (
        <PageSpinner />
      ) : subs.isError ? (
        <ErrorState error={subs.error} onRetry={() => subs.refetch()} />
      ) : !subs.data?.length ? (
        <EmptyState icon="assignment" title="No submissions yet" action={<Link href="/jobs/apply" className="text-sm font-bold text-primary hover:underline">Create one</Link>} />
      ) : (
        <ul className="space-y-4">
          {subs.data.map((s) => (
            <li key={s._id} className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {s.jobType === "looking_for_employee" ? "Hiring" : "Looking for job"}
                  </p>
                  <h2 className="mt-0.5 text-lg font-extrabold">{s.desiredRole}</h2>
                  <p className="text-xs text-on-surface-variant">
                    {s.location} · Submitted {formatDate(s.createdAt)}
                  </p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase", STATUS[s.status ?? "pending"] ?? STATUS.pending)}>
                  {s.status ?? "pending"}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                <Info label="Experience" value={labelOf(EXPERIENCE, s.experienceLevel)} />
                <Info label="Salary" value={labelOf(SALARY, s.expectedSalary)} />
                <Info label="Mode" value={labelOf(WORK_MODE, s.workMode)} />
                <Info label="Availability" value={labelOf(AVAILABILITY, s.availability)} />
              </dl>
              {!!s.skills?.length && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.skills.map((k) => (
                    <span key={k} className="rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-semibold text-on-secondary-container">
                      {k}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/jobs/apply?edit=${s._id}`}>
                    <Icon name="edit" className="text-base" /> Edit
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-error hover:bg-error/5 hover:text-error" onClick={() => setDeleting(s)}>
                  <Icon name="delete" className="text-base" /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting?._id && remove.mutate(deleting._id)}
        loading={remove.isPending}
        title="Delete this submission?"
        confirmLabel="Delete"
        destructive
      />
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-on-surface-variant">{label}</dt>
      <dd className="font-semibold">{value || "—"}</dd>
    </div>
  );
}
