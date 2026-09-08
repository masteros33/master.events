import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link, Calendar, MapPin, CheckCircle, Wallet, CreditCard, Confetti,
  Camera, Lock, MagnifyingGlass, DoorOpen, Ticket, Bank, Globe, Bell, Pause, Play,
  X, Users, Tag, SquaresFour, ArrowLeft, Plus, CaretDown, CaretUp,
  ArrowsClockwise, DownloadSimple, Copy, Check, Scan, Crown, Star, Sparkle,
  ShieldCheck, Clock,
} from "@phosphor-icons/react";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";
import { formatDate } from "../../utils/formatDate";

const CHART = { orange: "#1c2e53", green: "#10B981", blue: "#2563EB", red: "#DC2626" };

const CURRENCIES = [
  { code:"GHS", symbol:"₵" }, { code:"USD", symbol:"$" },
  { code:"EUR", symbol:"€" }, { code:"GBP", symbol:"£" },
  { code:"NGN", symbol:"₦" }, { code:"KES", symbol:"KSh" },
];
const COUNTRIES = [
  "Ghana","Nigeria","Kenya","South Africa","United Kingdom",
  "United States","Canada","Germany","France","Senegal","Other",
];
const CATEGORIES = ["music","tech","food","arts","sports","business","other"];

const TIER_PRESETS = [
  { key:"regular", label:"Regular", Icon:Ticket },
  { key:"vip",     label:"VIP",     Icon:Star },
  { key:"vvip",    label:"VVIP",    Icon:Crown },
  { key:"custom",  label:"Custom",  Icon:Sparkle },
];

const catImg = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const desk = () => window.innerWidth >= 1024;
const tab  = () => window.innerWidth >= 768;

const mapEvent = e => ({
  id:           e.id,
  name:         e.name,
  date:         e.date,
  venue:        e.venue,
  city:         e.city       || "Accra",
  country:      e.country    || "Ghana",
  category:     e.category   || "other",
  event_type:   e.event_type || "paid",
  currency:     e.currency   || "GHS",
  price:        parseFloat(e.price || 0),
  totalTickets: e.total_tickets  || 0,
  ticketsSold:  e.tickets_sold   || 0,
  salesOpen:    e.sales_open,
  slug:         e.slug            || "",
  event_url:    e.event_url       || "",
  regs:         e.registrations_count || 0,
  description:  e.description    || "",
  image:        e.image || catImg[e.category] || catImg.other,
  tiers:        e.tiers || [],
  isApproved:   e.is_approved !== undefined ? e.is_approved : true,
});

const pctColorClass = pct => pct > 80 ? "text-red-600" : "text-brand-accent";
const pctBarClass   = pct => pct > 80 ? "bg-red-600" : "bg-brand-accent";

const inputClass = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl border bg-brand-card text-sm text-brand-text outline-none transition-colors ${
    err ? "border-red-300" : "border-brand-hairline focus:border-brand-accent"
  } focus:ring-2 focus:ring-brand-accent/20`;
const labelClass = "text-xs font-semibold text-brand-muted mb-1.5 block uppercase tracking-wide";

function dlCSV(events) {
  if (!events.length) return;
  const rows = events.map(e => ({
    Event: e.name, Date: e.date, Venue: e.venue, Category: e.category,
    Type: e.event_type, Currency: e.currency, Price: e.price,
    Sold: e.ticketsSold, Capacity: e.totalTickets,
    "Fill%": e.totalTickets > 0 ? Math.round((e.ticketsSold/e.totalTickets)*100) : 0,
    "Revenue(95%)": Math.round(e.ticketsSold * e.price * 0.95),
    Status: e.salesOpen ? "Live" : "Closed",
  }));
  const csv = Object.keys(rows[0]).join(",") + "\n" +
    rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
  a.download = `master-events-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function Sparkline({ data = [], color = CHART.orange, height = 32, width = 80 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - (v / max) * (height - 4) - 2,
  ]);
  const d    = pts.map((p, i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = [...pts, [width, height], [0, height]].map((p,i) =>
    `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";
  const id = `sg${color.replace(/[^a-z0-9]/gi,"")}${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg width={width} height={height} style={{ overflow:"visible", flexShrink:0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Ring({ pct = 0, size = 44, color = CHART.orange, bg = "#E5E7EB" }) {
  const r  = (size - 5) / 2;
  const cx = size / 2;
  const c  = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={bg} strokeWidth="4" />
      <motion.circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * Math.min(pct, 100)) / 100 }}
        transition={{ duration: 0.8, ease: "easeOut" }} />
    </svg>
  );
}

function EventCard({ ev, onClick }) {
  const isFree = ev.event_type === "free";
  const pct    = ev.totalTickets > 0 ? Math.round((ev.ticketsSold/ev.totalTickets)*100) : 0;
  const rev    = Math.round(ev.ticketsSold * ev.price * 0.95);
  const ringColor = pct > 80 ? CHART.red : CHART.orange;

  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="bg-brand-card rounded-2xl border border-brand-hairline hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow overflow-hidden cursor-pointer min-w-[220px] w-full">
      <div className="h-[140px] relative overflow-hidden">
        <img src={ev.image} alt={ev.name} onError={e => { e.target.src = catImg.other; }} className="w-full h-full object-cover object-top block" />

        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="bg-brand-text text-white text-xs font-medium px-2 py-1 rounded-full">{ev.category.toUpperCase()}</span>
          {isFree && <span className="bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded-full">FREE</span>}
        </div>

        {!ev.isApproved ? (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500">
            <Clock size={9} weight="light" className="text-white" />
            <span className="text-xs font-medium text-white">PENDING</span>
          </div>
        ) : (
          <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full ${ev.salesOpen ? "bg-emerald-600" : "bg-gray-500"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs font-medium text-white">{ev.salesOpen ? "LIVE" : "CLOSED"}</span>
          </div>
        )}
      </div>

      <div className="p-3.5 pb-4">
        <div className="font-medium text-[13px] text-brand-text mb-0.5 truncate">{ev.name}</div>
        <div className="flex items-center gap-1 text-xs text-brand-muted mb-3 tabular-nums truncate">
          <Calendar size={10} weight="light" /> {formatDate(ev.date)} · <MapPin size={10} weight="light" /> {ev.city}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`text-[17px] font-semibold tracking-tight tabular-nums leading-none ${isFree ? "text-emerald-700" : "text-brand-accent"}`}>
              {isFree ? `${(ev.regs||ev.ticketsSold).toLocaleString()} reg` : `${ev.currency} ${rev.toLocaleString()}`}
            </div>
            <div className="text-xs text-brand-muted mt-1 tabular-nums">{ev.ticketsSold}/{ev.totalTickets} · {pct}% full</div>
          </div>
          <div className="relative flex items-center justify-center">
            <Ring pct={pct} size={44} color={ringColor} />
            <span className={`absolute text-xs font-medium tabular-nums ${pctColorClass(pct)}`}>{pct}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityFeed({ events }) {
  const [feed,    setFeed]    = useState([]);
  const [loading, setLoading] = useState(true);

  const typeConfig = {
    sale:        { Icon: Ticket,    color: "text-emerald-700", bg: "bg-emerald-50", label: "Ticket purchased" },
    resale_sale: { Icon: ArrowsClockwise, color: "text-blue-700",  bg: "bg-blue-50",  label: "Resale sale" },
    withdrawal:  { Icon: Wallet,    color: "text-brand-accent",  bg: "bg-[var(--brand-light)]", label: "Withdrawal" },
    refund:      { Icon: ArrowsClockwise, color: "text-red-600",       bg: "bg-red-50",        label: "Refund" },
    fee:         { Icon: Bank,  color: "text-brand-muted",   bg: "bg-brand-hairline",      label: "Platform fee" },
  };

  const timeAgo = (iso) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins   = Math.floor(diffMs / 60000);
    if (mins < 1)   return "just now";
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

 const fetchActivity = () => {
  const token = localStorage.getItem("access_token") || "";
  fetch("https://master-events-backend.onrender.com/api/payments/organizer-activity/", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => { if (Array.isArray(data.transactions)) setFeed(data.transactions); setLoading(false); })
    .catch(() => setLoading(false));
};

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        <span className="text-xs font-medium text-emerald-700 tracking-widest">LIVE ACTIVITY</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "48px", borderRadius: "10px" }} />)}
        </div>
      ) : feed.length === 0 ? (
        <div className="p-6 text-center text-brand-muted text-sm">Activity will appear here as tickets sell</div>
      ) : (
        <AnimatePresence initial={false}>
          {feed.map(item => {
            const cfg = typeConfig[item.type] || typeConfig.fee;
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                className="flex items-center gap-2.5 py-2.5 border-b border-brand-hairline last:border-b-0">
                <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <cfg.Icon size={14} weight="light" className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-brand-text truncate">{cfg.label}</div>
                  <div className="text-xs text-brand-muted truncate">{item.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-brand-text tabular-nums">
                    {item.type === "withdrawal" ? "-" : "+"}GHS {item.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-brand-muted mt-0.5">{timeAgo(item.created_at)}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}

function FillChart({ events }) {
  if (!events.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {events.map(e => {
        const pct = e.totalTickets > 0 ? Math.round((e.ticketsSold/e.totalTickets)*100) : 0;
        const barClass  = pct >= 85 ? "bg-red-600" : pct >= 55 ? "bg-brand-accent" : "bg-emerald-600";
        const textClass = pct >= 85 ? "text-red-600" : pct >= 55 ? "text-brand-accent" : "text-emerald-700";
        return (
          <div key={e.id}>
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${e.event_type==="free" ? "text-emerald-700 bg-emerald-50" : "text-brand-accent bg-[var(--brand-light)]"}`}>
                  {e.event_type==="free" ? "FREE" : e.currency}
                </span>
                <span className="text-xs font-medium text-brand-text truncate">{e.name}</span>
              </div>
              <span className={`text-xs font-medium tabular-nums shrink-0 ml-2 ${textClass}`}>{pct}%</span>
            </div>
            <div className="h-[5px] bg-brand-hairline rounded-full overflow-hidden">
              <motion.div initial={{ width:0 }} animate={{ width:`${Math.max(1,pct)}%` }} transition={{ duration:0.7, ease:"easeOut" }}
                className={`h-full rounded-full ${barClass}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Panel({ children, className = "" }) {
  return <div className={`bg-brand-card border border-brand-hairline rounded-2xl p-5 ${className}`}>{children}</div>;
}

function SectionHead({ label, title, action }) {
  return (
    <div className="flex justify-between items-end mb-4.5 mb-5">
      <div>
        {label && <div className="text-xs font-medium text-brand-accent tracking-widest mb-1">{label}</div>}
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-brand-text m-0">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EventRow({ ev, onClick }) {
  const pct    = ev.totalTickets > 0 ? Math.round((ev.ticketsSold/ev.totalTickets)*100) : 0;
  const isFree = ev.event_type === "free";
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} onClick={onClick}
      className={`bg-brand-card border rounded-2xl overflow-hidden cursor-pointer transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex ${tab() ? "flex-row" : "flex-col"} ${!ev.isApproved ? "border-amber-200" : "border-brand-hairline"}`}>
      <div className={`relative shrink-0 ${tab() ? "w-40 h-auto min-h-[80px]" : "w-full h-[120px]"}`}>
        <img src={ev.image} alt={ev.name} onError={e=>{e.target.src=catImg.other}} className="w-full h-full object-cover object-top block" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="bg-brand-text text-white text-xs font-medium px-1.5 py-0.5 rounded">NFT</span>
          {isFree && <span className="bg-emerald-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">FREE</span>}
        </div>
        {!ev.isApproved ? (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-white bg-amber-500">
            <Clock size={8} weight="light" /> PENDING
          </div>
        ) : (
          <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${ev.salesOpen ? "bg-emerald-600" : "bg-gray-500"}`}>
            <span className="w-1 h-1 rounded-full bg-white" /> {ev.salesOpen ? "LIVE" : "CLOSED"}
          </div>
        )}
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="text-xs font-medium text-brand-muted uppercase tracking-wide mb-1">{ev.category} · {ev.country}</div>
          <div className="text-[15px] font-medium text-brand-text tracking-tight mb-1 truncate">{ev.name}</div>
          <div className="flex items-center gap-1 text-xs text-brand-muted mb-3 tabular-nums">
            <MapPin size={11} weight="light" /> {ev.venue} · <Calendar size={11} weight="light" /> {formatDate(ev.date)}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[13px] font-medium text-emerald-700 tabular-nums">
              {isFree ? `${(ev.regs||ev.ticketsSold).toLocaleString()} registered` : `${ev.currency} ${Math.round(ev.ticketsSold*ev.price*0.95).toLocaleString()}`}
            </span>
            <span className="text-xs text-brand-muted tabular-nums">{ev.ticketsSold}/{ev.totalTickets} · {pct}%</span>
          </div>
          <div className="h-1 bg-brand-hairline rounded-full overflow-hidden">
            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.7, ease:"easeOut" }}
              className={`h-full rounded-full ${pctBarClass(pct)}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function OrganizerHome() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setScreen          = useStore(s => s.setScreen);
  const setActiveTab       = useStore(s => s.setActiveTab);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser        = useStore(s => s.currentUser);
  const [loading,   setLoading]   = useState(true);
  const [isDesk,    setIsDesk]    = useState(desk());
  const [statsView, setStatsView] = useState("all");
  const [dropOpen,  setDropOpen]  = useState(false);

  useEffect(() => {
    eventsAPI.myEvents()
      .then(d => { if (Array.isArray(d)) setOrgEvents(d.map(mapEvent)); setLoading(false); })
      .catch(() => setLoading(false));
    const r = () => setIsDesk(desk());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const src = statsView === "all"
    ? orgEvents
    : orgEvents.filter(e => String(e.id) === String(statsView));

  const paid    = src.filter(e => e.event_type !== "free");
  const free    = src.filter(e => e.event_type === "free");
  const revenue = paid.reduce((s,e) => s + e.ticketsSold * e.price * 0.95, 0);
  const sold    = paid.reduce((s,e) => s + e.ticketsSold, 0);
  const regs    = free.reduce((s,e) => s + (e.regs||e.ticketsSold), 0);
  const live    = orgEvents.filter(e => e.salesOpen).length;
  const pendingReview = orgEvents.filter(e => !e.isApproved).length;
  const avgPrice = paid.length ? Math.round(paid.reduce((s,e)=>s+e.price,0)/paid.length) : 0;

  const revSpark  = Array.from({length:7}, (_,i) => Math.max(0, revenue*(0.4+Math.random()*0.7)*(i+1)/8));
  const soldSpark = Array.from({length:7}, (_,i) => Math.max(0, sold*(0.3+Math.random()*0.8)*(i+1)/8));

  const selectedEvent = statsView !== "all" ? orgEvents.find(e => String(e.id) === String(statsView)) : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="bg-brand-canvas min-h-full font-sans" onClick={() => setDropOpen(false)}>
      <div className="max-w-[1000px] mx-auto" style={{ padding: isDesk ? "28px 40px 80px" : "16px 16px 100px" }}>

        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs text-brand-muted mb-1 tracking-wide">ORGANIZER DASHBOARD</p>
            <h1 className={`font-semibold text-brand-text tracking-tight mb-0.5 ${isDesk ? "text-2xl" : "text-xl"}`}>
              {isDesk ? `${greeting}, ${currentUser?.first_name}` : `Hi ${currentUser?.first_name}`}
            </h1>
            <p className="text-[13px] text-brand-muted m-0 tabular-nums">
              {orgEvents.length} event{orgEvents.length!==1?"s":""} · {live} live · {orgEvents.reduce((s,e)=>s+e.ticketsSold,0).toLocaleString()} tickets sold
            </p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <div className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-brand-hairline text-brand-accent" style={{ background: "var(--brand-light)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-medium">POLYGON</span>
            </div>
            {isDesk && (
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
                className="flex items-center gap-1.5 px-4 h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium transition-colors">
                <Plus size={14} weight="light" /> Create Event
              </motion.button>
            )}
          </div>
        </div>

        {!loading && pendingReview > 0 && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 mb-5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} weight="light" className="text-amber-700" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-amber-800">
                {pendingReview} event{pendingReview > 1 ? "s" : ""} pending review
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                New events are reviewed before going live to keep the platform safe for attendees. This usually doesn't take long.
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="skeleton" style={{ height: "220px", borderRadius: "28px", marginBottom: "24px" }} />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2.5 flex-wrap">
              <div className="text-xs font-semibold text-brand-muted">VIEWING STATS FOR:</div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <motion.button whileTap={{ scale:0.97 }} onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 bg-brand-card border rounded-xl cursor-pointer text-[13px] font-semibold text-brand-text transition-colors ${dropOpen ? "border-brand-accent" : "border-brand-hairline"}`}>
                  <span className={`w-2 h-2 rounded-full ${statsView === "all" ? "bg-brand-accent" : "bg-emerald-600"}`} />
                  {statsView === "all" ? "All Events" : selectedEvent?.name || "Select event"}
                  {dropOpen ? <CaretUp size={13} className="text-brand-muted" /> : <CaretDown size={13} className="text-brand-muted" />}
                </motion.button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                      className="absolute top-[calc(100%+6px)] left-0 min-w-[220px] bg-brand-card border border-brand-hairline rounded-2xl z-[100] overflow-hidden">
                      {[{ id:"all", name:"All Events" }, ...orgEvents].map(e => (
                        <div key={e.id} onClick={() => { setStatsView(String(e.id)); setDropOpen(false); }}
                          className={`flex items-center gap-2 px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-[var(--brand-light)] ${String(statsView)===String(e.id) ? "bg-[var(--brand-light)]" : ""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${String(statsView)===String(e.id) ? "bg-brand-accent" : "bg-gray-200"}`} />
                          <span className={`text-[13px] text-brand-text truncate ${String(statsView)===String(e.id) ? "font-semibold" : "font-normal"}`}>{e.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-brand-accent rounded-2xl p-6 md:p-7 mb-4">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-5">
                <div>
                  <div className="text-xs font-medium text-white/60 tracking-widest mb-2">TOTAL REVENUE · 95% PAYOUT</div>
                  <div className="text-3xl font-semibold text-white tracking-tight tabular-nums leading-none">
                    GHS {Math.round(revenue).toLocaleString()}
                  </div>
                  <div className="text-[13px] text-white/60 mt-2 tabular-nums">
                    {sold.toLocaleString()} paid tickets · {regs.toLocaleString()} free registrations
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Sparkline data={revSpark} color="#ffffff" height={40} width={100} />
                  <div className="text-xs text-white/50">7-day trend</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                {[
                  { label:"TICKETS SOLD",     value: sold.toLocaleString(),              sub:"paid tickets" },
                  { label:"AVG TICKET PRICE", value: avgPrice ? `GHS ${avgPrice}` : "—", sub:"across paid events" },
                  { label:"LIVE NOW",         value: live,                               sub:`of ${orgEvents.length} total` },
                ].map(m => (
                  <div key={m.label}>
                    <div className="text-xs font-medium text-white/60 tracking-wide mb-1">{m.label}</div>
                    <div className="text-xl font-semibold text-white tracking-tight tabular-nums">{m.value}</div>
                    <div className="text-xs text-white/50 mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {orgEvents.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3.5">
                  <div>
                    <div className="text-xs font-medium text-brand-accent tracking-widest mb-0.5">YOUR EVENTS</div>
                    <div className="text-[15px] font-medium text-brand-text tracking-tight">Event Portfolio</div>
                  </div>
                  {!isDesk && (
                    <motion.button whileTap={{ scale:0.96 }} onClick={() => setScreen("addEvent")}
                      className="flex items-center gap-1 px-3.5 h-8 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium transition-colors">
                      <Plus size={12} weight="light" /> New
                    </motion.button>
                  )}
                </div>

                {isDesk ? (
                  <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
                    {orgEvents.map((ev,i) => (
                      <motion.div key={ev.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                        <EventCard ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth:"none" }}>
                    {orgEvents.map((ev,i) => (
                      <motion.div key={ev.id} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                        className="min-w-[200px] w-[200px] shrink-0">
                        <EventCard ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isDesk && orgEvents.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Panel>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-xs font-semibold text-brand-muted tracking-widest mb-0.5">CAPACITY FILL RATE</div>
                      <div className="text-[15px] font-medium text-brand-text">Ticket Progress</div>
                    </div>
                    <button onClick={() => dlCSV(orgEvents)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-transparent border border-brand-hairline rounded-xl text-brand-muted text-xs hover:border-gray-300 transition-colors">
                      <DownloadSimple size={11} weight="light" /> Export CSV
                    </button>
                  </div>
                  <FillChart events={src} />
                </Panel>
                <Panel>
                  <div className="text-xs font-semibold text-brand-muted tracking-widest mb-0.5">PAYOUT SPLIT</div>
                  <div className="text-[15px] font-medium text-brand-text mb-4">Earnings Breakdown</div>
                  {[
                    { label:"You (95%)",     val:Math.round(revenue),        color:"text-emerald-700", bar:"bg-emerald-600", w:"95%" },
                    { label:"Platform (5%)", val:Math.round(revenue*0.053),  color:"text-red-600",       bar:"bg-red-600",       w:"5%"  },
                  ].map(r => (
                    <div key={r.label} className="mb-3.5">
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-xs font-medium ${r.color}`}>{r.label}</span>
                        <span className={`text-xs font-medium tabular-nums ${r.color}`}>GHS {r.val.toLocaleString()}</span>
                      </div>
                      <div className="h-[5px] bg-brand-hairline rounded-full overflow-hidden">
                        <motion.div initial={{ width:0 }} animate={{ width:r.w }} transition={{ duration:1 }} className={`h-full rounded-full ${r.bar}`} />
                      </div>
                    </div>
                  ))}
                  <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => { setActiveTab("wallet"); setScreen("app"); }}
                    className="w-full h-11 mt-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Wallet size={14} weight="light" /> Withdraw Earnings
                  </motion.button>
                </Panel>
              </div>
            )}

            {isDesk && orgEvents.length > 0 && (
              <Panel className="mb-4">
                <div className="text-xs font-semibold text-brand-muted tracking-widest mb-0.5">TRANSACTIONS</div>
                <div className="text-[15px] font-medium text-brand-text mb-1">Live Activity</div>
                <ActivityFeed events={orgEvents} />
              </Panel>
            )}

            {!isDesk && orgEvents.length > 0 && (
              <div className="flex flex-col gap-3.5 mb-4">
                <Panel>
                  <div className="text-xs font-semibold text-brand-muted tracking-widest mb-3">FILL RATE</div>
                  <FillChart events={src} />
                </Panel>
                <Panel>
                  <div className="text-xs font-semibold text-brand-muted tracking-widest mb-1">LIVE ACTIVITY</div>
                  <ActivityFeed events={orgEvents} />
                </Panel>
              </div>
            )}

            {orgEvents.length === 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="text-center py-16 px-8 bg-brand-card rounded-2xl border border-brand-hairline">
                <div className="w-14 h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
                  <Ticket size={26} weight="light" className="text-brand-accent" />
                </div>
                <div className="text-[17px] font-medium text-brand-text mb-2">No events yet</div>
                <div className="text-[13px] text-brand-muted mb-5">Create your first event to start selling NFT-verified tickets on Polygon</div>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
                  className="inline-flex items-center justify-center gap-1.5 px-6 h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium transition-colors">
                  <Plus size={14} weight="light" /> Create Your First Event
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function OrganizerEvents() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen          = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [isDesk,  setIsDesk]  = useState(desk());

  useEffect(() => {
    eventsAPI.myEvents().then(d => { if (Array.isArray(d)) setOrgEvents(d.map(mapEvent)); setLoading(false); }).catch(() => setLoading(false));
    const r = () => setIsDesk(desk());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const filtered = filter==="all" ? orgEvents : filter==="pending" ? orgEvents.filter(e=>!e.isApproved) : filter==="free" ? orgEvents.filter(e=>e.event_type==="free") : filter==="paid" ? orgEvents.filter(e=>e.event_type!=="free") : orgEvents.filter(e=>e.salesOpen);
  const PAD = isDesk ? "28px 40px 80px" : "16px 16px 100px";
  const pendingCount = orgEvents.filter(e => !e.isApproved).length;

  return (
    <div className="bg-brand-canvas min-h-full font-sans">
      <div className="max-w-[900px] mx-auto" style={{ padding: PAD }}>
        <SectionHead label="MY EVENTS" title="Events"
          action={<motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
            className="flex items-center justify-center gap-1.5 px-4 h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium transition-colors">
            <Plus size={14} weight="light" /> New Event
          </motion.button>} />
        <div className="flex gap-1 mb-5 bg-brand-card p-1 rounded-xl border border-brand-hairline w-fit">
          {[["all","All"],["paid","Paid"],["free","Free"],["live","Live"],
            ...(pendingCount > 0 ? [["pending", `Pending (${pendingCount})`]] : [])
          ].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter===v ? "bg-brand-accent text-white" : "bg-transparent text-brand-muted hover:text-brand-text"}`}>
              {l}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex flex-col gap-2.5">{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:"100px", borderRadius:"16px" }} />)}</div>
        ) : filtered.length===0 ? (
          <Panel className="text-center py-14">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-3">
              <Ticket size={22} weight="light" className="text-brand-accent" />
            </div>
            <div className="text-[15px] font-semibold text-brand-text mb-1.5">No events found</div>
            <div className="text-[13px] text-brand-muted">Try a different filter</div>
          </Panel>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map(ev=><EventRow key={ev.id} ev={ev} onClick={()=>{setViewingOrgEvent(ev);setScreen("orgEventDetail");}} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrganizerAlerts() {
  const orgEvents = useStore(s => s.orgEvents);
  const [isDesk, setIsDesk] = useState(desk());
  useEffect(() => { const r=()=>setIsDesk(desk()); window.addEventListener("resize",r); return ()=>window.removeEventListener("resize",r); }, []);
  const revenue = orgEvents.reduce((s,e)=>s+e.ticketsSold*e.price*0.95,0);
  const sold    = orgEvents.reduce((s,e)=>s+e.ticketsSold,0);
  const alerts  = orgEvents.length > 0 ? [
    { Icon: Link,  color:"text-brand-text", bg:"bg-brand-hairline",     title:"NFT Tickets Active on Polygon", body:`${sold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length>1?"s":""}. Immutable on-chain.`, time:"LIVE" },
    { Icon: Wallet, color:"text-emerald-700", bg:"bg-emerald-50", title:"Revenue Summary", body:`GHS ${Math.round(revenue).toLocaleString()} generated at 95% payout. Withdrawable to MoMo anytime.`, time:"NOW" },
    { Icon: Globe,  color:"text-blue-700",  bg:"bg-blue-50",  title:"Global Payments Active", body:"MTN MoMo, Paystack, and international card payments are live on all your events.", time:"ACTIVE" },
    { Icon: Lock,   color:"text-brand-accent",  bg:"bg-[var(--brand-light)]", title:"HMAC QR Security", body:"All tickets use rotating HMAC-SHA256 QR codes refreshing every 10 seconds. Screenshot-proof.", time:"ALWAYS" },
  ] : [{ Icon: Bell, color:"text-brand-accent", bg:"bg-[var(--brand-light)]", title:"No alerts yet", body:"Create an event and sell tickets to see real-time alerts here.", time:"NOW" }];
  return (
    <div className="bg-brand-canvas min-h-full font-sans">
      <div className="max-w-[900px] mx-auto" style={{ padding: isDesk ? "28px 40px 80px" : "16px 16px 100px" }}>
        <SectionHead label="NOTIFICATIONS" title="Alerts" />
        <div className={`flex flex-col gap-2 ${isDesk ? "max-w-[600px]" : "w-full"}`}>
          {alerts.map((a,i) => (
            <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} whileHover={{ y:-1 }}
              className="bg-brand-card rounded-2xl p-4 flex gap-3.5 items-start border border-brand-hairline transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                <a.Icon size={16} weight="light" className={a.color} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-brand-text mb-1">{a.title}</div>
                <div className="text-xs text-brand-muted leading-relaxed mb-2">{a.body}</div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${a.color} ${a.bg}`}>{a.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddEvent() {
  const addEventForm    = useStore(s => s.addEventForm);
  const setAddEventForm = useStore(s => s.setAddEventForm);
  const handleAddEvent  = useStore(s => s.handleAddEvent);
  const setScreen       = useStore(s => s.setScreen);

  const [imgType,    setImgType]    = useState("upload");
  const [evType,     setEvType]     = useState("paid");
  const [currency,   setCurrency]   = useState("GHS");
  const [country,    setCountry]    = useState("Ghana");
  const [errors,     setErrors]     = useState({});
  const [isDesk,     setIsDesk]     = useState(desk());
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [eventDates, setEventDates] = useState([]);
  const [newDate,    setNewDate]    = useState("");

  const [useTiers,    setUseTiers]    = useState(false);
  const [tiers,       setTiers]       = useState([]);
  const [newTierType, setNewTierType] = useState("regular");
  const [newTierName, setNewTierName] = useState("");
  const [newTierPrice,setNewTierPrice]= useState("");
  const [newTierCap,  setNewTierCap]  = useState("");

  useEffect(() => {
    const r = () => setIsDesk(desk());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const slug     = (addEventForm.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const eventUrl = slug ? `https://masterevents.events/events/${slug}` : "https://masterevents.events/events/your-event";

  const addDate    = () => { if (!newDate) return; if (eventDates.find(d => d.date === newDate)) return; setEventDates(prev => [...prev, { date:newDate, capacity:addEventForm.totalTickets||100, price:evType==="free"?0:(addEventForm.price||0) }].sort((a,b)=>a.date.localeCompare(b.date))); setNewDate(""); };
  const removeDate = (date) => setEventDates(prev => prev.filter(d => d.date !== date));
  const updateDate = (date, field, value) => setEventDates(prev => prev.map(d => d.date===date?{...d,[field]:value}:d));

  const addTier = () => {
    const label = newTierType === "custom" ? (newTierName.trim() || "Custom") : TIER_PRESETS.find(t => t.key === newTierType)?.label || "Tier";
    if (!newTierPrice || !newTierCap) return;
    setTiers(prev => [...prev, {
      id: Date.now(),
      key: newTierType,
      name: label,
      price: newTierPrice,
      capacity: newTierCap,
    }]);
    setNewTierType("regular"); setNewTierName(""); setNewTierPrice(""); setNewTierCap("");
  };
  const removeTier = (id) => setTiers(prev => prev.filter(t => t.id !== id));
  const tierTotalCapacity = tiers.reduce((s,t) => s + (parseInt(t.capacity)||0), 0);

  const validate = () => {
    const e = {};
    if (!addEventForm.name?.trim())                              e.name  = "Required";
    if (!isMultiDay && !addEventForm.date)                       e.date  = "Required";
    if (isMultiDay && eventDates.length < 2)                     e.dates = "Add at least 2 dates";
    if (!addEventForm.venue?.trim())                             e.venue = "Required";
    if (!useTiers && !addEventForm.totalTickets)                 e.total = "Required";
    if (evType === "paid" && useTiers && tiers.length < 1)       e.tiers = "Add at least one ticket tier";
    if (!addEventForm.category)                                  e.cat   = "Select a category";
    if (evType === "paid" && !isMultiDay && !useTiers && !addEventForm.price) e.price = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) return;

    const form = {
      ...addEventForm,
      event_type: evType,
      currency,
      country,
      price: evType === "free" ? 0 : addEventForm.price,
    };

    if (isMultiDay) {
      form.is_multi_day = true;
      form.event_dates  = eventDates;
      form.date          = eventDates[0]?.date || "";
    }

    if (evType === "paid" && !isMultiDay && useTiers && tiers.length) {
      const cleanTiers = [];
      for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i];
        cleanTiers.push({
          name:     String(t.name),
          price:    parseFloat(t.price)  || 0,
          capacity: parseInt(t.capacity) || 0,
        });
      }
      const safeTiers = JSON.parse(JSON.stringify(cleanTiers));
      form.ticket_tiers = safeTiers;
      form.totalTickets = tierTotalCapacity;
      form.price = Math.min(...safeTiers.map(t => t.price || Infinity));
    }

    setAddEventForm(form);
    handleAddEvent();
  };

  const chip = (active) => `px-4 py-1.5 rounded-full cursor-pointer text-[13px] font-medium border transition-colors ${
    active ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-transparent text-brand-muted"
  }`;

  const tierBadgeColor = key => key === "vvip" ? "bg-[var(--brand-light)] text-brand-accent" : key === "vip" ? "bg-blue-50 text-blue-700" : "bg-brand-hairline text-brand-muted";
  const tierIcon = key => TIER_PRESETS.find(t => t.key === key)?.Icon || Ticket;

  return (
    <div className="min-h-screen bg-brand-canvas font-sans">
      <div className="flex items-center justify-between px-6 py-3.5 bg-brand-card border-b border-brand-hairline sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-accent flex items-center justify-center">
            <Ticket size={15} weight="light" color="#fff" />
          </div>
          <span className="font-medium text-[15px] text-brand-text tracking-tight">Create Event</span>
        </div>
        <button onClick={() => setScreen("app")}
          className="flex items-center gap-1.5 border border-brand-hairline rounded-xl px-3.5 py-1.5 text-brand-muted text-[13px] font-medium hover:border-gray-300 transition-colors">
          <ArrowLeft size={13} weight="light" /> Back
        </button>
      </div>

      <div className="max-w-[800px] mx-auto" style={{ padding: isDesk ? "36px 40px 80px" : "20px 16px 80px" }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          className="bg-brand-card rounded-2xl border border-brand-hairline" style={{ padding: isDesk ? "40px 44px" : "24px 20px" }}>

          <div className="mb-6 flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
            <ShieldCheck size={15} weight="light" className="text-blue-700 shrink-0 mt-0.5" />
            <span className="text-xs text-blue-700 leading-relaxed">
              New events are reviewed before appearing publicly, to keep the platform safe for attendees. Your event will show as "Pending Review" until then.
            </span>
          </div>

          <div className="mb-7 pb-5 border-b border-brand-hairline">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-brand-text mb-1">Event Details</h1>
            <p className="text-[13px] text-brand-muted m-0">Fill in the details — NFT-verified tickets minted automatically on Polygon</p>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Event Type</label>
            <div className="flex gap-1 bg-brand-canvas rounded-xl p-1 border border-brand-hairline w-fit">
              {[{v:"paid",Icon:CreditCard,label:"Paid Event"},{v:"free",Icon:Confetti,label:"Free Event"}].map(item => (
                <button key={item.v} onClick={() => {
                    setEvType(item.v);
                    if (item.v === "free") { setUseTiers(false); setTiers([]); setErrors(p=>({...p,tiers:null})); }
                  }}
                  className={`px-5 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${evType===item.v ? "bg-brand-accent text-white" : "bg-transparent text-brand-muted"}`}>
                  <item.Icon size={14} weight="light" /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid gap-4 ${isDesk ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className={isDesk ? "col-span-2" : ""}>
              <label className={labelClass}>Event Name {errors.name && <span className="text-red-600 font-normal normal-case">— {errors.name}</span>}</label>
              <input placeholder="e.g. Afrobeats Night 2026" value={addEventForm.name||""}
                onChange={e => { setAddEventForm({...addEventForm, name:e.target.value}); setErrors(p=>({...p,name:null})); }}
                className={inputClass(errors.name)} />
            </div>

            <div className={isDesk ? "col-span-2" : ""}>
              <label className={labelClass}>Category {errors.cat && <span className="text-red-600 font-normal normal-case">— {errors.cat}</span>}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <div key={cat} onClick={() => { setAddEventForm({...addEventForm, category:cat}); setErrors(p=>({...p,cat:null})); }}
                    className={chip(addEventForm.category===cat)}>
                    {cat.charAt(0).toUpperCase()+cat.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className={isDesk ? "col-span-2" : ""}>
              <div className="flex items-center justify-between px-4 py-3.5 bg-brand-canvas rounded-xl border border-brand-hairline">
                <div>
                  <div className="text-sm font-semibold text-brand-text">Multi-day event</div>
                  <div className="text-xs text-brand-muted mt-0.5">Add multiple dates with per-day capacity and price</div>
                </div>
                <div onClick={() => { setIsMultiDay(!isMultiDay); setErrors(p=>({...p,date:null,dates:null})); }}
                  className={`w-[46px] h-[26px] rounded-full relative cursor-pointer transition-colors shrink-0 ${isMultiDay ? "bg-brand-accent" : "bg-gray-200"}`}>
                  <motion.div animate={{ x: isMultiDay?21:2 }} transition={{ duration:0.2 }}
                    className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>

            {!isMultiDay && (
              <>
                <div>
                  <label className={labelClass}>Date {errors.date && <span className="text-red-600 font-normal normal-case">— {errors.date}</span>}</label>
                  <input type="date" value={addEventForm.date||""}
                    onChange={e => { setAddEventForm({...addEventForm, date:e.target.value}); setErrors(p=>({...p,date:null})); }}
                    className={inputClass(errors.date)} />
                </div>
                <div>
                  <label className={labelClass}>Time (optional)</label>
                  <input type="time" value={addEventForm.time||""} onChange={e => setAddEventForm({...addEventForm, time:e.target.value})}
                    className={inputClass(false)} />
                </div>
              </>
            )}

            {isMultiDay && (
              <div className={isDesk ? "col-span-2" : ""}>
                <label className={labelClass}>Event Dates {errors.dates && <span className="text-red-600 font-normal normal-case">— {errors.dates}</span>}</label>
                <div className="flex gap-2 mb-3">
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={`${inputClass(false)} flex-1`} />
                  <button onClick={addDate}
                    className="px-5 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl shrink-0 flex items-center justify-center transition-colors">
                    <Plus size={18} weight="light" />
                  </button>
                </div>
                <AnimatePresence>
                  {eventDates.map((d,i) => (
                    <motion.div key={d.date} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                      className="bg-[var(--brand-light)] border border-brand-accent/25 rounded-xl p-3.5 mb-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-brand-text">
                          <Calendar size={13} weight="light" /> Day {i+1} — {new Date(d.date+"T00:00:00").toLocaleDateString("en-GH",{weekday:"short",month:"short",day:"numeric"})}
                        </div>
                        <button onClick={() => removeDate(d.date)} className="bg-red-50 text-red-600 rounded-xl px-2.5 py-1 text-xs font-semibold">Remove</button>
                      </div>
                      <div className={`grid gap-2.5 ${evType==="paid" ? "grid-cols-2" : "grid-cols-1"}`}>
                        <div>
                          <label className="text-xs font-semibold text-brand-muted block mb-1 uppercase">Tickets / Spots</label>
                          <input type="number" placeholder="e.g. 200" value={d.capacity} onChange={e => updateDate(d.date,"capacity",e.target.value)} className={inputClass(false)} />
                        </div>
                        {evType==="paid" && (
                          <div>
                            <label className="text-xs font-semibold text-brand-muted block mb-1 uppercase">Price ({currency})</label>
                            <input type="number" placeholder="e.g. 150" value={d.price} onChange={e => updateDate(d.date,"price",e.target.value)} className={inputClass(false)} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {eventDates.length===0 && (
                  <div className="text-center py-5 text-brand-muted text-[13px] border-2 border-dashed border-brand-hairline rounded-xl">Pick a date above and tap + to add it</div>
                )}
                {eventDates.length>=2 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-xl mt-1.5">
                    <CheckCircle size={13} weight="light" /> {eventDates.length} days added — attendees will choose which day(s) to attend
                  </div>
                )}
              </div>
            )}

            <div className={isDesk ? "col-span-2" : ""}>
              <label className={labelClass}>Venue {errors.venue && <span className="text-red-600 font-normal normal-case">— {errors.venue}</span>}</label>
              <input placeholder="e.g. Accra Sports Stadium" value={addEventForm.venue||""}
                onChange={e => { setAddEventForm({...addEventForm, venue:e.target.value}); setErrors(p=>({...p,venue:null})); }}
                className={inputClass(errors.venue)} />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input placeholder="e.g. Accra" value={addEventForm.city||""} onChange={e => setAddEventForm({...addEventForm, city:e.target.value})} className={inputClass(false)} />
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className={inputClass(false)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {!isMultiDay && evType === "paid" && (
              <div className={isDesk ? "col-span-2" : ""}>
                <div className="flex items-center justify-between px-4 py-3.5 bg-brand-canvas rounded-xl border border-brand-hairline">
                  <div>
                    <div className="text-sm font-semibold text-brand-text flex items-center gap-1.5">
                      <Crown size={14} weight="light" className="text-brand-accent" /> Multiple ticket types
                    </div>
                    <div className="text-xs text-brand-muted mt-0.5">VIP, VVIP, Regular — each with its own price and capacity</div>
                  </div>
                  <div onClick={() => { setUseTiers(!useTiers); setErrors(p=>({...p,total:null,price:null,tiers:null})); }}
                    className={`w-[46px] h-[26px] rounded-full relative cursor-pointer transition-colors shrink-0 ${useTiers ? "bg-brand-accent" : "bg-gray-200"}`}>
                    <motion.div animate={{ x: useTiers?21:2 }} transition={{ duration:0.2 }}
                      className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow" />
                  </div>
                </div>
              </div>
            )}

            {!isMultiDay && evType === "paid" && useTiers && (
              <div className={isDesk ? "col-span-2" : ""}>
                <label className={labelClass}>Ticket Tiers {errors.tiers && <span className="text-red-600 font-normal normal-case">— {errors.tiers}</span>}</label>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 mb-3 flex items-start gap-2">
                  <CheckCircle size={13} weight="light" className="text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-700 leading-relaxed">
                    Each tier is saved as its own capacity-tracked ticket type — attendees will see a tier picker on the event's public page to choose Regular, VIP, or VVIP at checkout.
                  </span>
                </div>

                <div className="bg-brand-canvas border border-brand-hairline rounded-xl p-3.5 mb-3">
                  <div className="flex gap-1.5 mb-2.5 flex-wrap">
                    {TIER_PRESETS.map(t => (
                      <button key={t.key} onClick={() => setNewTierType(t.key)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${newTierType===t.key ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-brand-card text-brand-muted"}`}>
                        <t.Icon size={12} weight="light" /> {t.label}
                      </button>
                    ))}
                  </div>
                  {newTierType === "custom" && (
                    <input placeholder="Tier name, e.g. Table for 4" value={newTierName} onChange={e => setNewTierName(e.target.value)}
                      className={`${inputClass(false)} mb-2.5`} />
                  )}
                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className="text-xs font-semibold text-brand-muted block mb-1 uppercase">Price ({currency})</label>
                      <input type="number" placeholder="e.g. 300" value={newTierPrice} onChange={e => setNewTierPrice(e.target.value)} className={inputClass(false)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-muted block mb-1 uppercase">Capacity</label>
                      <input type="number" placeholder="e.g. 50" value={newTierCap} onChange={e => setNewTierCap(e.target.value)} className={inputClass(false)} />
                    </div>
                  </div>
                  <button onClick={addTier}
                    className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Plus size={14} weight="light" /> Add Tier
                  </button>
                </div>

                <AnimatePresence>
                  {tiers.map(t => {
                    const Icon = tierIcon(t.key);
                    return (
                      <motion.div key={t.id} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                        className="flex items-center justify-between bg-brand-card border border-brand-hairline rounded-xl px-3.5 py-2.5 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tierBadgeColor(t.key)}`}>
                            <Icon size={15} weight="light" />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-brand-text truncate">{t.name}</div>
                            <div className="text-xs text-brand-muted">{currency} {t.price} · {t.capacity} tickets</div>
                          </div>
                        </div>
                        <button onClick={() => removeTier(t.id)} className="text-red-600 bg-red-50 rounded-xl px-2.5 py-1 text-xs font-semibold shrink-0 ml-2">Remove</button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {tiers.length === 0 && (
                  <div className="text-center py-5 text-brand-muted text-[13px] border-2 border-dashed border-brand-hairline rounded-xl">Add your first ticket tier above</div>
                )}
                {tiers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-xl mt-1.5">
                    <CheckCircle size={13} weight="light" /> {tiers.length} tier{tiers.length>1?"s":""} · {tierTotalCapacity} total tickets
                  </div>
                )}
              </div>
            )}

            {!isMultiDay && !(evType === "paid" && useTiers) && (
              <>
                <div>
                  <label className={labelClass}>{evType==="free"?"Total Spots":"Total Tickets"}{errors.total && <span className="text-red-600 font-normal normal-case"> — {errors.total}</span>}</label>
                  <input type="number" placeholder="e.g. 500" value={addEventForm.totalTickets||""}
                    onChange={e => { setAddEventForm({...addEventForm, totalTickets:e.target.value}); setErrors(p=>({...p,total:null})); }}
                    className={inputClass(errors.total)} />
                </div>
                {evType==="paid" && (
                  <div>
                    <label className={labelClass}>Price ({currency}) {errors.price && <span className="text-red-600 font-normal normal-case">— {errors.price}</span>}</label>
                    <input type="number" placeholder="e.g. 150" value={addEventForm.price||""}
                      onChange={e => { setAddEventForm({...addEventForm, price:e.target.value}); setErrors(p=>({...p,price:null})); }}
                      className={inputClass(errors.price)} />
                  </div>
                )}
              </>
            )}

            {evType==="paid" && (
              <div className={isDesk ? "col-span-2" : ""}>
                <label className={labelClass}>Currency</label>
                <div className="flex gap-2 flex-wrap">
                  {CURRENCIES.map(c => (
                    <button key={c.code} onClick={() => setCurrency(c.code)}
                      className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors ${currency===c.code ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-transparent text-brand-muted"}`}>
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={isDesk ? "col-span-2" : ""}>
              <label className={labelClass}>Description</label>
              <textarea placeholder="Tell people about your event..." value={addEventForm.description||""} onChange={e => setAddEventForm({...addEventForm, description:e.target.value})}
                rows={4} className={`${inputClass(false)} resize-y min-h-[96px]`} />
            </div>

            <div className={isDesk ? "col-span-2" : ""}>
              <label className={labelClass}>Cover Image</label>
              <div className="flex gap-2 mb-2.5">
                {[["upload",Camera,"Upload"],["url",Link,"URL"]].map(([v,Icon,l]) => (
                  <div key={v} onClick={() => setImgType(v)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-center cursor-pointer text-[13px] font-semibold border transition-colors ${imgType===v ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-transparent text-brand-muted"}`}>
                    <Icon size={14} weight="light" /> {l}
                  </div>
                ))}
              </div>
              {imgType==="upload" ? (
                <>
                  <input type="file" accept="image/jpeg,image/png,image/webp" id="ev-img" className="hidden"
                    onChange={e => {
                      const f=e.target.files[0]; if(!f) return;
                      const cv=document.createElement("canvas"); const im=new Image();
                      const u=URL.createObjectURL(f);
                      im.onload=()=>{ const M=1200; let w=im.width,h=im.height; if(w>M){h=Math.round(h*M/w);w=M;} cv.width=w;cv.height=h; cv.getContext("2d").drawImage(im,0,0,w,h); setAddEventForm({...addEventForm,image:cv.toDataURL("image/jpeg",0.82)}); URL.revokeObjectURL(u); }; im.src=u;
                    }} />
                  <label htmlFor="ev-img" className="block p-7 bg-brand-canvas border-2 border-dashed border-brand-hairline rounded-xl text-center cursor-pointer">
                    {addEventForm.image?.startsWith("data:")||addEventForm.image?.startsWith("http") ? (
                      <>
                        <img src={addEventForm.image} alt="preview" className="w-full h-40 object-cover object-top rounded-xl mb-2" />
                        <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-[13px] font-semibold"><CheckCircle size={14} weight="light" /> Image ready — click to change</div>
                      </>
                    ) : (
                      <>
                        <Camera size={26} weight="light" className="text-brand-muted mx-auto mb-2" />
                        <div className="text-brand-muted text-sm mb-1">Click to upload a cover image</div>
                        <div className="text-brand-muted text-xs opacity-60">JPG, PNG, WebP</div>
                      </>
                    )}
                  </label>
                </>
              ) : (
                <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:")?"":addEventForm.image||""} onChange={e => setAddEventForm({...addEventForm, image:e.target.value})} className={inputClass(false)} />
              )}
            </div>
          </div>

          {addEventForm.name && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-brand-text/5 border border-brand-text/15 rounded-xl px-4 py-3 mt-5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text tracking-wide mb-1"><Link size={11} weight="light" /> EVENT URL</div>
              <div className="font-mono text-xs text-brand-text break-all">{eventUrl}</div>
            </motion.div>
          )}

          <div className="flex gap-2 flex-wrap mt-5 mb-6">
            {evType==="paid" && <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium"><Wallet size={12} weight="light" /> 95% revenue to you</span>}
            {evType==="free" && <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium"><Confetti size={12} weight="light" /> Free · QR pass via email</span>}
            {isMultiDay && <span className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl font-medium"><Calendar size={12} weight="light" /> Attendees pick their day(s)</span>}
            {evType==="paid" && useTiers && tiers.length > 0 && <span className="flex items-center gap-1.5 text-xs text-brand-accent bg-[var(--brand-light)] px-3 py-1.5 rounded-xl font-medium"><Crown size={12} weight="light" /> {tiers.length} ticket tiers</span>}
            <span className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl font-medium"><Link size={12} weight="light" /> NFT on Polygon</span>
          </div>

          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={submit}
            className="w-full h-12 md:h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-[15px] transition-colors">
            Create Event
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export function OrganizerEventDetail() {
  const viewingOrgEvent    = useStore(s => s.viewingOrgEvent);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const toggleSales        = useStore(s => s.toggleSales);
  const generateDoorCode   = useStore(s => s.generateDoorCode);
  const doorStaffInvites   = useStore(s => s.doorStaffInvites);
  const setScreen          = useStore(s => s.setScreen);

  const [editing,      setEditing]      = useState(false);
  const [editForm,     setEditForm]     = useState({});
  const [editImgType,  setEditImgType]  = useState("upload");
  const [copiedCode,   setCopiedCode]   = useState(null);
  const [copiedLink,   setCopiedLink]   = useState(false);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [holders,      setHolders]      = useState([]);
  const [holderLoad,   setHolderLoad]   = useState(false);
  const [holderSearch, setHolderSearch] = useState("");
  const [isDesk,       setIsDesk]       = useState(desk());

  useEffect(() => { const r=()=>setIsDesk(desk()); window.addEventListener("resize",r); return ()=>window.removeEventListener("resize",r); }, []);

  const fetchHolders = async (eventId) => {
    if (!eventId) return;
    setHolderLoad(true);
    try {
      const token = localStorage.getItem("access_token")||"";
      const r = await fetch(`https://master-events-backend.onrender.com/api/tickets/event/${eventId}/`, { headers:{ Authorization:`Bearer ${token}` } });
      const d = await r.json();
      setHolders(Array.isArray(d)?d:[]);
    } catch { setHolders([]); } finally { setHolderLoad(false); }
  };

  useEffect(() => {
    if (viewingOrgEvent?.id) {
      setHolders([]);
      fetchHolders(viewingOrgEvent.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingOrgEvent?.id]);

  if (!viewingOrgEvent) return null;

  const ev      = viewingOrgEvent;
  const isFree  = ev.event_type === "free";
  const curr    = ev.currency || "GHS";
  const revenue = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee     = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites = doorStaffInvites[ev.id] || [];
  const pct     = ev.totalTickets > 0 ? Math.round((ev.ticketsSold/ev.totalTickets)*100) : 0;
  const cover   = ev.image || catImg[ev.category] || catImg.other;
  const evUrl   = ev.event_url || (ev.slug ? `https://masterevents.events/events/${ev.slug}` : "https://masterevents.events");
  const admittedCount = holders.filter(t => t.status === "redeemed").length;

  const onTab    = t => { setActiveTab(t); };
  const filtered = holders.filter(t => {
    if (!holderSearch) return true;
    const q = holderSearch.toLowerCase();
    return (t.owner?.first_name+" "+t.owner?.last_name).toLowerCase().includes(q) || (t.owner?.email||"").toLowerCase().includes(q) || (t.ticket_id||"").toLowerCase().includes(q);
  });
  const copyCode = c => { navigator.clipboard?.writeText(c).catch(()=>{}); setCopiedCode(c); setTimeout(()=>setCopiedCode(null),2000); };
  const copyLink = () => { navigator.clipboard?.writeText(evUrl).catch(()=>{}); setCopiedLink(true); setTimeout(()=>setCopiedLink(false),2000); };
  const startEdit = () => { setEditForm({name:ev.name,venue:ev.venue,date:ev.date,time:ev.time||"",price:ev.price,description:ev.description||"",image:ev.image||"",category:ev.category||"other",city:ev.city||"",totalTickets:ev.totalTickets,subtitle:ev.subtitle||"",currency:ev.currency||"GHS",country:ev.country||"Ghana"}); setEditing(true); };
  const saveEdit  = () => { setViewingOrgEvent({...ev,...editForm,price:parseFloat(editForm.price),totalTickets:parseInt(editForm.totalTickets)||ev.totalTickets}); setEditing(false); };

  const sClass = { active:"text-emerald-700 bg-emerald-50", redeemed:"text-gray-600 bg-brand-hairline", resale:"text-red-600 bg-red-50", transferred:"text-blue-700 bg-blue-50" };
  const sLabel = { active:"Active", redeemed:"Redeemed", resale:"Resale", transferred:"Transferred" };

  const editChip = (active) => `px-3 py-1.5 rounded-full cursor-pointer text-xs font-medium border transition-colors ${
    active ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-transparent text-brand-muted"
  }`;

  if (editing) return (
    <div className="bg-brand-canvas h-full flex flex-col overflow-hidden font-sans">
      <div className="shrink-0 flex items-center px-4.5 px-4 py-3 gap-3 bg-brand-card border-b border-brand-hairline">
        <button onClick={() => setEditing(false)}
          className="w-8 h-8 rounded-xl bg-transparent border border-brand-hairline flex items-center justify-center text-brand-text hover:border-gray-300 transition-colors">
          <ArrowLeft size={15} weight="light" />
        </button>
        <div className="flex-1 text-[15px] font-semibold text-brand-text">Edit Event</div>
        <button onClick={saveEdit}
          className="px-4 h-8 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium transition-colors">Save Changes</button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ WebkitOverflowScrolling:"touch" }}>
        <div className={`mx-auto ${isDesk ? "max-w-[640px]" : "w-full"}`} style={{ padding: isDesk ? "22px 40px 100px" : "14px 14px 100px" }}>
          <div className="mb-3.5">
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <div key={cat} onClick={() => setEditForm(p=>({...p,category:cat}))} className={editChip(editForm.category===cat)}>
                  {cat.charAt(0).toUpperCase()+cat.slice(1)}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Currency</label>
            <div className="flex gap-1.5 flex-wrap">
              {CURRENCIES.map(c => (
                <button key={c.code} onClick={() => setEditForm(p=>({...p,currency:c.code}))}
                  className={`px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${editForm.currency===c.code ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-transparent text-brand-muted"}`}>
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Image</label>
            <div className="flex gap-1.5 mb-1.5">
              {[["upload","Upload"],["url","URL"]].map(([v,l]) => (
                <div key={v} onClick={() => setEditImgType(v)}
                  className={`flex-1 py-1.5 rounded-xl text-center cursor-pointer text-xs font-medium border transition-colors ${editImgType===v ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-transparent text-brand-muted"}`}>
                  {l}
                </div>
              ))}
            </div>
            {editImgType==="upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="edit-img" className="hidden"
                  onChange={e => { const f=e.target.files[0]; if(!f) return; const cv=document.createElement("canvas"); const im=new Image(); const u=URL.createObjectURL(f); im.onload=()=>{const M=1200;let w=im.width,h=im.height;if(w>M){h=Math.round(h*M/w);w=M;}cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);setEditForm(p=>({...p,image:cv.toDataURL("image/jpeg",0.82)}));URL.revokeObjectURL(u);};im.src=u; }} />
                <label htmlFor="edit-img" className="block p-4 bg-brand-card border-2 border-dashed border-brand-accent/30 rounded-xl text-center cursor-pointer">
                  {editForm.image ? (
                    <>
                      <img src={editForm.image} alt="p" className="w-full h-28 object-cover object-top rounded-xl mb-1.5" />
                      <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs"><CheckCircle size={12} weight="light" /> Click to change</div>
                    </>
                  ) : (
                    <>
                      <Camera size={20} weight="light" className="text-brand-muted mx-auto mb-1.5" />
                      <div className="text-brand-muted text-xs">Click to upload</div>
                    </>
                  )}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:")?"":editForm.image||""} onChange={e => setEditForm(p=>({...p,image:e.target.value}))} className={inputClass(false)} />
            )}
          </div>
          <div className={`grid ${isDesk ? "grid-cols-2 gap-x-6" : "grid-cols-1"}`}>
            {[["name","Event Name","text",true],["subtitle","Subtitle","text",false],["date","Date","date",true],["time","Time","time",false],["venue","Venue","text",true],["city","City","text",false],["price","Ticket Price","number",true],["totalTickets","Total Tickets","number",false],["description","Description","text",false]].map(([k,l,t,req]) => (
              <div key={k} className="mb-3.5">
                <label className="block text-xs font-medium text-brand-muted mb-1">{l}{req && <span className="text-red-600"> *</span>}</label>
                <input type={t} value={editForm[k]??""} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))} className={inputClass(false)} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3.5 py-3 bg-brand-card border border-brand-hairline rounded-xl mb-4">
            <div>
              <div className="text-[13px] font-medium text-brand-text">Ticket Sales</div>
              <div className="text-xs text-brand-muted">Currently {ev.salesOpen?"open":"paused"}</div>
            </div>
            <button onClick={() => toggleSales(ev.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${ev.salesOpen ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              {ev.salesOpen ? <><Pause size={12} weight="light" /> Pause</> : <><Play size={12} weight="light" /> Resume</>}
            </button>
          </div>
          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={saveEdit}
            className={`h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-medium transition-colors ${isDesk ? "px-6 w-auto" : "w-full"}`}>
            Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );

  const PAD = isDesk ? "0 40px 80px" : "0 14px 100px";
  return (
    <div className="bg-brand-canvas h-full overflow-y-auto font-sans" style={{ WebkitOverflowScrolling:"touch" }}>
      <div className="max-w-[900px] mx-auto">
        <div className={`relative ${isDesk ? "h-[220px]" : "h-[170px]"}`}>
          <img src={cover} alt={ev.name} className="w-full h-full object-cover object-top" onError={e=>{e.target.src=catImg.other}} />
          <button onClick={() => setScreen("app")}
            className="absolute top-3 left-3.5 w-8 h-8 rounded-full bg-brand-card flex items-center justify-center text-brand-text">
            <ArrowLeft size={15} weight="light" />
          </button>
          <button onClick={startEdit}
            className="absolute top-3 right-3.5 px-3 py-1.5 bg-brand-card rounded-full text-brand-text text-xs font-semibold">Edit</button>
          <div className="absolute bottom-3 left-3.5 flex gap-1.5">
            <span className="bg-brand-text text-white text-xs font-medium px-1.5 py-0.5 rounded">NFT</span>
            {isFree && <span className="bg-emerald-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">FREE</span>}
            {!ev.isApproved && (
              <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                <Clock size={8} weight="light" /> PENDING REVIEW
              </span>
            )}
          </div>
        </div>

        {!ev.isApproved && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3.5" style={{ padding: isDesk ? "14px 40px" : "14px" }}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} weight="light" className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-medium text-amber-800">Pending Review</div>
                <div className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  This event isn't visible to attendees yet. Our team reviews new events before they go live to keep the platform safe. You'll be notified once it's approved.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-brand-card border-b border-brand-hairline" style={{ padding: isDesk ? "16px 40px" : "12px 14px" }}>
          <div className="text-xs font-medium text-brand-muted tracking-wide mb-1">{(ev.category||"").toUpperCase()} · {ev.country||"GHANA"}</div>
          <div className={`font-semibold tracking-[-0.02em] text-brand-text mb-0.5 ${isDesk ? "text-2xl" : "text-xl"}`}>{ev.name}</div>
          <div className="flex items-center gap-1 text-xs text-brand-muted tabular-nums">
            <MapPin size={11} weight="light" /> {ev.venue} · <Calendar size={11} weight="light" /> {formatDate(ev.date)}
          </div>
        </div>

        <div className="sticky top-0 z-20 bg-brand-card border-b border-brand-hairline flex" style={{ padding: `0 ${isDesk?"40px":"14px"}` }}>
          {[{id:"overview",label:"Overview",Icon:SquaresFour},{id:"holders",label:"Ticket Holders",Icon:Users,count:ev.ticketsSold}].map(t => (
            <button key={t.id} onClick={() => onTab(t.id)}
              className={`px-3.5 py-3 bg-transparent border-0 border-b-2 flex items-center gap-1.5 text-[13px] transition-colors ${activeTab===t.id ? "border-brand-accent text-brand-accent font-semibold" : "border-transparent text-brand-muted font-normal"}`}>
              <t.Icon size={14} weight="light" /> {t.label}
              {t.count!==undefined && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${activeTab===t.id ? "bg-[var(--brand-light)] text-brand-accent" : "bg-brand-hairline text-brand-muted"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {activeTab==="overview" && (
          <div style={{ padding: PAD }}>
            <div className="pt-5">
              <div className={`grid gap-2.5 mb-4 ${isDesk ? "grid-cols-4" : "grid-cols-2"}`}>
                {(isFree ? [
                  [Confetti,"Registered",(ev.regs||ev.ticketsSold).toLocaleString(),"text-blue-700"],
                  [Ticket,"Capacity",ev.totalTickets.toLocaleString(),"text-brand-text"],
                  [CheckCircle,"Checked In",admittedCount+" ppl","text-emerald-700"],
                  [Calendar,"Date",formatDate(ev.date),"text-blue-700"],
                ] : [
                  [Wallet,"Revenue (95%)",`${curr} ${revenue.toLocaleString()}`,"text-emerald-700"],
                  [Bank,"Platform Fee",`${curr} ${fee.toLocaleString()}`,"text-red-600"],
                  [Ticket,"Sold",`${ev.ticketsSold}/${ev.totalTickets}`,"text-blue-700"],
                  [DoorOpen,"Admitted",admittedCount+" ppl","text-brand-accent"],
                ]).map(([Icon,label,value,color]) => (
                  <motion.div key={label} whileHover={{ y:-1 }} className="bg-brand-card border border-brand-hairline rounded-2xl p-3.5">
                    <Icon size={15} weight="light" className={`${color} mb-1.5`} />
                    <div className={`text-xl font-semibold mb-0.5 tracking-tight tabular-nums ${color}`}>{value}</div>
                    <div className="text-xs text-brand-muted">{label}</div>
                  </motion.div>
                ))}
              </div>

              {ev.tiers && ev.tiers.length > 0 && (
                <Panel className="mb-3">
                  <div className="text-xs font-semibold text-brand-muted mb-3">TICKET TIERS</div>
                  <div className="flex flex-col gap-2">
                    {ev.tiers.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-brand-canvas rounded-xl px-3.5 py-2.5">
                        <div className="text-[13px] font-semibold text-brand-text">{t.name}</div>
                        <div className="text-xs text-brand-muted">{curr} {t.price} · {t.sold}/{t.capacity} sold</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] font-medium text-brand-text">{isFree?"Registration":"Sales"} Progress</span>
                  <span className={`text-[13px] font-medium tabular-nums ${pctColorClass(pct)}`}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-brand-hairline rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.9 }} className={`h-full rounded-full ${pctBarClass(pct)}`} />
                </div>
                <div className="text-xs text-brand-muted mt-1.5">{ev.totalTickets-ev.ticketsSold} {isFree?"spots":"tickets"} remaining</div>
              </Panel>

              <Panel className="mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-text mb-2"><Link size={11} weight="light" /> EVENT URL</div>
                <div className="font-mono text-xs text-brand-text bg-brand-canvas px-2.5 py-1.5 rounded-xl border border-brand-hairline mb-2.5 break-all">{evUrl}</div>
                <button onClick={copyLink}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${copiedLink ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-[var(--brand-light)] text-brand-accent border-brand-accent/20"}`}>
                  {copiedLink ? <><Check size={12} weight="light" /> Copied</> : <><Copy size={12} weight="light" /> Copy Link</>}
                </button>
              </Panel>

              {ev.description && (
                <Panel className="mb-3">
                  <div className="text-xs font-semibold text-brand-muted mb-2">DESCRIPTION</div>
                  <div className="text-[13px] text-brand-muted leading-relaxed">{ev.description}</div>
                </Panel>
              )}

              <div className={`grid gap-2 mb-3.5 ${isDesk ? "grid-cols-2" : "grid-cols-1"}`}>
                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => toggleSales(ev.id)}
                  className={`py-3 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 transition-colors ${ev.salesOpen ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-600"}`}>
                  {ev.salesOpen ? <><Pause size={14} weight="light" /> Pause {isFree?"Registrations":"Sales"}</> : <><Play size={14} weight="light" /> Resume {isFree?"Registrations":"Sales"}</>}
                </motion.button>
                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("scanTicket")}
                  className="py-3 bg-brand-card text-brand-text border border-brand-hairline rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 hover:border-gray-300 transition-colors">
                  <Scan size={14} weight="light" /> Scan at Door
                </motion.button>
              </div>

              <Panel>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-light)] flex items-center justify-center">
                    <DoorOpen size={15} weight="light" className="text-brand-accent" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-text">Door Staff Access</div>
                    <div className="text-xs text-brand-muted">Single-use codes · expire after first scan</div>
                  </div>
                </div>
                <button onClick={() => generateDoorCode(ev.id,ev.name)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[var(--brand-light)] text-brand-accent border border-dashed border-brand-accent/40 rounded-xl text-xs font-semibold mb-2.5 hover:bg-[var(--brand-light)] transition-colors">
                  <Plus size={13} weight="light" /> Generate Access Code
                </button>
                {invites.map(inv => (
                  <div key={inv.code} onClick={() => copyCode(inv.code)}
                    className={`rounded-xl px-3 py-2.5 mb-1.5 flex justify-between items-center cursor-pointer border ${inv.used ? "bg-brand-canvas border-brand-hairline" : "bg-[var(--brand-light)] border-brand-accent/20"}`}>
                    <span className={`font-mono font-medium text-[13px] tracking-wider ${inv.used ? "text-brand-muted" : "text-brand-accent"}`}>{inv.code}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`text-xs font-medium ${inv.used ? "text-brand-muted" : "text-emerald-700"}`}>{inv.used?"USED":"ACTIVE"}</span>
                      {!inv.used && <span className={`text-xs ${copiedCode===inv.code ? "text-emerald-700" : "text-brand-muted"}`}>{copiedCode===inv.code?"COPIED":"TAP TO COPY"}</span>}
                    </div>
                  </div>
                ))}
                <div className="flex gap-1.5 items-center mt-1 px-2.5 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <Lock size={12} weight="light" className="text-blue-700 shrink-0" />
                  <span className="text-xs text-blue-700 font-medium">Door staff can scan only — no event management access</span>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeTab==="holders" && (
          <div style={{ padding: PAD }}>
            <div className="pt-4">
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                {[[Ticket,holders.filter(t=>t.status==="active").length,"Active","text-emerald-700"],[CheckCircle,holders.filter(t=>t.status==="redeemed").length,"Redeemed","text-gray-500"],[Tag,holders.filter(t=>t.status==="resale").length,"On Resale","text-red-600"]].map(([Icon,count,label,color]) => (
                  <Panel key={label} className="text-center py-3 px-2.5">
                    <Icon size={16} weight="light" className={`${color} mx-auto mb-1`} />
                    <div className={`text-xl font-semibold tabular-nums ${color}`}>{holderLoad?"—":count}</div>
                    <div className="text-xs text-brand-muted mt-0.5">{label}</div>
                  </Panel>
                ))}
              </div>
              <div className="relative mb-3">
                <MagnifyingGlass size={13} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input value={holderSearch} onChange={e=>setHolderSearch(e.target.value)} placeholder="MagnifyingGlass name, email or ticket ID..."
                  className={`${inputClass(false)} pl-9`} />
                {holderSearch && (
                  <button onClick={()=>setHolderSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                    <X size={13} weight="light" />
                  </button>
                )}
              </div>
              {holderLoad ? (
                <div className="flex flex-col gap-1.5">{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{ height:"54px", borderRadius:"12px" }} />)}</div>
              ) : filtered.length===0 ? (
                <Panel className="text-center py-12 px-5">
                  <div className="w-11 h-11 rounded-full bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-2.5">
                    <Users size={20} weight="light" className="text-brand-accent" />
                  </div>
                  <div className="text-sm font-semibold text-brand-text mb-1">{holderSearch?"No results":"No ticket holders yet"}</div>
                  <div className="text-xs text-brand-muted">{holderSearch?"Try a different search":"Holders will appear here once tickets are purchased"}</div>
                </Panel>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {isDesk && (
                    <div className="grid gap-2.5 px-3.5 py-1" style={{ gridTemplateColumns:"1fr 1fr 80px 100px" }}>
                      {["HOLDER","TICKET ID","QTY","STATUS"].map(h => <span key={h} className="text-xs font-semibold text-brand-muted tracking-wide">{h}</span>)}
                    </div>
                  )}
                  {filtered.map((t,i) => {
                    const name  = ((t.owner?.first_name||"")+" "+(t.owner?.last_name||"")).trim()||"Unknown";
                    const email = t.owner?.email||"—";
                    const cls   = sClass[t.status]||"text-gray-600 bg-brand-hairline";
                    const lbl   = sLabel[t.status]||t.status;
                    return (
                      <motion.div key={t.ticket_id||i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.02 }}
                        className={`bg-brand-card rounded-xl px-3.5 py-2.5 border border-brand-hairline items-center gap-2.5 hover:border-brand-hairline transition-colors ${isDesk ? "grid" : "flex"}`}
                        style={isDesk ? { gridTemplateColumns:"1fr 1fr 80px 100px" } : undefined}>
                        <div className={`min-w-0 ${isDesk ? "" : "flex-1"}`}>
                          <div className="text-xs font-semibold text-brand-text truncate mb-0.5">
                            {name}
                            {t.is_resale && <span className="ml-1.5 text-xs font-medium text-brand-text bg-brand-hairline px-1.5 py-0.5 rounded">RESALE</span>}
                          </div>
                          <div className="text-xs text-brand-muted truncate">{email}</div>
                        </div>
                        <div className={`font-mono text-xs text-brand-muted truncate ${isDesk ? "block" : "hidden"}`}>
                          {String(t.ticket_id||"").slice(0,14)}…
                          {t.nft_token_id && <div className="font-mono text-xs text-brand-text mt-0.5">NFT #{t.nft_token_id}</div>}
                        </div>
                        <div className={isDesk ? "block" : "hidden"}>
                          <span className="text-xs font-semibold text-brand-accent">×{t.quantity||1}</span>
                        </div>
                        <div>
                          <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${cls}`}>{lbl.toUpperCase()}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div className="text-center py-2.5 text-xs text-brand-muted">
                    {filtered.length} of {holders.length} holders{holderSearch&&` · "${holderSearch}"`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}