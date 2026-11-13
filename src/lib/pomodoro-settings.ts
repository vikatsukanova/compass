import {
  clampPomodoroSettings,
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroSettings,
} from "@/lib/pomodoro";

export const POMODORO_SETTINGS_STORAGE_KEY = "compass-pomodoro-settings";

export function loadPomodoroSettings(): PomodoroSettings {
  if (typeof window === "undefined") {
    return DEFAULT_POMODORO_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_POMODORO_SETTINGS;
    return clampPomodoroSettings(JSON.parse(raw) as Partial<PomodoroSettings>);
  } catch {
    return DEFAULT_POMODORO_SETTINGS;
  }
}

export function savePomodoroSettings(settings: PomodoroSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(POMODORO_SETTINGS_STORAGE_KEY, JSON.stringify(clampPomodoroSettings(settings)));
}
