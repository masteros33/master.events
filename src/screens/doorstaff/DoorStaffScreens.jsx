import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import toast from "react-hot-toast";

const BACKEND = "https://master-events-backend.onrender.com";
const BRAND   = "#F97316";
const BRAND_D = "#EA6C0A";
const GREEN   = "#22c55e";
const RED     = "#ef4444";
const PURPLE  = "#8b5cf6";
const BLUE    = "#3b82f6";
const FONT    = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO    = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const T = {
  bg:     "var(--bg)",
  card:   "var(--bg-card)",
  border: "var(--border)",
  text:   "var(--text-primary)",
  sub:    "var(--text-secondary)",
  muted:  "var(--text-muted)",
  subtle: "var(--bg-subtle)",
  shadow: "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
  shadowLg: "0 10px 40px rgba(0,0,0,0.14)",
};

const isDesktop = () => window.innerWidth > 768;

// ── Scan Result Popup ─────────────────────────────────────────
function ScanResultPopup({ result, onAdmit, onDeny, onClose }) {
  const isValid   = result?.valid;
  const ticket    = result?.ticket;
  const color     = isValid ? GREEN : RED;
  const icon      = isValid ? "✅" : "❌";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, backdropFilter: "blur(12px)" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 40 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", zIndex: 201, padding: "0 16px calc(24px + env(safe-area-inset-bottom,0px))" }}>

        <div style={{ background: T.card, borderRadius: "28px 28px 20px 20px", overflow: "hidden", border: `1px solid ${color}30`, boxShadow: `0 -4px 60px ${color}25, ${T.shadowLg}` }}>

          {/* Color header */}
          <div style={{ background: `linear-gradient(135deg,${color}18,${color}08)`, borderBottom: `1px solid ${color}20`, padding: "28px 24px 22px", textAlign: "center", position: "relative" }}>
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.08 }}
              style={{ width: "72px", height: "72px", borderRadius: "50%", background: `linear-gradient(135deg,${color},${color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 16px", boxShadow: `0 8px 32px ${color}50` }}>
              {icon}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div style={{ fontSize: "22px", fontWeight: 900, color: T.text, letterSpacing: "-0.6px", marginBottom: "4px" }}>
                {isValid ? "Ticket Valid" : "Ticket Invalid"}
              </div>
              <div style={{ fontSize: "13px", color: T.muted, lineHeight: 1.5 }}>
                {isValid
                  ? "This ticket is verified and ready for admission"
                  : result?.message || "This ticket cannot be admitted"}
              </div>
            </motion.div>
          </div>

          {/* Ticket details */}
          {ticket && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  ["🎫", "Holder",   ticket.holderName  || "—"],
                  ["📧", "Email",    ticket.holderEmail || "—"],
                  ["🎟️","Event",    ticket.eventName   || "—"],
                  ["⛓️","NFT",      ticket.tokenId ? `#${ticket.tokenId}` : "Minting..."],
                  ["📅", "Date",     ticket.eventDate   || "—"],
                  ["×",  "Quantity", String(ticket.quantity || 1)],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ background: T.subtle, borderRadius: "12px", padding: "10px 12px", border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "5px" }}>{icon} {label.toUpperCase()}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Blockchain */}
              {ticket.tokenId && (
                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(139,92,246,0.06)", borderRadius: "12px", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px" }}>⛓️</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: PURPLE }}>Verified on Polygon</div>
                    <div style={{ fontSize: "10px", color: T.muted, fontFamily: MONO }}>NFT #{ticket.tokenId}</div>
                  </div>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ marginLeft: "auto", width: "8px", height: "8px", borderRadius: "50%", background: GREEN }} />
                </div>
              )}
            </motion.div>
          )}

          {/* Action buttons */}
          <div style={{ padding: "18px 24px", display: "flex", gap: "10px" }}>
            {isValid ? (
              <>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onAdmit}
                  style={{ flex: 2, padding: "15px", background: `linear-gradient(135deg,${GREEN},#16a34a)`, color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, boxShadow: `0 4px 16px rgba(34,197,94,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  ✓ Admit
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onDeny}
                  style={{ flex: 1, padding: "15px", background: "rgba(239,68,68,0.08)", color: RED, border: "1.5px solid rgba(239,68,68,0.25)", borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                  Deny
                </motion.button>
              </>
            ) : (
              <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
                style={{ flex: 1, padding: "15px", background: T.subtle, color: T.sub, border: `1px solid ${T.border}`, borderRadius: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                Close
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  DOOR STAFF LOGIN
// ─────────────────────────────────────────────────────────────
export function DoorStaffLogin() {
  const doorCode         = useStore(s => s.doorCode);
  const doorCodeError    = useStore(s => s.doorCodeError);
  const setDoorCode      = useStore(s => s.setDoorCode);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const setScreen        = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(false);
  const desktop = isDesktop();

  const onLogin = async () => {
    if (loading || !doorCode.trim()) return;
    setLoading(true);
    await handleDoorStaffLogin();
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100%", background: T.bg, display: "flex", flexDirection: "column", fontFamily: FONT }}>

      {/* Dark hero */}
      <div style={{ background: "linear-gradient(135deg,#0d0b1e 0%,#1a0533 50%,#0f0c1e 100%)", padding: "60px 24px 80px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "20px", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)", filter: "blur(20px)" }} />

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("doorStaffLogin")}
          style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "#fff" }}>
          ←
        </motion.button>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{ width: "80px", height: "80px", borderRadius: "22px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(124,58,237,0.5)" }}>
            🚪
          </motion.div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: "6px" }}>Door Staff Access</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Enter your access code to begin scanning tickets</div>

          {/* Features */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            {["📱 QR Scanner", "⛓️ Polygon verified", "⚡ Real-time"].map(f => (
              <div key={f} style={{ padding: "5px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: desktop ? "0" : "0 16px 40px", marginTop: "-28px", position: "relative", zIndex: 10, maxWidth: desktop ? "480px" : "100%", margin: "-28px auto 0", width: "100%", paddingBottom: "40px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: T.card, borderRadius: "24px", padding: desktop ? "36px 40px" : "28px 22px", border: `1px solid ${T.border}`, boxShadow: T.shadowLg }}>

          <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>ACCESS CODE</div>
          <input
            value={doorCode}
            onChange={e => setDoorCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && onLogin()}
            placeholder="e.g. DOOR-ABCD12"
            maxLength={20}
            style={{ width: "100%", padding: "16px 18px", background: T.subtle, border: `1.5px solid ${doorCodeError ? RED : T.border}`, borderRadius: "14px", fontSize: "22px", fontWeight: 800, letterSpacing: "3px", color: T.text, outline: "none", fontFamily: MONO, boxSizing: "border-box", marginBottom: "8px", textTransform: "uppercase", transition: "border-color 0.15s,box-shadow 0.15s", textAlign: "center" }}
            onFocus={e => { e.target.style.borderColor = PURPLE; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = doorCodeError ? RED : T.border; e.target.style.boxShadow = "none"; }} />

          <AnimatePresence>
            {doorCodeError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: RED }}>
                ⚠️ {doorCodeError}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ fontSize: "12px", color: T.muted, marginBottom: "22px", textAlign: "center" }}>
            Get your access code from the event organizer
          </div>

          <motion.button whileHover={!loading ? { scale: 1.015 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
            onClick={onLogin} disabled={loading || !doorCode.trim()}
            style={{ width: "100%", padding: "16px", background: loading || !doorCode.trim() ? T.subtle : `linear-gradient(135deg,${PURPLE},#2563eb)`, color: loading || !doorCode.trim() ? T.muted : "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: loading || !doorCode.trim() ? "not-allowed" : "pointer", fontFamily: FONT, boxShadow: loading || !doorCode.trim() ? "none" : "0 4px 20px rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                Verifying...
              </>
            ) : "Access Event →"}
          </motion.button>

          <div style={{ marginTop: "20px", padding: "14px 16px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "14px", display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>🔒</span>
            <div style={{ fontSize: "12px", color: T.muted, lineHeight: 1.6 }}>
              Door staff codes are single-use and event-specific. You can only scan tickets for your assigned event.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DOOR STAFF SCAN
// ─────────────────────────────────────────────────────────────
export function DoorStaffScan() {
  const doorStaffUser  = useStore(s => s.doorStaffUser);
  const admittedList   = useStore(s => s.admittedList);
  const scanResult     = useStore(s => s.scanResult);
  const setScanResult  = useStore(s => s.setScanResult);
  const handleAdmit    = useStore(s => s.handleAdmit);
  const setScreen      = useStore(s => s.setScreen);

  const [scanInput,  setScanInput]  = useState("");
  const [verifying,  setVerifying]  = useState(false);
  const [camSupported, setCamSupported] = useState(false);
  const [camActive,  setCamActive]  = useState(false);
  const [stats,      setStats]      = useState({ admitted: 0, denied: 0 });
  const inputRef = useRef(null);
  const desktop  = isDesktop();

  useEffect(() => {
    setCamSupported(!!navigator.mediaDevices?.getUserMedia);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scanInput.length > 20) {
      handleScan(scanInput.trim());
      setScanInput("");
    }
  }, [scanInput]);

  const handleScan = async (raw) => {
    if (verifying || !raw) return;
    setVerifying(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${BACKEND}/api/tickets/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ qr_data: raw, event_id: doorStaffUser?.eventId }),
      });
      const data = await res.json();
      setScanResult({
        valid:   data.valid || false,
        message: data.message || (data.valid ? "Valid ticket" : "Invalid ticket"),
        ticket: data.valid ? {
          holderName:  (data.holder_name  || data.owner_name || "Unknown"),
          holderEmail: (data.holder_email || data.owner_email || "—"),
          eventName:   data.event_name  || doorStaffUser?.eventName || "—",
          eventDate:   data.event_date  || "—",
          tokenId:     data.nft_token_id,
          quantity:    data.quantity || 1,
          ticketId:    raw,
        } : null,
      });
    } catch {
      setScanResult({ valid: false, message: "Verification error — check connection", ticket: null });
    } finally {
      setVerifying(false);
    }
  };

  const onAdmit = () => {
    handleAdmit(true);
    setStats(s => ({ ...s, admitted: s.admitted + 1 }));
    setScanResult(null);
    inputRef.current?.focus();
    toast.success("✅ Admitted!");
  };

  const onDeny = () => {
    setStats(s => ({ ...s, denied: s.denied + 1 }));
    setScanResult(null);
    inputRef.current?.focus();
    toast.error("❌ Entry denied");
  };

  const totalScanned = stats.admitted + stats.denied;

  return (
    <div style={{ background: T.bg, minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: FONT }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0d0b1e,#1a0533)", padding: "0 16px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139,92,246,0.3)", border: "1px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🚪</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>Door Scanner</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", fontFamily: MONO }}>{doorStaffUser?.eventName || "Event"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: GREEN, fontFamily: MONO }}>LIVE</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("doorStaffLogin")}
            style={{ marginLeft: "8px", padding: "6px 12px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", color: RED, fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
            Exit
          </motion.button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: desktop ? "24px 40px" : "16px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "680px" : "100%", margin: "0 auto" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "ADMITTED", value: stats.admitted, color: GREEN,  bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
              { label: "DENIED",   value: stats.denied,   color: RED,    bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
              { label: "SCANNED",  value: totalScanned,   color: PURPLE, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "16px", padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 900, color, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "9px", fontWeight: 700, color, fontFamily: MONO, marginTop: "5px", letterSpacing: "0.5px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* QR scan area */}
          <div style={{ background: T.card, borderRadius: "20px", border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: "16px", boxShadow: T.shadow }}>

            {/* Camera / manual toggle */}
            <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
              {[["📷 Camera", true], ["⌨️ Manual", false]].map(([label, isCam]) => (
                <motion.button key={label} whileTap={{ scale: 0.97 }} onClick={() => setCamActive(isCam)}
                  style={{ flex: 1, padding: "14px", background: camActive === isCam ? `${PURPLE}10` : "transparent", color: camActive === isCam ? PURPLE : T.muted, border: "none", borderBottom: camActive === isCam ? `2px solid ${PURPLE}` : "2px solid transparent", cursor: "pointer", fontFamily: FONT, fontSize: "13px", fontWeight: camActive === isCam ? 700 : 500, transition: "all 0.15s" }}>
                  {label}
                </motion.button>
              ))}
            </div>

            {camActive ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <div style={{ width: "100%", aspectRatio: "1", maxWidth: "260px", margin: "0 auto", borderRadius: "16px", background: "#000", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${PURPLE}30` }}>
                  {/* Scanner corner decorations */}
                  {[["0","0"],["0","auto"],["auto","0"],["auto","auto"]].map(([t,r], i) => (
                    <div key={i} style={{ position: "absolute", top: t === "0" ? "12px" : "auto", bottom: t === "auto" ? "12px" : "auto", left: r === "0" ? "12px" : "auto", right: r === "auto" ? "12px" : "auto", width: "22px", height: "22px", borderTop: t === "0" ? `3px solid ${PURPLE}` : "none", borderBottom: t === "auto" ? `3px solid ${PURPLE}` : "none", borderLeft: r === "0" ? `3px solid ${PURPLE}` : "none", borderRight: r === "auto" ? `3px solid ${PURPLE}` : "none", borderRadius: t === "0" && r === "0" ? "6px 0 0 0" : t === "0" ? "0 6px 0 0" : t === "auto" && r === "0" ? "0 0 0 6px" : "0 0 6px 0" }} />
                  ))}
                  {/* Scan line */}
                  <motion.div
                    animate={{ y: [-80, 80] }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.8, ease: "easeInOut" }}
                    style={{ position: "absolute", left: "10px", right: "10px", height: "2px", background: `linear-gradient(90deg,transparent,${PURPLE},transparent)`, boxShadow: `0 0 8px ${PURPLE}` }} />
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", zIndex: 1 }}>
                    {camSupported ? "Camera placeholder — integrate jsQR/ZXing" : "Camera not supported"}
                  </div>
                </div>
                <div style={{ marginTop: "14px", fontSize: "12px", color: T.muted }}>
                  Point camera at ticket QR code
                </div>
              </div>
            ) : (
              <div style={{ padding: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "10px" }}>SCAN OR PASTE QR DATA</div>
                <div style={{ position: "relative" }}>
                  <input
                    ref={inputRef}
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { handleScan(scanInput.trim()); setScanInput(""); } }}
                    placeholder="Scan QR or paste ticket ID..."
                    style={{ width: "100%", padding: "14px 50px 14px 16px", background: T.subtle, border: `1.5px solid ${T.border}`, borderRadius: "12px", fontSize: "14px", color: T.text, outline: "none", fontFamily: MONO, boxSizing: "border-box", transition: "border-color 0.15s,box-shadow 0.15s" }}
                    onFocus={e => { e.target.style.borderColor = PURPLE; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => { handleScan(scanInput.trim()); setScanInput(""); }}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "9px", background: PURPLE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    →
                  </motion.button>
                </div>
                <div style={{ marginTop: "10px", fontSize: "12px", color: T.muted }}>
                  Press Enter or tap → to verify. For handheld scanners, point at QR code and trigger.
                </div>
              </div>
            )}
          </div>

          {/* Verifying state */}
          <AnimatePresence>
            {verifying && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: T.card, borderRadius: "16px", padding: "16px 20px", border: `1px solid ${PURPLE}25`, marginBottom: "16px", display: "flex", alignItems: "center", gap: "14px", boxShadow: T.shadow }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: `3px solid ${PURPLE}20`, borderTopColor: PURPLE, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Verifying ticket...</div>
                  <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px" }}>Checking Polygon blockchain</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admitted list */}
          {admittedList.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: T.muted, letterSpacing: "1.5px", fontFamily: MONO, marginBottom: "10px" }}>
                ADMITTED ({admittedList.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {admittedList.slice().reverse().slice(0, 10).map((id, i) => (
                  <motion.div key={id + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>✓</div>
                    <div style={{ fontFamily: MONO, fontSize: "11px", color: GREEN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {String(id).slice(0, 24)}...
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: GREEN, fontFamily: MONO, flexShrink: 0 }}>ADMITTED</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan result popup */}
      <AnimatePresence>
        {scanResult && (
          <ScanResultPopup
            result={scanResult}
            onAdmit={onAdmit}
            onDeny={onDeny}
            onClose={() => { setScanResult(null); inputRef.current?.focus(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}