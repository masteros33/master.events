import React, { useState, useEffect, useRef } from "react";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

async function verifyTicketAPI(qr_data, event_id) {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API}/api/tickets/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ qr_data, event_id: event_id || 1 }),
    });
    const data = await res.json();
    if (data.valid) {
      return {
        status: "valid", color: "#27ae60", icon: "✅",
        title: "Valid — Admit!",
        msg: data.is_transfer ? "Transferred — verified on blockchain." : "NFT verified on Polygon.",
        holder: data.holder, seat: data.ticket_id,
      };
    } else {
      if (data.reason?.includes("redeemed") || data.reason?.includes("Already")) {
        return { status: "redeemed", color: "#e74c3c", icon: "🚫", title: "Already Redeemed", msg: "Do not admit. Already scanned.", holder: data.holder };
      }
      if (data.reason?.includes("Wrong event")) {
        return { status: "wrong_event", color: "#f5a623", icon: "⚠️", title: "Wrong Event", msg: data.reason, holder: data.holder };
      }
      return { status: "not_found", color: "#e74c3c", icon: "❌", title: "Ticket Not Found", msg: data.reason || "This QR code is not in our system." };
    }
  } catch {
    return { status: "error", color: "#e74c3c", icon: "❌", title: "Connection Error", msg: "Could not reach server." };
  }
}

function QRScanner({ onScan }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef   = useRef(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [camError, setCamError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setCamError(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      if (err.name === "NotAllowedError") setErrorMsg("Camera permission denied. Please allow camera access.");
      else if (err.name === "NotFoundError") setErrorMsg("No camera found on this device.");
      else setErrorMsg("Camera unavailable. Use manual entry below.");
      setCamError(true);
    }
  };

  const stopCamera = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const scanFrame = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      if ("BarcodeDetector" in window) {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        detector.detect(canvas).then(codes => {
          if (codes.length > 0) { onScanRef.current(codes[0].rawValue); return; }
        }).catch(() => {});
      }
      if (window.jsQR) {
        const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code) { onScanRef.current(code.data); return; }
      }
    }
    animRef.current = requestAnimationFrame(scanFrame);
  };

  if (camError) return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "16px", padding: "32px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📷</div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Camera Unavailable</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "20px", lineHeight: 1.6 }}>{errorMsg}</div>
      <button onClick={startCamera} style={{ padding: "12px 24px", background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
        🔄 Try Again
      </button>
      <div style={{ marginTop: "16px", color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Use Manual entry tab below</div>
    </div>
  );

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative", background: "#000", minHeight: "280px" }}>
      <video ref={videoRef} style={{ width: "100%", display: "block", minHeight: "280px", objectFit: "cover" }} playsInline muted autoPlay />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "220px", height: "220px", border: "3px solid #f5a623", borderRadius: "16px", pointerEvents: "none", boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}>
        {[
          { top: -3, left: -3, borderTop: "4px solid #f5a623", borderLeft: "4px solid #f5a623" },
          { top: -3, right: -3, borderTop: "4px solid #f5a623", borderRight: "4px solid #f5a623" },
          { bottom: -3, left: -3, borderBottom: "4px solid #f5a623", borderLeft: "4px solid #f5a623" },
          { bottom: -3, right: -3, borderBottom: "4px solid #f5a623", borderRight: "4px solid #f5a623" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: "20px", height: "20px", borderRadius: "2px", ...s }} />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: "16px", left: 0, right: 0, textAlign: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", background: "rgba(0,0,0,0.6)", padding: "6px 16px", borderRadius: "20px" }}>
          📷 Point camera at QR code
        </span>
      </div>
    </div>
  );
}

function TabToggle({ cameraMode, setCameraMode }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
      {[["📷 Camera", true], ["⌨️ Manual", false]].map(([label, mode]) => (
        <button key={label} onClick={() => setCameraMode(mode)} style={{
          flex: 1, padding: "10px", borderRadius: "12px",
          fontWeight: 700, fontSize: "13px", cursor: "pointer",
          border: cameraMode === mode ? "2px solid #f5a623" : "1px solid rgba(255,255,255,0.1)",
          background: cameraMode === mode ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)",
          color: cameraMode === mode ? "#f5a623" : "rgba(255,255,255,0.4)",
        }}>{label}</button>
      ))}
    </div>
  );
}

function ResultCard({ result }) {
  if (!result) return null;
  return (
    <div style={{ background: result.color + "15", border: "2px solid " + result.color + "44", borderRadius: "20px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
      <div style={{ fontSize: "56px", marginBottom: "10px" }}>{result.icon}</div>
      <div style={{ color: result.color, fontWeight: 800, fontSize: "22px", marginBottom: "6px" }}>{result.title}</div>
      {result.holder && <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", marginBottom: "4px" }}>👤 {result.holder}</div>}
      {result.seat   && <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>🎫 {result.seat}</div>}
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{result.msg}</div>
    </div>
  );
}

// ── Door Staff Login ──────────────────────────────────────────
export function DoorStaffLogin() {
  const setScreen            = useStore(s => s.setScreen);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const doorCode             = useStore(s => s.doorCode);
  const setDoorCode          = useStore(s => s.setDoorCode);
  const doorCodeError        = useStore(s => s.doorCodeError);
  const desktop = isDesktop();

  return (
    // <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pt-4 px-6">

      <div style={{ width: "100%", maxWidth: desktop ? "440px" : "100%", }} >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {/* <div style={{ fontSize: "60px" }}>🎟️</div> */}
          {/* <div className="text-2xl font-bold tracking-widest mb-3" style={{ color: "#000000" }}>MASTER EVENTS</div> */}
          <h2 className="text-center text-4xl font-black text-gray-900 mb-0 px-6 py-8 ">LOGIN</h2>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#000000", marginBottom: "5px" }}>Door Staff Access</div>
          <div style={{ fontSize: "13px", color: "#000000" }}>Enter your invite code from the event organizer</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(245,166,35,0.15)", boxShadow: desktop ? "0 20px 60px rgba(0,0,0,0.4)" : "none" }}>
          <input
            value={doorCode}
            onChange={e => setDoorCode(e.target.value.toUpperCase())}
            placeholder="e.g. DOOR-A7K9M2"
            style={{ width: "100%", padding: "18px 20px", outline: "none", marginBottom: "12px", border: "2px solid " + (doorCodeError ? "#e74c3c" : "rgba(245,166,35,0.5)"), borderRadius: "16px", fontSize: "20px", fontWeight: 700, textAlign: "center", fontFamily: "monospace", boxSizing: "border-box", letterSpacing: "3px", background: "rgba(255,255,255,0.06)", color: "#fff", caretColor: "#f5a623" }}
          />
          {doorCodeError && (
            <div style={{ color: "#ff6b6b", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>⚠️ {doorCodeError}</div>
          )}
          <button onClick={handleDoorStaffLogin}
            style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "50px", fontSize: "15px", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(245,166,35,0.35)", marginBottom: "16px" }}>
            ENTER EVENT
          </button>
          <div onClick={() => setScreen("login")} style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
            Are you an attendee? Log in here
          </div>
        </div>
      </div>
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
  const desktop = isDesktop();

  const processId = async (id) => {
    if (!id || verifying) return;
    setVerifying(true);
    setResult(null);
    const res = await verifyTicketAPI(id, doorStaffUser?.eventId);
    setResult(res);
    if (res.status === "valid") {
      setAdmittedList(prev => [
        { id, holder: res.holder, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
        ...prev.slice(0, 9),
      ]);
    }
    setVerifying(false);
    setScanInput("");
  };

  return (
    <div style={{ background: "linear-gradient(160deg, #0d0700 0%, #080500 100%)", minHeight: "100%", paddingBottom: "40px" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(245,166,35,0.2)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>🔍 Door Scanner</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{doorStaffUser?.eventName || "Event"} · {admittedList.length} admitted</div>
        </div>
        <button onClick={handleLogout} style={{ padding: "8px 14px", background: "rgba(231,76,60,0.15)", color: "#ff6b6b", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          Exit
        </button>
      </div>

      {/* Content — max width on desktop */}
      <div style={{ maxWidth: desktop ? "760px" : "100%", margin: "0 auto", padding: "16px 20px" }}>

        {desktop ? (
          /* Desktop — two column layout */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left — scanner */}
            <div>
              <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />
              {cameraMode ? (
                <div style={{ marginBottom: "14px" }}>
                  <QRScanner onScan={processId} />
                  {verifying && (
                    <div style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px", fontWeight: 600 }}>
                      ⛓ Verifying on blockchain...
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(245,166,35,0.15)" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Enter ticket ID or paste QR data</div>
                  <input
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && processId(scanInput)}
                    placeholder="TKT-XXXXXXXX or MASTER-EVENTS:..."
                    style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(245,166,35,0.4)", borderRadius: "12px", color: "#fff", fontSize: "13px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px", caretColor: "#f5a623" }}
                  />
                  <button onClick={() => processId(scanInput)}
                    style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1 }}>
                    {verifying ? "⛓ Verifying..." : "VERIFY TICKET"}
                  </button>
                </div>
              )}
              <ResultCard result={result} />
            </div>

            {/* Right — admitted list */}
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "14px" }}>ADMITTED TODAY</div>
              {admittedList.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "40px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No one admitted yet</div>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(245,166,35,0.1)" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>✅ Admitted ({admittedList.length})</div>
                  {admittedList.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>👤 {a.holder}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile — single column */
          <>
            <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />
            {cameraMode ? (
              <div style={{ marginBottom: "14px" }}>
                <QRScanner onScan={processId} />
                {verifying && (
                  <div style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px", fontWeight: 600 }}>
                    ⛓ Verifying on blockchain...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(245,166,35,0.15)" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Enter ticket ID or paste QR data</div>
                <input
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && processId(scanInput)}
                  placeholder="TKT-XXXXXXXX or MASTER-EVENTS:..."
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(245,166,35,0.4)", borderRadius: "12px", color: "#fff", fontSize: "13px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px", caretColor: "#f5a623" }}
                />
                <button onClick={() => processId(scanInput)}
                  style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1 }}>
                  {verifying ? "⛓ Verifying..." : "VERIFY TICKET"}
                </button>
              </div>
            )}
            <ResultCard result={result} />
            {admittedList.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(245,166,35,0.1)" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>✅ Admitted ({admittedList.length})</div>
                {admittedList.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{a.holder}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Organizer Scan ────────────────────────────────────────────
export function OrganizerScan() {
  const setScreen = useStore(s => s.setScreen);
  const [scanInput, setScanInput]       = useState("");
  const [result, setResult]             = useState(null);
  const [verifying, setVerifying]       = useState(false);
  const [admittedList, setAdmittedList] = useState([]);
  const [cameraMode, setCameraMode]     = useState(true);
  const desktop = isDesktop();

  const processId = async (id) => {
    if (!id || verifying) return;
    setVerifying(true);
    setResult(null);
    const res = await verifyTicketAPI(id, null);
    setResult(res);
    if (res.status === "valid") {
      setAdmittedList(prev => [
        { id, holder: res.holder, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
        ...prev.slice(0, 9),
      ]);
    }
    setVerifying(false);
    setScanInput("");
  };

  return (
    <div style={{ background: "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)", minHeight: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", borderBottom: "1px solid rgba(245,166,35,0.15)" }}>
        <button onClick={() => setScreen("orgEventDetail")}
          style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", border: "none", cursor: "pointer", color: "#f5a623", fontSize: "18px", flexShrink: 0 }}>←</button>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>Scan Tickets</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{admittedList.length} admitted so far</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: desktop ? "760px" : "100%", margin: "0 auto", padding: "16px 20px" }}>
        {desktop ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left — scanner */}
            <div>
              <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />
              {cameraMode ? (
                <div style={{ marginBottom: "14px" }}>
                  <QRScanner onScan={processId} />
                  {verifying && <div style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px" }}>⛓ Verifying...</div>}
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Enter ticket ID or paste QR data</div>
                  <input
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && processId(scanInput)}
                    placeholder="TKT-XXXXXXXX or MASTER-EVENTS:..."
                    style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(245,166,35,0.4)", borderRadius: "12px", color: "#fff", fontSize: "13px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px", caretColor: "#f5a623" }}
                  />
                  <button onClick={() => processId(scanInput)}
                    style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1 }}>
                    {verifying ? "⛓ Verifying..." : "🔍 VERIFY"}
                  </button>
                </div>
              )}
              <ResultCard result={result} />
            </div>

            {/* Right — admitted */}
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "14px" }}>ADMITTED TODAY</div>
              {admittedList.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "40px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No one admitted yet</div>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(245,166,35,0.1)" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>✅ Admitted ({admittedList.length})</div>
                  {admittedList.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>👤 {a.holder}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile */
          <>
            <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />
            {cameraMode ? (
              <div style={{ marginBottom: "14px" }}>
                <QRScanner onScan={processId} />
                {verifying && <div style={{ color: "#f5a623", textAlign: "center", marginTop: "12px", fontSize: "13px" }}>⛓ Verifying...</div>}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Enter ticket ID or paste QR data</div>
                <input
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && processId(scanInput)}
                  placeholder="TKT-XXXXXXXX or MASTER-EVENTS:..."
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(245,166,35,0.4)", borderRadius: "12px", color: "#fff", fontSize: "13px", fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: "10px", caretColor: "#f5a623" }}
                />
                <button onClick={() => processId(scanInput)}
                  style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "14px", cursor: "pointer", opacity: verifying ? 0.7 : 1 }}>
                  {verifying ? "⛓ Verifying..." : "🔍 VERIFY"}
                </button>
              </div>
            )}
            <ResultCard result={result} />
            {admittedList.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(245,166,35,0.1)" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>✅ Admitted ({admittedList.length})</div>
                {admittedList.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{a.holder}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}