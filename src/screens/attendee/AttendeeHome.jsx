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
  { key: "all",      label: "All",      icon: "◈" },
  { key: "music",    label: "Music",    icon: "♪" },
  { key: "tech",     label: "Tech",     icon: "⌥" },
  { key: "food",     label: "Food",     icon: "◉" },
  { key: "arts",     label: "Arts",     icon: "◇" },
  { key: "sports",   label: "Sports",   icon: "◎" },
  { key: "business", label: "Business", icon: "▣" },
  { key: "other",    label: "Other",    icon: "◌" },
];

const ITEMS_PER_PAGE_DESKTOP = 9;
const ITEMS_PER_PAGE_MOBILE  = 6;
const isDesktop = () => window.innerWidth > 768;

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
        borderRadius: "16px",
        overflow: "hidden",
        border: hovered ? "1px solid rgba(245,166,35,0.5)" : "1px solid var(--border)",
        cursor: "pointer",
        transition: "all 0.22s var(--ease-smooth)",
        transform: hovered && desktop ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(245,166,35,0.15)"
          : "var(--shadow-sm)",
      }}>

      <div style={{ height: desktop ? "220px" : "190px", position: "relative", overflow: "hidden" }}>
        <motion.img
          src={ev.image} alt={ev.name}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = categoryImages.other; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.62) 100%)" }} />
        <div style={{ position: "absolute", top: "11px", right: "11px", background: "var(--brand)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", letterSpacing: "0.5px", fontFamily: "var(--font-mono)" }}>
          {ev.category.toUpperCase()}
        </div>
        {ev.price === 0 && (
          <div style={{ position: "absolute", top: "11px", left: "11px", background: "#16a34a", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>FREE</div>
        )}
        <div style={{ position: "absolute", bottom: "11px", left: "11px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "3px 8px", borderRadius: "99px" }}>
          <span style={{ fontSize: "8px" }}>⛓️</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>NFT</span>
        </div>
      </div>

      <div style={{ padding: "13px 15px 15px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "5px", lineHeight: 1.35, letterSpacing: "-0.2px" }}>
          {ev.name}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-mono)" }}>
          <span style={{ opacity: 0.6 }}>📍</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ev.venue} · {ev.date}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--brand)", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.5px" }}>
            {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
          </div>
          <motion.div animate={{ x: hovered ? 3 : 0 }} transition={{ duration: 0.18 }}
            style={{ fontSize: "11px", fontWeight: 600, color: hovered ? "var(--brand)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", transition: "color 0.18s" }}>
            View <span>→</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", padding: "32px 0 8px" }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(current - 1)} disabled={current === 1}
        style={{ padding: "7px 14px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg-card)", color: current === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: current === 1 ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, opacity: current === 1 ? 0.4 : 1, fontFamily: "var(--font-mono)" }}>
        ← PREV
      </motion.button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <motion.button key={p} whileTap={{ scale: 0.88 }} onClick={() => onChange(p)}
          style={{ width: "34px", height: "34px", borderRadius: "9px", border: p === current ? "none" : "1px solid var(--border)", background: p === current ? "var(--brand)" : "var(--bg-card)", color: p === current ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: p === current ? 700 : 500, boxShadow: p === current ? "var(--shadow-brand)" : "none", fontFamily: "var(--font-mono)" }}>
          {p}
        </motion.button>
      ))}
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(current + 1)} disabled={current === total}
        style={{ padding: "7px 14px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg-card)", color: current === total ? "var(--text-muted)" : "var(--text-primary)", cursor: current === total ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, opacity: current === total ? 0.4 : 1, fontFamily: "var(--font-mono)" }}>
        NEXT →
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
        <div style={{ height: "65vh", minHeight: "360px", maxHeight: "560px", position: "relative" }}>
          <img src={ev.image} alt={ev.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.src = categoryImages.other; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.82) 100%)" }} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            style={{ position: "absolute", top: "18px", left: "18px", width: "38px", height: "38px", borderRadius: "11px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "#fff", zIndex: 10 }}>
            ←
          </motion.button>
          <div style={{ position: "absolute", top: "18px", right: "18px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "5px 11px", borderRadius: "99px" }}>
            <span style={{ fontSize: "10px" }}>⛓️</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>NFT · POLYGON AMOY</span>
          </div>
          <div style={{ position: "absolute", bottom: "24px", left: "20px", right: "20px" }}>
            <div style={{ display: "inline-block", background: "var(--brand)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", marginBottom: "10px", letterSpacing: "0.5px", fontFamily: "var(--font-mono)" }}>
              {ev.category.toUpperCase()}
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: desktop ? "32px" : "22px", marginBottom: "6px", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              {ev.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
              📍 {ev.venue}{ev.city ? " · " + ev.city : ""}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: desktop ? "1000px" : "100%", margin: "0 auto", padding: desktop ? "32px 40px 60px" : "20px 16px 80px", display: desktop ? "grid" : "block", gridTemplateColumns: desktop ? "1fr 320px" : undefined, gap: desktop ? "40px" : undefined, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
              {[
                ["📅", "DATE",  ev.date || "TBA"],
                ["🕐", "TIME",  ev.time ? ev.time.substring(0, 5) : "TBA"],
                ["🎟", "LEFT",  remaining + " left"],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ flex: "1 1 80px", background: "var(--bg-subtle)", borderRadius: "12px", padding: "12px 10px", textAlign: "center", border: "1px solid var(--border)", minWidth: "80px" }}>
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>{icon}</div>
                  <div style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>{label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>ABOUT_EVENT</div>
              <div style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.85 }}>
                {ev.description?.trim() || "No description provided."}
              </div>
            </div>
            <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>⛓️</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed" }}>Secured by Polygon Blockchain</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>NFT minted · Screenshot-proof · Cannot be duplicated</div>
              </div>
            </div>
            {!desktop && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCheckout}
                style={{ width: "100%", padding: "17px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)", marginTop: "24px" }}>
                {ev.price === 0 ? "Get Free Ticket" : `Buy Ticket — GHS ${ev.price}`}
              </motion.button>
            )}
          </div>

          {desktop && (
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "24px", boxShadow: "var(--shadow-md)" }}>
                <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>TICKET_PRICE</div>
                  <div style={{ fontSize: "34px", fontWeight: 900, color: "var(--brand)", letterSpacing: "-1px", lineHeight: 1 }}>
                    {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
                  </div>
                </div>
                {[
                  ["📅", "DATE",  ev.date || "TBA"],
                  ["🕐", "TIME",  ev.time ? ev.time.substring(0, 5) : "TBA"],
                  ["🎟", "LEFT",  remaining.toString()],
                  ["📍", "VENUE", ev.venue || "TBA"],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13px" }}>{icon}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{val}</span>
                  </div>
                ))}
                <div style={{ margin: "16px 0 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>AVAILABILITY</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: remaining < 20 ? "#dc2626" : "#16a34a", fontFamily: "var(--font-mono)" }}>
                      {remaining < 20 ? "ALMOST_SOLD" : "AVAILABLE"}
                    </span>
                  </div>
                  <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: Math.max(5, Math.min(100, (remaining / (ev.totalTickets || 1)) * 100)) + "%" }}
                      transition={{ duration: 0.8 }}
                      style={{ height: "100%", borderRadius: "99px", background: remaining < 20 ? "#dc2626" : "var(--brand)" }} />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCheckout}
                  style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "13px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", fontFamily: "var(--font-sans)", marginBottom: "10px" }}>
                  {ev.price === 0 ? "Get Free Ticket" : `Buy Ticket — GHS ${ev.price}`}
                </motion.button>
                <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "9px", padding: "9px 12px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ fontSize: "12px" }}>⛓️</span>
                  <span style={{ fontSize: "10px", color: "#7c3aed", fontWeight: 600 }}>NFT minted on Polygon · Screenshot-proof</span>
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
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty     = useStore(s => s.setTicketQty);
  const setOverlayEvent  = useStore(s => s.setOverlayEvent);
  const overlayEvent     = useStore(s => s.overlayEvent);
  const searchQ          = useStore(s => s.searchQ);
  const setSearchQ       = useStore(s => s.setSearchQ);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page,           setPage]           = useState(1);
  const [searchFocused,  setSearchFocused]  = useState(false);
  const desktop = isDesktop();

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

      {/* ── Sticky command bar — MOBILE ONLY ── */}
      {!desktop && (
        <div style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 1px 0 var(--border), 0 4px 16px rgba(0,0,0,0.04)",
        }}>
          <div style={{ padding: "0 16px" }}>

            {/* Search bar */}
            <div style={{ padding: "10px 0" }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "6px", pointerEvents: "none", zIndex: 1 }}>
                  <span style={{ fontSize: "13px", opacity: 0.5 }}>🔍</span>
                </div>
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search events..."
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 40px",
                    background: searchFocused ? "var(--bg)" : "var(--bg-subtle)",
                    border: searchFocused ? "1.5px solid rgba(245,166,35,0.6)" : "1.5px solid var(--border)",
                    borderRadius: "11px", fontSize: "13px", color: "var(--text-primary)",
                    outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)",
                    transition: "all 0.2s var(--ease-smooth)",
                    boxShadow: searchFocused ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
                  }}
                />
                {searchQ && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchQ("")}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", width: "18px", height: "18px", borderRadius: "50%", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-muted)" }}>
                    ✕
                  </motion.div>
                )}
              </div>
            </div>

            {/* Category chips */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "10px" }}>
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat.key;
                return (
                  <motion.div key={cat.key} whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveCategory(cat.key)}
                    style={{
                      flexShrink: 0, padding: "5px 14px", borderRadius: "99px",
                      cursor: "pointer", fontSize: "11px", fontWeight: active ? 700 : 500,
                      display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s",
                      background: active ? "var(--brand)" : "transparent",
                      color: active ? "#fff" : "var(--text-secondary)",
                      border: active ? "1px solid var(--brand)" : "1px solid var(--border)",
                      boxShadow: active ? "var(--shadow-brand)" : "none",
                    }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Category chips — DESKTOP ONLY (no search bar, that's in topbar) ── */}
      {desktop && (
        <div style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 1px 0 var(--border), 0 4px 16px rgba(0,0,0,0.04)",
        }}>
          <div style={{ padding: "0 40px" }}>
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none", padding: "10px 0" }}>
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat.key;
                return (
                  <motion.div key={cat.key} whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveCategory(cat.key)}
                    style={{
                      flexShrink: 0, padding: "5px 14px", borderRadius: "99px",
                      cursor: "pointer", fontSize: "11px", fontWeight: active ? 700 : 500,
                      display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s",
                      background: active ? "var(--brand)" : "transparent",
                      color: active ? "#fff" : "var(--text-secondary)",
                      border: active ? "1px solid var(--brand)" : "1px solid var(--border)",
                      boxShadow: active ? "var(--shadow-brand)" : "none",
                    }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resale Market banner */}
      <div style={{ padding: desktop ? "16px 40px 0" : "12px 16px 0" }}>
        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setScreen("resaleMarket")}
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(37,99,235,0.04))", border: "1px solid rgba(124,58,237,0.18)", borderRadius: "12px", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.18)"; }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🏷️</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Resale Market</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>FAN_TO_FAN · NFT_TRANSFER · 2%_FEE</div>
            </div>
          </div>
          <span style={{ color: "#7c3aed", fontSize: "14px", fontWeight: 700 }}>→</span>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div style={{ padding: desktop ? "16px 40px 0" : "12px 16px 0" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "20px" : "12px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "var(--bg-card)", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: desktop ? "220px" : "190px" }} />
                <div style={{ padding: "13px 15px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "8px", borderRadius: "6px" }} />
                  <div className="skeleton" style={{ height: "11px", width: "45%", borderRadius: "6px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "2px", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>QUERY_RESULT: NULL</div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events found</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Try a different search or category</div>
          </motion.div>
        )}

        {!loading && paginated.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3, 1fr)" : "1fr", gap: desktop ? "20px" : "12px" }}>
            {paginated.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
                <EventCard ev={ev} onClick={() => setOverlayEvent(ev)} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}