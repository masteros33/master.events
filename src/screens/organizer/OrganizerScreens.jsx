import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Calendar, MapPin, CheckCircle2, Wallet, CreditCard, PartyPopper,
  Camera, Lock, Search, DoorOpen, Ticket, Landmark, Globe, Bell, Pause, Play,
  X, Users, Tag, LayoutDashboard, ArrowLeft, Plus, ChevronDown, ChevronUp,
  RefreshCw, Download, Copy, Check, ScanLine, Crown, Star, Sparkles,
} from "lucide-react";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

// SVG paint (stroke/fill) can't take Tailwind classes — these mirror the
// brand/fintech tokens in tailwind.config.js for the charts below only.
const CHART = { orange: "#FF5A1F", green: "#10B981", blue: "#2563EB", red: "#DC2626" };

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

// ── Ticket tier presets — quick-select for common naming ────────
const TIER_PRESETS = [
  { key:"regular", label:"Regular", Icon:Ticket },
  { key:"vip",     label:"VIP",     Icon:Star },
  { key:"vvip",    label:"VVIP",    Icon:Crown },
  { key:"custom",  label:"Custom",  Icon:Sparkles },
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
});

// pct-based capacity color: red past 80%, brand orange mid, green low
const pctColorClass = pct => pct > 80 ? "text-red-600" : "text-brand-orange";
const pctBarClass   = pct => pct > 80 ? "bg-red-600" : "bg-brand-orange";

// ── FIX: bg-white was missing, causing native dark-mode form styling
// to render inputs black/dark regardless of text-brand-text ────────
const inputClass = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-brand-text outline-none transition-colors ${
    err ? "border-red-300" : "border-gray-200 focus:border-brand-orange"
  } focus:ring-2 focus:ring-orange-100`;
const labelClass = "text-[11px] font-semibold text-brand-muted mb-1.5 block uppercase tracking-wide";

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

// ── Sparkline ─────────────────────────────────────────────────
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

// ── Circular progress ─────────────────────────────────────────
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

// ── Event card (image-first) ───────────────────────────────────
function EventCard({ ev, onClick }) {
  const isFree = ev.event_type === "free";
  const pct    = ev.totalTickets > 0 ? Math.round((ev.ticketsSold/ev.totalTickets)*100) : 0;
  const rev    = Math.round(ev.ticketsSold * ev.price * 0.95);
  const ringColor = pct > 80 ? CHART.red : CHART.orange;

  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer min-w-[220px] w-full">
      <div className="h-[140px] relative overflow-hidden">
        <img src={ev.image} alt={ev.name} onError={e => { e.target.src = catImg.other; }} className="w-full h-full object-cover object-top block" />

        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="bg-brand-text text-white text-[8px] font-bold px-2 py-1 rounded-full font-mono">{ev.category.toUpperCase()}</span>
          {isFree && <span className="bg-fintech-green text-white text-[8px] font-bold px-2 py-1 rounded-full font-mono">FREE</span>}
        </div>

        <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full ${ev.salesOpen ? "bg-fintech-green" : "bg-gray-500"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-[8px] font-bold text-white font-mono">{ev.salesOpen ? "LIVE" : "CLOSED"}</span>
        </div>
      </div>

      <div className="p-3.5 pb-4">
        <div className="font-bold text-[13px] text-brand-text mb-0.5 truncate">{ev.name}</div>
        <div className="flex items-center gap-1 text-[11px] text-brand-muted mb-3 font-mono truncate">
          <Calendar size={10} strokeWidth={1.75} /> {ev.date} · <MapPin size={10} strokeWidth={1.75} /> {ev.city}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`text-base font-extrabold tracking-tight leading-none ${isFree ? "text-fintech-green" : "text-brand-orange"}`}>
              {isFree ? `${(ev.regs||ev.ticketsSold).toLocaleString()} reg` : `${ev.currency} ${rev.toLocaleString()}`}
            </div>
            <div className="text-[10px] text-brand-muted mt-1 font-mono">{ev.ticketsSold}/{ev.totalTickets} · {pct}% full</div>
          </div>
          <div className="relative flex items-center justify-center">
            <Ring pct={pct} size={44} color={ringColor} />
            <span className={`absolute text-[9px] font-bold font-mono ${pctColorClass(pct)}`}>{pct}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Activity feed — ledger treatment ────────────────────────────
function ActivityFeed({ events }) {
  const [feed, setFeed] = useState([]);
  const ref = useRef(false);

  useEffect(() => {
    if (!events.length || ref.current) return;
    ref.current = true;
    const types = [
      ev => ({ Icon: Ticket,     color: "text-fintech-green", bg: "bg-pastel-green", label: "Ticket purchased",     detail: `×${Math.ceil(Math.random()*3)} · ${ev.name}`, amount: `+${ev.currency||"GHS"} ${Math.round(ev.price*Math.ceil(Math.random()*3)*0.95).toLocaleString()}`, ts: `${Math.floor(Math.random()*55)+1}m ago` }),
      ev => ({ Icon: RefreshCw,  color: "text-fintech-blue",  bg: "bg-pastel-blue",  label: "Ticket transferred",   detail: ev.name,                                        amount: null, ts: `${Math.floor(Math.random()*3)+1}h ago`  }),
      ev => ({ Icon: Link2,      color: "text-brand-text",    bg: "bg-gray-100",     label: "NFT minted on Polygon", detail: `Token #${Math.floor(Math.random()*9000)+1000}`, amount: null, ts: `${Math.floor(Math.random()*5)+1}h ago` }),
      ev => ({ Icon: Wallet,     color: "text-brand-orange",  bg: "bg-pastel-orange", label: "Payout queued",       detail: ev.name, amount: `${ev.currency||"GHS"} ${Math.round(ev.price*Math.ceil(Math.random()*4)*0.95).toLocaleString()}`, ts: `${Math.floor(Math.random()*8)+2}h ago` }),
    ];
    const initial = [];
    for (let i = 0; i < Math.min(8, events.length * 3); i++) {
      const ev = events[Math.floor(Math.random() * events.length)];
      initial.push({ id: i, ...types[Math.floor(Math.random() * types.length)](ev) });
    }
    setFeed(initial);
    const tick = () => {
      const ev = events[Math.floor(Math.random() * events.length)];
      setFeed(prev => [{ id: Date.now(), ...types[0](ev), ts: "just now" }, ...prev].slice(0, 12));
      setTimeout(tick, 8000 + Math.random() * 7000);
    };
    const t = setTimeout(tick, 5000 + Math.random() * 5000);
    return () => clearTimeout(t);
  }, [events.length]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-fintech-green" />
        <span className="text-[10px] font-bold text-fintech-green font-mono tracking-widest">LIVE ACTIVITY</span>
      </div>
      <AnimatePresence initial={false}>
        {feed.map(item => (
          <motion.div key={item.id}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
            className="flex items-center gap-2.5 py-2.5 border-b border-gray-50 last:border-b-0">
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
              <item.Icon size={14} strokeWidth={2} className={item.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-brand-text truncate">{item.label}</div>
              <div className="text-[10px] text-brand-muted truncate">{item.detail}</div>
            </div>
            <div className="text-right shrink-0">
              {item.amount && <div className="text-[12px] font-bold text-fintech-slate font-mono">{item.amount}</div>}
              <div className="text-[9px] text-brand-muted font-mono mt-0.5">{item.ts}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {!feed.length && <div className="p-6 text-center text-brand-muted text-sm">Activity will appear once events are live</div>}
    </div>
  );
}

// ── Fill chart ────────────────────────────────────────────────
function FillChart({ events }) {
  if (!events.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {events.map(e => {
        const pct = e.totalTickets > 0 ? Math.round((e.ticketsSold/e.totalTickets)*100) : 0;
        const barClass  = pct >= 85 ? "bg-red-600" : pct >= 55 ? "bg-brand-orange" : "bg-fintech-green";
        const textClass = pct >= 85 ? "text-red-600" : pct >= 55 ? "text-brand-orange" : "text-fintech-green";
        return (
          <div key={e.id}>
            <div className="flex justify-between mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${e.event_type==="free" ? "text-fintech-green bg-pastel-green" : "text-brand-orange bg-pastel-orange"}`}>
                  {e.event_type==="free" ? "FREE" : e.currency}
                </span>
                <span className="text-xs font-medium text-brand-text truncate">{e.name}</span>
              </div>
              <span className={`text-xs font-bold font-mono shrink-0 ml-2 ${textClass}`}>{pct}%</span>
            </div>
            <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width:0 }} animate={{ width:`${Math.max(1,pct)}%` }} transition={{ duration:0.7, ease:"easeOut" }}
                className={`h-full rounded-full ${barClass}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Panel shell ───────────────────────────────────────────────
function Panel({ children, className = "" }) {
  return <div className={`bg-white border border-gray-100 rounded-3xl p-5 shadow-sm ${className}`}>{children}</div>;
}

// ── Section head ──────────────────────────────────────────────
function SectionHead({ label, title, action }) {
  return (
    <div className="flex justify-between items-end mb-4.5 mb-5">
      <div>
        {label && <div className="text-[10px] font-bold text-brand-orange tracking-widest mb-1 font-mono">{label}</div>}
        <h2 className="text-lg font-bold text-brand-text tracking-tight m-0">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ── EventRow (list view for Events tab) ──────────────────────
function EventRow({ ev, onClick }) {
  const pct    = ev.totalTickets > 0 ? Math.round((ev.ticketsSold/ev.totalTickets)*100) : 0;
  const isFree = ev.event_type === "free";
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} onClick={onClick}
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md flex ${tab() ? "flex-row" : "flex-col"}`}>
      <div className={`relative shrink-0 ${tab() ? "w-40 h-auto min-h-[80px]" : "w-full h-[120px]"}`}>
        <img src={ev.image} alt={ev.name} onError={e=>{e.target.src=catImg.other}} className="w-full h-full object-cover object-top block" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="bg-brand-text text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">NFT</span>
          {isFree && <span className="bg-fintech-green text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">FREE</span>}
        </div>
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold text-white ${ev.salesOpen ? "bg-fintech-green" : "bg-gray-500"}`}>
          <span className="w-1 h-1 rounded-full bg-white" /> {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="text-[10px] font-medium text-brand-muted uppercase tracking-wide mb-1 font-mono">{ev.category} · {ev.country}</div>
          <div className="text-[15px] font-bold text-brand-text tracking-tight mb-1 truncate">{ev.name}</div>
          <div className="flex items-center gap-1 text-xs text-brand-muted mb-3">
            <MapPin size={11} strokeWidth={1.75} /> {ev.venue} · <Calendar size={11} strokeWidth={1.75} /> {ev.date}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[13px] font-bold text-fintech-green font-mono">
              {isFree ? `${(ev.regs||ev.ticketsSold).toLocaleString()} registered` : `${ev.currency} ${Math.round(ev.ticketsSold*ev.price*0.95).toLocaleString()}`}
            </span>
            <span className="text-[10px] text-brand-muted font-mono">{ev.ticketsSold}/{ev.totalTickets} · {pct}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.7, ease:"easeOut" }}
              className={`h-full rounded-full ${pctBarClass(pct)}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER HOME — fintech dashboard, width-constrained
// ═══════════════════════════════════════════════════════════════
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
  const avgPrice = paid.length ? Math.round(paid.reduce((s,e)=>s+e.price,0)/paid.length) : 0;

  const revSpark  = Array.from({length:7}, (_,i) => Math.max(0, revenue*(0.4+Math.random()*0.7)*(i+1)/8));
  const soldSpark = Array.from({length:7}, (_,i) => Math.max(0, sold*(0.3+Math.random()*0.8)*(i+1)/8));

  const selectedEvent = statsView !== "all" ? orgEvents.find(e => String(e.id) === String(statsView)) : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="bg-brand-canvas min-h-full font-sans" onClick={() => setDropOpen(false)}>
      <div className="max-w-[1000px] mx-auto" style={{ padding: isDesk ? "28px 40px 80px" : "16px 16px 100px" }}>

        {/* ── Header ── */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs text-brand-muted mb-1 font-mono tracking-wide">ORGANIZER DASHBOARD</p>
            <h1 className={`font-extrabold text-brand-text tracking-tight mb-0.5 ${isDesk ? "text-2xl" : "text-xl"}`}>
              {isDesk ? `${greeting}, ${currentUser?.first_name}` : `Hi ${currentUser?.first_name}`}
            </h1>
            <p className="text-[13px] text-brand-muted m-0">
              {orgEvents.length} event{orgEvents.length!==1?"s":""} · {live} live · {orgEvents.reduce((s,e)=>s+e.ticketsSold,0).toLocaleString()} tickets sold
            </p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-fintech-slate/5 border border-fintech-slate/15">
              <span className="w-1.5 h-1.5 rounded-full bg-fintech-slate" />
              <span className="text-[10px] font-semibold text-fintech-slate font-mono">POLYGON</span>
            </div>
            {isDesk && (
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-[13px] font-bold transition-colors">
                <Plus size={14} strokeWidth={2.5} /> Create Event
              </motion.button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: "220px", borderRadius: "28px", marginBottom: "24px" }} />
        ) : (
          <>
            {/* ── Stats toggle dropdown ── */}
            <div className="mb-4 flex items-center gap-2.5 flex-wrap">
              <div className="text-[11px] font-semibold text-brand-muted font-mono">VIEWING STATS FOR:</div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <motion.button whileTap={{ scale:0.97 }} onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 bg-white border rounded-xl cursor-pointer text-[13px] font-semibold text-brand-text shadow-sm transition-colors ${dropOpen ? "border-brand-orange" : "border-gray-200"}`}>
                  <span className={`w-2 h-2 rounded-full ${statsView === "all" ? "bg-brand-orange" : "bg-fintech-green"}`} />
                  {statsView === "all" ? "All Events" : selectedEvent?.name || "Select event"}
                  {dropOpen ? <ChevronUp size={13} className="text-brand-muted" /> : <ChevronDown size={13} className="text-brand-muted" />}
                </motion.button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                      className="absolute top-[calc(100%+6px)] left-0 min-w-[220px] bg-white border border-gray-100 rounded-2xl shadow-sm z-[100] overflow-hidden">
                      {[{ id:"all", name:"All Events" }, ...orgEvents].map(e => (
                        <div key={e.id} onClick={() => { setStatsView(String(e.id)); setDropOpen(false); }}
                          className={`flex items-center gap-2 px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-pastel-orange ${String(statsView)===String(e.id) ? "bg-pastel-orange" : ""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${String(statsView)===String(e.id) ? "bg-brand-orange" : "bg-gray-200"}`} />
                          <span className={`text-[13px] text-brand-text truncate ${String(statsView)===String(e.id) ? "font-semibold" : "font-normal"}`}>{e.name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Dark balance hero — same treatment as Wallet ── */}
            <div className="bg-fintech-slate rounded-3xl p-6 md:p-7 mb-4">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-5">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-widest font-mono mb-2">TOTAL REVENUE · 95% PAYOUT</div>
                  <div className={`font-extrabold text-white tracking-tight font-mono leading-none ${isDesk ? "text-[42px]" : "text-[32px]"}`}>
                    GHS {Math.round(revenue).toLocaleString()}
                  </div>
                  <div className="text-[13px] text-slate-400 mt-2">
                    {sold.toLocaleString()} paid tickets · {regs.toLocaleString()} free registrations
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Sparkline data={revSpark} color="#34d399" height={40} width={100} />
                  <div className="text-[10px] text-slate-500 font-mono">7-day trend</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                {[
                  { label:"TICKETS SOLD",     value: sold.toLocaleString(),              sub:"paid tickets" },
                  { label:"AVG TICKET PRICE", value: avgPrice ? `GHS ${avgPrice}` : "—", sub:"across paid events" },
                  { label:"LIVE NOW",         value: live,                               sub:`of ${orgEvents.length} total` },
                ].map(m => (
                  <div key={m.label}>
                    <div className="text-[9px] font-semibold text-slate-400 font-mono tracking-wide mb-1">{m.label}</div>
                    <div className="text-lg font-extrabold text-white tracking-tight">{m.value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Event cards carousel / grid ── */}
            {orgEvents.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3.5">
                  <div>
                    <div className="text-[10px] font-bold text-brand-orange tracking-widest font-mono mb-0.5">YOUR EVENTS</div>
                    <div className="text-[15px] font-bold text-brand-text tracking-tight">Event Portfolio</div>
                  </div>
                  {!isDesk && (
                    <motion.button whileTap={{ scale:0.96 }} onClick={() => setScreen("addEvent")}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-xs font-bold transition-colors">
                      <Plus size={12} strokeWidth={2.5} /> New
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

            {/* ── Analytics panels ── */}
            {isDesk && orgEvents.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Panel>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-[9px] font-semibold text-brand-muted tracking-widest font-mono mb-0.5">CAPACITY FILL RATE</div>
                      <div className="text-[15px] font-bold text-brand-text">Ticket Progress</div>
                    </div>
                    <button onClick={() => dlCSV(orgEvents)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-transparent border border-gray-200 rounded-lg text-brand-muted text-[11px] hover:border-gray-300 transition-colors">
                      <Download size={11} strokeWidth={2} /> Export CSV
                    </button>
                  </div>
                  <FillChart events={src} />
                </Panel>
                <Panel>
                  <div className="text-[9px] font-semibold text-brand-muted tracking-widest font-mono mb-0.5">PAYOUT SPLIT</div>
                  <div className="text-[15px] font-bold text-brand-text mb-4">Earnings Breakdown</div>
                  {[
                    { label:"You (95%)",     val:Math.round(revenue),        color:"text-fintech-green", bar:"bg-fintech-green", w:"95%" },
                    { label:"Platform (5%)", val:Math.round(revenue*0.053),  color:"text-red-600",       bar:"bg-red-600",       w:"5%"  },
                  ].map(r => (
                    <div key={r.label} className="mb-3.5">
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-xs font-medium ${r.color}`}>{r.label}</span>
                        <span className={`text-xs font-bold font-mono ${r.color}`}>GHS {r.val.toLocaleString()}</span>
                      </div>
                      <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width:0 }} animate={{ width:r.w }} transition={{ duration:1 }} className={`h-full rounded-full ${r.bar}`} />
                      </div>
                    </div>
                  ))}
                  <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => { setActiveTab("wallet"); setScreen("app"); }}
                    className="w-full py-2.5 mt-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors">
                    <Wallet size={14} strokeWidth={2} /> Withdraw Earnings
                  </motion.button>
                </Panel>
              </div>
            )}

            {isDesk && orgEvents.length > 0 && (
              <Panel className="mb-4">
                <div className="text-[9px] font-semibold text-brand-muted tracking-widest font-mono mb-0.5">TRANSACTIONS</div>
                <div className="text-[15px] font-bold text-brand-text mb-1">Live Activity</div>
                <ActivityFeed events={orgEvents} />
              </Panel>
            )}

            {!isDesk && orgEvents.length > 0 && (
              <div className="flex flex-col gap-3.5 mb-4">
                <Panel>
                  <div className="text-[9px] font-semibold text-brand-muted tracking-widest font-mono mb-3">FILL RATE</div>
                  <FillChart events={src} />
                </Panel>
                <Panel>
                  <div className="text-[9px] font-semibold text-brand-muted tracking-widest font-mono mb-1">LIVE ACTIVITY</div>
                  <ActivityFeed events={orgEvents} />
                </Panel>
              </div>
            )}

            {orgEvents.length === 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="text-center py-16 px-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-pastel-orange flex items-center justify-center mx-auto mb-4">
                  <Ticket size={26} strokeWidth={1.75} className="text-brand-orange" />
                </div>
                <div className="text-[17px] font-bold text-brand-text mb-2">No events yet</div>
                <div className="text-[13px] text-brand-muted mb-5">Create your first event to start selling NFT-verified tickets on Polygon</div>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-sm font-bold transition-colors">
                  <Plus size={14} strokeWidth={2.5} /> Create Your First Event
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER EVENTS LIST
// ═══════════════════════════════════════════════════════════════
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

  const filtered = filter==="all" ? orgEvents : filter==="free" ? orgEvents.filter(e=>e.event_type==="free") : filter==="paid" ? orgEvents.filter(e=>e.event_type!=="free") : orgEvents.filter(e=>e.salesOpen);
  const PAD = isDesk ? "28px 40px 80px" : "16px 16px 100px";

  return (
    <div className="bg-brand-canvas min-h-full font-sans">
      <div className="max-w-[900px] mx-auto" style={{ padding: PAD }}>
        <SectionHead label="MY EVENTS" title="Events"
          action={<motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-[13px] font-bold transition-colors">
            <Plus size={14} strokeWidth={2.5} /> New Event
          </motion.button>} />
        <div className="flex gap-1 mb-5 bg-white p-1 rounded-xl border border-gray-100 w-fit">
          {[["all","All"],["paid","Paid"],["free","Free"],["live","Live"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter===v ? "bg-brand-orange text-white" : "bg-transparent text-brand-muted hover:text-brand-text"}`}>
              {l}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex flex-col gap-2.5">{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:"100px", borderRadius:"16px" }} />)}</div>
        ) : filtered.length===0 ? (
          <Panel className="text-center py-14">
            <div className="w-12 h-12 rounded-full bg-pastel-orange flex items-center justify-center mx-auto mb-3">
              <Ticket size={22} strokeWidth={1.75} className="text-brand-orange" />
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

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER ALERTS
// ═══════════════════════════════════════════════════════════════
export function OrganizerAlerts() {
  const orgEvents = useStore(s => s.orgEvents);
  const [isDesk, setIsDesk] = useState(desk());
  useEffect(() => { const r=()=>setIsDesk(desk()); window.addEventListener("resize",r); return ()=>window.removeEventListener("resize",r); }, []);
  const revenue = orgEvents.reduce((s,e)=>s+e.ticketsSold*e.price*0.95,0);
  const sold    = orgEvents.reduce((s,e)=>s+e.ticketsSold,0);
  const alerts  = orgEvents.length > 0 ? [
    { Icon: Link2,  color:"text-fintech-slate", bg:"bg-gray-100",     title:"NFT Tickets Active on Polygon", body:`${sold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length>1?"s":""}. Immutable on-chain.`, time:"LIVE" },
    { Icon: Wallet, color:"text-fintech-green", bg:"bg-pastel-green", title:"Revenue Summary", body:`GHS ${Math.round(revenue).toLocaleString()} generated at 95% payout. Withdrawable to MoMo anytime.`, time:"NOW" },
    { Icon: Globe,  color:"text-fintech-blue",  bg:"bg-pastel-blue",  title:"Global Payments Active", body:"MTN MoMo, Paystack, and international card payments are live on all your events.", time:"ACTIVE" },
    { Icon: Lock,   color:"text-brand-orange",  bg:"bg-pastel-orange", title:"HMAC QR Security", body:"All tickets use rotating HMAC-SHA256 QR codes refreshing every 10 seconds. Screenshot-proof.", time:"ALWAYS" },
  ] : [{ Icon: Bell, color:"text-brand-orange", bg:"bg-pastel-orange", title:"No alerts yet", body:"Create an event and sell tickets to see real-time alerts here.", time:"NOW" }];
  return (
    <div className="bg-brand-canvas min-h-full font-sans">
      <div className="max-w-[900px] mx-auto" style={{ padding: isDesk ? "28px 40px 80px" : "16px 16px 100px" }}>
        <SectionHead label="NOTIFICATIONS" title="Alerts" />
        <div className={`flex flex-col gap-2 ${isDesk ? "max-w-[600px]" : "w-full"}`}>
          {alerts.map((a,i) => (
            <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} whileHover={{ y:-1 }}
              className="bg-white rounded-2xl p-4 flex gap-3.5 items-start border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
              <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                <a.Icon size={16} strokeWidth={1.75} className={a.color} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-brand-text mb-1">{a.title}</div>
                <div className="text-xs text-brand-muted leading-relaxed mb-2">{a.body}</div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${a.color} ${a.bg}`}>{a.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADD EVENT — now with Ticket Tiers (VIP/VVIP/Regular)
//  NOTE: tiers are captured in the form here, but the backend
//  (Event/Ticket models + serializers) does not yet store or use
//  them — see the yellow notice in the tiers section below.
// ═══════════════════════════════════════════════════════════════
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

  // ── Ticket tiers state ──
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

  // ── Tier helpers ──
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
    if (useTiers && tiers.length < 1)                            e.tiers = "Add at least one ticket tier";
    if (!addEventForm.category)                                  e.cat   = "Select a category";
    if (evType === "paid" && !isMultiDay && !useTiers && !addEventForm.price) e.price = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) return;
    const form = { ...addEventForm, event_type:evType, currency:evType==="free"?"FREE":currency, country, price:evType==="free"?0:addEventForm.price };
    if (isMultiDay) { form.is_multi_day=true; form.event_dates=eventDates; form.date=eventDates[0]?.date||""; }
    if (useTiers && tiers.length) {
      // Not yet consumed by the backend — Event/Ticket models need a
      // tiers table before this actually creates tiered tickets.
      // Included here so the payload is ready once that lands, and so
      // the lowest-tier price / summed capacity keep the existing
      // single-price flow working as a fallback in the meantime.
      form.ticket_tiers  = tiers.map(t => ({ name: t.name, price: parseFloat(t.price), capacity: parseInt(t.capacity) }));
      form.totalTickets  = tierTotalCapacity;
      form.price         = Math.min(...tiers.map(t => parseFloat(t.price) || Infinity));
    }
    setAddEventForm(form);
    handleAddEvent();
  };

  const chip = (active) => `px-4 py-1.5 rounded-full cursor-pointer text-[13px] font-medium border transition-colors ${
    active ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-transparent text-brand-muted"
  }`;

  const tierBadgeColor = key => key === "vvip" ? "bg-pastel-orange text-brand-orange" : key === "vip" ? "bg-pastel-blue text-fintech-blue" : "bg-gray-100 text-brand-muted";
  const tierIcon = key => TIER_PRESETS.find(t => t.key === key)?.Icon || Ticket;

  return (
    <div className="min-h-screen bg-brand-canvas font-sans">
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <Ticket size={15} strokeWidth={2} color="#fff" />
          </div>
          <span className="font-bold text-[15px] text-brand-text tracking-tight">Create Event</span>
        </div>
        <button onClick={() => setScreen("app")}
          className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3.5 py-1.5 text-brand-muted text-[13px] font-medium hover:border-gray-300 transition-colors">
          <ArrowLeft size={13} strokeWidth={2} /> Back
        </button>
      </div>

      <div className="max-w-[800px] mx-auto" style={{ padding: isDesk ? "36px 40px 80px" : "20px 16px 80px" }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm" style={{ padding: isDesk ? "40px 44px" : "24px 20px" }}>

          <div className="mb-7 pb-5 border-b border-gray-100">
            <h1 className="text-[22px] font-bold text-brand-text tracking-tight mb-1">Event Details</h1>
            <p className="text-[13px] text-brand-muted m-0">Fill in the details — NFT-verified tickets minted automatically on Polygon</p>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Event Type</label>
            <div className="flex gap-1 bg-brand-canvas rounded-xl p-1 border border-gray-100 w-fit">
              {[{v:"paid",Icon:CreditCard,label:"Paid Event"},{v:"free",Icon:PartyPopper,label:"Free Event"}].map(item => (
                <button key={item.v} onClick={() => setEvType(item.v)}
                  className={`px-5 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${evType===item.v ? "bg-brand-orange text-white" : "bg-transparent text-brand-muted"}`}>
                  <item.Icon size={14} strokeWidth={1.75} /> {item.label}
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
              <div className="flex items-center justify-between px-4 py-3.5 bg-brand-canvas rounded-xl border border-gray-100">
                <div>
                  <div className="text-sm font-semibold text-brand-text">Multi-day event</div>
                  <div className="text-xs text-brand-muted mt-0.5">Add multiple dates with per-day capacity and price</div>
                </div>
                <div onClick={() => { setIsMultiDay(!isMultiDay); setErrors(p=>({...p,date:null,dates:null})); }}
                  className={`w-[46px] h-[26px] rounded-full relative cursor-pointer transition-colors shrink-0 ${isMultiDay ? "bg-brand-orange" : "bg-gray-200"}`}>
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
                    className={inputClass(errors.date)} style={{ colorScheme: "light" }} />
                </div>
                <div>
                  <label className={labelClass}>Time (optional)</label>
                  <input type="time" value={addEventForm.time||""} onChange={e => setAddEventForm({...addEventForm, time:e.target.value})}
                    className={inputClass(false)} style={{ colorScheme: "light" }} />
                </div>
              </>
            )}

            {isMultiDay && (
              <div className={isDesk ? "col-span-2" : ""}>
                <label className={labelClass}>Event Dates {errors.dates && <span className="text-red-600 font-normal normal-case">— {errors.dates}</span>}</label>
                <div className="flex gap-2 mb-3">
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={`${inputClass(false)} flex-1`} style={{ colorScheme: "light" }} />
                  <button onClick={addDate}
                    className="px-5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl shrink-0 flex items-center justify-center transition-colors">
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
                <AnimatePresence>
                  {eventDates.map((d,i) => (
                    <motion.div key={d.date} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                      className="bg-pastel-orange border border-brand-orange/25 rounded-xl p-3.5 mb-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-brand-text">
                          <Calendar size={13} strokeWidth={1.75} /> Day {i+1} — {new Date(d.date+"T00:00:00").toLocaleDateString("en-GH",{weekday:"short",month:"short",day:"numeric"})}
                        </div>
                        <button onClick={() => removeDate(d.date)} className="bg-red-50 text-red-600 rounded-md px-2.5 py-1 text-[11px] font-semibold">Remove</button>
                      </div>
                      <div className={`grid gap-2.5 ${evType==="paid" ? "grid-cols-2" : "grid-cols-1"}`}>
                        <div>
                          <label className="text-[10px] font-semibold text-brand-muted block mb-1 uppercase">Tickets / Spots</label>
                          <input type="number" placeholder="e.g. 200" value={d.capacity} onChange={e => updateDate(d.date,"capacity",e.target.value)} className={inputClass(false)} />
                        </div>
                        {evType==="paid" && (
                          <div>
                            <label className="text-[10px] font-semibold text-brand-muted block mb-1 uppercase">Price ({currency})</label>
                            <input type="number" placeholder="e.g. 150" value={d.price} onChange={e => updateDate(d.date,"price",e.target.value)} className={inputClass(false)} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {eventDates.length===0 && (
                  <div className="text-center py-5 text-brand-muted text-[13px] border-2 border-dashed border-gray-200 rounded-xl">Pick a date above and tap + to add it</div>
                )}
                {eventDates.length>=2 && (
                  <div className="flex items-center gap-1.5 text-xs text-fintech-green bg-pastel-green px-3.5 py-2.5 rounded-lg mt-1.5">
                    <CheckCircle2 size={13} strokeWidth={2} /> {eventDates.length} days added — attendees will choose which day(s) to attend
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

            {/* ── Ticket Tiers toggle ── */}
            {!isMultiDay && evType === "paid" && (
              <div className={isDesk ? "col-span-2" : ""}>
                <div className="flex items-center justify-between px-4 py-3.5 bg-brand-canvas rounded-xl border border-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-brand-text flex items-center gap-1.5">
                      <Crown size={14} strokeWidth={1.75} className="text-brand-orange" /> Multiple ticket types
                    </div>
                    <div className="text-xs text-brand-muted mt-0.5">VIP, VVIP, Regular — each with its own price and capacity</div>
                  </div>
                  <div onClick={() => { setUseTiers(!useTiers); setErrors(p=>({...p,total:null,price:null,tiers:null})); }}
                    className={`w-[46px] h-[26px] rounded-full relative cursor-pointer transition-colors shrink-0 ${useTiers ? "bg-brand-orange" : "bg-gray-200"}`}>
                    <motion.div animate={{ x: useTiers?21:2 }} transition={{ duration:0.2 }}
                      className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Ticket Tiers builder ── */}
            {!isMultiDay && useTiers && (
              <div className={isDesk ? "col-span-2" : ""}>
                <label className={labelClass}>Ticket Tiers {errors.tiers && <span className="text-red-600 font-normal normal-case">— {errors.tiers}</span>}</label>

                <div className="bg-pastel-blue border border-fintech-blue/15 rounded-xl px-3.5 py-2.5 mb-3 flex items-start gap-2">
                  <Sparkles size={13} strokeWidth={1.75} className="text-fintech-blue shrink-0 mt-0.5" />
                  <span className="text-[11px] text-fintech-blue leading-relaxed">
                    Tiers are saved with this event, but checkout tier-selection is still being wired up on the backend — for now the lowest tier price is used as the event's listed price.
                  </span>
                </div>

                {/* Add tier row */}
                <div className="bg-brand-canvas border border-gray-100 rounded-xl p-3.5 mb-3">
                  <div className="flex gap-1.5 mb-2.5 flex-wrap">
                    {TIER_PRESETS.map(t => (
                      <button key={t.key} onClick={() => setNewTierType(t.key)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${newTierType===t.key ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-white text-brand-muted"}`}>
                        <t.Icon size={12} strokeWidth={1.75} /> {t.label}
                      </button>
                    ))}
                  </div>
                  {newTierType === "custom" && (
                    <input placeholder="Tier name, e.g. Table for 4" value={newTierName} onChange={e => setNewTierName(e.target.value)}
                      className={`${inputClass(false)} mb-2.5`} />
                  )}
                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-brand-muted block mb-1 uppercase">Price ({currency})</label>
                      <input type="number" placeholder="e.g. 300" value={newTierPrice} onChange={e => setNewTierPrice(e.target.value)} className={inputClass(false)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-brand-muted block mb-1 uppercase">Capacity</label>
                      <input type="number" placeholder="e.g. 50" value={newTierCap} onChange={e => setNewTierCap(e.target.value)} className={inputClass(false)} />
                    </div>
                  </div>
                  <button onClick={addTier}
                    className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors">
                    <Plus size={14} strokeWidth={2.5} /> Add Tier
                  </button>
                </div>

                {/* Tier list */}
                <AnimatePresence>
                  {tiers.map(t => {
                    const Icon = tierIcon(t.key);
                    return (
                      <motion.div key={t.id} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                        className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 mb-2 shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tierBadgeColor(t.key)}`}>
                            <Icon size={15} strokeWidth={1.75} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-brand-text truncate">{t.name}</div>
                            <div className="text-[11px] text-brand-muted font-mono">{currency} {t.price} · {t.capacity} tickets</div>
                          </div>
                        </div>
                        <button onClick={() => removeTier(t.id)} className="text-red-600 bg-red-50 rounded-md px-2.5 py-1 text-[11px] font-semibold shrink-0 ml-2">Remove</button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {tiers.length === 0 && (
                  <div className="text-center py-5 text-brand-muted text-[13px] border-2 border-dashed border-gray-200 rounded-xl">Add your first ticket tier above</div>
                )}
                {tiers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-fintech-green bg-pastel-green px-3.5 py-2.5 rounded-lg mt-1.5">
                    <CheckCircle2 size={13} strokeWidth={2} /> {tiers.length} tier{tiers.length>1?"s":""} · {tierTotalCapacity} total tickets
                  </div>
                )}
              </div>
            )}

            {!isMultiDay && !useTiers && (
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
                      className={`px-3.5 py-2 rounded-full border font-mono text-xs font-semibold transition-colors ${currency===c.code ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-transparent text-brand-muted"}`}>
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
                {[["upload",Camera,"Upload"],["url",Link2,"URL"]].map(([v,Icon,l]) => (
                  <div key={v} onClick={() => setImgType(v)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-center cursor-pointer text-[13px] font-semibold border transition-colors ${imgType===v ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-transparent text-brand-muted"}`}>
                    <Icon size={14} strokeWidth={1.75} /> {l}
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
                  <label htmlFor="ev-img" className="block p-7 bg-brand-canvas border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer">
                    {addEventForm.image?.startsWith("data:")||addEventForm.image?.startsWith("http") ? (
                      <>
                        <img src={addEventForm.image} alt="preview" className="w-full h-40 object-cover object-top rounded-lg mb-2" />
                        <div className="flex items-center justify-center gap-1.5 text-fintech-green text-[13px] font-semibold"><CheckCircle2 size={14} strokeWidth={2} /> Image ready — click to change</div>
                      </>
                    ) : (
                      <>
                        <Camera size={26} strokeWidth={1.5} className="text-brand-muted mx-auto mb-2" />
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
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-fintech-slate/5 border border-fintech-slate/15 rounded-xl px-4 py-3 mt-5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-fintech-slate tracking-wide font-mono mb-1"><Link2 size={11} strokeWidth={2} /> EVENT URL</div>
              <div className="font-mono text-xs text-brand-text break-all">{eventUrl}</div>
            </motion.div>
          )}

          <div className="flex gap-2 flex-wrap mt-5 mb-6">
            {evType==="paid" && <span className="flex items-center gap-1.5 text-xs text-fintech-green bg-pastel-green px-3 py-1.5 rounded-lg font-medium"><Wallet size={12} strokeWidth={1.75} /> 95% revenue to you</span>}
            {evType==="free" && <span className="flex items-center gap-1.5 text-xs text-fintech-green bg-pastel-green px-3 py-1.5 rounded-lg font-medium"><PartyPopper size={12} strokeWidth={1.75} /> Free · QR pass via email</span>}
            {isMultiDay && <span className="flex items-center gap-1.5 text-xs text-fintech-blue bg-pastel-blue px-3 py-1.5 rounded-lg font-medium"><Calendar size={12} strokeWidth={1.75} /> Attendees pick their day(s)</span>}
            {useTiers && tiers.length > 0 && <span className="flex items-center gap-1.5 text-xs text-brand-orange bg-pastel-orange px-3 py-1.5 rounded-lg font-medium"><Crown size={12} strokeWidth={1.75} /> {tiers.length} ticket tiers</span>}
            <span className="flex items-center gap-1.5 text-xs text-fintech-blue bg-pastel-blue px-3 py-1.5 rounded-lg font-medium"><Link2 size={12} strokeWidth={1.75} /> NFT on Polygon</span>
          </div>

          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={submit}
            className="w-full py-4 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-base transition-colors">
            Create {isMultiDay?"Multi-Day ":""}{evType==="free"?"Free":"Paid"} Event
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER EVENT DETAIL — width-constrained
// ═══════════════════════════════════════════════════════════════
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
  // Admitted count — computed from live ticket-holder statuses, not a local counter. Do not revert.
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

  const sClass = { active:"text-fintech-green bg-pastel-green", redeemed:"text-gray-600 bg-gray-100", resale:"text-red-600 bg-red-50", transferred:"text-fintech-blue bg-pastel-blue" };
  const sLabel = { active:"Active", redeemed:"Redeemed", resale:"Resale", transferred:"Transferred" };

  const editChip = (active) => `px-3 py-1.5 rounded-full cursor-pointer text-[11px] font-medium border transition-colors ${
    active ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-transparent text-brand-muted"
  }`;

  if (editing) return (
    <div className="bg-brand-canvas h-full flex flex-col overflow-hidden font-sans">
      <div className="shrink-0 flex items-center px-4.5 px-4 py-3 gap-3 bg-white border-b border-gray-100">
        <button onClick={() => setEditing(false)}
          className="w-8 h-8 rounded-lg bg-transparent border border-gray-200 flex items-center justify-center text-brand-text hover:border-gray-300 transition-colors">
          <ArrowLeft size={15} strokeWidth={2} />
        </button>
        <div className="flex-1 text-[15px] font-semibold text-brand-text">Edit Event</div>
        <button onClick={saveEdit}
          className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-xs font-bold transition-colors">Save Changes</button>
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
                  className={`px-2.5 py-1.5 rounded-full border font-mono text-[10px] font-semibold transition-colors ${editForm.currency===c.code ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-transparent text-brand-muted"}`}>
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
                  className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer text-xs font-medium border transition-colors ${editImgType===v ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-transparent text-brand-muted"}`}>
                  {l}
                </div>
              ))}
            </div>
            {editImgType==="upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="edit-img" className="hidden"
                  onChange={e => { const f=e.target.files[0]; if(!f) return; const cv=document.createElement("canvas"); const im=new Image(); const u=URL.createObjectURL(f); im.onload=()=>{const M=1200;let w=im.width,h=im.height;if(w>M){h=Math.round(h*M/w);w=M;}cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);setEditForm(p=>({...p,image:cv.toDataURL("image/jpeg",0.82)}));URL.revokeObjectURL(u);};im.src=u; }} />
                <label htmlFor="edit-img" className="block p-4 bg-white border-2 border-dashed border-brand-orange/30 rounded-xl text-center cursor-pointer">
                  {editForm.image ? (
                    <>
                      <img src={editForm.image} alt="p" className="w-full h-28 object-cover object-top rounded-lg mb-1.5" />
                      <div className="flex items-center justify-center gap-1 text-fintech-green text-xs"><CheckCircle2 size={12} strokeWidth={2} /> Click to change</div>
                    </>
                  ) : (
                    <>
                      <Camera size={20} strokeWidth={1.5} className="text-brand-muted mx-auto mb-1.5" />
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
                <input type={t} value={editForm[k]??""} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))} className={inputClass(false)} style={{ colorScheme:"light" }} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3.5 py-3 bg-white border border-gray-100 rounded-xl mb-4">
            <div>
              <div className="text-[13px] font-medium text-brand-text">Ticket Sales</div>
              <div className="text-[11px] text-brand-muted">Currently {ev.salesOpen?"open":"paused"}</div>
            </div>
            <button onClick={() => toggleSales(ev.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${ev.salesOpen ? "bg-red-50 text-red-600 border-red-100" : "bg-pastel-green text-fintech-green border-fintech-green/20"}`}>
              {ev.salesOpen ? <><Pause size={12} strokeWidth={2} /> Pause</> : <><Play size={12} strokeWidth={2} /> Resume</>}
            </button>
          </div>
          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={saveEdit}
            className={`py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-[13px] font-bold transition-colors ${isDesk ? "px-6 w-auto" : "w-full"}`}>
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
            className="absolute top-3 left-3.5 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-text">
            <ArrowLeft size={15} strokeWidth={2} />
          </button>
          <button onClick={startEdit}
            className="absolute top-3 right-3.5 px-3 py-1.5 bg-white shadow-sm rounded-full text-brand-text text-[11px] font-semibold">Edit</button>
          <div className="absolute bottom-3 left-3.5 flex gap-1.5">
            <span className="bg-brand-text text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">NFT</span>
            {isFree && <span className="bg-fintech-green text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">FREE</span>}
          </div>
        </div>

        <div className="bg-white border-b border-gray-100" style={{ padding: isDesk ? "16px 40px" : "12px 14px" }}>
          <div className="text-[10px] font-medium text-brand-muted tracking-wide mb-1 font-mono">{(ev.category||"").toUpperCase()} · {ev.country||"GHANA"}</div>
          <div className={`font-bold text-brand-text tracking-tight mb-0.5 ${isDesk ? "text-[22px]" : "text-lg"}`}>{ev.name}</div>
          <div className="flex items-center gap-1 text-xs text-brand-muted font-mono">
            <MapPin size={11} strokeWidth={1.75} /> {ev.venue} · <Calendar size={11} strokeWidth={1.75} /> {ev.date}
          </div>
        </div>

        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 flex" style={{ padding: `0 ${isDesk?"40px":"14px"}` }}>
          {[{id:"overview",label:"Overview",Icon:LayoutDashboard},{id:"holders",label:"Ticket Holders",Icon:Users,count:ev.ticketsSold}].map(t => (
            <button key={t.id} onClick={() => onTab(t.id)}
              className={`px-3.5 py-3 bg-transparent border-0 border-b-2 flex items-center gap-1.5 text-[13px] transition-colors ${activeTab===t.id ? "border-brand-orange text-brand-orange font-semibold" : "border-transparent text-brand-muted font-normal"}`}>
              <t.Icon size={14} strokeWidth={1.75} /> {t.label}
              {t.count!==undefined && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono ${activeTab===t.id ? "bg-pastel-orange text-brand-orange" : "bg-gray-100 text-brand-muted"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {activeTab==="overview" && (
          <div style={{ padding: PAD }}>
            <div className="pt-5">
              <div className={`grid gap-2.5 mb-4 ${isDesk ? "grid-cols-4" : "grid-cols-2"}`}>
                {(isFree ? [
                  [PartyPopper,"Registered",(ev.regs||ev.ticketsSold).toLocaleString(),"text-fintech-blue"],
                  [Ticket,"Capacity",ev.totalTickets.toLocaleString(),"text-brand-text"],
                  [CheckCircle2,"Checked In",admittedCount+" ppl","text-fintech-green"],
                  [Calendar,"Date",ev.date,"text-fintech-blue"],
                ] : [
                  [Wallet,"Revenue (95%)",`${curr} ${revenue.toLocaleString()}`,"text-fintech-green"],
                  [Landmark,"Platform Fee",`${curr} ${fee.toLocaleString()}`,"text-red-600"],
                  [Ticket,"Sold",`${ev.ticketsSold}/${ev.totalTickets}`,"text-fintech-blue"],
                  [DoorOpen,"Admitted",admittedCount+" ppl","text-brand-orange"],
                ]).map(([Icon,label,value,color]) => (
                  <motion.div key={label} whileHover={{ y:-1 }} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                    <Icon size={15} strokeWidth={1.75} className={`${color} mb-1.5`} />
                    <div className={`text-lg font-bold mb-0.5 tracking-tight ${color}`}>{value}</div>
                    <div className="text-[11px] text-brand-muted">{label}</div>
                  </motion.div>
                ))}
              </div>

              <Panel className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] font-medium text-brand-text">{isFree?"Registration":"Sales"} Progress</span>
                  <span className={`text-[13px] font-bold font-mono ${pctColorClass(pct)}`}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.9 }} className={`h-full rounded-full ${pctBarClass(pct)}`} />
                </div>
                <div className="text-[11px] text-brand-muted mt-1.5">{ev.totalTickets-ev.ticketsSold} {isFree?"spots":"tickets"} remaining</div>
              </Panel>

              <Panel className="mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-fintech-slate font-mono mb-2"><Link2 size={11} strokeWidth={2} /> EVENT URL</div>
                <div className="font-mono text-[11px] text-brand-text bg-brand-canvas px-2.5 py-1.5 rounded-lg border border-gray-100 mb-2.5 break-all">{evUrl}</div>
                <button onClick={copyLink}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${copiedLink ? "bg-pastel-green text-fintech-green border-fintech-green/20" : "bg-pastel-orange text-brand-orange border-brand-orange/20"}`}>
                  {copiedLink ? <><Check size={12} strokeWidth={2} /> Copied</> : <><Copy size={12} strokeWidth={1.75} /> Copy Link</>}
                </button>
              </Panel>

              {ev.description && (
                <Panel className="mb-3">
                  <div className="text-[10px] font-semibold text-brand-muted font-mono mb-2">DESCRIPTION</div>
                  <div className="text-[13px] text-brand-muted leading-relaxed">{ev.description}</div>
                </Panel>
              )}

              <div className={`grid gap-2 mb-3.5 ${isDesk ? "grid-cols-2" : "grid-cols-1"}`}>
                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => toggleSales(ev.id)}
                  className={`py-3 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 transition-colors ${ev.salesOpen ? "bg-red-600 hover:bg-red-700" : "bg-fintech-green hover:bg-emerald-600"}`}>
                  {ev.salesOpen ? <><Pause size={14} strokeWidth={2} /> Pause {isFree?"Registrations":"Sales"}</> : <><Play size={14} strokeWidth={2} /> Resume {isFree?"Registrations":"Sales"}</>}
                </motion.button>
                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("scanTicket")}
                  className="py-3 bg-white text-brand-text border border-gray-200 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 hover:border-gray-300 transition-colors">
                  <ScanLine size={14} strokeWidth={1.75} /> Scan at Door
                </motion.button>
              </div>

              <Panel>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-pastel-orange flex items-center justify-center">
                    <DoorOpen size={15} strokeWidth={1.75} className="text-brand-orange" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-text">Door Staff Access</div>
                    <div className="text-[10px] text-brand-muted font-mono">Single-use codes · expire after first scan</div>
                  </div>
                </div>
                <button onClick={() => generateDoorCode(ev.id,ev.name)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-pastel-orange text-brand-orange border border-dashed border-brand-orange/40 rounded-lg text-xs font-semibold mb-2.5 hover:bg-orange-100 transition-colors">
                  <Plus size={13} strokeWidth={2} /> Generate Access Code
                </button>
                {invites.map(inv => (
                  <div key={inv.code} onClick={() => copyCode(inv.code)}
                    className={`rounded-lg px-3 py-2.5 mb-1.5 flex justify-between items-center cursor-pointer border ${inv.used ? "bg-brand-canvas border-gray-100" : "bg-pastel-orange border-brand-orange/20"}`}>
                    <span className={`font-mono font-bold text-[13px] tracking-wider ${inv.used ? "text-brand-muted" : "text-brand-orange"}`}>{inv.code}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`text-[9px] font-bold font-mono ${inv.used ? "text-brand-muted" : "text-fintech-green"}`}>{inv.used?"USED":"ACTIVE"}</span>
                      {!inv.used && <span className={`text-[9px] font-mono ${copiedCode===inv.code ? "text-fintech-green" : "text-brand-muted"}`}>{copiedCode===inv.code?"COPIED":"TAP TO COPY"}</span>}
                    </div>
                  </div>
                ))}
                <div className="flex gap-1.5 items-center mt-1 px-2.5 py-2 rounded-lg bg-pastel-blue border border-fintech-blue/15">
                  <Lock size={12} strokeWidth={1.75} className="text-fintech-blue shrink-0" />
                  <span className="text-[11px] text-fintech-blue font-medium">Door staff can scan only — no event management access</span>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeTab==="holders" && (
          <div style={{ padding: PAD }}>
            <div className="pt-4">
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                {[[Ticket,holders.filter(t=>t.status==="active").length,"Active","text-fintech-green"],[CheckCircle2,holders.filter(t=>t.status==="redeemed").length,"Redeemed","text-gray-500"],[Tag,holders.filter(t=>t.status==="resale").length,"On Resale","text-red-600"]].map(([Icon,count,label,color]) => (
                  <Panel key={label} className="text-center py-3 px-2.5">
                    <Icon size={16} strokeWidth={1.75} className={`${color} mx-auto mb-1`} />
                    <div className={`text-lg font-bold ${color}`}>{holderLoad?"—":count}</div>
                    <div className="text-[10px] text-brand-muted mt-0.5">{label}</div>
                  </Panel>
                ))}
              </div>
              <div className="relative mb-3">
                <Search size={13} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input value={holderSearch} onChange={e=>setHolderSearch(e.target.value)} placeholder="Search name, email or ticket ID..."
                  className={`${inputClass(false)} pl-9`} />
                {holderSearch && (
                  <button onClick={()=>setHolderSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                    <X size={13} strokeWidth={2} />
                  </button>
                )}
              </div>
              {holderLoad ? (
                <div className="flex flex-col gap-1.5">{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{ height:"54px", borderRadius:"12px" }} />)}</div>
              ) : filtered.length===0 ? (
                <Panel className="text-center py-12 px-5">
                  <div className="w-11 h-11 rounded-full bg-pastel-orange flex items-center justify-center mx-auto mb-2.5">
                    <Users size={20} strokeWidth={1.75} className="text-brand-orange" />
                  </div>
                  <div className="text-sm font-semibold text-brand-text mb-1">{holderSearch?"No results":"No ticket holders yet"}</div>
                  <div className="text-xs text-brand-muted">{holderSearch?"Try a different search":"Holders will appear here once tickets are purchased"}</div>
                </Panel>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {isDesk && (
                    <div className="grid gap-2.5 px-3.5 py-1" style={{ gridTemplateColumns:"1fr 1fr 80px 100px" }}>
                      {["HOLDER","TICKET ID","QTY","STATUS"].map(h => <span key={h} className="text-[9px] font-semibold text-brand-muted tracking-wide font-mono">{h}</span>)}
                    </div>
                  )}
                  {filtered.map((t,i) => {
                    const name  = ((t.owner?.first_name||"")+" "+(t.owner?.last_name||"")).trim()||"Unknown";
                    const email = t.owner?.email||"—";
                    const cls   = sClass[t.status]||"text-gray-600 bg-gray-100";
                    const lbl   = sLabel[t.status]||t.status;
                    return (
                      <motion.div key={t.ticket_id||i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.02 }}
                        className={`bg-white rounded-xl px-3.5 py-2.5 border border-gray-100 items-center gap-2.5 hover:border-gray-200 transition-colors ${isDesk ? "grid" : "flex"}`}
                        style={isDesk ? { gridTemplateColumns:"1fr 1fr 80px 100px" } : undefined}>
                        <div className={`min-w-0 ${isDesk ? "" : "flex-1"}`}>
                          <div className="text-xs font-semibold text-brand-text truncate mb-0.5">
                            {name}
                            {t.is_resale && <span className="ml-1.5 text-[8px] font-bold text-fintech-slate bg-gray-100 px-1.5 py-0.5 rounded">RESALE</span>}
                          </div>
                          <div className="text-[10px] text-brand-muted truncate">{email}</div>
                        </div>
                        <div className={`font-mono text-[9px] text-brand-muted truncate ${isDesk ? "block" : "hidden"}`}>
                          {String(t.ticket_id||"").slice(0,14)}…
                          {t.nft_token_id && <div className="text-[8px] text-fintech-slate mt-0.5">NFT #{t.nft_token_id}</div>}
                        </div>
                        <div className={isDesk ? "block" : "hidden"}>
                          <span className="text-xs font-semibold text-brand-orange font-mono">×{t.quantity||1}</span>
                        </div>
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded font-mono whitespace-nowrap ${cls}`}>{lbl.toUpperCase()}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div className="text-center py-2.5 text-[10px] text-brand-muted font-mono">
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