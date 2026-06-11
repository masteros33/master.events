import React, { useEffect } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

function StatusPill({ status }) {
  const map = {
    active:      { bg: "#16a34a", label: "ACTIVE"  },
    resale:      { bg: "#dc2626", label: "RESALE"  },
    redeemed:    { bg: "#6b7280", label: "USED"    },
    transferred: { bg: "#2563eb", label: "SENT"    },
  };
  const s = map[status] || map.active;
  return (
    <div style={{ background: s.bg, color: "#fff", fontSize: "8px", fontWeight: 700, padding: "3px 7px", borderRadius: "99px", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
      {s.label}
    </div>
  );
}

// ── Compact NFT Ticket Card ───────────────────────────────────
function TicketCard({ t, onView, onResell, onSend, onCancel }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        overflow: "hidden",
        border: hovered ? "1px solid rgba(245,166,35,0.4)" : "1px solid var(--border)",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.12)" : "var(--shadow-sm)",
      }}>

      {/* Event image — 16:9 */}
      <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
        <img
          src={t.event.image}
          alt={t.event.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.65) 100%)" }} />

        {/* NFT badge top-left */}
        <div style={{ position: "absolute", top: "8px", left: "8px", background: t.nft_tx_hash ? "rgba(124,58,237,0.88)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", padding: "2px 7px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "3px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: "8px" }}>⛓️</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>
            {t.nft_tx_hash ? `NFT #${t.nft_token_id || "✓"}` : "MINTING"}
          </span>
          {t.nft_tx_hash && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4ade80", marginLeft: "1px" }} />}
        </div>

        {/* Status top-right */}
        <div style={{ position: "absolute", top: "8px", right: "8px" }}>
          <StatusPill status={t.status} />
        </div>

        {/* Event name overlay bottom */}
        <div style={{ position: "absolute", bottom: "8px", left: "10px", right: "10px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "12px", lineHeight: 1.25, marginBottom: "2px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {t.event.name}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "10px 12px 12px" }}>

        {/* Date + venue */}
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
          📅 {t.event.date} · 📍 {t.event.venue}
        </div>

        {/* Ticket ID badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "6px", padding: "3px 7px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.3px" }}>
              {(t.ticket_id || t.id || "").toString().slice(0, 16).toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--brand)" }}>×{t.qty}</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          <motion.button whileTap={{ scale: 0.94 }} onClick={onView}
            style={{ flex: 2, padding: "8px 6px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "9px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
            View Ticket
          </motion.button>

          {t.status === "active" && (
            <>
              <motion.button whileTap={{ scale: 0.94 }} onClick={onResell}
                style={{ flex: 1, padding: "8px 4px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "9px", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Resell
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} onClick={onSend}
                style={{ flex: 1, padding: "8px 4px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "9px", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Send
              </motion.button>
            </>
          )}

          {t.status === "resale" && (
            <motion.button whileTap={{ scale: 0.94 }} onClick={onCancel}
              style={{ flex: 1, padding: "8px 4px", background: "var(--error-bg)", color: "var(--error)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "9px", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              Cancel
            </motion.button>
          )}

          {t.status === "redeemed" && (
            <div style={{ flex: 1, padding: "8px 4px", background: "var(--bg-subtle)", color: "var(--text-muted)", borderRadius: "9px", fontSize: "10px", fontWeight: 600, textAlign: "center", border: "1px solid var(--border)" }}>
              Used ✓
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AttendeeTickets() {
  const myTickets        = useStore(s => s.myTickets);
  const setViewingTicket = useStore(s => s.setViewingTicket);
  const setScreen        = useStore(s => s.setScreen);
  const setResaleTicket  = useStore(s => s.setResaleTicket);
  const setResalePrice   = useStore(s => s.setResalePrice);
  const setResaleError   = useStore(s => s.setResaleError);
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

  if (myTickets.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--bg)", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", boxShadow: "var(--shadow-brand)" }}>🎟️</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>No tickets yet</div>
      <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>Browse events and mint your first NFT ticket</div>
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "12px", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", width: "fit-content" }}>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed" }}>
            {myTickets.filter(t => t.nft_tx_hash).length}/{myTickets.length} NFTs confirmed on Polygon
          </span>
        </div>
      </div>

      {/* ── Desktop: 3-column grid ── Mobile: 1-column ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr",
        gap: desktop ? "20px" : "14px",
      }}>
        {myTickets.map(t => (
          <TicketCard
            key={t.id}
            t={t}
            onView={() => { setViewingTicket(t); setScreen("ticketView"); }}
            onResell={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            onSend={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            onCancel={() => handleCancelResale(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function AttendeeAlerts() {
  const myTickets        = useStore(s => s.myTickets);
  const setViewingTicket = useStore(s => s.setViewingTicket);
  const setScreen        = useStore(s => s.setScreen);
  const desktop          = isDesktop();

  const alerts = myTickets.length > 0 ? [
    ...myTickets.filter(t => t.nft_tx_hash).map(t => ({
      icon: "⛓️", color: "#7c3aed",
      title: "NFT Confirmed on Polygon",
      body:  `Your ticket for ${t.event?.name} has been minted on the Polygon blockchain.`,
      time: t.purchasedAt || "Recently", txHash: t.nft_tx_hash, ticket: t,
    })),
    ...myTickets.map(t => ({
      icon:  t.status === "redeemed" ? "✅" : t.status === "resale" ? "🏷️" : "🎟️",
      color: t.status === "redeemed" ? "#16a34a" : t.status === "resale" ? "#f5a623" : "#2563eb",
      title: t.status === "redeemed" ? "Ticket Used at Event" : t.status === "resale" ? "Listed on Resale Market" : "NFT Ticket Purchased",
      body:  `Your ticket for ${t.event?.name} on ${t.event?.date} at ${t.event?.venue}.`,
      time: t.purchasedAt || "Recently", txHash: null, ticket: t,
    })),
  ] : [{
    icon: "🔔", color: "#f5a623",
    title: "No alerts yet",
    body:  "Purchase a ticket and your blockchain confirmations will appear here.",
    time: "Now", txHash: null, ticket: null,
  }];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "32px 40px 100px" : "16px 16px 100px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "6px" }}>Alerts</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Blockchain confirmations & ticket activity</div>
      </div>
      <div style={{ maxWidth: desktop ? "640px" : "100%" }}>
        {alerts.map((a, i) => (
          <motion.div key={i} whileHover={{ y: -2 }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "14px 16px", marginBottom: "10px", display: "flex", gap: "12px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: a.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `1px solid ${a.color}25` }}>
              {a.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "3px" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "8px" }}>{a.body}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{a.time}</div>
                {a.ticket?.ticket_id && (
                  <motion.div whileTap={{ scale: 0.95 }} onClick={() => { setViewingTicket(a.ticket); setScreen("ticketView"); }}
                    style={{ fontSize: "10px", fontWeight: 700, color: "#f5a623", cursor: "pointer", background: "rgba(245,166,35,0.08)", padding: "3px 8px", borderRadius: "99px", border: "1px solid rgba(245,166,35,0.2)" }}>
                    View Ticket →
                  </motion.div>
                )}
                {a.txHash && (
                  <a href={`https://amoy.polygonscan.com/tx/${a.txHash}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", textDecoration: "none", background: "rgba(124,58,237,0.08)", padding: "3px 8px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.15)" }}>
                    Verify on Amoy ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: "24px", padding: "14px 16px", borderRadius: "16px", background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: "12px", maxWidth: desktop ? "640px" : "100%" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⛓️</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>POWERED BY POLYGON AMOY TESTNET</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>All tickets are NFTs. Ownership is permanent, verifiable, and cannot be faked.</div>
        </div>
      </div>
    </div>
  );
}