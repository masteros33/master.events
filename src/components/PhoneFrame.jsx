import React, { useEffect, useState, useRef } from "react";
import useStore from "../store/useStore";

// ── Animated floating event cards in background ──────────────
function FloatingCards() {
  const cards = [
    { name: "Afrobeats Night", cat: "Music", price: "Ghc 80",  color: "#f5a623", icon: "🎵", x: "5%",   y: "15%", delay: "0s",   dur: "8s"  },
    { name: "Tech Summit GH",  cat: "Tech",  price: "Ghc 150", color: "#5dade2", icon: "💻", x: "78%",  y: "8%",  delay: "1.5s", dur: "9s"  },
    { name: "Food Fest Accra", cat: "Food",  price: "FREE",    color: "#27ae60", icon: "🍔", x: "88%",  y: "55%", delay: "3s",   dur: "10s" },
    { name: "Art Exhibition",  cat: "Arts",  price: "Ghc 40",  color: "#a29bfe", icon: "🎨", x: "2%",   y: "65%", delay: "2s",   dur: "7s"  },
    { name: "GCTU Sports Day", cat: "Sports",price: "FREE",    color: "#e17055", icon: "⚽", x: "70%",  y: "78%", delay: "4s",   dur: "11s" },
    { name: "Blockchain Talk",  cat: "Tech", price: "Ghc 50",  color: "#00cec9", icon: "⛓️", x: "15%",  y: "82%", delay: "0.5s", dur: "9s"  },
  ];

  return (
    <>
      <style>{`
        @keyframes floatCard {
          0%   { transform: translateY(0px) rotate(-1deg); opacity: 0.12; }
          50%  { transform: translateY(-22px) rotate(1deg); opacity: 0.18; }
          100% { transform: translateY(0px) rotate(-1deg); opacity: 0.12; }
        }
        @keyframes floatCardAlt {
          0%   { transform: translateY(0px) rotate(1deg); opacity: 0.1; }
          50%  { transform: translateY(-18px) rotate(-1.5deg); opacity: 0.16; }
          100% { transform: translateY(0px) rotate(1deg); opacity: 0.1; }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
        .event-card-hover {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
        }
        .event-card-hover:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 48px rgba(0,0,0,0.14) !important;
        }
        .btn-hover {
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(245,166,35,0.45) !important;
        }
        .btn-hover:active { transform: scale(0.97); }
        .nav-link {
          transition: color 0.15s ease;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 2px;
          background: #f5a623;
          border-radius: 1px;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link:hover { color: #f5a623 !important; }
        .stat-num {
          background: linear-gradient(135deg, #f5a623, #e8920f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Floating cards — decorative background elements */}
      {cards.map((c, i) => (
        <div key={i} style={{
          position: "absolute",
          left: c.x, top: c.y,
          width: "180px",
          background: "#fff",
          borderRadius: "16px",
          padding: "12px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0",
          pointerEvents: "none",
          animation: i % 2 === 0 ? `floatCard ${c.dur} ease-in-out infinite` : `floatCardAlt ${c.dur} ease-in-out infinite`,
          animationDelay: c.delay,
          display: "flex", gap: "10px", alignItems: "center",
          zIndex: 0,
        }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: c.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{c.icon}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "11px", color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ fontSize: "10px", color: c.color, fontWeight: 700, marginTop: "2px" }}>{c.price}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function NavBar({ onNavigate, active }) {
  return (
    <nav style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 60px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}>
      <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>🎟️</div>
        <span style={{ fontWeight: 800, fontSize: "18px", color: "#1a1a1a", letterSpacing: "-0.3px" }}>Master Events</span>
      </div>
      <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        <a href="#events" className="nav-link" style={{ fontSize: "14px", fontWeight: 500, color: "#6b6b6b", textDecoration: "none" }}>Events</a>
        <span onClick={() => onNavigate("about")} className="nav-link" style={{ fontSize: "14px", fontWeight: 500, color: active === "about" ? "#f5a623" : "#6b6b6b", cursor: "pointer" }}>About</span>
        <span onClick={() => onNavigate("login")} className="nav-link" style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", cursor: "pointer" }}>Log in</span>
        <span onClick={() => onNavigate("signup")} className="btn-hover" style={{ padding: "10px 22px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(245,166,35,0.35)" }}>Sign up free</span>
      </div>
    </nav>
  );
}

// ── Landing Page ─────────────────────────────────────────────
function LandingPage({ onNavigate }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch("https://master-events-backend.onrender.com/api/events/")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEvents(data.slice(0, 8)); })
      .catch(() => {});
  }, []);

  const catImg = {
    music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    tech: "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
    food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
    sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
    business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
    other: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1a1a1a" }}>
      <NavBar onNavigate={onNavigate} active="home" />

      {/* Hero — white bg with floating cards */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #fffdf9 0%, #fff8f0 40%, #ffffff 100%)", padding: "100px 60px 80px", textAlign: "center", borderBottom: "1px solid #f0f0f0", minHeight: "580px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <FloatingCards />

        {/* Hero content — above floating cards */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ animation: "badgePop 0.5s 0.1s both", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "50px", padding: "7px 18px", fontSize: "12px", color: "#f5a623", fontWeight: 700, letterSpacing: "1px", marginBottom: "28px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f5a623", display: "inline-block", animation: "badgePop 1s infinite alternate" }} />
            GHANA'S PREMIER TICKETING PLATFORM
          </div>

          <h1 style={{ animation: "heroFadeUp 0.6s 0.2s both", fontSize: "64px", fontWeight: 900, lineHeight: 1.05, marginBottom: "22px", letterSpacing: "-2px" }}>
            Find events that<br />
            <span className="stat-num">move you</span>
          </h1>

          <p style={{ animation: "heroFadeUp 0.6s 0.35s both", fontSize: "18px", color: "#6b6b6b", maxWidth: "500px", margin: "0 auto 44px", lineHeight: 1.7 }}>
            Discover and buy tickets to the best events in Ghana. Every ticket is an NFT — unfakeable and yours forever.
          </p>

          <div style={{ animation: "heroFadeUp 0.6s 0.5s both", display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#events" className="btn-hover" style={{ padding: "16px 38px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", borderRadius: "14px", textDecoration: "none", fontWeight: 700, fontSize: "16px", boxShadow: "0 8px 28px rgba(245,166,35,0.4)" }}>Browse Events</a>
            <span onClick={() => onNavigate("signup")} style={{ padding: "16px 38px", background: "#fff", border: "1.5px solid #f0f0f0", color: "#1a1a1a", borderRadius: "14px", fontWeight: 700, fontSize: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5a623"; e.currentTarget.style.color = "#f5a623"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.color = "#1a1a1a"; }}>
              Create Event
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", gap: "60px", justifyContent: "center", marginTop: "64px", animation: "heroFadeUp 0.6s 0.65s both" }}>
          {[["10K+", "Tickets Sold"], ["50+", "Events"], ["99%", "Verified"], ["0%", "Fakes"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "30px", fontWeight: 900 }} className="stat-num">{val}</div>
              <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <div id="events" style={{ padding: "72px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "8px" }}>UPCOMING</div>
            <h2 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.7px", color: "#1a1a1a" }}>Events near you</h2>
          </div>
          <span onClick={() => onNavigate("signup")} style={{ color: "#f5a623", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            See all →
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "22px" }}>
          {(events.length > 0 ? events : Array(8).fill(null)).map((ev, i) => (
            <div key={i} onClick={() => onNavigate("signup")}
              className="event-card-hover"
              style={{ background: "#fff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", cursor: "pointer", border: "1px solid #f5f5f5" }}>
              <div style={{ height: "170px", position: "relative", background: "#f5f5f5" }}>
                <img src={ev?.image || catImg[ev?.category] || catImg.other} alt={ev?.name || "Event"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.src = catImg.other; }} />
                {!ev && <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
                {ev && (
                  <>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))" }} />
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "#f5a623", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>{ev.category}</div>
                    {parseFloat(ev.price) === 0 && <div style={{ position: "absolute", top: "12px", right: "12px", background: "#27ae60", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>FREE</div>}
                  </>
                )}
              </div>
              <div style={{ padding: "16px" }}>
                {ev ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "6px", lineHeight: 1.35 }}>{ev.name}</div>
                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "14px" }}>{"📅 " + ev.date + " · 📍 " + ev.venue}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, color: "#f5a623", fontSize: "16px" }}>{parseFloat(ev.price) === 0 ? "FREE" : "Ghc " + ev.price}</span>
                      <button onClick={e => { e.stopPropagation(); onNavigate("signup"); }}
                        className="btn-hover"
                        style={{ padding: "7px 16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(245,166,35,0.3)" }}>
                        Get Tickets
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="skeleton" style={{ height: "14px", width: "80%", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ height: "12px", width: "60%", marginBottom: "14px" }} />
                    <div className="skeleton" style={{ height: "14px", width: "40%" }} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features strip */}
      <div style={{ background: "linear-gradient(135deg, #fff8f0, #fffdf9)", borderTop: "1px solid #f5ebe0", borderBottom: "1px solid #f5ebe0", padding: "48px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
          {[
            ["⛓️", "NFT Tickets", "Every ticket minted on Polygon blockchain — 100% authentic"],
            ["💰", "95% to Organizers", "Only 5% platform fee — withdraw via MoMo instantly"],
            ["📱", "MoMo & VISA", "Pay the Ghanaian way — mobile money or card"],
            ["🔍", "QR Verification", "Door staff scan tickets in seconds at the gate"],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a", marginBottom: "5px" }}>{title}</div>
                <div style={{ fontSize: "13px", color: "#aaa", lineHeight: 1.6 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer CTA */}
      <div style={{ margin: "72px 60px", background: "#1a1a1a", borderRadius: "28px", padding: "64px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "40%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "520px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "16px" }}>FOR ORGANIZERS</div>
          <h2 style={{ fontSize: "40px", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.8px", lineHeight: 1.15, color: "#fff" }}>Ready to host<br />your event?</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px" }}>Create events, sell blockchain-verified tickets, manage door staff, and receive 95% directly to your MoMo wallet.</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <span onClick={() => onNavigate("signup")} className="btn-hover" style={{ padding: "14px 30px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", borderRadius: "14px", fontWeight: 700, fontSize: "15px", boxShadow: "0 6px 24px rgba(245,166,35,0.4)", cursor: "pointer" }}>Start Selling Tickets</span>
            <span onClick={() => onNavigate("about")} style={{ padding: "14px 30px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "14px", fontWeight: 600, fontSize: "15px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
              Learn More
            </span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", flexShrink: 0, position: "relative", zIndex: 1 }}>
          {[["95%", "Payout"], ["NFT", "Tickets"], ["MoMo", "Payments"], ["QR", "Scanning"]].map(([val, label]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "22px 18px", textAlign: "center", width: "120px" }}>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#f5a623", marginBottom: "6px" }}>{val}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.45)", lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#fff", borderTop: "1px solid #f0f0f0", padding: "36px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🎟️</div>
          <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "14px" }}>Master Events</span>
        </div>
        <div style={{ color: "#bbb", fontSize: "13px" }}>© 2026 Master Events Ghana · Secured by Polygon Blockchain</div>
        <div style={{ display: "flex", gap: "28px" }}>
          <a href="mailto:mastereventgh@gmail.com" style={{ color: "#aaa", textDecoration: "none", fontSize: "13px" }}>Contact</a>
          <span onClick={() => onNavigate("about")} style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>About</span>
          <span onClick={() => onNavigate("signup")} style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

// ── About Page ───────────────────────────────────────────────
function AboutPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <NavBar onNavigate={onNavigate} active="about" />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
          <h1 style={{ fontSize: "44px", fontWeight: 900, color: "#1a1a1a", marginBottom: "16px", letterSpacing: "-1px" }}>About Master Events</h1>
          <p style={{ fontSize: "18px", color: "#6b6b6b", lineHeight: 1.7 }}>Ghana's first blockchain-powered event ticketing platform, built to eliminate fake tickets and empower organizers.</p>
        </div>
        {[
          { icon: "🎯", title: "Our Mission", body: "We believe every event experience should start with trust. Master Events uses blockchain technology to ensure every ticket is authentic, verifiable, and owned by the rightful buyer." },
          { icon: "⛓️", title: "Blockchain Technology", body: "Every ticket purchased on Master Events is minted as an NFT on the Polygon blockchain — the same technology used by major global platforms, now available in Ghana." },
          { icon: "💰", title: "Fair for Organizers", body: "We take only 5% per transaction. 95% of every ticket sale goes directly to the organizer's wallet, withdrawable via MTN MoMo or VISA." },
          { icon: "🇬🇭", title: "Built for Ghana", body: "From Afrobeats concerts in Accra to tech summits in Kumasi — Master Events is designed specifically for Ghana's vibrant events scene." },
          { icon: "👥", title: "The Team", body: "Built by students at Ghana Communication Technology University (GCTU) as a final-year CS project — combining blockchain, mobile, and payments." },
        ].map((item, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "20px", padding: "28px", marginBottom: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: "flex", gap: "20px", alignItems: "flex-start", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"; }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: "#1a1a1a", marginBottom: "8px" }}>{item.title}</div>
              <div style={{ fontSize: "15px", color: "#6b6b6b", lineHeight: 1.7 }}>{item.body}</div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <div style={{ fontSize: "16px", color: "#6b6b6b", marginBottom: "16px" }}>Have questions? Reach us at</div>
          <a href="mailto:mastereventgh@gmail.com" style={{ color: "#f5a623", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>mastereventgh@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

// ── Auth Pages ───────────────────────────────────────────────
function DesktopAuthPage({ type, onNavigate }) {
  const setScreen = useStore(s => s.setScreen);
  const handleEnterApp = (screen) => { setScreen(screen); onNavigate("app"); };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
      <NavBar onNavigate={onNavigate} active={type} />

      {/* Full page with floating cards */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #fffdf9 0%, #fff8f0 50%, #fff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
        <FloatingCards />

        <div style={{ position: "relative", zIndex: 10, display: "flex", gap: "80px", alignItems: "center", maxWidth: "1000px", width: "100%" }}>

          {/* Left copy */}
          <div style={{ flex: 1, animation: "heroFadeUp 0.5s 0.1s both" }}>
            <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "18px" }}>MASTER EVENTS GHANA</div>
            <h1 style={{ fontSize: "52px", fontWeight: 900, color: "#1a1a1a", lineHeight: 1.08, marginBottom: "20px", letterSpacing: "-1.5px" }}>
              {type === "login"
                ? <>Welcome<br /><span className="stat-num">back.</span></>
                : <>Ghana's<br /><span className="stat-num">best tickets.</span></>
              }
            </h1>
            <p style={{ color: "#6b6b6b", fontSize: "16px", lineHeight: 1.75, marginBottom: "36px", maxWidth: "360px" }}>
              {type === "login"
                ? "Your NFT tickets and events are waiting. Every ticket is secured on Polygon blockchain — yours forever."
                : "Buy, sell, and transfer blockchain-verified tickets to Ghana's best events. Join thousands of event-goers."}
            </p>
            {[
              ["⛓️", "NFT on Polygon", "Every ticket is blockchain-verified"],
              ["💰", "95% to organizers", "Only 5% platform fee"],
              ["📱", "MoMo & VISA", "Pay the Ghanaian way"],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#1a1a1a" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#aaa" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right card */}
          <div style={{ width: "400px", flexShrink: 0, animation: "heroFadeUp 0.5s 0.25s both" }}>
            <div style={{ background: "#fff", borderRadius: "28px", padding: "48px 44px", boxShadow: "0 8px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)", border: "1px solid #f5f5f5" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(245,166,35,0.35)" }}>🎟️</div>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px", letterSpacing: "-0.5px" }}>
                  {type === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p style={{ color: "#aaa", fontSize: "14px" }}>
                  {type === "login" ? "Log in to Master Events" : "Join Ghana's #1 ticketing platform — free"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "28px", flexWrap: "wrap" }}>
                {["NFT Tickets", "MoMo Payments", "Polygon"].map(tag => (
                  <div key={tag} style={{ padding: "5px 12px", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "20px", fontSize: "11px", fontWeight: 600, color: "#f5a623" }}>{tag}</div>
                ))}
              </div>

              <button onClick={() => handleEnterApp(type === "login" ? "login" : "signup")}
                className="btn-hover"
                style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "16px", fontWeight: 700, fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 28px rgba(245,166,35,0.35)", marginBottom: "16px" }}>
                {type === "login" ? "Log In to Master Events" : "Get Started — It's Free"}
              </button>

              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <span style={{ color: "#aaa", fontSize: "13px" }}>{type === "login" ? "No account yet? " : "Already have an account? "}</span>
                <span onClick={() => onNavigate(type === "login" ? "signup" : "login")} style={{ color: "#f5a623", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                  {type === "login" ? "Sign up free" : "Log in"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
                <span style={{ color: "#ccc", fontSize: "11px", whiteSpace: "nowrap" }}>trusted across Ghana</span>
                <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {[["10K+", "Tickets"], ["50+", "Events"], ["0%", "Fakes"]].map(([val, label]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: "20px" }} className="stat-num">{val}</div>
                    <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Desktop App View — full site width, not a phone ──────────
function DesktopAppView({ children, onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative" }}>

      {/* Subtle animated floating cards in bg */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, background: "linear-gradient(160deg, #fffdf9 0%, #fff8f0 40%, #fff 100%)" }}>
        <FloatingCards />
      </div>

      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 60px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "60px", boxShadow: "0 1px 16px rgba(0,0,0,0.05)" }}>
        <div onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: "16px", color: "#1a1a1a", letterSpacing: "-0.3px" }}>Master Events</span>
        </div>
        <span onClick={() => onNavigate("home")} style={{ color: "#aaa", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>← Back to site</span>
      </div>

      {/* App content — centered max-width, white card on light bg */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: "520px", margin: "40px auto 60px", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)", minHeight: "80vh" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, #f5a623, #e8920f)" }} />
          <div style={{ overflowY: "auto", overflowX: "hidden" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function PhoneFrame({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [desktopPage, setDesktopPage] = useState("home");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (page) => setDesktopPage(page);

  if (isMobile) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { height: 100%; width: 100%; overflow: hidden; background: #f8f8f6; }
        `}</style>
        <div style={{ width: "100%", height: "100vh", background: "#f8f8f6", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-y: auto; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f8f8f6; }
        ::-webkit-scrollbar-thumb { background: #f5a623; border-radius: 3px; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 10px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      {desktopPage === "home"  && <LandingPage onNavigate={handleNavigate} />}
      {desktopPage === "about" && <AboutPage onNavigate={handleNavigate} />}
      {(desktopPage === "login" || desktopPage === "signup") && (
        <DesktopAuthPage type={desktopPage} onNavigate={handleNavigate} />
      )}
      {desktopPage === "app" && (
        <DesktopAppView onNavigate={handleNavigate}>
          {children}
        </DesktopAppView>
      )}
    </>
  );
}