import { createContext, useContext, type ReactNode } from "react";
import { useDarkMode } from "../hooks/useDarkMode";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <ThemeContext.Provider
      value={{ theme: isDark ? "dark" : "light", toggleTheme: toggle }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
