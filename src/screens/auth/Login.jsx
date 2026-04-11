import React, { useState } from "react";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";

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
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fffcf5 0%, #fff8f0 100%)", padding: "24px", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>📧</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111", margin: "0 0 12px" }}>Check your email</h2>
        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>We sent a reset link to <strong style={{ color: "#111" }}>{email}</strong></p>
        <button onClick={onBack} style={{ padding: "12px 32px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fffcf5 0%, #fff8f0 100%)", padding: "24px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, color: "#f5a623", fontWeight: 700, fontSize: 14, marginBottom: 24, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
          ← Back to Login
        </button>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1.5px solid #f0f0f0", padding: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16, background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 6px" }}>Forgot Password?</h1>
          <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 24px" }}>Enter your email and we'll send a reset link</p>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Email Address</label>
          <input
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0f0f0", fontSize: 14, outline: "none", marginBottom: 16, background: "#fafafa", boxSizing: "border-box", caretColor: "#f5a623" }}
          />
          {error && <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          <button onClick={handleSend} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f5a623, #e8920f)", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </div>
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
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", background: "#fff" }}>

      {/* ── Left — Branding (desktop only) ── */}
      <div style={{ flex: "0 0 50%", display: "none", flexDirection: "column", justifyContent: "center", padding: "64px", background: "linear-gradient(160deg, #fffcf5 0%, #fff8f0 60%, #fff 100%)" }}
        className="login-left-panel">
        <div style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 24, boxShadow: "0 8px 24px rgba(245,166,35,0.3)", background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12, color: "#f5a623" }}>MASTER EVENTS GHANA</div>

        <h1 style={{ fontWeight: 900, color: "#111", lineHeight: 1, marginBottom: 16, fontSize: 52, letterSpacing: "-2px" }}>
          Welcome<br />
          <span style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>back.</span>
        </h1>

        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          Your NFT tickets and events are waiting. Every ticket is secured on Polygon blockchain — yours forever.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["⛓️", "NFT on Polygon",    "Every ticket blockchain-verified and unfakeable"],
            ["💰", "95% to organizers", "Only 5% platform fee, withdraw via MoMo"],
            ["📱", "MoMo & VISA",       "Pay the Ghanaian way — mobile money or card"],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)" }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
          {[["10K+","Tickets Sold"],["50+","Events"],["0%","Fake Tickets"]].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Login Form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "linear-gradient(135deg, #fffcf5 0%, #fafafa 100%)", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }} className="login-mobile-logo">
            <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)", background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: 0 }}>Master Events</h1>
            <p style={{ color: "#aaa", fontSize: 11, letterSpacing: "0.15em", marginTop: 4 }}>IF NOT NOW, WHEN?</p>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 48px rgba(0,0,0,0.1)", border: "1.5px solid #f0f0f0", padding: "36px 40px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 6px" }}>Log in</h2>
            <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 28px" }}>Enter your username and password to continue</p>

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Username or Email</label>
            <input
              placeholder="username or you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0f0f0", fontSize: 14, outline: "none", marginBottom: 20, background: "#fafafa", boxSizing: "border-box", caretColor: "#f5a623" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</label>
              <span onClick={() => setShowForgot(true)} style={{ fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#f5a623" }}>Forgot password?</span>
            </div>
            <input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onLogin()}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0f0f0", fontSize: 14, outline: "none", marginBottom: 20, background: "#fafafa", boxSizing: "border-box", caretColor: "#f5a623" }}
            />

            {loginError && (
              <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
                ⚠️ {loginError}
              </div>
            )}
            {loading && (
              <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f5a623", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
                ⏳ Logging in... first load may take ~30s
              </div>
            )}

            <button onClick={onLogin} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: 14, fontWeight: 700, color: "#fff", fontSize: 15, border: "none", cursor: "pointer", marginBottom: 20, background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.35)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Logging in..." : "Log In →"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
              <span style={{ color: "#ccc", fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
            </div>

            <p style={{ textAlign: "center", fontSize: 14, color: "#aaa", margin: "0 0 8px" }}>
              No account?{" "}
              <span onClick={() => setScreen("signup")} style={{ fontWeight: 700, cursor: "pointer", color: "#f5a623" }}>Sign up free</span>
            </p>
            <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", margin: 0 }}>
              Door staff?{" "}
              <span onClick={() => setScreen("doorStaffLogin")} style={{ fontWeight: 600, color: "#888", cursor: "pointer" }}>Enter with invite code</span>
            </p>
          </div>

          {/* Dev quick login */}
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 16, border: "1.5px solid #f0f0f0", padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12, color: "#f5a623" }}>⚡ QUICK LOGIN (DEV)</div>
            <div onClick={() => { setEmail("jude@test.com"); setPassword("test1234"); }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>jude@test.com / test1234</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f5a623" }}>Organizer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 1024px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}