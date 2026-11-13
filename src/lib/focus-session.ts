export const DEFAULT_FOCUS_MINUTES = 25;
export const MAX_FOCUS_NOTE_LENGTH = 500;

export const FOCUS_DURATION_PRESETS = [15, 25, 45] as const;

export type FocusSessionTiming = {
  status: "running" | "paused" | "completed" | "cancelled";
  elapsedSeconds: number;
  lastResumedAt: Date | null;
};

export function computeElapsedSeconds(session: FocusSessionTiming, now = new Date()): number {
  if (session.status !== "running" || !session.lastResumedAt) {
    return session.elapsedSeconds;
  }

  const segmentSeconds = Math.floor((now.getTime() - session.lastResumedAt.getTime()) / 1000);
  return session.elapsedSeconds + Math.max(0, segmentSeconds);
}

export function elapsedToDurationMinutes(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.max(1, Math.round(elapsedSeconds / 60));
}

export function remainingSeconds(plannedMinutes: number, elapsedSeconds: number): number {
  return Math.max(0, plannedMinutes * 60 - elapsedSeconds);
}

export function formatTimerDisplay(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function isNoteValidForComplete(note: string | null | undefined): boolean {
  return Boolean(note?.trim());
}

export function clampNote(note: string): string {
  return note.trim().slice(0, MAX_FOCUS_NOTE_LENGTH);
}

export function focusProgressPercent(plannedMinutes: number, elapsedSeconds: number): number {
  if (plannedMinutes <= 0) return 0;
  const target = plannedMinutes * 60;
  return Math.min(100, Math.round((elapsedSeconds / target) * 100));
}
