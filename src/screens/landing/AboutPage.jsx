import React from "react";
import {
  ShieldCheck, Wallet, Mail, Link2, RefreshCw,
  Fingerprint, Bot, Globe2, ArrowRight,
} from "lucide-react";
import { NavBar } from "./shared";

const NAVY = "#1c2e53";
const NAVY_PASTEL = "#EBEEF5";
const SORA = { fontFamily: "'Sora', sans-serif" };

function SignatureCard({ children, className = "" }) {
  return (
    <div className={`relative bg-brand-card border border-gray-100 shadow-sm p-6 overflow-hidden ${className}`}
      style={{ borderTopLeftRadius: "32px", borderTopRightRadius: "8px", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>
      {children}
    </div>
  );
}

const CATEGORY_SHOTS = [
  { key: "music",    label: "Music",    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500" },
  { key: "tech",     label: "Tech",     img: "https://images.unsplash.com/photo-1488229297570-58520851e868?w=500" },
  { key: "food",     label: "Food",     img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500" },
  { key: "arts",     label: "Arts",     img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500" },
  { key: "sports",   label: "Sports",   img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500" },
  { key: "business", label: "Business", img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500" },
];

const STEPS = [
  { Icon: Link2,       n: "01", title: "A ticket is minted",           body: "Every purchase mints a unique NFT on Polygon — a permanent, tamper-proof record of who owns it." },
  { Icon: RefreshCw,   n: "02", title: "Ownership moves with you",     body: "Resell or transfer a ticket and the chain updates instantly. The old QR code stops working the moment it does." },
  { Icon: ShieldCheck, n: "03", title: "The door scans, the chain confirms", body: "Door staff scan a rotating QR code checked against the blockchain in real time — no guessing, no fakes." },
];

const AUDIENCES = [
  { Icon: ShieldCheck, title: "For attendees",  body: "Your ticket can't be duplicated, faked, or invalidated by someone else's mistake. It's yours — verifiably, permanently." },
  { Icon: Wallet,      title: "For organizers", body: "Keep 95% of every sale, paid straight to MoMo or card. See ticket status and revenue in real time — no reconciliation headaches, no chasing payouts." },
];

const ROADMAP = [
  { Icon: Fingerprint, title: "Decentralized identity",   body: "Stronger ownership verification without giving up your privacy." },
  { Icon: Bot,         title: "AI-based fraud detection", body: "Flagging suspicious resale and purchase patterns before they become a problem." },
  { Icon: Globe2,      title: "More chains, more ways to pay", body: "Expanding beyond Polygon and MoMo as we grow into new markets." },
];

const TEAM = [
  { initials: "JO", name: "Jude Obodai-Sai",               role: "Full-Stack & Blockchain" },
  { initials: "EN", name: "Emma Nkansah",                  role: "Backend & Systems" },
  { initials: "GK", name: "George Opoku Yiadom Kwadjo",    role: "Frontend & Product" },
];

export default function AboutPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-brand-canvas font-sans">
      <NavBar onNavigate={onNavigate} />

      <section className="max-w-4xl mx-auto px-4 md:px-8 pt-14 pb-8 md:pt-20 md:pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider mb-6" style={{ background: NAVY_PASTEL, color: NAVY }}>
          OUR STORY
        </div>
        <h1 className="text-[32px] md:text-5xl font-extrabold tracking-tight text-brand-text mb-4 leading-tight" style={SORA}>
          Ticketing you don't<br className="hidden md:block" /> have to take on faith.
        </h1>
        <p className="text-[15px] md:text-lg text-brand-muted leading-relaxed max-w-xl mx-auto">
          Every ticket on Master Events is a verifiable, blockchain-backed asset — not a screenshot, not a PDF someone could copy twice.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-14 md:pb-20">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATEGORY_SHOTS.map(c => (
            <div key={c.key} className="relative rounded-2xl overflow-hidden aspect-square">
              <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-brand-text/70 px-2 py-1.5">
                <span className="text-white text-[10px] md:text-[11px] font-bold">{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-card border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>WHY WE BUILT THIS</div>
            <h2 className="text-2xl md:text-[32px] font-extrabold text-brand-text tracking-tight leading-tight mb-4" style={SORA}>
              Fake tickets shouldn't get past the door.
            </h2>
            <p className="text-[15px] text-brand-muted leading-relaxed mb-4">
              Screenshotted QR codes, duplicated tickets, and centralized databases with no public audit trail — traditional ticketing was built for convenience, not proof. When a single database is the only thing standing between a real ticket and a fake one, everyone's exposed: the fan who paid, and the organizer whose event gets gate-crashed.
            </p>
            <p className="text-[15px] text-brand-muted leading-relaxed">
              We built Master Events to fix that at the root — every ticket is a blockchain record, not a claim someone has to trust.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-sm">
            <img src={CATEGORY_SHOTS[0].img} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>HOW IT WORKS</div>
          <h2 className="text-xl md:text-[32px] font-extrabold text-brand-text tracking-tight" style={SORA}>From purchase to proof</h2>
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
      </section>

      <section className="bg-brand-card border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIENCES.map(a => (
              <SignatureCard key={a.title} className="bg-brand-canvas">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: NAVY_PASTEL }}>
                  <a.Icon size={20} strokeWidth={1.75} style={{ color: NAVY }} />
                </div>
                <div className="font-bold text-base text-brand-text mb-2" style={SORA}>{a.title}</div>
                <div className="text-sm text-brand-muted leading-relaxed">{a.body}</div>
              </SignatureCard>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>WHAT'S NEXT</div>
          <h2 className="text-xl md:text-[32px] font-extrabold text-brand-text tracking-tight" style={SORA}>We're just getting started</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROADMAP.map(r => (
            <SignatureCard key={r.title}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: NAVY_PASTEL }}>
                <r.Icon size={20} strokeWidth={1.75} style={{ color: NAVY }} />
              </div>
              <div className="font-bold text-[15px] text-brand-text mb-2" style={SORA}>{r.title}</div>
              <div className="text-[13px] text-brand-muted leading-relaxed">{r.body}</div>
            </SignatureCard>
          ))}
        </div>
      </section>

      <section className="bg-brand-card border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <div className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: NAVY }}>THE TEAM</div>
          <h2 className="text-xl md:text-2xl font-extrabold text-brand-text tracking-tight mb-8" style={SORA}>Built by students at GCTU</h2>
          <p className="text-sm text-brand-muted max-w-lg mx-auto mb-9 leading-relaxed">
            A final-year Computer Science project at Ghana Communication Technology University — combining blockchain, mobile, and payments in one system.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {TEAM.map(t => (
              <div key={t.name} className="flex flex-col items-center gap-2.5 w-32">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: NAVY_PASTEL, color: NAVY }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-text leading-snug">{t.name}</div>
                  <div className="text-[10px] text-brand-muted mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
        <h2 className="text-xl md:text-2xl font-extrabold text-brand-text tracking-tight mb-4" style={SORA}>Ready to see it for yourself?</h2>
        <div className="flex justify-center gap-3 flex-wrap mb-14">
          <button onClick={() => onNavigate("signup")}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-colors" style={{ background: NAVY }}>
            Get Started <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button onClick={() => onNavigate("home")}
            className="px-6 py-3 rounded-full bg-brand-card border border-gray-200 text-brand-text font-semibold text-sm hover:border-gray-300 transition-colors">
            Browse Events
          </button>
        </div>

        <SignatureCard className="md:p-10 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: NAVY_PASTEL }}>
            <Mail size={20} strokeWidth={1.75} style={{ color: NAVY }} />
          </div>
          <p className="text-brand-muted mb-2 text-sm">Have questions? We'd like to hear them.</p>
          <a href="mailto:mastereventgh@gmail.com" className="font-bold text-lg" style={{ color: NAVY }}>mastereventgh@gmail.com</a>
        </SignatureCard>
      </section>
    </div>
  );
}