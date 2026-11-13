import { listLifeAreas } from "@/actions/life-area";
import { AreaCard } from "@/components/areas/area-card";
import { NewAreaPanel } from "@/components/areas/new-area-panel";
import { PageHeader, PageShell, SectionBlock } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui/empty-state";

type PageProps = {
  searchParams: Promise<{ new?: string }>;
};

export default async function AreasPage({ searchParams }: PageProps) {
  const { new: newParam } = await searchParams;
  const areas = await listLifeAreas(false);
  const activeAreas = areas.filter((a) => a.isActive);
  const inactiveAreas = areas.filter((a) => !a.isActive);

  return (
    <PageShell>
      <PageHeader
        title="Life areas"
        description="Track any part of your life with weekly targets and priorities. Add custom areas beyond the defaults — Yoga, Cooking, whatever matters to you."
      />

      <SectionBlock title="Add area">
        <NewAreaPanel defaultOpen={newParam === "1"} />
      </SectionBlock>

      <SectionBlock title="Active areas">
        <div className="space-y-3">
          {activeAreas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
          {activeAreas.length === 0 && (
            <EmptyState
              title="No active life areas"
              description="Add a custom area above or reactivate one from the list below."
            />
          )}
        </div>
      </SectionBlock>

      {inactiveAreas.length > 0 && (
        <SectionBlock title="Inactive areas">
          <div className="space-y-3">
            {inactiveAreas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </SectionBlock>
      )}
    </PageShell>
  );
}
