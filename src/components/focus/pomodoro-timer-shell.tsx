import type { ReactNode } from "react";
import type { PomodoroPhase } from "@/lib/pomodoro";
import { PomodoroModeTabs } from "@/components/focus/pomodoro-mode-tabs";

type PomodoroTimerShellProps = {
  activePhase: PomodoroPhase;
  onPhaseSelect?: (phase: PomodoroPhase) => void;
  phasesLocked?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export function PomodoroTimerShell({
  activePhase,
  onPhaseSelect,
  phasesLocked = false,
  children,
  footer,
}: PomodoroTimerShellProps) {
  const isBreak = activePhase === "short_break" || activePhase === "long_break";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div
        className={`rounded-3xl px-5 py-8 sm:px-8 sm:py-10 ${
          isBreak ? "bg-teal-50/80 dark:bg-teal-950/40 ring-1 ring-teal-100 dark:ring-teal-900" : "bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-100 dark:ring-blue-900"
        }`}
      >
        <PomodoroModeTabs
          activePhase={activePhase}
          onSelect={onPhaseSelect}
          locked={phasesLocked}
        />
        <div className="mt-6 flex flex-col items-center">{children}</div>
      </div>
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}

type PomodoroPrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "focus" | "break";
};

export function PomodoroPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  variant = "focus",
}: PomodoroPrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[10rem] rounded-xl px-10 py-3.5 text-base font-bold uppercase tracking-wider shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "break"
          ? "bg-white dark:bg-slate-900 text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50"
          : "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 hover:bg-blue-50"
      }`}
    >
      {children}
    </button>
  );
}

type PomodoroSecondaryActionsProps = {
  children: ReactNode;
};

export function PomodoroSecondaryActions({ children }: PomodoroSecondaryActionsProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
      {children}
    </div>
  );
}

export function PomodoroTextButton({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "danger"
          ? "text-red-600 dark:text-red-300 hover:text-red-800"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
