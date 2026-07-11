import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const C = {
  bg:       "var(--bg)",
  card:     "var(--bg-card)",
  border:   "var(--border)",
  text:     "var(--text-primary)",
  sub:      "var(--text-secondary)",
  muted:    "var(--text-muted)",
  accent:   "#F97316",
  accentD:  "#EA6C0A",
  accentBg: "rgba(249,115,22,0.07)",
  green:    "#22c55e",
  greenBg:  "rgba(34,197,94,0.08)",
  blue:     "#3b82f6",
  blueBg:   "rgba(59,130,246,0.08)",
  purple:   "#8b5cf6",
  purpleBg: "rgba(139,92,246,0.08)",
  red:      "#ef4444",
  redBg:    "rgba(239,68,68,0.08)",
  shadow:   "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
  shadowLg: "0 10px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
};

const FONT = "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace";

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

const catImg = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const catColor = {
  music:"#ec4899", tech:"#3b82f6", food:"#f59e0b",
  arts:"#8b5cf6", sports:"#22c55e", business:"#06b6d4", other:"#F97316",
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

const INP = (err) => ({
  width: "100%", padding: "10px 14px",
  background: C.card, border: `1.5px solid ${err ? C.red : C.border}`,
  borderRadius: "8px", fontSize: "14px", color: C.text,
  outline: "none", fontFamily: FONT, boxSizing: "border-box",
  caretColor: C.accent, transition: "border-color 0.15s, box-shadow 0.15s",
});
const focusI = e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentBg}`; };
const blurI  = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

const AE_INPUT = (err) => ({
  width: "100%", padding: "11px 14px", outline: "none",
  background: C.bg, border: `1.5px solid ${err ? C.red : C.border}`,
  borderRadius: "10px", fontSize: "14px", color: C.text,
  fontFamily: FONT, boxSizing: "border-box", transition: "all 0.2s",
});
const AE_FOCUS = e => { e.target.style.borderColor = C.accent; e.target.style.background = C.accentBg; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.1)`; };
const AE_BLUR  = e => { e.target.style.borderColor = C.border; e.target.style.background = C.bg; e.target.style.boxShadow = "none"; };
const AE_LABEL = (err) => ({
  display: "block", fontSize: "11px", fontWeight: 600,
  color: err ? C.red : C.muted,
  marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase",
});

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
function Sparkline({ data = [], color = C.accent, height = 32, width = 80 }) {
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
function Ring({ pct = 0, size = 44, color = C.accent, bg = C.border }) {
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

// ── Event card (fintech-style, image-first) ───────────────────
function EventCard({ ev, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isFree = ev.event_type === "free";
  const pct    = ev.totalTickets > 0 ? Math.round((ev.ticketsSold/ev.totalTickets)*100) : 0;
  const rev    = Math.round(ev.ticketsSold * ev.price * 0.95);
  const accent = catColor[ev.category] || C.accent;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: C.shadowLg }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card, borderRadius: "18px", overflow: "hidden",
        border: `1px solid ${hovered ? accent+"40" : C.border}`,
        cursor: "pointer", transition: "all 0.22s ease",
        boxShadow: C.shadowMd, minWidth: "220px", width: "100%",
      }}>

      {/* Cover image */}
      <div style={{ height: "140px", position: "relative", overflow: "hidden" }}>
        <motion.img src={ev.image} alt={ev.name}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.4 }}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.src = catImg.other; }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)" }} />

        {/* Badges */}
        <div style={{ position:"absolute", top:"10px", left:"10px", display:"flex", gap:"5px" }}>
          <span style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"3px 8px", borderRadius:"99px", fontFamily:MONO }}>
            {ev.category.toUpperCase()}
          </span>
          {isFree && <span style={{ background:"rgba(34,197,94,0.9)", backdropFilter:"blur(8px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"3px 8px", borderRadius:"99px", fontFamily:MONO }}>FREE</span>}
        </div>

        {/* Live dot */}
        <div style={{ position:"absolute", top:"10px", right:"10px", display:"flex", alignItems:"center", gap:"4px", background: ev.salesOpen ? "rgba(34,197,94,0.85)" : "rgba(107,114,128,0.8)", backdropFilter:"blur(8px)", padding:"3px 8px", borderRadius:"99px" }}>
          {ev.salesOpen && <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#fff" }} />}
          <span style={{ fontSize:"8px", fontWeight:700, color:"#fff", fontFamily:MONO }}>{ev.salesOpen?"LIVE":"CLOSED"}</span>
        </div>

        {/* NFT badge bottom */}
        <div style={{ position:"absolute", bottom:"10px", left:"10px", display:"flex", alignItems:"center", gap:"3px", background:"rgba(139,92,246,0.85)", backdropFilter:"blur(8px)", padding:"2px 7px", borderRadius:"99px" }}>
          <span style={{ fontSize:"7px" }}>⛓️</span>
          <span style={{ fontSize:"7px", fontWeight:700, color:"#fff", fontFamily:MONO }}>NFT</span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding:"14px 16px 16px" }}>
        <div style={{ fontWeight:700, fontSize:"13px", color:C.text, marginBottom:"3px", letterSpacing:"-0.2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {ev.name}
        </div>
        <div style={{ fontSize:"11px", color:C.muted, marginBottom:"12px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:MONO }}>
          📅 {ev.date} · 📍 {ev.city}
        </div>

        {/* Stats row with ring */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:"16px", fontWeight:800, color: isFree ? C.green : C.accent, letterSpacing:"-0.5px", lineHeight:1 }}>
              {isFree ? `${(ev.regs||ev.ticketsSold).toLocaleString()} reg` : `${ev.currency} ${rev.toLocaleString()}`}
            </div>
            <div style={{ fontSize:"10px", color:C.muted, marginTop:"3px", fontFamily:MONO }}>
              {ev.ticketsSold}/{ev.totalTickets} · {pct}% full
            </div>
          </div>
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ring pct={pct} size={44} color={pct > 80 ? C.red : accent} />
            <span style={{ position:"absolute", fontSize:"9px", fontWeight:700, color: pct > 80 ? C.red : accent, fontFamily:MONO }}>
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Activity feed ─────────────────────────────────────────────
function ActivityFeed({ events }) {
  const [feed,  setFeed]  = useState([]);
  const [pulse, setPulse] = useState(false);
  const ref = useRef(false);

  useEffect(() => {
    if (!events.length || ref.current) return;
    ref.current = true;
    const types = [
      ev => ({ icon:"🎟", color:C.green,  label:"Ticket purchased",       detail:`×${Math.ceil(Math.random()*3)} · ${ev.name}`,            ts:`${Math.floor(Math.random()*55)+1}m ago` }),
      ev => ({ icon:"🔄", color:C.blue,   label:"Ticket transferred",      detail:ev.name,                                                   ts:`${Math.floor(Math.random()*3)+1}h ago`  }),
      ev => ({ icon:"⛓",  color:C.purple, label:"NFT minted on Polygon",   detail:`Token #${Math.floor(Math.random()*9000)+1000}`,           ts:`${Math.floor(Math.random()*5)+1}h ago`  }),
      ev => ({ icon:"💰", color:C.accent, label:"Payout queued",           detail:`${ev.currency||"GHS"} ${Math.round(ev.price*Math.ceil(Math.random()*4)*0.95).toLocaleString()}`, ts:`${Math.floor(Math.random()*8)+2}h ago` }),
    ];
    const initial = [];
    for (let i = 0; i < Math.min(8, events.length * 3); i++) {
      const ev = events[Math.floor(Math.random() * events.length)];
      initial.push({ id: i, ...types[Math.floor(Math.random() * types.length)](ev) });
    }
    setFeed(initial);
    const tick = () => {
      const ev = events[Math.floor(Math.random() * events.length)];
      setFeed(prev => [{ id:Date.now(), ...types[0](ev), ts:"just now" }, ...prev].slice(0, 12));
      setPulse(true); setTimeout(() => setPulse(false), 1200);
      setTimeout(tick, 8000 + Math.random() * 7000);
    };
    const t = setTimeout(tick, 5000 + Math.random() * 5000);
    return () => clearTimeout(t);
  }, [events.length]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
        <motion.div animate={{ opacity: pulse ? [1,0.3,1] : 1 }}
          style={{ width:"7px", height:"7px", borderRadius:"50%", background:C.green }} />
        <span style={{ fontSize:"10px", fontWeight:700, color:C.green, fontFamily:MONO, letterSpacing:"1px" }}>LIVE ACTIVITY</span>
      </div>
      <AnimatePresence initial={false}>
        {feed.map(item => (
          <motion.div key={item.id}
            initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, height:0 }} transition={{ duration:0.22 }}
            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", background:C.bg, borderRadius:"10px", border:`1px solid ${C.border}` }}>
            <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:item.color+"12", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>{item.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"12px", fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</div>
              <div style={{ fontSize:"10px", color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.detail}</div>
            </div>
            <span style={{ fontSize:"9px", color:C.muted, fontFamily:MONO, flexShrink:0 }}>{item.ts}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {!feed.length && <div style={{ padding:"24px", textAlign:"center", color:C.muted, fontSize:"13px" }}>Activity will appear once events are live</div>}
    </div>
  );
}

// ── Fill chart ────────────────────────────────────────────────
function FillChart({ events }) {
  if (!events.length) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
      {events.map(e => {
        const pct = e.totalTickets > 0 ? Math.round((e.ticketsSold/e.totalTickets)*100) : 0;
        const col = pct >= 85 ? C.red : pct >= 55 ? C.accent : C.green;
        return (
          <div key={e.id}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", minWidth:0 }}>
                <span style={{ fontSize:"9px", fontWeight:700, color:e.event_type==="free"?C.green:C.accent, background:e.event_type==="free"?C.greenBg:C.accentBg, padding:"2px 6px", borderRadius:"4px", fontFamily:MONO, flexShrink:0 }}>
                  {e.event_type==="free"?"FREE":e.currency}
                </span>
                <span style={{ fontSize:"12px", fontWeight:500, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</span>
              </div>
              <span style={{ fontSize:"12px", fontWeight:700, color:col, fontFamily:MONO, flexShrink:0, marginLeft:"8px" }}>{pct}%</span>
            </div>
            <div style={{ height:"5px", background:C.border, borderRadius:"99px", overflow:"hidden" }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${Math.max(1,pct)}%` }} transition={{ duration:0.7, ease:"easeOut" }}
                style={{ height:"100%", background:`linear-gradient(90deg,${col},${col}cc)`, borderRadius:"99px" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Panel shell ───────────────────────────────────────────────
function Panel({ children, style = {} }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"20px 22px", boxShadow:C.shadow, ...style }}>
      {children}
    </div>
  );
}

// ── Section head ──────────────────────────────────────────────
function SectionHead({ label, title, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"18px" }}>
      <div>
        {label && <div style={{ fontSize:"10px", fontWeight:600, color:C.accent, letterSpacing:"1.5px", marginBottom:"3px", fontFamily:MONO }}>{label}</div>}
        <h2 style={{ fontSize:"18px", fontWeight:700, color:C.text, letterSpacing:"-0.4px", margin:0, fontFamily:FONT }}>{title}</h2>
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
    <motion.div whileHover={{ borderColor:C.accent+"40", y:-1 }} whileTap={{ scale:0.99 }} onClick={onClick}
      style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"14px", overflow:"hidden", cursor:"pointer", boxShadow:C.shadow, transition:"all 0.18s", display:"flex", flexDirection:tab()?"row":"column" }}>
      <div style={{ width:tab()?"160px":"100%", height:tab()?"100%":"120px", minHeight:tab()?"80px":"120px", position:"relative", flexShrink:0 }}>
        <img src={ev.image} alt={ev.name} onError={e=>{e.target.src=catImg.other}} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.1))" }} />
        <div style={{ position:"absolute", top:"8px", left:"8px", display:"flex", gap:"4px" }}>
          <span style={{ background:"rgba(139,92,246,0.9)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"2px 6px", borderRadius:"4px", fontFamily:MONO }}>NFT</span>
          {isFree && <span style={{ background:"rgba(34,197,94,0.9)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"2px 6px", borderRadius:"4px", fontFamily:MONO }}>FREE</span>}
        </div>
        <div style={{ position:"absolute", top:"8px", right:"8px", background:ev.salesOpen?"rgba(34,197,94,0.9)":"rgba(107,114,128,0.9)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"2px 7px", borderRadius:"4px", fontFamily:MONO, display:"flex", alignItems:"center", gap:"4px" }}>
          {ev.salesOpen && <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#fff" }} />}
          {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
      </div>
      <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <div>
          <div style={{ fontSize:"10px", fontWeight:500, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"4px", fontFamily:MONO }}>{ev.category} · {ev.country}</div>
          <div style={{ fontSize:"15px", fontWeight:700, color:C.text, letterSpacing:"-0.3px", marginBottom:"4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.name}</div>
          <div style={{ fontSize:"12px", color:C.muted, marginBottom:"12px" }}>📍 {ev.venue} · 📅 {ev.date}</div>
        </div>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
            <span style={{ fontSize:"13px", fontWeight:700, color:C.green, fontFamily:MONO }}>
              {isFree ? `${(ev.regs||ev.ticketsSold).toLocaleString()} registered` : `${ev.currency} ${Math.round(ev.ticketsSold*ev.price*0.95).toLocaleString()}`}
            </span>
            <span style={{ fontSize:"10px", color:C.muted, fontFamily:MONO }}>{ev.ticketsSold}/{ev.totalTickets} · {pct}%</span>
          </div>
          <div style={{ height:"4px", background:C.border, borderRadius:"2px", overflow:"hidden" }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.7, ease:"easeOut" }}
              style={{ height:"100%", background:pct>80?C.red:`linear-gradient(90deg,${C.accent},${C.accentD})`, borderRadius:"2px" }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER HOME — FINTECH REVAMP
// ═══════════════════════════════════════════════════════════════
export function OrganizerHome() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setScreen          = useStore(s => s.setScreen);
  const setActiveTab       = useStore(s => s.setActiveTab);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser        = useStore(s => s.currentUser);
  const [loading,    setLoading]    = useState(true);
  const [isDesk,     setIsDesk]     = useState(desk());
  const [statsView,  setStatsView]  = useState("all"); // "all" | event id
  const [dropOpen,   setDropOpen]   = useState(false);

  useEffect(() => {
    eventsAPI.myEvents()
      .then(d => { if (Array.isArray(d)) setOrgEvents(d.map(mapEvent)); setLoading(false); })
      .catch(() => setLoading(false));
    const r = () => setIsDesk(desk());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  // Stats source — all events or single event
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

  const PAD = isDesk ? "28px 40px 80px" : "16px 16px 100px";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background:C.bg, minHeight:"100%", padding:PAD, fontFamily:FONT }} onClick={() => setDropOpen(false)}>

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <p style={{ fontSize:"12px", color:C.muted, margin:"0 0 4px", fontFamily:MONO, letterSpacing:"0.5px" }}>ORGANIZER DASHBOARD</p>
          <h1 style={{ fontSize:isDesk?"26px":"20px", fontWeight:800, color:C.text, letterSpacing:"-0.7px", margin:"0 0 2px", fontFamily:FONT }}>
            {isDesk ? `${greeting}, ${currentUser?.first_name} 👋` : `Hi ${currentUser?.first_name} 👋`}
          </h1>
          <p style={{ fontSize:"13px", color:C.muted, margin:0 }}>
            {orgEvents.length} event{orgEvents.length!==1?"s":""} · {live} live · {orgEvents.reduce((s,e)=>s+e.ticketsSold,0).toLocaleString()} tickets sold
          </p>
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"5px 10px", borderRadius:"8px", background:C.purpleBg, border:`1px solid ${C.purple}25` }}>
            <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:2, repeat:Infinity }} style={{ width:"5px", height:"5px", borderRadius:"50%", background:C.purple }} />
            <span style={{ fontSize:"10px", fontWeight:600, color:C.purple, fontFamily:MONO }}>POLYGON</span>
          </div>
          {isDesk && (
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
              style={{ padding:"9px 18px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:FONT, boxShadow:`0 2px 12px ${C.accent}35` }}>
              + Create Event
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:tab()?"repeat(4,1fr)":"1fr 1fr", gap:"12px", marginBottom:"24px" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:"110px", borderRadius:"16px" }} />)}
        </div>
      ) : (
        <>
          {/* ── Stats toggle dropdown ── */}
          <div style={{ marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
            <div style={{ fontSize:"11px", fontWeight:600, color:C.muted, fontFamily:MONO }}>VIEWING STATS FOR:</div>
            <div style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
              <motion.button whileTap={{ scale:0.97 }} onClick={() => setDropOpen(!dropOpen)}
                style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 14px", background:C.card, border:`1.5px solid ${dropOpen?C.accent:C.border}`, borderRadius:"10px", cursor:"pointer", fontFamily:FONT, fontSize:"13px", fontWeight:600, color:C.text, boxShadow:C.shadow }}>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: statsView==="all" ? C.accent : C.green, flexShrink:0 }} />
                {statsView === "all" ? "All Events" : selectedEvent?.name || "Select event"}
                <span style={{ color:C.muted, fontSize:"10px", marginLeft:"2px" }}>{dropOpen?"▲":"▼"}</span>
              </motion.button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.97 }}
                    style={{ position:"absolute", top:"calc(100% + 6px)", left:0, minWidth:"220px", background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", boxShadow:C.shadowLg, zIndex:100, overflow:"hidden" }}>
                    {[{ id:"all", name:"All Events" }, ...orgEvents].map(e => (
                      <motion.div key={e.id} whileHover={{ background:C.accentBg }} onClick={() => { setStatsView(String(e.id)); setDropOpen(false); }}
                        style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", cursor:"pointer", background: String(statsView)===String(e.id)?C.accentBg:"transparent", transition:"background 0.12s" }}>
                        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: String(statsView)===String(e.id)?C.accent:C.border, flexShrink:0 }} />
                        <span style={{ fontSize:"13px", fontWeight: String(statsView)===String(e.id)?600:400, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Primary revenue hero card ── */}
          <div style={{ marginBottom:"16px" }}>
            <Panel style={{ background:`linear-gradient(135deg, ${C.card} 0%, ${C.accentBg} 100%)`, border:`1px solid ${C.accent}20`, padding:"24px 28px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"16px" }}>
                <div>
                  <div style={{ fontSize:"11px", fontWeight:600, color:C.muted, fontFamily:MONO, letterSpacing:"1px", marginBottom:"8px" }}>TOTAL REVENUE (95% PAYOUT)</div>
                  <div style={{ fontSize:isDesk?"40px":"32px", fontWeight:900, color:C.accent, letterSpacing:"-1.5px", lineHeight:1, fontFamily:FONT }}>
                    GHS {Math.round(revenue).toLocaleString()}
                  </div>
                  <div style={{ fontSize:"12px", color:C.muted, marginTop:"6px" }}>
                    {sold.toLocaleString()} paid tickets · {regs.toLocaleString()} free registrations
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                  <Sparkline data={revSpark} color={C.accent} height={40} width={100} />
                  <div style={{ fontSize:"10px", color:C.muted, fontFamily:MONO }}>7-day trend</div>
                </div>
              </div>

              {/* Secondary metrics strip */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginTop:"20px", paddingTop:"18px", borderTop:`1px solid ${C.border}` }}>
                {[
                  { label:"TICKETS SOLD", value:sold.toLocaleString(), sub:"paid tickets", color:C.blue, spark:soldSpark },
                  { label:"AVG TICKET PRICE", value:avgPrice ? `GHS ${avgPrice}` : "—", sub:"across paid events", color:C.purple },
                  { label:"LIVE NOW", value:live, sub:`of ${orgEvents.length} total events`, color:C.green },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize:"9px", fontWeight:600, color:C.muted, fontFamily:MONO, letterSpacing:"0.8px", marginBottom:"4px" }}>{m.label}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ fontSize:"18px", fontWeight:800, color:m.color, letterSpacing:"-0.5px", fontFamily:FONT }}>{m.value}</div>
                      {m.spark && <Sparkline data={m.spark} color={m.color} height={20} width={48} />}
                    </div>
                    <div style={{ fontSize:"10px", color:C.muted, marginTop:"2px" }}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* ── Event cards carousel / grid ── */}
          {orgEvents.length > 0 && (
            <div style={{ marginBottom:"24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
                <div>
                  <div style={{ fontSize:"10px", fontWeight:600, color:C.accent, letterSpacing:"1.5px", fontFamily:MONO, marginBottom:"2px" }}>YOUR EVENTS</div>
                  <div style={{ fontSize:"16px", fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>Event Portfolio</div>
                </div>
                {!isDesk && (
                  <motion.button whileTap={{ scale:0.96 }} onClick={() => setScreen("addEvent")}
                    style={{ padding:"7px 14px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"8px", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
                    + New
                  </motion.button>
                )}
              </div>

              {/* Horizontally scrollable card row on mobile, grid on desktop */}
              {isDesk ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"16px" }}>
                  {orgEvents.map((ev,i) => (
                    <motion.div key={ev.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                      <EventCard ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ display:"flex", gap:"12px", overflowX:"auto", scrollbarWidth:"none", paddingBottom:"4px", margin:"0 -16px", padding:"0 16px 4px" }}>
                  {orgEvents.map((ev,i) => (
                    <motion.div key={ev.id} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                      style={{ minWidth:"200px", width:"200px", flexShrink:0 }}>
                      <EventCard ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Analytics panels ── */}
          {isDesk && orgEvents.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"20px" }}>
              <Panel>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
                  <div>
                    <div style={{ fontSize:"9px", fontWeight:600, color:C.muted, letterSpacing:"1.5px", fontFamily:MONO, marginBottom:"2px" }}>CAPACITY FILL RATE</div>
                    <div style={{ fontSize:"15px", fontWeight:700, color:C.text }}>Ticket Progress</div>
                  </div>
                  <button onClick={() => dlCSV(orgEvents)} style={{ padding:"5px 11px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:"6px", color:C.muted, fontSize:"11px", cursor:"pointer", fontFamily:FONT }}>Export CSV</button>
                </div>
                <FillChart events={src} />
              </Panel>
              <Panel>
                <div style={{ fontSize:"9px", fontWeight:600, color:C.muted, letterSpacing:"1.5px", fontFamily:MONO, marginBottom:"2px" }}>PAYOUT SPLIT</div>
                <div style={{ fontSize:"15px", fontWeight:700, color:C.text, marginBottom:"16px" }}>Earnings Breakdown</div>
                {[
                  { label:"You (95%)",     val:Math.round(revenue),        col:C.green, w:"95%" },
                  { label:"Platform (5%)", val:Math.round(revenue*0.053),  col:C.red,   w:"5%"  },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom:"14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                      <span style={{ fontSize:"12px", fontWeight:500, color:r.col }}>{r.label}</span>
                      <span style={{ fontSize:"12px", fontWeight:700, color:r.col, fontFamily:MONO }}>GHS {r.val.toLocaleString()}</span>
                    </div>
                    <div style={{ height:"5px", background:C.border, borderRadius:"99px", overflow:"hidden" }}>
                      <motion.div initial={{ width:0 }} animate={{ width:r.w }} transition={{ duration:1 }}
                        style={{ height:"100%", background:r.col, borderRadius:"99px" }} />
                    </div>
                  </div>
                ))}
                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => { setActiveTab("wallet"); setScreen("app"); }}
                  style={{ width:"100%", padding:"11px", marginTop:"8px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
                  Withdraw Earnings →
                </motion.button>
              </Panel>
            </div>
          )}

          {isDesk && orgEvents.length > 0 && (
            <Panel style={{ marginBottom:"20px" }}>
              <div style={{ fontSize:"9px", fontWeight:600, color:C.muted, letterSpacing:"1.5px", fontFamily:MONO, marginBottom:"2px" }}>TRANSACTIONS</div>
              <div style={{ fontSize:"15px", fontWeight:700, color:C.text, marginBottom:"14px" }}>Live Activity</div>
              <ActivityFeed events={orgEvents} />
            </Panel>
          )}

          {/* Mobile analytics */}
          {!isDesk && orgEvents.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"20px" }}>
              <Panel>
                <div style={{ fontSize:"9px", fontWeight:600, color:C.muted, letterSpacing:"1.5px", fontFamily:MONO, marginBottom:"12px" }}>FILL RATE</div>
                <FillChart events={src} />
              </Panel>
              <Panel>
                <div style={{ fontSize:"9px", fontWeight:600, color:C.muted, letterSpacing:"1.5px", fontFamily:MONO, marginBottom:"4px" }}>LIVE ACTIVITY</div>
                <ActivityFeed events={orgEvents} />
              </Panel>
            </div>
          )}

          {/* Empty state */}
          {orgEvents.length === 0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ textAlign:"center", padding:"64px 32px", background:C.card, borderRadius:"16px", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎪</div>
              <div style={{ fontSize:"17px", fontWeight:700, color:C.text, marginBottom:"8px" }}>No events yet</div>
              <div style={{ fontSize:"13px", color:C.muted, marginBottom:"20px" }}>Create your first event to start selling NFT-verified tickets on Polygon</div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
                style={{ padding:"12px 28px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:FONT, boxShadow:`0 4px 16px ${C.accent}35` }}>
                + Create Your First Event
              </motion.button>
            </motion.div>
          )}
        </>
      )}
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
    <div style={{ background:C.bg, minHeight:"100%", padding:PAD, fontFamily:FONT }}>
      <SectionHead label="MY EVENTS" title="Events"
        action={<motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("addEvent")}
          style={{ padding:"9px 18px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
          + New Event
        </motion.button>} />
      <div style={{ display:"flex", gap:"4px", marginBottom:"20px", background:C.card, padding:"3px", borderRadius:"10px", border:`1px solid ${C.border}`, width:"fit-content" }}>
        {[["all","All"],["paid","Paid"],["free","Free"],["live","Live"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding:"7px 16px", borderRadius:"8px", border:"none", background:filter===v?`linear-gradient(135deg,${C.accent},${C.accentD})`:"transparent", color:filter===v?"#fff":C.muted, fontWeight:filter===v?600:400, fontSize:"12px", cursor:"pointer", fontFamily:FONT, transition:"all 0.15s" }}>
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:"100px", borderRadius:"14px" }} />)}</div>
      ) : filtered.length===0 ? (
        <Panel style={{ textAlign:"center", padding:"60px" }}>
          <div style={{ fontSize:"36px", marginBottom:"10px" }}>🎪</div>
          <div style={{ fontSize:"15px", fontWeight:600, color:C.text, marginBottom:"6px" }}>No events found</div>
          <div style={{ fontSize:"13px", color:C.muted }}>Try a different filter</div>
        </Panel>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {filtered.map(ev=><EventRow key={ev.id} ev={ev} onClick={()=>{setViewingOrgEvent(ev);setScreen("orgEventDetail");}} />)}
        </div>
      )}
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
    { icon:"⛓", color:C.purple, title:"NFT Tickets Active on Polygon", body:`${sold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length>1?"s":""}. Immutable on-chain.`, time:"LIVE" },
    { icon:"💰", color:C.green,  title:"Revenue Summary", body:`GHS ${Math.round(revenue).toLocaleString()} generated at 95% payout. Withdrawable to MoMo anytime.`, time:"NOW" },
    { icon:"🌍", color:C.blue,   title:"Global Payments Active", body:"MTN MoMo, Paystack, and international card payments are live on all your events.", time:"ACTIVE" },
    { icon:"🔒", color:C.accent, title:"HMAC QR Security", body:"All tickets use rotating HMAC-SHA256 QR codes refreshing every 10 seconds. Screenshot-proof.", time:"ALWAYS" },
  ] : [{ icon:"🔔", color:C.accent, title:"No alerts yet", body:"Create an event and sell tickets to see real-time alerts here.", time:"NOW" }];
  return (
    <div style={{ background:C.bg, minHeight:"100%", padding:isDesk?"28px 40px 80px":"16px 16px 100px", fontFamily:FONT }}>
      <SectionHead label="NOTIFICATIONS" title="Alerts" />
      <div style={{ maxWidth:isDesk?"600px":"100%", display:"flex", flexDirection:"column", gap:"8px" }}>
        {alerts.map((a,i) => (
          <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} whileHover={{ y:-1 }}
            style={{ background:C.card, borderRadius:"12px", padding:"16px 18px", display:"flex", gap:"14px", alignItems:"flex-start", border:`1px solid ${C.border}`, boxShadow:C.shadow, transition:"all 0.15s" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:a.color+"10", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0, border:`1px solid ${a.color}18` }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"13px", fontWeight:600, color:C.text, marginBottom:"4px" }}>{a.title}</div>
              <div style={{ fontSize:"12px", color:C.sub, lineHeight:1.6, marginBottom:"8px" }}>{a.body}</div>
              <span style={{ fontSize:"9px", fontWeight:700, color:a.color, background:a.color+"10", padding:"2px 8px", borderRadius:"4px", fontFamily:MONO }}>{a.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADD EVENT
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

  const validate = () => {
    const e = {};
    if (!addEventForm.name?.trim())                              e.name  = "Required";
    if (!isMultiDay && !addEventForm.date)                       e.date  = "Required";
    if (isMultiDay && eventDates.length < 2)                     e.dates = "Add at least 2 dates";
    if (!addEventForm.venue?.trim())                             e.venue = "Required";
    if (!addEventForm.totalTickets)                              e.total = "Required";
    if (!addEventForm.category)                                  e.cat   = "Select a category";
    if (evType === "paid" && !isMultiDay && !addEventForm.price) e.price = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) return;
    const form = { ...addEventForm, event_type:evType, currency:evType==="free"?"FREE":currency, country, price:evType==="free"?0:addEventForm.price };
    if (isMultiDay) { form.is_multi_day=true; form.event_dates=eventDates; form.date=eventDates[0]?.date||""; }
    setAddEventForm(form);
    handleAddEvent();
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:FONT }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", background:C.card, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>🎟️</div>
          <span style={{ fontWeight:700, fontSize:"15px", color:C.text, letterSpacing:"-0.3px" }}>Create Event</span>
        </div>
        <motion.button whileTap={{ scale:0.95 }} onClick={() => setScreen("app")}
          style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:"8px", padding:"7px 14px", color:C.muted, fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:FONT }}>
          ← Back
        </motion.button>
      </div>

      <div style={{ maxWidth:"800px", margin:"0 auto", padding:isDesk?"36px 40px 80px":"20px 16px 80px" }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ background:C.card, borderRadius:"18px", padding:isDesk?"40px 44px":"24px 20px", border:`1px solid ${C.border}`, boxShadow:C.shadowMd }}>

          <div style={{ marginBottom:"28px", paddingBottom:"20px", borderBottom:`1px solid ${C.border}` }}>
            <h1 style={{ fontSize:"22px", fontWeight:700, color:C.text, letterSpacing:"-0.5px", margin:"0 0 4px" }}>Event Details</h1>
            <p style={{ fontSize:"13px", color:C.muted, margin:0 }}>Fill in the details — NFT-verified tickets minted automatically on Polygon</p>
          </div>

          <div style={{ marginBottom:"24px" }}>
            <label style={AE_LABEL(false)}>Event Type</label>
            <div style={{ display:"flex", gap:"8px", background:C.bg, borderRadius:"10px", padding:"4px", border:`1px solid ${C.border}`, width:"fit-content" }}>
              {[{v:"paid",icon:"💳",label:"Paid Event"},{v:"free",icon:"🎉",label:"Free Event"}].map(item => (
                <motion.button key={item.v} whileTap={{ scale:0.97 }} onClick={() => setEvType(item.v)}
                  style={{ padding:"9px 20px", borderRadius:"8px", border:"none", background:evType===item.v?`linear-gradient(135deg,${C.accent},${C.accentD})`:"transparent", color:evType===item.v?"#fff":C.muted, fontWeight:600, fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", fontFamily:FONT, transition:"all 0.2s" }}>
                  {item.icon} {item.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isDesk?"1fr 1fr":"1fr", gap:"16px 24px" }}>
            <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
              <label style={AE_LABEL(errors.name)}>Event Name {errors.name && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}>— {errors.name}</span>}</label>
              <input placeholder="e.g. Afrobeats Night 2026" value={addEventForm.name||""}
                onChange={e => { setAddEventForm({...addEventForm, name:e.target.value}); setErrors(p=>({...p,name:null})); }}
                style={AE_INPUT(errors.name)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
            </div>

            <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
              <label style={AE_LABEL(errors.cat)}>Category {errors.cat && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}>— {errors.cat}</span>}</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {CATEGORIES.map(cat => (
                  <motion.div key={cat} whileTap={{ scale:0.93 }}
                    onClick={() => { setAddEventForm({...addEventForm, category:cat}); setErrors(p=>({...p,cat:null})); }}
                    style={{ padding:"7px 16px", borderRadius:"99px", cursor:"pointer", fontSize:"13px", fontWeight:500, border:`1.5px solid ${addEventForm.category===cat?C.accent:C.border}`, background:addEventForm.category===cat?C.accentBg:"transparent", color:addEventForm.category===cat?C.accent:C.muted, transition:"all 0.15s" }}>
                    {cat.charAt(0).toUpperCase()+cat.slice(1)}
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:C.bg, borderRadius:"10px", border:`1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:600, color:C.text }}>Multi-day event</div>
                  <div style={{ fontSize:"12px", color:C.muted, marginTop:"2px" }}>Add multiple dates with per-day capacity and price</div>
                </div>
                <motion.div whileTap={{ scale:0.95 }} onClick={() => { setIsMultiDay(!isMultiDay); setErrors(p=>({...p,date:null,dates:null})); }}
                  style={{ width:"46px", height:"26px", borderRadius:"99px", background:isMultiDay?C.accent:C.border, position:"relative", cursor:"pointer", transition:"background 0.2s", flexShrink:0 }}>
                  <motion.div animate={{ x:isMultiDay?21:2 }} transition={{ duration:0.2 }}
                    style={{ position:"absolute", top:"3px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                </motion.div>
              </div>
            </div>

            {!isMultiDay && (
              <>
                <div>
                  <label style={AE_LABEL(errors.date)}>Date {errors.date && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}>— {errors.date}</span>}</label>
                  <input type="date" value={addEventForm.date||""}
                    onChange={e => { setAddEventForm({...addEventForm, date:e.target.value}); setErrors(p=>({...p,date:null})); }}
                    style={AE_INPUT(errors.date)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                </div>
                <div>
                  <label style={AE_LABEL(false)}>Time (optional)</label>
                  <input type="time" value={addEventForm.time||""} onChange={e => setAddEventForm({...addEventForm, time:e.target.value})}
                    style={AE_INPUT(false)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                </div>
              </>
            )}

            {isMultiDay && (
              <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
                <label style={AE_LABEL(errors.dates)}>Event Dates {errors.dates && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}>— {errors.dates}</span>}</label>
                <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    style={{ ...AE_INPUT(false), flex:1 }} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                  <motion.button whileTap={{ scale:0.95 }} onClick={addDate}
                    style={{ padding:"0 20px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"10px", fontSize:"20px", cursor:"pointer", flexShrink:0 }}>+</motion.button>
                </div>
                <AnimatePresence>
                  {eventDates.map((d,i) => (
                    <motion.div key={d.date} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                      style={{ background:C.accentBg, border:`1.5px solid ${C.accent}25`, borderRadius:"10px", padding:"14px 16px", marginBottom:"8px" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:C.text }}>📅 Day {i+1} — {new Date(d.date+"T00:00:00").toLocaleDateString("en-GH",{weekday:"short",month:"short",day:"numeric"})}</div>
                        <motion.button whileTap={{ scale:0.9 }} onClick={() => removeDate(d.date)}
                          style={{ background:C.redBg, border:"none", borderRadius:"6px", padding:"4px 10px", cursor:"pointer", color:C.red, fontSize:"11px", fontWeight:600 }}>Remove</motion.button>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:evType==="paid"?"1fr 1fr":"1fr", gap:"10px" }}>
                        <div>
                          <label style={{ fontSize:"10px", fontWeight:600, color:C.muted, display:"block", marginBottom:"4px", textTransform:"uppercase" }}>Tickets / Spots</label>
                          <input type="number" placeholder="e.g. 200" value={d.capacity} onChange={e => updateDate(d.date,"capacity",e.target.value)} style={AE_INPUT(false)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                        </div>
                        {evType==="paid" && (
                          <div>
                            <label style={{ fontSize:"10px", fontWeight:600, color:C.muted, display:"block", marginBottom:"4px", textTransform:"uppercase" }}>Price ({currency})</label>
                            <input type="number" placeholder="e.g. 150" value={d.price} onChange={e => updateDate(d.date,"price",e.target.value)} style={AE_INPUT(false)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {eventDates.length===0 && (
                  <div style={{ textAlign:"center", padding:"20px", color:C.muted, fontSize:"13px", border:`1.5px dashed ${C.border}`, borderRadius:"10px" }}>Pick a date above and tap + to add it</div>
                )}
                {eventDates.length>=2 && (
                  <div style={{ fontSize:"12px", color:C.green, background:C.greenBg, padding:"10px 14px", borderRadius:"8px", marginTop:"6px" }}>
                    ✅ {eventDates.length} days added — attendees will choose which day(s) to attend
                  </div>
                )}
              </div>
            )}

            <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
              <label style={AE_LABEL(errors.venue)}>Venue {errors.venue && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}>— {errors.venue}</span>}</label>
              <input placeholder="e.g. Accra Sports Stadium" value={addEventForm.venue||""}
                onChange={e => { setAddEventForm({...addEventForm, venue:e.target.value}); setErrors(p=>({...p,venue:null})); }}
                style={AE_INPUT(errors.venue)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
            </div>

            <div>
              <label style={AE_LABEL(false)}>City</label>
              <input placeholder="e.g. Accra" value={addEventForm.city||""} onChange={e => setAddEventForm({...addEventForm, city:e.target.value})}
                style={AE_INPUT(false)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
            </div>

            <div>
              <label style={AE_LABEL(false)}>Country</label>
              <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...AE_INPUT(false) }} onFocus={AE_FOCUS} onBlur={AE_BLUR}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {!isMultiDay && (
              <>
                <div>
                  <label style={AE_LABEL(errors.total)}>{evType==="free"?"Total Spots":"Total Tickets"}{errors.total && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}> — {errors.total}</span>}</label>
                  <input type="number" placeholder="e.g. 500" value={addEventForm.totalTickets||""}
                    onChange={e => { setAddEventForm({...addEventForm, totalTickets:e.target.value}); setErrors(p=>({...p,total:null})); }}
                    style={AE_INPUT(errors.total)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                </div>
                {evType==="paid" && (
                  <div>
                    <label style={AE_LABEL(errors.price)}>Price ({currency}) {errors.price && <span style={{ color:C.red, fontWeight:400, textTransform:"none" }}>— {errors.price}</span>}</label>
                    <input type="number" placeholder="e.g. 150" value={addEventForm.price||""}
                      onChange={e => { setAddEventForm({...addEventForm, price:e.target.value}); setErrors(p=>({...p,price:null})); }}
                      style={AE_INPUT(errors.price)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
                  </div>
                )}
              </>
            )}

            {evType==="paid" && (
              <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
                <label style={AE_LABEL(false)}>Currency</label>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  {CURRENCIES.map(c => (
                    <motion.button key={c.code} whileTap={{ scale:0.93 }} onClick={() => setCurrency(c.code)}
                      style={{ padding:"8px 14px", borderRadius:"8px", border:`1.5px solid ${currency===c.code?C.accent:C.border}`, background:currency===c.code?C.accentBg:"transparent", color:currency===c.code?C.accent:C.muted, fontWeight:600, fontSize:"12px", cursor:"pointer", fontFamily:MONO }}>
                      {c.symbol} {c.code}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
              <label style={AE_LABEL(false)}>Description</label>
              <textarea placeholder="Tell people about your event..." value={addEventForm.description||""} onChange={e => setAddEventForm({...addEventForm, description:e.target.value})}
                rows={4} style={{ ...AE_INPUT(false), resize:"vertical", minHeight:"96px" }} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
            </div>

            <div style={{ gridColumn:isDesk?"1 / -1":"auto" }}>
              <label style={AE_LABEL(false)}>Cover Image</label>
              <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
                {[["upload","📷 Upload"],["url","🔗 URL"]].map(([v,l]) => (
                  <motion.div key={v} whileTap={{ scale:0.95 }} onClick={() => setImgType(v)}
                    style={{ padding:"8px 16px", borderRadius:"8px", textAlign:"center", cursor:"pointer", fontSize:"13px", fontWeight:600, border:`1.5px solid ${imgType===v?C.accent:C.border}`, background:imgType===v?C.accentBg:"transparent", color:imgType===v?C.accent:C.muted }}>
                    {l}
                  </motion.div>
                ))}
              </div>
              {imgType==="upload" ? (
                <>
                  <input type="file" accept="image/jpeg,image/png,image/webp" id="ev-img" style={{ display:"none" }}
                    onChange={e => {
                      const f=e.target.files[0]; if(!f) return;
                      const cv=document.createElement("canvas"); const im=new Image();
                      const u=URL.createObjectURL(f);
                      im.onload=()=>{ const M=1200; let w=im.width,h=im.height; if(w>M){h=Math.round(h*M/w);w=M;} cv.width=w;cv.height=h; cv.getContext("2d").drawImage(im,0,0,w,h); setAddEventForm({...addEventForm,image:cv.toDataURL("image/jpeg",0.82)}); URL.revokeObjectURL(u); }; im.src=u;
                    }} />
                  <label htmlFor="ev-img" style={{ display:"block", padding:"28px", background:C.bg, border:`2px dashed ${C.border}`, borderRadius:"10px", textAlign:"center", cursor:"pointer" }}>
                    {addEventForm.image?.startsWith("data:")||addEventForm.image?.startsWith("http") ? (
                      <><img src={addEventForm.image} alt="preview" style={{ width:"100%", height:"160px", objectFit:"cover", borderRadius:"8px", marginBottom:"8px" }} /><div style={{ color:C.green, fontSize:"13px", fontWeight:600 }}>✓ Image ready — click to change</div></>
                    ) : (
                      <><div style={{ fontSize:"28px", marginBottom:"8px" }}>📷</div><div style={{ color:C.muted, fontSize:"14px", marginBottom:"4px" }}>Click to upload a cover image</div><div style={{ color:C.muted, fontSize:"12px", opacity:0.6 }}>JPG, PNG, WebP</div></>
                    )}
                  </label>
                </>
              ) : (
                <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:")?"":addEventForm.image||""} onChange={e => setAddEventForm({...addEventForm, image:e.target.value})}
                  style={AE_INPUT(false)} onFocus={AE_FOCUS} onBlur={AE_BLUR} />
              )}
            </div>
          </div>

          {addEventForm.name && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ background:C.purpleBg, border:`1px solid ${C.purple}25`, borderRadius:"10px", padding:"12px 16px", marginTop:"20px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.purple, letterSpacing:"1.2px", fontFamily:MONO, marginBottom:"4px" }}>⛓ EVENT URL</div>
              <div style={{ fontFamily:MONO, fontSize:"12px", color:C.text, wordBreak:"break-all" }}>{eventUrl}</div>
            </motion.div>
          )}

          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"20px", marginBottom:"24px" }}>
            {evType==="paid" && <span style={{ fontSize:"12px", color:C.green, background:C.greenBg, padding:"5px 12px", borderRadius:"6px", fontWeight:500 }}>💰 95% revenue to you</span>}
            {evType==="free" && <span style={{ fontSize:"12px", color:C.green, background:C.greenBg, padding:"5px 12px", borderRadius:"6px", fontWeight:500 }}>🎉 Free · QR pass via email</span>}
            {isMultiDay && <span style={{ fontSize:"12px", color:C.purple, background:C.purpleBg, padding:"5px 12px", borderRadius:"6px", fontWeight:500 }}>📅 Attendees pick their day(s)</span>}
            <span style={{ fontSize:"12px", color:C.purple, background:C.purpleBg, padding:"5px 12px", borderRadius:"6px", fontWeight:500 }}>⛓ NFT on Polygon</span>
          </div>

          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={submit}
            style={{ width:"100%", padding:"16px", borderRadius:"12px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", fontWeight:700, fontSize:"16px", border:"none", cursor:"pointer", boxShadow:`0 8px 24px ${C.accent}35`, fontFamily:FONT }}>
            Create {isMultiDay?"Multi-Day ":""}{evType==="free"?"Free":"Paid"} Event →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER EVENT DETAIL
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

  const sColor = { active:"#22c55e", redeemed:"#6b7280", resale:"#ef4444", transferred:"#3b82f6" };
  const sLabel = { active:"Active", redeemed:"Redeemed", resale:"Resale", transferred:"Transferred" };

  if (editing) return (
    <div style={{ background:C.bg, height:"100%", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:FONT }}>
      <div style={{ flexShrink:0, display:"flex", alignItems:"center", padding:"13px 18px", gap:"12px", background:C.card, borderBottom:`1px solid ${C.border}` }}>
        <motion.button whileTap={{ scale:0.9 }} onClick={() => setEditing(false)}
          style={{ width:"32px", height:"32px", borderRadius:"7px", background:"transparent", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.text, fontSize:"15px" }}>←</motion.button>
        <div style={{ flex:1, fontSize:"15px", fontWeight:650, color:C.text }}>Edit Event</div>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={saveEdit}
          style={{ padding:"7px 16px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"7px", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>Save Changes</motion.button>
      </div>
      <div style={{ flex:1, minHeight:0, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
        <div style={{ padding:isDesk?"22px 40px 100px":"14px 14px 100px", maxWidth:isDesk?"640px":"100%", margin:"0 auto" }}>
          <div style={{ marginBottom:"14px" }}>
            <label style={{ display:"block", fontSize:"12px", fontWeight:500, color:C.sub, marginBottom:"7px" }}>Category</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale:0.93 }} onClick={() => setEditForm(p=>({...p,category:cat}))}
                  style={{ padding:"5px 12px", borderRadius:"99px", cursor:"pointer", fontSize:"11px", fontWeight:500, border:`1.5px solid ${editForm.category===cat?C.accent:C.border}`, background:editForm.category===cat?C.accentBg:"transparent", color:editForm.category===cat?C.accent:C.sub }}>
                  {cat.charAt(0).toUpperCase()+cat.slice(1)}
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:"14px" }}>
            <label style={{ display:"block", fontSize:"12px", fontWeight:500, color:C.sub, marginBottom:"7px" }}>Currency</label>
            <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
              {CURRENCIES.map(c => (
                <motion.button key={c.code} whileTap={{ scale:0.93 }} onClick={() => setEditForm(p=>({...p,currency:c.code}))}
                  style={{ padding:"5px 10px", borderRadius:"6px", border:`1.5px solid ${editForm.currency===c.code?C.accent:C.border}`, background:editForm.currency===c.code?C.accentBg:"transparent", color:editForm.currency===c.code?C.accent:C.muted, fontWeight:600, fontSize:"10px", cursor:"pointer", fontFamily:MONO }}>
                  {c.symbol} {c.code}
                </motion.button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:"14px" }}>
            <label style={{ display:"block", fontSize:"12px", fontWeight:500, color:C.sub, marginBottom:"7px" }}>Image</label>
            <div style={{ display:"flex", gap:"6px", marginBottom:"7px" }}>
              {[["upload","Upload"],["url","URL"]].map(([v,l]) => (
                <motion.div key={v} whileTap={{ scale:0.95 }} onClick={() => setEditImgType(v)}
                  style={{ flex:1, padding:"7px", borderRadius:"7px", textAlign:"center", cursor:"pointer", fontSize:"12px", fontWeight:500, border:`1.5px solid ${editImgType===v?C.accent:C.border}`, background:editImgType===v?C.accentBg:"transparent", color:editImgType===v?C.accent:C.muted }}>
                  {l}
                </motion.div>
              ))}
            </div>
            {editImgType==="upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="edit-img" style={{ display:"none" }}
                  onChange={e => { const f=e.target.files[0]; if(!f) return; const cv=document.createElement("canvas"); const im=new Image(); const u=URL.createObjectURL(f); im.onload=()=>{const M=1200;let w=im.width,h=im.height;if(w>M){h=Math.round(h*M/w);w=M;}cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);setEditForm(p=>({...p,image:cv.toDataURL("image/jpeg",0.82)}));URL.revokeObjectURL(u);};im.src=u; }} />
                <label htmlFor="edit-img" style={{ display:"block", padding:"16px", background:C.card, border:`2px dashed ${C.accent}28`, borderRadius:"9px", textAlign:"center", cursor:"pointer" }}>
                  {editForm.image ? <><img src={editForm.image} alt="p" style={{ width:"100%", height:"120px", objectFit:"cover", borderRadius:"7px", marginBottom:"6px" }} /><div style={{ color:C.green, fontSize:"12px" }}>✓ Click to change</div></> : <><div style={{ fontSize:"22px", marginBottom:"6px" }}>📷</div><div style={{ color:C.sub, fontSize:"12px" }}>Click to upload</div></>}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:")?"":editForm.image||""} onChange={e => setEditForm(p=>({...p,image:e.target.value}))} style={INP(false)} onFocus={focusI} onBlur={blurI} />
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:isDesk?"1fr 1fr":"1fr", gap:isDesk?"0 24px":"0" }}>
            {[["name","Event Name","text",true],["subtitle","Subtitle","text",false],["date","Date","date",true],["time","Time","time",false],["venue","Venue","text",true],["city","City","text",false],["price","Ticket Price","number",true],["totalTickets","Total Tickets","number",false],["description","Description","text",false]].map(([k,l,t,req]) => (
              <div key={k} style={{ marginBottom:"14px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:500, color:C.sub, marginBottom:"5px" }}>{l}{req&&<span style={{ color:C.red }}> *</span>}</label>
                <input type={t} value={editForm[k]??""} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))} style={{ ...INP(false), colorScheme:"light dark" }} onFocus={focusI} onBlur={blurI} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:C.card, border:`1px solid ${C.border}`, borderRadius:"8px", marginBottom:"16px" }}>
            <div>
              <div style={{ fontSize:"13px", fontWeight:500, color:C.text }}>Ticket Sales</div>
              <div style={{ fontSize:"11px", color:C.muted }}>Currently {ev.salesOpen?"open":"paused"}</div>
            </div>
            <motion.button whileTap={{ scale:0.95 }} onClick={() => toggleSales(ev.id)}
              style={{ padding:"7px 14px", background:ev.salesOpen?C.redBg:C.greenBg, color:ev.salesOpen?C.red:C.green, border:`1px solid ${ev.salesOpen?C.red+"30":C.green+"30"}`, borderRadius:"7px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
              {ev.salesOpen?"⏸ Pause":"▶ Resume"}
            </motion.button>
          </div>
          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={saveEdit}
            style={{ padding:"11px 24px", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:FONT, width:isDesk?"auto":"100%" }}>
            Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );

  const PAD = isDesk ? "0 40px 80px" : "0 14px 100px";
  return (
    <div style={{ background:C.bg, height:"100%", overflowY:"auto", WebkitOverflowScrolling:"touch", fontFamily:FONT }}>
      <div style={{ height:isDesk?"260px":"200px", position:"relative" }}>
        <img src={cover} alt={ev.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.src=catImg.other}} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.8))" }} />
        <motion.button whileTap={{ scale:0.9 }} onClick={() => setScreen("app")}
          style={{ position:"absolute", top:"12px", left:"14px", width:"32px", height:"32px", borderRadius:"7px", background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"15px", color:"#fff" }}>←</motion.button>
        <motion.button whileTap={{ scale:0.96 }} onClick={startEdit}
          style={{ position:"absolute", top:"12px", right:"14px", padding:"6px 13px", background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"6px", color:"#fff", fontSize:"11px", fontWeight:500, cursor:"pointer" }}>Edit</motion.button>
        <div style={{ position:"absolute", top:"12px", left:"54px", display:"flex", gap:"5px" }}>
          <span style={{ background:"rgba(139,92,246,0.88)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"2px 7px", borderRadius:"4px", fontFamily:MONO }}>NFT</span>
          {isFree && <span style={{ background:"rgba(34,197,94,0.88)", backdropFilter:"blur(6px)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"2px 7px", borderRadius:"4px", fontFamily:MONO }}>FREE</span>}
        </div>
        <div style={{ position:"absolute", bottom:"16px", left:"18px", right:"18px" }}>
          <div style={{ fontSize:"10px", fontWeight:500, color:"rgba(255,255,255,0.5)", letterSpacing:"0.5px", marginBottom:"4px", fontFamily:MONO }}>{(ev.category||"").toUpperCase()} · {ev.country||"GHANA"}</div>
          <div style={{ fontSize:isDesk?"22px":"18px", fontWeight:700, color:"#fff", letterSpacing:"-0.5px", marginBottom:"3px" }}>{ev.name}</div>
          <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", fontFamily:MONO }}>📍 {ev.venue} · 📅 {ev.date}</div>
        </div>
      </div>

      <div style={{ position:"sticky", top:0, zIndex:20, background:C.card, borderBottom:`1px solid ${C.border}`, padding:`0 ${isDesk?"40px":"14px"}`, display:"flex" }}>
        {[{id:"overview",label:"Overview",icon:"📊"},{id:"holders",label:"Ticket Holders",icon:"👥",count:ev.ticketsSold}].map(t => (
          <motion.button key={t.id} whileTap={{ scale:0.97 }} onClick={() => onTab(t.id)}
            style={{ padding:"12px 14px", background:"none", border:"none", borderBottom:activeTab===t.id?`2px solid ${C.accent}`:"2px solid transparent", cursor:"pointer", fontFamily:FONT, fontSize:"13px", fontWeight:activeTab===t.id?600:400, color:activeTab===t.id?C.accent:C.muted, display:"flex", alignItems:"center", gap:"5px", transition:"all 0.15s" }}>
            {t.icon} {t.label}
            {t.count!==undefined && <span style={{ fontSize:"10px", fontWeight:600, background:activeTab===t.id?C.accentBg:C.border, color:activeTab===t.id?C.accent:C.muted, padding:"1px 6px", borderRadius:"99px", fontFamily:MONO }}>{t.count}</span>}
          </motion.button>
        ))}
      </div>

      {activeTab==="overview" && (
        <div style={{ padding:PAD }}>
          <div style={{ paddingTop:"20px" }}>
            <div style={{ display:"grid", gridTemplateColumns:isDesk?"repeat(4,1fr)":"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
              {(isFree ? [
                ["🎉","Registered",(ev.regs||ev.ticketsSold).toLocaleString(),C.purple],
                ["🎫","Capacity",ev.totalTickets.toLocaleString(),C.text],
                ["✅","Checked In",admittedCount+" ppl",C.green],
                ["📅","Date",ev.date,C.blue],
              ] : [
                ["💰","Revenue (95%)",`${curr} ${revenue.toLocaleString()}`,C.green],
                ["🏦","Platform Fee",`${curr} ${fee.toLocaleString()}`,C.red],
                ["🎟","Sold",`${ev.ticketsSold}/${ev.totalTickets}`,C.blue],
                ["🚪","Admitted",admittedCount+" ppl",C.accent],
              ]).map(([icon,label,value,color]) => (
                <motion.div key={label} whileHover={{ y:-1 }} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"14px 15px" }}>
                  <div style={{ fontSize:"14px", marginBottom:"6px" }}>{icon}</div>
                  <div style={{ fontSize:"18px", fontWeight:700, color, marginBottom:"2px", letterSpacing:"-0.5px" }}>{value}</div>
                  <div style={{ fontSize:"11px", color:C.muted }}>{label}</div>
                </motion.div>
              ))}
            </div>

            <Panel style={{ marginBottom:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontSize:"13px", fontWeight:500, color:C.text }}>{isFree?"Registration":"Sales"} Progress</span>
                <span style={{ fontSize:"13px", fontWeight:700, color:pct>80?C.red:C.accent, fontFamily:MONO }}>{pct}%</span>
              </div>
              <div style={{ height:"6px", background:C.border, borderRadius:"99px", overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.9 }}
                  style={{ height:"100%", background:pct>80?`linear-gradient(90deg,${C.red},#dc2626)`:`linear-gradient(90deg,${C.accent},${C.accentD})`, borderRadius:"99px" }} />
              </div>
              <div style={{ fontSize:"11px", color:C.muted, marginTop:"5px" }}>{ev.totalTickets-ev.ticketsSold} {isFree?"spots":"tickets"} remaining</div>
            </Panel>

            <Panel style={{ marginBottom:"12px" }}>
              <div style={{ fontSize:"10px", fontWeight:600, color:C.purple, fontFamily:MONO, marginBottom:"7px" }}>EVENT URL</div>
              <div style={{ fontFamily:MONO, fontSize:"11px", color:C.text, background:C.bg, padding:"7px 10px", borderRadius:"6px", border:`1px solid ${C.border}`, marginBottom:"9px", wordBreak:"break-all" }}>{evUrl}</div>
              <motion.button whileTap={{ scale:0.96 }} onClick={copyLink}
                style={{ padding:"6px 13px", background:copiedLink?C.greenBg:C.accentBg, color:copiedLink?C.green:C.accent, border:`1px solid ${copiedLink?C.green+"30":C.accent+"30"}`, borderRadius:"6px", fontSize:"12px", fontWeight:500, cursor:"pointer", fontFamily:FONT }}>
                {copiedLink?"✓ Copied":"Copy Link"}
              </motion.button>
            </Panel>

            {ev.description && (
              <Panel style={{ marginBottom:"12px" }}>
                <div style={{ fontSize:"10px", fontWeight:600, color:C.muted, fontFamily:MONO, marginBottom:"7px" }}>DESCRIPTION</div>
                <div style={{ fontSize:"13px", color:C.sub, lineHeight:1.7 }}>{ev.description}</div>
              </Panel>
            )}

            <div style={{ display:"grid", gridTemplateColumns:isDesk?"1fr 1fr":"1fr", gap:"8px", marginBottom:"14px" }}>
              <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => toggleSales(ev.id)}
                style={{ padding:"12px", background:ev.salesOpen?`linear-gradient(135deg,${C.red},#dc2626)`:`linear-gradient(135deg,${C.green},#16a34a)`, color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
                {ev.salesOpen?`⏸ Pause ${isFree?"Registrations":"Sales"}`:`▶ Resume ${isFree?"Registrations":"Sales"}`}
              </motion.button>
              <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }} onClick={() => setScreen("scanTicket")}
                style={{ padding:"12px", background:C.card, color:C.text, border:`1px solid ${C.border}`, borderRadius:"10px", fontSize:"13px", fontWeight:500, cursor:"pointer", fontFamily:FONT }}>
                🔍 Scan at Door
              </motion.button>
            </div>

            <Panel>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"7px", background:C.accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>🚪</div>
                <div>
                  <div style={{ fontSize:"13px", fontWeight:600, color:C.text }}>Door Staff Access</div>
                  <div style={{ fontSize:"10px", color:C.muted, fontFamily:MONO }}>Single-use codes · expire after first scan</div>
                </div>
              </div>
              <motion.button whileHover={{ borderColor:C.accent }} whileTap={{ scale:0.97 }} onClick={() => generateDoorCode(ev.id,ev.name)}
                style={{ width:"100%", padding:"9px", background:C.accentBg, color:C.accent, border:`1.5px dashed ${C.accent}35`, borderRadius:"8px", fontSize:"12px", fontWeight:600, cursor:"pointer", marginBottom:"10px", fontFamily:FONT }}>
                + Generate Access Code
              </motion.button>
              {invites.map(inv => (
                <motion.div key={inv.code} whileTap={{ scale:0.98 }} onClick={() => copyCode(inv.code)}
                  style={{ background:inv.used?C.bg:C.accentBg, border:`1px solid ${inv.used?C.border:C.accent+"25"}`, borderRadius:"8px", padding:"9px 12px", marginBottom:"6px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
                  <span style={{ fontFamily:MONO, fontWeight:700, color:inv.used?C.muted:C.accent, fontSize:"13px", letterSpacing:"1.5px" }}>{inv.code}</span>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                    <span style={{ fontSize:"9px", fontWeight:700, color:inv.used?C.muted:C.green, fontFamily:MONO }}>{inv.used?"USED":"ACTIVE"}</span>
                    {!inv.used && <span style={{ fontSize:"9px", color:copiedCode===inv.code?C.green:C.muted, fontFamily:MONO }}>{copiedCode===inv.code?"✓ COPIED":"TAP TO COPY"}</span>}
                  </div>
                </motion.div>
              ))}
              <div style={{ padding:"8px 11px", borderRadius:"7px", background:C.blueBg, border:`1px solid ${C.blue}20`, display:"flex", gap:"6px", alignItems:"center", marginTop:"4px" }}>
                <span style={{ fontSize:"11px" }}>🔒</span>
                <span style={{ fontSize:"11px", color:C.blue, fontWeight:500 }}>Door staff can scan only — no event management access</span>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab==="holders" && (
        <div style={{ padding:PAD }}>
          <div style={{ paddingTop:"16px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"14px" }}>
              {[["🎟",holders.filter(t=>t.status==="active").length,"Active",C.green],["✅",holders.filter(t=>t.status==="redeemed").length,"Redeemed","#6b7280"],["🏷",holders.filter(t=>t.status==="resale").length,"On Resale",C.red]].map(([icon,count,label,color]) => (
                <Panel key={label} style={{ textAlign:"center", padding:"12px 10px" }}>
                  <div style={{ fontSize:"16px", marginBottom:"3px" }}>{icon}</div>
                  <div style={{ fontSize:"18px", fontWeight:700, color }}>{holderLoad?"—":count}</div>
                  <div style={{ fontSize:"10px", color:C.muted, marginTop:"1px" }}>{label}</div>
                </Panel>
              ))}
            </div>
            <div style={{ position:"relative", marginBottom:"12px" }}>
              <input value={holderSearch} onChange={e=>setHolderSearch(e.target.value)} placeholder="Search name, email or ticket ID..."
                style={{ ...INP(false), paddingLeft:"32px" }} onFocus={focusI} onBlur={blurI} />
              <span style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", fontSize:"12px", opacity:0.3 }}>🔍</span>
              {holderSearch && <span onClick={()=>setHolderSearch("")} style={{ position:"absolute", right:"11px", top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:"11px", color:C.muted, fontWeight:600 }}>✕</span>}
            </div>
            {holderLoad ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{ height:"54px", borderRadius:"9px" }} />)}</div>
            ) : filtered.length===0 ? (
              <Panel style={{ textAlign:"center", padding:"48px 20px" }}>
                <div style={{ fontSize:"32px", marginBottom:"10px" }}>👥</div>
                <div style={{ fontSize:"14px", fontWeight:600, color:C.text, marginBottom:"4px" }}>{holderSearch?"No results":"No ticket holders yet"}</div>
                <div style={{ fontSize:"12px", color:C.muted }}>{holderSearch?"Try a different search":"Holders will appear here once tickets are purchased"}</div>
              </Panel>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {isDesk && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px 100px", gap:"10px", padding:"5px 13px", fontSize:"9px", fontWeight:600, color:C.muted, letterSpacing:"1px", fontFamily:MONO }}>
                    <span>HOLDER</span><span>TICKET ID</span><span>QTY</span><span>STATUS</span>
                  </div>
                )}
                {filtered.map((t,i) => {
                  const name  = ((t.owner?.first_name||"")+" "+(t.owner?.last_name||"")).trim()||"Unknown";
                  const email = t.owner?.email||"—";
                  const col   = sColor[t.status]||"#6b7280";
                  const lbl   = sLabel[t.status]||t.status;
                  return (
                    <motion.div key={t.ticket_id||i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.02 }}
                      style={{ background:C.card, borderRadius:"10px", padding:"10px 13px", border:`1px solid ${C.border}`, display:isDesk?"grid":"flex", gridTemplateColumns:isDesk?"1fr 1fr 80px 100px":undefined, flexDirection:isDesk?undefined:"row", alignItems:"center", gap:"10px" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent+"35";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
                      <div style={{ minWidth:0, flex:isDesk?undefined:1 }}>
                        <div style={{ fontSize:"12px", fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"1px" }}>
                          {name}
                          {t.is_resale && <span style={{ marginLeft:"5px", fontSize:"8px", fontWeight:700, color:C.purple, background:C.purpleBg, padding:"1px 5px", borderRadius:"4px" }}>RESALE</span>}
                        </div>
                        <div style={{ fontSize:"10px", color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{email}</div>
                      </div>
                      <div style={{ fontFamily:MONO, fontSize:"9px", color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:isDesk?"block":"none" }}>
                        {String(t.ticket_id||"").slice(0,14)}…
                        {t.nft_token_id && <div style={{ fontSize:"8px", color:C.purple, marginTop:"1px" }}>NFT #{t.nft_token_id}</div>}
                      </div>
                      <div style={{ display:isDesk?"block":"none" }}>
                        <span style={{ fontSize:"12px", fontWeight:600, color:C.accent, fontFamily:MONO }}>×{t.quantity||1}</span>
                      </div>
                      <div>
                        <span style={{ fontSize:"9px", fontWeight:700, color:col, background:col+"14", padding:"3px 8px", borderRadius:"4px", border:`1px solid ${col}22`, fontFamily:MONO, whiteSpace:"nowrap" }}>{lbl.toUpperCase()}</span>
                      </div>
                    </motion.div>
                  );
                })}
                <div style={{ textAlign:"center", padding:"10px", fontSize:"10px", color:C.muted, fontFamily:MONO }}>
                  {filtered.length} of {holders.length} holders{holderSearch&&` · "${holderSearch}"`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}