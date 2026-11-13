import { getActiveFocusSession } from "@/actions/focus-session";
import { listLifeAreas } from "@/actions/life-area";
import { FocusPageClient } from "@/components/focus/focus-page-client";
import { PageShell } from "@/components/layout/page-shell";

type PageProps = {
  searchParams: Promise<{ area?: string }>;
};

export default async function FocusPage({ searchParams }: PageProps) {
  const { area: areaSlug } = await searchParams;
  const [activeSession, areas] = await Promise.all([
    getActiveFocusSession(),
    listLifeAreas(true),
  ]);

  const areaOptions = areas.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
  }));

  return (
    <PageShell>
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center py-8">
        <FocusPageClient
          initialSession={activeSession}
          areas={areaOptions}
          defaultAreaSlug={areaSlug}
        />
      </div>
    </PageShell>
  );
}
