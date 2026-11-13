"use client";

import { AppNav } from "@/components/layout/app-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightPanel } from "@/components/layout/right-panel";
import { ActiveSessionBanner } from "@/components/focus/active-session-banner";
import { usePathname } from "next/navigation";

const DASHBOARD_PATHS = new Set(["/"]);

type AppShellProps = {
  children: React.ReactNode;
  displayName: string;
  profileSubtitle: string;
  canSignOut: boolean;
};

export function AppShell({ children, displayName, profileSubtitle, canSignOut }: AppShellProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const showRightPanel = DASHBOARD_PATHS.has(pathname);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <AppNav displayName={displayName} profileSubtitle={profileSubtitle} canSignOut={canSignOut} />

      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#fafafa] dark:bg-slate-950">
          <ActiveSessionBanner />
          <div
            className={
              showRightPanel
                ? "flex min-h-0 flex-1 flex-col overflow-hidden"
                : "min-h-0 flex-1 overflow-y-auto"
            }
          >
            {showRightPanel ? children : <div className="shell-main pb-24 lg:pb-8">{children}</div>}
          </div>
        </main>

        {showRightPanel && (
          <aside className="hidden h-full w-80 shrink-0 flex-col overflow-hidden border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 lg:flex">
            <RightPanel />
          </aside>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
