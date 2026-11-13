"use client";

import {
  cancelFocusSession,
  completeFocusSession,
  pauseFocusSession,
  resetFocusSession,
  resumeFocusSession,
  updateFocusSessionNote,
  type FocusSessionWithArea,
} from "@/actions/focus-session";
import { PomodoroTimerDisplay } from "@/components/focus/pomodoro-timer-display";
import {
  PomodoroPrimaryButton,
  PomodoroSecondaryActions,
  PomodoroTextButton,
  PomodoroTimerShell,
} from "@/components/focus/pomodoro-timer-shell";
import { usePomodoroAlarm } from "@/hooks/use-pomodoro-alarm";
import {
  computeElapsedSeconds,
  isNoteValidForComplete,
  MAX_FOCUS_NOTE_LENGTH,
  remainingSeconds,
} from "@/lib/focus-session";
import { unlockAudioContext } from "@/lib/pomodoro-alarm";
import { getPomodoroCountLabel, type PomodoroSettings } from "@/lib/pomodoro";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type FocusSessionViewProps = {
  session: FocusSessionWithArea;
  settings: PomodoroSettings;
  completedInCycle: number;
  onComplete: (session: FocusSessionWithArea) => void;
};

export function FocusSessionView({
  session: initialSession,
  settings,
  completedInCycle,
  onComplete,
}: FocusSessionViewProps) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [note, setNote] = useState(initialSession.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date());
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alarmTriggeredRef = useRef(false);

  const elapsed = computeElapsedSeconds(
    {
      status: session.status,
      elapsedSeconds: session.elapsedSeconds,
      lastResumedAt: session.lastResumedAt,
    },
    now
  );
  const remaining = remainingSeconds(session.plannedMinutes, elapsed);
  const canComplete = isNoteValidForComplete(note) && elapsed > 0;
  const isRunning = session.status === "running";

  usePomodoroAlarm(isAlarmRinging, settings.alarmSound);

  useEffect(() => {
    setSession(initialSession);
    setNote(initialSession.note ?? "");
  }, [initialSession]);

  useEffect(() => {
    if (!isRunning && !isAlarmRinging) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isRunning, isAlarmRinging]);

  useEffect(() => {
    if (!isRunning) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning]);

  useEffect(() => {
    const displayRemaining = isAlarmRinging ? "0:00" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    document.title = isRunning || isAlarmRinging
      ? `${displayRemaining} · ${session.lifeArea.name}`
      : `Focus · ${session.lifeArea.name}`;
    return () => {
      document.title = "Compass";
    };
  }, [isRunning, isAlarmRinging, remaining, session.lifeArea.name]);

  useEffect(() => {
    if (remaining > 0) {
      alarmTriggeredRef.current = false;
      return;
    }

    if (isRunning && !alarmTriggeredRef.current) {
      alarmTriggeredRef.current = true;
      setIsAlarmRinging(true);
      startTransition(async () => {
        try {
          const paused = await pauseFocusSession(session.id);
          setSession(paused);
        } catch {
          // Alarm UI still shows even if pause fails
        }
      });
    }
  }, [remaining, isRunning, session.id]);

  const scheduleNoteSave = useCallback(
    (value: string) => {
      if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
      noteSaveTimer.current = setTimeout(() => {
        startTransition(async () => {
          try {
            const updated = await updateFocusSessionNote(session.id, value);
            setSession(updated);
          } catch {
            // Silent fail for draft saves
          }
        });
      }, 500);
    },
    [session.id]
  );

  function handleNoteChange(value: string) {
    setNote(value.slice(0, MAX_FOCUS_NOTE_LENGTH));
    scheduleNoteSave(value);
  }

  function runAction(action: () => Promise<FocusSessionWithArea>, onSuccess?: (s: FocusSessionWithArea) => void) {
    setError(null);
    unlockAudioContext();
    startTransition(async () => {
      try {
        const updated = await action();
        setSession(updated);
        setNote(updated.note ?? note);
        onSuccess?.(updated);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function dismissAlarm() {
    setIsAlarmRinging(false);
  }

  const subtitle = isAlarmRinging
    ? "Time's up — add a note and complete to log"
    : `${session.lifeArea.name} · ${getPomodoroCountLabel(completedInCycle, settings.longBreakInterval)}`;

  function renderPrimaryButton() {
    if (isAlarmRinging) {
      return (
        <PomodoroPrimaryButton
          onClick={() => {
            dismissAlarm();
            runAction(() => completeFocusSession(session.id, note), onComplete);
          }}
          disabled={isPending || !canComplete}
        >
          Complete
        </PomodoroPrimaryButton>
      );
    }

    if (session.status === "running") {
      return (
        <PomodoroPrimaryButton
          onClick={() => runAction(() => pauseFocusSession(session.id))}
          disabled={isPending}
        >
          Pause
        </PomodoroPrimaryButton>
      );
    }

    return (
      <PomodoroPrimaryButton
        onClick={() => runAction(() => resumeFocusSession(session.id))}
        disabled={isPending}
      >
        Start
      </PomodoroPrimaryButton>
    );
  }

  return (
    <PomodoroTimerShell
      activePhase="focus"
      phasesLocked
      footer={
        <div className="mx-auto max-w-lg">
          <label htmlFor="focus-note" className="label">
            What did you focus on? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="focus-note"
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="e.g. Chapter 3 vocabulary, leg day, inbox zero…"
            rows={2}
            maxLength={MAX_FOCUS_NOTE_LENGTH}
            className="input resize-none"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Required to complete · {note.trim().length}/{MAX_FOCUS_NOTE_LENGTH}
          </p>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
        </div>
      }
    >
      <PomodoroTimerDisplay
        remainingSeconds={remaining}
        isAlarm={isAlarmRinging}
        subtitle={subtitle}
      />

      {renderPrimaryButton()}

      <PomodoroSecondaryActions>
        <PomodoroTextButton
          onClick={() => {
            dismissAlarm();
            runAction(() => resetFocusSession(session.id));
          }}
          disabled={isPending}
        >
          Reset
        </PomodoroTextButton>

        {!isAlarmRinging && (
          <PomodoroTextButton
            onClick={() => runAction(() => completeFocusSession(session.id, note), onComplete)}
            disabled={isPending || !canComplete}
          >
            Complete
          </PomodoroTextButton>
        )}

        {isAlarmRinging && (
          <PomodoroTextButton onClick={dismissAlarm}>Dismiss alarm</PomodoroTextButton>
        )}

        {confirmCancel ? (
          <>
            <PomodoroTextButton
              variant="danger"
              onClick={() =>
                runAction(() => cancelFocusSession(session.id), () => router.refresh())
              }
              disabled={isPending}
            >
              Confirm cancel
            </PomodoroTextButton>
            <PomodoroTextButton onClick={() => setConfirmCancel(false)}>Keep going</PomodoroTextButton>
          </>
        ) : (
          <PomodoroTextButton variant="danger" onClick={() => setConfirmCancel(true)}>
            Cancel
          </PomodoroTextButton>
        )}
      </PomodoroSecondaryActions>
    </PomodoroTimerShell>
  );
}
