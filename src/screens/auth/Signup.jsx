import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import ThemeToggle from "../../components/ThemeToggle";

const pwChecks = [
  { label: "8+ characters",    test: pw => pw.length >= 8 },
  { label: "Uppercase letter", test: pw => /[A-Z]/.test(pw) },
  { label: "Number",           test: pw => /[0-9]/.test(pw) },
  { label: "Special char",     test: pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

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
  const [selectedRole, setSelectedRole] = useState("attendee");
  const [loading, setLoading]           = useState(false);
  const [showPw, setShowPw]             = useState(false);

  const allPwMet = pwChecks.every(c => c.test(signupPassword));

  const handleCreate = async () => {
    if (!allPwMet) return;
    setLoading(true);
    setSignupData({ role: selectedRole });
    await handleSignup();
    setLoading(false);
  };

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
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "16px" }}>GET STARTED TODAY</div>
          <h2 style={{ fontSize: "clamp(36px, 3vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "20px" }}>
            Ghana's best<br />
            <span style={{ background: "linear-gradient(135deg, #f5a623, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              tickets.
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", lineHeight: 1.7, maxWidth: "340px", marginBottom: "36px" }}>
            Join thousands of event-goers and organizers across Ghana and Africa. Every ticket is an NFT — unfakeable and yours forever.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              ["🎟️", "Buy & Own Tickets",    "NFT tickets on Polygon blockchain"],
              ["🔄", "Resell & Transfer",     "Trade tickets peer-to-peer, only 2% fee"],
              ["🏟️", "Host Your Event",       "95% payout, MoMo withdrawals anytime"],
            ].map(([icon, title, sub]) => (
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", maxWidth: "560px", margin: "0 auto", width: "100%", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px", marginBottom: "4px" }}>Create account</h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Join Ghana's #1 ticketing platform</p>
            </div>
            <ThemeToggle compact={true} />
          </div>

          {/* Google OAuth */}
          <motion.button whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-sans)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </motion.button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>or sign up with email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", display: "block" }}>I am joining as:</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { role: "attendee",  icon: "🎟️", label: "Attendee",  sub: "Buy & transfer tickets" },
                { role: "organizer", icon: "🎪", label: "Organizer", sub: "Create & manage events" },
              ].map(item => (
                <motion.div key={item.role} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRole(item.role)}
                  style={{ flex: 1, padding: "14px 12px", borderRadius: "16px", cursor: "pointer", textAlign: "center", border: "1.5px solid " + (selectedRole === item.role ? "#f5a623" : "var(--border)"), background: selectedRole === item.role ? "rgba(245,166,35,0.06)" : "var(--bg-card)", boxShadow: selectedRole === item.role ? "0 4px 16px rgba(245,166,35,0.15)" : "var(--shadow-sm)", transition: "all 0.2s" }}>
                  <div style={{ fontSize: "26px", marginBottom: "6px" }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: selectedRole === item.role ? "#f5a623" : "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fields */}
          {[
            { label: "Full Name",      placeholder: "e.g. Kwame Mensah",  value: fullName,       onChange: setFullName,       type: "text",     autoComplete: "name" },
            { label: "Email Address",  placeholder: "you@email.com",       value: signupEmail,    onChange: setSignupEmail,    type: "email",    autoComplete: "email" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>{f.label}</label>
              <input placeholder={f.placeholder} value={f.value} onChange={e => f.onChange(e.target.value)}
                type={f.type} autoComplete={f.autoComplete}
                style={{ width: "100%", padding: "14px 18px", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }} />
            </div>
          ))}

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input placeholder="Min 8 chars, uppercase, number, special"
                type={showPw ? "text" : "password"}
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                style={{ width: "100%", padding: "14px 48px 14px 18px", background: "var(--bg)", border: "1.5px solid " + (signupPassword && !allPwMet ? "var(--error)" : "var(--border)"), borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }} />
              <button onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", padding: 0 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            {signupPassword && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {pwChecks.map(c => {
                  const met = c.test(signupPassword);
                  return (
                    <div key={c.label} style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: met ? "rgba(22,163,74,0.1)" : "var(--bg-subtle)", color: met ? "#16a34a" : "var(--text-muted)", border: "1px solid " + (met ? "rgba(22,163,74,0.2)" : "var(--border)") }}>
                      {met ? "✓" : "·"} {c.label}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {signupError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "var(--error)", fontSize: "13px" }}>
                ⚠️ {signupError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 36px rgba(245,166,35,0.4)" }}
            whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={loading}
            style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "var(--shadow-brand)", marginBottom: "20px", fontFamily: "var(--font-sans)" }}>
            {loading ? "⏳ Creating account..." : "Create Account →"}
          </motion.button>

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
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px", boxShadow: "var(--shadow-brand)" }}>🎉</div>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>You're in!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "36px" }}>How will you use Master Events?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { role: "attendee",  icon: "🎟️", title: "I'm an Attendee",  sub: "Browse events, buy tickets, resell and transfer" },
            { role: "organizer", icon: "🎪", title: "I'm an Organizer", sub: "Create events, sell tickets, manage door access" },
          ].map(item => (
            <motion.div key={item.role} whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }}
              whileTap={{ scale: 0.97 }} onClick={() => handleSelectRole(item.role)}
              style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "20px", cursor: "pointer", display: "flex", gap: "16px", alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1.5px solid var(--border)", transition: "box-shadow 0.2s" }}>
              <div style={{ width: "52px", height: "52px", background: "rgba(245,166,35,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{item.icon}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.sub}</div>
              </div>
              <div style={{ marginLeft: "auto", color: "#f5a623", fontSize: "20px" }}>→</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}