import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle, Check, CheckCircle2, ArrowRight,
} from "lucide-react";
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
        className="max-w-[420px] w-full bg-brand-card rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-pastel-green flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={30} strokeWidth={1.75} className="text-fintech-green" />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-text mb-3">Password Reset!</h2>
        <p className="text-brand-muted text-[15px] leading-relaxed mb-8">
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <button onClick={() => { useStore.getState().setResetPasswordParams(null); setScreen("login"); }}
          className="w-full py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
          Log In <ArrowRight size={16} strokeWidth={2} />
        </button>
      </motion.div>
    </div>
  );

  // ── Form ──────────────────────────────────────────────────
  return (
    <div className="h-full bg-brand-canvas overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="max-w-[420px] w-full bg-brand-card rounded-3xl border border-gray-100 shadow-sm p-8">

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center mb-3">
            <Link2 size={20} strokeWidth={2} color="#fff" />
          </div>
          <span className="font-extrabold text-base text-brand-text tracking-tight">Master Events</span>
        </div>

        <div className="w-12 h-12 rounded-full bg-pastel-orange flex items-center justify-center mb-4">
          <KeyRound size={20} strokeWidth={1.75} className="text-brand-orange" />
        </div>

        <h1 className="text-2xl font-extrabold text-brand-text mb-1.5">Set New Password</h1>
        <p className="text-brand-muted text-sm leading-relaxed mb-6">
          Choose a strong password for your Master Events account.
        </p>

        {/* New password */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">New Password</label>
          <div className="relative">
            <Lock size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, special"
              autoComplete="new-password"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-brand-card text-sm text-brand-text outline-none focus:ring-2 focus:ring-orange-100 transition-colors ${
                password && !allPwMet ? "border-red-200" : "border-gray-200 focus:border-brand-orange"
              }`}
            />
            <button onClick={() => setShowPw(!showPw)} type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors">
              {showPw ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
            </button>
          </div>

          {password && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5 mt-2.5">
              {pwChecks.map(c => {
                const met = c.test(password);
                return (
                  <div key={c.label}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                      met ? "bg-pastel-green text-fintech-green border-fintech-green/20" : "bg-brand-canvas text-brand-muted border-gray-100"
                    }`}>
                    {met && <Check size={10} strokeWidth={3} />} {c.label}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <Lock size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleReset()}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-brand-card text-sm text-brand-text outline-none focus:ring-2 focus:ring-orange-100 transition-colors ${
                confirm && !pwsMatch ? "border-red-200" : confirm && pwsMatch ? "border-fintech-green/40" : "border-gray-200 focus:border-brand-orange"
              }`}
            />
          </div>
          {confirm && !pwsMatch && (
            <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5 font-medium">
              <AlertCircle size={12} strokeWidth={2} /> Passwords don't match
            </div>
          )}
          {confirm && pwsMatch && (
            <div className="flex items-center gap-1.5 text-fintech-green text-xs mt-1.5 font-medium">
              <Check size={12} strokeWidth={2.5} /> Passwords match
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-red-600 text-[13px]">
              <AlertCircle size={14} strokeWidth={2} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={handleReset} disabled={!canSubmit}
          className="w-full py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover disabled:bg-gray-100 disabled:text-brand-muted text-white font-bold text-[15px] flex items-center justify-center gap-2 mb-4 transition-colors">
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Resetting...</>
          ) : (
            <>Reset Password <ArrowRight size={16} strokeWidth={2} /></>
          )}
        </button>

        <p className="text-center text-[13px] text-brand-muted">
          Remember your password?{" "}
          <span onClick={() => setScreen("login")} className="text-brand-orange font-bold cursor-pointer hover:text-brand-orange-hover transition-colors">
            Log in
          </span>
        </p>
      </motion.div>
    </div>
  );
}
