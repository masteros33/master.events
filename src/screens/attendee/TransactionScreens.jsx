import React, { useState } from "react";
import useStore from "../../store/useStore";

const BG = "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(245,166,35,0.15)";

const darkInput = {
  width: "100%", padding: "14px 18px", marginBottom: "14px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,166,35,0.2)",
  borderRadius: "14px", fontSize: "14px", color: "#fff",
  outline: "none", fontFamily: "sans-serif", boxSizing: "border-box",
  caretColor: "#f5a623",
};

const darkBtn = {
  width: "100%", padding: "16px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "50px",
  fontSize: "15px", fontWeight: 800, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,166,35,0.35)",
};

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
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <div onClick={() => setScreen("app")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "16px" }}>←</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>Checkout</div>
      </div>

      <div style={{ margin: "0 20px 20px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
        <div style={{ height: "120px", position: "relative" }}>
          {checkoutEvent.image
            ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "#f5a623" }} />
          }
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>{checkoutEvent.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", padding: "18px", marginBottom: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "14px" }}>Quantity</div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>-</button>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#fff", minWidth: "40px", textAlign: "center" }}>{ticketQty}</span>
            <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>

        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", padding: "18px", marginBottom: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "14px" }}>Payment Method</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[["momo", "📱 MoMo"], ["visa", "💳 VISA"]].map(([id, label]) => (
              <button key={id} onClick={() => setPayMethod(id)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid " + (payMethod === id ? "#f5a623" : "rgba(255,255,255,0.1)"), background: payMethod === id ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)", color: payMethod === id ? "#f5a623" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", padding: "18px", marginBottom: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "14px" }}>Summary</div>
          {[["Tickets", ticketQty + " x Ghc " + checkoutEvent.price], ["Platform Fee (5%)", "Ghc " + fee]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{k}</span>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>Total</span>
            <span style={{ color: "#f5a623", fontWeight: 800, fontSize: "18px" }}>Ghc {total}</span>
          </div>
        </div>

        {/* Payment processing overlay */}
        {paying && (
          <div style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "20px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
            <div style={{ color: "#f5a623", fontWeight: 700, fontSize: "16px" }}>Processing Payment...</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "4px" }}>Please wait, minting your NFT ticket</div>
          </div>
        )}

        <button onClick={onPay} disabled={paying} style={{ ...darkBtn, opacity: paying ? 0.6 : 1 }}>
          {paying ? "⏳ Processing..." : checkoutEvent.price === 0 ? "🎟️ GET FREE TICKET" : "💳 PAY Ghc " + total}
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
  if (!viewingTicket) return null;
  const ev = viewingTicket.event;

  // Format time properly
  const formatTime = (t) => {
    if (!t) return "TBA";
    return t.substring(0, 5);
  };

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "100px" }}>
      <div style={{ height: "220px", position: "relative" }}>
        {ev.image
          ? <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
          : <div style={{ width: "100%", height: "100%", background: "#f5a623" }} />
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(17,9,0,0.3) 0%, rgba(17,9,0,0.92) 100%)" }} />
        <div onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245,166,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</div>
        <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
          <div style={{ color: "#f5a623", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>YOUR TICKET</div>
          <div style={{ color: "#fff", fontSize: "22px", fontWeight: 800 }}>{ev.name}</div>
        </div>
      </div>

      <div style={{ background: "rgba(30,18,0,0.9)", margin: "20px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(245,166,35,0.2)" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-around", borderBottom: "1px dashed rgba(245,166,35,0.2)" }}>
          {[
            ["📅 DATE", ev.date || "TBA"],
            ["🕐 TIME", formatTime(ev.time || viewingTicket.event?.time)],
            ["💺 QTY", viewingTicket.qty || 1]
          ].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: "4px" }}>{k}</div>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "#fff" }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          {viewingTicket.qr_base64 ? (
            <img
              src={`data:image/png;base64,${viewingTicket.qr_base64}`}
              alt="QR Code"
              style={{ width: "180px", height: "180px", borderRadius: "12px", border: "3px solid rgba(245,166,35,0.5)", background: "#fff", padding: "4px" }}
            />
          ) : viewingTicket.qr_image ? (
            <img
              src={`https://master-events-backend.onrender.com${viewingTicket.qr_image}`}
              alt="QR Code"
              style={{ width: "180px", height: "180px", borderRadius: "12px", border: "3px solid rgba(245,166,35,0.5)", background: "#fff", padding: "4px" }}
            />
          ) : (
            <div style={{ width: "180px", height: "180px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#aaa", border: "1px solid rgba(245,166,35,0.2)", gap: "8px" }}>
              <span style={{ fontSize: "40px" }}>📱</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Loading QR...</span>
            </div>
          )}
          <div style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "2px" }}>{viewingTicket.id}</div>
          <div style={{ background: "rgba(39,174,96,0.15)", border: "1px solid rgba(39,174,96,0.3)", padding: "6px 14px", borderRadius: "20px" }}>
            <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 700 }}>✓ Verified on Blockchain</span>
          </div>
        </div>

        <div style={{ padding: "0 20px 16px", display: "flex", gap: "10px" }}>
          <button onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }}
            style={{ flex: 1, padding: "14px", background: "rgba(245,166,35,0.12)", color: "#f5a623", border: "2px solid rgba(245,166,35,0.4)", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>🏷️ RESELL</button>
          <button onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }}
            style={{ flex: 1, padding: "14px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>📤 TRANSFER</button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <button onClick={() => { setScreen("app"); setActiveTab("home"); }} style={{ width: "100%", padding: "14px", background: "rgba(39,174,96,0.2)", border: "1px solid rgba(39,174,96,0.4)", color: "#27ae60", borderRadius: "50px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>✅ DONE</button>
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
  // ✅ Changed from 5% to 2%
  const fee = Math.round(price * 0.02 * 100) / 100;
  const payout = Math.round((price - fee) * 100) / 100;

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <div onClick={() => setScreen("ticketView")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>List for Resale</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "4px" }}>Original: Ghc {ev.price} · Max: Ghc {ev.price - 1} · Min: Ghc {Math.floor(ev.price * 0.3)}</div>
        </div>

        {/* Resale fee info */}
        <div style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)", borderRadius: "14px", padding: "12px 16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700 }}>✅ Only 2% platform fee on resales</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>You keep 98% of your resale price</div>
        </div>

        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", padding: "18px", marginBottom: "16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "12px" }}>Your Resale Price (Ghc)</div>
          <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number" placeholder={"Max: " + (ev.price - 1)}
            style={{ ...darkInput, fontSize: "20px", fontWeight: 700, border: "2px solid " + (resaleError ? "#e74c3c" : "rgba(245,166,35,0.4)") }} />
          {resaleError && <div style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>⚠️ {resaleError}</div>}
        </div>

        {price > 0 && (
          <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", padding: "18px", marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff", marginBottom: "12px" }}>Fee Breakdown</div>
            {[
              ["Listing Price", "Ghc " + price],
              ["Platform Fee (2%)", "- Ghc " + fee],
              ["Your Payout", "Ghc " + payout]
            ].map(([k, v], i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{k}</span>
                <span style={{ color: i === 2 ? "#27ae60" : "#fff", fontWeight: i === 2 ? 800 : 600, fontSize: "13px" }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleListForResale} style={darkBtn}>LIST FOR RESALE</button>
      </div>
    </div>
  );
}

export function ResaleSuccess() {
  const setScreen = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "72px", marginBottom: "20px" }}>🏷️</div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>Listed for Resale!</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>Your ticket is now on the resale market. You will be notified when it sells.</div>
      <div style={{ background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", borderRadius: "16px", padding: "16px 20px", marginBottom: "28px", width: "100%", textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "6px" }}>✅ Listed on Marketplace</div>
        <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#f5a623", fontWeight: 700 }}>REF: {Math.random().toString(36).substr(2, 12).toUpperCase()}</div>
      </div>
      <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={darkBtn}>VIEW MY TICKETS</button>
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
      <div style={{ fontSize: "72px", marginBottom: "20px" }}>✅</div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>Ticket Transferred!</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
        Your ticket for <span style={{ color: "#fff", fontWeight: 700 }}>{ev.name}</span> has been sent to <span style={{ color: "#f5a623", fontWeight: 700 }}>{transferName || transferEmail}</span>
      </div>
      <div style={{ background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", borderRadius: "16px", padding: "16px 20px", marginBottom: "28px", width: "100%", textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "6px" }}>✅ Transfer Complete</div>
        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#27ae60" }}>Your old QR code is now void. Recipient has a new ticket.</div>
      </div>
      <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={darkBtn}>BACK TO MY TICKETS</button>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <div onClick={() => setScreen("ticketView")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245,166,35,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>Transfer Ticket</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: "rgba(41,128,185,0.1)", border: "1px solid rgba(41,128,185,0.3)", borderRadius: "16px", padding: "14px 18px", marginBottom: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#5dade2", marginBottom: "8px" }}>ℹ️ About Transfers</div>
          {["Free — no platform fee", "Permanent — you lose ownership forever", "Recipient must have a Master Events account", "Your current QR becomes void instantly"].map((info, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              <span style={{ color: "#5dade2" }}>•</span><span>{info}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "8px" }}>Recipient Full Name</div>
        <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={darkInput} />
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: "8px" }}>Recipient Email (must have account)</div>
        <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={darkInput} />
        <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, marginBottom: "4px" }}>⚠️ Final Warning</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>This action cannot be undone. Make sure the email is correct.</div>
        </div>
        <button onClick={onTransfer} disabled={transferring} style={{ ...darkBtn, background: "linear-gradient(135deg, #2980b9, #1a6fa8)", opacity: transferring ? 0.6 : 1 }}>
          {transferring ? "⏳ Transferring..." : "📤 CONFIRM TRANSFER"}
        </button>
      </div>
    </div>
  );
}