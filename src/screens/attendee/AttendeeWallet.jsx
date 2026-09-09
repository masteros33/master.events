import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { paymentsAPI } from "../../api";
import toast from "react-hot-toast";
import {
  Info, DeviceMobile, ArrowDownLeft, ArrowUpRight, Wallet, Ticket,
} from "@phosphor-icons/react";

const isDesktop = () => window.innerWidth > 768;

const STATUS_CLASS = {
  completed: "text-emerald-700 bg-emerald-50",
  pending:   "text-amber-700 bg-amber-50",
};

function txMeta(type) {
  if (type === "resale_sale") return { Icon: ArrowDownLeft, badgeBg: "bg-emerald-50", iconClass: "text-emerald-700", label: "Resale Earned" };
  if (type === "withdrawal")  return { Icon: ArrowUpRight,  badgeBg: "bg-brand-hairline",      iconClass: "text-brand-muted", label: "Withdrawn" };
  return { Icon: Wallet, badgeBg: "bg-emerald-50", iconClass: "text-emerald-700", label: "Credit" };
}

export default function AttendeeWallet() {
  const desktop = isDesktop();

  const setScreen = useStore(s => s.setScreen);
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
        toast.success(`${data.message} — Ref: ${data.reference}`);
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

  // Master Events Credits are closed-loop: they buy tickets on the platform,
  // they are not a cash balance. The backend refuses withdrawal outright, so
  // the screen sends people to spend them instead of offering a dead button.
  const canSpend = (wallet?.balance || 0) > 0;

  return (
    <div className="bg-brand-subtle min-h-full pb-20 font-sans">

      <div className={`mx-auto ${desktop ? "max-w-[600px] px-10 py-7" : "px-4 py-4"}`}>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "16px" }} />)}
          </div>
        ) : (
          <>
            <div className="bg-brand-accent rounded-2xl p-6 mb-4">
              <div className="text-xs font-medium text-white/60 tracking-widest mb-2">
                MASTER EVENTS CREDITS
              </div>
              <div className="text-4xl font-semibold text-white tracking-tight tabular-nums mb-4">
                GHS {(wallet?.balance || 0).toFixed(2)}
              </div>
              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-white/60 mb-0.5">Total Earned</div>
                  <div className="text-sm font-medium text-white tabular-nums">GHS {(wallet?.total_earned || 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-0.5">Spent on tickets</div>
                  <div className="text-sm font-medium text-white tabular-nums">GHS {(wallet?.total_spent ?? wallet?.total_withdrawn ?? 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-blue-50 rounded-xl px-4 py-3 mb-4">
              <Info size={16} weight="light" className="text-blue-700 shrink-0" />
              <div className="text-xs text-brand-text leading-relaxed">
                Sell a ticket and your credits land here instantly. Spend them on any ticket on Master Events — they come off your total at checkout.
              </div>
            </div>

            <button onClick={() => setScreen("app")} disabled={!canSpend}
              className={`w-full h-12 rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 mb-6 transition-colors ${canSpend ? "bg-brand-accent hover:bg-brand-accent-hover text-white" : "bg-brand-hairline text-brand-muted cursor-not-allowed"}`}>
              {canSpend ? <><Ticket size={16} weight="light" /> Spend credits on a ticket</> : "Sell a ticket to earn credits"}
            </button>

            <div className="font-semibold text-base text-brand-text tracking-tight mb-3.5">
              Transaction History
            </div>

            {(wallet?.transactions || []).length === 0 ? (
              <div className="text-center py-12 px-5 bg-brand-card rounded-2xl border border-brand-hairline">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <Wallet size={24} weight="light" className="text-emerald-700" />
                </div>
                <div className="font-medium text-sm text-brand-text mb-1.5">No transactions yet</div>
                <div className="text-xs text-brand-muted">Sell a ticket on the resale market to earn your first payout</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(wallet?.transactions || []).map((t, i) => {
                  const { Icon, badgeBg, iconClass, label } = txMeta(t.type);
                  const isCredit = t.type !== "withdrawal";
                  return (
                    <div key={i} className="bg-brand-card rounded-xl border border-brand-hairline px-4 py-3.5 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${badgeBg}`}>
                        <Icon size={17} weight="light" className={iconClass} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-brand-text mb-0.5">{label}</div>
                        <div className="text-xs text-brand-muted truncate">{t.description}</div>
                        <div className="text-xs text-brand-muted font-mono mt-0.5">
                          {t.reference} · {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-semibold text-brand-text tabular-nums">
                          {isCredit ? "+" : "-"}GHS {parseFloat(t.amount).toFixed(2)}
                        </div>
                        <div className={`text-xs font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${STATUS_CLASS[t.status] || "text-red-700 bg-red-50"}`}>
                          {t.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showWithdraw && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)} className="fixed inset-0 z-[300] bg-black/40" />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] z-[301] bg-brand-card rounded-t-2xl border border-brand-hairline p-6"
              style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}>
              <div className="w-10 h-1 rounded-full bg-brand-hairline mx-auto mb-5" />
              <div className="font-semibold text-xl text-brand-text mb-1">Withdraw to MoMo</div>
              <div className="text-sm text-brand-muted mb-5">
                Available: <strong className="text-brand-accent tabular-nums">GHS {(wallet?.balance || 0).toFixed(2)}</strong>
              </div>

              <div className="mb-3">
                <div className="text-xs font-semibold text-brand-muted mb-1.5">Amount (GHS)</div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors tabular-nums" />
              </div>

              <div className="mb-5">
                <div className="text-xs font-semibold text-brand-muted mb-1.5">MoMo Number</div>
                <input type="tel" value={momoNumber} onChange={e => setMomoNumber(e.target.value)} placeholder="e.g. 0241234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors tabular-nums" />
              </div>

              <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3.5 py-3 mb-4.5">
                <Info size={14} weight="light" className="text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs text-brand-text leading-relaxed">
                  Funds are sent via Paystack to your MTN/Vodafone/AirtelTigo MoMo. Usually instant.
                </div>
              </div>

              <div className="flex gap-2.5">
                <button onClick={() => setShowWithdraw(false)}
                  className="flex-1 h-11 rounded-xl bg-brand-canvas border border-brand-hairline font-medium text-sm text-brand-text">
                  Cancel
                </button>
                <button onClick={handleWithdraw} disabled={withdrawing}
                  className="flex-[2] h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-60 text-white font-medium text-sm transition-colors">
                  {withdrawing ? "Processing..." : "Withdraw Now"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}