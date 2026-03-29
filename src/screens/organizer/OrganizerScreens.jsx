import React, { useEffect, useState } from "react";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const BG = "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(245,166,35,0.15)";

const darkInput = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,166,35,0.2)",
  borderRadius: "14px", fontSize: "14px", color: "#fff",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623",
};

const darkBtn = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "50px",
  fontSize: "15px", fontWeight: 800, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,166,35,0.35)",
  marginBottom: "12px",
};

const categoryImages = {
  music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech: "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const CATEGORIES = ["music", "tech", "food", "arts", "sports", "business", "other"];

const mapEvent = e => ({
  id: e.id, name: e.name, date: e.date, venue: e.venue,
  category: e.category || "other", price: parseFloat(e.price),
  totalTickets: e.total_tickets, ticketsSold: e.tickets_sold,
  salesOpen: e.sales_open,
  image: e.image || categoryImages[e.category] || categoryImages.other,
});

export function OrganizerHome() {
  const orgEvents = useStore(s => s.orgEvents);
  const setOrgEvents = useStore(s => s.setOrgEvents);
  const setScreen = useStore(s => s.setScreen);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    eventsAPI.myEvents().then(data => {
      if (Array.isArray(data)) setOrgEvents(data.map(mapEvent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalRevenue = orgEvents.reduce((sum, e) => sum + (e.ticketsSold * e.price * 0.95), 0);
  const totalSold = orgEvents.reduce((sum, e) => sum + e.ticketsSold, 0);

  return (
    <div style={{ background: BG, minHeight: "100%", padding: "20px 20px 120px" }}>
      {/* Profile Menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100 }} />
          <div style={{ position: "fixed", top: 0, right: 0, width: "75%", maxWidth: "280px", height: "100%", background: "linear-gradient(160deg, #1e1100 0%, #150c00 100%)", zIndex: 101, padding: "60px 24px 40px", display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(0,0,0,0.5)", borderLeft: "1px solid rgba(245,166,35,0.15)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "12px" }}>👤</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>{currentUser?.email}</div>
            <div onClick={() => { setMenuOpen(false); setScreen("doorStaffLogin"); }} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>🚪</span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Door Staff Access</span>
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", background: "rgba(231,76,60,0.2)", border: "1px solid rgba(231,76,60,0.4)", color: "#ff6b6b", borderRadius: "50px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>LOG OUT</button>
          </div>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "22px", color: "#fff" }}>Dashboard</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Welcome back, {currentUser?.first_name} 👋</div>
        </div>
        {/* Hamburger menu */}
        <div onClick={() => setMenuOpen(true)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer" }}>
          <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
          <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
          <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
        </div>
      </div>
      <div style={{ height: "1px", background: BORDER, margin: "16px 0" }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Total Revenue", value: "Ghc " + Math.round(totalRevenue).toLocaleString(), icon: "💰", color: "#27ae60" },
              { label: "Tickets Sold", value: totalSold, icon: "🎟️", color: "#5dade2" },
              { label: "Active Events", value: orgEvents.filter(e => e.salesOpen).length, icon: "🎪", color: "#f5a623" },
              { label: "Platform Fee", value: "5%", icon: "🔗", color: "#a29bfe" },
            ].map(card => (
              <div key={card.label} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{card.icon}</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "16px", padding: "14px 16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623", marginBottom: "6px" }}>💡 How Payouts Work</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Attendees pay via MoMo or VISA. Paystack splits: <span style={{ color: "#27ae60", fontWeight: 700 }}>95% to your wallet</span>, 5% platform fee.</div>
          </div>

          <div style={{ fontWeight: 800, fontSize: "16px", color: "#fff", marginBottom: "12px" }}>Your Events</div>
          {orgEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎪</div>
              <div>No events yet. Create your first!</div>
            </div>
          )}
          {orgEvents.map(ev => (
            <div key={ev.id} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }}
              style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", marginBottom: "14px", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: "110px", position: "relative" }}>
                <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))" }} />
                <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "#27ae60" : "#555", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px" }}>{ev.salesOpen ? "LIVE" : "CLOSED"}</div>
                <div style={{ position: "absolute", bottom: "10px", left: "12px" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>{ev.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>📍 {ev.venue} · {ev.date}</div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#27ae60", fontWeight: 700 }}>Ghc {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()} revenue</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{ev.ticketsSold} / {ev.totalTickets} sold</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function OrganizerEvents() {
  const orgEvents = useStore(s => s.orgEvents);
  const setOrgEvents = useStore(s => s.setOrgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.myEvents().then(data => {
      if (Array.isArray(data)) setOrgEvents(data.map(mapEvent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100%", padding: "20px 20px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, fontSize: "22px", color: "#fff" }}>My Events</div>
        <button onClick={() => setScreen("addEvent")} style={{ padding: "10px 18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "30px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>+ New</button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
      ) : (
        <>
          {orgEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎪</div>
              <div>No events yet. Create your first!</div>
            </div>
          )}
          {orgEvents.map(ev => (
            <div key={ev.id} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }}
              style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", marginBottom: "14px", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: "140px", position: "relative" }}>
                <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.75))" }} />
                <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "#27ae60" : "#555", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px" }}>{ev.salesOpen ? "LIVE" : "CLOSED"}</div>
                <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.5)", color: "#f5a623", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px" }}>{ev.category}</div>
                <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px", marginBottom: "2px" }}>{ev.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>📍 {ev.venue} · {ev.date}</div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#27ae60", fontWeight: 700 }}>Ghc {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{ev.ticketsSold} / {ev.totalTickets} sold</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function OrganizerAlerts() {
  const currentUser = useStore(s => s.currentUser);
  const orgEvents = useStore(s => s.orgEvents);

  const alerts = orgEvents.length > 0 ? [
    { icon: "💰", color: "#27ae60", title: "Revenue Update", body: `Your events have generated Ghc ${Math.round(orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0)).toLocaleString()} in total revenue.`, time: "Just now" },
    { icon: "🎟️", color: "#5dade2", title: "Tickets Sold", body: `${orgEvents.reduce((s, e) => s + e.ticketsSold, 0)} tickets sold across ${orgEvents.length} events.`, time: "Today" },
    { icon: "🎪", color: "#f5a623", title: "Active Events", body: `You have ${orgEvents.filter(e => e.salesOpen).length} active events with sales open.`, time: "Today" },
  ] : [
    { icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Create an event and start selling tickets to see your alerts here.", time: "Now" },
  ];

  return (
    <div style={{ background: BG, minHeight: "100%", padding: "20px 20px 120px" }}>
      <div style={{ fontWeight: 800, fontSize: "22px", color: "#fff", marginBottom: "20px" }}>Alerts</div>
      {alerts.map((a, i) => (
        <div key={i} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "16px", padding: "16px", marginBottom: "12px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: a.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{a.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "4px" }}>{a.title}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: "6px" }}>{a.body}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AddEvent() {
  const addEventForm = useStore(s => s.addEventForm);
  const setAddEventForm = useStore(s => s.setAddEventForm);
  const handleAddEvent = useStore(s => s.handleAddEvent);
  const setScreen = useStore(s => s.setScreen);

  const fields = [
    ["name", "Event Name *", "text", "e.g. Afrobeats Night 2026"],
    ["subtitle", "Subtitle", "text", "e.g. The biggest night in Accra"],
    ["date", "Date *", "date", ""],
    ["time", "Time *", "time", ""],
    ["venue", "Venue *", "text", "e.g. Accra Sports Stadium"],
    ["city", "City", "text", "e.g. Accra"],
    ["price", "Ticket Price (Ghc) *", "number", "e.g. 150"],
    ["totalTickets", "Total Tickets *", "number", "e.g. 500"],
    ["description", "Description", "text", "Short description of the event"],
  ];

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <button onClick={() => setScreen("app")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</button>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>Create Event</div>
      </div>
      <div style={{ padding: "0 20px" }}>

        {/* Category Selector */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "8px" }}>Category *</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map(cat => (
              <div key={cat} onClick={() => setAddEventForm({ ...addEventForm, category: cat })}
                style={{ padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: 700, border: "2px solid " + (addEventForm.category === cat ? "#f5a623" : "rgba(255,255,255,0.1)"), background: addEventForm.category === cat ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)", color: addEventForm.category === cat ? "#f5a623" : "rgba(255,255,255,0.4)" }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Image URL field */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "8px" }}>Event Image URL (optional)</div>
          <input type="text" placeholder="https://... (leave blank for auto image)" value={addEventForm.image || ""} onChange={e => setAddEventForm({ ...addEventForm, image: e.target.value })} style={darkInput} />
          {addEventForm.category && !addEventForm.image && (
            <div style={{ marginTop: "-10px", marginBottom: "10px" }}>
              <img src={categoryImages[addEventForm.category]} alt="preview" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "12px", opacity: 0.7 }} />
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Auto image for {addEventForm.category}</div>
            </div>
          )}
        </div>

        {fields.map(([key, label, type, placeholder]) => (
          <div key={key} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "8px" }}>{label}</div>
            <input type={type} placeholder={placeholder} value={addEventForm[key] || ""} onChange={e => setAddEventForm({ ...addEventForm, [key]: e.target.value })}
              style={{ ...darkInput, colorScheme: "dark" }} />
          </div>
        ))}

        <button onClick={handleAddEvent} style={{ ...darkBtn, marginTop: "8px" }}>🎪 CREATE EVENT</button>
      </div>
    </div>
  );
}

export function OrganizerEventDetail() {
  const viewingOrgEvent = useStore(s => s.viewingOrgEvent);
  const toggleSales = useStore(s => s.toggleSales);
  const generateDoorCode = useStore(s => s.generateDoorCode);
  const doorStaffInvites = useStore(s => s.doorStaffInvites);
  const setScreen = useStore(s => s.setScreen);
  if (!viewingOrgEvent) return null;
  const ev = viewingOrgEvent;
  const revenue = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites = doorStaffInvites[ev.id] || [];
  const coverImage = ev.image || categoryImages[ev.category] || categoryImages.other;

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ height: "200px", position: "relative" }}>
        <img src={coverImage} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(17,9,0,0.3), rgba(17,9,0,0.85))" }} />
        <button onClick={() => setScreen("app")} style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245,166,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</button>
        <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(245,166,35,0.9)", color: "#000", fontSize: "10px", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px" }}>{ev.category?.toUpperCase()}</div>
        <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px" }}>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: "20px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", marginTop: "4px" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            ["Revenue (95%)", "Ghc " + revenue.toLocaleString(), "#27ae60"],
            ["Platform Fee", "Ghc " + fee.toLocaleString(), "#e74c3c"],
            ["Tickets Sold", ev.ticketsSold + " / " + ev.totalTickets, "#5dade2"],
            ["Admitted", (ev.admittedCount || 0) + " people", "#f5a623"]
          ].map(([k, v, c]) => (
            <div key={k} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{k}</div>
            </div>
          ))}
        </div>

        <button onClick={() => toggleSales(ev.id)} style={{ ...darkBtn, background: ev.salesOpen ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "linear-gradient(135deg,#27ae60,#1e8449)" }}>
          {ev.salesOpen ? "⏸ PAUSE TICKET SALES" : "▶ RESUME TICKET SALES"}
        </button>
        <button onClick={() => setScreen("scanTicket")} style={{ ...darkBtn, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "none", color: "#fff" }}>
          🔍 SCAN TICKETS AT DOOR
        </button>

        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "12px" }}>🚪 Door Staff Access</div>
          <button onClick={() => generateDoorCode(ev.id, ev.name)} style={{ width: "100%", padding: "12px", background: "rgba(245,166,35,0.08)", color: "#f5a623", border: "2px dashed rgba(245,166,35,0.4)", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}>
            + Generate Door Staff Invite Code
          </button>
          {invites.map(inv => (
            <div key={inv.code} style={{ background: inv.used ? "rgba(255,255,255,0.03)" : "rgba(245,166,35,0.06)", border: "1px solid " + (inv.used ? "rgba(255,255,255,0.08)" : "rgba(245,166,35,0.2)"), borderRadius: "10px", padding: "10px 14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: inv.used ? "rgba(255,255,255,0.25)" : "#f5a623", fontSize: "14px" }}>{inv.code}</span>
              <span style={{ fontSize: "11px", color: inv.used ? "rgba(255,255,255,0.25)" : "#27ae60", fontWeight: 600 }}>{inv.used ? "USED" : "ACTIVE"}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(41,128,185,0.1)", border: "1px solid rgba(41,128,185,0.25)", borderRadius: "14px", padding: "14px 16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#5dade2", marginBottom: "6px" }}>ℹ️ How Door Staff Flow Works</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            1. Generate a code above<br />
            2. Share it with your door staff<br />
            3. They go to Login → "Enter with invite code"<br />
            4. They scan tickets at the door
          </div>
        </div>
      </div>
    </div>
  );
}