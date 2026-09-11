import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { paymentsAPI } from "../../api";
import { ticketsAPI } from "../../api";
import { Avatar } from "../../utils/avatar";
import { formatDate, formatTime } from "../../utils/formatDate";
import {
  ArrowLeft, Lock, Link, DeviceMobile, CreditCard, Ticket, MapPin, Calendar,
  CheckCircle, WarningCircle, Warning, CircleNotch, Eye, EyeSlash, Prohibit,
  ShieldCheck, Tag, Gift, CaretDown, Plus, Minus, ArrowSquareOut, ArrowUpRight,
  Crown, Star, Copy,
} from "@phosphor-icons/react";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const fieldClass = "w-full px-4 py-3.5 rounded-xl border border-brand-hairline bg-brand-card text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors";

function tierIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("vvip")) return Crown;
  if (n.includes("vip"))  return Star;
  return Ticket;
}

function tierBadgeColor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("vvip")) return "bg-[var(--brand-light)] text-brand-accent border-brand-accent/20";
  if (n.includes("vip"))  return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-brand-hairline text-brand-muted border-brand-hairline";
}

function PrimaryBtn({ children, onClick, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`w-full h-12 md:h-11 rounded-xl font-medium text-[15px] tabular-nums flex items-center justify-center gap-2.5 transition-colors ${disabled ? "bg-brand-hairline text-brand-muted cursor-not-allowed" : "bg-brand-accent hover:bg-brand-accent-hover text-white"}`}>
      {loading && <CircleNotch size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full h-11 rounded-xl bg-transparent border border-brand-hairline text-brand-muted font-medium text-sm">
      {children}
    </button>
  );
}

function ScreenHeader({ title, subtitle, onBack, badge }) {
  return (
    <div className="flex items-center px-5 py-4 gap-3.5 border-b border-brand-hairline bg-brand-card shrink-0">
      <button onClick={onBack} className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-hairline flex items-center justify-center shrink-0">
        <ArrowLeft size={16} weight="light" className="text-brand-text" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-brand-text tracking-tight">{title}</div>
        <div className="text-xs text-brand-muted mt-0.5">{subtitle}</div>
      </div>
      {badge}
    </div>
  );
}

function ChainStrip({ txHash, tokenId }) {
  const [copied, setCopied] = useState(false);
  const url = txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;
  const shortHash = txHash ? `${txHash.slice(0, 6)}…${txHash.slice(-4)}` : null;

  const copyHash = () => {
    navigator.clipboard?.writeText(txHash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-2.5 bg-blue-50 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-brand-card flex items-center justify-center shrink-0">
          <Link size={15} weight="light" className="text-blue-700" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-blue-700">
            {tokenId ? `NFT #${tokenId}` : "Polygon Blockchain"}
          </div>
          {shortHash ? (
            <button onClick={copyHash} className="flex items-center gap-1 font-mono text-xs text-brand-muted mt-0.5">
              {copied ? "Copied" : shortHash}
              <Copy size={11} weight="light" />
            </button>
          ) : (
            <div className="text-xs text-brand-muted mt-0.5">Minting in progress...</div>
          )}
        </div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-brand-card px-3 h-7 rounded-full whitespace-nowrap shrink-0">
          Verify <ArrowSquareOut size={11} weight="light" />
        </a>
      ) : (
        <span className="text-xs font-medium text-blue-700 bg-brand-card px-3 h-7 rounded-full whitespace-nowrap shrink-0 flex items-center">
          Minting...
        </span>
      )}
    </div>
  );
}

function SecurityFeatures() {
  const items = [
    [ShieldCheck, "HMAC Secured", "Rotates every 10s"],
    [EyeSlash, "Screenshot-proof", "Dynamic QR only"],
    [Link, "NFT Ownership", "On Polygon chain"],
    [Prohibit, "Single-use scan", "Auto-invalidates"],
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([Icon, title, sub]) => (
        <div key={title} className="bg-brand-subtle rounded-xl p-3 border border-brand-hairline">
          <Icon size={16} weight="light" className="text-brand-muted mb-1.5" />
          <div className="text-xs font-medium text-brand-text mb-0.5">{title}</div>
          <div className="text-xs text-brand-muted">{sub}</div>
        </div>
      ))}
    </div>
  );
}

function PerforatedLine() {
  return (
    <div className="relative h-[26px] bg-brand-card">
      <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-subtle z-10" />
      <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-subtle z-10" />
      <svg width="100%" height="26" className="absolute top-0 left-0">
        <line x1="20" y1="13" x2="99%" y2="13" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="5 5" />
      </svg>
    </div>
  );
}

function ResendVerification() {
  const currentUser = useStore(s => s.currentUser);
  const [state, setState] = useState("idle");

  const send = async () => {
    if (!currentUser?.email) return;
    setState("sending");
    const { authAPI } = await import("../../api");
    const res = await authAPI.resendVerification(currentUser.email);
    setState(res?.ok ? "sent" : "failed");
  };

  if (state === "sent") {
    return (
      <div className="mt-2 text-[13px] text-emerald-700">
        Sent. Check your inbox — the link expires in 24 hours.
      </div>
    );
  }

  return (
    <button onClick={send} disabled={state === "sending"}
      className="mt-2 text-[13px] font-medium text-red-700 underline underline-offset-2 disabled:opacity-60">
      {state === "sending" ? "Sending…" : state === "failed" ? "Could not send — tap to retry" : "Resend the verification email"}
    </button>
  );
}

function PremiumTicket({ ev, ownerName, qrSrc, qrLoaded, qrError, refreshing, setQrLoaded, onQrError, timeLeft, isExpiringSoon, progressColor, ticketId, txHash, tokenId, status, quantity, tierName }) {
  const desktop  = isDesktop();
  const [showId, setShowId] = useState(false);
  const TierIcon = tierIcon(tierName);

  const idStr  = (ticketId || "").toString().toUpperCase();
  const idMask = idStr.length > 8 ? idStr.slice(0, 8) + "••••••••" : "••••••••";

  return (
    <div className="w-full mx-auto bg-brand-card rounded-2xl border border-brand-hairline overflow-hidden" style={{ maxWidth: desktop ? "420px" : "100%" }}>

      <div className="h-[160px] relative">
        {ev?.image
          ? <img src={ev.image} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-brand-text" />
        }
        <span className="absolute top-3 left-3 flex items-center gap-1 bg-brand-text text-white text-xs font-medium px-2.5 py-1 rounded-full">
          <Link size={9} weight="light" /> NFT · POLYGON
        </span>
        {ev?.category && (
          <span className="absolute top-3 right-3 bg-brand-card text-brand-text text-xs font-medium px-2.5 py-1 rounded-full uppercase">
            {ev.category}
          </span>
        )}
      </div>

      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs font-medium text-brand-muted tracking-widest">YOUR TICKET</div>
          {tierName && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${tierBadgeColor(tierName)}`}>
              <TierIcon size={10} weight="light" /> {tierName.toUpperCase()}
            </span>
          )}
        </div>
        <div className="font-medium text-brand-text text-[17px] leading-tight mb-1">{ev?.name || "Event Ticket"}</div>
        <div className="flex items-center gap-1 text-brand-muted text-xs">
          <MapPin size={11} weight="light" /> {ev?.venue || "Venue TBA"}
        </div>
      </div>

      <div className="flex justify-around bg-brand-subtle py-3.5 border-y border-brand-hairline">
        {[["DATE", formatDate(ev?.date)], ["TIME", formatTime(ev?.time) || "TBA"], ["QTY", String(quantity || 1)]].map(([label, val]) => (
          <div key={label} className="text-center">
            <div className="text-xs text-brand-muted font-medium tracking-widest mb-1">{label}</div>
            <div className="text-[13px] font-semibold text-brand-text tabular-nums">{val}</div>
          </div>
        ))}
      </div>

      <PerforatedLine />

      <div className="px-4 pt-1 pb-5 flex flex-col items-center gap-3.5">
        <div className="w-full bg-emerald-50 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
          <Avatar seed={ownerName} name={ownerName} size={26} style={{ flexShrink: 0, borderRadius: "50%" }} />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-emerald-700 tracking-wide uppercase">Verified Owner</div>
            <div className="text-xs text-brand-text font-medium truncate mt-0.5">{ownerName}</div>
          </div>
          <CheckCircle size={16} weight="light" className="text-emerald-700 shrink-0" />
        </div>

        {qrSrc ? (
          <div className="relative">
            {(!qrLoaded && !qrError) && (
              <div className="w-40 h-40 rounded-2xl bg-brand-hairline absolute top-0 left-0 skeleton" />
            )}
            <AnimatePresence>
              {refreshing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-brand-card/95 rounded-2xl flex flex-col items-center justify-center gap-1.5 z-10">
                  <CircleNotch size={20} className="text-brand-muted animate-spin" />
                  <span className="text-xs text-brand-muted">Refreshing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className={`p-2.5 bg-white rounded-2xl border-2 transition-colors ${isExpiringSoon ? "border-red-400" : "border-emerald-400"}`}>
              <img src={qrSrc} alt="QR Code"
                onLoad={() => setQrLoaded(true)} onError={onQrError}
                className="w-[140px] h-[140px] rounded-xl" style={{ display: qrError ? "none" : "block" }} />
              {qrError && (
                <div className="w-[140px] h-[140px] flex flex-col items-center justify-center gap-2">
                  <DeviceMobile size={22} weight="light" className="text-brand-muted" />
                  <span className="text-xs text-brand-muted">QR unavailable</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-2xl bg-brand-subtle border border-brand-hairline flex flex-col items-center justify-center gap-2">
            <CircleNotch size={22} className="text-brand-muted animate-spin" />
            <span className="text-xs text-brand-muted">Generating QR...</span>
          </div>
        )}

        {status === "active" && (
          <div className="w-40">
            <div className="h-1 bg-brand-hairline rounded-full overflow-hidden mb-1.5">
              <motion.div key={timeLeft} initial={{ width: "100%" }} animate={{ width: (timeLeft / 10 * 100) + "%" }} transition={{ duration: 1, ease: "linear" }}
                className={`h-full rounded-full ${isExpiringSoon ? "bg-red-500" : "bg-emerald-500"}`} />
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: progressColor }} />
              <span className="text-xs text-brand-muted font-medium">QR refreshes in {timeLeft}s</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <button onClick={() => setShowId(s => !s)}
            className="bg-brand-hairline px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <span className="font-mono text-xs text-brand-muted tracking-wide">{showId ? idStr : idMask}</span>
            {showId ? <EyeSlash size={11} weight="light" className="text-brand-muted" /> : <Eye size={11} weight="light" className="text-brand-muted" />}
          </button>
          {showId && <div className="text-xs text-amber-700 mt-1.5">Only share with door staff if QR unavailable</div>}
        </div>

        <ChainStrip txHash={txHash} tokenId={tokenId} />

        {status === "active" && (
          <div className="w-full px-3.5 py-3 bg-[var(--brand-light)] rounded-xl flex items-center gap-2.5">
            <Ticket size={18} weight="light" className="text-brand-accent shrink-0" />
            <div>
              <div className="text-xs font-medium text-brand-accent">Show at the Gate</div>
              <div className="text-xs text-brand-muted mt-0.5">Present this QR to door staff for entry</div>
            </div>
          </div>
        )}

        {status === "redeemed" && (
          <div className="w-full py-3.5 rounded-xl bg-emerald-50 text-center">
            <CheckCircle size={20} weight="light" className="text-emerald-700 mx-auto mb-1" />
            <div className="text-[13px] font-medium text-emerald-700">Ticket Used</div>
            <div className="text-xs text-brand-muted mt-0.5">Scanned at gate</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentSuccess() {
  const setScreen         = useStore(s => s.setScreen);
  const setActiveTab      = useStore(s => s.setActiveTab);
  const viewingTicket     = useStore(s => s.viewingTicket);
  const checkoutEvent     = useStore(s => s.checkoutEvent);
  const lastPurchaseBatch = useStore(s => s.lastPurchaseBatch);
  const desktop = isDesktop();
  const event   = viewingTicket?.event || checkoutEvent;

  // ── Amount paid must reflect the WHOLE purchase, not just the first
  // ticket in the batch — a qty-2 purchase was previously showing one
  // unit's price as "Amount Paid," which read as a billing error. ──
  const batch      = lastPurchaseBatch?.length ? lastPurchaseBatch : (viewingTicket ? [viewingTicket] : []);
  const ticketCount = batch.length || 1;
  const totalPaid   = batch.length
    ? batch.reduce((s, t) => s + (t.price_paid ?? parseFloat(t.event?.price || 0)), 0)
    : parseFloat(event?.price || 0);
  const mintedCount = batch.filter(t => t.nft_tx_hash).length;

  return (
    <div className={`bg-brand-subtle min-h-full flex items-center justify-center ${desktop ? "p-10" : "p-5"}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="w-full max-w-[460px]">

        <div className={`bg-brand-card rounded-2xl border border-brand-hairline mb-3 ${desktop ? "px-10 py-11" : "px-6 py-8"}`}>

          <div className="text-center mb-7">
            <div className="w-[72px] h-[72px] rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} weight="light" className="text-emerald-700" />
            </div>
            <h2 className="text-2xl font-semibold text-brand-text tracking-tight mb-1.5">Payment Confirmed</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              {ticketCount > 1 ? `Your ${ticketCount} NFT tickets are being minted on Polygon` : "Your NFT ticket is being minted on Polygon"}
            </p>
          </div>

          <div className="bg-brand-subtle rounded-2xl px-5 py-4 mb-5 text-center border border-brand-hairline">
            <div className="text-xs font-semibold text-brand-muted tracking-wide mb-1.5">AMOUNT PAID</div>
            <div className="text-3xl font-semibold text-brand-text tracking-tight tabular-nums">
              GHS {totalPaid.toLocaleString()}
            </div>
            <div className="text-xs text-brand-muted mt-1.5 tabular-nums">
              {ticketCount} ticket{ticketCount > 1 ? "s" : ""}{viewingTicket?.tierName ? ` · ${viewingTicket.tierName}` : ""}
            </div>
          </div>

          {event && (
            <div className="bg-brand-subtle rounded-2xl p-4 mb-5 border border-brand-hairline">
              <div className="text-xs font-medium text-brand-muted tracking-widest mb-2">EVENT</div>
              <div className="font-medium text-[15px] text-brand-text mb-1.5">{event.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-brand-muted tabular-nums">
                <Calendar size={12} weight="light" /> {formatDate(event.date)} · <MapPin size={12} weight="light" /> {event.venue}
              </div>
            </div>
          )}

          {ticketCount > 1 ? (
            <div className="bg-brand-subtle rounded-2xl p-4 mb-6 border border-brand-hairline">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-brand-muted tracking-widest">YOUR TICKETS</div>
                <span className="text-xs text-brand-muted tabular-nums">{mintedCount}/{ticketCount} NFTs confirmed</span>
              </div>
              <div className="flex flex-col gap-2">
                {batch.map((t, i) => (
                  <div key={t.ticket_id || i} className="flex items-center justify-between bg-brand-card border border-brand-hairline rounded-xl px-3.5 py-2.5">
                    <span className="font-mono text-xs text-brand-text truncate">{String(t.ticket_id || "").slice(0, 16)}</span>
                    <span className={`text-xs font-medium shrink-0 ml-2 ${t.nft_tx_hash ? "text-emerald-700" : "text-brand-muted"}`}>
                      {t.nft_tx_hash ? `NFT #${t.nft_token_id ?? "✓"}` : "Minting…"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <ChainStrip txHash={viewingTicket?.nft_tx_hash} tokenId={viewingTicket?.nft_token_id} />
            </div>
          )}

          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {[[Lock,"Secured"],[Link,"On-chain"],[DeviceMobile,"Instant"]].map(([Icon,label]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-brand-muted">
                <Icon size={12} weight="light" /> {label}
              </span>
            ))}
          </div>

          <PrimaryBtn onClick={() => setScreen("ticketView")}>
            {ticketCount > 1 ? "View My Tickets →" : "View My Ticket →"}
          </PrimaryBtn>
        </div>

        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Back to Events</GhostBtn>
      </motion.div>
    </div>
  );
}

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

  const unitPrice = parseFloat(checkoutEvent.price) || 0;
  const qty       = Math.max(1, parseInt(ticketQty) || 1);
  const subtotal  = unitPrice * qty;
  const total     = subtotal;
  const effectivePrice = selectedTier ? parseFloat(selectedTier.price) : unitPrice;
  const isFree    = effectivePrice === 0;
  const TierIcon  = tierIcon(selectedTier?.name);

  const onPay = async () => {
    if (paying) return;
    setPayError(""); setPaying(true);

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

    let accessCode, payRef, serverTotal = total;
    try {
      // No amount here on purpose — the backend prices the order from the
      // event/tier and reserves the tickets, so the browser can't be talked
      // into paying the wrong number.
      const initData = await paymentsAPI.initialize({
        event_id: checkoutEvent.id,
        tier_id:  selectedTier?.id,
        quantity: qty,
      });
      if (!initData.ok || !initData.access_code) { setPayError(initData.error || "Failed to initialize payment."); setPaying(false); return; }
      accessCode  = initData.access_code;
      payRef      = initData.reference;
      serverTotal = parseFloat(initData.order?.total ?? total);
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
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
          email: currentUser?.email || "",
          amount: Math.round(serverTotal * 100), currency: "GHS",
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
    <div className="bg-brand-subtle h-full flex flex-col overflow-hidden">

      <ScreenHeader title="Checkout" subtitle="NFT ticket minted after payment" onBack={() => setScreen("app")}
        badge={
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 shrink-0">
            <ShieldCheck size={12} weight="light" className="text-emerald-700" />
            <span className="text-xs font-medium text-emerald-700">SECURED</span>
          </span>
        } />

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`mx-auto ${desktop ? "max-w-[600px] px-10 py-7" : "px-4 py-5"}`} style={{ paddingBottom: desktop ? "80px" : "100px" }}>

          <div className="rounded-2xl overflow-hidden border border-brand-hairline mb-5">
            <div className="h-[120px] relative">
              {checkoutEvent.image
                ? <img src={checkoutEvent.image} alt={checkoutEvent.name} className="w-full h-full object-cover"
                    style={{ objectPosition: checkoutEvent?.image_focus || "50% 50%" }} />
                : <div className="w-full h-full bg-brand-accent" />
              }
              {selectedTier?.name && (
                <span className="absolute top-3 right-3 flex items-center gap-1 bg-brand-card text-brand-text text-xs font-medium px-2.5 py-1.5 rounded-full">
                  <TierIcon size={11} weight="light" className="text-brand-accent" /> {selectedTier.name}
                </span>
              )}
            </div>
            <div className="bg-brand-card px-4 py-3.5">
              <div className="font-medium text-brand-text text-[15px] mb-1">{checkoutEvent.name}</div>
              <div className="flex items-center gap-1.5 text-brand-muted text-xs tabular-nums">
                <Calendar size={11} weight="light" /> {formatDate(checkoutEvent.date)} · <MapPin size={11} weight="light" /> {checkoutEvent.venue}
              </div>
            </div>
          </div>

          {!isFree && (
            <div className="bg-brand-card rounded-2xl border border-brand-hairline px-5 py-4.5 mb-4">
              <div className="text-xs font-medium text-brand-muted tracking-widest mb-3.5">QUANTITY</div>
              <div className="flex items-center gap-4">
                <button onClick={() => setTicketQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 rounded-xl bg-brand-subtle border border-brand-hairline text-brand-text flex items-center justify-center">
                  <Minus size={18} weight="light" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-semibold text-brand-text tracking-tight tabular-nums">{qty}</span>
                  <div className="text-xs text-brand-muted mt-0.5 tabular-nums">
                    × GHS {unitPrice.toLocaleString()} each{selectedTier?.name ? ` (${selectedTier.name})` : ""}
                  </div>
                </div>
                <button onClick={() => setTicketQty(Math.min(5, qty + 1))}
                  className="w-11 h-11 rounded-xl bg-brand-subtle border border-brand-hairline text-brand-text flex items-center justify-center">
                  <Plus size={18} weight="light" />
                </button>
              </div>
            </div>
          )}

          {!isFree && (
            <div className="bg-brand-card rounded-2xl border border-brand-hairline px-5 py-4.5 mb-4">
              <div className="text-xs font-medium text-brand-muted tracking-widest mb-3.5">PAYMENT METHOD</div>
              <div className="flex gap-2.5">
                {[["momo", DeviceMobile, "Mobile Money"], ["card", CreditCard, "Card"]].map(([id, Icon, label]) => (
                  <button key={id} onClick={() => setPayMethod(id)}
                    className={`flex-1 py-3.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-colors ${payMethod === id ? "border-brand-accent bg-[var(--brand-light)]" : "border-brand-hairline bg-brand-card"}`}>
                    <Icon size={19} weight="light" className={payMethod === id ? "text-brand-accent" : "text-brand-muted"} />
                    <span className={`text-[13px] font-semibold ${payMethod === id ? "text-brand-accent" : "text-brand-muted"}`}>{label}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs text-brand-muted mt-3 leading-relaxed">
                {payMethod === "momo"
                  ? "Select your network (MTN, Telecel, AirtelTigo) on the secure Paystack screen."
                  : "Enter your card details on the secure Paystack screen."}
              </div>
            </div>
          )}

          <div className="bg-brand-subtle rounded-2xl p-4 mb-5 border border-brand-hairline">
            <div className="text-xs font-medium text-brand-muted tracking-widest mb-4">ORDER SUMMARY</div>
            {isFree ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-text">1 × Free ticket</span>
                <span className="text-xl font-semibold text-emerald-700">FREE</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between pb-3 mb-3 border-b border-brand-hairline">
                  <span className="text-brand-muted text-sm">{qty} × {selectedTier?.name || "ticket"}{qty > 1 ? "s" : ""}</span>
                  <span className="text-brand-text text-sm font-medium tabular-nums">GHS {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-text font-medium text-[15px]">Total</span>
                  <span className="text-brand-accent font-semibold text-3xl tracking-tight tabular-nums">GHS {total.toLocaleString()}</span>
                </div>
                <div className="text-xs text-brand-muted mt-2.5">
                  The organizer's platform fee is deducted from their payout — nothing added to your total.
                </div>
              </>
            )}
          </div>

          <AnimatePresence>
            {payError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-red-600 text-[13px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <WarningCircle size={14} weight="light" className="shrink-0 mt-0.5" /> {payError}
                </div>
                {/* The message used to end with "request a new one" and give the
                    buyer nothing to press. This is that control. */}
                {/verify|confirm your email/i.test(payError) && <ResendVerification />}
              </motion.div>
            )}
          </AnimatePresence>

          <PrimaryBtn onClick={onPay} loading={paying} disabled={paying}>
            {paying ? "Processing..." : isFree ? "Get Free Ticket" : `Pay GHS ${total.toLocaleString()} →`}
          </PrimaryBtn>

          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[[Lock,"Secured by Paystack"],[Link,"NFT on Polygon"],[DeviceMobile,"MoMo & Card"]].map(([Icon,label]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-brand-muted">
                <Icon size={11} weight="light" /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const dynamicQrRef = useRef(dynamicQR);
  const desktop = isDesktop();

  useEffect(() => {
    if (!viewingTicket?.ticket_id) return;
    const tick = () => {
      const sLeft = 10 - (Math.floor(Date.now() / 1000) % 10);
      setTimeLeft(sLeft);
      if (sLeft === 10) {
        setRefreshing(true);
        ticketsAPI.myTickets().then(data => {
          if (Array.isArray(data)) {
            const updated = data.find(t => t.ticket_id === viewingTicket.ticket_id);
            // Do not reset the loaded state unless the image source actually
            // changes. Otherwise cached images never emit another load event
            // and the QR looks blank after a refresh cycle.
            if (updated?.dynamic_qr && updated.dynamic_qr !== dynamicQrRef.current) {
              dynamicQrRef.current = updated.dynamic_qr;
              setQrError(false);
              setQrLoaded(false);
              setDynamicQR(updated.dynamic_qr);
            }
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
  const onQrError = () => {
    // A dynamic data image can fail transiently. Fall back to the ticket's
    // server-issued backup QR rather than leaving the attendee with a blank
    // panel; only show "unavailable" if that fallback also fails.
    if (dynamicQR) {
      dynamicQrRef.current = null;
      setDynamicQR(null);
      setQrLoaded(false);
      setQrError(false);
    } else {
      setQrError(true);
    }
  };
  const isExpiringSoon = timeLeft <= 3;
  const progressColor  = isExpiringSoon ? "#dc2626" : "#10B981";

  return (
    <div className="bg-brand-subtle h-full overflow-y-auto" style={{ WebkitOverflowScrolling: "touch", paddingBottom: desktop ? "40px" : "100px" }}>
      <div className={`px-4 pt-4 mx-auto ${desktop ? "max-w-[520px]" : ""}`}>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
          className="flex items-center gap-1.5 text-brand-muted text-sm font-medium py-1.5 hover:text-brand-text transition-colors">
          <ArrowLeft size={15} weight="light" /> My Tickets
        </button>
      </div>

      <div className="px-4 py-4">
        <PremiumTicket ev={ev} ownerName={ownerName} qrSrc={qrSrc} qrLoaded={qrLoaded} qrError={qrError}
          refreshing={refreshing} setQrLoaded={setQrLoaded} onQrError={onQrError}
          timeLeft={timeLeft} isExpiringSoon={isExpiringSoon} progressColor={progressColor}
          ticketId={viewingTicket.ticket_id || viewingTicket.id}
          txHash={viewingTicket.nft_tx_hash} tokenId={viewingTicket.nft_token_id}
          status={viewingTicket.status} quantity={viewingTicket.quantity || viewingTicket.qty}
          tierName={viewingTicket.tierName} />
      </div>

      <div className={`mx-auto px-4 pb-2.5 ${desktop ? "max-w-[520px]" : ""}`}>
        <button onClick={() => setShowSecurity(!showSecurity)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-card border border-brand-hairline mb-2.5">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} weight="light" className="text-brand-muted" />
            <span className="text-[13px] font-semibold text-brand-text">Security & Verification</span>
          </span>
          <motion.span animate={{ rotate: showSecurity ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <CaretDown size={14} weight="light" className="text-brand-muted" />
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

      {viewingTicket.status === "active" && (
        <div className={`mx-auto px-4 pb-2.5 flex gap-2.5 ${desktop ? "max-w-[520px]" : ""}`}>
          <button onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            className="flex-1 h-11 rounded-xl bg-[var(--brand-light)] text-brand-accent text-sm font-medium flex items-center justify-center gap-1.5">
            <Tag size={14} weight="light" /> Resell
          </button>
          <button onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            className="flex-1 h-11 rounded-xl bg-brand-subtle border border-brand-hairline text-brand-text text-sm font-medium flex items-center justify-center gap-1.5">
            <ArrowUpRight size={14} weight="light" /> Transfer
          </button>
        </div>
      )}

      <div className={`mx-auto px-4 pb-5 ${desktop ? "max-w-[520px]" : ""}`}>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Done</GhostBtn>
      </div>
    </div>
  );
}

export function Resale() {
  const resaleTicket        = useStore(s => s.resaleTicket);
  const resalePrice         = useStore(s => s.resalePrice);
  const resaleError         = useStore(s => s.resaleError);
  const resaleQty           = useStore(s => s.resaleQty);
  const setResalePrice      = useStore(s => s.setResalePrice);
  const setResaleQty        = useStore(s => s.setResaleQty);
  const handleListForResale = useStore(s => s.handleListForResale);
  const setScreen           = useStore(s => s.setScreen);
  const desktop = isDesktop();

  if (!resaleTicket) return null;
  const ev      = resaleTicket.event;
  const held    = resaleTicket.quantity || 1;
  const qty     = Math.min(Math.max(1, resaleQty || 1), held);
  const price   = parseFloat(resalePrice) || 0;
  const total   = Math.round(price * qty * 100) / 100;
  const fee     = Math.round(total * 0.02 * 100) / 100;
  const payout  = Math.round((total - fee) * 100) / 100;

  return (
    <div className="bg-brand-subtle h-full flex flex-col overflow-hidden">
      <ScreenHeader title="List for Resale" subtitle="NFT ownership transfers on-chain automatically" onBack={() => setScreen("ticketView")} />

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`mx-auto ${desktop ? "max-w-[480px] px-10 py-7" : "px-4 py-5"}`} style={{ paddingBottom: desktop ? "80px" : "80px" }}>

          <div className="bg-brand-card rounded-2xl border border-brand-hairline px-4.5 py-4 mb-4">
            <div className="font-medium text-[15px] text-brand-text mb-1">{ev.name}</div>
            <div className="text-xs text-brand-muted tabular-nums">Original: GHS {ev.price} · Max resale: GHS {ev.price} per ticket</div>
          </div>

          {held > 1 && (
            <div className="flex items-center justify-between bg-brand-card rounded-2xl border border-brand-hairline px-4.5 py-4 mb-4">
              <div>
                <div className="text-[13px] font-medium text-brand-text">How many to list?</div>
                <div className="text-xs text-brand-muted mt-0.5">You hold {held} tickets for this event</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setResaleQty(Math.max(1, qty - 1))} disabled={qty <= 1}
                  className="w-8 h-8 rounded-lg border border-brand-hairline flex items-center justify-center text-brand-text disabled:opacity-30 transition-colors">
                  <Minus size={13} weight="bold" />
                </button>
                <span className="w-6 text-center text-[15px] font-semibold text-brand-text tabular-nums">{qty}</span>
                <button onClick={() => setResaleQty(Math.min(held, qty + 1))} disabled={qty >= held}
                  className="w-8 h-8 rounded-lg border border-brand-hairline flex items-center justify-center text-brand-text disabled:opacity-30 transition-colors">
                  <Plus size={13} weight="bold" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-[var(--brand-light)] rounded-xl px-4 py-3 mb-5">
            <Tag size={16} weight="light" className="text-brand-accent shrink-0" />
            <div>
              <div className="text-xs font-medium text-brand-accent">2% Platform Fee</div>
              <div className="text-xs text-brand-muted mt-0.5">You keep 98% of the resale price</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-medium text-brand-muted tracking-wide mb-2">RESALE PRICE PER TICKET (GHS)</div>
            <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
              placeholder={`Max GHS ${ev.price}`}
              className={`${fieldClass} text-xl font-semibold tracking-tight tabular-nums ${resaleError ? "border-red-300" : ""}`} />
            <AnimatePresence>
              {resaleError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-600 text-xs mt-1.5">{resaleError}</motion.div>
              )}
            </AnimatePresence>
          </div>

          {price > 0 && (
            <div className="bg-brand-subtle rounded-2xl p-4 mb-5 border border-brand-hairline">
              <div className="text-xs font-medium text-brand-muted tracking-wide mb-3">PAYOUT BREAKDOWN</div>
              {[
                [`Listing Price${qty > 1 ? ` (${qty} × GHS ${price})` : ""}`, `GHS ${total}`, "text-brand-text", "font-medium"],
                ["Platform Fee (2%)", `− GHS ${fee}`, "text-brand-muted", "font-medium"],
                ["Your Payout", `GHS ${payout}`, "text-emerald-700", "font-semibold"],
              ].map(([k, v, c, w], i) => (
                <div key={k} className={`flex justify-between py-2.5 ${i < 2 ? "border-b border-brand-hairline" : ""}`}>
                  <span className="text-brand-muted text-[13px]">{k}</span>
                  <span className={`${c} ${w} text-[13px] tabular-nums`}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <PrimaryBtn onClick={handleListForResale}>{qty > 1 ? `List ${qty} Tickets for Resale` : "List for Resale"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

export function ResaleSuccess() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const desktop = isDesktop();

  return (
    <div className={`bg-brand-subtle min-h-full flex items-center justify-center ${desktop ? "p-10" : "p-5"}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-[420px]">
        <div className={`bg-brand-card rounded-2xl border border-brand-hairline mb-3 text-center ${desktop ? "px-10 py-11" : "px-6 py-8"}`}>
          <div className="w-[68px] h-[68px] rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-5">
            <Tag size={28} weight="light" className="text-brand-accent" />
          </div>
          <h2 className="text-xl font-semibold text-brand-text tracking-tight mb-2">Listed for Resale</h2>
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

export function Transfer() {
  const transferTicket   = useStore(s => s.transferTicket);
  const transferEmail    = useStore(s => s.transferEmail);
  const transferName     = useStore(s => s.transferName);
  const transferDone     = useStore(s => s.transferDone);
  const transferQty      = useStore(s => s.transferQty);
  const setTransferEmail = useStore(s => s.setTransferEmail);
  const setTransferName  = useStore(s => s.setTransferName);
  const setTransferQty   = useStore(s => s.setTransferQty);
  const handleTransfer   = useStore(s => s.handleTransfer);
  const setScreen        = useStore(s => s.setScreen);
  const setActiveTab     = useStore(s => s.setActiveTab);
  const [transferring, setTransferring] = useState(false);
  const desktop = isDesktop();

  if (!transferTicket) return null;
  const ev   = transferTicket.event;
  const held = transferTicket.quantity || 1;
  const qty  = Math.min(Math.max(1, transferQty || 1), held);

  const onTransfer = async () => { setTransferring(true); await handleTransfer(); setTransferring(false); };

  if (transferDone) return (
    <div className={`bg-brand-subtle min-h-full flex items-center justify-center ${desktop ? "p-10" : "p-5"}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-[420px]">
        <div className={`bg-brand-card rounded-2xl border border-brand-hairline mb-3 text-center ${desktop ? "px-10 py-11" : "px-6 py-8"}`}>
          <div className="w-[68px] h-[68px] rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} weight="light" className="text-emerald-700" />
          </div>
          <h2 className="text-xl font-semibold text-brand-text tracking-tight mb-2">{qty > 1 ? "Tickets Transferred" : "Ticket Transferred"}</h2>
          <p className="text-brand-muted text-[13px] leading-relaxed mb-7">
            NFT ownership of {qty > 1 ? `${qty} tickets for` : ""} <strong className="text-brand-text">{ev.name}</strong> has been sent to{" "}
            <span className="text-brand-accent font-semibold">{transferName || transferEmail}</span>.
          </p>
          <PrimaryBtn onClick={() => { setScreen("app"); setActiveTab("tickets"); }}>My Tickets</PrimaryBtn>
        </div>
        <GhostBtn onClick={() => { setScreen("app"); setActiveTab("home"); }}>Browse Events</GhostBtn>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-brand-subtle h-full flex flex-col overflow-hidden">
      <ScreenHeader title="Transfer Ticket" subtitle="Permanent on-chain ownership transfer · Free" onBack={() => setScreen("ticketView")} />

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`mx-auto ${desktop ? "max-w-[480px] px-10 py-7" : "px-4 py-5"}`} style={{ paddingBottom: "80px" }}>

          <div className="bg-brand-card rounded-2xl border border-brand-hairline px-4.5 py-4 mb-5">
            <div className="text-xs font-medium text-brand-muted tracking-wide mb-3">BEFORE YOU TRANSFER</div>
            {[
              [Link, "NFT ownership moves to recipient on Polygon"],
              [Prohibit, "Your QR code becomes invalid instantly"],
              [Gift, "Free — no platform fee"],
              [Warning, "Cannot be undone after confirmation"],
            ].map(([Icon, text]) => (
              <div key={text} className="flex gap-2.5 mb-2 items-start last:mb-0">
                <Icon size={14} weight="light" className="text-brand-muted shrink-0 mt-0.5" />
                <span className="text-xs text-brand-text leading-relaxed">{text}</span>
              </div>
            ))}
          </div>

          {held > 1 && (
            <div className="flex items-center justify-between bg-brand-card rounded-2xl border border-brand-hairline px-4.5 py-4 mb-4">
              <div>
                <div className="text-[13px] font-medium text-brand-text">How many to send?</div>
                <div className="text-xs text-brand-muted mt-0.5">You hold {held} tickets for this event</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setTransferQty(Math.max(1, qty - 1))} disabled={qty <= 1}
                  className="w-8 h-8 rounded-lg border border-brand-hairline flex items-center justify-center text-brand-text disabled:opacity-30 transition-colors">
                  <Minus size={13} weight="bold" />
                </button>
                <span className="w-6 text-center text-[15px] font-semibold text-brand-text tabular-nums">{qty}</span>
                <button onClick={() => setTransferQty(Math.min(held, qty + 1))} disabled={qty >= held}
                  className="w-8 h-8 rounded-lg border border-brand-hairline flex items-center justify-center text-brand-text disabled:opacity-30 transition-colors">
                  <Plus size={13} weight="bold" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-xs font-medium text-brand-muted tracking-wide mb-2">RECIPIENT NAME</div>
            <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} className={fieldClass} />
          </div>
          <div className="mb-4">
            <div className="text-xs font-medium text-brand-muted tracking-wide mb-2">RECIPIENT EMAIL</div>
            <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} className={fieldClass} />
          </div>

          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <Warning size={16} weight="light" className="text-red-600 shrink-0" />
            <span className="text-xs text-red-600 font-medium">Double-check the email — this cannot be undone.</span>
          </div>

          <PrimaryBtn onClick={onTransfer} loading={transferring}>
            {transferring ? "Transferring..." : qty > 1 ? `Confirm Transfer of ${qty} Tickets →` : "Confirm Transfer →"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
