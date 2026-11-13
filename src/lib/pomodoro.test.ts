import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  completedInCycleAfterLongBreakStart,
  getBreakAfterFocus,
  getPhaseDurationMinutes,
  getPhaseLabel,
  getPomodoroCountLabel,
  nextCompletedInCycleAfterFocus,
  DEFAULT_POMODORO_SETTINGS,
} from "./pomodoro.ts";
import {
  computeBreakElapsedSeconds,
  createBreakTimer,
  pauseBreakTimer,
  resetBreakTimer,
  setBreakAlarm,
} from "./pomodoro-run-state.ts";

describe("getBreakAfterFocus", () => {
  it("returns short break before interval is reached", () => {
    assert.equal(getBreakAfterFocus(1, DEFAULT_POMODORO_SETTINGS), "short_break");
    assert.equal(getBreakAfterFocus(3, DEFAULT_POMODORO_SETTINGS), "short_break");
  });

  it("returns long break when interval is reached", () => {
    assert.equal(getBreakAfterFocus(4, DEFAULT_POMODORO_SETTINGS), "long_break");
  });
});

describe("getPhaseDurationMinutes", () => {
  it("maps phases to settings", () => {
    assert.equal(getPhaseDurationMinutes("focus", DEFAULT_POMODORO_SETTINGS), 25);
    assert.equal(getPhaseDurationMinutes("short_break", DEFAULT_POMODORO_SETTINGS), 5);
    assert.equal(getPhaseDurationMinutes("long_break", DEFAULT_POMODORO_SETTINGS), 15);
  });
});

describe("getPomodoroCountLabel", () => {
  it("shows current pomodoro in cycle", () => {
    assert.equal(getPomodoroCountLabel(0, 4), "Pomodoro 1 of 4");
    assert.equal(getPomodoroCountLabel(2, 4), "Pomodoro 3 of 4");
  });
});

describe("nextCompletedInCycleAfterFocus", () => {
  it("increments until interval cap", () => {
    assert.equal(nextCompletedInCycleAfterFocus(0, DEFAULT_POMODORO_SETTINGS), 1);
    assert.equal(nextCompletedInCycleAfterFocus(3, DEFAULT_POMODORO_SETTINGS), 4);
  });
});

describe("completedInCycleAfterLongBreakStart", () => {
  it("resets cycle", () => {
    assert.equal(completedInCycleAfterLongBreakStart(), 0);
  });
});

describe("getPhaseLabel", () => {
  it("returns human labels", () => {
    assert.equal(getPhaseLabel("focus"), "Focus");
    assert.equal(getPhaseLabel("short_break"), "Short break");
    assert.equal(getPhaseLabel("long_break"), "Long break");
  });
});

describe("break timer state", () => {
  it("computes elapsed while running", () => {
    const timer = createBreakTimer("short_break", 5);
    timer.elapsedSeconds = 30;
    timer.lastResumedAt = new Date("2026-06-22T12:00:00").toISOString();
    const elapsed = computeBreakElapsedSeconds(timer, new Date("2026-06-22T12:01:00"));
    assert.equal(elapsed, 90);
  });

  it("freezes at planned duration in alarm state", () => {
    const timer = setBreakAlarm(createBreakTimer("short_break", 5));
    assert.equal(timer.status, "alarm");
    assert.equal(timer.elapsedSeconds, 300);
  });

  it("reset restarts interval", () => {
    const paused = pauseBreakTimer(createBreakTimer("short_break", 5), new Date("2026-06-22T12:01:00"));
    const reset = resetBreakTimer({ ...paused, elapsedSeconds: 120 });
    assert.equal(reset.elapsedSeconds, 0);
    assert.equal(reset.status, "running");
    assert.ok(reset.lastResumedAt);
  });
});
