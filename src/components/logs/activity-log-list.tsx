"use client";

import { deleteActivityLog, updateActivityLog } from "@/actions/activity-log";
import type { ActivityLogWithArea } from "@/actions/activity-log";
import type { LifeArea } from "@prisma/client";
import { getAreaIcon } from "@/lib/area-icons";
import { getAreaVisual } from "@/lib/area-visuals";
import { HOURS_WEEKLY_TARGET_ATTRS, parseActivityDuration } from "@/lib/duration-input";
import { formatDisplayDate, formatLogDuration } from "@/lib/format";
import { HoursMinutesDurationFields } from "@/components/logs/hours-minutes-duration";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";

type ActivityLogListProps = {
  logs: ActivityLogWithArea[];
  areas: Pick<LifeArea, "id" | "name" | "targetUnit">[];
  emptyMessage?: string;
  showArea?: boolean;
};

export function ActivityLogList({
  logs,
  areas,
  emptyMessage = "No activity logged yet.",
  showArea = true,
}: ActivityLogListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <p className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {logs.map((log) =>
        editingId === log.id ? (
          <li key={log.id} className="p-4">
            <LogEditForm
              log={log}
              areas={areas}
              onCancel={() => setEditingId(null)}
              onSaved={() => setEditingId(null)}
            />
          </li>
        ) : (
          <LogRow
            key={log.id}
            log={log}
            showArea={showArea}
            onEdit={() => setEditingId(log.id)}
          />
        )
      )}
    </ul>
  );
}

function LogRow({
  log,
  showArea,
  onEdit,
}: {
  log: ActivityLogWithArea;
  showArea: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = getAreaIcon(log.lifeArea.slug);
  const visual = getAreaVisual(log.lifeArea.slug);

  function handleDelete() {
    startTransition(async () => {
      await deleteActivityLog(log.id);
      router.refresh();
    });
  }

  return (
    <li className="flex items-start justify-between gap-3 px-4 py-3">
      {showArea && (
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visual.iconWrap}`}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {showArea && (
            <span className="font-semibold text-slate-800 dark:text-slate-100">{log.lifeArea.name}</span>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">{formatDisplayDate(log.date)}</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">
            {formatLogDuration(log.durationMinutes, log.lifeArea.targetUnit as "hours" | "sessions" | "count")}
          </span>
        </div>
        {log.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{log.note}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 dark:text-red-300 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="rounded p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Edit log"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded p-1.5 text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete log"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function LogEditForm({
  log,
  areas,
  onCancel,
  onSaved,
}: {
  log: ActivityLogWithArea;
  areas: Pick<LifeArea, "id" | "name" | "targetUnit">[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState(log.lifeAreaId);

  const selectedUnit =
    areas.find((a) => a.id === selectedAreaId)?.targetUnit ??
    (log.lifeArea.targetUnit as LifeArea["targetUnit"]);

  const defaultDuration =
    selectedUnit !== "hours" && log.durationMinutes ? String(log.durationMinutes) : "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const lifeAreaId = String(formData.get("lifeAreaId"));
    const date = String(formData.get("date"));
    const note = String(formData.get("note") ?? "").trim();

    const area = areas.find((a) => a.id === lifeAreaId);
    if (!area) {
      setError("Select a life area.");
      return;
    }

    const durationResult = parseActivityDuration(formData, area.targetUnit);
    if (!durationResult.ok) {
      setError(durationResult.message);
      return;
    }

    startTransition(async () => {
      try {
        await updateActivityLog(log.id, {
          lifeAreaId,
          date,
          durationMinutes: durationResult.durationMinutes,
          note: note || null,
        });
        router.refresh();
        onSaved();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Area</label>
          <select
            name="lifeAreaId"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="input"
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Date</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={log.date}
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {selectedUnit === "hours" ? (
          <HoursMinutesDurationFields
            compact
            defaultTotalMinutes={log.durationMinutes}
            fieldKey={`${log.id}-${selectedAreaId}`}
          />
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Duration (minutes, optional)
            </label>
            <input
              name="duration"
              type="number"
              min={1}
              step={1}
              defaultValue={defaultDuration}
              key={`${log.id}-${selectedUnit}`}
              className="input"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Note</label>
          <input
            name="note"
            type="text"
            defaultValue={log.note ?? ""}
            className="input"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary inline-flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary inline-flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
