/**
 * One-time import from local SQLite (prisma/dev.db) into Neon Postgres.
 * Run: npm run db:import-sqlite
 *
 * Requires DATABASE_URL + DIRECT_URL in .env (Neon).
 * Clears existing Neon data first, then copies all rows preserving IDs.
 */
import { execSync } from "child_process";
import path from "path";
import {
  FocusSessionStatus,
  PrismaClient,
  Priority,
  TargetUnit,
  TaskStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const sqlitePath = path.join(process.cwd(), "prisma", "dev.db");

function querySqlite<T extends Record<string, unknown>>(sql: string): T[] {
  const escaped = sql.replace(/"/g, '""');
  const out = execSync(`sqlite3 -json "${sqlitePath}" "${escaped}"`, {
    encoding: "utf-8",
  });
  if (!out.trim()) return [];
  return JSON.parse(out) as T[];
}

function toDate(value: number | string | null | undefined): Date | null {
  if (value == null) return null;
  return new Date(value);
}

function toBool(value: number | boolean): boolean {
  return value === true || value === 1;
}

async function clearNeon() {
  await prisma.focusSession.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lifeArea.deleteMany();
}

async function main() {
  const counts = {
    lifeAreas: querySqlite("SELECT * FROM LifeArea").length,
    activityLogs: querySqlite("SELECT * FROM ActivityLog").length,
    tasks: querySqlite("SELECT * FROM Task").length,
    focusSessions: querySqlite("SELECT * FROM FocusSession").length,
  };

  console.log("SQLite source:", sqlitePath);
  console.log("Rows to import:", counts);

  if (counts.lifeAreas === 0) {
    console.log("Nothing to import — dev.db is empty.");
    return;
  }

  await clearNeon();
  console.log("Cleared existing Neon data.");

  const lifeAreas = querySqlite<{
    id: string;
    name: string;
    slug: string;
    weeklyTarget: number;
    targetUnit: string;
    priority: string;
    sortOrder: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
  }>("SELECT * FROM LifeArea ORDER BY sortOrder");

  for (const row of lifeAreas) {
    await prisma.lifeArea.create({
      data: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        weeklyTarget: row.weeklyTarget,
        targetUnit: row.targetUnit as TargetUnit,
        priority: row.priority as Priority,
        sortOrder: row.sortOrder,
        isActive: toBool(row.isActive),
        createdAt: toDate(row.createdAt)!,
        updatedAt: toDate(row.updatedAt)!,
      },
    });
  }
  console.log(`Imported ${lifeAreas.length} life areas.`);

  const activityLogs = querySqlite<{
    id: string;
    lifeAreaId: string;
    date: string;
    durationMinutes: number | null;
    note: string | null;
    createdAt: number;
    updatedAt: number;
  }>("SELECT * FROM ActivityLog");

  for (const row of activityLogs) {
    await prisma.activityLog.create({
      data: {
        id: row.id,
        lifeAreaId: row.lifeAreaId,
        date: row.date,
        durationMinutes: row.durationMinutes,
        note: row.note,
        createdAt: toDate(row.createdAt)!,
        updatedAt: toDate(row.updatedAt)!,
      },
    });
  }
  console.log(`Imported ${activityLogs.length} activity logs.`);

  const tasks = querySqlite<{
    id: string;
    lifeAreaId: string;
    title: string;
    dueDate: string | null;
    isUrgent: number;
    status: string;
    completedAt: number | null;
    createdAt: number;
    updatedAt: number;
  }>("SELECT * FROM Task");

  for (const row of tasks) {
    await prisma.task.create({
      data: {
        id: row.id,
        lifeAreaId: row.lifeAreaId,
        title: row.title,
        dueDate: row.dueDate,
        isUrgent: toBool(row.isUrgent),
        status: row.status as TaskStatus,
        completedAt: toDate(row.completedAt),
        createdAt: toDate(row.createdAt)!,
        updatedAt: toDate(row.updatedAt)!,
      },
    });
  }
  console.log(`Imported ${tasks.length} tasks.`);

  const focusSessions = querySqlite<{
    id: string;
    lifeAreaId: string;
    startedAt: number;
    endedAt: number | null;
    plannedMinutes: number;
    elapsedSeconds: number;
    lastResumedAt: number | null;
    status: string;
    note: string | null;
    activityLogId: string | null;
    createdAt: number;
    updatedAt: number;
  }>("SELECT * FROM FocusSession");

  for (const row of focusSessions) {
    await prisma.focusSession.create({
      data: {
        id: row.id,
        lifeAreaId: row.lifeAreaId,
        startedAt: toDate(row.startedAt)!,
        endedAt: toDate(row.endedAt),
        plannedMinutes: row.plannedMinutes,
        elapsedSeconds: row.elapsedSeconds,
        lastResumedAt: toDate(row.lastResumedAt),
        status: row.status as FocusSessionStatus,
        note: row.note,
        activityLogId: row.activityLogId,
        createdAt: toDate(row.createdAt)!,
        updatedAt: toDate(row.updatedAt)!,
      },
    });
  }
  console.log(`Imported ${focusSessions.length} focus sessions.`);

  const verify = {
    lifeAreas: await prisma.lifeArea.count(),
    activityLogs: await prisma.activityLog.count(),
    tasks: await prisma.task.count(),
    focusSessions: await prisma.focusSession.count(),
  };
  console.log("Neon counts after import:", verify);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
