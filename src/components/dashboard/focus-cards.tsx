import type { FocusItem } from "@/lib/recommendations";
import { getFocusCardSubtitle } from "@/lib/unified-dashboard";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaVisual } from "@/lib/area-visuals";
import { formatPriority } from "@/lib/labels";
import { AreaStatusBadge } from "@/components/dashboard/area-status-badge";
import { CircularProgress } from "@/components/dashboard/circular-progress";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { CirclePlay, ListTodo } from "lucide-react";
import type { Priority } from "@prisma/client";

type FocusCardsProps = {
  items: FocusItem[];
  lastActivityDays: Map<string, number | null>;
  progressByAreaId: Map<string, number>;
};

export function FocusCards({ items, lastActivityDays, progressByAreaId }: FocusCardsProps) {
  const top = items.slice(0, 3);

  if (top.length === 0) {
    return (
      <section className="mb-6 lg:mb-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-100">
          Today&apos;s Focus
        </h2>
        <EmptyState
          title="All clear for now"
          description="Your life areas look balanced. Log activity to keep momentum."
          action={{ href: "/activities", label: "Log activity" }}
        />
      </section>
    );
  }

  return (
    <section className="mb-6 lg:mb-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-100">
        Today&apos;s Focus
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {top.map((item) => (
          <FocusCard
            key={item.kind === "area" ? item.area.id : item.task.id}
            item={item}
            subtitle={getFocusCardSubtitle(item, lastActivityDays)}
            percent={item.kind === "area" ? (progressByAreaId.get(item.area.id) ?? 0) : null}
          />
        ))}
      </div>
    </section>
  );
}

function priorityTagClass(priority: Priority): string {
  switch (priority) {
    case "high":
      return "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300";
    case "medium":
      return "bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-300";
    case "low":
      return "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400";
  }
}

function FocusCard({
  item,
  subtitle,
  percent,
}: {
  item: FocusItem;
  subtitle: string;
  percent: number | null;
}) {
  if (item.kind === "task") {
    return (
      <div className="relative rounded-3xl border border-blue-100/50 bg-[#dbeafe] p-6 shadow-sm dark:border-blue-500/30 dark:bg-blue-950">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.task.title}</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        <div className="mb-5">
          <span className="rounded-md bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
            Urgent
          </span>
        </div>
        <Link
          href="/tasks"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/70 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:text-blue-200 dark:hover:bg-white/15"
        >
          View task
        </Link>
      </div>
    );
  }

  const Icon = getAreaIcon(item.area.slug);
  const visual = getAreaVisual(item.area.slug);

  return (
    <div className={`relative rounded-3xl border p-6 shadow-sm ${visual.card}`}>
      <div className="mb-4 flex items-start justify-between">
        <Link
          href={`/areas/${item.area.slug}`}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/60 shadow-sm dark:bg-white/10 ${visual.iconText}`}
          aria-label={item.area.name}
        >
          <Icon className="h-5 w-5" />
        </Link>
        <CircularProgress percent={percent ?? 0} strokeClass={visual.ring} />
      </div>
      <Link href={`/areas/${item.area.slug}`} className="block">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.area.name}</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        <div className="mb-5 flex flex-wrap gap-2">
          <AreaStatusBadge status={item.status} variant="tag" />
          <span
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityTagClass(item.area.priority)}`}
          >
            {formatPriority(item.area.priority)} Priority
          </span>
        </div>
      </Link>
      <Link
        href={`/focus?area=${item.area.slug}`}
        className={`flex w-full items-center justify-center gap-2 rounded-xl bg-white/70 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ${visual.actionText}`}
      >
        <CirclePlay className="h-5 w-5" />
        Start timer
      </Link>
    </div>
  );
}
