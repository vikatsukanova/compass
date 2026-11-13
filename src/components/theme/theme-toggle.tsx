"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, loaded, setTheme } = useTheme();
  const night = loaded && dark;

  return (
    <div
      className={`grid grid-cols-2 rounded-full bg-slate-100 p-1 dark:bg-slate-800 ${className}`}
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={loaded ? !night : undefined}
        className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          loaded && !night
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
        Day
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={loaded ? night : undefined}
        className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          night
            ? "bg-slate-950 text-slate-100 shadow-sm"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
        Night
      </button>
    </div>
  );
}
