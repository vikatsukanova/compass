import Link from "next/link";
import type { LifeArea } from "@prisma/client";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaVisual } from "@/lib/area-visuals";
import { formatPriority, formatWeeklyTarget, priorityBadgeClass } from "@/lib/labels";
import { ChevronRight } from "lucide-react";

type AreaCardProps = {
  area: LifeArea;
};

export function AreaCard({ area }: AreaCardProps) {
  const Icon = getAreaIcon(area.slug);
  const visual = getAreaVisual(area.slug);

  return (
    <Link
      href={`/areas/${area.slug}`}
      className={`group flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${
        area.isActive ? "" : "opacity-60"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.iconWrap}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{area.name}</span>
          {!area.isActive && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              Inactive
            </span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeClass(area.priority)}`}>
            {formatPriority(area.priority)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatWeeklyTarget(area)}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 transition group-hover:text-slate-500" />
    </Link>
  );
}
