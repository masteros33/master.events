import React, { useState } from "react";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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
    <div style={{ minHeight: "100%", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: "rgba(39,174,96,0.1)", border: "2px solid rgba(39,174,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px" }}>📧</div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "10px" }}>Check your email</h2>
        <p style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px" }}>
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <button onClick={onBack} style={{ padding: "14px 32px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#f5a623", fontSize: "15px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "6px", padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "16px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🔐</div>
        <h1 style={{ color: "#1a1a1a", fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>Forgot Password?</h1>
        <p style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.5, marginBottom: "28px" }}>Enter your email and we'll send you a reset link</p>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Email Address</div>
        <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          style={{ width: "100%", padding: "14px 18px", marginBottom: "14px", background: "#fff", border: "2px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", caretColor: "#f5a623" }} />
        {error && <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", color: "#e74c3c", fontSize: "13px" }}>⚠️ {error}</div>}
        <button onClick={handleSend} disabled={loading}
          style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  const email        = useStore(s => s.email);
  const password     = useStore(s => s.password);
  const loginError   = useStore(s => s.loginError);
  const setEmail     = useStore(s => s.setEmail);
  const setPassword  = useStore(s => s.setPassword);
  const handleLogin  = useStore(s => s.handleLogin);
  const setScreen    = useStore(s => s.setScreen);
  const [loading, setLoading]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const desktop = isDesktop();

  const onLogin = async () => { setLoading(true); await handleLogin(); setLoading(false); };

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  return (
    <div style={{ minHeight: "100%", background: desktop ? "linear-gradient(160deg, #fffcf5 0%, #fff8f0 50%, #fff 100%)" : "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: desktop ? "60px 40px" : "0" }}>

      {/* Desktop — two column */}
      {desktop ? (
        <div style={{ display: "flex", gap: "80px", alignItems: "center", maxWidth: "900px", width: "100%" }}>
          {/* Left branding */}
          <div style={{ flex: 1 }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
            <div style={{ fontSize: "13px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px" }}>MASTER EVENTS GHANA</div>
            <h1 style={{ fontSize: "48px", fontWeight: 900, color: "#1a1a1a", lineHeight: 1.05, marginBottom: "16px", letterSpacing: "-1.5px" }}>
              Welcome<br /><span style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>back.</span>
            </h1>
            <p style={{ color: "#6b6b6b", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", maxWidth: "340px" }}>
              Your NFT tickets and events are waiting. Every ticket secured on Polygon blockchain.
            </p>
            {[["⛓️", "NFT on Polygon", "Every ticket blockchain-verified"],
              ["💰", "95% to organizers", "Only 5% platform fee"],
              ["📱", "MoMo & VISA", "Pay the Ghanaian way"]].map(([icon, title, sub]) => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#1a1a1a" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#aaa" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — login card */}
          <div style={{ width: "420px", flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: "28px", padding: "44px 40px", border: "2px solid #f0ebe0", boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(245,166,35,0.08)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px", letterSpacing: "-0.3px" }}>Log in</h2>
              <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "28px" }}>Enter your username and password</p>

              <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Username or Email</div>
              <input placeholder="username or you@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "14px 18px", marginBottom: "14px", background: "#fafafa", border: "2px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", caretColor: "#f5a623" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b" }}>Password</div>
                <div onClick={() => setShowForgot(true)} style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>Forgot password?</div>
              </div>
              <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin()}
                style={{ width: "100%", padding: "14px 18px", marginBottom: "14px", background: "#fafafa", border: "2px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", caretColor: "#f5a623" }} />

              {loginError && <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", color: "#e74c3c", fontSize: "13px" }}>⚠️ {loginError}</div>}
              {loading && (
                <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "12px", padding: "12px", marginBottom: "14px", textAlign: "center" }}>
                  <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 600 }}>⏳ Logging in... first load may take ~30s</div>
                </div>
              )}

              <button onClick={onLogin} disabled={loading}
                style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 28px rgba(245,166,35,0.35)", opacity: loading ? 0.7 : 1, marginBottom: "16px" }}>
                {loading ? "Logging in..." : "Log In →"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
                <span style={{ color: "#ccc", fontSize: "12px" }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
              </div>

              <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center", marginBottom: "8px" }}>
                No account? <span onClick={() => setScreen("signup")} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>Sign up free</span>
              </p>
              <p style={{ color: "#bbb", fontSize: "12px", textAlign: "center" }}>
                Door staff? <span onClick={() => setScreen("doorStaffLogin")} style={{ color: "#6b6b6b", fontWeight: 600, cursor: "pointer" }}>Enter with invite code</span>
              </p>
            </div>

            {/* Dev helper */}
            <div style={{ marginTop: "16px", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, marginBottom: "8px", letterSpacing: "1px" }}>⚡ QUICK LOGIN (DEV)</div>
              <div onClick={() => { setEmail("jude@test.com"); setPassword("test1234"); }}
                style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", padding: "4px 0" }}>
                <span style={{ fontSize: "12px", color: "#aaa" }}>jude@test.com / test1234</span>
                <span style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700 }}>Organizer</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile — clean full screen */
        <div style={{ width: "100%", minHeight: "100vh", background: "#f8f8f6", padding: "60px 28px 40px", display: "flex", flexDirection: "column" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
            <h1 style={{ color: "#1a1a1a", fontSize: "28px", fontWeight: 800, marginBottom: "4px", letterSpacing: "-0.5px" }}>Master Events</h1>
            <p style={{ color: "#aaa", fontSize: "13px", letterSpacing: "2px", fontWeight: 500 }}>IF NOT NOW, WHEN?</p>
          </div>

          <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Username or Email</div>
          <input placeholder="username or you@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "14px 18px", marginBottom: "14px", background: "#fff", border: "2px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", caretColor: "#f5a623" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b" }}>Password</div>
            <div onClick={() => setShowForgot(true)} style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>Forgot password?</div>
          </div>
          <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onLogin()}
            style={{ width: "100%", padding: "14px 18px", marginBottom: "14px", background: "#fff", border: "2px solid #f0f0f0", borderRadius: "14px", fontSize: "15px", color: "#1a1a1a", outline: "none", boxSizing: "border-box", caretColor: "#f5a623" }} />

          {loginError && <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", color: "#e74c3c", fontSize: "13px" }}>⚠️ {loginError}</div>}
          {loading && (
            <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "14px", padding: "12px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 600 }}>⏳ Logging in...</div>
              <div style={{ color: "#aaa", fontSize: "11px", marginTop: "4px" }}>First load may take ~30s</div>
            </div>
          )}

          <button onClick={onLogin} disabled={loading}
            style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", boxShadow: "0 8px 24px rgba(245,166,35,0.28)", opacity: loading ? 0.7 : 1, marginBottom: "12px" }}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center", marginBottom: "8px" }}>
            No account? <span onClick={() => setScreen("signup")} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>Sign up free</span>
          </p>
          <p style={{ color: "#bbb", fontSize: "12px", textAlign: "center" }}>
            Door staff? <span onClick={() => setScreen("doorStaffLogin")} style={{ color: "#6b6b6b", fontWeight: 600, cursor: "pointer" }}>Enter with invite code</span>
          </p>

          <div style={{ marginTop: "32px", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, marginBottom: "10px", letterSpacing: "1px" }}>⚡ QUICK LOGIN (DEV)</div>
            <div onClick={() => { setEmail("jude@test.com"); setPassword("test1234"); }}
              style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", cursor: "pointer" }}>
              <span style={{ fontSize: "12px", color: "#aaa" }}>jude@test.com / test1234</span>
              <span style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700 }}>Organizer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}