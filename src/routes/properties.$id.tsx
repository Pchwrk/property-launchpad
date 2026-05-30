import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/domova/MobileShell";
import { useT } from "@/lib/domova/i18n";

function PropertyNotFound() {
  const t = useT();
  return (
    <MobileShell title={t("Properties")} backTo="/" backLabel={t("Properties")}>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">
          {t("Property not found. This can happen if a session-only draft was lost after refresh.")}
        </p>
        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--domova-accent)]"
        >
          ← {t("Properties")}
        </Link>
      </div>
    </MobileShell>
  );
}

export const Route = createFileRoute("/properties/$id")({
  component: () => <Outlet />,
  notFoundComponent: PropertyNotFound,
});