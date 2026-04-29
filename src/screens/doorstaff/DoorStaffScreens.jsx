import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { Html5Qrcode } from "html5-qrcode";

const TICKET_REGISTRY = {
  "TKT-001-GH": { valid: true,  holder: "Kwame Mensah",  event: "Accra Jazz Night",  seat: "GA-001", transferred: false },
  "TKT-002-GH": { valid: true,  holder: "Ama Owusu",     event: "Accra Jazz Night",  seat: "GA-002", transferred: true  },
  "TKT-003-GH": { valid: false, holder: "Kofi Asante",   event: "Accra Jazz Night",  seat: "GA-003", redeemed: true     },
  "TKT-004-GH": { valid: false, holder: "Abena Sarpong", event: "Tech Summit Ghana", seat: "VIP-001", wrongEvent: true  },
};

function verifyTicket(id) {
  const ticket = TICKET_REGISTRY[id?.trim().toUpperCase()];
  if (!ticket) return { status: "not_found", color: "#dc2626", icon: "❌", title: "Ticket Not Found",   msg: "This QR code is not in our system." };
  if (ticket.redeemed)   return { status: "redeemed",    color: "#dc2626", icon: "🚫", title: "Already Redeemed",  msg: "Do not admit. Already scanned.", holder: ticket.holder };
  if (ticket.wrongEvent) return { status: "wrong_event", color: "#f5a623", icon: "⚠️", title: "Wrong Event",       msg: "Ticket is for: " + ticket.event, holder: ticket.holder };
  return { status: "valid", color: "#16a34a", icon: "✅", title: "Valid — Admit!", msg: ticket.transferred ? "Transferred — verified on blockchain." : "NFT verified on Polygon.", holder: ticket.holder, seat: ticket.seat };
}

function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [camError, setCamError] = useState(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const scannerId = "qr-" + Math.random().toString(36).substr(2, 5);
    if (scannerRef.current) scannerRef.current.id = scannerId;
    const scanner = new Html5Qrcode(scannerId);
    html5QrRef.current = scanner;
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      (text) => { onScanRef.current(text); },
      () => {}
    ).catch(() => setCamError(true));
    return () => {
      if (html5QrRef.current && html5QrRef.current.isScanning) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (camError) return (
    <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>📷</div>
      <div style={{ color: "#888", fontSize: "13px" }}>Camera unavailable. Use manual entry below.</div>
    </div>
  );

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative" }}>
      <div ref={scannerRef} style={{ width: "100%", background: "#000" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "200px", height: "200px", border: "3px solid #f5a623", borderRadius: "12px", pointerEvents: "none", boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }} />
    </div>
  );
}

function TabToggle({ cameraMode, setCameraMode, dark }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
      {[["📷 Camera", true], ["⌨️ Manual", false]].map(([label, mode]) => (
        <motion.button key={label} whileTap={{ scale: 0.95 }} onClick={() => setCameraMode(mode)}
          style={{ flex: 1, padding: "10px", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", border: cameraMode === mode ? "2px solid #f5a623" : (dark ? "2px solid #333" : "2px solid var(--border)"), background: cameraMode === mode ? (dark ? "#f5a62322" : "rgba(245,166,35,0.08)") : (dark ? "#1a1a1a" : "var(--bg-card)"), color: cameraMode === mode ? "#f5a623" : (dark ? "#888" : "var(--text-muted)"), fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
          {label}
        </motion.button>
      ))}
    </div>
  );
}

function ResultCard({ result, dark }) {
  if (!result) return null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{ background: result.color + "18", border: "2px solid " + result.color + "55", borderRadius: "20px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
        style={{ fontSize: "48px", marginBottom: "10px" }}>{result.icon}</motion.div>
      <div style={{ color: result.color, fontWeight: 800, fontSize: "20px", marginBottom: "6px" }}>{result.title}</div>
      {result.holder && <div style={{ color: dark ? "#ccc" : "var(--text-secondary)", fontSize: "14px", marginBottom: "4px" }}>👤 {result.holder}</div>}
      {result.seat && <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>Seat: {result.seat}</div>}
      <div style={{ color: dark ? "#888" : "var(--text-muted)", fontSize: "12px" }}>{result.msg}</div>
    </motion.div>
  );
}

export function DoorStaffLogin() {
  const setScreen          = useStore(s => s.setScreen);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const doorCode           = useStore(s => s.doorCode);
  const setDoorCode        = useStore(s => s.setDoorCode);
  const doorCodeError      = useStore(s => s.doorCodeError);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", fontFamily: "var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ fontSize: "64px", marginBottom: "16px" }}>🎫</motion.div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Door Staff Access</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "32px" }}>Enter your invite code from the event organizer</p>
        <input
          value={doorCode} onChange={e => setDoorCode(e.target.value.toUpperCase())}
          placeholder="e.g. DOOR-A7K9M2"
          style={{ width: "100%", padding: "16px 20px", outline: "none", marginBottom: "12px", border: "2px solid " + (doorCodeError ? "var(--error)" : "#f5a623"), borderRadius: "14px", fontSize: "18px", fontWeight: 700, textAlign: "center", fontFamily: "monospace", boxSizing: "border-box", letterSpacing: "2px", background: "var(--bg-card)", color: "var(--text-primary)" }}
        />
        <AnimatePresence>
          {doorCodeError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ color: "var(--error)", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
              ⚠️ {doorCodeError}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={handleDoorStaffLogin}
          style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", boxShadow: "var(--shadow-brand)", marginBottom: "16px", fontFamily: "var(--font-sans)" }}>
          ENTER EVENT
        </motion.button>
        <motion.div whileHover={{ color: "#e8920f" }} onClick={() => setScreen("login")}
          style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>
          Are you an attendee? Log in here
        </motion.div>
      </motion.div>
    </div>
  );
}

export function DoorStaffScan() {
  const handleLogout   = useStore(s => s.handleLogout);
  const doorStaffUser  = useStore(s => s.doorStaffUser);
  const [scanInput, setScanInput]     = useState("");
  const [result, setResult]           = useState(null);
  const [verifying, setVerifying]     = useState(false);
  const [admittedList, setAdmittedList] = useState([]);
  const [cameraMode, setCameraMode]   = useState(true);

  const processId = (id) => {
    if (!id || verifying) return;
    setVerifying(true); setResult(null);
    setTimeout(() => {
      const res = verifyTicket(id);
      setResult(res);
      if (res.status === "valid") {
        setAdmittedList(prev => [
          { id, holder: res.holder, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
          ...prev.slice(0, 9)
        ]);
      }
      setVerifying(false); setScanInput("");
    }, 1000);
  };

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "40px", fontFamily: "var(--font-sans)" }}>
      <div style={{ background: "#1a1a1a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a2a" }}>
        <div>
          <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>🔍 Door Scanner</div>
          <div style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>{doorStaffUser?.eventName || "Event"} · {admittedList.length} admitted</div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
          style={{ padding: "8px 14px", background: "rgba(220,38,38,0.15)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Exit
        </motion.button>
      </div>

      <div style={{ padding: "16px" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} dark={true} />

        {cameraMode ? (
          <div style={{ marginBottom: "14px" }}>
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px", fontWeight: 600 }}>
                  ⛓ Verifying on blockchain...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "16px", marginBottom: "14px", border: "1px solid #2a2a2a" }}>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Type ticket ID e.g. TKT-001-GH"
              style={{ width: "100%", padding: "14px", background: "#2a2a2a", border: "2px solid #f5a623", borderRadius: "12px", color: "#fff", fontSize: "15px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px" }} />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => processId(scanInput)}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1, fontFamily: "var(--font-sans)" }}>
              {verifying ? "Verifying..." : "VERIFY TICKET"}
            </motion.button>
            <div style={{ color: "#444", fontSize: "11px", textAlign: "center", marginTop: "8px" }}>
              Test: TKT-001-GH ✅ · TKT-002-GH ✅ · TKT-003-GH 🚫 · TKT-004-GH ⚠️
            </div>
          </div>
        )}

        <ResultCard result={result} dark={true} />

        {admittedList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#1a1a1a", borderRadius: "16px", padding: "16px", border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>✅ Admitted ({admittedList.length})</div>
            {admittedList.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #222" }}>
                <span style={{ color: "#ccc", fontSize: "12px" }}>{a.holder}</span>
                <span style={{ color: "#555", fontSize: "11px" }}>{a.time}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function OrganizerScan() {
  const setScreen = useStore(s => s.setScreen);
  const [scanInput, setScanInput]   = useState("");
  const [result, setResult]         = useState(null);
  const [verifying, setVerifying]   = useState(false);
  const [cameraMode, setCameraMode] = useState(true);

  const processId = (id) => {
    if (!id || verifying) return;
    setVerifying(true); setResult(null);
    setTimeout(() => { setResult(verifyTicket(id)); setVerifying(false); setScanInput(""); }, 1000);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "40px", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setScreen("orgEventDetail")}
          style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245,166,35,0.1)", border: "none", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</motion.button>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Scan Tickets</div>
      </div>

      <div style={{ padding: "16px" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} dark={false} />

        {cameraMode ? (
          <div style={{ marginBottom: "14px" }}>
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px", fontWeight: 600 }}>
                  ⛓ Verifying...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px", marginBottom: "14px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Enter ticket ID e.g. TKT-001-GH"
              style={{ width: "100%", padding: "14px", border: "2px solid #f5a623", borderRadius: "12px", fontSize: "15px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px", background: "var(--bg)", color: "var(--text-primary)" }} />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => processId(scanInput)}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1, fontFamily: "var(--font-sans)" }}>
              {verifying ? "Verifying..." : "🔍 VERIFY"}
            </motion.button>
          </div>
        )}

        <ResultCard result={result} dark={false} />
      </div>
    </div>
  );
}