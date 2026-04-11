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
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", background: "#fff" }}>

      {/* ── Left — Branding (desktop only) ── */}
      <div style={{ flex: "0 0 50%", display: "none", flexDirection: "column", justifyContent: "center", padding: "64px", background: "linear-gradient(160deg, #fffcf5 0%, #fff8f0 60%, #fff 100%)" }}
        className="signup-left-panel">
        <div style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 24, boxShadow: "0 8px 24px rgba(245,166,35,0.3)", background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎫</div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12, color: "#f5a623" }}>MASTER EVENTS GHANA</div>

        <h1 style={{ fontWeight: 900, color: "#111", lineHeight: 1, marginBottom: 16, fontSize: 52, letterSpacing: "-2px" }}>
          Ghana's<br />
          <span style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>best tickets.</span>
        </h1>

        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          Buy, sell and transfer blockchain-verified tickets to Ghana's best events. Join thousands of event-goers.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["⛓️", "NFT on Polygon",   "Unfakeable blockchain tickets"],
            ["💰", "95% to organizers","Only 5% platform fee"],
            ["🔍", "QR door scanning", "Fast and fraud-proof entry"],
            ["📱", "MoMo & VISA",      "Pay the Ghanaian way"],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)" }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Signup Form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "linear-gradient(135deg, #fffcf5 0%, #fafafa 100%)", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }} className="signup-mobile-logo">
            <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)", background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎫</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: 0 }}>Create Account</h1>
            <p style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>Join thousands of event-goers in Ghana</p>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 48px rgba(0,0,0,0.1)", border: "1.5px solid #f0f0f0", padding: "36px 40px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 6px" }}>Create your account</h2>
            <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 28px" }}>Join Ghana's #1 blockchain ticketing platform — it's free</p>

            {/* Name + Username row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Full Name</label>
                <input placeholder="Kwame Mensah" value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #f0f0f0", fontSize: 13, outline: "none", background: "#fafafa", boxSizing: "border-box", caretColor: "#f5a623" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Username</label>
                <input placeholder="kwame23" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #f0f0f0", fontSize: 13, outline: "none", background: "#fafafa", boxSizing: "border-box", caretColor: "#f5a623" }}
                  autoCapitalize="none" />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Email Address</label>
              <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0f0f0", fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box", caretColor: "#f5a623" }}
                autoComplete="email" />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Password</label>
              <input
                placeholder="Min 8 chars, uppercase, number, special"
                type="password"
                value={signupPassword}
                onChange={e => { setSignupPassword(e.target.value); if (pwErrors.length) setPwErrors(validatePassword(e.target.value)); }}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${pwErrors.length ? "#fecaca" : "#f0f0f0"}`, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box", marginBottom: 10, caretColor: "#f5a623" }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {pwChecks.map(([label, met]) => (
                  <div key={label} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: met ? "rgba(39,174,96,0.1)" : "#f5f5f5", color: met ? "#27ae60" : "#bbb" }}>
                    {met ? "✓" : "·"} {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>I am joining as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { role: "attendee",  icon: "🎟️", label: "Attendee",  sub: "Buy & transfer tickets" },
                  { role: "organizer", icon: "🎪", label: "Organizer", sub: "Create & manage events" },
                ].map(item => (
                  <div key={item.role} onClick={() => setSelectedRole(item.role)}
                    style={{
                      padding: "14px 12px", borderRadius: 14, cursor: "pointer", textAlign: "center",
                      border: `2px solid ${selectedRole === item.role ? "#f5a623" : "#f0f0f0"}`,
                      background: selectedRole === item.role ? "rgba(245,166,35,0.06)" : "#fff",
                      boxShadow: selectedRole === item.role ? "0 4px 16px rgba(245,166,35,0.15)" : "none",
                      transition: "all 0.15s ease",
                    }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: selectedRole === item.role ? "#f5a623" : "#111" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {signupError && (
              <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
                ⚠️ {signupError}
              </div>
            )}

            <button onClick={handleCreate} disabled={loading}
              style={{ width: "100%", padding: "15px", borderRadius: 14, fontWeight: 700, color: "#fff", fontSize: 15, border: "none", cursor: "pointer", marginBottom: 20, background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.35)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "⏳ Creating account..." : "Create Account →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 14, color: "#aaa", margin: 0 }}>
              Already have an account?{" "}
              <span onClick={() => setScreen("login")} style={{ fontWeight: 700, cursor: "pointer", color: "#f5a623" }}>Log in</span>
            </p>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 1024px) {
          .signup-left-panel { display: flex !important; }
          .signup-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export function RoleSelect() {
  const handleSelectRole = useStore(s => s.handleSelectRole);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fffcf5 0%, #fafafa 100%)", padding: "24px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)", background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>You're in!</h2>
          <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>How will you use Master Events?</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { role: "attendee",  icon: "🎟️", title: "I'm an Attendee",  sub: "Browse events, buy tickets, resell and transfer" },
            { role: "organizer", icon: "🎪", title: "I'm an Organizer", sub: "Create events, sell tickets, manage door access" },
          ].map(item => (
            <div key={item.role} onClick={() => handleSelectRole(item.role)}
              style={{ background: "#fff", borderRadius: 20, padding: "20px", cursor: "pointer", display: "flex", gap: 16, alignItems: "center", border: "1.5px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transition: "all 0.15s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5a623"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,166,35,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, background: "rgba(245,166,35,0.1)" }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: 18, color: "#f5a623" }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}