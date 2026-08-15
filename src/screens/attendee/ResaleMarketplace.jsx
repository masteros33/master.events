import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import {
  ArrowLeft, Tag, Lock, Link2, Wallet, X, AlertCircle,
  MapPin, Ticket, CheckCircle2, Loader2,
} from "lucide-react";

const API = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

export default function ResaleMarket() {
  const setScreen        = useStore(s => s.setScreen);
  const setViewingTicket = useStore(s => s.setViewingTicket);
  const currentUser      = useStore(s => s.currentUser);

  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [paying,    setPaying]    = useState(false);
  const [payError,  setPayError]  = useState("");
  const [payDone,   setPayDone]   = useState(false);
  const [newTicket, setNewTicket] = useState(null);
  const desktop = isDesktop();

  useEffect(() => {
    ticketsAPI.resaleListings()
      .then(data => { setListings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleBuy = async (listing) => {
    if (paying) return;
    setSelected(listing);
    setPayError("");
    setPaying(true);

    const total = Math.round(listing.resale_price * 100) / 100;
    const totalPesewas = Math.round(total * 100);

    try {
      await new Promise((resolve, reject) => {
        if (window.PaystackPop) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://js.paystack.co/v1/inline.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    } catch {
      setPayError("Failed to load payment gateway.");
      setPaying(false); return;
    }

    let accessCode, payRef;
    try {
      const token = localStorage.getItem("access_token") || "";
      const initRes = await fetch(`${API}/api/payments/initialize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          amount:     total,
          event_id:   listing.event.id,
          event_name: listing.event.name,
          quantity:   1,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData.access_code) {
        setPayError(initData.error || "Failed to initialize payment.");
        setPaying(false); return;
      }
      accessCode = initData.access_code;
      payRef     = initData.reference;
    } catch {
      setPayError("Connection error. Please try again.");
      setPaying(false); return;
    }

    const doHandle = (() => {
      let called = false;
      return async (ref) => {
        if (called) return;
        called = true;
        try {
          const result = await ticketsAPI.buyResale({
            ticket_id:         listing.ticket_id,
            payment_reference: ref,
          });
          if (result._status === 201 || result.ticket_id) {
            setNewTicket(result);
            setPayDone(true);
            setListings(prev => prev.filter(l => l.ticket_id !== listing.ticket_id));
          } else {
            setPayError(result.error || "Purchase failed. Please try again.");
          }
        } catch {
          setPayError("Server error. Check My Tickets — your ticket may have been issued.");
        } finally {
          setPaying(false);
        }
      };
    })();

    const openPaystack = () => {
      try {
        const handler = window.PaystackPop.setup({
          key:         import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
          email:       currentUser?.email || "",
          amount:      totalPesewas,
          currency:    "GHS",
          channels:    ["mobile_money", "card"],
          ref:         payRef,
          access_code: accessCode,
          onClose:     () => { setPaying(false); },
          callback:    (r) => { doHandle(r.reference || payRef); },
        });
        handler.openIframe();
      } catch {
        window.open(`https://checkout.paystack.com/${accessCode}`, "_blank");
        setTimeout(() => { setPaying(false); setPayError("Complete payment in the new tab, then check My Tickets."); }, 3000);
      }
    };

    try {
      window.PaystackPop.resumeTransaction(accessCode, {
        onClose:  () => { setPaying(false); },
        callback: (r) => { doHandle(r.reference || payRef); },
      });
    } catch {
      openPaystack();
    }
  };

  if (payDone && newTicket) {
    return (
      <div className="bg-fintech-gray min-h-full flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className={`bg-brand-card rounded-3xl border border-gray-100 shadow-sm max-w-[440px] w-full text-center ${desktop ? "px-9 py-10" : "px-5 py-7"}`}>
          <div className="w-[72px] h-[72px] rounded-full bg-pastel-green flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} strokeWidth={1.75} className="text-fintech-green" />
          </div>
          <h2 className="text-xl font-extrabold text-brand-text mb-2 tracking-tight">Ticket Purchased!</h2>
          <p className="text-brand-muted text-sm leading-relaxed mb-6">
            Your resale ticket for <strong className="text-brand-text">{selected?.event?.name}</strong> is confirmed. NFT minting on Polygon.
          </p>
          <div className="flex items-center gap-2.5 bg-pastel-blue rounded-xl px-4 py-3 mb-5 text-left">
            <Link2 size={18} strokeWidth={1.75} className="text-fintech-blue shrink-0" />
            <div>
              <div className="text-xs font-bold text-fintech-blue">NFT Ownership Transfer</div>
              <div className="text-[11px] text-brand-muted mt-0.5">On-chain transfer in progress · Polygon Amoy</div>
            </div>
          </div>
          <button onClick={() => { if (newTicket) setViewingTicket(newTicket); setScreen("ticketView"); }}
            className="w-full py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm mb-2.5 transition-colors">
            View My Ticket
          </button>
          <button onClick={() => setScreen("app")}
            className="w-full py-3 rounded-full bg-transparent border border-gray-200 text-brand-muted text-sm">
            Back to Events
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`bg-fintech-gray min-h-full ${desktop ? "pb-16" : "pb-24"}`}>

      {/* ── Header — icon-only back button ── */}
      <div className={desktop ? "px-10 pt-7" : "px-4 pt-4"}>
        <button onClick={() => setScreen("app")}
          className="w-9 h-9 rounded-full bg-brand-card border border-gray-100 flex items-center justify-center mb-4">
          <ArrowLeft size={16} strokeWidth={2} className="text-brand-text" />
        </button>

        <div className="flex items-center gap-3.5 mb-1.5">
          <div className="w-11 h-11 rounded-full bg-pastel-blue flex items-center justify-center shrink-0">
            <Tag size={20} strokeWidth={1.75} className="text-fintech-blue" />
          </div>
          <div>
            <h1 className={`font-extrabold text-brand-text tracking-tight mb-0.5 ${desktop ? "text-2xl" : "text-xl"}`}>Resale Market</h1>
            <div className="text-[11px] text-brand-muted font-mono">FAN_TO_FAN · NFT_TRANSFER · 2%_FEE</div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 mb-1 flex-wrap">
          {[
            [Lock, "Secure checkout via Paystack"],
            [Link2, "NFT transfers on-chain automatically"],
            [Wallet, "Seller keeps 98% of sale"],
          ].map(([Icon, text]) => (
            <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-card border border-gray-100">
              <Icon size={12} strokeWidth={1.75} className="text-brand-muted" />
              <span className="text-[10px] text-brand-text font-semibold">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {payError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`${desktop ? "mx-10" : "mx-4"} mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm flex justify-between items-center gap-3`}>
            <span className="flex items-center gap-2"><AlertCircle size={14} strokeWidth={2} className="shrink-0" /> {payError}</span>
            <button onClick={() => setPayError("")} className="text-brand-muted shrink-0">
              <X size={14} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={desktop ? "px-10 pt-4" : "px-4 pt-3.5"}>
        {loading ? (
          <div className={`grid gap-4 ${desktop ? "grid-cols-3" : "grid-cols-1"}`}>
            {[1,2,3].map(i => (
              <div key={i} className="bg-brand-card rounded-2xl overflow-hidden border border-gray-100">
                <div className="skeleton" style={{ height: "160px" }} />
                <div className="p-3.5">
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "10px" }} />
                  <div className="skeleton" style={{ height: "11px", width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 px-6 bg-brand-card rounded-2xl border border-gray-100 shadow-sm mt-2">
            <div className="w-14 h-14 rounded-full bg-pastel-blue flex items-center justify-center mx-auto mb-3.5">
              <Tag size={24} strokeWidth={1.75} className="text-fintech-blue" />
            </div>
            <div className="font-extrabold text-base text-brand-text mb-2">No resale listings</div>
            <div className="text-sm text-brand-muted leading-relaxed">When attendees list tickets for resale, they'll appear here.</div>
          </div>
        ) : (
          <div className={`grid gap-4 ${desktop ? "grid-cols-3" : "grid-cols-1"}`}>
            {listings.map(listing => {
              const ev          = listing.event;
              const isBuying    = paying && selected?.ticket_id === listing.ticket_id;
              const isOwn       = listing.seller === currentUser?.first_name;
              const img         = ev.image || categoryImages[ev.category] || categoryImages.other;
              const savingsPct  = Math.round(((listing.original_price - listing.resale_price) / listing.original_price) * 100);

              return (
                <div key={listing.ticket_id} className="bg-brand-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                  <div className="h-40 relative">
                    <img src={img} alt={ev.name} className="w-full h-full object-cover"
                      onError={e => { e.target.src = categoryImages.other; }} />

                    <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-brand-text text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                      <Link2 size={9} strokeWidth={2.5} /> NFT
                    </span>

                    {savingsPct > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-fintech-green text-white text-[9px] font-bold px-2.5 py-1 rounded-full font-mono">
                        -{savingsPct}%
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="font-bold text-sm text-brand-text mb-1 leading-snug">{ev.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-brand-muted font-mono mb-3">
                      <MapPin size={10} strokeWidth={1.75} /> {ev.venue} · {ev.date}
                    </div>

                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <div className="text-3xl font-bold text-fintech-slate tracking-tight font-mono leading-none">
                          GHS {listing.resale_price.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-brand-muted mt-1 font-mono line-through">
                          GHS {listing.original_price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-brand-muted font-mono">Sold by</div>
                        <div className="text-xs font-bold text-brand-text">{listing.seller || "Fan"}</div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 mb-3.5 flex-wrap">
                      {[
                        [Ticket, listing.quantity + "x ticket"],
                        [Link2, listing.nft_token_id ? "NFT #" + listing.nft_token_id : "NFT verified"],
                      ].map(([Icon, text]) => (
                        <div key={text} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pastel-blue">
                          <Icon size={10} strokeWidth={1.75} className="text-fintech-blue" />
                          <span className="text-[10px] text-fintech-blue font-semibold font-mono">{text}</span>
                        </div>
                      ))}
                    </div>

                    {isOwn ? (
                      <div className="text-center py-2.5 bg-brand-canvas rounded-full text-xs text-brand-muted font-semibold">
                        Your listing
                      </div>
                    ) : (
                      <button onClick={() => handleBuy(listing)} disabled={isBuying || paying}
                        className={`w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isBuying ? "bg-gray-100 text-brand-muted" : "bg-brand-orange hover:bg-brand-orange-hover text-white"} ${paying && !isBuying ? "opacity-50" : ""}`}>
                        {isBuying ? (
                          <><Loader2 size={16} className="animate-spin" /> Processing...</>
                        ) : `Buy for GHS ${listing.resale_price.toLocaleString()} →`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}