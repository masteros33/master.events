import React, { useEffect, useState } from "react";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const categoryImages = {
  music: [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600",
  ],
  tech: [
    "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600",
  ],
  food: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
  ],
  arts: [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
  ],
  sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600",
  ],
  business: [
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600",
  ],
  other: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
  ],
};

const getImage = (category, id) => {
  const imgs = categoryImages[category] || categoryImages.other;
  return imgs[id % imgs.length];
};

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

const BG = "linear-gradient(160deg, #1a0e00 0%, #110900 60%, #1a0e00 100%)";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(245,166,35,0.15)";

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

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    eventsAPI.list().then(data => {
      if (Array.isArray(data)) {
        setEvents(data.map(e => ({
          id: e.id, name: e.name, description: e.description,
          category: e.category, venue: e.venue, city: e.city,
          date: e.date, time: e.time, price: parseFloat(e.price),
          totalTickets: e.total_tickets, ticketsSold: e.tickets_sold,
          salesOpen: e.sales_open,
          image: e.image || getImage(e.category, e.id),
        })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQ.toLowerCase());
    const matchesCategory = activeCategory === "all" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (overlayEvent) {
    return (
      <div style={{ background: BG, height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ height: "260px", position: "relative", flexShrink: 0 }}>
          <img src={overlayEvent.image} alt={overlayEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(17,9,0,0.92) 100%)" }} />
          <button onClick={() => setOverlayEvent(null)} style={{ position: "absolute", top: "16px", left: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(245,166,35,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#f5a623", fontSize: "20px", fontWeight: 700 }}>
            &#8592;
          </button>
          <div style={{ position: "absolute", top: "12px", right: "12px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px" }}>{overlayEvent.category}</div>
          <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px" }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: "20px", marginBottom: "4px", lineHeight: 1.2 }}>{overlayEvent.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>📍 {overlayEvent.venue} · {overlayEvent.city}</div>
          </div>
        </div>

        <div style={{ padding: "20px", flex: 1, background: BG }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {[
              ["📅", overlayEvent.date],
              ["🕐", overlayEvent.time ? overlayEvent.time.substring(0, 5) : "TBA"],
              ["🎟️", (overlayEvent.totalTickets - overlayEvent.ticketsSold) + " left"]
            ].map(([icon, val]) => (
              <div key={icon} style={{ flex: 1, background: CARD, border: "1px solid " + BORDER, borderRadius: "14px", padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>{icon}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>About This Event</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: "20px" }}>{overlayEvent.description}</div>
          <div style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "16px", padding: "14px 16px", marginBottom: "80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Ticket Price</div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#f5a623" }}>{overlayEvent.price === 0 ? "FREE" : "Ghc " + overlayEvent.price}</div>
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>
              <div style={{ color: "#fff", fontWeight: 700 }}>{overlayEvent.totalTickets - overlayEvent.ticketsSold}</div>
              <div>remaining</div>
            </div>
          </div>
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "rgba(17,9,0,0.97)", borderTop: "1px solid rgba(245,166,35,0.15)" }}>
            <button onClick={() => { setCheckoutEvent(overlayEvent); setTicketQty(1); setOverlayEvent(null); setScreen("checkout"); }}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "50px", fontSize: "15px", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(245,166,35,0.35)" }}>
              {overlayEvent.price === 0 ? "🎟️ GET FREE TICKET" : "🎟️ BUY TICKET — Ghc " + overlayEvent.price}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "100px" }}>

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100 }} />
          <div style={{ position: "fixed", top: 0, left: 0, width: "75%", maxWidth: "280px", height: "100%", background: "linear-gradient(160deg, #1e1100 0%, #150c00 100%)", zIndex: 101, padding: "60px 24px 40px", display: "flex", flexDirection: "column", boxShadow: "4px 0 32px rgba(0,0,0,0.5)", borderRight: "1px solid rgba(245,166,35,0.15)" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "12px" }}>👤</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>{currentUser?.email}</div>
            {[
              ["🏠", "Home", () => { setMenuOpen(false); setActiveTab("home"); setScreen("app"); }],
              ["🎟️", "My Tickets", () => { setMenuOpen(false); setActiveTab("tickets"); setScreen("app"); }],
              ["🔔", "Alerts", () => { setMenuOpen(false); setActiveTab("alerts"); setScreen("app"); }],
            ].map(([icon, label, action]) => (
              <div key={label} onClick={action} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", background: "rgba(231,76,60,0.2)", border: "1px solid rgba(231,76,60,0.4)", color: "#ff6b6b", borderRadius: "50px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
              LOG OUT
            </button>
          </div>
        </>
      )}

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>Discover Events</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Ghana · {filtered.length} events</div>
          </div>
          <div onClick={() => setMenuOpen(true)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer" }}>
            <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
            <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
            <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search events, venues, categories..."
            style={{ width: "100%", padding: "14px 44px 14px 18px", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "50px", fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.06)", color: "#fff", boxSizing: "border-box", fontFamily: "sans-serif", caretColor: "#f5a623" }} />
          {searchQ
            ? <div onClick={() => setSearchQ("")} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "20px" }}>✕</div>
            : <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: "16px" }}>🔍</div>
          }
        </div>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "4px", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <div key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: "20px", cursor: "pointer",
              background: activeCategory === cat.key ? "#f5a623" : "rgba(255,255,255,0.06)",
              color: activeCategory === cat.key ? "#fff" : "rgba(255,255,255,0.5)",
              border: "1px solid " + (activeCategory === cat.key ? "#f5a623" : "rgba(255,255,255,0.1)"),
              fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px",
              boxShadow: activeCategory === cat.key ? "0 4px 12px rgba(245,166,35,0.4)" : "none",
            }}>
              <span>{cat.icon}</span><span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎪</div>
            <div>Loading events...</div>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#fff" }}>No events found</div>
            <div style={{ fontSize: "13px", marginTop: "6px" }}>Try a different search or category</div>
          </div>
        )}
        {filtered.map(ev => (
          <div key={ev.id} onClick={() => setOverlayEvent(ev)} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", cursor: "pointer" }}>
            <div style={{ height: "160px", position: "relative" }}>
              <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8))" }} />
              <div style={{ position: "absolute", top: "12px", right: "12px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>{ev.category}</div>
              {ev.price === 0 && <div style={{ position: "absolute", top: "12px", left: "12px", background: "#27ae60", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>FREE</div>}
              <div style={{ position: "absolute", bottom: "14px", left: "14px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px", marginBottom: "2px" }}>{ev.name}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>📍 {ev.venue} · {ev.date}</div>
              </div>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>{ev.price === 0 ? "FREE" : "Ghc " + ev.price}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{ev.totalTickets - ev.ticketsSold} tickets left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}