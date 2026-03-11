import React from "react";
import useStore from "../../store/useStore";
import { inputStyle, btnStyle } from "../../styles/common";
import QRCode from "../../components/QRCode";

export function Checkout() {
  const checkoutEvent = useStore(s => s.checkoutEvent);
  const ticketQty = useStore(s => s.ticketQty);
  const payMethod = useStore(s => s.payMethod);
  const setTicketQty = useStore(s => s.setTicketQty);
  const setPayMethod = useStore(s => s.setPayMethod);
  const handleBuyTicket = useStore(s => s.handleBuyTicket);
  const setScreen = useStore(s => s.setScreen);
  if (!checkoutEvent) return null;
  const subtotal = checkoutEvent.price * ticketQty;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <div onClick={() => setScreen("app")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f5a62322", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "16px" }}>←</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#111" }}>Checkout</div>
      </div>
      <div style={{ margin: "0 20px 20px", background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ height: "120px", position: "relative" }}>
          {checkoutEvent.image ? <img src={checkoutEvent.image} alt={checkoutEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: checkoutEvent.color || "#f5a623" }} />}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>{checkoutEvent.name}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>📅 {checkoutEvent.date} · 📍 {checkoutEvent.venue}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "14px" }}>Quantity</div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f5a62322", color: "#f5a623", border: "none", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>-</button>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#111", minWidth: "40px", textAlign: "center" }}>{ticketQty}</span>
            <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f5a62322", color: "#f5a623", border: "none", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "14px" }}>Payment Method</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[["momo", "📱 MoMo"], ["visa", "💳 VISA"]].map(([id, label]) => (
              <button key={id} onClick={() => setPayMethod(id)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid " + (payMethod === id ? "#f5a623" : "#eee"), background: payMethod === id ? "#fff9f0" : "#fff", color: payMethod === id ? "#f5a623" : "#888", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "18px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "14px" }}>Summary</div>
          {[["Tickets", ticketQty + " x Ghc " + checkoutEvent.price], ["Platform Fee (5%)", "Ghc " + fee]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #f5f5f5" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>{k}</span>
              <span style={{ color: "#111", fontSize: "13px", fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#111", fontWeight: 700 }}>Total</span>
            <span style={{ color: "#f5a623", fontWeight: 800, fontSize: "18px" }}>Ghc {total}</span>
          </div>
        </div>
        <button onClick={handleBuyTicket} style={btnStyle}>{checkoutEvent.price === 0 ? "GET FREE TICKET" : "PAY Ghc " + total}</button>
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
  return (
    <div style={{ background: "#111", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ height: "220px", position: "relative" }}>
        {ev.image ? <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} /> : <div style={{ width: "100%", height: "100%", background: ev.color || "#f5a623" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)" }} />
        <div onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={{ position: "absolute", top: "16px", left: "16px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: "18px" }}>←</div>
        <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
          <div style={{ color: "#f5a623", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px" }}>YOUR TICKET</div>
          <div style={{ color: "#fff", fontSize: "22px", fontWeight: 800 }}>{ev.name}</div>
        </div>
      </div>
      <div style={{ background: "#fff", margin: "20px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-around", borderBottom: "2px dashed #f5f5f5" }}>
          {[["📅 DATE", ev.date], ["🕐 TIME", ev.time], ["💺 QTY", viewingTicket.qty]].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#aaa", fontWeight: 600, marginBottom: "4px" }}>{k}</div>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "#111" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <QRCode size={140} />
          <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa", letterSpacing: "2px" }}>{viewingTicket.id}</div>
          <div style={{ background: "#e8f8ef", padding: "6px 14px", borderRadius: "20px" }}>
            <span style={{ color: "#27ae60", fontSize: "12px", fontWeight: 700 }}>✓ NFT Verified</span>
          </div>
        </div>
        <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}>
          <button onClick={() => { setResaleTicket(viewingTicket); setResalePrice(""); setResaleError(""); setScreen("resale"); }} style={{ flex: 1, padding: "14px", background: "#fff9f0", color: "#f5a623", border: "2px solid #f5a623", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>🏷️ RESELL</button>
          <button onClick={() => { setTransferTicket(viewingTicket); setTransferEmail(""); setTransferName(""); setTransferDone(false); setScreen("transfer"); }} style={{ flex: 1, padding: "14px", background: "#11111111", color: "#111", border: "2px solid #111", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>📤 TRANSFER</button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <button onClick={() => { setScreen("app"); setActiveTab("home"); }} style={{ ...btnStyle, background: "#27ae60" }}>✅ DONE</button>
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
  const fee = Math.round(price * 0.05 * 100) / 100;
  const payout = Math.round((price - fee) * 100) / 100;
  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <div onClick={() => setScreen("ticketView")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f5a62322", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#111" }}>List for Resale</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "16px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111" }}>{ev.name}</div>
          <div style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>Original: Ghc {ev.price} · Max: Ghc {ev.price - 1} · Min: Ghc {Math.floor(ev.price * 0.3)}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "12px" }}>Your Resale Price (Ghc)</div>
          <input value={resalePrice} onChange={e => setResalePrice(e.target.value)} type="number" placeholder={"Max: " + (ev.price - 1)}
            style={{ width: "100%", padding: "14px 18px", border: "2px solid " + (resaleError ? "#e74c3c" : "#f5a623"), borderRadius: "12px", fontSize: "20px", fontWeight: 700, outline: "none", fontFamily: "sans-serif", boxSizing: "border-box" }} />
          {resaleError && <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "8px" }}>⚠️ {resaleError}</div>}
        </div>
        {price > 0 && (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "12px" }}>Fee Breakdown</div>
            {[["Listing Price", "Ghc " + price], ["Platform Fee (5%)", "- Ghc " + fee], ["Your Payout", "Ghc " + payout]].map(([k, v], i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid #f5f5f5" : "none" }}>
                <span style={{ color: "#888", fontSize: "13px" }}>{k}</span>
                <span style={{ color: i === 2 ? "#27ae60" : "#111", fontWeight: i === 2 ? 800 : 600, fontSize: "13px" }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleListForResale} style={btnStyle}>LIST FOR RESALE</button>
      </div>
    </div>
  );
}

export function ResaleSuccess() {
  const setScreen = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "72px", marginBottom: "20px" }}>🏷️</div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "#111", marginBottom: "10px" }}>Listed for Resale!</div>
      <div style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>Your ticket is now on the resale market. You will be notified when it sells.</div>
      <div style={{ background: "#f0fff4", border: "1px solid #27ae6044", borderRadius: "16px", padding: "16px 20px", marginBottom: "28px", width: "100%", textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "6px" }}>✅ On-Chain Token ID</div>
        <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#f5a623", fontWeight: 700 }}>0x{Math.random().toString(16).substr(2, 16).toUpperCase()}</div>
      </div>
      <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={btnStyle}>VIEW MY TICKETS</button>
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
  if (!transferTicket) return null;
  const ev = transferTicket.event;
  if (transferDone) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: "72px", marginBottom: "20px" }}>✅</div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "#111", marginBottom: "10px" }}>Ticket Transferred!</div>
      <div style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>Your ticket for <span style={{ color: "#111", fontWeight: 700 }}>{ev.name}</span> has been sent to <span style={{ color: "#f5a623", fontWeight: 700 }}>{transferName}</span></div>
      <div style={{ background: "#f0fff4", border: "1px solid #27ae6044", borderRadius: "16px", padding: "16px 20px", marginBottom: "28px", width: "100%", textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "#27ae60", fontWeight: 700, marginBottom: "6px" }}>✅ Blockchain Transfer Complete</div>
        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#27ae60", wordBreak: "break-all" }}>TX: 0x{Math.random().toString(16).substr(2, 40).toUpperCase()}</div>
      </div>
      <button onClick={() => { setScreen("app"); setActiveTab("tickets"); }} style={btnStyle}>BACK TO MY TICKETS</button>
    </div>
  );
  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", gap: "14px" }}>
        <div onClick={() => setScreen("ticketView")} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f5a62322", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f5a623", fontSize: "18px" }}>←</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#111" }}>Transfer Ticket</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: "#f0f7ff", border: "2px solid #2980b944", borderRadius: "16px", padding: "14px 18px", marginBottom: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#2980b9", marginBottom: "8px" }}>ℹ️ About Transfers</div>
          {["Free — no platform fee", "Permanent — you lose ownership forever", "New owner gets a fresh NFT and unique QR code", "Your current QR becomes void instantly"].map((info, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "12px", color: "#555" }}><span style={{ color: "#2980b9" }}>•</span><span>{info}</span></div>
          ))}
        </div>
        <div style={{ fontSize: "13px", color: "#777", fontWeight: 600, marginBottom: "8px" }}>Recipient Full Name</div>
        <input placeholder="e.g. Kwame Mensah" value={transferName} onChange={e => setTransferName(e.target.value)} style={inputStyle} />
        <div style={{ fontSize: "13px", color: "#777", fontWeight: 600, marginBottom: "8px" }}>Recipient Email</div>
        <input placeholder="e.g. kwame@email.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={inputStyle} />
        <div style={{ background: "#fff8f0", border: "1px solid #f5a623", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#f5a623", fontWeight: 700, marginBottom: "4px" }}>⚠️ Final Warning</div>
          <div style={{ fontSize: "12px", color: "#888" }}>This action cannot be undone. Make sure the email is correct.</div>
        </div>
        <button onClick={handleTransfer} style={{ ...btnStyle, background: "#2980b9" }}>📤 CONFIRM TRANSFER</button>
      </div>
    </div>
  );
}