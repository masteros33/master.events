import React from "react";
import useStore from "../../store/useStore";
import { btnStyle } from "../../styles/common";

export function AttendeeTickets() {
  const myTickets = useStore(s => s.myTickets);
  const setViewingTicket = useStore(s => s.setViewingTicket);
  const setScreen = useStore(s => s.setScreen);
  const setResaleTicket = useStore(s => s.setResaleTicket);
  const setResalePrice = useStore(s => s.setResalePrice);
  const setResaleError = useStore(s => s.setResaleError);
  const setTransferTicket = useStore(s => s.setTransferTicket);
  const setTransferEmail = useStore(s => s.setTransferEmail);
  const setTransferName = useStore(s => s.setTransferName);
  const setTransferDone = useStore(s => s.setTransferDone);
  const handleCancelResale = useStore(s => s.handleCancelResale);

  if (myTickets.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎟️</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: "#111", marginBottom: "8px" }}>No tickets yet</div>
      <div style={{ color: "#888", fontSize: "14px" }}>Buy a ticket to an event and it will appear here</div>
    </div>
  );

  return (
    <div style={{ padding: "20px 20px 100px" }}>
      <div style={{ fontWeight: 800, fontSize: "22px", color: "#111", marginBottom: "20px" }}>My Tickets</div>
      {myTickets.map(t => (
        <div key={t.id} style={{ background: "#fff", borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ height: "100px", position: "relative" }}>
            {t.event.image ? <img src={t.event.image} alt={t.event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: t.event.color || "#f5a623" }} />}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.7))" }} />
            <div style={{ position: "absolute", bottom: "10px", left: "14px" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "14px" }}>{t.event.name}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>{t.event.date} · {t.event.venue}</div>
            </div>
            {t.status === "resale" && <div style={{ position: "absolute", top: "10px", right: "10px", background: "#e74c3c", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px" }}>FOR RESALE</div>}
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "#888", fontSize: "11px", fontFamily: "monospace" }}>{t.id}</span>
              <span style={{ color: "#888", fontSize: "11px" }}>Qty: {t.qty}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setViewingTicket(t); setScreen("ticketView"); }} style={{ flex: 1, padding: "10px", background: "#f5a62322", color: "#f5a623", border: "none", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>VIEW</button>
              {t.status !== "resale" && <button onClick={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }} style={{ flex: 1, padding: "10px", background: "#f5a623", color: "#fff", border: "none", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>🏷️ RESELL</button>}
              {t.status === "resale" && <button onClick={() => handleCancelResale(t.id)} style={{ flex: 1, padding: "10px", background: "#e74c3c22", color: "#e74c3c", border: "none", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>CANCEL</button>}
              {t.status !== "resale" && <button onClick={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }} style={{ flex: 1, padding: "10px", background: "#11111111", color: "#111", border: "2px solid #111", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>📤 SEND</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AttendeeAlerts() {
  const alerts = [
    { icon: "✅", color: "#27ae60", bg: "#e8f8ef", title: "Purchase Confirmed", body: "Your ticket for Afrobeats Night is confirmed. NFT minted to your wallet.", time: "2 mins ago" },
    { icon: "📤", color: "#2980b9", bg: "#e8f4fd", title: "Transfer Complete", body: "Your ticket was successfully transferred to Kwame Mensah.", time: "1 hr ago" },
    { icon: "🏷️", color: "#f5a623", bg: "#fff9f0", title: "Resale Listed", body: "Your ticket for Tech Summit is now listed on the resale market.", time: "3 hrs ago" },
    { icon: "🔔", color: "#8e44ad", bg: "#f4eaff", title: "New Event Nearby", body: "Gospel Concert at Perez Dome is happening this Sunday. Tickets from Ghc 60.", time: "Yesterday" },
  ];
  return (
    <div style={{ padding: "20px 20px 100px" }}>
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