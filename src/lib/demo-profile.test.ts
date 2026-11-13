import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  DEMO_PROFILE,
  isDemoEmail,
  isPublicDemoDeployment,
  profileForSession,
  safeDemoCallback,
  unsignedVisitorRedirect,
} from "./demo-profile.ts";

describe("demo profile", () => {
  const previousEmail = process.env.AUTH_EMAIL;
  const previousPassword = process.env.AUTH_PASSWORD;

  afterEach(() => {
    if (previousEmail === undefined) delete process.env.AUTH_EMAIL;
    else process.env.AUTH_EMAIL = previousEmail;
    if (previousPassword === undefined) delete process.env.AUTH_PASSWORD;
    else process.env.AUTH_PASSWORD = previousPassword;
  });

  it("recognizes the published demo email", () => {
    assert.equal(isDemoEmail("demo@compass.app"), true);
    assert.equal(isDemoEmail(" Demo@Compass.app "), true);
    assert.equal(isDemoEmail("you@example.com"), false);
  });

  it("uses John Smith for the demo session and the email name otherwise", () => {
    assert.deepEqual(profileForSession(DEMO_PROFILE.email), {
      name: "John Smith",
      subtitle: "Public demo",
    });
    assert.equal(profileForSession("alex.chen@example.com").name, "Alex Chen");
    assert.equal(profileForSession("alex.chen@example.com").subtitle, "Sign out");
  });

  it("treats the deployment as public only when both demo credentials match", () => {
    process.env.AUTH_EMAIL = DEMO_PROFILE.email;
    process.env.AUTH_PASSWORD = DEMO_PROFILE.password;
    assert.equal(isPublicDemoDeployment(), true);

    process.env.AUTH_PASSWORD = "something-else";
    assert.equal(isPublicDemoDeployment(), false);

    process.env.AUTH_EMAIL = "you@example.com";
    process.env.AUTH_PASSWORD = DEMO_PROFILE.password;
    assert.equal(isPublicDemoDeployment(), false);
  });

  it("sends unsigned demo visitors to automatic entry, and everyone else to login", () => {
    assert.equal(unsignedVisitorRedirect("/", "", true), "/demo/enter");
    assert.equal(unsignedVisitorRedirect("/tasks", "?week=1", true), "/demo/enter?callbackUrl=%2Ftasks%3Fweek%3D1");
    assert.equal(unsignedVisitorRedirect("/demo/enter", "", true), null);
    assert.equal(unsignedVisitorRedirect("/login", "", true), "/demo/enter");
    assert.equal(unsignedVisitorRedirect("/login", "?error=1", true), "/demo/enter");
    assert.equal(unsignedVisitorRedirect("/", "", false), "/login");
    assert.equal(unsignedVisitorRedirect("/login", "", false), null);
  });

  it("rejects off-site demo callbacks", () => {
    assert.equal(safeDemoCallback("/tasks"), "/tasks");
    assert.equal(safeDemoCallback("https://evil.example"), "/");
    assert.equal(safeDemoCallback("//evil.example"), "/");
    assert.equal(safeDemoCallback("/demo/enter"), "/");
  });
});
