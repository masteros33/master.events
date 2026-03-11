import React from "react";

export default function QRCode({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#fff" />
      <rect x="5" y="5" width="28" height="28" fill="#111" rx="3" /><rect x="10" y="10" width="18" height="18" fill="#fff" rx="1" /><rect x="14" y="14" width="10" height="10" fill="#111" />
      <rect x="67" y="5" width="28" height="28" fill="#111" rx="3" /><rect x="72" y="10" width="18" height="18" fill="#fff" rx="1" /><rect x="76" y="14" width="10" height="10" fill="#111" />
      <rect x="5" y="67" width="28" height="28" fill="#111" rx="3" /><rect x="10" y="72" width="18" height="18" fill="#fff" rx="1" /><rect x="14" y="76" width="10" height="10" fill="#111" />
      <rect x="40" y="5" width="6" height="6" fill="#111" /><rect x="50" y="5" width="6" height="6" fill="#111" /><rect x="60" y="5" width="6" height="6" fill="#111" />
      <rect x="40" y="15" width="6" height="6" fill="#111" /><rect x="55" y="15" width="6" height="6" fill="#111" />
      <rect x="45" y="25" width="6" height="6" fill="#111" /><rect x="60" y="25" width="6" height="6" fill="#111" />
      <rect x="5" y="40" width="6" height="6" fill="#111" /><rect x="15" y="40" width="6" height="6" fill="#111" /><rect x="25" y="40" width="6" height="6" fill="#111" />
      <rect x="40" y="40" width="6" height="6" fill="#111" /><rect x="50" y="40" width="6" height="6" fill="#111" /><rect x="60" y="40" width="6" height="6" fill="#111" />
      <rect x="70" y="40" width="6" height="6" fill="#111" /><rect x="80" y="40" width="6" height="6" fill="#111" /><rect x="90" y="40" width="6" height="6" fill="#111" />
      <rect x="5" y="50" width="6" height="6" fill="#111" /><rect x="20" y="50" width="6" height="6" fill="#111" /><rect x="45" y="50" width="6" height="6" fill="#111" />
      <rect x="60" y="50" width="6" height="6" fill="#111" /><rect x="75" y="50" width="6" height="6" fill="#111" /><rect x="90" y="50" width="6" height="6" fill="#111" />
      <rect x="5" y="60" width="6" height="6" fill="#111" /><rect x="15" y="60" width="6" height="6" fill="#111" /><rect x="40" y="60" width="6" height="6" fill="#111" />
      <rect x="55" y="60" width="6" height="6" fill="#111" /><rect x="70" y="60" width="6" height="6" fill="#111" /><rect x="85" y="60" width="6" height="6" fill="#111" />
      <rect x="40" y="70" width="6" height="6" fill="#111" /><rect x="55" y="70" width="6" height="6" fill="#111" /><rect x="65" y="70" width="6" height="6" fill="#111" /><rect x="80" y="70" width="6" height="6" fill="#111" />
      <rect x="45" y="80" width="6" height="6" fill="#111" /><rect x="60" y="80" width="6" height="6" fill="#111" /><rect x="75" y="80" width="6" height="6" fill="#111" /><rect x="90" y="80" width="6" height="6" fill="#111" />
      <rect x="40" y="90" width="6" height="6" fill="#111" /><rect x="55" y="90" width="6" height="6" fill="#111" /><rect x="70" y="90" width="6" height="6" fill="#111" /><rect x="85" y="90" width="6" height="6" fill="#111" />
    </svg>
  );
}
