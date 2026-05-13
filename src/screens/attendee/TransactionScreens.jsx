import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const inp = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "var(--bg)", border: "1.5px solid var(--border)",
  borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
  caretColor: "var(--brand)",
};

const primaryBtn = {
  width: "100%", padding: "15px 20px",
  background: "var(--brand)",
  color: "#fff", border: "none", borderRadius: "12px",
  fontSize: "15px", fontWeight: 600, cursor: "pointer",
  boxShadow: "var(--shadow-brand)", marginBottom: "12px",
  fontFamily: "var(--font-sans)",
  transition: "all 0.15s ease",
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

function ChainStrip({ txHash, tokenId }) {
  const url = txHash ? `https://polygonscan.com/tx/${txHash}` : null;
  return (
    <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "13px" }}>⛓️</span>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Polygon Blockchain</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
            {tokenId ? `NFT #${tokenId}` : "Minting..."}
          </div>
        </div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed", textDecoration: "none", background: "rgba(124,58,237,0.08)", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap", border: "1px solid rgba(124,58,237,0.15)" }}>
          Verify ↗
        </a>
      ) : (
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: "11px", fontWeight: 500, color: "#7c3aed", background: "rgba(124,58,237,0.06)", padding: "4px 10px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.12)", whiteSpace: "nowrap" }}>
          Minting...
        </motion.div>
      )}
    </div>
  );
}

function OwnershipBadge({ owner }) {
  return (
    <div style={{ background: "var(--success-bg)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
        {owner?.[0]?.toUpperCase() || "U"}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a", letterSpacing: "0.5px", textTransform: "uppercase" }}>Verified Owner</div>
        <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>{owner}</div>
      </div>
      <span style={{ color: "#16a34a", fontSize: "16px" }}>✓</span>
    </div>
  );
}

function SecurityFeatures() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      {[
        ["🔐", "HMAC Secured",    "Rotates every 10s"],
        ["📵", "Screenshot-proof","Dynamic QR only"],
        ["⛓️", "NFT Ownership",   "On Polygon chain"],
        ["🚫", "Single-use scan", "Auto-invalidates"],
      ].map(([icon, title, sub]) => (
        <div key={title} style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "10px 12px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "15px", marginBottom: "4px" }}>{icon}</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Payment Success ───────────────────────────────────────────
export function PaymentSuccess() {
  const setScreen     = useStore(s => s.setScreen);
  const setActiveTab  = useStore(s => s.setActiveTab);
  const viewingTicket = useStore(s => s.viewingTicket);
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const desktop = isDesktop();
  const event   = viewingTicket?.event || checkoutEvent;

  return (
    <PageWrap maxW="480px">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{ background: "var(--bg-card)", borderRadius: "20px", padding: desktop ? "40px 36px" : "28px 20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(22,163,74,0.3)" }}>
            ✅
          </motion.div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Payment Successful</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Your ticket is confirmed. NFT minting on Polygon.</p>
        </div>
        {event && (
          <div style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "14px", marginBottom: "14px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Event</div>
            <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "3px" }}>{event.name}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>📅 {event.date} · 📍 {event.venue}</div>
          </div>
        )}
        <div style={{ marginBottom: "20px" }}>
          <ChainStrip txHash={viewingTicket?.nft_tx_hash} tokenId={viewingTicket?.nft_token_id} />
        </div>
        <button onClick={() => setScreen("ticketView")} style={{ ...primaryBtn, marginBottom: "10px" }}>
          View My Ticket
        </button>
        <button onClick={() => { setScreen("app"); setActiveTab("home"); }}
          style={{ width: "100%", padding: "13px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 500, fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Back to Events
        </button>
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
  const currentUser     = useStore(s => s.currentUser);

  const [paying,   setPaying]   = useState(false);
  const [payError, setPayError] = useState("");
  const desktop = isDesktop();

  if (!checkoutEvent) return null;

  const unitPrice = Math.round(parseFloat(checkoutEvent.price) || 0);
  const qty       = Math.max(1, parseInt(ticketQty) || 1);
  const subtotal  = unitPrice * qty;
  const fee       = Math.round(subtotal * 0.05);
  const total     = subtotal + fee;

  const onPay = async () => {
    if (paying) return;
    setPayError("");
    setPaying(true);

    // ── Free ticket ───────────────────────────────────────────
    if (unitPrice === 0) {
      try {
        await handleBuyTicket("FREE-" + Date.now());
      } catch {
        setPayError("Something went wrong. Please try again.");
        setPaying(false);
      }
      return;
    }

    // ── Validate ──────────────────────────────────────────────
    if (total < 1) {
      setPayError("Invalid ticket price. Please go back and try again.");
      setPaying(false);
      return;
    }

    // ── Load Paystack script ──────────────────────────────────
    try {
      await new Promise((resolve, reject) => {
        if (window.PaystackPop) { resolve(); return; }
        const s = document.createElement("script");
        s.src     = "https://js.paystack.co/v1/inline.js";
        s.onload  = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    } catch {
      setPayError("Failed to load payment gateway. Check your connection.");
      setPaying(false);
      return;
    }

    // ── Initialize on backend (fixes GHS currency issue) ─────
    let accessCode, payRef;
    try {
      const token = localStorage.getItem("access_token") || "";
      const initRes = await fetch(`${API}/api/payments/initialize/`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
    
        },
        body: JSON.stringify({
          amount:     total,
          event_id:   checkoutEvent.id,
          event_name: checkoutEvent.name,
          quantity:   qty,
        }),
      });

      const initData = await initRes.json();
      console.log("[Paystack] Backend init:", initData);

      if (!initRes.ok || !initData.access_code) {
        setPayError(initData.error || "Failed to initialize payment. Please try again.");
        setPaying(false);
        return;
      }

      accessCode = initData.access_code;
      payRef     = initData.reference;
    } catch (err) {
      console.error("[Paystack] Init fetch error:", err);
      setPayError("Connection error initializing payment. Please try again.");
      setPaying(false);
      return;
    }

    console.log("[Paystack] Opening popup, access_code:", accessCode, "ref:", payRef);

    // ── Resume transaction with access_code ───────────────────
    // callback MUST be plain function — no async
    try {
      window.PaystackPop.resumeTransaction(accessCode, {
        onClose: function () {
          setPaying(false);
          setPayError("");
        },
        callback: function (response) {
          var ref = response.reference || payRef;
          console.log("[Paystack] Payment complete, ref:", ref);

          var timeoutId = setTimeout(function () {
            setPaying(false);
            setPayError("Server warming up. Payment received — check My Tickets in ~1 min. Ref: " + ref);
          }, 35000);

          handleBuyTicket(ref)
            .then(function () {
              clearTimeout(timeoutId);
              setPaying(false);
            })
            .catch(function (err) {
              clearTimeout(timeoutId);
              setPaying(false);
              console.error("[Paystack] Backend ticket error:", err);
              setPayError("Payment received but ticket creation failed. Ref: " + ref);
            });
        },
      });
    } catch (err) {
      console.error("[Paystack] resumeTransaction error:", err);
      // Fallback to setup() if resumeTransaction not supported
      try {
        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        const handler = window.PaystackPop.setup({
          key:    paystackKey,
          email:  currentUser?.email,
          amount: total * 100,
          ref:    payRef,
          access_code: accessCode,
          onClose: function () {
            setPaying(false);
            setPayError("");
          },
          callback: function (response) {
            var ref = response.reference || payRef;
            var timeoutId = setTimeout(function () {
              setPaying(false);
              setPayError("Server warming up. Payment received — check My Tickets in ~1 min. Ref: " + ref);
            }, 35000);
            handleBuyTicket(ref)
              .then(function () { clearTimeout(timeoutId); setPaying(false); })
              .catch(function () { clearTimeout(timeoutId); setPaying(false); setPayError("Payment received but ticket creation failed. Ref: " + ref); });
          },
        });
        handler.openIframe();
      } catch (err2) {
        setPayError("Payment gateway error: " + err2.message);
        setPaying(false);
      }
    }
  };

  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0, zIndex: 10 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>
          ←
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Secure Checkout</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>NFT ticket on Polygon after payment</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "99px", background: "var(--success-bg)", border: "1px solid rgba(22,163,74,0.15)", flexShrink: 0 }}>
          <span style={{ color: "#16a34a", fontSize: "10px" }}>🔒</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a" }}>Secured</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ maxWidth: desktop ? "600px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 80px" }}>

          {/* Event banner */}
          <div style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ height: "120px", position: "relative" }}>
              {checkoutEvent.image
                ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "var(--brand)" }} />
              }
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.65))" }} />
              <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>{checkoutEvent.name}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", marginTop: "2px" }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantity</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.max(1, qty - 1))}
                style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-subtle)", color: "var(--text-primary)", border: "1px solid var(--border)", fontSize: "20px", fontWeight: 500, cursor: "pointer" }}>−</motion.button>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", minWidth: "32px", textAlign: "center" }}>{qty}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTicketQty(Math.min(10, qty + 1))}
                style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-subtle)", color: "var(--text-primary)", border: "1px solid var(--border)", fontSize: "20px", fontWeight: 500, cursor: "pointer" }}>+</motion.button>
            </div>
          </div>

          {/* Payment method */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Method</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[["momo","📱 MoMo"],["card","💳 Card"]].map(([id, label]) => (
                <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setPayMethod(id)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 500, fontSize: "14px", fontFamily: "var(--font-sans)", border: payMethod === id ? "1.5px solid var(--brand)" : "1px solid var(--border)", background: payMethod === id ? "var(--brand-light)" : "var(--bg-subtle)", color: payMethod === id ? "var(--brand-dark)" : "var(--text-secondary)", transition: "all 0.15s" }}>
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "16px", marginBottom: "20px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Summary</div>
            {[
              ["Tickets", `${qty} × GHS ${unitPrice}`],
              ["Platform Fee (5%)", `GHS ${fee}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "8px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{k}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "15px" }}>Total</span>
              <span style={{ color: "var(--brand)", fontWeight: 700, fontSize: "22px" }}>GHS {total}</span>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {payError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", color: "var(--error)", fontSize: "13px", lineHeight: 1.5 }}>
                ⚠️ {payError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing */}
          <AnimatePresence>
            {paying && !payError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", marginBottom: "14px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginBottom: "8px" }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                      style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--brand)" }}
                    />
                  ))}
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>Processing payment</div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>Do not close this screen</div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={!paying ? { opacity: 0.88 } : {}}
            whileTap={!paying ? { scale: 0.98 } : {}}
            onClick={onPay} disabled={paying}
            style={{ ...primaryBtn, marginBottom: 0, opacity: paying ? 0.6 : 1 }}>
            {paying ? "Processing..." : unitPrice === 0 ? "Get Free Ticket" : `Pay GHS ${total}`}
          </motion.button>

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
  const formatTime = t => (!t ? "TBA" : t.substring(0, 5));
  const ownerName = viewingTicket.owner ||
    `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() ||
    currentUser?.email || "Ticket Holder";

  const qrSrc = dynamicQR
    ? "data:image/png;base64," + dynamicQR
    : viewingTicket.qr_image_url ||
      (viewingTicket.qr_image
        ? (viewingTicket.qr_image.startsWith("http") ? viewingTicket.qr_image : API + viewingTicket.qr_image)
        : null);

  const isExpiringSoon = timeLeft <= 3;
  const progressColor  = isExpiringSoon ? "#dc2626" : "#16a34a";

  return (
    <div style={{ background: "var(--bg)", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: desktop ? "40px" : "100px" }}>
      <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto" }}>

        <div style={{ height: desktop ? "240px" : "190px", position: "relative", borderRadius: desktop ? "16px 16px 0 0" : 0, overflow: "hidden" }}>
          {ev.image ? <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "var(--brand)" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.82))" }} />
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => { setScreen("app"); setActiveTab("tickets"); }}
            style={{ position: "absolute", top: "14px", left: "14px", width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "#fff" }}>←</motion.div>
          <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "9px", fontWeight: 600, letterSpacing: "2px", marginBottom: "4px" }}>YOUR TICKET</div>
            <div style={{ color: "#fff", fontSize: desktop ? "20px" : "17px", fontWeight: 700, lineHeight: 1.2, marginBottom: "3px" }}>{ev.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>📅 {ev.date} · 📍 {ev.venue}</div>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: desktop ? "0 0 16px 16px" : 0, border: desktop ? "1px solid var(--border)" : "none", borderTop: "none" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <OwnershipBadge owner={ownerName} />
          </div>
          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-around", borderBottom: "1px solid var(--border)" }}>
            {[["DATE", ev.date || "TBA"], ["TIME", formatTime(ev.time)], ["QTY", viewingTicket.qty || viewingTicket.quantity || 1]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "4px", letterSpacing: "1px", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            {qrSrc ? (
              <div style={{ position: "relative" }}>
                {(!qrLoaded && !qrError) && <div className="skeleton" style={{ width: "180px", height: "180px", borderRadius: "12px", position: "absolute", top: 0, left: 0 }} />}
                <AnimatePresence>
                  {refreshing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.92)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, gap: "6px" }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ fontSize: "22px" }}>🔄</motion.div>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>Refreshing QR...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <img src={qrSrc} alt="QR Code" onLoad={() => setQrLoaded(true)} onError={() => setQrError(true)}
                  style={{ width: "180px", height: "180px", borderRadius: "12px", border: `2px solid ${progressColor}`, padding: "6px", background: "#fff", display: qrError ? "none" : "block", transition: "border-color 0.3s" }} />
                {qrError && (
                  <div style={{ width: "180px", height: "180px", borderRadius: "12px", background: "var(--bg-subtle)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", gap: "8px" }}>
                    <span style={{ fontSize: "32px" }}>📱</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>QR unavailable</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: "180px", height: "180px", borderRadius: "12px", background: "var(--bg-subtle)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", gap: "8px" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: "32px" }}>⏳</motion.div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Generating QR...</span>
              </div>
            )}

            {viewingTicket.status === "active" && (
              <div style={{ width: "180px" }}>
                <div style={{ height: "2px", background: "var(--border)", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
                  <motion.div key={timeLeft} initial={{ width: "100%" }} animate={{ width: (timeLeft / 10 * 100) + "%" }} transition={{ duration: 1, ease: "linear" }}
                    style={{ height: "100%", background: progressColor, borderRadius: "2px" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                    style={{ width: "5px", height: "5px", borderRadius: "50%", background: progressColor }} />
                  <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-muted)" }}>QR refreshes in {timeLeft}s</span>
                </div>
              </div>
            )}

            <div style={{ background: "var(--bg-subtle)", padding: "4px 12px", borderRadius: "99px", border: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                {(viewingTicket.ticket_id || viewingTicket.id || "").toString().substring(0, 24)}
              </span>
            </div>
          </div>

          <div style={{ padding: "0 16px 14px" }}>
            <ChainStrip txHash={viewingTicket.nft_tx_hash} tokenId={viewingTicket.nft_token_id} />
          </div>

          <div style={{ padding: "0 16px 14px" }}>
            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowSecurity(!showSecurity)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px" }}>🛡️</span>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>Security & Verification</span>
              </div>
              <motion.span animate={{ rotate: showSecurity ? 180 : 0 }} transition={{ duration: 0.2 }}
                style={{ fontSize: "11px", color: "var(--text-muted)" }}>▼</motion.span>
            </motion.div>
            <AnimatePresence>
              {showSecurity && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                  <div style={{ paddingTop: "10px" }}><SecurityFeatures /></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {viewingTicket.status === "active" && (
            <div style={{ padding: "0 16px 10px", display: "flex", gap: "10px" }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
                style={{ flex: 1, padding: "12px", background: "var(--brand-light)", color: "var(--brand-dark)", border: "1px solid rgba(232,146,15,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Resell
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
                style={{ flex: 1, padding: "12px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Transfer
              </motion.button>
            </div>
          )}
          <div style={{ padding: "0 16px 20px" }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setScreen("app"); setActiveTab("home"); }}
              style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "10px", fontWeight: 500, cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-sans)" }}>
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
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
          style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>List for Resale</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>NFT ownership transfers on-chain automatically</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 80px" }}>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{ev.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Original: GHS {ev.price} · Max resale: GHS {ev.price - 1}</div>
          </div>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>Platform fee</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>2% — you keep 98%</div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>Resale Price (GHS)</div>
            <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
              placeholder={"Max GHS " + (ev.price - 1)}
              style={{ ...inp, fontSize: "20px", fontWeight: 600, borderColor: resaleError ? "var(--error)" : "var(--border)", marginBottom: resaleError ? "6px" : 0 }} />
            <AnimatePresence>
              {resaleError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: "var(--error)", fontSize: "12px", marginTop: "4px" }}>{resaleError}</motion.div>
              )}
            </AnimatePresence>
          </div>
          {price > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--bg-subtle)", borderRadius: "12px", padding: "14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              {[["Listing Price","GHS " + price,"var(--text-primary)"],["Platform Fee (2%)","− GHS " + fee,"var(--error)"],["Your Payout","GHS " + payout,"#16a34a"]].map(([k,v,c],i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{k}</span>
                  <span style={{ color: c, fontWeight: i === 2 ? 600 : 400, fontSize: "13px" }}>{v}</span>
                </div>
              ))}
            </motion.div>
          )}
          <button onClick={handleListForResale} style={{ ...primaryBtn, marginBottom: 0 }}>List for Resale</button>
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
    <PageWrap maxW="440px">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "var(--bg-card)", borderRadius: "20px", padding: desktop ? "40px 36px" : "28px 20px", textAlign: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          style={{ width: "60px", height: "60px", borderRadius: "16px", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px", boxShadow: "var(--shadow-brand)" }}>🏷️</motion.div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Listed for Resale</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" }}>Your ticket is on the marketplace. NFT ownership transfers automatically when sold.</p>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={{ ...primaryBtn, marginBottom: 0 }}>View My Tickets</button>
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
    <PageWrap maxW="440px">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "var(--bg-card)", borderRadius: "20px", padding: desktop ? "40px 36px" : "28px 20px", textAlign: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 16px" }}>✓</motion.div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Ticket Transferred</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" }}>
          NFT ownership of <strong style={{ color: "var(--text-primary)" }}>{ev.name}</strong> sent to{" "}
          <span style={{ color: "var(--brand)", fontWeight: 600 }}>{transferName || transferEmail}</span>.
        </p>
        <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={{ ...primaryBtn, marginBottom: 0 }}>Back to My Tickets</button>
      </motion.div>
    </PageWrap>
  );

  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "14px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setScreen("ticketView")}
          style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Transfer Ticket</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Permanent on-chain ownership transfer · Free</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: desktop ? "520px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 80px" }}>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Note</div>
            {["NFT ownership moves to recipient on Polygon","Your QR becomes invalid instantly","Free — no platform fee","Cannot be undone after confirmation"].map((info, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < 3 ? "4px" : 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>·</span>
                <span>{info}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Recipient Name</div>
          <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={inp} />
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Recipient Email</div>
          <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={inp} />
          <div style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "var(--error)", fontWeight: 500 }}>⚠️ Double-check the email. This cannot be undone.</div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onTransfer} disabled={transferring}
            style={{ ...primaryBtn, background: "#7c3aed", marginBottom: 0, opacity: transferring ? 0.6 : 1 }}>
            {transferring ? "Transferring..." : "Confirm Transfer"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}