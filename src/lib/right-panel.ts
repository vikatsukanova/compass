import { listLifeAreas } from "@/actions/life-area";
import { listUrgentAndDueTodayTasks, type TaskWithArea } from "@/actions/task";
import type { LifeArea } from "@prisma/client";

export const QUICK_LOG_SLUGS = ["health", "career", "learning", "creativity", "home", "social", "gym", "french", "music", "work-career", "reading", "finances"] as const;

export type QuickLogArea = Pick<LifeArea, "id" | "name" | "slug" | "targetUnit">;

export type RightPanelData = {
  todayTasks: TaskWithArea[];
  areas: QuickLogArea[];
  quickLogAreas: QuickLogArea[];
};

export async function getRightPanelData(): Promise<RightPanelData> {
  const [areas, todayTasks] = await Promise.all([
    listLifeAreas(true),
    listUrgentAndDueTodayTasks(),
  ]);

  const areaOptions: QuickLogArea[] = areas.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    targetUnit: a.targetUnit,
  }));

  const slugToArea = new Map(areaOptions.map((a) => [a.slug, a]));
  const quickLogAreas = QUICK_LOG_SLUGS.map((slug) => slugToArea.get(slug))
    .filter((area): area is QuickLogArea => area !== undefined)
    .slice(0, 5);

  return {
    todayTasks: todayTasks.slice(0, 5),
    areas: areaOptions,
    quickLogAreas,
  };
}
