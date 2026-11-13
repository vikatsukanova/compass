import type { PomodoroPhase } from "@/lib/pomodoro";
import { computeElapsedSeconds, type FocusSessionTiming } from "@/lib/focus-session";

export type BreakTimerStatus = "running" | "paused" | "alarm";

export type BreakTimerState = {
  phase: Extract<PomodoroPhase, "short_break" | "long_break">;
  plannedMinutes: number;
  elapsedSeconds: number;
  status: BreakTimerStatus;
  lastResumedAt: string | null;
};

export type PomodoroRunState = {
  completedInCycle: number;
  breakTimer: BreakTimerState | null;
};

export const POMODORO_RUN_STORAGE_KEY = "compass-pomodoro-run";

export function getDefaultPomodoroRunState(): PomodoroRunState {
  return { completedInCycle: 0, breakTimer: null };
}

export function loadPomodoroRunState(): PomodoroRunState {
  if (typeof window === "undefined") {
    return getDefaultPomodoroRunState();
  }

  try {
    const raw = localStorage.getItem(POMODORO_RUN_STORAGE_KEY);
    if (!raw) return getDefaultPomodoroRunState();
    const parsed = JSON.parse(raw) as PomodoroRunState;
    return {
      completedInCycle: Math.max(0, parsed.completedInCycle ?? 0),
      breakTimer: parsed.breakTimer ?? null,
    };
  } catch {
    return getDefaultPomodoroRunState();
  }
}

export function savePomodoroRunState(state: PomodoroRunState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(POMODORO_RUN_STORAGE_KEY, JSON.stringify(state));
}

export function clearBreakTimer(state: PomodoroRunState): PomodoroRunState {
  return { ...state, breakTimer: null };
}

export type BreakTimerTiming = {
  status: BreakTimerStatus;
  elapsedSeconds: number;
  lastResumedAt: Date | null;
};

export function breakTimerToTiming(breakTimer: BreakTimerState): BreakTimerTiming {
  return {
    status: breakTimer.status,
    elapsedSeconds: breakTimer.elapsedSeconds,
    lastResumedAt: breakTimer.lastResumedAt ? new Date(breakTimer.lastResumedAt) : null,
  };
}

export function computeBreakElapsedSeconds(breakTimer: BreakTimerState, now = new Date()): number {
  if (breakTimer.status === "alarm") {
    return breakTimer.plannedMinutes * 60;
  }

  const timing: FocusSessionTiming = {
    status: breakTimer.status === "running" ? "running" : "paused",
    elapsedSeconds: breakTimer.elapsedSeconds,
    lastResumedAt: breakTimer.lastResumedAt ? new Date(breakTimer.lastResumedAt) : null,
  };

  return computeElapsedSeconds(timing, now);
}

export function createBreakTimer(
  phase: BreakTimerState["phase"],
  plannedMinutes: number
): BreakTimerState {
  const now = new Date().toISOString();
  return {
    phase,
    plannedMinutes,
    elapsedSeconds: 0,
    status: "running",
    lastResumedAt: now,
  };
}

export function pauseBreakTimer(breakTimer: BreakTimerState, now = new Date()): BreakTimerState {
  const elapsedSeconds = computeBreakElapsedSeconds(breakTimer, now);
  return {
    ...breakTimer,
    status: "paused",
    elapsedSeconds,
    lastResumedAt: null,
  };
}

export function resumeBreakTimer(breakTimer: BreakTimerState, now = new Date()): BreakTimerState {
  return {
    ...breakTimer,
    status: "running",
    lastResumedAt: now.toISOString(),
  };
}

export function resetBreakTimer(breakTimer: BreakTimerState): BreakTimerState {
  const now = new Date().toISOString();
  return {
    ...breakTimer,
    elapsedSeconds: 0,
    status: "running",
    lastResumedAt: now,
  };
}

export function setBreakAlarm(breakTimer: BreakTimerState, now = new Date()): BreakTimerState {
  return {
    ...breakTimer,
    status: "alarm",
    elapsedSeconds: breakTimer.plannedMinutes * 60,
    lastResumedAt: null,
  };
}
