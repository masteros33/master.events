import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const CATEGORIES = [
  { key: "all",      label: "All",      icon: "🎯" },
  { key: "music",    label: "Music",    icon: "🎵" },
  { key: "tech",     label: "Tech",     icon: "💻" },
  { key: "food",     label: "Food",     icon: "🍔" },
  { key: "arts",     label: "Arts",     icon: "🎨" },
  { key: "sports",   label: "Sports",   icon: "⚽" },
  { key: "business", label: "Business", icon: "💼" },
  { key: "other",    label: "Other",    icon: "✨" },
];

let cachedEvents = [];
let lastFetch = 0;
const isDesktop = () => window.innerWidth > 768;

export default function AttendeeHome() {
  const setScreen        = useStore(s => s.setScreen);
  const setActiveTab     = useStore(s => s.setActiveTab);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty     = useStore(s => s.setTicketQty);
  const setOverlayEvent  = useStore(s => s.setOverlayEvent);
  const overlayEvent     = useStore(s => s.overlayEvent);
  const searchQ          = useStore(s => s.searchQ);
  const setSearchQ       = useStore(s => s.setSearchQ);
  const handleLogout     = useStore(s => s.handleLogout);
  const currentUser      = useStore(s => s.currentUser);

  const [events, setEvents]                 = useState(cachedEvents);
  const [loading, setLoading]               = useState(cachedEvents.length === 0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen, setMenuOpen]             = useState(false);
  const desktop = isDesktop();

  useEffect(() => {
    const now = Date.now();
    if (cachedEvents.length > 0 && now - lastFetch < 120000) {
      setEvents(cachedEvents); setLoading(false); return;
    }
    setLoading(true);
    eventsAPI.list().then(data => {
      if (Array.isArray(data)) {
        const mapped = data.map(e => ({
          id: e.id, name: e.name, description: e.description,
          category: e.category, venue: e.venue, city: e.city,
          date: e.date, time: e.time, price: parseFloat(e.price),
          totalTickets: e.total_tickets, ticketsSold: e.tickets_sold,
          salesOpen: e.sales_open,
          image: e.image || categoryImages[e.category] || categoryImages.other,
        }));
        cachedEvents = mapped; lastFetch = Date.now(); setEvents(mapped);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const q = searchQ.toLowerCase();
    const matchSearch = e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchCat = activeCategory === "all" || e.category === activeCategory;
    return matchSearch && matchCat;
  });

  const goToCheckout = useCallback((ev) => {
    setCheckoutEvent(ev); setTicketQty(1); setOverlayEvent(null); setScreen("checkout");
  }, [setCheckoutEvent, setTicketQty, setOverlayEvent, setScreen]);

  // ── Event Detail Overlay ──────────────────────────────────
  if (overlayEvent) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
        <div style={{ height: desktop ? "380px" : "300px", position: "relative", flexShrink: 0 }}>
          <img src={overlayEvent.image} alt={overlayEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.8))" }} />
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setOverlayEvent(null)}
            style={{ position: "absolute", top: "16px", left: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", zIndex: 10 }}>
            ←
          </motion.button>
          <div style={{ position: "absolute", top: "16px", right: "16px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px" }}>{overlayEvent.category}</div>
          <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: desktop ? "28px" : "22px", marginBottom: "6px", lineHeight: 1.2 }}>{overlayEvent.name}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>📍 {overlayEvent.venue} · {overlayEvent.city}</div>
          </div>
        </div>
        <div style={{ padding: desktop ? "32px 40px" : "20px", maxWidth: desktop ? "800px" : "100%" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            {[["📅", overlayEvent.date], ["🕐", overlayEvent.time ? overlayEvent.time.substring(0, 5) : "TBA"], ["🎟️", (overlayEvent.totalTickets - overlayEvent.ticketsSold) + " left"]].map(([icon, val]) => (
              <div key={icon} style={{ flex: 1, background: "var(--bg-card)", borderRadius: "14px", padding: "16px 8px", textAlign: "center", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>About This Event</div>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "28px" }}>{overlayEvent.description || "No description available."}</div>
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-md)", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 500 }}>Ticket Price</div>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "#f5a623", letterSpacing: "-1px" }}>
                {overlayEvent.price === 0 ? "FREE" : "Ghc " + overlayEvent.price}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>{overlayEvent.totalTickets - overlayEvent.ticketsSold}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>tickets left</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 16px 40px rgba(245,166,35,0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => goToCheckout(overlayEvent)}
            style={{ width: desktop ? "360px" : "100%", padding: "18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "16px", fontSize: "17px", fontWeight: 800, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
            {overlayEvent.price === 0 ? "🎟️ Get Free Ticket" : "🎟️ Buy Ticket — Ghc " + overlayEvent.price}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* Mobile slide menu */}
      <AnimatePresence>
        {!desktop && menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: "fixed", top: 0, left: 0, width: "75%", maxWidth: "280px", height: "100%", background: "var(--bg-card)", zIndex: 101, padding: "60px 24px 100px", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)", borderRight: "1px solid var(--border)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "12px" }}>👤</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2px" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "32px" }}>{currentUser?.email}</div>
              {[["🏠","Home",() => { setMenuOpen(false); setActiveTab("home"); setScreen("app"); }], ["🎟️","My Tickets",() => { setMenuOpen(false); setActiveTab("tickets"); setScreen("app"); }], ["🔔","Alerts",() => { setMenuOpen(false); setActiveTab("alerts"); setScreen("app"); }]].map(([icon, label, action]) => (
                <motion.div key={label} whileHover={{ x: 4 }} onClick={action}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{icon}</div>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                </motion.div>
              ))}
              <div style={{ flex: 1 }} />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
                style={{ width: "100%", padding: "14px", background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--error)", borderRadius: "14px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                Log Out
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ padding: desktop ? "32px 40px 0" : "20px 20px 0" }}>
        {desktop ? (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>DISCOVER</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px" }}>Events near you</div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Ghana & Africa · {filtered.length} events available</div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Discover Events</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>Ghana · {filtered.length} events</div>
            </div>
            <motion.div whileTap={{ scale: 0.92 }} onClick={() => setMenuOpen(true)}
              style={{ width: "42px", height: "42px", borderRadius: "14px", background: "var(--bg-card)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
              {[16, 16, 12].map((w, i) => (
                <div key={i} style={{ width: w + "px", height: "2px", background: "var(--text-primary)", borderRadius: "2px" }} />
              ))}
            </motion.div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px", maxWidth: desktop ? "560px" : "100%" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "16px", pointerEvents: "none" }}>🔍</div>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search events, venues, categories..."
            style={{ width: "100%", padding: "14px 44px", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "14px", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)", boxSizing: "border-box", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-sans)" }} />
          {searchQ && (
            <div onClick={() => setSearchQ("")}
              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px" }}>✕</div>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <motion.div key={cat.key} whileTap={{ scale: 0.93 }}
              onClick={() => setActiveCategory(cat.key)}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "99px", cursor: "pointer", background: activeCategory === cat.key ? "#f5a623" : "var(--bg-card)", color: activeCategory === cat.key ? "#fff" : "var(--text-secondary)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", boxShadow: activeCategory === cat.key ? "0 4px 12px rgba(245,166,35,0.35)" : "var(--shadow-sm)", border: "1px solid " + (activeCategory === cat.key ? "transparent" : "var(--border)"), transition: "all 0.2s" }}>
              <span>{cat.icon}</span><span>{cat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ padding: desktop ? "8px 40px 0" : "4px 20px 0" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "20px" : "16px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: "180px" }} />
                <div style={{ padding: "14px 16px" }}>
                  <div className="skeleton" style={{ height: "16px", width: "65%", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: "12px", width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>No events found</div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Try a different search or category</div>
          </motion.div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "20px" : "16px" }}>
            {filtered.map(ev => (
              <motion.div key={ev.id} whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
                whileTap={{ scale: 0.98 }}
                style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", cursor: "pointer", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}
                onClick={() => setOverlayEvent(ev)}>
                <div style={{ height: desktop ? "200px" : "180px", position: "relative" }}>
                  <img src={ev.image} alt={ev.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = categoryImages.other; }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72))" }} />
                  <div style={{ position: "absolute", top: "12px", right: "12px", background: "#f5a623", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", letterSpacing: "0.3px" }}>{ev.category}</div>
                  {ev.price === 0 && (
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px" }}>FREE</div>
                  )}
                  <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px", marginBottom: "3px" }}>{ev.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>📍 {ev.venue} · {ev.date}</div>
                  </div>
                </div>
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "18px" }}>
                      {ev.price === 0 ? "FREE" : "Ghc " + ev.price}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "2px" }}>{ev.totalTickets - ev.ticketsSold} tickets left</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={e => { e.stopPropagation(); goToCheckout(ev); }}
                    style={{ padding: "10px 20px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
                    {ev.price === 0 ? "Get Free" : "Buy Now"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}