import { useT } from "@/lib/domova/i18n";

interface Props {
  ready: boolean;
  blockerCount: number;
  size?: "sm" | "md";
}

export function ReadinessBadge({ ready, blockerCount, size = "sm" }: Props) {
  const t = useT();
  const padding = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[11px]";
  if (ready) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-[color:var(--status-ready)]/40 bg-[color:var(--status-ready)]/15 font-medium text-[color:var(--status-ready)] ${padding}`}
      >
        ● {t("Ready")}
      </span>
    );
  }
  if (blockerCount > 0) {
    const word = blockerCount === 1 ? t("blocker_one") : t("blocker_many");
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-[color:var(--severity-blocking)]/40 bg-[color:var(--severity-blocking)]/15 font-medium text-[color:var(--severity-blocking)] ${padding}`}
      >
        ● {blockerCount} {word === "blocker_one" || word === "blocker_many"
          ? `blocker${blockerCount === 1 ? "" : "s"}`
          : word}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-muted font-medium text-muted-foreground ${padding}`}
    >
      ● {t("Draft")}
    </span>
  );
}