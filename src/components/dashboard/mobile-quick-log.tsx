"use client";

import { useDashboardPanel } from "@/components/layout/dashboard-panel-context";
import { QuickLogSection } from "@/components/dashboard/quick-log-section";

export function MobileQuickLog() {
  const { data } = useDashboardPanel();

  if (!data) return null;

  return (
    <QuickLogSection
      areas={data.areas}
      quickLogAreas={data.quickLogAreas}
      className="mb-10 md:hidden"
    />
  );
}
