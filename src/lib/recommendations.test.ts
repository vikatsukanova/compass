import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAreaStatus,
  getTodaysFocus,
  groupLogsByArea,
  hasHighPriorityNeglected,
  type FocusItem,
} from "./recommendations";

const health = {
  id: "health",
  name: "Health",
  slug: "health",
  weeklyTarget: 3,
  targetUnit: "sessions" as const,
  priority: "high" as const,
};

const learning = {
  id: "learning",
  name: "Learning",
  slug: "learning",
  weeklyTarget: 5,
  targetUnit: "hours" as const,
  priority: "high" as const,
};

const creativity = {
  id: "creativity",
  name: "Creativity",
  slug: "creativity",
  weeklyTarget: 2,
  targetUnit: "sessions" as const,
  priority: "medium" as const,
};

const career = {
  id: "career",
  name: "Career",
  slug: "career",
  weeklyTarget: 40,
  targetUnit: "hours" as const,
  priority: "high" as const,
};

function log(areaId: string, date: string, durationMinutes?: number) {
  return { lifeAreaId: areaId, date, durationMinutes: durationMinutes ?? null };
}

describe("getAreaStatus", () => {
  it("marks area with no rolling logs as neglected", () => {
    const status = getAreaStatus(health, [], [], new Date("2026-06-17T12:00:00"), false);
    assert.equal(status, "neglected");
  });

  it("marks area behind on midweek when below 50% of target", () => {
    const weekLogs = [log("health", "2026-06-15")]; // 1 of 3 sessions on Wed
    const rolling = [log("health", "2026-06-15")];
    const status = getAreaStatus(
      health,
      weekLogs,
      rolling,
      new Date("2026-06-17T12:00:00"),
      false
    );
    assert.equal(status, "behind");
  });

  it("does not mark area behind before midweek at 0%", () => {
    const rolling = [log("health", "2026-06-14")];
    const status = getAreaStatus(health, [], rolling, new Date("2026-06-16T12:00:00"), false);
    assert.equal(status, "on_track");
  });

  it("marks over-focused when at 150% target and high-priority area neglected", () => {
    const weekLogs = [
      log("career", "2026-06-15", 600),
      log("career", "2026-06-16", 600),
      log("career", "2026-06-17", 600),
    ]; // 30 hrs of 40 — not 150%
    const weekLogsOver = [
      log("career", "2026-06-15", 480),
      log("career", "2026-06-16", 480),
      log("career", "2026-06-17", 480),
      log("career", "2026-06-17", 480),
    ]; // 32 hrs = 80% — still not 150%

    // 40 hr target * 1.5 = 60 hrs = 3600 min
    const weekLogsWayOver = [log("career", "2026-06-15", 3600), log("career", "2026-06-16", 3600)];

    assert.equal(
      getAreaStatus(career, weekLogs, weekLogs, new Date("2026-06-17T12:00:00"), true),
      "on_track"
    );

    const status = getAreaStatus(
      career,
      weekLogsWayOver,
      weekLogsWayOver,
      new Date("2026-06-17T12:00:00"),
      true
    );
    assert.equal(status, "over_focused");
  });

  it("does not mark over-focused when no high-priority neglect", () => {
    const weekLogsWayOver = [log("career", "2026-06-15", 3600), log("career", "2026-06-16", 3600)];
    const status = getAreaStatus(
      career,
      weekLogsWayOver,
      weekLogsWayOver,
      new Date("2026-06-17T12:00:00"),
      false
    );
    assert.equal(status, "on_track");
  });
});

describe("getTodaysFocus", () => {
  const wed = new Date("2026-06-17T12:00:00");

  it("prioritizes high neglected before high behind and urgent tasks", () => {
    const areas = [health, learning, creativity];
    const weekByArea = groupLogsByArea([log("learning", "2026-06-15", 60)]); // learning behind
    const rollingByArea = groupLogsByArea([log("learning", "2026-06-15", 60)]); // health neglected

    const urgentTasks = [
      {
        id: "t1",
        title: "Review draft",
        dueDate: "2026-06-18",
        isUrgent: true,
        lifeAreaId: "creativity",
        lifeArea: { name: "Creativity", slug: "creativity" },
      },
    ];

    const focus = getTodaysFocus(
      areas,
      weekByArea,
      rollingByArea,
      urgentTasks,
      wed,
      "2026-06-17"
    );

    assert.ok(focus.length >= 3);
    assert.equal(focus[0].kind, "area");
    assert.equal((focus[0] as FocusItem & { kind: "area" }).area.id, "health");
    assert.equal(focus[1].kind, "area");
    assert.equal((focus[1] as FocusItem & { kind: "area" }).area.id, "learning");
    assert.equal(focus[2].kind, "task");
  });

  it("includes medium-priority neglected after urgent tasks", () => {
    const areas = [creativity];
    const rollingByArea = groupLogsByArea([]);
    const focus = getTodaysFocus(areas, new Map(), rollingByArea, [], wed, "2026-06-17");

    assert.equal(focus.length, 1);
    assert.equal(focus[0].kind, "area");
    assert.equal((focus[0] as FocusItem & { kind: "area" }).area.id, "creativity");
  });

  it("caps focus items at 5", () => {
    const areas = [
      { ...health, id: "a1", name: "A1", slug: "a1" },
      { ...health, id: "a2", name: "A2", slug: "a2" },
      { ...health, id: "a3", name: "A3", slug: "a3" },
      { ...health, id: "a4", name: "A4", slug: "a4" },
      { ...health, id: "a5", name: "A5", slug: "a5" },
      { ...health, id: "a6", name: "A6", slug: "a6" },
    ];
    const rollingByArea = groupLogsByArea([]);
    const focus = getTodaysFocus(areas, new Map(), rollingByArea, [], wed, "2026-06-17");
    assert.equal(focus.length, 5);
  });
});

describe("hasHighPriorityNeglected", () => {
  it("returns true when a high-priority area has no rolling logs", () => {
    const rolling = groupLogsByArea([log("learning", "2026-06-17", 60)]);
    assert.equal(hasHighPriorityNeglected([health, learning], rolling), true);
  });
});
