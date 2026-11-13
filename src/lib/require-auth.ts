import { auth } from "@/auth";
import { isPublicDemoDeployment } from "@/lib/demo-profile";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect(isPublicDemoDeployment() ? "/demo/enter" : "/login");
  }
  return session;
}
