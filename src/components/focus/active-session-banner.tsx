"use client";

import { getActiveFocusSession, type FocusSessionWithArea } from "@/actions/focus-session";
import { formatTimerDisplay, computeElapsedSeconds, remainingSeconds } from "@/lib/focus-session";
import { getPhaseLabel } from "@/lib/pomodoro";
import {
  computeBreakElapsedSeconds,
  loadPomodoroRunState,
  type PomodoroRunState,
} from "@/lib/pomodoro-run-state";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export function ActiveSessionBanner() {
  const pathname = usePathname();
  const [session, setSession] = useState<FocusSessionWithArea | null>(null);
  const [runState, setRunState] = useState<PomodoroRunState | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;
    getActiveFocusSession().then((active) => {
      if (mounted) setSession(active);
    });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    setRunState(loadPomodoroRunState());
  }, [pathname]);

  const breakTimer = runState?.breakTimer;
  const isActive = Boolean(session) || Boolean(breakTimer);

  useEffect(() => {
    if (!isActive) return;
    const isRunning =
      session?.status === "running" || breakTimer?.status === "running" || breakTimer?.status === "alarm";
    if (!isRunning) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isActive, session, breakTimer]);

  if (pathname === "/focus" || !isActive) return null;

  if (breakTimer && !session) {
    const elapsed = computeBreakElapsedSeconds(breakTimer, now);
    const remaining = remainingSeconds(breakTimer.plannedMinutes, elapsed);
    const label =
      breakTimer.status === "alarm"
        ? `Break over · ${getPhaseLabel(breakTimer.phase)}`
        : breakTimer.status === "paused"
          ? `Paused · ${getPhaseLabel(breakTimer.phase)}`
          : `${formatTimerDisplay(remaining)} · ${getPhaseLabel(breakTimer.phase)}`;

    return (
      <Link
        href="/focus"
        className="flex shrink-0 items-center justify-center gap-2 border-b border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100"
      >
        <Timer className="h-4 w-4 shrink-0" />
        <span>Break: {label}</span>
      </Link>
    );
  }

  if (!session) return null;

  const elapsed = computeElapsedSeconds(
    {
      status: session.status,
      elapsedSeconds: session.elapsedSeconds,
      lastResumedAt: session.lastResumedAt,
    },
    now
  );
  const remaining = remainingSeconds(session.plannedMinutes, elapsed);
  const label =
    remaining === 0 && session.status === "paused"
      ? `Time's up · ${session.lifeArea.name}`
      : session.status === "paused"
        ? `Paused · ${session.lifeArea.name}`
        : `${formatTimerDisplay(remaining)} · ${session.lifeArea.name}`;

  return (
    <Link
      href="/focus"
      className="flex shrink-0 items-center justify-center gap-2 border-b border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 text-sm font-medium text-blue-800 dark:text-blue-200 transition hover:bg-blue-100"
    >
      <Timer className="h-4 w-4 shrink-0" />
      <span>Focusing: {label}</span>
    </Link>
  );
}
