import { badgeClass } from "./badge-variants";

export function clientTypeBadgeClass(clientType: string | null, shrink = false): string {
  const shrinkClass = shrink ? "shrink-0 " : "";
  if (clientType === "business") {
    return `${shrinkClass}${badgeClass("violet")} capitalize`;
  }
  if (clientType === "private") {
    return `${shrinkClass}${badgeClass("sky")} capitalize`;
  }
  return `${shrinkClass}${badgeClass("slate")} capitalize`;
}
