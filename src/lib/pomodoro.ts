export type PomodoroPhase = "focus" | "short_break" | "long_break";

export type PomodoroSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  alarmSound: boolean;
  autoStartNextPhase: boolean;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  alarmSound: true,
  autoStartNextPhase: false,
};

export const POMODORO_FOCUS_PRESETS = [15, 25, 45] as const;

export function getBreakAfterFocus(
  completedInCycle: number,
  settings: Pick<PomodoroSettings, "longBreakInterval">
): "short_break" | "long_break" {
  if (completedInCycle >= settings.longBreakInterval) {
    return "long_break";
  }
  return "short_break";
}

export function getPhaseDurationMinutes(
  phase: PomodoroPhase,
  settings: PomodoroSettings
): number {
  switch (phase) {
    case "focus":
      return settings.focusMinutes;
    case "short_break":
      return settings.shortBreakMinutes;
    case "long_break":
      return settings.longBreakMinutes;
  }
}

export function getPhaseLabel(phase: PomodoroPhase): string {
  switch (phase) {
    case "focus":
      return "Focus";
    case "short_break":
      return "Short break";
    case "long_break":
      return "Long break";
  }
}

export function getPomodoroCountLabel(completedInCycle: number, interval: number): string {
  const current = (completedInCycle % interval) + 1;
  return `Pomodoro ${current} of ${interval}`;
}

export function nextCompletedInCycleAfterFocus(
  completedInCycle: number,
  settings: Pick<PomodoroSettings, "longBreakInterval">
): number {
  const next = completedInCycle + 1;
  if (next >= settings.longBreakInterval) {
    return settings.longBreakInterval;
  }
  return next;
}

export function completedInCycleAfterLongBreakStart(): number {
  return 0;
}

export function clampPomodoroSettings(settings: Partial<PomodoroSettings>): PomodoroSettings {
  return {
    focusMinutes: clampMinutes(settings.focusMinutes, DEFAULT_POMODORO_SETTINGS.focusMinutes, 1, 180),
    shortBreakMinutes: clampMinutes(
      settings.shortBreakMinutes,
      DEFAULT_POMODORO_SETTINGS.shortBreakMinutes,
      1,
      60
    ),
    longBreakMinutes: clampMinutes(
      settings.longBreakMinutes,
      DEFAULT_POMODORO_SETTINGS.longBreakMinutes,
      15,
      30
    ),
    longBreakInterval: clampMinutes(
      settings.longBreakInterval,
      DEFAULT_POMODORO_SETTINGS.longBreakInterval,
      2,
      8
    ),
    alarmSound: settings.alarmSound ?? DEFAULT_POMODORO_SETTINGS.alarmSound,
    autoStartNextPhase: settings.autoStartNextPhase ?? DEFAULT_POMODORO_SETTINGS.autoStartNextPhase,
  };
}

function clampMinutes(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}
