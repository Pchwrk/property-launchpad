import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeverityChip } from "@/components/domova/SeverityChip";
import { MobileShell } from "@/components/domova/MobileShell";
import { useDomova } from "@/lib/domova/store";
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
  const { getProperty, setTaskStatus } = useDomova();
  const property = getProperty(id);
  if (!property) throw notFound();
  const cat = CATEGORIES.find((c) => c.id === (category as CategoryId));
  if (!cat) throw notFound();

  const tasks = tasksByCategory(property, cat.id);

  return (
    <MobileShell
      title={cat.title}
      subtitle={cat.description}
      backTo="/properties/$id"
      backLabel={property.name}
    >
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onChange={(s) => setTaskStatus(property.id, task.id, s)}
          />
        ))}
      </ul>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Confirmation tasks never store sensitive data — codes, passwords, and contact details stay
        with the owner.
      </p>
    </MobileShell>
  );
}

function TaskRow({ task, onChange }: { task: Task; onChange: (s: TaskStatus) => void }) {
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
            {task.title}
          </p>
          {task.hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{task.hint}</p> : null}
          <div className="mt-1.5 flex items-center gap-1.5">
            <SeverityChip severity={task.severity} muted={task.status === "done"} />
            {task.isConfirmation && (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                Confirmation only
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
              {TASK_STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>
    </li>
  );
}