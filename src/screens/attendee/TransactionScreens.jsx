import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import { Avatar } from "../../utils/avatar";
import {
  ArrowLeft, Lock, Link2, Smartphone, CreditCard, Ticket, MapPin, Calendar,
  CheckCircle2, AlertCircle, AlertTriangle, Loader2, Eye, EyeOff, Ban,
  ShieldCheck, Tag, Gift, ChevronDown, Plus, Minus, ExternalLink, ArrowUpRight,
  Crown, Star,
} from "lucide-react";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const fieldClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-brand-text outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition-colors";

function tierIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("vvip")) return Crown;
  if (n.includes("vip"))  return Star;
  return Ticket;
}

// ── Fintech primary button ────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`w-full py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2.5 transition-colors ${disabled ? "bg-gray-100 text-brand-muted cursor-not-allowed" : "bg-brand-orange hover:bg-brand-orange-hover text-white"}`}>
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

// ── Ghost button ──────────────────────────────────────────────
function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full py-3.5 rounded-full bg-transparent border border-gray-200 text-brand-muted font-medium text-sm">
      {children}
    </button>
  );
}

// ── Screen header (checkout / resale / transfer) ───────────────
function ScreenHeader({ title, subtitle, onBack, badge }) {
  return (
    <div className="flex items-center px-5 py-4 gap-3.5 border-b border-gray-100 bg-white shrink-0">
      <button onClick={onBack} className="w-9 h-9 rounded-xl bg-brand-canvas border border-gray-100 flex items-center justify-center shrink-0">
        <ArrowLeft size={16} strokeWidth={1.75} className="text-brand-text" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold text-brand-text tracking-tight">{title}</div>
        <div className="text-[11px] text-brand-muted mt-0.5">{subtitle}</div>
      </div>
      {badge}
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────
function StatChip({ Icon, label, value }) {
  return (
    <div className="flex-1 min-w-[70px] bg-fintech-gray rounded-xl px-2.5 py-3 text-center border border-gray-100">
      <Icon size={16} strokeWidth={1.75} className="text-brand-muted mx-auto mb-1.5" />
      <div className="text-[8px] text-brand-muted tracking-wide font-mono mb-1 uppercase">{label}</div>
      <div className="text-xs font-bold text-fintech-slate font-mono">{value}</div>
    </div>
  );
}

// ── Blockchain strip ──────────────────────────────────────────
function ChainStrip({ txHash, tokenId }) {
  const url = txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;
  return (
    <div className="flex items-center justify-between gap-2.5 bg-pastel-blue rounded-xl px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
          <Link2 size={15} strokeWidth={1.75} className="text-fintech-blue" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-fintech-blue">Polygon Blockchain</div>
          <div className="text-[10px] text-brand-muted mt-0.5 font-mono">
            {tokenId ? `NFT #${tokenId}` : "Minting in progress..."}
          </div>
        </div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[11px] font-semibold text-fintech-blue bg-white px-3 py-1.5 rounded-full whitespace-nowrap">
          Verify <ExternalLink size={11} strokeWidth={2} />
        </a>
      ) : (
        <span className="text-[11px] font-semibold text-fintech-blue bg-white px-3 py-1.5 rounded-full whitespace-nowrap">
          Minting...
        </span>
      )}
    </div>
  );
}

// ── Security features grid ────────────────────────────────────
function SecurityFeatures() {
  const items = [
    [ShieldCheck, "HMAC Secured", "Rotates every 10s"],
    [EyeOff, "Screenshot-proof", "Dynamic QR only"],
    [Link2, "NFT Ownership", "On Polygon chain"],
    [Ban, "Single-use scan", "Auto-invalidates"],
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([Icon, title, sub]) => (
        <div key={title} className="bg-fintech-gray rounded-xl p-3 border border-gray-100">
          <Icon size={16} strokeWidth={1.75} className="text-brand-muted mb-1.5" />
          <div className="text-[11px] font-bold text-brand-text mb-0.5">{title}</div>
          <div className="text-[10px] text-brand-muted">{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Perforated divider ────────────────────────────────────────
function PerforatedLine() {
  return (
    <div className="relative h-[26px] bg-white">
      <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-fintech-gray z-10" />
      <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-fintech-gray z-10" />
      <svg width="100%" height="26" className="absolute top-0 left-0">
        <line x1="20" y1="13" x2="99%" y2="13" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="5 5" />
      </svg>
    </div>
  );
}

// ── Premium Ticket ────────────────────────────────────────────
function PremiumTicket({ ev, ownerName, qrSrc, qrLoaded, qrError, refreshing, setQrLoaded, setQrError, timeLeft, isExpiringSoon, progressColor, ticketId, txHash, tokenId, status, quantity }) {
  const desktop  = isDesktop();
  const [showId, setShowId] = useState(false);

  const idStr  = (ticketId || "").toString().toUpperCase();
  const idMask = idStr.length > 8 ? idStr.slice(0, 8) + "••••••••" : "••••••••";

  return (
    <div className="w-full mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" style={{ maxWidth: desktop ? "420px" : "100%" }}>

      {/* Event image */}
      <div className="h-[160px] relative">
        {ev?.image
          ? <img src={ev.image} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-fintech-slate" />
        }
        <span className="absolute top-3 left-3 flex items-center gap-1 bg-brand-text text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
          <Link2 size={9} strokeWidth={2.5} /> NFT · POLYGON
        </span>
        {ev?.category && (
          <span className="absolute top-3 right-3 bg-white text-brand-text text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">
            {ev.category}
          </span>
        )}
      </div>

      <div className="px-4 pt-3.5 pb-3">
        <div className="text-[9px] font-bold text-brand-muted tracking-widest font-mono mb-1">YOUR TICKET</div>
        <div className="font-bold text-brand-text text-[17px] leading-tight mb-1">{ev?.name || "Event Ticket"}</div>
        <div className="flex items-center gap-1 text-brand-muted text-[11px]">
          <MapPin size={11} strokeWidth={1.75} /> {ev?.venue || "Venue TBA"}
        </div>
      </div>

      <div className="flex justify-around bg-fintech-gray py-3.5 border-y border-gray-100">
        {[["DATE", ev?.date || "TBA"], ["TIME", ev?.time ? ev.time.substring(0, 5) : "TBA"], ["QTY", String(quantity || 1)]].map(([label, val]) => (
          <div key={label} className="text-center">
            <div className="text-[8px] text-brand-muted font-bold tracking-widest font-mono mb-1">{label}</div>
            <div className="text-[13px] font-semibold text-brand-text">{val}</div>
          </div>
        ))}
      </div>

      <PerforatedLine />

      {/* Bottom half */}
      <div className="px-4 pt-1 pb-5 flex flex-col items-center gap-3.5">
        {/* Owner */}
        <div className="w-full bg-pastel-green rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
          <Avatar seed={ownerName} name={ownerName} size={26} style={{ flexShrink: 0, borderRadius: "50%" }} />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-bold text-fintech-green tracking-wide uppercase">Verified Owner</div>
            <div className="text-xs text-brand-text font-medium truncate mt-0.5">{ownerName}</div>
          </div>
          <CheckCircle2 size={16} strokeWidth={2} className="text-fintech-green shrink-0" />
        </div>

        {/* QR */}
        {qrSrc ? (
          <div className="relative">
            {(!qrLoaded && !qrError) && (
              <div className="w-40 h-40 rounded-2xl bg-gray-100 absolute top-0 left-0 skeleton" />
            )}
            <AnimatePresence>
              {refreshing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center gap-1.5 z-10">
                  <Loader2 size={20} className="text-brand-muted animate-spin" />
                  <span className="text-[10px] text-brand-muted">Refreshing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className={`p-2.5 bg-white rounded-2xl border-2 shadow-sm transition-colors ${isExpiringSoon ? "border-red-400" : "border-emerald-400"}`}>
              <img src={qrSrc} alt="QR Code"
                onLoad={() => setQrLoaded(true)} onError={() => setQrError(true)}
                className="w-[140px] h-[140px] rounded-lg" style={{ display: qrError ? "none" : "block" }} />
              {qrError && (
                <div className="w-[140px] h-[140px] flex flex-col items-center justify-center gap-2">
                  <Smartphone size={22} strokeWidth={1.75} className="text-brand-muted" />
                  <span className="text-[10px] text-brand-muted">QR unavailable</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-2xl bg-fintech-gray border border-gray-100 flex flex-col items-center justify-center gap-2">
            <Loader2 size={22} className="text-brand-muted animate-spin" />
            <span className="text-[10px] text-brand-muted">Generating QR...</span>
          </div>
        )}

        {/* QR countdown */}
        {status === "active" && (
          <div className="w-40">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <motion.div key={timeLeft} initial={{ width: "100%" }} animate={{ width: (timeLeft / 10 * 100) + "%" }} transition={{ duration: 1, ease: "linear" }}
                className={`h-full rounded-full ${isExpiringSoon ? "bg-red-500" : "bg-emerald-500"}`} />
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: progressColor }} />
              <span className="text-[10px] text-brand-muted font-medium">QR refreshes in {timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Ticket ID */}
        <div className="text-center">
          <button onClick={() => setShowId(s => !s)}
            className="bg-gray-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <span className="font-mono text-[9px] text-brand-muted tracking-wide">{showId ? idStr : idMask}</span>
            {showId ? <EyeOff size={11} strokeWidth={1.75} className="text-brand-muted" /> : <Eye size={11} strokeWidth={1.75} className="text-brand-muted" />}
          </button>
          {showId && <div className="text-[9px] text-amber-700 mt-1.5">Only share with door staff if QR unavailable</div>}
        </div>

        {/* Blockchain */}
        <ChainStrip txHash={txHash} tokenId={tokenId} />

        {status === "active" && (
          <div className="w-full px-3.5 py-3 bg-pastel-orange rounded-xl flex items-center gap-2.5">
            <Ticket size={18} strokeWidth={1.75} className="text-brand-orange shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-brand-orange">Show at the Gate</div>
              <div className="text-[10px] text-brand-muted mt-0.5">Present this QR to door staff for entry</div>
            </div>
          </div>
        )}

        {status === "redeemed" && (
          <div className="w-full py-3.5 rounded-xl bg-pastel-green text-center">
            <CheckCircle2 size={20} strokeWidth={1.75} className="text-fintech-green mx-auto mb-1" />
            <div className="text-[13px] font-bold text-fintech-green">Ticket Used</div>
            <div className="text-[10px] text-brand-muted mt-0.5">Scanned at gate</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAYMENT SUCCESS — fintech confirmation screen
// ═══════════════════════════════════════════════════════════════
export function PaymentSuccess() {
  const setScreen     = useStore(s => s.setScreen);
  const setActiveTab  = useStore(s => s.setActiveTab);
  const viewingTicket = useStore(s => s.viewingTicket);
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const desktop = isDesktop();
  const event   = viewingTicket?.event || checkoutEvent;

  return (
    <div className={`bg-fintech-gray min-h-full flex items-center justify-center ${desktop ? "p-10" : "p-5"}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="w-full max-w-[460px]">

        {/* Success card */}
        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm mb-3 ${desktop ? "px-10 py-11" : "px-6 py-8"}`}>

          <div className="text-center mb-7">
            <div className="w-[72px] h-[72px] rounded-full bg-pastel-green flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} strokeWidth={1.75} className="text-fintech-green" />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-text tracking-tight mb-1.5">Payment Confirmed</h2>
            <p className="text-brand-muted text-sm leading-relaxed">Your NFT ticket is being minted on Polygon</p>
          </div>

          {/* Amount */}
          <div className="bg-fintech-gray rounded-2xl px-5 py-4 mb-5 text-center border border-gray-100">
            <div className="text-[11px] font-semibold text-brand-muted tracking-wide font-mono mb-1.5">AMOUNT PAID</div>
            <div className="text-3xl font-bold text-brand-text tracking-tight font-mono">
              GHS {event?.price ? parseFloat(event.price).toLocaleString() : "—"}
            </div>
            {viewingTicket?.tierName && (
              <div className="text-[11px] text-brand-orange font-semibold mt-1.5">{viewingTicket.tierName}</div>
            )}
          </div>

          {/* Event info */}
          {event && (
            <div className="bg-fintech-gray rounded-2xl p-4 mb-5 border border-gray-100">
              <div className="text-[9px] font-bold text-brand-muted tracking-widest font-mono mb-2">EVENT</div>
              <div className="font-bold text-[15px] text-brand-text mb-1.5">{event.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                <Calendar size={12} strokeWidth={1.75} /> {event.date} · <MapPin size={12} strokeWidth={1.75} /> {event.venue}
              </div>
            </div>
          )}

          {/* Chain strip */}
          <div className="mb-6">
            <ChainStrip txHash={viewingTicket?.nft_tx_hash} tokenId={viewingTicket?.nft_token_id} />
          </div>

          {/* Trust badges */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {[[Lock,"Secured"],[Link2,"On-chain"],[Smartphone,"Instant"]].map(([Icon,label]) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                <Icon size={12} strokeWidth={1.75} /> {label}
              </span>
            ))}
          </div>

          <PrimaryBtn onClick={() => setScreen("ticketView")}>View My Ticket →</PrimaryBtn>
        </div>

        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Back to Events</GhostBtn>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CHECKOUT — fintech payment screen, tier-aware, correct fee math
// ═══════════════════════════════════════════════════════════════
export function Checkout() {
  const checkoutEvent      = useStore(s => s.checkoutEvent);
  const selectedTier       = useStore(s => s.selectedTier);
  const ticketQty          = useStore(s => s.ticketQty);
  const payMethod          = useStore(s => s.payMethod);
  const setTicketQty       = useStore(s => s.setTicketQty);
  const setPayMethod       = useStore(s => s.setPayMethod);
  const handleBuyTicket    = useStore(s => s.handleBuyTicket);
  const handleRegisterFree = useStore(s => s.handleRegisterFree);
  const setScreen          = useStore(s => s.setScreen);
  const currentUser        = useStore(s => s.currentUser);

  const [paying,   setPaying]   = useState(false);
  const [payError, setPayError] = useState("");
  const desktop = isDesktop();

  if (!checkoutEvent) return null;

  // No premature rounding — keep the exact price so what we charge via
  // Paystack matches exactly what the backend expects in
  // verify_paystack_payment(). Rounding only happens at pesewas conversion.
  const unitPrice = parseFloat(checkoutEvent.price) || 0;
  const qty       = Math.max(1, parseInt(ticketQty) || 1);
  const subtotal  = unitPrice * qty;
  // No added customer surcharge — the backend already deducts the
  // platform's 5% from the organizer's payout (organizer_amount = total *
  // 0.95 in purchase_ticket). Charging the customer an *additional* 5% on
  // top double-billed the same fee. Customer pays exactly the ticket
  // price, matching what OrganizerHome's "You (95%) / Platform (5%)"
  // already promises.
  const total     = subtotal;
  const isFree    = unitPrice === 0;
  const TierIcon  = tierIcon(selectedTier?.name);

  const onPay = async () => {
    if (paying) return;
    setPayError(""); setPaying(true);

    // ── Free events never touch Paystack. A fabricated "FREE-<timestamp>"
    // reference was never actually processed by Paystack, so the
    // backend's verify_paystack_payment() correctly rejects it with a
    // 402 "Payment could not be verified" — that was the exact bug.
    // Free events instead call the dedicated register-free-event
    // endpoint via handleRegisterFree, which only checks capacity and
    // creates a Registration record — no payment involved at all. ──
    if (isFree) {
      try { await handleRegisterFree(); }
      catch { setPayError("Something went wrong. Please try again."); }
      setPaying(false);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        if (window.PaystackPop) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://js.paystack.co/v1/inline.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    } catch { setPayError("Failed to load payment gateway."); setPaying(false); return; }

    let accessCode, payRef;
    try {
      const token = localStorage.getItem("access_token") || "";
      const initRes = await fetch(`${API}/api/payments/initialize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ amount: total, event_id: checkoutEvent.id, event_name: checkoutEvent.name, quantity: qty }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData.access_code) { setPayError(initData.error || "Failed to initialize payment."); setPaying(false); return; }
      accessCode = initData.access_code;
      payRef     = initData.reference;
    } catch { setPayError("Connection error initializing payment."); setPaying(false); return; }

    const doHandle = (() => {
      let called = false;
      return (ref) => {
        if (called) return; called = true;
        const tid = setTimeout(() => { setPaying(false); setPayError("Payment received — your ticket will appear in My Tickets shortly."); }, 90000);
        handleBuyTicket(ref).then(() => { clearTimeout(tid); setPaying(false); }).catch(() => { clearTimeout(tid); setPaying(false); });
      };
    })();

    const openPaystack = () => {
      try {
        // total * 100 is now the EXACT pesewas value the backend's
        // verify_paystack_payment() will check against — no rounding
        // drift between what's charged and what's verified.
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
          email: currentUser?.email || "",
          amount: Math.round(total * 100), currency: "GHS",
          channels: ["mobile_money", "card"],
          ref: payRef, access_code: accessCode,
          onClose: () => setPaying(false),
          callback: (r) => doHandle(r.reference || payRef),
        });
        handler.openIframe();
      } catch {
        window.open(`https://checkout.paystack.com/${accessCode}`, "_blank");
        setTimeout(() => { setPaying(false); setPayError("Complete payment in the new tab, then check My Tickets."); }, 3000);
      }
    };

    try {
      window.PaystackPop.resumeTransaction(accessCode, { onClose: () => setPaying(false), callback: (r) => doHandle(r.reference || payRef) });
    } catch { openPaystack(); }
  };

  return (
    <div className="bg-fintech-gray h-full flex flex-col overflow-hidden">

      <ScreenHeader title="Checkout" subtitle="NFT ticket minted after payment" onBack={() => setScreen("app")}
        badge={
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 shrink-0">
            <ShieldCheck size={12} strokeWidth={2} className="text-emerald-700" />
            <span className="text-[10px] font-bold text-emerald-700 font-mono">SECURED</span>
          </span>
        } />

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`mx-auto ${desktop ? "max-w-[600px] px-10 py-7" : "px-4 py-5"}`} style={{ paddingBottom: desktop ? "80px" : "100px" }}>

          {/* Event banner */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-5">
            <div className="h-[120px] relative">
              {checkoutEvent.image
                ? <img src={checkoutEvent.image} alt={checkoutEvent.name} className="w-full h-full object-cover object-top" />
                : <div className="w-full h-full bg-brand-orange" />
              }
              {selectedTier?.name && (
                <span className="absolute top-3 right-3 flex items-center gap-1 bg-white text-brand-text text-[10px] font-bold px-2.5 py-1.5 rounded-full">
                  <TierIcon size={11} strokeWidth={2} className="text-brand-orange" /> {selectedTier.name}
                </span>
              )}
            </div>
            <div className="bg-white px-4 py-3.5">
              <div className="font-bold text-brand-text text-[15px] mb-1">{checkoutEvent.name}</div>
              <div className="flex items-center gap-1.5 text-brand-muted text-[11px] font-mono">
                <Calendar size={11} strokeWidth={1.75} /> {checkoutEvent.date} · <MapPin size={11} strokeWidth={1.75} /> {checkoutEvent.venue}
              </div>
            </div>
          </div>

          {/* Quantity */}
          {!isFree && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4.5 mb-4">
              <div className="text-[10px] font-bold text-brand-muted tracking-widest font-mono mb-3.5">QUANTITY</div>
              <div className="flex items-center gap-4">
                <button onClick={() => setTicketQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 rounded-xl bg-fintech-gray border border-gray-200 text-brand-text flex items-center justify-center">
                  <Minus size={18} strokeWidth={2} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-extrabold text-brand-text tracking-tight">{qty}</span>
                  <div className="text-[11px] text-brand-muted mt-0.5">
                    × GHS {unitPrice.toLocaleString()} each{selectedTier?.name ? ` (${selectedTier.name})` : ""}
                  </div>
                </div>
                <button onClick={() => setTicketQty(Math.min(10, qty + 1))}
                  className="w-11 h-11 rounded-xl bg-fintech-gray border border-gray-200 text-brand-text flex items-center justify-center">
                  <Plus size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* Payment method */}
          {!isFree && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4.5 mb-4">
              <div className="text-[10px] font-bold text-brand-muted tracking-widest font-mono mb-3.5">PAYMENT METHOD</div>
              <div className="flex gap-2.5">
                {[["momo", Smartphone, "Mobile Money"], ["card", CreditCard, "Card"]].map(([id, Icon, label]) => (
                  <button key={id} onClick={() => setPayMethod(id)}
                    className={`flex-1 py-3.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-colors ${payMethod === id ? "border-brand-orange bg-orange-50/20" : "border-gray-200 bg-white"}`}>
                    <Icon size={19} strokeWidth={1.75} className={payMethod === id ? "text-brand-orange" : "text-brand-muted"} />
                    <span className={`text-[13px] font-semibold ${payMethod === id ? "text-brand-orange" : "text-brand-muted"}`}>{label}</span>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-brand-muted mt-3 leading-relaxed">
                {payMethod === "momo"
                  ? "Select your network (MTN, Telecel, AirtelTigo) on the secure Paystack screen."
                  : "Enter your card details on the secure Paystack screen."}
              </div>
            </div>
          )}

          {/* Order summary — no added fee line, matches what backend charges */}
          <div className="bg-fintech-gray rounded-2xl p-4 mb-5 border border-gray-100">
            <div className="text-[10px] font-bold text-brand-muted tracking-widest font-mono mb-4">ORDER SUMMARY</div>
            {isFree ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-text">1 × Free ticket</span>
                <span className="text-lg font-extrabold text-fintech-green">FREE</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between pb-3 mb-3 border-b border-gray-200">
                  <span className="text-brand-muted text-sm">{qty} × {selectedTier?.name || "ticket"}{qty > 1 ? "s" : ""}</span>
                  <span className="text-brand-text text-sm font-medium font-mono">GHS {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-text font-bold text-[15px]">Total</span>
                  <span className="text-brand-orange font-bold text-3xl tracking-tight font-mono">GHS {total.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-brand-muted mt-2.5">
                  The organizer's platform fee is deducted from their payout — nothing added to your total.
                </div>
              </>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {payError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-red-600 text-[13px] leading-relaxed">
                <AlertCircle size={14} strokeWidth={2} className="shrink-0 mt-0.5" /> {payError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pay button */}
          <PrimaryBtn onClick={onPay} loading={paying} disabled={paying}>
            {paying ? "Processing..." : isFree ? "Get Free Ticket" : `Pay GHS ${total.toLocaleString()} →`}
          </PrimaryBtn>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[[Lock,"Secured by Paystack"],[Link2,"NFT on Polygon"],[Smartphone,"MoMo & Card"]].map(([Icon,label]) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] text-brand-muted">
                <Icon size={11} strokeWidth={1.75} /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TICKET VIEW
// ═══════════════════════════════════════════════════════════════
export function TicketView() {
  const viewingTicket     = useStore(s => s.viewingTicket);
  const setScreen         = useStore(s => s.setScreen);
  const setActiveTab      = useStore(s => s.setActiveTab);
  const setResaleTicket   = useStore(s => s.setResaleTicket);
  const setResalePrice    = useStore(s => s.setResalePrice);
  const setResaleError    = useStore(s => s.setResaleError);
  const setTransferTicket = useStore(s => s.setTransferTicket);
  const setTransferEmail  = useStore(s => s.setTransferEmail);
  const setTransferName   = useStore(s => s.setTransferName);
  const setTransferDone   = useStore(s => s.setTransferDone);
  const currentUser       = useStore(s => s.currentUser);

  const [dynamicQR,    setDynamicQR]    = useState(viewingTicket?.dynamic_qr || null);
  const [timeLeft,     setTimeLeft]     = useState(10);
  const [qrLoaded,     setQrLoaded]     = useState(false);
  const [qrError,      setQrError]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const desktop = isDesktop();

  useEffect(() => {
    if (!viewingTicket?.ticket_id) return;
    const tick = () => {
      const sLeft = 10 - (Math.floor(Date.now() / 1000) % 10);
      setTimeLeft(sLeft);
      if (sLeft === 10) {
        setRefreshing(true); setQrLoaded(false);
        ticketsAPI.myTickets().then(data => {
          if (Array.isArray(data)) {
            const updated = data.find(t => t.ticket_id === viewingTicket.ticket_id);
            if (updated?.dynamic_qr) setDynamicQR(updated.dynamic_qr);
          }
          setRefreshing(false);
        }).catch(() => setRefreshing(false));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [viewingTicket?.ticket_id]);

  if (!viewingTicket) return null;
  const ev = viewingTicket.event;
  const ownerName = viewingTicket.owner ||
    `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() ||
    currentUser?.email || "Ticket Holder";
  const qrSrc = dynamicQR
    ? "data:image/png;base64," + dynamicQR
    : viewingTicket.qr_image_url
    || (viewingTicket.qr_image
        ? (viewingTicket.qr_image.startsWith("http") ? viewingTicket.qr_image : API + viewingTicket.qr_image)
        : null);
  const isExpiringSoon = timeLeft <= 3;
  const progressColor  = isExpiringSoon ? "#dc2626" : "#10B981";

  return (
    <div className="bg-fintech-gray h-full overflow-y-auto" style={{ WebkitOverflowScrolling: "touch", paddingBottom: desktop ? "40px" : "100px" }}>
      <div className={`px-4 pt-4 mx-auto ${desktop ? "max-w-[520px]" : ""}`}>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
          className="flex items-center gap-1.5 text-brand-muted text-sm font-medium py-1.5 hover:text-brand-text transition-colors">
          <ArrowLeft size={15} strokeWidth={2} /> My Tickets
        </button>
      </div>

      <div className="px-4 py-4">
        <PremiumTicket ev={ev} ownerName={ownerName} qrSrc={qrSrc} qrLoaded={qrLoaded} qrError={qrError}
          refreshing={refreshing} setQrLoaded={setQrLoaded} setQrError={setQrError}
          timeLeft={timeLeft} isExpiringSoon={isExpiringSoon} progressColor={progressColor}
          ticketId={viewingTicket.ticket_id || viewingTicket.id}
          txHash={viewingTicket.nft_tx_hash} tokenId={viewingTicket.nft_token_id}
          status={viewingTicket.status} quantity={viewingTicket.quantity || viewingTicket.qty} />
      </div>

      {/* Security accordion */}
      <div className={`mx-auto px-4 pb-2.5 ${desktop ? "max-w-[520px]" : ""}`}>
        <button onClick={() => setShowSecurity(!showSecurity)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm mb-2.5">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} strokeWidth={1.75} className="text-brand-muted" />
            <span className="text-[13px] font-semibold text-brand-text">Security & Verification</span>
          </span>
          <motion.span animate={{ rotate: showSecurity ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} strokeWidth={2} className="text-brand-muted" />
          </motion.span>
        </button>
        <AnimatePresence>
          {showSecurity && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }} className="mb-2.5">
              <SecurityFeatures />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {viewingTicket.status === "active" && (
        <div className={`mx-auto px-4 pb-2.5 flex gap-2.5 ${desktop ? "max-w-[520px]" : ""}`}>
          <button onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            className="flex-1 py-3 bg-pastel-orange text-brand-orange rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5">
            <Tag size={14} strokeWidth={1.75} /> Resell
          </button>
          <button onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            className="flex-1 py-3 bg-fintech-gray border border-gray-200 text-brand-text rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5">
            <ArrowUpRight size={14} strokeWidth={1.75} /> Transfer
          </button>
        </div>
      )}

      <div className={`mx-auto px-4 pb-5 ${desktop ? "max-w-[520px]" : ""}`}>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Done</GhostBtn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RESALE
// ═══════════════════════════════════════════════════════════════
export function Resale() {
  const resaleTicket        = useStore(s => s.resaleTicket);
  const resalePrice         = useStore(s => s.resalePrice);
  const resaleError         = useStore(s => s.resaleError);
  const setResalePrice      = useStore(s => s.setResalePrice);
  const handleListForResale = useStore(s => s.handleListForResale);
  const setScreen           = useStore(s => s.setScreen);
  const desktop = isDesktop();

  if (!resaleTicket) return null;
  const ev     = resaleTicket.event;
  const price  = parseFloat(resalePrice) || 0;
  const fee    = Math.round(price * 0.02 * 100) / 100;
  const payout = Math.round((price - fee) * 100) / 100;

  return (
    <div className="bg-fintech-gray h-full flex flex-col overflow-hidden">
      <ScreenHeader title="List for Resale" subtitle="NFT ownership transfers on-chain automatically" onBack={() => setScreen("ticketView")} />

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`mx-auto ${desktop ? "max-w-[480px] px-10 py-7" : "px-4 py-5"}`} style={{ paddingBottom: desktop ? "80px" : "80px" }}>

          {/* Event info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4.5 py-4 mb-4">
            <div className="font-bold text-[15px] text-brand-text mb-1">{ev.name}</div>
            <div className="text-xs text-brand-muted font-mono">Original: GHS {ev.price} · Max resale: GHS {ev.price - 1}</div>
          </div>

          {/* Fee info */}
          <div className="flex items-center gap-2.5 bg-pastel-orange rounded-xl px-4 py-3 mb-5">
            <Tag size={16} strokeWidth={1.75} className="text-brand-orange shrink-0" />
            <div>
              <div className="text-xs font-bold text-brand-orange">2% Platform Fee</div>
              <div className="text-[11px] text-brand-muted mt-0.5">You keep 98% of the resale price</div>
            </div>
          </div>

          {/* Price input */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-brand-muted tracking-wide font-mono mb-2">RESALE PRICE (GHS)</div>
            <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
              placeholder={`Max GHS ${ev.price - 1}`}
              className={`${fieldClass} text-xl font-bold tracking-tight font-mono ${resaleError ? "border-red-300" : ""}`} />
            <AnimatePresence>
              {resaleError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-600 text-xs mt-1.5">{resaleError}</motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payout breakdown */}
          {price > 0 && (
            <div className="bg-fintech-gray rounded-2xl p-4 mb-5 border border-gray-100">
              <div className="text-[10px] font-bold text-brand-muted tracking-wide font-mono mb-3">PAYOUT BREAKDOWN</div>
              {[
                ["Listing Price", `GHS ${price}`, "text-brand-text", "font-medium"],
                ["Platform Fee (2%)", `− GHS ${fee}`, "text-brand-muted", "font-medium"],
                ["Your Payout", `GHS ${payout}`, "text-fintech-green", "font-bold"],
              ].map(([k, v, c, w], i) => (
                <div key={k} className={`flex justify-between py-2.5 ${i < 2 ? "border-b border-gray-200" : ""}`}>
                  <span className="text-brand-muted text-[13px]">{k}</span>
                  <span className={`${c} ${w} text-[13px] font-mono`}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <PrimaryBtn onClick={handleListForResale}>List for Resale</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RESALE SUCCESS
// ═══════════════════════════════════════════════════════════════
export function ResaleSuccess() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const desktop = isDesktop();

  return (
    <div className={`bg-fintech-gray min-h-full flex items-center justify-center ${desktop ? "p-10" : "p-5"}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-[420px]">
        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm mb-3 text-center ${desktop ? "px-10 py-11" : "px-6 py-8"}`}>
          <div className="w-[68px] h-[68px] rounded-2xl bg-pastel-orange flex items-center justify-center mx-auto mb-5">
            <Tag size={28} strokeWidth={1.75} className="text-brand-orange" />
          </div>
          <h2 className="text-xl font-extrabold text-brand-text tracking-tight mb-2">Listed for Resale</h2>
          <p className="text-brand-muted text-[13px] leading-relaxed mb-7">
            Your ticket is now on the marketplace. NFT ownership transfers automatically when someone buys it.
          </p>
          <PrimaryBtn onClick={() => { setScreen("app"); setActiveTab("tickets"); }}>View My Tickets</PrimaryBtn>
        </div>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Browse Events</GhostBtn>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TRANSFER
// ═══════════════════════════════════════════════════════════════
export function Transfer() {
  const transferTicket   = useStore(s => s.transferTicket);
  const transferEmail    = useStore(s => s.transferEmail);
  const transferName     = useStore(s => s.transferName);
  const transferDone     = useStore(s => s.transferDone);
  const setTransferEmail = useStore(s => s.setTransferEmail);
  const setTransferName  = useStore(s => s.setTransferName);
  const handleTransfer   = useStore(s => s.handleTransfer);
  const setScreen        = useStore(s => s.setScreen);
  const setActiveTab     = useStore(s => s.setActiveTab);
  const [transferring, setTransferring] = useState(false);
  const desktop = isDesktop();

  if (!transferTicket) return null;
  const ev = transferTicket.event;

  const onTransfer = async () => { setTransferring(true); await handleTransfer(); setTransferring(false); };

  if (transferDone) return (
    <div className={`bg-fintech-gray min-h-full flex items-center justify-center ${desktop ? "p-10" : "p-5"}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-[420px]">
        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm mb-3 text-center ${desktop ? "px-10 py-11" : "px-6 py-8"}`}>
          <div className="w-[68px] h-[68px] rounded-full bg-pastel-green flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={30} strokeWidth={1.75} className="text-fintech-green" />
          </div>
          <h2 className="text-xl font-extrabold text-brand-text tracking-tight mb-2">Ticket Transferred</h2>
          <p className="text-brand-muted text-[13px] leading-relaxed mb-7">
            NFT ownership of <strong className="text-brand-text">{ev.name}</strong> has been sent to{" "}
            <span className="text-brand-orange font-semibold">{transferName || transferEmail}</span>.
          </p>
          <PrimaryBtn onClick={() => { setScreen("app"); setActiveTab("tickets"); }}>My Tickets</PrimaryBtn>
        </div>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Browse Events</GhostBtn>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-fintech-gray h-full flex flex-col overflow-hidden">
      <ScreenHeader title="Transfer Ticket" subtitle="Permanent on-chain ownership transfer · Free" onBack={() => setScreen("ticketView")} />

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`mx-auto ${desktop ? "max-w-[480px] px-10 py-7" : "px-4 py-5"}`} style={{ paddingBottom: "80px" }}>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4.5 py-4 mb-5">
            <div className="text-[10px] font-bold text-brand-muted tracking-wide font-mono mb-3">BEFORE YOU TRANSFER</div>
            {[
              [Link2, "NFT ownership moves to recipient on Polygon"],
              [Ban, "Your QR code becomes invalid instantly"],
              [Gift, "Free — no platform fee"],
              [AlertTriangle, "Cannot be undone after confirmation"],
            ].map(([Icon, text]) => (
              <div key={text} className="flex gap-2.5 mb-2 items-start last:mb-0">
                <Icon size={14} strokeWidth={1.75} className="text-brand-muted shrink-0 mt-0.5" />
                <span className="text-xs text-brand-text leading-relaxed">{text}</span>
              </div>
            ))}
          </div>

          {/* Recipient fields */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-brand-muted tracking-wide font-mono mb-2">RECIPIENT NAME</div>
            <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} className={fieldClass} />
          </div>
          <div className="mb-4">
            <div className="text-[11px] font-bold text-brand-muted tracking-wide font-mono mb-2">RECIPIENT EMAIL</div>
            <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} className={fieldClass} />
          </div>

          {/* Warning */}
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <AlertTriangle size={16} strokeWidth={1.75} className="text-red-600 shrink-0" />
            <span className="text-xs text-red-600 font-medium">Double-check the email — this cannot be undone.</span>
          </div>

          <PrimaryBtn onClick={onTransfer} loading={transferring}>
            {transferring ? "Transferring..." : "Confirm Transfer →"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}