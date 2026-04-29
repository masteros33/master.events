import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paymentsAPI } from "../../api";

const isDesktop = () => window.innerWidth > 768;

export default function OrganizerWallet() {
  const [showModal, setShowModal]       = useState(false);
  const [step, setStep]                 = useState(1);
  const [amount, setAmount]             = useState("");
  const [method, setMethod]             = useState("momo");
  const [momoNumber, setMomoNumber]     = useState("");
  const [txRef, setTxRef]               = useState("");
  const [loading, setLoading]           = useState(true);
  const [wallet, setWallet]             = useState(null);
  const [transactions, setTransactions] = useState([]);
  const desktop = isDesktop();

  useEffect(() => {
    paymentsAPI.wallet().then(data => {
      if (data.balance !== undefined) { setWallet(data); setTransactions(data.transactions || []); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const balance        = wallet ? parseFloat(wallet.balance)          : 0;
  const totalEarned    = wallet ? parseFloat(wallet.total_earned)     : 0;
  const totalWithdrawn = wallet ? parseFloat(wallet.total_withdrawn)  : 0;
  const feesPaid       = wallet ? parseFloat(wallet.fees_paid || 0)   : 0;

  const handleWithdraw = async () => {
    try {
      const data = await paymentsAPI.withdraw({ amount: parseFloat(amount), method, account: momoNumber });
      if (data.reference) { setTxRef(data.reference); setWallet(prev => ({ ...prev, balance: data.new_balance })); setStep(3); }
      else alert(data.error || "Withdrawal failed");
    } catch { alert("Connection error."); }
  };

  const getTxColor = t => t === "sale" ? "#16a34a" : t === "withdrawal" ? "#2563eb" : t === "fee" ? "#dc2626" : "var(--text-muted)";

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
    boxShadow: "var(--shadow-brand)", marginBottom: "0",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "20px 20px 100px" }}>
      <div style={{ maxWidth: desktop ? "900px" : "100%", margin: "0 auto" }}>

        {desktop && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>WALLET</div>
            <div style={{ fontWeight: 900, fontSize: "28px", color: "var(--text-primary)", letterSpacing: "-0.8px" }}>Your Earnings</div>
            <div style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Track your revenue and withdraw funds</div>
          </div>
        )}

        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "60px", marginBottom: "12px", borderRadius: "16px" }} />)}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "24px" : "0" }}>

            {/* Left */}
            <div>
              <div style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", borderRadius: "24px", padding: "28px", color: "#fff", boxShadow: "var(--shadow-brand)", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, opacity: 0.85, letterSpacing: "1.5px", marginBottom: "8px" }}>AVAILABLE BALANCE</div>
                <div style={{ fontSize: "44px", fontWeight: 900, marginBottom: "4px", letterSpacing: "-1.5px" }}>
                  Ghc {Math.round(balance).toLocaleString()}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "24px" }}>Updated live from sales</div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.15)", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px" }}>
                  {[["Lifetime","Ghc " + Math.round(totalEarned).toLocaleString()], ["Fees Paid","Ghc " + Math.round(feesPaid).toLocaleString()], ["Withdrawn","Ghc " + Math.round(totalWithdrawn).toLocaleString()]].map(([k, v]) => (
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
                    <span style={{ fontSize: "11px", opacity: 0.75 }}>5% Platform</span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowModal(true); setStep(1); }}
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  💸 Withdraw Funds
                </motion.button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[["💰","Total Earned","Ghc " + Math.round(totalEarned).toLocaleString(),"#16a34a"], ["💸","Withdrawn","Ghc " + Math.round(totalWithdrawn).toLocaleString(),"#2563eb"], ["🔗","Fees Paid","Ghc " + Math.round(feesPaid).toLocaleString(),"#dc2626"], ["📊","Balance","Ghc " + Math.round(balance).toLocaleString(),"#f5a623"]].map(([icon, label, value, color]) => (
                  <motion.div key={label} whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
                    style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s" }}>
                    <div style={{ fontSize: "20px", marginBottom: "8px" }}>{icon}</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color, letterSpacing: "-0.3px" }}>{value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "14px" }}>Transaction History</div>
              {transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "16px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>💸</div>
                  <div>No transactions yet</div>
                </div>
              ) : transactions.map((t, i) => {
                const color = getTxColor(t.type);
                return (
                  <motion.div key={i} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                    style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "14px 16px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>{t.description}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(t.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "14px", color }}>{t.type === "sale" ? "+" : "-"}Ghc {parseFloat(t.amount).toLocaleString()}</div>
                      <div style={{ fontSize: "10px", color, fontWeight: 600, background: color + "18", padding: "2px 8px", borderRadius: "10px", marginTop: "3px" }}>{t.status}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: desktop ? "480px" : "100%", background: "var(--bg-card)", borderRadius: "28px 28px 0 0", zIndex: 201, padding: "28px 28px 48px", boxShadow: "0 -8px 40px rgba(0,0,0,0.2)", border: "1px solid var(--border)" }}>

              {step === 1 && (
                <>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "20px" }}>Withdraw Funds</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>Amount (Ghc)</div>
                  <input type="number" placeholder="Min: Ghc 10" value={amount} onChange={e => setAmount(e.target.value)} style={inp} />
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>Method</div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                    {[["momo","📱 MoMo"],["bank","🏦 Bank"]].map(([id, label]) => (
                      <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setMethod(id)}
                        style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid " + (method === id ? "#f5a623" : "var(--border)"), background: method === id ? "rgba(245,166,35,0.08)" : "var(--bg)", color: method === id ? "#f5a623" : "var(--text-muted)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                        {label}
                      </motion.button>
                    ))}
                  </div>
                  <input placeholder={method === "momo" ? "MoMo number e.g. 0241234567" : "Bank account number"} value={momoNumber} onChange={e => setMomoNumber(e.target.value)} style={inp} />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { if (amount >= 10 && momoNumber) setStep(2); }}
                    style={primaryBtn}>Continue</motion.button>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "20px" }}>Confirm Withdrawal</div>
                  {[["Amount","Ghc " + amount],["Method",method === "momo" ? "MTN MoMo" : "Bank Transfer"],["To",momoNumber],["Processing","5–10 minutes"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{k}</span>
                      <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                      style={{ flex: 1, padding: "14px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1.5px solid var(--border)", borderRadius: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Back</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleWithdraw}
                      style={{ ...primaryBtn, flex: 2, marginBottom: 0 }}>Confirm</motion.button>
                  </div>
                </>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 16px" }}>✅</div>
                  <div style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Withdrawal Initiated!</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
                    Ghc {amount} will arrive in your {method === "momo" ? "MoMo" : "bank"} within 5–10 minutes.
                  </div>
                  <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700, marginBottom: "4px" }}>Transaction Reference</div>
                    <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#f5a623" }}>{txRef}</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowModal(false); setStep(1); setAmount(""); setMomoNumber(""); }}
                    style={primaryBtn}>Done</motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}