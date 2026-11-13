import type { LifeArea, Priority, TargetUnit } from "@prisma/client";

const UNIT_LABELS: Record<TargetUnit, string> = {
  hours: "hrs",
  sessions: "sessions",
  count: "touchpoints",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function formatUnit(unit: TargetUnit, value?: number): string {
  const label = UNIT_LABELS[unit];
  if (value === undefined) return label;
  if (unit === "hours") return value === 1 ? "1 hr" : `${value} hrs`;
  if (unit === "sessions") return value === 1 ? "1 session" : `${value} sessions`;
  return value === 1 ? "1 touchpoint" : `${value} touchpoints`;
}

export function formatWeeklyTarget(area: Pick<LifeArea, "weeklyTarget" | "targetUnit">): string {
  return `${formatUnit(area.targetUnit, area.weeklyTarget)}/week`;
}

export function formatPriority(priority: Priority): string {
  return PRIORITY_LABELS[priority];
}

export function priorityBadgeClass(priority: Priority): string {
  switch (priority) {
    case "high":
      return "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300";
    case "medium":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    case "low":
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  }
}
