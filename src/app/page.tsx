import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFilterProvider, DashboardSearch } from "@/components/dashboard/dashboard-filter";
import { FocusCards } from "@/components/dashboard/focus-cards";
import { LifeAreasOverview } from "@/components/dashboard/life-areas-overview";
import { MobileQuickLog } from "@/components/dashboard/mobile-quick-log";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { SetDashboardPanel } from "@/components/layout/dashboard-panel-context";
import { auth } from "@/auth";
import { isDemoEmail, profileForSession } from "@/lib/demo-profile";
import { getRightPanelData } from "@/lib/right-panel";
import { getFocusCardSubtitle, getUnifiedDashboardData } from "@/lib/unified-dashboard";

type PageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { week } = await searchParams;
  const [data, panelData, session] = await Promise.all([
    getUnifiedDashboardData(week),
    getRightPanelData(),
    auth(),
  ]);

  const name = profileForSession(session?.user?.email).name;
  const demo = isDemoEmail(session?.user?.email);
  const topArea = data.focus.find((item) => item.kind === "area");
  const recommendation =
    topArea?.kind === "area"
      ? {
          name: topArea.area.name,
          slug: topArea.area.slug,
          subtitle: getFocusCardSubtitle(topArea, data.lastActivityDays),
        }
      : null;

  const progressByAreaId = new Map(data.rows.map((row) => [row.area.id, row.progress.percent]));

  return (
    <>
      <SetDashboardPanel data={{ ...panelData, summary: data.summary, recommendation }} />

      <DashboardFilterProvider>
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex h-24 shrink-0 items-center justify-between gap-4 px-4 sm:px-8">
            <DashboardHeader name={name} demo={demo} />
            <DashboardSearch />
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-24 sm:px-8 lg:overflow-hidden lg:pb-6">
            <div className="shrink-0">
              <FocusCards
                items={data.focus}
                lastActivityDays={data.lastActivityDays}
                progressByAreaId={progressByAreaId}
              />

              <MobileQuickLog />
            </div>

            <LifeAreasOverview
              rows={data.rows}
              weekStart={data.start}
              weekEnd={data.end}
              isCurrentWeek={data.isCurrentWeek}
            />

            <WeeklySummary summary={data.summary} className="mt-8 lg:hidden" />

            <p className="mt-8 text-center text-xs italic text-slate-400 dark:text-slate-500 lg:hidden">
              Small steps in the right direction lead to big change.
            </p>
          </div>
        </div>
      </DashboardFilterProvider>
    </>
  );
}
