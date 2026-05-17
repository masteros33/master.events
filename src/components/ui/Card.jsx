import React from "react";

export default function Card({ children, padding = "20px", radius = "16px", style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: radius,
        padding,
        boxShadow: "var(--shadow-sm)",
        cursor: onClick ? "pointer" : "default",
        transition: onClick ? "box-shadow 0.2s, border-color 0.2s" : "none",
        ...style,
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--brand)"; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--border)"; }}}
    >
      {children}
    </div>
  );
}