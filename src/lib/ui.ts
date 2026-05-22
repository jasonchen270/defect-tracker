import type { DefectStatus, Severity, Priority, ProjectRole } from "@prisma/client";

export const STATUS_LABEL: Record<DefectStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};

// Tailwind class fragments for each enum value's badge.
export const STATUS_BADGE: Record<DefectStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 ring-blue-600/20",
  IN_PROGRESS: "bg-amber-100 text-amber-800 ring-amber-600/20",
  RESOLVED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  CLOSED: "bg-zinc-200 text-zinc-700 ring-zinc-500/20",
  REOPENED: "bg-purple-100 text-purple-800 ring-purple-600/20",
};

export const SEVERITY_BADGE: Record<Severity, string> = {
  LOW: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  MEDIUM: "bg-sky-100 text-sky-800 ring-sky-600/20",
  HIGH: "bg-orange-100 text-orange-800 ring-orange-600/20",
  CRITICAL: "bg-red-100 text-red-800 ring-red-600/20",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  P0: "P0 - Blocker",
  P1: "P1 - High",
  P2: "P2 - Normal",
  P3: "P3 - Low",
};

export const PRIORITY_BADGE: Record<Priority, string> = {
  P0: "bg-red-100 text-red-800 ring-red-600/20",
  P1: "bg-orange-100 text-orange-800 ring-orange-600/20",
  P2: "bg-sky-100 text-sky-800 ring-sky-600/20",
  P3: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
};

export const ROLE_LABEL: Record<ProjectRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

// Board columns, in workflow order.
export const BOARD_COLUMNS: DefectStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const STATUS_VALUES: DefectStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
];
export const SEVERITY_VALUES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const PRIORITY_VALUES: Priority[] = ["P0", "P1", "P2", "P3"];
export const ROLE_VALUES: ProjectRole[] = ["OWNER", "MANAGER", "MEMBER", "VIEWER"];

export function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function relativeActivity(field: string, from: string | null, to: string | null): string {
  const label = field === "assignee" ? "assignee" : field;
  if (from === null) return `set ${label} to ${to ?? "N/A"}`;
  if (to === null) return `cleared ${label}`;
  return `changed ${label} from ${from} to ${to}`;
}
