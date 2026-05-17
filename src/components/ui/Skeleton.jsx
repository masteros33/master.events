import React from "react";

export default function Skeleton({ width = "100%", height = "16px", radius = "8px", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

// Pre-built skeleton layouts for common patterns
export function SkeletonCard({ imageHeight = "200px" }) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--border)" }}>
      <Skeleton height={imageHeight} radius="0" />
      <div style={{ padding: "14px 16px" }}>
        <Skeleton height="15px" width="70%" style={{ marginBottom: "10px" }} />
        <Skeleton height="12px" width="45%" style={{ marginBottom: "12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton height="18px" width="25%" />
          <Skeleton height="12px" width="20%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <Skeleton width="44px" height="44px" radius="12px" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton height="13px" width="55%" style={{ marginBottom: "8px" }} />
            <Skeleton height="11px" width="35%" />
          </div>
        </div>
      ))}
    </div>
  );
}