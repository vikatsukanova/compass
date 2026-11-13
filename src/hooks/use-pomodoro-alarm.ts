"use client";

import { useEffect } from "react";
import { startAlarmLoop, stopAlarmLoop } from "@/lib/pomodoro-alarm";

export function usePomodoroAlarm(isRinging: boolean, soundEnabled: boolean): void {
  useEffect(() => {
    if (!isRinging || !soundEnabled) {
      stopAlarmLoop();
      return;
    }

    const stop = startAlarmLoop();
    return stop;
  }, [isRinging, soundEnabled]);
}
