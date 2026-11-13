import { displayNameFromEmail } from "@/lib/format";

/** Published identity for a public demo deployment. Not a private account. */
export const DEMO_PROFILE = {
  name: "John Smith",
  email: "demo@compass.app",
  password: "compass-demo",
} as const;

export function isDemoEmail(email?: string | null): boolean {
  return email?.trim().toLowerCase() === DEMO_PROFILE.email;
}

export function profileForSession(email?: string | null): { name: string; subtitle: string } {
  if (isDemoEmail(email)) {
    return { name: DEMO_PROFILE.name, subtitle: "Public demo" };
  }
  return { name: displayNameFromEmail(email), subtitle: "Sign out" };
}

/** True only when this deployment's login is the published demo account. */
export function isPublicDemoDeployment(): boolean {
  return (
    isDemoEmail(process.env.AUTH_EMAIL) && process.env.AUTH_PASSWORD === DEMO_PROFILE.password
  );
}

/**
 * Where a visitor with no session should go.
 * Null means the current path is allowed through.
 */
export function unsignedVisitorRedirect(pathname: string, search: string, demo: boolean): string | null {
  if (demo) {
    if (pathname === "/demo/enter") return null;
    if (pathname === "/login") return "/demo/enter";
    const callback = `${pathname}${search}`;
    if (callback === "/" || callback === "") return "/demo/enter";
    return `/demo/enter?callbackUrl=${encodeURIComponent(callback)}`;
  }

  if (pathname === "/login") return null;
  return "/login";
}

/** Keep demo redirects on this site. */
export function safeDemoCallback(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/demo/enter")) {
    return "/";
  }
  return value;
}
