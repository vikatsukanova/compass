"use client";

import { createLifeArea, updateLifeArea } from "@/actions/life-area";
import type { LifeArea, Priority, TargetUnit } from "@prisma/client";
import { HOURS_WEEKLY_TARGET_ATTRS } from "@/lib/duration-input";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AreaFormProps = {
  area?: LifeArea;
  onCancel?: () => void;
};

const UNITS: { value: TargetUnit; label: string }[] = [
  { value: "hours", label: "Hours" },
  { value: "sessions", label: "Sessions" },
  { value: "count", label: "Touchpoints" },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function AreaForm({ area, onCancel }: AreaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [targetUnit, setTargetUnit] = useState<TargetUnit>(area?.targetUnit ?? "sessions");

  const isEdit = Boolean(area);
  const weeklyTargetMin = targetUnit === "hours" ? HOURS_WEEKLY_TARGET_ATTRS.min : 1;
  const weeklyTargetStep = targetUnit === "hours" ? HOURS_WEEKLY_TARGET_ATTRS.step : 1;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const weeklyTarget = Number(formData.get("weeklyTarget"));
    const targetUnit = String(formData.get("targetUnit")) as TargetUnit;
    const priority = String(formData.get("priority")) as Priority;
    const isActive = formData.get("isActive") === "on";

    if (!name) {
      setError("Name is required.");
      return;
    }
    if (!Number.isFinite(weeklyTarget) || weeklyTarget <= 0) {
      setError("Weekly target must be a positive number.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && area) {
          const updated = await updateLifeArea(area.id, {
            name,
            weeklyTarget,
            targetUnit,
            priority,
            isActive,
          });
          router.push(`/areas/${updated.slug}`);
        } else {
          const created = await createLifeArea({ name, weeklyTarget, targetUnit, priority });
          router.push(`/areas/${created.slug}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          defaultValue={area?.name ?? ""}
          className="input"
          placeholder="e.g. Yoga, Cooking, Side project"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="weeklyTarget" className="label">
            Weekly target
          </label>
          <input
            id="weeklyTarget"
            name="weeklyTarget"
            type="number"
            required
            min={weeklyTargetMin}
            step={weeklyTargetStep}
            defaultValue={area?.weeklyTarget ?? 1}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="targetUnit" className="label">
            Unit
          </label>
          <select
            id="targetUnit"
            name="targetUnit"
            value={targetUnit}
            onChange={(e) => setTargetUnit(e.target.value as TargetUnit)}
            className="input"
          >
            {UNITS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="priority" className="label">
          Priority
        </label>
        <select id="priority" name="priority" defaultValue={area?.priority ?? "medium"} className="input">
          {PRIORITIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">High-priority areas surface first in Today&apos;s Focus.</p>
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={area?.isActive ?? true}
            className="checkbox"
          />
          Active (uncheck to hide from daily views)
        </label>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Add area"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
