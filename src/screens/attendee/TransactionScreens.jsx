import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import { Avatar } from "../../utils/avatar";


const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const inp = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "var(--bg)", border: "1.5px solid var(--border)",
  borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
  caretColor: "var(--brand)",
};

const primaryBtn = {
  width: "100%", padding: "15px 20px",
  background: "var(--brand)",
  color: "#fff", border: "none", borderRadius: "12px",
  fontSize: "15px", fontWeight: 600, cursor: "pointer",
  boxShadow: "var(--shadow-brand)", marginBottom: "12px",
  fontFamily: "var(--font-sans)",
  transition: "all 0.15s ease",
};

function PageWrap({ children, maxW = "600px" }) {
  const desktop = isDesktop();
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "16px" }}>
      <div style={{ maxWidth: desktop ? maxW : "100%", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function ChainStrip({ txHash, tokenId }) {
  const url = txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;
  return (
    <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "13px" }}>⛓️</span>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Polygon Blockchain</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
            {tokenId ? `NFT #${tokenId}` : "Minting..."}
          </div>
        </div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed", textDecoration: "none", background: "rgba(124,58,237,0.08)", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap", border: "1px solid rgba(124,58,237,0.15)" }}>
          Verify ↗
        </a>
      ) : (
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: "11px", fontWeight: 500, color: "#7c3aed", background: "rgba(124,58,237,0.06)", padding: "4px 10px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.12)", whiteSpace: "nowrap" }}>
          Minting...
        </motion.div>
      )}
    </div>
  );
}

function SecurityFeatures() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      {[
        ["🔐", "HMAC Secured",    "Rotates every 10s"],
        ["📵", "Screenshot-proof","Dynamic QR only"],
        ["⛓️", "NFT Ownership",   "On Polygon chain"],
        ["🚫", "Single-use scan", "Auto-invalidates"],
      ].map(([icon, title, sub]) => (
        <div key={title} style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "10px 12px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "15px", marginBottom: "4px" }}>{icon}</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Event image header — clear, not blurred ───────────────────
function EventImageHeader({ image, category }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {image ? (
        <img
          src={image}
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      ) : (
        // Fallback gradient when no image
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #1a0533 0%, #0d1b4b 50%, #0a0f1e 100%)",
        }} />
      )}
      {/* Dark overlay for text readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 100%)",
      }} />
      {/* Subtle purple orb on top — keeps the premium feel */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: "60%", height: "60%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
          filter: "blur(30px)", pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Perforated tear-line divider ───────────────────────────────
function PerforatedLine() {
  return (
    <div style={{ position: "relative", height: "30px" }}>
      <div style={{ position: "absolute", left: "-1px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", borderRadius: "50%", background: "var(--bg)", border: "1px solid rgba(255,255,255,0.08)", zIndex: 5 }} />
      <div style={{ position: "absolute", right: "-1px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", borderRadius: "50%", background: "var(--bg)", border: "1px solid rgba(255,255,255,0.08)", zIndex: 5 }} />
      <svg width="100%" height="30" style={{ position: "absolute", top: 0, left: 0 }}>
        <line x1="20" y1="15" x2="99%" y2="15" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="5 5" />
      </svg>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "99px", padding: "2px 10px", fontSize: "8px", fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", backdropFilter: "blur(4px)", whiteSpace: "nowrap" }}>
        · · · · · · · · · · · ·
      </div>
    </div>
  );
}

// ── Premium Layered Ticket Component ──────────────────────────
function PremiumTicket({ ev, ownerName, qrSrc, qrLoaded, qrError, refreshing, setQrLoaded, setQrError, timeLeft, isExpiringSoon, progressColor, ticketId, txHash, tokenId, status }) {
  const cardRef = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const desktop = isDesktop();

  const glare = useTransform(rotateY, [-7, 7], [
    "radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.06) 0%, transparent 55%)",
    "radial-gradient(ellipse at 85% 50%, rgba(255,255,255,0.06) 0%, transparent 55%)",
  ]);

  const handleMouseMove = (e) => {
    if (!desktop || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rotateX.set(-((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * 6);
    rotateY.set(  ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 6);
  };
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0); };

  const DARK = "linear-gradient(160deg, #0d0b1e 0%, #140f2a 50%, #0f0c1e 100%)";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "100%",
        maxWidth: desktop ? "420px" : "100%",
        margin: "0 auto",
        rotateX, rotateY,
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(255,255,255,0.06))",
        transition: "filter 0.3s",
      }}>

      {/* ── TOP HALF ── */}
      <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none" }}>

        {/* Event image hero — 200px tall, clear image */}
        <div style={{ height: "200px", position: "relative" }}>
          <EventImageHeader image={ev?.image} category={ev?.category} />

          {/* Glare overlay on tilt */}
          <motion.div style={{ position: "absolute", inset: 0, background: glare, pointerEvents: "none", zIndex: 3 }} />

          {/* Top badges */}
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

          {/* Frosted glass event info at bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "13px 16px 15px" }}>
            <div style={{ fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "2px", marginBottom: "5px", textTransform: "uppercase" }}>YOUR TICKET</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "17px", lineHeight: 1.2, marginBottom: "4px", textShadow: "0 1px 12px rgba(0,0,0,0.8)" }}>
              {ev?.name || "Event Ticket"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>
              📍 {ev?.venue || "Venue TBA"}
            </div>
          </div>
        </div>

        {/* Date / Time / Qty strip */}
        <div style={{ background: DARK, display: "flex", justifyContent: "space-around", padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            ["DATE", ev?.date || "TBA"],
            ["TIME", ev?.time ? ev.time.substring(0, 5) : "TBA"],
            ["QTY",  "1"],
          ].map(([label, val], i) => (
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

      {/* ── PERFORATED DIVIDER ── */}
      <div style={{ background: DARK, borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <PerforatedLine />
      </div>

      {/* ── BOTTOM HALF ── */}
      <div style={{ background: DARK, borderRadius: "0 0 20px 20px", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none", padding: "18px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>

        {/* Verified owner */}
        {/* Verified owner */}
        <div style={{ width: "100%", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            seed={ownerName}
            name={ownerName}
            size={26}
            style={{ border: "2px solid #16a34a", flexShrink: 0 }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.5px", textTransform: "uppercase" }}>Verified Owner</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>{ownerName}</div>
          </div>
          <span style={{ color: "#4ade80", fontSize: "14px" }}>✓</span>
        </div>

        {/* QR Code */}
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
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Refreshing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{
              padding: "10px", background: "#fff", borderRadius: "16px",
              boxShadow: isExpiringSoon
                ? "0 0 0 2px #ef4444, 0 8px 32px rgba(239,68,68,0.4), 0 0 80px rgba(239,68,68,0.12)"
                : "0 0 0 2px rgba(74,222,128,0.7), 0 8px 32px rgba(74,222,128,0.25), 0 0 80px rgba(74,222,128,0.08)",
              transition: "box-shadow 0.5s ease",
            }}>
              <img
                src={qrSrc} alt="QR Code"
                onLoad={() => setQrLoaded(true)}
                onError={() => setQrError(true)}
                style={{ width: "140px", height: "140px", display: qrError ? "none" : "block", borderRadius: "8px" }}
              />
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

        {/* QR countdown bar */}
        {status === "active" && (
          <div style={{ width: "160px" }}>
            <div style={{ height: "2px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden", marginBottom: "7px" }}>
              <motion.div
                key={timeLeft}
                initial={{ width: "100%" }}
                animate={{ width: (timeLeft / 10 * 100) + "%" }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ height: "100%", background: isExpiringSoon ? "#ef4444" : "#4ade80", borderRadius: "2px" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "center" }}>
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: progressColor }} />
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>QR refreshes in {timeLeft}s</span>
            </div>
          </div>
        )}

      {/* Ticket ID — masked, tap to reveal for offline fallback */}
        {(() => {
          const [showId, setShowId] = React.useState(false);
          const id = (ticketId || "").toString().toUpperCase();
          const masked = id.length > 8 ? id.slice(0, 8) + "••••••••" : "••••••••";
          return (
            <div style={{ textAlign: "center" }}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowId(s => !s)}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "6px 14px", borderRadius: "99px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>
                  {showId ? id : masked}
                </span>
                <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)" }}>
                  {showId ? "🙈" : "👁"}
                </span>
              </motion.div>
              {showId && (
                <div style={{ fontSize: "9px", color: "rgba(245,166,35,0.6)", marginTop: "4px" }}>
                  Only share with door staff if QR unavailable
                </div>
              )}
            </div>
          );
        })()}

        {/* Blockchain strip */}
        <div style={{ width: "100%", background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "11px" }}>⛓️</span>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#a78bfa" }}>Polygon</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", marginTop: "1px" }}>
                {tokenId ? `NFT #${tokenId}` : "Minting..."}
              </div>
            </div>
          </div>
          {txHash ? (
            <a href={`https://amoy.polygonscan.com/tx/${txHash}`}target="_blank" rel="noreferrer"
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

        {/* Show at Gate info — replaces the redeem button */}
        {status === "active" && (
          <div style={{ width: "100%", padding: "12px 14px", background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🎪</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623" }}>Show at the Gate</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                Present this QR to door staff for entry
              </div>
            </div>
          </div>
        )}

        {/* Redeemed state */}
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

// ── Payment Success ───────────────────────────────────────────
export function PaymentSuccess() {
  const setScreen     = useStore(s => s.setScreen);
  const setActiveTab  = useStore(s => s.setActiveTab);
  const viewingTicket = useStore(s => s.viewingTicket);
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const desktop = isDesktop();
  const event   = viewingTicket?.event || checkoutEvent;
  return (
    <PageWrap maxW="480px">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{ background: "var(--bg-card)", borderRadius: "20px", padding: desktop ? "40px 36px" : "28px 20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(22,163,74,0.3)" }}>✅</motion.div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Payment Successful</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Your ticket is confirmed. NFT minting on Polygon.</p>
        </div>
        {event && (
          <div style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "14px", marginBottom: "14px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Event</div>
            <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "3px" }}>{event.name}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>📅 {event.date} · 📍 {event.venue}</div>
          </div>
        )}
        <div style={{ marginBottom: "20px" }}>
          <ChainStrip txHash={viewingTicket?.nft_tx_hash} tokenId={viewingTicket?.nft_token_id} />
        </div>
        <button onClick={() => setScreen("ticketView")} style={{ ...primaryBtn, marginBottom: "10px" }}>View My Ticket</button>
        <button onClick={() => { setScreen("app"); setActiveTab("home"); }}
          style={{ width: "100%", padding: "13px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 500, fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Back to Events
        </button>
      </motion.div>
    </PageWrap>
  );
}

// ── MoMo network detection ────────────────────────────────────
const MOMO_NETWORKS = {
  MTN: {
    prefixes: ["024","054","055","059","025","053","023","020"],
    color: "#FFC107", bg: "rgba(255,193,7,0.1)", border: "rgba(255,193,7,0.3)",
    logo: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#FFC107"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: "10px", fontWeight: 900, fill: "#000", fontFamily: "sans-serif" }}>MTN</text>
      </svg>
    ),
    label: "MTN MoMo",
  },
  TELECEL: {
    prefixes: ["050","020"],
    color: "#E53935", bg: "rgba(229,57,53,0.1)", border: "rgba(229,57,53,0.3)",
    logo: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#E53935"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: "7px", fontWeight: 900, fill: "#fff", fontFamily: "sans-serif" }}>TELECEL</text>
      </svg>
    ),
    label: "Telecel Cash",
  },
  AIRTELTIGO: {
    prefixes: ["026","056","027","057"],
    color: "#1565C0", bg: "rgba(21,101,192,0.1)", border: "rgba(21,101,192,0.3)",
    logo: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1565C0"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: "6px", fontWeight: 900, fill: "#fff", fontFamily: "sans-serif" }}>AirtelTigo</text>
      </svg>
    ),
    label: "AirtelTigo Money",
  },
};

function detectNetwork(phone) {
  const cleaned = phone.replace(/\s/g, "").replace(/^(\+233|0{0})/, "0");
  if (cleaned.length < 3) return null;
  const prefix = cleaned.substring(0, 3);
  if (MOMO_NETWORKS.MTN.prefixes.includes(prefix))        return "MTN";
  if (MOMO_NETWORKS.TELECEL.prefixes.includes(prefix))    return "TELECEL";
  if (MOMO_NETWORKS.AIRTELTIGO.prefixes.includes(prefix)) return "AIRTELTIGO";
  return null;
}

function formatGhanaPhone(val) {
  const digits = val.replace(/\D/g, "").substring(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return digits.slice(0, 4) + " " + digits.slice(4);
  return digits.slice(0, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7);
}

function MoMoInput({ value, onChange }) {
  const network = detectNetwork(value);
  const net     = network ? MOMO_NETWORKS[network] : null;
  return (
    <div>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
        Mobile Money Number
      </label>
      <div style={{ position: "relative" }}>
        <input type="tel" value={value}
          onChange={e => onChange(formatGhanaPhone(e.target.value))}
          placeholder="e.g. 0244 000 000" maxLength={12}
          style={{ width: "100%", padding: net ? "14px 56px 14px 18px" : "14px 18px", background: net ? net.bg : "var(--bg)", border: "1.5px solid " + (net ? net.border : "var(--border)"), borderRadius: "14px", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", letterSpacing: "0.5px", transition: "border-color 0.2s, background 0.2s" }}
        />
        <AnimatePresence>
          {net && (
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
              {net.logo}
            </motion.div>
          )}
          {!net && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", pointerEvents: "none" }}>
              📱
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {net && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: net.color }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: net.color }}>{net.label} detected</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Checkout ──────────────────────────────────────────────────
export function Checkout() {
  const checkoutEvent   = useStore(s => s.checkoutEvent);
  const ticketQty       = useStore(s => s.ticketQty);
  const payMethod       = useStore(s => s.payMethod);
  const setTicketQty    = useStore(s => s.setTicketQty);
  const setPayMethod    = useStore(s => s.setPayMethod);
  const handleBuyTicket = useStore(s => s.handleBuyTicket);
  const setScreen       = useStore(s => s.setScreen);
  const currentUser     = useStore(s => s.currentUser);

  const [paying,    setPaying]    = useState(false);
  const [payError,  setPayError]  = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const desktop = isDesktop();

  if (!checkoutEvent) return null;

  const unitPrice = Math.round(parseFloat(checkoutEvent.price) || 0);
  const qty       = Math.max(1, parseInt(ticketQty) || 1);
  const subtotal  = unitPrice * qty;
  const fee       = Math.round(subtotal * 0.05);
  const total     = subtotal + fee;

  const onPay = async () => {
    if (paying) return;
    setPayError(""); setPaying(true);

    if (unitPrice === 0) {
      try { await handleBuyTicket("FREE-" + Date.now()); }
      catch { setPayError("Something went wrong. Please try again."); setPaying(false); }
      return;
    }
    if (total < 1) { setPayError("Invalid ticket price."); setPaying(false); return; }

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
      if (!initRes.ok || !initData.access_code) {
        setPayError(initData.error || "Failed to initialize payment.");
        setPaying(false); return;
      }
      accessCode = initData.access_code;
      payRef     = initData.reference;
    } catch { setPayError("Connection error initializing payment."); setPaying(false); return; }

   // ── In Checkout, replace the doHandle + PaystackPop block ──
// REPLACE WITH:
const doHandle = (() => {
  let called = false;
  return (ref) => {
    if (called) return;
    called = true;
    const tid = setTimeout(() => {
      setPaying(false);
      setPayError("Payment received — your ticket will appear in My Tickets shortly. Ref: " + ref);
    }, 90000);
    handleBuyTicket(ref)
      .then(() => { clearTimeout(tid); setPaying(false); })
      .catch(() => { clearTimeout(tid); setPaying(false); });
  };
})();

const openPaystack = () => {
  try {
    const handler = window.PaystackPop.setup({
      key:         import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
      email:       currentUser?.email || "",
      amount:      total * 100,
      currency:    "GHS",
      channels:    ["mobile_money", "card"],
      ref:         payRef,
      access_code: accessCode,
      onClose:     () => { setPaying(false); },
      callback:    (r) => { doHandle(r.reference || payRef); },
    });
    handler.openIframe();
  } catch {
    window.open(`https://checkout.paystack.com/${accessCode}`, "_blank");
    setTimeout(() => { setPaying(false); setPayError("Complete payment in the new tab, then check My Tickets."); }, 3000);
  }
};

try {
  window.PaystackPop.resumeTransaction(accessCode, {
    onClose:  () => { setPaying(false); },
    callback: (r) => { doHandle(r.reference || payRef); },
  });
} catch {
  openPaystack();
}
  };

  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0, zIndex: 10 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Secure Checkout</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>NFT ticket on Polygon after payment</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "99px", background: "var(--success-bg)", border: "1px solid rgba(22,163,74,0.15)", flexShrink: 0 }}>
          <span style={{ color: "#16a34a", fontSize: "10px" }}>🔒</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a" }}>Secured</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ maxWidth: desktop ? "640px" : "100%", margin: "0 auto", padding: desktop ? "28px 40px 80px" : "20px 20px 100px" }}>

          <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
            <div style={{ height: "130px", position: "relative" }}>
              {checkoutEvent.image
                ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "var(--brand)" }} />
              }
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))" }} />
              <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "17px", marginBottom: "3px" }}>{checkoutEvent.name}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantity</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.max(1, qty - 1))}
                style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--bg-subtle)", color: "var(--text-primary)", border: "1.5px solid var(--border)", fontSize: "22px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>−</motion.button>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", minWidth: "36px", textAlign: "center" }}>{qty}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.min(10, qty + 1))}
                style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--bg-subtle)", color: "var(--text-primary)", border: "1.5px solid var(--border)", fontSize: "22px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>+</motion.button>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Method</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[["momo","📱 Mobile Money"],["card","💳 Debit / Credit"]].map(([id, label]) => (
                <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setPayMethod(id)}
                  style={{ flex: 1, padding: "14px 10px", borderRadius: "14px", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "var(--font-sans)", border: payMethod === id ? "2px solid var(--brand)" : "1.5px solid var(--border)", background: payMethod === id ? "var(--brand-light)" : "var(--bg-subtle)", color: payMethod === id ? "var(--brand-dark)" : "var(--text-secondary)", transition: "all 0.15s" }}>
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {payMethod === "momo" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden", marginBottom: "20px" }}>
                <MoMoInput value={momoPhone} onChange={setMomoPhone} />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ background: "var(--bg-subtle)", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1.5px solid var(--border)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Summary</div>
            {[["Tickets", `${qty} × GHS ${unitPrice}`], ["Platform Fee (5%)", `GHS ${fee}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{k}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px" }}>Total</span>
              <span style={{ color: "var(--brand)", fontWeight: 800, fontSize: "26px", letterSpacing: "-0.5px" }}>GHS {total}</span>
            </div>
          </div>

          <AnimatePresence>
            {payError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", color: "var(--error)", fontSize: "13px", lineHeight: 1.5 }}>
                ⚠️ {payError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={!paying ? { scale: 1.02 } : {}}
            whileTap={!paying ? { scale: 0.97 } : {}}
            onClick={onPay} disabled={paying}
            style={{ width: "100%", padding: "17px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: paying ? "not-allowed" : "pointer", boxShadow: paying ? "none" : "var(--shadow-brand)", opacity: paying ? 0.85 : 1, fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}>
            {paying ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", flexShrink: 0 }} />
                Processing...
              </>
            ) : unitPrice === 0 ? "Get Free Ticket" : `Pay GHS ${total} →`}
          </motion.button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "14px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>🔒 Secured by</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>Paystack</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>· GHS payments only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ticket View ───────────────────────────────────────────────
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
    <div style={{ background: "var(--bg)", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: desktop ? "40px" : "100px" }}>
      <div style={{ padding: "16px 16px 0", maxWidth: desktop ? "520px" : "100%", margin: "0 auto" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, padding: "6px 0", fontFamily: "var(--font-sans)" }}>
          ← Back to Tickets
        </motion.button>
      </div>

      <div style={{ padding: "16px", perspective: "1200px" }}>
        <PremiumTicket
          ev={ev}
          ownerName={ownerName}
          qrSrc={qrSrc}
          qrLoaded={qrLoaded}
          qrError={qrError}
          refreshing={refreshing}
          setQrLoaded={setQrLoaded}
          setQrError={setQrError}
          timeLeft={timeLeft}
          isExpiringSoon={isExpiringSoon}
          progressColor={progressColor}
          ticketId={viewingTicket.ticket_id || viewingTicket.id}
          txHash={viewingTicket.nft_tx_hash}
          tokenId={viewingTicket.nft_token_id}
          status={viewingTicket.status}
        />
      </div>

      <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: "0 16px 8px" }}>
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowSecurity(!showSecurity)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px" }}>🛡️</span>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>Security & Verification</span>
          </div>
          <motion.span animate={{ rotate: showSecurity ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: "11px", color: "var(--text-muted)" }}>▼</motion.span>
        </motion.div>
        <AnimatePresence>
          {showSecurity && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: "10px" }}><SecurityFeatures /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {viewingTicket.status === "active" && (
        <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: "0 16px 10px", display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            style={{ flex: 1, padding: "12px", background: "var(--brand-light)", color: "var(--brand-dark)", border: "1px solid rgba(232,146,15,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            Resell
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            style={{ flex: 1, padding: "12px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            Transfer
          </motion.button>
        </div>
      )}

      <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: "0 16px 20px" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setScreen("app"); setActiveTab("home"); }}
          style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "10px", fontWeight: 500, cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-sans)" }}>
          Done
        </motion.button>
      </div>
    </div>
  );
}

// ── Resale ────────────────────────────────────────────────────
export function Resale() {
  const resaleTicket        = useStore(s => s.resaleTicket);
  const resalePrice         = useStore(s => s.resalePrice);
  const resaleError         = useStore(s => s.resaleError);
  const setResalePrice      = useStore(s => s.setResalePrice);
  const handleListForResale = useStore(s => s.handleListForResale);
  const setScreen           = useStore(s => s.setScreen);
  const desktop = isDesktop();
  if (!resaleTicket) return null;
  const ev    = resaleTicket.event;
  const price  = parseFloat(resalePrice) || 0;
  const fee    = Math.round(price * 0.02 * 100) / 100;
  const payout = Math.round((price - fee) * 100) / 100;
  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
          style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>List for Resale</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>NFT ownership transfers on-chain automatically</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 80px" }}>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{ev.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Original: GHS {ev.price} · Max resale: GHS {ev.price - 1}</div>
          </div>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>Platform fee</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>2% — you keep 98%</div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>Resale Price (GHS)</div>
            <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
              placeholder={"Max GHS " + (ev.price - 1)}
              style={{ ...inp, fontSize: "20px", fontWeight: 600, borderColor: resaleError ? "var(--error)" : "var(--border)", marginBottom: resaleError ? "6px" : 0 }} />
            <AnimatePresence>
              {resaleError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: "var(--error)", fontSize: "12px", marginTop: "4px" }}>{resaleError}</motion.div>
              )}
            </AnimatePresence>
          </div>
          {price > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              {[["Listing Price","GHS " + price,"var(--text-primary)"],["Platform Fee (2%)","− GHS " + fee,"var(--error)"],["Your Payout","GHS " + payout,"#16a34a"]].map(([k,v,c],i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{k}</span>
                  <span style={{ color: c, fontWeight: i === 2 ? 600 : 400, fontSize: "13px" }}>{v}</span>
                </div>
              ))}
            </motion.div>
          )}
          <button onClick={handleListForResale} style={{ ...primaryBtn, marginBottom: 0 }}>List for Resale</button>
        </div>
      </div>
    </div>
  );
}

// ── Resale Success ────────────────────────────────────────────
export function ResaleSuccess() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const desktop = isDesktop();
  return (
    <PageWrap maxW="440px">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "var(--bg-card)", borderRadius: "20px", padding: desktop ? "40px 36px" : "28px 20px", textAlign: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          style={{ width: "60px", height: "60px", borderRadius: "16px", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px", boxShadow: "var(--shadow-brand)" }}>🏷️</motion.div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Listed for Resale</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" }}>Your ticket is on the marketplace. NFT ownership transfers automatically when sold.</p>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={{ ...primaryBtn, marginBottom: 0 }}>View My Tickets</button>
      </motion.div>
    </PageWrap>
  );
}

// ── Transfer ──────────────────────────────────────────────────
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
    <PageWrap maxW="440px">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "var(--bg-card)", borderRadius: "20px", padding: desktop ? "40px 36px" : "28px 20px", textAlign: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 16px" }}>✓</motion.div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Ticket Transferred</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" }}>
          NFT ownership of <strong style={{ color: "var(--text-primary)" }}>{ev.name}</strong> sent to{" "}
          <span style={{ color: "var(--brand)", fontWeight: 600 }}>{transferName || transferEmail}</span>.
        </p>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={{ ...primaryBtn, marginBottom: 0 }}>Back to My Tickets</button>
      </motion.div>
    </PageWrap>
  );

  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
          style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Transfer Ticket</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Permanent on-chain ownership transfer · Free</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 80px" }}>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Note</div>
            {["NFT ownership moves to recipient on Polygon","Your QR becomes invalid instantly","Free — no platform fee","Cannot be undone after confirmation"].map((info, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < 3 ? "4px" : 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>·</span>
                <span>{info}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Recipient Name</div>
          <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={inp} />
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Recipient Email</div>
          <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={inp} />
          <div style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "var(--error)", fontWeight: 500 }}>⚠️ Double-check the email. This cannot be undone.</div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onTransfer} disabled={transferring}
            style={{ ...primaryBtn, background: "#7c3aed", marginBottom: 0, opacity: transferring ? 0.6 : 1 }}>
            {transferring ? "Transferring..." : "Confirm Transfer"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}