import React, { useState } from "react";
import useStore from "../../store/useStore";

export default function Login() {
  const email = useStore(s => s.email);
  const password = useStore(s => s.password);
  const loginError = useStore(s => s.loginError);
  const setEmail = useStore(s => s.setEmail);
  const setPassword = useStore(s => s.setPassword);
  const handleLogin = useStore(s => s.handleLogin);
  const setScreen = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    await handleLogin();
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "60px 28px 40px", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
        <h1 style={{ color: "#1a1a1a", fontSize: "28px", fontWeight: 800, marginBottom: "4px", letterSpacing: "-0.5px" }}>Master Events</h1>
        <p style={{ color: "#aaa", fontSize: "13px", letterSpacing: "2px", fontWeight: 500 }}>IF NOT NOW, WHEN?</p>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Email</div>
        <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          style={{ width: "100%", padding: "14px 18px", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Password</div>
        <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onLogin()}
          autoComplete="current-password"
          style={{ width: "100%", padding: "14px 18px", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
      </div>

      {loginError && (
        <div style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "14px", background: "#fff5f5", border: "1px solid #ffd6d6", padding: "12px 16px", borderRadius: "12px", marginTop: "8px" }}>
          ⚠️ {loginError}
        </div>
      )}

      {loading && (
        <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "14px", marginTop: "8px", textAlign: "center" }}>
          <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 600 }}>⏳ Logging in...</div>
          <div style={{ color: "#aaa", fontSize: "11px", marginTop: "4px" }}>First load may take ~30s</div>
        </div>
      )}

      <button onClick={onLogin} disabled={loading}
        style={{ width: "100%", padding: "16px", background: loading ? "#ddd" : "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: "16px", boxShadow: loading ? "none" : "0 8px 24px rgba(245,166,35,0.3)", letterSpacing: "0.3px" }}>
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p style={{ color: "#aaa", fontSize: "13px", marginTop: "20px", textAlign: "center" }}>
        No account?{" "}
        <span onClick={() => setScreen("signup")} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>Sign up free</span>
      </p>
      <p style={{ color: "#bbb", fontSize: "12px", marginTop: "10px", textAlign: "center" }}>
        Door staff?{" "}
        <span onClick={() => setScreen("doorStaffLogin")} style={{ color: "#6b6b6b", fontWeight: 600, cursor: "pointer" }}>Enter with invite code</span>
      </p>

      <div style={{ marginTop: "32px", background: "#fff", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, marginBottom: "10px", letterSpacing: "1px" }}>⚡ QUICK LOGIN (DEV)</div>
        <div onClick={() => { setEmail("jude@test.com"); setPassword("test1234"); }}
          style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", cursor: "pointer" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>jude@test.com / test1234</span>
          <span style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700 }}>Organizer</span>
        </div>
      </div>
    </div>
  );
}