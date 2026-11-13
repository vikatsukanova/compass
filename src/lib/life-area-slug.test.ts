import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveUniqueSlug } from "./life-area-slug.ts";

describe("resolveUniqueSlug", () => {
  it("returns base slug when available", () => {
    assert.equal(resolveUniqueSlug("Yoga", new Set()), "yoga");
  });

  it("appends numeric suffix when base is taken", () => {
    assert.equal(resolveUniqueSlug("Health", new Set(["health"])), "health-2");
    assert.equal(resolveUniqueSlug("Health", new Set(["health", "health-2"])), "health-3");
  });

  it("handles empty slug fallback", () => {
    assert.equal(resolveUniqueSlug("!!!", new Set()), "area");
  });
});
