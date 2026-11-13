"use client";

import { Search } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";

type DashboardFilterValue = {
  query: string;
  setQuery: (query: string) => void;
};

const DashboardFilterContext = createContext<DashboardFilterValue | null>(null);

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>;
}

export function useDashboardFilter() {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) {
    throw new Error("useDashboardFilter must be used within DashboardFilterProvider");
  }
  return ctx;
}

export function DashboardSearch() {
  const { query, setQuery } = useDashboardFilter();

  return (
    <div className="relative hidden w-64 sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search..."
        aria-label="Search life areas"
        className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
