import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link, Envelope, Lock, Eye, EyeSlash, CircleNotch, ShieldWarning,
  WarningCircle, CheckCircle, ArrowLeft, ArrowRight,
} from "@phosphor-icons/react";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";
const GOOGLE_CLIENT_ID = "495384335861-m8bhrto4skv6kmh4far62uuj486i9opt.apps.googleusercontent.com";

const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors";

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
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error || "Something went wrong");
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-[420px] w-full bg-brand-card rounded-2xl border border-brand-hairline p-8">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={26} weight="light" className="text-emerald-700" />
            </div>
            <h2 className="text-xl font-semibold text-brand-text mb-2.5">Check your email</h2>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              Reset link sent to <strong className="text-brand-text">{email}</strong>
            </p>
            <button onClick={onBack}
              className="flex items-center justify-center px-7 h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm transition-colors mx-auto">
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <button onClick={onBack} className="flex items-center gap-1.5 text-brand-accent text-sm font-medium mb-5 hover:text-brand-accent-hover transition-colors">
              <ArrowLeft size={15} weight="light" /> Back
            </button>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--brand-light)" }}>
              <Envelope size={20} weight="light" className="text-brand-accent" />
            </div>
            <h2 className="text-xl font-semibold text-brand-text mb-1.5">Forgot Password?</h2>
            <p className="text-brand-muted text-sm mb-5">Enter your email and we'll send a reset link</p>

            <div className="relative mb-3">
              <Envelope size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input placeholder="you@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className={inputClass} />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs mb-3">
                <WarningCircle size={13} weight="light" /> {error}
              </div>
            )}
            <button onClick={handleSend} disabled={loading}
              className="w-full h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-70 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors">
              {loading && <CircleNotch size={16} className="animate-spin" />}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}
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

  const [loading,    setLoading]    = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [rateLock,   setRateLock]   = useState(null);
  const [honeypot,   setHoneypot]   = useState("");
  const checkRate = useRateLimit(5, 60000);

  const rateLockRef = useRef(null);
  const startRateLock = (seconds) => {
    setRateLock(seconds);
    rateLockRef.current = setInterval(() => {
      setRateLock(prev => {
        if (prev <= 1) { clearInterval(rateLockRef.current); return null; }
        return prev - 1;
      });
    }, 1000);
  };

  const onLogin = async () => {
    if (honeypot) return;
    const { blocked, wait } = checkRate();
    if (blocked) { startRateLock(wait); return; }
    setLoading(true);
    await handleLogin();
    setLoading(false);
  };

  const handleGoogleRedirect = () => {
    localStorage.setItem("google_auth_role", "attendee");
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="h-full bg-brand-canvas overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="max-w-[420px] w-full bg-brand-card rounded-2xl border border-brand-hairline p-8">

        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center mb-3">
            <Link size={20} weight="light" color="#fff" />
          </div>
          <span className="font-semibold text-base text-brand-text tracking-tight">Master Events</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-brand-text mb-1.5">Welcome back</h1>
          <p className="text-sm text-brand-muted">Log in to access your NFT tickets and wallet</p>
        </div>

        <button onClick={handleGoogleRedirect}
          className="w-full h-12 md:h-11 rounded-xl bg-white border border-brand-hairline hover:border-brand-muted text-brand-text font-medium text-sm flex items-center justify-center gap-2.5 mb-4 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-brand-hairline" />
          <span className="text-xs text-brand-muted font-medium">or with email</span>
          <div className="flex-1 h-px bg-brand-hairline" />
        </div>

        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} name="website" />
        </div>

        <div className="mb-3.5">
          <label className="text-xs font-medium text-brand-muted mb-1.5 block">Email</label>
          <div className="relative">
            <Envelope size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email"
              className={inputClass} />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-brand-muted">Password</label>
            <span onClick={() => setShowForgot(true)} className="text-xs text-brand-accent font-medium cursor-pointer hover:text-brand-accent-hover transition-colors">Forgot?</span>
          </div>
          <div className="relative">
            <Lock size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input placeholder="••••••••" type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && !rateLock && onLogin()}
              autoComplete="current-password"
              className={`${inputClass} pr-11`} />
            <button onClick={() => setShowPw(!showPw)} type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors">
              {showPw ? <EyeSlash size={16} weight="light" /> : <Eye size={16} weight="light" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {rateLock && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5 mb-3 text-amber-700 text-xs font-medium">
              <ShieldWarning size={14} weight="light" /> Too many attempts. Try again in <span className="tabular-nums">{rateLock}</span>s
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loginError && !rateLock && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3 text-red-600 text-xs">
              <WarningCircle size={14} weight="light" /> {loginError}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={onLogin} disabled={loading || !!rateLock}
          className="w-full h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:bg-brand-hairline disabled:text-brand-muted text-white font-medium text-sm flex items-center justify-center gap-2 mb-4 transition-colors">
          {loading ? (
            <><CircleNotch size={16} className="animate-spin" /> Logging in...</>
          ) : rateLock ? (
            <><ShieldWarning size={15} weight="light" /> Wait <span className="tabular-nums">{rateLock}</span>s</>
          ) : (
            <>Log In <ArrowRight size={16} weight="light" /></>
          )}
        </button>

        <p className="text-sm text-brand-muted text-center mb-2">
          No account?{" "}
          <span onClick={() => setScreen("signup")} className="text-brand-accent font-medium cursor-pointer hover:text-brand-accent-hover transition-colors">Sign up free</span>
        </p>
        <p className="text-xs text-brand-muted text-center">
          Door staff?{" "}
          <span onClick={() => setScreen("doorStaffLogin")} className="text-brand-accent font-medium cursor-pointer hover:text-brand-accent-hover transition-colors">Enter with invite code</span>
        </p>
      </motion.div>

      <AnimatePresence>
        {showForgot && <ForgotPassword onBack={() => setShowForgot(false)} />}
      </AnimatePresence>
    </div>
  );
}
