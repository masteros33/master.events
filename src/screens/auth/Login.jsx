import React, { useState } from "react";
import useStore from "../../store/useStore";

const darkInput = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,166,35,0.2)",
  borderRadius: "14px", fontSize: "14px", color: "#fff",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623",
};

const darkBtn = {
  width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "50px", fontSize: "15px",
  fontWeight: 800, cursor: "pointer", marginBottom: "8px",
  boxShadow: "0 8px 24px rgba(245,166,35,0.35)",
};

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
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)", padding: "60px 28px 40px", textAlign: "center", overflowY: "auto" }}>
      <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎟️</div>
      <h1 style={{ color: "#f5a623", fontSize: "32px", fontWeight: 900, marginBottom: "4px", letterSpacing: "-0.5px" }}>Master Events</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "40px", letterSpacing: "3px" }}>IF NOT NOW, WHEN?</p>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ ...darkInput, caretColor: "#f5a623" }}
        autoComplete="email"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onLogin()}
        style={{ ...darkInput, caretColor: "#f5a623" }}
        autoComplete="current-password"
      />

      {loginError && (
        <div style={{ color: "#ff6b6b", fontSize: "13px", marginBottom: "14px", background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", padding: "10px 14px", borderRadius: "10px", textAlign: "left" }}>
          ⚠️ {loginError}
        </div>
      )}

      {loading && (
        <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "14px", textAlign: "center" }}>
          <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 600 }}>⏳ Logging in...</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "4px" }}>This may take a moment on first load</div>
        </div>
      )}

      <button onClick={onLogin} disabled={loading} style={{ ...darkBtn, opacity: loading ? 0.7 : 1 }}>
        {loading ? "⏳ Logging in..." : "LOG IN"}
      </button>

      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "20px" }}>
        No account?{" "}
        <span onClick={() => setScreen("signup")} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>
          Sign up free
        </span>
      </p>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "12px" }}>
        Door staff?{" "}
        <span onClick={() => setScreen("doorStaffLogin")} style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, cursor: "pointer" }}>
          Enter with invite code
        </span>
      </p>

      <div style={{ marginTop: "32px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "16px", padding: "16px", textAlign: "left" }}>
        <div style={{ fontSize: "11px", color: "rgba(245,166,35,0.6)", fontWeight: 700, marginBottom: "10px", letterSpacing: "1px" }}>⚡ QUICK LOGIN (DEV ONLY)</div>
        {[["jude@test.com", "test1234", "Organizer"]].map(([e, p, role]) => (
          <div key={e} onClick={() => { setEmail(e); setPassword(p); }}
            style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{e} / {p}</span>
            <span style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700 }}>{role}</span>
          </div>
        ))}
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "10px" }}>
          Or create a new account via Sign up 👆
        </div>
      </div>
    </div>
  );
}