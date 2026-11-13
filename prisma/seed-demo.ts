import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { DEMO_PROFILE } from "../src/lib/demo-profile";
import { DEFAULT_AREAS } from "./default-areas";

/** Six demo areas. Focus cards are Health, Creativity, and Career — indigo, emerald, and amber. */
const DEMO_AREAS: { slug: string; name: string; priority: "high" | "medium" }[] = [
  { slug: "health", name: "Health", priority: "high" },
  { slug: "creativity", name: "Creativity", priority: "high" },
  { slug: "career", name: "Career", priority: "high" },
  { slug: "home", name: "Home", priority: "medium" },
  { slug: "learning", name: "Learning", priority: "medium" },
  { slug: "social", name: "Social", priority: "medium" },
];

function loadEnvFile() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile();

const prisma = new PrismaClient();

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEMO_LOGS: { slug: string; daysAgo: number; durationMinutes?: number; note: string }[] = [
  { slug: "health", daysAgo: 20, note: "Logged a session" },
  { slug: "creativity", daysAgo: 12, note: "Practice session" },
  { slug: "career", daysAgo: 1, durationMinutes: 180, note: "Focused block" },
  { slug: "career", daysAgo: 2, durationMinutes: 240, note: "Meetings" },
  { slug: "career", daysAgo: 4, durationMinutes: 180, note: "Writing" },
  { slug: "home", daysAgo: 1, note: "Weekly check" },
  { slug: "learning", daysAgo: 3, durationMinutes: 90, note: "Project time" },
  { slug: "social", daysAgo: 0, note: "Community activity" },
  { slug: "social", daysAgo: 1, note: "Group activity" },
];

const DEMO_TASKS: { slug: string; title: string; urgent: boolean }[] = [
  { slug: "career", title: "Send a follow-up", urgent: false },
  { slug: "learning", title: "Review open items", urgent: false },
];

async function main() {
  const email = process.env.AUTH_EMAIL?.trim().toLowerCase();
  if (email !== DEMO_PROFILE.email) {
    console.error(
      `Refusing to seed demo data. Set AUTH_EMAIL=${DEMO_PROFILE.email} on a separate database first.`
    );
    process.exit(1);
  }

  const databaseName = new URL(process.env.DATABASE_URL ?? "postgres:///").pathname.replace(/^\//, "");
  if (databaseName !== "compass_demo") {
    console.error("Refusing to seed demo data outside the compass_demo database.");
    process.exit(1);
  }

  await prisma.focusSession.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();

  const demoSlugs = new Set(DEMO_AREAS.map((area) => area.slug));
  await prisma.lifeArea.deleteMany({ where: { slug: { notIn: [...demoSlugs] } } });

  for (const demo of DEMO_AREAS) {
    const base = DEFAULT_AREAS.find((area) => area.slug === demo.slug);
    if (!base) continue;
    await prisma.lifeArea.upsert({
      where: { slug: demo.slug },
      update: { name: demo.name, priority: demo.priority, isActive: true },
      create: { ...base, name: demo.name, priority: demo.priority },
    });
  }

  const areas = await prisma.lifeArea.findMany();
  const bySlug = new Map(areas.map((area) => [area.slug, area.id]));

  for (const log of DEMO_LOGS) {
    const lifeAreaId = bySlug.get(log.slug);
    if (!lifeAreaId) continue;
    await prisma.activityLog.create({
      data: {
        lifeAreaId,
        date: isoDaysAgo(log.daysAgo),
        durationMinutes: log.durationMinutes,
        note: log.note,
      },
    });
  }

  const today = isoDaysAgo(0);
  for (const task of DEMO_TASKS) {
    const lifeAreaId = bySlug.get(task.slug);
    if (!lifeAreaId) continue;
    await prisma.task.create({
      data: {
        lifeAreaId,
        title: task.title,
        dueDate: today,
        isUrgent: task.urgent,
      },
    });
  }

  console.log(`Seeded the ${DEMO_PROFILE.name} demo profile.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
