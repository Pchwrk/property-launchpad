import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SeverityChip } from "@/components/domova/SeverityChip";
import { MobileShell } from "@/components/domova/MobileShell";
import { SafeDetailsCard } from "@/components/domova/SafeDetailsCard";
import { useDomova } from "@/lib/domova/store";
import { useT } from "@/lib/domova/i18n";
import {
  CATEGORIES,
  TASK_STATUS_LABEL,
  SEVERITY_LABEL,
  type CategoryId,
  type Severity,
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
const SEVERITIES: Severity[] = ["blocking", "required", "optional"];

function ChecklistSection() {
  const { id, category } = Route.useParams();
  const { getProperty, setTaskStatus, hydrated, addCustomTask, updateTask, deleteTask } =
    useDomova();
  const t = useT();
  const [openOnly, setOpenOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHint, setNewHint] = useState("");
  const [newSeverity, setNewSeverity] = useState<Severity>("required");
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

  const resetAddForm = () => {
    setNewTitle("");
    setNewHint("");
    setNewSeverity("required");
  };

  const handleAdd = () => {
    const id = addCustomTask(property.id, cat.id, {
      title: newTitle,
      hint: newHint,
      severity: newSeverity,
    });
    if (id) {
      resetAddForm();
      setAddOpen(false);
    }
  };

  return (
    <MobileShell
      title={t(cat.title)}
      subtitle={t(cat.description)}
      backTo="/properties/$id"
      backLabel={property.name}
    >
      {cat.id === "basics" ? (
        <>
          <SafeDetailsCard property={property} />
          <p className="mt-2 mb-4 text-[11px] text-muted-foreground">
            {t(
              "Update the safe details here, then mark the matching checklist items done when confirmed.",
            )}
          </p>
        </>
      ) : null}

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
            onEdit={(partial) => updateTask(property.id, task.id, partial)}
            onDelete={() => {
              if (typeof window === "undefined") return;
              const ok = window.confirm(t("Delete this custom task?"));
              if (ok) deleteTask(property.id, task.id);
            }}
          />
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        {addOpen ? (
          <div className="space-y-2">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("Task title")}
              </span>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("Helper note")}
              </span>
              <input
                type="text"
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
              />
            </label>
            <div>
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("Severity")}
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-background/60 p-1">
                {SEVERITIES.map((s) => {
                  const active = newSeverity === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewSeverity(s)}
                      className={`min-h-[36px] rounded-md px-2 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[color:var(--domova-accent)]/20 text-[color:var(--domova-accent)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t(SEVERITY_LABEL[s])}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetAddForm();
                  setAddOpen(false);
                }}
                className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="rounded-md bg-[color:var(--domova-accent)] px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
              >
                {t("Save task")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-[color:var(--domova-accent)] hover:bg-muted"
          >
            + {t("Add task")}
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        {t("Confirmation tasks never store sensitive data — codes, passwords, and contact details stay with the owner.")}
      </p>
    </MobileShell>
  );
}

function TaskRow({
  task,
  onChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  onChange: (s: TaskStatus) => void;
  onEdit: (partial: { title?: string; hint?: string; severity?: Severity }) => void;
  onDelete: () => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [hint, setHint] = useState(task.hint ?? "");
  const [severity, setSeverity] = useState<Severity>(task.severity);

  const startEdit = () => {
    setTitle(task.title);
    setHint(task.hint ?? "");
    setSeverity(task.severity);
    setEditing(true);
  };

  const save = () => {
    onEdit({ title, hint, severity });
    setEditing(false);
  };

  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/60 px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder={t("Helper note")}
                className="w-full rounded-lg border border-border bg-background/60 px-2 py-1.5 text-xs"
              />
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-background/60 p-1">
                {SEVERITIES.map((s) => {
                  const active = severity === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`min-h-[32px] rounded-md px-2 text-[11px] font-medium transition-colors ${
                        active
                          ? "bg-[color:var(--domova-accent)]/20 text-[color:var(--domova-accent)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t(SEVERITY_LABEL[s])}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
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
              {task.hint ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t(task.hint)}</p>
              ) : null}
              <div className="mt-1.5 flex items-center gap-1.5">
                <SeverityChip severity={task.severity} muted={task.status === "done"} />
                {task.isCustom ? (
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {t("Custom task")}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {editing ? (
            <>
              <button
                type="button"
                onClick={save}
                disabled={!title.trim()}
                className="rounded-md bg-[color:var(--domova-accent)]/20 px-2 py-1 text-[11px] font-medium text-[color:var(--domova-accent)] disabled:opacity-50"
              >
                {t("Save changes")}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {t("Cancel")}
              </button>
            </>
          ) : (
            <>
              {task.isCustom ? (
                <>
                  <button
                    type="button"
                    onClick={startEdit}
                    className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {t("Edit")}
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-md px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10"
                  >
                    {t("Delete task")}
                  </button>
                </>
              ) : null}
            </>
          )}
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