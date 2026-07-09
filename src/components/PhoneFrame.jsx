import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import { Avatar } from "../utils/avatar";
import {
  Ticket, Sun, Moon, Monitor, Menu, Link2,
  RefreshCw, Lock, DoorOpen, ArrowRight
} from "lucide-react";

const BRAND      = "#F97316";
const BRAND_DARK = "#EA6C0A";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=90",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=90",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=90",
];

const LOGIN_IMAGE  = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=90";
const SIGNUP_IMAGE = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=90";

// ── Inline theme toggle button ────────────────────────────────
function ThemeBtn({ compact = true }) {
  const { theme, setTheme } = useTheme();
  const order    = ["light", "dark", "system"];
  const icons    = { light: Sun, dark: Moon, system: Monitor };
  const next     = order[(order.indexOf(theme) + 1) % 3];
  const Icon     = icons[theme] || Sun;
  const size     = compact ? 32 : 36;
  return (
    <motion.button whileTap={{ scale: 0.88 }} onClick={() => setTheme(next)}
      title={`Theme: ${theme}`}
      style={{
        width: size, height: size, borderRadius: "9px",
        background: "var(--bg-subtle)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.background = `${BRAND}10`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-subtle)"; }}>
      <Icon size={compact ? 14 : 16} color="var(--text-secondary)" />
    </motion.button>
  );
}

// ── Floating event cards ──────────────────────────────────────
function FloatingCards() {
  const [visible, setVisible] = useState(0);
  const cards = [
    { name: "Afrobeats Night Accra", price: "Ghc 80",  color: BRAND,     icon: "🎵", pos: { top: "18%", left: "4%"  } },
    { name: "Tech Summit Ghana",     price: "Ghc 150", color: "#2563eb", icon: "💻", pos: { top: "10%", right: "5%" } },
    { name: "Food Fest Kumasi",      price: "FREE",    color: "#16a34a", icon: "🍔", pos: { top: "62%", right: "4%" } },
    { name: "Art Exhibition Lagos",  price: "Ghc 40",  color: "#7c3aed", icon: "🎨", pos: { top: "65%", left: "3%"  } },
    { name: "GCTU Sports Day",       price: "FREE",    color: "#e17055", icon: "⚽", pos: { top: "78%", right: "8%" } },
    { name: "Blockchain Talk",       price: "Ghc 50",  color: "#00cec9", icon: "⛓️", pos: { top: "80%", left: "6%"  } },
  ];
  useEffect(() => {
    const t = setInterval(() => setVisible(v => (v + 1) % cards.length), 2200);
    return () => clearInterval(t);
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
              <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "14px", padding: "10px 13px", boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)", display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: c.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: "1px solid " + c.color + "30" }}>{c.icon}</div>
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

// ── Nav bar ───────────────────────────────────────────────────
function NavBar({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
      style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg-card)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "var(--shadow-sm)", transition: "box-shadow 0.3s ease" }}>

      {isMobile ? (
        <div style={{ padding: "0 16px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <ThemeBtn compact={true} />

          <motion.div whileTap={{ scale: 0.97 }} onClick={() => onNavigate("home")}
            animate={{ flex: scrolled ? 1 : 0, justifyContent: scrolled ? "center" : "flex-start" }}
            style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", transform: scrolled ? "none" : "translateX(8px)" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "10px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px ${BRAND}35`, flexShrink: 0 }}>
              <Ticket size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Master Events</span>
          </motion.div>

          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}
              >
                <motion.span whileTap={{ scale: 0.95 }} onClick={() => onNavigate("login")}
                  style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Log in
                </motion.span>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("signup")}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})`, color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap", boxShadow: `0 2px 8px ${BRAND}40` }}>
                  Sign up free
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <motion.div whileHover={{ scale: 1.02 }} onClick={() => onNavigate("home")}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${BRAND}40` }}>
              <Ticket size={19} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Master Events</span>
          </motion.div>

          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {[["Events", "#events"], ["About", "about"]].map(([label, href]) => (
              <motion.span key={label} whileHover={{ color: BRAND }}
                onClick={() => href.startsWith("#") ? document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }) : onNavigate(href)}
                style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }}>
                {label}
              </motion.span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeBtn compact={true} />
            <motion.span whileHover={{ color: BRAND }} onClick={() => onNavigate("login")}
              style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }}>
              Log in
            </motion.span>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 8px 28px ${BRAND}50` }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("signup")}
              style={{ padding: "10px 22px", borderRadius: "12px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer", boxShadow: `0 4px 16px ${BRAND}40`, fontFamily: "var(--font-sans)" }}>
              Sign up free
            </motion.button>
          </div>
        </div>
      )}
    </motion.nav>
  );
}

// ── Stats ticker ──────────────────────────────────────────────
function StatsTicker() {
  const stats = ["10K+ Tickets Sold", "50+ Events", "100% Verified", "0% Fake Tickets", "Ghana's #1 Platform", "NFT Powered", "MoMo Payments", "Polygon Blockchain"];
  return (
    <div style={{ background: "var(--brand)", padding: "9px 0", overflow: "hidden" }}>
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
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

// ── Landing page ──────────────────────────────────────────────
function LandingPage({ onNavigate }) {
  const [events,    setEvents]    = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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

  const features = [
    { Icon: Link2,     title: "NFT Tickets on Polygon",   body: "Every ticket is minted on the blockchain — impossible to fake, permanently yours.", color: "#2563eb" },
    { Icon: null,      title: "95% Payout to Organizers", body: "We charge only 5%. The rest goes straight to your MoMo wallet — withdraw anytime.", color: "#16a34a", emoji: "💰" },
    { Icon: null,      title: "MoMo & VISA Payments",     body: "Pay the Ghanaian way. Mobile money, VISA, and more — fast and secure.", color: BRAND, emoji: "📱" },
    { Icon: Lock,      title: "HMAC-Secured QR Codes",    body: "Dynamic QR codes refresh every 10 seconds — screenshot-proof and forgery-resistant.", color: "#dc2626" },
    { Icon: RefreshCw, title: "Ticket Resale Market",     body: "List your ticket for resale at any price. Only 2% fee — you keep 98%.", color: "#7c3aed" },
    { Icon: DoorOpen,  title: "Smart Door Scanning",      body: "Generate invite codes for door staff. Scan QR tickets in seconds at the gate.", color: "#0891b2" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      <NavBar onNavigate={onNavigate} />
      <StatsTicker />

      <section ref={heroRef} style={{ position: "relative", overflow: "hidden", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

        {HERO_IMAGES.map((img, i) => (
          <AnimatePresence key={i}>
            {heroIndex === i && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <motion.img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                  initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 6 }} />
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0.72) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}><FloatingCards /></div>

        <div style={{ position: "relative", zIndex: 3, textAlign: "center", maxWidth: isMobile ? "100%" : "800px", padding: isMobile ? "80px 24px 60px" : "100px 32px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div variants={stagger} initial="hidden" animate="show"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

            <motion.div variants={fadeUp} style={{ marginBottom: "24px" }}>
              <motion.div animate={{ opacity: [0.75, 1, 0.75] }} transition={{ duration: 2.5, repeat: Infinity }}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: isMobile ? "6px 14px" : "7px 18px", borderRadius: "99px", background: `rgba(245,166,35,0.15)`, border: `1px solid rgba(245,166,35,0.4)`, color: BRAND, fontSize: isMobile ? "9px" : "11px", fontWeight: 700, letterSpacing: "1.5px", backdropFilter: "blur(8px)" }}>
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: "6px", height: "6px", borderRadius: "50%", background: BRAND, display: "inline-block" }} />
                {isMobile ? "BLOCKCHAIN TICKETING" : "AFRICA'S BLOCKCHAIN TICKETING PLATFORM"}
              </motion.div>
            </motion.div>

            <motion.h1 variants={fadeUp}
              style={{ fontSize: isMobile ? "clamp(38px, 10vw, 56px)" : "clamp(44px, 7vw, 88px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: isMobile ? "-2px" : "-3px", color: "#ffffff", marginBottom: "20px", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              Find events that<br />
              <span style={{ background: `linear-gradient(135deg, ${BRAND}, #ffb347)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                move you.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp}
              style={{ fontSize: isMobile ? "14px" : "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: "32px", maxWidth: isMobile ? "340px" : "520px", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
              {isMobile
                ? "Buy and own NFT tickets on the blockchain. MoMo payments. Zero fakes."
                : "From Afrobeats concerts in Accra to tech summits in Kumasi — discover, buy and own your tickets as NFTs on the blockchain."}
            </motion.p>

            <motion.div variants={fadeUp}
              style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "32px", width: "100%", maxWidth: isMobile ? "360px" : "100%" }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 16px 48px ${BRAND}55` }} whileTap={{ scale: 0.97 }}
                onClick={() => document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" })}
                style={{ flex: isMobile ? 1 : "none", padding: isMobile ? "14px 20px" : "16px 38px", borderRadius: "14px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", fontWeight: 700, fontSize: isMobile ? "14px" : "16px", border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${BRAND}45`, whiteSpace: "nowrap", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                Browse Events <ArrowRight size={16} color="#fff" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.18)" }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("signup")}
                style={{ flex: isMobile ? 1 : "none", padding: isMobile ? "14px 20px" : "16px 38px", borderRadius: "14px", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: "#fff", fontWeight: 700, fontSize: isMobile ? "14px" : "16px", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
                Create Event
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp}
              style={{ display: "flex", gap: isMobile ? "16px" : "clamp(20px, 4vw, 48px)", flexWrap: "wrap", justifyContent: "center", padding: isMobile ? "16px 20px" : "24px 32px", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: isMobile ? "360px" : "100%" }}>
              {[["10K+","Tickets",BRAND],["50+","Events","#4ade80"],["100%","Verified","#60a5fa"],["0%","Fakes","#f87171"]].map(([val, label, color]) => (
                <div key={label} style={{ textAlign: "center", flex: isMobile ? 1 : "none" }}>
                  <div style={{ fontSize: isMobile ? "20px" : "clamp(22px, 3vw, 34px)", fontWeight: 900, color, letterSpacing: "-1px" }}>{val}</div>
                  <div style={{ fontSize: isMobile ? "10px" : "11px", color: "rgba(255,255,255,0.6)", marginTop: "3px", fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>

        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 4 }}>
          {HERO_IMAGES.map((_, i) => (
            <motion.div key={i}
              animate={{ width: heroIndex === i ? "24px" : "6px", opacity: heroIndex === i ? 1 : 0.4 }}
              transition={{ duration: 0.3 }}
              onClick={() => setHeroIndex(i)}
              style={{ height: "6px", borderRadius: "3px", background: "#fff", cursor: "pointer" }} />
          ))}
        </div>
      </section>

      <section id="events" style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 32px" }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: BRAND, marginBottom: "8px", fontFamily: "var(--font-mono)" }}>UPCOMING EVENTS</div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 900, letterSpacing: "-1px", color: "var(--text-primary)" }}>Happening across Africa</h2>
            </div>
            <motion.span whileHover={{ x: 4 }} onClick={() => onNavigate("signup")}
              style={{ fontSize: "14px", fontWeight: 700, color: BRAND, cursor: "pointer" }}>View all →</motion.span>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px" }}>
            {(events.length > 0 ? events : Array(8).fill(null)).map((ev, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 24px 56px rgba(0,0,0,0.14)", borderColor: BRAND }}
                onClick={() => onNavigate("signup")}
                style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", cursor: "pointer", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.25s var(--ease-smooth)" }}>
                <div style={{ height: "190px", position: "relative", background: "var(--bg-subtle)" }}>
                  {ev ? (
                    <>
                      <img src={ev.image || catImg[ev.category] || catImg.other} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = catImg.other; }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.6))" }} />
                      <div style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 10px", borderRadius: "99px", background: BRAND, color: "#fff", fontSize: "10px", fontWeight: 700 }}>{ev.category}</div>
                      {parseFloat(ev.price) === 0 && <div style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 10px", borderRadius: "99px", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700 }}>FREE</div>}
                      <div style={{ position: "absolute", bottom: "10px", left: "12px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "3px 8px", borderRadius: "99px" }}>
                        <Link2 size={8} color="#fff" />
                        <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>NFT Ticket</span>
                      </div>
                    </>
                  ) : <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
                </div>
                <div style={{ padding: "16px" }}>
                  {ev ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px", lineHeight: 1.3 }}>{ev.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>📅 {ev.date} · 📍 {ev.venue}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: "17px", color: BRAND }}>{parseFloat(ev.price) === 0 ? "FREE" : "Ghc " + ev.price}</span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ padding: "8px 16px", borderRadius: "10px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 4px 12px ${BRAND}30`, fontFamily: "var(--font-sans)" }}>
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

      <section style={{ background: "var(--bg-subtle)", padding: "80px 32px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "56px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: BRAND, marginBottom: "12px", fontFamily: "var(--font-mono)" }}>WHY MASTER EVENTS</div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 900, letterSpacing: "-1.2px", color: "var(--text-primary)" }}>Built different. Built for Africa.</h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              {features.map((f, i) => (
                <motion.div key={i} variants={fadeUp}
                  whileHover={{ y: -5, boxShadow: "var(--shadow-lg)", borderColor: f.color + "40" }}
                  style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.25s" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: f.color + "12", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "1px solid " + f.color + "22" }}>
                    {f.Icon
                      ? <f.Icon size={24} color={f.color} strokeWidth={1.8} />
                      : <span style={{ fontSize: "24px" }}>{f.emoji}</span>
                    }
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "8px" }}>{f.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.body}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
            <div style={{ background: "#0e0d0b", borderRadius: "28px", padding: "64px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "40px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${BRAND}10 0%, transparent 70%)`, transform: "translate(30%, -30%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", transform: "translate(-30%, 30%)", pointerEvents: "none" }} />
              <div style={{ maxWidth: "520px", position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: BRAND, marginBottom: "16px", fontFamily: "var(--font-mono)" }}>FOR EVENT ORGANIZERS</div>
                <h2 style={{ fontSize: "clamp(28px, 3vw, 46px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "16px" }}>Ready to host<br />your next event?</h2>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "32px" }}>Create events, sell blockchain-verified tickets, manage door staff, and receive 95% directly to your MoMo wallet.</p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <motion.button whileHover={{ scale: 1.03, boxShadow: `0 16px 40px ${BRAND}50` }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("signup")}
                    style={{ padding: "14px 28px", borderRadius: "14px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: `0 8px 28px ${BRAND}40`, fontFamily: "var(--font-sans)" }}>
                    Start Selling Tickets
                  </motion.button>
                  <motion.button whileHover={{ background: "rgba(255,255,255,0.1)" }} onClick={() => onNavigate("about")}
                    style={{ padding: "14px 28px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "15px", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", transition: "background 0.2s", fontFamily: "var(--font-sans)" }}>
                    Learn More
                  </motion.button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flexShrink: 0, position: "relative", zIndex: 1 }}>
                {[["95%","Payout Rate"],["NFT","Tickets"],["MoMo","Payments"],["QR","Scanning"]].map(([val, label]) => (
                  <motion.div key={label} whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
                    style={{ padding: "20px", borderRadius: "16px", textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", width: "110px", transition: "all 0.2s" }}>
                    <div style={{ fontWeight: 900, fontSize: "22px", color: BRAND, marginBottom: "4px" }}>{val}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ background: "var(--bg-subtle)", padding: "80px 32px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: BRAND, marginBottom: "12px", fontFamily: "var(--font-mono)" }}>WHAT PEOPLE SAY</div>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, letterSpacing: "-0.8px", color: "var(--text-primary)" }}>Trusted across Ghana</h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {[
                { name: "Kwame Asante", role: "Event Organizer · Accra",   quote: "Master Events gave us one place to manage tickets, door staff, and payments. We received 95% of revenue directly to MoMo — no delays." },
                { name: "Ama Owusu",    role: "Concert Attendee · Kumasi", quote: "I love that my ticket is an NFT — I can transfer it to my friend and it just works. No more fake tickets at the gate." },
                { name: "Kofi Mensah",  role: "Tech Conference Organizer", quote: "The blockchain verification at the door was seamless. Our door staff just scanned QR codes and it told them instantly if the ticket was valid." },
              ].map((t, i) => (
                <motion.div key={i} variants={fadeUp} whileHover={{ y: -5, boxShadow: "var(--shadow-lg)" }}
                  style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.25s" }}>
                  <div style={{ fontSize: "36px", color: BRAND, fontWeight: 900, lineHeight: 1, marginBottom: "16px", fontFamily: "Georgia, serif" }}>"</div>
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

      <footer style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "52px 32px 36px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "40px", marginBottom: "40px" }}>
            <div style={{ maxWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "11px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px ${BRAND}30` }}>
                  <Ticket size={17} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Master Events</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>Africa's blockchain-powered event ticketing platform. Built in Ghana 🇬🇭</p>
            </div>
            <div style={{ display: "flex", gap: "56px", flexWrap: "wrap" }}>
              {[
                { title: "Platform", links: [["Browse Events","#events"],["Create Event","signup"],["Resale Market","#"]] },
                { title: "Company",  links: [["About","about"],["Contact","mailto:mastereventgh@gmail.com"]] },
                { title: "Legal",    links: [["Privacy","#"],["Terms","#"],["Security","#"]] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "1.2px", color: "var(--text-muted)", marginBottom: "14px", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{col.title}</div>
                  {col.links.map(([label, href]) => (
                    <div key={label} style={{ marginBottom: "10px" }}>
                      <motion.span whileHover={{ color: BRAND }}
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
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>© 2026 Master Events Ghana · Secured by Polygon Blockchain</span>
            <ThemeBtn compact={false} />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── About page ────────────────────────────────────────────────
function AboutPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      <NavBar onNavigate={onNavigate} />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px" }}>
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: `0 8px 32px ${BRAND}35` }}>
              <Ticket size={36} color="#fff" strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-1.5px", color: "var(--text-primary)", marginBottom: "16px" }}>About Master Events</h1>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: 1.7 }}>Africa's first blockchain-powered event ticketing platform.</p>
          </motion.div>
          {[
            { emoji: "🎯", title: "Our Mission",           body: "We believe every event experience should start with trust. Master Events uses blockchain technology to ensure every ticket is authentic, verifiable, and owned by the rightful buyer.", color: BRAND },
            { emoji: "⛓️", title: "Blockchain Technology", body: "Every ticket purchased on Master Events is minted as an NFT on the Polygon blockchain — the same technology used by major global platforms, now available across Africa.", color: "#2563eb" },
            { emoji: "💰", title: "Fair for Organizers",   body: "We take only 5% per transaction. 95% goes directly to the organizer's wallet, withdrawable via MTN MoMo or VISA instantly.", color: "#16a34a" },
            { emoji: "🌍", title: "Built for Africa",      body: "From Afrobeats concerts in Accra to tech summits in Lagos — Master Events is designed for Africa's vibrant and growing events scene.", color: "#7c3aed" },
            { emoji: "👥", title: "The Team",              body: "Built by students at Ghana Communication Technology University (GCTU) as a final-year CS project — combining blockchain, mobile, and payments innovation.", color: "#0891b2" },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
              style={{ display: "flex", gap: "20px", background: "var(--bg-card)", borderRadius: "20px", padding: "28px", marginBottom: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: item.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0, border: "1px solid " + item.color + "20" }}>{item.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>{item.title}</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75 }}>{item.body}</div>
              </div>
            </motion.div>
          ))}
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "8px", fontSize: "14px" }}>Have questions? Reach us at</p>
            <a href="mailto:mastereventgh@gmail.com" style={{ color: BRAND, fontWeight: 700, fontSize: "18px" }}>mastereventgh@gmail.com</a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Auth image panel ──────────────────────────────────────────
export function AuthImagePanel({ image, title, headline, highlight, sub, features, stats }) {
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", minHeight: "100vh" }}>
      <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.88) 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${BRAND}15 0%, transparent 70%)`, transform: "translate(-20%, 20%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, padding: "48px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${BRAND}40` }}>
            <Ticket size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "18px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
        </div>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: BRAND, marginBottom: "14px", fontFamily: "var(--font-mono)" }}>{title}</div>
        <h2 style={{ fontSize: "clamp(32px, 3vw, 48px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "16px" }}>
          {headline}<br />
          <span style={{ background: `linear-gradient(135deg, ${BRAND}, #ffb347)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{highlight}</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.7, marginBottom: "32px" }}>{sub}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
          {features.map(([icon, ftitle, fsub]) => (
            <div key={ftitle} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `rgba(245,166,35,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, border: `1px solid rgba(245,166,35,0.2)` }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#fff" }}>{ftitle}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginTop: "1px" }}>{fsub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "28px", padding: "16px 20px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)" }}>
          {stats.map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: BRAND }}>{val}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PhoneFrame root ───────────────────────────────────────────
export default function PhoneFrame({ children }) {
  const setScreen  = useStore(s => s.setScreen);
  const screen     = useStore(s => s.screen);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  useTheme();

  const getPage = () => {
    if (screen === "pendingEvent") return "app";
    if (isLoggedIn) return "app";
    if (screen === "home")  return "home";
    if (screen === "about") return "about";
    if (screen === "login" || screen === "signup" || screen === "role") return "app";
    return "home";
  };

  const handleNavigate = (page) => {
    if (page === "login" || page === "signup") setScreen(page);
    else if (page === "home")  setScreen("home");
    else if (page === "about") setScreen("about");
    else setScreen(page);
  };

  const page = getPage();
  if (page === "home")  return <LandingPage onNavigate={handleNavigate} />;
  if (page === "about") return <AboutPage   onNavigate={handleNavigate} />;

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      {children}
    </div>
  );
}

export { LOGIN_IMAGE, SIGNUP_IMAGE };