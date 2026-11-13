import { signIn } from "@/auth";
import { DEMO_PROFILE, isPublicDemoDeployment, safeDemoCallback } from "@/lib/demo-profile";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isPublicDemoDeployment()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const callbackUrl = safeDemoCallback(new URL(request.url).searchParams.get("callbackUrl"));

  await signIn("credentials", {
    email: DEMO_PROFILE.email,
    password: DEMO_PROFILE.password,
    redirectTo: callbackUrl,
  });
}
