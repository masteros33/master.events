import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, ChevronDown, ChevronUp } from "lucide-react";

const CONSENT_KEY = "me_cookie_consent";
const BRAND       = "#F97316";

export default function CookieBanner() {
  const [visible,    setVisible]    = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Slight delay so it doesn't pop on first render
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      essential: true,
      payments: true,
    }));
    dismiss();
  };

  const essentialOnly = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      essential: true,
      payments: false,
    }));
    dismiss();
  };

  const dismiss = () => {
    setAnimateOut(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!animateOut && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            zIndex: 999,
            padding: "0 0 env(safe-area-inset-bottom, 0px)",
          }}>
          <div style={{
            margin: "0 auto",
            maxWidth: "520px",
            background: "var(--bg-card)",
            borderRadius: "20px 20px 0 0",
            border: "1px solid var(--border)",
            borderBottom: "none",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}>

            {/* Top bar */}
            <div style={{ height: "4px", background: `linear-gradient(90deg, ${BRAND}, #EA6C0A, #7c3aed)` }} />

            <div style={{ padding: "20px 20px 24px" }}>

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: `${BRAND}12`, border: `1px solid ${BRAND}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Cookie size={18} color={BRAND} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px", marginBottom: "4px" }}>
                    We use cookies
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    Master Events uses essential cookies to keep you signed in and process payments securely.
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={dismiss}
                  style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <X size={13} color="var(--text-muted)" />
                </motion.button>
              </div>

              {/* Expandable details */}
              <motion.div whileTap={{ scale: 0.99 }} onClick={() => setExpanded(!expanded)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: "var(--bg-subtle)", borderRadius: "10px", cursor: "pointer", marginBottom: "14px", border: "1px solid var(--border)" }}>
                <Shield size={13} color="var(--text-muted)" />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", flex: 1, fontWeight: 500 }}>What we use</span>
                {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
              </motion.div>

              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", marginBottom: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
                      {[
                        { icon: "🔐", label: "Essential cookies", desc: "Session auth, JWT tokens, security", required: true,  color: "#16a34a" },
                        { icon: "💳", label: "Paystack",          desc: "Payment processing for ticket purchases", required: true,  color: "#2563eb" },
                      ].map(item => (
                        <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", background: "var(--bg-card)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: item.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>{item.label}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</div>
                          </div>
                          <div style={{ fontSize: "9px", fontWeight: 700, padding: "3px 7px", borderRadius: "99px", background: item.required ? "rgba(22,163,74,0.1)" : `${BRAND}10`, color: item.required ? "#16a34a" : BRAND, border: `1px solid ${item.required ? "rgba(22,163,74,0.2)" : BRAND + "25"}`, flexShrink: 0 }}>
                            {item.required ? "REQUIRED" : "OPTIONAL"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={essentialOnly}
                  style={{ flex: 1, padding: "12px 10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 600, fontSize: "13px", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                  Essential only
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={accept}
                  style={{ flex: 2, padding: "12px 10px", background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", color: "#fff", fontFamily: "var(--font-sans)", boxShadow: `0 4px 16px ${BRAND}35` }}>
                  Accept all cookies
                </motion.button>
              </div>

              <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px", lineHeight: 1.6 }}>
                By using Master Events you agree to our{" "}
                <span style={{ color: BRAND, cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>.
                You can change preferences anytime in Settings.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}