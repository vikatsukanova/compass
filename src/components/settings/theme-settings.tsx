"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { THEMES, type Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeSettings() {
  const { theme, setTheme, loaded } = useTheme();

  if (!loaded) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading appearance…</p>;
  }

  return (
    <div>
      <p className="label">Appearance</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {THEMES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTheme(option)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              theme === option
                ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
            }`}
          >
            {LABELS[option]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        System follows this device&apos;s light or dark setting.
      </p>
    </div>
  );
}
