import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";

const API = "https://master-events-backend.onrender.com";
const LOGIN_BG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=90";

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
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)" }}>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        style={{ maxWidth:"420px", width:"90%", background:"#fff", borderRadius:"24px", padding:"40px 36px", boxShadow:"0 32px 80px rgba(0,0,0,0.25)", border:"1px solid rgba(0,0,0,0.06)" }}>
        {sent ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"48px", marginBottom:"16px" }}>📧</div>
            <h2 style={{ fontSize:"22px", fontWeight:800, color:"#1a1a1a", marginBottom:"10px" }}>Check your email</h2>
            <p style={{ color:"rgba(0,0,0,0.55)", fontSize:"14px", lineHeight:1.6, marginBottom:"24px" }}>
              Reset link sent to <strong style={{ color:"#1a1a1a" }}>{email}</strong>
            </p>
            <motion.button whileTap={{ scale:0.97 }} onClick={onBack}
              style={{ padding:"13px 28px", borderRadius:"12px", background:"linear-gradient(135deg, #f5a623, #e8920f)", color:"#fff", fontWeight:700, fontSize:"14px", border:"none", cursor:"pointer", fontFamily:"var(--font-sans)" }}>
              Back to Login
            </motion.button>
          </div>
        ) : (
          <>
            <motion.button onClick={onBack}
              style={{ background:"none", border:"none", color:"#e8920f", fontSize:"13px", fontWeight:600, cursor:"pointer", padding:"0 0 20px 0", fontFamily:"var(--font-sans)" }}>
              ← Back
            </motion.button>
            <div style={{ fontSize:"36px", marginBottom:"14px" }}>🔐</div>
            <h2 style={{ fontSize:"22px", fontWeight:800, color:"#1a1a1a", marginBottom:"6px" }}>Forgot Password?</h2>
            <p style={{ color:"rgba(0,0,0,0.55)", fontSize:"13px", marginBottom:"22px" }}>Enter your email and we'll send a reset link</p>
            <input placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              style={{ width:"100%", padding:"13px 16px", marginBottom:"12px", background:"rgba(0,0,0,0.03)", border:"1.5px solid rgba(0,0,0,0.1)", borderRadius:"12px", fontSize:"14px", color:"#1a1a1a", outline:"none", boxSizing:"border-box", fontFamily:"var(--font-sans)" }}
              onFocus={e => { e.target.style.borderColor="#f5a623"; e.target.style.boxShadow="0 0 0 3px rgba(245,166,35,0.12)"; }}
              onBlur={e => { e.target.style.borderColor="rgba(0,0,0,0.1)"; e.target.style.boxShadow="none"; }}
            />
            {error && <div style={{ color:"#dc2626", fontSize:"12px", marginBottom:"12px" }}>⚠️ {error}</div>}
            <motion.button whileTap={{ scale:0.97 }} onClick={handleSend} disabled={loading}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", background:"linear-gradient(135deg, #f5a623, #e8920f)", color:"#fff", fontWeight:700, fontSize:"14px", border:"none", cursor:"pointer", fontFamily:"var(--font-sans)", opacity:loading?0.7:1 }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </motion.button>
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

  const [loading,       setLoading]       = useState(false);
  const [showForgot,    setShowForgot]    = useState(false);
  const [showPw,        setShowPw]        = useState(false);
  const [rateLock,      setRateLock]      = useState(null);
  const [honeypot,      setHoneypot]      = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError,   setGoogleError]   = useState("");
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

  // ── KEY FIX: use useStore.setState instead of setCurrentUser ──
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setGoogleError("");
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        const res = await fetch(`${API}/api/auth/google/`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:      userInfo.email,
            first_name: userInfo.given_name  || "",
            last_name:  userInfo.family_name || "",
            google_id:  userInfo.sub,
          }),
        });
        const data = await res.json();

        if (res.ok && data.tokens) {
          localStorage.setItem("access_token",  data.tokens.access);
          localStorage.setItem("refresh_token", data.tokens.refresh);
          const user     = data.user;
          const firstTab = user.role === "organizer" ? "dashboard" : "home";
          useStore.setState({
            currentUser: user,
            role:        user.role,
            isLoggedIn:  true,
            activeTab:   firstTab,
            screen:      "app",
          });
          toast.success("Welcome back, " + user.first_name + "!");
        } else {
          setGoogleError(data.detail || data.error || "Google sign-in failed. Try again.");
        }
      } catch (e) {
        console.error("Google login error:", e);
        setGoogleError("Connection error. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setGoogleError("Google sign-in was cancelled.");
    },
  });

  const inp = (extra = {}) => ({
    width:"100%", padding:"13px 16px", outline:"none",
    background:"rgba(0,0,0,0.03)", border:"1.5px solid rgba(0,0,0,0.1)",
    borderRadius:"12px", fontSize:"14px", color:"#1a1a1a",
    fontFamily:"var(--font-sans)", boxSizing:"border-box", transition:"all 0.2s",
    ...extra,
  });
  const focusInp = e => { e.target.style.borderColor="rgba(245,166,35,0.7)"; e.target.style.background="rgba(245,166,35,0.05)"; e.target.style.boxShadow="0 0 0 3px rgba(245,166,35,0.12)"; };
  const blurInp  = e => { e.target.style.borderColor="rgba(0,0,0,0.1)"; e.target.style.background="rgba(0,0,0,0.03)"; e.target.style.boxShadow="none"; };

  return (
    <div style={{ position:"fixed", inset:0, fontFamily:"var(--font-sans)" }}>

      <img src={LOGIN_BG} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.6) 100%)" }} />
      <div style={{ position:"absolute", top:"30%", left:"20%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)", filter:"blur(40px)", pointerEvents:"none" }} />

      {/* Logo */}
      <div style={{ position:"absolute", top:"28px", left:"32px", zIndex:10, display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"linear-gradient(135deg, #f5a623, #e8920f)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", boxShadow:"0 4px 16px rgba(245,166,35,0.45)" }}>🎟️</div>
        <span style={{ fontWeight:800, fontSize:"16px", color:"#fff", letterSpacing:"-0.3px" }}>Master Events</span>
      </div>

      {/* Left side — desktop */}
      <div style={{ position:"absolute", left:"6%", top:"50%", transform:"translateY(-50%)", zIndex:5, maxWidth:"380px", display:window.innerWidth>=900?"block":"none" }}>
        <div style={{ fontSize:"10px", fontWeight:700, color:"#f5a623", letterSpacing:"2.5px", marginBottom:"16px", fontFamily:"var(--font-mono)" }}>GHANA'S #1 NFT TICKETING PLATFORM</div>
        <h2 style={{ fontSize:"clamp(32px, 3.5vw, 48px)", fontWeight:900, color:"#fff", lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:"20px" }}>
          Your ticket.<br />
          <span style={{ background:"linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Your ownership.</span>
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {["⛓️  Every ticket minted as an NFT on Polygon blockchain","📱  Pay with MTN MoMo, Telecel Cash, or AirtelTigo","🔐  Screenshot-proof QR — rotates every 10 seconds","💸  Resell tickets peer-to-peer — you keep 98%"].map(line => (
            <div key={line} style={{ fontSize:"14px", color:"rgba(255,255,255,0.85)", lineHeight:1.5 }}>{line}</div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"24px", marginTop:"32px" }}>
          {[["10K+","Tickets Sold"],["50+","Events"],["0%","Fake Tickets"],["NFT","Powered"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize:"20px", fontWeight:900, color:"#f5a623", letterSpacing:"-0.5px" }}>{v}</div>
              <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.6)", marginTop:"2px", fontFamily:"var(--font-mono)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ position:"absolute", right:window.innerWidth>=900?"6%":"50%", top:"50%", transform:window.innerWidth>=900?"translateY(-50%)":"translate(50%, -50%)", width:"min(420px, 90vw)", zIndex:10 }}>
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
          style={{ background:"rgba(255,255,255,0.94)", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", borderRadius:"24px", padding:"36px 32px", border:"1px solid rgba(255,255,255,0.6)", boxShadow:"0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)" }}>

          <div style={{ marginBottom:"24px" }}>
            <h1 style={{ fontSize:"26px", fontWeight:900, color:"#1a1a1a", letterSpacing:"-0.8px", marginBottom:"6px" }}>Welcome back</h1>
            <p style={{ fontSize:"13px", color:"rgba(0,0,0,0.5)" }}>Log in to access your NFT tickets and wallet</p>
          </div>

          {/* Google button */}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            onClick={() => googleLogin()} disabled={googleLoading}
            style={{ width:"100%", padding:"13px", borderRadius:"13px", background:"#fff", border:"1.5px solid rgba(0,0,0,0.1)", color:"#1a1a1a", fontWeight:600, fontSize:"14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginBottom:"8px", fontFamily:"var(--font-sans)", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            {googleLoading ? (
              <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.8, ease:"linear" }}
                style={{ width:"16px", height:"16px", borderRadius:"50%", border:"2px solid #ccc", borderTopColor:"#333" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </motion.button>

          {/* Google error */}
          <AnimatePresence>
            {googleError && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"8px", padding:"8px 12px", marginBottom:"8px", color:"#dc2626", fontSize:"12px" }}>
                ⚠️ {googleError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px", marginTop:"10px" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize:"11px", color:"rgba(0,0,0,0.35)", fontWeight:500 }}>or with email</span>
            <div style={{ flex:1, height:"1px", background:"rgba(0,0,0,0.08)" }} />
          </div>

          {/* Honeypot */}
          <div style={{ position:"absolute", left:"-9999px" }} aria-hidden="true">
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} name="website" />
          </div>

          {/* Email */}
          <div style={{ marginBottom:"12px" }}>
            <label style={{ fontSize:"12px", fontWeight:600, color:"rgba(0,0,0,0.55)", marginBottom:"6px", display:"block", letterSpacing:"0.3px" }}>EMAIL</label>
            <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" style={inp()} onFocus={focusInp} onBlur={blurInp} />
          </div>

          {/* Password */}
          <div style={{ marginBottom:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
              <label style={{ fontSize:"12px", fontWeight:600, color:"rgba(0,0,0,0.55)", letterSpacing:"0.3px" }}>PASSWORD</label>
              <span onClick={() => setShowForgot(true)} style={{ fontSize:"11px", color:"#e8920f", fontWeight:600, cursor:"pointer" }}>Forgot?</span>
            </div>
            <div style={{ position:"relative" }}>
              <input placeholder="••••••••" type={showPw?"text":"password"} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key==="Enter" && !loading && !rateLock && onLogin()}
                autoComplete="current-password" style={inp({ paddingRight:"44px" })} onFocus={focusInp} onBlur={blurInp} />
              <button onClick={() => setShowPw(!showPw)}
                style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(0,0,0,0.35)", fontSize:"14px", padding:0 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Rate lock */}
          <AnimatePresence>
            {rateLock && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ background:"rgba(217,119,6,0.08)", border:"1px solid rgba(217,119,6,0.25)", borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", color:"#b45309", fontSize:"12px", fontWeight:600 }}>
                🛡️ Too many attempts. Try again in {rateLock}s
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login error */}
          <AnimatePresence>
            {loginError && !rateLock && (
              <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"10px", padding:"10px 14px", marginBottom:"12px", color:"#dc2626", fontSize:"12px" }}>
                ⚠️ {loginError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login button */}
          <motion.button
            whileHover={!loading&&!rateLock?{scale:1.02}:{}} whileTap={!loading&&!rateLock?{scale:0.97}:{}}
            onClick={onLogin} disabled={loading||!!rateLock}
            style={{ width:"100%", padding:"14px", borderRadius:"13px", background:rateLock?"rgba(0,0,0,0.05)":"linear-gradient(135deg, #f5a623, #e8920f)", color:rateLock?"rgba(0,0,0,0.3)":"#fff", fontWeight:700, fontSize:"15px", border:"none", cursor:loading||rateLock?"not-allowed":"pointer", boxShadow:rateLock?"none":"0 8px 24px rgba(245,166,35,0.35)", marginBottom:"18px", fontFamily:"var(--font-sans)", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", transition:"all 0.2s" }}>
            {loading ? (
              <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.7, ease:"linear" }}
                style={{ width:"16px", height:"16px", borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.4)", borderTopColor:"#fff" }} />Logging in...</>
            ) : rateLock ? `🛡️ Wait ${rateLock}s` : "Log In →"}
          </motion.button>

          <p style={{ fontSize:"13px", color:"rgba(0,0,0,0.45)", textAlign:"center", marginBottom:"8px" }}>
            No account?{" "}
            <span onClick={() => setScreen("signup")} style={{ color:"#e8920f", fontWeight:700, cursor:"pointer" }}>Sign up free</span>
          </p>
          <p style={{ fontSize:"12px", color:"rgba(0,0,0,0.35)", textAlign:"center" }}>
            Door staff?{" "}
            <span onClick={() => setScreen("doorStaffLogin")} style={{ color:"#e8920f", fontWeight:600, cursor:"pointer" }}>Enter with invite code</span>
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForgot && <ForgotPassword onBack={() => setShowForgot(false)} />}
      </AnimatePresence>
    </div>
  );
}