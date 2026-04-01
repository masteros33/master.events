import React, { useEffect } from "react";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

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
              id: t.event?.id, name: t.event?.name, date: t.event?.date,
              venue: t.event?.venue, time: t.event?.time,
              price: parseFloat(t.event?.price || 0),
              image: t.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
            },
            qty: t.quantity, status: t.status,
            qr_data: t.qr_data, qr_image: t.qr_image,
            purchasedAt: new Date(t.created_at).toLocaleDateString(),
            owner: t.owner?.first_name + " " + t.owner?.last_name,
            ownerEmail: t.owner?.email,
          }))
        });
      }
    }).catch(() => {});
  }, []);

  if (myTickets.length === 0) return (
    <div style={{ background: "#f8f8f6", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🎟️</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: "#1a1a1a", marginBottom: "8px" }}>No tickets yet</div>
      <div style={{ color: "#aaa", fontSize: "14px" }}>Browse events and buy your first ticket</div>
    </div>
  );

  return (
    <div style={{ background: "#f8f8f6", minHeight: "100%", padding: "20px 20px 100px" }}>
      <div style={{ fontWeight: 800, fontSize: "22px", color: "#1a1a1a", marginBottom: "20px", letterSpacing: "-0.3px" }}>My Tickets</div>
      {myTickets.map(t => (
        <div key={t.id} style={{ background: "#fff", borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ height: "120px", position: "relative" }}>
            <img src={t.event.image} alt={t.event.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.72))" }} />
            <div style={{ position: "absolute", bottom: "10px", left: "14px", right: "70px" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>{t.event.name}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", marginTop: "2px" }}>{t.event.date} · {t.event.venue}</div>
            </div>
            {t.status === "resale" && (
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "#e74c3c", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>RESALE</div>
            )}
            {t.status === "redeemed" && (
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "#aaa", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>USED</div>
            )}
            {t.status === "active" && (
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "#27ae60", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>ACTIVE</div>
            )}
          </div>

          <div style={{ padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#bbb", fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px" }}>{t.id?.toString().substring(0, 16)}</span>
              <span style={{ color: "#f5a623", fontWeight: 700, fontSize: "13px" }}>Qty: {t.qty}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setViewingTicket(t); setScreen("ticketView"); }}
                style={{ flex: 1, padding: "11px", background: "#f8f8f6", color: "#f5a623", border: "1.5px solid #f5a623", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                🎟️ View
              </button>
              {t.status === "active" && (
                <button onClick={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
                  style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  🏷️ Resell
                </button>
              )}
              {t.status === "resale" && (
                <button onClick={() => handleCancelResale(t.id)}
                  style={{ flex: 1, padding: "11px", background: "#fff5f5", color: "#e74c3c", border: "1px solid #ffd6d6", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              )}
              {t.status === "active" && (
                <button onClick={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
                  style={{ flex: 1, padding: "11px", background: "#f8f8f6", color: "#6b6b6b", border: "1px solid #f0f0f0", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  📤 Send
                </button>
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

  const alerts = myTickets.length > 0 ? myTickets.map(t => ({
    icon: t.status === "redeemed" ? "✅" : t.status === "resale" ? "🏷️" : "🎟️",
    color: t.status === "redeemed" ? "#27ae60" : t.status === "resale" ? "#f5a623" : "#5dade2",
    title: t.status === "redeemed" ? "Ticket Used" : t.status === "resale" ? "Listed for Resale" : "Ticket Purchased",
    body: `Your ticket for ${t.event?.name} on ${t.event?.date}.`,
    time: t.purchasedAt || "Recently",
  })) : [
    { icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Buy a ticket and your alerts will appear here.", time: "Now" }
  ];

  return (
    <div style={{ background: "#f8f8f6", minHeight: "100%", padding: "20px 20px 100px" }}>
      <div style={{ fontWeight: 800, fontSize: "22px", color: "#1a1a1a", marginBottom: "20px", letterSpacing: "-0.3px" }}>Alerts</div>
      {alerts.map((a, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "12px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: a.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{a.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "4px" }}>{a.title}</div>
            <div style={{ fontSize: "13px", color: "#6b6b6b", lineHeight: 1.6, marginBottom: "6px" }}>{a.body}</div>
            <div style={{ fontSize: "11px", color: "#bbb" }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}