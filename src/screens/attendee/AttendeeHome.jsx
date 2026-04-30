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
    const matchSearch = e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
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
          <img src={overlayEvent.image} alt={overlayEvent.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.8))" }} />
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setOverlayEvent(null)}
            style={{ position: "absolute", top: "16px", left: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", zIndex: 10 }}>
            ←
          </motion.button>
          <div style={{ position: "absolute", top: "16px", right: "16px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px" }}>
            {overlayEvent.category}
          </div>
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

      {/* ── Mobile slide menu ── */}
      <AnimatePresence>
        {!desktop && menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: "fixed", top: 0, left: 0, width: "75%", maxWidth: "280px", height: "100%", background: "var(--bg-card)", zIndex: 101, padding: "0 0 40px", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)", borderRight: "1px solid var(--border)" }}>

              {/* Profile section */}
              <div style={{ padding: "56px 24px 24px", background: "linear-gradient(160deg, #1a1a1a 0%, #0e0e0e 100%)", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "12px", boxShadow: "0 4px 16px rgba(245,166,35,0.3)" }}>
                  {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>{currentUser?.email}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "99px", background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.25)" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#f5a623", letterSpacing: "0.5px" }}>🎟️ ATTENDEE</span>
                </div>
              </div>

              {/* Nav items */}
              <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "0 12px", marginBottom: "8px" }}>NAVIGATION</div>
                {[
                  ["🏠", "Discover Events", () => { setMenuOpen(false); setActiveTab("home"); setScreen("app"); }],
                  ["🎟️", "My Tickets",      () => { setMenuOpen(false); setActiveTab("tickets"); setScreen("app"); }],
                  ["🔔", "Alerts",          () => { setMenuOpen(false); setActiveTab("alerts"); setScreen("app"); }],
                ].map(([icon, label, action]) => (
                  <motion.div key={label} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }} onClick={action}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", cursor: "pointer", marginBottom: "2px", transition: "background 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", border: "1px solid var(--border)" }}>{icon}</div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Logout at bottom — always visible */}
              <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
                  style={{ width: "100%", padding: "14px", background: "var(--error-bg)", border: "1.5px solid rgba(220,38,38,0.2)", color: "var(--error)", borderRadius: "14px", fontWeight: 700, cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span>🚪</span> Log Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ padding: desktop ? "32px 40px 0" : "16px 16px 0" }}>
        {desktop ? (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px" }}>DISCOVER</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px" }}>Events near you</div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Ghana & Africa · {filtered.length} events available</div>
          </div>
        ) : (
          /* ── Mobile header — sleek branding + avatar ── */
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(245,166,35,0.3)", flexShrink: 0 }}>
                <span style={{ fontSize: "18px" }}>🎟️</span>
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.1 }}>
                  Hi, {currentUser?.first_name || "there"} 👋
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {filtered.length} events in Ghana
                </div>
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setMenuOpen(true)}
              style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)", fontSize: "15px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
            </motion.div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px", maxWidth: desktop ? "560px" : "100%" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "16px", pointerEvents: "none" }}>🔍</div>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search events, venues, categories..."
            style={{ width: "100%", padding: "13px 44px", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "14px", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)", boxSizing: "border-box", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-sans)" }} />
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
              style={{ flexShrink: 0, padding: "7px 14px", borderRadius: "99px", cursor: "pointer", background: activeCategory === cat.key ? "#f5a623" : "var(--bg-card)", color: activeCategory === cat.key ? "#fff" : "var(--text-secondary)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px", boxShadow: activeCategory === cat.key ? "0 4px 12px rgba(245,166,35,0.35)" : "var(--shadow-sm)", border: "1px solid " + (activeCategory === cat.key ? "transparent" : "var(--border)"), transition: "all 0.2s" }}>
              <span>{cat.icon}</span><span>{cat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Events Grid ── */}
      <div style={{ padding: desktop ? "8px 40px 0" : "4px 16px 0" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
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
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "20px" : "14px" }}>
            {filtered.map(ev => (
              <motion.div key={ev.id} whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
                whileTap={{ scale: 0.98 }}
                style={{ background: "var(--bg-card)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)", cursor: "pointer", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}
                onClick={() => setOverlayEvent(ev)}>
                <div style={{ height: desktop ? "200px" : "175px", position: "relative" }}>
                  <img src={ev.image} alt={ev.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = categoryImages.other; }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72))" }} />
                  <div style={{ position: "absolute", top: "10px", right: "10px", background: "#f5a623", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px" }}>{ev.category}</div>
                  {ev.price === 0 && (
                    <div style={{ position: "absolute", top: "10px", left: "10px", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px" }}>FREE</div>
                  )}
                  <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px" }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px", marginBottom: "2px", lineHeight: 1.2 }}>{ev.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.78)", fontSize: "11px" }}>📍 {ev.venue} · {ev.date}</div>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "17px" }}>
                      {ev.price === 0 ? "FREE" : "Ghc " + ev.price}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "2px" }}>{ev.totalTickets - ev.ticketsSold} tickets left</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={e => { e.stopPropagation(); goToCheckout(ev); }}
                    style={{ padding: "9px 18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
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