import React from "react";
import { motion } from "framer-motion";
import {
  Link2, Lock, RefreshCw, DoorOpen, ArrowRight, Wallet,
  Smartphone, MapPin, Calendar, Quote, User, ShieldCheck,
  Search, ScanLine, ChevronDown,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { eventsAPI } from "../../api";
import { NavBar } from "./shared";

const NAVY = "#1c2e53";
const NAVY_PASTEL = "#EBEEF5";
const SORA = { fontFamily: "'Sora', sans-serif" };
const BACKEND = "https://master-events-backend.onrender.com";

const HERO_TICKET_IMAGE = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=90";

// ── Signature card shell — asymmetric corner shape only now.
// The navy corner tab was removed per feedback: repeated across many
// cards on one page it read as a decorative sticker rather than a
// considered design element. The 32px/8px asymmetric radius alone is
// distinctive enough to carry the "signature" identity. ──
function SignatureCard({ children, className = "", noPad = false }) {
  return (
    <div
      className={`relative bg-brand-card border border-gray-100 shadow-sm overflow-hidden ${noPad ? "" : "p-6"} ${className}`}
      style={{ borderTopLeftRadius: "32px", borderTopRightRadius: "8px", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}
    >
      {children}
    </div>
  );
}

function MutedBarChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-3 h-28 mt-5">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(v / max) * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
            className="w-full rounded-t-md"
            style={{ background: "linear-gradient(180deg, #C7CDD9 0%, #E5E8EE 100%)", minHeight: v > 0 ? "6px" : "0" }}
          />
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wide">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function MutedRing({ pct, size = 84 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF0F4" strokeWidth="8" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={NAVY} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

const FEATURES = [
  { Icon: Link2,     title: "NFT Tickets on Polygon",   body: "Every ticket is minted on the blockchain — impossible to fake, permanently yours." },
  { Icon: Wallet,    title: "95% Payout to Organizers", body: "We charge only 5%. The rest goes straight to your MoMo wallet — withdraw anytime." },
  { Icon: Smartphone,title: "MoMo & VISA Payments",     body: "Pay however suits you. Mobile money, cards, and more — fast and secure." },
  { Icon: Lock,      title: "HMAC-Secured QR Codes",    body: "Dynamic QR codes refresh every 10 seconds — screenshot-proof and forgery-resistant." },
  { Icon: RefreshCw, title: "Ticket Resale Market",     body: "List your ticket for resale at any price. Only 2% fee — you keep 98%." },
  { Icon: DoorOpen,  title: "Smart Door Scanning",      body: "Generate invite codes for door staff. Scan QR tickets in seconds at the gate." },
];

const STEPS = [
  { Icon: Search,    n: "01", title: "Choose an event",    body: "Browse verified listings and select the ticket type that works for you." },
  { Icon: Wallet,    n: "02", title: "Buy your ticket",    body: "Complete checkout and your ticket mints straight to your account." },
  { Icon: ScanLine,  n: "03", title: "Show up and scan",   body: "Your ticket is checked at entry, with blockchain verification behind the scenes." },
];

const FAQS = [
  { q: "What makes a ticket blockchain-verified?", a: "Every ticket is minted as an NFT on Polygon — a permanent, tamper-proof record of who owns it, checkable independently of Master Events itself." },
  { q: "Do I need to understand blockchain to use this?", a: "No. Buying, holding, and using a ticket feels exactly like any other app — the blockchain layer runs quietly in the background." },
  { q: "How do organizers receive payouts?", a: "Revenue goes straight to Mobile Money — organizers keep 95% of every sale, with instant visibility into what's landed in their wallet." },
  { q: "Can door staff verify tickets without a full account?", a: "Yes. Organizers generate single-use door staff codes with scan-only access — no full account or app download required for door staff." },
  { q: "Can I resell or transfer a ticket I bought?", a: "Yes. List it on the built-in resale market (2% fee, you keep 98%), or transfer it directly to a friend for free — ownership updates on-chain instantly either way." },
];

const TESTIMONIALS = [
  { name: "Kwame Asante", role: "Event Organizer · Accra",   quote: "Master Events gave us one place to manage tickets, door staff, and payments. We received 95% of revenue directly to MoMo — no delays." },
  { name: "Ama Owusu",    role: "Concert Attendee · Kumasi", quote: "I love that my ticket is an NFT — I can transfer it to my friend and it just works. No more fake tickets at the gate." },
  { name: "Kofi Mensah",  role: "Tech Conference Organizer", quote: "The blockchain verification at the door was seamless. Our door staff just scanned QR codes and it told them instantly if the ticket was valid." },
];

const FOOTER_COLS = [
  { title: "Platform", links: [["Browse Events", "events"], ["Create Event", "signup"], ["Resale Market", "#"]] },
  { title: "Company",  links: [["About", "about"], ["Contact", "mailto:mastereventgh@gmail.com"]] },
  { title: "Legal",    links: [["Privacy", "#"], ["Terms", "#"], ["Security", "#"]] },
];

const ORG_FEATURES = [
  { Icon: Wallet,     label: "Instant MoMo payouts" },
  { Icon: Link2,      label: "NFT-backed tickets" },
  { Icon: Smartphone, label: "MoMo & card payments" },
  { Icon: RefreshCw,  label: "Built-in resale market" },
];

function TicketMock() {
  return (
    <SignatureCard noPad className="shadow-lg">
      <div className="h-36 md:h-40 relative bg-gray-100">
        <img src={HERO_TICKET_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-text/90 text-white text-[10px] font-bold tracking-wide">MUSIC</div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-card/95 text-brand-text text-[10px] font-bold">
          <Link2 size={10} strokeWidth={2} style={{ color: NAVY }} /> NFT
        </div>
      </div>

      <div className="relative h-0">
        <div className="absolute -top-px left-3 right-3 border-t-2 border-dashed border-gray-200" />
        <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-brand-canvas" />
        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-brand-canvas" />
      </div>

      <div className="p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-bold text-brand-text text-[15px] mb-1 truncate" style={SORA}>Afrobeats Night</div>
          <div className="text-xs text-brand-muted mb-3">Sat, Aug 22 · The Grand Arena</div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} strokeWidth={2} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-600">Verified on-chain</span>
          </div>
          <div className="text-[10px] font-mono text-brand-muted mt-1.5">0x8f3a…e21c</div>
        </div>

        <div className="shrink-0 w-16 h-16 rounded-xl bg-white border border-gray-100 p-1.5 flex items-center justify-center">
          <QRCodeSVG value="MASTER-EVENTS:demo:001" size={52} bgColor="#ffffff" fgColor="#121212" level="M" />
        </div>
      </div>
    </SignatureCard>
  );
}

function EventCard({ ev, catImg, onSignup }) {
  return (
    <div onClick={onSignup} className="cursor-pointer">
      <SignatureCard noPad className="hover:shadow-md transition-shadow">
        <div className="h-[170px] relative bg-gray-100">
          {ev ? (
            <>
              <img src={ev.image || catImg[ev.category] || catImg.other} alt={ev.name} className="w-full h-full object-cover" onError={e => { e.target.src = catImg.other; }} />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-white text-[10px] font-bold" style={{ background: NAVY }}>{ev.category}</div>
              {parseFloat(ev.price) === 0 && (
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-brand-card text-brand-text text-[10px] font-bold border border-gray-100">FREE</div>
              )}
              <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-brand-text px-2 py-1 rounded-full">
                <Link2 size={10} strokeWidth={2} color="#fff" />
                <span className="text-[9px] font-bold text-white font-mono">NFT</span>
              </div>
            </>
          ) : <div className="skeleton absolute inset-0 rounded-none" />}
        </div>
        <div className="p-4">
          {ev ? (
            <>
              <div className="font-bold text-[15px] text-brand-text mb-1.5 leading-snug" style={SORA}>{ev.name}</div>
              <div className="flex items-center gap-1 text-xs text-brand-muted mb-3.5">
                <Calendar size={12} strokeWidth={1.75} /> {ev.date} <span className="mx-0.5">·</span> <MapPin size={12} strokeWidth={1.75} /> {ev.venue}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-base" style={{ color: NAVY }}>{parseFloat(ev.price) === 0 ? "FREE" : "GHS " + ev.price}</span>
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-full text-white text-xs font-bold transition-colors" style={{ background: NAVY }}>
                  Get Tickets
                </motion.span>
              </div>
            </>
          ) : (
            <>
              <div className="skeleton h-[15px] w-4/5 mb-2" />
              <div className="skeleton h-3 w-3/5 mb-3.5" />
              <div className="skeleton h-3.5 w-2/5" />
            </>
          )}
        </div>
      </SignatureCard>
    </div>
  );
}

function FAQItem({ q, a, open, onClick }) {
  return (
    <div className="bg-brand-card rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-bold text-[14px] text-brand-text pr-4">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0">
          <ChevronDown size={16} strokeWidth={2} className="text-gray-400" />
        </motion.span>
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="px-5 pb-4 text-[13px] text-brand-muted leading-relaxed">
          {a}
        </motion.div>
      )}
    </div>
  );
}

export default function LandingPage({ onNavigate }) {
  const [events, setEvents] = React.useState([]);
  const [eventsLoading, setEventsLoading] = React.useState(true);
  const [eventsFailed, setEventsFailed] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState(0);
  // ── NEW: real platform stats, replacing the previous hardcoded
  // "GHS 24.8K" / "+18.6%" / "94%" placeholder numbers on the Revenue
  // Tracker. Falls back gracefully to a loading/empty state rather
  // than ever showing fake numbers if the fetch fails. ──
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    eventsAPI.list()
      .then(data => setEvents(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => setEventsFailed(true))
      .finally(() => setEventsLoading(false));

    fetch(`${BACKEND}/api/tickets/platform-stats/`)
      .then(r => r.json())
      .then(data => { if (data && !data.error) setStats(data); })
      .catch(() => {});
  }, []);

  const catImg = {
    music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
    food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
    sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
    business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
    other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
  };

  const mintPct = stats && stats.total_tickets > 0
    ? Math.round((stats.total_minted / stats.total_tickets) * 100)
    : null;

  return (
    <div className="min-h-screen bg-brand-canvas font-sans">
      <NavBar onNavigate={onNavigate} />

      {/* ── Hero ── */}
      <section className="bg-brand-canvas">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider mb-6" style={{ background: NAVY_PASTEL, color: NAVY }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: NAVY }} />
              LIVE BLOCKCHAIN VERIFICATION
            </div>

            <h1 className="text-[40px] md:text-6xl font-extrabold leading-[1.02] tracking-tight text-brand-text mb-5" style={SORA}>
              Every ticket,<br />
              <span style={{ color: NAVY }}>provably yours.</span>
            </h1>

            <p className="text-[15px] md:text-lg text-brand-muted leading-relaxed mb-8 max-w-[480px]">
              From music festivals to tech summits — discover, buy, and own every ticket as a verifiable NFT on the blockchain.
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold text-sm md:text-base transition-colors" style={{ background: NAVY }}>
                Browse Events <ArrowRight size={16} strokeWidth={2} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("signup")}
                className="px-7 py-3.5 rounded-full bg-brand-card border border-gray-200 text-brand-text font-bold text-sm md:text-base hover:border-gray-300 transition-colors">
                Create Event
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute inset-0 rounded-3xl bg-brand-card border border-gray-100 rotate-6 translate-x-4 translate-y-3" />
            <div className="relative">
              <TicketMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Events ── */}
      <section id="events" className="bg-brand-canvas">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
            <div>
              <div className="text-[10px] font-bold tracking-widest mb-2 font-mono" style={{ color: NAVY }}>UPCOMING EVENTS</div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-brand-text" style={SORA}>Happening near you</h2>
            </div>
            <span onClick={() => onNavigate("signup")} className="text-sm font-bold cursor-pointer flex items-center gap-1" style={{ color: NAVY }}>
              View all <ArrowRight size={14} strokeWidth={2} />
            </span>
          </div>
          {eventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(null).map((ev, i) => (
                <EventCard key={i} ev={ev} catImg={catImg} onSignup={() => onNavigate("signup")} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map(ev => (
                <EventCard key={ev.id} ev={ev} catImg={catImg} onSignup={() => onNavigate("signup")} />
              ))}
            </div>
          ) : (
            <SignatureCard className="text-center">
              <p className="text-sm text-brand-muted">
                {eventsFailed ? "Couldn't load events right now — please check back shortly." : "No upcoming events yet — check back soon."}
              </p>
            </SignatureCard>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-brand-canvas border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>WHY MASTER EVENTS</div>
            <h2 className="text-2xl md:text-[38px] font-extrabold tracking-tight text-brand-text" style={SORA}>Ticketing, rebuilt from the ground up.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <SignatureCard key={f.title}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: NAVY_PASTEL }}>
                  <f.Icon size={20} strokeWidth={1.75} style={{ color: NAVY }} />
                </div>
                <div className="font-bold text-[15px] text-brand-text mb-2" style={SORA}>{f.title}</div>
                <div className="text-[13px] text-brand-muted leading-relaxed">{f.body}</div>
              </SignatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="bg-brand-canvas">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>HOW IT WORKS</div>
            <h2 className="text-2xl md:text-[38px] font-extrabold tracking-tight text-brand-text" style={SORA}>
              Simple on the surface. Secure underneath.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(s => (
              <SignatureCard key={s.n}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: NAVY_PASTEL }}>
                    <s.Icon size={19} strokeWidth={1.75} style={{ color: NAVY }} />
                  </div>
                  <span className="text-2xl font-extrabold font-mono" style={{ color: NAVY, opacity: 0.2 }}>{s.n}</span>
                </div>
                <div className="font-bold text-[15px] text-brand-text mb-2" style={SORA}>{s.title}</div>
                <div className="text-[13px] text-brand-muted leading-relaxed">{s.body}</div>
              </SignatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Revenue Tracker — now real, seeded platform stats instead
      of hardcoded placeholder numbers ── */}
      <section className="bg-brand-canvas border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>ON-CHAIN, VERIFIABLE</div>
            <h2 className="text-2xl md:text-[38px] font-extrabold tracking-tight text-brand-text mb-4" style={SORA}>
              Every ticket, tracked<br />on Polygon.
            </h2>
            <p className="text-[15px] text-brand-muted leading-relaxed max-w-[420px] mb-5">
              Real numbers, not marketing copy. This is our actual mint activity on the Polygon Amoy network — check it yourself.
            </p>
            {stats?.contract_address && (
              <a href={`https://amoy.polygonscan.com/address/${stats.contract_address}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-bold font-mono transition-colors"
                style={{ background: NAVY_PASTEL, color: NAVY }}>
                <Link2 size={13} strokeWidth={2} />
                {stats.contract_address.slice(0, 6)}…{stats.contract_address.slice(-4)}
                <ArrowRight size={12} strokeWidth={2} />
              </a>
            )}
          </div>

          <SignatureCard noPad>
            <div className="p-6">
              <div className="text-[10px] font-bold tracking-widest font-mono text-gray-400 mb-1">LIVE PLATFORM STATS</div>
              <h3 className="font-extrabold text-[19px] mb-1" style={SORA}>Mint Activity</h3>
              <p className="text-[12px] text-brand-muted mb-5">Pulled directly from our backend — updates as tickets sell.</p>

              <div className="bg-brand-canvas rounded-2xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">Tickets Minted</span>
                  {stats?.total_events != null && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{stats.total_events} events</span>
                  )}
                </div>
                <div className="text-[26px] font-extrabold tracking-tight" style={SORA}>
                  {stats ? stats.total_minted.toLocaleString() : "—"}
                </div>
                {stats?.recent_daily && (
                  <MutedBarChart data={stats.recent_daily.map(d => d.count)} labels={stats.recent_daily.map(d => d.label)} />
                )}
              </div>

              <div className="flex items-center gap-5 mt-5">
                <MutedRing pct={mintPct ?? 0} />
                <div>
                  <div className="text-[22px] font-extrabold tracking-tight" style={SORA}>{mintPct != null ? `${mintPct}%` : "—"}</div>
                  <div className="text-[11px] text-brand-muted">Successful mint rate</div>
                </div>
              </div>
            </div>
          </SignatureCard>
        </div>
      </section>

      {/* ── Organizer CTA ── */}
      <section id="organizers" className="bg-brand-canvas">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <SignatureCard className="md:p-14 flex justify-between items-center flex-wrap gap-8">
            <div className="max-w-[520px]">
              <div className="text-[10px] font-bold tracking-widest mb-3.5 font-mono" style={{ color: NAVY }}>FOR EVENT ORGANIZERS</div>
              <h2 className="text-2xl md:text-[38px] font-extrabold text-brand-text tracking-tight leading-tight mb-3.5" style={SORA}>Ready to host<br />your next event?</h2>
              <p className="text-[15px] text-brand-muted leading-relaxed mb-7">Create events, sell blockchain-verified tickets, manage door staff, and receive 95% directly to your MoMo wallet.</p>
              <div className="flex gap-3 flex-wrap">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("signup")}
                  className="px-6 py-3 rounded-full text-white font-bold text-sm transition-colors" style={{ background: NAVY }}>
                  Start Selling Tickets
                </motion.button>
                <button onClick={() => onNavigate("about")}
                  className="px-6 py-3 rounded-full bg-brand-card border border-gray-200 text-brand-text font-semibold text-sm hover:border-gray-300 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 shrink-0">
              {ORG_FEATURES.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-brand-canvas">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: NAVY_PASTEL }}>
                    <Icon size={15} strokeWidth={1.75} style={{ color: NAVY }} />
                  </div>
                  <span className="text-xs font-semibold text-brand-text whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </SignatureCard>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-brand-canvas border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>WHAT PEOPLE SAY</div>
            <h2 className="text-xl md:text-[32px] font-extrabold tracking-tight text-brand-text" style={SORA}>Loved by organizers and fans</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <SignatureCard key={t.name}>
                <Quote size={26} strokeWidth={1.75} className="mb-3.5" style={{ color: NAVY }} fill="currentColor" fillOpacity={0.12} />
                <p className="text-sm text-brand-muted leading-relaxed mb-4.5">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: NAVY_PASTEL, color: NAVY }}>
                    <User size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-brand-text">{t.name}</div>
                    <div className="text-[11px] text-brand-muted mt-0.5">{t.role}</div>
                  </div>
                </div>
              </SignatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-brand-canvas border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-[0.8fr_1.2fr] gap-14">
          <div>
            <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>FAQ</div>
            <h2 className="text-2xl md:text-[32px] font-extrabold tracking-tight text-brand-text" style={SORA}>
              Clear answers before checkout.
            </h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {FAQS.map((f, i) => (
              <FAQItem key={f.q} q={f.q} a={f.a} open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-brand-card border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-9 pb-6 md:pt-14 md:pb-9">
          <div className="flex justify-between items-start flex-wrap gap-8 mb-9">
            <div className="max-w-[260px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
                  <Link2 size={14} strokeWidth={2} color="#fff" />
                </div>
                <span className="font-extrabold text-[15px] text-brand-text tracking-tight" style={SORA}>Master Events</span>
              </div>
              <p className="text-[13px] text-brand-muted leading-relaxed">Blockchain-powered event ticketing — proudly built in Ghana.</p>
            </div>
            <div className="flex gap-12 flex-wrap">
              {FOOTER_COLS.map(col => (
                <div key={col.title}>
                  <div className="font-bold text-[11px] tracking-wider text-brand-muted mb-3 uppercase font-mono">{col.title}</div>
                  {col.links.map(([label, href]) => (
                    <div key={label} className="mb-2.5">
                      <span
                        onClick={() => {
                          if (href.startsWith("#") || href.startsWith("mailto")) return;
                          if (["events"].includes(href)) {
                            onNavigate("home");
                            setTimeout(() => document.querySelector(`#${href}`)?.scrollIntoView({ behavior: "smooth" }), 60);
                          } else {
                            onNavigate(href);
                          }
                        }}
                        className="text-[13px] text-brand-muted hover:text-brand-text cursor-pointer transition-colors">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-5">
            <span className="text-xs text-brand-muted font-mono">© 2026 Master Events · Secured by Polygon Blockchain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}