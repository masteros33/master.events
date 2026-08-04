import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, LogOut,
  LayoutDashboard, Users, CalendarDays, Receipt, Landmark, Ticket,
  TrendingUp, BarChart3, UserCheck, Zap, Link2, User, Pause, Play,
} from "lucide-react";
import useStore from "../../store/useStore";

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

const TYPE_COLOR = {
  sale: "bg-fintech-blue", resale_sale: "bg-violet-500",
  withdrawal: "bg-slate-400", refund: "bg-red-500", fee: "bg-gray-400",
};
const STATUS_CLASS = {
  completed: "text-emerald-700 bg-emerald-50",
  pending:   "text-amber-700 bg-amber-50",
};

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ Icon, label, value, sub, badgeBg = "bg-pastel-blue", iconClass = "text-fintech-blue" }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className={`w-9 h-9 rounded-full ${badgeBg} flex items-center justify-center mb-3`}>
        <Icon size={16} strokeWidth={1.75} className={iconClass} />
      </div>
      <div className="text-2xl font-extrabold text-fintech-slate tracking-tight font-mono mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-brand-text mb-0.5">{label}</div>
      {sub && <div className="text-[11px] text-brand-muted font-mono">{sub}</div>}
    </motion.div>
  );
}

// ── Overview tab ──────────────────────────────────────────────
function OverviewTab({ data }) {
  if (!data) return <div className="p-10 text-center text-brand-muted text-sm">Loading...</div>;

  const { users, events, tickets, revenue } = data;

  const flowRows = [
    { label: "Organizer Payouts (95%)", val: revenue?.total_earned || 0, bar: "bg-fintech-blue" },
    { label: "Platform Fees (5%)",      val: revenue?.platform_fees || 0, bar: "bg-slate-400" },
    { label: "Withdrawn",               val: revenue?.total_withdrawn || 0, bar: "bg-slate-300" },
  ];
  const flowMax = revenue?.total_earned || 1;

  const miniStats = [
    { Icon: TrendingUp, label: "FILL_RATE",     val: tickets?.total > 0 ? Math.min(100, Math.round((tickets.total / ((events?.total || 1) * 100)) * 100)) + "%" : "N/A", badgeBg: "bg-pastel-orange", iconClass: "text-brand-orange" },
    { Icon: BarChart3,  label: "AVG_REV/EVENT", val: events?.total > 0 ? "GHS " + Math.round((revenue?.total_earned || 0) / (events.total || 1)).toLocaleString() : "N/A", badgeBg: "bg-pastel-blue", iconClass: "text-fintech-blue" },
    { Icon: UserCheck,  label: "USERS/EVENT",   val: events?.total > 0 ? (users?.total / events.total).toFixed(1) : "N/A", badgeBg: "bg-pastel-pink", iconClass: "text-pink-600" },
    { Icon: Zap,        label: "SALES_ACTIVE",  val: events?.active || 0, badgeBg: "bg-pastel-green", iconClass: "text-fintech-green" },
  ];

  return (
    <div className="p-7 pb-14">
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard Icon={Users} label="Total Users" value={users?.total || 0} sub={`${users?.attendees || 0} attendees · ${users?.organizers || 0} organizers`} badgeBg="bg-pastel-blue" iconClass="text-fintech-blue" />
        <StatCard Icon={CalendarDays} label="Total Events" value={events?.total || 0} sub={`${events?.active || 0} live now`} badgeBg="bg-pastel-orange" iconClass="text-brand-orange" />
        <StatCard Icon={Ticket} label="Tickets Issued" value={tickets?.total || 0} sub="All time · NFT minted" badgeBg="bg-pastel-pink" iconClass="text-pink-600" />
        <StatCard Icon={Landmark} label="Platform Revenue" value={"GHS " + Math.round((revenue?.total_earned || 0) * 0.05).toLocaleString()} sub="5% of total ticket sales" badgeBg="bg-pastel-green" iconClass="text-fintech-green" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-3.5 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mb-1">REVENUE_FLOW</div>
          <div className="text-base font-bold text-brand-text mb-5">Organizer Payouts vs Platform Fees</div>
          <div className="flex flex-col gap-3.5">
            {flowRows.map(r => {
              const pct = Math.max(2, Math.round((r.val / flowMax) * 100));
              return (
                <div key={r.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-brand-text">{r.label}</span>
                    <span className="text-xs font-bold font-mono text-fintech-slate">GHS {Math.round(r.val).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${r.bar}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-fintech-slate rounded-2xl p-5">
          <div className="text-[11px] font-bold text-slate-400 tracking-widest font-mono mb-1">BLOCKCHAIN</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <Link2 size={13} strokeWidth={2} className="text-white" />
            </div>
            <div className="text-sm font-bold text-white">Polygon Amoy Network</div>
          </div>
          {[
            ["CONTRACT",   "0x956F...0Daf"],
            ["CHAIN_ID",   "80002"],
            ["NFT_SUPPLY", tickets?.total || 0],
            ["GAS/MINT",   "~0.0002 POL"],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-slate-500 font-mono">{key}</span>
              <span className="text-[10px] font-bold text-slate-200 font-mono">{val}</span>
            </div>
          ))}
          <div className="mt-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold text-emerald-400 font-mono">NETWORK_HEALTHY</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mb-1">PLATFORM_HEALTH</div>
        <div className="text-base font-bold text-brand-text mb-5">Key Metrics at a Glance</div>
        <div className="grid grid-cols-4 gap-3">
          {miniStats.map(s => (
            <div key={s.label} className="bg-fintech-gray rounded-xl border border-gray-100 p-4 text-center">
              <div className={`w-8 h-8 rounded-full ${s.badgeBg} flex items-center justify-center mx-auto mb-2`}>
                <s.Icon size={14} strokeWidth={1.75} className={s.iconClass} />
              </div>
              <div className="text-base font-extrabold text-fintech-slate font-mono mb-1">{s.val}</div>
              <div className="text-[9px] text-brand-muted font-mono">{s.label}</div>
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
    <div className="p-7">
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "16px", marginBottom: "10px" }} />)}
    </div>
  );

  const summary = [
    { Icon: Landmark, label: "TOTAL_EARNED", val: "GHS " + Math.round(organizers.reduce((s,o) => s + o.total_earned, 0)).toLocaleString(), badgeBg: "bg-pastel-green", iconClass: "text-fintech-green" },
    { Icon: CalendarDays, label: "TOTAL_EVENTS", val: organizers.reduce((s,o) => s + o.events_count, 0), badgeBg: "bg-pastel-orange", iconClass: "text-brand-orange" },
    { Icon: Ticket, label: "TOTAL_SOLD", val: organizers.reduce((s,o) => s + o.tickets_sold, 0), badgeBg: "bg-pastel-blue", iconClass: "text-fintech-blue" },
  ];

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mb-1">ORGANIZER_REGISTRY</div>
          <h2 className="font-extrabold text-xl text-brand-text tracking-tight">All Organizers</h2>
        </div>
        <div className="px-3.5 py-1.5 bg-pastel-orange rounded-full text-xs font-bold text-brand-orange font-mono">
          {organizers.length} TOTAL
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {summary.map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${s.badgeBg} flex items-center justify-center shrink-0`}>
              <s.Icon size={16} strokeWidth={1.75} className={s.iconClass} />
            </div>
            <div>
              <div className="text-base font-extrabold text-fintech-slate font-mono">{s.val}</div>
              <div className="text-[10px] text-brand-muted font-mono">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {organizers.map(org => (
          <div key={org.id}
            className={`bg-white border rounded-xl shadow-sm px-4.5 py-4 flex items-center gap-4 ${org.is_suspended ? "border-red-100" : "border-gray-100"}`}>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${org.is_suspended ? "bg-red-50" : "bg-pastel-orange"}`}>
              {org.is_suspended
                ? <Lock size={16} strokeWidth={1.75} className="text-red-600" />
                : <User size={16} strokeWidth={1.75} className="text-brand-orange" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm text-brand-text truncate">{org.name}</span>
                {org.is_suspended && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-mono shrink-0">SUSPENDED</span>}
                {org.is_verified && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono shrink-0">VERIFIED</span>}
              </div>
              <div className="text-[11px] text-brand-muted font-mono truncate">{org.email}</div>
            </div>

            <div className="flex gap-5 shrink-0">
              {[
                ["EVENTS", org.events_count],
                ["SOLD",   org.tickets_sold],
                ["EARNED", "GHS " + Math.round(org.total_earned).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="text-[13px] font-extrabold text-fintech-slate font-mono">{v}</div>
                  <div className="text-[8px] text-brand-muted font-mono">{k}</div>
                </div>
              ))}
            </div>

            <button onClick={() => handleSuspend(org.id)} disabled={suspending === org.id}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold font-mono shrink-0 transition-colors ${suspending === org.id ? "opacity-60" : ""} ${org.is_suspended ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>
              {suspending === org.id ? "..." : org.is_suspended ? "REINSTATE" : "SUSPEND"}
            </button>
          </div>
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
    <div className="p-7">
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "16px", marginBottom: "10px" }} />)}
    </div>
  );

  return (
    <div className="p-7 pb-14">
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mb-1">EVENT_REGISTRY</div>
          <h2 className="font-extrabold text-xl text-brand-text tracking-tight">All Events</h2>
        </div>
        <div className="px-3.5 py-1.5 bg-pastel-orange rounded-full text-xs font-bold text-brand-orange font-mono">
          {events.length} EVENTS
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {events.map(ev => (
          <div key={ev.id}
            className={`bg-white border rounded-xl shadow-sm px-4.5 py-4 flex items-center gap-4 ${!ev.is_active ? "border-red-100" : "border-gray-100"}`}>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ev.sales_open && ev.is_active ? "bg-pastel-green" : "bg-gray-100"}`}>
              {ev.sales_open && ev.is_active
                ? <span className="w-2 h-2 rounded-full bg-fintech-green" />
                : <Pause size={14} strokeWidth={1.75} className="text-brand-muted" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm text-brand-text truncate">{ev.name}</span>
                {!ev.is_active && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-mono shrink-0">DISABLED</span>}
              </div>
              <div className="text-[11px] text-brand-muted font-mono truncate">{ev.organizer} · {ev.date} · {ev.venue}</div>
            </div>

            <div className="flex gap-5 shrink-0">
              {[
                ["PRICE",   "GHS " + ev.price],
                ["SOLD",    ev.tickets_sold + "/" + ev.total_tickets],
                ["REVENUE", "GHS " + Math.round(ev.revenue).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="text-[12px] font-extrabold text-fintech-slate font-mono">{v}</div>
                  <div className="text-[8px] text-brand-muted font-mono">{k}</div>
                </div>
              ))}
            </div>

            <button onClick={() => handleToggle(ev.id)} disabled={toggling === ev.id}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold font-mono shrink-0 transition-colors ${toggling === ev.id ? "opacity-60" : ""} ${ev.is_active ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {toggling === ev.id ? "..." : ev.is_active ? "DISABLE" : "ENABLE"}
            </button>
          </div>
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
          <div className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mb-1">TRANSACTION_LOG</div>
          <h2 className="font-extrabold text-xl text-brand-text tracking-tight">All Transactions</h2>
        </div>
        <div className="text-[11px] text-brand-muted font-mono">
          {filtered.length} · GHS {Math.round(filtered.reduce((s,t) => s + (t.type !== "withdrawal" ? t.amount : 0), 0)).toLocaleString()} total
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["all","sale","resale_sale","withdrawal","fee"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full border text-[10px] font-bold font-mono transition-colors ${filter === f ? "border-brand-orange bg-pastel-orange text-brand-orange" : "border-gray-200 bg-white text-brand-muted"}`}>
            {f.toUpperCase().replace("_"," ")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {filtered.slice(0, 50).map((t, i) => (
          <div key={t.id || i}
            className="bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-3 flex items-center gap-3.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLOR[t.type] || "bg-gray-300"}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-brand-text truncate">{t.description}</div>
              <div className="text-[10px] text-brand-muted font-mono mt-0.5">{t.user} · {t.reference}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-sm text-fintech-slate font-mono">
                {t.type === "withdrawal" ? "-" : "+"}GHS {parseFloat(t.amount).toLocaleString()}
              </div>
              <div className={`text-[9px] font-bold font-mono mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${STATUS_CLASS[t.status] || "text-red-700 bg-red-50"}`}>
                {t.status?.toUpperCase()}
              </div>
            </div>
          </div>
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
    <div className="h-full bg-fintech-gray overflow-y-auto flex justify-center items-start px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="max-w-[420px] w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-full bg-fintech-slate flex items-center justify-center mb-3">
            <ShieldCheck size={20} strokeWidth={2} color="#fff" />
          </div>
          <span className="font-extrabold text-base text-brand-text tracking-tight">Master Events</span>
          <span className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mt-0.5">ADMIN GATEWAY</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-brand-text mb-1.5">Super Admin</h1>
          <p className="text-sm text-brand-muted">Protected access. Authorized personnel only.</p>
        </div>

        <div className="mb-3.5">
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">Email</label>
          <div className="relative">
            <Mail size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@masterevents.com"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-brand-text outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition-colors" />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">Password</label>
          <div className="relative">
            <Lock size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-brand-text outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition-colors" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3.5 text-red-600 text-xs">
            <AlertCircle size={14} strokeWidth={2} /> {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          className="w-full py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
          {loading ? "Authenticating..." : <>Enter Admin Gateway <ArrowRight size={16} strokeWidth={2} /></>}
        </button>

        <div className="text-center mt-5">
          <span onClick={() => setScreen("home")}
            className="text-xs text-brand-muted cursor-pointer hover:text-brand-orange transition-colors">
            ← Back to Master Events
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────
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

  const tabs = [
    { id: "overview",     Icon: LayoutDashboard, label: "Overview" },
    { id: "organizers",   Icon: Users,           label: "Organizers" },
    { id: "events",       Icon: CalendarDays,    label: "Events" },
    { id: "transactions", Icon: Receipt,         label: "Transactions" },
  ];
  const activeMeta = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex h-screen bg-fintech-gray font-sans overflow-hidden">

      {/* ── Admin Sidebar ── */}
      <div className="w-60 shrink-0 bg-fintech-slate flex flex-col h-screen">

        <div className="px-4 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center shrink-0">
              <ShieldCheck size={16} strokeWidth={2} color="#fff" />
            </div>
            <div>
              <div className="font-bold text-[13px] text-white tracking-tight">Admin Portal</div>
              <div className="text-[9px] text-brand-orange font-bold tracking-widest font-mono">MASTER EVENTS</div>
            </div>
          </div>
        </div>

        {adminUser && (
          <div className="px-4 py-3 border-b border-slate-800 shrink-0">
            <div className="text-xs font-bold text-white mb-0.5">{adminUser.first_name} {adminUser.last_name}</div>
            <div className="text-[10px] text-slate-400 font-mono mb-1.5 truncate">{adminUser.email}</div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-[8px] font-bold text-brand-orange font-mono">SUPER_ADMIN</span>
          </div>
        )}

        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="text-[9px] font-bold text-slate-500 tracking-widest px-2.5 pt-2 pb-1.5 font-mono">NAVIGATE</div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-colors relative ${activeTab === t.id ? "bg-slate-800" : "hover:bg-slate-800/60"}`}>
              {activeTab === t.id && <span className="absolute left-0 top-1/5 h-3/5 w-[3px] rounded-r-full bg-brand-orange" />}
              <t.Icon size={15} strokeWidth={1.75} className={activeTab === t.id ? "text-brand-orange" : "text-slate-400"} />
              <span className={`font-semibold text-[13px] ${activeTab === t.id ? "text-brand-orange" : "text-slate-300"}`}>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-800 shrink-0">
          <button onClick={handleAdminLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            <LogOut size={15} strokeWidth={1.75} className="text-red-400" />
            <span className="font-semibold text-xs text-red-400">Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <div className="bg-white border-b border-gray-100 px-7 h-15 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-extrabold text-base text-brand-text tracking-tight">{activeMeta?.label}</h1>
            <p className="text-[10px] text-brand-muted font-mono mt-0.5">
              ADMIN_SESSION · {new Date().toLocaleDateString("en-GH", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 font-mono">PLATFORM LIVE</span>
            </div>

            {overview && (
              <div className="flex gap-4 text-[11px] font-mono">
                {[
                  ["USERS",   overview.users?.total || 0],
                  ["EVENTS",  overview.events?.total || 0],
                  ["TICKETS", overview.tickets?.total || 0],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1">
                    <span className="text-brand-muted text-[9px]">{k}:</span>
                    <span className="font-bold text-fintech-slate">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: "touch" }}>
          {activeTab === "overview"     && <OverviewTab data={overview} />}
          {activeTab === "organizers"   && <OrganizersTab token={token} />}
          {activeTab === "events"       && <EventsTab token={token} />}
          {activeTab === "transactions" && <TransactionsTab token={token} />}
        </div>
      </main>
    </div>
  );
}
