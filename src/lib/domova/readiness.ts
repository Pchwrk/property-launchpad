import type { CategoryId, PhotoItem, Property, Task } from "./types";

export function tasksByCategory(p: Property, categoryId: CategoryId): Task[] {
  return p.tasks.filter((t) => t.categoryId === categoryId);
}

export function categoryProgress(p: Property, categoryId: CategoryId) {
  const list = tasksByCategory(p, categoryId);
  const counted = list.filter((t) => t.status !== "na");
  const done = counted.filter((t) => t.status === "done").length;
  const total = counted.length;
  const openBlockers = list.filter((t) => t.severity === "blocking" && t.status === "todo").length;
  return { done, total, openBlockers };
}

export function blockers(p: Property): Task[] {
  return p.tasks.filter((t) => t.severity === "blocking" && t.status === "todo");
}

export function requiredOpen(p: Property): Task[] {
  return p.tasks.filter((t) => t.severity === "required" && t.status === "todo");
}

export function missingRequiredPhotos(p: Property): PhotoItem[] {
  return p.photos.filter((ph) => ph.required && ph.status !== "approved");
}

export function nextTask(p: Property): Task | null {
  return (
    p.tasks.find((t) => t.severity === "blocking" && t.status === "todo") ??
    p.tasks.find((t) => t.severity === "required" && t.status === "todo") ??
    p.tasks.find((t) => t.severity === "optional" && t.status === "todo") ??
    null
  );
}

export function overallProgress(p: Property) {
  const counted = p.tasks.filter((t) => t.status !== "na");
  const done = counted.filter((t) => t.status === "done").length;
  return { done, total: counted.length, pct: counted.length ? Math.round((done / counted.length) * 100) : 0 };
}

export function isReady(p: Property): boolean {
  return (
    blockers(p).length === 0 &&
    requiredOpen(p).length === 0 &&
    missingRequiredPhotos(p).length === 0
  );
}

function doneByKey(p: Property, key: string): boolean {
  const t = p.tasks.find((x) => x.key === key);
  return !!t && t.status === "done";
}

export interface PlatformCheck {
  label: string;
  ok: boolean;
}

export function airbnbChecks(p: Property): PlatformCheck[] {
  return [
    { label: "Airbnb draft listing created", ok: doneByKey(p, "airbnb_draft") },
    { label: "House rules drafted", ok: doneByKey(p, "house_rules") },
    { label: "Hero photo approved", ok: doneByKey(p, "hero_selected") },
    { label: "All required photos approved", ok: missingRequiredPhotos(p).length === 0 },
  ];
}

export function bookingChecks(p: Property): PlatformCheck[] {
  return [
    { label: "Booking.com draft listing created", ok: doneByKey(p, "booking_draft") },
    { label: "Payout details confirmed", ok: doneByKey(p, "payout_confirmed") },
    { label: "Check-in instructions drafted", ok: doneByKey(p, "checkin_instructions") },
    { label: "All required photos approved", ok: missingRequiredPhotos(p).length === 0 },
  ];
}

export function airbnbReady(p: Property): boolean {
  return isReady(p) && airbnbChecks(p).every((c) => c.ok);
}

export function bookingReady(p: Property): boolean {
  return isReady(p) && bookingChecks(p).every((c) => c.ok);
}