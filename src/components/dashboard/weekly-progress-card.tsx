import type { DashboardAreaRow } from "@/lib/dashboard";
import { AreaStatusBadge } from "@/components/dashboard/area-status-badge";
import { formatUnit, formatPriority, priorityBadgeClass } from "@/lib/labels";
import Link from "next/link";

export function WeeklyProgressCard({ area, progress, status }: DashboardAreaRow) {
  const barWidth = Math.min(progress.percent, 100);
  const atOrOverTarget = progress.logged >= progress.target;

  return (
    <Link
      href={`/areas/${area.slug}`}
      className="block rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:border-slate-200 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100">{area.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {formatUnit(area.targetUnit, progress.logged)} of{" "}
            {formatUnit(area.targetUnit, progress.target)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {status && <AreaStatusBadge status={status} />}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeClass(area.priority)}`}
          >
            {formatPriority(area.priority)}
          </span>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${atOrOverTarget ? "bg-emerald-500" : "bg-blue-500"}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {progress.logged === 0
          ? "No activity this week"
          : atOrOverTarget
            ? "Weekly target reached"
            : `${progress.percent}% of target`}
      </p>
    </Link>
  );
}
