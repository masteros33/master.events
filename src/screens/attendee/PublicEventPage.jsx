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
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=1200",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
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
      <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"var(--bg-subtle)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", flexShrink:0 }}>
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
      background:"var(--bg-card)", borderRadius:"18px", border:"1px solid var(--border)",
      boxShadow:"0 8px 28px rgba(0,0,0,0.06)", padding: isDesk ? "24px" : "18px",
      position: isDesk ? "sticky" : "static", top: isDesk ? "24px" : "auto",
    }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:"8px", marginBottom:"16px" }}>
        <div style={{ fontSize: isDesk ? "30px" : "26px", fontWeight:800, letterSpacing:"-1px",
          color: isFree ? "#16a34a" : BRAND, lineHeight:1 }}>
          {isFree ? "FREE" : `${curr} ${parseFloat(event.price).toLocaleString()}`}
        </div>
        {!isFree && <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>per ticket</span>}
      </div>

      <div style={{ marginBottom:"16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <span style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", fontFamily:MONO, letterSpacing:"0.5px" }}>AVAILABILITY</span>
          <span style={{ fontSize:"10px", fontWeight:700, color: lowStock ? "#dc2626" : "#16a34a", fontFamily:MONO }}>
            {remaining <= 0 ? "SOLD OUT" : lowStock ? "ALMOST GONE" : "AVAILABLE"}
          </span>
        </div>
        <div style={{ height:"5px", background:"var(--bg-subtle)", borderRadius:"99px", overflow:"hidden", border:"1px solid var(--border)" }}>
          <motion.div initial={{ width:0 }} animate={{ width:`${soldPct}%` }} transition={{ duration:0.7, ease:"easeOut" }}
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
        whileHover={remaining > 0 ? { scale:1.01 } : {}}
        whileTap={remaining > 0 ? { scale:0.98 } : {}}
        onClick={onAction}
        disabled={actionLoading || remaining <= 0}
        style={{
          width:"100%", padding:"15px", borderRadius:"12px", border:"none",
          background: remaining <= 0
            ? "var(--bg-subtle)"
            : actionLoading
              ? "var(--bg-subtle)"
              : `linear-gradient(135deg,${isFree ? "#16a34a,#15803d" : `${BRAND},${BRAND_D}`})`,
          color: remaining <= 0 || actionLoading ? "var(--text-muted)" : "#fff",
          fontSize:"15px", fontWeight:700, cursor: remaining <= 0 ? "not-allowed" : "pointer",
          fontFamily:FONT, boxShadow: remaining > 0 && !actionLoading ? "0 6px 18px rgba(0,0,0,0.14)" : "none",
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

      <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", justifyContent:"center", marginTop:"16px", paddingTop:"16px", borderTop:"1px solid var(--border)" }}>
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
  const setSearchQ       = useStore(s => s.setSearchQ);
  const isLoggedIn       = useStore(s => s.isLoggedIn);
  const [event,      setEvent]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [regDone,    setRegDone]    = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [isDesk,     setIsDesk]     = useState(isDesktop());
  const [searchVal,  setSearchVal]  = useState("");

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

  const handleSearch = () => {
    setSearchQ(searchVal);
    localStorage.removeItem("pending_event_slug");
    setScreen("home");
  };

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
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"14px" }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}
        style={{ width:"26px", height:"26px", borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:BRAND }} />
      <div style={{ fontSize:"13px", color:"var(--text-muted)", fontFamily:FONT }}>Loading event…</div>
    </div>
  );

  if (error && !event) return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"14px", padding:"24px", textAlign:"center" }}>
      <div style={{ fontSize:"36px" }}>😕</div>
      <div style={{ fontSize:"15px", fontWeight:600, color:"var(--text-primary)", fontFamily:FONT }}>{error || "Event not found"}</div>
      <motion.button whileTap={{ scale:0.97 }} onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
        style={{ padding:"11px 22px", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, color:"#fff", border:"none", borderRadius:"10px", cursor:"pointer", fontFamily:FONT, fontWeight:600, fontSize:"13px" }}>
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
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:"24px", textAlign:"center" }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:300, damping:20 }}
        style={{ fontSize:"52px", marginBottom:"16px" }}>🎉</motion.div>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:"var(--text-primary)", marginBottom:"8px", fontFamily:FONT, letterSpacing:"-0.5px" }}>You're registered!</h2>
      <p style={{ fontSize:"14px", color:"var(--text-muted)", marginBottom:"6px", maxWidth:"340px" }}>Check your email — your PDF ticket with QR code has been sent.</p>
      <p style={{ fontSize:"13px", color:"var(--text-muted)", marginBottom:"26px" }}>You can also view it in the app under My Tickets.</p>
      <motion.button whileTap={{ scale:0.97 }} onClick={() => setScreen("app")}
        style={{ padding:"13px 28px", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, color:"#fff", border:"none", borderRadius:"12px", fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:FONT, boxShadow:"0 6px 18px rgba(0,0,0,0.14)" }}>
        Go to My Tickets →
      </motion.button>
    </div>
  );

  return (
    <div style={{ height:"100%", overflowY:"auto", WebkitOverflowScrolling:"touch", background:"var(--bg)", fontFamily:FONT }}>

      {/* Real nav bar with working search */}
      <div style={{ position:"sticky", top:0, zIndex:30, background:"var(--bg-card)", borderBottom:"1px solid var(--border)", padding: isDesk ? "0 40px" : "0 16px", height:"58px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"20px" }}>
        <motion.div whileTap={{ scale:0.97 }}
          onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
          style={{ display:"flex", alignItems:"center", gap:"9px", cursor:"pointer", flexShrink:0 }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>🎟️</div>
          {isDesk && <span style={{ fontWeight:800, fontSize:"14px", color:"var(--text-primary)", letterSpacing:"-0.3px" }}>Master Events</span>}
        </motion.div>

        {isDesk && (
          <div style={{ flex:1, maxWidth:"420px", position:"relative" }}>
            <div style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", fontSize:"13px", opacity:0.5 }}>🔍</div>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search events, venues..."
              style={{ width:"100%", padding:"8px 14px 8px 34px", background:"var(--bg-subtle)", border:"1.5px solid var(--border)", borderRadius:"10px", fontSize:"13px", color:"var(--text-primary)", outline:"none", boxSizing:"border-box", fontFamily:FONT }}
            />
          </div>
        )}

        {!isLoggedIn && (
          <motion.button whileTap={{ scale:0.96 }} onClick={() => setScreen("login")}
            style={{ padding:"7px 15px", borderRadius:"8px", border:"1px solid var(--border)", background:"transparent", color:"var(--text-primary)", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:FONT, flexShrink:0 }}>
            Log in
          </motion.button>
        )}
      </div>

      {/* Mobile search row */}
      {!isDesk && (
        <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", background:"var(--bg-card)" }}>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", fontSize:"13px", opacity:0.5 }}>🔍</div>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search events, venues..."
              style={{ width:"100%", padding:"9px 14px 9px 34px", background:"var(--bg-subtle)", border:"1.5px solid var(--border)", borderRadius:"10px", fontSize:"13px", color:"var(--text-primary)", outline:"none", boxSizing:"border-box", fontFamily:FONT }}
            />
          </div>
        </div>
      )}

      {/* Contained content */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding: isDesk ? "28px 40px 60px" : "16px 16px 40px" }}>

        {/* Image banner — full image visible, no cropping */}
        <div style={{ borderRadius:"16px", overflow:"hidden", border:"1px solid var(--border)", marginBottom:"24px", position:"relative", height: isDesk ? "360px" : "200px", background:"#000" }}>
          <img src={cover} alt=""
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"blur(24px) brightness(0.6)", transform:"scale(1.15)" }}
            onError={e => { e.target.style.display = "none"; }} />
          <img src={cover} alt={event.name}
            style={{ position:"relative", width:"100%", height:"100%", objectFit:"contain", display:"block" }}
            onError={e => { e.target.src = catImg.other; e.target.style.objectFit = "cover"; }} />
          <div style={{ position:"absolute", top:"14px", left:"14px", display:"flex", gap:"6px" }}>
            <span style={{ background:BRAND, color:"#fff", fontSize:"9px", fontWeight:700, padding:"4px 10px", borderRadius:"99px", letterSpacing:"0.5px", fontFamily:MONO }}>
              {(event.category || "").toUpperCase()}
            </span>
            {isFree && (
              <span style={{ background:"#16a34a", color:"#fff", fontSize:"9px", fontWeight:700, padding:"4px 10px", borderRadius:"99px", fontFamily:MONO }}>FREE</span>
            )}
            <span style={{ display:"flex", alignItems:"center", gap:"4px", background:"rgba(124,58,237,0.85)", backdropFilter:"blur(8px)", color:"#fff", fontSize:"9px", fontWeight:700, padding:"4px 10px", borderRadius:"99px" }}>
              ⛓️ NFT
            </span>
          </div>
        </div>

        {/* Body — title, organizer, then two columns */}
        <div style={{ display:"flex", gap:"40px", alignItems:"flex-start", flexDirection: isDesk ? "row" : "column" }}>

          <div style={{ flex:1, minWidth:0, width:"100%" }}>

            <h1 style={{ fontSize: isDesk ? "30px" : "22px", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.7px", lineHeight:1.15, marginBottom:"10px" }}>
              {event.name}
            </h1>

            {orgName && (
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:`linear-gradient(135deg,${BRAND},${BRAND_D})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", color:"#fff", fontWeight:700, flexShrink:0 }}>
                  {orgName.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize:"13px", color:"var(--text-secondary)" }}>
                  by <span style={{ fontWeight:700, color:"var(--text-primary)" }}>{orgName}</span>
                </div>
              </div>
            )}

            <div style={{ fontSize:"13px", color:"var(--text-muted)", marginBottom:"24px", display:"flex", flexDirection:"column", gap:"4px" }}>
              <div>📍 {event.venue}{event.city ? `, ${event.city}` : ""}</div>
              <div>📅 {event.date}{event.time ? ` · ${event.time.substring(0,5)}` : ""}</div>
            </div>

            {!isDesk && (
              <div style={{ marginBottom:"24px" }}>
                <TicketCard event={event} isFree={isFree} curr={curr} isLoggedIn={isLoggedIn}
                  onAction={isFree ? handleRegister : handleBuy} actionLoading={regLoading} error={error} isDesk={false} />
              </div>
            )}

            {event.description && (
              <div style={{ marginBottom:"24px" }}>
                <h2 style={{ fontSize:"15px", fontWeight:700, color:"var(--text-primary)", marginBottom:"10px" }}>Overview</h2>
                <p style={{ fontSize:"14px", color:"var(--text-secondary)", lineHeight:1.75, margin:0, whiteSpace:"pre-line" }}>
                  {event.description}
                </p>
              </div>
            )}

            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"14px", overflow:"hidden", marginBottom:"24px" }}>
              <DetailRow icon="📅" label="DATE" value={event.date || "TBA"} />
              <DetailRow icon="🕐" label="TIME" value={event.time ? event.time.substring(0,5) : "TBA"} />
              <DetailRow icon="📍" label="VENUE" value={`${event.venue || "TBA"}${event.city ? `, ${event.city}` : ""}`} />
              <DetailRow icon="🎟" label="CAPACITY" value={`${event.total_tickets || 0} spots total`} />
            </div>

            <div style={{ background:"rgba(124,58,237,0.05)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontSize:"18px" }}>⛓️</span>
              <div>
                <div style={{ fontSize:"11px", fontWeight:700, color:"#7c3aed", marginBottom:"1px" }}>Secured by Polygon Blockchain</div>
                <div style={{ fontSize:"10px", color:"var(--text-muted)" }}>Every ticket is minted as an NFT — cannot be duplicated or faked</div>
              </div>
            </div>
          </div>

          {isDesk && (
            <div style={{ width:"340px", flexShrink:0 }}>
              <TicketCard event={event} isFree={isFree} curr={curr} isLoggedIn={isLoggedIn}
                onAction={isFree ? handleRegister : handleBuy} actionLoading={regLoading} error={error} isDesk={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}