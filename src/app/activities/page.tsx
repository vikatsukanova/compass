import { listActivityLogs } from "@/actions/activity-log";
import { listLifeAreas } from "@/actions/life-area";
import { ActivityLogList } from "@/components/logs/activity-log-list";
import { LogForm } from "@/components/logs/log-form";
import { PageHeader, PageShell, SectionBlock, SectionCard } from "@/components/layout/page-shell";
import { formatWeekRange, getWeekBounds } from "@/lib/week";

export default async function ActivitiesPage() {
  const { start, end } = getWeekBounds();
  const [areas, logs] = await Promise.all([
    listLifeAreas(),
    listActivityLogs(start, end),
  ]);

  const areaOptions = areas.map((a) => ({
    id: a.id,
    name: a.name,
    targetUnit: a.targetUnit,
  }));

  return (
    <PageShell>
      <PageHeader
        title="Activities"
        description="Record what you did and how long it took. Takes a few seconds."
      />

      <SectionCard title="New log">
        <LogForm areas={areaOptions} />
      </SectionCard>

      <SectionBlock title="This week" subtitle={formatWeekRange(start, end)}>
        <ActivityLogList
          logs={logs}
          areas={areaOptions}
          emptyMessage="No activity logged this week yet."
        />
      </SectionBlock>
    </PageShell>
  );
}
