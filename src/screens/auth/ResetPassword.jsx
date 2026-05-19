import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";

const pwChecks = [
  { label: "8+ characters",    test: pw => pw.length >= 8 },
  { label: "Uppercase letter", test: pw => /[A-Z]/.test(pw) },
  { label: "Number",           test: pw => /[0-9]/.test(pw) },
  { label: "Special char",     test: pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export default function ResetPassword() {
  const setScreen            = useStore(s => s.setScreen);
  const resetPasswordParams  = useStore(s => s.resetPasswordParams);

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);

  const allPwMet   = pwChecks.every(c => c.test(password));
  const pwsMatch   = password === confirm;
  const canSubmit  = allPwMet && pwsMatch && !loading;

  const handleReset = async () => {
    if (!canSubmit) return;
    if (!resetPasswordParams?.uid || !resetPasswordParams?.token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid:          resetPasswordParams.uid,
          token:        resetPasswordParams.token,
          new_password: password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        // Clean URL params
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        setError(data.error || "Reset failed. The link may have expired.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  // ── Success state ─────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: "420px", width: "100%", background: "var(--bg-card)", borderRadius: "24px", padding: "48px 40px", textAlign: "center", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px", boxShadow: "0 4px 20px rgba(22,163,74,0.3)" }}>✅</motion.div>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          Password Reset!
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { useStore.getState().setResetPasswordParams(null); setScreen("login"); }}
          style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)" }}>
          Log In →
        </motion.button>
      </motion.div>
    </div>
  );

  // ── Form ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: "420px", width: "100%", background: "var(--bg-card)", borderRadius: "24px", padding: "40px 36px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Master Events</span>
        </div>

        <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "20px", boxShadow: "var(--shadow-brand)" }}>🔐</div>

        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Set New Password
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
          Choose a strong password for your Master Events account.
        </p>

        {/* New password */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
            New Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, special"
              autoComplete="new-password"
              style={{ width: "100%", padding: "14px 48px 14px 18px", background: "var(--bg)", border: "1.5px solid " + (password && !allPwMet ? "var(--error)" : "var(--border)"), borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
            />
            <button onClick={() => setShowPw(!showPw)}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", padding: 0 }}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Strength chips */}
          {password && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {pwChecks.map(c => {
                const met = c.test(password);
                return (
                  <div key={c.label} style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: met ? "rgba(22,163,74,0.1)" : "var(--bg-subtle)", color: met ? "#16a34a" : "var(--text-muted)", border: "1px solid " + (met ? "rgba(22,163,74,0.2)" : "var(--border)") }}>
                    {met ? "✓" : "·"} {c.label}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleReset()}
            placeholder="Repeat your password"
            autoComplete="new-password"
            style={{ width: "100%", padding: "14px 18px", background: "var(--bg)", border: "1.5px solid " + (confirm && !pwsMatch ? "var(--error)" : confirm && pwsMatch ? "rgba(22,163,74,0.5)" : "var(--border)"), borderRadius: "14px", fontSize: "15px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
          />
          {confirm && !pwsMatch && (
            <div style={{ fontSize: "12px", color: "var(--error)", marginTop: "6px", fontWeight: 500 }}>
              ⚠️ Passwords don't match
            </div>
          )}
          {confirm && pwsMatch && (
            <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "6px", fontWeight: 500 }}>
              ✓ Passwords match
            </div>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "var(--error)", fontSize: "13px" }}>
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileHover={canSubmit ? { scale: 1.02, boxShadow: "0 12px 36px rgba(245,166,35,0.4)" } : {}}
          whileTap={canSubmit ? { scale: 0.97 } : {}}
          onClick={handleReset}
          disabled={!canSubmit}
          style={{ width: "100%", padding: "16px", borderRadius: "14px", background: canSubmit ? "linear-gradient(135deg, #f5a623, #e8920f)" : "var(--bg-subtle)", color: canSubmit ? "#fff" : "var(--text-muted)", fontWeight: 700, fontSize: "16px", border: "none", cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "var(--shadow-brand)" : "none", fontFamily: "var(--font-sans)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", flexShrink: 0 }} />
              Resetting...
            </>
          ) : "Reset Password →"}
        </motion.button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
          Remember your password?{" "}
          <motion.span whileHover={{ color: "#e8920f" }} onClick={() => setScreen("login")}
            style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>
            Log in
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
}