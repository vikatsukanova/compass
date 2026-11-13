import type { FocusItem } from "@/lib/recommendations";
import { AreaStatusBadge } from "@/components/dashboard/area-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDisplayDate } from "@/lib/format";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type TodaysFocusProps = {
  items: FocusItem[];
};

export function TodaysFocus({ items }: TodaysFocusProps) {
  if (items.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="Today's Focus"
          description="Nothing urgent right now — your life areas look balanced. Log activity or check the dashboard to stay on track."
        />
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/activities" className="link-accent">
            Log activity
          </Link>
          <Link href="/" className="link-accent">
            View dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="section-title">Today&apos;s Focus</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Up to 5 items — where your attention matters most today.</p>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <FocusItemCard key={item.kind === "area" ? item.area.id : item.task.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function FocusItemCard({ item }: { item: FocusItem }) {
  if (item.kind === "task") {
    return (
      <li className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{item.task.title}</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {item.task.lifeArea.name}
            {item.task.dueDate && <> · Due {formatDisplayDate(item.task.dueDate)}</>}
          </p>
        </div>
        <Link href="/tasks" className="link-accent flex shrink-0 items-center gap-1 text-sm">
          Tasks
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-800 dark:text-slate-100">{item.area.name}</p>
          <AreaStatusBadge status={item.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.reason}</p>
      </div>
      <Link
        href={`/areas/${item.area.slug}`}
        className="link-accent flex shrink-0 items-center gap-1 text-sm"
      >
        View
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </li>
  );
}
