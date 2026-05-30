import type { CategoryId, PhotoItem, Property, Severity, Task, TaskStatus } from "./types";

type TaskSeed = {
  title: string;
  severity: Severity;
  hint?: string;
  isConfirmation?: boolean;
  key?: string;
};

const TASK_TEMPLATE: Record<CategoryId, TaskSeed[]> = {
  basics: [
    { title: "Property name set", severity: "blocking" },
    { title: "Property type selected", severity: "required" },
    { title: "Bedrooms, beds, and max guests confirmed", severity: "required" },
    { title: "Sleeping arrangements checked", severity: "required" },
    { title: "Listing description draft prepared", severity: "optional" },
  ],
  owner: [
    {
      title: "Owner contact confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — no phone numbers or emails stored.",
    },
    {
      title: "Backup contact confirmed",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no contact data stored.",
    },
    {
      title: "Owner communication preference confirmed",
      severity: "optional",
      isConfirmation: true,
      hint: "Confirm only — do not store real details.",
    },
    {
      title: "Payout details confirmed as checked",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — no payout or bank data stored.",
      key: "payout_confirmed",
    },
  ],
  documents: [
    {
      title: "Management agreement confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — no documents uploaded.",
    },
    {
      title: "Ownership / permission document checked",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — no documents uploaded.",
    },
    {
      title: "ID or company document checked",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no documents uploaded.",
    },
    {
      title: "Rental license / local registration checked",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — no documents uploaded.",
    },
    {
      title: "Tourist tax or local tax requirement checked",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no documents uploaded.",
    },
  ],
  access: [
    {
      title: "Check-in method selected",
      severity: "blocking",
    },
    {
      title: "Access / lockbox details confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — codes and key locations are never stored.",
    },
    {
      title: "Backup key plan confirmed",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no key locations stored.",
    },
    {
      title: "Key handover process confirmed",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no codes or locations stored.",
    },
    {
      title: "Emergency access process confirmed",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no codes or locations stored.",
    },
  ],
  wifi: [
    { title: "Wi-Fi available", severity: "required" },
    {
      title: "Wi-Fi details confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Confirm only — passwords are never stored.",
    },
    { title: "Electricity and water checked", severity: "blocking", isConfirmation: true },
    { title: "Heating / AC checked", severity: "required", isConfirmation: true },
    { title: "Appliance basics checked", severity: "required", isConfirmation: true },
  ],
  cleaning: [
    { title: "Cleaner assigned", severity: "blocking", isConfirmation: true },
    { title: "First cleaning scheduled", severity: "required" },
    { title: "Linens and towels ready", severity: "required" },
    { title: "Consumables stocked", severity: "required" },
    { title: "Trash instructions ready", severity: "optional" },
    { title: "Damage / maintenance reporting process confirmed", severity: "required", isConfirmation: true },
  ],
  photos: [
    { title: "Photographer or photo plan confirmed", severity: "required" },
    { title: "Staging complete", severity: "required" },
    { title: "Hero photo selected", severity: "blocking", key: "hero_selected" },
    { title: "Required room photos checked", severity: "required" },
    { title: "Entrance / building photo checked", severity: "required" },
    { title: "Retake review complete", severity: "optional" },
  ],
  rules: [
    { title: "House rules drafted", severity: "required", key: "house_rules" },
    { title: "Check-in instructions drafted", severity: "blocking", key: "checkin_instructions" },
    { title: "Check-out instructions drafted", severity: "required", key: "checkout_instructions" },
    {
      title: "Emergency contact placeholder confirmed",
      severity: "required",
      isConfirmation: true,
      hint: "Confirm only — no real emergency phone stored.",
    },
    { title: "Quiet hours / smoking / pets policy confirmed", severity: "required" },
  ],
  platform: [
    { title: "Shared listing content ready", severity: "required", key: "shared_content_ready" },
    { title: "Airbnb draft listing created", severity: "blocking", key: "airbnb_draft" },
    { title: "Booking.com draft listing created", severity: "blocking", key: "booking_draft" },
    { title: "Pricing rules drafted", severity: "required", key: "pricing_rules" },
    { title: "Calendar availability reviewed", severity: "required", key: "calendar_reviewed" },
    {
      title: "Channel-specific cancellation / policy checks confirmed",
      severity: "required",
      isConfirmation: true,
      key: "channel_policy_checks",
    },
  ],
  review: [
    { title: "Blocking issues reviewed", severity: "blocking" },
    { title: "Photo readiness approved", severity: "blocking" },
    { title: "Final inspection done", severity: "blocking" },
    { title: "Manager sign-off", severity: "blocking" },
    { title: "Ready-to-publish confirmation checked", severity: "required", isConfirmation: true },
  ],
};

const PHOTO_TEMPLATE: Omit<PhotoItem, "id" | "status">[] = [
  { label: "Hero photo", required: true },
  { label: "Living room", required: true },
  { label: "Bedroom", required: true },
  { label: "Kitchen", required: true },
  { label: "Bathroom", required: true },
  { label: "Entrance / building", required: true },
  { label: "Balcony / view", required: false },
  { label: "Parking", required: false },
  { label: "Amenities", required: false },
  { label: "Safety equipment", required: false },
];

function buildTasks(propertyId: string, completion: "high" | "mid" | "low"): Task[] {
  const out: Task[] = [];
  let i = 0;
  for (const [cat, seeds] of Object.entries(TASK_TEMPLATE) as [CategoryId, TaskSeed[]][]) {
    for (const seed of seeds) {
      i++;
      let status: TaskStatus = "todo";
      if (completion === "high") {
        status = i % 9 === 0 ? "todo" : "done";
      } else if (completion === "mid") {
        if (seed.severity === "blocking") status = i % 3 === 0 ? "todo" : "done";
        else status = i % 2 === 0 ? "done" : "todo";
      } else {
        status = i % 7 === 0 ? "done" : "todo";
      }
      out.push({
        id: `${propertyId}-t${i}`,
        categoryId: cat,
        title: seed.title,
        hint: seed.hint,
        severity: seed.severity,
        status,
        isConfirmation: seed.isConfirmation,
        key: seed.key,
      });
    }
  }
  return out;
}

function buildPhotos(propertyId: string, completion: "high" | "mid" | "low"): PhotoItem[] {
  return PHOTO_TEMPLATE.map((p, idx) => {
    let status: PhotoItem["status"] = "missing";
    if (completion === "high") status = idx === 1 ? "uploaded" : "approved";
    else if (completion === "mid") status = idx < 4 ? "approved" : idx < 6 ? "uploaded" : "missing";
    else status = idx === 0 ? "uploaded" : "missing";
    return { id: `${propertyId}-p${idx}`, label: p.label, required: p.required, status };
  });
}

export function buildEmptyTasks(propertyId: string): Task[] {
  return buildTasks(propertyId, "low").map((t) => ({ ...t, status: "todo" }));
}

export function buildEmptyPhotos(propertyId: string): PhotoItem[] {
  return PHOTO_TEMPLATE.map((p, idx) => ({
    id: `${propertyId}-p${idx}`,
    label: p.label,
    required: p.required,
    status: "missing" as const,
  }));
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "sunlit-studio",
    name: "Sunlit Studio",
    city: "Lisbon",
    addressPlaceholder: "Address placeholder",
    ownerPlaceholder: "Owner placeholder",
    cover: "🌅",
    propertyType: "studio",
    bedrooms: 0,
    beds: 1,
    maxGuests: 2,
    checkInMethod: "lockbox",
    tasks: buildTasks("sunlit-studio", "high"),
    photos: buildPhotos("sunlit-studio", "high"),
  },
  {
    id: "riverside-loft",
    name: "Riverside Loft",
    city: "Porto",
    addressPlaceholder: "Address placeholder",
    ownerPlaceholder: "Owner placeholder",
    cover: "🌉",
    propertyType: "apartment",
    bedrooms: 2,
    beds: 3,
    maxGuests: 4,
    checkInMethod: "smart_lock",
    tasks: buildTasks("riverside-loft", "mid"),
    photos: buildPhotos("riverside-loft", "mid"),
  },
  {
    id: "old-town-flat",
    name: "Old Town Flat",
    city: "Madrid",
    addressPlaceholder: "Address placeholder",
    ownerPlaceholder: "Owner placeholder",
    cover: "🏛️",
    propertyType: "apartment",
    bedrooms: 1,
    beds: 2,
    maxGuests: 3,
    checkInMethod: "host_greeting",
    tasks: buildTasks("old-town-flat", "low"),
    photos: buildPhotos("old-town-flat", "low"),
  },
];