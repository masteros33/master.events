import React from "react";
import { motion } from "framer-motion";

const VARIANTS = {
  primary: {
    background: "linear-gradient(135deg, #f5a623, #e8920f)",
    color: "#fff",
    border: "none",
    boxShadow: "var(--shadow-brand)",
  },
  secondary: {
    background: "var(--bg-subtle)",
    color: "var(--text-secondary)",
    border: "1.5px solid var(--border)",
    boxShadow: "none",
  },
  danger: {
    background: "var(--error-bg)",
    color: "var(--error)",
    border: "1px solid rgba(220,38,38,0.2)",
    boxShadow: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    boxShadow: "none",
  },
  purple: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
  style = {},
  type = "button",
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;

  const sizes = {
    sm: { padding: "8px 14px",  fontSize: "12px", borderRadius: "10px" },
    md: { padding: "13px 20px", fontSize: "14px", borderRadius: "12px" },
    lg: { padding: "16px 28px", fontSize: "16px", borderRadius: "14px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      style={{
        ...v,
        ...s,
        width: fullWidth ? "100%" : "auto",
        fontWeight: 700,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : loading ? 0.85 : 1,
        fontFamily: "var(--font-sans)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "all 0.15s ease",
        ...style,
      }}>
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
          style={{
            width: "15px", height: "15px",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: variant === "primary" || variant === "purple" ? "#fff" : "var(--brand)",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </motion.button>
  );
}