import type { DashboardSummary } from "@/lib/unified-dashboard";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, MinusCircle, Zap } from "lucide-react";

type WeeklySummaryProps = {
  summary: DashboardSummary;
  className?: string;
  compact?: boolean;
};

const TILES = [
  {
    key: "totalLogs" as const,
    label: "Activities logged",
    icon: Zap,
    iconClass: "text-blue-500",
    tileClass: "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800",
  },
  {
    key: "onTrack" as const,
    label: "On track",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    tileClass: "border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30",
  },
  {
    key: "behind" as const,
    label: "Behind",
    icon: AlertCircle,
    iconClass: "text-amber-500",
    tileClass: "border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30",
  },
  {
    key: "neglected" as const,
    label: "Neglected",
    icon: MinusCircle,
    iconClass: "text-rose-500",
    tileClass: "border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30",
  },
] as const;

export function WeeklySummary({ summary, className = "", compact = false }: WeeklySummaryProps) {
  return (
    <section className={className}>
      <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">This week</h2>
      <div className="grid grid-cols-2 gap-3">
        {TILES.map(({ key, ...tile }) => (
          <SummaryTile key={key} value={summary[key]} compact={compact} {...tile} />
        ))}
      </div>
    </section>
  );
}

/** Compact 2×2 grid for the desktop right panel. */
export function WeeklySummaryCompact({ summary, className = "" }: WeeklySummaryProps) {
  return <WeeklySummary summary={summary} className={className} compact />;
}

function SummaryTile({
  value,
  label,
  icon: Icon,
  iconClass,
  tileClass,
  compact = false,
}: {
  value: number;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  tileClass: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border ${compact ? "h-16 p-3" : "h-24 p-4"} ${tileClass}`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
        <div>
          <span className="block text-xl font-bold leading-none text-slate-800 dark:text-slate-100">{value}</span>
          <span className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      </div>
    </div>
  );
}
