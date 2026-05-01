import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const CATEGORIES = ["music","tech","food","arts","sports","business","other"];
const isDesktop  = () => window.innerWidth > 768;
const mapEvent   = e => ({
  id: e.id, name: e.name, date: e.date, venue: e.venue,
  category: e.category || "other", price: parseFloat(e.price),
  totalTickets: e.total_tickets, ticketsSold: e.tickets_sold,
  salesOpen: e.sales_open, description: e.description || "",
  image: e.image || categoryImages[e.category] || categoryImages.other,
});

const inp = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "var(--bg)", border: "1.5px solid var(--border)",
  borderRadius: "14px", fontSize: "14px", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
  caretColor: "#f5a623",
};
const primaryBtn = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "15px", fontWeight: 700, cursor: "pointer",
  boxShadow: "var(--shadow-brand)", marginBottom: "12px",
  fontFamily: "var(--font-sans)",
};

// ── Event card with blockchain badge ─────────────────────────
function EventCard({ ev, onClick }) {
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
      <div style={{ height: "180px", position: "relative" }}>
        <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.78))" }} />
        {/* Live/Closed badge */}
        <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "#16a34a" : "#6b6b6b", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
          {ev.salesOpen && <div className="pulse" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff" }} />}
          {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
        {/* NFT badge */}
        <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 8px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "3px" }}>
          <span>⛓️</span><span>NFT</span>
        </div>
        <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px", marginBottom: "2px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "11px" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>
            Ghc {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()} earned
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.ticketsSold}/{ev.totalTickets} sold</span>
        </div>
        {/* Mini progress bar */}
        <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: soldPct + "%", background: soldPct > 80 ? "#dc2626" : "linear-gradient(90deg, #f5a623, #e8920f)", borderRadius: "2px", transition: "width 0.5s" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, value, label, color, bg, sub }) {
  return (
    <motion.div whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s" }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: 800, color, letterSpacing: "-0.3px", marginBottom: "2px" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</div>
      {sub && <div style={{ fontSize: "10px", color, marginTop: "3px", fontWeight: 600 }}>{sub}</div>}
    </motion.div>
  );
}

// ── Organizer Dashboard ───────────────────────────────────────
export function OrganizerHome() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setScreen          = useStore(s => s.setScreen);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser        = useStore(s => s.currentUser);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();

  useEffect(() => {
    eventsAPI.myEvents().then(data => {
      if (Array.isArray(data)) setOrgEvents(data.map(mapEvent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalRevenue  = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold     = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const activeEvents  = orgEvents.filter(e => e.salesOpen).length;
  const totalCapacity = orgEvents.reduce((s, e) => s + e.totalTickets, 0);
  const fillRate      = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 60px" : "20px 16px 120px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {desktop && <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>OVERVIEW</div>}
            <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              {desktop ? `Good day, ${currentUser?.first_name} 👋` : "Dashboard"}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "3px" }}>
              {desktop ? "Here's what's happening with your events" : `Welcome back, ${currentUser?.first_name} 👋`}
            </div>
          </div>
          {/* Blockchain live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "99px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", flexShrink: 0 }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed" }}>Polygon Live</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "16px" }} />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <StatCard icon="💰" value={"Ghc " + Math.round(totalRevenue).toLocaleString()} label="Total Revenue" color="#16a34a" bg="rgba(22,163,74,0.08)" sub="95% payout rate" />
            <StatCard icon="🎟️" value={totalSold} label="Tickets Sold" color="#2563eb" bg="rgba(37,99,235,0.08)" sub={fillRate + "% fill rate"} />
            <StatCard icon="🎪" value={activeEvents} label="Active Events" color="#f5a623" bg="rgba(245,166,35,0.08)" sub={orgEvents.length + " total"} />
            <StatCard icon="⛓️" value="5%" label="Platform Fee" color="#7c3aed" bg="rgba(124,58,237,0.08)" sub="95% to you" />
          </div>

          {/* Payout info */}
          <div style={{ background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.18)", borderRadius: "14px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245,166,35,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>💡</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623", marginBottom: "2px" }}>How Payouts Work</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Attendees pay via MoMo or VISA. <span style={{ color: "#16a34a", fontWeight: 700 }}>95% goes to your wallet</span>, 5% platform fee. Withdraw to MoMo anytime from your Wallet tab.
              </div>
            </div>
          </div>

          {/* Blockchain trust for organizers */}
          <div style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", borderRadius: "14px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⛓️</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>Every ticket is an NFT on Polygon</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Zero counterfeit risk. QR codes refresh every 10 seconds. Ownership verified on-chain at the gate.
              </div>
            </div>
          </div>

          {/* Events section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)" }}>
              Your Events
              {orgEvents.length > 0 && <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>({orgEvents.length})</span>}
            </div>
            {desktop && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setScreen("addEvent")}
                style={{ padding: "10px 20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
                + New Event
              </motion.button>
            )}
          </div>

          {orgEvents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 32px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>Create your first event and start selling NFT tickets</div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setScreen("addEvent")}
                style={{ padding: "12px 28px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
                + Create Your First Event
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
              {orgEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── My Events ─────────────────────────────────────────────────
export function OrganizerEvents() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen          = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();

  useEffect(() => {
    eventsAPI.myEvents().then(data => {
      if (Array.isArray(data)) setOrgEvents(data.map(mapEvent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 60px" : "20px 16px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          {desktop && <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>EVENTS</div>}
          <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>My Events</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("addEvent")}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
          + New Event
        </motion.button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ height: "180px" }} />
              <div style={{ padding: "12px 16px" }}>
                <div className="skeleton" style={{ height: "14px", width: "60%", marginBottom: "8px" }} />
                <div className="skeleton" style={{ height: "12px", width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {orgEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Click + New Event to get started</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
              {orgEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Organizer Alerts ──────────────────────────────────────────
export function OrganizerAlerts() {
  const orgEvents = useStore(s => s.orgEvents);
  const desktop   = isDesktop();

  const totalRevenue = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold    = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);

  const alerts = orgEvents.length > 0 ? [
    { icon: "⛓️", color: "#7c3aed", title: "NFT Tickets Active on Polygon",     body: `${totalSold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length > 1 ? "s" : ""}. All ownership records are immutable on-chain.`, time: "Live" },
    { icon: "💰", color: "#16a34a", title: "Revenue Update",                     body: `Your events have generated Ghc ${Math.round(totalRevenue).toLocaleString()} in total revenue at 95% payout rate.`, time: "Just now" },
    { icon: "🎪", color: "#f5a623", title: "Active Events",                      body: `You have ${orgEvents.filter(e => e.salesOpen).length} event${orgEvents.filter(e => e.salesOpen).length !== 1 ? "s" : ""} with ticket sales currently open.`, time: "Today" },
    { icon: "🔒", color: "#2563eb", title: "Security: HMAC QR Active",           body: "All your event QR codes rotate every 10 seconds. Screenshot sharing is cryptographically prevented.", time: "Always on" },
  ] : [
    { icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Create an event and start selling tickets to see your alerts and blockchain confirmations here.", time: "Now" }
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 60px" : "20px 16px 120px" }}>
      {desktop && <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>NOTIFICATIONS</div>}
      <div style={{ marginBottom: "6px", fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Alerts</div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Blockchain confirmations & event activity</div>

      <div style={{ maxWidth: desktop ? "640px" : "100%" }} className="stagger">
        {alerts.map((a, i) => (
          <motion.div key={i} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px", marginBottom: "10px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: a.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `1px solid ${a.color}22` }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "6px" }}>{a.body}</div>
              <div style={{ fontSize: "10px", color: a.color, fontWeight: 600, background: a.color + "12", padding: "2px 8px", borderRadius: "99px", width: "fit-content" }}>{a.time}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security trust footer */}
      <div style={{ marginTop: "20px", padding: "14px 16px", borderRadius: "14px", background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: "12px", maxWidth: desktop ? "640px" : "100%" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⛓️</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>POWERED BY POLYGON BLOCKCHAIN</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>Zero fake tickets. Ownership verified on-chain. Your reputation protected.</div>
        </div>
      </div>
    </div>
  );
}

// ── Add Event ─────────────────────────────────────────────────
export function AddEvent() {
  const addEventForm    = useStore(s => s.addEventForm);
  const setAddEventForm = useStore(s => s.setAddEventForm);
  const handleAddEvent  = useStore(s => s.handleAddEvent);
  const setScreen       = useStore(s => s.setScreen);
  const [imageType, setImageType] = useState("upload");
  const [errors, setErrors]       = useState({});
  const desktop = isDesktop();

  const validate = () => {
    const e = {};
    if (!addEventForm.name?.trim())         e.name         = "Event name is required";
    if (!addEventForm.date)                  e.date         = "Date is required";
    if (!addEventForm.price)                 e.price        = "Ticket price is required";
    if (!addEventForm.totalTickets)          e.totalTickets = "Total tickets is required";
    if (!addEventForm.category)              e.category     = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => { if (validate()) handleAddEvent(); };

  const fields = [
    ["name",         "Event Name",           "text",   "e.g. Afrobeats Night 2026",    true],
    ["subtitle",     "Subtitle",             "text",   "e.g. The biggest night in Accra", false],
    ["date",         "Date",                 "date",   "",                             true],
    ["time",         "Time",                 "time",   "",                             false],
    ["venue",        "Venue",                "text",   "e.g. Accra Sports Stadium",    true],
    ["city",         "City",                 "text",   "e.g. Accra",                   false],
    ["price",        "Ticket Price (Ghc)",   "number", "e.g. 150",                     true],
    ["totalTickets", "Total Tickets",        "number", "e.g. 500",                     true],
    ["description",  "Description",          "text",   "Short description of the event", false],
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)" }}>←</motion.button>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Create Event</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#7c3aed" }}>⛓️</span> NFT tickets auto-minted on Polygon after purchase
          </div>
        </div>
      </div>

      <div style={{ padding: desktop ? "28px 40px" : "16px 16px", maxWidth: desktop ? "800px" : "100%" }}>

        {/* Category */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
            Category <span style={{ color: "var(--error)" }}>*</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map(cat => (
              <motion.div key={cat} whileTap={{ scale: 0.93 }}
                onClick={() => { setAddEventForm({ ...addEventForm, category: cat }); setErrors(p => ({ ...p, category: null })); }}
                style={{ padding: "7px 16px", borderRadius: "99px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "1.5px solid " + (addEventForm.category === cat ? "#f5a623" : errors.category ? "var(--error)" : "var(--border)"), background: addEventForm.category === cat ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: addEventForm.category === cat ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </motion.div>
            ))}
          </div>
          <AnimatePresence>
            {errors.category && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ color: "var(--error)", fontSize: "11px", marginTop: "6px" }}>⚠️ {errors.category}</motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Event Image</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
              <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setImageType(t)}
                style={{ flex: 1, padding: "9px", borderRadius: "11px", textAlign: "center", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "1.5px solid " + (imageType === t ? "#f5a623" : "var(--border)"), background: imageType === t ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: imageType === t ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                {label}
              </motion.div>
            ))}
          </div>
          {imageType === "upload" ? (
            <>
              <input type="file" accept="image/jpeg,image/png,image/webp" id="event-image-upload" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setAddEventForm({ ...addEventForm, image: ev.target.result }); r.readAsDataURL(f); }} />
              <label htmlFor="event-image-upload"
                style={{ display: "block", padding: "24px 16px", background: "var(--bg-card)", border: "2px dashed var(--border)", borderRadius: "14px", textAlign: "center", cursor: "pointer" }}>
                {addEventForm.image?.startsWith("data:") || addEventForm.image?.startsWith("http") ? (
                  <>
                    <img src={addEventForm.image} alt="preview" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                    <div style={{ color: "#16a34a", fontSize: "12px", fontWeight: 700 }}>✅ Image selected · click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Click to upload JPG or PNG</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "3px" }}>Max 5MB</div>
                  </>
                )}
              </label>
            </>
          ) : (
            <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:") ? "" : (addEventForm.image || "")}
              onChange={e => setAddEventForm({ ...addEventForm, image: e.target.value })} style={inp} />
          )}
        </div>

        {/* Fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
          {fields.map(([key, label, type, placeholder, required]) => (
            <div key={key} style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>
                {label} {required && <span style={{ color: "var(--error)" }}>*</span>}
              </div>
              <input type={type} placeholder={placeholder} value={addEventForm[key] || ""}
                onChange={e => { setAddEventForm({ ...addEventForm, [key]: e.target.value }); if (errors[key]) setErrors(p => ({ ...p, [key]: null })); }}
                style={{ ...inp, marginBottom: 0, borderColor: errors[key] ? "var(--error)" : "var(--border)", colorScheme: "light dark" }} />
              <AnimatePresence>
                {errors[key] && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: "var(--error)", fontSize: "11px", marginTop: "4px" }}>⚠️ {errors[key]}</motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* NFT info strip */}
        <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.14)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>⛓️</span>
          <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>
            Each ticket sold will be automatically minted as an NFT on Polygon blockchain
          </span>
        </div>

        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={onSubmit}
          style={{ ...primaryBtn, marginTop: "4px", maxWidth: desktop ? "320px" : "100%", marginBottom: 0 }}>
          🎪 Create Event
        </motion.button>
      </div>
    </div>
  );
}

// ── Event Detail ──────────────────────────────────────────────
export function OrganizerEventDetail() {
  const viewingOrgEvent    = useStore(s => s.viewingOrgEvent);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const toggleSales        = useStore(s => s.toggleSales);
  const generateDoorCode   = useStore(s => s.generateDoorCode);
  const doorStaffInvites   = useStore(s => s.doorStaffInvites);
  const setScreen          = useStore(s => s.setScreen);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [editImageType, setEditImageType] = useState("upload");
  const [copiedCode, setCopiedCode] = useState(null);
  const desktop = isDesktop();

  if (!viewingOrgEvent) return null;
  const ev       = viewingOrgEvent;
  const revenue  = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee      = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites  = doorStaffInvites[ev.id] || [];
  const soldPct  = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  const cover    = ev.image || categoryImages[ev.category] || categoryImages.other;

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const startEdit = () => {
    setEditForm({ name: ev.name, venue: ev.venue, date: ev.date, time: ev.time || "", price: ev.price, description: ev.description || "", image: ev.image || "" });
    setEditing(true);
  };
  const saveEdit = () => { setViewingOrgEvent({ ...ev, ...editForm, price: parseFloat(editForm.price) }); setEditing(false); };

  // ── Edit form ─────────────────────────────────────────────
  if (editing) return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)" }}>←</motion.button>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Edit Event</div>
      </div>
      <div style={{ padding: desktop ? "28px 40px" : "16px", maxWidth: desktop ? "700px" : "100%" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Event Image</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
              <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setEditImageType(t)}
                style={{ flex: 1, padding: "9px", borderRadius: "11px", textAlign: "center", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "1.5px solid " + (editImageType === t ? "#f5a623" : "var(--border)"), background: editImageType === t ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: editImageType === t ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                {label}
              </motion.div>
            ))}
          </div>
          {editImageType === "upload" ? (
            <>
              <input type="file" accept="image/jpeg,image/png,image/webp" id="edit-image-upload" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setEditForm(p => ({ ...p, image: ev.target.result })); r.readAsDataURL(f); }} />
              <label htmlFor="edit-image-upload" style={{ display: "block", padding: "20px", background: "var(--bg-card)", border: "2px dashed var(--border)", borderRadius: "14px", textAlign: "center", cursor: "pointer" }}>
                {editForm.image ? (
                  <><img src={editForm.image} alt="preview" style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} /><div style={{ color: "#16a34a", fontSize: "12px", fontWeight: 700 }}>✅ Click to change</div></>
                ) : (
                  <><div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600 }}>Click to upload new image</div></>
                )}
              </label>
            </>
          ) : (
            <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:") ? "" : (editForm.image || "")}
              onChange={e => setEditForm(p => ({ ...p, image: e.target.value }))} style={inp} />
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
          {[["name","Event Name","text"],["venue","Venue","text"],["date","Date","date"],["time","Time","time"],["price","Ticket Price (Ghc)","number"],["description","Description","text"]].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>{label}</div>
              <input type={type} value={editForm[key] || ""} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                style={{ ...inp, marginBottom: 0, colorScheme: "light dark" }} />
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
          style={{ ...primaryBtn, marginTop: "12px", maxWidth: desktop ? "280px" : "100%", marginBottom: 0 }}>
          💾 Save Changes
        </motion.button>
      </div>
    </div>
  );

  // ── Detail view ────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      {/* Hero */}
      <div style={{ height: desktop ? "280px" : "220px", position: "relative" }}>
        <img src={cover} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.85))" }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ position: "absolute", top: "14px", left: "14px", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "#fff" }}>←</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startEdit}
          style={{ position: "absolute", top: "14px", right: "14px", padding: "7px 16px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          ✏️ Edit
        </motion.button>
        {/* NFT badge on hero */}
        <div style={{ position: "absolute", top: "14px", left: "60px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(6px)", padding: "4px 10px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "10px" }}>⛓️</span>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>NFT EVENT</span>
        </div>
        <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "20px" }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "5px" }}>{(ev.category || "").toUpperCase()}</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: desktop ? "26px" : "20px", marginBottom: "4px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>

      <div style={{ padding: desktop ? "28px 40px" : "16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          {[
            ["Revenue (95%)", "Ghc " + revenue.toLocaleString(), "#16a34a"],
            ["Platform Fee",  "Ghc " + fee.toLocaleString(),     "#dc2626"],
            ["Tickets Sold",  ev.ticketsSold + "/" + ev.totalTickets, "#2563eb"],
            ["Admitted",      (ev.admittedCount || 0) + " people", "#f5a623"],
          ].map(([k, v, c]) => (
            <motion.div key={k} whileHover={{ y: -2 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: c, marginBottom: "2px" }}>{v}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{k}</div>
            </motion.div>
          ))}
        </div>

        {/* Sales progress */}
        <div style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "14px 16px", marginBottom: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Ticket Sales</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: soldPct > 80 ? "#dc2626" : "#16a34a" }}>{soldPct}% sold</span>
          </div>
          <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: soldPct > 80 ? "linear-gradient(90deg,#dc2626,#b91c1c)" : "linear-gradient(90deg,#f5a623,#e8920f)", borderRadius: "3px" }} />
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>{ev.totalTickets - ev.ticketsSold} tickets remaining</div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "10px", marginBottom: "14px" }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => toggleSales(ev.id)}
            style={{ ...primaryBtn, marginBottom: 0, background: ev.salesOpen ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#16a34a,#15803d)" }}>
            {ev.salesOpen ? "⏸ Pause Sales" : "▶ Resume Sales"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setScreen("scanTicket")}
            style={{ ...primaryBtn, marginBottom: 0, background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "none", color: "var(--text-primary)" }}>
            🔍 Scan Tickets at Door
          </motion.button>
        </div>

        {/* Door Staff section */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🚪</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Door Staff Access</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Codes are single-use and expire automatically</div>
            </div>
          </div>

          <motion.button whileHover={{ borderColor: "#f5a623" }} whileTap={{ scale: 0.97 }}
            onClick={() => generateDoorCode(ev.id, ev.name)}
            style={{ width: "100%", padding: "11px", background: "rgba(245,166,35,0.06)", color: "#f5a623", border: "2px dashed rgba(245,166,35,0.3)", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "10px", transition: "border-color 0.2s" }}>
            + Generate Door Staff Code
          </motion.button>

          {invites.length > 0 && (
            <div>
              {invites.map(inv => (
                <motion.div key={inv.code} whileTap={{ scale: 0.98 }}
                  onClick={() => copyCode(inv.code)}
                  style={{ background: inv.used ? "var(--bg-subtle)" : "rgba(245,166,35,0.05)", border: "1px solid " + (inv.used ? "var(--border)" : "rgba(245,166,35,0.2)"), borderRadius: "10px", padding: "10px 14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: inv.used ? "var(--text-muted)" : "#f5a623", fontSize: "14px", letterSpacing: "1px" }}>{inv.code}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", color: inv.used ? "var(--text-muted)" : "#16a34a", fontWeight: 700 }}>{inv.used ? "USED" : "ACTIVE"}</span>
                    {!inv.used && (
                      <span style={{ fontSize: "10px", color: copiedCode === inv.code ? "#16a34a" : "var(--text-muted)", fontWeight: 600 }}>
                        {copiedCode === inv.code ? "Copied!" : "Tap to copy"}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Security note */}
          <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "10px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)" }}>
            <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600, lineHeight: 1.4 }}>
              🔒 Door staff can only scan tickets — they cannot create, transfer, or manage events
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}