/**
 * The descriptive half of an event page: what to expect, where it is, and the
 * questions organizers get asked every time.
 *
 * These live here rather than inside one screen because the same event is
 * shown in two places — the public page a link opens, and the detail overlay
 * inside the app — and they had drifted apart: the public page grew these
 * sections and the in-app one never got them, so an attendee who was signed in
 * saw an event with no map, no policy and no FAQ.
 */
import React, { useEffect, useState } from "react";
import {
  MapPin, NavigationArrow, IdentificationCard, Car, CaretDown,
} from "@phosphor-icons/react";

// ── Location ──────────────────────────────────────────────────────────
//
// Google's Embed API needs a billing account with a card attached, which we
// do not have, so the map is OpenStreetMap instead. OSM's embed wants a
// bounding box rather than an address, so the venue string is resolved to a
// coordinate by Nominatim — from the visitor's browser, not the server:
//
//   * no API key, no billing account, nothing to leak in the bundle
//   * Nominatim rate-limits per IP, and every visitor is a different IP,
//     so this scales with traffic instead of against it
//   * the answer is cached in localStorage, so a repeat visitor to the same
//     venue never looks it up twice
//
// If the lookup fails, is blocked, or the venue is not on the map, the card
// falls back to a plain link out. Nothing here can leave a dead panel.

const GEO_CACHE_PREFIX = "geo:v1:";

function readGeoCache(key) {
  try {
    const raw = localStorage.getItem(GEO_CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeGeoCache(key, value) {
  try { localStorage.setItem(GEO_CACHE_PREFIX + key, JSON.stringify(value)); } catch { /* private mode */ }
}

export function useVenueCoords(address) {
  const [coords, setCoords] = useState(() => (address ? readGeoCache(address) : null));

  useEffect(() => {
    if (!address || coords) return;
    const controller = new AbortController();
    const url = "https://nominatim.openstreetmap.org/search"
      + `?q=${encodeURIComponent(address)}&format=json&limit=1`;

    fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(r => (r.ok ? r.json() : null))
      .then(rows => {
        const hit = Array.isArray(rows) && rows[0];
        if (!hit) { writeGeoCache(address, { miss: true }); return; }
        const found = { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
        if (Number.isFinite(found.lat) && Number.isFinite(found.lon)) {
          writeGeoCache(address, found);
          setCoords(found);
        }
      })
      .catch(() => { /* offline, blocked, or aborted — the fallback covers it */ });

    return () => controller.abort();
  }, [address, coords]);

  return coords && !coords.miss ? coords : null;
}

// ── Good to know ──────────────────────────────────────────────────────
// Every row is driven by a real field and disappears when that field is unset,
// so an organizer who filled nothing in gets a clean page rather than a grid
// of "Not specified".

const AGE_LABEL = { "13": "Ages 13+", "16": "Ages 16+", "18": "Ages 18+", "21": "Ages 21+" };
const PARKING_LABEL = {
  free:   "Free parking",
  paid:   "Paid parking",
  street: "Street parking",
  none:   "No parking on site",
};
const MODE_LABEL = { in_person: "In person", online: "Online event", hybrid: "In person and online" };
const REFUND_LABEL = {
  none:    "No refunds on this event.",
  "24h":   "Refundable up to 24 hours before the event starts.",
  "7d":    "Refundable up to 7 days before the event starts.",
  anytime: "Refundable any time before the event starts.",
};

export function GoodToKnow({ event }) {
  const rows = [
    event.age_restriction && event.age_restriction !== "none"
      ? { Icon: IdentificationCard, label: AGE_LABEL[event.age_restriction] } : null,
    event.attendance_mode
      ? { Icon: MapPin, label: MODE_LABEL[event.attendance_mode] } : null,
    event.parking && event.parking !== "unknown"
      ? { Icon: Car, label: PARKING_LABEL[event.parking] } : null,
  ].filter(Boolean);

  const refund = REFUND_LABEL[event.refund_policy];
  if (!rows.length && !refund) return null;

  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-medium text-brand-text mb-3">Good to know</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.length > 0 && (
          <div className="bg-brand-card border border-brand-hairline rounded-2xl p-4">
            <div className="text-[13px] font-medium text-brand-text mb-2.5">Highlights</div>
            <div className="flex flex-col gap-2">
              {rows.map(r => (
                <div key={r.label} className="flex items-center gap-2.5">
                  <r.Icon size={18} weight="light" className="text-brand-muted shrink-0" />
                  <span className="text-[13px] text-brand-text">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {refund && (
          <div className="bg-brand-card border border-brand-hairline rounded-2xl p-4">
            <div className="text-[13px] font-medium text-brand-text mb-2.5">Refund policy</div>
            <p className="text-[13px] text-brand-muted leading-relaxed">{refund}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function FaqSection({ faq }) {
  const [open, setOpen] = useState(() => new Set());
  if (!Array.isArray(faq) || faq.length === 0) return null;

  const toggle = (i) => setOpen(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-medium text-brand-text mb-3">Frequently asked questions</h2>
      <div className="border-t border-brand-hairline">
        {faq.map((row, i) => {
          const isOpen = open.has(i);
          return (
            <div key={i} className="border-b border-brand-hairline">
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 py-3.5 text-left">
                <span className="text-[15px] font-medium text-brand-text">{row.q}</span>
                <CaretDown size={16} weight="light"
                  className={`text-brand-muted shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="pb-3.5">
                  <p className="text-[13px] text-brand-muted leading-relaxed bg-brand-canvas rounded-xl px-3.5 py-3">
                    {row.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LocationCard({ venue, city, country }) {
  const address = [venue, city, country].filter(Boolean).join(", ");
  const coords  = useVenueCoords(address);
  const query   = encodeURIComponent(address);

  // Directions need no key and no coordinate — this works even when the
  // lookup above finds nothing, and opens the maps app on a phone.
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const placeUrl      = `https://www.openstreetmap.org/search?query=${query}`;

  const embedUrl = coords && (() => {
    const { lat, lon } = coords;
    // ~800m across: close enough to read the street, wide enough to orient.
    const bbox = [lon - 0.006, lat - 0.004, lon + 0.006, lat + 0.004].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  })();

  if (!venue && !city) {
    return (
      <div className="mb-6">
        <h2 className="text-[17px] font-medium text-brand-text mb-1">Location</h2>
        <p className="text-[13px] text-brand-muted">Venue to be announced.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-medium text-brand-text mb-3">Location</h2>

      <div className="mb-3">
        <div className="text-[15px] font-medium text-brand-text">{venue || city}</div>
        {(city || country) && (
          <div className="text-[13px] text-brand-muted mt-0.5">
            {[venue ? city : null, country].filter(Boolean).join(", ")}
          </div>
        )}
      </div>

      {embedUrl ? (
        <div className="rounded-2xl overflow-hidden border border-brand-hairline h-[200px] lg:h-[240px]">
          <iframe
            title={`Map showing ${address}`}
            src={embedUrl}
            loading="lazy"
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <a href={placeUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-brand-hairline bg-brand-canvas px-4 py-4 transition-colors hover:bg-brand-subtle">
          <MapPin size={20} weight="light" className="text-brand-muted shrink-0" />
          <span className="text-[13px] text-brand-muted">View this venue on the map</span>
        </a>
      )}

      <a href={directionsUrl} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 mt-3 text-[13px] font-medium text-brand-accent hover:underline">
        <NavigationArrow size={14} weight="light" /> Get directions
      </a>
    </div>
  );
}

