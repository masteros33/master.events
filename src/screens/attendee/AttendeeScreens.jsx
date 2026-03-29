import React, { useEffect } from "react";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const BG = "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(245,166,35,0.15)";

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

  useEffect(() => {
    ticketsAPI.myTickets().then(data => {
      if (Array.isArray(data)) {
        useStore.setState({
          myTickets: data.map(t => ({
            id: t.ticket_id,
            event: {
              id: t.event?.id,
              name: t.event?.name,
              date: t.event?.date,
              venue: t.event?.venue,
              price: parseFloat(t.event?.price || 0),
              image: t.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
              color: "#f5a623",
            },
            qty: t.quantity,
            status: t.status,
            qr_data: t.qr_data,
            qr_image: t.qr_image,
            purchasedAt: new Date(t.created_at).toLocaleDateString(),
            owner: t.owner?.first_name + " " + t.owner?.last_name,
            ownerEmail: t.owner?.email,
          }))
        });
      }
    }).catch(() => {});
  }, []);

  if (myTickets.length === 0) return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎟️</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: "#fff", marginBottom: "8px" }}>No tickets yet</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Buy a ticket to an event and it will appear here</div>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100%", padding: "20px 20px 100px" }}>
      <div style={{ fontWeight: 800, fontSize: "22px", color: "#fff", marginBottom: "20px" }}>My Tickets</div>
      {myTickets.map(t => (
        <div key={t.id} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <div style={{ height: "100px", position: "relative" }}>
            {t.event.image
              ? <img src={t.event.image} alt={t.event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: "#f5a623" }} />
            }
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.8))" }} />
            <div style={{ position: "absolute", bottom: "10px", left: "14px" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "14px" }}>{t.event.name}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{t.event.date} · {t.event.venue}</div>
            </div>
            {t.status === "resale" && (
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "#e74c3c", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px" }}>FOR RESALE</div>
            )}
            {t.status === "redeemed" && (
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "#555", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px" }}>USED</div>
            )}
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontFamily: "monospace" }}>{t.id}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>Qty: {t.qty}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setViewingTicket(t); setScreen("ticketView"); }}
                style={{ flex: 1, padding: "10px", background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>VIEW</button>
              {t.status === "active" && (
                <button onClick={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
                  style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>🏷️ RESELL</button>
              )}
              {t.status === "resale" && (
                <button onClick={() => handleCancelResale(t.id)}
                  style={{ flex: 1, padding: "10px", background: "rgba(231,76,60,0.15)", color: "#ff6b6b", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
              )}
              {t.status === "active" && (
                <button onClick={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
                  style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "30px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>📤 SEND</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export function AttendeeAlerts() {
  const myTickets = useStore(s => s.myTickets);
  const currentUser = useStore(s => s.currentUser);

  const alerts = myTickets.length > 0 ? myTickets.map((t, i) => ({
    icon: t.status === "redeemed" ? "✅" : t.status === "resale" ? "🏷️" : "🎟️",
    color: t.status === "redeemed" ? "#27ae60" : t.status === "resale" ? "#f5a623" : "#5dade2",
    title: t.status === "redeemed" ? "Ticket Used" : t.status === "resale" ? "Listed for Resale" : "Ticket Purchased",
    body: `Your ticket for ${t.event?.name} on ${t.event?.date}.`,
    time: t.purchasedAt || "Recently",
  })) : [
    { icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Buy a ticket to an event and your alerts will appear here.", time: "Now" }
  ];

  return (
    <div style={{ background: BG, minHeight: "100%", padding: "20px 20px 100px" }}>
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