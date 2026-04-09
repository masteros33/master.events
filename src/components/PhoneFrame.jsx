import React, { useEffect, useState } from "react";
import useStore from "../store/useStore";

// ── Floating event cards background ─────────────────────────
function FloatingCards() {
  const cards = [
    { name: "Afrobeats Night",  price: "Ghc 80",  color: "#f5a623", icon: "🎵", cls: "top-[12%] left-[3%]",  delay: "0s",   dur: "8s"  },
    { name: "Tech Summit GH",   price: "Ghc 150", color: "#5dade2", icon: "💻", cls: "top-[6%] right-[4%]",  delay: "1.5s", dur: "9s"  },
    { name: "Food Fest Accra",  price: "FREE",    color: "#27ae60", icon: "🍔", cls: "top-[55%] right-[3%]", delay: "3s",   dur: "10s" },
    { name: "Art Exhibition",   price: "Ghc 40",  color: "#a29bfe", icon: "🎨", cls: "top-[60%] left-[2%]",  delay: "2s",   dur: "7s"  },
    { name: "GCTU Sports Day",  price: "FREE",    color: "#e17055", icon: "⚽", cls: "top-[78%] right-[6%]", delay: "4s",   dur: "11s" },
    { name: "Blockchain Talk",  price: "Ghc 50",  color: "#00cec9", icon: "⛓️", cls: "top-[80%] left-[5%]",  delay: "0.5s", dur: "9s"  },
  ];

  return (
    <>
      <style>{`
        @keyframes floatCard {
          0%,100% { transform: translateY(0px) rotate(-1deg); opacity: 0.13; }
          50%      { transform: translateY(-20px) rotate(1deg); opacity: 0.2; }
        }
        @keyframes floatCardAlt {
          0%,100% { transform: translateY(0px) rotate(1deg); opacity: 0.1; }
          50%      { transform: translateY(-16px) rotate(-1.5deg); opacity: 0.17; }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.5; }
        }
        .hero-anim-1 { animation: heroFadeUp 0.6s 0.1s both; }
        .hero-anim-2 { animation: heroFadeUp 0.6s 0.25s both; }
        .hero-anim-3 { animation: heroFadeUp 0.6s 0.4s both; }
        .hero-anim-4 { animation: heroFadeUp 0.6s 0.55s both; }
        .float-even  { animation: floatCard 8s ease-in-out infinite; }
        .float-odd   { animation: floatCardAlt 9s ease-in-out infinite; }
        .nav-link { position: relative; transition: color 0.15s; }
        .nav-link::after { content:''; position:absolute; bottom:-3px; left:0; right:0; height:2px; background:#f5a623; border-radius:1px; transform:scaleX(0); transition:transform 0.2s; }
        .nav-link:hover { color: #f5a623 !important; }
        .nav-link:hover::after { transform: scaleX(1); }
        .btn-primary { transition: transform 0.15s, box-shadow 0.15s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(245,166,35,0.45) !important; }
        .btn-primary:active { transform: scale(0.97); }
        .ev-card { transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s; }
        .ev-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.13) !important; }
        .grad-text {
          background: linear-gradient(135deg, #f5a623, #e8920f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {cards.map((c, i) => (
        <div key={i} className={`absolute ${c.cls} w-44 pointer-events-none z-0 ${i % 2 === 0 ? "float-even" : "float-odd"}`}
          style={{ animationDelay: c.delay, animationDuration: c.dur, background: "#fff", borderRadius: "14px", padding: "10px 13px", boxShadow: "0 8px 28px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", display: "flex", gap: "9px", alignItems: "center" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: c.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>{c.icon}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "11px", color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ fontSize: "10px", color: c.color, fontWeight: 700, marginTop: "2px" }}>{c.price}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// ── Navbar ───────────────────────────────────────────────────
function NavBar({ onNavigate, active }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-16 h-16 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
      <div onClick={() => onNavigate("home")} className="flex items-center gap-3 cursor-pointer">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md" style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>
        <span className="font-extrabold text-lg text-gray-900 tracking-tight">Master Events</span>
      </div>
      <div className="flex items-center gap-8">
        <a href="#events" className="nav-link text-sm font-medium text-gray-500 no-underline">Events</a>
        <span onClick={() => onNavigate("about")} className={`nav-link text-sm font-medium cursor-pointer ${active === "about" ? "text-amber-500" : "text-gray-500"}`}>About</span>
        <span onClick={() => onNavigate("login")} className="nav-link text-sm font-semibold text-gray-900 cursor-pointer">Log in</span>
        <span onClick={() => onNavigate("signup")} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg"
          style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 4px 14px rgba(245,166,35,0.35)" }}>
          Sign up free
        </span>
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
    music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
    food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
    sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
    business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
    other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <NavBar onNavigate={onNavigate} active="home" />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden text-center py-24 px-6 border-b border-gray-100"
        style={{ background: "linear-gradient(160deg, #fffdf9 0%, #fff8f0 45%, #fff 100%)" }}>
        <FloatingCards />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="hero-anim-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-7 border"
            style={{ background: "rgba(245,166,35,0.08)", borderColor: "rgba(245,166,35,0.25)", color: "#f5a623" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" style={{ animation: "badgePulse 2s infinite" }} />
            GHANA'S PREMIER TICKETING PLATFORM
          </div>

          <h1 className="hero-anim-2 font-black leading-none mb-5" style={{ fontSize: "clamp(42px, 5vw, 68px)", letterSpacing: "-2px" }}>
            Find events that<br />
            <span className="grad-text">move you</span>
          </h1>

          <p className="hero-anim-3 text-gray-500 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Discover and buy tickets to the best events in Ghana. Every ticket is an NFT — unfakeable and yours forever.
          </p>

          <div className="hero-anim-4 flex gap-4 justify-center flex-wrap">
            <a href="#events" className="btn-primary px-9 py-4 rounded-2xl font-bold text-base text-white no-underline shadow-xl"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.4)" }}>
              Browse Events
            </a>
            <span onClick={() => onNavigate("signup")}
              className="px-9 py-4 rounded-2xl font-bold text-base text-gray-900 cursor-pointer border border-gray-200 bg-white shadow-sm hover:border-amber-400 hover:text-amber-500 transition-all">
              Create Event
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hero-anim-4 relative z-10 flex gap-14 justify-center mt-16">
          {[["10K+", "Tickets Sold"], ["50+", "Events"], ["99%", "Verified"], ["0%", "Fakes"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="grad-text font-black text-3xl">{val}</div>
              <div className="text-gray-400 text-sm mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Events Grid ── */}
      <div id="events" className="max-w-7xl mx-auto px-16 py-20">
        <div className="flex justify-between items-end mb-9">
          <div>
            <div className="text-xs font-bold tracking-widest text-amber-500 mb-2">UPCOMING</div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Events near you</h2>
          </div>
          <span onClick={() => onNavigate("signup")} className="text-amber-500 font-bold text-sm cursor-pointer hover:opacity-70 transition-opacity">
            See all →
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(events.length > 0 ? events : Array(8).fill(null)).map((ev, i) => (
            <div key={i} onClick={() => onNavigate("signup")}
              className="ev-card bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <div className="h-44 relative bg-gray-100">
                <img src={ev?.image || catImg[ev?.category] || catImg.other} alt={ev?.name || "Event"}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = catImg.other; }} />
                {!ev && <div className="skeleton absolute inset-0 rounded-none" />}
                {ev && (
                  <>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))" }} />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-white text-xs font-bold"
                      style={{ background: "#f5a623" }}>{ev.category}</div>
                    {parseFloat(ev.price) === 0 && (
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-white text-xs font-bold"
                        style={{ background: "#27ae60" }}>FREE</div>
                    )}
                  </>
                )}
              </div>
              <div className="p-4">
                {ev ? (
                  <>
                    <div className="font-bold text-sm text-gray-900 mb-1.5 leading-snug">{ev.name}</div>
                    <div className="text-xs text-gray-400 mb-3">{"📅 " + ev.date + " · 📍 " + ev.venue}</div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-base" style={{ color: "#f5a623" }}>
                        {parseFloat(ev.price) === 0 ? "FREE" : "Ghc " + ev.price}
                      </span>
                      <button onClick={e => { e.stopPropagation(); onNavigate("signup"); }}
                        className="btn-primary px-4 py-1.5 rounded-xl text-white text-xs font-bold border-none cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 4px 10px rgba(245,166,35,0.3)" }}>
                        Get Tickets
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="skeleton h-3.5 w-4/5 mb-2" />
                    <div className="skeleton h-3 w-3/5 mb-3" />
                    <div className="skeleton h-3.5 w-2/5" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features Strip ── */}
      <div className="border-y border-amber-100 py-14 px-16" style={{ background: "linear-gradient(135deg, #fffdf9, #fff8f0)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            ["⛓️", "NFT Tickets",       "Every ticket minted on Polygon — 100% authentic"],
            ["💰", "95% to Organizers", "Only 5% fee — withdraw via MoMo instantly"],
            ["📱", "MoMo & VISA",       "Pay the Ghanaian way — mobile money or card"],
            ["🔍", "QR Verification",   "Door staff scan tickets in seconds at the gate"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border"
                style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.18)", fontSize: "22px" }}>{icon}</div>
              <div>
                <div className="font-bold text-sm text-gray-900 mb-1">{title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Organizer CTA ── */}
      <div className="max-w-7xl mx-auto mx-16 my-20 rounded-3xl p-16 flex justify-between items-center relative overflow-hidden"
        style={{ background: "#1a1a1a", margin: "80px 60px" }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="max-w-lg relative z-10">
          <div className="text-xs font-bold tracking-widest text-amber-500 mb-4">FOR ORGANIZERS</div>
          <h2 className="font-black text-white mb-4 leading-tight" style={{ fontSize: "clamp(28px,3vw,42px)", letterSpacing: "-0.8px" }}>
            Ready to host<br />your event?
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-8">
            Create events, sell blockchain-verified tickets, manage door staff, and receive 95% directly to your MoMo wallet.
          </p>
          <div className="flex gap-3">
            <span onClick={() => onNavigate("signup")} className="btn-primary px-7 py-3.5 rounded-2xl font-bold text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 6px 24px rgba(245,166,35,0.4)" }}>
              Start Selling Tickets
            </span>
            <span onClick={() => onNavigate("about")}
              className="px-7 py-3.5 rounded-2xl font-semibold text-white cursor-pointer border border-white/10 hover:bg-white/10 transition-all">
              Learn More
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-shrink-0 relative z-10">
          {[["95%", "Payout"], ["NFT", "Tickets"], ["MoMo", "Payments"], ["QR", "Scanning"]].map(([val, label]) => (
            <div key={label} className="rounded-2xl p-5 text-center border border-white/8"
              style={{ background: "rgba(255,255,255,0.06)", width: "115px" }}>
              <div className="font-black text-xl text-amber-400 mb-1">{val}</div>
              <div className="text-xs font-semibold text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-gray-100 px-16 py-9 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>
          <span className="font-bold text-gray-900 text-sm">Master Events</span>
        </div>
        <div className="text-gray-300 text-xs">© 2026 Master Events Ghana · Secured by Polygon Blockchain</div>
        <div className="flex gap-7">
          <a href="mailto:mastereventgh@gmail.com" className="text-gray-400 no-underline text-sm hover:text-amber-500 transition-colors">Contact</a>
          <span onClick={() => onNavigate("about")} className="text-gray-400 text-sm cursor-pointer hover:text-amber-500 transition-colors">About</span>
          <span onClick={() => onNavigate("signup")} className="text-gray-400 text-sm cursor-pointer hover:text-amber-500 transition-colors">Sign up</span>
        </div>
      </div>
    </div>
  );
}

// ── About Page ───────────────────────────────────────────────
function AboutPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar onNavigate={onNavigate} active="about" />
      <div className="max-w-3xl mx-auto px-10 py-20">
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.3)" }}>🎟️</div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">About Master Events</h1>
          <p className="text-lg text-gray-500 leading-relaxed">Ghana's first blockchain-powered event ticketing platform.</p>
        </div>
        {[
          { icon: "🎯", title: "Our Mission", body: "We believe every event experience should start with trust. Master Events uses blockchain technology to ensure every ticket is authentic, verifiable, and owned by the rightful buyer." },
          { icon: "⛓️", title: "Blockchain Technology", body: "Every ticket purchased on Master Events is minted as an NFT on the Polygon blockchain — the same technology used by major global platforms, now available in Ghana." },
          { icon: "💰", title: "Fair for Organizers", body: "We take only 5% per transaction. 95% goes directly to the organizer's wallet, withdrawable via MTN MoMo or VISA." },
          { icon: "🇬🇭", title: "Built for Ghana", body: "From Afrobeats concerts in Accra to tech summits in Kumasi — Master Events is designed specifically for Ghana's vibrant events scene." },
          { icon: "👥", title: "The Team", body: "Built by students at Ghana Communication Technology University (GCTU) as a final-year CS project — combining blockchain, mobile, and payments." },
        ].map((item, i) => (
          <div key={i} className="flex gap-5 bg-white rounded-2xl p-7 mb-4 border border-gray-100 transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "rgba(245,166,35,0.1)" }}>{item.icon}</div>
            <div>
              <div className="font-bold text-lg text-gray-900 mb-2">{item.title}</div>
              <div className="text-gray-500 leading-relaxed text-sm">{item.body}</div>
            </div>
          </div>
        ))}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Have questions? Reach us at</p>
          <a href="mailto:mastereventgh@gmail.com" className="text-amber-500 font-bold text-lg no-underline">mastereventgh@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

// ── Auth Pages (Login / Signup) ──────────────────────────────
function DesktopAuthPage({ type, onNavigate }) {
  const setScreen = useStore(s => s.setScreen);
  const handleEnterApp = (s) => { setScreen(s); onNavigate("app"); };

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: "linear-gradient(160deg, #fffdf9 0%, #fff8f0 50%, #ffffff 100%)" }}>
      <NavBar onNavigate={onNavigate} active={type} />

      <div className="flex-1 flex items-center justify-center px-10 py-16 relative overflow-hidden">
        <FloatingCards />

        <div className="relative z-10 flex gap-20 items-center max-w-5xl w-full">

          {/* Left branding */}
          <div className="flex-1 hero-anim-1">
            <div className="text-xs font-bold tracking-widest text-amber-500 mb-5">MASTER EVENTS GHANA</div>
            <h1 className="font-black text-gray-900 leading-none mb-5" style={{ fontSize: "clamp(36px, 4vw, 58px)", letterSpacing: "-1.5px" }}>
              {type === "login"
                ? <><span>Welcome</span><br /><span className="grad-text">back.</span></>
                : <><span>Ghana's</span><br /><span className="grad-text">best tickets.</span></>
              }
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">
              {type === "login"
                ? "Your NFT tickets and events are waiting. Every ticket is secured on Polygon blockchain — yours forever."
                : "Buy, sell and transfer blockchain-verified tickets. Join thousands of event-goers across Ghana."}
            </p>
            <div className="flex flex-col gap-3">
              {[
                ["⛓️", "NFT on Polygon",    "Every ticket is blockchain-verified"],
                ["💰", "95% to organizers", "Only 5% platform fee"],
                ["📱", "MoMo & VISA",       "Pay the Ghanaian way"],
              ].map(([icon, title, sub]) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 border"
                    style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.18)" }}>{icon}</div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{title}</div>
                    <div className="text-xs text-gray-400">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="w-96 flex-shrink-0 hero-anim-2">
            <div className="bg-white rounded-3xl p-12 border border-gray-100" style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.12)" }}>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 24px rgba(245,166,35,0.35)" }}>🎟️</div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                  {type === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {type === "login" ? "Log in to Master Events" : "Join Ghana's #1 ticketing platform"}
                </p>
              </div>

              <div className="flex gap-1.5 flex-wrap justify-center mb-7">
                {["NFT Tickets", "MoMo Payments", "Polygon"].map(tag => (
                  <div key={tag} className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: "rgba(245,166,35,0.08)", borderColor: "rgba(245,166,35,0.2)", color: "#f5a623" }}>{tag}</div>
                ))}
              </div>

              <button onClick={() => handleEnterApp(type === "login" ? "login" : "signup")}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-base text-white border-none cursor-pointer mb-4"
                style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 8px 28px rgba(245,166,35,0.35)" }}>
                {type === "login" ? "Log In to Master Events" : "Get Started — It's Free"}
              </button>

              <div className="text-center mb-6 text-sm">
                <span className="text-gray-400">{type === "login" ? "No account yet? " : "Already have an account? "}</span>
                <span onClick={() => onNavigate(type === "login" ? "signup" : "login")} className="text-amber-500 font-bold cursor-pointer">
                  {type === "login" ? "Sign up free" : "Log in"}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-xs whitespace-nowrap">trusted across Ghana</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="flex justify-around">
                {[["10K+", "Tickets"], ["50+", "Events"], ["0%", "Fakes"]].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <div className="grad-text font-black text-xl">{val}</div>
                    <div className="text-gray-300 text-xs mt-0.5">{label}</div>
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

// ── Desktop App View ─────────────────────────────────────────
function DesktopAppView({ children, onNavigate }) {
  return (
    <div className="min-h-screen font-sans relative" style={{ background: "linear-gradient(160deg, #fffdf9 0%, #fff8f0 40%, #fff 100%)" }}>
      {/* Floating bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingCards />
      </div>

      {/* Top nav */}
      <div className="sticky top-0 z-50 flex justify-between items-center px-16 h-14 bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div onClick={() => onNavigate("home")} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>🎟️</div>
          <span className="font-extrabold text-gray-900 text-base tracking-tight">Master Events</span>
        </div>
        <span onClick={() => onNavigate("home")} className="text-gray-400 text-sm cursor-pointer hover:text-amber-500 transition-colors font-medium">
          ← Back to site
        </span>
      </div>

      {/* App in centered max-width card */}
      <div className="relative z-10 max-w-lg mx-auto px-5 py-10">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100"
          style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.1)", minHeight: "80vh" }}>
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f5a623, #e8920f)" }} />
          <div className="overflow-y-auto overflow-x-hidden">
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
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
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