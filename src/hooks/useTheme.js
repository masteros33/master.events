import { useEffect, useState } from "react";

const THEME_KEY = "me-theme";

// ── Cookie helper (no lib needed) ─────────────────────────────
function setCookie(name, value, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
  } catch {}
}
function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  } catch { return null; }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || getCookie(THEME_KEY) || "system";
    } catch { return "system"; }
  });

  useEffect(() => {
    const root = document.documentElement;

    const apply = (t) => {
      if (t === "dark") {
        root.setAttribute("data-theme", "dark");
      } else if (t === "light") {
        root.setAttribute("data-theme", "light");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      }
    };

    apply(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    setCookie(THEME_KEY, theme);

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