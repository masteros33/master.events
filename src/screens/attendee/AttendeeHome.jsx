import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const BRAND   = "#F97316";
const BRAND_D = "#EA6C0A";
const FONT    = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO    = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=1600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600",
};

const CATEGORIES = [
  { key: "all",      label: "All",      icon: "◈" },
  { key: "music",    label: "Music",    icon: "♪" },
  { key: "tech",     label: "Tech",     icon: "⌥" },
  { key: "food",     label: "Food",     icon: "◉" },
  { key: "arts",     label: "Arts",     icon: "◇" },
  { key: "sports",   label: "Sports",   icon: "◎" },
  { key: "business", label: "Business", icon: "▣" },
  { key: "other",    label: "Other",    icon: "◌" },
];

const ITEMS_PER_PAGE_DESKTOP = 9;
const ITEMS_PER_PAGE_MOBILE  = 6;
const isDesktop = () => window.innerWidth > 768;

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now    = new Date();
  now.setHours(0,0,0,0);
  return Math.round((target - now) / 86400000);
}

// ── Mobile Navbar ─────────────────────────────────────────────
function MobileNavbar({ scrolled }) {
  const setScreen  = useStore(s => s.setScreen);
  const isLoggedIn = useStore(s => s.isLoggedIn);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", height: "56px",
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      transition: "all 0.3s ease",
    }}>
      <motion.div
        animate={{ flex: scrolled ? 1 : 0, justifyContent: scrolled ? "center" : "flex-start" }}
        style={{ display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease" }}
      >
        <motion.div
          animate={{ x: scrolled ? 0 : 0 }}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            width: scrolled ? "100%" : "auto",
            justifyContent: scrolled ? "center" : "flex-start",
          }}
        >
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Master Events</span>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}
          >
            {!isLoggedIn && (
              <>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setScreen("login")}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap" }}>
                  Log in
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setScreen("signup")}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", boxShadow: `0 2px 8px ${BRAND}40` }}>
                  Sign up
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────
function EventCard({ ev, onClick }) {
  const [hovered, setHovered] = useState(false);
  const desktop = isDesktop();

  const organizerName = ev.organizerName || ev.organizer_name || ev.organizer || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        overflow: "hidden",
        border: hovered ? `1px solid ${BRAND}80` : "1px solid var(--border)",
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hovered && desktop ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.14), 0 0 0 1px ${BRAND}25`
          : "var(--shadow-sm)",
      }}>

      <div style={{ height: desktop ? "220px" : "190px", position: "relative", overflow: "hidden" }}>
        <motion.img
          src={ev.image} alt={ev.name}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = categoryImages.other; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.62) 100%)" }} />
        <div style={{ position: "absolute", top: "11px", right: "11px", background: BRAND, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", letterSpacing: "0.5px", fontFamily: MONO }}>
          {ev.category.toUpperCase()}
        </div>
        {ev.price === 0 && (
          <div style={{ position: "absolute", top: "11px", left: "11px", background: "#16a34a", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", fontFamily: MONO }}>FREE</div>
        )}
        <div style={{ position: "absolute", bottom: "11px", left: "11px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "3px 8px", borderRadius: "99px" }}>
          <span style={{ fontSize: "8px" }}>⛓️</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: MONO }}>NFT</span>
        </div>
      </div>

      <div style={{ padding: "13px 15px 15px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "5px", lineHeight: 1.35, letterSpacing: "-0.2px" }}>
          {ev.name}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px", fontFamily: MONO }}>
          <span style={{ opacity: 0.6 }}>📍</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ev.venue} · {ev.date}
          </span>
        </div>

        {organizerName && (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: `${BRAND}0D`,
            border: `1px solid ${BRAND}20`,
            borderRadius: "6px", padding: "5px 9px", marginBottom: "10px",
          }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#fff", flexShrink: 0 }}>
              {organizerName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 600, color: BRAND, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {organizerName}
            </span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: BRAND, fontWeight: 800, fontSize: "17px", letterSpacing: "-0.5px" }}>
            {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
          </div>
          <motion.div animate={{ x: hovered ? 3 : 0 }} transition={{ duration: 0.18 }}
            style={{ fontSize: "11px", fontWeight: 600, color: hovered ? BRAND : "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", transition: "color 0.18s" }}>
            View <span>→</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", padding: "32px 0 8px" }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(current - 1)} disabled={current === 1}
        style={{ padding: "7px 14px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg-card)", color: current === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: current === 1 ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, opacity: current === 1 ? 0.4 : 1, fontFamily: MONO }}>
        ← PREV
      </motion.button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <motion.button key={p} whileTap={{ scale: 0.88 }} onClick={() => onChange(p)}
          style={{ width: "34px", height: "34px", borderRadius: "9px", border: p === current ? "none" : "1px solid var(--border)", background: p === current ? BRAND : "var(--bg-card)", color: p === current ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: p === current ? 700 : 500, fontFamily: MONO }}>
          {p}
        </motion.button>
      ))}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(current + 1)} disabled={current === total}
        style={{ padding: "7px 14px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg-card)", color: current === total ? "var(--text-muted)" : "var(--text-primary)", cursor: current === total ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, opacity: current === total ? 0.4 : 1, fontFamily: MONO }}>
        NEXT →
      </motion.button>
    </div>
  );
}

// ── Shared small pieces (matches PublicEventPage style) ───────
function TrustBadge({ icon, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
      <span style={{ fontSize:"13px" }}>{icon}</span>
      <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:500 }}>{label}</span>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
      <div style={{ width:"38px", height:"38px", borderRadius:"11px", background:"var(--bg-subtle)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:"9px", fontWeight:700, color:"var(--text-muted)", letterSpacing:"1.2px", marginBottom:"2px", fontFamily:MONO }}>{label}</div>
        <div style={{ fontSize:"14px", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis" }}>{value}</div>
      </div>
    </div>
  );
}

// ── Event Detail Overlay ──────────────────────────────────────
function EventDetailOverlay({ ev, onBack, onCheckout }) {
  const desktop    = isDesktop();
  const remaining  = ev.totalTickets - ev.ticketsSold;
  const soldPct    = Math.max(3, Math.min(100, ((ev.ticketsSold || 0) / (ev.totalTickets || 1)) * 100));
  const lowStock   = remaining > 0 && remaining <= Math.max(10, ev.totalTickets * 0.1);
  const isFree     = ev.price === 0;
  const daysLeft   = daysUntil(ev.date);

  if (!desktop) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: FONT }}>
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "84px" }}>
          <div style={{ height: "230px", position: "relative", overflow: "hidden" }}>
            <img src={ev.image} alt={ev.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { e.target.src = categoryImages.other; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.8) 100%)" }} />
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
              style={{ position: "absolute", top: "14px", left: "14px", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "#fff", zIndex: 10 }}>
              ←
            </motion.button>
            <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: "99px" }}>
              <span style={{ fontSize: "9px" }}>⛓️</span>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>NFT · POLYGON</span>
            </div>
            <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{ background: BRAND, color: "#fff", fontSize: "8px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", letterSpacing: "0.5px" }}>
                  {ev.category.toUpperCase()}
                </span>
                {daysLeft !== null && daysLeft >= 0 && (
                  <span style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.25)" }}>
                    {daysLeft === 0 ? "🔥 TODAY" : daysLeft === 1 ? "⏰ TOMORROW" : `⏰ IN ${daysLeft} DAYS`}
                  </span>
                )}
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: "22px", lineHeight: 1.1, letterSpacing: "-0.6px", textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}>{ev.name}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>📍 {ev.venue}{ev.city ? " · " + ev.city : ""}</div>
            </div>
          </div>

          <div style={{ padding: "18px 16px" }}>
            {ev.organizerName && (
              <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"14px", padding:"14px 16px", marginBottom:"16px" }}>
                <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", color:"#fff", fontWeight:700, flexShrink:0 }}>
                  {ev.organizerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text-muted)", fontFamily:MONO, letterSpacing:"1px" }}>HOSTED BY</div>
                  <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text-primary)" }}>{ev.organizerName}</div>
                </div>
              </div>
            )}

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", marginBottom: "16px" }}>
              <DetailRow icon="📅" label="DATE" value={ev.date || "TBA"} />
              <DetailRow icon="🕐" label="TIME" value={ev.time ? ev.time.substring(0,5) : "TBA"} />
              <DetailRow icon="🎟" label="AVAILABLE" value={`${remaining} of ${ev.totalTickets} left`} />
            </div>

            {ev.description?.trim() && (
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px", fontFamily: MONO }}>About</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.8 }}>{ev.description.trim()}</div>
              </div>
            )}

            <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "18px" }}>⛓️</span>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed" }}>Secured by Polygon Blockchain</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>NFT minted · Screenshot-proof · Cannot be duplicated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky mobile bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
          <div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", fontFamily: MONO, letterSpacing: "0.5px" }}>PRICE</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: isFree ? "#16a34a" : BRAND, letterSpacing: "-0.5px" }}>
              {isFree ? "FREE" : `GHS ${ev.price}`}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCheckout}
            disabled={remaining <= 0}
            style={{ flex: 1, maxWidth: "220px", padding: "14px", borderRadius: "12px", border: "none",
              background: remaining <= 0 ? "var(--bg-subtle)" : `linear-gradient(135deg,${BRAND},${BRAND_D})`,
              color: remaining <= 0 ? "var(--text-muted)" : "#fff",
              fontSize: "14px", fontWeight: 700, cursor: remaining <= 0 ? "not-allowed" : "pointer", fontFamily: FONT }}>
            {remaining <= 0 ? "Sold Out" : isFree ? "Get Free Ticket" : "Buy Ticket"}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Desktop overlay — fintech revamp ──────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ background: "var(--bg)", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", fontFamily: FONT }}>

      {/* Hero */}
      <div style={{ height: "360px", position: "relative", overflow: "hidden" }}>
        <motion.img initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.1, ease: "easeOut" }}
          src={ev.image} alt={ev.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.78) 100%)" }} />

        <motion.button whileTap={{ scale: 0.95 }} onClick={onBack}
          style={{ position: "absolute", top: "20px", left: "40px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9px", padding: "8px 16px", cursor: "pointer", color: "#fff", fontSize: "13px", fontWeight: 600, fontFamily: FONT }}>
          ← Back to Events
        </motion.button>

        <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
          <span style={{ background: BRAND, color: "#fff", fontSize: "10px", fontWeight: 700, padding: "5px 12px", borderRadius: "99px", letterSpacing: "0.5px", fontFamily: MONO }}>
            {ev.category.toUpperCase()}
          </span>
          {isFree && <span style={{ background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "5px 12px", borderRadius: "99px", fontFamily: MONO }}>FREE</span>}
          <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "5px 12px", borderRadius: "99px" }}>
            ⛓️ NFT · POLYGON
          </span>
          {daysLeft !== null && daysLeft >= 0 && (
            <span style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "5px 12px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.25)" }}>
              {daysLeft === 0 ? "🔥 TODAY" : daysLeft === 1 ? "⏰ TOMORROW" : `⏰ IN ${daysLeft} DAYS`}
            </span>
          )}
        </div>

        <div style={{ position: "absolute", bottom: "36px", left: "40px", right: "40px", maxWidth: "760px" }}>
          <h1 style={{ fontSize: "40px", fontWeight: 900, color: "#fff", letterSpacing: "-1.2px", lineHeight: 1.08, marginBottom: "10px", textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}>
            {ev.name}
          </h1>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.88)", display: "flex", flexWrap: "wrap", gap: "14px", fontWeight: 500 }}>
            <span>📅 {ev.date}{ev.time ? ` · ${ev.time.substring(0,5)}` : ""}</span>
            <span>📍 {ev.venue}{ev.city ? `, ${ev.city}` : ""}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 40px 80px", display: "flex", gap: "40px", alignItems: "flex-start" }}>

        <div style={{ flex: 1, minWidth: 0 }}>
          {ev.organizerName && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 18px", marginBottom: "20px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                {ev.organizerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: MONO, letterSpacing: "1px" }}>HOSTED BY</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{ev.organizerName}</div>
              </div>
            </div>
          )}

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
            <DetailRow icon="📅" label="WHEN" value={ev.date || "TBA"} />
            <DetailRow icon="🕐" label="TIME" value={ev.time ? ev.time.substring(0,5) : "TBA"} />
            <DetailRow icon="📍" label="WHERE" value={ev.venue || "TBA"} />
            <DetailRow icon="🎟" label="AVAILABLE" value={`${remaining} of ${ev.totalTickets} tickets left`} />
          </div>

          {ev.description?.trim() && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", fontFamily: MONO }}>About This Event</div>
              <div style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.85 }}>{ev.description.trim()}</div>
            </div>
          )}

          <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "22px" }}>⛓️</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>Secured by Polygon Blockchain</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Every ticket is minted as an NFT — screenshot-proof, cannot be duplicated or faked</div>
            </div>
          </div>
        </div>

        {/* Sticky ticket card */}
        <div style={{ width: "380px", flexShrink: 0, position: "sticky", top: "24px" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(0,0,0,0.08)", padding: "26px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "18px" }}>
              <div style={{ fontSize: "34px", fontWeight: 900, letterSpacing: "-1.5px", color: isFree ? "#16a34a" : BRAND, lineHeight: 1 }}>
                {isFree ? "FREE" : `GHS ${ev.price}`}
              </div>
              {!isFree && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>per ticket</span>}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", fontFamily: MONO, letterSpacing: "0.5px" }}>AVAILABILITY</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: lowStock ? "#dc2626" : "#16a34a", fontFamily: MONO }}>
                  {remaining <= 0 ? "SOLD OUT" : lowStock ? "ALMOST GONE" : "AVAILABLE"}
                </span>
              </div>
              <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${soldPct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: "99px", background: lowStock ? "linear-gradient(90deg,#dc2626,#ef4444)" : "linear-gradient(90deg,#16a34a,#22c55e)" }} />
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>
                {ev.ticketsSold || 0} sold · {Math.max(0, remaining)} remaining
              </div>
            </div>

            <motion.button whileHover={remaining > 0 ? { scale: 1.015 } : {}} whileTap={remaining > 0 ? { scale: 0.98 } : {}} onClick={onCheckout}
              disabled={remaining <= 0}
              style={{ width: "100%", padding: "17px", borderRadius: "14px", border: "none",
                background: remaining <= 0 ? "var(--bg-subtle)" : `linear-gradient(135deg,${BRAND},${BRAND_D})`,
                color: remaining <= 0 ? "var(--text-muted)" : "#fff",
                fontSize: "16px", fontWeight: 700, cursor: remaining <= 0 ? "not-allowed" : "pointer",
                fontFamily: FONT, boxShadow: remaining > 0 ? "0 8px 24px rgba(0,0,0,0.16)" : "none" }}>
              {remaining <= 0 ? "Sold Out" : isFree ? "Get Free Ticket →" : `Buy Ticket — GHS ${ev.price} →`}
            </motion.button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center", marginTop: "18px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
              <TrustBadge icon="🔒" label="Secure checkout" />
              <TrustBadge icon="⛓️" label="NFT ticket" />
              <TrustBadge icon="📱" label="MoMo accepted" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main AttendeeHome ─────────────────────────────────────────
export default function AttendeeHome() {
  const setScreen        = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty     = useStore(s => s.setTicketQty);
  const setOverlayEvent  = useStore(s => s.setOverlayEvent);
  const overlayEvent     = useStore(s => s.overlayEvent);
  const searchQ          = useStore(s => s.searchQ);
  const setSearchQ       = useStore(s => s.setSearchQ);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page,           setPage]           = useState(1);
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const desktop = isDesktop();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (desktop) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [desktop]);

  const { data: eventsData, isLoading: loading } = useQuery({
    queryKey: ["events"],
    queryFn: () =>
      eventsAPI.list().then(data =>
        Array.isArray(data)
          ? data.map(e => ({
              id:            e.id,
              name:          e.name,
              description:   e.description || "",
              category:      e.category,
              venue:         e.venue,
              city:          e.city,
              date:          e.date,
              time:          e.time,
              price:         parseFloat(e.price) || 0,
              totalTickets:  e.total_tickets || 0,
              ticketsSold:   e.tickets_sold  || 0,
              salesOpen:     e.sales_open,
              image:         e.image || categoryImages[e.category] || categoryImages.other,
              organizerName: e.organizer?.first_name
                ? `${e.organizer.first_name} ${e.organizer.last_name || ""}`.trim()
                : e.organizer_name || null,
            }))
          : []
      ),
    staleTime: 2 * 60 * 1000,
  });

  const events = eventsData || [];

  const [prevSearch, setPrevSearch] = useState(searchQ);
  const [prevCat,    setPrevCat]    = useState(activeCategory);
  if (searchQ !== prevSearch || activeCategory !== prevCat) {
    setPage(1);
    setPrevSearch(searchQ);
    setPrevCat(activeCategory);
  }

  const filtered = events.filter(e => {
    const q = searchQ.toLowerCase();
    const matchSearch =
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
    const matchCat = activeCategory === "all" || e.category === activeCategory;
    return matchSearch && matchCat;
  });

  const perPage    = desktop ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const goToCheckout = useCallback((ev) => {
    setCheckoutEvent(ev);
    setTicketQty(1);
    setOverlayEvent(null);
    setScreen("checkout");
  }, [setCheckoutEvent, setTicketQty, setOverlayEvent, setScreen]);

  const handlePageChange = (p) => {
    setPage(p);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (overlayEvent) return (
    <EventDetailOverlay
      ev={overlayEvent}
      onBack={() => setOverlayEvent(null)}
      onCheckout={() => goToCheckout(overlayEvent)}
    />
  );

  // ── MOBILE layout ──────────────────────────────────────────
  if (!desktop) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ flexShrink: 0, position: "sticky", top: 0, zIndex: 40 }}>
          <MobileNavbar scrolled={scrolled} />

          <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "0 16px" }}>
            <div style={{ padding: "10px 0" }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <span style={{ fontSize: "13px", opacity: 0.5 }}>🔍</span>
                </div>
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search events..."
                  style={{
                    width: "100%", padding: "11px 40px 11px 40px",
                    background: searchFocused ? "var(--bg)" : "var(--bg-subtle)",
                    border: searchFocused ? `1.5px solid ${BRAND}99` : "1.5px solid var(--border)",
                    borderRadius: "11px", fontSize: "13px", color: "var(--text-primary)",
                    outline: "none", boxSizing: "border-box", fontFamily: FONT,
                    transition: "all 0.2s",
                    boxShadow: searchFocused ? `0 0 0 3px ${BRAND}20` : "none",
                  }}
                />
                {searchQ && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchQ("")}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", width: "18px", height: "18px", borderRadius: "50%", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-muted)" }}>
                    ✕
                  </motion.div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "10px" }}>
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat.key;
                return (
                  <motion.div key={cat.key} whileTap={{ scale: 0.9 }} onClick={() => setActiveCategory(cat.key)}
                    style={{ flexShrink: 0, padding: "5px 14px", borderRadius: "99px", cursor: "pointer", fontSize: "11px", fontWeight: active ? 700 : 500, display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s", background: active ? BRAND : "transparent", color: active ? "#fff" : "var(--text-secondary)", border: active ? `1px solid ${BRAND}` : "1px solid var(--border)" }}>
                    <span style={{ fontFamily: MONO, fontSize: "10px" }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ padding: "12px 16px 0" }}>
            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setScreen("resaleMarket")}
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.06),rgba(37,99,235,0.04))", border: "1px solid rgba(124,58,237,0.18)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🏷️</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Resale Market</div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: "#7c3aed", padding: "2px 8px", borderRadius: "99px" }}>NFT TRANSFER</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: "#16a34a", padding: "2px 8px", borderRadius: "99px" }}>2% FEE</span>
                  </div>
                </div>
              </div>
              <span style={{ color: "#7c3aed", fontSize: "16px", fontWeight: 700 }}>→</span>
            </motion.div>
          </div>

          <div style={{ padding: "12px 16px 100px" }}>
            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: "var(--bg-card)", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <div className="skeleton" style={{ height: "190px" }} />
                    <div style={{ padding: "13px 15px" }}>
                      <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "8px", borderRadius: "6px" }} />
                      <div className="skeleton" style={{ height: "11px", width: "45%", borderRadius: "6px" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "2px", marginBottom: "16px", fontFamily: MONO }}>NO RESULTS</div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events found</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Try a different search or category</div>
              </div>
            )}
            {!loading && paginated.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {paginated.map((ev, i) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <EventCard ev={ev} onClick={() => setOverlayEvent(ev)} />
                  </motion.div>
                ))}
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <Pagination current={page} total={totalPages} onChange={handlePageChange} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP layout ──────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", boxShadow: "0 1px 0 var(--border), 0 4px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "0 40px" }}>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none", padding: "10px 0" }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.key;
              return (
                <motion.div key={cat.key} whileTap={{ scale: 0.9 }} onClick={() => setActiveCategory(cat.key)}
                  style={{ flexShrink: 0, padding: "5px 14px", borderRadius: "99px", cursor: "pointer", fontSize: "11px", fontWeight: active ? 700 : 500, display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s", background: active ? BRAND : "transparent", color: active ? "#fff" : "var(--text-secondary)", border: active ? `1px solid ${BRAND}` : "1px solid var(--border)" }}>
                  <span style={{ fontFamily: MONO, fontSize: "10px" }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 40px 0" }}>
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setScreen("resaleMarket")}
          style={{ background: "linear-gradient(135deg,rgba(186,117,23,0.07),rgba(245,166,35,0.04))", border: "1px solid rgba(186,117,23,0.25)", borderLeft: "3px solid #BA7517", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: "0" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(186,117,23,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(186,117,23,0.25)"; }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#BA7517,#f5a623)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🏷️</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#BA7517", letterSpacing: "0.02em", textTransform: "uppercase" }}>FAN TO FAN RESALE MARKET</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: "#7c3aed", padding: "2px 8px", borderRadius: "99px" }}>NFT TRANSFER</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: "#16a34a", padding: "2px 8px", borderRadius: "99px" }}>2% FEE</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Peer-to-peer · Instant on-chain ownership transfer</span>
              </div>
            </div>
          </div>
          <span style={{ color: "#BA7517", fontSize: "16px", fontWeight: 700 }}>→</span>
        </motion.div>
      </div>

      <div style={{ padding: "16px 40px 0" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: "220px" }} />
                <div style={{ padding: "13px 15px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "8px", borderRadius: "6px" }} />
                  <div className="skeleton" style={{ height: "11px", width: "45%", borderRadius: "6px" }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "2px", marginBottom: "16px", fontFamily: MONO }}>QUERY_RESULT: NULL</div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events found</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Try a different search or category</div>
          </div>
        )}
        {!loading && paginated.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {paginated.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <EventCard ev={ev} onClick={() => setOverlayEvent(ev)} />
              </motion.div>
            ))}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}