import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";

// ── Free Unsplash event images — signup panel (vibrant) ───────
const SIGNUP_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=90",
    tag: "JOIN THE COMMUNITY",
    caption: "Experience events like never before",
    sub: "Buy, own and transfer NFT tickets on Polygon blockchain",
    accent: "#f5a623",
  },
  {
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=90",
    tag: "FOR ORGANIZERS",
    caption: "Host your next big event",
    sub: "Create events, sell tickets, receive 95% payout directly to MoMo",
    accent: "#7c3aed",
  },
  {
    img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=90",
    tag: "ZERO FAKE TICKETS",
    caption: "Blockchain-verified ownership",
    sub: "Every ticket is minted as an NFT — impossible to duplicate or counterfeit",
    accent: "#16a34a",
  },
];

const pwChecks = [
  { label: "8+ characters",    test: pw => pw.length >= 8 },
  { label: "Uppercase letter", test: pw => /[A-Z]/.test(pw) },
  { label: "Number",           test: pw => /[0-9]/.test(pw) },
  { label: "Special char",     test: pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

function useRateLimit(max = 3, windowMs = 60000) {
  const attempts = useRef([]);
  return () => {
    const now = Date.now();
    attempts.current = attempts.current.filter(t => now - t < windowMs);
    if (attempts.current.length >= max) return false;
    attempts.current.push(now);
    return true;
  };
}

const isWide = () => typeof window !== "undefined" && window.innerWidth >= 1024;

export function Signup() {
  const fullName          = useStore(s => s.fullName);
  const signupEmail       = useStore(s => s.signupEmail);
  const signupPassword    = useStore(s => s.signupPassword);
  const setFullName       = useStore(s => s.setFullName);
  const setSignupEmail    = useStore(s => s.setSignupEmail);
  const setSignupPassword = useStore(s => s.setSignupPassword);
  const handleSignup      = useStore(s => s.handleSignup);
  const setSignupData     = useStore(s => s.setSignupData);
  const setScreen         = useStore(s => s.setScreen);
  const signupError       = useStore(s => s.signupError);

  const [wide,          setWide]          = useState(isWide());
  const [selectedRole,  setSelectedRole]  = useState("attendee");
  const [loading,       setLoading]       = useState(false);
  const [showPw,        setShowPw]        = useState(false);
  const [honeypot,      setHoneypot]      = useState("");
  const [slideIndex,    setSlideIndex]    = useState(0);
  const checkRate = useRateLimit(3, 60000);

  // Auto-advance slides every 4.5s
  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % SIGNUP_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const allPwMet = pwChecks.every(c => c.test(signupPassword));

  const handleCreate = async () => {
    if (honeypot) return;
    if (!checkRate()) return;
    if (!allPwMet) return;
    setLoading(true);
    setSignupData({ role: selectedRole });
    await handleSignup();
    setLoading(false);
  };

  const slide = SIGNUP_SLIDES[slideIndex];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", fontFamily: "var(--font-sans)" }}>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — vibrant sliding images
      ══════════════════════════════════════════════════════ */}
      {wide && (
        <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: "100vh" }}>

          {/* Sliding images */}
          {SIGNUP_SLIDES.map((s, i) => (
            <AnimatePresence key={i}>
              {slideIndex === i && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0 }}
                  style={{ position: "absolute", inset: 0 }}>
                  <img src={s.img} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Gradient overlays */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.9) 100%)", zIndex: 1 }} />

          {/* Dynamic accent glow based on slide */}
          <AnimatePresence mode="wait">
            <motion.div key={slideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute", bottom: 0, left: 0,
                width: "400px", height: "400px", borderRadius: "50%",
                background: `radial-gradient(circle, ${slide.accent}22 0%, transparent 70%)`,
                transform: "translate(-20%, 20%)",
                zIndex: 1, pointerEvents: "none",
              }} />
          </AnimatePresence>

          {/* Top logo */}
          <div style={{ position: "absolute", top: "32px", left: "36px", zIndex: 2, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 16px rgba(245,166,35,0.45)" }}>🎟️</div>
            <span style={{ fontWeight: 800, fontSize: "17px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
          </div>

          {/* Bottom content */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "40px 36px" }}>

            <AnimatePresence mode="wait">
              <motion.div key={slideIndex}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}>

                {/* Accent tag */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "4px 12px", borderRadius: "99px",
                  background: slide.accent + "22",
                  border: "1px solid " + slide.accent + "44",
                  marginBottom: "14px",
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: "5px", height: "5px", borderRadius: "50%", background: slide.accent }}
                  />
                  <span style={{ fontSize: "9px", fontWeight: 700, color: slide.accent, letterSpacing: "1.5px", fontFamily: "var(--font-mono)" }}>
                    {slide.tag}
                  </span>
                </div>

                <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "10px" }}>
                  {slide.caption}
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "24px" }}>
                  {slide.sub}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
              {SIGNUP_SLIDES.map((s, i) => (
                <motion.div key={i}
                  animate={{
                    width: slideIndex === i ? "28px" : "6px",
                    opacity: slideIndex === i ? 1 : 0.3,
                    background: slideIndex === i ? SIGNUP_SLIDES[slideIndex].accent : "#fff",
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSlideIndex(i)}
                  style={{ height: "6px", borderRadius: "3px", cursor: "pointer" }}
                />
              ))}
            </div>

            {/* Feature chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                ["⛓️", "NFT Tickets"],
                ["💰", "95% Payout"],
                ["📱", "MoMo Pay"],
                ["🔒", "HMAC QR"],
              ].map(([icon, label]) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 11px", borderRadius: "99px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                }}>
                  <span style={{ fontSize: "11px" }}>{icon}</span>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — signup form
      ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: wide ? "0 0 500px" : "1",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: wide ? "40px 40px" : "40px 24px",
        overflowY: "auto",
        background: "var(--bg)",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Back */}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("home")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, padding: "0 0 20px 0", fontFamily: "var(--font-sans)" }}>
            ← Back to Home
          </motion.button>

          {/* Mobile logo */}
          {!wide && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎟️</div>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Master Events</span>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: "22px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px", marginBottom: "6px" }}>Create account</h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Join Ghana's #1 NFT ticketing platform</p>
          </div>

          {/* Trust bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "11px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", marginBottom: "18px" }}>
            <span style={{ fontSize: "13px" }}>⛓️</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed" }}>Your tickets are NFTs on Polygon — impossible to fake</span>
          </div>

          {/* Google OAuth */}
          <motion.button whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "13px", borderRadius: "13px", background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>or sign up with email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Honeypot */}
          <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} name="website" />
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", display: "block" }}>I am joining as:</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { role: "attendee",  icon: "🎟️", label: "Attendee",  sub: "Buy & transfer tickets" },
                { role: "organizer", icon: "🎪", label: "Organizer", sub: "Create & manage events" },
              ].map(item => (
                <motion.div key={item.role} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRole(item.role)}
                  style={{
                    flex: 1, padding: "12px 10px", borderRadius: "14px", cursor: "pointer", textAlign: "center",
                    border: "1.5px solid " + (selectedRole === item.role ? "#f5a623" : "var(--border)"),
                    background: selectedRole === item.role ? "rgba(245,166,35,0.06)" : "var(--bg-card)",
                    boxShadow: selectedRole === item.role ? "0 4px 16px rgba(245,166,35,0.15)" : "var(--shadow-sm)",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: selectedRole === item.role ? "#f5a623" : "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          {[
            { label: "Full Name",     placeholder: "e.g. Kwame Mensah", value: fullName,    onChange: setFullName,    type: "text",  autoComplete: "name"  },
            { label: "Email Address", placeholder: "you@email.com",      value: signupEmail, onChange: setSignupEmail, type: "email", autoComplete: "email" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: "13px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", display: "block" }}>{f.label}</label>
              <input
                placeholder={f.placeholder} value={f.value}
                onChange={e => f.onChange(e.target.value)}
                type={f.type} autoComplete={f.autoComplete}
                style={{ width: "100%", padding: "13px 16px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#f5a623"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          ))}

          {/* Password */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px", display: "block" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                placeholder="Min 8 chars, uppercase, number, special"
                type={showPw ? "text" : "password"}
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                style={{ width: "100%", padding: "13px 46px 13px 16px", background: "var(--bg-subtle)", border: "1.5px solid " + (signupPassword && !allPwMet ? "var(--error)" : "var(--border)"), borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#f5a623"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = signupPassword && !allPwMet ? "var(--error)" : "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "15px", padding: 0 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            {signupPassword && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "9px" }}>
                {pwChecks.map(c => {
                  const met = c.test(signupPassword);
                  return (
                    <div key={c.label} style={{ padding: "3px 9px", borderRadius: "99px", fontSize: "10px", fontWeight: 600, background: met ? "rgba(22,163,74,0.1)" : "var(--bg-subtle)", color: met ? "#16a34a" : "var(--text-muted)", border: "1px solid " + (met ? "rgba(22,163,74,0.2)" : "var(--border)"), transition: "all 0.2s" }}>
                      {met ? "✓" : "·"} {c.label}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {signupError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "11px", padding: "11px 14px", marginBottom: "13px", color: "var(--error)", fontSize: "13px" }}>
                ⚠️ {signupError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={!loading && allPwMet ? { scale: 1.02, boxShadow: "0 12px 36px rgba(245,166,35,0.4)" } : {}}
            whileTap={!loading && allPwMet ? { scale: 0.97 } : {}}
            onClick={handleCreate}
            disabled={loading || !allPwMet}
            style={{
              width: "100%", padding: "15px", borderRadius: "13px",
              background: allPwMet ? "linear-gradient(135deg, #f5a623, #e8920f)" : "var(--bg-subtle)",
              color: allPwMet ? "#fff" : "var(--text-muted)",
              fontWeight: 700, fontSize: "15px", border: "none",
              cursor: loading || !allPwMet ? "not-allowed" : "pointer",
              opacity: loading ? 0.85 : 1,
              boxShadow: allPwMet ? "var(--shadow-brand)" : "none",
              marginBottom: "16px", fontFamily: "var(--font-sans)",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: "17px", height: "17px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", flexShrink: 0 }} />
                Creating account...
              </>
            ) : "Create Account →"}
          </motion.button>

          <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginBottom: "12px", lineHeight: 1.5 }}>
            By creating an account you agree to our Terms of Service. Your data is encrypted and never sold.
          </p>

          <p style={{ fontSize: "14px", color: "var(--text-secondary)", textAlign: "center" }}>
            Already have an account?{" "}
            <motion.span whileHover={{ color: "#e8920f" }} onClick={() => setScreen("login")}
              style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>
              Log in
            </motion.span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RoleSelect() {
  const handleSelectRole = useStore(s => s.handleSelectRole);
  const setScreen        = useStore(s => s.setScreen);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("home")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, padding: "0 0 20px 0", fontFamily: "var(--font-sans)", margin: "0 auto" }}>
          ← Back
        </motion.button>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ width: "72px", height: "72px", borderRadius: "22px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px", boxShadow: "var(--shadow-brand)" }}>
          🎉
        </motion.div>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>You're in!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "32px" }}>How will you use Master Events?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { role: "attendee",  icon: "🎟️", title: "I'm an Attendee",  sub: "Browse events, buy NFT tickets, resell and transfer" },
            { role: "organizer", icon: "🎪", title: "I'm an Organizer", sub: "Create events, sell tickets, manage door access" },
          ].map(item => (
            <motion.div key={item.role}
              whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectRole(item.role)}
              style={{ background: "var(--bg-card)", borderRadius: "18px", padding: "20px", cursor: "pointer", display: "flex", gap: "16px", alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1.5px solid var(--border)", transition: "all 0.2s" }}>
              <div style={{ width: "52px", height: "52px", background: "rgba(245,166,35,0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{item.icon}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.sub}</div>
              </div>
              <div style={{ marginLeft: "auto", color: "#f5a623", fontSize: "20px" }}>→</div>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px" }}>⛓️</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>All tickets secured by Polygon blockchain</span>
        </div>
      </motion.div>
    </div>
  );
}