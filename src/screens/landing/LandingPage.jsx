import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";

const isDesktop = () => window.innerWidth > 768;

// ── Floating particles ────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    dur: Math.random() * 6 + 8,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <motion.div key={p.id}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: p.x + "%", top: p.y + "%", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: "rgba(245,166,35,0.7)" }} />
      ))}
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "20px", padding: "28px 24px", backdropFilter: "blur(12px)" }}>
      <div style={{ fontSize: "32px", marginBottom: "14px" }}>{icon}</div>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.2px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{desc}</div>
    </motion.div>
  );
}

// ── Stat ──────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
      style={{ textAlign: "center" }}>
      <div style={{ fontSize: "36px", fontWeight: 800, color: "#f5a623", letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "6px", letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

// ── Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const setScreen = useStore(s => s.setScreen);
  const [desktop,    setDesktop]    = useState(isDesktop());
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => setDesktop(isDesktop());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll detection for navbar frosting
  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const onScroll = () => setNavScrolled(el.scrollTop > 40);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: "⛓️", title: "NFT-Secured Tickets",     desc: "Every ticket is minted as an NFT on Polygon. Zero duplication. Zero fraud. Permanent on-chain proof of ownership.", delay: 0 },
    { icon: "🔐", title: "Screenshot-Proof QR",      desc: "Dynamic HMAC-signed QR codes that refresh every 10 seconds. Screenshots are worthless to scalpers.", delay: 0.1 },
    { icon: "🎟️", title: "Instant Transfer & Resale",desc: "Transfer or resell your ticket in seconds. NFT ownership transfers automatically on-chain — no middlemen.", delay: 0.2 },
    { icon: "📱", title: "Mobile Money Ready",        desc: "Pay with MTN MoMo, Telecel Cash, or AirtelTigo Money. Built for Ghana, designed for Africa.", delay: 0.3 },
    { icon: "🚪", title: "Smart Door Scanning",       desc: "Real-time QR validation at the gate. Tickets auto-invalidate after scanning — no double entries.", delay: 0.4 },
    { icon: "💎", title: "Post-Event Collectibles",   desc: "After the event, your ticket evolves into a collector NFT — a permanent memory on the blockchain.", delay: 0.5 },
  ];

  return (
    <div id="landing-scroll"
      style={{ background: "#080810", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", fontFamily: "var(--font-sans)", color: "#fff" }}>

      {/* ── Navbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: navScrolled ? "rgba(8,8,16,0.96)" : "transparent",
        backdropFilter: navScrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: navScrolled ? "blur(20px)" : "none",
        borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "background 0.3s, border-color 0.3s",
        padding: desktop ? "0 48px" : "0 20px",
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,166,35,0.35)" }}>
            <span style={{ fontSize: "16px" }}>🎟️</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
        </div>

        {/* Right CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("login")}
            style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            Sign In
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("signup")}
            style={{ padding: "8px 18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(245,166,35,0.4)", fontFamily: "var(--font-sans)" }}>
            Get Started
          </motion.button>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: desktop ? "0 48px" : "60px 24px 60px", textAlign: "center", overflow: "hidden" }}>

        {/* Glow orbs */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <Particles />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "820px" }}>

          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "99px", padding: "6px 14px", marginBottom: "28px" }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f5a623" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#f5a623", letterSpacing: "0.5px" }}>Live on Polygon Mainnet</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: desktop ? "64px" : "38px", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "22px", color: "#fff", margin: "0 0 22px" }}>
            Event Tickets,{" "}
            <span style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Reimagined
            </span>
            <br />on the Blockchain.
          </motion.h1>

          {/* Subheadline */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: desktop ? "19px" : "15px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 32px", fontWeight: 400 }}>
            Ghana's first NFT ticketing platform. No fakes. No scalpers. Just real tickets, secured on-chain, redeemable with your phone.
          </motion.p>

          {/* Trust pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", marginBottom: "36px" }}>
            {["🔒 256-bit Encrypted", "⛓️ Polygon Blockchain", "📱 MoMo Ready", "🇬🇭 Made for Ghana"].map(label => (
              <div key={label} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "99px", fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                {label}
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setScreen("signup")}
              style={{ padding: desktop ? "16px 36px" : "14px 28px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontSize: desktop ? "16px" : "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(245,166,35,0.45)", fontFamily: "var(--font-sans)" }}>
              Browse Events →
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setScreen("login")}
              style={{ padding: desktop ? "16px 36px" : "14px 28px", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", fontSize: desktop ? "16px" : "15px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", backdropFilter: "blur(12px)" }}>
              Sign In
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.3 }}>
          <div style={{ width: "1px", height: "32px", background: "linear-gradient(to bottom, transparent, #fff)" }} />
          <div style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#fff" }}>Scroll</div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: desktop ? "80px 48px" : "60px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: desktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: desktop ? "0" : "32px" }}>
          {[
            ["0¢",   "Gas on Polygon"],
            ["10s",  "QR Refresh Rate"],
            ["100%", "On-Chain Proof"],
            ["∞",    "Scalability"],
          ].map(([v, l]) => <Stat key={l} value={v} label={l} />)}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: desktop ? "100px 48px" : "70px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>Why Master Events</div>
            <h2 style={{ fontSize: desktop ? "44px" : "28px", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, color: "#fff", margin: 0 }}>
              The infrastructure<br />events deserve.
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: "16px" }}>
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: desktop ? "80px 48px" : "60px 24px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: desktop ? "40px" : "26px", fontWeight: 800, letterSpacing: "-1px", color: "#fff", margin: 0 }}>
              From purchase to gate<br />in 3 steps.
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: "24px" }}>
            {[
              { step: "01", icon: "🔍", title: "Browse Events",    desc: "Discover events across Ghana. Filter by category, date, and city." },
              { step: "02", icon: "💳", title: "Pay with MoMo",    desc: "Checkout with MTN MoMo, Telecel, or AirtelTigo. Ticket mints instantly as an NFT." },
              { step: "03", icon: "📲", title: "Scan at the Gate", desc: "Show your dynamic QR. Staff scans and validates in real time. No fakes get through." },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ textAlign: desktop ? "center" : "left", display: "flex", flexDirection: desktop ? "column" : "row", alignItems: desktop ? "center" : "flex-start", gap: "16px" }}>
                <div style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "16px", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>STEP {item.step}</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{item.title}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: desktop ? "100px 48px" : "70px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(245,166,35,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: desktop ? "52px" : "30px", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.05, marginBottom: "20px", color: "#fff" }}>
            Ready to experience<br />
            <span style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ticketing done right?
            </span>
          </motion.h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", marginBottom: "36px", maxWidth: "400px", margin: "0 auto 36px" }}>
            Join thousands of Ghanaians buying and selling tickets on-chain.
          </p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setScreen("signup")}
            style={{ padding: desktop ? "18px 48px" : "15px 36px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "16px", fontSize: desktop ? "17px" : "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 40px rgba(245,166,35,0.5)", fontFamily: "var(--font-sans)" }}>
            Create Your Account →
          </motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: desktop ? "32px 48px" : "24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px" }}>🎟️</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Master Events</span>
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
          © 2025 Master Events Ghana · Built on Polygon
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {["About", "Privacy", "Contact"].map(link => (
            <span key={link} style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>{link}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}