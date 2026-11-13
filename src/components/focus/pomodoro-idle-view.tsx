"use client";

import { startFocusSession } from "@/actions/focus-session";
import { PomodoroTimerDisplay } from "@/components/focus/pomodoro-timer-display";
import {
  PomodoroPrimaryButton,
  PomodoroTimerShell,
} from "@/components/focus/pomodoro-timer-shell";
import { unlockAudioContext } from "@/lib/pomodoro-alarm";
import { getPhaseDurationMinutes, getPomodoroCountLabel, type PomodoroPhase, type PomodoroSettings } from "@/lib/pomodoro";
import { createBreakTimer } from "@/lib/pomodoro-run-state";
import type { LifeArea } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type PomodoroIdleViewProps = {
  areas: Pick<LifeArea, "id" | "name" | "slug">[];
  defaultAreaSlug?: string;
  settings: PomodoroSettings;
  completedInCycle: number;
  onStartBreak: (phase: "short_break" | "long_break") => void;
};

export function PomodoroIdleView({
  areas,
  defaultAreaSlug,
  settings,
  completedInCycle,
  onStartBreak,
}: PomodoroIdleViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PomodoroPhase>("focus");

  const defaultAreaId = useMemo(() => {
    if (defaultAreaSlug) {
      const match = areas.find((a) => a.slug === defaultAreaSlug);
      if (match) return match.id;
    }
    return areas[0]?.id ?? "";
  }, [areas, defaultAreaSlug]);

  const [lifeAreaId, setLifeAreaId] = useState(defaultAreaId);

  const plannedMinutes = getPhaseDurationMinutes(selectedPhase, settings);
  const isBreak = selectedPhase === "short_break" || selectedPhase === "long_break";
  const subtitle =
    selectedPhase === "focus"
      ? getPomodoroCountLabel(completedInCycle, settings.longBreakInterval)
      : `${plannedMinutes} minute break`;

  function handleStart() {
    setError(null);
    unlockAudioContext();

    if (isBreak) {
      onStartBreak(selectedPhase);
      return;
    }

    if (!lifeAreaId) {
      setError("Choose a life area first.");
      return;
    }

    startTransition(async () => {
      try {
        await startFocusSession({ lifeAreaId, plannedMinutes });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not start session.");
      }
    });
  }

  if (areas.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Add a life area before starting a focus session.{" "}
        <Link href="/areas" className="link-accent">
          Manage areas
        </Link>
      </p>
    );
  }

  return (
    <PomodoroTimerShell
      activePhase={selectedPhase}
      onPhaseSelect={setSelectedPhase}
      footer={
        selectedPhase === "focus" ? (
          <div className="mx-auto max-w-lg space-y-4">
            <div>
              <label htmlFor="focus-area" className="label">
                Life area
              </label>
              <select
                id="focus-area"
                value={lifeAreaId}
                onChange={(e) => setLifeAreaId(e.target.value)}
                className="input"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              A short note is required when you complete a focus session.
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Breaks are not logged — only focus time counts toward your life areas.
          </p>
        )
      }
    >
      <PomodoroTimerDisplay
        remainingSeconds={plannedMinutes * 60}
        subtitle={subtitle}
      />

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</p>}

      <PomodoroPrimaryButton
        onClick={handleStart}
        disabled={isPending || (selectedPhase === "focus" && !lifeAreaId)}
        variant={isBreak ? "break" : "focus"}
      >
        {isPending ? "Starting…" : "Start"}
      </PomodoroPrimaryButton>
    </PomodoroTimerShell>
  );
}
