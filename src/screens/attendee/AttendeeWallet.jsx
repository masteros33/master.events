import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { paymentsAPI } from "../../api";
import toast from "react-hot-toast";

const BRAND  = "#F97316";
const BRAND_D = "#EA6C0A";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const FONT   = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO   = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const T = {
  bg:     "var(--bg)",
  card:   "var(--bg-card)",
  border: "var(--border)",
  text:   "var(--text-primary)",
  sub:    "var(--text-secondary)",
  muted:  "var(--text-muted)",
  subtle: "var(--bg-subtle)",
  shadow: "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
};

const isDesktop = () => window.innerWidth > 768;

function INP({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", padding: "13px 16px", background: T.subtle, border: `1.5px solid ${T.border}`, borderRadius: "12px", fontSize: "14px", color: T.text, outline: "none", fontFamily: FONT, boxSizing: "border-box", transition: "border-color 0.15s,box-shadow 0.15s" }}
      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
  );
}

export default function AttendeeWallet() {
  const currentUser = useStore(s => s.currentUser);
  const setScreen   = useStore(s => s.setScreen);
  const desktop     = isDesktop();

  const [wallet,      setWallet]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount,      setAmount]      = useState("");
  const [momoNumber,  setMomoNumber]  = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await paymentsAPI.attendeeWallet();
      setWallet(data);
    } catch {
      setWallet({ balance: 0, total_earned: 0, total_withdrawn: 0, transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10)             { toast.error("Minimum withdrawal is GHS 10"); return; }
    if (!momoNumber.trim())           { toast.error("Enter your MoMo number"); return; }
    if (amt > (wallet?.balance || 0)) { toast.error("Insufficient balance"); return; }
    setWithdrawing(true);
    const t = toast.loading("Processing withdrawal...");
    try {
      const data = await paymentsAPI.attendeeWithdraw({ amount: amt, method: "momo", account: momoNumber.trim() });
      toast.dismiss(t);
      if (data.reference) {
        toast.success(`✅ ${data.message} — Ref: ${data.reference}`);
        setShowWithdraw(false); setAmount(""); setMomoNumber("");
        fetchWallet();
      } else {
        toast.error(data.error || "Withdrawal failed");
      }
    } catch {
      toast.dismiss(t);
      toast.error("Connection error. Try again.");
    } finally { setWithdrawing(false); }
  };

  const txMeta = (type) => {
    if (type === "resale_sale") return { icon: "💸", color: GREEN,  label: "Resale Earned" };
    if (type === "withdrawal")  return { icon: "📤", color: RED,    label: "Withdrawn"     };
    return                             { icon: "💰", color: BRAND,  label: "Credit"        };
  };

  const balance = wallet?.balance || 0;
  const canWithdraw = balance >= 10;

  return (
    <div style={{ background: T.bg, minHeight: "100%", paddingBottom: "80px", fontFamily: FONT }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: T.card, borderBottom: `1px solid ${T.border}`, padding: desktop ? "0 40px" : "0 16px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "13px", fontWeight: 500, fontFamily: FONT, padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: "16px", color: T.text, letterSpacing: "-0.3px" }}>My Wallet</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: desktop ? "560px" : "100%", margin: "0 auto", padding: desktop ? "28px 40px 80px" : "16px 16px 80px" }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "16px" }} />)}
          </div>
        ) : (
          <>
            {/* Balance hero card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, borderRadius: "24px", padding: "28px 24px", marginBottom: "16px", position: "relative", overflow: "hidden", boxShadow: `0 8px 32px ${BRAND}40` }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ position: "absolute", bottom: "-40px", left: "20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "1.5px", marginBottom: "10px", fontFamily: MONO }}>
                  AVAILABLE BALANCE
                </div>
                <div style={{ fontSize: "42px", fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1, marginBottom: "20px" }}>
                  GHS {balance.toFixed(2)}
                </div>

                {/* Mini stats */}
                <div style={{ display: "flex", gap: "24px" }}>
                  {[
                    ["Total Earned",    wallet?.total_earned    || 0],
                    ["Total Withdrawn", wallet?.total_withdrawn || 0],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", marginBottom: "3px" }}>{label}</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>GHS {parseFloat(val).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "14px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>💡</span>
              <div style={{ fontSize: "12px", color: T.sub, lineHeight: 1.6 }}>
                Earn by reselling tickets. Earnings land here instantly — withdraw to MoMo anytime.
              </div>
            </div>

            {/* Withdraw button */}
            <motion.button
              whileHover={canWithdraw ? { scale: 1.015 } : {}}
              whileTap={canWithdraw ? { scale: 0.97 } : {}}
              onClick={() => canWithdraw && setShowWithdraw(true)}
              disabled={!canWithdraw}
              style={{ width: "100%", padding: "16px", background: canWithdraw ? `linear-gradient(135deg,${BRAND},${BRAND_D})` : T.subtle, color: canWithdraw ? "#fff" : T.muted, border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: canWithdraw ? "pointer" : "not-allowed", boxShadow: canWithdraw ? `0 4px 20px ${BRAND}40` : "none", fontFamily: FONT, marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {canWithdraw ? "📲 Withdraw to MoMo" : `Minimum GHS 10 to withdraw (GHS ${balance.toFixed(2)} available)`}
            </motion.button>

            {/* Transaction history */}
            <div style={{ fontWeight: 800, fontSize: "16px", color: T.text, letterSpacing: "-0.3px", marginBottom: "14px" }}>
              Transaction History
            </div>

            {(wallet?.transactions || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: T.card, borderRadius: "18px", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>💸</div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: T.text, marginBottom: "6px" }}>No transactions yet</div>
                <div style={{ fontSize: "13px", color: T.muted }}>Sell a ticket on the resale market to earn your first payout</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(wallet?.transactions || []).map((tx, i) => {
                  const { icon, color, label } = txMeta(tx.type);
                  const isCredit = tx.type !== "withdrawal";
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ background: T.card, borderRadius: "14px", padding: "14px 16px", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "14px", boxShadow: T.shadow }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `1px solid ${color}20` }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: "2px" }}>{label}</div>
                        <div style={{ fontSize: "11px", color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.description}</div>
                        <div style={{ fontSize: "10px", color: T.muted, marginTop: "3px", fontFamily: MONO }}>
                          {tx.reference} · {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: isCredit ? GREEN : RED, letterSpacing: "-0.3px" }}>
                          {isCredit ? "+" : "−"}GHS {parseFloat(tx.amount).toFixed(2)}
                        </div>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: tx.status === "completed" ? GREEN : BRAND, fontFamily: MONO, marginTop: "3px" }}>
                          {tx.status.toUpperCase()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Withdraw modal */}
      <AnimatePresence>
        {showWithdraw && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, backdropFilter: "blur(8px)" }} />
            <motion.div
              initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 48 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: T.card, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom,0px))", zIndex: 301, border: `1px solid ${T.border}`, borderBottom: "none", fontFamily: FONT }}>

              <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: T.border, margin: "0 auto 22px" }} />
              <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "4px", letterSpacing: "-0.4px" }}>Withdraw to MoMo</div>
              <div style={{ fontSize: "13px", color: T.muted, marginBottom: "22px" }}>
                Available: <strong style={{ color: BRAND }}>GHS {balance.toFixed(2)}</strong>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>AMOUNT (GHS)</div>
                <INP value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50" type="number" />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>MOMO NUMBER</div>
                <INP value={momoNumber} onChange={e => setMomoNumber(e.target.value)} placeholder="e.g. 0241234567" type="tel" />
              </div>

              <div style={{ background: T.subtle, borderRadius: "12px", padding: "12px 14px", marginBottom: "20px", fontSize: "12px", color: T.muted, lineHeight: 1.6, border: `1px solid ${T.border}` }}>
                💡 Funds sent via Paystack to MTN, Vodafone or AirtelTigo MoMo. Usually instant.
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowWithdraw(false)}
                  style={{ flex: 1, padding: "14px", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: T.sub, fontFamily: FONT }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleWithdraw} disabled={withdrawing}
                  style={{ flex: 2, padding: "14px", background: withdrawing ? T.subtle : `linear-gradient(135deg,${BRAND},${BRAND_D})`, border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "14px", cursor: withdrawing ? "not-allowed" : "pointer", color: withdrawing ? T.muted : "#fff", fontFamily: FONT, boxShadow: withdrawing ? "none" : `0 4px 16px ${BRAND}35` }}>
                  {withdrawing ? "Processing..." : "Withdraw Now →"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}