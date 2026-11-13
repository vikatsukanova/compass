function toLocalIsoDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function todayIsoDate(): string {
  return toLocalIsoDate();
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Display name from the signed-in email. Falls back to "Me" when unknown. */
export function displayNameFromEmail(email?: string | null): string {
  if (!email) return "Me";
  const local = email.split("@")[0]?.trim() ?? "";
  const parts = local.split(/[._+-]/).filter((part) => /[a-z]/i.test(part));
  if (parts.length === 0) return "Me";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function firstNameFromDisplay(name: string): string {
  const first = name.split(" ")[0];
  return first && first !== "Me" ? first : "";
}

export function initialsFromName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0 || name === "Me") return "Me";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
}

export function formatHeaderDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function daysSinceIsoDate(isoDate: string, todayIso = todayIsoDate()): number {
  const start = new Date(`${isoDate}T12:00:00`);
  const end = new Date(`${todayIso}T12:00:00`);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysSinceLastLog(
  lifeAreaId: string,
  logs: { lifeAreaId: string; date: string }[],
  todayIso = todayIsoDate()
): number | null {
  const areaLogs = logs.filter((log) => log.lifeAreaId === lifeAreaId);
  if (areaLogs.length === 0) return null;

  const latest = areaLogs.reduce((max, log) => (log.date > max ? log.date : max), "");
  return daysSinceIsoDate(latest, todayIso);
}

export function formatDisplayDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function isPastDue(dueDate: string | null | undefined, today = todayIsoDate()): boolean {
  return Boolean(dueDate && dueDate < today);
}

export function formatLogDuration(
  durationMinutes: number | null | undefined,
  targetUnit: "hours" | "sessions" | "count"
): string {
  if (targetUnit === "hours") {
    if (!durationMinutes) return "—";
    const hours = Math.round((durationMinutes / 60) * 10) / 10;
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }
  if (durationMinutes) return `${durationMinutes} min`;
  return targetUnit === "sessions" ? "Session" : "Touchpoint";
}

