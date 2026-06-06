import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { eventsAPI } from "../../api";

const BRAND     = "#F97316";
const BRAND_D   = "#EA6C0A";
const BRAND_GL  = "rgba(249,115,22,0.10)";

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
  boxSizing: "border-box", caretColor: BRAND, transition: "all 0.2s",
};
const primaryBtn = {
  width: "100%", padding: "15px",
  background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`,
  color: "#fff", border: "none", borderRadius: "13px",
  fontSize: "14px", fontWeight: 700, cursor: "pointer",
  boxShadow: "var(--shadow-brand)", marginBottom: "12px",
  fontFamily: "var(--font-sans)",
};

function downloadCSV(events) {
  if (!events.length) return;
  const rows = events.map(e => ({
    Event: e.name, Date: e.date, Venue: e.venue, Category: e.category,
    "Ticket Price": e.price, "Tickets Sold": e.ticketsSold,
    "Total Tickets": e.totalTickets,
    "Fill Rate %": e.totalTickets > 0 ? Math.round((e.ticketsSold / e.totalTickets) * 100) : 0,
    "Revenue (GHS)": Math.round(e.ticketsSold * e.price * 0.95),
    "Platform Fee": Math.round(e.ticketsSold * e.price * 0.05),
    Status: e.salesOpen ? "Live" : "Closed",
  }));
  const header = Object.keys(rows[0]).join(",");
  const body   = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  const blob   = new Blob([header + "\n" + body], { type: "text/csv" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href = url; a.download = `master-events-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon, value, label, sub, color, onClick, large }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "var(--shadow-lg)", borderColor: color + "40" }}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: large ? "24px" : "18px", boxShadow: "var(--shadow-sm)", transition: "all 0.22s", cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "110px", height: "110px", borderRadius: "50%", background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`, transform: "translate(30%,-30%)", pointerEvents: "none" }} />
      <div style={{ fontSize: large ? "26px" : "22px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontSize: large ? "30px" : "24px", fontWeight: 900, color, letterSpacing: "-1px", marginBottom: "4px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: sub ? "6px" : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", fontWeight: 700, color, background: color + "10", padding: "3px 10px", borderRadius: "99px", width: "fit-content", fontFamily: "var(--font-mono)" }}>{sub}</div>}
    </motion.div>
  );
}

function RevenueChart({ events }) {
  if (!events.length) return null;
  const data   = events.map(e => ({ name: e.name, value: Math.round(e.ticketsSold * e.price * 0.95) }));
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartH = 140;
  const barW   = Math.min(48, Math.floor(560 / data.length) - 12);
  const gap    = Math.max(8, Math.floor(560 / data.length) - barW);
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: BRAND, letterSpacing: "1.5px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>REVENUE_BY_EVENT</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Your Earnings</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => downloadCSV(events)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "var(--bg-subtle)", border: `1.5px solid ${BRAND}40`, borderRadius: "10px", cursor: "pointer", color: BRAND, fontWeight: 700, fontSize: "12px", transition: "all 0.2s", fontFamily: "var(--font-sans)" }}>
          ⬇️ CSV
        </motion.button>
      </div>
      <div style={{ overflowX: "auto", overflowY: "hidden" }}>
        <svg width="100%" viewBox={`0 0 ${Math.max(data.length * (barW + gap) + 24, 300)} ${chartH + 48}`} style={{ minWidth: "280px" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <g key={i}>
              <line x1="0" y1={chartH * (1 - pct)} x2="100%" y2={chartH * (1 - pct)} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
              {pct > 0 && <text x="2" y={chartH * (1 - pct) - 4} fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{Math.round(maxVal * pct).toLocaleString()}</text>}
            </g>
          ))}
          {data.map((d, i) => {
            const barH = Math.max(4, Math.round((d.value / maxVal) * chartH));
            const x    = i * (barW + gap) + gap / 2;
            const y    = chartH - barH;
            return (
              <g key={i}>
                <rect x={x} y={0} width={barW} height={chartH} rx="6" fill="var(--bg-subtle)" />
                <motion.rect x={x} y={y} width={barW} height={barH} rx="6" fill={`url(#barGrad${i})`}
                  initial={{ height: 0, y: chartH }} animate={{ height: barH, y }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }} />
                {d.value > 0 && <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="9" fill={BRAND} fontWeight="700" fontFamily="var(--font-mono)">{d.value > 999 ? (d.value / 1000).toFixed(1) + "k" : d.value}</text>}
                <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{d.name.slice(0, 7)}{d.name.length > 7 ? "…" : ""}</text>
              </g>
            );
          })}
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} /><stop offset="100%" stopColor={BRAND_D} />
              </linearGradient>
            ))}
          </defs>
        </svg>
      </div>
    </div>
  );
}

function FillRateChart({ events }) {
  if (!events.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: BRAND, letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>FILL_RATE</div>
      <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", marginBottom: "20px" }}>Tickets Sold vs Capacity</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {events.map(e => {
          const pct = e.totalTickets > 0 ? Math.round((e.ticketsSold / e.totalTickets) * 100) : 0;
          const col = pct >= 90 ? "#dc2626" : pct >= 60 ? BRAND : "#16a34a";
          return (
            <div key={e.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "58%" }}>{e.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{e.ticketsSold}/{e.totalTickets}</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: col, fontFamily: "var(--font-mono)", minWidth: "36px", textAlign: "right" }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: "8px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: Math.max(2, pct) + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: pct >= 90 ? "linear-gradient(90deg,#dc2626,#b91c1c)" : pct >= 60 ? `linear-gradient(90deg, ${BRAND}, ${BRAND_D})` : "linear-gradient(90deg,#16a34a,#22c55e)", borderRadius: "99px" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ ev, onClick }) {
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  return (
    <motion.div whileHover={{ y: -4, boxShadow: "var(--shadow-lg)", borderColor: BRAND + "50" }} whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "all 0.22s" }}>
      <div style={{ height: "168px", position: "relative" }}>
        <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.78))" }} />
        <div style={{ position: "absolute", top: "11px", right: "11px", background: ev.salesOpen ? "#16a34a" : "#6b7280", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-mono)" }}>
          {ev.salesOpen && <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff" }} />}
          {ev.salesOpen ? "LIVE" : "CLOSED"}
        </div>
        <div style={{ position: "absolute", top: "11px", left: "11px", background: "rgba(124,58,237,0.88)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 9px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "3px", fontFamily: "var(--font-mono)" }}>
          <span>⛓️</span><span>NFT</span>
        </div>
        <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px", marginBottom: "3px", lineHeight: 1.25 }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "15px", color: "#16a34a", fontWeight: 800, fontFamily: "var(--font-mono)" }}>GHS {Math.round(ev.ticketsSold * ev.price * 0.95).toLocaleString()}</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{ev.ticketsSold}/{ev.totalTickets} · {soldPct}%</span>
        </div>
        <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: soldPct > 80 ? "#dc2626" : `linear-gradient(90deg, ${BRAND}, ${BRAND_D})`, borderRadius: "2px" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── ORGANIZER HOME — setActiveTab ADDED, all wallet onClick FIXED ──
export function OrganizerHome() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setScreen          = useStore(s => s.setScreen);
  const setActiveTab       = useStore(s => s.setActiveTab);   // ← ADDED
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const currentUser        = useStore(s => s.currentUser);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();

  useEffect(() => {
    eventsAPI.myEvents()
      .then(data => { if (Array.isArray(data)) setOrgEvents(data.map(mapEvent)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue  = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold     = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const activeEvents  = orgEvents.filter(e => e.salesOpen).length;
  const totalCapacity = orgEvents.reduce((s, e) => s + e.totalTickets, 0);
  const fillRate      = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const topEvent      = [...orgEvents].sort((a, b) => b.ticketsSold * b.price - a.ticketsSold * a.price)[0];

  // ── wallet nav helper — used everywhere ──────────────────
  const goWallet = () => { setActiveTab("wallet"); setScreen("app"); };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <div style={{ fontSize: "11px", color: BRAND, fontWeight: 700, letterSpacing: "2px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>ORGANIZER_DASHBOARD</div>
          <h1 style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.7px", marginBottom: "4px" }}>
            {desktop ? `Welcome back, ${currentUser?.first_name} 👋` : "Dashboard"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {desktop ? "Your event command center — real data, live from Polygon." : `Hi ${currentUser?.first_name} 👋`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "99px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c3aed" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", fontFamily: "var(--font-mono)" }}>POLYGON</span>
          </div>
          {desktop && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
              style={{ padding: "9px 20px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
              + New Event
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "14px", marginBottom: "28px" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "18px" }} />)}
        </div>
      ) : (
        <>
          {desktop ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <StatCard large icon="💰"
                  value={"GHS " + Math.round(totalRevenue).toLocaleString()}
                  label="Total Revenue (95% Payout)"
                  sub={fillRate + "% avg fill rate"}
                  color="#16a34a" onClick={goWallet} />
              </div>
              <StatCard icon="🎟️" value={totalSold} label="Tickets Sold" sub={fillRate + "% fill"} color="#2563eb" />
              <StatCard icon="🎪" value={activeEvents} label="Live Events" sub={orgEvents.length + " total"} color={BRAND} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <StatCard icon="💰" value={"GHS " + Math.round(totalRevenue).toLocaleString()} label="Revenue" color="#16a34a" onClick={goWallet} />
              <StatCard icon="🎟️" value={totalSold} label="Sold" sub={fillRate + "%"} color="#2563eb" />
              <StatCard icon="🎪" value={activeEvents} label="Live" sub={orgEvents.length + " total"} color={BRAND} />
              <StatCard icon="⛓️" value={totalSold} label="NFT Minted" color="#7c3aed" />
            </div>
          )}

          {desktop && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "28px" }}>
              <div style={{ background: "#0e0d0b", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "18px", padding: "20px", boxShadow: "var(--shadow-sm)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "140px", height: "140px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "11px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>⛓️</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>Polygon Amoy</div>
                    <div style={{ fontSize: "10px", color: "#444", fontFamily: "var(--font-mono)" }}>0x956F...0Daf</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                    <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono)" }}>ONLINE</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[["NFT_MINTED", totalSold, "#a78bfa"], ["CHAIN_ID", "80002", "#60a5fa"]].map(([k, v, c]) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: c, marginBottom: "2px" }}>{v}</div>
                      <div style={{ fontSize: "9px", color: "#444", fontFamily: "var(--font-mono)" }}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>PAYOUT_SPLIT</div>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a" }}>You (95%)</span>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a", fontFamily: "var(--font-mono)" }}>GHS {Math.round(totalRevenue).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "7px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ duration: 1 }} style={{ height: "100%", background: "linear-gradient(90deg,#16a34a,#22c55e)", borderRadius: "99px" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Platform (5%)</span>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>GHS {Math.round(totalRevenue * 0.053).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "7px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: "5%" }} transition={{ duration: 1 }} style={{ height: "100%", background: "#dc2626", borderRadius: "99px" }} />
                  </div>
                </div>
                {/* ── FIXED: was setScreen("wallet") ── */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goWallet}
                  style={{ width: "100%", padding: "11px", marginTop: "18px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
                  Withdraw to MoMo →
                </motion.button>
              </div>

              {topEvent ? (
                <motion.div whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setViewingOrgEvent(topEvent); setScreen("orgEventDetail"); }}
                  style={{ background: "var(--bg-card)", border: `1px solid ${BRAND}25`, borderRadius: "18px", padding: "20px", boxShadow: "var(--shadow-sm)", cursor: "pointer", overflow: "hidden", position: "relative" }}>
                  <img src={topEvent.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.1 }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: BRAND, letterSpacing: "1.5px", marginBottom: "10px", fontFamily: "var(--font-mono)" }}>🏆 TOP_EVENT</div>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", marginBottom: "5px", lineHeight: 1.3 }}>{topEvent.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "14px" }}>
                      {topEvent.ticketsSold} sold · GHS {Math.round(topEvent.ticketsSold * topEvent.price * 0.95).toLocaleString()}
                    </div>
                    <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: Math.round((topEvent.ticketsSold / topEvent.totalTickets) * 100) + "%" }} transition={{ duration: 0.8 }}
                        style={{ height: "100%", background: `linear-gradient(90deg,${BRAND},${BRAND_D})`, borderRadius: "2px" }} />
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontFamily: "var(--font-mono)" }}>
                      {Math.round((topEvent.ticketsSold / topEvent.totalTickets) * 100)}% sold · {topEvent.totalTickets - topEvent.ticketsSold} remaining
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "20px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>🎪</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>No events yet</div>
                </div>
              )}
            </div>
          )}

          {orgEvents.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "28px" }}>
              <RevenueChart events={orgEvents} />
              <FillRateChart events={orgEvents} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: "28px" }}>
            <div style={{ background: BRAND_GL, border: `1px solid ${BRAND}20`, borderRadius: "14px", padding: "15px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "11px", background: BRAND_GL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0, border: `1px solid ${BRAND}20` }}>💡</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: BRAND, marginBottom: "3px" }}>Payouts via Paystack</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>95% of ticket revenue goes straight to your wallet. Withdraw to MoMo anytime.</div>
              </div>
            </div>
            <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.14)", borderRadius: "14px", padding: "15px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "11px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>⛓️</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", marginBottom: "3px" }}>NFT Tickets on Polygon</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>Every ticket minted on-chain. Zero fakes. QR rotates every 10 seconds.</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Your Events</div>
              {orgEvents.length > 0 && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                  {orgEvents.length} event{orgEvents.length !== 1 ? "s" : ""} · {activeEvents} live
                </div>
              )}
            </div>
            {!desktop && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setScreen("addEvent")}
                style={{ padding: "9px 18px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
                + New
              </motion.button>
            )}
          </div>

          {orgEvents.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "64px 32px", background: "var(--bg-card)", borderRadius: "22px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "52px", marginBottom: "14px" }}>🎪</div>
              <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "22px" }}>Create your first event and start selling NFT tickets on Polygon</div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
                style={{ padding: "13px 30px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "13px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
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

export function OrganizerEvents() {
  const orgEvents          = useStore(s => s.orgEvents);
  const setOrgEvents       = useStore(s => s.setOrgEvents);
  const setViewingOrgEvent = useStore(s => s.setViewingOrgEvent);
  const setScreen          = useStore(s => s.setScreen);
  const [loading, setLoading] = useState(true);
  const desktop = isDesktop();
  useEffect(() => {
    eventsAPI.myEvents().then(data => { if (Array.isArray(data)) setOrgEvents(data.map(mapEvent)); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "11px", color: BRAND, fontWeight: 700, letterSpacing: "2px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>MY_EVENTS</div>
          <h1 style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.7px" }}>Events</h1>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("addEvent")}
          style={{ padding: "10px 20px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)" }}>
          + New Event
        </motion.button>
      </div>
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "16px" : "12px" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ height: "168px" }} />
              <div style={{ padding: "14px 16px" }}><div className="skeleton" style={{ height: "14px", width: "60%", marginBottom: "10px" }} /><div className="skeleton" style={{ height: "4px" }} /></div>
            </div>
          ))}
        </div>
      ) : orgEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 40px", background: "var(--bg-card)", borderRadius: "22px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>🎪</div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", marginBottom: "8px" }}>No events yet</div>
          <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Click + New Event to get started</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(3,1fr)" : "1fr", gap: desktop ? "16px" : "12px" }}>
          {orgEvents.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => { setViewingOrgEvent(ev); setScreen("orgEventDetail"); }} />)}
        </div>
      )}
    </div>
  );
}

export function OrganizerAlerts() {
  const orgEvents    = useStore(s => s.orgEvents);
  const desktop      = isDesktop();
  const totalRevenue = orgEvents.reduce((s, e) => s + e.ticketsSold * e.price * 0.95, 0);
  const totalSold    = orgEvents.reduce((s, e) => s + e.ticketsSold, 0);
  const alerts = orgEvents.length > 0 ? [
    { icon: "⛓️", color: "#7c3aed", title: "NFT Tickets Active on Polygon", body: `${totalSold} NFT tickets minted across ${orgEvents.length} event${orgEvents.length > 1 ? "s" : ""}. All ownership records are immutable on-chain.`, time: "LIVE" },
    { icon: "💰", color: "#16a34a", title: "Revenue Update", body: `Your events have generated GHS ${Math.round(totalRevenue).toLocaleString()} at 95% payout rate.`, time: "NOW" },
    { icon: "🎪", color: BRAND, title: "Active Events", body: `You have ${orgEvents.filter(e => e.salesOpen).length} event${orgEvents.filter(e => e.salesOpen).length !== 1 ? "s" : ""} with ticket sales open.`, time: "TODAY" },
    { icon: "🔒", color: "#2563eb", title: "Security: HMAC QR Active", body: "All QR codes rotate every 10 seconds. Screenshot sharing is cryptographically prevented.", time: "ALWAYS" },
  ] : [{ icon: "🔔", color: BRAND, title: "No alerts yet", body: "Create an event and start selling tickets to see alerts here.", time: "NOW" }];
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: desktop ? "28px 40px 60px" : "16px 16px 120px" }}>
      <div style={{ fontSize: "11px", color: BRAND, fontWeight: 700, letterSpacing: "2px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>NOTIFICATIONS</div>
      <h1 style={{ fontWeight: 900, fontSize: desktop ? "28px" : "22px", color: "var(--text-primary)", letterSpacing: "-0.7px", marginBottom: "4px" }}>Alerts</h1>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "22px", fontFamily: "var(--font-mono)" }}>BLOCKCHAIN_CONFIRMATIONS · EVENT_ACTIVITY</p>
      <div style={{ maxWidth: desktop ? "640px" : "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        {alerts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px 18px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", transition: "all 0.2s" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: a.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: `1px solid ${a.color}20` }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>{a.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "8px" }}>{a.body}</div>
              <div style={{ fontSize: "10px", color: a.color, fontWeight: 700, background: a.color + "12", padding: "3px 10px", borderRadius: "99px", width: "fit-content", fontFamily: "var(--font-mono)" }}>{a.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
    ["name","Event Name","text","e.g. Afrobeats Night 2026",true],
    ["subtitle","Subtitle (optional)","text","e.g. The biggest night in Accra",false],
    ["date","Date","date","",true],["time","Time","time","",false],
    ["venue","Venue","text","e.g. Accra Sports Stadium",true],
    ["city","City","text","e.g. Accra",false],
    ["price","Ticket Price (GHS)","number","e.g. 150",true],
    ["totalTickets","Total Tickets","number","e.g. 500",true],
    ["description","Description","text","Tell people about your event",false],
  ];
  return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "14px 20px", gap: "14px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Create Event</div>
          <div style={{ fontSize: "11px", color: "#7c3aed", marginTop: "2px", fontFamily: "var(--font-mono)" }}>⛓️ NFT tickets auto-minted on Polygon Amoy</div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", overflowX: "hidden", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ padding: desktop ? "28px 40px 120px" : "16px 16px 120px", maxWidth: desktop ? "760px" : "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Category <span style={{ color: "var(--error)" }}>*</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale: 0.93 }}
                  onClick={() => { setAddEventForm({ ...addEventForm, category: cat }); setErrors(p => ({ ...p, category: null })); }}
                  style={{ padding: "7px 16px", borderRadius: "99px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${addEventForm.category === cat ? BRAND : errors.category ? "var(--error)" : "var(--border)"}`, background: addEventForm.category === cat ? BRAND_GL : "var(--bg-card)", color: addEventForm.category === cat ? BRAND : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.div>
              ))}
            </div>
            <AnimatePresence>{errors.category && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "var(--error)", fontSize: "12px", marginTop: "6px" }}>⚠️ {errors.category}</motion.div>}</AnimatePresence>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Event Image</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
                <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setImageType(t)}
                  style={{ flex: 1, padding: "9px", borderRadius: "11px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, border: `1.5px solid ${imageType === t ? BRAND : "var(--border)"}`, background: imageType === t ? BRAND_GL : "var(--bg-card)", color: imageType === t ? BRAND : "var(--text-secondary)", transition: "all 0.2s" }}>
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
                <label htmlFor="event-image-upload" style={{ display: "block", padding: "22px 18px", background: "var(--bg-card)", border: `2px dashed ${BRAND}35`, borderRadius: "14px", textAlign: "center", cursor: "pointer" }}>
                  {addEventForm.image?.startsWith("data:") || addEventForm.image?.startsWith("http") ? (
                    <><img src={addEventForm.image} alt="preview" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }} /><div style={{ color: "#16a34a", fontSize: "13px", fontWeight: 700 }}>✅ Image ready — tap to change</div></>
                  ) : (
                    <><div style={{ fontSize: "32px", marginBottom: "10px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>Tap to upload JPG or PNG</div><div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Max 5MB · auto-compressed</div></>
                  )}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={addEventForm.image?.startsWith("data:") ? "" : (addEventForm.image || "")} onChange={e => setAddEventForm({ ...addEventForm, image: e.target.value })} style={inp} />
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 28px" : "0" }}>
            {fields.map(([key, label, type, placeholder, required]) => (
              <div key={key} style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>{label} {required && <span style={{ color: "var(--error)" }}>*</span>}</div>
                <input type={type} placeholder={placeholder} value={addEventForm[key] || ""}
                  onChange={e => { setAddEventForm({ ...addEventForm, [key]: e.target.value }); if (errors[key]) setErrors(p => ({ ...p, [key]: null })); }}
                  style={{ ...inp, marginBottom: 0, borderColor: errors[key] ? "var(--error)" : "var(--border)", colorScheme: "light dark" }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                  onBlur={e => { e.target.style.borderColor = errors[key] ? "var(--error)" : "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
                <AnimatePresence>{errors[key] && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "var(--error)", fontSize: "11px", marginTop: "4px" }}>⚠️ {errors[key]}</motion.div>}</AnimatePresence>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "13px", padding: "13px 16px", marginBottom: "24px", marginTop: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>⛓️</span>
            <span style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 600 }}>Each ticket sold will be automatically minted as an NFT on Polygon blockchain</span>
          </div>
          <motion.button whileHover={{ scale: 1.02, boxShadow: `0 14px 36px ${BRAND}40` }} whileTap={{ scale: 0.97 }}
            onClick={() => { if (validate()) handleAddEvent(); }}
            style={{ ...primaryBtn, maxWidth: desktop ? "320px" : "100%", marginBottom: 0, fontSize: "15px" }}>
            🎪 Create Event
          </motion.button>
        </div>
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

  const [editing,       setEditing]       = useState(false);
  const [editForm,      setEditForm]      = useState({});
  const [editImageType, setEditImageType] = useState("upload");
  const [copiedCode,    setCopiedCode]    = useState(null);
  const [activeTab,     setActiveTab]     = useState("overview"); // overview | holders
  const [holders,       setHolders]       = useState([]);
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [holderSearch,  setHolderSearch]  = useState("");
  const desktop = isDesktop();

  const API = "https://master-events-backend.onrender.com";

  if (!viewingOrgEvent) return null;
  const ev      = viewingOrgEvent;
  const revenue = Math.round(ev.ticketsSold * ev.price * 0.95);
  const fee     = Math.round(ev.ticketsSold * ev.price * 0.05);
  const invites = doorStaffInvites[ev.id] || [];
  const soldPct = ev.totalTickets > 0 ? Math.round((ev.ticketsSold / ev.totalTickets) * 100) : 0;
  const cover   = ev.image || categoryImages[ev.category] || categoryImages.other;

  const fetchHolders = async () => {
    if (holders.length > 0) return; // already loaded
    setHoldersLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res   = await fetch(`${API}/api/tickets/event/${ev.id}/`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setHolders(Array.isArray(data) ? data : []);
    } catch {
      setHolders([]);
    } finally {
      setHoldersLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "holders") fetchHolders();
  };

  const filteredHolders = holders.filter(t => {
    if (!holderSearch) return true;
    const q = holderSearch.toLowerCase();
    return (
      (t.owner?.first_name + " " + t.owner?.last_name).toLowerCase().includes(q) ||
      (t.owner?.email || "").toLowerCase().includes(q) ||
      (t.ticket_id || "").toLowerCase().includes(q)
    );
  });

  const statusColor = {
    active:      "#16a34a",
    redeemed:    "#6b7280",
    resale:      "#dc2626",
    transferred: "#2563eb",
  };
  const statusLabel = {
    active:      "Active",
    redeemed:    "Redeemed",
    resale:      "Resale",
    transferred: "Transferred",
  };

  const copyCode  = code => { navigator.clipboard?.writeText(code).catch(() => {}); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000); };
  const startEdit = () => { setEditForm({ name: ev.name, venue: ev.venue, date: ev.date, time: ev.time || "", price: ev.price, description: ev.description || "", image: ev.image || "", category: ev.category || "other", city: ev.city || "", totalTickets: ev.totalTickets, subtitle: ev.subtitle || "" }); setEditing(true); };
  const saveEdit  = () => { setViewingOrgEvent({ ...ev, ...editForm, price: parseFloat(editForm.price), totalTickets: parseInt(editForm.totalTickets) || ev.totalTickets }); setEditing(false); };

  // ── Edit mode ─────────────────────────────────────────────
  if (editing) return (
    <div style={{ background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "14px 20px", gap: "12px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)}
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "var(--text-primary)", flexShrink: 0 }}>←</motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Edit Event</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>EDITING · {ev.name.slice(0,30)}{ev.name.length > 30 ? "…" : ""}</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
          style={{ padding: "9px 20px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_D})`, color: "#fff", border: "none", borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-brand)", flexShrink: 0 }}>
          💾 Save
        </motion.button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", overflowX: "hidden", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        <div style={{ padding: desktop ? "28px 40px 120px" : "16px 16px 120px", maxWidth: desktop ? "760px" : "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map(cat => (
                <motion.div key={cat} whileTap={{ scale: 0.93 }} onClick={() => setEditForm(p => ({ ...p, category: cat }))}
                  style={{ padding: "7px 16px", borderRadius: "99px", cursor: "pointer", fontSize: "12px", fontWeight: 600, border: `1.5px solid ${editForm.category === cat ? BRAND : "var(--border)"}`, background: editForm.category === cat ? BRAND_GL : "var(--bg-card)", color: editForm.category === cat ? BRAND : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>Event Image</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              {[["upload","📷 Upload"],["url","🔗 URL"]].map(([t, label]) => (
                <motion.div key={t} whileTap={{ scale: 0.95 }} onClick={() => setEditImageType(t)}
                  style={{ flex: 1, padding: "9px", borderRadius: "11px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, border: `1.5px solid ${editImageType === t ? BRAND : "var(--border)"}`, background: editImageType === t ? BRAND_GL : "var(--bg-card)", color: editImageType === t ? BRAND : "var(--text-secondary)", transition: "all 0.2s" }}>
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
                <label htmlFor="edit-image-upload" style={{ display: "block", padding: "20px", background: "var(--bg-card)", border: `2px dashed ${BRAND}35`, borderRadius: "14px", textAlign: "center", cursor: "pointer" }}>
                  {editForm.image ? <><img src={editForm.image} alt="preview" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }} /><div style={{ color: "#16a34a", fontSize: "13px", fontWeight: 700 }}>✅ Tap to change</div></> : <><div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div><div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Tap to upload</div></>}
                </label>
              </>
            ) : (
              <input type="text" placeholder="https://..." value={editForm.image?.startsWith("data:") ? "" : (editForm.image || "")} onChange={e => setEditForm(p => ({ ...p, image: e.target.value }))} style={inp} />
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: desktop ? "0 28px" : "0" }}>
            {[["name","Event Name","text",true],["subtitle","Subtitle","text",false],["date","Date","date",true],["time","Time","time",false],["venue","Venue","text",true],["city","City","text",false],["price","Ticket Price (GHS)","number",true],["totalTickets","Total Tickets","number",false],["description","Description","text",false]].map(([key, label, type, required]) => (
              <div key={key} style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "7px" }}>{label} {required && <span style={{ color: "var(--error)" }}>*</span>}</div>
                <input type={type} value={editForm[key] ?? ""}
                  onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ ...inp, marginBottom: 0, colorScheme: "light dark" }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "13px", padding: "14px 16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3px" }}>Ticket Sales</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Currently {ev.salesOpen ? "open" : "paused"}</div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggleSales(ev.id)}
              style={{ padding: "9px 18px", background: ev.salesOpen ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)", color: ev.salesOpen ? "#dc2626" : "#16a34a", border: `1.5px solid ${ev.salesOpen ? "rgba(220,38,38,0.25)" : "rgba(22,163,74,0.25)"}`, borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              {ev.salesOpen ? "⏸ Pause" : "▶ Resume"}
            </motion.button>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
            style={{ ...primaryBtn, maxWidth: desktop ? "320px" : "100%", marginBottom: 0 }}>
            💾 Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ── Main detail view ──────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", paddingBottom: desktop ? "60px" : "100px" }}>

      {/* Hero image */}
      <div style={{ height: desktop ? "280px" : "220px", position: "relative", flexShrink: 0 }}>
        <img src={cover} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = categoryImages.other; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85))" }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("app")}
          style={{ position: "absolute", top: "14px", left: "14px", width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", color: "#fff" }}>←</motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startEdit}
          style={{ position: "absolute", top: "14px", right: "14px", padding: "7px 16px", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          ✏️ Edit
        </motion.button>
        <div style={{ position: "absolute", top: "14px", left: "60px", background: "rgba(124,58,237,0.88)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: "99px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "9px" }}>⛓️</span>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>NFT_EVENT</span>
        </div>
        <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "20px" }}>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "5px", fontFamily: "var(--font-mono)" }}>{(ev.category || "").toUpperCase()}</div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: desktop ? "24px" : "20px", marginBottom: "5px", letterSpacing: "-0.5px" }}>{ev.name}</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>📍 {ev.venue} · {ev.date}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "0 " + (desktop ? "40px" : "16px"), display: "flex", gap: "4px" }}>
        {[
          { id: "overview", label: "Overview",       icon: "📊" },
          { id: "holders",  label: "Ticket Holders", icon: "👥", count: ev.ticketsSold },
        ].map(tab => (
          <motion.button key={tab.id} whileTap={{ scale: 0.96 }}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: "14px 16px", background: "none", border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${BRAND}` : "2px solid transparent",
              cursor: "pointer", fontFamily: "var(--font-sans)",
              fontSize: "13px", fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? BRAND : "var(--text-muted)",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.15s",
            }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span style={{ fontSize: "10px", fontWeight: 700, background: activeTab === tab.id ? `${BRAND}15` : "var(--bg-subtle)", color: activeTab === tab.id ? BRAND : "var(--text-muted)", padding: "2px 7px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div style={{ padding: desktop ? "24px 40px" : "16px 16px" }}>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "repeat(4,1fr)" : "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {[
              ["💰", "Revenue (95%)", "GHS " + revenue.toLocaleString(), "#16a34a"],
              ["🏦", "Platform Fee",  "GHS " + fee.toLocaleString(),     "#dc2626"],
              ["🎟️","Tickets Sold",  ev.ticketsSold + "/" + ev.totalTickets, "#2563eb"],
              ["🚪","Admitted",      (ev.admittedCount || 0) + " ppl",   BRAND],
            ].map(([icon, label, value, color]) => (
              <motion.div key={label} whileHover={{ y: -2 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "16px", marginBottom: "6px" }}>{icon}</div>
                <div style={{ fontSize: "18px", fontWeight: 900, color, marginBottom: "3px", letterSpacing: "-0.5px" }}>{value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "15px 17px", marginBottom: "14px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Ticket Sales Progress</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: soldPct > 80 ? "#dc2626" : BRAND, fontFamily: "var(--font-mono)" }}>{soldPct}%</span>
            </div>
            <div style={{ height: "7px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: soldPct + "%" }} transition={{ duration: 0.9 }}
                style={{ height: "100%", background: soldPct > 80 ? "linear-gradient(90deg,#dc2626,#b91c1c)" : `linear-gradient(90deg,${BRAND},${BRAND_D})`, borderRadius: "99px" }} />
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", fontFamily: "var(--font-mono)" }}>{ev.totalTickets - ev.ticketsSold} tickets remaining</div>
          </div>

          {ev.description && (
            <div style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "15px 17px", marginBottom: "14px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>DESCRIPTION</div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{ev.description}</div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "grid", gridTemplateColumns: desktop ? "1fr 1fr" : "1fr", gap: "10px", marginBottom: "14px" }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => toggleSales(ev.id)}
              style={{ ...primaryBtn, marginBottom: 0, background: ev.salesOpen ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#16a34a,#15803d)", fontSize: "14px" }}>
              {ev.salesOpen ? "⏸ Pause Sales" : "▶ Resume Sales"}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen("scanTicket")}
              style={{ ...primaryBtn, marginBottom: 0, background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "none", color: "var(--text-primary)", fontSize: "14px" }}>
              🔍 Scan Tickets
            </motion.button>
          </div>

          {/* Door staff section */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "11px", background: BRAND_GL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", border: `1px solid ${BRAND}20` }}>🚪</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Door Staff Access</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Single-use codes · auto-expire on first use</div>
              </div>
            </div>
            <motion.button whileHover={{ borderColor: BRAND }} whileTap={{ scale: 0.97 }} onClick={() => generateDoorCode(ev.id, ev.name)}
              style={{ width: "100%", padding: "11px", background: BRAND_GL, color: BRAND, border: `2px dashed ${BRAND}40`, borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "12px", transition: "border-color 0.2s", fontFamily: "var(--font-sans)" }}>
              + Generate Door Staff Code
            </motion.button>
            {invites.map(inv => (
              <motion.div key={inv.code} whileTap={{ scale: 0.98 }} onClick={() => copyCode(inv.code)}
                style={{ background: inv.used ? "var(--bg-subtle)" : BRAND_GL, border: `1px solid ${inv.used ? "var(--border)" : BRAND + "30"}`, borderRadius: "11px", padding: "10px 14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: inv.used ? "var(--text-muted)" : BRAND, fontSize: "14px", letterSpacing: "1.5px" }}>{inv.code}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "10px", color: inv.used ? "var(--text-muted)" : "#16a34a", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{inv.used ? "USED" : "ACTIVE"}</span>
                  {!inv.used && <span style={{ fontSize: "10px", color: copiedCode === inv.code ? "#16a34a" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{copiedCode === inv.code ? "✓ COPIED" : "TAP TO COPY"}</span>}
                </div>
              </motion.div>
            ))}
            <div style={{ padding: "10px 13px", borderRadius: "10px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px" }}>🔒</span>
              <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>Door staff can only scan tickets — cannot manage events</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKET HOLDERS TAB ── */}
      {activeTab === "holders" && (
        <div style={{ padding: desktop ? "24px 40px" : "16px 16px" }}>

          {/* Summary bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
            {[
              ["🎟️", holders.filter(t => t.status === "active").length,    "Active",    "#16a34a"],
              ["✅",  holders.filter(t => t.status === "redeemed").length,  "Redeemed",  "#6b7280"],
              ["🏷️", holders.filter(t => t.status === "resale").length,    "On Resale", "#dc2626"],
            ].map(([icon, count, label, color]) => (
              <div key={label} style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "12px 14px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>{icon}</div>
                <div style={{ fontSize: "20px", fontWeight: 900, color, marginBottom: "2px" }}>{holdersLoading ? "—" : count}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <input
              value={holderSearch}
              onChange={e => setHolderSearch(e.target.value)}
              placeholder="Search by name, email or ticket ID..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "13px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}12`; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", opacity: 0.4 }}>🔍</span>
            {holderSearch && (
              <span onClick={() => setHolderSearch("")}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>✕</span>
            )}
          </div>

          {/* Holders list */}
          {holdersLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "12px" }} />
              ))}
            </div>
          ) : filteredHolders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>
                {holderSearch ? "No results found" : "No ticket holders yet"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {holderSearch ? "Try a different search term" : "Ticket holders will appear here once someone buys a ticket"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Desktop: table header */}
              {desktop && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px", gap: "12px", padding: "8px 14px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", fontFamily: "var(--font-mono)" }}>
                  <span>HOLDER</span>
                  <span>TICKET ID</span>
                  <span>QTY</span>
                  <span>STATUS</span>
                </div>
              )}

              {filteredHolders.map((t, i) => {
                const ownerName  = ((t.owner?.first_name || "") + " " + (t.owner?.last_name || "")).trim() || "Unknown";
                const ownerEmail = t.owner?.email || "—";
                const color      = statusColor[t.status] || "#6b7280";
                const label      = statusLabel[t.status] || t.status;
                const isResale   = t.is_resale;

                return (
                  <motion.div key={t.ticket_id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: "12px",
                      padding: desktop ? "12px 14px" : "12px 14px",
                      border: "1px solid var(--border)",
                      display: desktop ? "grid" : "flex",
                      gridTemplateColumns: desktop ? "1fr 1fr 100px 120px" : undefined,
                      flexDirection: desktop ? undefined : "row",
                      alignItems: "center",
                      gap: "12px",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${BRAND}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>

                    {/* Holder info */}
                    <div style={{ minWidth: 0, flex: desktop ? undefined : 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ownerName}
                        {isResale && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "1px 6px", borderRadius: "99px" }}>RESALE</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ownerEmail}</div>
                    </div>

                    {/* Ticket ID */}
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: desktop ? "block" : "none" }}>
                      {String(t.ticket_id || "").slice(0, 16)}…
                      {t.nft_token_id && <div style={{ fontSize: "9px", color: "#7c3aed", marginTop: "2px" }}>NFT #{t.nft_token_id}</div>}
                    </div>

                    {/* Qty */}
                    <div style={{ display: desktop ? "block" : "none" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: BRAND, fontFamily: "var(--font-mono)" }}>×{t.quantity || 1}</span>
                    </div>

                    {/* Status badge */}
                    <div>
                      <span style={{
                        fontSize: "10px", fontWeight: 700,
                        color, background: color + "15",
                        padding: "4px 10px", borderRadius: "99px",
                        border: `1px solid ${color}25`,
                        fontFamily: "var(--font-mono)",
                        whiteSpace: "nowrap",
                      }}>
                        {label.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Count footer */}
              <div style={{ textAlign: "center", padding: "12px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {filteredHolders.length} of {holders.length} holders
                {holderSearch && ` matching "${holderSearch}"`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}