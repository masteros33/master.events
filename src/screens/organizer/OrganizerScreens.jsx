import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

const CATEGORIES = ["music", "tech", "food", "arts", "sports", "business", "other"];
const isDesktop = () => window.innerWidth > 768;
const mapEvent = e => ({
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

function EventCard({ ev, onClick }) {
  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
      <div style={{ height: "180px", position: "relative" }}>
        <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.75))" }} />
        <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "#16a34a" : "#6b6b6b", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
          {ev.salesOpen && <div className="pulse" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff" }} />}
          {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
        <div style={{ position: "absolute", top: "10px", left: "10px", background: "#f5a623", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px" }}>{ev.category}</div>
        <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px", marginBottom: "2px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>Ghc {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}</span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{ev.ticketsSold}/{ev.totalTickets} sold</span>
      </div>
    </motion.div>
  );
}

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

  const totalRevenue = orgEvents.reduce((sum, e) => sum + (e.ticketsSold * e.price * 0.95), 0);
  const totalSold    = orgEvents.reduce((sum, e) => sum + e.ticketsSold, 0);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 60px" : "20px 20px 120px" }}>
      {!desktop && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontWeight: 900, fontSize: "22px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Dashboard</div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>Welcome back, {currentUser?.first_name} 👋</div>
        </div>
      )}
      {desktop && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>OVERVIEW</div>
          <div style={{ fontWeight: 900, fontSize: "28px", color: "var(--text-primary)", letterSpacing: "-0.8px" }}>Good day, {currentUser?.first_name} 👋</div>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Here's what's happening with your events</div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "16px" }} />)}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
            {[
              { label: "Total Revenue", value: "Ghc " + Math.round(totalRevenue).toLocaleString(), icon: "💰", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
              { label: "Tickets Sold",  value: totalSold,                                           icon: "🎟️", color: "#2563eb", bg: "rgba(37,99,235,0.08)" },
              { label: "Active Events", value: orgEvents.filter(e => e.salesOpen).length,           icon: "🎪", color: "#f5a623", bg: "rgba(245,166,35,0.08)" },
              { label: "Platform Fee",  value: "5%",                                                icon: "⛓️", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
            ].map(card => (
              <motion.div key={card.label} whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "12px" }}>{card.icon}</div>
                <div style={{ fontSize: desktop ? "24px" : "20px", fontWeight: 800, color: card.color, letterSpacing: "-0.3px" }}>{card.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "16px", padding: "14px 20px", marginBottom: "28px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623", marginBottom: "4px" }}>💡 How Payouts Work</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Attendees pay via MoMo or VISA. <span style={{ color: "#16a34a", fontWeight: 700 }}>95% goes to your wallet</span>, 5% platform fee. Withdraw anytime.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)" }}>Your Events</div>
            {desktop && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setScreen("addEvent")}
                style={{ padding: "10px 20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
                + New Event
              </motion.button>
            )}
          </div>

          {orgEvents.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 40px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "14px" }}>Create your first event to get started</div>
            </motion.div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
            {orgEvents.map(ev => (
              <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 60px" : "20px 20px 120px" }}>
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
            <div key={i} style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
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
          {orgEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 40px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "14px" }}>Click + New Event to get started</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
            {orgEvents.map(ev => (
              <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrganizerAlerts() {
  const orgEvents = useStore(s => s.orgEvents);
  const desktop = isDesktop();
  const alerts = orgEvents.length > 0 ? [
    { icon: "💰", color: "#16a34a", title: "Revenue Update",  body: "Your events have generated Ghc " + Math.round(orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0)).toLocaleString() + " in total revenue.", time: "Just now" },
    { icon: "🎟️", color: "#2563eb", title: "Tickets Sold",   body: orgEvents.reduce((s, e) => s + e.ticketsSold, 0) + " tickets sold across " + orgEvents.length + " events.", time: "Today" },
    { icon: "🎪", color: "#f5a623", title: "Active Events",   body: "You have " + orgEvents.filter(e => e.salesOpen).length + " active events with sales open.", time: "Today" },
  ] : [{ icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Create an event and start selling tickets to see your alerts here.", time: "Now" }];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 60px" : "20px 20px 120px" }}>
      {desktop && <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>NOTIFICATIONS</div>}
      <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", marginBottom: "20px", letterSpacing: "-0.5px" }}>Alerts</div>
      <div style={{ maxWidth: desktop ? "640px" : "100%" }} className="stagger">
        {alerts.map((a, i) => (
          <motion.div key={i} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "18px", marginBottom: "12px", display: "flex", gap: "16px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "4px" }}>{a.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "6px" }}>{a.body}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AddEvent() {
  const addEventForm    = useStore(s => s.addEventForm);
  const setAddEventForm = useStore(s => s.setAddEventForm);
  const handleAddEvent  = useStore(s => s.handleAddEvent);
  const setScreen       = useStore(s => s.setScreen);
  const [imageType, setImageType] = useState("upload");
  const desktop = isDesktop();

  const fields = [
    ["name",         "Event Name *",         "text",   "e.g. Afrobeats Night 2026"],
    ["subtitle",     "Subtitle",             "text",   "e.g. The biggest night in Accra"],
    ["date",         "Date *",               "date",   ""],
    ["time",         "Time *",               "time",   ""],
    ["venue",        "Venue *",              "text",   "e.g. Accra Sports Stadium"],
    ["city",         "City",                 "text",   "e.g. Accra"],
    ["price",        "Ticket Price (Ghc) *", "number", "e.g. 150"],
    ["totalTickets", "Total Tickets *",      "number", "e.g. 500"],
    ["description",  "Description",          "text",   "Short description of the event"],
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "38px", height: "38px", borderRadius: "12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", color: "var(--text-primary)" }}>←</motion.button>
        <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>Create Event</div>
      </div>

      <div style={{ padding: desktop ? "32px 40px" : "20px", maxWidth: desktop ? "800px" : "100%" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "10px" }}>Category *</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map(cat => (
              <motion.div key={cat} whileTap={{ scale: 0.93 }}
                onClick={() => setAddEventForm({ ...addEventForm, category: cat })}
                style={{ padding: "8px 18px", borderRadius: "99px", cursor: "pointer", fontSize: "13px", fontWeight: 600, border: "1.5px solid " + (addEventForm.category === cat ? "#f5a623" : "var(--border)"), background: addEventForm.category === cat ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: addEventForm.category === cat ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "10px" }}>Event Image</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
              <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setImageType(t)}
                style={{ flex: 1, padding: "10px", borderRadius: "12px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, border: "1.5px solid " + (imageType === t ? "#f5a623" : "var(--border)"), background: imageType === t ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: imageType === t ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                {label}
              </motion.div>
            ))}
          </div>
          {imageType === "upload" ? (
            <div>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" id="event-image-upload" style={{ display: "none" }}
                onChange={e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => setAddEventForm({ ...addEventForm, image: ev.target.result }); reader.readAsDataURL(file); }} />
              <label htmlFor="event-image-upload"
                style={{ display: "block", padding: "28px 20px", background: "var(--bg-card)", border: "2px dashed var(--border)", borderRadius: "16px", textAlign: "center", cursor: "pointer" }}>
                {addEventForm.image?.startsWith("data:") || addEventForm.image?.startsWith("http") ? (
                  <div>
                    <img src={addEventForm.image} alt="preview" style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }} />
                    <div style={{ color: "#16a34a", fontSize: "13px", fontWeight: 700 }}>✅ Image selected — click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>📷</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>Click to upload JPG or PNG</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Max 5MB</div>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:") ? "" : (addEventForm.image || "")}
              onChange={e => setAddEventForm({ ...addEventForm, image: e.target.value })} style={inp} />
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
          {fields.map(([key, label, type, placeholder]) => (
            <div key={key} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>{label}</div>
              <input type={type} placeholder={placeholder} value={addEventForm[key] || ""}
                onChange={e => setAddEventForm({ ...addEventForm, [key]: e.target.value })}
                style={{ ...inp, marginBottom: 0, colorScheme: "light dark" }} />
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={handleAddEvent}
          style={{ ...primaryBtn, marginTop: "16px", maxWidth: desktop ? "320px" : "100%" }}>
          🎪 Create Event
        </motion.button>
      </div>
    </div>
  );
}

export function OrganizerEventDetail() {
  const viewingOrgEvent    = useStore(s => s.viewingOrgEvent);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const toggleSales        = useStore(s => s.toggleSales);
  const generateDoorCode   = useStore(s => s.generateDoorCode);
  const doorStaffInvites   = useStore(s => s.doorStaffInvites);
  const setScreen          = useStore(s => s.setScreen);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editImageType, setEditImageType] = useState("upload");
  const desktop = isDesktop();

  if (!viewingOrgEvent) return null;
  const ev = viewingOrgEvent;
  const revenue = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee     = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites = doorStaffInvites[ev.id] || [];
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  const coverImage = ev.image || categoryImages[ev.category] || categoryImages.other;

  const startEdit = () => {
    setEditForm({ name: ev.name, venue: ev.venue, date: ev.date, time: ev.time, price: ev.price, description: ev.description || "", image: ev.image || "" });
    setEditing(true);
  };
  const saveEdit = () => { setViewingOrgEvent({ ...ev, ...editForm, price: parseFloat(editForm.price) }); setEditing(false); };

  if (editing) return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)}
          style={{ width: "38px", height: "38px", borderRadius: "12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", color: "var(--text-primary)" }}>←</motion.button>
        <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>Edit Event</div>
      </div>
      <div style={{ padding: desktop ? "32px 40px" : "20px", maxWidth: desktop ? "700px" : "100%" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "10px" }}>Event Image</div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
              <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setEditImageType(t)}
                style={{ flex: 1, padding: "10px", borderRadius: "12px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, border: "1.5px solid " + (editImageType === t ? "#f5a623" : "var(--border)"), background: editImageType === t ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: editImageType === t ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                {label}
              </motion.div>
            ))}
          </div>
          {editImageType === "upload" ? (
            <div>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" id="edit-image-upload" style={{ display: "none" }}
                onChange={e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => setEditForm({ ...editForm, image: ev.target.result }); reader.readAsDataURL(file); }} />
              <label htmlFor="edit-image-upload" style={{ display: "block", padding: "24px 20px", background: "var(--bg-card)", border: "2px dashed var(--border)", borderRadius: "16px", textAlign: "center", cursor: "pointer" }}>
                {editForm.image ? (
                  <div><img src={editForm.image} alt="preview" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }} /><div style={{ color: "#16a34a", fontSize: "13px", fontWeight: 700 }}>✅ Click to change image</div></div>
                ) : (
                  <div><div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Click to upload new image</div></div>
                )}
              </label>
            </div>
          ) : (
            <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:") ? "" : (editForm.image || "")}
              onChange={e => setEditForm({ ...editForm, image: e.target.value })} style={inp} />
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
          {[["name","Event Name","text"],["venue","Venue","text"],["date","Date","date"],["time","Time","time"],["price","Ticket Price (Ghc)","number"],["description","Description","text"]].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>{label}</div>
              <input type={type} value={editForm[key] || ""} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} style={{ ...inp, marginBottom: 0, colorScheme: "light dark" }} />
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
          style={{ ...primaryBtn, marginTop: "16px", maxWidth: desktop ? "280px" : "100%" }}>
          💾 Save Changes
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>
      <div style={{ height: desktop ? "280px" : "220px", position: "relative" }}>
        <img src={coverImage} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.82))" }} />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setScreen("app")}
          style={{ position: "absolute", top: "16px", left: "16px", width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px" }}>←</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={startEdit}
          style={{ position: "absolute", top: "16px", right: "16px", padding: "8px 18px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "20px", color: "#111", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          ✏️ Edit
        </motion.button>
        <div style={{ position: "absolute", bottom: "20px", left: "24px", right: "24px" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "6px" }}>{(ev.category || "").toUpperCase()}</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: desktop ? "28px" : "20px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginTop: "4px" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>

      <div style={{ padding: desktop ? "32px 40px" : "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {[["Revenue (95%)", "Ghc " + revenue.toLocaleString(), "#16a34a"], ["Platform Fee", "Ghc " + fee.toLocaleString(), "#dc2626"], ["Tickets Sold", ev.ticketsSold + " / " + ev.totalTickets, "#2563eb"], ["Admitted", (ev.admittedCount || 0) + " people", "#f5a623"]].map(([k, v, c]) => (
            <motion.div key={k} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{k}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "16px", marginBottom: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Ticket Sales</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: soldPct > 80 ? "#dc2626" : "#16a34a" }}>{soldPct}% sold</span>
          </div>
          <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: soldPct > 80 ? "linear-gradient(90deg,#dc2626,#b91c1c)" : "linear-gradient(90deg,#f5a623,#e8920f)", borderRadius: "3px" }} />
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>{ev.totalTickets - ev.ticketsSold} tickets remaining</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: "20px" }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => toggleSales(ev.id)}
            style={{ ...primaryBtn, marginBottom: 0, background: ev.salesOpen ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#16a34a,#15803d)" }}>
            {ev.salesOpen ? "⏸ Pause Ticket Sales" : "▶ Resume Ticket Sales"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setScreen("scanTicket")}
            style={{ ...primaryBtn, marginBottom: 0, background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "none", color: "var(--text-primary)" }}>
            🔍 Scan Tickets at Door
          </motion.button>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "14px" }}>🚪 Door Staff Access</div>
          <motion.button whileHover={{ borderColor: "#f5a623" }} whileTap={{ scale: 0.97 }}
            onClick={() => generateDoorCode(ev.id, ev.name)}
            style={{ width: "100%", padding: "12px", background: "rgba(245,166,35,0.06)", color: "#f5a623", border: "2px dashed rgba(245,166,35,0.3)", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "12px", transition: "border-color 0.2s" }}>
            + Generate Door Staff Invite Code
          </motion.button>
          {invites.map(inv => (
            <div key={inv.code}
              style={{ background: inv.used ? "var(--bg-subtle)" : "rgba(245,166,35,0.05)", border: "1px solid " + (inv.used ? "var(--border)" : "rgba(245,166,35,0.2)"), borderRadius: "10px", padding: "10px 14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: inv.used ? "var(--text-muted)" : "#f5a623", fontSize: "14px" }}>{inv.code}</span>
              <span style={{ fontSize: "11px", color: inv.used ? "var(--text-muted)" : "#16a34a", fontWeight: 600 }}>{inv.used ? "USED" : "ACTIVE"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}