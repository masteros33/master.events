import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket, MagnifyingGlass, X, MapPin, Link, Tag, Calendar, Clock,
  ShieldCheck, DeviceMobile, ArrowLeft, ArrowRight, SquaresFour,
  MusicNotes, Cpu, ForkKnife, PaintBrush, Trophy, Briefcase, DotsThreeCircle,
  FileText, Star, Crown, CheckCircle, WarningCircle,
} from "@phosphor-icons/react";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";
import { formatDate, formatTime } from "../../utils/formatDate";

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
  { key: "music",    label: "Music",    Icon: MusicNotes },
  { key: "tech",     label: "Tech",     Icon: Cpu },
  { key: "food",     label: "Food",     Icon: ForkKnife },
  { key: "arts",     label: "Arts",     Icon: PaintBrush },
  { key: "sports",   label: "Sports",   Icon: Trophy },
  { key: "business", label: "Business", Icon: Briefcase },
  { key: "other",    label: "Other",    Icon: DotsThreeCircle },
];

const RECENT_CATEGORIES_KEY = "me_viewed_categories";
const ITEMS_PER_PAGE_DESKTOP = 12;
const ITEMS_PER_PAGE_MOBILE  = 8;
const isDesktop = () => window.innerWidth > 768;

function hasRealDescription(desc, name) {
  const d = (desc || "").trim();
  if (!d) return false;
  if (d.toLowerCase() === (name || "").trim().toLowerCase()) return false;
  return d.length >= 12;
}

function tierIconFor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("vvip")) return Crown;
  if (n.includes("vip"))  return Star;
  return Ticket;
}

function isSameDate(dateStr, target) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  return d.toDateString() === target.toDateString();
}

function isThisWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const day = now.getDay();
  const satOffset = (6 - day + 7) % 7;
  const sat = new Date(now); sat.setDate(now.getDate() + satOffset); sat.setHours(0, 0, 0, 0);
  const sun = new Date(sat); sun.setDate(sat.getDate() + 1); sun.setHours(23, 59, 59, 999);
  return d >= sat && d <= sun;
}

function priceLabel(ev) {
  const currency = ev.currency || "GHS";
  const hasTiers = Array.isArray(ev.tiers) && ev.tiers.length > 0;
  if (hasTiers) {
    const from = Math.min(...ev.tiers.map(t => parseFloat(t.price) || 0));
    return from === 0 ? "Free" : `${currency} ${from}+`;
  }
  return ev.price === 0 ? "Free" : `${currency} ${ev.price}`;
}

function DescriptionBlock({ desc, name, compact }) {
  const real = hasRealDescription(desc, name);
  return (
    <div className={compact ? "mb-5" : "mb-7"}>
      <div className="text-[15px] font-semibold text-brand-text mb-2.5">Overview</div>
      {real ? (
        <p className="text-sm text-brand-text leading-relaxed whitespace-pre-line">
          {desc.trim()}
        </p>
      ) : (
        <div className="flex items-center gap-2.5 bg-brand-card border border-brand-hairline rounded-xl px-3.5 py-3">
          <FileText size={15} weight="light" className="text-brand-muted shrink-0" />
          <span className="text-[13px] text-brand-muted">No description yet — check back closer to the event.</span>
        </div>
      )}
    </div>
  );
}

function TierPicker({ tiers, selectedId, onSelect, compact }) {
  return (
    <div className={compact ? "mb-5" : "mb-6"}>
      <div className="text-xs font-medium text-brand-muted uppercase tracking-widest mb-2.5">
        Select Ticket Type
      </div>
      <div className="flex flex-col gap-2">
        {tiers.map(t => {
          const Icon      = tierIconFor(t.name);
          const soldOut   = t.remaining <= 0;
          const active    = String(selectedId) === String(t.id);
          return (
            <button key={t.id} disabled={soldOut} onClick={() => onSelect(t)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                soldOut ? "border-brand-hairline bg-brand-subtle opacity-50 cursor-not-allowed"
                : active ? "border-brand-accent bg-[var(--brand-light)]"
                : "border-brand-hairline bg-brand-card"
              }`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-brand-accent text-white" : "bg-brand-canvas text-brand-muted"}`}>
                  <Icon size={16} weight="light" />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-brand-text truncate">{t.name}</div>
                  <div className="text-xs text-brand-muted">
                    {soldOut ? "Sold out" : `${t.remaining} left`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-semibold tabular-nums ${active ? "text-brand-accent" : "text-brand-text"}`}>
                  GHS {t.price}
                </span>
                {active && <CheckCircle size={16} weight="light" className="text-brand-accent" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterPills({ active, onChange }) {
  const pills = [
    { key: "all",         label: "All" },
    { key: "today",       label: "Today" },
    { key: "weekend",     label: "This weekend" },
    { key: "forYou",      label: "For you" },
    ...CATEGORIES,
  ];
  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto scroll-smooth snap-x" style={{ scrollbarWidth: "none" }}>
        {pills.map(p => (
          <button key={p.key} onClick={() => onChange(p.key)}
            className={`shrink-0 snap-start flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium border transition-colors ${
              active === p.key ? "bg-brand-accent border-brand-accent text-white" : "bg-transparent border-brand-hairline text-brand-muted hover:text-brand-text"
            }`}>
            {p.Icon && <p.Icon size={13} weight="light" />}
            {p.label}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8" style={{ background: "linear-gradient(to left, var(--bg-card), transparent)" }} />
    </div>
  );
}

function ResaleBanner({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-full bg-brand-card border border-brand-hairline rounded-2xl px-4 py-3.5 flex items-center justify-between text-left transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--brand-light)" }}>
          <Tag size={18} weight="light" className="text-brand-accent" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-brand-text">Fan-to-Fan Resale Market</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs font-medium text-white bg-brand-text px-2 py-0.5 rounded-full">NFT TRANSFER</span>
            <span className="text-xs font-medium text-brand-muted bg-brand-hairline px-2 py-0.5 rounded-full">2% FEE</span>
          </div>
        </div>
      </div>
      <ArrowRight size={16} weight="light" className="text-brand-accent shrink-0" />
    </button>
  );
}

function MobileNavbar({ scrolled }) {
  const setScreen  = useStore(s => s.setScreen);
  const isLoggedIn = useStore(s => s.isLoggedIn);

  return (
    <div className="flex items-center justify-between px-4 h-14 bg-brand-card border-b border-brand-hairline">
      <motion.div animate={{ justifyContent: scrolled ? "center" : "flex-start" }}
        className={`flex items-center gap-2 transition-all ${scrolled ? "flex-1 justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-xl bg-brand-accent flex items-center justify-center shrink-0">
          <Ticket size={13} weight="light" color="#fff" />
        </div>
        <span className="font-semibold text-[15px] text-brand-text tracking-tight whitespace-nowrap">Master Events</span>
      </motion.div>

      <AnimatePresence>
        {!scrolled && !isLoggedIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="flex items-center gap-2 shrink-0">
            <button onClick={() => setScreen("login")}
              className="h-8 px-3.5 rounded-xl border border-brand-hairline text-brand-text text-xs font-medium whitespace-nowrap">
              Log in
            </button>
            <button onClick={() => setScreen("signup")}
              className="h-8 px-3.5 rounded-xl bg-brand-accent text-white text-xs font-medium whitespace-nowrap">
              Sign up
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EventCard({ ev, onClick, footer }) {
  const hasTiers = Array.isArray(ev.tiers) && ev.tiers.length > 0;
  const time = formatTime(ev.time);

  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`bg-brand-card rounded-2xl border border-brand-hairline hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow overflow-hidden ${onClick ? "cursor-pointer" : ""}`}>

      <div className="relative overflow-hidden aspect-square">
        <img src={ev.image} alt={ev.name} onError={e => { e.target.src = categoryImages.other; }}
          loading="lazy" width="400" height="400"
          className="w-full h-full object-cover block" />

        {hasTiers && (
          <span className="absolute top-2 left-2 bg-brand-text text-white text-xs font-medium px-2 py-1 rounded-full">
            {ev.tiers.length} TIERS
          </span>
        )}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-brand-text text-white text-xs font-medium px-2 py-1 rounded-full">
          <Link size={9} weight="light" /> NFT
        </span>
      </div>

      <div className="p-3">
        <div className="font-medium text-[15px] text-brand-text mb-1 leading-snug line-clamp-2">{ev.name}</div>
        <div className="flex items-center gap-1 text-[13px] text-brand-muted mb-2.5 tabular-nums truncate">
          {formatDate(ev.date)}{time ? ` · ${time}` : ""}
        </div>
        {footer ? footer : (
          <div className="flex justify-between items-center">
            <span className="text-xs text-brand-muted flex items-center gap-1 truncate min-w-0">
              <MapPin size={11} weight="light" className="shrink-0" /> <span className="truncate">{ev.venue}</span>
            </span>
            <span className="shrink-0 h-7 px-3 rounded-full bg-brand-accent text-white text-[13px] font-medium flex items-center tabular-nums">
              {priceLabel(ev)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-1.5 pt-8 pb-2">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="h-9 px-3.5 rounded-xl border border-brand-hairline bg-brand-card text-brand-text text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed">
        ← Prev
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-xl text-xs font-medium tabular-nums transition-colors ${p === current ? "bg-brand-accent text-white" : "border border-brand-hairline bg-brand-card text-brand-muted"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="h-9 px-3.5 rounded-xl border border-brand-hairline bg-brand-card text-brand-text text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed">
        Next →
      </button>
    </div>
  );
}

function InfoTile({ Icon, label, value }) {
  return (
    <div className="flex-1 min-w-[80px] bg-brand-canvas border border-brand-hairline rounded-xl p-2.5 text-center">
      <Icon size={16} weight="light" className="text-brand-muted mx-auto mb-1.5" />
      <div className="text-xs text-brand-muted tracking-wide mb-0.5">{label}</div>
      <div className="text-[13px] font-medium text-brand-text tabular-nums">{value}</div>
    </div>
  );
}

function EventDetailOverlay({ ev, onBack, onCheckout }) {
  const desktop   = isDesktop();
  const hasTiers  = Array.isArray(ev.tiers) && ev.tiers.length > 0;
  const remaining = ev.totalTickets - ev.ticketsSold;
  const soldPct   = Math.max(5, Math.min(100, ((ev.ticketsSold || 0) / (ev.totalTickets || 1)) * 100));
  const currency  = ev.currency || "GHS";

  const [selectedTier, setSelectedTier] = useState(hasTiers && ev.tiers.length === 1 ? ev.tiers[0] : null);

  const displayPrice = hasTiers ? (selectedTier ? selectedTier.price : null) : ev.price;
  const buyDisabled  = hasTiers && !selectedTier;

  const buyLabel = () => {
    if (buyDisabled) return "Select a ticket type";
    if (displayPrice === 0 || ev.price === 0) return "Get Free Ticket";
    return `Buy Ticket — ${currency} ${displayPrice}`;
  };

  const trustRow = (
    <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
      {[[ShieldCheck,"Secure checkout"],[DeviceMobile,"MoMo accepted"],[Link,"NFT issued instantly"]].map(([Icon,label]) => (
        <span key={label} className="flex items-center gap-1 text-xs text-brand-muted">
          <Icon size={11} weight="light" /> {label}
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
              className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-brand-card flex items-center justify-center text-brand-text">
              <ArrowLeft size={16} weight="light" />
            </button>
            <span className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-brand-text text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <Link size={10} weight="light" /> NFT · POLYGON
            </span>
            <span className="absolute bottom-3 left-3.5 bg-brand-accent text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {ev.category.toUpperCase()}
            </span>
          </div>

          <div className="bg-brand-card px-4 py-4 border-b border-brand-hairline">
            <div className="font-semibold text-xl tracking-[-0.02em] text-brand-text leading-snug mb-1">{ev.name}</div>
            <div className="flex items-center gap-1 text-xs text-brand-muted">
              <MapPin size={12} weight="light" /> {ev.venue}{ev.city ? " · " + ev.city : ""}
            </div>
          </div>

          <div className="p-4 pb-24">
            <div className="flex gap-2 mb-5 flex-wrap">
              <InfoTile Icon={Calendar} label="DATE" value={formatDate(ev.date)} />
              <InfoTile Icon={Clock} label="TIME" value={formatTime(ev.time) || "TBA"} />
              <InfoTile Icon={Ticket} label="LEFT" value={`${remaining} left`} />
            </div>

            {ev.organizerName && (
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-4" style={{ background: "var(--brand-light)" }}>
                <div className="w-7 h-7 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium text-white shrink-0">
                  {ev.organizerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs text-brand-muted">HOSTED BY</div>
                  <div className="text-[13px] font-medium text-brand-text">{ev.organizerName}</div>
                </div>
              </div>
            )}

            <DescriptionBlock desc={ev.description} name={ev.name} compact />

            {hasTiers && (
              <TierPicker tiers={ev.tiers} selectedId={selectedTier?.id} onSelect={setSelectedTier} compact />
            )}

            <div className="flex items-center gap-2.5 bg-blue-50 rounded-xl px-3.5 py-3 mb-5">
              <Link size={16} weight="light" className="text-blue-700 shrink-0" />
              <div>
                <div className="text-xs font-medium text-blue-700">Secured by Polygon Blockchain</div>
                <div className="text-xs text-brand-muted mt-0.5">NFT minted · Screenshot-proof · Cannot be duplicated</div>
              </div>
            </div>

            <button onClick={() => !buyDisabled && onCheckout(selectedTier)} disabled={buyDisabled}
              className={`w-full h-12 rounded-xl text-[15px] font-medium transition-colors ${
                buyDisabled ? "bg-brand-hairline text-brand-muted cursor-not-allowed" : "bg-brand-accent hover:bg-brand-accent-hover text-white"
              }`}>
              {buyLabel()}
            </button>
            {trustRow}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-canvas h-full overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="max-w-[1120px] mx-auto px-10 pt-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-brand-muted text-sm font-medium hover:text-brand-text transition-colors">
          <ArrowLeft size={15} weight="light" /> Back to Events
        </button>
      </div>
      <div className="max-w-[1120px] mx-auto px-10 pt-6 pb-14 flex gap-10 items-start">
        <div className="w-[45%] shrink-0 sticky top-6">
          <div className="rounded-2xl overflow-hidden border border-brand-hairline relative">
            <img src={ev.image} alt={ev.name} onError={e => { e.target.src = categoryImages.other; }}
              className="w-full aspect-[4/3] object-cover block" />
            <span className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-brand-text text-white text-xs font-medium px-2.5 py-1.5 rounded-full">
              <Link size={11} weight="light" /> NFT · POLYGON AMOY
            </span>
            <span className="absolute top-3.5 right-3.5 bg-brand-accent text-white text-xs font-medium px-2.5 py-1.5 rounded-full">
              {ev.category.toUpperCase()}
            </span>
          </div>
          <div className="mt-3.5 flex items-center gap-2.5 bg-blue-50 rounded-xl px-4 py-3">
            <Link size={18} weight="light" className="text-blue-700 shrink-0" />
            <div>
              <div className="text-xs font-medium text-blue-700">Secured by Polygon Blockchain</div>
              <div className="text-xs text-brand-muted mt-0.5">NFT minted · Screenshot-proof · Cannot be duplicated</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-[30px] font-semibold text-brand-text tracking-[-0.02em] leading-tight mb-2">{ev.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-brand-muted mb-6">
            <MapPin size={15} weight="light" /> {ev.venue}{ev.city ? ", " + ev.city : ""}
          </div>

          {ev.organizerName && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5" style={{ background: "var(--brand-light)" }}>
              <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-sm font-medium text-white shrink-0">
                {ev.organizerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-brand-muted">HOSTED BY</div>
                <div className="text-sm font-medium text-brand-text">{ev.organizerName}</div>
              </div>
            </div>
          )}

          <div className="bg-brand-card border border-brand-hairline rounded-2xl overflow-hidden mb-6">
            {[
              { Icon: Calendar, label: "WHEN",      value: formatDate(ev.date) },
              { Icon: Clock,    label: "TIME",      value: formatTime(ev.time) || "TBA" },
              { Icon: MapPin,   label: "WHERE",     value: ev.venue || "TBA" },
              { Icon: Ticket,   label: "AVAILABLE", value: `${remaining} of ${ev.totalTickets} tickets left` },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex items-center gap-3.5 px-4.5 py-3.5 ${i < arr.length - 1 ? "border-b border-brand-hairline" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-hairline flex items-center justify-center shrink-0">
                  <row.Icon size={16} weight="light" className="text-brand-muted" />
                </div>
                <div>
                  <div className="text-xs font-medium text-brand-muted tracking-wide mb-0.5">{row.label}</div>
                  <div className="text-[13px] font-medium text-brand-text tabular-nums">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-medium text-brand-muted">AVAILABILITY</span>
              <span className={`text-xs font-medium ${remaining < 20 ? "text-red-600" : "text-emerald-700"}`}>{remaining < 20 ? "ALMOST SOLD OUT" : "AVAILABLE"}</span>
            </div>
            <div className="h-1.5 bg-brand-hairline rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${remaining < 20 ? "bg-red-500" : "bg-emerald-500"}`} />
            </div>
            <div className="text-xs text-brand-muted mt-1 tabular-nums">{ev.ticketsSold || 0} sold · {remaining} remaining</div>
          </div>

          <DescriptionBlock desc={ev.description} name={ev.name} />

          {hasTiers && (
            <TierPicker tiers={ev.tiers} selectedId={selectedTier?.id} onSelect={setSelectedTier} />
          )}

          <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-3xl font-semibold text-brand-accent tracking-tight tabular-nums leading-none">
                {hasTiers
                  ? (selectedTier ? `${currency} ${selectedTier.price}` : "Select a tier")
                  : (ev.price === 0 ? "FREE" : `${currency} ${ev.price}`)}
              </div>
              {!hasTiers && ev.price > 0 && <span className="text-xs text-brand-muted">per ticket</span>}
              {hasTiers && selectedTier && <span className="text-xs text-brand-muted">per ticket</span>}
            </div>
            <button onClick={() => !buyDisabled && onCheckout(selectedTier)} disabled={buyDisabled}
              className={`w-full h-12 rounded-xl text-[15px] font-medium transition-colors mb-3 ${
                buyDisabled ? "bg-brand-hairline text-brand-muted cursor-not-allowed" : "bg-brand-accent hover:bg-brand-accent-hover text-white"
              }`}>
              {buyLabel()}{!buyDisabled && " →"}
            </button>
            {trustRow}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-5">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--brand-light)" }}>
        <Ticket size={26} weight="light" className="text-brand-accent" />
      </div>
      <div className="font-medium text-[15px] text-brand-text mb-1.5">No events found</div>
      <div className="text-sm text-brand-muted">Try a different search, filter, or category</div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="text-center py-20 px-5">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <WarningCircle size={26} weight="light" className="text-red-600" />
      </div>
      <div className="font-medium text-[15px] text-brand-text mb-1.5">Couldn't load events</div>
      <div className="text-sm text-brand-muted mb-4">Check your connection and try again</div>
      <button onClick={onRetry} className="h-9 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium">
        Retry
      </button>
    </div>
  );
}

export default function AttendeeHome() {
  const setScreen        = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty     = useStore(s => s.setTicketQty);
  const setOverlayEvent  = useStore(s => s.setOverlayEvent);
  const setSelectedTier  = useStore(s => s.setSelectedTier);
  const overlayEvent     = useStore(s => s.overlayEvent);
  const searchQ          = useStore(s => s.searchQ);
  const setSearchQ       = useStore(s => s.setSearchQ);
  const isLoggedIn       = useStore(s => s.isLoggedIn);
  const [activeFilter,  setActiveFilter]  = useState("all");
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

  const { data: eventsData, isLoading: loading, isError, refetch } = useQuery({
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
              currency:      e.currency || "GHS",
              totalTickets:  e.total_tickets || 0,
              ticketsSold:   e.tickets_sold  || 0,
              salesOpen:     e.sales_open,
              image:         e.image || categoryImages[e.category] || categoryImages.other,
              organizerName: e.organizer?.first_name
                ? `${e.organizer.first_name} ${e.organizer.last_name || ""}`.trim()
                : e.organizer_name || null,
              tiers: Array.isArray(e.tiers) ? e.tiers.map(t => ({
                id:        t.id,
                name:      t.name,
                price:     parseFloat(t.price) || 0,
                capacity:  t.capacity,
                sold:      t.sold,
                remaining: t.remaining,
              })) : [],
            }))
          : []
      ),
    staleTime: 2 * 60 * 1000,
  });

  const events = eventsData || [];

  const [prevSearch, setPrevSearch] = useState(searchQ);
  const [prevFilter, setPrevFilter] = useState(activeFilter);
  if (searchQ !== prevSearch || activeFilter !== prevFilter) {
    setPage(1);
    setPrevSearch(searchQ);
    setPrevFilter(activeFilter);
  }

  const recentCategories = (() => {
    try { return JSON.parse(localStorage.getItem(RECENT_CATEGORIES_KEY) || "[]"); }
    catch { return []; }
  })();

  const filtered = events.filter(e => {
    const q = searchQ.toLowerCase();
    const matchSearch =
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
    if (!matchSearch) return false;

    if (activeFilter === "today")   return isSameDate(e.date, new Date());
    if (activeFilter === "weekend") return isThisWeekend(e.date);
    if (activeFilter === "forYou")  return recentCategories.length ? recentCategories.includes(e.category) : true;
    if (activeFilter === "all")     return true;
    return e.category === activeFilter;
  });

  const perPage    = desktop ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const openEvent = useCallback((ev) => {
    setOverlayEvent(ev);
    try {
      const seen = JSON.parse(localStorage.getItem(RECENT_CATEGORIES_KEY) || "[]");
      const next = [ev.category, ...seen.filter(c => c !== ev.category)].slice(0, 5);
      localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(next));
    } catch {}
  }, [setOverlayEvent]);

  const goToCheckout = useCallback((ev, tier) => {
    const eventForCheckout = tier ? { ...ev, price: tier.price } : ev;
    setCheckoutEvent(eventForCheckout);
    setSelectedTier(tier || null);
    setTicketQty(1);
    setOverlayEvent(null);
    setScreen("checkout");
  }, [setCheckoutEvent, setSelectedTier, setTicketQty, setOverlayEvent, setScreen]);

  const handlePageChange = (p) => {
    setPage(p);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skeletonCard = () => (
    <div className="bg-brand-card rounded-2xl border border-brand-hairline overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-3">
        <div className="skeleton" style={{ height: "14px", width: "80%", marginBottom: "8px", borderRadius: "6px" }} />
        <div className="skeleton" style={{ height: "11px", width: "50%", borderRadius: "6px" }} />
      </div>
    </div>
  );

  if (overlayEvent) return (
    <EventDetailOverlay
      ev={overlayEvent}
      onBack={() => setOverlayEvent(null)}
      onCheckout={(tier) => goToCheckout(overlayEvent, tier)}
    />
  );

  const gridClass = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3";

  if (!desktop) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 sticky top-0 z-40">
          {!isLoggedIn && <MobileNavbar scrolled={scrolled} />}

          <div className="bg-brand-card border-b border-brand-hairline px-4">
            <div className="py-2.5">
              <div className="relative">
                <MagnifyingGlass size={14} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search events..."
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-brand-text outline-none transition-colors ${searchFocused ? "border-brand-accent bg-brand-card ring-2 ring-brand-accent/20" : "border-brand-hairline bg-brand-canvas"}`}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-brand-hairline flex items-center justify-center text-brand-muted">
                    <X size={10} weight="bold" />
                  </button>
                )}
              </div>
            </div>
            <div className="pb-2.5">
              <FilterPills active={activeFilter} onChange={setActiveFilter} />
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="px-4 pt-3">
            <ResaleBanner onClick={() => setScreen("resaleMarket")} />
          </div>

          <div className="p-4 pb-24">
            {loading && (
              <div className={gridClass}>
                {[1,2,3,4,5,6].map(i => <React.Fragment key={i}>{skeletonCard()}</React.Fragment>)}
              </div>
            )}
            {!loading && isError && <ErrorState onRetry={refetch} />}
            {!loading && !isError && filtered.length === 0 && <EmptyState />}
            {!loading && !isError && paginated.length > 0 && (
              <div className={gridClass}>
                {paginated.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => openEvent(ev)} />)}
              </div>
            )}
            {!loading && !isError && filtered.length > 0 && (
              <Pagination current={page} total={totalPages} onChange={handlePageChange} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-canvas min-h-full pb-14">
      <div className="sticky top-0 z-30 bg-brand-card border-b border-brand-hairline">
        <div className="max-w-[1120px] mx-auto px-10 py-2.5">
          <FilterPills active={activeFilter} onChange={setActiveFilter} />
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-10 pt-4">
        <ResaleBanner onClick={() => setScreen("resaleMarket")} />
      </div>

      <div className="max-w-[1120px] mx-auto px-10 pt-4">
        {loading && (
          <div className={gridClass}>
            {[1,2,3,4,5,6,7,8].map(i => <React.Fragment key={i}>{skeletonCard()}</React.Fragment>)}
          </div>
        )}
        {!loading && isError && <ErrorState onRetry={refetch} />}
        {!loading && !isError && filtered.length === 0 && <EmptyState />}
        {!loading && !isError && paginated.length > 0 && (
          <div className={gridClass}>
            {paginated.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => openEvent(ev)} />)}
          </div>
        )}
        {!loading && !isError && filtered.length > 0 && (
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}
