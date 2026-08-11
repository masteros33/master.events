import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paymentsAPI } from "../../api";
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Percent,
  Smartphone, Landmark, Lock, AlertCircle, CheckCircle2,
} from "lucide-react";

const isDesktop = () => window.innerWidth > 768;

const TX_META = {
  sale:         { badgeBg: "bg-pastel-green", iconClass: "text-fintech-green", Icon: ArrowDownLeft },
  resale_sale:  { badgeBg: "bg-pastel-blue",  iconClass: "text-fintech-blue",  Icon: ArrowDownLeft },
  withdrawal:   { badgeBg: "bg-gray-100",     iconClass: "text-brand-muted",   Icon: ArrowUpRight },
  fee:          { badgeBg: "bg-gray-100",     iconClass: "text-brand-muted",   Icon: Percent },
};
const STATUS_CLASS = {
  completed: "text-emerald-700 bg-emerald-50",
  pending:   "text-amber-700 bg-amber-50",
};

// ── MoMo networks — previously the backend always assumed MTN
// regardless of which network the account actually belonged to,
// silently breaking withdrawals for Telecel/AirtelTigo users. This
// selector lets the user say which network their number is on, and
// that value gets sent through to the withdraw API as `network`. ──
const MOMO_NETWORKS = [
  { id: "mtn",        label: "MTN" },
  { id: "telecel",    label: "Telecel" },
  { id: "airteltigo", label: "AirtelTigo" },
];

const fieldClass = "w-full px-3.5 py-3 mb-3.5 rounded-xl border border-gray-200 bg-white text-sm text-brand-text outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition-colors font-mono";
const primaryBtnClass = "w-full py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-[15px] transition-colors";

export default function OrganizerWallet() {
  const [showModal, setShowModal]       = useState(false);
  const [step, setStep]                 = useState(1);
  const [amount, setAmount]             = useState("");
  const [method, setMethod]             = useState("momo");
  const [network, setNetwork]           = useState("mtn");
  const [momoNumber, setMomoNumber]     = useState("");
  const [txRef, setTxRef]               = useState("");
  const [loading, setLoading]           = useState(true);
  const [wallet, setWallet]             = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amountError, setAmountError]   = useState("");
  const [desktop, setDesktop]           = useState(isDesktop());

  useEffect(() => {
    const r = () => setDesktop(isDesktop());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

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
      // ── NEW: network sent alongside method/account — only meaningful
      // for MoMo; bank transfers ignore it server-side ──
      const data = await paymentsAPI.withdraw({
        amount: parseFloat(amount),
        method,
        account: momoNumber,
        network: method === "momo" ? network : undefined,
      });
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

  const miniStats = [
    { Icon: TrendingUp,   label: "Total Earned", value: "GHS " + Math.round(totalEarned).toLocaleString(),    badgeBg: "bg-pastel-green", iconClass: "text-fintech-green" },
    { Icon: ArrowUpRight, label: "Withdrawn",    value: "GHS " + Math.round(totalWithdrawn).toLocaleString(), badgeBg: "bg-pastel-blue",  iconClass: "text-fintech-blue" },
    { Icon: Percent,      label: "Fees Paid",    value: "GHS " + Math.round(feesPaid).toLocaleString(),       badgeBg: "bg-gray-100",     iconClass: "text-brand-muted" },
    { Icon: Wallet,       label: "Balance",      value: "GHS " + Math.round(balance).toLocaleString(),        badgeBg: "bg-pastel-orange", iconClass: "text-brand-orange" },
  ];

  const closeModal = () => { setShowModal(false); setStep(1); setAmount(""); setMomoNumber(""); setNetwork("mtn"); setAmountError(""); };

  // ── Modal body — shared between the mobile bottom-sheet and the
  // desktop centered dialog, so step logic only lives in one place ──
  const modalBody = (
    <>
      <div className="shrink-0 px-6 pt-2">
        <div className="font-extrabold text-xl text-brand-text mb-0.5">
          {step === 1 ? "Withdraw Funds" : step === 2 ? "Confirm Withdrawal" : "Done!"}
        </div>
        {step === 1 && <div className="text-sm text-brand-muted mb-2">Available: <span className="text-brand-orange font-bold font-mono">GHS {Math.round(balance).toLocaleString()}</span></div>}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-3.5 pb-8" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>

        {step === 1 && (
          <>
            <div className="text-xs font-semibold text-brand-muted mb-2">Amount (GHS)</div>
            <input type="number" placeholder="Min: GHS 10" value={amount}
              onChange={e => { setAmount(e.target.value); setAmountError(""); }}
              className={`${fieldClass} ${amountError ? "border-red-300" : ""}`} />

            <div className="flex gap-2 -mt-1.5 mb-4.5">
              {[50, 100, 200, 500].map(q => (
                <button key={q} onClick={() => { setAmount(String(q)); setAmountError(""); }}
                  className={`flex-1 py-2 rounded-xl border text-center text-[13px] font-bold transition-colors ${amount === String(q) ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-white text-brand-muted"}`}>
                  {q}
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-brand-muted mb-2.5">Payment Method</div>
            <div className="flex gap-2.5 mb-4">
              {[["momo", Smartphone, "Mobile Money"], ["bank", Landmark, "Bank Transfer"]].map(([id, Icon, label]) => (
                <button key={id} onClick={() => setMethod(id)}
                  className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-colors ${method === id ? "border-brand-orange bg-orange-50/20" : "border-gray-200 bg-white"}`}>
                  <Icon size={17} strokeWidth={1.75} className={method === id ? "text-brand-orange" : "text-brand-muted"} />
                  <span className={`text-[13px] font-bold ${method === id ? "text-brand-orange" : "text-brand-muted"}`}>{label}</span>
                </button>
              ))}
            </div>

            {/* ── NEW: network selector — only shown for MoMo, since
            bank transfer doesn't need a network. This is the actual
            fix for the hardcoded-MTN bug: whichever chip is selected
            gets sent through as `network` in handleWithdraw. ── */}
            {method === "momo" && (
              <>
                <div className="text-xs font-semibold text-brand-muted mb-2.5">Network</div>
                <div className="flex gap-2 mb-4">
                  {MOMO_NETWORKS.map(n => (
                    <button key={n.id} onClick={() => setNetwork(n.id)}
                      className={`flex-1 py-2.5 rounded-xl border text-center text-[12px] font-bold transition-colors ${network === n.id ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-white text-brand-muted"}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <input placeholder={method === "momo" ? "MoMo number e.g. 0241234567" : "Bank account number"}
              value={momoNumber}
              onChange={e => { setMomoNumber(e.target.value); setAmountError(""); }}
              className={`${fieldClass} ${amountError ? "border-red-300" : ""}`} />

            <AnimatePresence>
              {amountError && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-red-600 text-[13px] font-semibold -mt-2 mb-3.5">
                  <AlertCircle size={14} strokeWidth={2} /> {amountError}
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => { if (validateWithdraw()) setStep(2); }} className={primaryBtnClass}>
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-start gap-2 bg-pastel-blue rounded-xl px-4 py-3 mb-4.5">
              <Lock size={14} strokeWidth={1.75} className="text-fintech-blue shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-fintech-blue mb-0.5">Verify your details</div>
                <div className="text-xs text-brand-muted">This action cannot be reversed once confirmed.</div>
              </div>
            </div>
            {[
              ["Amount",     "GHS " + amount],
              ["Method",     method === "momo" ? `Mobile Money — ${MOMO_NETWORKS.find(n => n.id === network)?.label}` : "Bank Transfer"],
              ["Send to",    momoNumber],
              ["Processing", "5–10 minutes"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-brand-muted text-sm">{k}</span>
                <span className="text-brand-text text-sm font-bold font-mono">{v}</span>
              </div>
            ))}
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-full bg-brand-canvas border border-gray-200 text-brand-text font-semibold text-sm">
                ← Back
              </button>
              <button onClick={handleWithdraw} className={`${primaryBtnClass} flex-[2]`}>
                Confirm Withdrawal
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-2">
            <div className="w-[76px] h-[76px] rounded-2xl bg-pastel-green flex items-center justify-center mx-auto mb-4.5">
              <CheckCircle2 size={34} strokeWidth={1.75} className="text-fintech-green" />
            </div>
            <div className="font-extrabold text-xl text-brand-text mb-2">Withdrawal Initiated!</div>
            <div className="text-brand-muted text-sm mb-5 leading-relaxed">
              GHS {amount} will arrive in your {method === "momo" ? "MoMo" : "bank"} within 5–10 minutes.
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 mb-6 text-left">
              <div className="text-[10px] text-emerald-700 font-bold tracking-wide font-mono mb-1">TRANSACTION REFERENCE</div>
              <div className="font-mono font-bold text-brand-orange text-sm break-all">{txRef}</div>
              <div className="text-xs text-brand-muted mt-1">Save this for your records</div>
            </div>
            <button onClick={closeModal} className={primaryBtnClass}>
              Done
            </button>
          </motion.div>
        )}
      </div>
    </>
  );

  return (
    <div className={`bg-fintech-gray min-h-full font-sans ${desktop ? "p-10" : "px-4 pt-5 pb-24"}`}>
      <div className={`mx-auto ${desktop ? "max-w-[900px]" : ""}`}>

        {/* Header */}
        <div className="mb-7">
          <div className="text-[11px] text-brand-orange font-bold tracking-widest font-mono mb-1.5">WALLET</div>
          <h1 className={`font-extrabold text-brand-text tracking-tight mb-1 ${desktop ? "text-3xl" : "text-2xl"}`}>Your Earnings</h1>
          <p className="text-brand-muted text-sm">Track revenue and withdraw to MoMo or bank</p>
        </div>

        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "64px", marginBottom: "12px", borderRadius: "16px" }} />)}</div>
        ) : (
          <div className={`grid gap-6 ${desktop ? "grid-cols-2" : "grid-cols-1"}`}>

            {/* ── Left — balance card ── */}
            <div>
              <div className="bg-fintech-slate rounded-3xl p-7 mb-4">
                <div className="text-[11px] font-bold text-slate-400 tracking-widest font-mono mb-2">AVAILABLE_BALANCE</div>
                <div className="text-5xl font-extrabold text-white tracking-tight font-mono mb-1 leading-none">
                  GHS {Math.round(balance).toLocaleString()}
                </div>
                <div className="text-[13px] text-slate-400 mb-5">Ready to withdraw · updated live</div>

                <div className="flex justify-between bg-slate-800 rounded-2xl px-4 py-3.5 mb-4">
                  {[
                    ["Lifetime",  "GHS " + Math.round(totalEarned).toLocaleString()],
                    ["Fees",      "GHS " + Math.round(feesPaid).toLocaleString()],
                    ["Withdrawn", "GHS " + Math.round(totalWithdrawn).toLocaleString()],
                  ].map(([k,v]) => (
                    <div key={k} className="text-center">
                      <div className="text-sm font-extrabold text-white font-mono">{v}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{k}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800 rounded-xl px-3.5 py-3 mb-4.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400">95% You</span>
                    <span className="text-xs text-slate-400">5% Platform</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div className="w-[95%] h-full bg-emerald-400 rounded-full" />
                  </div>
                </div>

                <button onClick={() => { setShowModal(true); setStep(1); setAmount(""); setMomoNumber(""); setNetwork("mtn"); setAmountError(""); }}
                  className="w-full py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-[15px] transition-colors">
                  Withdraw Funds
                </button>
              </div>

              <div className={`grid grid-cols-2 gap-2.5 ${desktop ? "" : "mb-6"}`}>
                {miniStats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-9 h-9 rounded-full ${s.badgeBg} flex items-center justify-center mb-2.5`}>
                      <s.Icon size={16} strokeWidth={1.75} className={s.iconClass} />
                    </div>
                    <div className="text-base font-extrabold text-fintech-slate font-mono mb-0.5">{s.value}</div>
                    <div className="text-[11px] text-brand-muted font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right — transactions ── */}
            <div>
              <div className="font-extrabold text-base text-brand-text tracking-tight mb-4">Transaction History</div>
              {transactions.length === 0 ? (
                <div className="text-center py-12 px-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-pastel-green flex items-center justify-center mx-auto mb-3">
                    <Wallet size={24} strokeWidth={1.75} className="text-fintech-green" />
                  </div>
                  <div className="font-bold text-sm text-brand-text mb-1.5">No transactions yet</div>
                  <div className="text-xs text-brand-muted">Revenue will appear here when tickets are sold</div>
                </div>
              ) : transactions.map((t, i) => {
                const meta = TX_META[t.type] || { badgeBg: "bg-gray-100", iconClass: "text-brand-muted", Icon: Wallet };
                const isDebit = t.type === "withdrawal" || t.type === "fee";
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3.5 mb-2 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.badgeBg}`}>
                      <meta.Icon size={17} strokeWidth={1.75} className={meta.iconClass} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-brand-text truncate">{t.description}</div>
                      <div className="text-[11px] text-brand-muted font-mono mt-0.5">
                        {new Date(t.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-sm text-fintech-slate font-mono">
                        {isDebit ? "-" : "+"}GHS {parseFloat(t.amount).toLocaleString()}
                      </div>
                      <div className={`text-[9px] font-bold font-mono mt-1 px-1.5 py-0.5 rounded-full inline-block ${STATUS_CLASS[t.status] || "text-red-700 bg-red-50"}`}>
                        {t.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Withdraw Modal — mobile bottom sheet vs. desktop centered
      dialog. Previously this was ALWAYS a bottom sheet (fixed bottom-0),
      even on desktop — just centered horizontally. On a tall browser
      window that put the whole modal pinned to the bottom edge,
      looking like it was "hiding" far below the visible content.
      Desktop now gets a proper vertically-centered dialog with a
      scale/fade entrance instead of a slide-up. ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 z-[200] bg-black/40" />

            {desktop ? (
              <div className="fixed inset-0 z-[201] flex items-center justify-center px-6 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="pointer-events-auto bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col w-[480px]"
                  style={{ maxHeight: "min(85dvh, 720px)" }}>
                  <div className="shrink-0 flex justify-end px-5 pt-4">
                    <button onClick={closeModal} className="text-brand-muted hover:text-brand-text text-xs font-semibold">
                      Close ✕
                    </button>
                  </div>
                  {modalBody}
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-3xl border border-gray-100 flex flex-col w-full"
                style={{ maxHeight: "85dvh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
                <div className="shrink-0 flex flex-col items-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>
                {modalBody}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}