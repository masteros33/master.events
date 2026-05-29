import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import useStore from "../store/useStore";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import { Avatar } from "../utils/avatar";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

// ── African/Ghanaian event hero images (Unsplash — free) ──────
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=90", // concert crowd
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=90", // festival crowd
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=90", // concert stage lights
];

// ── Floating popup cards — appear one at a time ───────────────
function FloatingCards() {
  const [visible, setVisible] = useState(0);

  const cards = [
    { name: "Afrobeats Night Accra", price: "Ghc 80",  color: "#f5a623", icon: "🎵", pos: { top: "15%", left: "4%" } },
    { name: "Tech Summit Ghana",     price: "Ghc 150", color: "#2563eb", icon: "💻", pos: { top: "8%",  right: "5%" } },
    { name: "Food Fest Kumasi",      price: "FREE",    color: "#16a34a", icon: "🍔", pos: { top: "58%", right: "4%" } },
    { name: "Art Exhibition Lagos",  price: "Ghc 40",  color: "#7c3aed", icon: "🎨", pos: { top: "62%", left: "3%" } },
    { name: "GCTU Sports Day",       price: "FREE",    color: "#e17055", icon: "⚽", pos: { top: "80%", right: "7%" } },
    { name: "Blockchain Talk",       price: "Ghc 50",  color: "#00cec9", icon: "⛓️", pos: { top: "82%", left: "6%" } },
  ];

  // Show cards one at a time, cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => (v + 1) % cards.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {cards.map((c, i) => (
        <AnimatePresence key={i}>
          {visible === i && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "absolute", ...c.pos, width: "180px" }}>
              <div style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "14px", padding: "10px 13px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)",
                display: "flex", gap: "10px", alignItems: "center",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: c.color + "18", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0,
                  border: "1px solid " + c.color + "30",
                }}>{c.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "11px", color: "#0f0e0c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize: "11px", color: c.color, fontWeight: 800, marginTop: "2px" }}>{c.price}</div>
                </div>
                <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function NavBar({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
        transition: "all 0.3s ease",
      }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <motion.div whileHover={{ scale: 1.02 }} onClick={() => onNavigate("home")}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px",
            background: "linear-gradient(135deg, #f5a623, #e8920f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", boxShadow: "0 4px 14px rgba(245,166,35,0.4)",
          }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: "17px", color: scrolled ? "#0f0e0c" : "#fff", letterSpacing: "-0.3px", transition: "color 0.3s" }}>
            Master Events
          </span>
        </motion.div>

        <div style={{ display: "flex", alignItems: "center", gap: "28px" }} className="hidden md:flex">
          {[["Events", "#events"], ["About", "about"]].map(([label, href]) => (
            <motion.span key={label}
              whileHover={{ color: "#f5a623" }}
              onClick={() => href.startsWith("#") ? document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }) : onNavigate(href)}
              style={{ fontSize: "14px", fontWeight: 500, color: scrolled ? "var(--text-secondary)" : "rgba(255,255,255,0.85)", cursor: "pointer", transition: "color 0.2s" }}>
              {label}
            </motion.span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ThemeToggle compact={true} />
          <motion.span whileHover={{ color: "#f5a623" }}
            onClick={() => onNavigate("login")}
            className="hidden md:block"
            style={{ fontSize: "14px", fontWeight: 600, color: scrolled ? "var(--text-secondary)" : "rgba(255,255,255,0.85)", cursor: "pointer", transition: "color 0.2s" }}>
            Log in
          </motion.span>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(245,166,35,0.5)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("signup")}
            style={{
              padding: "10px 22px", borderRadius: "12px",
              background: "linear-gradient(135deg, #f5a623, #e8920f)",
              color: "#fff", fontWeight: 700, fontSize: "14px",
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(245,166,35,0.4)",
            }}>
            Sign up free
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// ── Stats ticker ──────────────────────────────────────────────
function StatsTicker() {
  const stats = ["10K+ Tickets Sold", "50+ Events", "100% Verified", "0% Fake Tickets", "Ghana's #1 Platform", "NFT Powered", "MoMo Payments", "Polygon Blockchain"];
  return (
    <div style={{ background: "var(--brand)", padding: "9px 0", overflow: "hidden" }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: "48px", whiteSpace: "nowrap" }}>
        {[...stats, ...stats].map((s, i) => (
          <span key={i} style={{ fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.8px" }}>
            {s} <span style={{ opacity: 0.4, marginLeft: "2px" }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Landing Page ──────────────────────────────────────────────
function LandingPage({ onNavigate }) {
  const [events,    setEvents]    = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Rotate hero images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("https://master-events-backend.onrender.com/api/events/")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEvents(data.slice(0, 8)); })
      .catch(() => {});
  }, []);

  const catImg = {
    music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
    food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
    sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
    business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
    other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      <NavBar onNavigate={onNavigate} />
      <StatsTicker />

      {/* ── Hero — rotating background images ── */}
      <section ref={heroRef} style={{ position: "relative", overflow: "hidden", height: "92vh", minHeight: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Rotating background images */}
        {HERO_IMAGES.map((img, i) => (
          <AnimatePresence key={i}>
            {heroIndex === i && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <motion.img
                  src={img} alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Dark overlay — layered for depth */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)", zIndex: 1 }} />

        {/* Floating popup cards */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <FloatingCards />
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 3, textAlign: "center", maxWidth: "800px", padding: "0 32px" }}>
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Badge */}
            <motion.div variants={fadeUp} style={{ marginBottom: "28px" }}>
              <motion.div
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "7px 18px", borderRadius: "99px",
                  background: "rgba(245,166,35,0.15)",
                  border: "1px solid rgba(245,166,35,0.4)",
                  color: "#f5a623", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
                  backdropFilter: "blur(8px)",
                }}>
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f5a623", display: "inline-block" }}
                />
                AFRICA'S BLOCKCHAIN TICKETING PLATFORM
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp}
              style={{
                fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 900, lineHeight: 1.0,
                letterSpacing: "-3px", color: "#ffffff",
                marginBottom: "24px", textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              }}>
              Find events that<br />
              <span style={{
                background: "linear-gradient(135deg, #f5a623, #ffb347)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                move you.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUp}
              style={{
                fontSize: "18px", color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7, marginBottom: "40px",
                maxWidth: "520px", margin: "0 auto 40px",
                textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              }}>
              From Afrobeats concerts in Accra to tech summits in Kumasi — discover, buy and own your tickets as NFTs on the blockchain.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 16px 48px rgba(245,166,35,0.55)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  padding: "16px 38px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #f5a623, #e8920f)",
                  color: "#fff", fontWeight: 700, fontSize: "16px",
                  border: "none", cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(245,166,35,0.45)",
                }}>
                Browse Events →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.18)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("signup")}
                style={{
                  padding: "16px 38px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  color: "#fff", fontWeight: 700, fontSize: "16px",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                Create Event
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Image dots indicator */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 4 }}>
          {HERO_IMAGES.map((_, i) => (
            <motion.div key={i}
              animate={{ width: heroIndex === i ? "24px" : "6px", opacity: heroIndex === i ? 1 : 0.4 }}
              transition={{ duration: 0.3 }}
              onClick={() => setHeroIndex(i)}
              style={{ height: "6px", borderRadius: "3px", background: "#fff", cursor: "pointer" }}
            />
          ))}
        </div>

        {/* Stats row at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            position: "absolute", bottom: "80px", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: "40px", flexWrap: "wrap",
            justifyContent: "center", zIndex: 4,
          }}>
          {[["10K+", "Tickets Sold", "#f5a623"], ["50+", "Live Events", "#4ade80"], ["100%", "NFT Verified", "#60a5fa"], ["0%", "Fake Tickets", "#f87171"]].map(([val, label, color]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color, letterSpacing: "-1px", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>{val}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "3px", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Events Grid ── */}
      <section id="events" style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 32px" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>UPCOMING EVENTS</div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, letterSpacing: "-1px", color: "var(--text-primary)" }}>Happening across Africa</h2>
            </div>
            <motion.span whileHover={{ x: 4 }} onClick={() => onNavigate("signup")}
              style={{ fontSize: "14px", fontWeight: 700, color: "#f5a623", cursor: "pointer" }}>
              View all →
            </motion.span>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px" }}>
            {(events.length > 0 ? events : Array(8).fill(null)).map((ev, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 24px 56px rgba(0,0,0,0.14)", borderColor: "var(--brand)" }}
                onClick={() => onNavigate("signup")}
                style={{
                  background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden",
                  cursor: "pointer", border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)", transition: "all 0.25s var(--ease-smooth)",
                }}>
                <div style={{ height: "190px", position: "relative", background: "var(--bg-subtle)" }}>
                  {ev ? (
                    <>
                      <img src={ev.image || catImg[ev.category] || catImg.other} alt={ev.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.src = catImg.other; }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.6))" }} />
                      <div style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 10px", borderRadius: "99px", background: "#f5a623", color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                        {ev.category}
                      </div>
                      {parseFloat(ev.price) === 0 && (
                        <div style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 10px", borderRadius: "99px", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700 }}>
                          FREE
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: "10px", left: "12px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "3px 8px", borderRadius: "99px" }}>
                        <span style={{ fontSize: "8px" }}>⛓️</span>
                        <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>NFT Ticket</span>
                      </div>
                    </>
                  ) : (
                    <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  {ev ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px", lineHeight: 1.3 }}>{ev.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>📅 {ev.date} · 📍 {ev.venue}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: "17px", color: "#f5a623" }}>
                          {parseFloat(ev.price) === 0 ? "FREE" : "Ghc " + ev.price}
                        </span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ padding: "8px 16px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
                          Get Tickets
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="skeleton" style={{ height: "15px", width: "80%", marginBottom: "8px" }} />
                      <div className="skeleton" style={{ height: "12px", width: "60%", marginBottom: "14px" }} />
                      <div className="skeleton" style={{ height: "14px", width: "40%" }} />
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: "var(--bg-subtle)", padding: "80px 32px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "56px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>WHY MASTER EVENTS</div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 900, letterSpacing: "-1.2px", color: "var(--text-primary)" }}>Built different. Built for Africa.</h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              {[
                { icon: "⛓️", title: "NFT Tickets on Polygon",   body: "Every ticket is minted on the blockchain — impossible to fake, permanently yours.", color: "#2563eb" },
                { icon: "💰", title: "95% Payout to Organizers", body: "We charge only 5%. The rest goes straight to your MoMo wallet — withdraw anytime.", color: "#16a34a" },
                { icon: "📱", title: "MoMo & VISA Payments",     body: "Pay the Ghanaian way. Mobile money, VISA, and more — fast and secure.", color: "#f5a623" },
                { icon: "🔒", title: "HMAC-Secured QR Codes",    body: "Dynamic QR codes refresh every 10 seconds — screenshot-proof and forgery-resistant.", color: "#dc2626" },
                { icon: "🔄", title: "Ticket Resale Market",     body: "List your ticket for resale at any price. Only 2% fee — you keep 98%.", color: "#7c3aed" },
                { icon: "🚪", title: "Smart Door Scanning",      body: "Generate invite codes for door staff. Scan QR tickets in seconds at the gate.", color: "#0891b2" },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp}
                  whileHover={{ y: -5, boxShadow: "var(--shadow-lg)", borderColor: f.color + "40" }}
                  style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.25s" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: f.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "16px", border: "1px solid " + f.color + "22" }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "8px" }}>{f.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.body}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Organizer CTA ── */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div style={{ background: "#0e0d0b", borderRadius: "28px", padding: "64px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "40px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", transform: "translate(-30%, 30%)", pointerEvents: "none" }} />
              <div style={{ maxWidth: "520px", position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>FOR EVENT ORGANIZERS</div>
                <h2 style={{ fontSize: "clamp(28px, 3vw, 46px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "16px" }}>
                  Ready to host<br />your next event?
                </h2>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "32px" }}>
                  Create events, sell blockchain-verified tickets, manage door staff, and receive 95% directly to your MoMo wallet. From Accra to Lagos.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <motion.button whileHover={{ scale: 1.03, boxShadow: "0 16px 40px rgba(245,166,35,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate("signup")}
                    style={{ padding: "14px 28px", borderRadius: "14px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(245,166,35,0.4)" }}>
                    Start Selling Tickets
                  </motion.button>
                  <motion.button whileHover={{ background: "rgba(255,255,255,0.1)" }}
                    onClick={() => onNavigate("about")}
                    style={{ padding: "14px 28px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "15px", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", transition: "background 0.2s" }}>
                    Learn More
                  </motion.button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flexShrink: 0, position: "relative", zIndex: 1 }}>
                {[["95%", "Payout Rate"], ["NFT", "Tickets"], ["MoMo", "Payments"], ["QR", "Scanning"]].map(([val, label]) => (
                  <motion.div key={label} whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
                    style={{ padding: "20px", borderRadius: "16px", textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", width: "110px", transition: "all 0.2s" }}>
                    <div style={{ fontWeight: 900, fontSize: "22px", color: "#f5a623", marginBottom: "4px" }}>{val}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: "var(--bg-subtle)", padding: "80px 32px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#f5a623", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>WHAT PEOPLE SAY</div>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, letterSpacing: "-0.8px", color: "var(--text-primary)" }}>Trusted across Ghana</h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {[
                { name: "Kwame Asante", role: "Event Organizer · Accra",   quote: "Master Events gave us one place to manage tickets, door staff, and payments. We received 95% of revenue directly to MoMo — no delays." },
                { name: "Ama Owusu",    role: "Concert Attendee · Kumasi", quote: "I love that my ticket is an NFT — I can transfer it to my friend and it just works. No more fake tickets at the gate." },
                { name: "Kofi Mensah",  role: "Tech Conference Organizer", quote: "The blockchain verification at the door was seamless. Our door staff just scanned QR codes and it told them instantly if the ticket was valid." },
              ].map((t, i) => (
                <motion.div key={i} variants={fadeUp}
                  whileHover={{ y: -5, boxShadow: "var(--shadow-lg)" }}
                  style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.25s" }}>
                  <div style={{ fontSize: "36px", color: "#f5a623", fontWeight: 900, lineHeight: 1, marginBottom: "16px", fontFamily: "Georgia, serif" }}>"</div>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "20px" }}>{t.quote}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar seed={t.name} name={t.name} size={40} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "52px 32px 36px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "40px", marginBottom: "40px" }}>
            <div style={{ maxWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "11px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 3px 10px rgba(245,166,35,0.3)" }}>🎟️</div>
                <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Master Events</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>Africa's blockchain-powered event ticketing platform. Built in Ghana 🇬🇭</p>
            </div>
            <div style={{ display: "flex", gap: "56px", flexWrap: "wrap" }}>
              {[
                { title: "Platform", links: [["Browse Events", "#events"], ["Create Event", "signup"], ["Resale Market", "#"]] },
                { title: "Company",  links: [["About", "about"], ["Contact", "mailto:mastereventgh@gmail.com"]] },
                { title: "Legal",    links: [["Privacy", "#"], ["Terms", "#"], ["Security", "#"]] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "1.2px", color: "var(--text-muted)", marginBottom: "14px", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{col.title}</div>
                  {col.links.map(([label, href]) => (
                    <div key={label} style={{ marginBottom: "10px" }}>
                      <motion.span whileHover={{ color: "#f5a623" }}
                        onClick={() => href.startsWith("#") || href.startsWith("mailto") ? null : onNavigate(href)}
                        style={{ fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }}>
                        {label}
                      </motion.span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              © 2026 Master Events Ghana · Secured by Polygon Blockchain
            </span>
            <ThemeToggle compact={false} />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── About Page ────────────────────────────────────────────────
function AboutPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      <NavBar onNavigate={onNavigate} />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px" }}>
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(245,166,35,0.35)" }}>🎟️</div>
            <h1 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-1.5px", color: "var(--text-primary)", marginBottom: "16px" }}>About Master Events</h1>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: 1.7 }}>Africa's first blockchain-powered event ticketing platform.</p>
          </motion.div>
          {[
            { icon: "🎯", title: "Our Mission",           body: "We believe every event experience should start with trust. Master Events uses blockchain technology to ensure every ticket is authentic, verifiable, and owned by the rightful buyer.", color: "#f5a623" },
            { icon: "⛓️", title: "Blockchain Technology", body: "Every ticket purchased on Master Events is minted as an NFT on the Polygon blockchain — the same technology used by major global platforms, now available across Africa.", color: "#2563eb" },
            { icon: "💰", title: "Fair for Organizers",   body: "We take only 5% per transaction. 95% goes directly to the organizer's wallet, withdrawable via MTN MoMo or VISA instantly.", color: "#16a34a" },
            { icon: "🌍", title: "Built for Africa",      body: "From Afrobeats concerts in Accra to tech summits in Lagos — Master Events is designed for Africa's vibrant and growing events scene.", color: "#7c3aed" },
            { icon: "👥", title: "The Team",              body: "Built by students at Ghana Communication Technology University (GCTU) as a final-year CS project — combining blockchain, mobile, and payments innovation.", color: "#0891b2" },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
              style={{ display: "flex", gap: "20px", background: "var(--bg-card)", borderRadius: "20px", padding: "28px", marginBottom: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: item.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0, border: "1px solid " + item.color + "20" }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>{item.title}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75 }}>{item.body}</div>
              </div>
            </motion.div>
          ))}
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "8px", fontSize: "14px" }}>Have questions? Reach us at</p>
            <a href="mailto:mastereventgh@gmail.com" style={{ color: "#f5a623", fontWeight: 700, fontSize: "18px" }}>mastereventgh@gmail.com</a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function PhoneFrame({ children }) {
  const setScreen  = useStore(s => s.setScreen);
  const screen     = useStore(s => s.screen);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  useTheme();

  const getPage = () => {
    if (isLoggedIn) return "app";
    if (screen === "home")  return "home";
    if (screen === "about") return "about";
    if (screen === "login" || screen === "signup" || screen === "role") return "app";
    return "home";
  };

  const desktopPage = getPage();

  const handleNavigate = (page) => {
    if (page === "login" || page === "signup") setScreen(page);
    else if (page === "home")  setScreen("home");
    else if (page === "about") setScreen("about");
    else setScreen(page);
  };

  if (desktopPage === "home")  return <LandingPage onNavigate={handleNavigate} />;
  if (desktopPage === "about") return <AboutPage onNavigate={handleNavigate} />;

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      {children}
    </div>
  );
}