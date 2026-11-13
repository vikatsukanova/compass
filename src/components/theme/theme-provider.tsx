"use client";

import { applyTheme, isDarkTheme, loadTheme, saveTheme, type Theme } from "@/lib/theme";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeContextValue = {
  theme: Theme;
  /** Resolved appearance, including when theme is System. */
  dark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loaded: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [dark, setDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function commit(next: Theme) {
    saveTheme(next);
    setThemeState(next);
    applyTheme(next);
    setDark(isDarkTheme(next));
  }

  useEffect(() => {
    const stored = loadTheme();
    setThemeState(stored);
    applyTheme(stored);
    setDark(isDarkTheme(stored));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      setDark(media.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [loaded, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      dark,
      loaded,
      setTheme: commit,
      toggleTheme() {
        commit(dark ? "light" : "dark");
      },
    }),
    [theme, dark, loaded],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
