import React, { useState } from "react";
import useStore from "../../store/useStore";

const API = "https://master-events-backend.onrender.com";

function ForgotPassword({ onBack }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSend = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error || "Something went wrong");
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center justify-center text-3xl mx-auto mb-5">📧</div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Check your email</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">We sent a reset link to <strong>{email}</strong></p>
        <button onClick={onBack} className="px-8 py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-6">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-amber-500 font-semibold text-sm mb-6 bg-transparent border-none cursor-pointer p-0">
          ← Back to Login
        </button>
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🔐</div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Forgot Password?</h1>
          <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send a reset link</p>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
          <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm outline-none mb-4 bg-gray-50"
            style={{ caretColor: "#f5a623" }} />
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4">⚠️ {error}</div>}
          <button onClick={handleSend} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm border-none cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </div>
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
  const [loading, setLoading]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const onLogin = async () => { setLoading(true); await handleLogin(); setLoading(false); };

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 pt-8 px-6">

      {/* ── Left — Branding ── 
      <div className="hidden lg:flex flex-col justify-center px-16 py-12"
        style={{ background: "linear-gradient(160deg, #fffcf5 0%, #fff8f0 60%, #fff 100%)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>

        <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#f5a623" }}>MASTER EVENTS GHANA</div>

        <h1 className="font-black text-gray-900 leading-none mb-4" style={{ fontSize: "52px", letterSpacing: "-2px" }}>
          Welcome<br />
          <span style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            back.
          </span>
        </h1>

        <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-sm">
          Your NFT tickets and events are waiting. Every ticket is secured on Polygon blockchain — yours forever.
        </p>

        <div className="space-y-4">
          {[
            ["⛓️", "NFT on Polygon",     "Every ticket blockchain-verified and unfakeable"],
            ["💰", "95% to organizers",  "Only 5% platform fee, withdraw via MoMo"],
            ["📱", "MoMo & VISA",        "Pay the Ghanaian way — mobile money or card"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border"
                style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.2)" }}>{icon}</div>
              <div>
                <div className="font-bold text-sm text-gray-900">{title}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats 
        <div className="flex gap-8 mt-12">
          {[["10K+","Tickets Sold"],["50+","Events"],["0%","Fake Tickets"]].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-black" style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
      */}
      {/* ── Right — Login Form ── */}
      <div className="flex justify-center px-6 py-5">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>
            <h1 className="text-2xl font-black text-gray-900">Master Events</h1>
            <p className="text-gray-400 text-xs tracking-widest mt-1">IF NOT NOW, WHEN?</p>
          </div>

          {/* Card */}
          {/* <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8"> */}
            <h2 className="text-center text-4xl font-black text-gray-900 mb-1">LOGIN</h2>
            {/* <p className="text-gray-400 text-sm mb-6">Enter your username and password to continue</p> */}

            {/* Username */}
            <div className="mb-4 pt-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <input
                placeholder="username or you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 text-sm outline-none bg-gray-50 transition-all"
                style={{ caretColor: "#f5a623" }}
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <span onClick={() => setShowForgot(true)} className="text-xs font-bold cursor-pointer" style={{ color: "#f5a623" }}>
                  Forgot password?
                </span>
              </div>
              <input
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin()}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 text-sm outline-none bg-gray-50 transition-all"
                style={{ caretColor: "#f5a623" }}
              />
            </div>

            {/* Errors */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4">
                ⚠️ {loginError}
              </div>
            )}
            {loading && (
              <div className="rounded-xl px-4 py-3 text-sm mb-4 text-center border"
                style={{ background: "rgba(245,166,35,0.06)", borderColor: "rgba(245,166,35,0.2)", color: "#f5a623" }}>
                ⏳ Logging in... first load may take ~30s
              </div>
            )}

            {/* Login button */}
            <button onClick={onLogin} disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base border-none cursor-pointer mb-4 transition-all"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.35)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Logging in..." : "Log In →"}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-300 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-400 mb-2">
              No account?{" "}
              <span onClick={() => setScreen("signup")} className="font-bold cursor-pointer" style={{ color: "#f5a623" }}>
                Sign up free
              </span>
            </p>
            <p className="text-center text-xs text-gray-400">
              Door staff?{" "}
              <span onClick={() => setScreen("doorStaffLogin")} className="font-semibold cursor-pointer" style={{ color: "#f5a620" }}>
                Enter with invite code
              </span>
            </p>
          {/* </div> */}

          {/* Dev quick login */}
          <div className="mt-4 bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm">
            <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#f5a623" }}>⚡ QUICK LOGIN (DEV)</div>
            <div onClick={() => { setEmail("jude@test.com"); setPassword("test1234"); }}
              className="flex justify-between items-center cursor-pointer py-1">
              <span className="text-xs text-gray-400">jude@test.com / test1234</span>
              <span className="text-xs font-bold" style={{ color: "#f5a623" }}>Organizer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}