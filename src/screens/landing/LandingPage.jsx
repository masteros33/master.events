import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";

const isDesktop = () => window.innerWidth > 768;

// ── Floating particles ────────────────────────────────────────
function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      delay: Math.random() * 4,
      dur: Math.random() * 6 + 8,
    }))
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <motion.div key={p.id}
          animate={{ y: [0, -24, 0], opacity: [0.1, 0.45, 0.1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: p.x + "%", top: p.y + "%",
            width: p.size + "px", height: p.size + "px",
            borderRadius: "50%",
            background: "rgba(245,166,35,0.8)",
            pointerEvents: "none",
          }} />
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "22px 20px",
      }}>
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "7px", letterSpacing: "-0.2px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{desc}</div>
    </motion.div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "#f5a623", letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "5px", letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const setScreen = useStore(s => s.setScreen);
  const [desktop, setDesktop] = useState(isDesktop());

  useEffect(() => {
    const h = () => setDesktop(isDesktop());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const features = [
    { icon: "⛓️", title: "NFT-Secured Tickets",      desc: "Every ticket minted as an NFT on Polygon. Zero fakes. Permanent on-chain proof.", delay: 0 },
    { icon: "🔐", title: "Screenshot-Proof QR",       desc: "Dynamic HMAC-signed QR refreshes every 10 seconds. Scalpers get nothing.", delay: 0.08 },
    { icon: "🎟️", title: "Instant Resale & Transfer", desc: "Transfer or resell peer-to-peer. NFT ownership moves on-chain automatically.", delay: 0.16 },
    { icon: "📱", title: "Mobile Money Ready",         desc: "MTN MoMo, Telecel Cash, AirtelTigo Money. Built for Ghana.", delay: 0.24 },
    { icon: "🚪", title: "Smart Door Scanning",        desc: "Real-time QR validation at the gate. Tickets self-invalidate after scan.", delay: 0.32 },
    { icon: "💎", title: "Post-Event Collectibles",    desc: "Your ticket evolves into a collector NFT after the event.", delay: 0.4 },
  ];

  // KEY FIX: use minHeight + normal block flow instead of fixed height
  // This lets the PhoneFrame scroll naturally on mobile
  return (
    <div style={{
      background: "#080810",
      minHeight: "100%",
      fontFamily: "var(--font-sans)",
      color: "#fff",
      // Critical for mobile inside PhoneFrame: let content flow naturally
      position: "relative",
    }}>

      {/* ── Sticky Navbar ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8,8,16,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: desktop ? "0 48px" : "0 16px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
            🎟️
          </div>
          <span style={{ fontWeight: 800, fontSize: "14px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
        </div>

        {/* Nav CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("login")}
            style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.8)", borderRadius: "9px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            Sign In
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("signup")}
            style={{ padding: "7px 14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "9px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(245,166,35,0.4)", fontFamily: "var(--font-sans)" }}>
            Get Started
          </motion.button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{
        position: "relative",
        padding: desktop ? "100px 48px 80px" : "52px 20px 52px",
        textAlign: "center",
        overflow: "hidden",
        // min height so it feels like a full-screen hero
        minHeight: desktop ? "calc(100vh - 56px)" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Background glows */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,166,35,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "0%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "0%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <Particles />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "700px", width: "100%" }}>

          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.28)", borderRadius: "99px", padding: "5px 13px", marginBottom: "22px" }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f5a623" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#f5a623", letterSpacing: "0.4px" }}>Live on Polygon Mainnet</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            style={{
              fontSize: desktop ? "58px" : "32px",
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: desktop ? "-2px" : "-1px",
              marginBottom: "18px",
              color: "#fff",
            }}>
            Event Tickets,{" "}
            <span style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Reimagined
            </span>
            <br />on the Blockchain.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            style={{
              fontSize: desktop ? "17px" : "14px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              maxWidth: "500px",
              margin: "0 auto 28px",
              fontWeight: 400,
            }}>
            Ghana's first NFT ticketing platform. No fakes. No scalpers. Real tickets secured on-chain, redeemable with your phone.
          </motion.p>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px", marginBottom: "30px" }}>
            {["🔒 256-bit Encrypted", "⛓️ Polygon Blockchain", "📱 MoMo Ready", "🇬🇭 Made for Ghana"].map(label => (
              <div key={label} style={{ padding: "4px 11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "99px", fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {label}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setScreen("signup")}
              style={{ padding: desktop ? "15px 34px" : "13px 26px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "13px", fontSize: desktop ? "15px" : "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px rgba(245,166,35,0.45)", fontFamily: "var(--font-sans)" }}>
              Browse Events →
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setScreen("login")}
              style={{ padding: desktop ? "15px 34px" : "13px 26px", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "13px", fontSize: desktop ? "15px" : "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              Sign In
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: desktop ? "60px 48px" : "44px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[["0¢","Gas Fees"],["10s","QR Refresh"],["100%","On-Chain"],["∞","Scale"]].map(([v, l]) => (
            <Stat key={l} value={v} label={l} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: desktop ? "80px 48px" : "52px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#f5a623", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>Why Master Events</div>
            <h2 style={{ fontSize: desktop ? "38px" : "24px", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, color: "#fff", margin: 0 }}>
              The infrastructure<br />events deserve.
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: "14px" }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: desktop ? "60px 48px" : "44px 20px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: desktop ? "34px" : "22px", fontWeight: 800, letterSpacing: "-1px", color: "#fff", margin: 0 }}>
              Buy to gate in 3 steps.
            </h2>
          </motion.div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { step: "01", icon: "🔍", title: "Browse Events",    desc: "Discover events across Ghana. Filter by category, date, and city." },
              { step: "02", icon: "💳", title: "Pay with MoMo",    desc: "MTN MoMo, Telecel, or AirtelTigo. Your ticket mints as an NFT instantly." },
              { step: "03", icon: "📲", title: "Scan at the Gate", desc: "Show your dynamic QR. Staff validates in real time. No fakes get through." },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1 }}
                style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#f5a623", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "5px" }}>STEP {item.step}</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "5px" }}>{item.title}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: desktop ? "80px 48px" : "56px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,166,35,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            style={{ fontSize: desktop ? "44px" : "26px", fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.08, marginBottom: "16px", color: "#fff" }}>
            Ready for ticketing<br />
            <span style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              done right?
            </span>
          </motion.h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", maxWidth: "360px", margin: "0 auto 28px", lineHeight: 1.6 }}>
            Join thousands of Ghanaians buying and selling tickets on-chain.
          </p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setScreen("signup")}
            style={{ padding: desktop ? "16px 44px" : "14px 32px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontSize: desktop ? "16px" : "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 32px rgba(245,166,35,0.45)", fontFamily: "var(--font-sans)" }}>
            Create Your Account →
          </motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: desktop ? "28px 48px" : "20px 20px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>🎟️</div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Master Events</span>
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>© 2025 Master Events Ghana · Built on Polygon</div>
        <div style={{ display: "flex", gap: "16px" }}>
          {["About", "Privacy", "Contact"].map(link => (
            <span key={link} style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{link}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}