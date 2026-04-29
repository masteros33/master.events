import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import ThemeToggle from "../../components/ThemeToggle";

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
      const res  = await fetch(`${API}/api/auth/forgot-password/`, {
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: "420px", width: "100%", background: "var(--bg-card)", borderRadius: "24px", padding: "48px 40px", textAlign: "center", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px" }}>📧</div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Check your email</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px" }}>
          We sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>
        </p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onBack}
          style={{ padding: "14px 32px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
          Back to Login
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: "420px", width: "100%", background: "var(--bg-card)", borderRadius: "24px", padding: "48px 40px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
        <motion.button whileHover={{ x: -3 }} onClick={onBack}
          style={{ background: "none", border: "none", color: "#f5a623", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px", padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px", boxShadow: "var(--shadow-brand)" }}>🔐</div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Forgot Password?</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>Enter your email and we'll send a reset link</p>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>Email Address</label>
        <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          style={{ width: "100%", padding: "14px 18px", marginBottom: "14px", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
          autoComplete="email" />
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", color: "var(--error)", fontSize: "13px" }}>
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={handleSend} disabled={loading}
          style={{ width: "100%", padding: "15px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "var(--shadow-brand)" }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </motion.div>
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
  const [showPw, setShowPw]         = useState(false);

  const onLogin = async () => { setLoading(true); await handleLogin(); setLoading(false); };

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", fontFamily: "var(--font-sans)" }}>

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex" style={{ flex: 1, background: "linear-gradient(160deg, #1a1a1a 0%, #0e0e0e 100%)", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: "18px", color: "#fff" }}>Master Events</span>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "16px" }}>WELCOME BACK</div>
          <h2 style={{ fontSize: "clamp(36px, 3vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "20px" }}>
            Your tickets<br />
            <span style={{ background: "linear-gradient(135deg, #f5a623, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              are waiting.
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", lineHeight: 1.7, maxWidth: "340px", marginBottom: "36px" }}>
            Every ticket is an NFT on Polygon — secured by blockchain, owned by you forever.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[["⛓️", "NFT on Polygon", "Blockchain-verified tickets"], ["💰", "95% to Organizers", "Only 5% platform fee"], ["📱", "MoMo & VISA", "Pay the Ghanaian way"]].map(([icon, title, sub]) => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(245,166,35,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          {[["10K+", "Tickets"], ["50+", "Events"], ["0%", "Fakes"]].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#f5a623" }}>{val}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", maxWidth: "560px", margin: "0 auto", width: "100%" }}>

        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px", marginBottom: "4px" }}>Log in</h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Welcome back to Master Events</p>
            </div>
            <ThemeToggle compact={true} />
          </div>

          {/* Google OAuth button (UI only — wire later) */}
          <motion.button whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-sans)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Form */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>Email</label>
            <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "14px 18px", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
              autoComplete="email" />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
              <motion.span whileHover={{ color: "#e8920f" }} onClick={() => setShowForgot(true)}
                style={{ fontSize: "13px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>
                Forgot password?
              </motion.span>
            </div>
            <div style={{ position: "relative" }}>
              <input placeholder="••••••••" type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin()}
                style={{ width: "100%", padding: "14px 48px 14px 18px", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
                autoComplete="current-password" />
              <button onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", padding: 0 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {loginError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "var(--error)", fontSize: "13px" }}>
                ⚠️ {loginError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "16px", textAlign: "center" }}>
                <div style={{ color: "#f5a623", fontSize: "13px", fontWeight: 600 }}>⏳ Logging in...</div>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "4px" }}>First load may take ~30s (free server)</div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 36px rgba(245,166,35,0.4)" }}
            whileTap={{ scale: 0.97 }} onClick={onLogin} disabled={loading}
            style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "var(--shadow-brand)", marginBottom: "20px", fontFamily: "var(--font-sans)" }}>
            {loading ? "Logging in..." : "Log In →"}
          </motion.button>

          <p style={{ fontSize: "14px", color: "var(--text-secondary)", textAlign: "center", marginBottom: "10px" }}>
            No account?{" "}
            <motion.span whileHover={{ color: "#e8920f" }} onClick={() => setScreen("signup")}
              style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>
              Sign up free
            </motion.span>
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
            Door staff?{" "}
            <motion.span whileHover={{ color: "#e8920f" }} onClick={() => setScreen("doorStaffLogin")}
              style={{ color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>
              Enter with invite code
            </motion.span>
          </p>

          {/* Dev quick login */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ marginTop: "32px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px" }}>
            <div style={{ fontSize: "10px", color: "#f5a623", fontWeight: 700, marginBottom: "10px", letterSpacing: "1.5px" }}>⚡ QUICK LOGIN (DEV)</div>
            <motion.div whileHover={{ background: "var(--bg-hover)" }}
              onClick={() => { setEmail("jude@test.com"); setPassword("test1234"); }}
              style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", cursor: "pointer", borderRadius: "10px", transition: "background 0.2s" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>jude@test.com / test1234</span>
              <span style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700 }}>Organizer</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}