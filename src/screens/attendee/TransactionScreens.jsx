import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const inp = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "var(--bg)", border: "1.5px solid var(--border)",
  borderRadius: "14px", fontSize: "14px", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
  caretColor: "#f5a623",
};
const primaryBtn = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "15px", fontWeight: 700, cursor: "pointer",
  boxShadow: "var(--shadow-brand)", marginBottom: "12px",
  fontFamily: "var(--font-sans)",
};

function PageWrap({ children, maxW = "600px" }) {
  const desktop = isDesktop();
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "16px" }}>
      <div style={{ maxWidth: desktop ? maxW : "100%", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function BackBtn({ onClick, label }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "8px 14px", borderRadius: "12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", width: "fit-content" }}>
      <span style={{ fontSize: "16px", color: "var(--text-primary)" }}>←</span>
      {label && <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>}
    </motion.div>
  );
}

// ── Payment Success ───────────────────────────────────────────
export function PaymentSuccess() {
  const setScreen     = useStore(s => s.setScreen);
  const setActiveTab  = useStore(s => s.setActiveTab);
  const viewingTicket = useStore(s => s.viewingTicket);
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const desktop = isDesktop();
  const event = viewingTicket?.event || checkoutEvent;

  return (
    <PageWrap maxW="480px">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ background: "var(--bg-card)", borderRadius: "24px", padding: desktop ? "56px 48px" : "32px 24px", textAlign: "center", boxShadow: desktop ? "var(--shadow-lg)" : "var(--shadow-md)", border: "1px solid var(--border)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
          style={{ width: "88px", height: "88px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(22,163,74,0.35)" }}>
          ✅
        </motion.div>
        <h1 style={{ fontSize: desktop ? "28px" : "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Payment Successful!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
          Your ticket is confirmed and your NFT is being minted on Polygon blockchain.
        </p>
        {event && (
          <div style={{ background: "var(--bg-subtle)", borderRadius: "16px", padding: "16px", marginBottom: "20px", textAlign: "left", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "10px", color: "#f5a623", fontWeight: 700, marginBottom: "6px", letterSpacing: "1px" }}>EVENT</div>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", marginBottom: "3px" }}>{event.name}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📅 {event.date} · 📍 {event.venue}</div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", padding: "10px 20px", borderRadius: "20px", marginBottom: "24px" }}>
          <span style={{ fontSize: "14px" }}>⛓️</span>
          <span style={{ color: "#16a34a", fontSize: "12px", fontWeight: 700 }}>NFT minting on Polygon...</span>
        </div>
        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={() => setScreen("ticketView")}
          style={{ ...primaryBtn, marginBottom: "10px" }}>🎟️ View My Ticket</motion.button>
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => { setScreen("app"); setActiveTab("home"); }}
          style={{ width: "100%", padding: "14px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1.5px solid var(--border)", borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Back to Events
        </motion.button>
      </motion.div>
    </PageWrap>
  );
}

// ── Checkout ─────────────────────────────────────────────────
export function Checkout() {
  const checkoutEvent   = useStore(s => s.checkoutEvent);
  const ticketQty       = useStore(s => s.ticketQty);
  const payMethod       = useStore(s => s.payMethod);
  const setTicketQty    = useStore(s => s.setTicketQty);
  const setPayMethod    = useStore(s => s.setPayMethod);
  const handleBuyTicket = useStore(s => s.handleBuyTicket);
  const setScreen       = useStore(s => s.setScreen);
  const [paying, setPaying] = useState(false);
  const desktop = isDesktop();

  if (!checkoutEvent) return null;
  const subtotal = checkoutEvent.price * ticketQty;
  const fee      = Math.round(subtotal * 0.05);
  const total    = subtotal + fee;
  const onPay    = async () => { setPaying(true); await handleBuyTicket(); setPaying(false); };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "0", paddingBottom: desktop ? "40px" : "100px" }}>
      <div style={{ maxWidth: desktop ? "640px" : "100%", margin: "0 auto" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: desktop ? "20px" : 0, overflow: "hidden", boxShadow: desktop ? "var(--shadow-lg)" : "none", border: desktop ? "1px solid var(--border)" : "none" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", position: "sticky", top: 0, zIndex: 10 }}>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
              style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)", flexShrink: 0 }}>
              ←
            </motion.div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Checkout</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Secure · Blockchain verified</div>
            </div>
          </div>

          <div style={{ padding: desktop ? "24px" : "16px 16px 24px" }}>
            {/* Event banner */}
            <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "16px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ height: desktop ? "150px" : "130px", position: "relative" }}>
                {checkoutEvent.image
                  ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)" }} />
                }
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.65))" }} />
                <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: desktop ? "18px" : "16px" }}>{checkoutEvent.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", marginTop: "3px" }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div style={{ background: "var(--bg-subtle)", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "12px" }}>Quantity</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}
                  style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--bg-card)", color: "#f5a623", border: "1.5px solid #f5a623", fontSize: "22px", fontWeight: 700, cursor: "pointer" }}>-</motion.button>
                <span style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", minWidth: "36px", textAlign: "center" }}>{ticketQty}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.min(10, ticketQty + 1))}
                  style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--bg-card)", color: "#f5a623", border: "1.5px solid #f5a623", fontSize: "22px", fontWeight: 700, cursor: "pointer" }}>+</motion.button>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ background: "var(--bg-subtle)", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "12px" }}>Payment Method</div>
              <div style={{ display: "flex", gap: "10px" }}>
                {[["momo","📱 MoMo"],["visa","💳 VISA"]].map(([id, label]) => (
                  <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setPayMethod(id)}
                    style={{ flex: 1, padding: "13px", borderRadius: "13px", cursor: "pointer", fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-sans)", border: payMethod === id ? "2px solid #f5a623" : "1.5px solid var(--border)", background: payMethod === id ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: payMethod === id ? "#f5a623" : "var(--text-muted)", transition: "all 0.2s" }}>
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div style={{ background: "var(--bg-subtle)", borderRadius: "16px", padding: "16px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "12px" }}>Order Summary</div>
              {[["Tickets", ticketQty + " x Ghc " + checkoutEvent.price], ["Platform Fee (5%)", "Ghc " + fee]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{k}</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px" }}>Total</span>
                <span style={{ color: "#f5a623", fontWeight: 900, fontSize: "24px" }}>Ghc {total}</span>
              </div>
            </div>

            <AnimatePresence>
              {paying && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "16px", padding: "16px", marginBottom: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "6px" }}>⏳</div>
                  <div style={{ color: "#f5a623", fontWeight: 700, fontSize: "14px", marginBottom: "3px" }}>Processing Payment...</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Minting your NFT ticket on Polygon</div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 36px rgba(245,166,35,0.4)" }}
              whileTap={{ scale: 0.97 }} onClick={onPay} disabled={paying}
              style={{ ...primaryBtn, marginBottom: 0, opacity: paying ? 0.6 : 1 }}>
              {paying ? "Processing..." : checkoutEvent.price === 0 ? "Get Free Ticket" : "Pay Ghc " + total}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ticket View ───────────────────────────────────────────────
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

  const [dynamicQR,  setDynamicQR]  = useState(viewingTicket?.dynamic_qr || null);
  const [timeLeft,   setTimeLeft]   = useState(10);
  const [qrLoaded,   setQrLoaded]   = useState(false);
  const [qrError,    setQrError]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
  const formatTime = t => (!t ? "TBA" : t.substring(0, 5));

  const qrSrc = dynamicQR
    ? "data:image/png;base64," + dynamicQR
    : viewingTicket.qr_image_url
      ? viewingTicket.qr_image_url
      : viewingTicket.qr_image
        ? (viewingTicket.qr_image.startsWith("http") ? viewingTicket.qr_image : API + viewingTicket.qr_image)
        : null;

  const polygonscanUrl = viewingTicket.nft_tx_hash
    ? "https://polygonscan.com/tx/" + viewingTicket.nft_tx_hash
    : null;
  const isExpiringSoon = timeLeft <= 3;
  const progressColor  = isExpiringSoon ? "#dc2626" : "#16a34a";

  return (
    <div style={{ background: "var(--bg)", height: "100%", overflowY: "auto", paddingBottom: desktop ? "40px" : "100px" }}>
      <div style={{ maxWidth: desktop ? "600px" : "100%", margin: "0 auto" }}>

        {/* Hero image */}
        <div style={{ height: desktop ? "260px" : "200px", position: "relative", borderRadius: desktop ? "20px 20px 0 0" : 0, overflow: "hidden", flexShrink: 0 }}>
          {ev.image
            ? <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)" }} />
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85))" }} />

          {/* Back button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
            style={{ position: "absolute", top: "14px", left: "14px", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "#fff" }}>
            ←
          </motion.div>

          <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px" }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>YOUR TICKET</div>
            <div style={{ color: "#fff", fontSize: desktop ? "22px" : "18px", fontWeight: 800, lineHeight: 1.2 }}>{ev.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", marginTop: "4px" }}>📅 {ev.date} · 📍 {ev.venue}</div>
          </div>
        </div>

        {/* Ticket card */}
        <div style={{ background: "var(--bg-card)", borderRadius: desktop ? "0 0 20px 20px" : 0, overflow: "hidden", boxShadow: desktop ? "var(--shadow-lg)" : "none", border: desktop ? "1px solid var(--border)" : "none" }}>

          {/* Info row */}
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-around", borderBottom: "1px dashed var(--border)" }}>
            {[["DATE", ev.date || "TBA"], ["TIME", formatTime(ev.time)], ["QTY", viewingTicket.qty || viewingTicket.quantity || 1]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "5px", letterSpacing: "1.5px" }}>{k}</div>
                <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* QR section */}
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>

            {/* QR code */}
            {qrSrc ? (
              <div style={{ position: "relative" }}>
                {(!qrLoaded && !qrError) && (
                  <div className="skeleton" style={{ width: "190px", height: "190px", borderRadius: "14px", position: "absolute", top: 0, left: 0 }} />
                )}
                <AnimatePresence>
                  {refreshing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.88)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        style={{ fontSize: "26px" }}>🔄</motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <img src={qrSrc} alt="QR Code"
                  onLoad={() => setQrLoaded(true)} onError={() => setQrError(true)}
                  style={{ width: "190px", height: "190px", borderRadius: "14px", border: `3px solid ${progressColor}`, padding: "6px", background: "#fff", display: qrError ? "none" : "block", boxShadow: `0 4px 24px ${progressColor}33`, transition: "border-color 0.3s, box-shadow 0.3s" }} />
                {qrError && (
                  <div style={{ width: "190px", height: "190px", borderRadius: "14px", background: "var(--bg-subtle)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border)", gap: "8px" }}>
                    <span style={{ fontSize: "36px" }}>📱</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>QR unavailable</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: "190px", height: "190px", borderRadius: "14px", background: "var(--bg-subtle)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border)", gap: "10px" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ fontSize: "36px" }}>⏳</motion.div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Generating QR...</span>
              </div>
            )}

            {/* Countdown progress bar */}
            {viewingTicket.status === "active" && (
              <div style={{ width: "190px" }}>
                <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
                  <motion.div
                    key={timeLeft}
                    initial={{ width: "100%" }}
                    animate={{ width: (timeLeft / 10 * 100) + "%" }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{ height: "100%", background: isExpiringSoon ? "#dc2626" : "#16a34a", borderRadius: "2px" }} />
                </div>
                <motion.div
                  animate={{ backgroundColor: isExpiringSoon ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)" }}
                  style={{ display: "flex", alignItems: "center", gap: "7px", border: `1px solid ${isExpiringSoon ? "rgba(220,38,38,0.22)" : "rgba(22,163,74,0.22)"}`, padding: "7px 14px", borderRadius: "20px", transition: "all 0.3s", justifyContent: "center" }}>
                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                    style={{ width: "7px", height: "7px", borderRadius: "50%", background: progressColor, flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: progressColor }}>
                    {isExpiringSoon ? `⚡ Refreshing in ${timeLeft}s` : `🔒 QR refreshes in ${timeLeft}s`}
                  </span>
                </motion.div>
              </div>
            )}

            {/* Security badge */}
            <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", padding: "5px 12px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "11px" }}>🔐</span>
              <span style={{ color: "#f5a623", fontSize: "10px", fontWeight: 700 }}>HMAC-secured · Screenshot-proof</span>
            </div>

            {/* Ticket ID */}
            <div style={{ background: "var(--bg-subtle)", padding: "6px 14px", borderRadius: "99px", border: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                {(viewingTicket.ticket_id || viewingTicket.id || "").toString().substring(0, 20)}
              </span>
            </div>

            {/* Blockchain badge */}
            {polygonscanUrl ? (
              <a href={polygonscanUrl} target="_blank" rel="noreferrer"
                style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "7px 18px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                <span style={{ color: "#16a34a", fontSize: "13px" }}>✓</span>
                <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>View on Polygonscan</span>
              </a>
            ) : (
              <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "7px 18px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#16a34a", fontSize: "13px" }}>✓</span>
                <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>Verified on Polygon Blockchain</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ padding: "0 16px 12px", display: "flex", gap: "10px" }}>
            {viewingTicket.status === "active" && (
              <>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
                  style={{ flex: 1, padding: "13px", background: "var(--bg-subtle)", color: "#f5a623", border: "1.5px solid #f5a623", borderRadius: "13px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  Resell
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
                  style={{ flex: 1, padding: "13px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1.5px solid var(--border)", borderRadius: "13px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  Transfer
                </motion.button>
              </>
            )}
          </div>
          <div style={{ padding: "0 16px 20px" }}>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { setScreen("app"); setActiveTab("home"); }}
              style={{ width: "100%", padding: "13px", background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.25)", color: "#16a34a", borderRadius: "13px", fontWeight: 700, cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-sans)" }}>
              Done
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Resale ────────────────────────────────────────────────────
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
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "0", paddingBottom: desktop ? "40px" : "100px" }}>
      <div style={{ maxWidth: desktop ? "560px" : "100%", margin: "0 auto" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: desktop ? "20px" : 0, overflow: "hidden", boxShadow: desktop ? "var(--shadow-lg)" : "none", border: desktop ? "1px solid var(--border)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 10 }}>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
              style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)", flexShrink: 0 }}>
              ←
            </motion.div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>List for Resale</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>2% platform fee · You keep 98%</div>
            </div>
          </div>
          <div style={{ padding: desktop ? "24px" : "16px" }}>
            <div style={{ background: "var(--bg-subtle)", borderRadius: "14px", padding: "14px", marginBottom: "14px", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{ev.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "3px" }}>
                Original: Ghc {ev.price} · Max: Ghc {ev.price - 1} · Min: Ghc {Math.floor(ev.price * 0.3)}
              </div>
            </div>
            <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "13px", padding: "12px 14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>Only 2% platform fee on resales</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>You keep 98% of your resale price</div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "8px" }}>Your Resale Price (Ghc)</div>
              <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
                placeholder={"Max: Ghc " + (ev.price - 1)}
                style={{ ...inp, fontSize: "22px", fontWeight: 800, border: "2px solid " + (resaleError ? "var(--error)" : "#f5a623"), marginBottom: resaleError ? "6px" : 0 }} />
              <AnimatePresence>
                {resaleError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: "var(--error)", fontSize: "12px", marginTop: "4px" }}>{resaleError}</motion.div>
                )}
              </AnimatePresence>
            </div>
            {price > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: "var(--bg-subtle)", borderRadius: "14px", padding: "16px", marginBottom: "14px", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "10px" }}>Fee Breakdown</div>
                {[["Listing Price","Ghc " + price,"var(--text-primary)"], ["Platform Fee (2%)","- Ghc " + fee,"var(--error)"], ["Your Payout","Ghc " + payout,"#16a34a"]].map(([k, v, c], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{k}</span>
                    <span style={{ color: c, fontWeight: i === 2 ? 800 : 600, fontSize: "13px" }}>{v}</span>
                  </div>
                ))}
              </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
              whileTap={{ scale: 0.97 }} onClick={handleListForResale}
              style={{ ...primaryBtn, marginBottom: 0 }}>
              List for Resale
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Resale Success ────────────────────────────────────────────
export function ResaleSuccess() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const desktop = isDesktop();

  return (
    <PageWrap maxW="480px">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "var(--bg-card)", borderRadius: "24px", padding: desktop ? "56px 48px" : "32px 24px", textAlign: "center", boxShadow: desktop ? "var(--shadow-lg)" : "var(--shadow-md)", border: "1px solid var(--border)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
          style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px", boxShadow: "var(--shadow-brand)" }}>🏷️</motion.div>
        <h1 style={{ fontSize: desktop ? "26px" : "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Listed for Resale!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>Your ticket is now on the resale market. You will be notified when it sells.</p>
        <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700, marginBottom: "6px" }}>Listed on Marketplace</div>
          <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#f5a623", fontWeight: 700 }}>
            REF: {Math.random().toString(36).substr(2, 12).toUpperCase()}
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
          whileTap={{ scale: 0.97 }} onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
          style={{ ...primaryBtn, marginBottom: 0 }}>
          View My Tickets
        </motion.button>
      </motion.div>
    </PageWrap>
  );
}

// ── Transfer ──────────────────────────────────────────────────
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
    <PageWrap maxW="480px">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "var(--bg-card)", borderRadius: "24px", padding: desktop ? "56px 48px" : "32px 24px", textAlign: "center", boxShadow: desktop ? "var(--shadow-lg)" : "var(--shadow-md)", border: "1px solid var(--border)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
          style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 20px" }}>✅</motion.div>
        <h1 style={{ fontSize: desktop ? "26px" : "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Ticket Transferred!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
          Your ticket for <strong style={{ color: "var(--text-primary)" }}>{ev.name}</strong> has been sent to{" "}
          <span style={{ color: "#f5a623", fontWeight: 700 }}>{transferName || transferEmail}</span>
        </p>
        <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700, marginBottom: "5px" }}>Transfer Complete on Blockchain</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Your old QR code is now void. Recipient has a new NFT ticket.</div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
          style={{ ...primaryBtn, marginBottom: 0 }}>
          Back to My Tickets
        </motion.button>
      </motion.div>
    </PageWrap>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "0", paddingBottom: desktop ? "40px" : "100px" }}>
      <div style={{ maxWidth: desktop ? "560px" : "100%", margin: "0 auto" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: desktop ? "20px" : 0, overflow: "hidden", boxShadow: desktop ? "var(--shadow-lg)" : "none", border: desktop ? "1px solid var(--border)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 10 }}>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
              style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)", flexShrink: 0 }}>
              ←
            </motion.div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Transfer Ticket</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Free · Permanent · Blockchain verified</div>
            </div>
          </div>
          <div style={{ padding: desktop ? "24px" : "16px" }}>
            <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "14px", padding: "14px", marginBottom: "18px" }}>
              <div style={{ fontWeight: 700, fontSize: "12px", color: "#2563eb", marginBottom: "8px" }}>About Transfers</div>
              {["Free — no platform fee", "Permanent — you lose ownership forever", "Recipient must have a Master Events account", "Your current QR becomes void instantly"].map((info, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < 3 ? "5px" : 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span style={{ color: "#2563eb", flexShrink: 0 }}>•</span>
                  <span>{info}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Recipient Full Name</div>
            <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={inp} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Recipient Email</div>
            <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={inp} />
            <div style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "10px 14px", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "var(--error)", fontWeight: 700, marginBottom: "2px" }}>This cannot be undone</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Make sure the email address is correct before confirming.</div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onTransfer} disabled={transferring}
              style={{ ...primaryBtn, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", marginBottom: 0, opacity: transferring ? 0.6 : 1 }}>
              {transferring ? "Transferring..." : "Confirm Transfer"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}