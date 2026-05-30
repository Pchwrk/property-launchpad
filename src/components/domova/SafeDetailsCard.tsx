import { useDomova } from "@/lib/domova/store";
import { useT } from "@/lib/domova/i18n";
import {
  CHECK_IN_METHOD_LABEL,
  PROPERTY_TYPE_LABEL,
  type CheckInMethod,
  type Property,
  type PropertyType,
} from "@/lib/domova/types";

export function SafeDetailsCard({ property }: { property: Property }) {
  const { updatePropertyDetails } = useDomova();
  const t = useT();
  const update = (partial: Parameters<typeof updatePropertyDetails>[1]) =>
    updatePropertyDetails(property.id, partial);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("Safe property details")}
        </h2>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {t("Session only")}
        </span>
      </div>

      <div className="space-y-3">
        <Field label={t("Property name")}>
          <input
            type="text"
            value={property.name}
            onChange={(e) => update({ name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
          />
        </Field>

        <Field label={t("City")}>
          <input
            type="text"
            value={property.city}
            onChange={(e) => update({ city: e.target.value })}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
          />
        </Field>

        <Field label={t("Property type")}>
          <select
            value={property.propertyType}
            onChange={(e) => update({ propertyType: e.target.value as PropertyType })}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
          >
            {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((k) => (
              <option key={k} value={k}>
                {t(PROPERTY_TYPE_LABEL[k])}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label={t("Bedrooms")}
            value={property.bedrooms}
            min={0}
            onChange={(v) => update({ bedrooms: v })}
          />
          <NumberField
            label={t("Beds")}
            value={property.beds}
            min={1}
            onChange={(v) => update({ beds: v })}
          />
          <NumberField
            label={t("Max guests")}
            value={property.maxGuests}
            min={1}
            onChange={(v) => update({ maxGuests: v })}
          />
        </div>

        <Field label={t("Check-in method")}>
          <select
            value={property.checkInMethod}
            onChange={(e) => update({ checkInMethod: e.target.value as CheckInMethod })}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
          >
            {(Object.keys(CHECK_IN_METHOD_LABEL) as CheckInMethod[]).map((k) => (
              <option key={k} value={k}>
                {t(CHECK_IN_METHOD_LABEL[k])}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {t(
          "No address, contacts, codes, passwords, or payout fields are stored. Edits live only in this browser session.",
        )}
      </p>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(value + 1);
  return (
    <div>
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center rounded-lg border border-border bg-background/60">
        <button
          type="button"
          onClick={dec}
          aria-label={`Decrease ${label}`}
          className="h-10 w-10 shrink-0 text-base text-muted-foreground hover:text-foreground"
        >
          −
        </button>
        <span className="flex-1 text-center text-sm font-medium tabular-nums">{value}</span>
        <button
          type="button"
          onClick={inc}
          aria-label={`Increase ${label}`}
          className="h-10 w-10 shrink-0 text-base text-muted-foreground hover:text-foreground"
        >
          +
        </button>
      </div>
    </div>
  );
}