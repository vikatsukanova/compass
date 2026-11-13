import { getAreaWeeklyProgress } from "@/lib/area-progress";
import { isMidweekOrLater } from "@/lib/week";
import type { ActivityLog, LifeArea, Priority, Task } from "@prisma/client";

export type AreaStatus = "neglected" | "behind" | "on_track" | "over_focused";

export const OVER_FOCUSED_RATIO = 1.5;
export const BEHIND_RATIO = 0.5;
export const FOCUS_MAX_ITEMS = 5;

type MinimalArea = Pick<
  LifeArea,
  "id" | "name" | "slug" | "weeklyTarget" | "targetUnit" | "priority"
>;

type MinimalLog = Pick<ActivityLog, "lifeAreaId" | "date" | "durationMinutes">;

type MinimalTask = Pick<Task, "id" | "title" | "dueDate" | "isUrgent" | "lifeAreaId"> & {
  lifeArea: { name: string; slug: string };
};

export type FocusAreaItem = {
  kind: "area";
  area: MinimalArea;
  status: AreaStatus;
  reason: string;
  sortKey: number;
};

export type FocusTaskItem = {
  kind: "task";
  task: MinimalTask;
  reason: string;
};

export type FocusItem = FocusAreaItem | FocusTaskItem;

const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function filterLogsInRange(
  logs: MinimalLog[],
  start: string,
  end: string
): MinimalLog[] {
  return logs.filter((log) => log.date >= start && log.date <= end);
}

export function groupLogsByArea(logs: MinimalLog[]): Map<string, MinimalLog[]> {
  const map = new Map<string, MinimalLog[]>();
  for (const log of logs) {
    const existing = map.get(log.lifeAreaId) ?? [];
    existing.push(log);
    map.set(log.lifeAreaId, existing);
  }
  return map;
}

export function hasHighPriorityNeglected(
  areas: MinimalArea[],
  rollingByArea: Map<string, MinimalLog[]>
): boolean {
  return areas.some(
    (area) => area.priority === "high" && (rollingByArea.get(area.id)?.length ?? 0) === 0
  );
}

export function getAreaStatus(
  area: MinimalArea,
  weekLogs: MinimalLog[],
  rollingLogs: MinimalLog[],
  date: Date,
  highPriorityNeglectedExists: boolean
): AreaStatus {
  if (rollingLogs.length === 0) {
    return "neglected";
  }

  const progress = getAreaWeeklyProgress(area, weekLogs);

  if (
    highPriorityNeglectedExists &&
    progress.target > 0 &&
    progress.logged >= progress.target * OVER_FOCUSED_RATIO
  ) {
    return "over_focused";
  }

  if (
    isMidweekOrLater(date) &&
    progress.target > 0 &&
    progress.logged / progress.target < BEHIND_RATIO
  ) {
    return "behind";
  }

  return "on_track";
}

export function statusLabel(status: AreaStatus): string {
  switch (status) {
    case "neglected":
      return "Neglected";
    case "behind":
      return "Behind";
    case "on_track":
      return "On track";
    case "over_focused":
      return "Over-focused";
  }
}

export function statusReason(status: AreaStatus, areaName: string): string {
  switch (status) {
    case "neglected":
      return `${areaName} has had no activity in the last 7 days.`;
    case "behind":
      return `${areaName} is below half your weekly target — it's midweek.`;
    case "over_focused":
      return `${areaName} is well above target while other high-priority areas need attention.`;
    case "on_track":
      return `${areaName} is on track this week.`;
  }
}

function daysSinceLastLog(rollingLogs: MinimalLog[], todayIso: string): number {
  if (rollingLogs.length === 0) return 999;
  const latest = rollingLogs.reduce((max, log) => (log.date > max ? log.date : max), "");
  const latestDate = new Date(`${latest}T12:00:00`);
  const today = new Date(`${todayIso}T12:00:00`);
  return Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTodaysFocus(
  areas: MinimalArea[],
  weekByArea: Map<string, MinimalLog[]>,
  rollingByArea: Map<string, MinimalLog[]>,
  urgentTasks: MinimalTask[],
  date: Date,
  todayIso: string,
  maxItems = FOCUS_MAX_ITEMS
): FocusItem[] {
  const highPriorityNeglected = hasHighPriorityNeglected(areas, rollingByArea);

  const statuses = new Map<string, AreaStatus>();
  for (const area of areas) {
    statuses.set(
      area.id,
      getAreaStatus(
        area,
        weekByArea.get(area.id) ?? [],
        rollingByArea.get(area.id) ?? [],
        date,
        highPriorityNeglected
      )
    );
  }

  const items: FocusItem[] = [];

  const tier1 = areas
    .filter((a) => a.priority === "high" && statuses.get(a.id) === "neglected")
    .sort(
      (a, b) =>
        daysSinceLastLog(rollingByArea.get(b.id) ?? [], todayIso) -
        daysSinceLastLog(rollingByArea.get(a.id) ?? [], todayIso)
    )
    .map((area): FocusAreaItem => ({
      kind: "area",
      area,
      status: "neglected",
      reason: statusReason("neglected", area.name),
      sortKey: 0,
    }));

  const tier2 = areas
    .filter((a) => a.priority === "high" && statuses.get(a.id) === "behind")
    .sort((a, b) => {
      const progA = getAreaWeeklyProgress(a, weekByArea.get(a.id) ?? []);
      const progB = getAreaWeeklyProgress(b, weekByArea.get(b.id) ?? []);
      return progA.percent - progB.percent;
    })
    .map((area): FocusAreaItem => ({
      kind: "area",
      area,
      status: "behind",
      reason: statusReason("behind", area.name),
      sortKey: 1,
    }));

  const tier3: FocusTaskItem[] = urgentTasks.map((task) => ({
    kind: "task",
    task,
    reason: task.dueDate ? `Urgent — due ${task.dueDate}` : "Urgent open task",
  }));

  const tier4 = areas
    .filter((a) => a.priority === "medium" && statuses.get(a.id) === "neglected")
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .map((area): FocusAreaItem => ({
      kind: "area",
      area,
      status: "neglected",
      reason: statusReason("neglected", area.name),
      sortKey: 3,
    }));

  for (const batch of [tier1, tier2, tier3, tier4]) {
    for (const item of batch) {
      if (items.length >= maxItems) return items;
      items.push(item);
    }
  }

  return items;
}

export function buildAreaStatuses(
  areas: MinimalArea[],
  weekByArea: Map<string, MinimalLog[]>,
  rollingByArea: Map<string, MinimalLog[]>,
  date: Date
): Map<string, AreaStatus> {
  const highPriorityNeglected = hasHighPriorityNeglected(areas, rollingByArea);
  const map = new Map<string, AreaStatus>();

  for (const area of areas) {
    map.set(
      area.id,
      getAreaStatus(
        area,
        weekByArea.get(area.id) ?? [],
        rollingByArea.get(area.id) ?? [],
        date,
        highPriorityNeglected
      )
    );
  }

  return map;
}
