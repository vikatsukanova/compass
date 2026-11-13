import type { PomodoroPhase } from "@/lib/pomodoro";

const MODES: { phase: PomodoroPhase; label: string }[] = [
  { phase: "focus", label: "Pomodoro" },
  { phase: "short_break", label: "Short Break" },
  { phase: "long_break", label: "Long Break" },
];

type PomodoroModeTabsProps = {
  activePhase: PomodoroPhase;
  onSelect?: (phase: PomodoroPhase) => void;
  locked?: boolean;
};

export function PomodoroModeTabs({ activePhase, onSelect, locked = false }: PomodoroModeTabsProps) {
  return (
    <div
      className="flex justify-center gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-950/70"
      role="tablist"
      aria-label="Timer mode"
    >
      {MODES.map(({ phase, label }) => {
        const isActive = activePhase === phase;

        let tabClass = "rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ";
        if (isActive) {
          tabClass +=
            phase === "focus"
              ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500/15 dark:text-blue-200 dark:shadow-none"
              : "bg-teal-600 text-white shadow-sm dark:bg-teal-500/15 dark:text-teal-200 dark:shadow-none";
        } else if (locked) {
          tabClass += "cursor-default text-slate-400 dark:text-slate-500";
        } else {
          tabClass += "text-slate-600 hover:bg-white/60 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-slate-100";
        }

        return (
          <button
            key={phase}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={locked}
            onClick={() => onSelect?.(phase)}
            className={tabClass}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
