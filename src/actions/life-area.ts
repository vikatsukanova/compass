"use server";

import { prisma } from "@/lib/db";
import { resolveUniqueSlug } from "@/lib/life-area-slug";
import { requireAuth } from "@/lib/require-auth";
import type { LifeArea, Priority, TargetUnit } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type LifeAreaInput = {
  name: string;
  weeklyTarget: number;
  targetUnit: TargetUnit;
  priority: Priority;
  sortOrder?: number;
  isActive?: boolean;
};

export async function listLifeAreas(activeOnly = true): Promise<LifeArea[]> {
  await requireAuth();
  return prisma.lifeArea.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getLifeAreaBySlug(slug: string): Promise<LifeArea | null> {
  await requireAuth();
  return prisma.lifeArea.findUnique({ where: { slug } });
}

export async function getLifeAreaById(id: string): Promise<LifeArea | null> {
  await requireAuth();
  return prisma.lifeArea.findUnique({ where: { id } });
}

async function revalidateLifeAreaPaths(slug?: string) {
  revalidatePath("/areas");
  revalidatePath("/");
  revalidatePath("/activities");
  revalidatePath("/focus");
  revalidatePath("/tasks");

  if (slug) {
    revalidatePath(`/areas/${slug}`);
  }
}

async function existingSlugs(excludeId?: string): Promise<Set<string>> {
  const rows = await prisma.lifeArea.findMany({
    where: excludeId ? { NOT: { id: excludeId } } : undefined,
    select: { slug: true },
  });
  return new Set(rows.map((row) => row.slug));
}

export async function createLifeArea(input: LifeAreaInput): Promise<LifeArea> {
  await requireAuth();
  const name = input.name.trim();
  if (!name) {
    throw new Error("Name is required.");
  }

  const slug = resolveUniqueSlug(name, await existingSlugs());
  const maxOrder = await prisma.lifeArea.aggregate({ _max: { sortOrder: true } });

  const area = await prisma.lifeArea.create({
    data: {
      name,
      slug,
      weeklyTarget: input.weeklyTarget,
      targetUnit: input.targetUnit,
      priority: input.priority,
      sortOrder: input.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      isActive: input.isActive ?? true,
    },
  });

  await revalidateLifeAreaPaths(area.slug);
  return area;
}

export async function updateLifeArea(id: string, input: Partial<LifeAreaInput>): Promise<LifeArea> {
  await requireAuth();
  const existing = await prisma.lifeArea.findUniqueOrThrow({ where: { id } });
  const name = input.name?.trim() ?? existing.name;

  let slug = existing.slug;
  if (input.name !== undefined && name !== existing.name) {
    slug = resolveUniqueSlug(name, await existingSlugs(id));
  }

  const area = await prisma.lifeArea.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name, slug } : {}),
      ...(input.weeklyTarget !== undefined ? { weeklyTarget: input.weeklyTarget } : {}),
      ...(input.targetUnit !== undefined ? { targetUnit: input.targetUnit } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  await revalidateLifeAreaPaths(area.slug);
  if (existing.slug !== area.slug) {
    await revalidateLifeAreaPaths(existing.slug);
  }
  return area;
}

export async function deleteLifeArea(id: string): Promise<void> {
  await requireAuth();
  const existing = await prisma.lifeArea.findUniqueOrThrow({ where: { id } });
  await prisma.lifeArea.delete({ where: { id } });
  await revalidateLifeAreaPaths(existing.slug);
}
