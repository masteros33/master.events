import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "me_theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getResolvedTheme(pref) {
  if (pref === "system" || !pref) return getSystemTheme();
  return pref;
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

// ── Inject blocking script — prevents flash on first load ──
const THEME_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('me_theme');
    var resolved = stored && stored !== 'system'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch(e){}
})();
`;

export function useTheme() {
  const [preference, setPreference] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "system"; }
    catch { return "system"; }
  });

  const resolved = getResolvedTheme(preference);

  // Apply on mount + preference change
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen for OS theme changes when pref is "system"
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => applyTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setTheme = useCallback((pref) => {
    setPreference(pref);
    try { localStorage.setItem(STORAGE_KEY, pref); } catch {}
    applyTheme(getResolvedTheme(pref));
  }, []);

  return { theme: preference, resolvedTheme: resolved, setTheme };
}

export { THEME_SCRIPT };