"use client";

import { PomodoroTimerDisplay } from "@/components/focus/pomodoro-timer-display";
import {
  PomodoroPrimaryButton,
  PomodoroSecondaryActions,
  PomodoroTextButton,
  PomodoroTimerShell,
} from "@/components/focus/pomodoro-timer-shell";
import { usePomodoroAlarm } from "@/hooks/use-pomodoro-alarm";
import { remainingSeconds } from "@/lib/focus-session";
import { unlockAudioContext } from "@/lib/pomodoro-alarm";
import { getPhaseLabel, type PomodoroSettings } from "@/lib/pomodoro";
import {
  computeBreakElapsedSeconds,
  pauseBreakTimer,
  resetBreakTimer,
  resumeBreakTimer,
  setBreakAlarm,
  type BreakTimerState,
  type PomodoroRunState,
} from "@/lib/pomodoro-run-state";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PomodoroBreakViewProps = {
  breakTimer: BreakTimerState;
  settings: PomodoroSettings;
  onUpdateRunState: (updater: (current: PomodoroRunState) => PomodoroRunState) => void;
  onSkipBreak: () => void;
};

export function PomodoroBreakView({
  breakTimer: initialBreakTimer,
  settings,
  onUpdateRunState,
  onSkipBreak,
}: PomodoroBreakViewProps) {
  const router = useRouter();
  const [breakTimer, setBreakTimer] = useState(initialBreakTimer);
  const [now, setNow] = useState(() => new Date());
  const alarmTriggeredRef = useRef(false);

  const isAlarm = breakTimer.status === "alarm";
  const isRunning = breakTimer.status === "running";
  const elapsed = computeBreakElapsedSeconds(breakTimer, now);
  const remaining = remainingSeconds(breakTimer.plannedMinutes, elapsed);

  usePomodoroAlarm(isAlarm, settings.alarmSound);

  useEffect(() => {
    setBreakTimer(initialBreakTimer);
  }, [initialBreakTimer]);

  useEffect(() => {
    if (!isRunning && !isAlarm) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isRunning, isAlarm]);

  useEffect(() => {
    const displayRemaining = isAlarm ? "0:00" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    document.title = `${displayRemaining} · Break`;
    return () => {
      document.title = "Compass";
    };
  }, [isAlarm, remaining]);

  useEffect(() => {
    if (remaining > 0 || breakTimer.status !== "running") {
      if (breakTimer.status === "running" && remaining > 0) {
        alarmTriggeredRef.current = false;
      }
      return;
    }

    if (!alarmTriggeredRef.current) {
      alarmTriggeredRef.current = true;
      const alarmed = setBreakAlarm(breakTimer, now);
      setBreakTimer(alarmed);
      onUpdateRunState((current) => ({ ...current, breakTimer: alarmed }));
    }
  }, [remaining, breakTimer, now, onUpdateRunState]);

  function persistBreak(next: BreakTimerState) {
    unlockAudioContext();
    setBreakTimer(next);
    onUpdateRunState((current) => ({ ...current, breakTimer: next }));
  }

  function handleDismissAlarm() {
    alarmTriggeredRef.current = false;
    const paused = pauseBreakTimer({ ...breakTimer, status: "running" }, now);
    persistBreak({ ...paused, status: "paused" });
  }

  function handleStartFocus() {
    onSkipBreak();
    router.refresh();
  }

  const subtitle = isAlarm
    ? "Break over — ready for your next focus?"
    : getPhaseLabel(breakTimer.phase);

  function renderPrimaryButton() {
    if (isAlarm) {
      return (
        <PomodoroPrimaryButton variant="break" onClick={handleStartFocus}>
          Start focus
        </PomodoroPrimaryButton>
      );
    }

    if (breakTimer.status === "running") {
      return (
        <PomodoroPrimaryButton
          variant="break"
          onClick={() => persistBreak(pauseBreakTimer(breakTimer, now))}
        >
          Pause
        </PomodoroPrimaryButton>
      );
    }

    return (
      <PomodoroPrimaryButton
        variant="break"
        onClick={() => persistBreak(resumeBreakTimer(breakTimer, now))}
      >
        Start
      </PomodoroPrimaryButton>
    );
  }

  return (
    <PomodoroTimerShell activePhase={breakTimer.phase} phasesLocked>
      <PomodoroTimerDisplay
        remainingSeconds={remaining}
        isAlarm={isAlarm}
        subtitle={subtitle}
      />

      {renderPrimaryButton()}

      <PomodoroSecondaryActions>
        <PomodoroTextButton
          onClick={() => {
            alarmTriggeredRef.current = false;
            persistBreak(resetBreakTimer(breakTimer));
          }}
        >
          Reset
        </PomodoroTextButton>

        {!isAlarm && (
          <PomodoroTextButton onClick={onSkipBreak}>Skip break</PomodoroTextButton>
        )}

        {isAlarm && (
          <PomodoroTextButton onClick={handleDismissAlarm}>Dismiss alarm</PomodoroTextButton>
        )}
      </PomodoroSecondaryActions>
    </PomodoroTimerShell>
  );
}
