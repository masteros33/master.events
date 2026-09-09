import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, CalendarCheck, Bank, Scales, ClipboardText, SlidersHorizontal,
  WarningCircle, CheckCircle, XCircle, Pause, Play, ArrowsClockwise,
  ShieldCheck, CircleNotch, X, Cube,
} from "@phosphor-icons/react";
import { adminAPI } from "../../api";

/* ────────────────────────────────────────────────────────────
   Shared primitives — same visual language as the rest of the
   panel: hairline cards, no shadows, tabular numerals on money.
   ──────────────────────────────────────────────────────────── */

const money = (v, ccy = "GHS") =>
  `${ccy} ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const when = (d) => (d ? new Date(d).toLocaleString(undefined, {
  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
}) : "—");

function Empty({ label }) {
  return (
    <div className="bg-brand-card border border-brand-hairline rounded-2xl py-14 text-center">
      <div className="text-sm font-medium text-brand-text mb-1">Nothing here</div>
      <div className="text-xs text-brand-muted">{label}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-2.5">
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "76px", borderRadius: "16px" }} />)}
    </div>
  );
}

function Banner({ tone = "error", children, onClose }) {
  const tones = {
    error:   "bg-red-50 border-red-100 text-red-600",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };
  return (
    <div className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 mb-4 text-sm ${tones[tone]}`}>
      <span className="flex items-center gap-2">
        {tone === "error" ? <WarningCircle size={14} weight="light" /> : <CheckCircle size={14} weight="light" />}
        {children}
      </span>
      {onClose && <button onClick={onClose} className="text-brand-muted shrink-0"><X size={14} weight="light" /></button>}
    </div>
  );
}

function Pill({ status }) {
  const map = {
    approved: "text-emerald-700 bg-emerald-50", verified: "text-emerald-700 bg-emerald-50",
    paid: "text-emerald-700 bg-emerald-50", completed: "text-emerald-700 bg-emerald-50",
    pending: "text-amber-700 bg-amber-50", requested: "text-amber-700 bg-amber-50",
    reviewing: "text-amber-700 bg-amber-50", processing: "text-amber-700 bg-amber-50",
    suspended: "text-red-600 bg-red-50", rejected: "text-red-600 bg-red-50",
    failed: "text-red-600 bg-red-50", open: "text-red-600 bg-red-50",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${map[status] || "text-brand-muted bg-brand-hairline"}`}>
      {String(status || "").replace(/_/g, " ")}
    </span>
  );
}

/**
 * Every destructive or money-moving action goes through here. The reason is
 * mandatory because the backend stores it on the audit row — an admin action
 * without a stated reason is not something anyone can review later.
 */
// Remounted on every open (the `key` below) so the textarea is always empty —
// an admin should never inherit the reason they typed for a different row.
function ReasonPrompt(props) {
  if (!props.open) return null;
  return <ReasonPromptBox key={props.title} {...props} />;
}

function ReasonPromptBox({ title, note, confirmLabel, requireReason = true, onCancel, onConfirm, busy }) {
  const [reason, setReason] = useState("");
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-5">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-card rounded-2xl border border-brand-hairline max-w-[440px] w-full p-6">
          <h3 className="text-base font-semibold text-brand-text tracking-tight mb-1.5">{title}</h3>
          {note && <p className="text-xs text-brand-muted leading-relaxed mb-4">{note}</p>}
          <label className="text-xs font-semibold text-brand-muted mb-1.5 block">
            Reason {requireReason && <span className="text-red-500">*</span>}
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="Recorded on the audit log, and shown to the organizer where relevant."
            className="w-full px-3.5 py-2.5 rounded-xl border border-brand-hairline bg-brand-canvas text-sm text-brand-text outline-none focus:border-brand-accent resize-none mb-4" />
          <div className="flex gap-2.5">
            <button onClick={onCancel} disabled={busy}
              className="flex-1 h-11 rounded-xl border border-brand-hairline text-brand-muted text-sm font-medium">
              Cancel
            </button>
            <button onClick={() => onConfirm(reason)} disabled={busy || (requireReason && !reason.trim())}
              className="flex-1 h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-40 text-white text-sm font-medium transition-colors">
              {busy ? "Working..." : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Every list on this panel behaves the same way: fetch on mount, refetch when
// the filter changes, refetch on demand after an action. `deps` is serialised
// into the effect key so the caller can pass a filter string without having to
// memoise anything, and a stale response from a filter the admin has already
// moved off is dropped rather than painted.
function useList(fetcher, deps = []) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify(deps);
  useEffect(() => {
    let live = true;
    setLoading(true);
    fetcher().then(res => {
      if (!live) return;
      if (Array.isArray(res)) { setRows(res); setError(""); }
      else { setRows([]); setError(res?.error || "Could not load this list."); }
      setLoading(false);
    });
    return () => { live = false; };
    // `fetcher` is a fresh closure every render; `key` is what actually
    // decides when the list needs refetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const reload = useCallback(() => setNonce(n => n + 1), []);
  return { rows, loading, error, reload, setError };
}

/* ────────────────────────────────────────────────────────────
   ORGANIZER VERIFICATION
   ──────────────────────────────────────────────────────────── */

export function VerificationTab() {
  const [filter, setFilter] = useState("pending");
  const { rows, loading, error, reload, setError } = useList(() => adminAPI.organizerQueue(filter), [filter]);
  const [prompt, setPrompt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  const act = async (reason) => {
    setBusy(true);
    const { id, kind } = prompt;
    const fn = { verify: adminAPI.verifyOrganizer, reject: adminAPI.rejectOrganizer,
                 suspend: adminAPI.suspendOrganizer, reinstate: adminAPI.reinstateOrganizer }[kind];
    const res = await fn(id, reason);
    setBusy(false); setPrompt(null);
    if (res.ok) { setOk(`Organizer ${kind === "verify" ? "verified" : kind + "ed"}.`); reload(); }
    else setError(res.error || "That did not go through.");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["pending", "verified", "rejected", "unverified", "suspended"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 px-3.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === f ? "bg-brand-accent text-white" : "bg-brand-card border border-brand-hairline text-brand-muted"}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <Banner onClose={() => setError("")}>{error}</Banner>}
      {ok && <Banner tone="success" onClose={() => setOk("")}>{ok}</Banner>}

      {loading ? <Loading /> : rows.length === 0 ? <Empty label={`No ${filter} organizers.`} /> : (
        <div className="flex flex-col gap-2.5">
          {rows.map(o => (
            <div key={o.id} className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-text text-sm truncate">{o.business_name || o.full_name}</div>
                  <div className="text-xs text-brand-muted truncate">{o.email} · {o.phone || "no phone"}</div>
                  <div className="text-xs text-brand-muted mt-0.5">
                    {o.events_count} event{o.events_count === 1 ? "" : "s"} · submitted {when(o.submitted_at)}
                  </div>
                </div>
                <Pill status={o.is_suspended ? "suspended" : o.verification_status} />
              </div>

              {o.verification_data && Object.keys(o.verification_data).length > 0 && (
                <div className="bg-brand-canvas rounded-xl p-3.5 mb-3 grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {Object.entries(o.verification_data).map(([k, v]) => (
                    <div key={k} className="min-w-0">
                      <div className="text-xs text-brand-muted capitalize">{k.replace(/_/g, " ")}</div>
                      {String(v).startsWith("http")
                        ? <a href={v} target="_blank" rel="noreferrer" className="text-xs text-brand-accent font-medium truncate block">Open document</a>
                        : <div className="text-xs text-brand-text font-medium truncate">{String(v) || "—"}</div>}
                    </div>
                  ))}
                </div>
              )}

              {o.rejection_reason && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
                  Previously rejected: {o.rejection_reason}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {o.verification_status !== "verified" && (
                  <button onClick={() => setPrompt({ id: o.id, kind: "verify" })}
                    className="h-9 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <CheckCircle size={14} weight="light" /> Verify
                  </button>
                )}
                {o.verification_status !== "rejected" && (
                  <button onClick={() => setPrompt({ id: o.id, kind: "reject" })}
                    className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-muted text-xs font-medium flex items-center gap-1.5">
                    <XCircle size={14} weight="light" /> Reject
                  </button>
                )}
                {o.is_suspended
                  ? <button onClick={() => setPrompt({ id: o.id, kind: "reinstate" })}
                      className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-muted text-xs font-medium flex items-center gap-1.5">
                      <Play size={14} weight="light" /> Reinstate
                    </button>
                  : <button onClick={() => setPrompt({ id: o.id, kind: "suspend" })}
                      className="h-9 px-4 rounded-xl border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                      <Pause size={14} weight="light" /> Suspend
                    </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReasonPrompt open={!!prompt} busy={busy}
        title={{ verify: "Verify this organizer", reject: "Reject verification",
                 suspend: "Suspend organizer", reinstate: "Reinstate organizer" }[prompt?.kind] || ""}
        note={prompt?.kind === "suspend"
          ? "Ticket sales and resale stop immediately across every event they run. Nothing is deleted."
          : prompt?.kind === "verify"
          ? "They will be able to receive payouts. Check the documents above first."
          : undefined}
        requireReason={prompt?.kind !== "verify" && prompt?.kind !== "reinstate"}
        confirmLabel={{ verify: "Verify", reject: "Reject", suspend: "Suspend", reinstate: "Reinstate" }[prompt?.kind] || "Confirm"}
        onCancel={() => setPrompt(null)} onConfirm={act} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   EVENT MODERATION
   ──────────────────────────────────────────────────────────── */

export function ModerationTab() {
  const [filter, setFilter] = useState("pending");
  const { rows, loading, error, reload, setError } = useList(() => adminAPI.events(filter), [filter]);
  const [prompt, setPrompt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  const act = async (reason) => {
    setBusy(true);
    const { id, kind } = prompt;
    const fn = { approve: adminAPI.approveEvent, reject: adminAPI.rejectEvent,
                 suspend: adminAPI.suspendEvent, reinstate: adminAPI.reinstateEvent }[kind];
    const res = await fn(id, reason);
    setBusy(false); setPrompt(null);
    if (res.ok) { setOk(`Event ${kind}d.`); reload(); }
    else setError(res.error || "That did not go through.");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["pending", "approved", "rejected", "suspended", "ended"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 px-3.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === f ? "bg-brand-accent text-white" : "bg-brand-card border border-brand-hairline text-brand-muted"}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <Banner onClose={() => setError("")}>{error}</Banner>}
      {ok && <Banner tone="success" onClose={() => setOk("")}>{ok}</Banner>}

      {loading ? <Loading /> : rows.length === 0 ? <Empty label={`No ${filter} events.`} /> : (
        <div className="flex flex-col gap-2.5">
          {rows.map(e => (
            <div key={e.id} className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-text text-sm truncate">{e.name}</div>
                  <div className="text-xs text-brand-muted truncate">{e.organizer} · {e.organizer_email}</div>
                  <div className="text-xs text-brand-muted mt-0.5">
                    {e.date} · {e.venue}, {e.city} · {money(e.price, e.currency)} · {e.tickets_sold}/{e.total_tickets} sold
                  </div>
                </div>
                <Pill status={e.moderation_status} />
              </div>

              {e.moderation_reason && (
                <div className="text-xs text-brand-muted bg-brand-canvas rounded-lg px-3 py-2 mb-3">
                  {e.moderation_reason}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {e.moderation_status !== "approved" && e.moderation_status !== "suspended" && (
                  <button onClick={() => setPrompt({ id: e.id, kind: "approve" })}
                    className="h-9 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <CheckCircle size={14} weight="light" /> Approve
                  </button>
                )}
                {e.moderation_status === "pending" && (
                  <button onClick={() => setPrompt({ id: e.id, kind: "reject" })}
                    className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-muted text-xs font-medium flex items-center gap-1.5">
                    <XCircle size={14} weight="light" /> Reject
                  </button>
                )}
                {e.moderation_status === "suspended"
                  ? <button onClick={() => setPrompt({ id: e.id, kind: "reinstate" })}
                      className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-muted text-xs font-medium flex items-center gap-1.5">
                      <Play size={14} weight="light" /> Reinstate
                    </button>
                  : <button onClick={() => setPrompt({ id: e.id, kind: "suspend" })}
                      className="h-9 px-4 rounded-xl border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                      <Pause size={14} weight="light" /> Suspend
                    </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReasonPrompt open={!!prompt} busy={busy}
        title={{ approve: "Approve this event", reject: "Reject this event",
                 suspend: "Suspend this event", reinstate: "Put this event back on sale" }[prompt?.kind] || ""}
        note={prompt?.kind === "suspend"
          ? "Ticket sales and resale listings stop immediately. Existing tickets stay valid and every record is preserved."
          : prompt?.kind === "reject"
          ? "The organizer sees this reason and can edit the event and resubmit."
          : undefined}
        requireReason={prompt?.kind === "reject" || prompt?.kind === "suspend"}
        confirmLabel={{ approve: "Approve", reject: "Reject", suspend: "Suspend", reinstate: "Reinstate" }[prompt?.kind] || "Confirm"}
        onCancel={() => setPrompt(null)} onConfirm={act} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MONEY — payouts, refunds, reconciliation
   ──────────────────────────────────────────────────────────── */

export function MoneyTab() {
  const [section, setSection] = useState("payouts");
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {[["payouts", "Payouts"], ["refunds", "Refunds"], ["issues", "Reconciliation"]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)}
            className={`h-8 px-3.5 rounded-full text-xs font-medium transition-colors ${section === id ? "bg-brand-accent text-white" : "bg-brand-card border border-brand-hairline text-brand-muted"}`}>
            {label}
          </button>
        ))}
      </div>
      {section === "payouts" && <PayoutsSection />}
      {section === "refunds" && <RefundsSection />}
      {section === "issues" && <IssuesSection />}
    </div>
  );
}

function PayoutsSection() {
  const [status, setStatus] = useState("requested");
  const { rows, loading, error, reload, setError } = useList(() => adminAPI.adminPayouts(status), [status]);
  const [prompt, setPrompt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  const act = async (text) => {
    setBusy(true);
    const res = prompt.kind === "paid"
      ? await adminAPI.markPayoutPaid(prompt.id, text, "marked paid from the admin panel")
      : await adminAPI.markPayoutFailed(prompt.id, text);
    setBusy(false); setPrompt(null);
    if (res.ok) { setOk(prompt.kind === "paid" ? "Payout marked paid." : "Payout reversed — the money is back on their balance."); reload(); }
    else setError(res.error || "That did not go through.");
  };

  return (
    <div>
      <div className="bg-brand-canvas border border-brand-hairline rounded-xl px-4 py-3 mb-4 text-xs text-brand-muted leading-relaxed">
        Payouts are in <span className="text-brand-text font-medium">manual mode</span>. The organizer&apos;s balance is
        debited the moment they request. Pay them from the Paystack dashboard, then mark it paid here — marking
        paid never debits a second time. Marking it failed returns the money to their balance.
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["requested", "processing", "paid", "failed"].map(f => (
          <button key={f} onClick={() => setStatus(f)}
            className={`h-8 px-3.5 rounded-full text-xs font-medium capitalize transition-colors ${status === f ? "bg-brand-accent text-white" : "bg-brand-card border border-brand-hairline text-brand-muted"}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <Banner onClose={() => setError("")}>{error}</Banner>}
      {ok && <Banner tone="success" onClose={() => setOk("")}>{ok}</Banner>}

      {loading ? <Loading /> : rows.length === 0 ? <Empty label={`No ${status} payouts.`} /> : (
        <div className="flex flex-col gap-2.5">
          {rows.map(p => (
            <div key={p.id} className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-text text-base tabular-nums">{money(p.amount, p.currency)}</div>
                  <div className="text-xs text-brand-muted truncate">{p.organizer_email}</div>
                  <div className="text-xs text-brand-muted mt-0.5 font-mono">
                    {p.account?.network?.toUpperCase() || p.account?.type?.toUpperCase()} {p.account?.masked_number} · {p.account?.account_name}
                  </div>
                  <div className="text-xs text-brand-muted mt-0.5">{p.reference} · requested {when(p.requested_at)}</div>
                </div>
                <Pill status={p.status} />
              </div>
              {p.failure_reason && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{p.failure_reason}</div>
              )}
              {(p.status === "requested" || p.status === "processing" || p.status === "failed") && (
                <div className="flex gap-2">
                  {p.status !== "failed" && (
                    <button onClick={() => setPrompt({ id: p.id, kind: "paid" })}
                      className="h-9 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                      <CheckCircle size={14} weight="light" /> Mark paid
                    </button>
                  )}
                  {p.status !== "failed" && (
                    <button onClick={() => setPrompt({ id: p.id, kind: "failed" })}
                      className="h-9 px-4 rounded-xl border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
                      <XCircle size={14} weight="light" /> Could not pay
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ReasonPrompt open={!!prompt} busy={busy}
        title={prompt?.kind === "paid" ? "Mark this payout as paid" : "Mark this payout as failed"}
        note={prompt?.kind === "paid"
          ? "Only after the money has actually left the Paystack dashboard. Put the Paystack transfer reference below."
          : "The amount goes back onto the organizer's available balance and they can request again."}
        requireReason={prompt?.kind !== "paid"}
        confirmLabel={prompt?.kind === "paid" ? "Mark paid" : "Reverse payout"}
        onCancel={() => setPrompt(null)} onConfirm={act} />
    </div>
  );
}

function RefundsSection() {
  const [status, setStatus] = useState("open");
  const { rows, loading, error, reload, setError } = useList(() => adminAPI.refunds(status), [status]);
  const [prompt, setPrompt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  const act = async (reason) => {
    setBusy(true);
    const { id, kind } = prompt;
    const res = kind === "approve" ? await adminAPI.approveRefund(id, reason)
              : kind === "reject"  ? await adminAPI.rejectRefund(id, reason)
              : await adminAPI.retryRefund(id);
    setBusy(false); setPrompt(null);
    if (res.ok) { setOk(`Refund ${kind === "approve" ? "approved and processing" : kind + "ed"}.`); reload(); }
    else setError(res.error || "That did not go through.");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["open", "completed", "failed", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setStatus(f)}
            className={`h-8 px-3.5 rounded-full text-xs font-medium capitalize transition-colors ${status === f ? "bg-brand-accent text-white" : "bg-brand-card border border-brand-hairline text-brand-muted"}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <Banner onClose={() => setError("")}>{error}</Banner>}
      {ok && <Banner tone="success" onClose={() => setOk("")}>{ok}</Banner>}

      {loading ? <Loading /> : rows.length === 0 ? <Empty label={`No ${status} refunds.`} /> : (
        <div className="flex flex-col gap-2.5">
          {rows.map(r => (
            <div key={r.id} className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-text text-base tabular-nums">{money(r.amount, r.currency)}</div>
                  <div className="text-xs text-brand-muted truncate">{r.buyer_email} · {r.event_name}</div>
                  <div className="text-xs text-brand-muted mt-0.5">
                    {r.kind_label} · back to {r.method === "credits" ? "Master Events Credits" : "original payment method"} · {when(r.created_at)}
                  </div>
                  {r.ticket_ids?.length > 0 && (
                    <div className="text-xs text-brand-muted mt-0.5 font-mono truncate">{r.ticket_ids.join(", ")}</div>
                  )}
                </div>
                <Pill status={r.status} />
              </div>
              {r.reason && <div className="text-xs text-brand-muted bg-brand-canvas rounded-lg px-3 py-2 mb-3">{r.reason}</div>}
              {r.failure_reason && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{r.failure_reason}</div>}
              <div className="flex gap-2 flex-wrap">
                {(r.status === "requested" || r.status === "reviewing") && (
                  <>
                    <button onClick={() => setPrompt({ id: r.id, kind: "approve" })}
                      className="h-9 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                      <CheckCircle size={14} weight="light" /> Approve
                    </button>
                    <button onClick={() => setPrompt({ id: r.id, kind: "reject" })}
                      className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-muted text-xs font-medium flex items-center gap-1.5">
                      <XCircle size={14} weight="light" /> Decline
                    </button>
                  </>
                )}
                {r.status === "failed" && (
                  <button onClick={() => setPrompt({ id: r.id, kind: "retry" })}
                    className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-muted text-xs font-medium flex items-center gap-1.5">
                    <ArrowsClockwise size={14} weight="light" /> Retry ({r.attempts})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReasonPrompt open={!!prompt} busy={busy}
        title={{ approve: "Approve this refund", reject: "Decline this refund", retry: "Retry this refund" }[prompt?.kind] || ""}
        note={prompt?.kind === "approve"
          ? "The tickets are voided, inventory goes back, the organizer's share is clawed back, and the money is returned."
          : prompt?.kind === "reject"
          ? "The attendee sees this reason."
          : "Sends it back to Paystack."}
        requireReason={prompt?.kind === "reject"}
        confirmLabel={{ approve: "Approve refund", reject: "Decline", retry: "Retry" }[prompt?.kind] || "Confirm"}
        onCancel={() => setPrompt(null)} onConfirm={act} />
    </div>
  );
}

function IssuesSection() {
  const { rows, loading, error, reload, setError } = useList(() => adminAPI.issues("open"), []);
  const [running, setRunning] = useState(false);
  const [ok, setOk] = useState("");

  const runReconcile = async () => {
    setRunning(true);
    const res = await adminAPI.reconcile();
    setRunning(false);
    if (res.ok) { setOk("Reconciliation finished."); reload(); }
    else setError(res.error || "Reconciliation failed.");
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-xs text-brand-muted">Where our books and the provider disagree.</div>
        <button onClick={runReconcile} disabled={running}
          className="h-9 px-4 rounded-xl border border-brand-hairline text-brand-text text-xs font-medium flex items-center gap-1.5 disabled:opacity-50">
          {running ? <CircleNotch size={14} weight="light" className="animate-spin" /> : <ArrowsClockwise size={14} weight="light" />}
          {running ? "Reconciling..." : "Run reconciliation"}
        </button>
      </div>

      {error && <Banner onClose={() => setError("")}>{error}</Banner>}
      {ok && <Banner tone="success" onClose={() => setOk("")}>{ok}</Banner>}

      {loading ? <Loading /> : rows.length === 0 ? <Empty label="Books and provider agree." /> : (
        <div className="flex flex-col gap-2.5">
          {rows.map(i => (
            <div key={i.id} className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-text text-sm capitalize">{i.kind.replace(/_/g, " ")}</div>
                  <div className="text-xs text-brand-muted font-mono truncate">{i.reference}</div>
                  <div className="text-xs text-brand-muted mt-1 leading-relaxed">{i.summary}</div>
                </div>
                <Pill status={i.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   AUDIT LOG
   ──────────────────────────────────────────────────────────── */

export function AuditTab() {
  const [q, setQ] = useState("");
  const { rows, loading, error } = useList(() => adminAPI.auditLogs(q ? `?action=${encodeURIComponent(q)}` : ""), [q]);
  const [term, setTerm] = useState("");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={term} onChange={e => setTerm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setQ(term)}
          placeholder="Filter by action, e.g. SUSPENDED"
          className="flex-1 h-10 px-4 rounded-xl border border-brand-hairline bg-brand-card text-sm text-brand-text outline-none focus:border-brand-accent" />
        <button onClick={() => setQ(term)} className="h-10 px-4 rounded-xl bg-brand-accent text-white text-xs font-medium">Filter</button>
      </div>

      {error && <Banner>{error}</Banner>}

      {loading ? <Loading /> : rows.length === 0 ? <Empty label="No matching entries." /> : (
        <div className="bg-brand-card border border-brand-hairline rounded-2xl overflow-hidden">
          {rows.map((a, i) => (
            <div key={a.id} className={`px-5 py-3.5 ${i < rows.length - 1 ? "border-b border-brand-hairline" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-brand-text">{a.action.replace(/_/g, " ").toLowerCase()}</div>
                  <div className="text-xs text-brand-muted truncate">
                    {a.actor || "system"} · {a.resource_type?.split(".").pop()} {a.resource_id?.slice(0, 12)}
                  </div>
                  {a.reason && <div className="text-xs text-brand-muted mt-1 italic">&ldquo;{a.reason}&rdquo;</div>}
                </div>
                <div className="text-xs text-brand-muted shrink-0 tabular-nums">{when(a.at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CONTROLS — kill switches, MFA, maintenance, mint failures
   ──────────────────────────────────────────────────────────── */

const SWITCHES = [
  ["checkout_enabled", "Ticket checkout", "Turning this off stops all new ticket purchases immediately."],
  ["resale_enabled",   "Resale marketplace", "Stops new listings and resale purchases."],
  ["payouts_enabled",  "Organizer payouts", "Stops new payout requests."],
];

export function ControlsTab() {
  const [settings, setSettings] = useState({});
  const [mfa, setMfa] = useState(null);
  const [nft, setNft] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [enrol, setEnrol] = useState(null);
  const [code, setCode] = useState("");

  const load = useCallback(async () => {
    const [s, m, n] = await Promise.all([adminAPI.settings(), adminAPI.mfaStatus(), adminAPI.nftStats()]);
    if (s.ok) setSettings(s);
    if (m.ok) setMfa(m);
    if (n.ok) setNft(n);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (key, next) => {
    setBusy(key);
    const res = await adminAPI.setSetting(key, next, next ? "re-enabled from admin panel" : "disabled from admin panel");
    setBusy("");
    if (res.ok) { setSettings(p => ({ ...p, [key]: next })); setOk(`${key.replace(/_/g, " ")} ${next ? "enabled" : "disabled"}.`); }
    else setError(res.error || "Could not change that setting.");
  };

  const startMfa = async () => {
    const res = await adminAPI.mfaSetup();
    if (res.ok) setEnrol(res); else setError(res.error || "Could not start MFA setup.");
  };

  const confirmMfa = async () => {
    setBusy("mfa");
    const res = await adminAPI.mfaConfirm(code);
    setBusy("");
    if (res.ok) { setEnrol({ ...enrol, backup_codes: res.backup_codes, done: true }); load(); }
    else setError(res.error || "That code was not accepted.");
  };

  const runMaintenance = async () => {
    setBusy("maint");
    const res = await fetch(`${(import.meta.env.VITE_API_BASE || "https://master-events-backend.onrender.com/api")}/maintenance/run/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin_access_token") || ""}` },
      body: JSON.stringify({ fast: true }),
    }).then(r => r.json()).catch(() => ({ error: "Connection error" }));
    setBusy("");
    if (res.ok) setOk("Maintenance run finished."); else setError(res.error || "Maintenance failed.");
  };

  return (
    <div className="flex flex-col gap-5">
      {error && <Banner onClose={() => setError("")}>{error}</Banner>}
      {ok && <Banner tone="success" onClose={() => setOk("")}>{ok}</Banner>}

      <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
        <div className="font-semibold text-brand-text text-sm mb-1">Platform switches</div>
        <div className="text-xs text-brand-muted mb-4">Takes effect immediately, no deploy. Every change is audited.</div>
        {SWITCHES.map(([key, label, note]) => {
          const on = settings[key] !== false;
          return (
            <div key={key} className="flex items-center justify-between gap-4 py-3 border-t border-brand-hairline first:border-t-0">
              <div className="min-w-0">
                <div className="text-sm font-medium text-brand-text">{label}</div>
                <div className="text-xs text-brand-muted">{note}</div>
              </div>
              <button onClick={() => toggle(key, !on)} disabled={busy === key}
                className={`h-9 px-4 rounded-xl text-xs font-medium shrink-0 transition-colors ${on ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {busy === key ? "..." : on ? "Enabled" : "Disabled"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} weight="light" className="text-brand-accent" />
          <div className="font-semibold text-brand-text text-sm">Two-factor authentication</div>
        </div>
        <div className="text-xs text-brand-muted mb-4">
          {mfa?.enrolled
            ? "Enabled. Admin sign-in requires a code from your authenticator app."
            : "Not enabled. Anyone with the admin password can sign in — turn this on before launch."}
        </div>

        {!mfa?.enrolled && !enrol && (
          <button onClick={startMfa} className="h-10 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium transition-colors">
            Set up authenticator
          </button>
        )}

        {enrol && !enrol.done && (
          <div>
            <div className="text-xs text-brand-muted mb-2">
              Add this secret to Google Authenticator or 1Password, then enter the 6-digit code.
            </div>
            <div className="font-mono text-sm text-brand-text bg-brand-canvas rounded-xl px-4 py-3 mb-3 break-all">{enrol.secret}</div>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" maxLength={6}
                placeholder="000000"
                className="flex-1 h-10 px-4 rounded-xl border border-brand-hairline bg-brand-canvas text-sm tabular-nums outline-none focus:border-brand-accent" />
              <button onClick={confirmMfa} disabled={busy === "mfa" || code.length < 6}
                className="h-10 px-4 rounded-xl bg-brand-accent disabled:opacity-40 text-white text-xs font-medium">
                Confirm
              </button>
            </div>
          </div>
        )}

        {enrol?.done && (
          <div>
            <div className="text-xs text-brand-text font-medium mb-2">
              Save these backup codes now. They are shown once, and each works a single time.
            </div>
            <div className="grid grid-cols-4 gap-2">
              {enrol.backup_codes.map(bc => (
                <div key={bc} className="font-mono text-xs text-brand-text bg-brand-canvas rounded-lg px-2 py-2 text-center">{bc}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Cube size={16} weight="light" className="text-brand-accent" />
          <div className="font-semibold text-brand-text text-sm">NFT minting</div>
        </div>
        <div className="text-xs text-brand-muted mb-3">
          {nft?.chain_enabled ? `Connected · chain ${nft.chain_id}` : "Chain not configured — tickets still sell and scan, mints queue up."}
        </div>
        {nft && (
          <div className="grid grid-cols-4 gap-3">
            {["minted", "pending", "minting", "failed"].map(k => (
              <div key={k} className="bg-brand-canvas rounded-xl px-3 py-2.5">
                <div className="text-base font-semibold text-brand-text tabular-nums">{nft.tickets?.[k] ?? 0}</div>
                <div className="text-xs text-brand-muted capitalize">{k}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5">
        <div className="font-semibold text-brand-text text-sm mb-1">Maintenance</div>
        <div className="text-xs text-brand-muted mb-4">
          Expires stale orders, releases settlements, retries stuck mints and refunds. Runs on a schedule too.
        </div>
        <button onClick={runMaintenance} disabled={busy === "maint"}
          className="h-10 px-4 rounded-xl border border-brand-hairline text-brand-text text-xs font-medium flex items-center gap-1.5 disabled:opacity-50">
          {busy === "maint" ? <CircleNotch size={14} weight="light" className="animate-spin" /> : <ArrowsClockwise size={14} weight="light" />}
          {busy === "maint" ? "Running..." : "Run now"}
        </button>
      </div>
    </div>
  );
}

export const OPS_TABS = [
  { id: "verification", label: "Verification", Icon: UserCheck },
  { id: "moderation",   label: "Moderation",   Icon: CalendarCheck },
  { id: "money",        label: "Money",        Icon: Bank },
  { id: "audit",        label: "Audit Log",    Icon: ClipboardText },
  { id: "controls",     label: "Controls",     Icon: SlidersHorizontal },
];

export const OPS_COMPONENTS = {
  verification: VerificationTab,
  moderation:   ModerationTab,
  money:        MoneyTab,
  audit:        AuditTab,
  controls:     ControlsTab,
};
