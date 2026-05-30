import type { CategoryId, PhotoItem, Property, Severity, Task, TaskStatus } from "./types";

type TaskSeed = {
  title: string;
  severity: Severity;
  hint?: string;
  isConfirmation?: boolean;
};

const TASK_TEMPLATE: Record<CategoryId, TaskSeed[]> = {
  basics: [
    { title: "Property name set", severity: "blocking" },
    { title: "Property type selected", severity: "required" },
    { title: "Max guests confirmed", severity: "required" },
    { title: "Bedrooms & beds set", severity: "required" },
    { title: "Short description drafted", severity: "optional" },
  ],
  owner: [
    {
      title: "Owner contact confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "No phone numbers stored — confirm only.",
    },
    {
      title: "Backup contact confirmed",
      severity: "optional",
      isConfirmation: true,
    },
  ],
  documents: [
    {
      title: "Rental license checked",
      severity: "blocking",
      isConfirmation: true,
      hint: "No document files uploaded.",
    },
    { title: "Insurance noted", severity: "required", isConfirmation: true },
    { title: "Tax registration noted", severity: "required", isConfirmation: true },
  ],
  access: [
    {
      title: "Access / lockbox details confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Codes & key locations are never stored.",
    },
    { title: "Backup key plan agreed", severity: "required", isConfirmation: true },
  ],
  wifi: [
    {
      title: "Wi-Fi details confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Passwords are never stored.",
    },
    { title: "Utilities active", severity: "required", isConfirmation: true },
    { title: "Smart lock tested", severity: "optional" },
  ],
  cleaning: [
    { title: "Cleaner assigned", severity: "blocking", isConfirmation: true },
    { title: "Linen set ready", severity: "required" },
    { title: "Welcome supplies stocked", severity: "required" },
    { title: "Turnover SLA agreed", severity: "optional" },
  ],
  photos: [
    { title: "Photographer booked", severity: "required" },
    { title: "Staging complete", severity: "required" },
    { title: "Hero shot selected", severity: "blocking" },
  ],
  rules: [
    { title: "House rules drafted", severity: "required" },
    { title: "Check-in / out times set", severity: "blocking" },
    { title: "Pets / smoking policy set", severity: "required" },
  ],
  platform: [
    { title: "Airbnb draft listing created", severity: "blocking" },
    { title: "Booking.com draft listing created", severity: "blocking" },
    {
      title: "Payout details confirmed",
      severity: "blocking",
      isConfirmation: true,
      hint: "Bank details are never stored.",
    },
    { title: "Pricing rules drafted", severity: "required" },
  ],
  review: [
    { title: "Final walkthrough complete", severity: "blocking" },
    { title: "Manager sign-off", severity: "blocking" },
    { title: "First guest stay scheduled", severity: "optional" },
  ],
};

const PHOTO_TEMPLATE: Omit<PhotoItem, "id" | "status">[] = [
  { label: "Hero shot", required: true },
  { label: "Living room", required: true },
  { label: "Main bedroom", required: true },
  { label: "Kitchen", required: true },
  { label: "Bathroom", required: true },
  { label: "Exterior", required: true },
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
    checkInMethod: "self_check_in",
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