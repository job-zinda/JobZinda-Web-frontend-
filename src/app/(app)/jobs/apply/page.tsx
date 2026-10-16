"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { jobSeekerApi } from "@/lib/api/endpoints";
import { Page, RequireAuth } from "@/components/app-shell";
import { PageSpinner } from "@/components/ui/spinner";
import { JobSeekerForm } from "@/components/jobs/job-seeker-form";

export default function ApplyPage() {
  return (
    <RequireAuth>
      <Suspense>
        <Apply />
      </Suspense>
    </RequireAuth>
  );
}

function Apply() {
  const editId = useSearchParams().get("edit");
  const subs = useQuery({ queryKey: ["job-submissions"], queryFn: jobSeekerApi.mine, enabled: !!editId });
  const initial = editId ? subs.data?.find((s) => s._id === editId) : undefined;

  return (
    <Page narrow title={editId ? "Edit submission" : "New submission"}>
      {editId && subs.isLoading ? <PageSpinner /> : <JobSeekerForm key={initial?._id ?? "new"} initial={initial} />}
    </Page>
  );
}
