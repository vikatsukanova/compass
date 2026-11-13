import { listActivityLogs } from "@/actions/activity-log";
import { listLifeAreas } from "@/actions/life-area";
import { listTasks } from "@/actions/task";
import { getAreaWeeklyProgress } from "@/lib/area-progress";
import { getDaysSinceLastLog, todayIsoDate } from "@/lib/format";
import {
  buildAreaStatuses,
  filterLogsInRange,
  getTodaysFocus,
  groupLogsByArea,
  type AreaStatus,
  type FocusItem,
} from "@/lib/recommendations";
import type { DashboardAreaRow } from "@/lib/dashboard";
import { getRolling7DaysBounds, getWeekBounds, getWeekBoundsFromParam, isCurrentWeek } from "@/lib/week";
import type { LifeArea } from "@prisma/client";

export type DashboardSummary = {
  totalLogs: number;
  onTrack: number;
  behind: number;
  neglected: number;
  overFocused: number;
};

export type UnifiedDashboardData = {
  start: string;
  end: string;
  isCurrentWeek: boolean;
  focus: FocusItem[];
  rows: DashboardAreaRow[];
  summary: DashboardSummary;
  lastActivityDays: Map<string, number | null>;
  areas: LifeArea[];
};

function lookbackStart(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getUnifiedDashboardData(weekParam?: string): Promise<UnifiedDashboardData> {
  const { start, end } = getWeekBoundsFromParam(weekParam);
  const viewingCurrentWeek = isCurrentWeek(start);

  const today = new Date();
  const todayIso = todayIsoDate();
  const { start: todayWeekStart, end: todayWeekEnd } = getWeekBounds(today);
  const { start: rollingStart, end: rollingEnd } = getRolling7DaysBounds(today);
  const activityLookbackStart = lookbackStart(90, today);

  const fetchStart = [start, rollingStart, activityLookbackStart, todayWeekStart]
    .sort()[0]!;
  const fetchEnd = [end, todayWeekEnd].sort().at(-1)!;

  const [areas, logs, urgentTasks] = await Promise.all([
    listLifeAreas(true),
    listActivityLogs(fetchStart, fetchEnd),
    listTasks({ urgentOnly: true }),
  ]);

  const weekLogs = filterLogsInRange(logs, start, end);
  const weekByArea = groupLogsByArea(weekLogs);

  const rollingLogs = filterLogsInRange(logs, rollingStart, rollingEnd);
  const rollingByArea = groupLogsByArea(rollingLogs);

  const todayWeekLogs = filterLogsInRange(logs, todayWeekStart, todayWeekEnd);
  const todayWeekByArea = groupLogsByArea(todayWeekLogs);

  let statusMap: Map<string, AreaStatus> | undefined;
  if (viewingCurrentWeek) {
    statusMap = buildAreaStatuses(areas, weekByArea, rollingByArea, today);
  }

  const rows: DashboardAreaRow[] = areas.map((area) => ({
    area,
    progress: getAreaWeeklyProgress(area, weekByArea.get(area.id) ?? []),
    status: statusMap?.get(area.id),
  }));

  const focus = getTodaysFocus(
    areas,
    todayWeekByArea,
    rollingByArea,
    urgentTasks,
    today,
    todayIso
  );

  const lastActivityDays = new Map<string, number | null>();
  for (const area of areas) {
    lastActivityDays.set(area.id, getDaysSinceLastLog(area.id, logs, todayIso));
  }

  const summary: DashboardSummary = {
    totalLogs: weekLogs.length,
    onTrack: rows.filter((r) => r.status === "on_track").length,
    behind: rows.filter((r) => r.status === "behind").length,
    neglected: rows.filter((r) => r.status === "neglected").length,
    overFocused: rows.filter((r) => r.status === "over_focused").length,
  };

  return {
    start,
    end,
    isCurrentWeek: viewingCurrentWeek,
    focus,
    rows,
    summary,
    lastActivityDays,
    areas,
  };
}

export function getFocusCardSubtitle(
  item: FocusItem,
  lastActivityDays: Map<string, number | null>
): string {
  if (item.kind === "task") {
    return item.task.lifeArea.name;
  }

  const days = lastActivityDays.get(item.area.id);
  if (item.status === "neglected") {
    if (days === null) return "No activity logged yet";
    if (days === 0) return "Last active today — still needs attention";
    if (days === 1) return "No activity in 1 day";
    return `No activity in ${days} days`;
  }

  if (item.status === "behind") {
    return "Below half your weekly target";
  }

  return item.reason;
}
