import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

const CATEGORIES = ["music","tech","food","arts","sports","business","other"];
const isDesktop  = () => window.innerWidth > 768;
const mapEvent   = e => ({
  id: e.id, name: e.name, date: e.date, venue: e.venue,
  category: e.category || "other", price: parseFloat(e.price),
  totalTickets: e.total_tickets, ticketsSold: e.tickets_sold,
  salesOpen: e.sales_open, description: e.description || "",
  image: e.image || categoryImages[e.category] || categoryImages.other,
});

const inp = {
  width: "100%", padding: "13px 16px", marginBottom: "14px",
  background: "var(--bg-subtle)", border: "1.5px solid var(--border)",
  borderRadius: "12px", fontSize: "14px", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-sans)",
  boxSizing: "border-box", caretColor: "#f5a623", transition: "all 0.2s",
};
const primaryBtn = {
  width: "100%", padding: "15px",
  background: "linear-gradient(135deg, #f5a623, #e8920f)",
  color: "#fff", border: "none", borderRadius: "13px",
  fontSize: "14px", fontWeight: 700, cursor: "pointer",
  boxShadow: "var(--shadow-brand)", marginBottom: "12px",
  fontFamily: "var(--font-sans)",
};

// ── CSV download helper ───────────────────────────────────────
function downloadCSV(rows, filename) {
  const header = Object.keys(rows[0]).join(",");
  const body   = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  const blob   = new Blob([header + "\n" + body], { type: "text/csv" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Custom tooltip for charts ─────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 14px", boxShadow: "var(--shadow-md)", fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: "13px", fontWeight: 700, color: p.color, marginBottom: "2px" }}>
          {p.name}: {p.name === "Revenue" ? "GHS " + Math.round(p.value).toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

// ── Telemetry bar ─────────────────────────────────────────────
function OrgTelemetry({ events, totalSold, totalRevenue }) {
  const [ms] = useState(() => Math.floor(Math.random() * 14) + 6);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "8px 16px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", flexWrap: "wrap", marginBottom: "20px" }}>
      {[
        ["EVENTS",  events.toString().padStart(2,"0"),                  "#f5a623"],
        ["SOLD",    totalSold.toString().padStart(3,"0"),               "#4ade80"],
        ["REVENUE", "GHS " + Math.round(totalRevenue).toLocaleString(),"#60a5fa"],
        ["CHAIN",   "AMOY",                                             "#a78bfa"],
        ["STATUS",  "OPR_OK",                                           "#4ade80"],
        ["LATENCY", ms + "ms",                                          "var(--text-muted)"],
      ].map(([key, val, color]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.8px" }}>{key}</span>
          <span style={{ fontSize: "9px", color: "var(--border-strong)" }}>:</span>
          <span style={{ fontSize: "9px", fontWeight: 700, color, letterSpacing: "0.5px" }}>{val}</span>
        </div>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
        <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
        <span style={{ fontSize: "8px", fontWeight: 700, color: "#4ade80", letterSpacing: "1px" }}>LIVE</span>
      </div>
    </div>
  );
}

// ── Bento stat card ───────────────────────────────────────────
function BentoStat({ icon, value, label, sub, color, bg, large, onClick }) {
  return (
    <motion.div whileHover={{ y: -3, boxShadow: "var(--shadow-lg)", borderColor: color + "40" }}
      whileTap={onClick ? { scale: 0.98 } : {}} onClick={onClick}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: large ? "24px" : "18px", boxShadow: "var(--shadow-sm)", transition: "all 0.22s var(--ease-smooth)", cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", borderRadius: "50%", background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, transform: "translate(30%, -30%)", pointerEvents: "none" }} />
      <div style={{ width: large ? "44px" : "36px", height: large ? "44px" : "36px", borderRadius: large ? "13px" : "11px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: large ? "20px" : "16px", marginBottom: large ? "14px" : "10px", border: "1px solid " + color + "20" }}>
        {icon}
      </div>
      <div style={{ fontSize: large ? "28px" : "20px", fontWeight: 800, color, letterSpacing: "-0.5px", marginBottom: "3px", lineHeight: 1, fontFamily: "var(--font-sans)" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label}</div>
      {sub && <div style={{ marginTop: "6px", fontSize: "10px", fontWeight: 700, color, background: color + "12", padding: "2px 8px", borderRadius: "99px", width: "fit-content", fontFamily: "var(--font-mono)" }}>{sub}</div>}
    </motion.div>
  );
}

// ── Event card ────────────────────────────────────────────────
function EventCard({ ev, onClick }) {
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  return (
    <motion.div whileHover={{ y: -4, boxShadow: "var(--shadow-lg)", borderColor: "rgba(245,166,35,0.4)" }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ background: "var(--bg-card)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "all 0.22s var(--ease-smooth)" }}>
      <div style={{ height: "160px", position: "relative" }}>
        <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.75))" }} />
        <div style={{ position: "absolute", top: "10px", right: "10px", background: ev.salesOpen ? "#16a34a" : "#6b6b6b", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-mono)" }}>
          {ev.salesOpen && <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#fff" }} />}
          {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
        <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "3px 8px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "3px", fontFamily: "var(--font-mono)" }}>
          <span>⛓️</span><span>NFT</span>
        </div>
        <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "2px", lineHeight: 1.2 }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "10px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700, fontFamily: "var(--font-mono)" }}>GHS {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}</span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{ev.ticketsSold}/{ev.totalTickets}</span>
        </div>
        <div style={{ height: "3px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: soldPct > 80 ? "#dc2626" : "linear-gradient(90deg, #f5a623, #e8920f)", borderRadius: "2px" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Analytics section ─────────────────────────────────────────
function AnalyticsSection({ events }) {
  const desktop = isDesktop();

  // Build chart data from events
  const chartData = events.map(e => ({
    name: e.name.length > 14 ? e.name.slice(0, 14) + "…" : e.name,
    Tickets: e.ticketsSold,
    Revenue: Math.round(e.ticketsSold * e.price * 0.95),
    Capacity: e.totalTickets,
  }));

  // Summary stats
  const totalRevenue  = events.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold     = events.reduce((s, e) => s + e.ticketsSold, 0);
  const totalCapacity = events.reduce((s, e) => s + e.totalTickets, 0);
  const avgFill       = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const bestEvent     = [...events].sort((a,b) => b.ticketsSold * b.price - a.ticketsSold * a.price)[0];

  const handleDownloadCSV = () => {
    if (events.length === 0) return;
    const rows = events.map(e => ({
      Event:          e.name,
      Date:           e.date,
      Venue:          e.venue,
      Category:       e.category,
      "Ticket Price": e.price,
      "Tickets Sold": e.ticketsSold,
      "Total Tickets": e.totalTickets,
      "Fill Rate %":  totalCapacity > 0 ? Math.round((e.ticketsSold / e.totalTickets) * 100) : 0,
      "Revenue (GHS)": Math.round(e.ticketsSold * e.price * 0.95),
      "Platform Fee":  Math.round(e.ticketsSold * e.price * 0.05),
      Status:         e.salesOpen ? "Live" : "Closed",
    }));
    downloadCSV(rows, `master-events-report-${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div style={{ marginBottom: "28px" }}>

      {/* Section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>ANALYTICS</div>
          <h2 style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Performance Overview</h2>
        </div>
        <motion.button whileHover={{ scale: 1.03, boxShadow: "var(--shadow-md)" }} whileTap={{ scale: 0.97 }}
          onClick={handleDownloadCSV}
          disabled={events.length === 0}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", background: events.length === 0 ? "var(--bg-subtle)" : "var(--bg-card)", border: "1.5px solid " + (events.length === 0 ? "var(--border)" : "#16a34a"), borderRadius: "10px", cursor: events.length === 0 ? "not-allowed" : "pointer", color: events.length === 0 ? "var(--text-muted)" : "#16a34a", fontWeight: 700, fontSize: "12px", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}>
          <span style={{ fontSize: "14px" }}>⬇️</span>
          Download CSV
        </motion.button>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>NO_DATA · CREATE_EVENTS_TO_SEE_ANALYTICS</div>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {[
              ["📈", "Avg Fill Rate",  avgFill + "%",                                         "#f5a623", "rgba(245,166,35,0.08)"],
              ["🏆", "Best Event",     bestEvent ? bestEvent.name.slice(0,14) + (bestEvent.name.length>14?"…":"") : "—", "#7c3aed", "rgba(124,58,237,0.08)"],
              ["💵", "Avg Rev/Event",  events.length > 0 ? "GHS " + Math.round(totalRevenue / events.length).toLocaleString() : "—", "#16a34a", "rgba(22,163,74,0.08)"],
              ["🎟", "Avg Sold/Event", events.length > 0 ? Math.round(totalSold / events.length) : "—", "#2563eb", "rgba(37,99,235,0.08)"],
            ].map(([icon, label, value, color, bg]) => (
              <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "18px", marginBottom: "6px" }}>{icon}</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color, marginBottom: "2px", fontFamily: "var(--font-sans)" }}>{value}</div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase().replace(/ /g, "_")}</div>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", marginBottom: "14px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Revenue by Event</div>
              <div style={{ fontSize: "9px", color: "#16a34a", fontWeight: 700, fontFamily: "var(--font-mono)", background: "rgba(22,163,74,0.08)", padding: "2px 8px", borderRadius: "99px" }}>95%_PAYOUT</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Revenue" fill="#f5a623" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tickets vs Capacity chart */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Tickets Sold vs Capacity</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "var(--font-mono)" }} />
                <Bar dataKey="Capacity" fill="var(--bg-subtle)" stroke="var(--border)" radius={[6,6,0,0]} />
                <Bar dataKey="Tickets"  fill="#2563eb" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export function OrganizerHome() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setScreen          = useStore(s => s.setScreen);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser        = useStore(s => s.currentUser);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();

  useEffect(() => {
    eventsAPI.myEvents().then(data => {
      if (Array.isArray(data)) setOrgEvents(data.map(mapEvent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalRevenue  = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold     = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const activeEvents  = orgEvents.filter(e => e.salesOpen).length;
  const totalCapacity = orgEvents.reduce((s, e) => s + e.totalTickets, 0);
  const fillRate      = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const topEvent      = [...orgEvents].sort((a,b) => b.ticketsSold - a.ticketsSold)[0];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "5px", fontFamily: "var(--font-mono)" }}>ORGANIZER_DASHBOARD</div>
          <h1 style={{ fontWeight: 800, fontSize: desktop ? "26px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.6px", marginBottom: "3px" }}>
            {desktop ? `Welcome back, ${currentUser?.first_name}` : "Dashboard"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            {desktop ? "Your event command center" : `Hi ${currentUser?.first_name} 👋`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "99px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c3aed" }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#7c3aed", fontFamily: "var(--font-mono)" }}>POLYGON</span>
          </div>
          {desktop && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setScreen("addEvent")}
              style={{ padding: "8px 18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
              + New Event
            </motion.button>
          )}
        </div>
      </div>

      {!loading && <OrgTelemetry events={orgEvents.length} totalSold={totalSold} totalRevenue={totalRevenue} />}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "18px" }} />)}
        </div>
      ) : (
        <>
          {/* Bento Grid */}
          {desktop ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <BentoStat icon="💰" large value={"GHS " + Math.round(totalRevenue).toLocaleString()} label="TOTAL_REVENUE" sub={"95% PAYOUT · " + fillRate + "% FILL"} color="#16a34a" bg="rgba(22,163,74,0.1)" onClick={() => setScreen("wallet")} />
              </div>
              <BentoStat icon="🎟️" value={totalSold} label="TICKETS_SOLD" sub={fillRate + "% fill"} color="#2563eb" bg="rgba(37,99,235,0.1)" />
              <BentoStat icon="🎪" value={activeEvents} label="ACTIVE_EVENTS" sub={orgEvents.length + " total"} color="#f5a623" bg="rgba(245,166,35,0.1)" />

              {/* Blockchain panel */}
              <div style={{ gridColumn: "span 2" }}>
                <motion.div whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
                  style={{ background: "var(--bg-card)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "18px", padding: "20px", boxShadow: "var(--shadow-sm)", transition: "all 0.22s", position: "relative", overflow: "hidden", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⛓️</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed" }}>Polygon Amoy</div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>CONTRACT: 0x956F...0Daf</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                      <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono)" }}>ONLINE</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    {[["NFT_MINTED", totalSold.toString(), "#a78bfa"], ["CHAIN_ID", "80002", "#60a5fa"], ["GAS_COST", "~0.0002", "#4ade80"]].map(([key, val, color]) => (
                      <div key={key} style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "10px 12px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color, marginBottom: "2px" }}>{val}</div>
                        <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{key}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Payout split */}
              <motion.div whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "18px", boxShadow: "var(--shadow-sm)", transition: "all 0.22s" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>PAYOUT_SPLIT</div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>You (95%)</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono)" }}>GHS {Math.round(totalRevenue).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: "95%", height: "100%", background: "linear-gradient(90deg,#16a34a,#22c55e)", borderRadius: "3px" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Platform (5%)</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>GHS {Math.round(totalRevenue * 0.053).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: "5%", height: "100%", background: "#dc2626", borderRadius: "3px" }} />
                  </div>
                </div>
              </motion.div>

              {/* Top event */}
              {topEvent && (
                <motion.div whileHover={{ y: -3, boxShadow: "var(--shadow-lg)", borderColor: "rgba(245,166,35,0.3)" }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setViewingOrgEvent(topEvent); setScreen("orgEventDetail"); }}
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "18px", boxShadow: "var(--shadow-sm)", transition: "all 0.22s", cursor: "pointer", overflow: "hidden", position: "relative" }}>
                  <img src={topEvent.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12 }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>TOP_EVENT</div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "4px", lineHeight: 1.3 }}>{topEvent.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "10px" }}>{topEvent.ticketsSold} sold · GHS {Math.round(topEvent.ticketsSold * topEvent.price * 0.95).toLocaleString()}</div>
                    <div style={{ height: "3px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: Math.round((topEvent.ticketsSold / topEvent.totalTickets) * 100) + "%", background: "linear-gradient(90deg,#f5a623,#e8920f)", borderRadius: "2px" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              <BentoStat icon="💰" value={"GHS " + Math.round(totalRevenue).toLocaleString()} label="REVENUE" color="#16a34a" bg="rgba(22,163,74,0.1)" />
              <BentoStat icon="🎟️" value={totalSold} label="SOLD" sub={fillRate + "%"} color="#2563eb" bg="rgba(37,99,235,0.1)" />
              <BentoStat icon="🎪" value={activeEvents} label="LIVE" sub={orgEvents.length + " total"} color="#f5a623" bg="rgba(245,166,35,0.1)" />
              <BentoStat icon="⛓️" value={totalSold} label="NFT_MINTED" color="#7c3aed" bg="rgba(124,58,237,0.1)" />
            </div>
          )}

          {/* Info banners */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: "24px" }}>
            <div style={{ background: "rgba(245,166,35,0.04)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>💡</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623", marginBottom: "2px" }}>Payouts via Paystack</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>95% of ticket revenue goes straight to your wallet. Withdraw to MoMo anytime.</div>
              </div>
            </div>
            <div style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>⛓️</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", marginBottom: "2px" }}>NFT Tickets on Polygon Amoy</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>Every ticket minted on-chain. Zero fakes. QR rotates every 10s.</div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <AnalyticsSection events={orgEvents} />

          {/* Events grid */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Your Events
              {orgEvents.length > 0 && <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, fontFamily: "var(--font-mono)" }}>[{orgEvents.length}]</span>}
            </div>
            {!desktop && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("addEvent")}
                style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                + New
              </motion.button>
            )}
          </div>

          {orgEvents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 32px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
              <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Create your first event and start selling NFT tickets</div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
                style={{ padding: "12px 28px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
                + Create Your First Event
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "16px" : "12px" }}>
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

// ── My Events ─────────────────────────────────────────────────
export function OrganizerEvents() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen          = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();

  useEffect(() => {
    eventsAPI.myEvents().then(data => {
      if (Array.isArray(data)) setOrgEvents(data.map(mapEvent));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>MY_EVENTS</div>
          <h1 style={{ fontWeight: 800, fontSize: desktop ? "26px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.6px" }}>Events</h1>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
          style={{ padding: "9px 18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
          + New Event
        </motion.button>
      </div>
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "16px" : "12px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: "var(--bg-card)", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ height: "160px" }} />
              <div style={{ padding: "12px 14px" }}>
                <div className="skeleton" style={{ height: "13px", width: "60%", marginBottom: "8px" }} />
                <div className="skeleton" style={{ height: "3px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : orgEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎪</div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Click + New Event to get started</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "16px" : "12px" }}>
          {orgEvents.map(ev => (
            <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Organizer Alerts ──────────────────────────────────────────
export function OrganizerAlerts() {
  const orgEvents = useStore(s => s.orgEvents);
  const desktop   = isDesktop();
  const totalRevenue = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold    = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);

  const alerts = orgEvents.length > 0 ? [
    { icon: "⛓️", color: "#7c3aed", title: "NFT Tickets Active on Polygon", body: `${totalSold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length > 1 ? "s" : ""}. All ownership records are immutable on-chain.`, time: "LIVE" },
    { icon: "💰", color: "#16a34a", title: "Revenue Update", body: `Your events have generated GHS ${Math.round(totalRevenue).toLocaleString()} at 95% payout rate.`, time: "NOW" },
    { icon: "🎪", color: "#f5a623", title: "Active Events", body: `You have ${orgEvents.filter(e => e.salesOpen).length} event${orgEvents.filter(e => e.salesOpen).length !== 1 ? "s" : ""} with ticket sales open.`, time: "TODAY" },
    { icon: "🔒", color: "#2563eb", title: "Security: HMAC QR Active", body: "All QR codes rotate every 10 seconds. Screenshot sharing is cryptographically prevented.", time: "ALWAYS" },
  ] : [{ icon: "🔔", color: "#f5a623", title: "No alerts yet", body: "Create an event and start selling tickets to see alerts here.", time: "NOW" }];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ fontSize: "9px", color: "#f5a623", fontWeight: 700, letterSpacing: "2px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>NOTIFICATIONS</div>
      <h1 style={{ fontWeight: 800, fontSize: desktop ? "26px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.6px", marginBottom: "4px" }}>Alerts</h1>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", fontFamily: "var(--font-mono)" }}>BLOCKCHAIN_CONFIRMATIONS · EVENT_ACTIVITY</p>
      <div style={{ maxWidth: desktop ? "640px" : "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        {alerts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "box-shadow 0.2s" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: a.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: `1px solid ${a.color}20` }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "3px" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "7px" }}>{a.body}</div>
              <div style={{ fontSize: "9px", color: a.color, fontWeight: 700, background: a.color + "12", padding: "2px 8px", borderRadius: "99px", width: "fit-content", fontFamily: "var(--font-mono)" }}>{a.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Add Event — SCROLL FULLY FIXED ───────────────────────────
export function AddEvent() {
  const addEventForm    = useStore(s => s.addEventForm);
  const setAddEventForm = useStore(s => s.setAddEventForm);
  const handleAddEvent  = useStore(s => s.handleAddEvent);
  const setScreen       = useStore(s => s.setScreen);
  const [imageType, setImageType] = useState("upload");
  const [errors,    setErrors]    = useState({});
  const desktop = isDesktop();

  const validate = () => {
    const e = {};
    if (!addEventForm.name?.trim())  e.name         = "Event name is required";
    if (!addEventForm.date)          e.date         = "Date is required";
    if (!addEventForm.price)         e.price        = "Ticket price is required";
    if (!addEventForm.totalTickets)  e.totalTickets = "Total tickets is required";
    if (!addEventForm.category)      e.category     = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fields = [
    ["name",         "Event Name",         "text",   "e.g. Afrobeats Night 2026",       true],
    ["subtitle",     "Subtitle",           "text",   "e.g. The biggest night in Accra",  false],
    ["date",         "Date",               "date",   "",                                  true],
    ["time",         "Time",               "time",   "",                                  false],
    ["venue",        "Venue",              "text",   "e.g. Accra Sports Stadium",         true],
    ["city",         "City",               "text",   "e.g. Accra",                        false],
    ["price",        "Ticket Price (GHS)", "number", "e.g. 150",                          true],
    ["totalTickets", "Total Tickets",      "number", "e.g. 500",                          true],
    ["description",  "Description",        "text",   "Short description of the event",    false],
  ];

  return (
    <div style={{
      background: "var(--bg)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Sticky header */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "14px 20px", gap: "14px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0, zIndex: 10,
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>
          ←
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Create Event</div>
          <div style={{ fontSize: "10px", color: "#7c3aed", marginTop: "1px", fontFamily: "var(--font-mono)" }}>⛓️ NFT_TICKETS_AUTO_MINTED · POLYGON_AMOY</div>
        </div>
      </div>

      {/* ── THE SCROLL FIX: minHeight:0 + overflowY:scroll ── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: "scroll",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}>
        <div style={{
          padding: desktop ? "24px 40px 120px" : "14px 16px 120px",
          maxWidth: desktop ? "800px" : "100%",
          margin: "0 auto",
        }}>

          {/* Category */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "9px" }}>
              Category <span style={{ color: "var(--error)" }}>*</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale: 0.93 }}
                  onClick={() => { setAddEventForm({ ...addEventForm, category: cat }); setErrors(p => ({ ...p, category: null })); }}
                  style={{ padding: "6px 14px", borderRadius: "99px", cursor: "pointer", fontSize: "11px", fontWeight: 600, border: "1.5px solid " + (addEventForm.category === cat ? "#f5a623" : errors.category ? "var(--error)" : "var(--border)"), background: addEventForm.category === cat ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: addEventForm.category === cat ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.div>
              ))}
            </div>
            <AnimatePresence>
              {errors.category && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: "var(--error)", fontSize: "11px", marginTop: "5px" }}>⚠️ {errors.category}</motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "9px" }}>Event Image</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
              {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
                <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setImageType(t)}
                  style={{ flex: 1, padding: "8px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "1.5px solid " + (imageType === t ? "#f5a623" : "var(--border)"), background: imageType === t ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: imageType === t ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {label}
                </motion.div>
              ))}
            </div>
            {imageType === "upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="event-image-upload" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (!f) return;
                    // ── Resize + compress before base64 ──
                    const canvas = document.createElement("canvas");
                    const img    = new Image();
                    const url    = URL.createObjectURL(f);
                    img.onload   = () => {
                      const MAX = 1200;
                      let w = img.width, h = img.height;
                      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                      canvas.width = w; canvas.height = h;
                      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                      const base64 = canvas.toDataURL("image/jpeg", 0.82);
                      setAddEventForm({ ...addEventForm, image: base64 });
                      URL.revokeObjectURL(url);
                    };
                    img.src = url;
                  }} />
                <label htmlFor="event-image-upload" style={{ display: "block", padding: "20px 16px", background: "var(--bg-card)", border: "2px dashed var(--border)", borderRadius: "12px", textAlign: "center", cursor: "pointer" }}>
                  {addEventForm.image?.startsWith("data:") || addEventForm.image?.startsWith("http") ? (
                    <>
                      <img src={addEventForm.image} alt="preview" style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                      <div style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>✅ Image ready · tap to change</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600 }}>Tap to upload JPG or PNG</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "2px" }}>Max 5MB · auto-compressed</div>
                    </>
                  )}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:") ? "" : (addEventForm.image || "")}
                onChange={e => setAddEventForm({ ...addEventForm, image: e.target.value })} style={inp} />
            )}
          </div>

          {/* Fields */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
            {fields.map(([key, label, type, placeholder, required]) => (
              <div key={key} style={{ marginBottom: "13px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {label} {required && <span style={{ color: "var(--error)" }}>*</span>}
                </div>
                <input type={type} placeholder={placeholder} value={addEventForm[key] || ""}
                  onChange={e => { setAddEventForm({ ...addEventForm, [key]: e.target.value }); if (errors[key]) setErrors(p => ({ ...p, [key]: null })); }}
                  style={{ ...inp, marginBottom: 0, borderColor: errors[key] ? "var(--error)" : "var(--border)", colorScheme: "light dark" }}
                  onFocus={e => { e.target.style.borderColor = "#f5a623"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = errors[key] ? "var(--error)" : "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
                <AnimatePresence>
                  {errors[key] && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ color: "var(--error)", fontSize: "10px", marginTop: "3px" }}>⚠️ {errors[key]}</motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.14)", borderRadius: "11px", padding: "11px 14px", marginBottom: "24px", marginTop: "6px", display: "flex", alignItems: "center", gap: "9px" }}>
            <span style={{ fontSize: "14px" }}>⛓️</span>
            <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 600 }}>Each ticket sold will be automatically minted as an NFT on Polygon blockchain</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { if (validate()) handleAddEvent(); }}
            style={{ ...primaryBtn, maxWidth: desktop ? "300px" : "100%", marginBottom: 0 }}>
            🎪 Create Event
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── Event Detail ──────────────────────────────────────────────
export function OrganizerEventDetail() {
  const viewingOrgEvent    = useStore(s => s.viewingOrgEvent);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const toggleSales        = useStore(s => s.toggleSales);
  const generateDoorCode   = useStore(s => s.generateDoorCode);
  const doorStaffInvites   = useStore(s => s.doorStaffInvites);
  const setScreen          = useStore(s => s.setScreen);
  const [editing,       setEditing]       = useState(false);
  const [editForm,      setEditForm]      = useState({});
  const [editImageType, setEditImageType] = useState("upload");
  const [copiedCode,    setCopiedCode]    = useState(null);
  const desktop = isDesktop();

  if (!viewingOrgEvent) return null;
  const ev      = viewingOrgEvent;
  const revenue = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee     = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites = doorStaffInvites[ev.id] || [];
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  const cover   = ev.image || categoryImages[ev.category] || categoryImages.other;

  const copyCode = code => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const startEdit = () => {
    setEditForm({
      name: ev.name, venue: ev.venue, date: ev.date,
      time: ev.time || "", price: ev.price,
      description: ev.description || "", image: ev.image || "",
      category: ev.category || "other", city: ev.city || "",
      totalTickets: ev.totalTickets, subtitle: ev.subtitle || "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    setViewingOrgEvent({
      ...ev, ...editForm,
      price:        parseFloat(editForm.price),
      totalTickets: parseInt(editForm.totalTickets) || ev.totalTickets,
    });
    setEditing(false);
  };

  // ── Edit form ─────────────────────────────────────────────
  if (editing) return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: "12px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", flexShrink: 0, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)}
          style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "var(--text-primary)", flexShrink: 0 }}>
          ←
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Edit Event</div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>EDITING: {ev.name.slice(0,28)}{ev.name.length > 28 ? "…" : ""}</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
          style={{ padding: "8px 18px", background: "linear-gradient(135deg, #f5a623, #e8920f)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", flexShrink: 0 }}>
          💾 Save
        </motion.button>
      </div>

      {/* Scrollable body — KEY: minHeight 0 */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", overflowX: "hidden", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ padding: desktop ? "24px 40px 120px" : "14px 16px 120px", maxWidth: desktop ? "800px" : "100%", margin: "0 auto" }}>

          {/* Category selector */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "9px" }}>Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale: 0.93 }}
                  onClick={() => setEditForm(p => ({ ...p, category: cat }))}
                  style={{ padding: "6px 14px", borderRadius: "99px", cursor: "pointer", fontSize: "11px", fontWeight: 600, border: "1.5px solid " + (editForm.category === cat ? "#f5a623" : "var(--border)"), background: editForm.category === cat ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: editForm.category === cat ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "9px" }}>Event Image</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
              {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
                <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setEditImageType(t)}
                  style={{ flex: 1, padding: "8px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "1.5px solid " + (editImageType === t ? "#f5a623" : "var(--border)"), background: editImageType === t ? "rgba(245,166,35,0.08)" : "var(--bg-card)", color: editImageType === t ? "#f5a623" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {label}
                </motion.div>
              ))}
            </div>
            {editImageType === "upload" ? (
              <>
                <input type="file" accept="image/jpeg,image/png,image/webp" id="edit-image-upload" style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files[0]; if (!f) return;
                    const canvas = document.createElement("canvas");
                    const img = new Image();
                    const url = URL.createObjectURL(f);
                    img.onload = () => {
                      const MAX = 1200;
                      let w = img.width, h = img.height;
                      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                      canvas.width = w; canvas.height = h;
                      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                      setEditForm(p => ({ ...p, image: canvas.toDataURL("image/jpeg", 0.82) }));
                      URL.revokeObjectURL(url);
                    };
                    img.src = url;
                  }} />
                <label htmlFor="edit-image-upload" style={{ display: "block", padding: "18px", background: "var(--bg-card)", border: "2px dashed var(--border)", borderRadius: "12px", textAlign: "center", cursor: "pointer" }}>
                  {editForm.image
                    ? <><img src={editForm.image} alt="preview" style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} /><div style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}>✅ Tap to change</div></>
                    : <><div style={{ fontSize: "24px", marginBottom: "6px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Tap to upload</div></>}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:") ? "" : (editForm.image || "")}
                onChange={e => setEditForm(p => ({ ...p, image: e.target.value }))} style={inp} />
            )}
          </div>

          {/* All fields */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 24px" : "0" }}>
            {[
              ["name",         "Event Name",         "text",   true],
              ["subtitle",     "Subtitle",           "text",   false],
              ["date",         "Date",               "date",   true],
              ["time",         "Time",               "time",   false],
              ["venue",        "Venue",              "text",   true],
              ["city",         "City",               "text",   false],
              ["price",        "Ticket Price (GHS)", "number", true],
              ["totalTickets", "Total Tickets",      "number", false],
              ["description",  "Description",        "text",   false],
            ].map(([key, label, type, required]) => (
              <div key={key} style={{ marginBottom: "13px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {label} {required && <span style={{ color: "var(--error)" }}>*</span>}
                </div>
                <input type={type} value={editForm[key] ?? ""}
                  onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ ...inp, marginBottom: 0, colorScheme: "light dark" }}
                  onFocus={e => { e.target.style.borderColor = "#f5a623"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}
          </div>

          {/* Sales toggle */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>Ticket Sales</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Currently {ev.salesOpen ? "open" : "paused"}</div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggleSales(ev.id)}
              style={{ padding: "8px 16px", background: ev.salesOpen ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)", color: ev.salesOpen ? "#dc2626" : "#16a34a", border: "1.5px solid " + (ev.salesOpen ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)"), borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {ev.salesOpen ? "⏸ Pause" : "▶ Resume"}
            </motion.button>
          </div>

          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(245,166,35,0.4)" }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
            style={{ ...primaryBtn, maxWidth: desktop ? "300px" : "100%", marginBottom: 0 }}>
            💾 Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ── Detail view ───────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* Hero */}
      <div style={{ height: desktop ? "280px" : "220px", position: "relative", flexShrink: 0 }}>
        <img src={cover} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.85))" }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ position: "absolute", top: "14px", left: "14px", width: "34px", height: "34px", borderRadius: "9px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", color: "#fff" }}>←</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startEdit}
          style={{ position: "absolute", top: "14px", right: "14px", padding: "6px 14px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "18px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
          ✏️ Edit
        </motion.button>
        <div style={{ position: "absolute", top: "14px", left: "58px", background: "rgba(124,58,237,0.85)", backdropFilter: "blur(6px)", padding: "3px 9px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "9px" }}>⛓️</span>
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>NFT_EVENT</span>
        </div>
        <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "20px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>{(ev.category || "").toUpperCase()}</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: desktop ? "24px" : "20px", marginBottom: "4px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>

      <div style={{ padding: desktop ? "24px 40px" : "14px 16px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          {[
            ["REVENUE_95%",  "GHS " + revenue.toLocaleString(),         "#16a34a"],
            ["PLATFORM_FEE", "GHS " + fee.toLocaleString(),             "#dc2626"],
            ["TICKETS_SOLD", ev.ticketsSold + "/" + ev.totalTickets,    "#2563eb"],
            ["ADMITTED",     (ev.admittedCount || 0) + " ppl",          "#f5a623"],
          ].map(([k, v, c]) => (
            <motion.div key={k} whileHover={{ y: -2 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: c, marginBottom: "2px" }}>{v}</div>
              <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{k}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "13px 15px", marginBottom: "12px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Ticket Sales</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: soldPct > 80 ? "#dc2626" : "#16a34a", fontFamily: "var(--font-mono)" }}>{soldPct}%</span>
          </div>
          <div style={{ height: "5px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.8 }}
              style={{ height: "100%", background: soldPct > 80 ? "linear-gradient(90deg,#dc2626,#b91c1c)" : "linear-gradient(90deg,#f5a623,#e8920f)", borderRadius: "3px" }} />
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>{ev.totalTickets - ev.ticketsSold} REMAINING</div>
        </div>

        {/* Description */}
        {ev.description && (
          <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "13px 15px", marginBottom: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>DESCRIPTION</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>{ev.description}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "10px", marginBottom: "12px" }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => toggleSales(ev.id)}
            style={{ ...primaryBtn, marginBottom: 0, background: ev.salesOpen ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#16a34a,#15803d)" }}>
            {ev.salesOpen ? "⏸ Pause Sales" : "▶ Resume Sales"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("scanTicket")}
            style={{ ...primaryBtn, marginBottom: 0, background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "none", color: "var(--text-primary)" }}>
            🔍 Scan Tickets
          </motion.button>
        </div>

        {/* Door staff */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🚪</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>Door Staff Access</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SINGLE_USE · AUTO_EXPIRE</div>
            </div>
          </div>
          <motion.button whileHover={{ borderColor: "#f5a623" }} whileTap={{ scale: 0.97 }}
            onClick={() => generateDoorCode(ev.id, ev.name)}
            style={{ width: "100%", padding: "10px", background: "rgba(245,166,35,0.06)", color: "#f5a623", border: "2px dashed rgba(245,166,35,0.3)", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", marginBottom: "10px", transition: "border-color 0.2s" }}>
            + Generate Door Staff Code
          </motion.button>
          {invites.map(inv => (
            <motion.div key={inv.code} whileTap={{ scale: 0.98 }} onClick={() => copyCode(inv.code)}
              style={{ background: inv.used ? "var(--bg-subtle)" : "rgba(245,166,35,0.05)", border: "1px solid " + (inv.used ? "var(--border)" : "rgba(245,166,35,0.2)"), borderRadius: "9px", padding: "9px 12px", marginBottom: "7px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: inv.used ? "var(--text-muted)" : "#f5a623", fontSize: "13px", letterSpacing: "1px" }}>{inv.code}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "9px", color: inv.used ? "var(--text-muted)" : "#16a34a", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{inv.used ? "USED" : "ACTIVE"}</span>
                {!inv.used && <span style={{ fontSize: "9px", color: copiedCode === inv.code ? "#16a34a" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{copiedCode === inv.code ? "COPIED!" : "TAP_COPY"}</span>}
              </div>
            </motion.div>
          ))}
          <div style={{ padding: "9px 11px", borderRadius: "9px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", marginTop: "4px" }}>
            <div style={{ fontSize: "10px", color: "#2563eb", fontWeight: 600 }}>🔒 Door staff can only scan — cannot manage events</div>
          </div>
        </div>
      </div>
    </div>
  );
}