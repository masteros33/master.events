import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";

const API = "https://master-events-backend.onrender.com";
const BRAND   = "#F97316";
const BRAND_D = "#EA6C0A";
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
  const [selected,  setSelected]  = useState(null);  // ticket being bought
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

    // Load Paystack
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

    // Initialize payment
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

    // doHandle — prevents double fire
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

  // ── Payment success screen ──
  if (payDone && newTicket) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: "var(--bg-card)", borderRadius: "22px", padding: desktop ? "40px 36px" : "28px 20px", maxWidth: "440px", width: "100%", textAlign: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(22,163,74,0.3)" }}>✅</motion.div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Ticket Purchased!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
            Your resale ticket for <strong style={{ color: "var(--text-primary)" }}>{selected?.event?.name}</strong> is confirmed. NFT minting on Polygon.
          </p>
          <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "12px", padding: "12px 16px", marginBottom: "22px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⛓️</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed" }}>NFT Ownership Transfer</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>On-chain transfer in progress · Polygon Amoy</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (newTicket) setViewingTicket(newTicket);
              setScreen("ticketView");
            }}
            style={{ width: "100%", padding: "15px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "13px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", marginBottom: "10px", fontFamily: "var(--font-sans)" }}>
            View My Ticket
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen("app")}
            style={{ width: "100%", padding: "13px", background: "transparent", border: "1px solid var(--border)", borderRadius: "13px", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-sans)" }}>
            Back to Events
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* Header */}
      <div style={{ padding: desktop ? "28px 40px 0" : "16px 16px 0" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, padding: "0 0 16px", fontFamily: "var(--font-sans)" }}>
          ← Back
        </motion.button>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🏷️</div>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: desktop ? "26px" : "20px", color: "var(--text-primary)", letterSpacing: "-0.6px", marginBottom: "3px" }}>Resale Market</h1>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>FAN_TO_FAN · NFT_TRANSFER · 2%_FEE</div>
          </div>
        </div>

        {/* Info strip */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", marginBottom: "4px", flexWrap: "wrap" }}>
          {[
            ["🔒", "Secure checkout via Paystack"],
            ["⛓️", "NFT transfers on-chain automatically"],
            ["💰", "Seller keeps 98% of sale"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "99px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "11px" }}>{icon}</span>
              <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {payError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ margin: desktop ? "12px 40px 0" : "12px 16px 0", background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", color: "var(--error)", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {payError}</span>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setPayError("")}
              style={{ cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "var(--text-muted)" }}>✕</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings */}
      <div style={{ padding: desktop ? "16px 40px 0" : "14px 16px 0" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "18px" : "12px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: "180px" }} />
                <div style={{ padding: "14px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "10px" }} />
                  <div className="skeleton" style={{ height: "11px", width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 24px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", marginTop: "8px" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>🏷️</div>
            <div style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>No resale listings</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>When attendees list tickets for resale, they'll appear here.</div>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "18px" : "12px" }}>
            {listings.map((listing, i) => {
              const ev          = listing.event;
              const isBuying    = paying && selected?.ticket_id === listing.ticket_id;
              const isOwn       = listing.seller === currentUser?.first_name;
              const img         = ev.image || categoryImages[ev.category] || categoryImages.other;
              const savingsPct  = Math.round(((listing.original_price - listing.resale_price) / listing.original_price) * 100);

              return (
                <motion.div key={listing.ticket_id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>

                  {/* Event image */}
                  <div style={{ height: "160px", position: "relative" }}>
                    <img src={img} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.src = categoryImages.other; }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.72))" }} />

                    {/* NFT badge */}
                    <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "3px 9px", borderRadius: "99px" }}>
                      <span style={{ fontSize: "8px" }}>⛓️</span>
                      <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>NFT</span>
                    </div>

                    {/* Savings badge */}
                    {savingsPct > 0 && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", background: "#16a34a", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>
                        -{savingsPct}%
                      </div>
                    )}

                    {/* Event name at bottom */}
                    <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px" }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", lineHeight: 1.25, marginBottom: "2px" }}>{ev.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "14px 16px" }}>
                    {/* Price row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontSize: "22px", fontWeight: 900, color: BRAND, letterSpacing: "-0.5px", lineHeight: 1 }}>
                          GHS {listing.resale_price.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
                          Original: GHS {listing.original_price.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Sold by</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{listing.seller || "Fan"}</div>
                      </div>
                    </div>

                    {/* Ticket meta */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                      {[
                        ["🎟️", listing.quantity + "x ticket"],
                        ...(listing.nft_token_id ? [["⛓️", "NFT #" + listing.nft_token_id]] : [["⛓️", "NFT verified"]]),
                      ].map(([icon, text]) => (
                        <div key={text} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "99px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "10px" }}>{icon}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Buy button */}
                    {isOwn ? (
                      <div style={{ textAlign: "center", padding: "10px", background: "var(--bg-subtle)", borderRadius: "11px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                        Your listing
                      </div>
                    ) : (
                      <motion.button
                        whileHover={!isBuying ? { scale: 1.02 } : {}}
                        whileTap={!isBuying ? { scale: 0.97 } : {}}
                        onClick={() => handleBuy(listing)}
                        disabled={isBuying || paying}
                        style={{
                          width: "100%", padding: "13px",
                          background: isBuying ? "var(--bg-subtle)" : `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`,
                          color: isBuying ? "var(--text-muted)" : "#fff",
                          border: "none", borderRadius: "11px",
                          fontSize: "14px", fontWeight: 700,
                          cursor: isBuying || paying ? "not-allowed" : "pointer",
                          boxShadow: isBuying ? "none" : "var(--shadow-brand)",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                          fontFamily: "var(--font-sans)", transition: "all 0.2s",
                          opacity: paying && !isBuying ? 0.5 : 1,
                        }}>
                        {isBuying ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                              style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--text-muted)", flexShrink: 0 }} />
                            Processing...
                          </>
                        ) : `Buy for GHS ${listing.resale_price.toLocaleString()} →`}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}