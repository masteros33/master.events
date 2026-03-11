import React from "react";
import useStore from "../../store/useStore";
import { inputStyle, btnStyle } from "../../styles/common";

export default function Login() {
  const email = useStore(s => s.email);
  const password = useStore(s => s.password);
  const setEmail = useStore(s => s.setEmail);
  const setPassword = useStore(s => s.setPassword);
  const handleLogin = useStore(s => s.handleLogin);
  const setScreen = useStore(s => s.setScreen);
  return (
    <div style={{ padding: "60px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎟️</div>
      <h1 style={{ color: "#f5a623", fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>Master Events</h1>
      <p style={{ color: "#bbb", fontSize: "13px", marginBottom: "40px" }}>IF NOT NOW, WHEN?</p>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
      <button onClick={handleLogin} style={btnStyle}>LOG IN</button>
      <p style={{ color: "#999", fontSize: "13px", marginTop: "20px" }}>
        No account?{" "}
        <span onClick={() => setScreen("signup")} style={{ color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>Sign up</span>
      </p>
      <div style={{ marginTop: "32px", background: "#f9f9f9", borderRadius: "16px", padding: "16px", textAlign: "left" }}>
        <div style={{ fontSize: "11px", color: "#aaa", fontWeight: 700, marginBottom: "10px" }}>DEMO ACCOUNTS</div>
        {[["mike@test.com", "123", "Attendee"], ["sam@test.com", "123", "Organizer"]].map(([e, p, role]) => (
          <div key={e} onClick={() => { setEmail(e); setPassword(p); }}
            style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", color: "#555" }}>{e} / {p}</span>
            <span style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700 }}>{role}</span>
          </div>
        ))}
      </div>
      <p style={{ color: "#999", fontSize: "12px", marginTop: "24px" }}>
        Door staff?{" "}
        <span onClick={() => setScreen("doorStaffLogin")} style={{ color: "#111", fontWeight: 600, cursor: "pointer" }}>Enter with invite code</span>
      </p>
    </div>
  );
}