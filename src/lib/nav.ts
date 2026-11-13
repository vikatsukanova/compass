import {
  Compass,
  LayoutGrid,
  ListTodo,
  PenLine,
  Settings,
  Timer,
  type LucideIcon,
} from "lucide-react";

export type NavLinkItem = {
  type: "link";
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSoonItem = {
  type: "soon";
  label: string;
  icon: LucideIcon;
};

export type NavItem = NavLinkItem | NavSoonItem;

export const PRIMARY_NAV: NavLinkItem[] = [
  { type: "link", href: "/", label: "Dashboard", icon: LayoutGrid },
  { type: "link", href: "/areas", label: "Life Areas", icon: Compass },
  { type: "link", href: "/activities", label: "Activities", icon: PenLine },
  { type: "link", href: "/focus", label: "Focus", icon: Timer },
  { type: "link", href: "/tasks", label: "Tasks", icon: ListTodo },
];

export const SECONDARY_NAV: NavItem[] = [
  { type: "link", href: "/settings", label: "Settings", icon: Settings },
];

/** Bottom bar — primary routes only (no Settings / Soon items). */
export const MOBILE_NAV = PRIMARY_NAV;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
