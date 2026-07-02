import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API    = "https://master-events-backend.onrender.com";
const BRAND  = "#F97316";
const BRAND_D = "#EA6C0A";
const GREEN  = "#22c55e";
const PURPLE = "#8b5cf6";
const RED    = "#ef4444";
const BLUE   = "#3b82f6";
const FONT   = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO   = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const T = {
  bg:     "var(--bg)",
  card:   "var(--bg-card)",
  border: "var(--border)",
  text:   "var(--text-primary)",
  sub:    "var(--text-secondary)",
  muted:  "var(--text-muted)",
  subtle: "var(--bg-subtle)",
  shadow: "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.04)",
};

const isDesktop = () => window.innerWidth > 768;

function StatusPill({ status }) {
  const map = {
    active:      { bg: GREEN,  label: "ACTIVE"      },
    resale:      { bg: BRAND,  label: "FOR SALE"    },
    redeemed:    { bg: "#6b7280", label: "USED"     },
    transferred: { bg: BLUE,   label: "TRANSFERRED" },
  };
  const s = map[status] || map.active;
  return (
    <div style={{ background: s.bg + "18", color: s.bg, border: `1px solid ${s.bg}30`, fontSize: "8px", fontWeight: 700, padding: "3px 8px", borderRadius: "99px", letterSpacing: "0.5px", whiteSpace: "nowrap", fontFamily: MONO }}>
      {s.label}
    </div>
  );
}

function TicketCard({ t, onView, onResell, onSend, onCancel }) {
  const [hovered, setHovered] = useState(false);
  const desktop = isDesktop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card, borderRadius: "20px", overflow: "hidden",
        border: hovered ? `1px solid ${BRAND}50` : `1px solid ${T.border}`,
        transition: "all 0.22s ease",
        transform: hovered && desktop ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.12),0 0 0 1px ${BRAND}20` : T.shadow,
      }}>

      {/* Cover image */}
      <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
        <motion.img
          src={t.event.image} alt={t.event.name}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.4 }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.04) 0%,rgba(0,0,0,0.68) 100%)" }} />

        {/* NFT badge */}
        <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", alignItems: "center", gap: "4px", background: t.nft_tx_hash ? "rgba(139,92,246,0.88)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", padding: "3px 8px", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.12)" }}>
          <span style={{ fontSize: "8px" }}>⛓️</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: MONO }}>
            {t.nft_tx_hash ? `NFT #${t.nft_token_id || "✓"}` : "MINTING"}
          </span>
          {t.nft_tx_hash && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4ade80", marginLeft: "1px" }} />}
        </div>

        {/* Status */}
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          <StatusPill status={t.status} />
        </div>

        {/* Event name */}
        <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {t.event.name}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: "10px", color: T.muted, marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: MONO }}>
          📅 {t.event.date} · 📍 {t.event.venue}
        </div>

        {/* Ticket ID + qty */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "6px", padding: "4px 8px" }}>
            <span style={{ fontFamily: MONO, fontSize: "9px", color: T.muted, letterSpacing: "0.3px" }}>
              {(t.ticket_id || t.id || "").toString().slice(0, 14).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: BRAND, fontFamily: MONO }}>×{t.qty}</span>
            {t.event.price > 0 && (
              <span style={{ fontSize: "10px", color: T.muted, fontFamily: MONO }}>GHS {t.event.price}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          <motion.button whileTap={{ scale: 0.94 }} onClick={onView}
            style={{ flex: 2, padding: "10px 8px", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, boxShadow: `0 2px 8px ${BRAND}35` }}>
            View Ticket
          </motion.button>

          {t.status === "active" && (
            <>
              <motion.button whileTap={{ scale: 0.94 }} onClick={onResell}
                style={{ flex: 1, padding: "10px 4px", background: `${BRAND}08`, color: BRAND, border: `1px solid ${BRAND}25`, borderRadius: "10px", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                Resell
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} onClick={onSend}
                style={{ flex: 1, padding: "10px 4px", background: T.subtle, color: T.sub, border: `1px solid ${T.border}`, borderRadius: "10px", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                Send
              </motion.button>
            </>
          )}

          {t.status === "resale" && (
            <motion.button whileTap={{ scale: 0.94 }} onClick={onCancel}
              style={{ flex: 1, padding: "10px 4px", background: "rgba(239,68,68,0.08)", color: RED, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: "10px", fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
              Cancel
            </motion.button>
          )}

          {t.status === "redeemed" && (
            <div style={{ flex: 1, padding: "10px 4px", background: T.subtle, color: T.muted, borderRadius: "10px", fontSize: "10px", fontWeight: 600, textAlign: "center", border: `1px solid ${T.border}` }}>
              Used ✓
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AttendeeTickets() {
  const myTickets         = useStore(s => s.myTickets);
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
              id:    t.event?.id,
              name:  t.event?.name,
              date:  t.event?.date,
              venue: t.event?.venue,
              time:  t.event?.time,
              price: parseFloat(t.event?.price || 0),
              image: t.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
            },
            qty:          t.quantity,
            quantity:     t.quantity,
            status:       t.status,
            qr_data:      t.qr_data,
            qr_base64:    t.qr_base64  || null,
            dynamic_qr:   t.dynamic_qr || null,
            qr_image:     t.qr_image
              ? (t.qr_image.startsWith("http") ? t.qr_image : API + t.qr_image)
              : null,
            qr_image_url: t.qr_image_url || null,
            nft_tx_hash:  t.nft_tx_hash  || null,
            nft_token_id: t.nft_token_id || null,
            purchasedAt:  t.created_at ? new Date(t.created_at).toLocaleDateString() : "Recently",
            owner:        (t.owner?.first_name || "") + " " + (t.owner?.last_name || ""),
            ownerEmail:   t.owner?.email,
          }))
        });
      }
    }).catch(() => {});
  }, []);

  if (myTickets.length === 0) return (
    <div style={{ background: T.bg, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center", fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{ width: "88px", height: "88px", borderRadius: "24px", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", marginBottom: "24px", boxShadow: `0 8px 32px ${BRAND}40` }}>
        🎟️
      </motion.div>
      <div style={{ fontWeight: 800, fontSize: "22px", color: T.text, marginBottom: "8px", letterSpacing: "-0.5px" }}>No tickets yet</div>
      <div style={{ color: T.muted, fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>Browse events and mint your first NFT ticket on Polygon</div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "99px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <span style={{ fontSize: "13px" }}>⛓️</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: PURPLE }}>All tickets minted as NFTs on Polygon</span>
      </div>
    </div>
  );

  const nftCount = myTickets.filter(t => t.nft_tx_hash).length;

  return (
    <div style={{ background: T.bg, minHeight: "100%", padding: desktop ? "28px 40px 100px" : "16px 16px 100px", fontFamily: FONT }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontWeight: 800, fontSize: desktop ? "28px" : "22px", color: T.text, letterSpacing: "-0.6px", margin: "0 0 12px" }}>My Tickets</h1>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "10px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: PURPLE }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: PURPLE, fontFamily: MONO }}>
              {nftCount}/{myTickets.length} NFTs on Polygon
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "10px", background: `${BRAND}08`, border: `1px solid ${BRAND}20` }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: BRAND, fontFamily: MONO }}>
              {myTickets.filter(t => t.status === "active").length} active
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
        {myTickets.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <TicketCard t={t}
              onView={() => { setViewingTicket(t); setScreen("ticketView"); }}
              onResell={() => { setResaleTicket(t); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
              onSend={() => { setTransferTicket(t); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
              onCancel={() => handleCancelResale(t.id)} />
          </motion.div>
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
      icon: "⛓️", color: PURPLE,
      title: "NFT Confirmed on Polygon",
      body: `Your ticket for ${t.event?.name} has been minted on the Polygon blockchain.`,
      time: t.purchasedAt || "Recently", txHash: t.nft_tx_hash, ticket: t,
    })),
    ...myTickets.map(t => ({
      icon:  t.status === "redeemed" ? "✅" : t.status === "resale" ? "🏷️" : "🎟️",
      color: t.status === "redeemed" ? GREEN : t.status === "resale" ? BRAND : BLUE,
      title: t.status === "redeemed" ? "Ticket Used at Event" : t.status === "resale" ? "Listed on Resale Market" : "NFT Ticket Purchased",
      body: `Your ticket for ${t.event?.name} on ${t.event?.date} at ${t.event?.venue}.`,
      time: t.purchasedAt || "Recently", txHash: null, ticket: t,
    })),
  ] : [{
    icon: "🔔", color: BRAND,
    title: "No alerts yet",
    body: "Purchase a ticket and your blockchain confirmations will appear here.",
    time: "Now", txHash: null, ticket: null,
  }];

  return (
    <div style={{ background: T.bg, minHeight: "100%", padding: desktop ? "28px 40px 100px" : "16px 16px 100px", fontFamily: FONT }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontWeight: 800, fontSize: desktop ? "28px" : "22px", color: T.text, letterSpacing: "-0.6px", margin: "0 0 4px" }}>Alerts</h1>
        <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>Blockchain confirmations & ticket activity</p>
      </div>

      <div style={{ maxWidth: desktop ? "640px" : "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {alerts.map((a, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2, borderColor: a.color + "40" }}
            style={{ background: T.card, borderRadius: "16px", padding: "14px 16px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: T.shadow, border: `1px solid ${T.border}`, transition: "all 0.15s" }}>

            <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: a.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `1px solid ${a.color}22` }}>
              {a.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: T.text, marginBottom: "4px" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: T.sub, lineHeight: 1.6, marginBottom: "10px" }}>{a.body}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "10px", color: T.muted, fontFamily: MONO }}>{a.time}</div>
                {a.ticket?.ticket_id && (
                  <motion.div whileTap={{ scale: 0.95 }}
                    onClick={() => { setViewingTicket(a.ticket); setScreen("ticketView"); }}
                    style={{ fontSize: "10px", fontWeight: 700, color: BRAND, cursor: "pointer", background: `${BRAND}0D`, padding: "3px 10px", borderRadius: "99px", border: `1px solid ${BRAND}25` }}>
                    View Ticket →
                  </motion.div>
                )}
                {a.txHash && (
                  <a href={`https://amoy.polygonscan.com/tx/${a.txHash}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: "10px", fontWeight: 700, color: PURPLE, textDecoration: "none", background: "rgba(139,92,246,0.08)", padding: "3px 10px", borderRadius: "99px", border: "1px solid rgba(139,92,246,0.2)" }}>
                    Verify on Amoy ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Polygon banner */}
      <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "16px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", gap: "14px", maxWidth: desktop ? "640px" : "100%" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>⛓️</div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: PURPLE, marginBottom: "3px", fontFamily: MONO }}>POWERED BY POLYGON AMOY</div>
          <div style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>All tickets are NFTs. Ownership is permanent, verifiable, and cannot be faked.</div>
        </div>
      </div>
    </div>
  );
}