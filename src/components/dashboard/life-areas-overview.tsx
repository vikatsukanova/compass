"use client";

import { LifeAreasTable } from "@/components/dashboard/life-areas-table";
import { WeekSelector } from "@/components/dashboard/week-selector";
import { useDashboardFilter } from "@/components/dashboard/dashboard-filter";
import type { DashboardAreaRow } from "@/lib/dashboard";
import Link from "next/link";

type LifeAreasOverviewProps = {
  rows: DashboardAreaRow[];
  weekStart: string;
  weekEnd: string;
  isCurrentWeek: boolean;
};

export function LifeAreasOverview({ rows, weekStart, weekEnd, isCurrentWeek }: LifeAreasOverviewProps) {
  const { query } = useDashboardFilter();
  const normalized = query.trim().toLowerCase();
  const visible = normalized
    ? rows.filter((row) => row.area.name.toLowerCase().includes(normalized))
    : rows;

  return (
    <section className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
      <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-100">
            Life Areas Overview
          </h2>
          {!isCurrentWeek && (
            <p className="mt-1 text-xs font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400">
              Status badges show for the current week only.
            </p>
          )}
        </div>
        <WeekSelector weekStart={weekStart} weekEnd={weekEnd} />
      </div>

      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
        {rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No active life areas.</p>
        ) : (
          <LifeAreasTable rows={visible} />
        )}
      </div>

      <div className="mt-4 flex shrink-0 justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
        <Link href="/areas" className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors hover:text-blue-800">
          View all life areas
        </Link>
      </div>
    </section>
  );
}
