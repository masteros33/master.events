import React, { useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

// ── Blockchain status badge ───────────────────────────────────
function NFTBadge({ txHash, tokenId }) {
  const confirmed = !!txHash;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "5px",
      padding: "4px 8px", borderRadius: "8px",
      background: confirmed ? "rgba(124,58,237,0.07)" : "var(--bg-subtle)",
      border: `1px solid ${confirmed ? "rgba(124,58,237,0.2)" : "var(--border)"}`,
    }}>
      <span style={{ fontSize: "10px" }}>⛓️</span>
      <span style={{ fontSize: "10px", fontWeight: 700, color: confirmed ? "#7c3aed" : "var(--text-muted)", letterSpacing: "0.2px" }}>
        {confirmed ? `NFT #${tokenId || "✓"} · Polygon` : "NFT minting..."}
      </span>
      {confirmed && (
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#16a34a", marginLeft: "2px" }} />
      )}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    active:    { bg: "#16a34a", label: "ACTIVE"  },
    resale:    { bg: "#dc2626", label: "RESALE"  },
    redeemed:  { bg: "#6b7280", label: "USED"    },
    transferred: { bg: "#2563eb", label: "SENT"  },
  };
  const s = map[status] || map.active;
  return (
    <div style={{ background: s.bg, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 8px", borderRadius: "99px", letterSpacing: "0.5px" }}>
      {s.label}
    </div>
  );
}

export function AttendeeTickets() {
  const myTickets       = useStore(s => s.myTickets);
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
            id:           t.ticket_id,
            ticket_id:    t.ticket_id,
            event: {
              id:     t.event?.id,
              name:   t.event?.name,
              date:   t.event?.date,
              venue:  t.event?.venue,
              time:   t.event?.time,
              price:  parseFloat(t.event?.price || 0),
              image:  t.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
            },
            qty:          t.quantity,
            quantity:     t.quantity,
            status:       t.status,
            qr_data:      t.qr_data,
            qr_base64:    t.qr_base64   || null,
            dynamic_qr:   t.dynamic_qr  || null,
            qr_image:     t.qr_image
              ? (t.qr_image.startsWith("http") ? t.qr_image : API + t.qr_image)
              : null,
            qr_image_url: t.qr_image_url || null,
            nft_tx_hash:  t.nft_tx_hash  || null,
            nft_token_id: t.nft_token_id || null,
            purchasedAt:  t.created_at
              ? new Date(t.created_at).toLocaleDateString()
              : "Recently",
            owner:      (t.owner?.first_name || "") + " " + (t.owner?.last_name || ""),
            ownerEmail: t.owner?.email,
          }))
        });
      }
    }).catch(() => {});
  }, []);

  // ── Empty state ───────────────────────────────────────────
  if (myTickets.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--bg)", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", boxShadow: "var(--shadow-brand)" }}>🎟️</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>No tickets yet</div>
      <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>Browse events and mint your first NFT ticket</div>
      {/* Trust signal even on empty state */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "99px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
        <span style={{ fontSize: "12px" }}>⛓️</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed" }}>All tickets minted as NFTs on Polygon</span>
      </div>
    </motion.div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 100px" : "16px 16px 100px" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "6px" }}>My Tickets</div>
        {/* Global blockchain status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "12px", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", width: "fit-content" }}>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed" }}>
            {myTickets.filter(t => t.nft_tx_hash).length}/{myTickets.length} NFTs confirmed on Polygon
          </span>
        </div>
      </div>

      <div className="stagger" style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(2, 1fr)" : "1fr", gap: "14px" }}>
        {myTickets.map(t => (
          <motion.div key={t.id}
            whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
            style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>

            {/* Event image */}
            <div style={{ height: "115px", position: "relative" }}>
              <img src={t.event.image} alt={t.event.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%)" }} />

              {/* NFT badge on image */}
              <div style={{ position: "absolute", top: "8px", left: "8px", background: t.nft_tx_hash ? "rgba(124,58,237,0.88)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", padding: "3px 7px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "3px", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span style={{ fontSize: "9px" }}>⛓️</span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", letterSpacing: "0.3px" }}>
                  {t.nft_tx_hash ? "NFT" : "MINTING"}
                </span>
              </div>

              {/* Status */}
              <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                <StatusPill status={t.status} />
              </div>

              {/* Event info overlay */}
              <div style={{ position: "absolute", bottom: "8px", left: "12px", right: "12px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "14px", lineHeight: 1.2, marginBottom: "2px" }}>{t.event.name}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px" }}>📅 {t.event.date} · 📍 {t.event.venue}</div>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "12px 14px" }}>

              {/* Ticket ID + qty */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                  {t.id?.toString().substring(0, 18)}
                </span>
                <span style={{ color: "#f5a623", fontWeight: 700, fontSize: "11px" }}>×{t.qty}</span>
              </div>

              {/* NFT blockchain badge */}
              <div style={{ marginBottom: "10px" }}>
                <NFTBadge txHash={t.nft_tx_hash} tokenId={t.nft_token_id} />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "7px" }}>
                {/* View — always shown, primary action */}
                <motion.button whileTap={{ scale: 0.94 }}
                  onClick={() => { setViewingTicket(t); setScreen("ticketView"); }}
                  style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "11px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  View Ticket
                </motion.button>

                {/* Active: Resell + Send */}
                {t.status === "active" && (
                  <>
                    <motion.button whileTap={{ scale: 0.94 }}
                      onClick={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
                      style={{ flex: 1, padding: "10px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "11px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                      Resell
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.94 }}
                      onClick={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
                      style={{ flex: 1, padding: "10px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "11px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                      Send
                    </motion.button>
                  </>
                )}

                {/* Resale: Cancel listing */}
                {t.status === "resale" && (
                  <motion.button whileTap={{ scale: 0.94 }}
                    onClick={() => handleCancelResale(t.id)}
                    style={{ flex: 1, padding: "10px", background: "var(--error-bg)", color: "var(--error)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "11px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                    Cancel
                  </motion.button>
                )}

                {/* Redeemed: view only */}
                {t.status === "redeemed" && (
                  <div style={{ flex: 1, padding: "10px", background: "var(--bg-subtle)", color: "var(--text-muted)", borderRadius: "11px", fontSize: "11px", fontWeight: 600, textAlign: "center", border: "1px solid var(--border)" }}>
                    Used ✓
                  </div>
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

  const alerts = myTickets.length > 0 ? [
    // Blockchain confirmation alerts first
    ...myTickets
      .filter(t => t.nft_tx_hash)
      .map(t => ({
        icon: "⛓️",
        color: "#7c3aed",
        title: "NFT Confirmed on Polygon",
        body: `Your ticket for ${t.event?.name} has been minted as NFT #${t.nft_token_id || "✓"} on the Polygon blockchain.`,
        time: t.purchasedAt || "Recently",
        txHash: t.nft_tx_hash,
      })),
    // Status alerts
    ...myTickets.map(t => ({
      icon:  t.status === "redeemed" ? "✅" : t.status === "resale" ? "🏷️" : "🎟️",
      color: t.status === "redeemed" ? "#16a34a" : t.status === "resale" ? "#f5a623" : "#2563eb",
      title: t.status === "redeemed" ? "Ticket Used at Event"
           : t.status === "resale"   ? "Listed on Resale Market"
           :                           "NFT Ticket Purchased",
      body: `Your ticket for ${t.event?.name} on ${t.event?.date}.`,
      time: t.purchasedAt || "Recently",
      txHash: null,
    })),
  ] : [{
    icon: "🔔", color: "#f5a623",
    title: "No alerts yet",
    body: "Purchase a ticket and your blockchain confirmations will appear here.",
    time: "Now",
    txHash: null,
  }];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 100px" : "16px 16px 100px" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "6px" }}>Alerts</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Blockchain confirmations & ticket activity</div>
      </div>

      <div className="stagger" style={{ maxWidth: desktop ? "640px" : "100%" }}>
        {alerts.map((a, i) => (
          <motion.div key={i}
            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "14px 16px", marginBottom: "10px", display: "flex", gap: "12px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>

            {/* Icon */}
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: a.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `1px solid ${a.color}25` }}>
              {a.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "3px" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "6px" }}>{a.body}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{a.time}</div>
                {a.txHash && (
                  <a href={`https://polygonscan.com/tx/${a.txHash}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", textDecoration: "none", background: "rgba(124,58,237,0.08)", padding: "3px 8px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.15)" }}>
                    View on chain ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust footer */}
      <div style={{ marginTop: "24px", padding: "14px 16px", borderRadius: "16px", background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: "12px", maxWidth: desktop ? "640px" : "100%" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⛓️</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>POWERED BY POLYGON BLOCKCHAIN</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>All tickets are NFTs. Ownership is permanent, verifiable, and cannot be faked.</div>
        </div>
      </div>
    </div>
  );
}