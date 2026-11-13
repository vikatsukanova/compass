import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseActivityDuration,
  parseHoursMinutesDuration,
  splitDurationMinutes,
} from "./duration-input.ts";

describe("splitDurationMinutes", () => {
  it("splits total minutes into hours and remainder", () => {
    assert.deepEqual(splitDurationMinutes(90), { hours: 1, minutes: 30 });
    assert.deepEqual(splitDurationMinutes(60), { hours: 1, minutes: 0 });
    assert.deepEqual(splitDurationMinutes(45), { hours: 0, minutes: 45 });
    assert.deepEqual(splitDurationMinutes(null), { hours: 0, minutes: 0 });
  });
});

describe("parseHoursMinutesDuration", () => {
  it("combines hours and minutes", () => {
    assert.deepEqual(parseHoursMinutesDuration("1", "30"), { ok: true, totalMinutes: 90 });
    assert.deepEqual(parseHoursMinutesDuration("2", ""), { ok: true, totalMinutes: 120 });
    assert.deepEqual(parseHoursMinutesDuration("", "45"), { ok: true, totalMinutes: 45 });
  });

  it("rejects invalid input", () => {
    assert.equal(parseHoursMinutesDuration("", "").ok, false);
    assert.equal(parseHoursMinutesDuration("1", "60").ok, false);
    assert.equal(parseHoursMinutesDuration("-1", "0").ok, false);
  });
});

describe("parseActivityDuration", () => {
  it("reads hours and minutes fields for hour-based areas", () => {
    const form = new FormData();
    form.set("durationHours", "1");
    form.set("durationMinutes", "15");
    const result = parseActivityDuration(form, "hours");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.durationMinutes, 75);
  });

  it("reads single minutes field for session areas", () => {
    const form = new FormData();
    form.set("duration", "30");
    const result = parseActivityDuration(form, "sessions");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.durationMinutes, 30);
  });
});
