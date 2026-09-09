import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { resaleAPI, paymentsAPI } from "../../api";
import {
  ArrowLeft, Tag, Lock, Link, Wallet, X, WarningCircle,
  CheckCircle, CircleNotch,
} from "@phosphor-icons/react";
import { EventCard } from "./AttendeeHome";

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
    resaleAPI.listings()
      .then(data => { setListings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleBuy = async (listing) => {
    if (paying) return;
    setSelected(listing);
    setPayError("");
    setPaying(true);

    const total = Math.round(listing.resale_price * 100) / 100;   // display only — the server prices the order
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

    // Reserves this listing for us and prices it server-side. A second buyer
    // hitting the same listing now gets a clean "someone else is buying this"
    // instead of both of us paying for one ticket.
    let accessCode, payRef;
    const initData = await resaleAPI.checkout(listing.listing_id || listing.id);
    if (!initData.ok || !initData.access_code) {
      setPayError(initData.error || "This ticket is no longer available.");
      setPaying(false);
      if (initData._status === 404 || initData._status === 409) {
        setListings(prev => prev.filter(l => (l.listing_id || l.id) !== (listing.listing_id || listing.id)));
      }
      return;
    }
    accessCode = initData.access_code;
    payRef     = initData.reference;

    const doHandle = (() => {
      let called = false;
      return async (ref) => {
        if (called) return;
        called = true;
        try {
          const result = await paymentsAPI.awaitTickets(ref);
          if (result.state === "fulfilled" && result.tickets?.length) {
            setNewTicket(result.tickets[0]);
            setPayDone(true);
            setListings(prev => prev.filter(l => (l.listing_id || l.id) !== (listing.listing_id || listing.id)));
          } else if (result.state === "pending") {
            setPayError("Payment received — your ticket will appear in My Tickets shortly.");
          } else {
            setPayError(result.message || result.error || "Purchase failed. Please try again.");
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
      <div className="bg-brand-subtle min-h-full flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className={`bg-brand-card rounded-2xl border border-brand-hairline max-w-[440px] w-full text-center ${desktop ? "px-9 py-10" : "px-5 py-7"}`}>
          <div className="w-[72px] h-[72px] rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} weight="light" className="text-emerald-700" />
          </div>
          <h2 className="text-xl font-semibold text-brand-text mb-2 tracking-[-0.02em]">Ticket Purchased!</h2>
          <p className="text-brand-muted text-sm leading-relaxed mb-6">
            Your resale ticket for <strong className="text-brand-text">{selected?.event?.name}</strong> is confirmed. NFT minting on Polygon.
          </p>
          <div className="flex items-center gap-2.5 bg-blue-50 rounded-xl px-4 py-3 mb-5 text-left">
            <Link size={18} weight="light" className="text-blue-700 shrink-0" />
            <div>
              <div className="text-xs font-medium text-blue-700">NFT Ownership Transfer</div>
              <div className="text-xs text-brand-muted mt-0.5">On-chain transfer in progress · Polygon Amoy</div>
            </div>
          </div>
          <button onClick={() => { if (newTicket) setViewingTicket(newTicket); setScreen("ticketView"); }}
            className="w-full h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm mb-2.5 transition-colors">
            View My Ticket
          </button>
          <button onClick={() => setScreen("app")}
            className="w-full h-11 rounded-xl bg-transparent border border-brand-hairline text-brand-muted text-sm font-medium">
            Back to Events
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`bg-brand-subtle min-h-full ${desktop ? "pb-16" : "pb-24"}`}>

      <div className={desktop ? "px-10 pt-7" : "px-4 pt-4"}>
        <button onClick={() => setScreen("app")}
          className="w-9 h-9 rounded-full bg-brand-card border border-brand-hairline flex items-center justify-center mb-4">
          <ArrowLeft size={16} weight="light" className="text-brand-text" />
        </button>

        <div className="flex items-center gap-3.5 mb-1.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Tag size={20} weight="light" className="text-blue-700" />
          </div>
          <div>
            <h1 className={`font-semibold text-brand-text tracking-[-0.02em] mb-0.5 ${desktop ? "text-2xl" : "text-xl"}`}>Resale Market</h1>
            <div className="text-xs text-brand-muted">Fan-to-fan · NFT transfer · 2% fee</div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 mb-1 flex-wrap">
          {[
            [Lock, "Secure checkout via Paystack"],
            [Link, "NFT transfers on-chain automatically"],
            [Wallet, "Seller keeps 98% of sale"],
          ].map(([Icon, text]) => (
            <div key={text} className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-brand-card border border-brand-hairline">
              <Icon size={12} weight="light" className="text-brand-muted" />
              <span className="text-xs text-brand-text font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {payError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`${desktop ? "mx-10" : "mx-4"} mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm flex justify-between items-center gap-3`}>
            <span className="flex items-center gap-2"><WarningCircle size={14} weight="light" className="shrink-0" /> {payError}</span>
            <button onClick={() => setPayError("")} className="text-brand-muted shrink-0">
              <X size={14} weight="light" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={desktop ? "px-10 pt-4" : "px-4 pt-3.5"}>
        {loading ? (
          <div className={`grid gap-3 ${desktop ? "grid-cols-4" : "grid-cols-2"}`}>
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-brand-card rounded-2xl overflow-hidden border border-brand-hairline">
                <div className="skeleton aspect-square" />
                <div className="p-3">
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "10px", borderRadius: "6px" }} />
                  <div className="skeleton" style={{ height: "11px", width: "45%", borderRadius: "6px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 px-6 bg-brand-card rounded-2xl border border-brand-hairline mt-2">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3.5">
              <Tag size={24} weight="light" className="text-blue-700" />
            </div>
            <div className="font-medium text-[15px] text-brand-text mb-2">No resale listings</div>
            <div className="text-sm text-brand-muted leading-relaxed">When attendees list tickets for resale, they'll appear here.</div>
          </div>
        ) : (
          <div className={`grid gap-3 ${desktop ? "grid-cols-4" : "grid-cols-2"}`}>
            {listings.map(listing => {
              const ev          = listing.event;
              const isBuying    = paying && selected?.ticket_id === listing.ticket_id;
              const isOwn       = listing.seller === currentUser?.first_name;
              const img         = ev.image || categoryImages[ev.category] || categoryImages.other;
              const currency    = ev.currency || "GHS";

              const footer = (
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xl font-semibold text-brand-text tracking-tight tabular-nums">
                      {currency} {listing.resale_price.toLocaleString()}
                    </span>
                    <span className="text-xs text-brand-muted line-through tabular-nums">
                      {currency} {listing.original_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-brand-muted mb-2.5">Sold by <span className="font-medium text-brand-text">{listing.seller || "Fan"}</span></div>
                  {isOwn ? (
                    <div className="text-center h-9 flex items-center justify-center bg-brand-canvas rounded-xl text-xs text-brand-muted font-medium">
                      Your listing
                    </div>
                  ) : (
                    <button onClick={() => handleBuy(listing)} disabled={isBuying || paying}
                      className={`w-full h-9 rounded-xl font-medium text-xs tabular-nums flex items-center justify-center gap-2 transition-colors ${isBuying ? "bg-brand-hairline text-brand-muted" : "bg-brand-accent hover:bg-brand-accent-hover text-white"} ${paying && !isBuying ? "opacity-50" : ""}`}>
                      {isBuying ? (
                        <><CircleNotch size={14} className="animate-spin" /> Processing...</>
                      ) : `Buy for ${currency} ${listing.resale_price.toLocaleString()}`}
                    </button>
                  )}
                </div>
              );

              return (
                <EventCard key={listing.ticket_id}
                  ev={{ ...ev, image: img, currency }}
                  footer={footer} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
