"use server";

import { prisma } from "@/lib/db";
import { todayIsoDate } from "@/lib/format";
import { requireAuth } from "@/lib/require-auth";
import type { Task, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type TaskInput = {
  lifeAreaId: string;
  title: string;
  dueDate?: string | null;
  isUrgent?: boolean;
};

export type TaskWithArea = Task & {
  lifeArea: { id: string; name: string; slug: string };
};

export async function listTasks(options?: {
  lifeAreaId?: string;
  status?: TaskStatus;
  urgentOnly?: boolean;
}): Promise<TaskWithArea[]> {
  await requireAuth();
  return prisma.task.findMany({
    where: {
      ...(options?.lifeAreaId ? { lifeAreaId: options.lifeAreaId } : {}),
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.urgentOnly ? { isUrgent: true, status: "open" } : {}),
    },
    include: {
      lifeArea: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ status: "asc" }, { isUrgent: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
}

/** Open tasks flagged urgent or due today (for dashboard panel). */
export async function listUrgentAndDueTodayTasks(
  today = todayIsoDate()
): Promise<TaskWithArea[]> {
  await requireAuth();
  return prisma.task.findMany({
    where: {
      status: "open",
      OR: [{ isUrgent: true }, { dueDate: today }],
    },
    include: {
      lifeArea: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ isUrgent: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTask(id: string): Promise<Task | null> {
  await requireAuth();
  return prisma.task.findUnique({ where: { id } });
}

async function revalidateTaskPaths() {
  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath("/areas", "layout");
}

export async function createTask(input: TaskInput): Promise<Task> {
  await requireAuth();
  const task = await prisma.task.create({
    data: {
      lifeAreaId: input.lifeAreaId,
      title: input.title.trim(),
      dueDate: input.dueDate || null,
      isUrgent: input.isUrgent ?? false,
    },
  });

  await revalidateTaskPaths();
  return task;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  await requireAuth();
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.lifeAreaId !== undefined ? { lifeAreaId: input.lifeAreaId } : {}),
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate || null } : {}),
      ...(input.isUrgent !== undefined ? { isUrgent: input.isUrgent } : {}),
    },
  });

  await revalidateTaskPaths();
  return task;
}

export async function completeTask(id: string): Promise<Task> {
  await requireAuth();
  const task = await prisma.task.update({
    where: { id },
    data: { status: "done", completedAt: new Date() },
  });

  await revalidateTaskPaths();
  return task;
}

export async function reopenTask(id: string): Promise<Task> {
  await requireAuth();
  const task = await prisma.task.update({
    where: { id },
    data: { status: "open", completedAt: null },
  });

  await revalidateTaskPaths();
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await requireAuth();
  await prisma.task.delete({ where: { id } });
  await revalidateTaskPaths();
}
