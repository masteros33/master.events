import React, { useState, useEffect, useRef } from "react";
import useStore from "../../store/useStore";
import { btnStyle } from "../../styles/common";
import { Html5Qrcode } from "html5-qrcode";

const TICKET_REGISTRY = {
  "TKT-001-GH": { valid: true, holder: "Kwame Mensah", event: "Accra Jazz Night", seat: "GA-001", transferred: false },
  "TKT-002-GH": { valid: true, holder: "Ama Owusu", event: "Accra Jazz Night", seat: "GA-002", transferred: true },
  "TKT-003-GH": { valid: false, holder: "Kofi Asante", event: "Accra Jazz Night", seat: "GA-003", redeemed: true },
  "TKT-004-GH": { valid: false, holder: "Abena Sarpong", event: "Tech Summit Ghana", seat: "VIP-001", wrongEvent: true },
};

function verifyTicket(id) {
  const ticket = TICKET_REGISTRY[id?.trim().toUpperCase()];
  if (!ticket) return { status: "not_found", color: "#e74c3c", icon: "❌", title: "Ticket Not Found", msg: "This QR code is not in our system." };
  if (ticket.redeemed) return { status: "redeemed", color: "#e74c3c", icon: "🚫", title: "Already Redeemed", msg: "Do not admit. Already scanned.", holder: ticket.holder };
  if (ticket.wrongEvent) return { status: "wrong_event", color: "#f5a623", icon: "⚠️", title: "Wrong Event", msg: "Ticket is for: " + ticket.event, holder: ticket.holder };
  return { status: "valid", color: "#27ae60", icon: "✅", title: "Valid — Admit!", msg: ticket.transferred ? "Transferred — verified on blockchain." : "NFT verified on Polygon.", holder: ticket.holder, seat: ticket.seat };
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
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "200px", height: "200px",
        border: "3px solid #f5a623",
        borderRadius: "12px",
        pointerEvents: "none",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)"
      }} />
    </div>
  );
}

function TabToggle({ cameraMode, setCameraMode, dark }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
      {[["📷 Camera", true], ["⌨️ Manual", false]].map(([label, mode]) => (
        <button key={label} onClick={() => setCameraMode(mode)} style={{
          flex: 1, padding: "10px", borderRadius: "12px",
          fontWeight: 700, fontSize: "13px", cursor: "pointer",
          border: cameraMode === mode ? "2px solid #f5a623" : (dark ? "2px solid #333" : "2px solid #eee"),
          background: cameraMode === mode ? (dark ? "#f5a62322" : "#fff9f0") : (dark ? "#1a1a1a" : "#fff"),
          color: cameraMode === mode ? "#f5a623" : (dark ? "#888" : "#aaa"),
        }}>{label}</button>
      ))}
    </div>
  );
}

function ResultCard({ result, dark }) {
  if (!result) return null;
  return (
    <div style={{
      background: result.color + "18",
      border: "2px solid " + result.color + "55",
      borderRadius: "20px", padding: "20px",
      marginBottom: "14px", textAlign: "center"
    }}>
      <div style={{ fontSize: "48px", marginBottom: "10px" }}>{result.icon}</div>
      <div style={{ color: result.color, fontWeight: 800, fontSize: "20px", marginBottom: "6px" }}>{result.title}</div>
      {result.holder && <div style={{ color: dark ? "#ccc" : "#555", fontSize: "14px", marginBottom: "4px" }}>👤 {result.holder}</div>}
      {result.seat && <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>Seat: {result.seat}</div>}
      <div style={{ color: "#888", fontSize: "12px" }}>{result.msg}</div>
    </div>
  );
}

export function DoorStaffLogin() {
  const setScreen = useStore(s => s.setScreen);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const doorCode = useStore(s => s.doorCode);
  const setDoorCode = useStore(s => s.setDoorCode);
  const doorCodeError = useStore(s => s.doorCodeError);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", background: "#fafaf8" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎫</div>
      <div style={{ fontSize: "24px", fontWeight: 900, color: "#111", marginBottom: "8px" }}>Door Staff Access</div>
      <div style={{ fontSize: "13px", color: "#888", marginBottom: "32px", textAlign: "center" }}>Enter your invite code from the event organizer</div>
      <input
        value={doorCode}
        onChange={e => setDoorCode(e.target.value.toUpperCase())}
        placeholder="e.g. DOOR-A7K9M2"
        style={{
          width: "100%", padding: "16px 20px", outline: "none", marginBottom: "12px",
          border: "2px solid " + (doorCodeError ? "#e74c3c" : "#f5a623"),
          borderRadius: "14px", fontSize: "18px", fontWeight: 700,
          textAlign: "center", fontFamily: "monospace",
          boxSizing: "border-box", letterSpacing: "2px"
        }}
      />
      {doorCodeError && (
        <div style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>⚠️ {doorCodeError}</div>
      )}
      <button onClick={handleDoorStaffLogin} style={{ ...btnStyle, marginBottom: "16px" }}>ENTER EVENT</button>
      <div onClick={() => setScreen("login")} style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>
        Are you an attendee? Log in here
      </div>
    </div>
  );
}

export function DoorStaffScan() {
  const handleLogout = useStore(s => s.handleLogout);
  const doorStaffUser = useStore(s => s.doorStaffUser);
  const [scanInput, setScanInput] = useState("");
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [admittedList, setAdmittedList] = useState([]);
  const [cameraMode, setCameraMode] = useState(true);

  const processId = (id) => {
    if (!id || verifying) return;
    setVerifying(true);
    setResult(null);
    setTimeout(() => {
      const res = verifyTicket(id);
      setResult(res);
      if (res.status === "valid") {
        setAdmittedList(prev => [
          { id, holder: res.holder, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
          ...prev.slice(0, 9)
        ]);
      }
      setVerifying(false);
      setScanInput("");
    }, 1000);
  };

  return (
    <div style={{ background: "#111", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ background: "#1a1a1a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>🔍 Door Scanner</div>
          <div style={{ color: "#888", fontSize: "12px" }}>{doorStaffUser?.eventName || "Event"} · {admittedList.length} admitted</div>
        </div>
        <button onClick={handleLogout} style={{ padding: "8px 14px", background: "#e74c3c22", color: "#e74c3c", border: "1px solid #e74c3c44", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Exit</button>
      </div>

      <div style={{ padding: "16px" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} dark={true} />

        {cameraMode ? (
          <div style={{ marginBottom: "14px" }}>
            <QRScanner onScan={processId} />
            {verifying && <div style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px" }}>⛓ Verifying on blockchain...</div>}
          </div>
        ) : (
          <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "16px", marginBottom: "14px", border: "1px solid #333" }}>
            <input
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Type ticket ID e.g. TKT-001-GH"
              style={{ width: "100%", padding: "14px", background: "#2a2a2a", border: "2px solid #f5a623", borderRadius: "12px", color: "#fff", fontSize: "15px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px" }}
            />
            <button onClick={() => processId(scanInput)} style={{ ...btnStyle, opacity: verifying ? 0.7 : 1 }}>
              {verifying ? "Verifying..." : "VERIFY TICKET"}
            </button>
            <div style={{ color: "#444", fontSize: "11px", textAlign: "center", marginTop: "8px" }}>
              Test: TKT-001-GH ✅ · TKT-002-GH ✅ · TKT-003-GH 🚫 · TKT-004-GH ⚠️
            </div>
          </div>
        )}

        <ResultCard result={result} dark={true} />

        {admittedList.length > 0 && (
          <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "16px", border: "1px solid #333" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>✅ Admitted ({admittedList.length})</div>
            {admittedList.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #222" }}>
                <span style={{ color: "#ccc", fontSize: "12px" }}>{a.holder}</span>
                <span style={{ color: "#555", fontSize: "11px" }}>{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrganizerScan() {
  const setScreen = useStore(s => s.setScreen);
  const [scanInput, setScanInput] = useState("");
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [cameraMode, setCameraMode] = useState(true);

  const processId = (id) => {
    if (!id || verifying) return;
    setVerifying(true);
    setResult(null);
    setTimeout(() => {
      setResult(verifyTicket(id));
      setVerifying(false);
      setScanInput("");
    }, 1000);
  };

  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <button onClick={() => setScreen("orgEventDetail")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f5a62322", border: "none", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</button>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#111" }}>Scan Tickets</div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} dark={false} />

        {cameraMode ? (
          <div style={{ marginBottom: "14px" }}>
            <QRScanner onScan={processId} />
            {verifying && <div style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px" }}>⛓ Verifying...</div>}
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <input
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Enter ticket ID e.g. TKT-001-GH"
              style={{ width: "100%", padding: "14px", border: "2px solid #f5a623", borderRadius: "12px", fontSize: "15px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px" }}
            />
            <button onClick={() => processId(scanInput)} style={{ ...btnStyle, opacity: verifying ? 0.7 : 1 }}>
              {verifying ? "Verifying..." : "🔍 VERIFY"}
            </button>
          </div>
        )}

        <ResultCard result={result} dark={false} />
      </div>
    </div>
  );
}