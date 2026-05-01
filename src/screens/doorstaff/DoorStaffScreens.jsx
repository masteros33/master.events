import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import { Html5Qrcode } from "html5-qrcode";

// ── QR Scanner component ──────────────────────────────────────
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
      { fps: 10, qrbox: { width: 220, height: 220 } },
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
    <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>📷</div>
      <div style={{ color: "#888", fontSize: "13px", marginBottom: "4px" }}>Camera unavailable</div>
      <div style={{ color: "#555", fontSize: "11px" }}>Use manual entry below</div>
    </div>
  );

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative", background: "#000" }}>
      <div ref={scannerRef} style={{ width: "100%" }} />
      {/* Scan frame overlay */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "220px", height: "220px", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }} />
        <div style={{ position: "absolute", inset: 0, border: "2.5px solid #f5a623", borderRadius: "14px" }} />
        {/* Corner marks */}
        {[["0","0","borderTop","borderLeft"],["0","0","borderTop","borderRight"],["0","0","borderBottom","borderLeft"],["0","0","borderBottom","borderRight"]].map((_, i) => null)}
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #f5a623, transparent)", transform: "translateY(-50%)" }} />
      </div>
    </div>
  );
}

// ── Mode toggle ───────────────────────────────────────────────
function TabToggle({ cameraMode, setCameraMode, dark }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
      {[["📷 Camera", true], ["⌨️ Manual", false]].map(([label, mode]) => (
        <motion.button key={label} whileTap={{ scale: 0.95 }} onClick={() => setCameraMode(mode)}
          style={{ flex: 1, padding: "10px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", border: "2px solid " + (cameraMode === mode ? "#f5a623" : (dark ? "#333" : "var(--border)")), background: cameraMode === mode ? (dark ? "rgba(245,166,35,0.12)" : "rgba(245,166,35,0.08)") : (dark ? "#1a1a1a" : "var(--bg-card)"), color: cameraMode === mode ? "#f5a623" : (dark ? "#666" : "var(--text-muted)"), fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
          {label}
        </motion.button>
      ))}
    </div>
  );
}

// ── Scan result card ──────────────────────────────────────────
function ResultCard({ result, dark }) {
  if (!result) return null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{ background: result.color + "15", border: "2px solid " + result.color + "45", borderRadius: "20px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
        style={{ fontSize: "52px", marginBottom: "10px" }}>{result.icon}</motion.div>
      <div style={{ color: result.color, fontWeight: 800, fontSize: "20px", marginBottom: "6px" }}>{result.title}</div>
      {result.holder && (
        <div style={{ color: dark ? "#ccc" : "var(--text-secondary)", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
          👤 {result.holder}
        </div>
      )}
      {result.event_name && (
        <div style={{ color: dark ? "#888" : "var(--text-muted)", fontSize: "12px", marginBottom: "4px" }}>
          🎟️ {result.event_name}
        </div>
      )}
      {/* Blockchain verified tag */}
      {result.status === "valid" && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", padding: "4px 10px", borderRadius: "99px", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px" }}>⛓️</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed" }}>Verified on Polygon</span>
        </div>
      )}
      <div style={{ color: dark ? "#666" : "var(--text-muted)", fontSize: "12px" }}>{result.msg}</div>
    </motion.div>
  );
}

// ── Door Staff Login ──────────────────────────────────────────
export function DoorStaffLogin() {
  const setScreen           = useStore(s => s.setScreen);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const doorCode            = useStore(s => s.doorCode);
  const setDoorCode         = useStore(s => s.setDoorCode);
  const doorCodeError       = useStore(s => s.doorCodeError);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ width: "72px", height: "72px", borderRadius: "22px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px", margin: "0 auto 20px", boxShadow: "var(--shadow-brand)" }}>🚪</motion.div>

        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Door Staff Access</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.5 }}>
          Enter the invite code from your event organizer to access the scanner
        </p>

        {/* Trust badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "7px 14px", borderRadius: "99px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", marginBottom: "24px", width: "fit-content", margin: "0 auto 24px" }}>
          <span style={{ fontSize: "11px" }}>⛓️</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed" }}>Blockchain ticket verification</span>
        </div>

        {/* Code input */}
        <input
          value={doorCode}
          onChange={e => setDoorCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleDoorStaffLogin()}
          placeholder="DOOR-XXXXXX"
          style={{ width: "100%", padding: "16px 20px", outline: "none", marginBottom: "10px", border: "2px solid " + (doorCodeError ? "var(--error)" : "#f5a623"), borderRadius: "14px", fontSize: "20px", fontWeight: 700, textAlign: "center", fontFamily: "monospace", boxSizing: "border-box", letterSpacing: "3px", background: "var(--bg-card)", color: "var(--text-primary)", transition: "border-color 0.2s" }}
        />
        <AnimatePresence>
          {doorCodeError && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ color: "var(--error)", fontSize: "13px", marginBottom: "14px", background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "10px 14px" }}>
              ⚠️ {doorCodeError}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={handleDoorStaffLogin}
          style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", boxShadow: "var(--shadow-brand)", marginBottom: "16px", fontFamily: "var(--font-sans)" }}>
          ENTER EVENT →
        </motion.button>

        <motion.div whileHover={{ color: "#e8920f" }} onClick={() => setScreen("login")}
          style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>
          Are you an attendee? Log in here
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Door Staff Scan ───────────────────────────────────────────
export function DoorStaffScan() {
  const handleLogout  = useStore(s => s.handleLogout);
  const doorStaffUser = useStore(s => s.doorStaffUser);
  const [scanInput, setScanInput]       = useState("");
  const [result, setResult]             = useState(null);
  const [verifying, setVerifying]       = useState(false);
  const [admittedList, setAdmittedList] = useState([]);
  const [cameraMode, setCameraMode]     = useState(true);
  const lastScan = useRef(null);

  // Prevent double-scanning same code
  const processId = async (id) => {
    if (!id?.trim() || verifying) return;
    const trimmed = id.trim();
    if (trimmed === lastScan.current) return;
    lastScan.current = trimmed;
    setTimeout(() => { lastScan.current = null; }, 3000); // 3s debounce

    setVerifying(true); setResult(null);
    try {
      // Try real backend first
      const data = await ticketsAPI.verify({ qr_data: trimmed });
      const res = buildResult(data, trimmed);
      setResult(res);
      if (res.status === "valid") {
        setAdmittedList(prev => [{
          id: trimmed, holder: res.holder || "Guest",
          event: res.event_name || doorStaffUser?.eventName || "Event",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }, ...prev.slice(0, 19)]);
      }
    } catch {
      // Fallback: show unknown result
      setResult({ status: "error", color: "#dc2626", icon: "❌", title: "Verification Failed", msg: "Could not verify. Check connection.", holder: null });
    }
    setVerifying(false); setScanInput("");
  };

  return (
    <div style={{ background: "#0e0e0e", minHeight: "100vh", paddingBottom: "20px", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a2a", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>🔍 Door Scanner</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "99px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c3aed" }} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#7c3aed" }}>LIVE</span>
            </div>
          </div>
          <div style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>
            {doorStaffUser?.eventName || "Event"} · {admittedList.length} admitted
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout}
          style={{ padding: "7px 14px", background: "rgba(220,38,38,0.12)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Exit
        </motion.button>
      </div>

      <div style={{ padding: "14px 14px 0" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} dark={true} />

        {/* Camera mode */}
        {cameraMode ? (
          <div style={{ marginBottom: "14px" }}>
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#f5a623", marginTop: "12px", fontSize: "13px", fontWeight: 700 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>⛓️</motion.span>
                  Verifying on blockchain...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Manual mode */
          <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "14px", marginBottom: "14px", border: "1px solid #2a2a2a" }}>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Enter ticket ID or paste QR data"
              style={{ width: "100%", padding: "13px 16px", background: "#2a2a2a", border: "2px solid #f5a623", borderRadius: "12px", color: "#fff", fontSize: "14px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => processId(scanInput)}
              style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1, fontFamily: "var(--font-sans)" }}>
              {verifying ? "⛓️ Verifying..." : "VERIFY TICKET"}
            </motion.button>
          </div>
        )}

        {/* Scan result */}
        <ResultCard result={result} dark={true} />

        {/* Admitted list */}
        {admittedList.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: "#1a1a1a", borderRadius: "16px", padding: "14px", border: "1px solid #2a2a2a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>✅ Admitted</div>
              <div style={{ background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px" }}>{admittedList.length}</div>
            </div>
            {admittedList.slice(0, 8).map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #222" }}>
                <div>
                  <span style={{ color: "#ccc", fontSize: "12px", fontWeight: 600 }}>{a.holder}</span>
                  {a.event && <span style={{ color: "#555", fontSize: "10px", marginLeft: "6px" }}>{a.event}</span>}
                </div>
                <span style={{ color: "#444", fontSize: "11px" }}>{a.time}</span>
              </div>
            ))}
            {admittedList.length > 8 && (
              <div style={{ color: "#555", fontSize: "11px", textAlign: "center", marginTop: "8px" }}>
                +{admittedList.length - 8} more
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
  const [scanInput, setScanInput]   = useState("");
  const [result, setResult]         = useState(null);
  const [verifying, setVerifying]   = useState(false);
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
      setResult({ status: "error", color: "#dc2626", icon: "❌", title: "Verification Failed", msg: "Could not connect to server.", holder: null });
    }
    setVerifying(false); setScanInput("");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "40px", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "18px 20px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("orgEventDetail")}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)" }}>←</motion.button>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>Scan Tickets</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#7c3aed" }}>⛓️</span> Real-time blockchain verification
          </div>
        </div>
      </div>

      <div style={{ padding: "14px" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} dark={false} />

        {cameraMode ? (
          <div style={{ marginBottom: "14px" }}>
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#7c3aed", marginTop: "12px", fontSize: "13px", fontWeight: 700 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>⛓️</motion.span>
                  Verifying on Polygon...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "14px", marginBottom: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Enter ticket ID or paste QR data"
              style={{ width: "100%", padding: "13px 16px", border: "2px solid #f5a623", borderRadius: "12px", fontSize: "14px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px", background: "var(--bg)", color: "var(--text-primary)" }} />
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => processId(scanInput)}
              style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1, fontFamily: "var(--font-sans)" }}>
              {verifying ? "⛓️ Verifying..." : "🔍 VERIFY"}
            </motion.button>
          </div>
        )}

        <ResultCard result={result} dark={false} />
      </div>
    </div>
  );
}

// ── Result builder — maps backend response to UI ──────────────
function buildResult(data, rawId) {
  // Backend formats: { valid, status, owner, event_name, error }
  if (data.error || !data.valid) {
    if (data.status === "redeemed" || data.status === "already_redeemed") {
      return { status: "redeemed", color: "#dc2626", icon: "🚫", title: "Already Redeemed", msg: "Do not admit. This ticket was already scanned.", holder: data.owner || null, event_name: data.event_name || null };
    }
    if (data.status === "wrong_event") {
      return { status: "wrong_event", color: "#d97706", icon: "⚠️", title: "Wrong Event", msg: "This ticket is for a different event: " + (data.event_name || "unknown"), holder: data.owner || null, event_name: data.event_name || null };
    }
    if (data.status === "not_found" || data.error === "Ticket not found") {
      return { status: "not_found", color: "#dc2626", icon: "❌", title: "Ticket Not Found", msg: "This QR code is not in our system. Possible fake.", holder: null, event_name: null };
    }
    return { status: "invalid", color: "#dc2626", icon: "❌", title: "Invalid Ticket", msg: data.error || "Ticket could not be verified.", holder: data.owner || null, event_name: data.event_name || null };
  }
  return {
    status: "valid", color: "#16a34a", icon: "✅",
    title: "Valid — Admit!",
    msg: data.transferred ? "NFT transferred ticket — verified on Polygon." : "NFT verified on Polygon blockchain.",
    holder: data.owner || "Guest",
    event_name: data.event_name || null,
  };
}