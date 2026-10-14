"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { extrasApi } from "@/lib/api/endpoints";
import { formatDate, money, SUPPORT } from "@/lib/format";
import { tooLarge, useFilePicker } from "@/lib/use-file-picker";
import type { AssignedTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { errorMessage, useToast } from "@/components/ui/toast";

const STATUS: Record<string, { label: string; className: string }> = {
  assigned: { label: "To do", className: "bg-sky-100 text-sky-700" },
  submitted: { label: "Under review", className: "bg-amber-100 text-amber-700" },
  verified: { label: "Verified", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
};

export default function TasksPage() {
  return (
    <RequireAuth>
      <Tasks />
    </RequireAuth>
  );
}

function Tasks() {
  const { isPromoter } = useAuth();
  const tasks = useQuery({ queryKey: ["assigned-tasks"], queryFn: extrasApi.assignedTasks, enabled: isPromoter });

  if (!isPromoter)
    return (
      <Page narrow>
        <EmptyState icon="task_alt" title="Task Corner is for Zinda promoters" description="Contact support if you'd like to become a promoter." />
      </Page>
    );

  return (
    <Page
      title="Task Corner"
      subtitle="Complete tasks, upload proof and earn commission"
      action={
        <a href={SUPPORT.taskGroup} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white">
          <Icon name="group" className="text-lg" /> Promoters group
        </a>
      }
    >
      {tasks.isLoading ? (
        <PageSpinner />
      ) : tasks.isError ? (
        <ErrorState error={tasks.error} onRetry={() => tasks.refetch()} />
      ) : !tasks.data?.length ? (
        <EmptyState icon="task_alt" title="No tasks assigned yet" description="New tasks will appear here." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {tasks.data.map((t) => (
            <TaskCard key={t._id} assigned={t} />
          ))}
        </div>
      )}
    </Page>
  );
}

function TaskCard({ assigned }: { assigned: AssignedTask }) {
  const toast = useToast();
  const qc = useQueryClient();
  const pick = useFilePicker();
  const task = assigned.task;
  const status = STATUS[assigned.status ?? "assigned"] ?? STATUS.assigned;
  const canSubmit = assigned.status === "assigned" || assigned.status === "rejected";

  const submit = useMutation({
    mutationFn: async () => {
      const file = await pick("image/*");
      if (!file) return false;
      if (tooLarge(file, 20)) throw new Error("Image must be under 20 MB.");
      await extrasApi.submitEvidence(assigned._id, file);
      return true;
    },
    onSuccess: (done) => {
      if (!done) return;
      toast("Proof submitted for review", "success");
      void qc.invalidateQueries({ queryKey: ["assigned-tasks"] });
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(() => undefined);
    toast("Copied", "success");
  };

  if (!task) return null;
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">{task.title}</h2>
          {task.dueDate && <p className="text-xs text-on-surface-variant">Due {formatDate(task.dueDate)}</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase", status.className)}>{status.label}</span>
      </div>
      {task.referenceImageUrl && <img src={task.referenceImageUrl} alt="" className="max-h-60 w-full rounded-2xl object-cover" />}
      {task.description && <p className="whitespace-pre-line text-sm leading-relaxed">{task.description}</p>}

      {!!task.commissionAmount && (
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
          <Icon name="payments" /> Earn {money(task.commissionAmount)}
        </p>
      )}

      {(task.taskLink || task.caption) && (
        <div className="space-y-2 rounded-2xl bg-surface-container-low p-4 text-sm">
          {task.taskLink && (
            <div className="flex items-center gap-2">
              <Icon name="link" className="text-primary" />
              <a href={task.taskLink} target="_blank" rel="noreferrer" className="flex-1 truncate font-semibold text-primary hover:underline">
                {task.taskLink}
              </a>
              <button onClick={() => copy(task.taskLink!)} aria-label="Copy link" className="rounded-lg p-1 hover:bg-surface-container">
                <Icon name="content_copy" className="text-lg" />
              </button>
            </div>
          )}
          {task.caption && (
            <div className="flex items-start gap-2">
              <Icon name="notes" className="text-primary" />
              <p className="flex-1 whitespace-pre-line">{task.caption}</p>
              <button onClick={() => copy(task.caption!)} aria-label="Copy caption" className="rounded-lg p-1 hover:bg-surface-container">
                <Icon name="content_copy" className="text-lg" />
              </button>
            </div>
          )}
        </div>
      )}

      {assigned.reviewComment && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <b>Reviewer:</b> {assigned.reviewComment}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        {task.adminDocumentUrl && task.allowDownload !== false && (
          <Button asChild variant="outline" size="sm">
            <a href={task.adminDocumentUrl} target="_blank" rel="noreferrer" download>
              <Icon name="download" className="text-base" /> Document
            </a>
          </Button>
        )}
        {task.adminDocumentUrl && task.allowShare !== false && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                if (navigator.share) await navigator.share({ url: task.adminDocumentUrl, text: task.caption });
                else await copy(task.adminDocumentUrl!);
              } catch {
                // cancelled
              }
            }}
          >
            <Icon name="share" className="text-base" /> Share
          </Button>
        )}
        {assigned.evidenceUrl && (
          <Button asChild variant="ghost" size="sm">
            <a href={assigned.evidenceUrl} target="_blank" rel="noreferrer">
              <Icon name="image" className="text-base" /> My proof
            </a>
          </Button>
        )}
        {canSubmit && (
          <Button size="sm" className="ml-auto" loading={submit.isPending} onClick={() => submit.mutate()}>
            <Icon name="upload" className="text-base" /> {assigned.status === "rejected" ? "Resubmit proof" : "Upload proof"}
          </Button>
        )}
      </div>
    </article>
  );
}
