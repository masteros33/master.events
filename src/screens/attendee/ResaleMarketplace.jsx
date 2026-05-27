import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";

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

export default function ResaleMarketplace() {
  const setScreen        = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty     = useStore(s => s.setTicketQty);
  const currentUser      = useStore(s => s.currentUser);
  const myTickets        = useStore(s => s.myTickets);

  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [buying,    setBuying]    = useState(null); // ticket_id being purchased
  const [buyError,  setBuyError]  = useState("");
  const [searchQ,   setSearchQ]   = useState("");
  const desktop = isDesktop();

  useEffect(() => {
    fetch(`${API}/api/tickets/resale/`)
      .then(r => r.json())
      .then(data => { setListings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l =>
    l.event?.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    l.event?.venue?.toLowerCase().includes(searchQ.toLowerCase())
  );

  // Check if user already owns a ticket for this event
  const ownsTicket = (eventId) =>
    myTickets.some(t => t.event?.id === eventId && t.status === "active");

  // Check if this is the user's own listing
  const isOwnListing = (listing) =>
    listing.seller === currentUser?.first_name;

  const handleBuy = async (listing) => {
    if (!currentUser) { setScreen("login"); return; }
    setBuying(listing.ticket_id);
    setBuyError("");

    const total        = listing.resale_price;
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
      setBuyError("Failed to load payment gateway.");
      setBuying(null); return;
    }

    // Initialize via backend
    let accessCode, payRef;
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API}/api/payments/initialize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          amount:     total,
          event_id:   listing.event.id,
          event_name: listing.event.name,
          quantity:   listing.quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_code) {
        setBuyError(data.error || "Failed to initialize payment.");
        setBuying(null); return;
      }
      accessCode = data.access_code;
      payRef     = data.reference;
    } catch {
      setBuyError("Connection error. Try again.");
      setBuying(null); return;
    }

    // Open Paystack
    try {
      window.PaystackPop.resumeTransaction(accessCode, {
        onClose: () => { setBuying(null); },
        callback: async (r) => {
          const ref = r.reference || payRef;
          try {
            const token = localStorage.getItem("access_token") || "";
            const res = await fetch(`${API}/api/tickets/resale/buy/`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ ticket_id: listing.ticket_id, payment_reference: ref }),
            });
            const data = await res.json();
            if (res.ok) {
              // Remove from listings
              setListings(prev => prev.filter(l => l.ticket_id !== listing.ticket_id));
              // Add to store
              useStore.getState().setViewingTicket({
                id:           data.ticket_id,
                ticket_id:    data.ticket_id,
                event:        listing.event,
                qty:          listing.quantity,
                quantity:     listing.quantity,
                status:       "active",
                dynamic_qr:   data.dynamic_qr   || null,
                qr_base64:    data.dynamic_qr   || null,
                qr_image_url: data.qr_image_url || null,
                qr_image:     data.qr_image     || null,
                nft_tx_hash:  data.nft_tx_hash  || null,
                nft_token_id: data.nft_token_id || null,
                nft_minting:  true,
                purchasedAt:  new Date().toLocaleDateString(),
                owner: `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim(),
              });
              setScreen("paymentSuccess");
            } else {
              setBuyError(data.error || "Purchase failed.");
            }
          } catch {
            setBuyError("Connection error completing purchase.");
          }
          setBuying(null);
        },
      });
    } catch {
      setBuying(null);
      setBuyError("Payment gateway error.");
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* Header */}
      <div style={{ padding: desktop ? "32px 40px 0" : "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px", padding: 0, display: desktop ? "none" : "block" }}>
            ←
          </motion.button>
          <h1 style={{ fontSize: desktop ? "26px" : "22px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.5px", margin: 0 }}>
            Resale Market
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
          Fan-to-fan ticket resales · NFT ownership transfers on Polygon · 2% fee
        </p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: desktop ? "480px" : "100%", marginBottom: "20px" }}>
          <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "14px" }}>🔍</div>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search events or venues..."
            style={{ width: "100%", padding: "12px 40px 12px 40px", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "14px", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
          />
          {searchQ && <div onClick={() => setSearchQ("")} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-muted)" }}>✕</div>}
        </div>

        {/* Error */}
        <AnimatePresence>
          {buyError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "var(--error)", fontSize: "13px" }}>
              ⚠️ {buyError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Listings */}
      <div style={{ padding: desktop ? "0 40px" : "0 16px" }}>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: "14px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: "160px" }} />
                <div style={{ padding: "14px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "8px", borderRadius: "6px" }} />
                  <div className="skeleton" style={{ height: "12px", width: "45%", borderRadius: "6px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🏷️</div>
            <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>
              {searchQ ? "No listings match your search" : "No resale tickets right now"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
              {searchQ ? "Try a different search" : "Check back later — fans list tickets here when they can't attend"}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen("app")}
              style={{ padding: "12px 28px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-brand)" }}>
              Browse Events
            </motion.button>
          </motion.div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: "14px" }}>
            {filtered.map((listing, i) => {
              const ev        = listing.event;
              const isBuying  = buying === listing.ticket_id;
              const isOwn     = isOwnListing(listing);
              const alreadyOwns = ownsTicket(ev?.id);
              const discount  = ev ? Math.round(((listing.original_price - listing.resale_price) / listing.original_price) * 100) : 0;
              const image     = ev?.image || categoryImages[ev?.category] || categoryImages.other;

              return (
                <motion.div key={listing.ticket_id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>

                  {/* Image */}
                  <div style={{ height: "160px", position: "relative" }}>
                    <img src={image} alt={ev?.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.src = categoryImages.other; }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.65))" }} />

                    {/* Discount badge */}
                    {discount > 0 && (
                      <div style={{ position: "absolute", top: "10px", left: "10px", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "99px" }}>
                        {discount}% OFF
                      </div>
                    )}

                    {/* NFT badge */}
                    <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.88)", backdropFilter: "blur(8px)", padding: "3px 8px", borderRadius: "99px" }}>
                      <span style={{ fontSize: "9px" }}>⛓️</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff" }}>NFT</span>
                    </div>

                    {/* Event name overlay */}
                    <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px" }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", lineHeight: 1.2, marginBottom: "2px" }}>{ev?.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "10px" }}>📍 {ev?.venue} · {ev?.date}</div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "12px 14px" }}>
                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--brand)", letterSpacing: "-0.5px" }}>
                        GHS {listing.resale_price}
                      </div>
                      {listing.original_price !== listing.resale_price && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                          GHS {listing.original_price}
                        </div>
                      )}
                    </div>

                    {/* Seller + qty */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Sold by <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{listing.seller}</span>
                        {isOwn && <span style={{ color: "#f5a623", marginLeft: "4px" }}>(you)</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>×{listing.quantity}</div>
                    </div>

                    {/* Buy button */}
                    {isOwn ? (
                      <div style={{ width: "100%", padding: "11px", background: "var(--bg-subtle)", borderRadius: "11px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        Your listing
                      </div>
                    ) : alreadyOwns ? (
                      <div style={{ width: "100%", padding: "11px", background: "var(--bg-subtle)", borderRadius: "11px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                        You own this event's ticket
                      </div>
                    ) : (
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleBuy(listing)}
                        disabled={!!buying}
                        style={{ width: "100%", padding: "11px", background: isBuying ? "var(--bg-subtle)" : "var(--brand)", color: isBuying ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: buying ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
                        {isBuying ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                              style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--text-muted)", flexShrink: 0 }} />
                            Processing...
                          </>
                        ) : `Buy for GHS ${listing.resale_price} →`}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {!loading && listings.length > 0 && (
        <div style={{ margin: desktop ? "32px 40px 0" : "24px 16px 0", padding: "14px 16px", borderRadius: "14px", background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⛓️</div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>NFT OWNERSHIP TRANSFER</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>When you buy a resale ticket, NFT ownership moves to your wallet on Polygon automatically.</div>
          </div>
        </div>
      )}
    </div>
  );
}