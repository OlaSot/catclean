export function normalizeOrderStatusRaw(
  status: string | null | undefined
): string {
  return (status ?? "").trim().toLowerCase().replace(/-/g, "_");
}

export function canLeaveReviewForStatus(status: string | null | undefined): boolean {
  return normalizeOrderStatusRaw(status) === "completed";
}

export function canOpenComplaintForStatus(status: string | null | undefined): boolean {
  const key = normalizeOrderStatusRaw(status);
  return key === "in_progress" || key === "completed" || key === "problem";
}
