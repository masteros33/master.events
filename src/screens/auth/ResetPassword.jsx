import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link, Key, Lock, Eye, EyeSlash, CircleNotch, WarningCircle, Check, CheckCircle, ArrowRight,
} from "@phosphor-icons/react";
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

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const allPwMet  = pwChecks.every(c => c.test(password));
  const pwsMatch  = password === confirm;
  const canSubmit = allPwMet && pwsMatch && !loading;

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
    <div className="h-full bg-brand-canvas overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-[420px] w-full bg-brand-card rounded-2xl border border-brand-hairline p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={30} weight="light" className="text-emerald-700" />
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-brand-text mb-3">Password Reset!</h2>
        <p className="text-brand-muted text-[15px] leading-relaxed mb-8">
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <button onClick={() => { useStore.getState().setResetPasswordParams(null); setScreen("login"); }}
          className="w-full h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors">
          Log In <ArrowRight size={16} weight="light" />
        </button>
      </motion.div>
    </div>
  );

  // ── Form ──────────────────────────────────────────────────
  return (
    <div className="h-full bg-brand-canvas overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="max-w-[420px] w-full bg-brand-card rounded-2xl border border-brand-hairline p-8">

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center mb-3">
            <Link size={20} weight="light" color="#fff" />
          </div>
          <span className="font-semibold text-base text-brand-text tracking-tight">Master Events</span>
        </div>

        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--brand-light)" }}>
          <Key size={20} weight="light" className="text-brand-accent" />
        </div>

        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-brand-text mb-1.5">Set New Password</h1>
        <p className="text-brand-muted text-sm leading-relaxed mb-6">
          Choose a strong password for your Master Events account.
        </p>

        {/* New password */}
        <div className="mb-4">
          <label className="text-xs font-medium text-brand-muted mb-1.5 block">New Password</label>
          <div className="relative">
            <Lock size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, special"
              autoComplete="new-password"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-brand-card text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                password && !allPwMet ? "border-red-200" : "border-brand-hairline focus:border-brand-accent"
              }`}
            />
            <button onClick={() => setShowPw(!showPw)} type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors">
              {showPw ? <EyeSlash size={16} weight="light" /> : <Eye size={16} weight="light" />}
            </button>
          </div>

          {password && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5 mt-2.5">
              {pwChecks.map(c => {
                const met = c.test(password);
                return (
                  <div key={c.label}
                    className={`px-2.5 h-7 rounded-full text-xs font-medium border flex items-center gap-1 ${
                      met ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-brand-canvas text-brand-muted border-brand-hairline"
                    }`}>
                    {met && <Check size={10} weight="bold" />} {c.label}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-5">
          <label className="text-xs font-medium text-brand-muted mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <Lock size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleReset()}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-brand-card text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                confirm && !pwsMatch ? "border-red-200" : confirm && pwsMatch ? "border-emerald-200" : "border-brand-hairline focus:border-brand-accent"
              }`}
            />
          </div>
          {confirm && !pwsMatch && (
            <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5 font-medium">
              <WarningCircle size={12} weight="light" /> Passwords don't match
            </div>
          )}
          {confirm && pwsMatch && (
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs mt-1.5 font-medium">
              <Check size={12} weight="bold" /> Passwords match
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-red-600 text-[13px]">
              <WarningCircle size={14} weight="light" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={handleReset} disabled={!canSubmit}
          className="w-full h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:bg-brand-hairline disabled:text-brand-muted text-white font-medium text-[15px] flex items-center justify-center gap-2 mb-4 transition-colors">
          {loading ? (
            <><CircleNotch size={16} className="animate-spin" /> Resetting...</>
          ) : (
            <>Reset Password <ArrowRight size={16} weight="light" /></>
          )}
        </button>

        <p className="text-center text-[13px] text-brand-muted">
          Remember your password?{" "}
          <span onClick={() => setScreen("login")} className="text-brand-accent font-medium cursor-pointer hover:text-brand-accent-hover transition-colors">
            Log in
          </span>
        </p>
      </motion.div>
    </div>
  );
}
