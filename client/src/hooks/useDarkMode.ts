import { useCallback, useLayoutEffect, useState } from "react";

const THEME_KEY = "theme";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem(THEME_KEY) === "dark",
  );

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
}
