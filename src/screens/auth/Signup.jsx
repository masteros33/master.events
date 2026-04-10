import React, { useState } from "react";
import useStore from "../../store/useStore";

const isDesktop = () => window.innerWidth > 768;

const fieldStyle = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "#fafafa", border: "2px solid #f0f0f0",
  borderRadius: "14px", fontSize: "15px", color: "#1a1a1a",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623",
};

export function Signup() {
  const fullName        = useStore(s => s.fullName);
  const signupEmail     = useStore(s => s.signupEmail);
  const signupPassword  = useStore(s => s.signupPassword);
  const setFullName     = useStore(s => s.setFullName);
  const setSignupEmail  = useStore(s => s.setSignupEmail);
  const setSignupPassword = useStore(s => s.setSignupPassword);
  const handleSignup    = useStore(s => s.handleSignup);
  const setSignupData   = useStore(s => s.setSignupData);
  const setScreen       = useStore(s => s.setScreen);
  const signupError     = useStore(s => s.signupError);

  const [username, setUsername]         = useState("");
  const [selectedRole, setSelectedRole] = useState("attendee");
  const [loading, setLoading]           = useState(false);
  const [pwErrors, setPwErrors]         = useState([]);
  const desktop = isDesktop();

  const validatePassword = (pw) => {
    const errors = [];
    if (pw.length < 8) errors.push("8+ chars");
    if (!/[A-Z]/.test(pw)) errors.push("Uppercase");
    if (!/[0-9]/.test(pw)) errors.push("Number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errors.push("Special char");
    return errors;
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

  const FormContent = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 20px" : "0" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Full Name</div>
          <input placeholder="e.g. Kwame Mensah" value={fullName}
            onChange={e => setFullName(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Username</div>
          <input placeholder="e.g. kwame23" value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
            style={fieldStyle} autoCapitalize="none" />
        </div>
      </div>

      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Email Address</div>
        <input placeholder="you@email.com" value={signupEmail}
          onChange={e => setSignupEmail(e.target.value)} style={fieldStyle} autoComplete="email" />
      </div>

      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Password</div>
        <input placeholder="Min 8 chars, uppercase, number, special" type="password"
          value={signupPassword}
          onChange={e => { setSignupPassword(e.target.value); if (pwErrors.length) setPwErrors(validatePassword(e.target.value)); }}
          style={{ ...fieldStyle, border: "2px solid " + (pwErrors.length ? "#e74c3c" : "#f0f0f0"), marginBottom: "8px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          {pwChecks.map(([label, met]) => (
            <div key={label} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: met ? "rgba(39,174,96,0.1)" : "#f0f0f0", color: met ? "#27ae60" : "#bbb" }}>
              {met ? "✓" : "·"} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Role selector */}
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "10px" }}>I am joining as:</div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {[
          { role: "attendee",  icon: "🎟️", label: "Attendee",  sub: "Buy & transfer tickets" },
          { role: "organizer", icon: "🎪", label: "Organizer", sub: "Create & manage events" },
        ].map(item => (
          <div key={item.role} onClick={() => setSelectedRole(item.role)}
            style={{ flex: 1, padding: "14px 10px", borderRadius: "16px", cursor: "pointer", textAlign: "center",
              border: "2px solid " + (selectedRole === item.role ? "#f5a623" : "#f0f0f0"),
              background: selectedRole === item.role ? "rgba(245,166,35,0.06)" : "#fff",
              boxShadow: selectedRole === item.role ? "0 4px 16px rgba(245,166,35,0.15)" : "none",
            }}>
            <div style={{ fontSize: "26px", marginBottom: "6px" }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "13px", color: selectedRole === item.role ? "#f5a623" : "#1a1a1a" }}>{item.label}</div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {signupError && (
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "#e74c3c", fontSize: "13px" }}>
          ⚠️ {signupError}
        </div>
      )}

      <button onClick={handleCreate} disabled={loading}
        style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", boxShadow: "0 8px 24px rgba(245,166,35,0.28)", opacity: loading ? 0.7 : 1, marginBottom: "12px" }}>
        {loading ? "⏳ Creating account..." : "Create Account"}
      </button>

      <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center" }}>
        Already have an account?{" "}
        <span onClick={() => setScreen("login")} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>Log in</span>
      </p>
    </>
  );

  // ── Desktop layout ────────────────────────────────────────
  if (desktop) return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #fffcf5 0%, #fff8f0 50%, #fff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px" }}>
      <div style={{ display: "flex", gap: "80px", alignItems: "flex-start", maxWidth: "1000px", width: "100%" }}>

        {/* Left branding */}
        <div style={{ flex: 1, paddingTop: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎫</div>
          <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px" }}>MASTER EVENTS GHANA</div>
          <h1 style={{ fontSize: "46px", fontWeight: 900, color: "#1a1a1a", lineHeight: 1.05, marginBottom: "16px", letterSpacing: "-1.5px" }}>
            Ghana's<br /><span style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>best tickets.</span>
          </h1>
          <p style={{ color: "#6b6b6b", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", maxWidth: "320px" }}>
            Buy, sell and transfer blockchain-verified tickets to Ghana's best events.
          </p>
          <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "16px", padding: "16px 20px" }}>
            <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, marginBottom: "10px" }}>WHY MASTER EVENTS</div>
            {[["⛓️","NFT on Polygon","Unfakeable blockchain tickets"],
              ["💰","95% to organizers","Only 5% platform fee"],
              ["🔍","QR door scanning","Fast & fraud-proof entry"]].map(([icon, title, sub]) => (
              <div key={title} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "16px" }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#1a1a1a" }}>{title}</div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — signup card */}
        <div style={{ width: "480px", flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: "28px", padding: "40px 36px", border: "2px solid #f0ebe0", boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(245,166,35,0.08)" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px", letterSpacing: "-0.3px" }}>Create your account</h2>
            <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "24px" }}>Join Ghana's #1 blockchain ticketing platform</p>
            <FormContent />
          </div>
        </div>
      </div>
    </div>
  );

  // ── Mobile layout ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "50px 28px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎫</div>
        <h1 style={{ color: "#1a1a1a", fontSize: "26px", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.3px" }}>Create Account</h1>
        <p style={{ color: "#aaa", fontSize: "13px" }}>Join thousands of event-goers in Ghana</p>
      </div>
      <FormContent />
    </div>
  );
}

export function RoleSelect() {
  const handleSelectRole = useStore(s => s.handleSelectRole);
  const desktop = isDesktop();

  return (
    <div style={{ minHeight: "100%", background: desktop ? "linear-gradient(160deg, #fffcf5, #fff)" : "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 28px" }}>
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎉</div>
        <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.3px" }}>You're in!</h2>
        <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "32px" }}>How will you use Master Events?</p>
        {[
          { role: "attendee",  icon: "🎟️", title: "I'm an Attendee",  sub: "Browse events, buy tickets, resell and transfer" },
          { role: "organizer", icon: "🎪", title: "I'm an Organizer", sub: "Create events, sell tickets, manage door access" },
        ].map(item => (
          <div key={item.role} onClick={() => handleSelectRole(item.role)}
            style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", cursor: "pointer", textAlign: "left", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "2px solid #f0f0f0", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5a623"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,166,35,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}>
            <div style={{ width: "52px", height: "52px", background: "rgba(245,166,35,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a", marginBottom: "4px" }}>{item.title}</div>
              <div style={{ fontSize: "12px", color: "#aaa", lineHeight: 1.5 }}>{item.sub}</div>
            </div>
            <div style={{ marginLeft: "auto", color: "#f5a623", fontSize: "20px" }}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}