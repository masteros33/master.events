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
    if (amt < 10)               { setAmountError("Minimum withdrawal is Ghc 10"); return false; }
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

  const getTxColor = t => t === "sale" ? "#16a34a" : t === "withdrawal" ? "#2563eb" : t === "fee" ? "#dc2626" : "var(--text-muted)";
  const getTxIcon  = t => t === "sale" ? "💰" : t === "withdrawal" ? "💸" : t === "fee" ? "🔗" : "📋";

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
    boxShadow: "var(--shadow-brand)", marginBottom: 0,
    fontFamily: "var(--font-sans)",
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "40px" : "20px 16px 100px" }}>
      <div style={{ maxWidth: desktop ? "900px" : "100%", margin: "0 auto" }}>

        {/* Header */}
        {desktop ? (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>WALLET</div>
            <div style={{ fontWeight: 900, fontSize: "28px", color: "var(--text-primary)", letterSpacing: "-0.8px" }}>Your Earnings</div>
            <div style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Track revenue and withdraw to MoMo or bank</div>
          </div>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontWeight: 900, fontSize: "22px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Wallet</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>Your earnings & withdrawals</div>
          </div>
        )}

        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "64px", marginBottom: "12px", borderRadius: "16px" }} />)}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "24px" : "0" }}>

            {/* ── Left — balance card ── */}
            <div>
              <div style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", borderRadius: "24px", padding: "28px", color: "#fff", boxShadow: "var(--shadow-brand)", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
                <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.85, letterSpacing: "2px", marginBottom: "8px" }}>AVAILABLE BALANCE</div>
                <div style={{ fontSize: "44px", fontWeight: 900, marginBottom: "4px", letterSpacing: "-1.5px" }}>
                  Ghc {Math.round(balance).toLocaleString()}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "20px" }}>Ready to withdraw · updated live</div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.15)", borderRadius: "14px", padding: "12px 14px", marginBottom: "14px" }}>
                  {[["Lifetime","Ghc " + Math.round(totalEarned).toLocaleString()],["Fees","Ghc " + Math.round(feesPaid).toLocaleString()],["Withdrawn","Ghc " + Math.round(totalWithdrawn).toLocaleString()]].map(([k,v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "14px", fontWeight: 800 }}>{v}</div>
                      <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>{k}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>95% You</span>
                    <span style={{ fontSize: "11px", opacity: 0.7 }}>5% Platform</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                    <div style={{ width: "95%", height: "100%", background: "#fff", borderRadius: "3px" }} />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowModal(true); setStep(1); setAmount(""); setMomoNumber(""); setAmountError(""); }}
                  style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.22)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  💸 Withdraw Funds
                </motion.button>
              </div>

              {/* Mini stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: desktop ? 0 : "20px" }}>
                {[
                  ["💰","Total Earned","Ghc " + Math.round(totalEarned).toLocaleString(),"#16a34a"],
                  ["💸","Withdrawn",   "Ghc " + Math.round(totalWithdrawn).toLocaleString(),"#2563eb"],
                  ["🔗","Fees Paid",   "Ghc " + Math.round(feesPaid).toLocaleString(),"#dc2626"],
                  ["📊","Balance",     "Ghc " + Math.round(balance).toLocaleString(),"#f5a623"],
                ].map(([icon,label,value,color]) => (
                  <motion.div key={label} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                    style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s" }}>
                    <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color, letterSpacing: "-0.3px" }}>{value}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Right — transactions ── */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "14px" }}>Transaction History</div>
              {transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>💸</div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "6px" }}>No transactions yet</div>
                  <div style={{ fontSize: "12px" }}>Revenue will appear here when tickets are sold</div>
                </div>
              ) : transactions.map((t, i) => {
                const color = getTxColor(t.type);
                return (
                  <motion.div key={i} whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                    style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "12px 14px", marginBottom: "8px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>
                      {getTxIcon(t.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{new Date(t.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "13px", color }}>{t.type === "sale" ? "+" : "-"}Ghc {parseFloat(t.amount).toLocaleString()}</div>
                      <div style={{ fontSize: "9px", color, fontWeight: 700, background: color + "15", padding: "2px 7px", borderRadius: "99px", marginTop: "3px" }}>{t.status}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Withdraw Modal — FULLY FIXED ── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }}
            />

            {/* Sheet — anchored to bottom, never goes off screen */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                margin: desktop ? "0 auto" : 0,
                width: desktop ? "480px" : "100%",
                // Center on desktop
                ...(desktop ? { left: "50%", transform: "translateX(-50%)" } : {}),
                background: "var(--bg-card)",
                borderRadius: "24px 24px 0 0",
                zIndex: 201,
                boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
                border: "1px solid var(--border)",
                borderBottom: "none",
                // KEY FIX: max height prevents it going off screen
                // uses dvh so it works on mobile browsers with address bars
                maxHeight: "85dvh",
                display: "flex",
                flexDirection: "column",
                // Safe area for notched phones
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              {/* Drag handle — fixed, never scrolls */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12px", paddingBottom: "4px" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong, #e2e8f0)" }} />
              </div>

              {/* Title bar — fixed */}
              <div style={{ flexShrink: 0, padding: "8px 24px 0" }}>
                {step === 1 && <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "2px" }}>Withdraw Funds</div>}
                {step === 2 && <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "2px" }}>Confirm Withdrawal</div>}
                {step === 3 && <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "2px" }}>Done!</div>}
                {step === 1 && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Available: Ghc {Math.round(balance).toLocaleString()}</div>}
              </div>

              {/* Scrollable content */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                padding: "12px 24px 32px",
              }}>

                {/* ── Step 1: Enter details ── */}
                {step === 1 && (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Amount (Ghc)</div>
                    <input
                      type="number"
                      placeholder="Min: Ghc 10"
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setAmountError(""); }}
                      style={{ ...inp, borderColor: amountError ? "var(--error)" : "var(--border)" }}
                    />

                    {/* Quick amount buttons */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "-8px", marginBottom: "16px" }}>
                      {[50, 100, 200, 500].map(q => (
                        <motion.div key={q} whileTap={{ scale: 0.93 }}
                          onClick={() => { setAmount(String(q)); setAmountError(""); }}
                          style={{ flex: 1, padding: "8px 4px", borderRadius: "10px", background: amount === String(q) ? "rgba(245,166,35,0.1)" : "var(--bg-subtle)", border: "1px solid " + (amount === String(q) ? "#f5a623" : "var(--border)"), textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: amount === String(q) ? "#f5a623" : "var(--text-secondary)", transition: "all 0.15s" }}>
                          {q}
                        </motion.div>
                      ))}
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Method</div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                      {[["momo","📱 MoMo"],["bank","🏦 Bank"]].map(([id, label]) => (
                        <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setMethod(id)}
                          style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid " + (method === id ? "#f5a623" : "var(--border)"), background: method === id ? "rgba(245,166,35,0.08)" : "var(--bg)", color: method === id ? "#f5a623" : "var(--text-muted)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                          {label}
                        </motion.button>
                      ))}
                    </div>

                    <input
                      placeholder={method === "momo" ? "MoMo number e.g. 0241234567" : "Bank account number"}
                      value={momoNumber}
                      onChange={e => { setMomoNumber(e.target.value); setAmountError(""); }}
                      style={{ ...inp, borderColor: amountError ? "var(--error)" : "var(--border)" }}
                    />

                    <AnimatePresence>
                      {amountError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ color: "var(--error)", fontSize: "12px", marginTop: "-8px", marginBottom: "12px" }}>
                          ⚠️ {amountError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { if (validateWithdraw()) setStep(2); }}
                      style={primaryBtn}>
                      Continue →
                    </motion.button>
                  </>
                )}

                {/* ── Step 2: Confirm ── */}
                {step === 2 && (
                  <>
                    <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 700, marginBottom: "3px" }}>🔒 Verify your details before confirming</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>This action cannot be reversed once confirmed.</div>
                    </div>

                    {[
                      ["Amount",     "Ghc " + amount],
                      ["Method",     method === "momo" ? "MTN MoMo" : "Bank Transfer"],
                      ["Send to",    momoNumber],
                      ["Processing", "5–10 minutes"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{k}</span>
                        <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
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

                {/* ── Step 3: Success ── */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", paddingTop: "8px" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      style={{ width: "72px", height: "72px", borderRadius: "22px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px", margin: "0 auto 16px" }}>✅</motion.div>
                    <div style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Withdrawal Initiated!</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px", lineHeight: 1.5 }}>
                      Ghc {amount} will arrive in your {method === "momo" ? "MoMo" : "bank"} within 5–10 minutes.
                    </div>
                    <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "24px", textAlign: "left" }}>
                      <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: 700, marginBottom: "4px", letterSpacing: "0.5px" }}>TRANSACTION REFERENCE</div>
                      <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#f5a623", fontSize: "14px", wordBreak: "break-all" }}>{txRef}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Save this for your records</div>
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