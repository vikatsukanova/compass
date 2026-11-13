"use client";

import {
  completeTask,
  deleteTask,
  reopenTask,
  updateTask,
  type TaskWithArea,
} from "@/actions/task";
import type { LifeArea } from "@prisma/client";
import { formatDisplayDate, isPastDue } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

type StatusFilter = "open" | "done" | "all";

type TaskListProps = {
  tasks: TaskWithArea[];
  areas: Pick<LifeArea, "id" | "name">[];
};

export function TaskList({ tasks, areas }: TaskListProps) {
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (areaFilter !== "all" && task.lifeAreaId !== areaFilter) return false;
      if (statusFilter === "open" && task.status !== "open") return false;
      if (statusFilter === "done" && task.status !== "done") return false;
      return true;
    });
  }, [tasks, areaFilter, statusFilter]);

  const openCount = tasks.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="field"
        >
          <option value="all">All areas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="field"
        >
          <option value="open">Open ({openCount})</option>
          <option value="done">Done</option>
          <option value="all">All</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          {statusFilter === "open" ? "No open tasks. You're clear!" : "No tasks match these filters."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {filtered.map((task) =>
            editingId === task.id ? (
              <li key={task.id} className="p-4">
                <TaskEditForm
                  task={task}
                  areas={areas}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => setEditingId(null)}
                />
              </li>
            ) : (
              <TaskRow key={task.id} task={task} onEdit={() => setEditingId(task.id)} />
            )
          )}
        </ul>
      )}
    </div>
  );
}

function TaskRow({ task, onEdit }: { task: TaskWithArea; onEdit: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDone = task.status === "done";
  const overdue = !isDone && isPastDue(task.dueDate);

  function toggleComplete() {
    startTransition(async () => {
      if (isDone) {
        await reopenTask(task.id);
      } else {
        await completeTask(task.id);
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
    });
  }

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <button
        type="button"
        onClick={toggleComplete}
        disabled={isPending}
        aria-label={isDone ? "Reopen task" : "Complete task"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          isDone
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-blue-500"
        }`}
      >
        {isDone && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`font-medium ${isDone ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-slate-100"}`}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={`/areas/${task.lifeArea.slug}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
          >
            {task.lifeArea.name}
          </Link>
          {task.dueDate && (
            <span className={overdue ? "font-medium text-red-600 dark:text-red-300" : "text-slate-500 dark:text-slate-400"}>
              Due {formatDisplayDate(task.dueDate)}
              {overdue && " · Overdue"}
            </span>
          )}
          {task.isUrgent && task.status === "open" && (
            <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200 ring-inset">
              Urgent
            </span>
          )}
        </div>
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
              aria-label="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded p-1.5 text-slate-400 dark:text-slate-500 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function TaskEditForm({
  task,
  areas,
  onCancel,
  onSaved,
}: {
  task: TaskWithArea;
  areas: Pick<LifeArea, "id" | "name">[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

    startTransition(async () => {
      try {
        await updateTask(task.id, {
          lifeAreaId,
          title,
          dueDate: dueDate || null,
          isUrgent,
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
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={task.title}
          className="input"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Life area</label>
          <select
            name="lifeAreaId"
            defaultValue={task.lifeAreaId}
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
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Due date</label>
          <input
            name="dueDate"
            type="date"
            defaultValue={task.dueDate ?? ""}
            className="input"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          name="isUrgent"
          defaultChecked={task.isUrgent}
          className="checkbox"
        />
        Urgent
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
