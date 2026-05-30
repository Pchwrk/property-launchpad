import { SEVERITY_LABEL, type Severity } from "@/lib/domova/types";

const STYLE: Record<Severity, string> = {
  blocking:
    "bg-[color:var(--severity-blocking)]/15 text-[color:var(--severity-blocking)] border-[color:var(--severity-blocking)]/30",
  required:
    "bg-[color:var(--severity-required)]/15 text-[color:var(--severity-required)] border-[color:var(--severity-required)]/30",
  optional:
    "bg-[color:var(--severity-optional)]/15 text-[color:var(--severity-optional)] border-[color:var(--severity-optional)]/30",
};

const MUTED = "bg-muted/60 text-muted-foreground/70 border-border/40";

export function SeverityChip({ severity, muted }: { severity: Severity; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${muted ? MUTED : STYLE[severity]}`}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}