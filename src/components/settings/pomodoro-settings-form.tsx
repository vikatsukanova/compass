"use client";

import { usePomodoroSettings } from "@/hooks/use-pomodoro-settings";
import {
  clampPomodoroSettings,
  DEFAULT_POMODORO_SETTINGS,
  POMODORO_FOCUS_PRESETS,
} from "@/lib/pomodoro";
import { useState } from "react";

export function PomodoroSettingsForm() {
  const { settings, updateSettings, loaded } = usePomodoroSettings();
  const [saved, setSaved] = useState(false);

  if (!loaded) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading settings…</p>;
  }

  function handleChange<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    updateSettings(clampPomodoroSettings({ ...settings, [key]: value }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Focus length (minutes)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {POMODORO_FOCUS_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => handleChange("focusMinutes", minutes)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                settings.focusMinutes === minutes
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {minutes} min
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="short-break" className="label">
            Short break (minutes)
          </label>
          <input
            id="short-break"
            type="number"
            min={1}
            max={60}
            value={settings.shortBreakMinutes}
            onChange={(e) => handleChange("shortBreakMinutes", Number(e.target.value))}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="long-break" className="label">
            Long break (minutes)
          </label>
          <input
            id="long-break"
            type="number"
            min={15}
            max={30}
            value={settings.longBreakMinutes}
            onChange={(e) => handleChange("longBreakMinutes", Number(e.target.value))}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="long-break-interval" className="label">
          Long break after (focus sessions)
        </label>
        <input
          id="long-break-interval"
          type="number"
          min={2}
          max={8}
          value={settings.longBreakInterval}
          onChange={(e) => handleChange("longBreakInterval", Number(e.target.value))}
          className="input max-w-xs"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={settings.alarmSound}
            onChange={(e) => handleChange("alarmSound", e.target.checked)}
            className="checkbox"
          />
          Play alarm when timer ends
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={settings.autoStartNextPhase}
            onChange={(e) => handleChange("autoStartNextPhase", e.target.checked)}
            className="checkbox"
          />
          Auto-start next phase after completing focus
        </label>
      </div>

      {saved && (
        <p className="text-sm text-emerald-600 dark:text-emerald-300">Settings saved.</p>
      )}

      <button
        type="button"
        onClick={() => updateSettings(DEFAULT_POMODORO_SETTINGS)}
        className="btn-secondary"
      >
        Reset to defaults
      </button>
    </div>
  );
}
