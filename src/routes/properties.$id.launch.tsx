import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { MobileShell } from "@/components/domova/MobileShell";
import { ReadinessBadge } from "@/components/domova/ReadinessBadge";
import { SeverityChip } from "@/components/domova/SeverityChip";
import { useDomova } from "@/lib/domova/store";
import {
  airbnbChecks,
  airbnbReady,
  blockers,
  bookingChecks,
  bookingReady,
  isReady,
  missingRequiredPhotos,
  requiredOpen,
} from "@/lib/domova/readiness";

export const Route = createFileRoute("/properties/$id/launch")({
  head: () => ({ meta: [{ title: "Launch readiness · DOMOVA" }] }),
  component: LaunchPage,
});

function LaunchPage() {
  const { id } = Route.useParams();
  const { getProperty } = useDomova();
  const property = getProperty(id);
  if (!property) throw notFound();

  const ready = isReady(property);
  const blockerList = blockers(property);
  const requiredList = requiredOpen(property);
  const photoList = missingRequiredPhotos(property);
  const aReady = airbnbReady(property);
  const bReady = bookingReady(property);
  const aChecks = airbnbChecks(property);
  const bChecks = bookingChecks(property);

  return (
    <MobileShell
      title="Launch readiness"
      subtitle={property.name}
      backTo="/properties/$id"
      backLabel={property.name}
      footer={
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Publishing is disabled in this prototype. Buttons only unlock when computed readiness passes.
          </p>
          <div className="flex gap-2">
            <button
              disabled={!aReady}
              className="flex-1 rounded-lg bg-[color:var(--domova-accent)] px-3 py-2.5 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish to Airbnb
            </button>
            <button
              disabled={!bReady}
              className="flex-1 rounded-lg bg-[color:var(--domova-accent)] px-3 py-2.5 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish to Booking
            </button>
          </div>
        </div>
      }
    >
      <section
        className={`rounded-2xl border p-4 ${
          ready
            ? "border-[color:var(--status-ready)]/40 bg-[color:var(--status-ready)]/10"
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall</p>
            <h2 className="mt-0.5 text-xl font-semibold">
              {ready ? "Ready to publish" : "Not ready"}
            </h2>
          </div>
          <ReadinessBadge ready={ready} blockerCount={blockerList.length} size="md" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Computed from task & photo status — never set manually.
        </p>
        {ready ? (
          <p className="mt-2 text-xs font-medium text-[color:var(--status-ready)]">
            All blocking tasks, required tasks, and required photos are complete.
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Resolve the listed items, then return here.
          </p>
        )}
      </section>

      <Section title="Blocking tasks" empty="No blockers remaining.">
        {blockerList.map((t) => (
          <IssueRow
            key={t.id}
            to={{ id, category: t.categoryId }}
            title={t.title}
            chip={<SeverityChip severity={t.severity} />}
          />
        ))}
      </Section>

      <Section title="Required tasks open" empty="All required tasks complete.">
        {requiredList.map((t) => (
          <IssueRow
            key={t.id}
            to={{ id, category: t.categoryId }}
            title={t.title}
            chip={<SeverityChip severity={t.severity} />}
          />
        ))}
      </Section>

      <Section title="Required photos" empty="All required photos approved.">
        {photoList.map((p) => (
          <Link
            key={p.id}
            to="/properties/$id/photos"
            params={{ id }}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <span>{p.label}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {p.status}
            </span>
          </Link>
        ))}
      </Section>

      <PlatformSection title="Airbnb checks" checks={aChecks} ready={aReady} />
      <PlatformSection title="Booking.com checks" checks={bChecks} ready={bReady} />
    </MobileShell>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : children ? [children] : [];
  const isEmpty = items.length === 0;
  return (
    <section className="mt-6">
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {isEmpty ? (
        <p className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-[color:var(--status-ready)]">
          ✓ {empty}
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </section>
  );
}

function IssueRow({
  to,
  title,
  chip,
}: {
  to: { id: string; category: string };
  title: string;
  chip: React.ReactNode;
}) {
  return (
    <Link
      to="/properties/$id/checklist/$category"
      params={to}
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
    >
      <span className="min-w-0 truncate">{title}</span>
      {chip}
    </Link>
  );
}

function PlatformSection({
  title,
  checks,
  ready,
}: {
  title: string;
  checks: { label: string; ok: boolean }[];
  ready: boolean;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span
          className={`text-[11px] font-medium ${
            ready ? "text-[color:var(--status-ready)]" : "text-muted-foreground"
          }`}
        >
          {ready ? "Ready" : "Not ready"}
        </span>
      </div>
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li
            key={c.label}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            {c.ok ? (
              <Check className="h-4 w-4 text-[color:var(--status-ready)]" />
            ) : (
              <X className="h-4 w-4 text-[color:var(--severity-blocking)]" />
            )}
            <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}