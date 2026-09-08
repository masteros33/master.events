import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import {
  Ticket, Link, Lock, DeviceMobile, MagnifyingGlass, Calendar, Clock, MapPin,
  CircleNotch, SmileySad, Confetti, NavigationArrow, FileText, Crown, Star, Check,
} from "@phosphor-icons/react";
import { formatDate, formatTime } from "../../utils/formatDate";

const BACKEND = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth >= 1024;

const catImg = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=1200",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
};

function hasRealDescription(desc, name) {
  const d = (desc || "").trim();
  if (!d) return false;
  if (d.toLowerCase() === (name || "").trim().toLowerCase()) return false;
  return d.length >= 12;
}

function tierIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("vvip")) return Crown;
  if (n.includes("vip"))  return Star;
  return Ticket;
}

function TrustBadge({ Icon, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon size={13} weight="light" className="text-brand-muted" />
      <span className="text-xs text-brand-muted font-medium">{label}</span>
    </span>
  );
}

function DetailRow({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-brand-hairline last:border-b-0">
      <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-hairline flex items-center justify-center shrink-0">
        <Icon size={16} weight="light" className="text-brand-muted" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-brand-muted tracking-wide mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-brand-text truncate tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function LocationCard({ venue, city }) {
  const address = [venue, city].filter(Boolean).join(", ") || "Venue TBA";
  return (
    <div className="bg-brand-card border border-brand-hairline rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-hairline flex items-center justify-center shrink-0">
            <MapPin size={16} weight="light" className="text-brand-muted" />
          </div>
          <div>
            <div className="text-xs font-medium text-brand-muted tracking-wide mb-0.5">LOCATION</div>
            <div className="text-sm font-semibold text-brand-text">{address}</div>
          </div>
        </div>
        <span className="text-xs font-medium text-brand-muted bg-brand-hairline px-2 py-1 rounded-full whitespace-nowrap">
          MAP COMING SOON
        </span>
      </div>

      <div className="rounded-xl border border-dashed border-brand-hairline bg-brand-canvas h-[160px] flex flex-col items-center justify-center gap-2">
        <MapPin size={22} weight="light" className="text-brand-muted" />
        <span className="text-xs text-brand-muted">Interactive map will appear here</span>
      </div>

      <button disabled
        className="w-full mt-3.5 h-11 rounded-xl bg-brand-hairline text-brand-muted text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
        <NavigationArrow size={14} weight="light" /> Get Directions
      </button>
    </div>
  );
}

function TierPicker({ tiers, curr, selectedId, onSelect }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-brand-muted tracking-wide mb-2.5">SELECT TICKET TYPE</div>
      <div className="flex flex-col gap-2">
        {tiers.map(t => {
          const Icon    = tierIcon(t.name);
          const soldOut = t.is_sold_out || t.remaining <= 0;
          const active  = selectedId === t.id;
          return (
            <button key={t.id} disabled={soldOut} onClick={() => onSelect(t)}
              className={`flex items-center justify-between text-left px-4 py-3.5 rounded-xl border-2 transition-colors ${
                soldOut ? "border-brand-hairline bg-brand-subtle cursor-not-allowed opacity-60"
                : active ? "border-brand-accent bg-[var(--brand-light)]" : "border-brand-hairline bg-brand-card hover:border-brand-hairline"
              }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-brand-accent" : "bg-[var(--brand-light)]"}`}>
                  <Icon size={16} weight="light" className={active ? "text-white" : "text-brand-accent"} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-brand-text truncate">{t.name}</div>
                  <div className="text-xs text-brand-muted mt-0.5">
                    {soldOut ? "Sold out" : `${t.remaining} of ${t.capacity} left`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-3">
                <span className="text-[15px] font-semibold text-brand-text tabular-nums">{curr} {parseFloat(t.price).toLocaleString()}</span>
                {active && (
                  <span className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                    <Check size={12} weight="light" color="#fff" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TicketCard({ event, tiers, isFree, curr, isLoggedIn, onAction, actionLoading, error, isDesk, selectedTierObj, onSelectTier }) {
  const hasTiers = tiers.length > 0;
  const remaining = hasTiers
    ? (selectedTierObj?.remaining ?? 0)
    : (event.total_tickets || 0) - (event.tickets_sold || 0);
  const displayPrice = hasTiers ? (selectedTierObj?.price ?? null) : event.price;

  const total_tickets = hasTiers ? (selectedTierObj?.capacity || 0) : event.total_tickets;
  const sold           = hasTiers ? (selectedTierObj?.sold || 0)    : event.tickets_sold;
  const soldPct   = total_tickets > 0
    ? Math.max(3, Math.min(100, (sold / total_tickets) * 100))
    : 0;
  const lowStock  = remaining > 0 && remaining <= Math.max(10, total_tickets * 0.1);
  const soldOut   = hasTiers ? !selectedTierObj || remaining <= 0 : remaining <= 0;
  const needsSelection = hasTiers && !selectedTierObj;

  return (
    <div className={`bg-brand-card rounded-2xl border border-brand-hairline ${isDesk ? "p-6 sticky top-6" : "p-5"}`}>

      {hasTiers && (
        <TierPicker tiers={tiers} curr={curr} selectedId={selectedTierObj?.id} onSelect={onSelectTier} />
      )}

      <div className="flex items-baseline gap-2 mb-4">
        <div className={`text-3xl font-semibold tracking-tight tabular-nums leading-none ${isFree ? "text-emerald-700" : "text-brand-accent"}`}>
          {isFree ? "FREE" : needsSelection ? "Select above" : `${curr} ${parseFloat(displayPrice || 0).toLocaleString()}`}
        </div>
        {!isFree && !needsSelection && <span className="text-xs text-brand-muted">per ticket</span>}
      </div>

      {!needsSelection && (
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-medium text-brand-muted tracking-wide">AVAILABILITY</span>
            <span className={`text-xs font-medium ${lowStock || soldOut ? "text-red-600" : "text-emerald-700"}`}>
              {soldOut ? "SOLD OUT" : lowStock ? "ALMOST GONE" : "AVAILABLE"}
            </span>
          </div>
          <div className="h-1.5 bg-brand-hairline rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${soldPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${lowStock ? "bg-red-500" : "bg-emerald-600"}`} />
          </div>
          <div className="text-xs text-brand-muted mt-1.5">
            {sold || 0} {isFree ? "registered" : "sold"} · {Math.max(0, remaining)} remaining
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3.5 text-red-600 text-xs">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onAction} disabled={actionLoading || soldOut || needsSelection}
        className={`w-full h-12 rounded-xl font-medium text-[15px] tabular-nums transition-colors ${soldOut || actionLoading || needsSelection ? "bg-brand-hairline text-brand-muted cursor-not-allowed" : "bg-brand-accent hover:bg-brand-accent-hover text-white"}`}>
        {soldOut
          ? "Sold Out"
          : needsSelection
            ? "Select a ticket type"
            : actionLoading
              ? "Processing…"
              : isFree
                ? "Register Free — Get Ticket"
                : isLoggedIn
                  ? `Buy Ticket — ${curr} ${parseFloat(displayPrice || 0).toLocaleString()}`
                  : "Sign Up & Buy Ticket"}
      </button>

      <div className="flex flex-wrap gap-3 justify-center mt-4 pt-4 border-t border-brand-hairline">
        <TrustBadge Icon={Lock} label="Secure checkout" />
        <TrustBadge Icon={Link} label="NFT ticket" />
        <TrustBadge Icon={DeviceMobile} label="MoMo accepted" />
      </div>
    </div>
  );
}

export default function PublicEventPage() {
  const setScreen        = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setSelectedTier  = useStore(s => s.setSelectedTier);
  const setSearchQ       = useStore(s => s.setSearchQ);
  const isLoggedIn       = useStore(s => s.isLoggedIn);
  const [event,      setEvent]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [regDone,    setRegDone]    = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [isDesk,     setIsDesk]     = useState(isDesktop());
  const [searchVal,  setSearchVal]  = useState("");
  const [pickedTier, setPickedTier] = useState(null);

  const slug = localStorage.getItem("pending_event_slug");

  useEffect(() => {
    const r = () => setIsDesk(isDesktop());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    if (!slug) { setScreen("home"); return; }
    fetch(`${BACKEND}/api/events/slug/${slug}/`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setEvent(data);
        else setError("Event not found.");
        setLoading(false);
      })
      .catch(() => { setError("Could not load event."); setLoading(false); });
  }, []);

  const handleSearch = () => {
    setSearchQ(searchVal);
    localStorage.removeItem("pending_event_slug");
    setScreen("home");
  };

  const handleRegister = async () => {
    if (!isLoggedIn) {
      localStorage.setItem("post_auth_screen", "pendingEvent");
      setScreen("signup");
      return;
    }
    setRegLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${BACKEND}/api/tickets/register-free/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: event.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.registration_id || res.ok) {
        setRegDone(true);
        localStorage.removeItem("pending_event_slug");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Connection error.");
    }
    setRegLoading(false);
  };

  const handleBuy = () => {
    if (!isLoggedIn) {
      localStorage.setItem("post_auth_screen", "pendingEvent");
      setScreen("signup");
      return;
    }
    const tiers = event.tiers || [];
    if (tiers.length > 0 && !pickedTier) return;

    setSelectedTier(pickedTier ? { id: pickedTier.id, name: pickedTier.name, price: parseFloat(pickedTier.price) } : null);
    setCheckoutEvent({
      id: event.id, name: event.name, date: event.date,
      venue: event.venue, price: pickedTier ? parseFloat(pickedTier.price) : parseFloat(event.price),
      image: event.image, category: event.category,
      currency: event.currency || "GHS",
      tierName: pickedTier?.name || null,
    });
    localStorage.removeItem("pending_event_slug");
    setScreen("checkout");
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center bg-brand-canvas gap-3.5">
      <CircleNotch size={26} className="text-brand-accent animate-spin" />
      <div className="text-sm text-brand-muted">Loading event…</div>
    </div>
  );

  if (error && !event) return (
    <div className="h-full flex flex-col items-center justify-center bg-brand-canvas gap-3.5 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
        <SmileySad size={24} weight="light" className="text-brand-accent" />
      </div>
      <div className="text-[15px] font-semibold text-brand-text">{error || "Event not found"}</div>
      <button onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
        className="px-6 h-11 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm transition-colors">
        Browse Events
      </button>
    </div>
  );

  const isFree  = event.event_type === "free" || parseFloat(event.price) === 0;
  const curr    = event.currency || "GHS";
  const cover   = event.image || catImg[event.category] || catImg.other;
  const orgName = event.organizer?.first_name
    ? `${event.organizer.first_name} ${event.organizer.last_name || ""}`.trim()
    : event.organizer_name || null;
  const tiers   = event.tiers || [];

  if (regDone) return (
    <div className="h-full flex flex-col items-center justify-center bg-brand-canvas px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <Confetti size={28} weight="light" className="text-emerald-700" />
      </div>
      <h2 className="text-xl font-semibold text-brand-text mb-2 tracking-tight">You're registered!</h2>
      <p className="text-sm text-brand-muted mb-1.5 max-w-[340px]">Check your email — your PDF ticket with QR code has been sent.</p>
      <p className="text-[13px] text-brand-muted mb-6">You can also view it in the app under My Tickets.</p>
      <button onClick={() => setScreen("app")}
        className="px-7 h-12 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm transition-colors">
        Go to My Tickets →
      </button>
    </div>
  );

  const realDescription = hasRealDescription(event.description, event.name);

  return (
    <div className="h-full overflow-y-auto bg-brand-canvas" style={{ WebkitOverflowScrolling: "touch" }}>

      <div className={`sticky top-0 z-30 bg-brand-card border-b border-brand-hairline h-[58px] flex items-center justify-between gap-5 ${isDesk ? "px-10" : "px-4"}`}>
        <button onClick={() => { localStorage.removeItem("pending_event_slug"); setScreen("home"); }}
          className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-brand-accent flex items-center justify-center">
            <Ticket size={13} weight="light" color="#fff" />
          </div>
          {isDesk && <span className="font-semibold text-sm text-brand-text tracking-tight">Master Events</span>}
        </button>

        {isDesk && (
          <div className="flex-1 max-w-[420px] relative">
            <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="MagnifyingGlass events, venues..."
              className="w-full pl-9 pr-3.5 py-2 bg-brand-canvas border border-brand-hairline rounded-xl text-[13px] text-brand-text outline-none focus:border-brand-accent transition-colors" />
          </div>
        )}

        {!isLoggedIn && (
          <button onClick={() => setScreen("login")}
            className="px-3.5 py-1.5 rounded-xl border border-brand-hairline text-brand-text text-xs font-semibold shrink-0">
            Log in
          </button>
        )}
      </div>

      {!isDesk && (
        <div className="px-4 py-2.5 border-b border-brand-hairline bg-brand-card">
          <div className="relative">
            <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="MagnifyingGlass events, venues..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-brand-canvas border border-brand-hairline rounded-xl text-[13px] text-brand-text outline-none focus:border-brand-accent transition-colors" />
          </div>
        </div>
      )}

      <div className={`max-w-[1100px] mx-auto ${isDesk ? "px-10 pt-7 pb-14" : "px-4 pt-4 pb-10"}`}>

        <div className={`rounded-2xl overflow-hidden border border-brand-hairline mb-6 relative ${isDesk ? "h-[360px]" : "h-[200px]"}`}>
          <img src={cover} alt={event.name} className="w-full h-full object-cover object-top block"
            onError={e => { e.target.src = catImg.other; }} />
          <div className="absolute top-3.5 left-3.5 flex gap-1.5">
            <span className="bg-brand-accent text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {(event.category || "").toUpperCase()}
            </span>
            {isFree && (
              <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">FREE</span>
            )}
            {tiers.length > 0 && (
              <span className="flex items-center gap-1 bg-brand-card text-brand-text text-xs font-medium px-2.5 py-1 rounded-full">
                <Crown size={9} weight="light" className="text-brand-accent" /> {tiers.length} TIERS
              </span>
            )}
            <span className="flex items-center gap-1 bg-brand-text text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <Link size={9} weight="light" /> NFT
            </span>
          </div>
        </div>

        <div className={`flex gap-10 items-start ${isDesk ? "flex-row" : "flex-col"}`}>

          <div className="flex-1 min-w-0 w-full">

            <h1 className={`font-semibold text-brand-text tracking-tight leading-tight mb-2.5 ${isDesk ? "text-3xl" : "text-2xl"}`}>
              {event.name}
            </h1>

            {orgName && (
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-xs font-medium text-white shrink-0">
                  {orgName.charAt(0).toUpperCase()}
                </div>
                <div className="text-[13px] text-brand-muted">
                  by <span className="font-medium text-brand-text">{orgName}</span>
                </div>
              </div>
            )}

            <div className="text-[13px] text-brand-muted mb-6 flex flex-col gap-1">
              <span className="flex items-center gap-1.5"><MapPin size={13} weight="light" /> {event.venue}{event.city ? `, ${event.city}` : ""}</span>
              <span className="flex items-center gap-1.5 tabular-nums"><Calendar size={13} weight="light" /> {formatDate(event.date)}{event.time ? ` · ${formatTime(event.time)}` : ""}</span>
            </div>

            {!isDesk && (
              <div className="mb-6">
                <TicketCard event={event} tiers={tiers} isFree={isFree} curr={curr} isLoggedIn={isLoggedIn}
                  onAction={isFree ? handleRegister : handleBuy} actionLoading={regLoading} error={error} isDesk={false}
                  selectedTierObj={pickedTier} onSelectTier={setPickedTier} />
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-[15px] font-medium text-brand-text mb-2.5">Overview</h2>
              {realDescription ? (
                <p className="text-sm text-brand-text leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              ) : (
                <div className="flex items-center gap-2.5 bg-brand-card border border-brand-hairline rounded-xl px-3.5 py-3">
                  <FileText size={15} weight="light" className="text-brand-muted shrink-0" />
                  <span className="text-[13px] text-brand-muted">No description yet — check back closer to the event.</span>
                </div>
              )}
            </div>

            <div className="bg-brand-card border border-brand-hairline rounded-2xl overflow-hidden mb-6 px-4">
              <DetailRow Icon={Calendar} label="DATE" value={formatDate(event.date)} />
              <DetailRow Icon={Clock} label="TIME" value={formatTime(event.time) || "TBA"} />
              <DetailRow Icon={MapPin} label="VENUE" value={`${event.venue || "TBA"}${event.city ? `, ${event.city}` : ""}`} />
              <DetailRow Icon={Ticket} label="CAPACITY" value={`${event.total_tickets || 0} spots total`} />
            </div>

            <LocationCard venue={event.venue} city={event.city} />

            <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3.5">
              <Link size={18} weight="light" className="text-blue-700 shrink-0" />
              <div>
                <div className="text-xs font-medium text-blue-700 mb-0.5">Secured by Polygon Blockchain</div>
                <div className="text-xs text-brand-muted">Every ticket is minted as an NFT — cannot be duplicated or faked</div>
              </div>
            </div>
          </div>

          {isDesk && (
            <div className="w-[340px] shrink-0">
              <TicketCard event={event} tiers={tiers} isFree={isFree} curr={curr} isLoggedIn={isLoggedIn}
                onAction={isFree ? handleRegister : handleBuy} actionLoading={regLoading} error={error} isDesk={true}
                selectedTierObj={pickedTier} onSelectTier={setPickedTier} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}