import type { Priority, TargetUnit } from "@prisma/client";

export const DEFAULT_AREAS: {
  name: string;
  slug: string;
  weeklyTarget: number;
  targetUnit: TargetUnit;
  priority: Priority;
  sortOrder: number;
}[] = [
  { name: "Health", slug: "health", weeklyTarget: 3, targetUnit: "sessions", priority: "high", sortOrder: 0 },
  { name: "Career", slug: "career", weeklyTarget: 40, targetUnit: "hours", priority: "high", sortOrder: 1 },
  { name: "Learning", slug: "learning", weeklyTarget: 5, targetUnit: "hours", priority: "high", sortOrder: 2 },
  { name: "Creativity", slug: "creativity", weeklyTarget: 2, targetUnit: "sessions", priority: "medium", sortOrder: 3 },
  { name: "Home", slug: "home", weeklyTarget: 1, targetUnit: "sessions", priority: "medium", sortOrder: 4 },
  { name: "Social", slug: "social", weeklyTarget: 3, targetUnit: "count", priority: "medium", sortOrder: 5 },
];
