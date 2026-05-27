import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=800",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
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

const ITEMS_PER_PAGE_DESKTOP = 9;
const ITEMS_PER_PAGE_MOBILE  = 6;

const isDesktop = () => window.innerWidth > 768;

{/* ── Resale Market banner ── */}
<div style={{ padding: desktop ? "12px 40px 0" : "12px 16px 0" }}>
  <motion.div whileTap={{ scale: 0.98 }} onClick={() => setScreen("resaleMarket")}
    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(37,99,235,0.06))", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🏷️</div>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Resale Market</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Fan-to-fan NFT ticket resales · 2% fee</div>
      </div>
    </div>
    <span style={{ color: "#7c3aed", fontSize: "16px", fontWeight: 700 }}>→</span>
  </motion.div>
</div>


// ── Event Card ────────────────────────────────────────────────
function EventCard({ ev, onClick }) {
  const [hovered, setHovered] = useState(false);
  const desktop = isDesktop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "18px",
        overflow: "hidden",
        border: hovered ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.25s, transform 0.25s",
        transform: hovered && desktop ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px var(--brand)"
          : "0 2px 12px rgba(0,0,0,0.07)",
      }}>

      {/* Image */}
      <div style={{ height: desktop ? "240px" : "200px", position: "relative", overflow: "hidden" }}>
        <motion.img
          src={ev.image} alt={ev.name}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = categoryImages.other; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%)" }} />

        {/* Category pill */}
        <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--brand)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", letterSpacing: "0.3px" }}>
          {ev.category}
        </div>

        {/* Free badge */}
        {ev.price === 0 && (
          <div style={{ position: "absolute", top: "12px", left: "12px", background: "#16a34a", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px" }}>
            FREE
          </div>
        )}

        {/* NFT badge */}
        <div style={{ position: "absolute", bottom: "12px", left: "12px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.88)", backdropFilter: "blur(8px)", padding: "4px 9px", borderRadius: "99px" }}>
          <span style={{ fontSize: "9px" }}>⛓️</span>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", letterSpacing: "0.3px" }}>NFT Ticket</span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: desktop ? "15px" : "14px", color: "var(--text-primary)", marginBottom: "5px", lineHeight: 1.35, letterSpacing: "-0.2px" }}>
          {ev.name}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span>📍</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ev.venue} · {ev.date}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--brand)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" }}>
            {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
          </div>
          <motion.div
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: hovered ? 1 : 0.7,
              transition: "opacity 0.2s",
            }}>
            View details <span style={{ fontSize: "13px" }}>→</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", padding: "32px 0 8px" }}>
      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-card)", color: current === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: current === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600, opacity: current === 1 ? 0.4 : 1, fontFamily: "var(--font-sans)" }}>
        ← Prev
      </motion.button>

      {pages.map(p => (
        <motion.button key={p} whileTap={{ scale: 0.88 }}
          onClick={() => onChange(p)}
          style={{ width: "36px", height: "36px", borderRadius: "10px", border: p === current ? "none" : "1.5px solid var(--border)", background: p === current ? "var(--brand)" : "var(--bg-card)", color: p === current ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: p === current ? 700 : 500, boxShadow: p === current ? "var(--shadow-brand)" : "none", fontFamily: "var(--font-sans)" }}>
          {p}
        </motion.button>
      ))}

      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-card)", color: current === total ? "var(--text-muted)" : "var(--text-primary)", cursor: current === total ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600, opacity: current === total ? 0.4 : 1, fontFamily: "var(--font-sans)" }}>
        Next →
      </motion.button>
    </div>
  );
}

// ── Event Detail Overlay ──────────────────────────────────────
function EventDetailOverlay({ ev, onBack, onCheckout }) {
  const desktop   = isDesktop();
  const remaining = ev.totalTickets - ev.ticketsSold;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>

        {/* Hero — 70vh */}
        <div style={{ height: "70vh", minHeight: "380px", maxHeight: "600px", position: "relative", flexShrink: 0 }}>
          <img src={ev.image} alt={ev.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.src = categoryImages.other; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 100%)" }} />

          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            style={{ position: "absolute", top: "18px", left: "18px", width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "#fff", zIndex: 10 }}>
            ←
          </motion.button>

          <div style={{ position: "absolute", top: "18px", right: "18px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(124,58,237,0.88)", backdropFilter: "blur(8px)", padding: "5px 11px", borderRadius: "99px", border: "1px solid rgba(124,58,237,0.4)" }}>
            <span style={{ fontSize: "11px" }}>⛓️</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>NFT Ticket · Polygon</span>
          </div>

          <div style={{ position: "absolute", bottom: "24px", left: "20px", right: "20px" }}>
            <div style={{ display: "inline-block", background: "var(--brand)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", marginBottom: "10px", letterSpacing: "0.3px" }}>
              {ev.category}
            </div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: desktop ? "32px" : "22px", marginBottom: "6px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
              {ev.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              📍 {ev.venue}{ev.city ? " · " + ev.city : ""}
            </div>
          </div>
        </div>

        {/* Lower content — 2-col on desktop */}
        <div style={{
          maxWidth: desktop ? "1000px" : "100%",
          margin: "0 auto",
          padding: desktop ? "32px 40px 60px" : "20px 16px 80px",
          display: desktop ? "grid" : "block",
          gridTemplateColumns: desktop ? "1fr 340px" : undefined,
          gap: desktop ? "40px" : undefined,
          alignItems: "start",
        }}>

          {/* LEFT */}
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
              {[
                ["📅", "Date",  ev.date || "TBA"],
                ["🕐", "Time",  ev.time ? ev.time.substring(0, 5) : "TBA"],
                ["🎟️", "Left", remaining + " tickets"],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ flex: "1 1 80px", background: "var(--bg-subtle)", borderRadius: "12px", padding: "12px 10px", textAlign: "center", border: "1px solid var(--border)", minWidth: "80px" }}>
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>About This Event</div>
              <div style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.85, fontWeight: 400 }}>
                {ev.description && ev.description.trim()
                  ? ev.description
                  : "No description provided for this event."}
              </div>
            </div>

            <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "22px" }}>⛓️</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed" }}>Secured by Polygon Blockchain</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Your ticket is minted as an NFT · Screenshot-proof · Cannot be duplicated
                </div>
              </div>
            </div>

            {!desktop && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={onCheckout}
                style={{ width: "100%", padding: "17px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)", marginTop: "24px" }}>
                {ev.price === 0 ? "Get Free Ticket" : `Buy Ticket — GHS ${ev.price}`}
              </motion.button>
            )}
          </div>

          {/* RIGHT — sticky meta box */}
          {desktop && (
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "20px", padding: "24px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
                <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Ticket Price</div>
                  <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--brand)", letterSpacing: "-1px", lineHeight: 1 }}>
                    {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
                  </div>
                </div>

                {[
                  ["📅", "Date",          ev.date || "TBA"],
                  ["🕐", "Time",          ev.time ? ev.time.substring(0, 5) : "TBA"],
                  ["🎟️", "Tickets Left", remaining.toString()],
                  ["📍", "Venue",         ev.venue || "TBA"],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px" }}>{icon}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{val}</span>
                  </div>
                ))}

                <div style={{ margin: "18px 0 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>Availability</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: remaining < 20 ? "#dc2626" : "#16a34a" }}>
                      {remaining < 20 ? "Almost sold out!" : "Available"}
                    </span>
                  </div>
                  <div style={{ height: "5px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "99px",
                      background: remaining < 20 ? "#dc2626" : "var(--brand)",
                      width: Math.max(5, Math.min(100, (remaining / (ev.totalTickets || 1)) * 100)) + "%",
                    }} />
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={onCheckout}
                  style={{ width: "100%", padding: "16px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)", marginBottom: "10px" }}>
                  {ev.price === 0 ? "Get Free Ticket" : `Buy Ticket — GHS ${ev.price}`}
                </motion.button>

                <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px" }}>⛓️</span>
                  <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 500 }}>NFT minted on Polygon · Screenshot-proof</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main AttendeeHome ─────────────────────────────────────────
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

  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [page,           setPage]           = useState(1);
  const desktop = isDesktop();

  // ── TanStack Query — server state for events ──────────────
  const { data: eventsData, isLoading: loading } = useQuery({
    queryKey: ["events"],
    queryFn: () =>
      eventsAPI.list().then(data =>
        Array.isArray(data)
          ? data.map(e => ({
              id:           e.id,
              name:         e.name,
              description:  e.description || "",
              category:     e.category,
              venue:        e.venue,
              city:         e.city,
              date:         e.date,
              time:         e.time,
              price:        parseFloat(e.price) || 0,
              totalTickets: e.total_tickets || 0,
              ticketsSold:  e.tickets_sold  || 0,
              salesOpen:    e.sales_open,
              image:        e.image || categoryImages[e.category] || categoryImages.other,
            }))
          : []
      ),
    staleTime: 2 * 60 * 1000,
  });

  const events = eventsData || [];

  // Reset page when filters change
  const [prevSearch, setPrevSearch] = useState(searchQ);
  const [prevCat,    setPrevCat]    = useState(activeCategory);
  if (searchQ !== prevSearch || activeCategory !== prevCat) {
    setPage(1);
    setPrevSearch(searchQ);
    setPrevCat(activeCategory);
  }

  const filtered = events.filter(e => {
    const q = searchQ.toLowerCase();
    const matchSearch =
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
    const matchCat = activeCategory === "all" || e.category === activeCategory;
    return matchSearch && matchCat;
  });

  const perPage    = desktop ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const goToCheckout = useCallback((ev) => {
    setCheckoutEvent(ev);
    setTicketQty(1);
    setOverlayEvent(null);
    setScreen("checkout");
  }, [setCheckoutEvent, setTicketQty, setOverlayEvent, setScreen]);

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (overlayEvent) return (
    <EventDetailOverlay
      ev={overlayEvent}
      onBack={() => setOverlayEvent(null)}
      onCheckout={() => goToCheckout(overlayEvent)}
    />
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* ── Mobile slide-over drawer ── */}
      <AnimatePresence>
        {!desktop && menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(4px)" }} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{ position: "fixed", top: 0, left: 0, width: "78%", maxWidth: "300px", height: "100%", background: "var(--bg-card)", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "4px 0 32px rgba(0,0,0,0.25)", borderRight: "1px solid var(--border)" }}>

              <div style={{ padding: "56px 24px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "16px" }}>🎟️</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Master Events</span>
                </div>
              </div>

              <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
                {[
                  ["🏠", "Discover Events", "home"],
                  ["🎟️", "My Tickets",      "tickets"],
                  ["🔔", "Alerts",          "alerts"],
                ].map(([icon, label, tabId]) => {
                  const isActive = useStore.getState().activeTab === tabId;
                  return (
                    <motion.div key={label} whileTap={{ scale: 0.97 }}
                      onClick={() => { setMenuOpen(false); setActiveTab(tabId); setScreen("app"); }}
                      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "15px 12px", cursor: "pointer", borderRadius: "12px" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontSize: "18px" }}>{icon}</span>
                      <span style={{ fontSize: "16px", fontWeight: 600, color: isActive ? "#f5a623" : "var(--text-primary)" }}>{label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ padding: "14px 16px 28px", borderTop: "1px solid var(--border)" }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                  style={{ width: "100%", padding: "14px", background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.15)", color: "var(--error)", borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-sans)" }}>
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div style={{ padding: desktop ? "32px 40px 0" : "16px 16px 0" }}>
        {desktop ? (
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.6px", marginBottom: "4px" }}>
              Discover Events
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Ghana & Africa · {filtered.length} events · NFT-secured tickets on Polygon
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "17px" }}>🎟️</span>
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
                  Hi, {currentUser?.first_name || "there"} 👋
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                  {filtered.length} events · NFT tickets
                </div>
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.88 }} onClick={() => setMenuOpen(true)}
              style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer", flexShrink: 0 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: "16px", height: "2px", background: "var(--text-primary)", borderRadius: "2px" }} />
              ))}
            </motion.div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "0", maxWidth: desktop ? "560px" : "100%" }}>
          <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "15px", pointerEvents: "none" }}>🔍</div>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search events, venues, categories..."
            style={{ width: "100%", padding: "13px 40px 13px 44px", border: "1.5px solid var(--border)", borderRadius: "14px", fontSize: "14px", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
          />
          {searchQ && (
            <div onClick={() => setSearchQ("")}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px" }}>✕</div>
          )}
        </div>
      </div>

      {/* ── Category chips — sticky ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        padding: desktop ? "12px 40px" : "10px 16px",
        marginTop: "14px",
      }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.key;
            return (
              <motion.div key={cat.key} whileTap={{ scale: 0.91 }}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  flexShrink: 0, padding: "7px 16px", borderRadius: "99px",
                  cursor: "pointer", fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  display: "flex", alignItems: "center", gap: "5px",
                  transition: "all 0.15s",
                  background: active ? "var(--brand)" : "var(--bg-card)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: active ? "1.5px solid var(--brand)" : "1.5px solid var(--border)",
                  boxShadow: active ? "0 2px 12px rgba(245,166,35,0.35)" : "none",
                }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Events Grid ── */}
      <div style={{ padding: desktop ? "20px 40px 0" : "16px 16px 0" }}>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "24px" : "14px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: desktop ? "240px" : "200px" }} />
                <div style={{ padding: "14px 16px" }}>
                  <div className="skeleton" style={{ height: "15px", width: "70%", marginBottom: "10px", borderRadius: "6px" }} />
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
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>No events found</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Try a different search or category</div>
          </motion.div>
        )}

        {/* Cards */}
        {!loading && paginated.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "24px" : "14px" }}>
            {paginated.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}>
                <EventCard ev={ev} onClick={() => setOverlayEvent(ev)} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}