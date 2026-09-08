import React from "react";
import { motion } from "framer-motion";
import {
  Link, Lock, ArrowsClockwise, DoorOpen, ArrowRight, Wallet,
  DeviceMobile, MapPin, Calendar, Quotes, User, ShieldCheck,
  MagnifyingGlass, Scan, CaretDown,
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { eventsAPI } from "../../api";
import { formatDate } from "../../utils/formatDate";
import { NavBar } from "./shared";

const BACKEND = "https://master-events-backend.onrender.com";

const HERO_TICKET_IMAGE = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=90";

// ── Plain fintech card: white surface, hairline border, radius 16,
// no shadow at rest. Hover shadow only applies when the card is
// clickable (onClick present) — shadow is a state, not a resting style. ──
function Card({ children, className = "", noPad = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-brand-card border border-brand-hairline rounded-2xl overflow-hidden ${noPad ? "" : "p-6"} ${onClick ? "cursor-pointer hover:shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Pill/badge: radius 999, 28px tall, 13px text, hairline border,
// accent-tinted background at 8% opacity — the standalone-badge
// pattern, not the image-overlay tags (those need solid backgrounds
// for legibility over a photo, handled separately below). ──
function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-brand-hairline text-[13px] font-medium text-brand-accent ${className}`}
      style={{ background: "var(--brand-light)" }}
    >
      {children}
    </span>
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
            style={{ background: "linear-gradient(180deg, var(--border-strong) 0%, var(--bg-subtle) 100%)", minHeight: v > 0 ? "6px" : "0" }}
          />
          <span className="text-xs font-medium text-brand-muted uppercase tracking-wide">{labels[i]}</span>
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--brand)" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * pct) / 100 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

const FEATURES = [
  { Icon: Link,            title: "NFT Tickets on Polygon",   body: "Every ticket is minted on the blockchain — impossible to fake, permanently yours." },
  { Icon: Wallet,          title: "95% Payout to Organizers", body: "We charge only 5%. The rest goes straight to your MoMo wallet — withdraw anytime." },
  { Icon: DeviceMobile,    title: "MoMo & VISA Payments",     body: "Pay however suits you. Mobile money, cards, and more — fast and secure." },
  { Icon: Lock,            title: "HMAC-Secured QR Codes",    body: "Dynamic QR codes refresh every 10 seconds — screenshot-proof and forgery-resistant." },
  { Icon: ArrowsClockwise, title: "Ticket Resale Market",     body: "List your ticket for resale at any price. Only 2% fee — you keep 98%." },
  { Icon: DoorOpen,        title: "Smart Door Scanning",      body: "Generate invite codes for door staff. Scan QR tickets in seconds at the gate." },
];

const STEPS = [
  { Icon: MagnifyingGlass, n: "01", title: "Choose an event",  body: "Browse verified listings and select the ticket type that works for you." },
  { Icon: Wallet,          n: "02", title: "Buy your ticket",  body: "Complete checkout and your ticket mints straight to your account." },
  { Icon: Scan,            n: "03", title: "Show up and scan", body: "Your ticket is checked at entry, with blockchain verification behind the scenes." },
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
  { Icon: Wallet,          label: "Instant MoMo payouts" },
  { Icon: Link,            label: "NFT-backed tickets" },
  { Icon: DeviceMobile,    label: "MoMo & card payments" },
  { Icon: ArrowsClockwise, label: "Built-in resale market" },
];

function TicketMock() {
  return (
    <Card noPad className="shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="h-36 md:h-40 relative bg-gray-100">
        <img src={HERO_TICKET_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-text/90 text-white text-xs font-medium tracking-wide">MUSIC</div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-card/95 text-brand-text text-xs font-medium">
          <Link size={10} weight="light" className="text-brand-accent" /> NFT
        </div>
      </div>

      <div className="relative h-0">
        <div className="absolute -top-px left-3 right-3 border-t-2 border-dashed border-brand-hairline" />
        <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-brand-canvas" />
        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-brand-canvas" />
      </div>

      <div className="p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-medium text-brand-text text-[15px] mb-1 truncate">Afrobeats Night</div>
          <div className="text-xs text-brand-muted mb-3">Sat, Aug 22 · The Grand Arena</div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} weight="light" className="text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">Verified on-chain</span>
          </div>
          <div className="text-xs font-mono text-brand-muted mt-1.5 tabular-nums">0x8f3a…e21c</div>
        </div>

        <div className="shrink-0 w-16 h-16 rounded-xl bg-white border border-brand-hairline p-1.5 flex items-center justify-center">
          <QRCodeSVG value="MASTER-EVENTS:demo:001" size={52} bgColor="#ffffff" fgColor="var(--text-primary)" level="M" />
        </div>
      </div>
    </Card>
  );
}

function EventCard({ ev, catImg, onSignup }) {
  return (
    <Card noPad onClick={onSignup}>
      <div className="h-[170px] relative bg-gray-100">
        {ev ? (
          <>
            <img src={ev.image || catImg[ev.category] || catImg.other} alt={ev.name} className="w-full h-full object-cover" onError={e => { e.target.src = catImg.other; }} />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-brand-accent text-white text-xs font-medium">{ev.category}</div>
            {parseFloat(ev.price) === 0 && (
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-brand-card text-brand-text text-xs font-medium border border-brand-hairline">FREE</div>
            )}
            <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-brand-text px-2 py-1 rounded-full">
              <Link size={10} weight="light" color="#fff" />
              <span className="text-xs font-medium text-white font-mono">NFT</span>
            </div>
          </>
        ) : <div className="skeleton absolute inset-0 rounded-none" />}
      </div>
      <div className="p-4">
        {ev ? (
          <>
            <div className="font-medium text-[15px] text-brand-text mb-1.5 leading-snug">{ev.name}</div>
            <div className="flex items-center gap-1 text-xs text-brand-muted mb-3.5 tabular-nums">
              <Calendar size={12} weight="light" /> {formatDate(ev.date)} <span className="mx-0.5">·</span> <MapPin size={12} weight="light" /> {ev.venue}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-[17px] text-brand-accent tabular-nums">{parseFloat(ev.price) === 0 ? "FREE" : "GHS " + ev.price}</span>
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-xl text-white text-xs font-medium bg-brand-accent hover:bg-brand-accent-hover transition-colors">
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
    </Card>
  );
}

function FAQItem({ q, a, open, onClick }) {
  return (
    <div className="bg-brand-card rounded-2xl border border-brand-hairline overflow-hidden">
      <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-4 text-left" aria-expanded={open}>
        <span className="font-medium text-[15px] text-brand-text pr-4">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} className="shrink-0">
          <CaretDown size={16} weight="light" className="text-brand-muted" />
        </motion.span>
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.18 }}
          className="px-5 pb-4 text-[15px] text-brand-muted leading-relaxed">
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
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <Pill className="mb-6 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" />
              LIVE BLOCKCHAIN VERIFICATION
            </Pill>

            <h1 className="text-[30px] md:text-5xl font-semibold leading-[1.1] tracking-[-0.02em] text-brand-text mb-5">
              Every ticket,<br />
              <span className="text-brand-accent">provably yours.</span>
            </h1>

            <p className="text-[15px] md:text-lg text-brand-muted leading-relaxed mb-8 max-w-[480px]">
              From music festivals to tech summits — discover, buy, and own every ticket as a verifiable NFT on the blockchain.
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 px-7 h-12 md:h-11 rounded-xl text-white font-medium text-sm md:text-base bg-brand-accent hover:bg-brand-accent-hover transition-colors">
                Browse Events <ArrowRight size={16} weight="light" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("signup")}
                className="flex items-center justify-center px-7 h-12 md:h-11 rounded-xl bg-brand-card border border-brand-hairline text-brand-text font-medium text-sm md:text-base hover:border-gray-300 transition-colors">
                Create Event
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute inset-0 rounded-2xl bg-brand-card border border-brand-hairline rotate-6 translate-x-4 translate-y-3" />
            <div className="relative">
              <TicketMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Events ── */}
      <section id="events" className="bg-brand-canvas">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
            <div>
              <div className="text-xs font-medium tracking-widest mb-2 text-brand-accent">UPCOMING EVENTS</div>
              <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-brand-text">Happening near you</h2>
            </div>
            <span onClick={() => onNavigate("signup")} className="text-sm font-medium text-brand-accent cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={14} weight="light" />
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
            <Card className="text-center">
              <p className="text-sm text-brand-muted">
                {eventsFailed ? "Couldn't load events right now — please check back shortly." : "No upcoming events yet — check back soon."}
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-brand-canvas border-y border-brand-hairline">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="text-xs font-medium tracking-widest mb-3 text-brand-accent">WHY MASTER EVENTS</div>
            <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-brand-text">Ticketing, rebuilt from the ground up.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <Card key={f.title}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--brand-light)" }}>
                  <f.Icon size={20} weight="light" className="text-brand-accent" />
                </div>
                <div className="font-medium text-[15px] text-brand-text mb-2">{f.title}</div>
                <div className="text-[13px] text-brand-muted leading-relaxed">{f.body}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="bg-brand-canvas">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="text-xs font-medium tracking-widest mb-3 text-brand-accent">HOW IT WORKS</div>
            <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-brand-text">
              Simple on the surface. Secure underneath.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(s => (
              <Card key={s.n}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "var(--brand-light)" }}>
                    <s.Icon size={19} weight="light" className="text-brand-accent" />
                  </div>
                  <span className="text-2xl font-semibold font-mono text-brand-accent opacity-20 tabular-nums">{s.n}</span>
                </div>
                <div className="font-medium text-[15px] text-brand-text mb-2">{s.title}</div>
                <div className="text-[13px] text-brand-muted leading-relaxed">{s.body}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Revenue Tracker — real, seeded platform stats ── */}
      <section className="bg-brand-canvas border-t border-brand-hairline">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <div className="text-xs font-medium tracking-widest mb-3 text-brand-accent">ON-CHAIN, VERIFIABLE</div>
            <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-brand-text mb-4">
              Every ticket, tracked<br />on Polygon.
            </h2>
            <p className="text-[15px] text-brand-muted leading-relaxed max-w-[420px] mb-5">
              Real numbers, not marketing copy. This is our actual mint activity on the Polygon Amoy network — check it yourself.
            </p>
            {stats?.contract_address && (
              <a href={`https://amoy.polygonscan.com/address/${stats.contract_address}`} target="_blank" rel="noreferrer">
                <Pill className="font-mono tabular-nums">
                  <Link size={13} weight="light" />
                  {stats.contract_address.slice(0, 6)}…{stats.contract_address.slice(-4)}
                  <ArrowRight size={12} weight="light" />
                </Pill>
              </a>
            )}
          </div>

          <Card noPad>
            <div className="p-6">
              <div className="text-xs font-medium tracking-widest text-brand-muted mb-1">LIVE PLATFORM STATS</div>
              <h3 className="font-medium text-[20px] mb-1">Mint Activity</h3>
              <p className="text-xs text-brand-muted mb-5">Pulled directly from our backend — updates as tickets sell.</p>

              <div className="bg-brand-canvas rounded-2xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-brand-muted uppercase tracking-wide">Tickets Minted</span>
                  {stats?.total_events != null && (
                    <span className="text-xs font-medium tabular-nums px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{stats.total_events} events</span>
                  )}
                </div>
                <div className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stats ? stats.total_minted.toLocaleString() : "—"}
                </div>
                {stats?.recent_daily && (
                  <MutedBarChart data={stats.recent_daily.map(d => d.count)} labels={stats.recent_daily.map(d => d.label)} />
                )}
              </div>

              <div className="flex items-center gap-5 mt-5">
                <MutedRing pct={mintPct ?? 0} />
                <div>
                  <div className="text-2xl font-semibold tracking-tight tabular-nums">{mintPct != null ? `${mintPct}%` : "—"}</div>
                  <div className="text-xs text-brand-muted">Successful mint rate</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Organizer CTA ── */}
      <section id="organizers" className="bg-brand-canvas">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20">
          <Card className="md:p-14 flex justify-between items-center flex-wrap gap-8">
            <div className="max-w-[520px]">
              <div className="text-xs font-medium tracking-widest mb-3.5 text-brand-accent">FOR EVENT ORGANIZERS</div>
              <h2 className="text-2xl md:text-4xl font-medium text-brand-text tracking-tight leading-tight mb-3.5">Ready to host<br />your next event?</h2>
              <p className="text-[15px] text-brand-muted leading-relaxed mb-7">Create events, sell blockchain-verified tickets, manage door staff, and receive 95% directly to your MoMo wallet.</p>
              <div className="flex gap-3 flex-wrap">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("signup")}
                  className="flex items-center justify-center px-6 h-12 md:h-11 rounded-xl text-white font-medium text-sm bg-brand-accent hover:bg-brand-accent-hover transition-colors">
                  Start Selling Tickets
                </motion.button>
                <button onClick={() => onNavigate("about")}
                  className="flex items-center justify-center px-6 h-12 md:h-11 rounded-xl bg-brand-card border border-brand-hairline text-brand-text font-medium text-sm hover:border-gray-300 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 shrink-0">
              {ORG_FEATURES.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-brand-canvas">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--brand-light)" }}>
                    <Icon size={15} weight="light" className="text-brand-accent" />
                  </div>
                  <span className="text-xs font-medium text-brand-text whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-brand-canvas border-t border-brand-hairline">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <div className="text-xs font-medium tracking-widest mb-3 text-brand-accent">WHAT PEOPLE SAY</div>
            <h2 className="text-xl md:text-[32px] font-medium tracking-tight text-brand-text">Loved by organizers and fans</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <Card key={t.name}>
                <Quotes size={26} weight="light" className="mb-3.5 text-brand-accent" />
                <p className="text-sm text-brand-muted leading-relaxed mb-4.5">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium shrink-0 text-brand-accent" style={{ background: "var(--brand-light)" }}>
                    <User size={18} weight="light" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-brand-text">{t.name}</div>
                    <div className="text-xs text-brand-muted mt-0.5">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-brand-canvas border-t border-brand-hairline">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-[0.8fr_1.2fr] gap-14">
          <div>
            <div className="text-xs font-medium tracking-widest mb-3 text-brand-accent">FAQ</div>
            <h2 className="text-2xl md:text-[32px] font-medium tracking-tight text-brand-text">
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
      <footer className="bg-brand-card border-t border-brand-hairline">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 pt-9 pb-6 md:pt-14 md:pb-9">
          <div className="flex justify-between items-start flex-wrap gap-8 mb-9">
            <div className="max-w-[260px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-accent">
                  <Link size={14} weight="light" color="#fff" />
                </div>
                <span className="font-medium text-[15px] text-brand-text tracking-tight">Master Events</span>
              </div>
              <p className="text-[13px] text-brand-muted leading-relaxed">Blockchain-powered event ticketing — proudly built in Ghana.</p>
            </div>
            <div className="flex gap-12 flex-wrap">
              {FOOTER_COLS.map(col => (
                <div key={col.title}>
                  <div className="font-medium text-xs tracking-wider text-brand-muted mb-3 uppercase">{col.title}</div>
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
          <div className="border-t border-brand-hairline pt-5">
            <span className="text-xs text-brand-muted">© 2026 Master Events · Secured by Polygon Blockchain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
