import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import {
  Ticket, Link2, Calendar, MapPin, CheckCircle2, Bell, Tag, ExternalLink,
} from "lucide-react";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const STATUS_META = {
  active:      { bg: "bg-fintech-green", label: "ACTIVE" },
  resale:      { bg: "bg-red-500",       label: "RESALE" },
  redeemed:    { bg: "bg-gray-500",      label: "USED" },
  transferred: { bg: "bg-fintech-blue",  label: "SENT" },
};

function StatusPill({ status }) {
  const s = STATUS_META[status] || STATUS_META.active;
  return (
    <span className={`${s.bg} text-white text-[8px] font-bold px-2 py-1 rounded-full whitespace-nowrap`}>
      {s.label}
    </span>
  );
}

// ── FIX: bg-white → bg-brand-card ──
function TicketCard({ t, onView, onResell, onSend, onCancel }) {
  return (
    <motion.div whileHover={{ y: -3 }}
      className="bg-brand-card rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">

      <div className="relative pt-[56.25%] overflow-hidden">
        <img
          src={t.event.image}
          alt={t.event.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="flex items-center gap-1 bg-brand-text text-white text-[8px] font-bold px-2 py-1 rounded-full">
            <Link2 size={8} strokeWidth={2.5} />
            {t.nft_tx_hash ? `NFT #${t.nft_token_id || "✓"}` : "MINTING"}
          </span>
        </div>

        <div className="absolute top-2 right-2">
          <StatusPill status={t.status} />
        </div>
      </div>

      <div className="px-3 pt-2.5 pb-3">
        <div className="font-bold text-[13px] text-brand-text mb-1.5 leading-snug line-clamp-2">{t.event.name}</div>

        <div className="flex items-center gap-1 text-[10px] text-brand-muted mb-2 font-mono truncate">
          <Calendar size={10} strokeWidth={1.75} /> {t.event.date} · <MapPin size={10} strokeWidth={1.75} /> {t.event.venue}
        </div>

        <div className="flex justify-between items-center mb-2.5">
          <span className="bg-gray-100 rounded-md px-1.5 py-1 font-mono text-[9px] text-brand-muted">
            {(t.ticket_id || t.id || "").toString().slice(0, 16).toUpperCase()}
          </span>
          <span className="text-[10px] font-bold text-brand-orange">×{t.qty}</span>
        </div>

        <div className="flex gap-1.5">
          <button onClick={onView}
            className="flex-[2] py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors">
            View Ticket
          </button>

          {t.status === "active" && (
            <>
              <button onClick={onResell}
                className="flex-1 py-2 bg-brand-canvas border border-gray-200 text-brand-text rounded-lg text-[10px] font-semibold">
                Resell
              </button>
              <button onClick={onSend}
                className="flex-1 py-2 bg-brand-canvas border border-gray-200 text-brand-text rounded-lg text-[10px] font-semibold">
                Send
              </button>
            </>
          )}

          {t.status === "resale" && (
            <button onClick={onCancel}
              className="flex-1 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[10px] font-semibold">
              Cancel
            </button>
          )}

          {t.status === "redeemed" && (
            <div className="flex-1 py-2 bg-brand-canvas border border-gray-200 text-brand-muted rounded-lg text-[10px] font-semibold text-center">
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
    <div className="bg-brand-canvas min-h-full flex flex-col items-center justify-center px-7 py-10 text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-orange flex items-center justify-center mb-5">
        <Ticket size={36} strokeWidth={1.75} color="#fff" />
      </div>
      <div className="font-extrabold text-xl text-brand-text mb-2">No tickets yet</div>
      <div className="text-brand-muted text-sm mb-5">Browse events and mint your first NFT ticket</div>
      <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-pastel-blue">
        <Link2 size={13} strokeWidth={1.75} className="text-fintech-blue" />
        <span className="text-[11px] font-bold text-fintech-blue">All tickets minted as NFTs on Polygon</span>
      </span>
    </div>
  );

  return (
    <div className={`bg-brand-canvas min-h-full ${desktop ? "px-10 pt-8 pb-24" : "px-4 pt-4 pb-24"}`}>

      <div className="mb-5">
        <div className={`font-extrabold text-brand-text tracking-tight mb-2 ${desktop ? "text-3xl" : "text-2xl"}`}>My Tickets</div>
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-pastel-blue w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-fintech-blue" />
          <span className="text-[11px] font-bold text-fintech-blue">
            {myTickets.filter(t => t.nft_tx_hash).length}/{myTickets.length} NFTs confirmed on Polygon
          </span>
        </span>
      </div>

      <div className={`grid gap-3.5 ${desktop ? "grid-cols-3" : "grid-cols-1"}`}>
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
      Icon: Link2, badgeBg: "bg-pastel-blue", iconClass: "text-fintech-blue",
      title: "NFT Confirmed on Polygon",
      body:  `Your ticket for ${t.event?.name} has been minted on the Polygon blockchain.`,
      time: t.purchasedAt || "Recently", txHash: t.nft_tx_hash, ticket: t,
    })),
    ...myTickets.map(t => ({
      Icon:    t.status === "redeemed" ? CheckCircle2 : t.status === "resale" ? Tag : Ticket,
      badgeBg: t.status === "redeemed" ? "bg-pastel-green" : t.status === "resale" ? "bg-pastel-orange" : "bg-pastel-blue",
      iconClass: t.status === "redeemed" ? "text-fintech-green" : t.status === "resale" ? "text-brand-orange" : "text-fintech-blue",
      title: t.status === "redeemed" ? "Ticket Used at Event" : t.status === "resale" ? "Listed on Resale Market" : "NFT Ticket Purchased",
      body:  `Your ticket for ${t.event?.name} on ${t.event?.date} at ${t.event?.venue}.`,
      time: t.purchasedAt || "Recently", txHash: null, ticket: t,
    })),
  ] : [{
    Icon: Bell, badgeBg: "bg-pastel-orange", iconClass: "text-brand-orange",
    title: "No alerts yet",
    body:  "Purchase a ticket and your blockchain confirmations will appear here.",
    time: "Now", txHash: null, ticket: null,
  }];

  return (
    <div className={`bg-brand-canvas min-h-full ${desktop ? "px-10 pt-8 pb-24" : "px-4 pt-4 pb-24"}`}>
      <div className="mb-5">
        <div className={`font-extrabold text-brand-text tracking-tight mb-1.5 ${desktop ? "text-3xl" : "text-2xl"}`}>Alerts</div>
        <div className="text-sm text-brand-muted">Blockchain confirmations & ticket activity</div>
      </div>
      <div className={desktop ? "max-w-[640px]" : ""}>
        {alerts.map((a, i) => (
          <motion.div key={i} whileHover={{ y: -2 }}
            className="bg-brand-card rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 mb-2.5 flex gap-3 items-start transition-shadow hover:shadow-md">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.badgeBg}`}>
              <a.Icon size={18} strokeWidth={1.75} className={a.iconClass} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px] text-brand-text mb-1">{a.title}</div>
              <div className="text-xs text-brand-text leading-relaxed mb-2">{a.body}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-brand-muted">{a.time}</span>
                {a.ticket?.ticket_id && (
                  <button onClick={() => { setViewingTicket(a.ticket); setScreen("ticketView"); }}
                    className="text-[10px] font-bold text-brand-orange bg-pastel-orange px-2.5 py-1 rounded-full">
                    View Ticket →
                  </button>
                )}
                {a.txHash && (
                  <a href={`https://amoy.polygonscan.com/tx/${a.txHash}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-fintech-blue bg-pastel-blue px-2.5 py-1 rounded-full">
                    Verify on Amoy <ExternalLink size={9} strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className={`mt-6 px-4 py-3.5 rounded-2xl bg-pastel-blue flex items-center gap-3 ${desktop ? "max-w-[640px]" : ""}`}>
        <div className="w-9 h-9 rounded-full bg-brand-card flex items-center justify-center shrink-0">
          <Link2 size={16} strokeWidth={1.75} className="text-fintech-blue" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-fintech-blue mb-0.5">POWERED BY POLYGON AMOY TESTNET</div>
          <div className="text-[11px] text-brand-text leading-relaxed">All tickets are NFTs. Ownership is permanent, verifiable, and cannot be faked.</div>
        </div>
      </div>
    </div>
  );
}