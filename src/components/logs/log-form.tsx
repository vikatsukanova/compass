"use client";

import { createActivityLog } from "@/actions/activity-log";
import type { LifeArea, TargetUnit } from "@prisma/client";
import { HoursMinutesDurationFields } from "@/components/logs/hours-minutes-duration";
import { parseActivityDuration } from "@/lib/duration-input";
import { todayIsoDate } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type LogFormProps = {
  areas: Pick<LifeArea, "id" | "name" | "targetUnit">[];
  defaultAreaId?: string;
  onSuccess?: () => void;
};

export function LogForm({ areas, defaultAreaId, onSuccess }: LogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState(defaultAreaId ?? areas[0]?.id ?? "");

  const selectedUnit = useMemo(
    () => areas.find((a) => a.id === selectedAreaId)?.targetUnit ?? "sessions",
    [areas, selectedAreaId]
  );

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

    const formEl = event.currentTarget;

    startTransition(async () => {
      try {
        await createActivityLog({
          lifeAreaId,
          date,
          durationMinutes: durationResult.durationMinutes,
          note: note || null,
        });
        formEl.reset();
        setSelectedAreaId(defaultAreaId ?? areas[0]?.id ?? "");
        router.refresh();
        onSuccess?.();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  if (areas.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Add a life area first before logging activity.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lifeAreaId" className="label">
          Life area
        </label>
        <select
          id="lifeAreaId"
          name="lifeAreaId"
          required
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="label">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={todayIsoDate()}
            className="input"
          />
        </div>

        <DurationField unit={selectedUnit} areaKey={selectedAreaId} />
      </div>

      <div>
        <label htmlFor="note" className="label">
          Note <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
        </label>
        <input
          id="note"
          name="note"
          type="text"
          maxLength={500}
          placeholder="What did you do?"
          className="input"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Saving…" : "Log activity"}
      </button>
    </form>
  );
}

function DurationField({ unit, areaKey }: { unit: TargetUnit; areaKey: string }) {
  if (unit === "hours") {
    return <HoursMinutesDurationFields fieldKey={areaKey} />;
  }

  return (
    <div>
      <label htmlFor="duration" className="label">
        Duration (minutes) <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
      </label>
      <input
        id="duration"
        name="duration"
        type="number"
        min={1}
        step={1}
        placeholder="Leave blank for 1"
        className="input"
      />
    </div>
  );
}
