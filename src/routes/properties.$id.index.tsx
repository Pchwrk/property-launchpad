import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Camera, ChevronRight, Rocket } from "lucide-react";
import { MobileShell } from "@/components/domova/MobileShell";
import { ReadinessBadge } from "@/components/domova/ReadinessBadge";
import { SeverityChip } from "@/components/domova/SeverityChip";
import { SafeDetailsCard } from "@/components/domova/SafeDetailsCard";
import { useDomova } from "@/lib/domova/store";
import { CATEGORIES } from "@/lib/domova/types";
import {
  airbnbReady,
  blockers,
  bookingReady,
  categoryProgress,
  isReady,
  missingRequiredPhotos,
  nextTask,
  tasksByCategory,
} from "@/lib/domova/readiness";

export const Route = createFileRoute("/properties/$id/")({
  head: ({ params }) => ({
    meta: [
      { title: `Property · ${params.id} · DOMOVA` },
      { name: "description", content: "Property onboarding overview." },
    ],
  }),
  component: PropertyOverview,
});

function PropertyOverview() {
  const { id } = Route.useParams();
  const { getProperty } = useDomova();
  const property = getProperty(id);
  if (!property) throw notFound();

  const ready = isReady(property);
  const blockerList = blockers(property);
  const next = nextTask(property);
  const photosNeed = missingRequiredPhotos(property).length;
  const aReady = airbnbReady(property);
  const bReady = bookingReady(property);

  return (
    <MobileShell
      title={property.name}
      subtitle={property.city}
      backTo="/"
      backLabel="Properties"
      right={<ReadinessBadge ready={ready} blockerCount={blockerList.length} />}
      footer={
        <div className="flex gap-2">
          <Link
            to="/properties/$id/photos"
            params={{ id }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Camera className="h-4 w-4" /> Photos
          </Link>
          <Link
            to="/properties/$id/launch"
            params={{ id }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[color:var(--domova-accent)] px-3 py-2.5 text-sm font-semibold text-background"
          >
            <Rocket className="h-4 w-4" /> Launch review
          </Link>
        </div>
      }
    >
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">{property.addressPlaceholder}</p>
        <p className="text-xs text-muted-foreground">Owner: {property.ownerPlaceholder}</p>

        <div className="mt-3 flex gap-2">
          <PlatformPill label="Airbnb" ok={aReady} />
          <PlatformPill label="Booking.com" ok={bReady} />
        </div>

        <div className="mt-4 rounded-xl bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next task</p>
          {next ? (
            <Link
              to="/properties/$id/checklist/$category"
              params={{ id, category: next.categoryId }}
              className="mt-1 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{next.title}</p>
                <p className="mt-0.5 text-[11px] text-[color:var(--domova-accent)]">Tap to resolve</p>
                <div className="mt-1">
                  <SeverityChip severity={next.severity} />
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ) : (
            <p className="mt-1 text-sm font-medium text-[color:var(--status-ready)]">
              All tasks complete 🎉
            </p>
          )}
        </div>

        {ready ? (
          <div className="mt-3 rounded-lg border border-[color:var(--status-ready)]/30 bg-[color:var(--status-ready)]/10 p-3">
            <p className="text-xs font-medium text-[color:var(--status-ready)]">
              All blocking tasks, required tasks, and required photos are complete.
            </p>
          </div>
        ) : (
          (blockerList.length > 0 || photosNeed > 0) && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="Blockers" value={blockerList.length} accent={blockerList.length > 0} />
              <Stat label="Photos to approve" value={photosNeed} accent={photosNeed > 0} />
            </div>
          )
        )}
      </section>

      <h2 className="mt-6 mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Checklist
      </h2>
      <ul className="space-y-2">
        {CATEGORIES.map((cat) => {
          const prog = categoryProgress(property, cat.id);
          const openRequired = tasksByCategory(property, cat.id).filter(
            (t) => t.severity === "required" && t.status === "todo",
          ).length;
          const hasBlockers = prog.openBlockers > 0;
          return (
            <li key={cat.id}>
              <Link
                to="/properties/$id/checklist/$category"
                params={{ id, category: cat.id }}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3 hover:border-[color:var(--domova-accent)]/40 ${
                  hasBlockers
                    ? "border-[color:var(--severity-blocking)]/50 bg-[color:var(--severity-blocking)]/5"
                    : "border-border"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{cat.title}</p>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span>
                      {prog.done}/{prog.total} done
                    </span>
                    {hasBlockers && (
                      <span className="rounded-full bg-[color:var(--severity-blocking)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--severity-blocking)]">
                        {prog.openBlockers} blocker{prog.openBlockers === 1 ? "" : "s"}
                      </span>
                    )}
                    {openRequired > 0 && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                        {openRequired} required
                      </span>
                    )}
                  </div>
                  {cat.id === "basics" && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Safe details help confirm basics, but readiness is still controlled by checklist status.
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>

      <SafeDetailsCard property={property} />
    </MobileShell>
  );
}

function PlatformPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        ok
          ? "border-[color:var(--status-ready)]/40 bg-[color:var(--status-ready)]/15 text-[color:var(--status-ready)]"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      ● {label} {ok ? "ready" : "not ready"}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5">
      <p
        className={`text-lg font-semibold ${
          accent ? "text-[color:var(--severity-blocking)]" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}