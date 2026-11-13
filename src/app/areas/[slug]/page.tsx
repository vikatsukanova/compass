import { listActivityLogsForArea } from "@/actions/activity-log";
import { getLifeAreaBySlug, listLifeAreas } from "@/actions/life-area";
import { AreaForm } from "@/components/areas/area-form";
import { ActivityLogList } from "@/components/logs/activity-log-list";
import { LogForm } from "@/components/logs/log-form";
import { PageShell, SectionBlock, SectionCard } from "@/components/layout/page-shell";
import { getAreaWeeklyProgress } from "@/lib/area-progress";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaVisual } from "@/lib/area-visuals";
import { formatPriority, formatUnit, formatWeeklyTarget, priorityBadgeClass } from "@/lib/labels";
import { formatWeekRange, getWeekBounds } from "@/lib/week";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ActivityLogWithArea } from "@/actions/activity-log";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AreaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const area = await getLifeAreaBySlug(slug);

  if (!area) {
    notFound();
  }

  const { start, end } = getWeekBounds();
  const [weekLogs, allAreas] = await Promise.all([
    listActivityLogsForArea(area.id, start, end),
    listLifeAreas(),
  ]);
  const progress = getAreaWeeklyProgress(area, weekLogs);

  const areaOptions = allAreas.map((a) => ({
    id: a.id,
    name: a.name,
    targetUnit: a.targetUnit,
  }));

  const logsWithArea: ActivityLogWithArea[] = weekLogs.map((log) => ({
    ...log,
    lifeArea: {
      id: area.id,
      name: area.name,
      slug: area.slug,
      targetUnit: area.targetUnit,
    },
  }));

  const atOrOverTarget = progress.logged >= progress.target;
  const Icon = getAreaIcon(area.slug);
  const visual = getAreaVisual(area.slug);

  return (
    <PageShell>
      <Link href="/areas" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" />
        All areas
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${visual.iconWrap}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{area.name}</h1>
            {!area.isActive && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Inactive
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeClass(area.priority)}`}>
              {formatPriority(area.priority)} priority
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{formatWeeklyTarget(area)}</p>
        </div>
      </div>

      <SectionCard title="This week" subtitle={formatWeekRange(start, end)} className="mt-8">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formatUnit(area.targetUnit, progress.logged)}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">of {formatUnit(area.targetUnit, progress.target)}</span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${
              progress.percent <= 0 ? "bg-slate-300" : atOrOverTarget ? "bg-emerald-400" : visual.bar
            }`}
            style={{ width: `${Math.min(progress.percent, 100)}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {progress.logged === 0
            ? "No activity logged this week yet."
            : atOrOverTarget
              ? "Weekly target reached"
              : `${progress.percent}% of weekly target`}
        </p>
      </SectionCard>

      <SectionCard title="Log activity">
        <LogForm areas={areaOptions} defaultAreaId={area.id} />
      </SectionCard>

      <SectionBlock title="This week's logs" subtitle={formatWeekRange(start, end)}>
        <ActivityLogList
          logs={logsWithArea}
          areas={areaOptions}
          showArea={false}
          emptyMessage="No activity logged for this area this week."
        />
      </SectionBlock>

      <SectionCard title="Edit area">
        <AreaForm area={area} />
      </SectionCard>
    </PageShell>
  );
}
