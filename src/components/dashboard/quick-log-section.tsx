"use client";

import { QuickLogDialog } from "@/components/layout/quick-log-dialog";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaVisual } from "@/lib/area-visuals";
import type { QuickLogArea } from "@/lib/right-panel";
import { Plus } from "lucide-react";
import { useState } from "react";

type QuickLogSectionProps = {
  areas: QuickLogArea[];
  quickLogAreas: QuickLogArea[];
  className?: string;
};

export function QuickLogSection({ areas, quickLogAreas, className = "" }: QuickLogSectionProps) {
  const [logDialog, setLogDialog] = useState<{ open: boolean; areaId?: string }>({
    open: false,
  });

  function openQuickLog(areaId?: string) {
    setLogDialog({ open: true, areaId });
  }

  return (
    <>
      <section className={className}>
        <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Quick Log</h2>
        <div className="grid grid-cols-3 gap-2">
          {quickLogAreas.map((area) => (
            <QuickLogButton key={area.id} area={area} onClick={() => openQuickLog(area.id)} />
          ))}
          <button
            type="button"
            onClick={() => openQuickLog()}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Plus className="mb-1 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Other</span>
          </button>
        </div>
      </section>

      {logDialog.open && (
        <QuickLogDialog
          areas={areas}
          defaultAreaId={logDialog.areaId}
          onClose={() => setLogDialog({ open: false })}
        />
      )}
    </>
  );
}

function QuickLogButton({ area, onClick }: { area: QuickLogArea; onClick: () => void }) {
  const Icon = getAreaIcon(area.slug);
  const visual = getAreaVisual(area.slug);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <Icon className={`mb-1 h-5 w-5 ${visual.iconText}`} />
      <span className="text-center text-xs font-medium leading-tight">{area.name.split("/")[0]}</span>
    </button>
  );
}
