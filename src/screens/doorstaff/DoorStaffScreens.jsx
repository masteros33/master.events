import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import { Html5Qrcode } from "html5-qrcode";
import {
  DoorOpen, ScanLine, Keyboard, CheckCircle2, XCircle,
  AlertTriangle, Link2, User, Ticket, ArrowLeft,
  LogOut, Camera, Loader2, ShieldCheck, Ban
} from "lucide-react";

const BRAND      = "#F97316";
const BRAND_DARK = "#EA6C0A";

// ── QR Scanner ────────────────────────────────────────────────
function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [camError, setCamError] = useState(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const id = "qr-" + Math.random().toString(36).substr(2, 5);
    if (scannerRef.current) scannerRef.current.id = id;
    const scanner = new Html5Qrcode(id);
    html5QrRef.current = scanner;
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (text) => { onScanRef.current(text); },
      () => {}
    ).catch(() => setCamError(true));
    return () => {
      if (html5QrRef.current?.isScanning) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (camError) return (
    <div style={{ background: "#1c1b18", border: "1px solid #2a2a2a", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Camera size={26} color={BRAND} />
      </div>
      <div style={{ color: "#aaa", fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>Camera unavailable</div>
      <div style={{ color: "#555", fontSize: "13px" }}>Switch to Manual entry below</div>
    </div>
  );

  return (
    <div style={{ borderRadius: "20px", overflow: "hidden", position: "relative", background: "#000", boxShadow: `0 0 0 2px ${BRAND}40` }}>
      <div ref={scannerRef} style={{ width: "100%" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "240px", height: "240px", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" }} />
        {[
          { top: 0, left: 0, borderTop: `3px solid ${BRAND}`, borderLeft: `3px solid ${BRAND}`, borderRadius: "4px 0 0 0" },
          { top: 0, right: 0, borderTop: `3px solid ${BRAND}`, borderRight: `3px solid ${BRAND}`, borderRadius: "0 4px 0 0" },
          { bottom: 0, left: 0, borderBottom: `3px solid ${BRAND}`, borderLeft: `3px solid ${BRAND}`, borderRadius: "0 0 0 4px" },
          { bottom: 0, right: 0, borderBottom: `3px solid ${BRAND}`, borderRight: `3px solid ${BRAND}`, borderRadius: "0 0 4px 0" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: "28px", height: "28px", ...s }} />
        ))}
        <motion.div
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: "5%", right: "5%", height: "2px", background: `linear-gradient(90deg, transparent, ${BRAND}, transparent)`, borderRadius: "1px", boxShadow: `0 0 8px ${BRAND}` }}
        />
      </div>
    </div>
  );
}

// ── Mode toggle ───────────────────────────────────────────────
function TabToggle({ cameraMode, setCameraMode }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", background: "#1c1b18", borderRadius: "14px", padding: "4px" }}>
      {[[<Camera size={14} />, "Camera", true], [<Keyboard size={14} />, "Manual", false]].map(([icon, label, mode]) => (
        <motion.button key={label} whileTap={{ scale: 0.96 }} onClick={() => setCameraMode(mode)}
          style={{ flex: 1, padding: "10px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", border: "none", background: cameraMode === mode ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` : "transparent", color: cameraMode === mode ? "#fff" : "#555", fontFamily: "var(--font-sans)", transition: "all 0.2s", boxShadow: cameraMode === mode ? `0 4px 12px ${BRAND}40` : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
          {icon} {label}
        </motion.button>
      ))}
    </div>
  );
}

// ── Result icon map ───────────────────────────────────────────
function ResultIcon({ status, color, size = 52 }) {
  const iconProps = { size: size * 0.5, color, strokeWidth: 2 };
  const icons = {
    valid:       <CheckCircle2 {...iconProps} />,
    redeemed:    <Ban {...iconProps} />,
    wrong_event: <AlertTriangle {...iconProps} />,
    invalid:     <XCircle {...iconProps} />,
    error:       <XCircle {...iconProps} />,
  };
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: color + "15", border: `1.5px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
      {icons[status] || <XCircle {...iconProps} />}
    </div>
  );
}

// ── Scan result card ──────────────────────────────────────────
function ResultCard({ result }) {
  if (!result) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      style={{ background: result.color + "12", border: `2px solid ${result.color}40`, borderRadius: "22px", padding: "24px 20px", marginBottom: "16px", textAlign: "center" }}>

      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}>
        <ResultIcon status={result.status} color={result.color} size={64} />
      </motion.div>

      <div style={{ color: result.color, fontWeight: 900, fontSize: "22px", marginBottom: "8px", letterSpacing: "-0.5px" }}>
        {result.title}
      </div>

      {result.holder && (
        <div style={{ color: "#d0cdc8", fontSize: "15px", fontWeight: 600, marginBottom: "5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <User size={14} color="#d0cdc8" /> {result.holder}
        </div>
      )}

      {result.event_name && (
        <div style={{ color: "#666", fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          <Ticket size={12} color="#666" /> {result.event_name}
        </div>
      )}

      {result.status === "valid" && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", padding: "5px 12px", borderRadius: "99px", marginBottom: "8px" }}>
          <Link2 size={11} color="#a78bfa" />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa" }}>Verified on Polygon</span>
        </div>
      )}

      <div style={{ color: "#555", fontSize: "13px", lineHeight: 1.5 }}>{result.msg}</div>
    </motion.div>
  );
}

// ── Door Staff Login ──────────────────────────────────────────
export function DoorStaffLogin() {
  const setScreen            = useStore(s => s.setScreen);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const doorCode             = useStore(s => s.doorCode);
  const setDoorCode          = useStore(s => s.setDoorCode);
  const doorCodeError        = useStore(s => s.doorCodeError);

  return (
    <div style={{
      minHeight: "100vh", background: "#0e0d0b",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", fontFamily: "var(--font-sans)",
    }}>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${BRAND}08 0%, transparent 65%)`, pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>

        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <motion.div
            initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
            style={{ width: "80px", height: "80px", borderRadius: "24px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 12px 36px ${BRAND}40` }}>
            <DoorOpen size={36} color="#fff" strokeWidth={1.8} />
          </motion.div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: BRAND, letterSpacing: "2px", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
            MASTER EVENTS · DOOR STAFF
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: "10px" }}>
            Door Staff Access
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: "300px", margin: "0 auto" }}>
            Enter the invite code from your organizer to start scanning tickets
          </p>
        </div>

        {/* Blockchain badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "8px 16px", borderRadius: "99px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)", marginBottom: "28px", width: "fit-content", margin: "0 auto 28px" }}>
          <Link2 size={13} color="#a78bfa" />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#a78bfa" }}>Real-time Polygon blockchain verification</span>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "28px", backdropFilter: "blur(16px)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1.2px", marginBottom: "10px", fontFamily: "var(--font-mono)", textAlign: "center" }}>
            ENTER YOUR DOOR CODE
          </div>
          <input
            value={doorCode}
            onChange={e => setDoorCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleDoorStaffLogin()}
            placeholder="DOOR-XXXXXX"
            style={{
              width: "100%", padding: "18px 20px", outline: "none", marginBottom: "12px",
              border: `2px solid ${doorCodeError ? "#dc2626" : BRAND}`,
              borderRadius: "14px", fontSize: "22px", fontWeight: 800,
              textAlign: "center", fontFamily: "var(--font-mono)",
              boxSizing: "border-box", letterSpacing: "4px",
              background: "rgba(255,255,255,0.05)", color: "#fff",
              transition: "all 0.2s",
              boxShadow: doorCodeError ? "none" : `0 0 0 3px ${BRAND}20`,
            }}
          />
          <AnimatePresence>
            {doorCodeError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "13px", fontWeight: 600, marginBottom: "14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "11px 14px" }}>
                <AlertTriangle size={14} color="#f87171" />
                {doorCodeError}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 16px 40px ${BRAND}50` }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDoorStaffLogin}
            style={{ width: "100%", padding: "16px", borderRadius: "14px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", fontWeight: 800, fontSize: "16px", border: "none", cursor: "pointer", boxShadow: `0 8px 24px ${BRAND}40`, fontFamily: "var(--font-sans)", letterSpacing: "-0.2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <DoorOpen size={18} color="#fff" />
            ENTER EVENT
          </motion.button>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <motion.span whileHover={{ color: BRAND }}
            onClick={() => setScreen("login")}
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", cursor: "pointer", transition: "color 0.2s" }}>
            Attendee? Log in here →
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Door Staff Scan ───────────────────────────────────────────
export function DoorStaffScan() {
  const handleLogout  = useStore(s => s.handleLogout);
  const doorStaffUser = useStore(s => s.doorStaffUser);
  const setScreen     = useStore(s => s.setScreen);
  const [scanInput,    setScanInput]    = useState("");
  const [result,       setResult]       = useState(null);
  const [verifying,    setVerifying]    = useState(false);
  const [admittedList, setAdmittedList] = useState([]);
  const [cameraMode,   setCameraMode]   = useState(true);
  const lastScan = useRef(null);

  const processId = async (id) => {
    if (!id?.trim() || verifying) return;
    const trimmed = id.trim();
    if (trimmed === lastScan.current) return;
    lastScan.current = trimmed;
    setTimeout(() => { lastScan.current = null; }, 3000);
    setVerifying(true); setResult(null);
    try {
      const data = await ticketsAPI.verify({ qr_data: trimmed });
      const res  = buildResult(data, trimmed);
      setResult(res);
      if (res.status === "valid") {
        setAdmittedList(prev => [{
          id: trimmed,
          holder: res.holder || "Guest",
          event: res.event_name || doorStaffUser?.eventName || "Event",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }, ...prev.slice(0, 29)]);
      }
    } catch {
      setResult({ status: "error", color: "#dc2626", title: "Verification Failed", msg: "Could not verify. Check your connection.", holder: null });
    }
    setVerifying(false); setScanInput("");
  };

  return (
    <div style={{ background: "#0e0d0b", minHeight: "100vh", paddingBottom: "32px", fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ background: "#1a1916", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2826", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${BRAND}40` }}>
            <ScanLine size={17} color="#fff" />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.3px" }}>Door Scanner</div>
            <div style={{ color: "#555", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
              {doorStaffUser?.eventName || "Event"} · {admittedList.length} admitted
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "99px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", marginLeft: "4px" }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a78bfa" }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#a78bfa", fontFamily: "var(--font-mono)" }}>LIVE</span>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setScreen("home"); handleLogout(); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "99px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          <LogOut size={13} color="#f87171" /> Exit
        </motion.button>
      </div>

      <div style={{ padding: "16px" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />

        {/* Camera mode */}
        {cameraMode ? (
          <div style={{ marginBottom: "16px" }}>
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: BRAND, marginTop: "14px", fontSize: "14px", fontWeight: 700 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <Loader2 size={16} color={BRAND} />
                  </motion.div>
                  Verifying on blockchain...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Manual */
          <div style={{ background: "#1a1916", borderRadius: "18px", padding: "16px", marginBottom: "16px", border: "1px solid #2a2826" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#555", letterSpacing: "1.2px", marginBottom: "10px", fontFamily: "var(--font-mono)" }}>MANUAL ENTRY</div>
            <input
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Paste ticket ID or QR data"
              style={{ width: "100%", padding: "14px 16px", background: "#242220", border: `2px solid ${BRAND}60`, borderRadius: "12px", color: "#fff", fontSize: "14px", fontFamily: "var(--font-mono)", outline: "none", boxSizing: "border-box", marginBottom: "10px", caretColor: BRAND }}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}20`; }}
              onBlur={e => { e.target.style.borderColor = `${BRAND}60`; e.target.style.boxShadow = "none"; }}
            />
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => processId(scanInput)}
              style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1, fontFamily: "var(--font-sans)", boxShadow: `0 6px 18px ${BRAND}35`, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {verifying
                ? <><Loader2 size={15} color="#fff" style={{ animation: "spin 0.8s linear infinite" }} /> Verifying...</>
                : <><ShieldCheck size={15} color="#fff" /> VERIFY TICKET</>
              }
            </motion.button>
          </div>
        )}

        {/* Result */}
        <ResultCard result={result} />

        {/* Admitted list */}
        {admittedList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#1a1916", borderRadius: "18px", padding: "16px", border: "1px solid #2a2826" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#16a34a" /> Admitted This Session
              </div>
              <div style={{ background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>
                {admittedList.length}
              </div>
            </div>
            {admittedList.slice(0, 10).map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #222" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                  <div>
                    <span style={{ color: "#e0ddd8", fontSize: "13px", fontWeight: 600 }}>{a.holder}</span>
                    {a.event && <span style={{ color: "#444", fontSize: "11px", marginLeft: "7px" }}>{a.event}</span>}
                  </div>
                </div>
                <span style={{ color: "#444", fontSize: "11px", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{a.time}</span>
              </motion.div>
            ))}
            {admittedList.length > 10 && (
              <div style={{ color: "#444", fontSize: "12px", textAlign: "center", marginTop: "10px", fontFamily: "var(--font-mono)" }}>
                +{admittedList.length - 10} more this session
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Organizer Scan ────────────────────────────────────────────
export function OrganizerScan() {
  const setScreen = useStore(s => s.setScreen);
  const [scanInput,  setScanInput]  = useState("");
  const [result,     setResult]     = useState(null);
  const [verifying,  setVerifying]  = useState(false);
  const [cameraMode, setCameraMode] = useState(true);
  const lastScan = useRef(null);

  const processId = async (id) => {
    if (!id?.trim() || verifying) return;
    const trimmed = id.trim();
    if (trimmed === lastScan.current) return;
    lastScan.current = trimmed;
    setTimeout(() => { lastScan.current = null; }, 3000);
    setVerifying(true); setResult(null);
    try {
      const data = await ticketsAPI.verify({ qr_data: trimmed });
      setResult(buildResult(data, trimmed));
    } catch {
      setResult({ status: "error", color: "#dc2626", title: "Verification Failed", msg: "Could not connect to server.", holder: null });
    }
    setVerifying(false); setScanInput("");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "40px", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10, boxShadow: "var(--shadow-sm)" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("orgEventDetail")}
          style={{ width: "38px", height: "38px", borderRadius: "11px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={17} color="var(--text-primary)" />
        </motion.button>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Scan Tickets</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
            <Link2 size={11} color="#a78bfa" />
            <span style={{ color: "#a78bfa" }}>Real-time blockchain verification</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Light mode toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", background: "var(--bg-subtle)", borderRadius: "14px", padding: "4px" }}>
          {[[<Camera size={14} />, "Camera", true], [<Keyboard size={14} />, "Manual", false]].map(([icon, label, mode]) => (
            <motion.button key={label} whileTap={{ scale: 0.96 }} onClick={() => setCameraMode(mode)}
              style={{ flex: 1, padding: "10px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", border: "none", background: cameraMode === mode ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` : "transparent", color: cameraMode === mode ? "#fff" : "var(--text-muted)", fontFamily: "var(--font-sans)", transition: "all 0.2s", boxShadow: cameraMode === mode ? `0 4px 12px ${BRAND}35` : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              {icon} {label}
            </motion.button>
          ))}
        </div>

        {cameraMode ? (
          <div style={{ marginBottom: "16px" }}>
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#7c3aed", marginTop: "14px", fontSize: "13px", fontWeight: 700 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <Loader2 size={15} color="#7c3aed" />
                  </motion.div>
                  Verifying on Polygon...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px", marginBottom: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Enter ticket ID or paste QR data"
              style={{ width: "100%", padding: "14px 16px", border: `2px solid ${BRAND}60`, borderRadius: "12px", fontSize: "14px", fontFamily: "var(--font-mono)", outline: "none", boxSizing: "border-box", marginBottom: "10px", background: "var(--bg)", color: "var(--text-primary)", caretColor: BRAND }}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
              onBlur={e => { e.target.style.borderColor = `${BRAND}60`; e.target.style.boxShadow = "none"; }}
            />
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => processId(scanInput)}
              style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1, fontFamily: "var(--font-sans)", boxShadow: `0 6px 18px ${BRAND}30`, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {verifying
                ? <><Loader2 size={15} color="#fff" style={{ animation: "spin 0.8s linear infinite" }} /> Verifying...</>
                : <><ShieldCheck size={15} color="#fff" /> VERIFY TICKET</>
              }
            </motion.button>
          </div>
        )}

        {/* Result — light mode version */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            style={{ background: result.color + "0e", border: `2px solid ${result.color}35`, borderRadius: "20px", padding: "24px 20px", marginBottom: "16px", textAlign: "center" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}>
              <ResultIcon status={result.status} color={result.color} size={56} />
            </motion.div>
            <div style={{ color: result.color, fontWeight: 900, fontSize: "20px", marginBottom: "8px", letterSpacing: "-0.4px" }}>{result.title}</div>
            {result.holder && (
              <div style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 600, marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <User size={14} color="var(--text-primary)" /> {result.holder}
              </div>
            )}
            {result.event_name && (
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <Ticket size={12} color="var(--text-muted)" /> {result.event_name}
              </div>
            )}
            {result.status === "valid" && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", padding: "4px 12px", borderRadius: "99px", marginBottom: "6px" }}>
                <Link2 size={11} color="#7c3aed" />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed" }}>Verified on Polygon</span>
              </div>
            )}
            <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{result.msg}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Result builder ────────────────────────────────────────────
function buildResult(data, rawId) {
  if (data.error || !data.valid) {
    if (data.status === "redeemed" || data.reason === "Already redeemed") {
      return { status: "redeemed", color: "#dc2626", title: "Already Redeemed", msg: "Do not admit. This ticket was already scanned.", holder: data.holder || null, event_name: data.event_name || null };
    }
    if (data.status === "wrong_event") {
      return { status: "wrong_event", color: "#d97706", title: "Wrong Event", msg: "This ticket is for: " + (data.event_name || "a different event"), holder: data.holder || null, event_name: data.event_name || null };
    }
    return { status: "invalid", color: "#dc2626", title: "Invalid Ticket", msg: data.error || data.reason || "Could not verify this ticket.", holder: data.holder || null, event_name: data.event_name || null };
  }
  return {
    status: "valid", color: "#16a34a",
    title: "Valid — Admit!",
    msg: "NFT verified on Polygon blockchain.",
    holder: data.holder || data.owner || "Guest",
    event_name: data.event_name || null,
  };
}