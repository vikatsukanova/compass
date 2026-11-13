"use client";

import { QuickLogSection } from "@/components/dashboard/quick-log-section";
import { WeeklySummaryCompact } from "@/components/dashboard/weekly-summary";
import { useDashboardPanel } from "@/components/layout/dashboard-panel-context";
import { todayIsoDate } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { completeTask, type TaskWithArea } from "@/actions/task";
import { Flower2, Sparkles } from "lucide-react";

export function RightPanel() {
  const { data } = useDashboardPanel();

  if (!data) {
    return (
      <div className="flex h-full flex-col gap-8">
        <PanelSkeleton />
      </div>
    );
  }

  const { todayTasks, areas, quickLogAreas, summary, recommendation } = data;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <WeeklySummaryCompact summary={summary} className="mb-5 shrink-0" />

      <TodayTasksSection tasks={todayTasks} />

      <QuickLogSection areas={areas} quickLogAreas={quickLogAreas} className="mb-5 shrink-0" />

      <section className="shrink-0 border-t border-slate-100 dark:border-slate-800 pt-4">
        {recommendation && (
          <>
            <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Recommended focus</h3>
            <div className="relative overflow-hidden rounded-3xl border border-blue-100/50 bg-gradient-to-br from-blue-50 dark:from-blue-950 to-purple-100 dark:to-purple-950 p-5">
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-purple-200 dark:bg-purple-900 opacity-70 mix-blend-multiply blur-xl" />
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{recommendation.name}</h4>
                </div>
                <p className="mb-4 pr-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{recommendation.subtitle}</p>
                <Link
                  href={`/focus?area=${recommendation.slug}`}
                  className="inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Start timer
                </Link>
              </div>
              <Flower2 className="absolute bottom-4 right-4 h-10 w-10 text-purple-400 dark:text-purple-300 opacity-50" />
            </div>
          </>
        )}
        <p className="mt-4 text-center text-xs italic text-slate-400 dark:text-slate-500">
          Small steps in the right direction lead to big change.
        </p>
      </section>
    </div>
  );
}

function TodayTasksSection({ tasks }: { tasks: TaskWithArea[] }) {
  return (
    <section className="mb-5 flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 items-end justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Today&apos;s Tasks</h2>
        <Link href="/tasks" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          View all
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No urgent or due-today tasks.</p>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
          {tasks.map((task) => (
            <TodayTaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}

function TodayTaskRow({ task }: { task: TaskWithArea }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDueToday = task.dueDate === todayIsoDate();

  function handleComplete() {
    startTransition(async () => {
      await completeTask(task.id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800">
      <button
        type="button"
        onClick={handleComplete}
        disabled={isPending}
        aria-label={`Complete ${task.title}`}
        className="mt-1 h-4 w-4 shrink-0 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 accent-blue-600 transition hover:border-blue-500 disabled:opacity-50"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight text-slate-700 dark:text-slate-200">{task.title}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {task.lifeArea.name}
          {task.isUrgent && (
            <span className="ml-1 rounded bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
              Urgent
            </span>
          )}
          {isDueToday && (
            <span className="ml-1 rounded bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300">
              Due today
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <section key={i}>
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 space-y-2">
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </section>
      ))}
    </>
  );
}
