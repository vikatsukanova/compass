import type { FocusSessionWithArea } from "@/actions/focus-session";
import { formatLogDuration } from "@/lib/format";
import { getPhaseLabel, type PomodoroPhase } from "@/lib/pomodoro";
import Link from "next/link";

type FocusCompleteProps = {
  session: FocusSessionWithArea;
  pendingBreakPhase?: Extract<PomodoroPhase, "short_break" | "long_break"> | null;
  onStartBreak?: () => void;
  onDismissBreak?: () => void;
};

export function FocusComplete({
  session,
  pendingBreakPhase,
  onStartBreak,
  onDismissBreak,
}: FocusCompleteProps) {
  const durationMinutes = session.elapsedSeconds
    ? Math.max(1, Math.round(session.elapsedSeconds / 60))
    : 0;

  return (
    <div className="mx-auto w-full max-w-lg text-center">
      <div className="rounded-3xl bg-blue-50/50 dark:bg-blue-950/40 px-6 py-10 ring-1 ring-blue-100 dark:ring-blue-900 sm:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">Session logged</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {formatLogDuration(durationMinutes, session.lifeArea.targetUnit as "hours" | "sessions" | "count")}{" "}
          added to <span className="font-medium text-slate-800 dark:text-slate-100">{session.lifeArea.name}</span>
        </p>
        {session.note && (
          <blockquote className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 px-4 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
            {session.note}
          </blockquote>
        )}

        {pendingBreakPhase && onStartBreak && (
          <div className="mt-6 rounded-xl bg-teal-50 p-4 ring-1 ring-teal-100 dark:ring-teal-900">
            <p className="text-sm text-teal-900">
              Ready for a {getPhaseLabel(pendingBreakPhase).toLowerCase()}?
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button type="button" onClick={onStartBreak} className="btn-primary">
                Start {getPhaseLabel(pendingBreakPhase).toLowerCase()}
              </button>
              {onDismissBreak && (
                <button type="button" onClick={onDismissBreak} className="btn-secondary">
                  Skip for now
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href={`/areas/${session.lifeArea.slug}`} className="btn-primary">
            View {session.lifeArea.name}
          </Link>
          <Link href="/focus" className="btn-secondary">
            Start another focus
          </Link>
        </div>
      </div>
    </div>
  );
}
