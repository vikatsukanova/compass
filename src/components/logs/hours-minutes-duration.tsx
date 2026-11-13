import { splitDurationMinutes } from "@/lib/duration-input";

type HoursMinutesDurationFieldsProps = {
  defaultTotalMinutes?: number | null;
  /** Smaller labels/inputs for inline edit forms. */
  compact?: boolean;
  /** Reset fields when area unit changes (edit forms). */
  fieldKey?: string;
};

export function HoursMinutesDurationFields({
  defaultTotalMinutes,
  compact = false,
  fieldKey,
}: HoursMinutesDurationFieldsProps) {
  const { hours, minutes } = splitDurationMinutes(defaultTotalMinutes);
  const labelClass = compact ? "block text-xs font-medium text-slate-600 dark:text-slate-300" : "label";
  const subLabelClass = "text-xs text-slate-500 dark:text-slate-400";
  const inputClass = "input";

  const displayHours = hours > 0 ? String(hours) : "";
  const displayMinutes = minutes > 0 ? String(minutes) : "";

  return (
    <div key={fieldKey}>
      <span className={labelClass}>Duration</span>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="durationHours" className={subLabelClass}>
            Hours
          </label>
          <input
            id="durationHours"
            name="durationHours"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="0"
            defaultValue={displayHours}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="durationMinutes" className={subLabelClass}>
            Minutes
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={0}
            max={59}
            step={1}
            inputMode="numeric"
            placeholder="0"
            defaultValue={displayMinutes}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
