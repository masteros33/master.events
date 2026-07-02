import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import { Avatar } from "../../utils/avatar";

const API     = "https://master-events-backend.onrender.com";
const BRAND   = "#F97316";
const BRAND_D = "#EA6C0A";
const GREEN   = "#22c55e";
const PURPLE  = "#8b5cf6";
const RED     = "#ef4444";
const BLUE    = "#3b82f6";
const FONT    = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO    = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const isDesktop = () => window.innerWidth > 768;

// ── Design tokens ─────────────────────────────────────────────
const T = {
  bg:       "var(--bg)",
  card:     "var(--bg-card)",
  border:   "var(--border)",
  text:     "var(--text-primary)",
  sub:      "var(--text-secondary)",
  muted:    "var(--text-muted)",
  subtle:   "var(--bg-subtle)",
  shadow:   "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.04)",
  shadowLg: "0 10px 40px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.06)",
};

// ── Shared input style ────────────────────────────────────────
const INP = (err) => ({
  width: "100%", padding: "13px 16px",
  background: T.bg, border: `1.5px solid ${err ? RED : T.border}`,
  borderRadius: "12px", fontSize: "14px", color: T.text,
  outline: "none", fontFamily: FONT, boxSizing: "border-box",
  caretColor: BRAND, transition: "border-color 0.15s, box-shadow 0.15s",
  marginBottom: "14px",
});
const focusIn  = e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; };
const blurIn   = e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; };

// ── Fintech primary button ────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled, loading, color = BRAND, style = {} }) {
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.015 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%", padding: "16px 20px",
        background: disabled ? T.border : `linear-gradient(135deg, ${color}, ${color === BRAND ? BRAND_D : color})`,
        color: disabled ? T.muted : "#fff",
        border: "none", borderRadius: "14px",
        fontSize: "15px", fontWeight: 700, cursor: disabled || loading ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 4px 20px ${color}40`,
        fontFamily: FONT, letterSpacing: "-0.2px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        transition: "all 0.2s", ...style,
      }}>
      {loading ? (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
            style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", flexShrink: 0 }} />
          {children}
        </>
      ) : children}
    </motion.button>
  );
}

// ── Ghost button ──────────────────────────────────────────────
function GhostBtn({ children, onClick, style = {} }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      style={{ width: "100%", padding: "14px 20px", background: "transparent", color: T.sub, border: `1px solid ${T.border}`, borderRadius: "14px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: FONT, transition: "all 0.15s", ...style }}>
      {children}
    </motion.button>
  );
}

// ── Page wrapper ──────────────────────────────────────────────
function PageWrap({ children, maxW = "560px" }) {
  const desktop = isDesktop();
  return (
    <div style={{ background: T.bg, minHeight: "100%", padding: desktop ? "40px" : "16px", fontFamily: FONT }}>
      <div style={{ maxWidth: desktop ? maxW : "100%", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────
function StatChip({ icon, label, value, color = BRAND }) {
  return (
    <div style={{ flex: "1 1 70px", background: T.subtle, borderRadius: "12px", padding: "12px 10px", textAlign: "center", border: `1px solid ${T.border}`, minWidth: "70px" }}>
      <div style={{ fontSize: "18px", marginBottom: "5px" }}>{icon}</div>
      <div style={{ fontSize: "8px", color: T.muted, letterSpacing: "1px", marginBottom: "3px", fontFamily: MONO, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: MONO }}>{value}</div>
    </div>
  );
}

// ── Blockchain strip ──────────────────────────────────────────
function ChainStrip({ txHash, tokenId }) {
  const url = txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;
  return (
    <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "14px" }}>⛓️</span>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>Polygon Blockchain</div>
          <div style={{ fontSize: "10px", color: T.muted, marginTop: "1px", fontFamily: MONO }}>
            {tokenId ? `NFT #${tokenId}` : "Minting in progress..."}
          </div>
        </div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          style={{ fontSize: "11px", fontWeight: 600, color: PURPLE, textDecoration: "none", background: "rgba(139,92,246,0.1)", padding: "5px 12px", borderRadius: "99px", border: "1px solid rgba(139,92,246,0.2)", whiteSpace: "nowrap" }}>
          Verify ↗
        </a>
      ) : (
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: "11px", fontWeight: 500, color: PURPLE, background: "rgba(139,92,246,0.08)", padding: "5px 12px", borderRadius: "99px", border: "1px solid rgba(139,92,246,0.15)", whiteSpace: "nowrap" }}>
          Minting...
        </motion.div>
      )}
    </div>
  );
}

// ── Security features grid ────────────────────────────────────
function SecurityFeatures() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      {[
        ["🔐","HMAC Secured","Rotates every 10s"],
        ["📵","Screenshot-proof","Dynamic QR only"],
        ["⛓️","NFT Ownership","On Polygon chain"],
        ["🚫","Single-use scan","Auto-invalidates"],
      ].map(([icon, title, sub]) => (
        <div key={title} style={{ background: T.subtle, borderRadius: "12px", padding: "12px", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.text, marginBottom: "2px" }}>{title}</div>
          <div style={{ fontSize: "10px", color: T.muted }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Perforated divider ────────────────────────────────────────
function PerforatedLine() {
  return (
    <div style={{ position: "relative", height: "30px" }}>
      <div style={{ position: "absolute", left: "-1px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", borderRadius: "50%", background: T.bg, border: `1px solid rgba(255,255,255,0.08)`, zIndex: 5 }} />
      <div style={{ position: "absolute", right: "-1px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", borderRadius: "50%", background: T.bg, border: `1px solid rgba(255,255,255,0.08)`, zIndex: 5 }} />
      <svg width="100%" height="30" style={{ position: "absolute", top: 0, left: 0 }}>
        <line x1="20" y1="15" x2="99%" y2="15" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="5 5" />
      </svg>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "99px", padding: "2px 10px", fontSize: "8px", fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)", whiteSpace: "nowrap" }}>
        · · · · · · · · · · · ·
      </div>
    </div>
  );
}

// ── Event image header ────────────────────────────────────────
function EventImageHeader({ image }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {image ? (
        <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1a0533,#0d1b4b,#0a0f1e)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.25),rgba(0,0,0,0.7))" }} />
      <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }}
        style={{ position: "absolute", top: "-20%", right: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.35) 0%,transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
    </div>
  );
}

// ── Premium Ticket ────────────────────────────────────────────
function PremiumTicket({ ev, ownerName, qrSrc, qrLoaded, qrError, refreshing, setQrLoaded, setQrError, timeLeft, isExpiringSoon, progressColor, ticketId, txHash, tokenId, status, quantity }) {
  const cardRef  = useRef(null);
  const rotateX  = useMotionValue(0);
  const rotateY  = useMotionValue(0);
  const desktop  = isDesktop();
  const [showId, setShowId] = useState(false);

  const glare = useTransform(rotateY, [-7, 7], [
    "radial-gradient(ellipse at 15% 50%,rgba(255,255,255,0.06) 0%,transparent 55%)",
    "radial-gradient(ellipse at 85% 50%,rgba(255,255,255,0.06) 0%,transparent 55%)",
  ]);

  const handleMouseMove = (e) => {
    if (!desktop || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rotateX.set(-((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 6);
    rotateY.set(  ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 6);
  };
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0); };

  const DARK   = "linear-gradient(160deg,#0d0b1e 0%,#140f2a 50%,#0f0c1e 100%)";
  const idStr  = (ticketId || "").toString().toUpperCase();
  const idMask = idStr.length > 8 ? idStr.slice(0, 8) + "••••••••" : "••••••••";

  return (
    <motion.div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ width: "100%", maxWidth: desktop ? "420px" : "100%", margin: "0 auto", rotateX, rotateY, transformStyle: "preserve-3d", filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.06))" }}>

      {/* Top half */}
      <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none" }}>
        <div style={{ height: "200px", position: "relative" }}>
          <EventImageHeader image={ev?.image} />
          <motion.div style={{ position: "absolute", inset: 0, background: glare, pointerEvents: "none", zIndex: 3 }} />
          <div style={{ position: "absolute", top: "14px", left: "14px", right: "14px", display: "flex", justifyContent: "space-between", zIndex: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(124,58,237,0.72)", backdropFilter: "blur(12px)", border: "1px solid rgba(124,58,237,0.35)", padding: "4px 10px", borderRadius: "99px" }}>
              <span style={{ fontSize: "9px" }}>⛓️</span>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>NFT · POLYGON</span>
            </div>
            {ev?.category && (
              <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "99px", fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {ev.category}
              </div>
            )}
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(18px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "13px 16px 15px" }}>
            <div style={{ fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "2px", marginBottom: "5px" }}>YOUR TICKET</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "17px", lineHeight: 1.2, marginBottom: "4px" }}>{ev?.name || "Event Ticket"}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>📍 {ev?.venue || "Venue TBA"}</div>
          </div>
        </div>
        <div style={{ background: DARK, display: "flex", justifyContent: "space-around", padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[["DATE", ev?.date || "TBA"], ["TIME", ev?.time ? ev.time.substring(0, 5) : "TBA"], ["QTY", String(quantity || 1)]].map(([label, val], i) => (
            <React.Fragment key={label}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "5px" }}>{label}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{val}</div>
              </div>
              {i < 2 && <div style={{ width: "1px", background: "rgba(255,255,255,0.07)" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Perforated divider */}
      <div style={{ background: DARK, borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <PerforatedLine />
      </div>

      {/* Bottom half */}
      <div style={{ background: DARK, borderRadius: "0 0 20px 20px", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none", padding: "18px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        {/* Owner */}
        <div style={{ width: "100%", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar seed={ownerName} name={ownerName} size={26} style={{ border: "2px solid #16a34a", flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.5px", textTransform: "uppercase" }}>Verified Owner</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>{ownerName}</div>
          </div>
          <span style={{ color: "#4ade80", fontSize: "14px" }}>✓</span>
        </div>

        {/* QR */}
        {qrSrc ? (
          <div style={{ position: "relative" }}>
            {(!qrLoaded && !qrError) && (
              <div style={{ width: "160px", height: "160px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", position: "absolute", top: 0, left: 0 }} className="skeleton" />
            )}
            <AnimatePresence>
              {refreshing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: "absolute", inset: 0, background: "rgba(13,11,30,0.92)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, gap: "6px" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ fontSize: "20px" }}>🔄</motion.div>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Refreshing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ padding: "10px", background: "#fff", borderRadius: "16px", boxShadow: isExpiringSoon ? "0 0 0 2px #ef4444,0 8px 32px rgba(239,68,68,0.4)" : "0 0 0 2px rgba(74,222,128,0.7),0 8px 32px rgba(74,222,128,0.25)", transition: "box-shadow 0.5s" }}>
              <img src={qrSrc} alt="QR Code"
                onLoad={() => setQrLoaded(true)} onError={() => setQrError(true)}
                style={{ width: "140px", height: "140px", display: qrError ? "none" : "block", borderRadius: "8px" }} />
              {qrError && (
                <div style={{ width: "140px", height: "140px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>📱</span>
                  <span style={{ fontSize: "10px", color: "#999" }}>QR unavailable</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ width: "160px", height: "160px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: "24px" }}>⏳</motion.div>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>Generating QR...</span>
          </div>
        )}

        {/* QR countdown */}
        {status === "active" && (
          <div style={{ width: "160px" }}>
            <div style={{ height: "2px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden", marginBottom: "7px" }}>
              <motion.div key={timeLeft} initial={{ width: "100%" }} animate={{ width: (timeLeft / 10 * 100) + "%" }} transition={{ duration: 1, ease: "linear" }}
                style={{ height: "100%", background: isExpiringSoon ? "#ef4444" : "#4ade80", borderRadius: "2px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "center" }}>
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: progressColor }} />
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>QR refreshes in {timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Ticket ID */}
        <div style={{ textAlign: "center" }}>
          <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowId(s => !s)}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "6px 14px", borderRadius: "99px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>{showId ? idStr : idMask}</span>
            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)" }}>{showId ? "🙈" : "👁"}</span>
          </motion.div>
          {showId && <div style={{ fontSize: "9px", color: "rgba(245,166,35,0.6)", marginTop: "4px" }}>Only share with door staff if QR unavailable</div>}
        </div>

        {/* Blockchain */}
        <div style={{ width: "100%", background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "11px" }}>⛓️</span>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#a78bfa" }}>Polygon</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", marginTop: "1px", fontFamily: MONO }}>{tokenId ? `NFT #${tokenId}` : "Minting..."}</div>
            </div>
          </div>
          {txHash ? (
            <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer"
              style={{ fontSize: "10px", fontWeight: 600, color: "#a78bfa", textDecoration: "none", background: "rgba(124,58,237,0.15)", padding: "3px 8px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.25)" }}>
              Verify ↗
            </a>
          ) : (
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontSize: "10px", color: "#a78bfa", background: "rgba(124,58,237,0.1)", padding: "3px 8px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.2)" }}>
              Minting...
            </motion.div>
          )}
        </div>

        {status === "active" && (
          <div style={{ width: "100%", padding: "12px 14px", background: `rgba(249,115,22,0.06)`, border: `1px solid rgba(249,115,22,0.2)`, borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🎪</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: BRAND }}>Show at the Gate</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>Present this QR to door staff for entry</div>
            </div>
          </div>
        )}

        {status === "redeemed" && (
          <div style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(74,222,128,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>✅</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80" }}>Ticket Used</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>Scanned at gate</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAYMENT SUCCESS — fintech confirmation screen
// ═══════════════════════════════════════════════════════════════
export function PaymentSuccess() {
  const setScreen     = useStore(s => s.setScreen);
  const setActiveTab  = useStore(s => s.setActiveTab);
  const viewingTicket = useStore(s => s.viewingTicket);
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const desktop = isDesktop();
  const event   = viewingTicket?.event || checkoutEvent;

  return (
    <div style={{ background: T.bg, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: desktop ? "40px" : "20px", fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 26 }}
        style={{ width: "100%", maxWidth: "460px" }}>

        {/* Success card */}
        <div style={{ background: T.card, borderRadius: "24px", padding: desktop ? "44px 40px" : "32px 24px", border: `1px solid ${T.border}`, boxShadow: T.shadowLg, marginBottom: "12px" }}>

          {/* Animated check */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
              style={{ width: "72px", height: "72px", borderRadius: "50%", background: `linear-gradient(135deg,${GREEN},#16a34a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 20px", boxShadow: `0 8px 32px rgba(34,197,94,0.4)` }}>
              ✅
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: T.text, letterSpacing: "-0.5px", margin: "0 0 6px" }}>Payment Confirmed</h2>
              <p style={{ color: T.muted, fontSize: "14px", margin: 0, lineHeight: 1.6 }}>Your NFT ticket is being minted on Polygon</p>
            </motion.div>
          </div>

          {/* Amount pill */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            style={{ background: `linear-gradient(135deg,${BRAND}10,${BRAND}05)`, border: `1px solid ${BRAND}20`, borderRadius: "16px", padding: "16px 20px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: T.muted, letterSpacing: "1px", marginBottom: "6px", fontFamily: MONO }}>AMOUNT PAID</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: BRAND, letterSpacing: "-1px" }}>
              GHS {event?.price ? Math.round(parseFloat(event.price) * 1.05).toLocaleString() : "—"}
            </div>
          </motion.div>

          {/* Event info */}
          {event && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: T.subtle, borderRadius: "14px", padding: "16px", marginBottom: "20px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: T.muted, letterSpacing: "1.2px", marginBottom: "8px", fontFamily: MONO }}>EVENT</div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: T.text, marginBottom: "5px" }}>{event.name}</div>
              <div style={{ fontSize: "12px", color: T.muted }}>📅 {event.date} · 📍 {event.venue}</div>
            </motion.div>
          )}

          {/* Chain strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ marginBottom: "24px" }}>
            <ChainStrip txHash={viewingTicket?.nft_tx_hash} tokenId={viewingTicket?.nft_token_id} />
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
            {["🔒 Secured","⛓️ On-chain","📱 Instant"].map(b => (
              <div key={b} style={{ fontSize: "11px", color: T.muted }}>{b}</div>
            ))}
          </motion.div>

          <PrimaryBtn onClick={() => setScreen("ticketView")}>View My Ticket →</PrimaryBtn>
        </div>

        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Back to Events</GhostBtn>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CHECKOUT — fintech payment screen
// ═══════════════════════════════════════════════════════════════
export function Checkout() {
  const checkoutEvent   = useStore(s => s.checkoutEvent);
  const ticketQty       = useStore(s => s.ticketQty);
  const payMethod       = useStore(s => s.payMethod);
  const setTicketQty    = useStore(s => s.setTicketQty);
  const setPayMethod    = useStore(s => s.setPayMethod);
  const handleBuyTicket = useStore(s => s.handleBuyTicket);
  const setScreen       = useStore(s => s.setScreen);
  const currentUser     = useStore(s => s.currentUser);

  const [paying,   setPaying]   = useState(false);
  const [payError, setPayError] = useState("");
  const desktop = isDesktop();

  if (!checkoutEvent) return null;

  const unitPrice = Math.round(parseFloat(checkoutEvent.price) || 0);
  const qty       = Math.max(1, parseInt(ticketQty) || 1);
  const subtotal  = unitPrice * qty;
  const fee       = Math.round(subtotal * 0.05);
  const total     = subtotal + fee;
  const isFree    = unitPrice === 0;

  const onPay = async () => {
    if (paying) return;
    setPayError(""); setPaying(true);

    if (isFree) {
      try { await handleBuyTicket("FREE-" + Date.now()); }
      catch { setPayError("Something went wrong. Please try again."); setPaying(false); }
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        if (window.PaystackPop) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://js.paystack.co/v1/inline.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    } catch { setPayError("Failed to load payment gateway."); setPaying(false); return; }

    let accessCode, payRef;
    try {
      const token = localStorage.getItem("access_token") || "";
      const initRes = await fetch(`${API}/api/payments/initialize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ amount: total, event_id: checkoutEvent.id, event_name: checkoutEvent.name, quantity: qty }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData.access_code) { setPayError(initData.error || "Failed to initialize payment."); setPaying(false); return; }
      accessCode = initData.access_code;
      payRef     = initData.reference;
    } catch { setPayError("Connection error initializing payment."); setPaying(false); return; }

    const doHandle = (() => {
      let called = false;
      return (ref) => {
        if (called) return; called = true;
        const tid = setTimeout(() => { setPaying(false); setPayError("Payment received — your ticket will appear in My Tickets shortly."); }, 90000);
        handleBuyTicket(ref).then(() => { clearTimeout(tid); setPaying(false); }).catch(() => { clearTimeout(tid); setPaying(false); });
      };
    })();

    const openPaystack = () => {
      try {
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
          email: currentUser?.email || "",
          amount: total * 100, currency: "GHS",
          channels: ["mobile_money", "card"],
          ref: payRef, access_code: accessCode,
          onClose: () => setPaying(false),
          callback: (r) => doHandle(r.reference || payRef),
        });
        handler.openIframe();
      } catch {
        window.open(`https://checkout.paystack.com/${accessCode}`, "_blank");
        setTimeout(() => { setPaying(false); setPayError("Complete payment in the new tab, then check My Tickets."); }, 3000);
      }
    };

    try {
      window.PaystackPop.resumeTransaction(accessCode, { onClose: () => setPaying(false), callback: (r) => doHandle(r.reference || payRef) });
    } catch { openPaystack(); }
  };

  return (
    <div style={{ background: T.bg, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: FONT }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: `1px solid ${T.border}`, background: T.card, flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: T.subtle, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: T.text, flexShrink: 0 }}>←</motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>Checkout</div>
          <div style={{ fontSize: "11px", color: T.muted, marginTop: "1px" }}>NFT ticket minted after payment</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "99px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", flexShrink: 0 }}>
          <span style={{ color: GREEN, fontSize: "10px" }}>🔒</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: GREEN, fontFamily: MONO }}>SECURED</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "600px" : "100%", margin: "0 auto", padding: desktop ? "28px 40px 80px" : "20px 16px 100px" }}>

          {/* Event banner */}
          <div style={{ borderRadius: "18px", overflow: "hidden", marginBottom: "20px", boxShadow: T.shadowMd }}>
            <div style={{ height: "120px", position: "relative" }}>
              {checkoutEvent.image
                ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${BRAND},${BRAND_D})` }} />
              }
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent,rgba(0,0,0,0.75))" }} />
              <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px", marginBottom: "3px", letterSpacing: "-0.3px" }}>{checkoutEvent.name}</div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontFamily: MONO }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
              </div>
            </div>
          </div>

          {/* Quantity */}
          {!isFree && (
            <div style={{ background: T.card, borderRadius: "16px", padding: "18px 20px", marginBottom: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: T.muted, letterSpacing: "1.2px", fontFamily: MONO, marginBottom: "14px" }}>QUANTITY</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.max(1, qty - 1))}
                  style={{ width: "44px", height: "44px", borderRadius: "12px", background: T.subtle, color: T.text, border: `1.5px solid ${T.border}`, fontSize: "22px", fontWeight: 500, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center" }}>−</motion.button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: "30px", fontWeight: 900, color: T.text, letterSpacing: "-1px" }}>{qty}</span>
                  <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>× GHS {unitPrice} each</div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.min(10, qty + 1))}
                  style={{ width: "44px", height: "44px", borderRadius: "12px", background: T.subtle, color: T.text, border: `1.5px solid ${T.border}`, fontSize: "22px", fontWeight: 500, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center" }}>+</motion.button>
              </div>
            </div>
          )}

          {/* Payment method */}
          {!isFree && (
            <div style={{ background: T.card, borderRadius: "16px", padding: "18px 20px", marginBottom: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: T.muted, letterSpacing: "1.2px", fontFamily: MONO, marginBottom: "14px" }}>PAYMENT METHOD</div>
              <div style={{ display: "flex", gap: "10px" }}>
                {[["momo","📱","Mobile Money"],["card","💳","Card"]].map(([id, icon, label]) => (
                  <motion.button key={id} whileTap={{ scale: 0.96 }} onClick={() => setPayMethod(id)}
                    style={{ flex: 1, padding: "14px 10px", borderRadius: "14px", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: FONT, border: payMethod === id ? `2px solid ${BRAND}` : `1.5px solid ${T.border}`, background: payMethod === id ? `${BRAND}10` : T.subtle, color: payMethod === id ? BRAND : T.sub, transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "20px" }}>{icon}</span>
                    <span>{label}</span>
                  </motion.button>
                ))}
              </div>
              <div style={{ fontSize: "11px", color: T.muted, marginTop: "12px", lineHeight: 1.6 }}>
                {payMethod === "momo"
                  ? "Select your network (MTN, Telecel, AirtelTigo) on the secure Paystack screen."
                  : "Enter your card details on the secure Paystack screen."}
              </div>
            </div>
          )}

          {/* Order summary */}
          <div style={{ background: T.card, borderRadius: "16px", padding: "18px 20px", marginBottom: "20px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: T.muted, letterSpacing: "1.2px", fontFamily: MONO, marginBottom: "16px" }}>ORDER SUMMARY</div>
            {isFree ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: T.sub }}>1 × Free ticket</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: GREEN }}>FREE</span>
              </div>
            ) : (
              <>
                {[
                  [`${qty} ticket${qty > 1 ? "s" : ""}`, `GHS ${subtotal.toLocaleString()}`],
                  ["Platform fee (5%)", `GHS ${fee.toLocaleString()}`],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", marginBottom: "12px", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: T.muted, fontSize: "14px" }}>{k}</span>
                    <span style={{ color: T.sub, fontSize: "14px", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: "15px" }}>Total</span>
                  <span style={{ color: BRAND, fontWeight: 900, fontSize: "28px", letterSpacing: "-1px" }}>GHS {total.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {payError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: RED, fontSize: "13px", lineHeight: 1.5 }}>
                ⚠️ {payError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pay button */}
          <PrimaryBtn onClick={onPay} loading={paying} disabled={paying}>
            {paying ? "Processing..." : isFree ? "Get Free Ticket" : `Pay GHS ${total.toLocaleString()} →`}
          </PrimaryBtn>

          {/* Trust row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
            {["🔒 Secured by Paystack", "⛓️ NFT on Polygon", "📱 MoMo & Card"].map(b => (
              <span key={b} style={{ fontSize: "10px", color: T.muted }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TICKET VIEW
// ═══════════════════════════════════════════════════════════════
export function TicketView() {
  const viewingTicket     = useStore(s => s.viewingTicket);
  const setScreen         = useStore(s => s.setScreen);
  const setActiveTab      = useStore(s => s.setActiveTab);
  const setResaleTicket   = useStore(s => s.setResaleTicket);
  const setResalePrice    = useStore(s => s.setResalePrice);
  const setResaleError    = useStore(s => s.setResaleError);
  const setTransferTicket = useStore(s => s.setTransferTicket);
  const setTransferEmail  = useStore(s => s.setTransferEmail);
  const setTransferName   = useStore(s => s.setTransferName);
  const setTransferDone   = useStore(s => s.setTransferDone);
  const currentUser       = useStore(s => s.currentUser);

  const [dynamicQR,    setDynamicQR]    = useState(viewingTicket?.dynamic_qr || null);
  const [timeLeft,     setTimeLeft]     = useState(10);
  const [qrLoaded,     setQrLoaded]     = useState(false);
  const [qrError,      setQrError]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const desktop = isDesktop();

  useEffect(() => {
    if (!viewingTicket?.ticket_id) return;
    const tick = () => {
      const sLeft = 10 - (Math.floor(Date.now() / 1000) % 10);
      setTimeLeft(sLeft);
      if (sLeft === 10) {
        setRefreshing(true); setQrLoaded(false);
        ticketsAPI.myTickets().then(data => {
          if (Array.isArray(data)) {
            const updated = data.find(t => t.ticket_id === viewingTicket.ticket_id);
            if (updated?.dynamic_qr) setDynamicQR(updated.dynamic_qr);
          }
          setRefreshing(false);
        }).catch(() => setRefreshing(false));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [viewingTicket?.ticket_id]);

  if (!viewingTicket) return null;
  const ev = viewingTicket.event;
  const ownerName = viewingTicket.owner ||
    `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() ||
    currentUser?.email || "Ticket Holder";
  const qrSrc = dynamicQR
    ? "data:image/png;base64," + dynamicQR
    : viewingTicket.qr_image_url
    || (viewingTicket.qr_image
        ? (viewingTicket.qr_image.startsWith("http") ? viewingTicket.qr_image : API + viewingTicket.qr_image)
        : null);
  const isExpiringSoon = timeLeft <= 3;
  const progressColor  = isExpiringSoon ? "#ef4444" : "#4ade80";

  return (
    <div style={{ background: T.bg, height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: desktop ? "40px" : "100px", fontFamily: FONT }}>
      <div style={{ padding: "16px 16px 0", maxWidth: desktop ? "520px" : "100%", margin: "0 auto" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "13px", fontWeight: 500, padding: "6px 0", fontFamily: FONT }}>
          ← My Tickets
        </motion.button>
      </div>

      <div style={{ padding: "16px", perspective: "1200px" }}>
        <PremiumTicket ev={ev} ownerName={ownerName} qrSrc={qrSrc} qrLoaded={qrLoaded} qrError={qrError}
          refreshing={refreshing} setQrLoaded={setQrLoaded} setQrError={setQrError}
          timeLeft={timeLeft} isExpiringSoon={isExpiringSoon} progressColor={progressColor}
          ticketId={viewingTicket.ticket_id || viewingTicket.id}
          txHash={viewingTicket.nft_tx_hash} tokenId={viewingTicket.nft_token_id}
          status={viewingTicket.status} quantity={viewingTicket.quantity || viewingTicket.qty} />
      </div>

      {/* Security accordion */}
      <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: "0 16px 10px" }}>
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowSecurity(!showSecurity)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", marginBottom: "10px", boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>🛡️</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: T.sub }}>Security & Verification</span>
          </div>
          <motion.span animate={{ rotate: showSecurity ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: "11px", color: T.muted }}>▼</motion.span>
        </motion.div>
        <AnimatePresence>
          {showSecurity && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden", marginBottom: "10px" }}>
              <SecurityFeatures />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {viewingTicket.status === "active" && (
        <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: "0 16px 10px", display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            style={{ flex: 1, padding: "13px", background: `${BRAND}10`, color: BRAND, border: `1px solid ${BRAND}25`, borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
            🏷️ Resell
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            style={{ flex: 1, padding: "13px", background: T.subtle, color: T.sub, border: `1px solid ${T.border}`, borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
            ↗ Transfer
          </motion.button>
        </div>
      )}

      <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: "0 16px 20px" }}>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Done</GhostBtn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RESALE
// ═══════════════════════════════════════════════════════════════
export function Resale() {
  const resaleTicket        = useStore(s => s.resaleTicket);
  const resalePrice         = useStore(s => s.resalePrice);
  const resaleError         = useStore(s => s.resaleError);
  const setResalePrice      = useStore(s => s.setResalePrice);
  const handleListForResale = useStore(s => s.handleListForResale);
  const setScreen           = useStore(s => s.setScreen);
  const desktop = isDesktop();

  if (!resaleTicket) return null;
  const ev     = resaleTicket.event;
  const price  = parseFloat(resalePrice) || 0;
  const fee    = Math.round(price * 0.02 * 100) / 100;
  const payout = Math.round((price - fee) * 100) / 100;

  return (
    <div style={{ background: T.bg, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: `1px solid ${T.border}`, background: T.card, flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: T.subtle, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: T.text, flexShrink: 0 }}>←</motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>List for Resale</div>
          <div style={{ fontSize: "11px", color: T.muted }}>NFT ownership transfers on-chain automatically</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "480px" : "100%", margin: "0 auto", padding: desktop ? "28px 40px 80px" : "20px 16px 80px" }}>

          {/* Event info */}
          <div style={{ background: T.card, borderRadius: "16px", padding: "16px 18px", marginBottom: "16px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
            <div style={{ fontWeight: 700, fontSize: "15px", color: T.text, marginBottom: "4px" }}>{ev.name}</div>
            <div style={{ fontSize: "12px", color: T.muted, fontFamily: MONO }}>Original: GHS {ev.price} · Max resale: GHS {ev.price - 1}</div>
          </div>

          {/* Fee info */}
          <div style={{ background: `${BRAND}08`, border: `1px solid ${BRAND}20`, borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>💰</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: BRAND }}>2% Platform Fee</div>
              <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>You keep 98% of the resale price</div>
            </div>
          </div>

          {/* Price input */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>RESALE PRICE (GHS)</div>
            <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
              placeholder={`Max GHS ${ev.price - 1}`}
              style={{ ...INP(!!resaleError), fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: resaleError ? "6px" : "14px" }}
              onFocus={focusIn} onBlur={blurIn} />
            <AnimatePresence>
              {resaleError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: RED, fontSize: "12px", marginBottom: "14px" }}>{resaleError}</motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payout breakdown */}
          {price > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: T.card, borderRadius: "14px", padding: "16px 18px", marginBottom: "20px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "12px" }}>PAYOUT BREAKDOWN</div>
              {[
                ["Listing Price", `GHS ${price}`, T.text],
                ["Platform Fee (2%)", `− GHS ${fee}`, RED],
                ["Your Payout", `GHS ${payout}`, GREEN],
              ].map(([k, v, c], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ color: T.muted, fontSize: "13px" }}>{k}</span>
                  <span style={{ color: c, fontWeight: i === 2 ? 700 : 400, fontSize: "13px" }}>{v}</span>
                </div>
              ))}
            </motion.div>
          )}

          <PrimaryBtn onClick={handleListForResale}>List for Resale</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RESALE SUCCESS
// ═══════════════════════════════════════════════════════════════
export function ResaleSuccess() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const desktop = isDesktop();

  return (
    <div style={{ background: T.bg, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: desktop ? "40px" : "20px", fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 26 }}
        style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ background: T.card, borderRadius: "24px", padding: desktop ? "44px 40px" : "32px 24px", border: `1px solid ${T.border}`, boxShadow: T.shadowLg, marginBottom: "12px", textAlign: "center" }}>
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
            style={{ width: "68px", height: "68px", borderRadius: "20px", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px", boxShadow: `0 8px 32px ${BRAND}40` }}>
            🏷️
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.5px", margin: "0 0 8px" }}>Listed for Resale</h2>
            <p style={{ color: T.muted, fontSize: "13px", lineHeight: 1.7, margin: "0 0 28px" }}>
              Your ticket is now on the marketplace. NFT ownership transfers automatically when someone buys it.
            </p>
          </motion.div>
          <PrimaryBtn onClick={() => { setScreen("app"); setActiveTab("tickets"); }}>View My Tickets</PrimaryBtn>
        </div>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Browse Events</GhostBtn>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TRANSFER
// ═══════════════════════════════════════════════════════════════
export function Transfer() {
  const transferTicket   = useStore(s => s.transferTicket);
  const transferEmail    = useStore(s => s.transferEmail);
  const transferName     = useStore(s => s.transferName);
  const transferDone     = useStore(s => s.transferDone);
  const setTransferEmail = useStore(s => s.setTransferEmail);
  const setTransferName  = useStore(s => s.setTransferName);
  const handleTransfer   = useStore(s => s.handleTransfer);
  const setScreen        = useStore(s => s.setScreen);
  const setActiveTab     = useStore(s => s.setActiveTab);
  const [transferring, setTransferring] = useState(false);
  const desktop = isDesktop();

  if (!transferTicket) return null;
  const ev = transferTicket.event;

  const onTransfer = async () => { setTransferring(true); await handleTransfer(); setTransferring(false); };

  if (transferDone) return (
    <div style={{ background: T.bg, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: desktop ? "40px" : "20px", fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 26 }}
        style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ background: T.card, borderRadius: "24px", padding: desktop ? "44px 40px" : "32px 24px", border: `1px solid ${T.border}`, boxShadow: T.shadowLg, marginBottom: "12px", textAlign: "center" }}>
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
            style={{ width: "68px", height: "68px", borderRadius: "50%", background: `linear-gradient(135deg,${GREEN},#16a34a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(34,197,94,0.4)" }}>
            ✓
          </motion.div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.5px", margin: "0 0 8px" }}>Ticket Transferred</h2>
          <p style={{ color: T.muted, fontSize: "13px", lineHeight: 1.7, margin: "0 0 28px" }}>
            NFT ownership of <strong style={{ color: T.text }}>{ev.name}</strong> has been sent to{" "}
            <span style={{ color: BRAND, fontWeight: 600 }}>{transferName || transferEmail}</span>.
          </p>
          <PrimaryBtn onClick={() => { setScreen("app"); setActiveTab("tickets"); }}>My Tickets</PrimaryBtn>
        </div>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Browse Events</GhostBtn>
      </motion.div>
    </div>
  );

  return (
    <div style={{ background: T.bg, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: `1px solid ${T.border}`, background: T.card, flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: T.subtle, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: T.text, flexShrink: 0 }}>←</motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>Transfer Ticket</div>
          <div style={{ fontSize: "11px", color: T.muted }}>Permanent on-chain ownership transfer · Free</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "480px" : "100%", margin: "0 auto", padding: desktop ? "28px 40px 80px" : "20px 16px 80px" }}>

          {/* Notes */}
          <div style={{ background: T.card, borderRadius: "16px", padding: "16px 18px", marginBottom: "20px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "12px" }}>BEFORE YOU TRANSFER</div>
            {[
              ["⛓️","NFT ownership moves to recipient on Polygon"],
              ["🚫","Your QR code becomes invalid instantly"],
              ["💸","Free — no platform fee"],
              ["⚠️","Cannot be undone after confirmation"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
                <span style={{ fontSize: "12px", color: T.sub, lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Recipient fields */}
          <div style={{ marginBottom: "6px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>RECIPIENT NAME</div>
            <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)}
              style={INP(false)} onFocus={focusIn} onBlur={blurIn} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>RECIPIENT EMAIL</div>
            <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)}
              style={INP(false)} onFocus={focusIn} onBlur={blurIn} />
          </div>

          {/* Warning */}
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "24px", display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: "12px", color: RED, fontWeight: 500 }}>Double-check the email — this cannot be undone.</span>
          </div>

          <PrimaryBtn onClick={onTransfer} loading={transferring} color={PURPLE}>
            {transferring ? "Transferring..." : "Confirm Transfer →"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}