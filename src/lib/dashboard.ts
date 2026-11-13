import { listActivityLogs } from "@/actions/activity-log";
import { listLifeAreas } from "@/actions/life-area";
import { getAreaWeeklyProgress, type AreaWeeklyProgress } from "@/lib/area-progress";
import {
  buildAreaStatuses,
  filterLogsInRange,
  groupLogsByArea,
  type AreaStatus,
} from "@/lib/recommendations";
import { getRolling7DaysBounds, getWeekBoundsFromParam, isCurrentWeek } from "@/lib/week";
import type { LifeArea } from "@prisma/client";

export type DashboardAreaRow = {
  area: LifeArea;
  progress: AreaWeeklyProgress;
  status?: AreaStatus;
};

export type DashboardData = {
  start: string;
  end: string;
  rows: DashboardAreaRow[];
  totalLogs: number;
};

export async function getDashboardData(weekParam?: string): Promise<DashboardData> {
  const { start, end } = getWeekBoundsFromParam(weekParam);
  const showStatus = isCurrentWeek(start);

  let fetchStart = start;
  if (showStatus) {
    const { start: rollingStart } = getRolling7DaysBounds();
    if (rollingStart < fetchStart) fetchStart = rollingStart;
  }

  const [areas, logs] = await Promise.all([listLifeAreas(true), listActivityLogs(fetchStart, end)]);

  const weekLogs = filterLogsInRange(logs, start, end);
  const weekByArea = groupLogsByArea(weekLogs);

  let statusMap: Map<string, AreaStatus> | undefined;
  if (showStatus) {
    const { start: rollingStart, end: rollingEnd } = getRolling7DaysBounds();
    const rollingLogs = filterLogsInRange(logs, rollingStart, rollingEnd);
    const rollingByArea = groupLogsByArea(rollingLogs);
    statusMap = buildAreaStatuses(areas, weekByArea, rollingByArea, new Date());
  }

  const rows = areas.map((area) => ({
    area,
    progress: getAreaWeeklyProgress(area, weekByArea.get(area.id) ?? []),
    status: statusMap?.get(area.id),
  }));

  return { start, end, rows, totalLogs: weekLogs.length };
}
