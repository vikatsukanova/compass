"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass as CompassIcon } from "lucide-react";
import { SoonBadge } from "@/components/layout/soon-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { initialsFromName } from "@/lib/format";
import { isNavActive, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/lib/nav";

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  if (item.type === "soon") {
    const Icon = item.icon;
    return (
      <div
        className="flex cursor-not-allowed items-center justify-between gap-3 rounded-xl px-4 py-2 text-sm font-medium text-slate-400 dark:text-slate-500"
        aria-disabled="true"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" />
          {item.label}
        </span>
        <SoonBadge />
      </div>
    );
  }

  const Icon = item.icon;
  const active = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {item.label}
    </Link>
  );
}

function ProfileRow({
  displayName,
  profileSubtitle,
  canSignOut,
}: {
  displayName: string;
  profileSubtitle: string;
  canSignOut: boolean;
}) {
  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
        {initialsFromName(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{profileSubtitle}</p>
      </div>
    </>
  );

  if (!canSignOut) {
    return <div className="flex w-full items-center gap-3 rounded-xl p-3 text-left">{content}</div>;
  }

  return (
    <SignOutButton className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
      {content}
    </SignOutButton>
  );
}

export function AppNav({
  displayName,
  profileSubtitle,
  canSignOut,
}: {
  displayName: string;
  profileSubtitle: string;
  canSignOut: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex">
      <div>
        <div className="px-6 pb-3 pt-5">
          <div className="flex items-center gap-3 text-xl font-bold text-blue-600 dark:text-blue-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
              <CompassIcon className="h-5 w-5" />
            </div>
            Compass
          </div>
          <ThemeToggle className="mt-3 w-full" />
        </div>

        <nav className="space-y-0.5 px-4 pt-1">
          {PRIMARY_NAV.map((item) => (
            <NavRow key={item.href} item={item} pathname={pathname} />
          ))}

          {SECONDARY_NAV.map((item) => (
            <NavRow key={item.type === "link" ? item.href : item.label} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 p-4">
        <ProfileRow
          displayName={displayName}
          profileSubtitle={profileSubtitle}
          canSignOut={canSignOut}
        />
      </div>
    </aside>
  );
}
