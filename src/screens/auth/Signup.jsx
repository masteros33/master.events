import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link, Envelope, Lock, Eye, EyeSlash, CircleNotch, WarningCircle, Check,
  User, Buildings, ArrowRight, Ticket,
} from "@phosphor-icons/react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";

const API = "https://master-events-backend.onrender.com";
const GOOGLE_CLIENT_ID = "495384335861-m8bhrto4skv6kmh4far62uuj486i9opt.apps.googleusercontent.com";

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

  const [role,     setRole]     = useState("attendee");
  const [phone,    setPhone]    = useState("");
  const [orgName,  setOrgName]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [agreed,   setAgreed]   = useState(false);
  const checkRate = useRateLimit(3, 60000);

  const isOrg    = role === "organizer";
  const allPwMet = pwChecks.every(c => c.test(signupPassword));
  const pendingSlug = localStorage.getItem("pending_event_slug");

  const afterAuth = (user) => {
    const firstTab    = user.role === "organizer" ? "dashboard" : "home";
    const slug         = localStorage.getItem("pending_event_slug");
    useStore.setState({
      currentUser: user,
      role:        user.role || role,
      isLoggedIn:  true,
      activeTab:   firstTab,
      screen:      slug ? "pendingEvent" : "app",
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
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors";
  const plainInputClass = "w-full px-4 py-2.5 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors";
  const labelClass = "text-xs font-medium text-brand-muted mb-2 block";

  return (
    <div className="h-full bg-brand-canvas overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <div className="max-w-[440px] w-full">

        {pendingSlug && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 mb-4 text-sm font-medium text-center text-brand-accent"
            style={{ background: "var(--brand-light)" }}>
            <Ticket size={15} weight="light" /> Create an account to register for this event
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-brand-card rounded-2xl border border-brand-hairline p-8">

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center mb-3">
              <Link size={20} weight="light" color="#fff" />
            </div>
            <span className="font-semibold text-base text-brand-text tracking-tight">Master Events</span>
          </div>

          <div className="flex gap-1.5 mb-6 bg-brand-canvas rounded-xl p-1">
            {[{ r: "attendee", Icon: User, label: "Attendee" }, { r: "organizer", Icon: Buildings, label: "Organizer" }].map(item => (
              <button key={item.r} onClick={() => setRole(item.r)}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-colors ${
                  role === item.r ? "bg-brand-accent text-white" : "bg-transparent text-brand-muted hover:text-brand-text"
                }`}>
                <item.Icon size={14} weight="light" /> {item.label}
              </button>
            ))}
          </div>

          <div className="mb-5 text-center">
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-brand-text mb-1">
              {isOrg ? "Sign Up as an Organizer" : "Sign Up as an Attendee"}
            </h1>
            <p className="text-xs text-brand-muted">
              {isOrg ? "It's free — only takes a minute." : "It's free — join thousands of event lovers."}
            </p>
          </div>

          <button onClick={handleGoogleRedirect}
            className="w-full h-12 md:h-11 rounded-xl bg-white border border-brand-hairline hover:border-brand-muted text-brand-text font-medium text-sm flex items-center justify-center gap-2.5 mb-4 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {`Sign up with Google as ${isOrg ? "Organizer" : "Attendee"}`}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-brand-hairline" />
            <span className="text-xs text-brand-muted font-medium">or with email</span>
            <div className="flex-1 h-px bg-brand-hairline" />
          </div>

          <div className="absolute -left-[9999px]" aria-hidden="true">
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} name="website" />
          </div>

          {isOrg ? (
            <>
              <div className="mb-4">
                <label className={labelClass}>Organizer / Brand Name</label>
                <div className="relative">
                  <Buildings size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input placeholder="e.g. Accra Live Events" value={orgName} onChange={e => setOrgName(e.target.value)} type="text" className={inputClass} />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input placeholder="e.g. Kofi Mensah" value={fullName} onChange={e => setFullName(e.target.value)} type="text" className={inputClass} />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Phone Number</label>
                <input placeholder="e.g. 0241234567" value={phone} onChange={e => setPhone(e.target.value)} type="tel" className={plainInputClass} />
              </div>
              <div className="mb-4">
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <Envelope size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" autoComplete="email" className={inputClass} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2.5 mb-4">
                <div className="flex-1">
                  <label className={labelClass}>First Name</label>
                  <input placeholder="Kwame"
                    value={fullName.split(" ")[0] || ""}
                    onChange={e => setFullName(e.target.value + " " + (fullName.split(" ").slice(1).join(" ") || ""))}
                    type="text" className={plainInputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Last Name</label>
                  <input placeholder="Mensah"
                    value={fullName.split(" ").slice(1).join(" ") || ""}
                    onChange={e => setFullName((fullName.split(" ")[0] || "") + " " + e.target.value)}
                    type="text" className={plainInputClass} />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Phone Number</label>
                <input placeholder="e.g. 0241234567" value={phone} onChange={e => setPhone(e.target.value)} type="tel" className={plainInputClass} />
              </div>
              <div className="mb-4">
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <Envelope size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} type="email" autoComplete="email" className={inputClass} />
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className={labelClass}>Password</label>
            <div className="relative">
              <Lock size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                placeholder="Min 8 chars, uppercase, number, special"
                type={showPw ? "text" : "password"}
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-brand-card text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors ${
                  signupPassword && !allPwMet ? "border-red-200" : "border-brand-hairline focus:border-brand-accent"
                }`}
              />
              <button onClick={() => setShowPw(!showPw)} type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors">
                {showPw ? <EyeSlash size={16} weight="light" /> : <Eye size={16} weight="light" />}
              </button>
            </div>
            {signupPassword && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-1.5 mt-2">
                {pwChecks.map(c => {
                  const met = c.test(signupPassword);
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

          <div className="flex items-start gap-2.5 mb-4 mt-1">
            <div onClick={() => setAgreed(!agreed)}
              className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-colors ${
                agreed ? "bg-brand-accent border-brand-accent" : "bg-brand-card border-brand-hairline"
              }`}>
              {agreed && <Check size={12} weight="bold" color="#fff" />}
            </div>
            <p className="text-xs text-brand-muted leading-relaxed m-0">
              By creating an account, I agree to the{" "}
              <span className="text-brand-accent cursor-pointer hover:text-brand-accent-hover" onClick={() => setScreen("privacy")}>Terms of Service</span>
              {" "}and{" "}
              <span className="text-brand-accent cursor-pointer hover:text-brand-accent-hover" onClick={() => setScreen("privacy")}>Privacy Policy</span>
            </p>
          </div>

          <AnimatePresence>
            {signupError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3 text-red-600 text-xs">
                <WarningCircle size={14} weight="light" /> {signupError}
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={handleCreate} disabled={loading || !allPwMet || !agreed}
            className="w-full h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:bg-brand-hairline disabled:text-brand-muted text-white font-medium text-sm flex items-center justify-center gap-2 mb-4 transition-colors">
            {loading ? (
              <><CircleNotch size={16} className="animate-spin" /> Creating account...</>
            ) : (
              <>{`Create ${isOrg ? "Organizer" : "Attendee"} Account`} <ArrowRight size={16} weight="light" /></>
            )}
          </button>

          <p className="text-sm text-brand-muted text-center">
            Already have an account?{" "}
            <span onClick={() => setScreen("login")} className="text-brand-accent font-medium cursor-pointer hover:text-brand-accent-hover transition-colors">
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
