/** HTML attrs for weekly targets counted in hours. */
export const HOURS_WEEKLY_TARGET_ATTRS = {
  min: 1,
  step: 1,
};

export function splitDurationMinutes(totalMinutes: number | null | undefined): {
  hours: number;
  minutes: number;
} {
  if (!totalMinutes || totalMinutes <= 0) {
    return { hours: 0, minutes: 0 };
  }

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function parseHoursMinutesDuration(
  hoursRaw: string,
  minutesRaw: string
): { ok: true; totalMinutes: number } | { ok: false; message: string } {
  const hoursStr = hoursRaw.trim();
  const minutesStr = minutesRaw.trim();

  const hours = hoursStr === "" ? 0 : Number(hoursStr);
  const minutes = minutesStr === "" ? 0 : Number(minutesStr);

  if (!Number.isInteger(hours) || hours < 0) {
    return { ok: false, message: "Hours must be a whole number (0 or more)." };
  }

  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    return { ok: false, message: "Minutes must be between 0 and 59." };
  }

  const totalMinutes = hours * 60 + minutes;
  if (totalMinutes <= 0) {
    return { ok: false, message: "Enter a duration using hours and/or minutes." };
  }

  return { ok: true, totalMinutes };
}

export type TargetUnit = "hours" | "sessions" | "count";

export function parseActivityDuration(
  formData: FormData,
  targetUnit: TargetUnit
): { ok: true; durationMinutes: number | null } | { ok: false; message: string } {
  if (targetUnit === "hours") {
    const result = parseHoursMinutesDuration(
      String(formData.get("durationHours") ?? ""),
      String(formData.get("durationMinutes") ?? "")
    );
    if (!result.ok) return result;
    return { ok: true, durationMinutes: result.totalMinutes };
  }

  const raw = String(formData.get("duration") ?? "").trim();
  if (!raw) {
    return { ok: true, durationMinutes: null };
  }

  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { ok: false, message: "Duration must be a positive number of minutes." };
  }

  return { ok: true, durationMinutes: minutes };
}
