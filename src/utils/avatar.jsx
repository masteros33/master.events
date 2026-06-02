// Preset avatar seeds — each gives a unique consistent face from Navii
export const AVATAR_PRESETS = [
  "master_alpha",  "master_beta",   "master_gamma",
  "master_delta",  "master_epsilon","master_zeta",
  "master_eta",    "master_theta",  "master_iota",
  "master_kappa",  "master_lambda", "master_mu",
  "master_nu",     "master_xi",     "master_omicron",
  "master_pi",     "master_rho",    "master_sigma",
  "master_tau",    "master_upsilon","master_phi",
  "master_chi",    "master_psi",    "master_omega",
];

// Auto-assign a preset based on email — deterministic, same email = same avatar
export function getDefaultAvatarSeed(email) {
  if (!email) return AVATAR_PRESETS[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PRESETS[Math.abs(hash) % AVATAR_PRESETS.length];
}

// Storage key for user's chosen avatar
const AVATAR_KEY = "me_avatar_seed";

export function getSavedAvatarSeed(email) {
  try {
    const saved = localStorage.getItem(AVATAR_KEY + "_" + email);
    return saved || getDefaultAvatarSeed(email);
  } catch { return getDefaultAvatarSeed(email); }
}

export function saveAvatarSeed(email, seed) {
  try { localStorage.setItem(AVATAR_KEY + "_" + email, seed); } catch {}
}

export function naviiUrl(seed, size = 96) {
  if (!seed) return null;
  const clean = encodeURIComponent(seed.toLowerCase().trim());
  return `https://api.navii.dev/avatar/${clean}?size=${size}`;
}

export function Avatar({ seed, name, size = 36, style = {} }) {
  const url     = naviiUrl(seed, size * 2);
  const initial = (name || seed || "U")[0]?.toUpperCase();

  if (!url) return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #F97316, #EA6C0A)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      flexShrink: 0, ...style,
    }}>
      {initial}
    </div>
  );

  return (
    <img src={url} alt={name || seed || "User"}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, ...style }}
      onError={e => {
        e.target.style.display = "none";
        const div = document.createElement("div");
        div.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#F97316,#EA6C0A);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.38)}px;font-weight:700;color:#fff;flex-shrink:0`;
        div.textContent = initial;
        e.target.parentNode.insertBefore(div, e.target);
      }}
    />
  );
}