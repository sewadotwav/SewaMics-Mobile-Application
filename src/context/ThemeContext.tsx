/**
 * SewaMics — Theme Context
 * File: src/context/ThemeContext.tsx
 *
 * Provides global dark/light mode state. Persists the preference
 * to Firestore so it survives app restarts.
 */

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

// ── Color Tokens ──────────────────────────────────────────────
export const LIGHT_COLORS = {
  background: "#ffffff",
  backgroundSecondary: "#f9fafb",
  text: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  icon: "#9ca3af",
  card: "#ffffff",
  accent: "#9d174d",
  orange: "#ea580c",
} as const;

export const DARK_COLORS = {
  background: "#121212",
  backgroundSecondary: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#cccccc",
  border: "#333333",
  icon: "#888888",
  card: "#1a1a1a",
  accent: "#9d174d",
  orange: "#ea580c",
} as const;

export type ThemeColors = {
  [K in keyof typeof LIGHT_COLORS]: string;
};

// ── Context Shape ─────────────────────────────────────────────
interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  colors: LIGHT_COLORS,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ── Provider ──────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const colors = useMemo(
    () => (isDarkMode ? DARK_COLORS : LIGHT_COLORS),
    [isDarkMode]
  );

  const value = useMemo(
    () => ({ isDarkMode, colors, toggleTheme, setDarkMode }),
    [isDarkMode, colors, toggleTheme, setDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
