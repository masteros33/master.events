import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { useTheme } from "../../hooks/useTheme";

const BACKEND = "https://master-events-backend.onrender.com";

// ── API helpers ───────────────────────────────────────────────
async function adminFetch(path, token, opts = {}) {
  const res = await fetch(BACKEND + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  return res.json();
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "18px", padding: "22px", cursor: onClick ? "pointer" : "default",
        boxShadow: "var(--shadow-sm)", transition: "all 0.22s", position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", borderRadius: "50%", background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`, transform: "translate(30%,-30%)", pointerEvents: "none" }} />
      <div style={{ fontSize: "24px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontSize: "26px", fontWeight: 900, color, letterSpacing: "-1px", marginBottom: "4px", fontFamily: "var(--font-sans)" }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{sub}</div>}
    </motion.div>
  );
}

// ── Live chart bar ────────────────────────────────────────────
function MiniBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.max(3, Math.round((value / max) * 100)) : 3;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ fontSize: "9px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{value}</div>
      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
        <motion.div
          initial={{ height: 0 }} animate={{ height: pct + "%" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ width: "100%", background: `linear-gradient(to top, ${color}, ${color}88)`, borderRadius: "4px 4px 0 0", minHeight: "3px" }}
        />
      </div>
      <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{label}</div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────
function OverviewTab({ data }) {
  if (!data) return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;

  const { users, events, tickets, revenue } = data;

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        <StatCard icon="👥" label="Total Users" value={users?.total || 0} sub={`${users?.attendees || 0} attendees · ${users?.organizers || 0} organizers`} color="#2563eb" />
        <StatCard icon="🎪" label="Total Events" value={events?.total || 0} sub={`${events?.active || 0} live now`} color="#f5a623" />
        <StatCard icon="🎟️" label="Tickets Issued" value={tickets?.total || 0} sub="All time · NFT minted" color="#7c3aed" />
        <StatCard icon="💰" label="Platform Revenue" value={"GHS " + Math.round((revenue?.total_earned || 0) * 0.05).toLocaleString()} sub="5% of total ticket sales" color="#16a34a" />
      </div>

      {/* Revenue breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px", marginBottom: "24px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>REVENUE FLOW</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Organizer Payouts vs Platform Fees</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              ["Organizer Payouts (95%)", revenue?.total_earned || 0, "#16a34a"],
              ["Platform Fees (5%)",      revenue?.platform_fees || 0, "#f5a623"],
              ["Withdrawn",               revenue?.total_withdrawn || 0, "#2563eb"],
            ].map(([label, val, color]) => {
              const max = revenue?.total_earned || 1;
              const pct = Math.max(2, Math.round((val / max) * 100));
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>GHS {Math.round(val).toLocaleString()}</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: color, borderRadius: "99px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "#0e0d0b", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>BLOCKCHAIN</div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>Polygon Amoy Network</div>
          {[
            ["CONTRACT",   "0x956F...0Daf", "#a78bfa"],
            ["CHAIN_ID",   "80002",          "#60a5fa"],
            ["NFT_SUPPLY", tickets?.total || 0, "#4ade80"],
            ["GAS/MINT",   "~0.0002 POL",    "#fbbf24"],
          ].map(([key, val, color]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>{key}</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono)" }}>NETWORK_HEALTHY</span>
          </div>
        </div>
      </div>

      {/* User growth indicator */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "22px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>PLATFORM HEALTH</div>
        <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Key Metrics at a Glance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
          {[
            ["🏆", "Fill Rate",      tickets?.total > 0 ? Math.min(100, Math.round((tickets.total / ((events?.total || 1) * 100)) * 100)) + "%" : "N/A", "#f5a623"],
            ["📊", "Avg Rev/Event",  events?.total > 0 ? "GHS " + Math.round((revenue?.total_earned || 0) / (events.total || 1)).toLocaleString() : "N/A", "#16a34a"],
            ["👤", "Users/Event",    events?.total > 0 ? (users?.total / events.total).toFixed(1) : "N/A", "#2563eb"],
            ["⚡", "Sales Active",   events?.active || 0, "#7c3aed"],
          ].map(([icon, label, val, color]) => (
            <div key={label} style={{ background: "var(--bg-subtle)", borderRadius: "14px", padding: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{icon}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color, marginBottom: "4px" }}>{val}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase().replace(/ /g,"_")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Organizers tab ────────────────────────────────────────────
function OrganizersTab({ token }) {
  const [organizers, setOrganizers] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [suspending, setSuspending] = useState(null);

  useEffect(() => {
    adminFetch("/api/auth/admin/organizers/", token)
      .then(data => { if (Array.isArray(data)) setOrganizers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSuspend = async (userId) => {
    setSuspending(userId);
    try {
      const res = await adminFetch(`/api/auth/admin/users/${userId}/suspend/`, token, { method: "POST" });
      setOrganizers(prev => prev.map(o => o.id === userId ? { ...o, is_suspended: res.is_suspended } : o));
    } catch {}
    setSuspending(null);
  };

  if (loading) return (
    <div style={{ padding: "28px 32px" }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "14px", marginBottom: "10px" }} />)}
    </div>
  );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>ORGANIZER_REGISTRY</div>
          <h2 style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>All Organizers</h2>
        </div>
        <div style={{ padding: "6px 14px", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "99px", fontSize: "12px", fontWeight: 700, color: "#f5a623", fontFamily: "var(--font-mono)" }}>
          {organizers.length} TOTAL
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          ["💰", "Total Earned", "GHS " + Math.round(organizers.reduce((s,o) => s + o.total_earned, 0)).toLocaleString(), "#16a34a"],
          ["🎪", "Total Events", organizers.reduce((s,o) => s + o.events_count, 0), "#f5a623"],
          ["🎟️", "Total Sold",   organizers.reduce((s,o) => s + o.tickets_sold, 0), "#2563eb"],
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ fontSize: "20px" }}>{icon}</span>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label.toUpperCase().replace(/ /g,"_")}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Organizer rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {organizers.map(org => (
          <motion.div key={org.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", border: "1px solid " + (org.is_suspended ? "rgba(220,38,38,0.25)" : "var(--border)"), borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>

            {/* Avatar */}
            <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: org.is_suspended ? "rgba(220,38,38,0.1)" : "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: "1px solid " + (org.is_suspended ? "rgba(220,38,38,0.2)" : "rgba(245,166,35,0.2)") }}>
              {org.is_suspended ? "🔒" : "👤"}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{org.name}</span>
                {org.is_suspended && <span style={{ fontSize: "9px", fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "2px 7px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>SUSPENDED</span>}
                {org.is_verified && <span style={{ fontSize: "9px", fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.08)", padding: "2px 7px", borderRadius: "99px", fontFamily: "var(--font-mono)" }}>VERIFIED</span>}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{org.email}</div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
              {[
                ["EVENTS", org.events_count, "#f5a623"],
                ["SOLD",   org.tickets_sold, "#2563eb"],
                ["EARNED", "GHS " + Math.round(org.total_earned).toLocaleString(), "#16a34a"],
              ].map(([k, v, c]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{k}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSuspend(org.id)}
              disabled={suspending === org.id}
              style={{ padding: "7px 14px", borderRadius: "9px", border: "1.5px solid " + (org.is_suspended ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"), background: org.is_suspended ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.06)", color: org.is_suspended ? "#16a34a" : "#dc2626", fontSize: "11px", fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "var(--font-mono)", opacity: suspending === org.id ? 0.6 : 1 }}>
              {suspending === org.id ? "..." : org.is_suspended ? "REINSTATE" : "SUSPEND"}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Events tab ────────────────────────────────────────────────
function EventsTab({ token }) {
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    adminFetch("/api/auth/admin/events/", token)
      .then(data => { if (Array.isArray(data)) setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleToggle = async (eventId) => {
    setToggling(eventId);
    try {
      const res = await adminFetch(`/api/auth/admin/events/${eventId}/toggle/`, token, { method: "POST" });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, is_active: res.is_active } : e));
    } catch {}
    setToggling(null);
  };

  if (loading) return (
    <div style={{ padding: "28px 32px" }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "14px", marginBottom: "10px" }} />)}
    </div>
  );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>EVENT_REGISTRY</div>
          <h2 style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>All Events</h2>
        </div>
        <div style={{ padding: "6px 14px", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "99px", fontSize: "12px", fontWeight: 700, color: "#f5a623", fontFamily: "var(--font-mono)" }}>
          {events.length} EVENTS
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {events.map(ev => (
          <motion.div key={ev.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            style={{ background: "var(--bg-card)", border: "1px solid " + (!ev.is_active ? "rgba(220,38,38,0.2)" : "var(--border)"), borderRadius: "14px", padding: "15px 18px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}>

            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: ev.sales_open && ev.is_active ? "rgba(22,163,74,0.1)" : "rgba(107,107,107,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
              {ev.sales_open && ev.is_active ? "🟢" : "⏸️"}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</span>
                {!ev.is_active && <span style={{ fontSize: "9px", fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "2px 7px", borderRadius: "99px", fontFamily: "var(--font-mono)", flexShrink: 0 }}>DISABLED</span>}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {ev.organizer} · {ev.date} · {ev.venue}
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
              {[
                ["PRICE",   "GHS " + ev.price,    "#f5a623"],
                ["SOLD",    ev.tickets_sold + "/" + ev.total_tickets, "#2563eb"],
                ["REVENUE", "GHS " + Math.round(ev.revenue).toLocaleString(), "#16a34a"],
              ].map(([k, v, c]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{k}</div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleToggle(ev.id)}
              disabled={toggling === ev.id}
              style={{ padding: "7px 14px", borderRadius: "9px", border: "1.5px solid " + (ev.is_active ? "rgba(220,38,38,0.3)" : "rgba(22,163,74,0.3)"), background: ev.is_active ? "rgba(220,38,38,0.06)" : "rgba(22,163,74,0.06)", color: ev.is_active ? "#dc2626" : "#16a34a", fontSize: "11px", fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "var(--font-mono)", opacity: toggling === ev.id ? 0.6 : 1 }}>
              {toggling === ev.id ? "..." : ev.is_active ? "DISABLE" : "ENABLE"}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Transactions tab ──────────────────────────────────────────
function TransactionsTab({ token }) {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    adminFetch("/api/auth/admin/transactions/", token)
      .then(data => { if (Array.isArray(data)) setTxns(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const TYPE_COLOR = { sale: "#16a34a", resale_sale: "#7c3aed", withdrawal: "#2563eb", refund: "#dc2626", fee: "#f5a623" };
  const filtered = filter === "all" ? txns : txns.filter(t => t.type === filter);

  if (loading) return (
    <div style={{ padding: "28px 32px" }}>
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "12px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5a623", letterSpacing: "1.5px", marginBottom: "3px", fontFamily: "var(--font-mono)" }}>TRANSACTION_LOG</div>
          <h2 style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>All Transactions</h2>
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {filtered.length} · GHS {Math.round(filtered.reduce((s,t) => s + (t.type !== "withdrawal" ? t.amount : 0), 0)).toLocaleString()} total
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "7px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["all","sale","resale_sale","withdrawal","fee"].map(f => (
          <motion.div key={f} whileTap={{ scale: 0.94 }} onClick={() => setFilter(f)}
            style={{ padding: "5px 13px", borderRadius: "99px", cursor: "pointer", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", border: "1.5px solid " + (filter === f ? (TYPE_COLOR[f] || "#f5a623") : "var(--border)"), background: filter === f ? (TYPE_COLOR[f] || "#f5a623") + "12" : "var(--bg-card)", color: filter === f ? (TYPE_COLOR[f] || "#f5a623") : "var(--text-muted)", transition: "all 0.18s" }}>
            {f.toUpperCase().replace("_"," ")}
          </motion.div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filtered.slice(0, 50).map((t, i) => (
          <motion.div key={t.id || i}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: TYPE_COLOR[t.type] || "#999", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "1px" }}>{t.user} · {t.reference}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "13px", color: TYPE_COLOR[t.type] || "var(--text-primary)" }}>
                {t.type === "withdrawal" ? "-" : "+"}GHS {parseFloat(t.amount).toLocaleString()}
              </div>
              <div style={{ fontSize: "9px", color: t.status === "completed" ? "#16a34a" : t.status === "pending" ? "#f5a623" : "#dc2626", fontFamily: "var(--font-mono)", marginTop: "1px" }}>
                {t.status?.toUpperCase()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Login ───────────────────────────────────────────────
export function AdminLogin() {
  const setScreen = useStore(s => s.setScreen);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { theme }  = useTheme();

  const handleLogin = async () => {
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(BACKEND + "/api/auth/admin/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.tokens?.access) {
        localStorage.setItem("admin_access_token",  data.tokens.access);
        localStorage.setItem("admin_refresh_token", data.tokens.refresh);
        localStorage.setItem("admin_user",          JSON.stringify(data.user));
        setScreen("adminDashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0e0d0b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: "20px" }}>
      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(249,115,22,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg, #F97316, #EA6C0A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}>
            🛡️
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#F97316", letterSpacing: "2px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
            MASTER EVENTS · ADMIN GATEWAY
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: "8px" }}>
            Super Admin
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Protected access. Authorized personnel only.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)" }}>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
              ⚠️ {error}
            </motion.div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>EMAIL</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@masterevents.com"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "14px", color: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", caretColor: "#F97316" }}
              onFocus={e => { e.target.style.borderColor = "#F97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>PASSWORD</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "14px", color: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", caretColor: "#F97316" }}
              onFocus={e => { e.target.style.borderColor = "#F97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(249,115,22,0.5)" }} whileTap={{ scale: 0.97 }}
            onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "rgba(249,115,22,0.5)" : "linear-gradient(135deg, #F97316, #EA6C0A)", color: "#fff", border: "none", borderRadius: "13px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 6px 20px rgba(249,115,22,0.35)", fontFamily: "var(--font-sans)" }}>
            {loading ? "Authenticating..." : "🛡️ Enter Admin Gateway"}
          </motion.button>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <motion.span whileHover={{ color: "#F97316" }}
            onClick={() => setScreen("home")}
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", cursor: "pointer", transition: "color 0.2s" }}>
            ← Back to Master Events
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────
export function AdminDashboard() {
  const setScreen = useStore(s => s.setScreen);
  const { theme, setTheme } = useTheme();
  const [activeTab,  setActiveTab]  = useState("overview");
  const [overview,   setOverview]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [adminUser,  setAdminUser]  = useState(null);

  const token = localStorage.getItem("admin_access_token");

  useEffect(() => {
    // Load admin user info
    try {
      const u = JSON.parse(localStorage.getItem("admin_user") || "{}");
      setAdminUser(u);
    } catch {}

    // Load overview
    if (token) {
      adminFetch("/api/auth/admin/overview/", token)
        .then(data => { setOverview(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [token]);

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    setScreen("home");
  };

  if (!token) {
    setScreen("adminGateway");
    return null;
  }

  const tabs = [
    { id: "overview",      icon: "📊", label: "Overview" },
    { id: "organizers",    icon: "👤", label: "Organizers" },
    { id: "events",        icon: "🎪", label: "Events" },
    { id: "transactions",  icon: "💳", label: "Transactions" },
  ];

  const themeOpts  = { light: "☀️", dark: "🌙", system: "🖥️" };
  const themeOrder = ["light", "dark", "system"];
  const nextTheme  = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>

      {/* ── Admin Sidebar ── */}
      <div style={{ width: "220px", flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* Header */}
        <div style={{ padding: "16px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #F97316, #EA6C0A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 3px 10px rgba(249,115,22,0.35)", flexShrink: 0 }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Admin Portal</div>
              <div style={{ fontSize: "9px", color: "#F97316", fontWeight: 700, letterSpacing: "0.8px", fontFamily: "var(--font-mono)" }}>MASTER EVENTS</div>
            </div>
          </div>
        </div>

        {/* Admin user */}
        {adminUser && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
              {adminUser.first_name} {adminUser.last_name}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>{adminUser.email}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "99px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#F97316" }} />
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#F97316", fontFamily: "var(--font-mono)" }}>SUPER_ADMIN</span>
            </div>
          </div>
        )}

        {/* Nav tabs */}
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "8px 10px 6px", fontFamily: "var(--font-mono)" }}>NAVIGATE</div>
          {tabs.map(tab => (
            <motion.div key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px", background: activeTab === tab.id ? "rgba(249,115,22,0.1)" : "transparent", transition: "all 0.18s", position: "relative" }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = activeTab === tab.id ? "rgba(249,115,22,0.1)" : "transparent"; }}>
              {activeTab === tab.id && <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: "3px", borderRadius: "0 3px 3px 0", background: "#F97316" }} />}
              <span style={{ fontSize: "15px" }}>{tab.icon}</span>
              <span style={{ fontWeight: 600, fontSize: "13px", color: activeTab === tab.id ? "#F97316" : "var(--text-secondary)" }}>{tab.label}</span>
            </motion.div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "8px", borderTop: "1px solid var(--border)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          <motion.div whileTap={{ scale: 0.95 }} onClick={() => setTheme(nextTheme)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: "14px" }}>{themeOpts[theme]}</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Toggle Theme</span>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }} onClick={handleAdminLogout}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--error-bg)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: "14px" }}>🚪</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--error)" }}>Sign Out</span>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "0 28px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "var(--shadow-sm)" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
              {tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>
              ADMIN_SESSION · {new Date().toLocaleDateString("en-GH", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Platform live status */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "99px", border: "1px solid rgba(249,115,22,0.2)", background: "rgba(249,115,22,0.06)" }}>
              <motion.div animate={{ scale: [1,1.5,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F97316" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#F97316", fontFamily: "var(--font-mono)" }}>ADMIN·LIVE</span>
            </div>

            {/* Quick stats in topbar */}
            {overview && (
              <div style={{ display: "flex", gap: "16px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                {[
                  ["USERS",   overview.users?.total || 0,   "var(--text-primary)"],
                  ["EVENTS",  overview.events?.total || 0,  "#f5a623"],
                  ["TICKETS", overview.tickets?.total || 0, "#7c3aed"],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "9px" }}>{k}:</span>
                    <span style={{ fontWeight: 700, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {activeTab === "overview"     && <OverviewTab data={overview} />}
              {activeTab === "organizers"   && <OrganizersTab token={token} />}
              {activeTab === "events"       && <EventsTab token={token} />}
              {activeTab === "transactions" && <TransactionsTab token={token} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}