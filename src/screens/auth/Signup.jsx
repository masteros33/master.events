import React from "react";
import useStore from "../../store/useStore";
import { inputStyle, btnStyle } from "../../styles/common";

export function Signup() {
  const fullName = useStore(s => s.fullName);
  const signupEmail = useStore(s => s.signupEmail);
  const signupPassword = useStore(s => s.signupPassword);
  const setFullName = useStore(s => s.setFullName);
  const setSignupEmail = useStore(s => s.setSignupEmail);
  const setSignupPassword = useStore(s => s.setSignupPassword);
  const handleSignup = useStore(s => s.handleSignup);
  const setScreen = useStore(s => s.setScreen);
  return (
    <div style={{ padding: "60px 28px", textAlign: "center" }}>
      <h1 style={{ color: "#f5a623", fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>Create Account</h1>
      <p style={{ color: "#bbb", fontSize: "13px", marginBottom: "36px" }}>Join thousands of event-goers in Ghana</p>
      <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
      <input placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} style={inputStyle} />
      <input placeholder="Password" type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} style={inputStyle} />
      <button onClick={handleSignup} style={btnStyle}>CREATE ACCOUNT</button>
      <p style={{ color: "#999", fontSize: "13px", marginTop: "20px" }}>Already have an account? <span onClick={() => setScreen("login")} style={{ color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>Log in</span></p>
    </div>
  );
}

export function RoleSelect() {
  const handleSelectRole = useStore(s => s.handleSelectRole);
  return (
    <div style={{ padding: "60px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111", marginBottom: "8px" }}>You are in!</h2>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "40px" }}>How will you use Master Events?</p>
      {[
        { role: "attendee", icon: "🎟️", title: "I am an Attendee", sub: "Browse events, buy tickets, resell and transfer" },
        { role: "organizer", icon: "🎪", title: "I am an Organizer", sub: "Create events, sell tickets, manage door access" },
      ].map(item => (
        <div key={item.role} onClick={() => handleSelectRole(item.role)} style={{ background: "#fff", border: "2px solid #f5a62344", borderRadius: "20px", padding: "20px", marginBottom: "14px", cursor: "pointer", textAlign: "left", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "52px", height: "52px", background: "#fff9f0", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#111", marginBottom: "4px" }}>{item.title}</div>
            <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.5 }}>{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
