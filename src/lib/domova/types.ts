export type Severity = "blocking" | "required" | "optional";
export type TaskStatus = "todo" | "done" | "na";
export type PhotoStatus = "missing" | "uploaded" | "approved" | "retake";

export type CategoryId =
  | "basics"
  | "owner"
  | "documents"
  | "access"
  | "wifi"
  | "cleaning"
  | "photos"
  | "rules"
  | "platform"
  | "review";

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
}

export interface Task {
  id: string;
  categoryId: CategoryId;
  title: string;
  hint?: string;
  severity: Severity;
  status: TaskStatus;
  isConfirmation?: boolean;
}

export interface PhotoItem {
  id: string;
  label: string;
  required: boolean;
  status: PhotoStatus;
}

export interface Property {
  id: string;
  name: string;
  city: string;
  addressPlaceholder: string;
  ownerPlaceholder: string;
  cover: string;
  tasks: Task[];
  photos: PhotoItem[];
}

export const CATEGORIES: Category[] = [
  { id: "basics", title: "Property basics", description: "Name, type, capacity.", icon: "🏠" },
  { id: "owner", title: "Owner / contact", description: "Confirm contact on file.", icon: "👤" },
  { id: "documents", title: "Documents", description: "Licenses and paperwork.", icon: "📄" },
  { id: "access", title: "Access / keys", description: "Confirm key handover plan.", icon: "🔑" },
  { id: "wifi", title: "Wi-Fi / utilities", description: "Confirm services live.", icon: "📶" },
  { id: "cleaning", title: "Cleaning / supplies", description: "Turnover ready.", icon: "🧺" },
  { id: "photos", title: "Photos / staging", description: "Visual readiness.", icon: "📸" },
  { id: "rules", title: "Guest rules", description: "House rules drafted.", icon: "📜" },
  { id: "platform", title: "Platform readiness", description: "Airbnb & Booking checks.", icon: "🌐" },
  { id: "review", title: "Final launch review", description: "One last pass.", icon: "✅" },
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  blocking: "Blocking",
  required: "Required",
  optional: "Optional",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  done: "Done",
  na: "n/a",
};

export const PHOTO_STATUS_LABEL: Record<PhotoStatus, string> = {
  missing: "Missing",
  uploaded: "Uploaded",
  approved: "Approved",
  retake: "Retake",
};