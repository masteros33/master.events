import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

// ── Design tokens — professional dark fintech ─────────────────
const B  = "#F97316";   // brand orange
const BD = "#EA6C0A";   // brand dark
const BG = "rgba(249,115,22,0.08)";

const CURRENCIES = [
  { code: "GHS", symbol: "₵", label: "Ghana Cedi" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
];

const COUNTRIES = [
  "Ghana","Nigeria","Kenya","South Africa","United Kingdom",
  "United States","Canada","Germany","France","Senegal",
  "Côte d'Ivoire","Tanzania","Uganda","Rwanda","Other"
];

const CATEGORIES = ["music","tech","food","arts","sports","business","other"];

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const isDesktop = () => window.innerWidth > 768;

const mapEvent = e => ({
  id:           e.id,
  name:         e.name,
  date:         e.date,
  venue:        e.venue,
  city:         e.city || "Accra",
  country:      e.country || "Ghana",
  category:     e.category || "other",
  event_type:   e.event_type || "paid",
  currency:     e.currency || "GHS",
  price:        parseFloat(e.price || 0),
  totalTickets: e.total_tickets,
  ticketsSold:  e.tickets_sold || 0,
  salesOpen:    e.sales_open,
  slug:         e.slug || "",
  event_url:    e.event_url || "",
  registrations_count: e.registrations_count || 0,
  description:  e.description || "",
  image:        e.image || categoryImages[e.category] || categoryImages.other,
});

const inp = {
  width: "100%", padding: "12px 16px", marginBottom: "14px",
  background: "var(--bg-subtle)", border: "1.5px solid var(--border)",
  borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-sans)",
  boxSizing: "border-box", caretColor: B, transition: "all 0.2s",
};

const primaryBtn = {
  width: "100%", padding: "14px",
  background: `linear-gradient(135deg, ${B}, ${BD})`,
  color: "#fff", border: "none", borderRadius: "12px",
  fontSize: "14px", fontWeight: 700, cursor: "pointer",
  boxShadow: `0 4px 20px ${B}40`, marginBottom: "12px",
  fontFamily: "var(--font-sans)",
};

// ── CSV export ────────────────────────────────────────────────
function downloadCSV(events) {
  if (!events.length) return;
  const rows = events.map(e => ({
    Event: e.name, Date: e.date, Venue: e.venue,
    Category: e.category, Type: e.event_type || "paid",
    Currency: e.currency || "GHS",
    "Ticket Price": e.price,
    "Tickets Sold": e.ticketsSold,
    "Total Tickets": e.totalTickets,
    "Fill Rate %": e.totalTickets > 0 ? Math.round((e.ticketsSold / e.totalTickets) * 100) : 0,
    "Revenue (95%)": Math.round(e.ticketsSold * e.price * 0.95),
    "Platform Fee": Math.round(e.ticketsSold * e.price * 0.05),
    Status: e.salesOpen ? "Live" : "Closed",
  }));
  const header = Object.keys(rows[0]).join(",");
  const body   = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  const blob   = new Blob([header + "\n" + body], { type: "text/csv" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href = url;
  a.download = `master-events-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, color, onClick, large }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 16px 40px ${color}18`, borderColor: color + "40" }}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "18px", padding: large ? "24px" : "18px",
        boxShadow: "var(--shadow-sm)", transition: "all 0.22s",
        cursor: onClick ? "pointer" : "default",
        position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", borderRadius: "50%", background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, transform: "translate(30%,-30%)", pointerEvents: "none" }} />
      <div style={{ fontSize: large ? "26px" : "22px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: large ? "28px" : "22px", fontWeight: 900, color, letterSpacing: "-1px", marginBottom: "4px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: sub ? "8px" : 0 }}>{label}</div>
      {sub && (
        <div style={{ fontSize: "10px", fontWeight: 700, color, background: color + "12", padding: "3px 10px", borderRadius: "99px", width: "fit-content", fontFamily: "var(--font-mono)" }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

// ── Revenue chart ─────────────────────────────────────────────
function RevenueChart({ events }) {
  if (!events.length) return null;
  const data   = events.map(e => ({ name: e.name, value: Math.round(e.ticketsSold * e.price * 0.95), currency: e.currency || "GHS" }));
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartH = 130;
  const barW   = Math.min(44, Math.floor(540 / data.length) - 10);
  const gap    = Math.max(8, Math.floor(540 / data.length) - barW);
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: B, letterSpacing: "1.5px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>REVENUE_BY_EVENT</div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Your Earnings</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => downloadCSV(events)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 13px", background: "var(--bg-subtle)", border: `1.5px solid ${B}35`, borderRadius: "9px", cursor: "pointer", color: B, fontWeight: 700, fontSize: "11px", transition: "all 0.2s", fontFamily: "var(--font-sans)" }}>
          ⬇ CSV
        </motion.button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg width="100%" viewBox={`0 0 ${Math.max(data.length * (barW + gap) + 24, 280)} ${chartH + 44}`} style={{ minWidth: "260px" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <g key={i}>
              <line x1="0" y1={chartH * (1 - pct)} x2="100%" y2={chartH * (1 - pct)} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
              {pct > 0 && <text x="2" y={chartH * (1 - pct) - 3} fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)">{Math.round(maxVal * pct).toLocaleString()}</text>}
            </g>
          ))}
          {data.map((d, i) => {
            const barH = Math.max(3, Math.round((d.value / maxVal) * chartH));
            const x    = i * (barW + gap) + gap / 2;
            const y    = chartH - barH;
            return (
              <g key={i}>
                <rect x={x} y={0} width={barW} height={chartH} rx="5" fill="var(--bg-subtle)" />
                <motion.rect x={x} y={y} width={barW} height={barH} rx="5" fill={`url(#bg${i})`}
                  initial={{ height: 0, y: chartH }} animate={{ height: barH, y }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: "easeOut" }} />
                {d.value > 0 && <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="8" fill={B} fontWeight="700" fontFamily="var(--font-mono)">{d.value > 999 ? (d.value/1000).toFixed(1)+"k" : d.value}</text>}
                <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)">{d.name.slice(0,6)}{d.name.length > 6 ? "…" : ""}</text>
              </g>
            );
          })}
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={B} /><stop offset="100%" stopColor={BD} />
              </linearGradient>
            ))}
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── Fill rate chart ───────────────────────────────────────────
function FillRateChart({ events }) {
  if (!events.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: B, letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>FILL_RATE</div>
      <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", marginBottom: "18px" }}>Tickets Sold vs Capacity</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
        {events.map(e => {
          const pct = e.totalTickets > 0 ? Math.round((e.ticketsSold / e.totalTickets) * 100) : 0;
          const col = pct >= 90 ? "#ef4444" : pct >= 60 ? B : "#22c55e";
          const isFree = e.event_type === "free";
          return (
            <div key={e.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: isFree ? "#22c55e" : B, background: isFree ? "rgba(34,197,94,0.1)" : BG, padding: "1px 6px", borderRadius: "4px", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {isFree ? "FREE" : e.currency || "GHS"}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{e.ticketsSold}/{e.totalTickets}</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: col, fontFamily: "var(--font-mono)", minWidth: "32px", textAlign: "right" }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: Math.max(2, pct) + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: pct >= 90 ? "linear-gradient(90deg,#ef4444,#dc2626)" : pct >= 60 ? `linear-gradient(90deg,${B},${BD})` : "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: "99px" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Event card ────────────────────────────────────────────────
function EventCard({ ev, onClick }) {
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  const isFree  = ev.event_type === "free";
  const curr    = ev.currency || "GHS";
  return (
    <motion.div whileHover={{ y: -4, boxShadow: `0 20px 48px ${B}18`, borderColor: B + "40" }} whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "all 0.22s" }}>
      <div style={{ height: "160px", position: "relative" }}>
        <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.78))" }} />
        {/* Live badge */}
        <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "rgba(22,163,74,0.9)" : "rgba(107,114,128,0.9)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-mono)" }}>
          {ev.salesOpen && <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#fff" }} />}
          {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
        {/* NFT badge */}
        <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "3px", fontFamily: "var(--font-mono)" }}>
          <span>⛓</span><span>NFT</span>
        </div>
        {/* Free/currency badge */}
        <div style={{ position: "absolute", top: "30px", left: "10px", background: isFree ? "rgba(22,163,74,0.85)" : "rgba(249,115,22,0.85)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>
          {isFree ? "FREE" : curr}
        </div>
        <div style={{ position: "absolute", bottom: "12px", left: "13px", right: "13px" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "14px", marginBottom: "2px", lineHeight: 1.25 }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>
      <div style={{ padding: "13px 15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "9px" }}>
          <span style={{ fontSize: "14px", color: isFree ? "#22c55e" : "#22c55e", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            {isFree ? `${ev.registrations_count || ev.ticketsSold} registered` : `${curr} ${Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}`}
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{ev.ticketsSold}/{ev.totalTickets} · {soldPct}%</span>
        </div>
        <div style={{ height: "3px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: soldPct > 80 ? "#ef4444" : `linear-gradient(90deg,${B},${BD})`, borderRadius: "2px" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Payment method badge ──────────────────────────────────────
function PaymentBadge({ method }) {
  const map = {
    momo:    { label: "MTN MoMo",  color: "#f5a623", bg: "rgba(245,166,35,0.08)"  },
    stripe:  { label: "Stripe",    color: "#635bff", bg: "rgba(99,91,255,0.08)"   },
    paystack:{ label: "Paystack",  color: "#00c3f7", bg: "rgba(0,195,247,0.08)"   },
    visa:    { label: "Visa/MC",   color: "#1a56db", bg: "rgba(26,86,219,0.08)"   },
  };
  const m = map[method] || { label: method, color: B, bg: BG };
  return (
    <span style={{ fontSize: "9px", fontWeight: 700, color: m.color, background: m.bg, padding: "2px 7px", borderRadius: "4px", fontFamily: "var(--font-mono)", border: `1px solid ${m.color}20` }}>
      {m.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZER HOME
// ═══════════════════════════════════════════════════════════════
export function OrganizerHome() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setScreen          = useStore(s => s.setScreen);
  const setActiveTab       = useStore(s => s.setActiveTab);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser        = useStore(s => s.currentUser);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    eventsAPI.myEvents()
      .then(data => { if (Array.isArray(data)) setOrgEvents(data.map(mapEvent)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const paidEvents    = orgEvents.filter(e => e.event_type !== "free");
  const freeEvents    = orgEvents.filter(e => e.event_type === "free");
  const totalRevenue  = paidEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold     = paidEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const totalRegs     = freeEvents.reduce((s, e) => s + (e.registrations_count || e.ticketsSold), 0);
  const activeEvents  = orgEvents.filter(e => e.salesOpen).length;
  const totalCapacity = orgEvents.reduce((s, e) => s + e.totalTickets, 0);
  const fillRate      = totalCapacity > 0 ? Math.round(((totalSold + totalRegs) / totalCapacity) * 100) : 0;
  const topEvent      = [...orgEvents].sort((a, b) => b.ticketsSold * b.price - a.ticketsSold * a.price)[0];
  const goWallet      = () => { setActiveTab("wallet"); setScreen("app"); };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <div style={{ fontSize: "10px", color: B, fontWeight: 700, letterSpacing: "2px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>ORGANIZER_DASHBOARD</div>
          <h1 style={{ fontWeight: 900, fontSize: desktop ? "26px" : "20px", color: "var(--text-primary)", letterSpacing: "-0.7px", marginBottom: "4px" }}>
            {desktop ? `Welcome back, ${currentUser?.first_name} 👋` : "Dashboard"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            {desktop ? "Event command center — multi-currency · blockchain-verified · global payments" : `Hi ${currentUser?.first_name} 👋`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
          {/* Payment method indicators */}
          {desktop && (
            <div style={{ display: "flex", gap: "4px" }}>
              {["momo","stripe","paystack"].map(m => <PaymentBadge key={m} method={m} />)}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "99px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c3aed" }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#7c3aed", fontFamily: "var(--font-mono)" }}>POLYGON</span>
          </div>
          {desktop && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
              style={{ padding: "9px 18px", background: `linear-gradient(135deg,${B},${BD})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${B}40` }}>
              + New Event
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "18px" }} />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          {desktop ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <StatCard large icon="💰"
                  value={"GHS " + Math.round(totalRevenue).toLocaleString()}
                  label="Total Revenue (95% Payout)"
                  sub={fillRate + "% avg fill rate"}
                  color="#22c55e" onClick={goWallet} />
              </div>
              <StatCard icon="🎟" value={totalSold} label="Paid Tickets Sold" sub={fillRate + "% fill"} color="#60a5fa" />
              <StatCard icon="🎪" value={activeEvents} label="Live Events" sub={orgEvents.length + " total"} color={B} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
              <StatCard icon="💰" value={"GHS " + Math.round(totalRevenue).toLocaleString()} label="Revenue" color="#22c55e" onClick={goWallet} />
              <StatCard icon="🎟" value={totalSold} label="Sold" sub={fillRate + "%"} color="#60a5fa" />
              <StatCard icon="🎉" value={totalRegs} label="Free Regs" color="#a78bfa" />
              <StatCard icon="🎪" value={activeEvents} label="Live" sub={orgEvents.length + " total"} color={B} />
            </div>
          )}

          {/* Desktop: 3-col info row */}
          {desktop && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>

              {/* Blockchain panel */}
              <div style={{ background: "#0a090a", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "18px", padding: "20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "130px", height: "130px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 70%)", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⛓</div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#a78bfa" }}>Polygon Network</div>
                    <div style={{ fontSize: "9px", color: "#333", fontFamily: "var(--font-mono)" }}>0x956F...0Daf</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "3px" }}>
                    <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
                    <span style={{ fontSize: "8px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono)" }}>ONLINE</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                  {[["NFT_MINTED", totalSold, "#a78bfa"], ["CHAIN_ID", "80002", "#60a5fa"]].map(([k, v, c]) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "9px", padding: "9px 11px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: c, marginBottom: "2px" }}>{v}</div>
                      <div style={{ fontSize: "8px", color: "#333", fontFamily: "var(--font-mono)" }}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout split */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginBottom: "14px", fontFamily: "var(--font-mono)" }}>PAYOUT_SPLIT</div>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#22c55e" }}>You (95%)</span>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", fontFamily: "var(--font-mono)" }}>GHS {Math.round(totalRevenue).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ duration: 1 }} style={{ height: "100%", background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: "99px" }} />
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Platform (5%)</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>GHS {Math.round(totalRevenue * 0.053).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: "5%" }} transition={{ duration: 1 }} style={{ height: "100%", background: "#ef4444", borderRadius: "99px" }} />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goWallet}
                  style={{ width: "100%", padding: "10px", background: `linear-gradient(135deg,${B},${BD})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${B}35` }}>
                  Withdraw →
                </motion.button>
              </div>

              {/* Top event or payment methods */}
              {topEvent ? (
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setViewingOrgEvent(topEvent); setScreen("orgEventDetail"); }}
                  style={{ background: "var(--bg-card)", border: `1px solid ${B}20`, borderRadius: "18px", padding: "20px", cursor: "pointer", overflow: "hidden", position: "relative" }}>
                  <img src={topEvent.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.06 }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: B, letterSpacing: "1.5px", fontFamily: "var(--font-mono)" }}>🏆 TOP_EVENT</span>
                      {topEvent.event_type === "free" && <span style={{ fontSize: "8px", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "1px 6px", borderRadius: "4px", fontFamily: "var(--font-mono)" }}>FREE</span>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px", lineHeight: 1.3 }}>{topEvent.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                      {topEvent.ticketsSold} sold · {topEvent.currency || "GHS"} {Math.round(topEvent.ticketsSold * topEvent.price * 0.95).toLocaleString()}
                    </div>
                    <div style={{ height: "3px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: Math.round((topEvent.ticketsSold / topEvent.totalTickets) * 100) + "%" }} transition={{ duration: 0.8 }}
                        style={{ height: "100%", background: `linear-gradient(90deg,${B},${BD})`, borderRadius: "2px" }} />
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "5px", fontFamily: "var(--font-mono)" }}>
                      {Math.round((topEvent.ticketsSold / topEvent.totalTickets) * 100)}% · {topEvent.totalTickets - topEvent.ticketsSold} remaining
                    </div>
                    {/* Global payments row */}
                    <div style={{ display: "flex", gap: "4px", marginTop: "12px", flexWrap: "wrap" }}>
                      {["momo","stripe","paystack","visa"].map(m => <PaymentBadge key={m} method={m} />)}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "8px" }}>
                  <div style={{ fontSize: "28px" }}>🎪</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>No events yet</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                    {["momo","stripe","paystack","visa"].map(m => <PaymentBadge key={m} method={m} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          {orgEvents.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "14px", marginBottom: "24px" }}>
              <RevenueChart events={orgEvents} />
              <FillRateChart events={orgEvents} />
            </div>
          )}

          {/* Info banners */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "10px", marginBottom: "24px" }}>
            <div style={{ background: BG, border: `1px solid ${B}18`, borderRadius: "13px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, border: `1px solid ${B}18` }}>🌍</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: B, marginBottom: "2px" }}>Global Payments Ready</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>Accept MoMo, Stripe, Paystack, VISA. Multi-currency support — GHS, USD, EUR, GBP, NGN.</div>
              </div>
            </div>
            <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", borderRadius: "13px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>⛓</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>NFT Tickets on Polygon</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>Every ticket minted on-chain. Zero fakes. HMAC QR rotates every 10 seconds.</div>
              </div>
            </div>
          </div>

          {/* Events grid */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Your Events</div>
              {orgEvents.length > 0 && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                  {orgEvents.length} event{orgEvents.length !== 1 ? "s" : ""} · {activeEvents} live · {freeEvents.length} free
                </div>
              )}
            </div>
            {!desktop && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("addEvent")}
                style={{ padding: "8px 16px", background: `linear-gradient(135deg,${B},${BD})`, color: "#fff", border: "none", borderRadius: "9px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 12px ${B}35` }}>
                + New
              </motion.button>
            )}
          </div>

          {orgEvents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 32px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
              <div style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Create paid or free events — sell globally with multi-currency support</div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
                style={{ padding: "12px 28px", background: `linear-gradient(135deg,${B},${BD})`, color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${B}40` }}>
                + Create Your First Event
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "14px" : "10px" }}>
              {orgEvents.map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZER EVENTS LIST
// ═══════════════════════════════════════════════════════════════
export function OrganizerEvents() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen          = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const desktop = isDesktop();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    eventsAPI.myEvents().then(data => { if (Array.isArray(data)) setOrgEvents(data.map(mapEvent)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all"  ? orgEvents
    : filter === "free" ? orgEvents.filter(e => e.event_type === "free")
    : filter === "paid" ? orgEvents.filter(e => e.event_type !== "free")
    : orgEvents.filter(e => e.salesOpen);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
        <div>
          <div style={{ fontSize: "10px", color: B, fontWeight: 700, letterSpacing: "2px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>MY_EVENTS</div>
          <h1 style={{ fontWeight: 900, fontSize: desktop ? "26px" : "20px", color: "var(--text-primary)", letterSpacing: "-0.7px" }}>Events</h1>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
          style={{ padding: "9px 18px", background: `linear-gradient(135deg,${B},${BD})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${B}40` }}>
          + New Event
        </motion.button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "18px", background: "var(--bg-card)", padding: "3px", borderRadius: "10px", border: "1px solid var(--border)", width: "fit-content" }}>
        {[["all","All"],["paid","Paid"],["free","Free"],["live","Live"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: "7px 14px", borderRadius: "7px", border: "none", background: filter === val ? `linear-gradient(135deg,${B},${BD})` : "transparent", color: filter === val ? "#fff" : "var(--text-muted)", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: "12px" }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "18px" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎪</div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>No events found</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Try a different filter or create a new event</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: "12px" }}>
          {filtered.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZER ALERTS
// ═══════════════════════════════════════════════════════════════
export function OrganizerAlerts() {
  const orgEvents    = useStore(s => s.orgEvents);
  const desktop      = isDesktop();
  const totalRevenue = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold    = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const alerts = orgEvents.length > 0 ? [
    { icon: "⛓", color: "#7c3aed", title: "NFT Tickets Active on Polygon", body: `${totalSold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length > 1 ? "s" : ""}. All ownership records are immutable on-chain.`, time: "LIVE" },
    { icon: "💰", color: "#22c55e", title: "Revenue Update", body: `Your events have generated GHS ${Math.round(totalRevenue).toLocaleString()} at 95% payout rate. Withdrawable via MoMo or bank transfer.`, time: "NOW" },
    { icon: "🌍", color: "#60a5fa", title: "Global Payments Active", body: "MTN MoMo, Stripe, Paystack, and VISA/Mastercard are all accepting payments. Multi-currency support enabled.", time: "ACTIVE" },
    { icon: "🔒", color: B,         title: "HMAC QR Security Active", body: "All QR codes rotate every 10 seconds — screenshot-proof and forgery-resistant on all events.", time: "ALWAYS" },
  ] : [{ icon: "🔔", color: B, title: "No alerts yet", body: "Create an event and start selling tickets to see live alerts here.", time: "NOW" }];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ fontSize: "10px", color: B, fontWeight: 700, letterSpacing: "2px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>NOTIFICATIONS</div>
      <h1 style={{ fontWeight: 900, fontSize: desktop ? "26px" : "20px", color: "var(--text-primary)", letterSpacing: "-0.7px", marginBottom: "4px" }}>Alerts</h1>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px", fontFamily: "var(--font-mono)" }}>BLOCKCHAIN_CONFIRMATIONS · PAYMENTS · EVENT_ACTIVITY</p>
      <div style={{ maxWidth: desktop ? "640px" : "100%", display: "flex", flexDirection: "column", gap: "9px" }}>
        {alerts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            style={{ background: "var(--bg-card)", borderRadius: "15px", padding: "15px 17px", display: "flex", gap: "13px", alignItems: "flex-start", border: "1px solid var(--border)", transition: "all 0.18s" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: a.color + "10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: `1px solid ${a.color}18` }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "3px" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "7px" }}>{a.body}</div>
              <div style={{ fontSize: "9px", color: a.color, fontWeight: 700, background: a.color + "10", padding: "2px 9px", borderRadius: "99px", width: "fit-content", fontFamily: "var(--font-mono)" }}>{a.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD EVENT — free/paid, multi-currency, country, shareable link
// ═══════════════════════════════════════════════════════════════
export function AddEvent() {
  const addEventForm    = useStore(s => s.addEventForm);
  const setAddEventForm = useStore(s => s.setAddEventForm);
  const handleAddEvent  = useStore(s => s.handleAddEvent);
  const setScreen       = useStore(s => s.setScreen);
  const [imageType,  setImageType]  = useState("upload");
  const [eventType,  setEventType]  = useState("paid");
  const [currency,   setCurrency]   = useState("GHS");
  const [country,    setCountry]    = useState("Ghana");
  const [errors,     setErrors]     = useState({});
  const desktop = isDesktop();

  const slug     = (addEventForm.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const eventUrl = slug ? `https://${slug}.masterevents.events` : "https://your-event.masterevents.events";

  const validate = () => {
    const e = {};
    if (!addEventForm.name?.trim())  e.name         = "Event name is required";
    if (!addEventForm.date)          e.date         = "Date is required";
    if (eventType === "paid" && !addEventForm.price) e.price = "Ticket price is required";
    if (!addEventForm.totalTickets)  e.totalTickets = "Total tickets is required";
    if (!addEventForm.category)      e.category     = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    setAddEventForm({
      ...addEventForm,
      event_type: eventType,
      currency:   eventType === "free" ? "FREE" : currency,
      country,
      price:      eventType === "free" ? 0 : addEventForm.price,
    });
    handleAddEvent();
  };

  const fields = [
    ["name","Event Name","text","e.g. Afrobeats Night 2026",true],
    ["subtitle","Subtitle (optional)","text","e.g. The biggest night in Accra",false],
    ["date","Date","date","",true],
    ["time","Time","time","",false],
    ["venue","Venue","text","e.g. Accra Sports Stadium",true],
    ["city","City","text","e.g. Accra",false],
    ["description","Description","text","Tell people about your event",false],
  ];

  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "13px 18px", gap: "13px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Create Event</div>
          <div style={{ fontSize: "10px", color: "#7c3aed", marginTop: "1px", fontFamily: "var(--font-mono)" }}>⛓ NFT tickets auto-minted · Global payments · masterevents.events</div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", overflowX: "hidden", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ padding: desktop ? "24px 40px 120px" : "14px 14px 120px", maxWidth: desktop ? "720px" : "100%", margin: "0 auto" }}>

          {/* Free / Paid toggle */}
          <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "18px", marginBottom: "16px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>EVENT_TYPE</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["paid","💳 Paid Event","Charge attendees · multi-currency"],["free","🎉 Free Event","Zero cost · registration only"]].map(([val, label, sub]) => (
                <motion.button key={val} whileTap={{ scale: 0.97 }}
                  onClick={() => setEventType(val)}
                  style={{ flex: 1, padding: "13px 10px", borderRadius: "12px", border: `1.5px solid ${eventType === val ? B : "var(--border)"}`, background: eventType === val ? BG : "var(--bg-subtle)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: eventType === val ? B : "var(--text-primary)", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{sub}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Currency + country (paid only) */}
          {eventType === "paid" && (
            <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "18px", marginBottom: "16px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>CURRENCY & LOCATION</div>
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Currency</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {CURRENCIES.map(c => (
                    <motion.button key={c.code} whileTap={{ scale: 0.93 }} onClick={() => setCurrency(c.code)}
                      style={{ padding: "6px 12px", borderRadius: "8px", border: `1.5px solid ${currency === c.code ? B : "var(--border)"}`, background: currency === c.code ? BG : "var(--bg-subtle)", color: currency === c.code ? B : "var(--text-muted)", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "var(--font-mono)", transition: "all 0.15s" }}>
                      {c.symbol} {c.code}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>Country</div>
                <select value={country} onChange={e => setCountry(e.target.value)}
                  style={{ ...inp, marginBottom: 0 }}
                  onFocus={e => { e.target.style.borderColor = B; e.target.style.boxShadow = `0 0 0 3px ${B}12`; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Category */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Category <span style={{ color: "var(--error)" }}>*</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale: 0.93 }}
                  onClick={() => { setAddEventForm({ ...addEventForm, category: cat }); setErrors(p => ({ ...p, category: null })); }}
                  style={{ padding: "6px 14px", borderRadius: "99px", cursor: "pointer", fontSize: "11px", fontWeight: 600, border: `1.5px solid ${addEventForm.category === cat ? B : errors.category ? "var(--error)" : "var(--border)"}`, background: addEventForm.category === cat ? BG : "var(--bg-card)", color: addEventForm.category === cat ? B : "var(--text-secondary)", transition: "all 0.18s" }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.div>
              ))}
            </div>
            <AnimatePresence>{errors.category && <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "var(--error)", fontSize: "11px", marginTop: "5px" }}>⚠ {errors.category}</motion.div>}</AnimatePresence>
          </div>

          {/* Image */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Event Image</div>
            <div style={{ display: "flex", gap: "7px", marginBottom: "9px" }}>
              {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
                <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setImageType(t)}
                  style={{ flex: 1, padding: "8px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${imageType === t ? B : "var(--border)"}`, background: imageType === t ? BG : "var(--bg-card)", color: imageType === t ? B : "var(--text-secondary)", transition: "all 0.18s" }}>
                  {label}
                </motion.div>
              ))}
            </div>
            {imageType === "upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="event-image-upload" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0]; if (!f) return;
                    const canvas = document.createElement("canvas"); const img = new Image(); const url = URL.createObjectURL(f);
                    img.onload = () => { const MAX = 1200; let w = img.width, h = img.height; if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h); setAddEventForm({ ...addEventForm, image: canvas.toDataURL("image/jpeg", 0.82) }); URL.revokeObjectURL(url); };
                    img.src = url;
                  }} />
                <label htmlFor="event-image-upload" style={{ display: "block", padding: "20px 16px", background: "var(--bg-card)", border: `2px dashed ${B}30`, borderRadius: "13px", textAlign: "center", cursor: "pointer" }}>
                  {addEventForm.image?.startsWith("data:") || addEventForm.image?.startsWith("http") ? (
                    <><img src={addEventForm.image} alt="preview" style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "9px", marginBottom: "8px" }} /><div style={{ color: "#22c55e", fontSize: "12px", fontWeight: 700 }}>✅ Image ready — tap to change</div></>
                  ) : (
                    <><div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Tap to upload JPG or PNG</div><div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "3px" }}>Max 5MB · auto-compressed</div></>
                  )}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:") ? "" : (addEventForm.image || "")} onChange={e => setAddEventForm({ ...addEventForm, image: e.target.value })} style={inp} />
            )}
          </div>

          {/* Fields grid */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
            {fields.map(([key, label, type, placeholder, required]) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>{label} {required && <span style={{ color: "var(--error)" }}>*</span>}</div>
                <input type={type} placeholder={placeholder} value={addEventForm[key] || ""}
                  onChange={e => { setAddEventForm({ ...addEventForm, [key]: e.target.value }); if (errors[key]) setErrors(p => ({ ...p, [key]: null })); }}
                  style={{ ...inp, marginBottom: 0, borderColor: errors[key] ? "var(--error)" : "var(--border)", colorScheme: "light dark" }}
                  onFocus={e => { e.target.style.borderColor = B; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${B}12`; }}
                  onBlur={e => { e.target.style.borderColor = errors[key] ? "var(--error)" : "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
                <AnimatePresence>{errors[key] && <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "var(--error)", fontSize: "10px", marginTop: "3px" }}>⚠ {errors[key]}</motion.div>}</AnimatePresence>
              </div>
            ))}

            {/* Tickets + price */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Total {eventType === "free" ? "Spots" : "Tickets"} <span style={{ color: "var(--error)" }}>*</span></div>
              <input type="number" placeholder="e.g. 500" value={addEventForm.totalTickets || ""}
                onChange={e => { setAddEventForm({ ...addEventForm, totalTickets: e.target.value }); setErrors(p => ({ ...p, totalTickets: null })); }}
                style={{ ...inp, marginBottom: 0, borderColor: errors.totalTickets ? "var(--error)" : "var(--border)" }}
                onFocus={e => { e.target.style.borderColor = B; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${B}12`; }}
                onBlur={e => { e.target.style.borderColor = errors.totalTickets ? "var(--error)" : "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            {eventType === "paid" && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Ticket Price ({currency}) <span style={{ color: "var(--error)" }}>*</span>
                </div>
                <input type="number" placeholder="e.g. 150" value={addEventForm.price || ""}
                  onChange={e => { setAddEventForm({ ...addEventForm, price: e.target.value }); setErrors(p => ({ ...p, price: null })); }}
                  style={{ ...inp, marginBottom: 0, borderColor: errors.price ? "var(--error)" : "var(--border)" }}
                  onFocus={e => { e.target.style.borderColor = B; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${B}12`; }}
                  onBlur={e => { e.target.style.borderColor = errors.price ? "var(--error)" : "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
                <AnimatePresence>{errors.price && <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "var(--error)", fontSize: "10px", marginTop: "3px" }}>⚠ {errors.price}</motion.div>}</AnimatePresence>
              </div>
            )}
          </div>

          {/* Shareable link preview */}
          {addEventForm.name && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "13px", padding: "14px 16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", marginBottom: "7px", fontFamily: "var(--font-mono)" }}>🔗 SHAREABLE_EVENT_LINK</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-primary)", background: "var(--bg-card)", padding: "7px 11px", borderRadius: "8px", border: "1px solid var(--border)", wordBreak: "break-all", marginBottom: "5px" }}>{eventUrl}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Auto-generated · No login required for attendees</div>
            </motion.div>
          )}

          {/* Revenue split info */}
          {eventType === "paid" && (
            <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px" }}>💰</span>
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>95% revenue to you · 5% platform fee · Withdraw via MoMo or Stripe</span>
            </div>
          )}
          {eventType === "free" && (
            <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px" }}>🎉</span>
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>Free events — attendees register and receive a QR entry pass via email</span>
            </div>
          )}

          {/* NFT notice */}
          <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "9px" }}>
            <span style={{ fontSize: "14px" }}>⛓</span>
            <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>Each ticket auto-minted as NFT on Polygon blockchain</span>
          </div>

          <motion.button whileHover={{ scale: 1.02, boxShadow: `0 12px 32px ${B}40` }} whileTap={{ scale: 0.97 }}
            onClick={onSubmit}
            style={{ ...primaryBtn, maxWidth: desktop ? "300px" : "100%", marginBottom: 0, fontSize: "14px" }}>
            🎪 Create {eventType === "free" ? "Free" : "Paid"} Event
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZER EVENT DETAIL
// ═══════════════════════════════════════════════════════════════
export function OrganizerEventDetail() {
  const viewingOrgEvent    = useStore(s => s.viewingOrgEvent);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const toggleSales        = useStore(s => s.toggleSales);
  const generateDoorCode   = useStore(s => s.generateDoorCode);
  const doorStaffInvites   = useStore(s => s.doorStaffInvites);
  const setScreen          = useStore(s => s.setScreen);

  const [editing,        setEditing]        = useState(false);
  const [editForm,       setEditForm]       = useState({});
  const [editImageType,  setEditImageType]  = useState("upload");
  const [copiedCode,     setCopiedCode]     = useState(null);
  const [copiedLink,     setCopiedLink]     = useState(false);
  const [activeTab,      setActiveTab]      = useState("overview");
  const [holders,        setHolders]        = useState([]);
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [holderSearch,   setHolderSearch]   = useState("");
  const desktop = isDesktop();
  const API     = "https://master-events-backend.onrender.com";

  if (!viewingOrgEvent) return null;
  const ev      = viewingOrgEvent;
  const isFree  = ev.event_type === "free";
  const curr    = ev.currency || "GHS";
  const revenue = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee     = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites = doorStaffInvites[ev.id] || [];
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  const cover   = ev.image || categoryImages[ev.category] || categoryImages.other;
  const eventUrl = ev.event_url || (ev.slug ? `https://${ev.slug}.masterevents.events` : `https://masterevents.events`);

  const fetchHolders = async () => {
    if (holders.length > 0) return;
    setHoldersLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res   = await fetch(`${API}/api/tickets/event/${ev.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      setHolders(Array.isArray(data) ? data : []);
    } catch { setHolders([]); }
    finally { setHoldersLoading(false); }
  };

  const handleTabChange = tab => { setActiveTab(tab); if (tab === "holders") fetchHolders(); };

  const filteredHolders = holders.filter(t => {
    if (!holderSearch) return true;
    const q = holderSearch.toLowerCase();
    return (t.owner?.first_name + " " + t.owner?.last_name).toLowerCase().includes(q) ||
      (t.owner?.email || "").toLowerCase().includes(q) ||
      (t.ticket_id || "").toLowerCase().includes(q);
  });

  const statusColor = { active: "#22c55e", redeemed: "#6b7280", resale: "#ef4444", transferred: "#60a5fa" };
  const statusLabel = { active: "Active", redeemed: "Redeemed", resale: "Resale", transferred: "Transferred" };

  const copyCode = code => { navigator.clipboard?.writeText(code).catch(() => {}); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000); };
  const copyLink = () => { navigator.clipboard?.writeText(eventUrl).catch(() => {}); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };
  const startEdit = () => { setEditForm({ name: ev.name, venue: ev.venue, date: ev.date, time: ev.time || "", price: ev.price, description: ev.description || "", image: ev.image || "", category: ev.category || "other", city: ev.city || "", totalTickets: ev.totalTickets, subtitle: ev.subtitle || "", currency: ev.currency || "GHS", country: ev.country || "Ghana" }); setEditing(true); };
  const saveEdit  = () => { setViewingOrgEvent({ ...ev, ...editForm, price: parseFloat(editForm.price), totalTickets: parseInt(editForm.totalTickets) || ev.totalTickets }); setEditing(false); };

  // ── Edit mode ─────────────────────────────────────────────
  if (editing) return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "13px 18px", gap: "12px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)}
          style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>Edit Event</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>EDITING · {ev.name.slice(0,30)}{ev.name.length > 30 ? "…" : ""}</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
          style={{ padding: "8px 18px", background: `linear-gradient(135deg,${B},${BD})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          💾 Save
        </motion.button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
        <div style={{ padding: desktop ? "24px 40px 120px" : "14px 14px 120px", maxWidth: desktop ? "720px" : "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale: 0.93 }} onClick={() => setEditForm(p => ({ ...p, category: cat }))}
                  style={{ padding: "6px 13px", borderRadius: "99px", cursor: "pointer", fontSize: "11px", fontWeight: 600, border: `1.5px solid ${editForm.category === cat ? B : "var(--border)"}`, background: editForm.category === cat ? BG : "var(--bg-card)", color: editForm.category === cat ? B : "var(--text-secondary)", transition: "all 0.18s" }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.div>
              ))}
            </div>
          </div>
          {/* Currency row */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Currency</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {CURRENCIES.map(c => (
                <motion.button key={c.code} whileTap={{ scale: 0.93 }} onClick={() => setEditForm(p => ({ ...p, currency: c.code }))}
                  style={{ padding: "5px 11px", borderRadius: "8px", border: `1.5px solid ${editForm.currency === c.code ? B : "var(--border)"}`, background: editForm.currency === c.code ? BG : "var(--bg-subtle)", color: editForm.currency === c.code ? B : "var(--text-muted)", fontWeight: 700, fontSize: "10px", cursor: "pointer", fontFamily: "var(--font-mono)", transition: "all 0.15s" }}>
                  {c.symbol} {c.code}
                </motion.button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>Event Image</div>
            <div style={{ display: "flex", gap: "7px", marginBottom: "8px" }}>
              {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
                <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setEditImageType(t)}
                  style={{ flex: 1, padding: "8px", borderRadius: "9px", textAlign: "center", cursor: "pointer", fontSize: "11px", fontWeight: 600, border: `1.5px solid ${editImageType === t ? B : "var(--border)"}`, background: editImageType === t ? BG : "var(--bg-card)", color: editImageType === t ? B : "var(--text-secondary)", transition: "all 0.18s" }}>
                  {label}
                </motion.div>
              ))}
            </div>
            {editImageType === "upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="edit-image-upload" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0]; if (!f) return;
                    const canvas = document.createElement("canvas"); const img = new Image(); const url = URL.createObjectURL(f);
                    img.onload = () => { const MAX = 1200; let w = img.width, h = img.height; if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } canvas.width = w; canvas.height = h; canvas.getContext("2d").drawImage(img, 0, 0, w, h); setEditForm(p => ({ ...p, image: canvas.toDataURL("image/jpeg", 0.82) })); URL.revokeObjectURL(url); };
                    img.src = url;
                  }} />
                <label htmlFor="edit-image-upload" style={{ display: "block", padding: "18px", background: "var(--bg-card)", border: `2px dashed ${B}28`, borderRadius: "12px", textAlign: "center", cursor: "pointer" }}>
                  {editForm.image ? <><img src={editForm.image} alt="preview" style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} /><div style={{ color: "#22c55e", fontSize: "12px", fontWeight: 700 }}>✅ Tap to change</div></> : <><div style={{ fontSize: "26px", marginBottom: "7px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Tap to upload</div></>}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:") ? "" : (editForm.image || "")} onChange={e => setEditForm(p => ({ ...p, image: e.target.value }))} style={inp} />
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
            {[["name","Event Name","text",true],["subtitle","Subtitle","text",false],["date","Date","date",true],["time","Time","time",false],["venue","Venue","text",true],["city","City","text",false],["price","Ticket Price","number",true],["totalTickets","Total Tickets","number",false],["description","Description","text",false]].map(([key, label, type, required]) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>{label} {required && <span style={{ color: "var(--error)" }}>*</span>}</div>
                <input type={type} value={editForm[key] ?? ""}
                  onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ ...inp, marginBottom: 0, colorScheme: "light dark" }}
                  onFocus={e => { e.target.style.borderColor = B; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${B}12`; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "13px 15px", marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>Ticket Sales</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Currently {ev.salesOpen ? "open" : "paused"}</div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggleSales(ev.id)}
              style={{ padding: "8px 16px", background: ev.salesOpen ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", color: ev.salesOpen ? "#ef4444" : "#22c55e", border: `1.5px solid ${ev.salesOpen ? "rgba(239,68,68,0.22)" : "rgba(34,197,94,0.22)"}`, borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {ev.salesOpen ? "⏸ Pause" : "▶ Resume"}
            </motion.button>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
            style={{ ...primaryBtn, maxWidth: desktop ? "280px" : "100%", marginBottom: 0 }}>
            💾 Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ── Main view ─────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* Cover */}
      <div style={{ height: desktop ? "260px" : "210px", position: "relative", flexShrink: 0 }}>
        <img src={cover} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.82))" }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ position: "absolute", top: "12px", left: "12px", width: "34px", height: "34px", borderRadius: "9px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "#fff" }}>←</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startEdit}
          style={{ position: "absolute", top: "12px", right: "12px", padding: "6px 14px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "18px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
          ✏ Edit
        </motion.button>
        {/* Badges */}
        <div style={{ position: "absolute", top: "12px", left: "56px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)", padding: "3px 9px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "3px" }}>
          <span style={{ fontSize: "8px" }}>⛓</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>NFT</span>
        </div>
        {isFree && (
          <div style={{ position: "absolute", top: "12px", left: "110px", background: "rgba(22,163,74,0.85)", backdropFilter: "blur(8px)", padding: "3px 9px", borderRadius: "99px" }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>FREE</span>
          </div>
        )}
        <div style={{ position: "absolute", bottom: "16px", left: "18px", right: "18px" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>{(ev.category || "").toUpperCase()} · {ev.country || "GHANA"}</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: desktop ? "22px" : "18px", marginBottom: "4px", letterSpacing: "-0.5px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "0 " + (desktop ? "40px" : "14px"), display: "flex", gap: "2px" }}>
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "holders",  label: "Ticket Holders", icon: "👥", count: ev.ticketsSold },
        ].map(tab => (
          <motion.button key={tab.id} whileTap={{ scale: 0.96 }} onClick={() => handleTabChange(tab.id)}
            style={{ padding: "13px 14px", background: "none", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${B}` : "2px solid transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? B : "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }}>
            <span>{tab.icon}</span><span>{tab.label}</span>
            {tab.count !== undefined && (
              <span style={{ fontSize: "9px", fontWeight: 700, background: activeTab === tab.id ? `${B}14` : "var(--bg-subtle)", color: activeTab === tab.id ? B : "var(--text-muted)", padding: "1px 6px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>{tab.count}</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div style={{ padding: desktop ? "22px 40px" : "14px 14px" }}>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            {isFree ? [
              ["🎉","Registered",(ev.registrations_count || ev.ticketsSold).toLocaleString(),"#a78bfa"],
              ["🎫","Capacity",ev.totalTickets.toLocaleString(),"var(--text-primary)"],
              ["✅","Checked In",(ev.admittedCount || 0) + " ppl",B],
              ["📅","Date",ev.date,"#60a5fa"],
            ] : [
              ["💰","Revenue (95%)",`${curr} ${revenue.toLocaleString()}`,"#22c55e"],
              ["🏦","Platform Fee",`${curr} ${fee.toLocaleString()}`,"#ef4444"],
              ["🎟","Tickets Sold",`${ev.ticketsSold}/${ev.totalTickets}`,"#60a5fa"],
              ["🚪","Admitted",(ev.admittedCount || 0) + " ppl",B],
            ].map(([icon, label, value, color]) => (
              <motion.div key={label} whileHover={{ y: -2 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "13px", padding: "13px 14px" }}>
                <div style={{ fontSize: "15px", marginBottom: "5px" }}>{icon}</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color, marginBottom: "2px", letterSpacing: "-0.5px" }}>{value}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ background: "var(--bg-card)", borderRadius: "13px", padding: "14px 15px", marginBottom: "12px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{isFree ? "Registration" : "Sales"} Progress</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: soldPct > 80 ? "#ef4444" : B, fontFamily: "var(--font-mono)" }}>{soldPct}%</span>
            </div>
            <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.9 }}
                style={{ height: "100%", background: soldPct > 80 ? "linear-gradient(90deg,#ef4444,#dc2626)" : `linear-gradient(90deg,${B},${BD})`, borderRadius: "99px" }} />
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "5px", fontFamily: "var(--font-mono)" }}>{ev.totalTickets - ev.ticketsSold} {isFree ? "spots" : "tickets"} remaining</div>
          </div>

          {/* Shareable link */}
          <div style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.14)", borderRadius: "13px", padding: "14px 15px", marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", marginBottom: "7px", fontFamily: "var(--font-mono)" }}>🔗 SHAREABLE_EVENT_LINK</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-primary)", background: "var(--bg-card)", padding: "7px 11px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "8px", wordBreak: "break-all" }}>{eventUrl}</div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={copyLink}
              style={{ padding: "6px 14px", background: copiedLink ? "rgba(34,197,94,0.1)" : BG, color: copiedLink ? "#22c55e" : B, border: `1.5px solid ${copiedLink ? "rgba(34,197,94,0.25)" : B + "30"}`, borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
              {copiedLink ? "✓ Copied!" : "Copy Link"}
            </motion.button>
          </div>

          {ev.description && (
            <div style={{ background: "var(--bg-card)", borderRadius: "13px", padding: "13px 15px", marginBottom: "12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "7px", fontFamily: "var(--font-mono)" }}>DESCRIPTION</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{ev.description}</div>
            </div>
          )}

          {/* Payment methods */}
          {!isFree && (
            <div style={{ background: "var(--bg-card)", borderRadius: "13px", padding: "13px 15px", marginBottom: "12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "9px", fontFamily: "var(--font-mono)" }}>PAYMENT_METHODS</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["momo","stripe","paystack","visa"].map(m => <PaymentBadge key={m} method={m} />)}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "9px", marginBottom: "14px" }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => toggleSales(ev.id)}
              style={{ ...primaryBtn, marginBottom: 0, background: ev.salesOpen ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#22c55e,#16a34a)", fontSize: "13px" }}>
              {ev.salesOpen ? `⏸ Pause ${isFree ? "Registrations" : "Sales"}` : `▶ Resume ${isFree ? "Registrations" : "Sales"}`}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("scanTicket")}
              style={{ ...primaryBtn, marginBottom: 0, background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "none", color: "var(--text-primary)", fontSize: "13px" }}>
              🔍 Scan Tickets at Door
            </motion.button>
          </div>

          {/* Door staff */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "15px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", border: `1px solid ${B}18` }}>🚪</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Door Staff Access</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Single-use · auto-expire on first scan</div>
              </div>
            </div>
            <motion.button whileHover={{ borderColor: B }} whileTap={{ scale: 0.97 }} onClick={() => generateDoorCode(ev.id, ev.name)}
              style={{ width: "100%", padding: "10px", background: BG, color: B, border: `2px dashed ${B}35`, borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", marginBottom: "10px", transition: "border-color 0.2s", fontFamily: "var(--font-sans)" }}>
              + Generate Door Staff Code
            </motion.button>
            {invites.map(inv => (
              <motion.div key={inv.code} whileTap={{ scale: 0.98 }} onClick={() => copyCode(inv.code)}
                style={{ background: inv.used ? "var(--bg-subtle)" : BG, border: `1px solid ${inv.used ? "var(--border)" : B + "25"}`, borderRadius: "10px", padding: "9px 13px", marginBottom: "7px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: inv.used ? "var(--text-muted)" : B, fontSize: "13px", letterSpacing: "1.5px" }}>{inv.code}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span style={{ fontSize: "9px", color: inv.used ? "var(--text-muted)" : "#22c55e", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{inv.used ? "USED" : "ACTIVE"}</span>
                  {!inv.used && <span style={{ fontSize: "9px", color: copiedCode === inv.code ? "#22c55e" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{copiedCode === inv.code ? "✓ COPIED" : "TAP TO COPY"}</span>}
                </div>
              </motion.div>
            ))}
            <div style={{ padding: "9px 12px", borderRadius: "9px", background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.1)", display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "12px" }}>🔒</span>
              <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 600 }}>Door staff can only scan — cannot manage events</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKET HOLDERS TAB ── */}
      {activeTab === "holders" && (
        <div style={{ padding: desktop ? "22px 40px" : "14px 14px" }}>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "9px", marginBottom: "14px" }}>
            {[
              ["🎟", holders.filter(t => t.status === "active").length,   "Active",    "#22c55e"],
              ["✅", holders.filter(t => t.status === "redeemed").length, "Redeemed",  "#6b7280"],
              ["🏷", holders.filter(t => t.status === "resale").length,   "On Resale", "#ef4444"],
            ].map(([icon, count, label, color]) => (
              <div key={label} style={{ background: "var(--bg-card)", borderRadius: "11px", padding: "11px 12px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "16px", marginBottom: "3px" }}>{icon}</div>
                <div style={{ fontSize: "18px", fontWeight: 900, color, marginBottom: "1px" }}>{holdersLoading ? "—" : count}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <input value={holderSearch} onChange={e => setHolderSearch(e.target.value)} placeholder="Search by name, email or ticket ID..."
              style={{ width: "100%", padding: "9px 13px 9px 34px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "9px", fontSize: "12px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = B; e.target.style.boxShadow = `0 0 0 3px ${B}10`; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", opacity: 0.35 }}>🔍</span>
            {holderSearch && <span onClick={() => setHolderSearch("")} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>✕</span>}
          </div>

          {holdersLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "58px", borderRadius: "11px" }} />)}
            </div>
          ) : filteredHolders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "52px 20px", background: "var(--bg-card)", borderRadius: "15px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>👥</div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "5px" }}>{holderSearch ? "No results" : "No ticket holders yet"}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{holderSearch ? "Try a different search term" : "Holders appear here once someone buys a ticket"}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {desktop && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 110px", gap: "10px", padding: "6px 13px", fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", fontFamily: "var(--font-mono)" }}>
                  <span>HOLDER</span><span>TICKET ID</span><span>QTY</span><span>STATUS</span>
                </div>
              )}
              {filteredHolders.map((t, i) => {
                const ownerName  = ((t.owner?.first_name || "") + " " + (t.owner?.last_name || "")).trim() || "Unknown";
                const ownerEmail = t.owner?.email || "—";
                const color      = statusColor[t.status] || "#6b7280";
                const label      = statusLabel[t.status] || t.status;
                return (
                  <motion.div key={t.ticket_id || i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                    style={{ background: "var(--bg-card)", borderRadius: "11px", padding: "11px 13px", border: "1px solid var(--border)", display: desktop ? "grid" : "flex", gridTemplateColumns: desktop ? "1fr 1fr 80px 110px" : undefined, flexDirection: desktop ? undefined : "row", alignItems: "center", gap: "10px", transition: "border-color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${B}35`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <div style={{ minWidth: 0, flex: desktop ? undefined : 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ownerName}
                        {t.is_resale && <span style={{ marginLeft: "5px", fontSize: "8px", fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "1px 5px", borderRadius: "99px" }}>RESALE</span>}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ownerEmail}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: desktop ? "block" : "none" }}>
                      {String(t.ticket_id || "").slice(0,14)}…
                      {t.nft_token_id && <div style={{ fontSize: "8px", color: "#7c3aed", marginTop: "1px" }}>NFT #{t.nft_token_id}</div>}
                    </div>
                    <div style={{ display: desktop ? "block" : "none" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: B, fontFamily: "var(--font-mono)" }}>×{t.quantity || 1}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", fontWeight: 700, color, background: color + "14", padding: "3px 9px", borderRadius: "99px", border: `1px solid ${color}22`, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                        {label.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              <div style={{ textAlign: "center", padding: "10px", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {filteredHolders.length} of {holders.length} holders{holderSearch && ` · "${holderSearch}"`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}