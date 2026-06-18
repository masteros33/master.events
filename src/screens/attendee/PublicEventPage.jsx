import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";

const BACKEND = "https://master-events-backend.onrender.com";
const BRAND   = "#F97316";
const FONT    = "'Inter','SF Pro Display',-apple-system,sans-serif";

export default function PublicEventPage() {
  const setScreen       = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const isLoggedIn      = useStore(s => s.isLoggedIn);
  const [event,   setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [regDone, setRegDone] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const slug = localStorage.getItem("pending_event_slug");

  useEffect(() => {
    if (!slug) { setScreen("home"); return; }
    fetch(`${BACKEND}/api/events/slug/${slug}/`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setEvent(data);
        else setError("Event not found.");
        setLoading(false);
      })
      .catch(() => { setError("Could not load event."); setLoading(false); });
  }, []);

  const handleRegister = async () => {
    if (!isLoggedIn) { setScreen("signup"); return; }
    setRegLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${BACKEND}/api/tickets/register-free/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: event.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.registration_id || res.ok) {
        setRegDone(true);
        localStorage.removeItem("pending_event_slug");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Connection error.");
    }
    setRegLoading(false);
  };

  const handleBuy = () => {
    if (!isLoggedIn) { setScreen("signup"); return; }
    setCheckoutEvent({
      id: event.id, name: event.name, date: event.date,
      venue: event.venue, price: parseFloat(event.price),
      image: event.image, category: event.category,
      currency: event.currency || "GHS",
    });
    localStorage.removeItem("pending_event_slug");
    setScreen("checkout");
  };

  if (loading) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ fontSize:"13px", color:"var(--text-muted)", fontFamily:FONT }}>Loading event…</div>
    </div>
  );

  if (error || !event) return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"12px" }}>
      <div style={{ fontSize:"32px" }}>😕</div>
      <div style={{ fontSize:"15px", color:"var(--text-primary)", fontFamily:FONT }}>{error || "Event not found"}</div>
      <motion.button whileTap={{ scale:0.97 }} onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
        style={{ padding:"10px 20px", background:BRAND, color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontFamily:FONT }}>
        Browse Events
      </motion.button>
    </div>
  );

  const isFree = event.event_type === "free" || parseFloat(event.price) === 0;
  const curr   = event.currency || "GHS";

  if (regDone) return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:"24px", textAlign:"center" }}>
      <div style={{ fontSize:"48px", marginBottom:"16px" }}>🎉</div>
      <h2 style={{ fontSize:"22px", fontWeight:700, color:"var(--text-primary)", marginBottom:"8px", fontFamily:FONT }}>You're registered!</h2>
      <p style={{ fontSize:"14px", color:"var(--text-muted)", marginBottom:"8px" }}>
        Check your email — your PDF ticket with QR code has been sent.
      </p>
      <p style={{ fontSize:"13px", color:"var(--text-muted)", marginBottom:"24px" }}>
        You can also view it in the app under My Tickets.
      </p>
      <motion.button whileTap={{ scale:0.97 }} onClick={() => setScreen("app")}
        style={{ padding:"12px 28px", background:BRAND, color:"#fff", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
        Go to My Tickets →
      </motion.button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:FONT }}>
      {/* Cover image */}
      <div style={{ height:"240px", position:"relative" }}>
        {event.image
          ? <img src={event.image} alt={event.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${BRAND},#EA6C0A)` }} />
        }
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.7))" }} />
        <motion.button whileTap={{ scale:0.9 }}
          onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
          style={{ position:"absolute", top:"14px", left:"14px", width:"32px", height:"32px", borderRadius:"7px", background:"rgba(255,255,255,0.15)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff", fontSize:"14px" }}>
          ←
        </motion.button>
        <div style={{ position:"absolute", bottom:"16px", left:"18px", right:"18px" }}>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.6)", fontWeight:500, marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
            {event.category} · {event.country || "Ghana"}
          </div>
          <div style={{ fontSize:"22px", fontWeight:700, color:"#fff", letterSpacing:"-0.5px", marginBottom:"4px" }}>
            {event.name}
          </div>
          <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.65)" }}>
            📍 {event.venue} · 📅 {event.date}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:"560px", margin:"0 auto", padding:"20px 16px 80px" }}>

        {/* Price badge */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
          <span style={{ padding:"5px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:700,
            background: isFree ? "rgba(22,163,74,0.1)" : "rgba(249,115,22,0.1)",
            color: isFree ? "#16a34a" : BRAND,
            border: `1px solid ${isFree ? "rgba(22,163,74,0.2)" : "rgba(249,115,22,0.2)"}` }}>
            {isFree ? "FREE EVENT" : `${curr} ${parseFloat(event.price).toLocaleString()}`}
          </span>
          <span style={{ padding:"5px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:700,
            background:"rgba(139,92,246,0.1)", color:"#8b5cf6", border:"1px solid rgba(139,92,246,0.2)" }}>
            ⛓ NFT Ticket
          </span>
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ background:"var(--bg-card)", borderRadius:"10px", padding:"16px", marginBottom:"14px", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text-muted)", marginBottom:"6px", letterSpacing:"0.5px" }}>ABOUT</div>
            <p style={{ fontSize:"14px", color:"var(--text-secondary)", lineHeight:1.7, margin:0 }}>{event.description}</p>
          </div>
        )}

        {/* Details */}
        <div style={{ background:"var(--bg-card)", borderRadius:"10px", overflow:"hidden", marginBottom:"20px", border:"1px solid var(--border)" }}>
          {[
            ["📅 Date", event.date],
            ["📍 Venue", event.venue],
            ["🏙 City", event.city || "—"],
            ["🎫 Capacity", `${event.total_tickets} spots`],
          ].map(([label, val]) => (
            <div key={label} style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:"13px", color:"var(--text-muted)" }}>{label}</span>
              <span style={{ fontSize:"13px", color:"var(--text-primary)", fontWeight:500 }}>{val}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", padding:"10px 14px", marginBottom:"14px", fontSize:"13px", color:"#ef4444" }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }}
          onClick={isFree ? handleRegister : handleBuy}
          disabled={regLoading}
          style={{ width:"100%", padding:"14px",
            background: regLoading ? "var(--border)" : `linear-gradient(135deg,${isFree?"#16a34a,#15803d":BRAND+",#EA6C0A"})`,
            color: regLoading ? "var(--text-muted)" : "#fff",
            border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:600,
            cursor: regLoading ? "not-allowed" : "pointer", fontFamily:FONT }}>
          {regLoading
            ? "Registering…"
            : isFree
              ? "Register for Free — Get PDF Ticket"
              : `Buy Ticket — ${curr} ${parseFloat(event.price).toLocaleString()}`}
        </motion.button>

        <p style={{ fontSize:"11px", color:"var(--text-muted)", textAlign:"center", marginTop:"10px" }}>
          {isFree
            ? "PDF ticket with QR code will be emailed to you instantly"
            : "QR code available in app only — live rotating for security"}
        </p>
      </div>
    </div>
  );
}