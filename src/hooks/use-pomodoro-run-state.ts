"use client";

import {
  getDefaultPomodoroRunState,
  loadPomodoroRunState,
  savePomodoroRunState,
  type PomodoroRunState,
} from "@/lib/pomodoro-run-state";
import { useCallback, useEffect, useState } from "react";

export function usePomodoroRunState() {
  const [runState, setRunState] = useState<PomodoroRunState>(getDefaultPomodoroRunState);

  useEffect(() => {
    setRunState(loadPomodoroRunState());
  }, []);

  const persistRunState = useCallback((next: PomodoroRunState) => {
    savePomodoroRunState(next);
    setRunState(next);
  }, []);

  const updateRunState = useCallback(
    (updater: (current: PomodoroRunState) => PomodoroRunState) => {
      setRunState((current) => {
        const next = updater(current);
        savePomodoroRunState(next);
        return next;
      });
    },
    []
  );

  return { runState, persistRunState, updateRunState };
}
