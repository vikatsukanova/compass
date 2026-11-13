"use client";

import { DEFAULT_POMODORO_SETTINGS, type PomodoroSettings } from "@/lib/pomodoro";
import { loadPomodoroSettings, savePomodoroSettings } from "@/lib/pomodoro-settings";
import { useCallback, useEffect, useState } from "react";

export function usePomodoroSettings() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadPomodoroSettings());
    setLoaded(true);
  }, []);

  const updateSettings = useCallback((next: PomodoroSettings) => {
    savePomodoroSettings(next);
    setSettings(next);
  }, []);

  return { settings, updateSettings, loaded };
}
