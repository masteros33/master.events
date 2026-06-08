import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const isDesktop = () => window.innerWidth > 768;

function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.5 + 1, delay: Math.random() * 4, dur: Math.random() * 6 + 8,
    }))
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <motion.div key={p.id}
          animate={{ y: [0, -24, 0], opacity: [0.1, 0.45, 0.1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: p.x + "%", top: p.y + "%", width: p.size + "px", height: p.size + "px", borderRadius: "50%", background: "rgba(245,166,35,0.8)", pointerEvents: "none" }} />
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay }}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "22px 20px" }}>
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

// ── Public Events Preview ─────────────────────────────────────
function PublicEventCard({ ev, onSignup }) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(245,166,35,0.5)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onSignup}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}>
      <div style={{ height: "140px", position: "relative", overflow: "hidden" }}>
        <img src={ev.image} alt={ev.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "2px 8px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "3px" }}>
          <span style={{ fontSize: "8px" }}>⛓️</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>NFT</span>
        </div>
        {ev.price === 0 && (
          <div style={{ position: "absolute", top: "8px", left: "8px", background: "#16a34a", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px" }}>FREE</div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", color: "#fff", marginBottom: "4px", lineHeight: 1.3 }}>{ev.name}</div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📍 {ev.venue} · {ev.date}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#f5a623" }}>
            {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
          </div>
          <div style={{ fontSize: "10px", color: "rgba(245,166,35,0.7)", fontWeight: 600 }}>Get Ticket →</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const setScreen = useStore(s => s.setScreen);
  const [desktop, setDesktop] = useState(isDesktop());
  const [searchQ,   setSearchQ]   = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [events,    setEvents]    = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const h = () => setDesktop(isDesktop());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    setLoadingEvents(true);
    eventsAPI.list().then(data => {
      if (Array.isArray(data)) {
        setEvents(data.map(e => ({
          id:       e.id,
          name:     e.name,
          venue:    e.venue,
          date:     e.date,
          price:    parseFloat(e.price) || 0,
          category: e.category,
          image:    e.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
        })));
      }
    }).catch(() => {}).finally(() => setLoadingEvents(false));
  }, []);

  const filtered = events.filter(e => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q);
  }).slice(0, desktop ? 6 : 4);

  const features = [
    { icon: "⛓️", title: "NFT-Secured Tickets",      desc: "Every ticket minted as an NFT on Polygon. Zero fakes. Permanent on-chain proof.", delay: 0 },
    { icon: "🔐", title: "Screenshot-Proof QR",       desc: "Dynamic HMAC-signed QR refreshes every 10 seconds. Scalpers get nothing.", delay: 0.08 },
    { icon: "🎟️", title: "Instant Resale & Transfer", desc: "Transfer or resell peer-to-peer. NFT ownership moves on-chain automatically.", delay: 0.16 },
    { icon: "📱", title: "Mobile Money Ready",         desc: "MTN MoMo, Telecel Cash, AirtelTigo Money. Built for Ghana.", delay: 0.24 },
    { icon: "🚪", title: "Smart Door Scanning",        desc: "Real-time QR validation at the gate. Tickets self-invalidate after scan.", delay: 0.32 },
    { icon: "💎", title: "Post-Event Collectibles",    desc: "Your ticket evolves into a collector NFT after the event.", delay: 0.4 },
  ];

  return (
    <div style={{ background: "#080810", minHeight: "100%", fontFamily: "var(--font-sans)", color: "#fff", position: "relative" }}>

      {/* ── Sticky Navbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,16,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: desktop ? "0 48px" : "0 16px",
        height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: "14px", color: "#fff", letterSpacing: "-0.3px" }}>Master Events</span>
        </div>
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
        padding: desktop ? "80px 48px 60px" : "40px 20px 36px",
        textAlign: "center", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,166,35,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "0%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <Particles />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "700px", width: "100%", margin: "0 auto" }}>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.28)", borderRadius: "99px", padding: "5px 13px", marginBottom: "20px" }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f5a623" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#f5a623", letterSpacing: "0.4px" }}>Live on Polygon Amoy Testnet</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            style={{ fontSize: desktop ? "58px" : "30px", fontWeight: 900, lineHeight: 1.06, letterSpacing: desktop ? "-2px" : "-1px", marginBottom: "16px", color: "#fff" }}>
            Event Tickets,{" "}
            <span style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Reimagined
            </span>
            <br />on the Blockchain.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            style={{ fontSize: desktop ? "17px" : "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "500px", margin: "0 auto 24px" }}>
            Ghana's first NFT ticketing platform. No fakes. No scalpers. Real tickets secured on-chain, redeemable with your phone.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px", marginBottom: "28px" }}>
            {["🔒 256-bit Encrypted", "⛓️ Polygon Blockchain", "📱 MoMo Ready", "🇬🇭 Made for Ghana"].map(label => (
              <div key={label} style={{ padding: "4px 11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "99px", fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {label}
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setScreen("signup")}
              style={{ padding: desktop ? "14px 32px" : "12px 24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "13px", fontSize: desktop ? "15px" : "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px rgba(245,166,35,0.45)", fontFamily: "var(--font-sans)" }}>
              Browse Events →
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setScreen("login")}
              style={{ padding: desktop ? "14px 32px" : "12px 24px", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "13px", fontSize: desktop ? "15px" : "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              Sign In
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Search + Events Preview ── */}
      <section style={{ padding: desktop ? "0 48px 60px" : "0 16px 48px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ position: "relative", marginBottom: "24px" }}>
            <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}>
              <span style={{ fontSize: "16px", opacity: 0.5 }}>🔍</span>
            </div>
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search events, venues, categories..."
              style={{
                width: "100%", padding: "14px 48px 14px 48px",
                background: searchFocused ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                border: searchFocused ? "1.5px solid rgba(245,166,35,0.6)" : "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "14px", fontSize: "14px", color: "#fff",
                outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)",
                transition: "all 0.2s",
                boxShadow: searchFocused ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
              }}
            />
            {searchQ && (
              <div onClick={() => setSearchQ("")}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: 700 }}>
                ✕
              </div>
            )}
          </motion.div>

          {/* Events grid */}
          {loadingEvents ? (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: "12px" }}>
              {[1,2,3,4,5,6].slice(0, desktop ? 6 : 4).map(i => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", height: "200px", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: "12px" }}>
                {filtered.map(ev => (
                  <PublicEventCard key={ev.id} ev={ev} onSignup={() => setScreen("signup")} />
                ))}
              </div>
              {events.length > filtered.length && !searchQ && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => setScreen("signup")}
                    style={{ padding: "10px 28px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "99px", color: "#f5a623", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                    View all {events.length} events →
                  </motion.button>
                </div>
              )}
              {searchQ && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                  No events found for "{searchQ}"
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                  Sign in or create an account to purchase tickets
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>No events available right now. Check back soon.</div>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: desktop ? "48px 48px" : "36px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[["0¢","Gas Fees"],["10s","QR Refresh"],["100%","On-Chain"],["∞","Scale"]].map(([v, l]) => (
            <Stat key={l} value={v} label={l} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: desktop ? "72px 48px" : "48px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            style={{ textAlign: "center", marginBottom: "40px" }}>
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
            <h2 style={{ fontSize: desktop ? "34px" : "22px", fontWeight: 800, letterSpacing: "-1px", color: "#fff", margin: 0 }}>Buy to gate in 3 steps.</h2>
          </motion.div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { step: "01", icon: "🔍", title: "Browse Events",    desc: "Discover events across Ghana. Filter by category, date, and city." },
              { step: "02", icon: "💳", title: "Pay with MoMo",    desc: "MTN MoMo, Telecel, or AirtelTigo. Your ticket mints as an NFT instantly." },
              { step: "03", icon: "📲", title: "Scan at the Gate", desc: "Show your dynamic QR. Staff validates in real time. No fakes get through." },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.1 }}
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
      <section style={{ padding: desktop ? "72px 48px" : "52px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,166,35,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
            style={{ fontSize: desktop ? "44px" : "26px", fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.08, marginBottom: "16px", color: "#fff" }}>
            Ready for ticketing<br />
            <span style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>done right?</span>
          </motion.h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", maxWidth: "360px", margin: "0 auto 28px", lineHeight: 1.6 }}>
            Join thousands of Ghanaians buying and selling tickets on-chain.
          </p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setScreen("signup")}
            style={{ padding: desktop ? "16px 44px" : "14px 32px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontSize: desktop ? "16px" : "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 32px rgba(245,166,35,0.45)", fontFamily: "var(--font-sans)" }}>
            Create Your Account →
          </motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: desktop ? "28px 48px" : "20px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>🎟️</div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Master Events</span>
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>© 2026 Master Events Ghana · Built on Polygon</div>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Privacy", "Contact"].map(link => (
            <span key={link} onClick={() => link === "Privacy" && setScreen("privacy")}
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{link}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}