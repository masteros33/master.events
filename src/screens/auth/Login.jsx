import React, { useState } from "react";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";

const inputStyle = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "#fff", border: "1.5px solid #f0f0f0",
  borderRadius: "14px", fontSize: "15px", color: "#1a1a1a",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const btnStyle = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "15px", fontWeight: 700, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,166,35,0.28)", marginBottom: "12px",
};

function ForgotPassword({ onBack }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSend = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error || "Something went wrong");
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  if (sent) return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "60px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: "rgba(39,174,96,0.1)", border: "2px solid rgba(39,174,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px" }}>📧</div>
      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "10px" }}>Check your email</h2>
      <p style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px", maxWidth: "280px" }}>
        We sent a password reset link to <strong>{email}</strong>
      </p>
      <button onClick={onBack} style={{ ...btnStyle, width: "auto", padding: "14px 32px" }}>Back to Login</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "60px 28px 40px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#f5a623", fontSize: "16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "6px", padding: 0, fontWeight: 600 }}>← Back</button>
      <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", marginBottom: "16px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🔐</div>
      <h1 style={{ color: "#1a1a1a", fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Forgot Password?</h1>
      <p style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.5, marginBottom: "28px" }}>Enter your email and we'll send a reset link</p>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Email Address</div>
      <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()} style={inputStyle} autoComplete="email" />
      {error && <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", color: "#e74c3c", fontSize: "13px" }}>⚠️ {error}</div>}
      <button onClick={handleSend} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </div>
  );
}

export default function Login() {
  const email       = useStore(s => s.email);
  const password    = useStore(s => s.password);
  const loginError  = useStore(s => s.loginError);
  const setEmail    = useStore(s => s.setEmail);
  const setPassword = useStore(s => s.setPassword);
  const handleLogin = useStore(s => s.handleLogin);
  const setScreen   = useStore(s => s.setScreen);
  const [loading, setLoading]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const onLogin = async () => { setLoading(true); await handleLogin(); setLoading(false); };

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "60px 28px 40px", display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
        <h1 style={{ color: "#1a1a1a", fontSize: "28px", fontWeight: 800, marginBottom: "4px", letterSpacing: "-0.5px" }}>Master Events</h1>
        <p style={{ color: "#aaa", fontSize: "13px", letterSpacing: "2px", fontWeight: 500 }}>IF NOT NOW, WHEN?</p>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Email</div>
      <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
        style={inputStyle} autoComplete="email" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b" }}>Password</div>
        <div onClick={() => setShowForgot(true)} style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>Forgot password?</div>
      </div>
      <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onLogin()} style={inputStyle} autoComplete="current-password" />

      {loginError && (
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", color: "#e74c3c", fontSize: "13px" }}>
          ⚠️ {loginError}
        </div>
      )}
      {loading && (
        <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "14px", padding: "12px", marginBottom: "14px", textAlign: "center" }}>
          <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 600 }}>⏳ Logging in...</div>
          <div style={{ color: "#aaa", fontSize: "11px", marginTop: "4px" }}>First load may take ~30s</div>
        </div>
      )}

      <button onClick={onLogin} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1, marginTop: "8px" }}>
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center" }}>
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