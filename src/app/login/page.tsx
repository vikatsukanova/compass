import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { auth } from "@/auth";
import { isPublicDemoDeployment } from "@/lib/demo-profile";
import { Compass as CompassIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (isPublicDemoDeployment()) {
    redirect("/demo/enter");
  }

  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <CompassIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Compass</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
