import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";

const BACKEND = "https://master-events-backend.onrender.com";
const BRAND   = "#F97316";
const BRAND_D = "#EA6C0A";
const FONT    = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO    = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const isDesktop = () => window.innerWidth >= 1024;

const catImg = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=1600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600",
};

function TrustBadge({ icon, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
      <span style={{ fontSize:"13px" }}>{icon}</span>
      <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:500 }}>{label}</span>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
      <div style={{ width:"38px", height:"38px", borderRadius:"11px", background:"var(--bg-subtle)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:"9px", fontWeight:700, color:"var(--text-muted)", letterSpacing:"1.2px", marginBottom:"2px", fontFamily:MONO }}>{label}</div>
        <div style={{ fontSize:"14px", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis" }}>{value}</div>
      </div>
    </div>
  );
}

function TicketCard({ event, isFree, curr, isLoggedIn, onAction, actionLoading, error, isDesk }) {
  const remaining = (event.total_tickets || 0) - (event.tickets_sold || 0);
  const soldPct   = event.total_tickets > 0
    ? Math.max(3, Math.min(100, ((event.tickets_sold || 0) / event.total_tickets) * 100))
    : 0;
  const lowStock  = remaining > 0 && remaining <= Math.max(10, event.total_tickets * 0.1);

  return (
    <div style={{
      background:"var(--bg-card)", borderRadius:"20px", border:"1px solid var(--border)",
      boxShadow:"0 12px 40px rgba(0,0,0,0.08)", padding: isDesk ? "26px" : "20px",
      position: isDesk ? "sticky" : "static", top: isDesk ? "24px" : "auto",
    }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:"8px", marginBottom:"18px" }}>
        <div style={{ fontSize: isDesk ? "34px" : "28px", fontWeight:900, letterSpacing:"-1.5px",
          color: isFree ? "#16a34a" : BRAND, lineHeight:1 }}>
          {isFree ? "FREE" : `${curr} ${parseFloat(event.price).toLocaleString()}`}
        </div>
        {!isFree && <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>per ticket</span>}
      </div>

      <div style={{ marginBottom:"18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <span style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", fontFamily:MONO, letterSpacing:"0.5px" }}>AVAILABILITY</span>
          <span style={{ fontSize:"10px", fontWeight:700, color: lowStock ? "#dc2626" : "#16a34a", fontFamily:MONO }}>
            {remaining <= 0 ? "SOLD OUT" : lowStock ? "ALMOST GONE" : "AVAILABLE"}
          </span>
        </div>
        <div style={{ height:"6px", background:"var(--bg-subtle)", borderRadius:"99px", overflow:"hidden", border:"1px solid var(--border)" }}>
          <motion.div initial={{ width:0 }} animate={{ width:`${soldPct}%` }} transition={{ duration:0.8, ease:"easeOut" }}
            style={{ height:"100%", borderRadius:"99px",
              background: lowStock ? "linear-gradient(90deg,#dc2626,#ef4444)" : "linear-gradient(90deg,#16a34a,#22c55e)" }} />
        </div>
        <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"5px" }}>
          {event.tickets_sold || 0} {isFree ? "registered" : "sold"} · {Math.max(0, remaining)} remaining
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"10px", padding:"10px 14px", marginBottom:"14px", fontSize:"12px", color:"#dc2626" }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={remaining > 0 ? { scale:1.015 } : {}}
        whileTap={remaining > 0 ? { scale:0.98 } : {}}
        onClick={onAction}
        disabled={actionLoading || remaining <= 0}
        style={{
          width:"100%", padding:"17px", borderRadius:"14px", border:"none",
          background: remaining <= 0
            ? "var(--bg-subtle)"
            : actionLoading
              ? "var(--bg-subtle)"
              : `linear-gradient(135deg,${isFree ? "#16a34a,#15803d" : `${BRAND},${BRAND_D}`})`,
          color: remaining <= 0 || actionLoading ? "var(--text-muted)" : "#fff",
          fontSize:"16px", fontWeight:700, cursor: remaining <= 0 ? "not-allowed" : "pointer",
          fontFamily:FONT, boxShadow: remaining > 0 && !actionLoading ? "0 8px 24px rgba(0,0,0,0.16)" : "none",
          transition:"all 0.15s",
        }}>
        {remaining <= 0
          ? "Sold Out"
          : actionLoading
            ? "Processing…"
            : isFree
              ? "Register Free — Get Ticket"
              : isLoggedIn
                ? `Buy Ticket — ${curr} ${parseFloat(event.price).toLocaleString()}`
                : "Sign Up & Buy Ticket"}
      </motion.button>

      <div style={{ display:"flex", flexWrap:"wrap", gap:"14px", justifyContent:"center", marginTop:"18px", paddingTop:"18px", borderTop:"1px solid var(--border)" }}>
        <TrustBadge icon="🔒" label="Secure checkout" />
        <TrustBadge icon="⛓️" label="NFT ticket" />
        <TrustBadge icon="📱" label="MoMo accepted" />
      </div>
    </div>
  );
}

export default function PublicEventPage() {
  const setScreen        = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const isLoggedIn       = useStore(s => s.isLoggedIn);
  const [event,      setEvent]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [regDone,    setRegDone]    = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [isDesk,     setIsDesk]     = useState(isDesktop());

  const slug = localStorage.getItem("pending_event_slug");

  useEffect(() => {
    const r = () => setIsDesk(isDesktop());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

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
    if (!isLoggedIn) {
      localStorage.setItem("post_auth_screen", "pendingEvent");
      setScreen("signup");
      return;
    }
    setRegLoading(true);
    setError("");
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
    if (!isLoggedIn) {
      localStorage.setItem("post_auth_screen", "pendingEvent");
      setScreen("signup");
      return;
    }
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
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"14px" }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}
        style={{ width:"28px", height:"28px", borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:BRAND }} />
      <div style={{ fontSize:"13px", color:"var(--text-muted)", fontFamily:FONT }}>Loading event…</div>
    </div>
  );

  if (error && !event) return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"14px", padding:"24px", textAlign:"center" }}>
      <div style={{ fontSize:"40px" }}>😕</div>
      <div style={{ fontSize:"16px", fontWeight:600, color:"var(--text-primary)", fontFamily:FONT }}>{error || "Event not found"}</div>
      <motion.button whileTap={{ scale:0.97 }} onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
        style={{ padding:"12px 24px", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, color:"#fff", border:"none", borderRadius:"12px", cursor:"pointer", fontFamily:FONT, fontWeight:600, fontSize:"14px" }}>
        Browse Events
      </motion.button>
    </div>
  );

  const isFree  = event.event_type === "free" || parseFloat(event.price) === 0;
  const curr    = event.currency || "GHS";
  const cover   = event.image || catImg[event.category] || catImg.other;
  const orgName = event.organizer?.first_name
    ? `${event.organizer.first_name} ${event.organizer.last_name || ""}`.trim()
    : event.organizer_name || null;

  if (regDone) return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:"24px", textAlign:"center" }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:300, damping:20 }}
        style={{ fontSize:"56px", marginBottom:"18px" }}>🎉</motion.div>
      <h2 style={{ fontSize:"24px", fontWeight:800, color:"var(--text-primary)", marginBottom:"10px", fontFamily:FONT, letterSpacing:"-0.5px" }}>You're registered!</h2>
      <p style={{ fontSize:"14px", color:"var(--text-muted)", marginBottom:"6px", maxWidth:"340px" }}>Check your email — your PDF ticket with QR code has been sent.</p>
      <p style={{ fontSize:"13px", color:"var(--text-muted)", marginBottom:"28px" }}>You can also view it in the app under My Tickets.</p>
      <motion.button whileTap={{ scale:0.97 }} onClick={() => setScreen("app")}
        style={{ padding:"14px 32px", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, color:"#fff", border:"none", borderRadius:"14px", fontSize:"15px", fontWeight:700, cursor:"pointer", fontFamily:FONT, boxShadow:"0 8px 24px rgba(0,0,0,0.16)" }}>
        Go to My Tickets →
      </motion.button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:FONT }}>

      <div style={{ position:"sticky", top:0, zIndex:30, background:"var(--bg-card)", borderBottom:"1px solid var(--border)", padding: isDesk ? "0 40px" : "0 16px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <motion.div whileTap={{ scale:0.97 }}
          onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
          style={{ display:"flex", alignItems:"center", gap:"9px", cursor:"pointer" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"9px", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>🎟️</div>
          <span style={{ fontWeight:800, fontSize:"14px", color:"var(--text-primary)", letterSpacing:"-0.3px" }}>Master Events</span>
        </motion.div>
        {!isLoggedIn && isDesk && (
          <div style={{ display:"flex", gap:"10px" }}>
            <motion.button whileTap={{ scale:0.96 }} onClick={() => setScreen("login")}
              style={{ padding:"8px 16px", borderRadius:"9px", border:"1px solid var(--border)", background:"transparent", color:"var(--text-primary)", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
              Log in
            </motion.button>
          </div>
        )}
      </div>

      <div style={{ height: isDesk ? "380px" : "220px", position:"relative", overflow:"hidden" }}>
        <img src={cover} alt={event.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.src = catImg.other; }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.55) 75%,rgba(0,0,0,0.75) 100%)" }} />

        <div style={{ position:"absolute", top:"16px", left: isDesk ? "40px" : "16px", display:"flex", gap:"6px" }}>
          <span style={{ background:BRAND, color:"#fff", fontSize:"10px", fontWeight:700, padding:"5px 12px", borderRadius:"99px", letterSpacing:"0.5px", fontFamily:MONO }}>
            {(event.category || "").toUpperCase()}
          </span>
          {isFree && (
            <span style={{ background:"#16a34a", color:"#fff", fontSize:"10px", fontWeight:700, padding:"5px 12px", borderRadius:"99px", fontFamily:MONO }}>FREE</span>
          )}
          <span style={{ display:"flex", alignItems:"center", gap:"4px", background:"rgba(124,58,237,0.85)", backdropFilter:"blur(8px)", color:"#fff", fontSize:"10px", fontWeight:700, padding:"5px 12px", borderRadius:"99px" }}>
            ⛓️ NFT · POLYGON
          </span>
        </div>

        <div style={{ position:"absolute", bottom: isDesk ? "36px" : "18px", left: isDesk ? "40px" : "16px", right: isDesk ? "40px" : "16px", maxWidth: isDesk ? "760px" : "none" }}>
          <h1 style={{ fontSize: isDesk ? "38px" : "24px", fontWeight:900, color:"#fff", letterSpacing:"-1px", lineHeight:1.1, marginBottom:"10px", textShadow:"0 2px 20px rgba(0,0,0,0.3)" }}>
            {event.name}
          </h1>
          <div style={{ fontSize: isDesk ? "14px" : "12px", color:"rgba(255,255,255,0.85)", display:"flex", flexWrap:"wrap", gap:"14px" }}>
            <span>📅 {event.date}{event.time ? ` · ${event.time.substring(0,5)}` : ""}</span>
            <span>📍 {event.venue}{event.city ? `, ${event.city}` : ""}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding: isDesk ? "36px 40px 80px" : "20px 16px 100px", display:"flex", gap:"40px", alignItems:"flex-start", flexDirection: isDesk ? "row" : "column" }}>

        <div style={{ flex:1, minWidth:0, width:"100%" }}>

          {orgName && (
            <div style={{ display:"flex", alignItems:"center", gap:"12px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"14px", padding:"14px 18px", marginBottom:"20px" }}>
              <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", color:"#fff", fontWeight:700, flexShrink:0 }}>
                {orgName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:"10px", color:"var(--text-muted)", fontFamily:MONO, letterSpacing:"1px" }}>HOSTED BY</div>
                <div style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)" }}>{orgName}</div>
              </div>
            </div>
          )}

          {!isDesk && (
            <div style={{ marginBottom:"20px" }}>
              <TicketCard event={event} isFree={isFree} curr={curr} isLoggedIn={isLoggedIn}
                onAction={isFree ? handleRegister : handleBuy} actionLoading={regLoading} error={error} isDesk={false} />
            </div>
          )}

          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"16px", overflow:"hidden", marginBottom:"20px" }}>
            <DetailRow icon="📅" label="DATE" value={event.date || "TBA"} />
            <DetailRow icon="🕐" label="TIME" value={event.time ? event.time.substring(0,5) : "TBA"} />
            <DetailRow icon="📍" label="VENUE" value={`${event.venue || "TBA"}${event.city ? `, ${event.city}` : ""}`} />
            <DetailRow icon="🎟" label="CAPACITY" value={`${event.total_tickets || 0} spots total`} />
          </div>

          {event.description && (
            <div style={{ marginBottom:"20px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"12px", fontFamily:MONO }}>
                About this event
              </div>
              <p style={{ fontSize: isDesk ? "15px" : "14px", color:"var(--text-secondary)", lineHeight:1.85, margin:0, whiteSpace:"pre-line" }}>
                {event.description}
              </p>
            </div>
          )}

          <div style={{ background:"rgba(124,58,237,0.05)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:"14px", padding:"16px 18px", display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ fontSize:"22px" }}>⛓️</span>
            <div>
              <div style={{ fontSize:"12px", fontWeight:700, color:"#7c3aed", marginBottom:"2px" }}>Secured by Polygon Blockchain</div>
              <div style={{ fontSize:"11px", color:"var(--text-muted)" }}>Every ticket is minted as an NFT — screenshot-proof, cannot be duplicated or faked</div>
            </div>
          </div>
        </div>

        {isDesk && (
          <div style={{ width:"380px", flexShrink:0 }}>
            <TicketCard event={event} isFree={isFree} curr={curr} isLoggedIn={isLoggedIn}
              onAction={isFree ? handleRegister : handleBuy} actionLoading={regLoading} error={error} isDesk={true} />
          </div>
        )}
      </div>

      {!isLoggedIn && !isDesk && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--bg-card)", borderTop:"1px solid var(--border)", padding:"10px 16px", textAlign:"center", fontSize:"11px", color:"var(--text-muted)", zIndex:20 }}>
          You'll need a free account to get your ticket — takes 30 seconds
        </div>
      )}
    </div>
  );
}