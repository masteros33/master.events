import React from "react";
import useStore from "../../store/useStore";
import { inputStyle, btnStyle } from "../../styles/common";

export function DoorStaffLogin() {
  const doorCode = useStore(s => s.doorCode);
  const doorCodeError = useStore(s => s.doorCodeError);
  const setDoorCode = useStore(s => s.setDoorCode);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const setScreen = useStore(s => s.setScreen);
  return (
    <div style={{ padding: "60px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "52px", marginBottom: "16px" }}>🚪</div>
      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111", marginBottom: "8px" }}>Door Staff Access</h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "36px" }}>Enter your invite code from the event organizer</p>
      <input placeholder="e.g. DOOR-A7K9M2" value={doorCode} onChange={e => setDoorCode(e.target.value.toUpperCase())}
        style={{ ...inputStyle, textAlign: "center", fontSize: "20px", fontWeight: 700, letterSpacing: "4px", fontFamily: "monospace" }} />
      {doorCodeError && <div style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "16px" }}>⚠️ {doorCodeError}</div>}
      <button onClick={handleDoorStaffLogin} style={btnStyle}>ENTER EVENT</button>
      <p style={{ color: "#999", fontSize: "13px", marginTop: "20px" }}>
        Are you an attendee?{" "}
        <span onClick={() => setScreen("login")} style={{ color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>Log in here</span>
      </p>
    </div>
  );
}

export function DoorStaffScan() {
  const doorStaffUser = useStore(s => s.doorStaffUser);
  const scanInput = useStore(s => s.scanInput);
  const scanResult = useStore(s => s.scanResult);
  const verifying = useStore(s => s.verifying);
  const admittedList = useStore(s => s.admittedList);
  const setScanInput = useStore(s => s.setScanInput);
  const handleScan = useStore(s => s.handleScan);
  const handleAdmit = useStore(s => s.handleAdmit);
  const setScanResult = useStore(s => s.setScanResult);
  const handleLogout = useStore(s => s.handleLogout);

  return (
    <div style={{ background: "#111", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ background: "#1a1a1a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>🚪 Door Staff</div>
          <div style={{ color: "#888", fontSize: "12px" }}>{doorStaffUser?.eventName || "Event"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#27ae60", fontWeight: 800, fontSize: "22px" }}>{admittedList.length}</div>
          <div style={{ color: "#888", fontSize: "11px" }}>Admitted</div>
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ background: "#1a1a1a", borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Enter Ticket ID</div>
          <input value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())} placeholder="e.g. TKT-001-GH"
            style={{ ...inputStyle, background: "#2a2a2a", border: "2px solid #f5a623", color: "#fff", fontFamily: "monospace", fontSize: "16px", letterSpacing: "2px" }} />
          <button onClick={() => handleScan(scanInput)} style={{ ...btnStyle, marginTop: "12px" }} disabled={verifying}>
            {verifying ? "⏳ Checking blockchain..." : "🔍 VERIFY TICKET"}
          </button>
        </div>

        {scanResult && (
          <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "16px 20px", background: scanResult.status === "valid" ? "#27ae60" : scanResult.status === "already_used" ? "#e74c3c" : scanResult.status === "wrong_event" ? "#f39c12" : "#c0392b" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>
                {scanResult.status === "valid" && "✅ VALID TICKET"}
                {scanResult.status === "already_used" && "🚫 ALREADY REDEEMED"}
                {scanResult.status === "wrong_event" && "⚠️ WRONG EVENT"}
                {scanResult.status === "not_found" && "❌ TICKET NOT FOUND"}
              </div>
            </div>
            <div style={{ background: "#1a1a1a", padding: "16px 20px" }}>
              {scanResult.status === "valid" && (
                <>
                  {[["Ticket ID", scanResult.ticketId], ["Holder", scanResult.holder], ["Event", scanResult.event], ["Token ID", scanResult.tokenId]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: "#888", fontSize: "12px" }}>{k}</span>
                      <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: k === "Token ID" ? "monospace" : "sans-serif" }}>{v}</span>
                    </div>
                  ))}
                  {scanResult.transferred && (
                    <div style={{ background: "#2980b922", border: "1px solid #2980b9", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
                      <div style={{ color: "#2980b9", fontSize: "11px", fontWeight: 700 }}>🔄 Transferred Ticket</div>
                      <div style={{ color: "#aaa", fontSize: "11px" }}>Original: {scanResult.originalHolder} → Current: {scanResult.holder}</div>
                    </div>
                  )}
                  <button onClick={() => handleAdmit(scanResult)} style={{ ...btnStyle, background: "#27ae60" }}>✅ ADMIT GUEST</button>
                </>
              )}
              {scanResult.status === "already_used" && (
                <div style={{ color: "#e74c3c", fontSize: "13px", lineHeight: 1.6 }}>This ticket was already scanned and redeemed. Do not admit.</div>
              )}
              {scanResult.status === "wrong_event" && (
                <div style={{ color: "#f39c12", fontSize: "13px", lineHeight: 1.6 }}>This ticket is valid but for <span style={{ fontWeight: 700 }}>{scanResult.event}</span>. Not for this event.</div>
              )}
              {scanResult.status === "not_found" && (
                <div style={{ color: "#e74c3c", fontSize: "13px", lineHeight: 1.6 }}>Ticket not found on blockchain. May be fake or invalid.</div>
              )}
              <button onClick={() => setScanResult(null)} style={{ ...btnStyle, background: "transparent", border: "2px solid #555", color: "#aaa", marginTop: "10px" }}>SCAN NEXT</button>
            </div>
          </div>
        )}

        {admittedList.length > 0 && (
          <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "16px" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Session Log ({admittedList.length})</div>
            {admittedList.slice().reverse().map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2a2a" }}>
                <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 600 }}>✅ {a.holder}</span>
                <span style={{ color: "#888", fontSize: "11px", fontFamily: "monospace" }}>{a.ticketId}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "0 20px" }}>
        <button onClick={handleLogout} style={{ ...btnStyle, background: "transparent", border: "2px solid #555", color: "#aaa" }}>END SESSION</button>
      </div>
    </div>
  );
}

export function OrganizerScan() {
  const scanInput = useStore(s => s.scanInput);
  const scanResult = useStore(s => s.scanResult);
  const verifying = useStore(s => s.verifying);
  const admittedList = useStore(s => s.admittedList);
  const setScanInput = useStore(s => s.setScanInput);
  const handleScan = useStore(s => s.handleScan);
  const handleAdmit = useStore(s => s.handleAdmit);
  const setScanResult = useStore(s => s.setScanResult);
  const setScreen = useStore(s => s.setScreen);

  return (
    <div style={{ background: "#111", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ background: "#1a1a1a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div onClick={() => setScreen("orgEventDetail")} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: "16px" }}>←</div>
          <div>
            <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>🔍 Ticket Scanner</div>
            <div style={{ color: "#888", fontSize: "12px" }}>Organizer Mode</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#27ae60", fontWeight: 800, fontSize: "22px" }}>{admittedList.length}</div>
          <div style={{ color: "#888", fontSize: "11px" }}>Admitted</div>
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ background: "#fff9f0", border: "1px solid #f5a62344", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, marginBottom: "4px" }}>🧪 Test Ticket IDs</div>
          <div style={{ fontSize: "11px", color: "#888", lineHeight: 1.8, fontFamily: "monospace" }}>
            TKT-001-GH → ✅ Valid<br />
            TKT-002-GH → ✅ Transferred<br />
            TKT-003-GH → 🚫 Already used<br />
            TKT-004-GH → ⚠️ Wrong event
          </div>
        </div>
        <div style={{ background: "#1a1a1a", borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Enter Ticket ID</div>
          <input value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())} placeholder="e.g. TKT-001-GH"
            style={{ ...inputStyle, background: "#2a2a2a", border: "2px solid #f5a623", color: "#fff", fontFamily: "monospace", fontSize: "16px", letterSpacing: "2px" }} />
          <button onClick={() => handleScan(scanInput)} style={{ ...btnStyle, marginTop: "12px" }} disabled={verifying}>
            {verifying ? "⏳ Querying blockchain..." : "🔍 VERIFY TICKET"}
          </button>
        </div>

        {scanResult && (
          <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "16px 20px", background: scanResult.status === "valid" ? "#27ae60" : scanResult.status === "already_used" ? "#e74c3c" : scanResult.status === "wrong_event" ? "#f39c12" : "#c0392b" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>
                {scanResult.status === "valid" && "✅ VALID TICKET"}
                {scanResult.status === "already_used" && "🚫 ALREADY REDEEMED"}
                {scanResult.status === "wrong_event" && "⚠️ WRONG EVENT"}
                {scanResult.status === "not_found" && "❌ TICKET NOT FOUND"}
              </div>
            </div>
            <div style={{ background: "#1a1a1a", padding: "16px 20px" }}>
              {scanResult.status === "valid" && (
                <>
                  {[["Ticket ID", scanResult.ticketId], ["Holder", scanResult.holder], ["Event", scanResult.event], ["Token ID", scanResult.tokenId]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: "#888", fontSize: "12px" }}>{k}</span>
                      <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: k === "Token ID" ? "monospace" : "sans-serif" }}>{v}</span>
                    </div>
                  ))}
                  {scanResult.transferred && (
                    <div style={{ background: "#2980b922", border: "1px solid #2980b9", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
                      <div style={{ color: "#2980b9", fontSize: "11px", fontWeight: 700 }}>🔄 Transferred Ticket</div>
                      <div style={{ color: "#aaa", fontSize: "11px" }}>Original: {scanResult.originalHolder} → Current: {scanResult.holder}</div>
                    </div>
                  )}
                  <button onClick={() => handleAdmit(scanResult)} style={{ ...btnStyle, background: "#27ae60" }}>✅ ADMIT GUEST</button>
                </>
              )}
              {scanResult.status !== "valid" && (
                <div style={{ color: scanResult.status === "wrong_event" ? "#f39c12" : "#e74c3c", fontSize: "13px", lineHeight: 1.6 }}>
                  {scanResult.status === "already_used" && "This ticket was already scanned. Do not admit."}
                  {scanResult.status === "wrong_event" && "Valid ticket but for a different event: " + scanResult.event}
                  {scanResult.status === "not_found" && "Ticket not found on blockchain. May be fake."}
                </div>
              )}
              <button onClick={() => setScanResult(null)} style={{ ...btnStyle, background: "transparent", border: "2px solid #555", color: "#aaa", marginTop: "10px" }}>SCAN NEXT</button>
            </div>
          </div>
        )}

        {admittedList.length > 0 && (
          <div style={{ background: "#1a1a1a", borderRadius: "16px", padding: "16px" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Session Log ({admittedList.length})</div>
            {admittedList.slice().reverse().map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2a2a" }}>
                <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 600 }}>✅ {a.holder}</span>
                <span style={{ color: "#888", fontSize: "11px", fontFamily: "monospace" }}>{a.ticketId}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}