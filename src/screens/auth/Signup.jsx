import React, { useState } from "react";
import useStore from "../../store/useStore";

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

  const [username, setUsername]         = useState("");
  const [selectedRole, setSelectedRole] = useState("attendee");
  const [loading, setLoading]           = useState(false);
  const [pwErrors, setPwErrors]         = useState([]);

  const validatePassword = (pw) => {
    const e = [];
    if (pw.length < 8) e.push("8+ chars");
    if (!/[A-Z]/.test(pw)) e.push("Uppercase");
    if (!/[0-9]/.test(pw)) e.push("Number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) e.push("Special char");
    return e;
  };

  const handleCreate = async () => {
    const errors = validatePassword(signupPassword);
    if (errors.length > 0) { setPwErrors(errors); return; }
    setPwErrors([]);
    setLoading(true);
    setSignupData({ role: selectedRole, username });
    await handleSignup();
    setLoading(false);
  };

  const pwChecks = [
    ["8+ chars",     signupPassword.length >= 8],
    ["Uppercase",    /[A-Z]/.test(signupPassword)],
    ["Number",       /[0-9]/.test(signupPassword)],
    ["Special char", /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword)],
  ];

  return (
    <div className="min-h-fit bg-gradient-to-br from-white to-gray-100 pt-8 px-6">

      {/* ── Left — Branding ── 
      <div className="hidden lg:flex flex-col justify-center px-16 py-12"
        style={{ background: "linear-gradient(160deg, #fffcf5 0%, #fff8f0 60%, #fff 100%)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎫</div>

        <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#f5a623" }}>MASTER EVENTS GHANA</div>

        <h1 className="font-black text-gray-900 leading-none mb-4" style={{ fontSize: "52px", letterSpacing: "-2px" }}>
          Ghana's<br />
          <span style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            best tickets.
          </span>
        </h1>

        <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-sm">
          Buy, sell and transfer blockchain-verified tickets to Ghana's best events. Join thousands of event-goers.
        </p>

        <div className="space-y-4">
          {[
            ["⛓️", "NFT on Polygon",    "Unfakeable blockchain tickets"],
            ["💰", "95% to organizers", "Only 5% platform fee"],
            ["🔍", "QR door scanning",  "Fast and fraud-proof entry"],
            ["📱", "MoMo & VISA",       "Pay the Ghanaian way"],
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
      </div>
      */}
      {/* ── Right — Signup Form ── */}
      <div className="flex justify-center px-6 py-2 ">
        <div className="w-full max-w-md">

          {/* Mobile logo 
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎫</div>
            <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-400 text-xs mt-1">Join thousands of event-goers in Ghana</p>
          </div>
            */}
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>
            <h1 className="text-2xl font-black text-gray-900">Master Events</h1>
            <p className="text-gray-400 text-xs tracking-widest mt-1">Join thousands of event-goers in Ghana</p>
          </div>

          {/* Card */}
    {/*   <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8"> */}
            <h2 className="text-center text-4xl font-black text-gray-900 mb-1">SIGNUP</h2>
          {/*  <p className="text-center text-gray-400 text-sm mb-5">Join Ghana's 
          #1 blockchain ticketing platform — it's free</p> */}

            {/* Name + Username row */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input placeholder="Kwame Mensah" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm outline-none bg-gray-50"
                  style={{ caretColor: "#f5a623" }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                <input placeholder="kwame23" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm outline-none bg-gray-50"
                  style={{ caretColor: "#f5a623" }} autoCapitalize="none" />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm outline-none bg-gray-50"
                style={{ caretColor: "#f5a623" }} autoComplete="email" />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <input placeholder="Min 8 chars, uppercase, number, special" type="password"
                value={signupPassword}
                onChange={e => { setSignupPassword(e.target.value); if (pwErrors.length) setPwErrors(validatePassword(e.target.value)); }}
                className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none bg-gray-50 mb-2"
                style={{ borderColor: pwErrors.length ? "#e74c3c" : "#f0f0f0", caretColor: "#f5a623" }} />
              {/* Password checks */}
              <div className="flex flex-wrap gap-1.5">
                {pwChecks.map(([label, met]) => (
                  <div key={label} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: met ? "rgba(39,174,96,0.1)" : "#f0f0f0", color: met ? "#27ae60" : "#bbb" }}>
                    {met ? "✓" : "·"} {label}
                  </div>
                ))}
              </div>
          {/*  </div> */}

            {/* Role selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">I am joining as</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { role: "attendee",  icon: "🎟️", label: "Attendee",  sub: "Buy & transfer tickets" },
                  { role: "organizer", icon: "🎪", label: "Organizer", sub: "Create & manage events" },
                ].map(item => (
                  <div key={item.role} onClick={() => setSelectedRole(item.role)}
                    className="p-3 rounded-xl cursor-pointer text-center border-2 transition-all"
                    style={{
                      borderColor: selectedRole === item.role ? "#f5a623" : "#f0f0f0",
                      background: selectedRole === item.role ? "rgba(245,166,35,0.06)" : "#fff",
                      boxShadow: selectedRole === item.role ? "0 4px 16px rgba(245,166,35,0.15)" : "none",
                    }}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-bold text-sm" style={{ color: selectedRole === item.role ? "#f5a623" : "#1a1a1a" }}>{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {signupError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4">
                ⚠️ {signupError}
              </div>
            )}

            <button onClick={handleCreate} disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base border-none cursor-pointer mb-4"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.35)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "⏳ Creating account..." : "Create Account →"}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <span onClick={() => setScreen("login")} className="font-bold cursor-pointer" style={{ color: "#f5a623" }}>
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoleSelect() {
  const handleSelectRole = useStore(s => s.handleSelectRole);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">You're in!</h2>
          <p className="text-gray-400 text-sm">How will you use Master Events?</p>
        </div>

        <div className="space-y-3">
          {[
            { role: "attendee",  icon: "🎟️", title: "I'm an Attendee",  sub: "Browse events, buy tickets, resell and transfer" },
            { role: "organizer", icon: "🎪", title: "I'm an Organizer", sub: "Create events, sell tickets, manage door access" },
          ].map(item => (
            <div key={item.role} onClick={() => handleSelectRole(item.role)}
              className="bg-white rounded-2xl p-5 cursor-pointer flex gap-4 items-center border-2 border-gray-100 shadow-md transition-all"
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5a623"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,166,35,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = ""; }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: "rgba(245,166,35,0.1)" }}>{item.icon}</div>
              <div>
                <div className="font-bold text-base text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
              </div>
              <div className="ml-auto text-xl" style={{ color: "#f5a623" }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}