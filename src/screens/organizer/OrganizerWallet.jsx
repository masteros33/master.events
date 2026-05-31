import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paymentsAPI } from "../../api";

const BRAND   = "#F97316";
const BRAND_D = "#EA6C0A";
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
  const [amountError, setAmountError]   = useState("");
  const desktop = isDesktop();

  useEffect(() => {
    paymentsAPI.wallet().then(data => {
      if (data.balance !== undefined) {
        setWallet(data);
        setTransactions(data.transactions || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const balance        = wallet ? parseFloat(wallet.balance)         : 0;
  const totalEarned    = wallet ? parseFloat(wallet.total_earned)    : 0;
  const totalWithdrawn = wallet ? parseFloat(wallet.total_withdrawn) : 0;
  const feesPaid       = wallet ? parseFloat(wallet.fees_paid || 0)  : 0;

  const validateWithdraw = () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt)) { setAmountError("Please enter an amount"); return false; }
    if (amt < 10)               { setAmountError("Minimum withdrawal is GHS 10"); return false; }
    if (amt > balance)          { setAmountError("Amount exceeds your balance"); return false; }
    if (!momoNumber)            { setAmountError("Please enter your account number"); return false; }
    setAmountError(""); return true;
  };

  const handleWithdraw = async () => {
    try {
      const data = await paymentsAPI.withdraw({ amount: parseFloat(amount), method, account: momoNumber });
      if (data.reference) {
        setTxRef(data.reference);
        setWallet(prev => ({ ...prev, balance: data.new_balance }));
        setStep(3);
      } else {
        setAmountError(data.error || "Withdrawal failed. Try again.");
      }
    } catch {
      setAmountError("Connection error. Please try again.");
    }
  };

  const TX_COLOR = { sale: "#16a34a", resale_sale: "#7c3aed", withdrawal: "#2563eb", fee: "#dc2626" };
  const TX_ICON  = { sale: "💰", resale_sale: "🔄", withdrawal: "💸", fee: "🔗" };

  const inp = {
    width: "100%", padding: "14px 18px", marginBottom: "14px",
    background: "var(--bg)", border: "1.5px solid var(--border)",
    borderRadius: "14px", fontSize: "14px", color: "var(--text-primary)",
    outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
    caretColor: BRAND,
  };
  const primaryBtn = {
    width: "100%", padding: "16px",
    background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`,
    color: "#fff", border: "none", borderRadius: "16px",
    fontSize: "15px", fontWeight: 700, cursor: "pointer",
    boxShadow: "var(--shadow-brand)", marginBottom: 0,
    fontFamily: "var(--font-sans)",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "20px 16px 100px" }}>
      <div style={{ maxWidth: desktop ? "900px" : "100%", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", color: BRAND, fontWeight: 700, letterSpacing: "2px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>WALLET</div>
          <h1 style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.7px", marginBottom: "4px" }}>Your Earnings</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Track revenue and withdraw to MoMo or bank</p>
        </div>

        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "64px", marginBottom: "12px", borderRadius: "16px" }} />)}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "24px" : "0" }}>

            {/* ── Left — balance card ── */}
            <div>
              {/* Balance hero card */}
              <div style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, borderRadius: "24px", padding: "28px", color: "#fff", boxShadow: `0 8px 32px ${BRAND}45`, marginBottom: "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "150px", height: "150px", borderRadius: "50%", background: "rgba(0,0,0,0.06)", transform: "translate(-30%,30%)", pointerEvents: "none" }} />

                <div style={{ fontSize: "11px", fontWeight: 700, opacity: 0.8, letterSpacing: "2px", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>AVAILABLE_BALANCE</div>
                <div style={{ fontSize: "46px", fontWeight: 900, marginBottom: "4px", letterSpacing: "-2px", lineHeight: 1 }}>
                  GHS {Math.round(balance).toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "22px" }}>Ready to withdraw · updated live</div>

                {/* Stats strip */}
                <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.14)", borderRadius: "16px", padding: "14px 16px", marginBottom: "16px" }}>
                  {[
                    ["Lifetime",  "GHS " + Math.round(totalEarned).toLocaleString()],
                    ["Fees",      "GHS " + Math.round(feesPaid).toLocaleString()],
                    ["Withdrawn", "GHS " + Math.round(totalWithdrawn).toLocaleString()],
                  ].map(([k,v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 800 }}>{v}</div>
                      <div style={{ fontSize: "11px", opacity: 0.65, marginTop: "2px" }}>{k}</div>
                    </div>
                  ))}
                </div>

                {/* Payout split bar */}
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>95% You</span>
                    <span style={{ fontSize: "12px", opacity: 0.65 }}>5% Platform</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                    <div style={{ width: "95%", height: "100%", background: "#fff", borderRadius: "99px" }} />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.28)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowModal(true); setStep(1); setAmount(""); setMomoNumber(""); setAmountError(""); }}
                  style={{ width: "100%", padding: "15px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "14px", fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
                  💸 Withdraw Funds
                </motion.button>
              </div>

              {/* Mini stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: desktop ? 0 : "24px" }}>
                {[
                  ["💰", "Total Earned",  "GHS " + Math.round(totalEarned).toLocaleString(),    "#16a34a"],
                  ["💸", "Withdrawn",     "GHS " + Math.round(totalWithdrawn).toLocaleString(), "#2563eb"],
                  ["🔗", "Fees Paid",     "GHS " + Math.round(feesPaid).toLocaleString(),       "#dc2626"],
                  ["📊", "Balance",       "GHS " + Math.round(balance).toLocaleString(),         BRAND],
                ].map(([icon, label, value, color]) => (
                  <motion.div key={label} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                    style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>
                    <div style={{ fontSize: "20px", marginBottom: "8px" }}>{icon}</div>
                    <div style={{ fontSize: "17px", fontWeight: 900, color, letterSpacing: "-0.5px", marginBottom: "3px" }}>{value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Right — transactions ── */}
            <div>
              <div style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", letterSpacing: "-0.3px", marginBottom: "16px" }}>Transaction History</div>
              {transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "18px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>💸</div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>No transactions yet</div>
                  <div style={{ fontSize: "13px" }}>Revenue will appear here when tickets are sold</div>
                </div>
              ) : transactions.map((t, i) => {
                const color = TX_COLOR[t.type] || "var(--text-muted)";
                const icon  = TX_ICON[t.type]  || "📋";
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                    style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "14px 16px", marginBottom: "8px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "all 0.2s" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: color + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: `1px solid ${color}20` }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                        {new Date(t.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "14px", color }}>
                        {t.type === "withdrawal" || t.type === "fee" ? "-" : "+"}GHS {parseFloat(t.amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "10px", color, fontWeight: 700, background: color + "12", padding: "2px 8px", borderRadius: "99px", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                        {t.status?.toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Withdraw Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }} />

            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                margin: desktop ? "0 auto" : 0,
                width: desktop ? "480px" : "100%",
                ...(desktop ? { left: "50%", transform: "translateX(-50%)" } : {}),
                background: "var(--bg-card)", borderRadius: "24px 24px 0 0",
                zIndex: 201, boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
                border: "1px solid var(--border)", borderBottom: "none",
                maxHeight: "85dvh", display: "flex", flexDirection: "column",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}>

              {/* Handle */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12px", paddingBottom: "4px" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)" }} />
              </div>

              {/* Title */}
              <div style={{ flexShrink: 0, padding: "8px 24px 0" }}>
                <div style={{ fontWeight: 900, fontSize: "20px", color: "var(--text-primary)", marginBottom: "2px", letterSpacing: "-0.5px" }}>
                  {step === 1 ? "Withdraw Funds" : step === 2 ? "Confirm Withdrawal" : "Done! 🎉"}
                </div>
                {step === 1 && <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>Available: <span style={{ color: BRAND, fontWeight: 700 }}>GHS {Math.round(balance).toLocaleString()}</span></div>}
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", padding: "14px 24px 32px" }}>

                {step === 1 && (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Amount (GHS)</div>
                    <input type="number" placeholder="Min: GHS 10" value={amount}
                      onChange={e => { setAmount(e.target.value); setAmountError(""); }}
                      style={{ ...inp, borderColor: amountError ? "var(--error)" : "var(--border)" }}
                      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                      onBlur={e => { e.target.style.borderColor = amountError ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
                    />

                    {/* Quick amounts */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "-8px", marginBottom: "18px" }}>
                      {[50, 100, 200, 500].map(q => (
                        <motion.div key={q} whileTap={{ scale: 0.93 }}
                          onClick={() => { setAmount(String(q)); setAmountError(""); }}
                          style={{ flex: 1, padding: "9px 4px", borderRadius: "11px", background: amount === String(q) ? `${BRAND}12` : "var(--bg-subtle)", border: `1.5px solid ${amount === String(q) ? BRAND : "var(--border)"}`, textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: amount === String(q) ? BRAND : "var(--text-secondary)", transition: "all 0.15s" }}>
                          {q}
                        </motion.div>
                      ))}
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Payment Method</div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                      {[["momo","📱 MTN MoMo"],["bank","🏦 Bank Transfer"]].map(([id, label]) => (
                        <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setMethod(id)}
                          style={{ flex: 1, padding: "13px", borderRadius: "13px", border: `1.5px solid ${method === id ? BRAND : "var(--border)"}`, background: method === id ? `${BRAND}10` : "var(--bg)", color: method === id ? BRAND : "var(--text-muted)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
                          {label}
                        </motion.button>
                      ))}
                    </div>

                    <input placeholder={method === "momo" ? "MoMo number e.g. 0241234567" : "Bank account number"}
                      value={momoNumber}
                      onChange={e => { setMomoNumber(e.target.value); setAmountError(""); }}
                      style={{ ...inp, borderColor: amountError ? "var(--error)" : "var(--border)" }}
                      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                      onBlur={e => { e.target.style.borderColor = amountError ? "var(--error)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
                    />

                    <AnimatePresence>
                      {amountError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ color: "var(--error)", fontSize: "13px", marginTop: "-8px", marginBottom: "14px", fontWeight: 600 }}>
                          ⚠️ {amountError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { if (validateWithdraw()) setStep(2); }}
                      style={primaryBtn}>
                      Continue →
                    </motion.button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "13px", padding: "13px 16px", marginBottom: "18px" }}>
                      <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 700, marginBottom: "3px" }}>🔒 Verify your details</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>This action cannot be reversed once confirmed.</div>
                    </div>
                    {[
                      ["Amount",     "GHS " + amount],
                      ["Method",     method === "momo" ? "MTN MoMo" : "Bank Transfer"],
                      ["Send to",    momoNumber],
                      ["Processing", "5–10 minutes"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{k}</span>
                        <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                        style={{ flex: 1, padding: "14px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1.5px solid var(--border)", borderRadius: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "14px" }}>
                        ← Back
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleWithdraw}
                        style={{ ...primaryBtn, flex: 2 }}>
                        Confirm Withdrawal
                      </motion.button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", paddingTop: "8px" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      style={{ width: "76px", height: "76px", borderRadius: "24px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 18px" }}>✅</motion.div>
                    <div style={{ fontWeight: 900, fontSize: "22px", color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Withdrawal Initiated!</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "22px", lineHeight: 1.65 }}>
                      GHS {amount} will arrive in your {method === "momo" ? "MoMo" : "bank"} within 5–10 minutes.
                    </div>
                    <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "14px", padding: "14px 16px", marginBottom: "24px", textAlign: "left" }}>
                      <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: 700, marginBottom: "5px", letterSpacing: "1px", fontFamily: "var(--font-mono)" }}>TRANSACTION REFERENCE</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: BRAND, fontSize: "14px", wordBreak: "break-all" }}>{txRef}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>Save this for your records</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setShowModal(false); setStep(1); setAmount(""); setMomoNumber(""); setAmountError(""); }}
                      style={primaryBtn}>
                      Done
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}