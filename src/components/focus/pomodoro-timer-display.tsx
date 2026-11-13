import { formatTimerDisplay } from "@/lib/focus-session";

type PomodoroTimerDisplayProps = {
  remainingSeconds: number;
  isAlarm?: boolean;
  subtitle?: string;
};

export function PomodoroTimerDisplay({
  remainingSeconds,
  isAlarm = false,
  subtitle,
}: PomodoroTimerDisplayProps) {
  return (
    <div className="py-10 text-center sm:py-14">
      {isAlarm ? (
        <p className="text-5xl font-bold tracking-tight text-amber-600 sm:text-6xl">0:00</p>
      ) : (
        <p className="text-7xl font-bold tabular-nums leading-none tracking-tight text-slate-800 dark:text-slate-100 sm:text-8xl">
          {formatTimerDisplay(remainingSeconds)}
        </p>
      )}
      {subtitle && (
        <p className={`mt-4 text-sm ${isAlarm ? "font-medium text-amber-700 dark:text-amber-300" : "text-slate-500 dark:text-slate-400"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
