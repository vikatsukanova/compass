import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeElapsedSeconds,
  elapsedToDurationMinutes,
  focusProgressPercent,
  formatTimerDisplay,
  isNoteValidForComplete,
  remainingSeconds,
} from "./focus-session.ts";

describe("computeElapsedSeconds", () => {
  it("returns stored elapsed when paused", () => {
    const elapsed = computeElapsedSeconds(
      { status: "paused", elapsedSeconds: 120, lastResumedAt: null },
      new Date("2026-06-22T12:05:00")
    );
    assert.equal(elapsed, 120);
  });

  it("adds running segment since last resume", () => {
    const elapsed = computeElapsedSeconds(
      {
        status: "running",
        elapsedSeconds: 60,
        lastResumedAt: new Date("2026-06-22T12:00:00"),
      },
      new Date("2026-06-22T12:02:30")
    );
    assert.equal(elapsed, 210);
  });
});

describe("elapsedToDurationMinutes", () => {
  it("returns 0 for no elapsed time", () => {
    assert.equal(elapsedToDurationMinutes(0), 0);
  });

  it("rounds to at least 1 minute when time was logged", () => {
    assert.equal(elapsedToDurationMinutes(30), 1);
    assert.equal(elapsedToDurationMinutes(90), 2);
  });
});

describe("remainingSeconds", () => {
  it("never goes below zero", () => {
    assert.equal(remainingSeconds(25, 1600), 0);
    assert.equal(remainingSeconds(25, 1200), 300);
  });
});

describe("formatTimerDisplay", () => {
  it("formats mm:ss", () => {
    assert.equal(formatTimerDisplay(125), "2:05");
    assert.equal(formatTimerDisplay(5), "0:05");
  });
});

describe("isNoteValidForComplete", () => {
  it("rejects empty or whitespace-only notes", () => {
    assert.equal(isNoteValidForComplete(""), false);
    assert.equal(isNoteValidForComplete("   "), false);
    assert.equal(isNoteValidForComplete(null), false);
  });

  it("accepts non-empty trimmed notes", () => {
    assert.equal(isNoteValidForComplete("Learning session"), true);
    assert.equal(isNoteValidForComplete("  health session  "), true);
  });
});

describe("focusProgressPercent", () => {
  it("caps at 100%", () => {
    assert.equal(focusProgressPercent(25, 2000), 100);
    assert.equal(focusProgressPercent(25, 750), 50);
  });
});
