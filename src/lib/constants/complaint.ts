export const COMPLAINT_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const COMPLAINT_REASONS = [
  { value: "quality", label: "Service quality" },
  { value: "access", label: "Access / keys" },
  { value: "billing", label: "Billing" },
  { value: "damage", label: "Damage" },
  { value: "other", label: "Other" },
] as const;

export type ComplaintReason = (typeof COMPLAINT_REASONS)[number]["value"];

const REASON_SET = new Set<string>(COMPLAINT_REASONS.map((r) => r.value));

export function isComplaintReason(value: string): value is ComplaintReason {
  return REASON_SET.has(value);
}

export function getComplaintReasonLabel(reason: string): string {
  const match = COMPLAINT_REASONS.find((r) => r.value === reason);
  return match?.label ?? reason.replace(/_/g, " ");
}

export function isComplaintStatus(value: string): value is ComplaintStatus {
  return (COMPLAINT_STATUSES as readonly string[]).includes(value);
}
