import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";

// ── Free Unsplash event images — login panel ──────────────────
const LOGIN_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=90",
    caption: "Thousands of events, one platform",
    sub: "Discover events across Ghana & Africa",
  },
  {
    img: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=90",
    caption: "Every ticket is an NFT",
    sub: "Blockchain-verified, impossible to fake",
  },
  {
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=90",
    caption: "Your ticket. Your ownership.",
    sub: "Transfer, resell, or show at the gate",
  },
];

function useRateLimit(maxAttempts = 5, windowMs = 60000) {
  const attempts = useRef([]);
  const check = () => {
    const now = Date.now();
    attempts.current = attempts.current.filter(t => now - t < windowMs);
    if (attempts.current.length >= maxAttempts) {
      const wait = Math.ceil((windowMs - (now - attempts.current[0])) / 1000);
      return { blocked: true, wait };
    }
    attempts.current.push(now);
    return { blocked: false };
  };
  return check;
}

function ForgotPassword({ onBack }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSend = async () => {
    if (!email.trim()) { setError("Please enter your email"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email address"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
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
          We sent a reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>
        </p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          style={{ padding: "14px 32px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)" }}>
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
          style={{ background: "none", border: "none", color: "#f5a623", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px", padding: 0, fontFamily: "var(--font-sans)" }}>
          ← Back
        </motion.button>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px", boxShadow: "var(--shadow-brand)" }}>🔐</div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Forgot Password?</h1>
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
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSend} disabled={loading}
          style={{ width: "100%", padding: "15px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)" }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </motion.div>
    </div>
  );
}

const isWide = () => typeof window !== "undefined" && window.innerWidth >= 1024;

export default function Login() {
  const email       = useStore(s => s.email);
  const password    = useStore(s => s.password);
  const loginError  = useStore(s => s.loginError);
  const setEmail    = useStore(s => s.setEmail);
  const setPassword = useStore(s => s.setPassword);
  const handleLogin = useStore(s => s.handleLogin);
  const setScreen   = useStore(s => s.setScreen);

  const [wide,       setWide]       = useState(isWide());
  const [loading,    setLoading]    = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [rateLock,   setRateLock]   = useState(null);
  const [honeypot,   setHoneypot]   = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const checkRate = useRateLimit(5, 60000);

  // Auto-advance slides every 4s
  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % LOGIN_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!rateLock) return;
    const t = setInterval(() => {
      setRateLock(prev => {
        if (prev <= 1) { clearInterval(t); return null; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [rateLock]);

  const onLogin = async () => {
    if (honeypot) return;
    const { blocked, wait } = checkRate();
    if (blocked) { setRateLock(wait); return; }
    setLoading(true);
    await handleLogin();
    setLoading(false);
  };

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", fontFamily: "var(--font-sans)" }}>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — sliding event images
      ══════════════════════════════════════════════════════ */}
      {wide && (
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          minHeight: "100vh",
        }}>
          {/* Sliding images */}
          {LOGIN_SLIDES.map((slide, i) => (
            <AnimatePresence key={i}>
              {slideIndex === i && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0 }}
                  style={{ position: "absolute", inset: 0 }}>
                  <img src={slide.img} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Gradient overlays */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.85) 100%)", zIndex: 1 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)", transform: "translate(-20%, 20%)", zIndex: 1, pointerEvents: "none" }} />

          {/* Top logo */}
          <div style={{ position: "absolute", top: "32px", left: "36px", zIndex: 2, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 16px rgba(245,166,35,0.45)" }}>🎟️</div>
            <span style={{ fontWeight: 800, fontSize: "17px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
          </div>

          {/* Bottom content */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "40px 36px" }}>

            {/* Slide caption */}
            <AnimatePresence mode="wait">
              <motion.div key={slideIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "10px", fontFamily: "var(--font-mono)" }}>
                  MASTER EVENTS · BLOCKCHAIN TICKETING
                </div>
                <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "10px" }}>
                  {LOGIN_SLIDES[slideIndex].caption}
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "28px" }}>
                  {LOGIN_SLIDES[slideIndex].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
              {LOGIN_SLIDES.map((_, i) => (
                <motion.div key={i}
                  animate={{ width: slideIndex === i ? "28px" : "6px", opacity: slideIndex === i ? 1 : 0.35 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSlideIndex(i)}
                  style={{ height: "6px", borderRadius: "3px", background: "#f5a623", cursor: "pointer" }}
                />
              ))}
            </div>

            {/* Stats strip */}
            <div style={{
              display: "flex", gap: "28px",
              padding: "14px 20px",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {[["10K+","Tickets Sold"],["50+","Events"],["0%","Fakes"],["NFT","Powered"]].map(([val, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: "#f5a623" }}>{val}</div>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — login form
      ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: wide ? "0 0 480px" : "1",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: wide ? "48px 40px" : "40px 24px",
        overflowY: "auto",
        background: "var(--bg)",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Back */}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("home")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, padding: "0 0 24px 0", fontFamily: "var(--font-sans)" }}>
            ← Back to Home
          </motion.button>

          {/* Mobile logo */}
          {!wide && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎟️</div>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Master Events</span>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px", marginBottom: "6px" }}>Welcome back</h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Log in to your Master Events account</p>
          </div>

          {/* Trust bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "11px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", marginBottom: "22px" }}>
            <span style={{ fontSize: "13px" }}>🔒</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#16a34a" }}>256-bit encrypted · Blockchain-secured · No ticket fraud</span>
          </div>

          {/* Google OAuth */}
          <motion.button whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "18px", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>or continue with email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Honeypot */}
          <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} name="website" />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", display: "block" }}>Email</label>
            <input
              placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              type="email" autoComplete="email"
              style={{ width: "100%", padding: "13px 16px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
              onFocus={e => { e.target.style.borderColor = "#f5a623"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
              <motion.span whileHover={{ color: "#e8920f" }} onClick={() => setShowForgot(true)}
                style={{ fontSize: "12px", color: "#f5a623", fontWeight: 600, cursor: "pointer" }}>
                Forgot password?
              </motion.span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                placeholder="••••••••"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && !rateLock && onLogin()}
                autoComplete="current-password"
                style={{ width: "100%", padding: "13px 46px 13px 16px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#f5a623"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "15px", padding: 0 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Rate lock */}
          <AnimatePresence>
            {rateLock && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: "11px", padding: "11px 14px", marginBottom: "14px", color: "#d97706", fontSize: "13px", fontWeight: 600 }}>
                🛡️ Too many attempts. Try again in {rateLock}s
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {loginError && !rateLock && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "11px", padding: "11px 14px", marginBottom: "14px", color: "var(--error)", fontSize: "13px" }}>
                ⚠️ {loginError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={!loading && !rateLock ? { scale: 1.02, boxShadow: "0 12px 36px rgba(245,166,35,0.4)" } : {}}
            whileTap={!loading && !rateLock ? { scale: 0.97 } : {}}
            onClick={onLogin}
            disabled={loading || !!rateLock}
            style={{
              width: "100%", padding: "15px", borderRadius: "13px",
              background: rateLock ? "var(--bg-subtle)" : "linear-gradient(135deg, #f5a623, #e8920f)",
              color: rateLock ? "var(--text-muted)" : "#fff",
              fontWeight: 700, fontSize: "15px", border: "none",
              cursor: loading || rateLock ? "not-allowed" : "pointer",
              opacity: loading ? 0.85 : 1,
              boxShadow: rateLock ? "none" : "var(--shadow-brand)",
              marginBottom: "20px", fontFamily: "var(--font-sans)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: "17px", height: "17px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", flexShrink: 0 }} />
                Logging in...
              </>
            ) : rateLock ? `🛡️ Wait ${rateLock}s` : "Log In →"}
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
        </div>
      </div>
    </div>
  );
}