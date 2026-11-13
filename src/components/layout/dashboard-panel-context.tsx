"use client";

import type { RightPanelData } from "@/lib/right-panel";
import type { DashboardSummary } from "@/lib/unified-dashboard";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type FocusRecommendation = {
  name: string;
  slug: string;
  subtitle: string;
};

export type DashboardPanelData = RightPanelData & {
  summary: DashboardSummary;
  recommendation: FocusRecommendation | null;
};

type DashboardPanelContextValue = {
  data: DashboardPanelData | null;
  setData: (data: DashboardPanelData | null) => void;
};

const DashboardPanelContext = createContext<DashboardPanelContextValue | null>(null);

export function DashboardPanelProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardPanelData | null>(null);
  const value = useMemo(() => ({ data, setData }), [data]);

  return (
    <DashboardPanelContext.Provider value={value}>{children}</DashboardPanelContext.Provider>
  );
}

export function useDashboardPanel() {
  const ctx = useContext(DashboardPanelContext);
  if (!ctx) {
    throw new Error("useDashboardPanel must be used within DashboardPanelProvider");
  }
  return ctx;
}

export function SetDashboardPanel({ data }: { data: DashboardPanelData }) {
  const { setData } = useDashboardPanel();

  useEffect(() => {
    setData(data);
    return () => setData(null);
  }, [data, setData]);

  return null;
}
