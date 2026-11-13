import type { ActivityLog, LifeArea, TargetUnit } from "@prisma/client";

export type AreaWeeklyProgress = {
  logged: number;
  target: number;
  percent: number;
  unit: TargetUnit;
};

type ProgressLog = Pick<ActivityLog, "durationMinutes">;

export function computeWeeklyLogged(
  area: Pick<LifeArea, "targetUnit">,
  logs: ProgressLog[]
): number {
  if (area.targetUnit === "hours") {
    const totalMinutes = logs.reduce((sum, log) => sum + (log.durationMinutes ?? 0), 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  return logs.length;
}

export function getAreaWeeklyProgress(
  area: Pick<LifeArea, "weeklyTarget" | "targetUnit">,
  logs: ProgressLog[]
): AreaWeeklyProgress {
  const logged = computeWeeklyLogged(area, logs);
  const target = area.weeklyTarget;
  const percent = target > 0 ? Math.round((logged / target) * 100) : 0;

  return { logged, target, percent, unit: area.targetUnit };
}
