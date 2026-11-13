import type { DashboardAreaRow } from "@/lib/dashboard";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaVisual } from "@/lib/area-visuals";
import { formatUnit, formatWeeklyTarget } from "@/lib/labels";
import { AreaStatusBadge } from "@/components/dashboard/area-status-badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type LifeAreasTableProps = {
  rows: DashboardAreaRow[];
};

export function LifeAreasTable({ rows }: LifeAreasTableProps) {
  if (rows.length === 0) {
    return (
      <p className="px-2 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No life areas match your search.</p>
    );
  }

  return (
    <>
      <div className="mb-3 hidden grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_11rem] gap-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 md:grid">
        <div>Area</div>
        <div>Progress</div>
        <div>Status</div>
      </div>

      <div className="hidden space-y-1 md:block">
        {rows.map((row) => (
          <AreaRow key={row.area.id} row={row} />
        ))}
      </div>

      <div className="space-y-1 md:hidden">
        {rows.map((row) => (
          <AreaRowMobile key={row.area.id} row={row} />
        ))}
      </div>
    </>
  );
}

function progressBarClass(percent: number, bar: string): string {
  if (percent <= 0) return "bg-slate-300";
  if (percent >= 100) return "bg-emerald-400";
  return bar;
}

function AreaRow({ row }: { row: DashboardAreaRow }) {
  const { area, progress, status } = row;
  const Icon = getAreaIcon(area.slug);
  const visual = getAreaVisual(area.slug);
  const barWidth = Math.min(progress.percent, 100);

  return (
    <Link
      href={`/areas/${area.slug}`}
      className="group grid grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_11rem] items-center gap-4 rounded-xl border border-transparent p-2 transition-colors hover:border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${visual.iconWrap}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{area.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatWeeklyTarget(area)}</p>
        </div>
      </div>
      <div className="pr-6">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {formatUnit(area.targetUnit, progress.logged)} / {formatUnit(area.targetUnit, progress.target)}
          </span>
          <span className={progress.percent >= 100 ? "font-medium text-emerald-600 dark:text-emerald-300" : "font-medium text-slate-700 dark:text-slate-200"}>
            {progress.percent}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-1.5 rounded-full ${progressBarClass(progress.percent, visual.bar)}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between pr-2">
        <span className="whitespace-nowrap">
          {status ? <AreaStatusBadge status={status} /> : <span className="text-xs text-slate-400 dark:text-slate-500">—</span>}
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-slate-500" />
      </div>
    </Link>
  );
}

function AreaRowMobile({ row }: { row: DashboardAreaRow }) {
  const { area, progress, status } = row;
  const Icon = getAreaIcon(area.slug);
  const visual = getAreaVisual(area.slug);
  const barWidth = Math.min(progress.percent, 100);

  return (
    <Link href={`/areas/${area.slug}`} className="block rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${visual.iconWrap}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{area.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{formatWeeklyTarget(area)}</p>
          </div>
        </div>
        {status && <AreaStatusBadge status={status} />}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {formatUnit(area.targetUnit, progress.logged)} / {formatUnit(area.targetUnit, progress.target)}
          </span>
          <span className={progress.percent >= 100 ? "font-medium text-emerald-600 dark:text-emerald-300" : "font-medium text-slate-700 dark:text-slate-200"}>
            {progress.percent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-1.5 rounded-full ${progressBarClass(progress.percent, visual.bar)}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
