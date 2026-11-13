"use server";

import { prisma } from "@/lib/db";
import { todayIsoDate } from "@/lib/format";
import {
  clampNote,
  computeElapsedSeconds,
  DEFAULT_FOCUS_MINUTES,
  elapsedToDurationMinutes,
  isNoteValidForComplete,
  MAX_FOCUS_NOTE_LENGTH,
} from "@/lib/focus-session";
import { requireAuth } from "@/lib/require-auth";
import type { FocusSession, FocusSessionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type FocusSessionWithArea = FocusSession & {
  lifeArea: { id: string; name: string; slug: string; targetUnit: string };
};

const ACTIVE_STATUSES: FocusSessionStatus[] = ["running", "paused"];

const sessionInclude = {
  lifeArea: { select: { id: true, name: true, slug: true, targetUnit: true } },
} as const;

async function revalidateFocusPaths(lifeAreaId?: string) {
  revalidatePath("/focus");
  revalidatePath("/");
  revalidatePath("/activities");
  revalidatePath("/areas", "layout");

  if (lifeAreaId) {
    const area = await prisma.lifeArea.findUnique({
      where: { id: lifeAreaId },
      select: { slug: true },
    });
    if (area) {
      revalidatePath(`/areas/${area.slug}`);
    }
  }
}

export async function getActiveFocusSession(): Promise<FocusSessionWithArea | null> {
  await requireAuth();
  return prisma.focusSession.findFirst({
    where: { status: { in: ACTIVE_STATUSES } },
    include: sessionInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getFocusSession(id: string): Promise<FocusSessionWithArea | null> {
  await requireAuth();
  return prisma.focusSession.findUnique({
    where: { id },
    include: sessionInclude,
  });
}

async function syncElapsedOnPause(session: FocusSession): Promise<number> {
  const total = computeElapsedSeconds({
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    lastResumedAt: session.lastResumedAt,
  });
  return total;
}

export async function startFocusSession(input: {
  lifeAreaId: string;
  plannedMinutes?: number;
}): Promise<FocusSessionWithArea> {
  await requireAuth();
  const existing = await getActiveFocusSession();
  if (existing) {
    throw new Error("A focus session is already in progress. Finish or cancel it first.");
  }

  const area = await prisma.lifeArea.findFirst({
    where: { id: input.lifeAreaId, isActive: true },
  });
  if (!area) {
    throw new Error("Life area not found.");
  }

  const plannedMinutes = input.plannedMinutes ?? DEFAULT_FOCUS_MINUTES;
  if (!Number.isFinite(plannedMinutes) || plannedMinutes < 1 || plannedMinutes > 180) {
    throw new Error("Focus length must be between 1 and 180 minutes.");
  }

  const now = new Date();
  const session = await prisma.focusSession.create({
    data: {
      lifeAreaId: input.lifeAreaId,
      plannedMinutes: Math.round(plannedMinutes),
      status: "running",
      elapsedSeconds: 0,
      lastResumedAt: now,
    },
    include: sessionInclude,
  });

  await revalidateFocusPaths(input.lifeAreaId);
  return session;
}

export async function pauseFocusSession(id: string): Promise<FocusSessionWithArea> {
  await requireAuth();
  const session = await prisma.focusSession.findUniqueOrThrow({ where: { id } });

  if (session.status !== "running") {
    throw new Error("Only a running session can be paused.");
  }

  const elapsedSeconds = await syncElapsedOnPause(session);

  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: "paused",
      elapsedSeconds,
      lastResumedAt: null,
    },
    include: sessionInclude,
  });

  await revalidateFocusPaths(session.lifeAreaId);
  return updated;
}

export async function resumeFocusSession(id: string): Promise<FocusSessionWithArea> {
  await requireAuth();
  const session = await prisma.focusSession.findUniqueOrThrow({ where: { id } });

  if (session.status !== "paused") {
    throw new Error("Only a paused session can be resumed.");
  }

  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: "running",
      lastResumedAt: new Date(),
    },
    include: sessionInclude,
  });

  await revalidateFocusPaths(session.lifeAreaId);
  return updated;
}

export async function resetFocusSession(id: string): Promise<FocusSessionWithArea> {
  await requireAuth();
  const session = await prisma.focusSession.findUniqueOrThrow({ where: { id } });

  if (!ACTIVE_STATUSES.includes(session.status)) {
    throw new Error("This session is no longer active.");
  }

  const now = new Date();
  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: "running",
      elapsedSeconds: 0,
      lastResumedAt: now,
    },
    include: sessionInclude,
  });

  await revalidateFocusPaths(session.lifeAreaId);
  return updated;
}

export async function updateFocusSessionNote(id: string, note: string): Promise<FocusSessionWithArea> {
  await requireAuth();
  const session = await prisma.focusSession.findUniqueOrThrow({ where: { id } });

  if (!ACTIVE_STATUSES.includes(session.status)) {
    throw new Error("Notes can only be updated on an active session.");
  }

  const trimmed = clampNote(note);
  if (trimmed.length > MAX_FOCUS_NOTE_LENGTH) {
    throw new Error(`Note must be ${MAX_FOCUS_NOTE_LENGTH} characters or fewer.`);
  }

  const updated = await prisma.focusSession.update({
    where: { id },
    data: { note: trimmed || null },
    include: sessionInclude,
  });

  return updated;
}

export async function completeFocusSession(
  id: string,
  noteOverride?: string
): Promise<FocusSessionWithArea> {
  await requireAuth();
  const session = await prisma.focusSession.findUniqueOrThrow({ where: { id } });

  if (!ACTIVE_STATUSES.includes(session.status)) {
    throw new Error("This session is no longer active.");
  }

  let note = session.note;
  if (noteOverride !== undefined) {
    note = clampNote(noteOverride) || null;
    await prisma.focusSession.update({
      where: { id },
      data: { note },
    });
  }

  if (!isNoteValidForComplete(note)) {
    throw new Error("Add a note about what you focused on before completing.");
  }

  const elapsedSeconds = computeElapsedSeconds({
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    lastResumedAt: session.lastResumedAt,
  });

  if (elapsedSeconds <= 0) {
    throw new Error("Session must run for at least a few seconds before completing.");
  }

  const durationMinutes = elapsedToDurationMinutes(elapsedSeconds);
  const finalNote = clampNote(note!);
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const log = await tx.activityLog.create({
      data: {
        lifeAreaId: session.lifeAreaId,
        date: todayIsoDate(),
        durationMinutes,
        note: finalNote,
      },
    });

    return tx.focusSession.update({
      where: { id },
      data: {
        status: "completed",
        endedAt: now,
        elapsedSeconds,
        lastResumedAt: null,
        note: finalNote,
        activityLogId: log.id,
      },
      include: sessionInclude,
    });
  });

  await revalidateFocusPaths(session.lifeAreaId);
  return updated;
}

export async function cancelFocusSession(id: string): Promise<FocusSessionWithArea> {
  await requireAuth();
  const session = await prisma.focusSession.findUniqueOrThrow({ where: { id } });

  if (!ACTIVE_STATUSES.includes(session.status)) {
    throw new Error("This session is no longer active.");
  }

  const elapsedSeconds = computeElapsedSeconds({
    status: session.status,
    elapsedSeconds: session.elapsedSeconds,
    lastResumedAt: session.lastResumedAt,
  });

  const updated = await prisma.focusSession.update({
    where: { id },
    data: {
      status: "cancelled",
      endedAt: new Date(),
      elapsedSeconds,
      lastResumedAt: null,
    },
    include: sessionInclude,
  });

  await revalidateFocusPaths(session.lifeAreaId);
  return updated;
}
