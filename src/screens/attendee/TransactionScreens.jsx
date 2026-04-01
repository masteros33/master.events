import React, { useState } from "react";
import useStore from "../../store/useStore";

const BG = "#f8f8f6";
const CARD = "#ffffff";
const BORDER = "#f0f0f0";
const API = "https://master-events-backend.onrender.com";

const input = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "#fff", border: "1.5px solid #f0f0f0",
  borderRadius: "14px", fontSize: "14px", color: "#1a1a1a",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const btn = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "16px",
  fontSize: "15px", fontWeight: 700, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,166,35,0.28)",
  marginBottom: "12px",
};

const backBtn = (onClick) => (
  <div onClick={onClick} style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", color: "#1a1a1a" }}>←</div>
);

export function Checkout() {
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const ticketQty = useStore(s => s.ticketQty);
  const payMethod = useStore(s => s.payMethod);
  const setTicketQty = useStore(s => s.setTicketQty);
  const setPayMethod = useStore(s => s.setPayMethod);
  const handleBuyTicket = useStore(s => s.handleBuyTicket);
  const setScreen = useStore(s => s.setScreen);
  const [paying, setPaying] = useState(false);

  if (!checkoutEvent) return null;
  const subtotal = checkoutEvent.price * ticketQty;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;

  const onPay = async () => {
    setPaying(true);
    await handleBuyTicket();
    setPaying(false);
  };

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        {backBtn(() => setScreen("app"))}
        <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a" }}>Checkout</div>
      </div>

      {/* Event banner */}
      <div style={{ margin: "16px 20px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ height: "140px", position: "relative" }}>
          {checkoutEvent.image
            ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)" }} />
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))" }} />
          <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "18px" }}>{checkoutEvent.name}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Quantity */}
        <div style={{ background: CARD, borderRadius: "20px", padding: "18px", marginBottom: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "14px" }}>Quantity</div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}
              style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#f8f8f6", color: "#f5a623", border: "1.5px solid #f5a623", fontSize: "22px", fontWeight: 700, cursor: "pointer" }}>−</button>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#1a1a1a", minWidth: "40px", textAlign: "center" }}>{ticketQty}</span>
            <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))}
              style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#f8f8f6", color: "#f5a623", border: "1.5px solid #f5a623", fontSize: "22px", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ background: CARD, borderRadius: "20px", padding: "18px", marginBottom: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "14px" }}>Payment Method</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[["momo", "📱 MoMo"], ["visa", "💳 VISA"]].map(([id, label]) => (
              <button key={id} onClick={() => setPayMethod(id)} style={{
                flex: 1, padding: "14px", borderRadius: "14px", cursor: "pointer", fontWeight: 700, fontSize: "14px",
                border: payMethod === id ? "2px solid #f5a623" : "1.5px solid #f0f0f0",
                background: payMethod === id ? "rgba(245,166,35,0.08)" : "#f8f8f6",
                color: payMethod === id ? "#f5a623" : "#aaa",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: CARD, borderRadius: "20px", padding: "18px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "14px" }}>Order Summary</div>
          {[
            ["Tickets", `${ticketQty} × Ghc ${checkoutEvent.price}`],
            ["Platform Fee (5%)", `Ghc ${fee}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #f5f5f5" }}>
              <span style={{ color: "#aaa", fontSize: "14px" }}>{k}</span>
              <span style={{ color: "#1a1a1a", fontSize: "14px", fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#1a1a1a", fontWeight: 700, fontSize: "16px" }}>Total</span>
            <span style={{ color: "#f5a623", fontWeight: 900, fontSize: "24px" }}>Ghc {total}</span>
          </div>
        </div>

        {paying && (
          <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "16px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>⏳</div>
            <div style={{ color: "#f5a623", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Processing Payment...</div>
            <div style={{ color: "#aaa", fontSize: "12px" }}>Minting your NFT ticket on Polygon</div>
          </div>
        )}

        <button onClick={onPay} disabled={paying} style={{ ...btn, opacity: paying ? 0.6 : 1 }}>
          {paying ? "⏳ Processing..." : checkoutEvent.price === 0 ? "🎟️ Get Free Ticket" : `💳 Pay Ghc ${total}`}
        </button>
      </div>
    </div>
  );
}

export function TicketView() {
  const viewingTicket = useStore(s => s.viewingTicket);
  const setScreen = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setResaleTicket = useStore(s => s.setResaleTicket);
  const setResalePrice = useStore(s => s.setResalePrice);
  const setResaleError = useStore(s => s.setResaleError);
  const setTransferTicket = useStore(s => s.setTransferTicket);
  const setTransferEmail = useStore(s => s.setTransferEmail);
  const setTransferName = useStore(s => s.setTransferName);
  const setTransferDone = useStore(s => s.setTransferDone);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);

  if (!viewingTicket) return null;
  const ev = viewingTicket.event;

  const formatTime = (t) => { if (!t) return "TBA"; return t.substring(0, 5); };

  const qrSrc = viewingTicket.qr_base64
    ? `data:image/png;base64,${viewingTicket.qr_base64}`
    : viewingTicket.qr_image
      ? (viewingTicket.qr_image.startsWith('http') ? viewingTicket.qr_image : `${API}${viewingTicket.qr_image}`)
      : null;

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "40px" }}>
      {/* Hero image */}
      <div style={{ height: "220px", position: "relative" }}>
        {ev.image
          ? <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)" }} />
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.8) 100%)" }} />
        {backBtn(() => { setScreen("app"); setActiveTab("tickets"); })}
        <div style={{ position: "absolute", top: "16px", left: "16px" }}>{backBtn(() => { setScreen("app"); setActiveTab("tickets"); })}</div>
        <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", marginBottom: "4px" }}>YOUR TICKET</div>
          <div style={{ color: "#fff", fontSize: "22px", fontWeight: 800 }}>{ev.name}</div>
        </div>
      </div>

      {/* Ticket card */}
      <div style={{ background: "#fff", margin: "16px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        {/* Info row */}
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-around", borderBottom: "1px dashed #f0f0f0" }}>
          {[
            ["📅 DATE", ev.date || "TBA"],
            ["🕐 TIME", formatTime(ev.time || viewingTicket.event?.time)],
            ["💺 QTY", viewingTicket.qty || 1]
          ].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#bbb", fontWeight: 600, marginBottom: "6px", letterSpacing: "1px" }}>{k}</div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#1a1a1a" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* QR code */}
        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          {qrSrc ? (
            <div style={{ position: "relative" }}>
              {!qrLoaded && !qrError && (
                <div style={{ width: "200px", height: "200px", borderRadius: "16px", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: 0, left: 0 }}>
                  <div className="skeleton" style={{ width: "200px", height: "200px", borderRadius: "16px" }} />
                </div>
              )}
              <img src={qrSrc} alt="QR Code"
                onLoad={() => setQrLoaded(true)}
                onError={() => setQrError(true)}
                style={{ width: "200px", height: "200px", borderRadius: "16px", border: "3px solid #f5a623", padding: "6px", background: "#fff", display: qrError ? "none" : "block", boxShadow: "0 4px 20px rgba(245,166,35,0.2)" }}
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
              <span style={{ fontSize: "12px", color: "#aaa" }}>No QR available</span>
            </div>
          )}

          <div style={{ background: "#f8f8f6", padding: "8px 16px", borderRadius: "20px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa", letterSpacing: "1px" }}>{viewingTicket.id}</span>
          </div>

          <div style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)", padding: "8px 20px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#27ae60", fontSize: "14px" }}>✓</span>
            <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 700 }}>Verified on Polygon Blockchain</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 16px 16px", display: "flex", gap: "10px" }}>
          <button onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            style={{ flex: 1, padding: "14px", background: "#f8f8f6", color: "#f5a623", border: "1.5px solid #f5a623", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            🏷️ Resell
          </button>
          <button onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            style={{ flex: 1, padding: "14px", background: "#f8f8f6", color: "#6b6b6b", border: "1.5px solid #f0f0f0", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            📤 Transfer
          </button>
        </div>
        <div style={{ padding: "0 16px 20px" }}>
          <button onClick={() => { setScreen("app"); setActiveTab("home"); }}
            style={{ width: "100%", padding: "14px", background: "rgba(39,174,96,0.08)", border: "1.5px solid rgba(39,174,96,0.25)", color: "#27ae60", borderRadius: "14px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function Resale() {
  const resaleTicket = useStore(s => s.resaleTicket);
  const resalePrice = useStore(s => s.resalePrice);
  const resaleError = useStore(s => s.resaleError);
  const setResalePrice = useStore(s => s.setResalePrice);
  const handleListForResale = useStore(s => s.handleListForResale);
  const setScreen = useStore(s => s.setScreen);
  if (!resaleTicket) return null;
  const ev = resaleTicket.event;
  const price = parseFloat(resalePrice) || 0;
  const fee = Math.round(price * 0.02 * 100) / 100;
  const payout = Math.round((price - fee) * 100) / 100;

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        {backBtn(() => setScreen("ticketView"))}
        <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a" }}>List for Resale</div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Event info */}
        <div style={{ background: CARD, borderRadius: "16px", padding: "16px", marginBottom: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a" }}>{ev.name}</div>
          <div style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>
            Original: Ghc {ev.price} · Max: Ghc {ev.price - 1} · Min: Ghc {Math.floor(ev.price * 0.3)}
          </div>
        </div>

        {/* Fee info */}
        <div style={{ background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.15)", borderRadius: "14px", padding: "12px 16px", marginBottom: "14px" }}>
          <div style={{ fontSize: "13px", color: "#27ae60", fontWeight: 700 }}>✅ Only 2% platform fee on resales</div>
          <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>You keep 98% of your resale price</div>
        </div>

        {/* Price input */}
        <div style={{ background: CARD, borderRadius: "20px", padding: "18px", marginBottom: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "12px" }}>Your Resale Price (Ghc)</div>
          <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number"
            placeholder={`Max: Ghc ${ev.price - 1}`}
            style={{ ...input, fontSize: "22px", fontWeight: 800, border: "2px solid " + (resaleError ? "#e74c3c" : "#f5a623") }} />
          {resaleError && <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "-4px" }}>⚠️ {resaleError}</div>}
        </div>

        {/* Breakdown */}
        {price > 0 && (
          <div style={{ background: CARD, borderRadius: "20px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", marginBottom: "12px" }}>Fee Breakdown</div>
            {[
              ["Listing Price", `Ghc ${price}`, "#1a1a1a"],
              ["Platform Fee (2%)", `− Ghc ${fee}`, "#e74c3c"],
              ["Your Payout", `Ghc ${payout}`, "#27ae60"],
            ].map(([k, v, c], i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #f5f5f5" : "none" }}>
                <span style={{ color: "#aaa", fontSize: "14px" }}>{k}</span>
                <span style={{ color: c, fontWeight: i === 2 ? 800 : 600, fontSize: "14px" }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleListForResale} style={btn}>🏷️ List for Resale</button>
      </div>
    </div>
  );
}

export function ResaleSuccess() {
  const setScreen = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", boxShadow: "0 8px 24px rgba(245,166,35,0.3)" }}>🏷️</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>Listed for Resale!</div>
      <div style={{ color: "#6b6b6b", fontSize: "14px", lineHeight: 1.7, marginBottom: "28px" }}>Your ticket is now on the resale market. You'll be notified when it sells.</div>
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "20px", padding: "20px", marginBottom: "28px", width: "100%", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "8px" }}>✅ Listed on Marketplace</div>
        <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#f5a623", fontWeight: 700 }}>REF: {Math.random().toString(36).substr(2, 12).toUpperCase()}</div>
      </div>
      <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={btn}>View My Tickets</button>
    </div>
  );
}

export function Transfer() {
  const transferTicket = useStore(s => s.transferTicket);
  const transferEmail = useStore(s => s.transferEmail);
  const transferName = useStore(s => s.transferName);
  const transferDone = useStore(s => s.transferDone);
  const setTransferEmail = useStore(s => s.setTransferEmail);
  const setTransferName = useStore(s => s.setTransferName);
  const handleTransfer = useStore(s => s.handleTransfer);
  const setScreen = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const [transferring, setTransferring] = useState(false);

  if (!transferTicket) return null;
  const ev = transferTicket.event;

  const onTransfer = async () => {
    setTransferring(true);
    await handleTransfer();
    setTransferring(false);
  };

  if (transferDone) return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(39,174,96,0.1)", border: "2px solid rgba(39,174,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px" }}>✅</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>Ticket Transferred!</div>
      <div style={{ color: "#6b6b6b", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
        Your ticket for <span style={{ color: "#1a1a1a", fontWeight: 700 }}>{ev.name}</span> has been sent to <span style={{ color: "#f5a623", fontWeight: 700 }}>{transferName || transferEmail}</span>
      </div>
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "20px", padding: "20px", marginBottom: "28px", width: "100%", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "6px" }}>✅ Transfer Complete on Blockchain</div>
        <div style={{ fontSize: "12px", color: "#aaa" }}>Your old QR code is now void. Recipient has a new NFT ticket.</div>
      </div>
      <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={btn}>Back to My Tickets</button>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        {backBtn(() => setScreen("ticketView"))}
        <div style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a" }}>Transfer Ticket</div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Info box */}
        <div style={{ background: "rgba(41,128,185,0.05)", border: "1px solid rgba(41,128,185,0.15)", borderRadius: "16px", padding: "16px 18px", marginBottom: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#2980b9", marginBottom: "10px" }}>ℹ️ About Transfers</div>
          {["Free — no platform fee", "Permanent — you lose ownership forever", "Recipient must have a Master Events account", "Your current QR becomes void instantly"].map((info, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "#6b6b6b" }}>
              <span style={{ color: "#2980b9" }}>•</span><span>{info}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Recipient Full Name</div>
        <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={input} />

        <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b6b6b", marginBottom: "8px" }}>Recipient Email</div>
        <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={input} />

        {/* Warning */}
        <div style={{ background: "#fff5f5", border: "1px solid #ffd6d6", borderRadius: "12px", padding: "12px 16px", marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", color: "#e74c3c", fontWeight: 700, marginBottom: "4px" }}>⚠️ This cannot be undone</div>
          <div style={{ fontSize: "12px", color: "#aaa" }}>Make sure the email address is correct before confirming.</div>
        </div>

        <button onClick={onTransfer} disabled={transferring}
          style={{ ...btn, background: "linear-gradient(135deg, #2980b9, #1a6fa8)", opacity: transferring ? 0.6 : 1 }}>
          {transferring ? "⏳ Transferring..." : "📤 Confirm Transfer"}
        </button>
      </div>
    </div>
  );
}