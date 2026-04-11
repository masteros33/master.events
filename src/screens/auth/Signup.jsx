import React, { useState } from "react";
import useStore from "../../store/useStore";

const input = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "#fff", border: "1.5px solid #f0f0f0",
  borderRadius: "14px", fontSize: "14px", color: "#1a1a1a",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const btn = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "15px", fontWeight: 700, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,166,35,0.28)", marginBottom: "12px",
};

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
  const [selectedRole, setSelectedRole] = useState("attendee");
  const [loading, setLoading]           = useState(false);
  const [pwErrors, setPwErrors]         = useState([]);

  const validatePassword = (pw) => {
    const errors = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[0-9]/.test(pw)) errors.push("One number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errors.push("One special character");
    return errors;
  };

  const handleCreate = async () => {
    const errors = validatePassword(signupPassword);
    if (errors.length > 0) { setPwErrors(errors); return; }
    setPwErrors([]);
    setLoading(true);
    setSignupData({ role: selectedRole });
    await handleSignup();
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "50px 28px 40px", overflowY: "auto" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: 
          "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", 
          justifyContent: "center", fontSize: "30px", margin: "0 auto 14px", 
          boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
        <h1 style={{ color: "#1a1a1a", fontSize: "26px", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.3px" }}>Create Account</h1>
        <p style={{ color: "#aaa", fontSize: "13px" }}>Join thousands of event-goers in Ghana</p>
      </div>

      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Full Name</div>
      <input placeholder="e.g. Kwame Mensah" value={fullName} onChange={e => setFullName(e.target.value)} style={input} />

      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Email Address</div>
      <input placeholder="you@email.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} style={input} autoComplete="email" />

      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Password</div>
      <input placeholder="Min 8 chars, uppercase, number, special" type="password"
        value={signupPassword}
        onChange={e => { setSignupPassword(e.target.value); if (pwErrors.length) setPwErrors(validatePassword(e.target.value)); }}
        style={{ ...input, border: pwErrors.length ? "1.5px solid #e74c3c" : "1.5px solid #f0f0f0" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px", marginTop: "-6px" }}>
        {[
          ["8+ chars",     signupPassword.length >= 8],
          ["Uppercase",    /[A-Z]/.test(signupPassword)],
          ["Number",       /[0-9]/.test(signupPassword)],
          ["Special char", /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword)],
        ].map(([label, met]) => (
          <div key={label} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: met ? "rgba(39,174,96,0.1)" : "#f0f0f0", color: met ? "#27ae60" : "#bbb" }}>
            {met ? "✓" : "·"} {label}
          </div>
        ))}
      </div>

      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "10px" }}>I am joining as:</div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {[
          { role: "attendee",  icon: "🎟️", label: "Attendee",  sub: "Buy & transfer tickets" },
          { role: "organizer", icon: "🎪", label: "Organizer", sub: "Create & manage events" },
        ].map(item => (
          <div key={item.role} onClick={() => setSelectedRole(item.role)}
            style={{ flex: 1, padding: "14px 10px", borderRadius: "16px", cursor: "pointer", textAlign: "center",
              border: "1.5px solid " + (selectedRole === item.role ? "#f5a623" : "#f0f0f0"),
              background: selectedRole === item.role ? "rgba(245,166,35,0.06)" : "#fff",
              boxShadow: selectedRole === item.role ? "0 4px 16px rgba(245,166,35,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
            }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "13px", color: selectedRole === item.role ? "#f5a623" : "#1a1a1a" }}>{item.label}</div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px", lineHeight: 1.4 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {signupError && (
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "#e74c3c", fontSize: "13px" }}>
          ⚠️ {signupError}
        </div>
      )}

      <button onClick={handleCreate} disabled={loading} style={{ ...btn, opacity: loading ? 0.7 : 1 }}>
        {loading ? "⏳ Creating account..." : "Create Account"}
      </button>

      <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center" }}>
        Already have an account?{" "}
        <span onClick={() => setScreen("login")} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>Log in</span>
      </p>
    </div>
  );
}

export function RoleSelect() {
  const handleSelectRole = useStore(s => s.handleSelectRole);
  return (
    <div style={{ minHeight: "100%", background: "#f8f8f6", padding: "60px 28px", textAlign: "center" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎉</div>
      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.3px" }}>You're in!</h2>
      <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "40px" }}>How will you use Master Events?</p>
      {[
        { role: "attendee",  icon: "🎟️", title: "I'm an Attendee",  sub: "Browse events, buy tickets, resell and transfer" },
        { role: "organizer", icon: "🎪", title: "I'm an Organizer", sub: "Create events, sell tickets, manage door access" },
      ].map(item => (
        <div key={item.role} onClick={() => handleSelectRole(item.role)}
          style={{ background: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "14px", cursor: "pointer", textAlign: "left", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1.5px solid #f0f0f0" }}>
          <div style={{ width: "52px", height: "52px", background: "rgba(245,166,35,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{item.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a", marginBottom: "4px" }}>{item.title}</div>
            <div style={{ fontSize: "12px", color: "#aaa", lineHeight: 1.5 }}>{item.sub}</div>
          </div>
          <div style={{ marginLeft: "auto", color: "#f5a623", fontSize: "20px" }}>→</div>
        </div>
      ))}
    </div>
  );
}