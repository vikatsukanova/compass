"use client";

import { useEffect, useState } from "react";
import { AreaForm } from "./area-form";
import { Plus } from "lucide-react";

type NewAreaPanelProps = {
  defaultOpen?: boolean;
};

export function NewAreaPanel({ defaultOpen = false }: NewAreaPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add custom life area
      </button>
    );
  }

  return (
    <div className="card !p-5">
      <h2 className="section-title">New life area</h2>
      <p className="mt-1 text-xs font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400">
        Add any part of your life — not limited to the default list.
      </p>
      <div className="mt-4">
        <AreaForm onCancel={() => setOpen(false)} />
      </div>
    </div>
  );
}
