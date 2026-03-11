import React, { useState } from "react";
import useStore from "../../store/useStore";
import { inputStyle, btnStyle } from "../../styles/common";

export default function OrganizerWallet() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("momo");
  const [momoNumber, setMomoNumber] = useState("");
  const [balance, setBalance] = useState(1483);
  const [txRef] = useState("TX-" + Math.random().toString(36).substr(2, 8).toUpperCase());

  const transactions = [
    { type: "sale", label: "3x Afrobeats Night", amount: "+Ghc 285", status: "Settled", color: "#27ae60", time: "2 hrs ago" },
    { type: "withdrawal", label: "MoMo Withdrawal", amount: "-Ghc 500", status: "Paid", color: "#2980b9", time: "Yesterday" },
    { type: "sale", label: "5x Tech Summit", amount: "+Ghc 712", status: "Pending", color: "#f5a623", time: "2 days ago" },
    { type: "fee", label: "Platform Fee", amount: "-Ghc 50", status: "Deducted", color: "#e74c3c", time: "2 days ago" },
    { type: "sale", label: "2x Jazz Festival", amount: "+Ghc 190", status: "Settled", color: "#27ae60", time: "3 days ago" },
  ];

  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "100px" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontWeight: 800, fontSize: "22px", color: "#111", marginBottom: "4px" }}>Wallet</div>
        <div style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>Your earnings & payouts</div>
      </div>

      <div style={{ margin: "0 20px 20px", background: "linear-gradient(135deg, #f5a623 0%, #e8920f 100%)", borderRadius: "24px", padding: "24px", color: "#fff", boxShadow: "0 8px 32px rgba(245,166,35,0.35)" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, opacity: 0.85, letterSpacing: "1px", marginBottom: "8px" }}>AVAILABLE BALANCE</div>
        <div style={{ fontSize: "42px", fontWeight: 900, marginBottom: "4px" }}>Ghc {balance.toLocaleString()}</div>
        <div style={{ fontSize: "12px", opacity: 0.75, marginBottom: "20px" }}>Ghc 712 pending settlement</div>
        <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.15)", borderRadius: "14px", padding: "12px 16px", marginBottom: "16px" }}>
          {[["Lifetime", "Ghc 4,820"], ["Fees Paid", "Ghc 254"], ["Withdrawn", "Ghc 3,083"]].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: "10px", opacity: 0.75 }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", opacity: 0.85, marginBottom: "6px" }}>Revenue Split</div>
          <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ width: "95%", height: "100%", background: "#fff", borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700 }}>95% You</span>
            <span style={{ fontSize: "11px", opacity: 0.75 }}>5% Platform · Powered by Paystack Split</span>
          </div>
        </div>
        <button onClick={() => { setShowModal(true); setStep(1); }} style={{ width: "100%", padding: "14px", background: "#fff", color: "#f5a623", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "15px", cursor: "pointer" }}>💸 WITHDRAW FUNDS</button>
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "14px" }}>Transaction History</div>
        {transactions.map((t, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "14px 16px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#111", marginBottom: "3px" }}>{t.label}</div>
              <div style={{ fontSize: "11px", color: "#aaa" }}>{t.time}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: "14px", color: t.color }}>{t.amount}</div>
              <div style={{ fontSize: "10px", color: t.color, fontWeight: 600, background: t.color + "18", padding: "2px 8px", borderRadius: "10px", marginTop: "3px" }}>{t.status}</div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "390px", background: "#fff", borderRadius: "28px 28px 0 0", zIndex: 201, padding: "28px 24px 40px" }}>
            {step === 1 && (
              <>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "#111", marginBottom: "20px" }}>Withdraw Funds</div>
                <div style={{ fontSize: "13px", color: "#777", fontWeight: 600, marginBottom: "8px" }}>Amount (Ghc)</div>
                <input type="number" placeholder="Min: Ghc 10" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
                <div style={{ fontSize: "13px", color: "#777", fontWeight: 600, marginBottom: "8px" }}>Method</div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                  {[["momo", "📱 MoMo"], ["bank", "🏦 Bank"]].map(([id, label]) => (
                    <button key={id} onClick={() => setMethod(id)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid " + (method === id ? "#f5a623" : "#eee"), background: method === id ? "#fff9f0" : "#fff", color: method === id ? "#f5a623" : "#888", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>{label}</button>
                  ))}
                </div>
                <input placeholder={method === "momo" ? "MoMo number e.g. 0241234567" : "Bank account number"} value={momoNumber} onChange={e => setMomoNumber(e.target.value)} style={inputStyle} />
                <button onClick={() => { if (amount >= 10 && momoNumber) setStep(2); }} style={btnStyle}>CONTINUE</button>
              </>
            )}
            {step === 2 && (
              <>
                <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "20px" }}>{overlayEvent.description}</div>
                {[["Amount", "Ghc " + amount], ["Method", method === "momo" ? "MTN MoMo" : "Bank Transfer"], ["To", momoNumber], ["Processing", "5–10 minutes"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <span style={{ color: "#888", fontSize: "13px" }}>{k}</span>
                    <span style={{ color: "#111", fontSize: "13px", fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", background: "#f5f5f5", color: "#888", border: "none", borderRadius: "50px", fontWeight: 700, cursor: "pointer" }}>BACK</button>
                  <button onClick={() => { setBalance(b => b - parseFloat(amount)); setStep(3); }} style={{ ...btnStyle, flex: 2 }}>CONFIRM</button>
                </div>
              </>
            )}
            {step === 3 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontWeight: 800, fontSize: "20px", color: "#111", marginBottom: "8px" }}>Withdrawal Initiated!</div>
                <div style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>Ghc {amount} will arrive in your {method === "momo" ? "MoMo" : "bank"} within 5–10 minutes.</div>
                <div style={{ background: "#f0fff4", borderRadius: "14px", padding: "14px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", color: "#27ae60", fontWeight: 700, marginBottom: "4px" }}>Transaction Reference</div>
                  <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#111" }}>{txRef}</div>
                </div>
                <button onClick={() => setShowModal(false)} style={btnStyle}>DONE</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}