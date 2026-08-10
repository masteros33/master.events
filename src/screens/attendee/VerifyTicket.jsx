import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Calendar, MapPin, Ticket, Link2, ExternalLink,
  XCircle, Loader2, User, AlertTriangle,
} from "lucide-react";

const NAVY = "#1c2e53";
const NAVY_PASTEL = "#EBEEF5";
const SORA = { fontFamily: "'Sora', sans-serif" };
const BACKEND = "https://master-events-backend.onrender.com";

function SignatureCard({ children, className = "" }) {
  return (
    <div
      className={`relative bg-white border border-gray-100 shadow-sm overflow-hidden p-6 ${className}`}
      style={{ borderTopLeftRadius: "32px", borderTopRightRadius: "8px", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}
    >
      <div className="absolute top-0 left-0 w-3 h-10 z-10" style={{ background: NAVY, borderTopLeftRadius: "32px", borderBottomRightRadius: "10px" }} />
      {children}
    </div>
  );
}

const STATUS_STYLES = {
  active:      { label: "Active",     color: "#16a34a", bg: "#EDFBF3" },
  resale:      { label: "On Resale",  color: NAVY,       bg: NAVY_PASTEL },
  redeemed:    { label: "Redeemed",   color: "#6b7280", bg: "#F3F4F6" },
  transferred: { label: "Transferred",color: "#2563eb", bg: "#EEF2FF" },
  refunded:    { label: "Refunded",   color: "#dc2626", bg: "#FEF2F2" },
};

export default function VerifyTicket({ ticketId, onDone }) {
  const [loading, setLoading] = React.useState(true);
  const [data,    setData]    = React.useState(null);
  const [error,   setError]   = React.useState(null);

  React.useEffect(() => {
    if (!ticketId) { setError("No ticket ID provided"); setLoading(false); return; }
    fetch(`${BACKEND}/api/tickets/verify/${encodeURIComponent(ticketId)}/`)
      .then(r => r.json().then(body => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (ok && body.valid) setData(body);
        else setError(body.reason || "This ticket could not be verified.");
      })
      .catch(() => setError("Connection error — please try again."))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const statusMeta = data ? (STATUS_STYLES[data.status] || STATUS_STYLES.active) : null;

  return (
    <div className="min-h-screen bg-brand-canvas font-sans flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-5 h-[68px] flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: NAVY }}>
          <Ticket size={17} strokeWidth={2} color="#fff" />
        </div>
        <span className="font-extrabold text-[17px]" style={SORA}>Master Events</span>
        <span className="ml-auto text-[10px] font-bold tracking-widest font-mono text-gray-400">TICKET VERIFICATION</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[440px]">

          {loading && (
            <SignatureCard className="text-center py-14">
              <Loader2 size={28} className="mx-auto mb-4 animate-spin" style={{ color: NAVY }} />
              <p className="text-sm text-brand-muted">Checking ticket on-chain…</p>
            </SignatureCard>
          )}

          {!loading && error && (
            <SignatureCard className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle size={26} strokeWidth={1.75} className="text-red-500" />
              </div>
              <h1 className="text-lg font-extrabold text-brand-text mb-2" style={SORA}>Not Verified</h1>
              <p className="text-sm text-brand-muted leading-relaxed">{error}</p>
            </SignatureCard>
          )}

          {!loading && data && (
            <>
              {/* Success banner */}
              <div className="flex items-center gap-3 mb-4 px-4 py-3.5 rounded-2xl" style={{ background: NAVY_PASTEL }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                  <ShieldCheck size={17} strokeWidth={2} color="#fff" />
                </div>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: NAVY }}>Verified Authentic</div>
                  <div className="text-[11px] text-brand-muted mt-0.5">This ticket is a real Master Events record</div>
                </div>
              </div>

              <SignatureCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest font-mono text-gray-400 mb-1.5">EVENT</div>
                    <h1 className="text-[19px] font-extrabold text-brand-text leading-snug" style={SORA}>{data.event_name}</h1>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-full font-mono"
                    style={{ color: statusMeta.color, background: statusMeta.bg }}>
                    {statusMeta.label.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[13px] text-brand-muted mb-1.5">
                  <Calendar size={13} strokeWidth={1.75} /> {data.event_date}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-brand-muted mb-5">
                  <MapPin size={13} strokeWidth={1.75} /> {data.event_venue}{data.event_city ? `, ${data.event_city}` : ""}
                </div>

                <div className="h-px bg-gray-100 mb-5" />

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="text-[9px] font-bold tracking-widest font-mono text-gray-400 mb-1">TICKET ID</div>
                    <div className="text-[12px] font-mono text-brand-text truncate">{data.ticket_id}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-widest font-mono text-gray-400 mb-1">QUANTITY</div>
                    <div className="text-[12px] font-semibold text-brand-text">{data.quantity}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-widest font-mono text-gray-400 mb-1">HOLDER</div>
                    <div className="text-[12px] font-semibold text-brand-text flex items-center gap-1">
                      <User size={11} strokeWidth={1.75} /> {data.holder}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-widest font-mono text-gray-400 mb-1">ORIGIN</div>
                    <div className="text-[12px] font-semibold text-brand-text">{data.is_resale ? "Resale / Transfer" : "Original Purchase"}</div>
                  </div>
                </div>

                {/* Blockchain status */}
                {data.nft_minted ? (
                  <a href={data.blockchain_url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl transition-colors hover:opacity-90"
                    style={{ background: NAVY }}>
                    <div className="flex items-center gap-2.5">
                      <Link2 size={16} strokeWidth={2} color="#fff" />
                      <div>
                        <div className="text-[12px] font-bold text-white">Minted on Polygon</div>
                        {data.nft_token_id && <div className="text-[10px] text-white/60 font-mono">Token #{data.nft_token_id}</div>}
                      </div>
                    </div>
                    <ExternalLink size={14} strokeWidth={2} color="#fff" className="shrink-0" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50">
                    <AlertTriangle size={16} strokeWidth={1.75} className="text-amber-600" />
                    <div className="text-[12px] font-semibold text-amber-700">NFT minting in progress — check back shortly</div>
                  </div>
                )}
              </SignatureCard>

              <p className="text-center text-[11px] text-brand-muted mt-5 leading-relaxed">
                This page confirms authenticity only. It does not grant entry or transfer ownership.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}