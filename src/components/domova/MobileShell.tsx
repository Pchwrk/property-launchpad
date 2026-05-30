import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function MobileShell({ title, subtitle, backTo, backLabel, right, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            {backTo ? (
              <Link
                to={backTo}
                className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">{backLabel ?? "Back"}</span>
              </Link>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--domova-accent)]">
                DOMOVA
              </span>
            )}
            <div className="ml-1 flex-1 truncate">
              <h1 className="truncate text-base font-semibold">{title}</h1>
              {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
            {right}
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
        {footer ? (
          <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}