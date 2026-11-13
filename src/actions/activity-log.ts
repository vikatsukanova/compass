"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import type { ActivityLog } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ActivityLogInput = {
  lifeAreaId: string;
  date: string;
  durationMinutes?: number | null;
  note?: string | null;
};

export type ActivityLogWithArea = ActivityLog & {
  lifeArea: { id: string; name: string; slug: string; targetUnit: string };
};

export async function listActivityLogs(from?: string, to?: string): Promise<ActivityLogWithArea[]> {
  await requireAuth();
  return prisma.activityLog.findMany({
    where: {
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: {
      lifeArea: { select: { id: true, name: true, slug: true, targetUnit: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function listActivityLogsForArea(
  lifeAreaId: string,
  from?: string,
  to?: string
): Promise<ActivityLog[]> {
  await requireAuth();
  return prisma.activityLog.findMany({
    where: {
      lifeAreaId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getActivityLog(id: string): Promise<ActivityLog | null> {
  await requireAuth();
  return prisma.activityLog.findUnique({ where: { id } });
}

async function revalidateLogPaths(lifeAreaId?: string) {
  revalidatePath("/activities");
  revalidatePath("/log");
  revalidatePath("/");
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

export async function createActivityLog(input: ActivityLogInput): Promise<ActivityLog> {
  await requireAuth();
  const log = await prisma.activityLog.create({
    data: {
      lifeAreaId: input.lifeAreaId,
      date: input.date,
      durationMinutes: input.durationMinutes ?? null,
      note: input.note?.trim() || null,
    },
  });

  await revalidateLogPaths(input.lifeAreaId);
  return log;
}

export async function updateActivityLog(
  id: string,
  input: Partial<ActivityLogInput>
): Promise<ActivityLog> {
  await requireAuth();
  const existing = await prisma.activityLog.findUniqueOrThrow({ where: { id } });
  const lifeAreaId = input.lifeAreaId ?? existing.lifeAreaId;

  const log = await prisma.activityLog.update({
    where: { id },
    data: {
      ...(input.lifeAreaId !== undefined ? { lifeAreaId: input.lifeAreaId } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
      ...(input.note !== undefined ? { note: input.note?.trim() || null } : {}),
    },
  });

  await revalidateLogPaths(lifeAreaId);
  if (input.lifeAreaId && input.lifeAreaId !== existing.lifeAreaId) {
    await revalidateLogPaths(existing.lifeAreaId);
  }
  return log;
}

export async function deleteActivityLog(id: string): Promise<void> {
  await requireAuth();
  const existing = await prisma.activityLog.findUniqueOrThrow({ where: { id } });
  await prisma.activityLog.delete({ where: { id } });
  await revalidateLogPaths(existing.lifeAreaId);
}
