import { listActivityLogs } from "@/actions/activity-log";
import { listLifeAreas } from "@/actions/life-area";
import { listTasks } from "@/actions/task";
import {
  buildAreaStatuses,
  getTodaysFocus,
  groupLogsByArea,
  filterLogsInRange,
  type AreaStatus,
  type FocusItem,
} from "@/lib/recommendations";
import { getRolling7DaysBounds, getWeekBounds } from "@/lib/week";
import { todayIsoDate } from "@/lib/format";
import type { LifeArea } from "@prisma/client";

export type MorningData = {
  focus: FocusItem[];
  areaStatuses: { area: LifeArea; status: AreaStatus }[];
};

export async function getMorningData(): Promise<MorningData> {
  const today = new Date();
  const todayIso = todayIsoDate();
  const { start: weekStart, end: weekEnd } = getWeekBounds(today);
  const { start: rollingStart, end: rollingEnd } = getRolling7DaysBounds(today);
  const fetchStart = weekStart < rollingStart ? weekStart : rollingStart;

  const [areas, logs, urgentTasks] = await Promise.all([
    listLifeAreas(true),
    listActivityLogs(fetchStart, weekEnd),
    listTasks({ urgentOnly: true }),
  ]);

  const weekLogs = filterLogsInRange(logs, weekStart, weekEnd);
  const rollingLogs = filterLogsInRange(logs, rollingStart, rollingEnd);
  const weekByArea = groupLogsByArea(weekLogs);
  const rollingByArea = groupLogsByArea(rollingLogs);

  const statusMap = buildAreaStatuses(areas, weekByArea, rollingByArea, today);

  const focus = getTodaysFocus(
    areas,
    weekByArea,
    rollingByArea,
    urgentTasks,
    today,
    todayIso
  );

  return {
    focus,
    areaStatuses: areas.map((area) => ({
      area,
      status: statusMap.get(area.id) ?? "on_track",
    })),
  };
}
