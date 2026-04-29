import React from "react";
import { useTheme } from "../hooks/useTheme";
import { motion } from "framer-motion";

const themes = [
  { id: "light",  icon: "☀️", label: "Light"  },
  { id: "dark",   icon: "🌙", label: "Dark"   },
  { id: "system", icon: "💻", label: "System" },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    const current = themes.find(t => t.id === theme);
    const next = themes[(themes.findIndex(t => t.id === theme) + 1) % themes.length];
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme(next.id)}
        style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "var(--bg-subtle)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", cursor: "pointer",
        }}
        title={"Switch to " + next.label}
      >
        {current?.icon}
      </motion.button>
    );
  }

  return (
    <div style={{
      display: "flex", gap: "4px", padding: "4px",
      background: "var(--bg-subtle)", borderRadius: "12px",
      border: "1px solid var(--border)",
    }}>
      {themes.map(t => (
        <motion.button
          key={t.id}
          whileTap={{ scale: 0.92 }}
          onClick={() => setTheme(t.id)}
          style={{
            padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
            fontWeight: 600, cursor: "pointer", display: "flex",
            alignItems: "center", gap: "5px",
            background: theme === t.id ? "var(--bg-card)" : "transparent",
            color: theme === t.id ? "var(--brand)" : "var(--text-muted)",
            boxShadow: theme === t.id ? "var(--shadow-sm)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </motion.button>
      ))}
    </div>
  );
}