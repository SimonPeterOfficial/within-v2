"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "within:theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable — fall through to system preference */
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * The theme engine — dark-first by default, with a light surface available.
 *
 * Hydration-safe: the initial state is always `"dark"` on server and client,
 * so SSR HTML never differs. The stored/system preference is resolved inside
 * an effect and applied by flipping `data-theme` on <html>, which the CSS
 * variable blocks in globals.css react to.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Resolve the user's stored/system preference once, after hydration.
  // Deferred into an animation frame (async) to keep the effect body free of
  // synchronous setState while staying hydration-safe.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setThemeState(resolveInitialTheme()));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Apply + persist whenever the theme changes.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggle = useCallback(
    () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
    []
  );

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Reads the active theme and its controls. Must be used under <ThemeProvider>. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
