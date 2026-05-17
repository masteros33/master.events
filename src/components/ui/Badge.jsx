import React from "react";

const PRESETS = {
  brand:   { bg: "rgba(245,166,35,0.12)",  color: "#f5a623",  border: "rgba(245,166,35,0.25)"  },
  green:   { bg: "rgba(22,163,74,0.1)",    color: "#16a34a",  border: "rgba(22,163,74,0.2)"    },
  purple:  { bg: "rgba(124,58,237,0.1)",   color: "#7c3aed",  border: "rgba(124,58,237,0.2)"   },
  red:     { bg: "rgba(220,38,38,0.08)",   color: "#dc2626",  border: "rgba(220,38,38,0.2)"    },
  muted:   { bg: "var(--bg-subtle)",       color: "var(--text-muted)", border: "var(--border)" },
  polygon: { bg: "rgba(124,58,237,0.08)",  color: "#a78bfa",  border: "rgba(124,58,237,0.2)"   },
};

export default function Badge({ children, preset = "brand", dot = false, style = {} }) {
  const p = PRESETS[preset] || PRESETS.brand;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px",
      borderRadius: "99px",
      background: p.bg,
      border: "1px solid " + p.border,
      fontSize: "10px",
      fontWeight: 700,
      color: p.color,
      letterSpacing: "0.3px",
      whiteSpace: "nowrap",
      ...style,
    }}>
      {dot && (
        <div style={{
          width: "5px", height: "5px",
          borderRadius: "50%",
          background: p.color,
          flexShrink: 0,
        }} />
      )}
      {children}
    </div>
  );
}