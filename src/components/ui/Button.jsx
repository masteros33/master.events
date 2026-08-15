import React from "react";

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const VARIANTS = {
  primary:
    "bg-brand-orange hover:bg-brand-orange-hover text-white disabled:bg-gray-100 disabled:text-brand-muted",
  secondary:
    "bg-brand-card border border-gray-200 hover:border-gray-300 text-brand-text disabled:text-brand-muted disabled:border-gray-100",
  ghost:
    "bg-transparent text-brand-muted hover:text-brand-text disabled:text-gray-300",
  danger:
    "bg-brand-card border border-red-200 hover:border-red-300 text-red-600 disabled:text-brand-muted disabled:border-gray-100",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      className={`${fullWidth ? "w-full" : ""} ${SIZES[size] || SIZES.md} ${
        VARIANTS[variant] || VARIANTS.primary
      } rounded-full font-bold flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed ${className}`}>
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
