import { useEffect, useState } from "react";

const THEME_KEY = "me-theme";

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t) => {
      if (t === "dark") {
        root.setAttribute("data-theme", "dark");
      } else if (t === "light") {
        root.setAttribute("data-theme", "light");
      } else {
        // system
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      }
    };

    apply(theme);
    localStorage.setItem(THEME_KEY, theme);

    // Listen for system changes
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t) => setThemeState(t);
  return { theme, setTheme };
}