"use client";

import type { FocusSessionWithArea } from "@/actions/focus-session";
import { FocusComplete } from "@/components/focus/focus-complete";
import { FocusSessionView } from "@/components/focus/focus-session-view";
import { PomodoroBreakView } from "@/components/focus/pomodoro-break-view";
import { PomodoroIdleView } from "@/components/focus/pomodoro-idle-view";
import { usePomodoroRunState } from "@/hooks/use-pomodoro-run-state";
import { usePomodoroSettings } from "@/hooks/use-pomodoro-settings";
import {
  completedInCycleAfterLongBreakStart,
  getBreakAfterFocus,
  getPhaseDurationMinutes,
  nextCompletedInCycleAfterFocus,
  type PomodoroPhase,
} from "@/lib/pomodoro";
import { clearBreakTimer, createBreakTimer } from "@/lib/pomodoro-run-state";
import type { LifeArea } from "@prisma/client";
import { useCallback, useState } from "react";

type FocusPageClientProps = {
  initialSession: FocusSessionWithArea | null;
  areas: Pick<LifeArea, "id" | "name" | "slug">[];
  defaultAreaSlug?: string;
};

export function FocusPageClient({
  initialSession,
  areas,
  defaultAreaSlug,
}: FocusPageClientProps) {
  const { settings } = usePomodoroSettings();
  const { runState, updateRunState } = usePomodoroRunState();
  const [completedSession, setCompletedSession] = useState<FocusSessionWithArea | null>(null);
  const [pendingBreakPhase, setPendingBreakPhase] = useState<
    Extract<PomodoroPhase, "short_break" | "long_break"> | null
  >(null);

  const startBreak = useCallback(
    (phase: Extract<PomodoroPhase, "short_break" | "long_break">) => {
      const plannedMinutes = getPhaseDurationMinutes(phase, settings);
      const breakTimer = createBreakTimer(phase, plannedMinutes);
      updateRunState((current) => {
        const completedInCycle =
          phase === "long_break"
            ? completedInCycleAfterLongBreakStart()
            : current.completedInCycle;
        return { completedInCycle, breakTimer };
      });
      setPendingBreakPhase(null);
    },
    [settings, updateRunState]
  );

  const handleFocusComplete = useCallback(
    (session: FocusSessionWithArea) => {
      const nextCount = nextCompletedInCycleAfterFocus(runState.completedInCycle, settings);
      const breakPhase = getBreakAfterFocus(nextCount, settings);

      updateRunState((current) => ({
        ...current,
        completedInCycle: nextCount,
      }));

      if (settings.autoStartNextPhase) {
        startBreak(breakPhase);
        setCompletedSession(null);
      } else {
        setCompletedSession(session);
        setPendingBreakPhase(breakPhase);
      }
    },
    [runState.completedInCycle, settings, startBreak, updateRunState]
  );

  const handleSkipBreak = useCallback(() => {
    updateRunState((current) => clearBreakTimer(current));
  }, [updateRunState]);

  if (completedSession) {
    return (
      <FocusComplete
        session={completedSession}
        pendingBreakPhase={pendingBreakPhase}
        onStartBreak={() => {
          if (pendingBreakPhase) startBreak(pendingBreakPhase);
        }}
        onDismissBreak={() => setPendingBreakPhase(null)}
      />
    );
  }

  if (runState.breakTimer) {
    return (
      <PomodoroBreakView
        breakTimer={runState.breakTimer}
        settings={settings}
        onUpdateRunState={updateRunState}
        onSkipBreak={handleSkipBreak}
      />
    );
  }

  if (initialSession) {
    return (
      <FocusSessionView
        session={initialSession}
        settings={settings}
        completedInCycle={runState.completedInCycle}
        onComplete={handleFocusComplete}
      />
    );
  }

  return (
    <PomodoroIdleView
      areas={areas}
      defaultAreaSlug={defaultAreaSlug}
      settings={settings}
      completedInCycle={runState.completedInCycle}
      onStartBreak={startBreak}
    />
  );
}
