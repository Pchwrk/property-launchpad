import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MobileShell } from "@/components/domova/MobileShell";
import { useDomova } from "@/lib/domova/store";
import { useT } from "@/lib/domova/i18n";
import { type PhotoItem, type PhotoStatus } from "@/lib/domova/types";
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

// Display labels: "uploaded" reads as "Available" in UI to avoid implying a real upload.
// The PhotoStatus enum value is NOT renamed.
const PHOTO_STATUS_DISPLAY: Record<PhotoStatus, string> = {
  missing: "Missing",
  uploaded: "Available",
  approved: "Approved",
  retake: "Retake",
};

function cycle(s: PhotoStatus): PhotoStatus {
  return ORDER[(ORDER.indexOf(s) + 1) % ORDER.length];
}

function PhotosPage() {
  const { id } = Route.useParams();
  const {
    getProperty,
    setPhotoStatus,
    addCustomPhoto,
    updatePhotoItem,
    deletePhotoItem,
    hydrated,
  } = useDomova();
  const t = useT();
  const property = getProperty(id);
  if (!property) {
    if (!hydrated) return null;
    throw notFound();
  }

  const requiredTotal = property.photos.filter((p) => p.required).length;
  const requiredApproved =
    requiredTotal - missingRequiredPhotos(property).length;

  const customPhotos = property.photos.filter((p) => p.isCustom);
  const defaultPhotos = property.photos.filter((p) => !p.isCustom);

  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newRequired, setNewRequired] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editRequired, setEditRequired] = useState(true);
  const [editNote, setEditNote] = useState("");

  function resetAdd() {
    setNewLabel("");
    setNewRequired(true);
    setNewNote("");
    setShowAdd(false);
  }

  function startEdit(p: PhotoItem) {
    setEditingId(p.id);
    setEditLabel(p.label);
    setEditRequired(p.required);
    setEditNote(p.note ?? "");
  }

  function saveEdit() {
    if (!editingId) return;
    updatePhotoItem(property!.id, editingId, {
      label: editLabel,
      required: editRequired,
      note: editNote,
    });
    setEditingId(null);
  }

  function handleDelete(p: PhotoItem) {
    if (typeof window === "undefined") return;
    if (window.confirm(t("Delete this custom photo item?"))) {
      deletePhotoItem(property!.id, p.id);
      if (editingId === p.id) setEditingId(null);
    }
  }

  function handleAdd() {
    const id = addCustomPhoto(property!.id, {
      label: newLabel,
      required: newRequired,
      note: newNote,
    });
    if (id) resetAdd();
  }

  return (
    <MobileShell
      title={t("Photo readiness")}
      subtitle={`${requiredApproved}/${requiredTotal} ${t("required approved")}`}
      backTo="/properties/$id"
      backLabel={property.name}
    >
      <div className="mb-3 space-y-1.5 rounded-lg border border-border bg-card/60 p-3 text-[11px] text-muted-foreground">
        <p>
          {t(
            "Track photo readiness here. This prototype does not upload or store image files. Use the statuses to mark whether each photo is missing, available outside the app, approved, or needs retake.",
          )}
        </p>
        <p>
          {t("Available = you have the photo somewhere else; it is not uploaded here.")}
        </p>
        <p className="text-foreground/80">{t("Tap a status to change it.")}</p>
      </div>

      <div className="mb-3">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-lg border border-dashed border-border bg-card px-3 py-2 text-sm font-medium text-[color:var(--domova-accent)] hover:border-[color:var(--domova-accent)]/40"
          >
            + {t("Add photo item")}
          </button>
        ) : (
          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <label className="block text-[11px] font-medium text-muted-foreground">
              {t("Photo label")}
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>
            <div className="flex gap-2 text-[11px]">
              <label className="flex flex-1 items-center gap-1.5 rounded-md border border-border px-2 py-1.5">
                <input
                  type="radio"
                  checked={newRequired}
                  onChange={() => setNewRequired(true)}
                />
                {t("Required photo")}
              </label>
              <label className="flex flex-1 items-center gap-1.5 rounded-md border border-border px-2 py-1.5">
                <input
                  type="radio"
                  checked={!newRequired}
                  onChange={() => setNewRequired(false)}
                />
                {t("Optional photo")}
              </label>
            </div>
            <label className="block text-[11px] font-medium text-muted-foreground">
              {t("Note")}
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim()}
                className="flex-1 rounded-md bg-[color:var(--domova-accent)] px-3 py-1.5 text-sm font-medium text-[color:var(--domova-accent-foreground)] disabled:opacity-50"
              >
                {t("Save photo item")}
              </button>
              <button
                onClick={resetAdd}
                className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {customPhotos.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Custom photos")}
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {customPhotos.map((photo) => renderPhoto(photo))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("Default requirements")}
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {defaultPhotos.map((photo) => renderPhoto(photo))}
        </ul>
      </section>
    </MobileShell>
  );

  function renderPhoto(photo: PhotoItem) {
    const isEditing = editingId === photo.id;
    return (
      <li
        key={photo.id}
        className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
      >
        <div
          className="flex aspect-video items-center justify-center rounded-lg bg-muted text-2xl text-muted-foreground"
          aria-hidden="true"
        >
          📷
        </div>
        <div>
          {/* Custom labels are user-entered → never translated. System labels go through t(). */}
          <p className="text-sm font-medium">
            {photo.isCustom ? photo.label : t(photo.label)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {photo.required ? t("Required") : t("Optional")}
          </p>
        </div>
        <button
          onClick={() => setPhotoStatus(property!.id, photo.id, cycle(photo.status))}
          aria-label={`${t(PHOTO_STATUS_DISPLAY[photo.status])} — ${t("Tap a status to change it.")}`}
          className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STYLE[photo.status]}`}
        >
          {t(PHOTO_STATUS_DISPLAY[photo.status])}
        </button>
        {photo.isCustom ? (
          <span className="inline-flex w-fit items-center rounded-full border border-[color:var(--domova-accent)]/40 bg-[color:var(--domova-accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--domova-accent)]">
            {t("Custom photo")}
          </span>
        ) : (
          <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {t("Default requirement")}
          </span>
        )}
        {photo.note && !isEditing && (
          <p className="text-[11px] italic text-muted-foreground">{photo.note}</p>
        )}
        {photo.isCustom && !isEditing && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => startEdit(photo)}
              className="flex-1 rounded-md border border-border px-2 py-1 text-[11px]"
            >
              {t("Edit")}
            </button>
            <button
              onClick={() => handleDelete(photo)}
              className="flex-1 rounded-md border border-[color:var(--severity-blocking)]/40 px-2 py-1 text-[11px] text-[color:var(--severity-blocking)]"
            >
              {t("Delete")}
            </button>
          </div>
        )}
        {photo.isCustom && isEditing && (
          <div className="space-y-2 pt-1">
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder={t("Photo label")}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-[12px]"
            />
            <div className="flex gap-1 text-[10px]">
              <label className="flex flex-1 items-center gap-1 rounded-md border border-border px-1.5 py-1">
                <input
                  type="radio"
                  checked={editRequired}
                  onChange={() => setEditRequired(true)}
                />
                {t("Required")}
              </label>
              <label className="flex flex-1 items-center gap-1 rounded-md border border-border px-1.5 py-1">
                <input
                  type="radio"
                  checked={!editRequired}
                  onChange={() => setEditRequired(false)}
                />
                {t("Optional")}
              </label>
            </div>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder={t("Note")}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-[12px]"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={!editLabel.trim()}
                className="flex-1 rounded-md bg-[color:var(--domova-accent)] px-2 py-1 text-[11px] font-medium text-[color:var(--domova-accent-foreground)] disabled:opacity-50"
              >
                {t("Save changes")}
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 rounded-md border border-border px-2 py-1 text-[11px]"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        )}
      </li>
    );
  }
}