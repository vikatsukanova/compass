"use client";

import { formatWeekRange, isCurrentWeek, shiftWeek } from "@/lib/week";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type WeekSelectorProps = {
  weekStart: string;
  weekEnd: string;
};

export function WeekSelector({ weekStart, weekEnd }: WeekSelectorProps) {
  const prev = shiftWeek(weekStart, -1);
  const next = shiftWeek(weekStart, 1);
  const current = isCurrentWeek(weekStart);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Link
        href={`/?week=${prev.start}`}
        className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="font-medium text-slate-700 dark:text-slate-200">{formatWeekRange(weekStart, weekEnd)}</span>
      <Link
        href={`/?week=${next.start}`}
        className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
      {!current && (
        <Link href="/" className="ml-1 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800">
          Today
        </Link>
      )}
    </div>
  );
}
