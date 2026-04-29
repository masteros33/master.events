import React, { useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

export function AttendeeTickets() {
  const myTickets      = useStore(s => s.myTickets);
  const setViewingTicket  = useStore(s => s.setViewingTicket);
  const setScreen         = useStore(s => s.setScreen);
  const setResaleTicket   = useStore(s => s.setResaleTicket);
  const setResalePrice    = useStore(s => s.setResalePrice);
  const setResaleError    = useStore(s => s.setResaleError);
  const setTransferTicket = useStore(s => s.setTransferTicket);
  const setTransferEmail  = useStore(s => s.setTransferEmail);
  const setTransferName   = useStore(s => s.setTransferName);
  const setTransferDone   = useStore(s => s.setTransferDone);
  const handleCancelResale = useStore(s => s.handleCancelResale);
  const desktop = isDesktop();

  useEffect(() => {
    ticketsAPI.myTickets().then(data => {
      if (Array.isArray(data)) {
        useStore.setState({
          myTickets: data.map(t => ({
            id: t.ticket_id, ticket_id: t.ticket_id,
            event: {
              id: t.event?.id, name: t.event?.name, date: t.event?.date,
              venue: t.event?.venue, time: t.event?.time,
              price: parseFloat(t.event?.price || 0),
              image: t.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
            },
            qty: t.quantity, quantity: t.quantity, status: t.status,
            qr_data: t.qr_data, qr_base64: t.qr_base64 || null,
            dynamic_qr: t.dynamic_qr || null,
            qr_image: t.qr_image ? (t.qr_image.startsWith("http") ? t.qr_image : API + t.qr_image) : null,
            qr_image_url: t.qr_image_url || null,
            nft_tx_hash: t.nft_tx_hash || null, nft_token_id: t.nft_token_id || null,
            purchasedAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : "Recently",
            owner: (t.owner?.first_name || "") + " " + (t.owner?.last_name || ""),
            ownerEmail: t.owner?.email,
          }))
        });
      }
    }).catch(() => {});
  }, []);

  if (myTickets.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--bg)", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", boxShadow: "var(--shadow-brand)" }}>🎟️</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>No tickets yet</div>
      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Browse events and buy your first ticket</div>
    </motion.div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 100px" : "20px 20px 100px" }}>
      <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", marginBottom: "20px", letterSpacing: "-0.5px" }}>My Tickets</div>
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(2, 1fr)" : "1fr", gap: "16px" }}>
        {myTickets.map(t => (
          <motion.div key={t.id} whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
            style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
            <div style={{ height: "120px", position: "relative" }}>
              <img src={t.event.image} alt={t.event.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.72))" }} />
              <div style={{ position: "absolute", bottom: "10px", left: "14px", right: "80px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>{t.event.name}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", marginTop: "2px" }}>{t.event.date + " · " + t.event.venue}</div>
              </div>
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                {t.status === "resale"   && <div style={{ background: "#dc2626", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px" }}>RESALE</div>}
                {t.status === "redeemed" && <div style={{ background: "#6b6b6b", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px" }}>USED</div>}
                {t.status === "active"   && <div style={{ background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px" }}>ACTIVE</div>}
              </div>
            </div>
            <div style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px" }}>{t.id?.toString().substring(0, 16)}</span>
                <span style={{ color: "#f5a623", fontWeight: 700, fontSize: "13px" }}>Qty: {t.qty}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setViewingTicket(t); setScreen("ticketView"); }}
                  style={{ flex: 1, padding: "11px", background: "var(--bg-subtle)", color: "#f5a623", border: "1.5px solid #f5a623", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  View
                </motion.button>
                {t.status === "active" && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
                    style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Resell
                  </motion.button>
                )}
                {t.status === "resale" && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancelResale(t.id)}
                    style={{ flex: 1, padding: "11px", background: "var(--error-bg)", color: "var(--error)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Cancel
                  </motion.button>
                )}
                {t.status === "active" && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
                    style={{ flex: 1, padding: "11px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Send
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AttendeeAlerts() {
  const myTickets = useStore(s => s.myTickets);
  const desktop = isDesktop();

  const alerts = myTickets.length > 0 ? myTickets.map(t => ({
    icon: t.status === "redeemed" ? "✅" : t.status === "resale" ? "🏷️" : "🎟️",
    color: t.status === "redeemed" ? "#16a34a" : t.status === "resale" ? "#f5a623" : "#2563eb",
    title: t.status === "redeemed" ? "Ticket Used" : t.status === "resale" ? "Listed for Resale" : "Ticket Purchased",
    body: "Your ticket for " + t.event?.name + " on " + t.event?.date + ".",
    time: t.purchasedAt || "Recently",
  })) : [{ icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Buy a ticket and your alerts will appear here.", time: "Now" }];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 100px" : "20px 20px 100px" }}>
      <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", marginBottom: "20px", letterSpacing: "-0.5px" }}>Alerts</div>
      <div className="stagger" style={{ maxWidth: desktop ? "640px" : "100%" }}>
        {alerts.map((a, i) => (
          <motion.div key={i} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px", marginBottom: "12px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>{a.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "6px" }}>{a.body}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}