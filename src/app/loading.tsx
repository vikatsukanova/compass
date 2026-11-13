import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-24 shrink-0 items-center px-4 sm:px-8">
        <DashboardHeader />
      </header>
      <div className="min-h-0 flex-1 space-y-8 overflow-hidden px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-blue-50 dark:bg-blue-950/40" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
}
