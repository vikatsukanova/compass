"use client";

import { createTask } from "@/actions/task";
import type { LifeArea } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TaskFormProps = {
  areas: Pick<LifeArea, "id" | "name">[];
  defaultAreaId?: string;
  onSuccess?: () => void;
};

export function TaskForm({ areas, defaultAreaId, onSuccess }: TaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (areas.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Add a life area first before creating tasks.</p>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const lifeAreaId = String(formData.get("lifeAreaId"));
    const title = String(formData.get("title") ?? "").trim();
    const dueDate = String(formData.get("dueDate") ?? "").trim();
    const isUrgent = formData.get("isUrgent") === "on";

    if (!title) {
      setError("Title is required.");
      return;
    }

    const formEl = event.currentTarget;

    startTransition(async () => {
      try {
        await createTask({
          lifeAreaId,
          title,
          dueDate: dueDate || null,
          isUrgent,
        });
        formEl.reset();
        router.refresh();
        onSuccess?.();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="What needs doing?"
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lifeAreaId" className="label">
            Life area
          </label>
          <select
            id="lifeAreaId"
            name="lifeAreaId"
            required
            defaultValue={defaultAreaId ?? areas[0]?.id}
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
          <label htmlFor="dueDate" className="label">
            Due date <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="input"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          name="isUrgent"
          className="checkbox"
        />
        Urgent — surfaces in Today&apos;s Focus
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Saving…" : "Add task"}
      </button>
    </form>
  );
}
