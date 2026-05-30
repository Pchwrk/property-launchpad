import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/domova/MobileShell";
import { ReadinessBadge } from "@/components/domova/ReadinessBadge";
import { useDomova } from "@/lib/domova/store";
import { useT } from "@/lib/domova/i18n";
import { blockers, isReady, overallProgress } from "@/lib/domova/readiness";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DOMOVA · Onboarding" },
      { name: "description", content: "Mobile-first onboarding checklist for new short-term rental properties." },
      { property: "og:title", content: "DOMOVA · Onboarding" },
      { property: "og:description", content: "Onboard properties before publishing to Airbnb and Booking.com." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { properties, createDraft, resetDemoData, deleteProperty, duplicateProperty } = useDomova();
  const navigate = useNavigate();
  const t = useT();
  const [pendingNavId, setPendingNavId] = useState<string | null>(null);
  const [pendingKind, setPendingKind] = useState<"draft" | "duplicate" | null>(null);

  const handleNewDraft = () => {
    if (pendingNavId) return;
    const id = createDraft();
    setPendingKind("draft");
    setPendingNavId(id);
  };

  const handleDuplicate = (id: string) => {
    if (pendingNavId) return;
    const newId = duplicateProperty(id);
    if (!newId) return;
    setPendingKind("duplicate");
    setPendingNavId(newId);
  };

  const handleDelete = (id: string, name: string) => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(`${t("Delete this property? This cannot be undone.")}\n\n${name}`);
    if (ok) deleteProperty(id);
  };

  useEffect(() => {
    if (!pendingNavId) return;
    if (properties.some((p) => p.id === pendingNavId)) {
      const id = pendingNavId;
      setPendingNavId(null);
      setPendingKind(null);
      navigate({ to: "/properties/$id", params: { id } });
    }
  }, [pendingNavId, properties, navigate]);

  const handleReset = () => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      t("Reset demo data? This clears saved drafts and progress in this browser only."),
    );
    if (ok) resetDemoData();
  };

  return (
    <MobileShell
      title={t("Properties")}
      subtitle={`${properties.length} ${t("Properties")}`}
    >
      <button
        onClick={handleNewDraft}
        disabled={pendingNavId !== null}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-60"
      >
        <Plus className="h-4 w-4 text-[color:var(--domova-accent)]" />
        {pendingNavId
          ? pendingKind === "duplicate"
            ? t("Opening duplicate…")
            : t("Opening draft…")
          : t("New draft property")}
      </button>

      {properties.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-center text-xs text-muted-foreground">
          {t("No properties yet. Tap “New draft property” to start, or reset demo data.")}
        </p>
      ) : (
      <ul className="space-y-3">
        {properties.map((p) => {
          const ready = isReady(p);
          const blockerCount = blockers(p).length;
          const progress = overallProgress(p);
          return (
            <li
              key={p.id}
              className="rounded-2xl border border-border bg-card transition-colors hover:border-[color:var(--domova-accent)]/40"
            >
              <Link
                to="/properties/$id"
                params={{ id: p.id }}
                className="block p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                    {p.cover}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{p.name}</h2>
                        <p className="truncate text-xs text-muted-foreground">{p.city}</p>
                      </div>
                      <ReadinessBadge ready={ready} blockerCount={blockerCount} />
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[color:var(--domova-accent)]"
                          style={{ width: `${progress.pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {progress.done}/{progress.total} · {progress.pct}%
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-end gap-1 border-t border-border px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => handleDuplicate(p.id)}
                  disabled={pendingNavId !== null}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t("Duplicate")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("Delete")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-3">
        <p className="text-[11px] font-medium text-foreground">{t("Quick test path")}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("Open Sunlit Studio → resolve Booking.com draft listing → approve remaining photo → check Launch review.")}
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        {t(
          "Demo data is saved only in this browser. Do not enter real addresses, contacts, codes, passwords, payout details, or documents.",
        )}
      </p>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t("Reset demo data")}
        </button>
      </div>
    </MobileShell>
  );
}
