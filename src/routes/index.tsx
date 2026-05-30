import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
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
  const { properties, createDraft } = useDomova();
  const navigate = useNavigate();
  const t = useT();

  const handleNewDraft = () => {
    const id = createDraft();
    navigate({ to: "/properties/$id", params: { id } });
  };

  return (
    <MobileShell
      title={t("Properties")}
      subtitle={`${properties.length} ${t("Properties")}`}
    >
      <button
        onClick={handleNewDraft}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
      >
        <Plus className="h-4 w-4 text-[color:var(--domova-accent)]" />
        {t("New draft property")}
      </button>

      <ul className="space-y-3">
        {properties.map((p) => {
          const ready = isReady(p);
          const blockerCount = blockers(p).length;
          const progress = overallProgress(p);
          return (
            <li key={p.id}>
              <Link
                to="/properties/$id"
                params={{ id: p.id }}
                className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[color:var(--domova-accent)]/40"
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
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl border border-border bg-card p-3">
        <p className="text-[11px] font-medium text-foreground">{t("Quick test path")}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("Open Sunlit Studio → resolve Booking.com draft listing → approve remaining photo → check Launch review.")}
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        {t("Prototype · no real owner, address, or credentials are stored.")}
      </p>
    </MobileShell>
  );
}
