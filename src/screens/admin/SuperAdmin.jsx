import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Envelope, Lock, WarningCircle, ArrowRight, SignOut,
  SquaresFour, Users, CalendarBlank, Receipt, Bank, Ticket,
  TrendUp, ChartBar, UserCheck, Lightning, Link, User, Pause, Play,
  MagnifyingGlass, Broadcast, ArrowSquareOut,
} from "@phosphor-icons/react";
import useStore from "../../store/useStore";

const BACKEND = "https://master-events-backend.onrender.com";

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

const TYPE_COLOR = {
  sale: "bg-blue-600", resale_sale: "bg-violet-500",
  withdrawal: "bg-slate-400", refund: "bg-red-500", fee: "bg-gray-400",
};
const STATUS_CLASS = {
  completed: "text-emerald-700 bg-emerald-50",
  pending:   "text-amber-700 bg-amber-50",
};

function StatCard({ Icon, label, value, sub, badgeBg = "bg-blue-50", iconClass = "text-blue-700" }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
      className="bg-brand-card rounded-2xl border border-brand-hairline transition-shadow p-5">
      <div className={`w-9 h-9 rounded-full ${badgeBg} flex items-center justify-center mb-3`}>
        <Icon size={16} weight="light" className={iconClass} />
      </div>
      <div className="text-2xl font-semibold text-brand-text tracking-tight tabular-nums mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-brand-text mb-0.5">{label}</div>
      {sub && <div className="text-xs text-brand-muted">{sub}</div>}
    </motion.div>
  );
}

function OverviewTab({ data }) {
  if (!data) return <div className="p-10 text-center text-brand-muted text-sm">Loading...</div>;

  const { users, events, tickets, revenue } = data;

  const flowRows = [
    { label: "Organizer Payouts (95%)", val: revenue?.total_earned || 0, bar: "bg-blue-600" },
    { label: "Platform Fees (5%)",      val: revenue?.platform_fees || 0, bar: "bg-slate-400" },
    { label: "Withdrawn",               val: revenue?.total_withdrawn || 0, bar: "bg-slate-300" },
  ];
  const flowMax = revenue?.total_earned || 1;

  const miniStats = [
    { Icon: TrendUp, label: "Fill Rate",     val: tickets?.total > 0 ? Math.min(100, Math.round((tickets.total / ((events?.total || 1) * 100)) * 100)) + "%" : "N/A", badgeBg: "bg-[var(--brand-light)]", iconClass: "text-brand-accent" },
    { Icon: ChartBar,  label: "Avg Revenue/Event", val: events?.total > 0 ? "GHS " + Math.round((revenue?.total_earned || 0) / (events.total || 1)).toLocaleString() : "N/A", badgeBg: "bg-blue-50", iconClass: "text-blue-700" },
    { Icon: UserCheck,  label: "Users/Event",   val: events?.total > 0 ? (users?.total / events.total).toFixed(1) : "N/A", badgeBg: "bg-pink-50", iconClass: "text-pink-600" },
    { Icon: Lightning,        label: "Active Sales",  val: events?.active || 0, badgeBg: "bg-emerald-50", iconClass: "text-emerald-700" },
  ];

  return (
    <div className="p-7 pb-14">
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard Icon={Users} label="Total Users" value={users?.total || 0} sub={`${users?.attendees || 0} attendees · ${users?.organizers || 0} organizers`} badgeBg="bg-blue-50" iconClass="text-blue-700" />
        <StatCard Icon={CalendarBlank} label="Total Events" value={events?.total || 0} sub={`${events?.active || 0} live now`} badgeBg="bg-[var(--brand-light)]" iconClass="text-brand-accent" />
        <StatCard Icon={Ticket} label="Tickets Issued" value={tickets?.total || 0} sub="All time · NFT minted" badgeBg="bg-pink-50" iconClass="text-pink-600" />
        <StatCard Icon={Bank} label="Platform Revenue" value={"GHS " + Math.round((revenue?.total_earned || 0) * 0.05).toLocaleString()} sub="5% of total ticket sales" badgeBg="bg-emerald-50" iconClass="text-emerald-700" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-3.5 mb-6">
        <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
          <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">REVENUE FLOW</div>
          <div className="text-base font-medium text-brand-text mb-5">Organizer Payouts vs Platform Fees</div>
          <div className="flex flex-col gap-3.5">
            {flowRows.map(r => {
              const pct = Math.max(2, Math.round((r.val / flowMax) * 100));
              return (
                <div key={r.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-brand-text">{r.label}</span>
                    <span className="text-xs font-medium text-brand-text tabular-nums">GHS {Math.round(r.val).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-brand-hairline rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${r.bar}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-brand-accent rounded-2xl p-5">
          <div className="text-xs font-medium text-white/60 tracking-widest mb-1">BLOCKCHAIN</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Link size={13} weight="light" className="text-white" />
            </div>
            <div className="text-sm font-medium text-white">Polygon Amoy Network</div>
          </div>
          {[
            ["Contract",   "0x956F...0Daf"],
            ["Chain ID",   "80002"],
            ["NFT Supply", tickets?.total || 0],
            ["Gas / Mint", "~0.0002 POL"],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/50">{key}</span>
              <span className="font-mono text-xs font-medium text-white/90 tabular-nums">{val}</span>
            </div>
          ))}
          <div className="mt-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">NETWORK HEALTHY</span>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
        <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">PLATFORM HEALTH</div>
        <div className="text-base font-medium text-brand-text mb-5">Key Metrics at a Glance</div>
        <div className="grid grid-cols-4 gap-3">
          {miniStats.map(s => (
            <div key={s.label} className="bg-brand-subtle rounded-xl border border-brand-hairline p-4 text-center">
              <div className={`w-8 h-8 rounded-full ${s.badgeBg} flex items-center justify-center mx-auto mb-2`}>
                <s.Icon size={14} weight="light" className={s.iconClass} />
              </div>
              <div className="text-base font-semibold text-brand-text tabular-nums mb-1">{s.val}</div>
              <div className="text-xs text-brand-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div className="p-7">
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "16px", marginBottom: "10px" }} />)}
    </div>
  );

  const summary = [
    { Icon: Bank, label: "Total Earned", val: "GHS " + Math.round(organizers.reduce((s,o) => s + o.total_earned, 0)).toLocaleString(), badgeBg: "bg-emerald-50", iconClass: "text-emerald-700" },
    { Icon: CalendarBlank, label: "Total Events", val: organizers.reduce((s,o) => s + o.events_count, 0), badgeBg: "bg-[var(--brand-light)]", iconClass: "text-brand-accent" },
    { Icon: Ticket, label: "Total Sold", val: organizers.reduce((s,o) => s + o.tickets_sold, 0), badgeBg: "bg-blue-50", iconClass: "text-blue-700" },
  ];

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">ORGANIZER REGISTRY</div>
          <h2 className="font-semibold text-xl text-brand-text tracking-tight">All Organizers</h2>
        </div>
        <div className="px-3.5 py-1.5 bg-[var(--brand-light)] rounded-full text-xs font-medium text-brand-accent">
          {organizers.length} TOTAL
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {summary.map(s => (
          <div key={s.label} className="bg-brand-card border border-brand-hairline rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${s.badgeBg} flex items-center justify-center shrink-0`}>
              <s.Icon size={16} weight="light" className={s.iconClass} />
            </div>
            <div>
              <div className="text-base font-semibold text-brand-text tabular-nums">{s.val}</div>
              <div className="text-xs text-brand-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {organizers.map(org => (
          <div key={org.id}
            className={`bg-brand-card border rounded-xl px-4.5 py-4 flex items-center gap-4 ${org.is_suspended ? "border-red-100" : "border-brand-hairline"}`}>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${org.is_suspended ? "bg-red-50" : "bg-[var(--brand-light)]"}`}>
              {org.is_suspended
                ? <Lock size={16} weight="light" className="text-red-600" />
                : <User size={16} weight="light" className="text-brand-accent" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm text-brand-text truncate">{org.name}</span>
                {org.is_suspended && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">SUSPENDED</span>}
                {org.is_verified && <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">VERIFIED</span>}
              </div>
              <div className="text-xs text-brand-muted truncate">{org.email}</div>
            </div>

            <div className="flex gap-5 shrink-0">
              {[
                ["EVENTS", org.events_count],
                ["SOLD",   org.tickets_sold],
                ["EARNED", "GHS " + Math.round(org.total_earned).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="text-[13px] font-semibold text-brand-text tabular-nums">{v}</div>
                  <div className="text-xs text-brand-muted">{k}</div>
                </div>
              ))}
            </div>

            <button onClick={() => handleSuspend(org.id)} disabled={suspending === org.id}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium shrink-0 transition-colors ${suspending === org.id ? "opacity-60" : ""} ${org.is_suspended ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>
              {suspending === org.id ? "..." : org.is_suspended ? "REINSTATE" : "SUSPEND"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTab({ token }) {
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState(null);
  const [reviewing, setReviewing] = useState(null);

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

  const handleReview = async (eventId, action) => {
    setReviewing(eventId);
    try {
      const res = await adminFetch(`/api/auth/admin/events/${eventId}/approve/`, token, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, is_approved: res.is_approved } : e));
    } catch {}
    setReviewing(null);
  };

  if (loading) return (
    <div className="p-7">
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "16px", marginBottom: "10px" }} />)}
    </div>
  );

  const pendingCount = events.filter(e => !e.is_approved).length;

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">EVENT REGISTRY</div>
          <h2 className="font-semibold text-xl text-brand-text tracking-tight">All Events</h2>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
              {pendingCount} PENDING REVIEW
            </div>
          )}
          <div className="px-3.5 py-1.5 bg-[var(--brand-light)] rounded-full text-xs font-medium text-brand-accent">
            {events.length} EVENTS
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {events.map(ev => (
          <div key={ev.id}
            className={`bg-brand-card border rounded-xl px-4.5 py-4 flex items-center gap-4 ${
              !ev.is_approved ? "border-amber-200" : !ev.is_active ? "border-red-100" : "border-brand-hairline"
            }`}>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              !ev.is_approved ? "bg-amber-50" : ev.sales_open && ev.is_active ? "bg-emerald-50" : "bg-brand-hairline"
            }`}>
              {!ev.is_approved
                ? <ShieldCheck size={14} weight="light" className="text-amber-600" />
                : ev.sales_open && ev.is_active
                  ? <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  : <Pause size={14} weight="light" className="text-brand-muted" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm text-brand-text truncate">{ev.name}</span>
                {!ev.is_approved && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">PENDING REVIEW</span>
                )}
                {ev.is_approved && !ev.is_active && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">DISABLED</span>
                )}
              </div>
              <div className="text-xs text-brand-muted truncate">{ev.organizer} · {ev.date} · {ev.venue}</div>
            </div>

            <div className="flex gap-5 shrink-0">
              {[
                ["PRICE",   "GHS " + ev.price],
                ["SOLD",    ev.tickets_sold + "/" + ev.total_tickets],
                ["REVENUE", "GHS " + Math.round(ev.revenue).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="text-xs font-semibold text-brand-text tabular-nums">{v}</div>
                  <div className="text-xs text-brand-muted">{k}</div>
                </div>
              ))}
            </div>

            {!ev.is_approved ? (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => handleReview(ev.id, "reject")} disabled={reviewing === ev.id}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${reviewing === ev.id ? "opacity-60" : ""} border-red-200 bg-red-50 text-red-600`}>
                  {reviewing === ev.id ? "..." : "REJECT"}
                </button>
                <button onClick={() => handleReview(ev.id, "approve")} disabled={reviewing === ev.id}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${reviewing === ev.id ? "opacity-60" : ""} border-emerald-200 bg-emerald-50 text-emerald-700`}>
                  {reviewing === ev.id ? "..." : "APPROVE"}
                </button>
              </div>
            ) : (
              <button onClick={() => handleToggle(ev.id)} disabled={toggling === ev.id}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium shrink-0 transition-colors ${toggling === ev.id ? "opacity-60" : ""} ${ev.is_active ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {toggling === ev.id ? "..." : ev.is_active ? "DISABLE" : "ENABLE"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsTab({ token }) {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    adminFetch("/api/auth/admin/transactions/", token)
      .then(data => { if (Array.isArray(data)) setTxns(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = filter === "all" ? txns : txns.filter(t => t.type === filter);

  if (loading) return (
    <div className="p-7">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "12px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">TRANSACTION LOG</div>
          <h2 className="font-semibold text-xl text-brand-text tracking-tight">All Transactions</h2>
        </div>
        <div className="text-xs text-brand-muted">
          {filtered.length} · GHS {Math.round(filtered.reduce((s,t) => s + (t.type !== "withdrawal" ? t.amount : 0), 0)).toLocaleString()} total
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["all","sale","resale_sale","withdrawal","fee"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${filter === f ? "border-brand-accent bg-[var(--brand-light)] text-brand-accent" : "border-brand-hairline bg-brand-card text-brand-muted"}`}>
            {f.toUpperCase().replace("_"," ")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {filtered.slice(0, 50).map((t, i) => (
          <div key={t.id || i}
            className="bg-brand-card border border-brand-hairline rounded-xl px-4 py-3 flex items-center gap-3.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLOR[t.type] || "bg-brand-muted"}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-brand-text truncate">{t.description}</div>
              <div className="font-mono text-xs text-brand-muted mt-0.5">{t.user} · {t.reference}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold text-sm text-brand-text">
                {t.type === "withdrawal" ? "-" : "+"}GHS {parseFloat(t.amount).toLocaleString()}
              </div>
              <div className={`text-xs font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${STATUS_CLASS[t.status] || "text-red-700 bg-red-50"}`}>
                {t.status?.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NEW: platform-wide ticket holder lookup ──────────────────
function TicketHoldersTab({ token }) {
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    adminFetch("/api/auth/admin/ticket-holders/", token)
      .then(data => { if (Array.isArray(data)) setHolders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = search
    ? holders.filter(h =>
        h.holder_name.toLowerCase().includes(search.toLowerCase()) ||
        h.holder_email.toLowerCase().includes(search.toLowerCase()) ||
        h.event_name.toLowerCase().includes(search.toLowerCase()) ||
        h.id.toLowerCase().includes(search.toLowerCase())
      )
    : holders;

  if (loading) return (
    <div className="p-7">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "12px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">TICKET HOLDERS</div>
          <h2 className="font-semibold text-xl text-brand-text tracking-tight">All Ticket Holders</h2>
        </div>
        <div className="px-3.5 py-1.5 bg-blue-50 rounded-full text-xs font-medium text-blue-700">
          {filtered.length} SHOWN
        </div>
      </div>

      <div className="relative mb-4">
        <MagnifyingGlass size={14} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="MagnifyingGlass by name, email, event, or ticket ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-brand-card rounded-2xl border border-brand-hairline">
          <div className="text-sm text-brand-muted">No ticket holders found</div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.slice(0, 150).map((h, i) => (
            <div key={h.id + i} className="bg-brand-card border border-brand-hairline rounded-xl px-4 py-3 flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${h.is_free ? "bg-emerald-50" : "bg-blue-50"}`}>
                <User size={15} weight="light" className={h.is_free ? "text-emerald-700" : "text-blue-700"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-brand-text truncate">{h.holder_name}</span>
                  {h.is_free && <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">FREE</span>}
                  {h.nft_minted && <span className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">NFT</span>}
                </div>
                <div className="text-xs text-brand-muted truncate">{h.event_name} · {h.event_date}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-semibold text-brand-text">
                  {h.is_free ? "FREE" : "GHS " + h.price_paid.toLocaleString()}
                </div>
                <div className={`text-xs font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                  h.status === "redeemed" ? "text-gray-600 bg-brand-hairline" :
                  h.status === "resale" ? "text-red-600 bg-red-50" :
                  "text-emerald-700 bg-emerald-50"
                }`}>
                  {h.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── NEW: platform-wide live activity feed ────────────────────
function LiveActivityTab({ token }) {
  const [feed,    setFeed]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = () => {
    adminFetch("/api/auth/admin/live-activity/", token)
      .then(data => { if (Array.isArray(data)) setFeed(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 15000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return (
    <div className="p-7">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "12px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xs font-medium text-brand-muted tracking-widest mb-1">LIVE ACTIVITY</div>
          <h2 className="font-semibold text-xl text-brand-text tracking-tight">Platform-Wide Activity</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-xs font-medium text-emerald-700">LIVE · UPDATES EVERY 15S</span>
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="text-center py-12 bg-brand-card rounded-2xl border border-brand-hairline">
          <div className="text-sm text-brand-muted">No activity yet — real transactions will appear here as they happen</div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {feed.map((t, i) => (
            <div key={t.id || i} className="bg-brand-card border border-brand-hairline rounded-xl px-4 py-3 flex items-center gap-3.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLOR[t.type] || "bg-brand-muted"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-brand-text truncate">{t.description}</div>
                <div className="font-mono text-xs text-brand-muted mt-0.5">{t.user_name} · {t.reference}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-sm text-brand-text">
                  {t.type === "withdrawal" ? "-" : "+"}GHS {parseFloat(t.amount).toLocaleString()}
                </div>
                <div className="text-xs text-brand-muted mt-0.5">
                  {new Date(t.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminLogin() {
  const setScreen = useStore(s => s.setScreen);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

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
    <div className="h-full bg-brand-subtle overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="max-w-[420px] w-full bg-brand-card rounded-2xl border border-brand-hairline p-8">

        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center mb-3">
            <ShieldCheck size={20} weight="light" color="#fff" />
          </div>
          <span className="font-semibold text-base text-brand-text tracking-tight">Master Events</span>
          <span className="text-xs font-medium text-brand-muted tracking-widest mt-0.5">ADMIN GATEWAY</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-brand-text mb-1.5">Super Admin</h1>
          <p className="text-sm text-brand-muted">Protected access. Authorized personnel only.</p>
        </div>

        <div className="mb-3.5">
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">Email</label>
          <div className="relative">
            <Envelope size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@masterevents.com"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors" />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">Password</label>
          <div className="relative">
            <Lock size={16} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-colors" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3.5 text-red-600 text-xs">
            <WarningCircle size={14} weight="light" /> {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          className="w-full h-12 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-60 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors">
          {loading ? "Authenticating..." : <>Enter Admin Gateway <ArrowRight size={16} weight="light" /></>}
        </button>

        <div className="text-center mt-5">
          <span onClick={() => setScreen("home")}
            className="text-xs text-brand-muted cursor-pointer hover:text-brand-accent transition-colors">
            ← Back to Master Events
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function AdminDashboard() {
  const setScreen = useStore(s => s.setScreen);
  const [activeTab,  setActiveTab]  = useState("overview");
  const [overview,   setOverview]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [adminUser,  setAdminUser]  = useState(null);

  const token = localStorage.getItem("admin_access_token");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("admin_user") || "{}");
      setAdminUser(u);
    } catch {}

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

  // ── NEW: two tabs appended — existing four unchanged ──
  const tabs = [
    { id: "overview",       Icon: SquaresFour, label: "Overview" },
    { id: "organizers",     Icon: Users,           label: "Organizers" },
    { id: "events",         Icon: CalendarBlank,    label: "Events" },
    { id: "transactions",   Icon: Receipt,         label: "Transactions" },
    { id: "ticketHolders",  Icon: Ticket,          label: "Ticket Holders" },
    { id: "liveActivity",   Icon: Broadcast,           label: "Live Activity" },
  ];
  const activeMeta = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex h-screen bg-brand-subtle font-sans overflow-hidden">

      <div className="w-60 shrink-0 bg-brand-accent flex flex-col h-screen">

        <div className="px-4 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} weight="light" color="#fff" />
            </div>
            <div>
              <div className="font-medium text-[13px] text-white tracking-tight">Admin Portal</div>
              <div className="text-xs text-white/50 font-medium tracking-widest">MASTER EVENTS</div>
            </div>
          </div>
        </div>

        {adminUser && (
          <div className="px-4 py-3 border-b border-white/10 shrink-0">
            <div className="text-xs font-medium text-white mb-0.5">{adminUser.first_name} {adminUser.last_name}</div>
            <div className="text-xs text-white/50 mb-1.5 truncate">{adminUser.email}</div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/80">SUPER ADMIN</span>
          </div>
        )}

        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="text-xs font-medium text-white/40 tracking-widest px-2.5 pt-2 pb-1.5">NAVIGATE</div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors relative ${activeTab === t.id ? "bg-white/10" : "hover:bg-white/5"}`}>
              {activeTab === t.id && <span className="absolute left-0 top-1/5 h-3/5 w-[3px] rounded-r-full bg-white" />}
              <t.Icon size={15} weight="light" className={activeTab === t.id ? "text-white" : "text-white/50"} />
              <span className={`font-medium text-[13px] ${activeTab === t.id ? "text-white" : "text-white/70"}`}>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10 shrink-0">
          <button onClick={handleAdminLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <SignOut size={15} weight="light" className="text-red-300" />
            <span className="font-medium text-xs text-red-300">Sign Out</span>
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <div className="bg-brand-card border-b border-brand-hairline px-7 h-14 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-semibold text-base text-brand-text tracking-tight">{activeMeta?.label}</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              ADMIN SESSION · {new Date().toLocaleDateString("en-GH", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">PLATFORM LIVE</span>
            </div>

            {overview && (
              <div className="flex gap-4 text-xs">
                {[
                  ["USERS",   overview.users?.total || 0],
                  ["EVENTS",  overview.events?.total || 0],
                  ["TICKETS", overview.tickets?.total || 0],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1">
                    <span className="text-brand-muted text-xs">{k}:</span>
                    <span className="font-medium text-brand-text">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: "touch" }}>
          {activeTab === "overview"      && <OverviewTab data={overview} />}
          {activeTab === "organizers"    && <OrganizersTab token={token} />}
          {activeTab === "events"        && <EventsTab token={token} />}
          {activeTab === "transactions"  && <TransactionsTab token={token} />}
          {activeTab === "ticketHolders" && <TicketHoldersTab token={token} />}
          {activeTab === "liveActivity"  && <LiveActivityTab token={token} />}
        </div>
      </main>
    </div>
  );
}