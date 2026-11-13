import type { AreaStatus } from "@/lib/recommendations";
import { statusLabel } from "@/lib/recommendations";

function statusPillClass(status: AreaStatus): string {
  switch (status) {
    case "neglected":
      return "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300";
    case "behind":
      return "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300";
    case "on_track":
      return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300";
    case "over_focused":
      return "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300";
  }
}

function statusTagClass(status: AreaStatus): string {
  switch (status) {
    case "neglected":
      return "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300";
    case "behind":
      return "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300";
    case "on_track":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "over_focused":
      return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
  }
}

type AreaStatusBadgeProps = {
  status: AreaStatus;
  /** `tag` is the compact uppercase chip on focus cards. `pill` is the table status. */
  variant?: "pill" | "tag";
};

export function AreaStatusBadge({ status, variant = "pill" }: AreaStatusBadgeProps) {
  if (variant === "tag") {
    return (
      <span
        className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTagClass(status)}`}
      >
        {statusLabel(status)}
      </span>
    );
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}
