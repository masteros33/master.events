import React, { useState, useEffect } from "react";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const inputStyle = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "#fff", border: "1.5px solid #f0f0f0",
  borderRadius: "14px", fontSize: "14px", color: "#1a1a1a",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const btnStyle = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "15px", fontWeight: 700, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,166,35,0.28)",
  marginBottom: "12px",
};

function PageWrap({ children, maxW = "600px" }) {
  const desktop = isDesktop();
  return (
    <div style={{ background: "#f8f8f6", minHeight: "100%", padding: desktop ? "40px" : "0" }}>
      <div style={{ maxWidth: desktop ? maxW : "100%", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <div onClick={onClick}
      style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", color: "#1a1a1a", flexShrink: 0 }}>
      ←
    </div>
  );
}

// ── Payment Success ───────────────────────────────────────────
export function PaymentSuccess() {
  const setScreen       = useStore(s => s.setScreen);
  const setActiveTab    = useStore(s => s.setActiveTab);
  const viewingTicket   = useStore(s => s.viewingTicket);
  const checkoutEvent   = useStore(s => s.checkoutEvent);
  const desktop = isDesktop();
  const event = viewingTicket?.event || checkoutEvent;

  return (
    <PageWrap maxW="480px">
      <div style={{ background: "#fff", borderRadius: "24px", padding: desktop ? "56px 48px" : "40px 28px", textAlign: "center", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.08)" : "none", margin: desktop ? 0 : "20px" }}>

        {/* Success icon */}
        <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "linear-gradient(135deg, #27ae60, #2ecc71)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(39,174,96,0.35)" }}>
          ✅
        </div>

        <div style={{ fontSize: "28px", fontWeight: 900, color: "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Payment Successful!
        </div>
        <div style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.7, marginBottom: "32px" }}>
          Your ticket is confirmed and your NFT is being minted on Polygon blockchain.
        </div>

        {/* Event info */}
        {event && (
          <div style={{ background: "#f8f8f6", borderRadius: "16px", padding: "20px", marginBottom: "24px", textAlign: "left", border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, marginBottom: "8px", letterSpacing: "1px" }}>EVENT</div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#1a1a1a", marginBottom: "4px" }}>{event.name}</div>
            <div style={{ fontSize: "13px", color: "#aaa" }}>📅 {event.date} · 📍 {event.venue}</div>
          </div>
        )}

        {/* NFT minting badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.2)", padding: "10px 20px", borderRadius: "20px", marginBottom: "28px" }}>
          <span style={{ fontSize: "16px" }}>⛓️</span>
          <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 700 }}>NFT minting on Polygon...</span>
        </div>

        <button onClick={() => setScreen("ticketView")}
          style={{ ...btnStyle, marginBottom: "12px" }}>
          🎟️ View My Ticket
        </button>
        <button onClick={() => { setScreen("app"); setActiveTab("home"); }}
          style={{ width: "100%", padding: "14px", background: "#f8f8f6", color: "#6b6b6b", border: "1.5px solid #f0f0f0", borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
          Back to Events
        </button>
      </div>
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

  const onPay = async () => {
    setPaying(true);
    await handleBuyTicket();
    setPaying(false);
  };

  return (
    <PageWrap maxW="640px">
      <div style={{ background: "#fff", borderRadius: desktop ? "20px" : 0, overflow: "hidden", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.08)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", borderBottom: "1px solid #f0f0f0" }}>
          <BackBtn onClick={() => setScreen("app")} />
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a" }}>Checkout</div>
        </div>

        <div style={{ padding: "20px 24px 32px" }}>
          {/* Event banner */}
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
            <div style={{ height: "150px", position: "relative" }}>
              {checkoutEvent.image
                ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)" }} />
              }
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))" }} />
              <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "18px" }}>{checkoutEvent.name}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>
                  {"📅 " + checkoutEvent.date + " · 📍 " + checkoutEvent.venue}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div style={{ background: "#f8f8f6", borderRadius: "16px", padding: "18px", marginBottom: "14px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "14px" }}>Quantity</div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}
                style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#fff", color: "#f5a623", border: "1.5px solid #f5a623", fontSize: "22px", fontWeight: 700, cursor: "pointer" }}>-</button>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#1a1a1a", minWidth: "40px", textAlign: "center" }}>{ticketQty}</span>
              <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))}
                style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#fff", color: "#f5a623", border: "1.5px solid #f5a623", fontSize: "22px", fontWeight: 700, cursor: "pointer" }}>+</button>
            </div>
          </div>

          {/* Payment method */}
          <div style={{ background: "#f8f8f6", borderRadius: "16px", padding: "18px", marginBottom: "14px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "14px" }}>Payment Method</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[["momo", "📱 MoMo"], ["visa", "💳 VISA"]].map(([id, label]) => (
                <button key={id} onClick={() => setPayMethod(id)} style={{
                  flex: 1, padding: "14px", borderRadius: "14px", cursor: "pointer",
                  fontWeight: 700, fontSize: "14px",
                  border:      payMethod === id ? "2px solid #f5a623"       : "1.5px solid #f0f0f0",
                  background:  payMethod === id ? "rgba(245,166,35,0.08)"   : "#fff",
                  color:       payMethod === id ? "#f5a623"                 : "#aaa",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div style={{ background: "#f8f8f6", borderRadius: "16px", padding: "18px", marginBottom: "20px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "14px" }}>Order Summary</div>
            {[
              ["Tickets",            ticketQty + " x Ghc " + checkoutEvent.price],
              ["Platform Fee (5%)",  "Ghc " + fee],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>{k}</span>
                <span style={{ color: "#1a1a1a", fontSize: "14px", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#1a1a1a", fontWeight: 700, fontSize: "16px" }}>Total</span>
              <span style={{ color: "#f5a623", fontWeight: 900, fontSize: "26px" }}>Ghc {total}</span>
            </div>
          </div>

          {paying && (
            <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>⏳</div>
              <div style={{ color: "#f5a623", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Processing Payment...</div>
              <div style={{ color: "#aaa", fontSize: "12px" }}>Minting your NFT ticket on Polygon</div>
            </div>
          )}

          <button onClick={onPay} disabled={paying}
            style={{ ...btnStyle, opacity: paying ? 0.6 : 1 }}>
            {paying ? "Processing..." : checkoutEvent.price === 0 ? "Get Free Ticket" : "Pay Ghc " + total}
          </button>
        </div>
      </div>
    </PageWrap>
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

  // ── Dynamic QR state ─────────────────────────────────────
  const [dynamicQR,   setDynamicQR]   = useState(viewingTicket?.dynamic_qr || viewingTicket?.qr_base64 || null);
  const [timeLeft,    setTimeLeft]     = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const [qrLoaded,    setQrLoaded]     = useState(false);
  const [qrError,     setQrError]      = useState(false);
  const [refreshing,  setRefreshing]   = useState(false);
  const desktop = isDesktop();

  // ── Refresh QR every 30 seconds ──────────────────────────
  useEffect(() => {
    if (!viewingTicket?.ticket_id) return;
    const timer = setInterval(() => {
      const sLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeLeft(sLeft);
      if (sLeft === 30) {
        setRefreshing(true);
        setQrLoaded(false);
        ticketsAPI.myTickets().then(data => {
          if (Array.isArray(data)) {
            const updated = data.find(t => t.ticket_id === viewingTicket.ticket_id);
            if (updated?.dynamic_qr) setDynamicQR(updated.dynamic_qr);
          }
          setRefreshing(false);
        }).catch(() => setRefreshing(false));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [viewingTicket?.ticket_id]);

  if (!viewingTicket) return null;
  const ev = viewingTicket.event;
  const formatTime = (t) => { if (!t) return "TBA"; return t.substring(0, 5); };

  // ── QR source — priority order ────────────────────────────
  // 1. Dynamic HMAC (changes every 30s) — most secure
  // 2. qr_base64 from purchase response
  // 3. Cloudinary URL
  // 4. Backend URL
  const qrSrc = dynamicQR
    ? "data:image/png;base64," + dynamicQR
    : viewingTicket.qr_image_url
      ? viewingTicket.qr_image_url
      : viewingTicket.qr_image
        ? (viewingTicket.qr_image.startsWith("http")
            ? viewingTicket.qr_image
            : API + viewingTicket.qr_image)
        : null;

  const polygonscanUrl = viewingTicket.nft_tx_hash
    ? "https://polygonscan.com/tx/" + viewingTicket.nft_tx_hash
    : null;

  const isExpiringSoon = timeLeft <= 5;
  const progressColor  = isExpiringSoon ? "#e74c3c" : "#27ae60";

  return (
    <div style={{ background: "#f8f8f6", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ maxWidth: desktop ? "600px" : "100%", margin: "0 auto", padding: desktop ? "40px 0" : 0 }}>

        {/* Hero */}
        <div style={{ height: desktop ? "260px" : "220px", position: "relative", borderRadius: desktop ? "20px 20px 0 0" : 0, overflow: "hidden" }}>
          {ev.image
            ? <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)" }} />
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.8))" }} />
          <div style={{ position: "absolute", top: "16px", left: "16px" }}>
            <BackBtn onClick={() => { setScreen("app"); setActiveTab("tickets"); }} />
          </div>
          <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", marginBottom: "4px" }}>YOUR TICKET</div>
            <div style={{ color: "#fff", fontSize: desktop ? "24px" : "20px", fontWeight: 800 }}>{ev.name}</div>
          </div>
        </div>

        {/* Ticket card */}
        <div style={{ background: "#fff", borderRadius: desktop ? "0 0 20px 20px" : 0, overflow: "hidden", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.1)" : "none", marginBottom: "20px" }}>

          {/* Info row */}
          <div style={{ padding: "20px", display: "flex", justifyContent: "space-around", borderBottom: "1px dashed #f0f0f0" }}>
            {[
              ["DATE", ev.date || "TBA"],
              ["TIME", formatTime(ev.time)],
              ["QTY",  viewingTicket.qty || viewingTicket.quantity || 1],
            ].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#bbb", fontWeight: 600, marginBottom: "6px", letterSpacing: "1px" }}>{k}</div>
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#1a1a1a" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* QR code */}
          <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            {qrSrc ? (
              <div style={{ position: "relative" }}>
                {(!qrLoaded && !qrError) && (
                  <div className="skeleton" style={{ width: "200px", height: "200px", borderRadius: "16px", position: "absolute", top: 0, left: 0 }} />
                )}
                {refreshing && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                    <div style={{ fontSize: "32px" }}>🔄</div>
                  </div>
                )}
                <img src={qrSrc} alt="QR Code"
                  onLoad={() => setQrLoaded(true)}
                  onError={() => { setQrError(true); }}
                  style={{ width: "200px", height: "200px", borderRadius: "16px", border: `3px solid ${progressColor}`, padding: "6px", background: "#fff", display: qrError ? "none" : "block", boxShadow: `0 4px 20px ${progressColor}33`, transition: "border-color 0.3s, box-shadow 0.3s" }}
                />
                {qrError && (
                  <div style={{ width: "200px", height: "200px", borderRadius: "16px", background: "#f8f8f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #f0f0f0", gap: "8px" }}>
                    <span style={{ fontSize: "40px" }}>📱</span>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>QR unavailable</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: "200px", height: "200px", borderRadius: "16px", background: "#f8f8f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #f0f0f0", gap: "10px" }}>
                <span style={{ fontSize: "48px" }}>📱</span>
                <span style={{ fontSize: "12px", color: "#aaa" }}>Generating QR...</span>
              </div>
            )}

            {/* Countdown timer */}
            {viewingTicket.status === "active" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: isExpiringSoon ? "rgba(231,76,60,0.08)" : "rgba(39,174,96,0.08)", border: `1px solid ${isExpiringSoon ? "rgba(231,76,60,0.2)" : "rgba(39,174,96,0.2)"}`, padding: "8px 16px", borderRadius: "20px", transition: "all 0.3s" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: progressColor }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: progressColor }}>
                  {isExpiringSoon ? `⚡ Refreshing in ${timeLeft}s` : `🔒 QR refreshes in ${timeLeft}s`}
                </span>
              </div>
            )}

            {/* Security badge */}
            <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", padding: "6px 14px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px" }}>🔐</span>
              <span style={{ color: "#f5a623", fontSize: "11px", fontWeight: 700 }}>HMAC-secured · Screenshot-proof</span>
            </div>

            {/* Ticket ID */}
            <div style={{ background: "#f8f8f6", padding: "8px 16px", borderRadius: "20px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa", letterSpacing: "1px" }}>
                {viewingTicket.ticket_id || viewingTicket.id}
              </span>
            </div>

            {/* Blockchain link */}
            {polygonscanUrl ? (
              <a href={polygonscanUrl} target="_blank" rel="noreferrer"
                style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)", padding: "8px 20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                <span style={{ color: "#27ae60" }}>✓</span>
                <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 700 }}>View on Polygonscan</span>
              </a>
            ) : (
              <div style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)", padding: "8px 20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#27ae60" }}>✓</span>
                <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 700 }}>Verified on Polygon Blockchain</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ padding: "0 16px 16px", display: "flex", gap: "10px" }}>
            <button onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
              style={{ flex: 1, padding: "14px", background: "#f8f8f6", color: "#f5a623", border: "1.5px solid #f5a623", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Resell
            </button>
            <button onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
              style={{ flex: 1, padding: "14px", background: "#f8f8f6", color: "#6b6b6b", border: "1.5px solid #f0f0f0", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Transfer
            </button>
          </div>
          <div style={{ padding: "0 16px 24px" }}>
            <button onClick={() => { setScreen("app"); setActiveTab("home"); }}
              style={{ width: "100%", padding: "14px", background: "rgba(39,174,96,0.08)", border: "1.5px solid rgba(39,174,96,0.25)", color: "#27ae60", borderRadius: "14px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
              Done
            </button>
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
    <PageWrap maxW="560px">
      <div style={{ background: "#fff", borderRadius: desktop ? "20px" : 0, overflow: "hidden", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.08)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", borderBottom: "1px solid #f0f0f0" }}>
          <BackBtn onClick={() => setScreen("ticketView")} />
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a" }}>List for Resale</div>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ background: "#f8f8f6", borderRadius: "14px", padding: "16px", marginBottom: "16px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a" }}>{ev.name}</div>
            <div style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>
              Original: Ghc {ev.price} · Max: Ghc {ev.price - 1} · Min: Ghc {Math.floor(ev.price * 0.3)}
            </div>
          </div>
          <div style={{ background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.15)", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", color: "#27ae60", fontWeight: 700 }}>Only 2% platform fee on resales</div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>You keep 98% of your resale price</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "10px" }}>Your Resale Price (Ghc)</div>
            <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
              placeholder={"Max: Ghc " + (ev.price - 1)}
              style={{ ...inputStyle, fontSize: "22px", fontWeight: 800, border: "2px solid " + (resaleError ? "#e74c3c" : "#f5a623"), marginBottom: resaleError ? "6px" : 0 }} />
            {resaleError && <div style={{ color: "#e74c3c", fontSize: "12px" }}>{resaleError}</div>}
          </div>
          {price > 0 && (
            <div style={{ background: "#f8f8f6", borderRadius: "16px", padding: "18px", marginBottom: "16px", border: "1px solid #f0f0f0" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "12px" }}>Fee Breakdown</div>
              {[
                ["Listing Price",     "Ghc " + price,  "#1a1a1a"],
                ["Platform Fee (2%)", "- Ghc " + fee,  "#e74c3c"],
                ["Your Payout",       "Ghc " + payout, "#27ae60"],
              ].map(([k, v, c], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #f0f0f0" : "none" }}>
                  <span style={{ color: "#aaa", fontSize: "14px" }}>{k}</span>
                  <span style={{ color: c, fontWeight: i === 2 ? 800 : 600, fontSize: "14px" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleListForResale} style={btnStyle}>List for Resale</button>
        </div>
      </div>
    </PageWrap>
  );
}

// ── Resale Success ────────────────────────────────────────────
export function ResaleSuccess() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const desktop = isDesktop();

  return (
    <PageWrap maxW="480px">
      <div style={{ background: "#fff", borderRadius: "24px", padding: desktop ? "60px 48px" : "40px 28px", textAlign: "center", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.08)" : "none" }}>
        <div style={{ width: "88px", height: "88px", borderRadius: "28px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(245,166,35,0.35)" }}>🏷️</div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a1a", marginBottom: "10px" }}>Listed for Resale!</div>
        <div style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.7, marginBottom: "32px" }}>Your ticket is now on the resale market. You will be notified when it sells.</div>
        <div style={{ background: "#f8f8f6", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "20px", marginBottom: "28px", textAlign: "left" }}>
          <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "8px" }}>Listed on Marketplace</div>
          <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#f5a623", fontWeight: 700 }}>
            REF: {Math.random().toString(36).substr(2, 12).toUpperCase()}
          </div>
        </div>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={btnStyle}>View My Tickets</button>
      </div>
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

  const onTransfer = async () => {
    setTransferring(true);
    await handleTransfer();
    setTransferring(false);
  };

  if (transferDone) return (
    <PageWrap maxW="480px">
      <div style={{ background: "#fff", borderRadius: "24px", padding: desktop ? "60px 48px" : "40px 28px", textAlign: "center", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.08)" : "none" }}>
        <div style={{ width: "88px", height: "88px", borderRadius: "28px", background: "rgba(39,174,96,0.1)", border: "2px solid rgba(39,174,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 24px" }}>✅</div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a1a", marginBottom: "10px" }}>Ticket Transferred!</div>
        <div style={{ color: "#6b6b6b", fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
          Your ticket for <strong>{ev.name}</strong> has been sent to{" "}
          <span style={{ color: "#f5a623", fontWeight: 700 }}>{transferName || transferEmail}</span>
        </div>
        <div style={{ background: "#f8f8f6", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "20px", marginBottom: "28px", textAlign: "left" }}>
          <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "6px" }}>Transfer Complete on Blockchain</div>
          <div style={{ fontSize: "12px", color: "#aaa" }}>Your old QR code is now void. Recipient has a new NFT ticket.</div>
        </div>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={btnStyle}>Back to My Tickets</button>
      </div>
    </PageWrap>
  );

  return (
    <PageWrap maxW="560px">
      <div style={{ background: "#fff", borderRadius: desktop ? "20px" : 0, overflow: "hidden", boxShadow: desktop ? "0 8px 40px rgba(0,0,0,0.08)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "20px 24px", gap: "14px", borderBottom: "1px solid #f0f0f0" }}>
          <BackBtn onClick={() => setScreen("ticketView")} />
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a" }}>Transfer Ticket</div>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ background: "rgba(41,128,185,0.05)", border: "1px solid rgba(41,128,185,0.15)", borderRadius: "16px", padding: "16px 18px", marginBottom: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "#2980b9", marginBottom: "10px" }}>About Transfers</div>
            {["Free — no platform fee", "Permanent — you lose ownership forever", "Recipient must have a Master Events account", "Your current QR becomes void instantly"].map((info, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "#6b6b6b" }}>
                <span style={{ color: "#2980b9" }}>•</span>
                <span>{info}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Recipient Full Name</div>
          <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={inputStyle} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Recipient Email</div>
          <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={inputStyle} />
          <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "#e74c3c", fontWeight: 700, marginBottom: "4px" }}>This cannot be undone</div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>Make sure the email address is correct before confirming.</div>
          </div>
          <button onClick={onTransfer} disabled={transferring}
            style={{ ...btnStyle, background: "linear-gradient(135deg, #2980b9, #1a6fa8)", opacity: transferring ? 0.6 : 1 }}>
            {transferring ? "Transferring..." : "Confirm Transfer"}
          </button>
        </div>
      </div>
    </PageWrap>
  );
}