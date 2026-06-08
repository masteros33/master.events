import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { paymentsAPI } from "../../api";
import toast from "react-hot-toast";

const BACKEND   = "https://master-events-backend.onrender.com";
const BRAND     = "#F97316";
const isDesktop = () => window.innerWidth > 768;

export default function AttendeeWallet() {
  const currentUser = useStore(s => s.currentUser);
  const setScreen   = useStore(s => s.setScreen);
  const desktop     = isDesktop();

  const [wallet,       setWallet]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount,       setAmount]       = useState("");
  const [momoNumber,   setMomoNumber]   = useState("");
  const [withdrawing,  setWithdrawing]  = useState(false);

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
    if (!amt || amt < 10)    { toast.error("Minimum withdrawal is GHS 10"); return; }
    if (!momoNumber.trim())  { toast.error("Enter your MoMo number"); return; }
    if (amt > (wallet?.balance || 0)) { toast.error("Insufficient balance"); return; }

    setWithdrawing(true);
    const t = toast.loading("Processing withdrawal...");
    try {
      const data = await paymentsAPI.attendeeWithdraw({
        amount:  amt,
        method:  "momo",
        account: momoNumber.trim(),
      });
      toast.dismiss(t);
      if (data.reference) {
        toast.success(`✅ ${data.message} — Ref: ${data.reference}`);
        setShowWithdraw(false);
        setAmount("");
        setMomoNumber("");
        fetchWallet();
      } else {
        toast.error(data.error || "Withdrawal failed");
      }
    } catch {
      toast.dismiss(t);
      toast.error("Connection error. Try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const txIcon = (type) => {
    if (type === "resale_sale") return { icon: "💸", color: "#16a34a", label: "Resale Earned" };
    if (type === "withdrawal")  return { icon: "📤", color: "#dc2626", label: "Withdrawn" };
    return { icon: "💰", color: BRAND, label: "Credit" };
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "80px" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: desktop ? "0 40px" : "0 16px",
        height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-sans)", padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>My Wallet</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: desktop ? "600px" : "100%", margin: "0 auto", padding: desktop ? "28px 40px 60px" : "16px 16px 60px" }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "14px" }} />)}
          </div>
        ) : (
          <>
            {/* Balance card */}
            <div style={{
              background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`,
              borderRadius: "20px", padding: "28px 24px", marginBottom: "16px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ position: "absolute", bottom: "-30px", left: "40px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "1.5px", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
                  AVAILABLE BALANCE
                </div>
                <div style={{ fontSize: "38px", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: "16px" }}>
                  GHS {(wallet?.balance || 0).toFixed(2)}
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", marginBottom: "2px" }}>Total Earned</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>GHS {(wallet?.total_earned || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", marginBottom: "2px" }}>Withdrawn</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>GHS {(wallet?.total_withdrawn || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>💡</span>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Earn money by reselling tickets. Your earnings land here instantly and you can withdraw to MoMo anytime.
              </div>
            </div>

            {/* Withdraw button */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowWithdraw(true)}
              disabled={(wallet?.balance || 0) < 10}
              style={{
                width: "100%", padding: "15px",
                background: (wallet?.balance || 0) >= 10 ? `linear-gradient(135deg, ${BRAND}, #EA6C0A)` : "var(--bg-subtle)",
                color: (wallet?.balance || 0) >= 10 ? "#fff" : "var(--text-muted)",
                border: "none", borderRadius: "13px", fontSize: "15px", fontWeight: 700,
                cursor: (wallet?.balance || 0) >= 10 ? "pointer" : "not-allowed",
                boxShadow: (wallet?.balance || 0) >= 10 ? "var(--shadow-brand)" : "none",
                fontFamily: "var(--font-sans)", marginBottom: "24px",
              }}>
              {(wallet?.balance || 0) < 10 ? "Minimum GHS 10 to withdraw" : "Withdraw to MoMo 📲"}
            </motion.button>

            {/* Transaction history */}
            <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px", marginBottom: "14px" }}>
              Transaction History
            </div>

            {(wallet?.transactions || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>💸</div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>No transactions yet</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Sell a ticket on the resale market to earn your first payout</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(wallet?.transactions || []).map((t, i) => {
                  const { icon, color, label } = txIcon(t.type);
                  const isCredit = t.type !== "withdrawal";
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: `1px solid ${color}20` }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>{label}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.description}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                          {t.reference} · {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: isCredit ? "#16a34a" : "#dc2626" }}>
                          {isCredit ? "+" : "-"}GHS {parseFloat(t.amount).toFixed(2)}
                        </div>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: t.status === "completed" ? "#16a34a" : "#f5a623", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          {t.status.toUpperCase()}
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

      {/* ── Withdraw modal ── */}
      <AnimatePresence>
        {showWithdraw && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, backdropFilter: "blur(8px)" }} />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                margin: "0 auto", maxWidth: "480px",
                background: "var(--bg-card)", borderRadius: "24px 24px 0 0",
                padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
                zIndex: 301, border: "1px solid var(--border)", borderBottom: "none",
              }}>
              <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)", margin: "0 auto 20px" }} />
              <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "4px", letterSpacing: "-0.3px" }}>Withdraw to MoMo</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                Available: <strong style={{ color: BRAND }}>GHS {(wallet?.balance || 0).toFixed(2)}</strong>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Amount (GHS)</div>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 50"
                  style={{ width: "100%", padding: "12px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>MoMo Number</div>
                <input
                  type="tel" value={momoNumber} onChange={e => setMomoNumber(e.target.value)}
                  placeholder="e.g. 0241234567"
                  style={{ width: "100%", padding: "12px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "10px 14px", marginBottom: "18px", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                💡 Funds are sent via Paystack to your MTN/Vodafone/AirtelTigo MoMo. Usually instant.
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowWithdraw(false)}
                  style={{ flex: 1, padding: "13px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleWithdraw} disabled={withdrawing}
                  style={{ flex: 2, padding: "13px", background: withdrawing ? "var(--bg-subtle)" : `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: withdrawing ? "not-allowed" : "pointer", color: withdrawing ? "var(--text-muted)" : "#fff", fontFamily: "var(--font-sans)" }}>
                  {withdrawing ? "Processing..." : "Withdraw Now"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}