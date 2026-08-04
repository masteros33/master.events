import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket, Search, X, MapPin, Link2, Tag, Calendar, Clock,
  ShieldCheck, Smartphone, ArrowLeft, ArrowRight, LayoutGrid,
  Music, Cpu, UtensilsCrossed, Palette, Trophy, Briefcase, MoreHorizontal,
  FileText,
} from "lucide-react";
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
  { key: "all",      label: "All",      Icon: LayoutGrid },
  { key: "music",    label: "Music",    Icon: Music },
  { key: "tech",     label: "Tech",     Icon: Cpu },
  { key: "food",     label: "Food",     Icon: UtensilsCrossed },
  { key: "arts",     label: "Arts",     Icon: Palette },
  { key: "sports",   label: "Sports",   Icon: Trophy },
  { key: "business", label: "Business", Icon: Briefcase },
  { key: "other",    label: "Other",    Icon: MoreHorizontal },
];

const ITEMS_PER_PAGE_DESKTOP = 9;
const ITEMS_PER_PAGE_MOBILE  = 6;
const isDesktop = () => window.innerWidth > 768;

// A description only counts as "real" if it exists, isn't just a restatement
// of the event's own name, and has enough content to be useful.
function hasRealDescription(desc, name) {
  const d = (desc || "").trim();
  if (!d) return false;
  if (d.toLowerCase() === (name || "").trim().toLowerCase()) return false;
  return d.length >= 12;
}

function DescriptionBlock({ desc, name, compact }) {
  const real = hasRealDescription(desc, name);
  return (
    <div className={compact ? "mb-5" : "mb-7"}>
      <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-mono mb-2.5">About</div>
      {real ? (
        <div className={`text-brand-text leading-relaxed ${compact ? "text-sm" : "text-[15px]"}`}>{desc.trim()}</div>
      ) : (
        <div className="flex items-center gap-2.5 bg-brand-canvas border border-gray-100 rounded-xl px-3.5 py-3">
          <FileText size={15} strokeWidth={1.75} className="text-brand-muted shrink-0" />
          <span className="text-[13px] text-brand-muted">No description yet — check back closer to the event.</span>
        </div>
      )}
    </div>
  );
}

function CategoryChip({ cat, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${active ? "bg-brand-orange border-brand-orange text-white" : "bg-transparent border-gray-200 text-brand-muted hover:text-brand-text"}`}>
      <cat.Icon size={12} strokeWidth={1.75} />
      {cat.label}
    </button>
  );
}

function ResaleBanner({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3.5 flex items-center justify-between text-left transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-pastel-orange flex items-center justify-center shrink-0">
          <Tag size={18} strokeWidth={1.75} className="text-brand-orange" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-brand-text">Fan-to-Fan Resale Market</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[9px] font-bold text-white bg-brand-text px-2 py-0.5 rounded-full">NFT TRANSFER</span>
            <span className="text-[9px] font-bold text-brand-muted bg-gray-100 px-2 py-0.5 rounded-full">2% FEE</span>
          </div>
        </div>
      </div>
      <ArrowRight size={16} strokeWidth={2} className="text-brand-orange shrink-0" />
    </button>
  );
}

function MobileNavbar({ scrolled }) {
  const setScreen  = useStore(s => s.setScreen);
  const isLoggedIn = useStore(s => s.isLoggedIn);

  return (
    <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100">
      <motion.div animate={{ justifyContent: scrolled ? "center" : "flex-start" }}
        className={`flex items-center gap-2 transition-all ${scrolled ? "flex-1 justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center shrink-0">
          <Ticket size={13} strokeWidth={2} color="#fff" />
        </div>
        <span className="font-extrabold text-[15px] text-brand-text tracking-tight whitespace-nowrap">Master Events</span>
      </motion.div>

      <AnimatePresence>
        {!scrolled && !isLoggedIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-2 shrink-0">
            <button onClick={() => setScreen("login")}
              className="px-3.5 py-1.5 rounded-full border border-gray-200 text-brand-text text-xs font-semibold whitespace-nowrap">
              Log in
            </button>
            <button onClick={() => setScreen("signup")}
              className="px-3.5 py-1.5 rounded-full bg-brand-orange text-white text-xs font-bold whitespace-nowrap">
              Sign up
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Redesigned event card ─────────────────────────────────────
// Key fixes: gradient scrim behind image badges for legibility on any
// poster art; organizer pill now reads clearly as "hosted by" with its
// own visual row instead of crowding the image edge.
function EventCard({ ev, onClick }) {
  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">

      <div className="relative overflow-hidden h-[190px] md:h-[220px]">
        <img src={ev.image} alt={ev.name} onError={e => { e.target.src = categoryImages.other; }}
          className="w-full h-full object-cover block" />

        {/* Scrim so badges stay legible over any poster art */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <span className="absolute top-2.5 right-2.5 bg-brand-orange text-white text-[9px] font-bold px-2.5 py-1 rounded-full font-mono shadow-sm">
          {ev.category.toUpperCase()}
        </span>
        {ev.price === 0 && (
          <span className="absolute top-2.5 left-2.5 bg-fintech-green text-white text-[9px] font-bold px-2.5 py-1 rounded-full font-mono shadow-sm">FREE</span>
        )}
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-brand-text text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
          <Link2 size={9} strokeWidth={2.5} /> NFT
        </span>
      </div>

      <div className="p-4">
        <div className="font-bold text-sm text-brand-text mb-1.5 leading-snug">{ev.name}</div>
        <div className="flex items-center gap-1 text-[11px] text-brand-muted mb-3 font-mono truncate">
          <MapPin size={11} strokeWidth={1.75} /> {ev.venue} · {ev.date}
        </div>

        {ev.organizerName && (
          <div className="flex items-center gap-2 mb-3 pt-2.5 border-t border-gray-50">
            <div className="w-5 h-5 rounded-full bg-pastel-orange flex items-center justify-center text-[9px] font-bold text-brand-orange shrink-0">
              {ev.organizerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] text-brand-muted">
              Hosted by <span className="font-semibold text-brand-text">{ev.organizerName}</span>
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-brand-orange font-extrabold text-lg tracking-tight">
            {ev.price === 0 ? "FREE" : `GHS ${ev.price}`}
          </div>
          <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
            View <ArrowRight size={12} strokeWidth={2} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-1.5 pt-8 pb-2">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-brand-text text-xs font-semibold font-mono disabled:opacity-40 disabled:cursor-not-allowed">
        ← Prev
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-colors ${p === current ? "bg-brand-orange text-white" : "border border-gray-200 bg-white text-brand-muted"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-brand-text text-xs font-semibold font-mono disabled:opacity-40 disabled:cursor-not-allowed">
        Next →
      </button>
    </div>
  );
}

function InfoTile({ Icon, label, value }) {
  return (
    <div className="flex-1 min-w-[80px] bg-brand-canvas border border-gray-100 rounded-xl p-2.5 text-center">
      <Icon size={16} strokeWidth={1.75} className="text-brand-muted mx-auto mb-1.5" />
      <div className="text-[8px] text-brand-muted font-mono tracking-wide mb-0.5">{label}</div>
      <div className="text-[11px] font-bold text-brand-text font-mono">{value}</div>
    </div>
  );
}

function EventDetailOverlay({ ev, onBack, onCheckout }) {
  const desktop   = isDesktop();
  const remaining = ev.totalTickets - ev.ticketsSold;
  const soldPct   = Math.max(5, Math.min(100, ((ev.ticketsSold || 0) / (ev.totalTickets || 1)) * 100));

  const trustRow = (
    <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
      {[[ShieldCheck,"Secure checkout"],[Smartphone,"MoMo accepted"],[Link2,"NFT issued instantly"]].map(([Icon,label]) => (
        <span key={label} className="flex items-center gap-1 text-[10px] text-brand-muted">
          <Icon size={11} strokeWidth={1.75} /> {label}
        </span>
      ))}
    </div>
  );

  if (!desktop) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-canvas h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="relative h-[220px]">
            <img src={ev.image} alt={ev.name} onError={e => { e.target.src = categoryImages.other; }}
              className="w-full h-full object-cover block" />
            <button onClick={onBack}
              className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-text">
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            <span className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-brand-text text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
              <Link2 size={10} strokeWidth={2.5} /> NFT · POLYGON
            </span>
            <span className="absolute bottom-3 left-3.5 bg-brand-orange text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
              {ev.category.toUpperCase()}
            </span>
          </div>

          <div className="bg-white px-4 py-4 border-b border-gray-100">
            <div className="font-extrabold text-lg text-brand-text leading-snug mb-1">{ev.name}</div>
            <div className="flex items-center gap-1 text-xs text-brand-muted">
              <MapPin size={12} strokeWidth={1.75} /> {ev.venue}{ev.city ? " · " + ev.city : ""}
            </div>
          </div>

          <div className="p-4 pb-24">
            <div className="flex gap-2 mb-5 flex-wrap">
              <InfoTile Icon={Calendar} label="DATE" value={ev.date || "TBA"} />
              <InfoTile Icon={Clock} label="TIME" value={ev.time ? ev.time.substring(0,5) : "TBA"} />
              <InfoTile Icon={Ticket} label="LEFT" value={`${remaining} left`} />
            </div>

            {ev.organizerName && (
              <div className="flex items-center gap-2.5 bg-pastel-orange rounded-xl px-3.5 py-2.5 mb-4">
                <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {ev.organizerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[9px] text-brand-muted font-mono">HOSTED BY</div>
                  <div className="text-[13px] font-bold text-brand-text">{ev.organizerName}</div>
                </div>
              </div>
            )}

            <DescriptionBlock desc={ev.description} name={ev.name} compact />

            <div className="flex items-center gap-2.5 bg-pastel-blue rounded-xl px-3.5 py-3 mb-5">
              <Link2 size={16} strokeWidth={1.75} className="text-fintech-blue shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-fintech-blue">Secured by Polygon Blockchain</div>
                <div className="text-[10px] text-brand-muted mt-0.5">NFT minted · Screenshot-proof · Cannot be duplicated</div>
              </div>
            </div>

            <button onClick={onCheckout}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-[15px] font-bold transition-colors">
              {ev.price === 0 ? "Get Free Ticket" : `Buy Ticket — GHS ${ev.price}`}
            </button>
            {trustRow}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-canvas h-full overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="max-w-[1200px] mx-auto px-10 pt-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-brand-muted text-sm font-medium hover:text-brand-text transition-colors">
          <ArrowLeft size={15} strokeWidth={2} /> Back to Events
        </button>
      </div>
      <div className="max-w-[1200px] mx-auto px-10 pt-6 pb-14 flex gap-10 items-start">
        <div className="w-[45%] shrink-0 sticky top-6">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
            <img src={ev.image} alt={ev.name} onError={e => { e.target.src = categoryImages.other; }}
              className="w-full aspect-[4/3] object-cover block" />
            <span className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-brand-text text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              <Link2 size={11} strokeWidth={2.5} /> NFT · POLYGON AMOY
            </span>
            <span className="absolute top-3.5 right-3.5 bg-brand-orange text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              {ev.category.toUpperCase()}
            </span>
          </div>
          <div className="mt-3.5 flex items-center gap-2.5 bg-pastel-blue rounded-xl px-4 py-3">
            <Link2 size={18} strokeWidth={1.75} className="text-fintech-blue shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-fintech-blue">Secured by Polygon Blockchain</div>
              <div className="text-[10px] text-brand-muted mt-0.5">NFT minted · Screenshot-proof · Cannot be duplicated</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-[32px] font-extrabold text-brand-text tracking-tight leading-tight mb-2">{ev.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-brand-muted mb-6">
            <MapPin size={15} strokeWidth={1.75} /> {ev.venue}{ev.city ? ", " + ev.city : ""}
          </div>

          {ev.organizerName && (
            <div className="flex items-center gap-2.5 bg-pastel-orange rounded-xl px-4 py-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-sm font-bold text-white shrink-0">
                {ev.organizerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[9px] text-brand-muted font-mono">HOSTED BY</div>
                <div className="text-sm font-bold text-brand-text">{ev.organizerName}</div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            {[
              { Icon: Calendar, label: "WHEN",      value: ev.date || "TBA" },
              { Icon: Clock,    label: "TIME",      value: ev.time ? ev.time.substring(0, 5) : "TBA" },
              { Icon: MapPin,   label: "WHERE",     value: ev.venue || "TBA" },
              { Icon: Ticket,   label: "AVAILABLE", value: `${remaining} of ${ev.totalTickets} tickets left` },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex items-center gap-3.5 px-4.5 py-3.5 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="w-9 h-9 rounded-lg bg-brand-canvas border border-gray-100 flex items-center justify-center shrink-0">
                  <row.Icon size={16} strokeWidth={1.75} className="text-brand-muted" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-brand-muted tracking-wide font-mono mb-0.5">{row.label}</div>
                  <div className="text-[13px] font-semibold text-brand-text">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-bold text-brand-muted font-mono">AVAILABILITY</span>
              <span className={`text-[10px] font-bold font-mono ${remaining < 20 ? "text-red-600" : "text-fintech-green"}`}>{remaining < 20 ? "ALMOST SOLD OUT" : "AVAILABLE"}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${remaining < 20 ? "bg-red-500" : "bg-fintech-green"}`} />
            </div>
            <div className="text-[10px] text-brand-muted mt-1">{ev.ticketsSold || 0} sold · {remaining} remaining</div>
          </div>

          <DescriptionBlock desc={ev.description} name={ev.name} />

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-[34px] font-extrabold text-brand-orange tracking-tight leading-none">{ev.price === 0 ? "FREE" : `GHS ${ev.price}`}</div>
              {ev.price > 0 && <span className="text-xs text-brand-muted">per ticket</span>}
            </div>
            <button onClick={onCheckout}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-base font-bold transition-colors mb-3">
              {ev.price === 0 ? "Get Free Ticket →" : `Buy Ticket — GHS ${ev.price} →`}
            </button>
            {trustRow}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ code, desktop }) {
  return (
    <div className="text-center py-20 px-5">
      <div className="text-[10px] font-bold text-brand-muted tracking-widest font-mono mb-4">{code}</div>
      <div className="font-bold text-base text-brand-text mb-2">No events found</div>
      <div className="text-sm text-brand-muted">Try a different search or category</div>
    </div>
  );
}

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
  const [scrolled,       setScrolled]       = useState(false);
  const desktop = isDesktop();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (desktop) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [desktop]);

  const { data: eventsData, isLoading: loading } = useQuery({
    queryKey: ["events"],
    queryFn: () =>
      eventsAPI.list().then(data =>
        Array.isArray(data)
          ? data.map(e => ({
              id:            e.id,
              name:          e.name,
              description:   e.description || "",
              category:      e.category,
              venue:         e.venue,
              city:          e.city,
              date:          e.date,
              time:          e.time,
              price:         parseFloat(e.price) || 0,
              totalTickets:  e.total_tickets || 0,
              ticketsSold:   e.tickets_sold  || 0,
              salesOpen:     e.sales_open,
              image:         e.image || categoryImages[e.category] || categoryImages.other,
              organizerName: e.organizer?.first_name
                ? `${e.organizer.first_name} ${e.organizer.last_name || ""}`.trim()
                : e.organizer_name || null,
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
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skeletonCard = (h) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="skeleton" style={{ height: h }} />
      <div className="p-4">
        <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "8px", borderRadius: "6px" }} />
        <div className="skeleton" style={{ height: "11px", width: "45%", borderRadius: "6px" }} />
      </div>
    </div>
  );

  if (overlayEvent) return (
    <EventDetailOverlay
      ev={overlayEvent}
      onBack={() => setOverlayEvent(null)}
      onCheckout={() => goToCheckout(overlayEvent)}
    />
  );

  if (!desktop) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 sticky top-0 z-40">
          <MobileNavbar scrolled={scrolled} />

          <div className="bg-white border-b border-gray-100 px-4">
            <div className="py-2.5">
              <div className="relative">
                <Search size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search events..."
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-brand-text outline-none transition-colors ${searchFocused ? "border-brand-orange bg-white ring-2 ring-orange-100" : "border-gray-200 bg-brand-canvas"}`}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-gray-100 flex items-center justify-center text-brand-muted">
                    <X size={10} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2.5" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <CategoryChip key={cat.key} cat={cat} active={activeCategory === cat.key} onClick={() => setActiveCategory(cat.key)} />
              ))}
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="px-4 pt-3">
            <ResaleBanner onClick={() => setScreen("resaleMarket")} />
          </div>

          <div className="p-4 pb-24">
            {loading && (
              <div className="grid grid-cols-1 gap-3">
                {[1,2,3,4].map(i => <React.Fragment key={i}>{skeletonCard("190px")}</React.Fragment>)}
              </div>
            )}
            {!loading && filtered.length === 0 && <EmptyState code="NO RESULTS" />}
            {!loading && paginated.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {paginated.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => setOverlayEvent(ev)} />)}
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <Pagination current={page} total={totalPages} onChange={handlePageChange} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-canvas min-h-full pb-14">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-10">
          <div className="flex gap-1.5 overflow-x-auto py-2.5" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map(cat => (
              <CategoryChip key={cat.key} cat={cat} active={activeCategory === cat.key} onClick={() => setActiveCategory(cat.key)} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-10 pt-4">
        <ResaleBanner onClick={() => setScreen("resaleMarket")} />
      </div>

      <div className="px-10 pt-4">
        {loading && (
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <React.Fragment key={i}>{skeletonCard("220px")}</React.Fragment>)}
          </div>
        )}
        {!loading && filtered.length === 0 && <EmptyState code="QUERY_RESULT: NULL" />}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-3 gap-5">
            {paginated.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => setOverlayEvent(ev)} />)}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}