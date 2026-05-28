/**
 * Returns a Navii avatar URL for any user.
 * Same seed = same face every time.
 * Falls back to initials if no seed provided.
 */
export function naviiUrl(seed, size = 96) {
  if (!seed) return null;
  const clean = encodeURIComponent(seed.toLowerCase().trim());
  return `https://api.navii.dev/avatar/${clean}?size=${size}`;
}

/**
 * Avatar component — shows Navii avatar with fallback to initials
 */
export function Avatar({ seed, name, size = 36, style = {} }) {
  const url = naviiUrl(seed, size * 2); // 2x for retina
  const initial = (name || seed || "U")[0]?.toUpperCase();

  if (!url) return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #f5a623, #e8920f)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      flexShrink: 0, ...style,
    }}>
      {initial}
    </div>
  );

  return (
    <img
      src={url}
      alt={name || seed || "User"}
      style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", flexShrink: 0, ...style,
      }}
      onError={e => {
        // Fallback to orange gradient div on load error
        e.target.style.display = "none";
        const div = document.createElement("div");
        div.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#f5a623,#e8920f);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.38)}px;font-weight:700;color:#fff;flex-shrink:0`;
        div.textContent = initial;
        e.target.parentNode.insertBefore(div, e.target);
      }}
    />
  );
}