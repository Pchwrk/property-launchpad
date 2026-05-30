import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SeverityChip } from "@/components/domova/SeverityChip";
import { MobileShell } from "@/components/domova/MobileShell";
import { useDomova } from "@/lib/domova/store";
import { useT } from "@/lib/domova/i18n";
import {
  CATEGORIES,
  TASK_STATUS_LABEL,
  type CategoryId,
  type Task,
  type TaskStatus,
} from "@/lib/domova/types";
import { tasksByCategory } from "@/lib/domova/readiness";

export const Route = createFileRoute("/properties/$id/checklist/$category")({
  head: ({ params }) => ({
    meta: [{ title: `Checklist · ${params.category} · DOMOVA` }],
  }),
  component: ChecklistSection,
});

const STATUSES: TaskStatus[] = ["todo", "done", "na"];

function ChecklistSection() {
  const { id, category } = Route.useParams();
  const { getProperty, setTaskStatus, hydrated } = useDomova();
  const t = useT();
  const [openOnly, setOpenOnly] = useState(false);
  const property = getProperty(id);
  const cat = CATEGORIES.find((c) => c.id === (category as CategoryId));
  if (!property) {
    if (!hydrated) return null;
    throw notFound();
  }
  if (!cat) throw notFound();
  const tasks = tasksByCategory(property, cat.id);
  const visible = openOnly ? tasks.filter((t) => t.status === "todo") : tasks;
  const hiddenCount = tasks.length - visible.length;

  return (
    <MobileShell
      title={t(cat.title)}
      subtitle={t(cat.description)}
      backTo="/properties/$id"
      backLabel={property.name}
    >
      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("Show open only")}</p>
          <p className="text-[11px] text-muted-foreground">
            {t("Hides tasks marked done or n/a")}
            {openOnly && hiddenCount > 0 ? ` · ${hiddenCount} ${t("hidden")}` : ""}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={openOnly}
          onClick={() => setOpenOnly((v) => !v)}
          className={`relative inline-flex h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
            openOnly ? "bg-[color:var(--domova-accent)]" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-1/2 left-0.5 h-5 w-5 -translate-y-1/2 rounded-full bg-background shadow transition-transform ${
              openOnly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-3 py-4 text-center text-xs text-[color:var(--status-ready)]">
          {t("✓ No open tasks in this category.")}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onChange={(s) => setTaskStatus(property.id, task.id, s)}
          />
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        {t("Confirmation tasks never store sensitive data — codes, passwords, and contact details stay with the owner.")}
      </p>
    </MobileShell>
  );
}

function TaskRow({ task, onChange }: { task: Task; onChange: (s: TaskStatus) => void }) {
  const t = useT();
  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              task.status === "done"
                ? "text-muted-foreground line-through"
                : task.status === "na"
                  ? "text-muted-foreground"
                  : "text-foreground"
            }`}
          >
            {t(task.title)}
          </p>
          {task.hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{t(task.hint)}</p> : null}
          <div className="mt-1.5 flex items-center gap-1.5">
            <SeverityChip severity={task.severity} muted={task.status === "done"} />
            {task.isConfirmation && (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {t("Confirmation only")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Task status"
        className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-border bg-background/60 p-1"
      >
        {STATUSES.map((s) => {
          const active = task.status === s;
          return (
            <button
              key={s}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(s)}
              className={`min-h-[40px] rounded-md px-2 text-xs font-medium transition-colors ${
                active
                  ? s === "done"
                    ? "bg-[color:var(--status-ready)]/20 text-[color:var(--status-ready)]"
                    : s === "todo"
                      ? "bg-[color:var(--domova-accent)]/20 text-[color:var(--domova-accent)]"
                      : "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(TASK_STATUS_LABEL[s])}
            </button>
          );
        })}
      </div>
    </li>
  );
}