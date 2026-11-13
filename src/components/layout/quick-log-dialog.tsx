"use client";

import { LogForm } from "@/components/logs/log-form";
import type { QuickLogArea } from "@/lib/right-panel";
import { X } from "lucide-react";
import { useEffect } from "react";

type QuickLogDialogProps = {
  areas: QuickLogArea[];
  defaultAreaId?: string;
  onClose: () => void;
};

export function QuickLogDialog({ areas, defaultAreaId, onClose }: QuickLogDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-log-title"
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="quick-log-title" className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Quick log
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Log activity for today.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <LogForm areas={areas} defaultAreaId={defaultAreaId} onSuccess={onClose} />
      </div>
    </div>
  );
}
