import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";

const API = "https://master-events-backend.onrender.com";
const ATTENDEE_BG  = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&q=90";
const ORGANIZER_BG = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=90";
const GOOGLE_CLIENT_ID = "495384335861-m8bhrto4skv6kmh4far62uuj486i9opt.apps.googleusercontent.com";

const pwChecks = [
  { label:"8+ characters",    test: pw => pw.length >= 8 },
  { label:"Uppercase letter", test: pw => /[A-Z]/.test(pw) },
  { label:"Number",           test: pw => /[0-9]/.test(pw) },
  { label:"Special char",     test: pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
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

export function Signup() {
  const fullName          = useStore(s => s.fullName);
  const signupEmail       = useStore(s => s.signupEmail);
  const signupPassword    = useStore(s => s.signupPassword);
  const setFullName       = useStore(s => s.setFullName);
  const setSignupEmail    = useStore(s => s.setSignupEmail);
  const setSignupPassword = useStore(s => s.setSignupPassword);
  const setScreen         = useStore(s => s.setScreen);
  const signupError       = useStore(s => s.signupError);
  const setSignupError    = useStore(s => s.setSignupError);

  const [role,          setRole]          = useState("attendee");
  const [phone,         setPhone]         = useState("");
  const [orgName,       setOrgName]       = useState("");
  const [loading,       setLoading]       = useState(false);
  const [showPw,        setShowPw]        = useState(false);
  const [honeypot,      setHoneypot]      = useState("");
  const [agreed,        setAgreed]        = useState(false);
  const checkRate = useRateLimit(3, 60000);

  const isOrg    = role === "organizer";
  const bgImage  = isOrg ? ORGANIZER_BG : ATTENDEE_BG;
  const allPwMet = pwChecks.every(c => c.test(signupPassword));
  const isWide   = window.innerWidth >= 900;

  const afterAuth = (user) => {
    const firstTab    = user.role === "organizer" ? "dashboard" : "home";
    const pendingSlug = localStorage.getItem("pending_event_slug");
    useStore.setState({
      currentUser: user,
      role:        user.role || role,
      isLoggedIn:  true,
      activeTab:   firstTab,
      screen:      pendingSlug ? "pendingEvent" : "app",
    });
  };

  const handleCreate = async () => {
    if (honeypot) return;
    if (!checkRate()) return;
    if (!allPwMet || !agreed) return;
    setLoading(true);
    if (setSignupError) setSignupError("");
    try {
      const nameParts  = fullName.trim().split(" ");
      const first_name = nameParts[0] || "";
      const last_name  = nameParts.slice(1).join(" ") || "";
      const res = await fetch(`${API}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail.trim(), password: signupPassword,
          first_name, last_name, role,
          phone:    phone    || undefined,
          org_name: isOrg ? orgName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.email?.[0] || data.detail || data.error || "Registration failed.";
        if (setSignupError) setSignupError(msg);
        setLoading(false);
        return;
      }
      if (data.tokens) {
        localStorage.setItem("access_token",  data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        toast.success("Welcome to Master Events, " + data.user.first_name + "!");
        afterAuth(data.user);
      } else {
        useStore.getState().setScreen("login");
        toast.success("Account created! Please check your email to verify.");
      }
    } catch (e) {
      console.error("Signup error:", e);
      if (setSignupError) setSignupError("Network error — please try again.");
    }
    setLoading(false);
  };

  const handleGoogleRedirect = () => {
    localStorage.setItem("google_auth_role", role);
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: "https://masterevents.events/auth/callback",
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const inp = (extra = {}) => ({
    width: "100%", padding: "13px 16px", outline: "none",
    background: "rgba(0,0,0,0.03)", border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: "12px", fontSize: "14px", color: "#1a1a1a",
    fontFamily: "var(--font-sans)", boxSizing: "border-box",
    transition: "all 0.2s", ...extra,
  });
  const focusInp = e => {
    e.target.style.borderColor = "rgba(245,166,35,0.7)";
    e.target.style.background  = "rgba(245,166,35,0.05)";
    e.target.style.boxShadow   = "0 0 0 3px rgba(245,166,35,0.12)";
  };
  const blurInp = e => {
    e.target.style.borderColor = "rgba(0,0,0,0.1)";
    e.target.style.background  = "rgba(0,0,0,0.03)";
    e.target.style.boxShadow   = "none";
  };

  return (
    <div style={{ position: "fixed", inset: 0, fontFamily: "var(--font-sans)", overflowY: "auto" }}>

      <AnimatePresence mode="wait">
        <motion.img key={bgImage} src={bgImage} alt=""
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </AnimatePresence>
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.65) 100%)" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "20%", width: "350px", height: "350px", borderRadius: "50%", background: isOrg ? "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)" : "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", transition: "background 0.6s" }} />

      <div style={{ position: "fixed", top: "28px", left: "32px", zIndex: 20, display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", boxShadow: "0 4px 16px rgba(245,166,35,0.45)" }}>🎟️</div>
        <span style={{ fontWeight: 800, fontSize: "16px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
      </div>

      {localStorage.getItem("pending_event_slug") && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)", zIndex: 30, background: "rgba(249,115,22,0.95)", backdropFilter: "blur(10px)", color: "#fff", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
          🎟️ Create an account to register for this event
        </motion.div>
      )}

      {isWide && (
        <div style={{ position: "fixed", left: "6%", top: "50%", transform: "translateY(-50%)", zIndex: 5, maxWidth: "360px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={role}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4 }}>
              {isOrg ? (
                <>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#c4b5fd", letterSpacing: "2px", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>FOR ORGANIZERS & BRANDS</div>
                  <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.2px", marginBottom: "16px" }}>
                    Create your<br />
                    <span style={{ background: "linear-gradient(135deg, #c4b5fd, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>organizer account</span>
                  </h2>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginBottom: "24px", lineHeight: 1.65 }}>Join creators using Master Events to sell globally with MoMo, Cards, and more.</p>
                  {["🚀  Go live in minutes with simple onboarding", "💰  Receive 95% of every sale directly to MoMo", "⛓️  Every ticket is an NFT — zero counterfeits", "📊  Real-time dashboard with ticket holder data"].map(line => (
                    <div key={line} style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", lineHeight: 1.5, marginBottom: "10px" }}>{line}</div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#fcd34d", letterSpacing: "2px", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>FOR EVENT LOVERS</div>
                  <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.2px", marginBottom: "16px" }}>
                    Create your<br />
                    <span style={{ background: "linear-gradient(135deg, #fcd34d, #f5a623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>attendee account</span>
                  </h2>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginBottom: "24px", lineHeight: 1.65 }}>Discover events, buy tickets with MoMo, Cards, or USSD. Your tickets live safely in the app.</p>
                  {["⚡  Fast, secure checkout — save your details", "📧  Instant e-tickets and receipts to your email", "🔄  Resell or transfer tickets peer-to-peer", "⛓️  NFT tickets — impossible to fake or duplicate"].map(line => (
                    <div key={line} style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", lineHeight: 1.5, marginBottom: "10px" }}>{line}</div>
                  ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <div style={{ position: "absolute", right: isWide ? "6%" : "50%", top: "50%", transform: isWide ? "translateY(-50%)" : "translate(50%, -50%)", width: "min(440px, 92vw)", zIndex: 10, marginTop: isWide ? "0" : "60px", marginBottom: "40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderRadius: "24px", padding: "32px 28px", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)" }}>

          <div style={{ display: "flex", gap: "8px", marginBottom: "22px", background: "rgba(0,0,0,0.04)", borderRadius: "14px", padding: "4px" }}>
            {[{ r: "attendee", icon: "🎟️", label: "Attendee" }, { r: "organizer", icon: "🎪", label: "Organizer" }].map(item => (
              <motion.button key={item.r} whileTap={{ scale: 0.97 }} onClick={() => setRole(item.r)}
                style={{ flex: 1, padding: "10px 8px", borderRadius: "10px", border: "none", background: role === item.r ? (item.r === "organizer" ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, #f5a623, #e8920f)") : "transparent", color: role === item.r ? "#fff" : "rgba(0,0,0,0.4)", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font-sans)", transition: "all 0.2s", boxShadow: role === item.r ? "0 4px 12px rgba(0,0,0,0.18)" : "none" }}>
                <span>{item.icon}</span> {item.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ marginBottom: "20px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.6px", marginBottom: "4px" }}>
                {isOrg ? "Sign Up as an Organizer" : "Sign Up as an Attendee"}
              </h1>
              <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
                {isOrg ? "It's free — only takes a minute." : "It's free — join thousands of event lovers."}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleGoogleRedirect}
            style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#fff", border: "1.5px solid rgba(0,0,0,0.1)", color: "#1a1a1a", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", marginBottom: "14px", fontFamily: "var(--font-sans)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {`Sign up with Google as ${isOrg ? "Organizer" : "Attendee"}`}
          </motion.button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)" }}>or with email</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.08)" }} />
          </div>

          <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} name="website" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={role} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {isOrg ? (
                <>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>ORGANIZER / BRAND NAME</label>
                    <input placeholder="e.g. Accra Live Events" value={orgName} onChange={e => setOrgName(e.target.value)} type="text" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>FULL NAME</label>
                    <input placeholder="e.g. Kofi Mensah" value={fullName} onChange={e => setFullName(e.target.value)} type="text" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>PHONE NUMBER</label>
                    <input placeholder="e.g. 0241234567" value={phone} onChange={e => setPhone(e.target.value)} type="tel" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>EMAIL</label>
                    <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" autoComplete="email" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>FIRST NAME</label>
                      <input placeholder="Kwame"
                        value={fullName.split(" ")[0] || ""}
                        onChange={e => setFullName(e.target.value + " " + (fullName.split(" ").slice(1).join(" ") || ""))}
                        type="text" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>LAST NAME</label>
                      <input placeholder="Mensah"
                        value={fullName.split(" ").slice(1).join(" ") || ""}
                        onChange={e => setFullName((fullName.split(" ")[0] || "") + " " + e.target.value)}
                        type="text" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>PHONE NUMBER</label>
                    <input placeholder="e.g. 0241234567" value={phone} onChange={e => setPhone(e.target.value)} type="tel" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>EMAIL</label>
                    <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" autoComplete="email" style={inp()} onFocus={focusInp} onBlur={blurInp} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: "5px", display: "block", letterSpacing: "0.5px" }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input
                placeholder="Min 8 chars, uppercase, number, special"
                type={showPw ? "text" : "password"}
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                style={inp({ paddingRight: "44px", borderColor: signupPassword && !allPwMet ? "rgba(220,38,38,0.4)" : "rgba(0,0,0,0.1)" })}
                onFocus={focusInp} onBlur={blurInp}
              />
              <button onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.35)", fontSize: "14px", padding: 0 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            {signupPassword && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                {pwChecks.map(c => {
                  const met = c.test(signupPassword);
                  return (
                    <div key={c.label} style={{ padding: "2px 8px", borderRadius: "99px", fontSize: "9px", fontWeight: 600, background: met ? "rgba(22,163,74,0.1)" : "rgba(0,0,0,0.04)", color: met ? "#16a34a" : "rgba(0,0,0,0.35)", border: "1px solid " + (met ? "rgba(22,163,74,0.25)" : "rgba(0,0,0,0.08)"), transition: "all 0.2s" }}>
                      {met ? "✓" : "·"} {c.label}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px", marginTop: "4px" }}>
            <div onClick={() => setAgreed(!agreed)}
              style={{ width: "18px", height: "18px", borderRadius: "5px", border: "1.5px solid " + (agreed ? "#f5a623" : "rgba(0,0,0,0.18)"), background: agreed ? "#f5a623" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: "1px", transition: "all 0.2s" }}>
              {agreed && <span style={{ color: "#fff", fontSize: "11px", fontWeight: 900 }}>✓</span>}
            </div>
            <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", lineHeight: 1.5, margin: 0 }}>
              By creating an account, I agree to the{" "}
              <span style={{ color: "#e8920f", cursor: "pointer" }} onClick={() => setScreen("privacy")}>Terms of Service</span>
              {" "}and{" "}
              <span style={{ color: "#e8920f", cursor: "pointer" }} onClick={() => setScreen("privacy")}>Privacy Policy</span>
            </p>
          </div>

          <AnimatePresence>
            {signupError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", color: "#dc2626", fontSize: "12px" }}>
                ⚠️ {signupError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={!loading && allPwMet && agreed ? { scale: 1.02 } : {}}
            whileTap={!loading && allPwMet && agreed ? { scale: 0.97 } : {}}
            onClick={handleCreate}
            disabled={loading || !allPwMet || !agreed}
            style={{ width: "100%", padding: "14px", borderRadius: "13px", background: allPwMet && agreed ? (isOrg ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, #f5a623, #e8920f)") : "rgba(0,0,0,0.05)", color: allPwMet && agreed ? "#fff" : "rgba(0,0,0,0.3)", fontWeight: 700, fontSize: "15px", border: "none", cursor: loading || !allPwMet || !agreed ? "not-allowed" : "pointer", boxShadow: allPwMet && agreed ? (isOrg ? "0 8px 24px rgba(124,58,237,0.35)" : "0 8px 24px rgba(245,166,35,0.35)") : "none", marginBottom: "16px", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />
                Creating account...
              </>
            ) : (
              `Create ${isOrg ? "Organizer" : "Attendee"} Account →`
            )}
          </motion.button>

          <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.45)", textAlign: "center" }}>
            Already have an account?{" "}
            <span onClick={() => setScreen("login")} style={{ color: "#e8920f", fontWeight: 700, cursor: "pointer" }}>
              Log in
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function RoleSelect() {
  const setScreen = useStore(s => s.setScreen);
  React.useEffect(() => { setScreen("signup"); }, []);
  return null;
}