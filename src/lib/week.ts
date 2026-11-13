/** Monday-start week bounds as ISO date strings (YYYY-MM-DD, local time). */
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getWeekBounds(date = new Date()): { start: string; end: string } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);

  const start = toIsoDate(d);

  const endDate = new Date(d);
  endDate.setDate(endDate.getDate() + 6);
  const end = toIsoDate(endDate);

  return { start, end };
}

export function formatWeekRange(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };

  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.toLocaleDateString("en-US", opts)} – ${endDate.toLocaleDateString("en-US", yearOpts)}`;
  }

  return `${startDate.toLocaleDateString("en-US", yearOpts)} – ${endDate.toLocaleDateString("en-US", yearOpts)}`;
}

export function getWeekBoundsFromParam(weekParam?: string): { start: string; end: string } {
  if (!weekParam) {
    return getWeekBounds();
  }

  const parsed = new Date(`${weekParam}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return getWeekBounds();
  }

  return getWeekBounds(parsed);
}

export function shiftWeek(start: string, weeks: number): { start: string; end: string } {
  const d = new Date(`${start}T12:00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return getWeekBounds(d);
}

export function isCurrentWeek(start: string): boolean {
  return getWeekBounds().start === start;
}

/** Inclusive rolling 7-day window ending on `date`. */
export function getRolling7DaysBounds(date = new Date()): { start: string; end: string } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const end = toIsoDate(d);
  const startDate = new Date(d);
  startDate.setDate(startDate.getDate() - 6);
  return { start: toIsoDate(startDate), end };
}

/** Monday = 1 … Sunday = 7 */
export function getMondayBasedDay(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function isMidweekOrLater(date: Date): boolean {
  return getMondayBasedDay(date) >= 3;
}

