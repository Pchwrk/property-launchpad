import { createFileRoute, notFound } from "@tanstack/react-router";
import { MobileShell } from "@/components/domova/MobileShell";
import { useDomova } from "@/lib/domova/store";
import { useT } from "@/lib/domova/i18n";
import { PHOTO_STATUS_LABEL, type PhotoStatus } from "@/lib/domova/types";
import { missingRequiredPhotos } from "@/lib/domova/readiness";

export const Route = createFileRoute("/properties/$id/photos")({
  head: () => ({ meta: [{ title: "Photo readiness · DOMOVA" }] }),
  component: PhotosPage,
});

const ORDER: PhotoStatus[] = ["missing", "uploaded", "approved", "retake"];
const STYLE: Record<PhotoStatus, string> = {
  missing: "border-border bg-muted text-muted-foreground",
  uploaded: "border-[color:var(--severity-required)]/40 bg-[color:var(--severity-required)]/15 text-[color:var(--severity-required)]",
  approved: "border-[color:var(--status-ready)]/40 bg-[color:var(--status-ready)]/15 text-[color:var(--status-ready)]",
  retake: "border-[color:var(--severity-blocking)]/40 bg-[color:var(--severity-blocking)]/15 text-[color:var(--severity-blocking)]",
};

function cycle(s: PhotoStatus): PhotoStatus {
  return ORDER[(ORDER.indexOf(s) + 1) % ORDER.length];
}

function PhotosPage() {
  const { id } = Route.useParams();
  const { getProperty, setPhotoStatus, hydrated } = useDomova();
  const t = useT();
  const property = getProperty(id);
  if (!property) {
    if (!hydrated) return null;
    throw notFound();
  }

  const requiredTotal = property.photos.filter((p) => p.required).length;
  const requiredApproved =
    requiredTotal - missingRequiredPhotos(property).length;

  return (
    <MobileShell
      title={t("Photo readiness")}
      subtitle={`${requiredApproved}/${requiredTotal} ${t("required approved")}`}
      backTo="/properties/$id"
      backLabel={property.name}
    >
      <p className="mb-3 text-[11px] text-muted-foreground">
        {t("Tap each tile to cycle: missing → uploaded → approved → retake. No files are uploaded in this prototype.")}
      </p>
      <ul className="grid grid-cols-2 gap-3">
        {property.photos.map((photo) => (
          <li key={photo.id}>
            <button
              onClick={() => setPhotoStatus(property.id, photo.id, cycle(photo.status))}
              className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-[color:var(--domova-accent)]/40"
            >
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-2xl text-muted-foreground">
                📷
              </div>
              <div>
                <p className="text-sm font-medium">{t(photo.label)}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {photo.required ? t("Required") : t("Optional")}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STYLE[photo.status]}`}
              >
                {t(PHOTO_STATUS_LABEL[photo.status])}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </MobileShell>
  );
}