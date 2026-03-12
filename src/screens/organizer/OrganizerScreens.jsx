import React from "react";
import useStore from "../../store/useStore";
import { inputStyle, btnStyle } from "../../styles/common";

export function OrganizerHome() {
  const orgEvents = useStore(s => s.orgEvents);
  const handleLogout = useStore(s => s.handleLogout);
  const currentUser = useStore(s => s.currentUser);
  const setScreen = useStore(s => s.setScreen);
  const totalRevenue = orgEvents.reduce((sum, e) => sum + (e.ticketsSold * e.price * 0.95), 0);
  const totalSold = orgEvents.reduce((sum, e) => sum + e.ticketsSold, 0);
  return (
    <div style={{ padding: "20px 20px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "22px", color: "#111" }}>Dashboard</div>
          <div style={{ color: "#888", fontSize: "13px" }}>Welcome back, Organizer 👋</div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div onClick={() => setScreen("doorStaffLogin")} style={{ padding: "8px 14px", background: "#11111111", border: "1px solid #ddd", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "#111", cursor: "pointer" }}>🚪 Door Staff</div>
          <div onClick={handleLogout} style={{ padding: "8px 14px", background: "#e74c3c22", border: "1px solid #e74c3c44", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "#e74c3c", cursor: "pointer" }}>Log Out</div>
        </div>
      </div>
      <div style={{ height: "1px", background: "#f0f0f0", margin: "16px 0" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Revenue", value: "Ghc " + Math.round(totalRevenue).toLocaleString(), icon: "💰", color: "#27ae60" },
          { label: "Tickets Sold", value: totalSold, icon: "🎟️", color: "#2980b9" },
          { label: "Active Events", value: orgEvents.filter(e => e.salesOpen).length, icon: "🎪", color: "#f5a623" },
          { label: "Platform Fee", value: "5%", icon: "🔗", color: "#8e44ad" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>{card.icon}</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff9f0", border: "1px solid #f5a62344", borderRadius: "16px", padding: "14px 16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623", marginBottom: "6px" }}>💡 How Payouts Work</div>
        <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>Attendees pay via MoMo or VISA. Paystack automatically splits: <span style={{ color: "#27ae60", fontWeight: 700 }}>95% to your wallet</span>, 5% platform fee. Withdraw anytime.</div>
      </div>
      <div style={{ fontWeight: 800, fontSize: "16px", color: "#111", marginBottom: "12px" }}>Your Events</div>
      {orgEvents.map(ev => (
        <div key={ev.id} style={{ background: "#fff", borderRadius: "16px", padding: "14px 16px", marginBottom: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#111" }}>{ev.name}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{ev.ticketsSold} sold · Ghc {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ev.salesOpen ? "#27ae60" : "#ccc" }} />
            <span style={{ fontSize: "11px", color: ev.salesOpen ? "#27ae60" : "#aaa", fontWeight: 600 }}>{ev.salesOpen ? "LIVE" : "CLOSED"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrganizerEvents() {
  const orgEvents = useStore(s => s.orgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen = useStore(s => s.setScreen);
  return (
    <div style={{ padding: "20px 20px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, fontSize: "22px", color: "#111" }}>My Events</div>
        <button onClick={() => setScreen("addEvent")} style={{ padding: "10px 18px", background: "#f5a623", color: "#fff", border: "none", borderRadius: "30px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>+ New</button>
      </div>
      {orgEvents.map(ev => (
        <div key={ev.id} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }}
          style={{ background: "#fff", borderRadius: "20px", marginBottom: "14px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", cursor: "pointer" }}>
          <div style={{ height: "90px", background: ev.color || "#f5a623", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "32px" }}>{ev.icon || "🎪"}</div>
            <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "#27ae60" : "#888", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px" }}>{ev.salesOpen ? "LIVE" : "CLOSED"}</div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#111", marginBottom: "4px" }}>{ev.name}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{ev.date} · {ev.venue}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <span style={{ fontSize: "13px", color: "#27ae60", fontWeight: 700 }}>Ghc {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}</span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>{ev.ticketsSold} / {ev.totalTickets} sold</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrganizerAlerts() {
  const alerts = [
    { icon: "💰", color: "#27ae60", bg: "#e8f8ef", title: "New Sale", body: "3 tickets sold for Afrobeats Night. Ghc 285 added to your wallet.", time: "5 mins ago" },
    { icon: "🏦", color: "#2980b9", bg: "#e8f4fd", title: "Payout Processed", body: "Ghc 1,200 withdrawal to MTN MoMo completed successfully.", time: "2 hrs ago" },
    { icon: "📅", color: "#f5a623", bg: "#fff9f0", title: "Event Tomorrow", body: "Tech Summit Ghana is tomorrow. 142 tickets sold, 58 remaining.", time: "8 hrs ago" },
    { icon: "⚠️", color: "#e74c3c", bg: "#fff0f0", title: "Low Tickets", body: "Only 10 tickets left for Gospel Night at Perez Dome.", time: "Yesterday" },
  ];
  return (
    <div style={{ padding: "20px 20px 120px" }}>
      <div style={{ fontWeight: 800, fontSize: "22px", color: "#111", marginBottom: "20px" }}>Alerts</div>
      {alerts.map((a, i) => (
        <div key={i} style={{ background: a.bg, borderRadius: "16px", padding: "16px", marginBottom: "12px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: a.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{a.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "4px" }}>{a.title}</div>
            <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5, marginBottom: "6px" }}>{a.body}</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>{a.time}</div>
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
    ["name", "Event Name", "text", "e.g. Afrobeats Night 2025"],
    ["subtitle", "Subtitle", "text", "e.g. The biggest night in Accra"],
    ["date", "Date", "text", "e.g. Sat, 15 Nov 2025"],
    ["time", "Time", "text", "e.g. 8:00 PM"],
    ["venue", "Venue", "text", "e.g. Accra Sports Stadium"],
    ["price", "Ticket Price (Ghc)", "number", "e.g. 150"],
    ["totalTickets", "Total Tickets", "number", "e.g. 500"],
    ["description", "Description", "text", "Short description of the event"],
  ];
  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <button onClick={() => setScreen("app")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f5a62322", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</button>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#111" }}>Create Event</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        {fields.map(([key, label, type, placeholder]) => (
          <div key={key} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", color: "#777", fontWeight: 600, marginBottom: "8px" }}>{label}</div>
            <input type={type} placeholder={placeholder} value={addEventForm[key] || ""} onChange={e => setAddEventForm({ ...addEventForm, [key]: e.target.value })} style={inputStyle} />
          </div>
        ))}
        <button onClick={handleAddEvent} style={btnStyle}>🎪 CREATE EVENT</button>
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
  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ height: "160px", background: ev.color || "#f5a623", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "52px" }}>{ev.icon || "🎪"}</div>
        <button onClick={() => setScreen("app")} style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,0,0,0.25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: "18px" }}>←</button>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ fontWeight: 800, fontSize: "22px", color: "#111", marginBottom: "4px" }}>{ev.name}</div>
        <div style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>{ev.date} · {ev.venue}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[["Revenue (95%)", "Ghc " + revenue.toLocaleString(), "#27ae60"], ["Platform Fee", "Ghc " + fee.toLocaleString(), "#e74c3c"], ["Tickets Sold", ev.ticketsSold + " / " + ev.totalTickets, "#2980b9"], ["Admitted", (ev.admittedCount || 0) + " people", "#f5a623"]].map(([k, v, c]) => (
            <div key={k} style={{ background: "#fff", borderRadius: "14px", padding: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{k}</div>
            </div>
          ))}
        </div>
        <button onClick={() => toggleSales(ev.id)} style={{ ...btnStyle, background: ev.salesOpen ? "#e74c3c" : "#27ae60", marginBottom: "12px" }}>{ev.salesOpen ? "⏸ PAUSE TICKET SALES" : "▶ RESUME TICKET SALES"}</button>
        <button onClick={() => setScreen("scanTicket")} style={{ ...btnStyle, background: "#111", marginBottom: "20px" }}>🔍 SCAN TICKETS AT DOOR</button>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "12px" }}>🚪 Door Staff Access</div>
          <button onClick={() => generateDoorCode(ev.id)} style={{ width: "100%", padding: "12px", background: "#f5a62322", color: "#f5a623", border: "2px dashed #f5a623", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}>+ Generate Door Staff Invite Code</button>
          {invites.map(inv => (
            <div key={inv.code} style={{ background: inv.used ? "#f5f5f5" : "#fff9f0", border: "1px solid " + (inv.used ? "#ddd" : "#f5a62344"), borderRadius: "10px", padding: "10px 14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: inv.used ? "#aaa" : "#f5a623", fontSize: "14px" }}>{inv.code}</span>
              <span style={{ fontSize: "11px", color: inv.used ? "#aaa" : "#27ae60", fontWeight: 600 }}>{inv.used ? "USED" : "ACTIVE"}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#e8f4fd", borderRadius: "14px", padding: "14px 16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#2980b9", marginBottom: "6px" }}>ℹ️ How Door Staff Flow Works</div>
          <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.6 }}>1. Generate a code above<br/>2. Share it with your door staff<br/>3. They go to Login → "Enter with invite code"<br/>4. They scan tickets at the door</div>
        </div>
      </div>
    </div>
  );
}