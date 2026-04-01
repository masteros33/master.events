import React, { useEffect, useState, useCallback } from "react";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const categoryImages = {
  music: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600","https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600","https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600"],
  tech: ["https://images.unsplash.com/photo-1488229297570-58520851e868?w=600","https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"],
  food: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"],
  arts: ["https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600","https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600"],
  sports: ["https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600","https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600"],
  business: ["https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600","https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600"],
  other: ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600","https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600"],
};
const getImage = (cat, id) => { const imgs = categoryImages[cat] || categoryImages.other; return imgs[id % imgs.length]; };

const CATEGORIES = [
  { key: "all", label: "All", icon: "🎯" },
  { key: "music", label: "Music", icon: "🎵" },
  { key: "tech", label: "Tech", icon: "💻" },
  { key: "food", label: "Food", icon: "🍔" },
  { key: "arts", label: "Arts", icon: "🎨" },
  { key: "sports", label: "Sports", icon: "⚽" },
  { key: "business", label: "Business", icon: "💼" },
  { key: "other", label: "Other", icon: "✨" },
];

// Cache events in memory so they don't reload every time
let cachedEvents = [];
let lastFetch = 0;

export default function AttendeeHome() {
  const setScreen = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty = useStore(s => s.setTicketQty);
  const setOverlayEvent = useStore(s => s.setOverlayEvent);
  const overlayEvent = useStore(s => s.overlayEvent);
  const searchQ = useStore(s => s.searchQ);
  const setSearchQ = useStore(s => s.setSearchQ);
  const handleLogout = useStore(s => s.handleLogout);
  const currentUser = useStore(s => s.currentUser);

  const [events, setEvents] = useState(cachedEvents);
  const [loading, setLoading] = useState(cachedEvents.length === 0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const now = Date.now();
    // Only refetch if cache is older than 2 minutes
    if (cachedEvents.length > 0 && now - lastFetch < 120000) {
      setEvents(cachedEvents);
      setLoading(false);
      return;
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
          image: e.image || getImage(e.category, e.id),
        }));
        cachedEvents = mapped;
        lastFetch = Date.now();
        setEvents(mapped);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const q = searchQ.toLowerCase();
    const matchesSearch = e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
    const matchesCategory = activeCategory === "all" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const goToCheckout = useCallback((ev) => {
    setCheckoutEvent(ev);
    setTicketQty(1);
    setOverlayEvent(null);
    setScreen("checkout");
  }, [setCheckoutEvent, setTicketQty, setOverlayEvent, setScreen]);

  // ── Event Detail Overlay ────────────────────────────────────
  if (overlayEvent) {
    return (
      <div style={{ background: "#f8f8f6", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: "100px" }}>
          {/* Hero image */}
          <div style={{ height: "300px", position: "relative", flexShrink: 0 }}>
            <img src={overlayEvent.image} alt={overlayEvent.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)" }} />
            <button onClick={() => setOverlayEvent(null)}
              style={{ position: "absolute", top: "16px", left: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", zIndex: 10 }}>
              ←
            </button>
            <div style={{ position: "absolute", top: "16px", right: "16px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "20px" }}>
              {overlayEvent.category}
            </div>
            <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "22px", marginBottom: "6px", lineHeight: 1.2 }}>{overlayEvent.name}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>📍 {overlayEvent.venue} · {overlayEvent.city}</div>
            </div>
          </div>

          {/* Info cards */}
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {[
                ["📅", overlayEvent.date],
                ["🕐", overlayEvent.time ? overlayEvent.time.substring(0, 5) : "TBA"],
                ["🎟️", (overlayEvent.totalTickets - overlayEvent.ticketsSold) + " left"]
              ].map(([icon, val]) => (
                <div key={icon} style={{ flex: 1, background: "#fff", borderRadius: "14px", padding: "14px 8px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#1a1a1a" }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "10px" }}>About This Event</div>
            <div style={{ fontSize: "14px", color: "#6b6b6b", lineHeight: 1.8, marginBottom: "24px" }}>{overlayEvent.description}</div>

            {/* Price card */}
            <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "6px", fontWeight: 500 }}>Ticket Price</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#f5a623", letterSpacing: "-1px" }}>
                  {overlayEvent.price === 0 ? "FREE" : `Ghc ${overlayEvent.price}`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a1a" }}>{overlayEvent.totalTickets - overlayEvent.ticketsSold}</div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>tickets left</div>
              </div>
            </div>

            {/* Inline BUY button - always visible in scroll */}
            <button
              onClick={() => goToCheckout(overlayEvent)}
              style={{
                width: "100%", padding: "18px",
                background: "linear-gradient(135deg, #f5a623, #e8920f)",
                color: "#fff", border: "none", borderRadius: "16px",
                fontSize: "17px", fontWeight: 800, cursor: "pointer",
                boxShadow: "0 8px 28px rgba(245,166,35,0.4)",
                letterSpacing: "0.3px",
              }}>
              {overlayEvent.price === 0 ? "🎟️ Get Free Ticket" : `🎟️ Buy Ticket — Ghc ${overlayEvent.price}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Home ───────────────────────────────────────────────
  return (
    <div style={{ background: "#f8f8f6", minHeight: "100%", paddingBottom: "100px" }}>

      {/* Slide menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100 }} />
          <div style={{ position: "fixed", top: 0, left: 0, width: "75%", maxWidth: "280px", height: "100%", background: "#fff", zIndex: 101, padding: "60px 24px 100px", display: "flex", flexDirection: "column", boxShadow: "8px 0 40px rgba(0,0,0,0.12)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "12px" }}>👤</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", marginBottom: "2px" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
            <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "32px" }}>{currentUser?.email}</div>
            {[
              ["🏠", "Home", () => { setMenuOpen(false); setActiveTab("home"); setScreen("app"); }],
              ["🎟️", "My Tickets", () => { setMenuOpen(false); setActiveTab("tickets"); setScreen("app"); }],
              ["🔔", "Alerts", () => { setMenuOpen(false); setActiveTab("alerts"); setScreen("app"); }],
            ].map(([icon, label, action]) => (
              <div key={label} onClick={action} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{icon}</div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", background: "#fff5f5", border: "1px solid #ffd6d6", color: "#e74c3c", borderRadius: "14px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
              Log Out
            </button>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ padding: "20px 20px 0", background: "#f8f8f6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.3px" }}>Discover Events</div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "2px" }}>Ghana · {filtered.length} events</div>
          </div>
          <div onClick={() => setMenuOpen(true)} style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ width: "16px", height: "2px", background: "#1a1a1a", borderRadius: "2px" }} />
            <div style={{ width: "16px", height: "2px", background: "#1a1a1a", borderRadius: "2px" }} />
            <div style={{ width: "12px", height: "2px", background: "#1a1a1a", borderRadius: "2px" }} />
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#bbb", fontSize: "16px" }}>🔍</div>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search events, venues..."
            style={{ width: "100%", padding: "14px 44px", border: "none", borderRadius: "14px", fontSize: "14px", outline: "none", background: "#fff", color: "#1a1a1a", boxSizing: "border-box", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }} />
          {searchQ && <div onClick={() => setSearchQ("")} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#bbb", fontSize: "18px" }}>✕</div>}
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <div key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              flexShrink: 0, padding: "8px 16px", borderRadius: "20px", cursor: "pointer",
              background: activeCategory === cat.key ? "#f5a623" : "#fff",
              color: activeCategory === cat.key ? "#fff" : "#6b6b6b",
              fontSize: "12px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "5px",
              boxShadow: activeCategory === cat.key ? "0 4px 12px rgba(245,166,35,0.35)" : "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
            }}>
              <span>{cat.icon}</span><span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div style={{ padding: "4px 20px 0" }}>
        {loading && (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#fff", borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
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
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a" }}>No events found</div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "6px" }}>Try a different search or category</div>
          </div>
        )}

        {filtered.map(ev => (
          <div key={ev.id}
            className="event-card"
            style={{ background: "#fff", borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", cursor: "pointer" }}
            onClick={() => setOverlayEvent(ev)}>

            {/* Event image */}
            <div style={{ height: "180px", position: "relative" }}>
              <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.7))" }} />
              <div style={{ position: "absolute", top: "12px", right: "12px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>{ev.category}</div>
              {ev.price === 0 && <div style={{ position: "absolute", top: "12px", left: "12px", background: "#27ae60", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>FREE</div>}
              <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "17px", marginBottom: "3px" }}>{ev.name}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>📍 {ev.venue} · {ev.date}</div>
              </div>
            </div>

            {/* Price + CTA */}
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#f5a623", fontWeight: 800, fontSize: "18px" }}>
                  {ev.price === 0 ? "FREE" : `Ghc ${ev.price}`}
                </div>
                <div style={{ color: "#aaa", fontSize: "11px", marginTop: "2px" }}>{ev.totalTickets - ev.ticketsSold} tickets left</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); goToCheckout(ev); }}
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #f5a623, #e8920f)",
                  color: "#fff", border: "none", borderRadius: "12px",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(245,166,35,0.35)",
                }}>
                {ev.price === 0 ? "Get Free" : "Buy Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}