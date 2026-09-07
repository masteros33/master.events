# Master Events Ghana — Project Conventions

This file is read automatically by Claude Code at the start of every session in this repo. Follow these rules on every file touched, not just the ones explicitly mentioned in a given prompt.

## Project Context
- **Frontend**: React + Vite PWA, deployed on Vercel
- **Backend**: Django REST Framework, deployed on Render
- **Database**: PostgreSQL via Supabase
- **Blockchain**: Polygon Amoy testnet (NFT ticketing)
- **Payments**: Paystack / MTN MoMo
- **Media**: Cloudinary

## Current Mission: Full UI Revamp
This project just went through a final-year defense and now needs a complete visual overhaul. The existing UI reads as AI-generated. That is the single biggest thing to fix. Every change should be judged against: "would a human software engineer, not a design tool, have made this choice?"

## Design token system (v3 — replaces v1/v2/v2.1 entirely, in effect as of 2026-09-07)

**Colour source of truth: the production site.** These five hex values were read directly from `tailwind.config.js`/`src/index.css` at commit `863a0ff` — the commit on `origin/main`, currently deployed on Vercel at https://masterevents.events — not from any local working-tree edits made during today's session:
- `brand.accent` `#1c2e53` (hover `#16233F`) — the navy already used on "Browse Events" / "Sign up free" in production. **The ONE accent, app-wide. No orange anywhere. No dark canvas anywhere.**
- `brand.canvas` `#faf9f7` — page background.
- `brand.text` `#1a1714` — primary text.
- `brand.muted` `#8a8178` — muted/secondary text.
- `brand.hairline` `#e8e5df` — border/hairline colour.
- `brand.card` `#ffffff` — card surface (production's `--bg-card`; not one of the five named colours above but needed for the Cards rule below).

Migration note: ~19 files already reference `brand-orange`/`brand-orange-hover` Tailwind classes pointing at this same navy value (a pre-existing naming leftover, not a v3 addition). Those class names stay as **deprecated aliases** — same hex as `brand.accent` — until every file in the rollout order below has been rewritten onto `brand-accent`/`brand-accent-hover`, then remove the aliases from `tailwind.config.js`.

Target feel: lightweight fintech (Wise / Monzo / Stripe product UI). Thin type, generous whitespace, one accent, numbers that align.

- **Typeface:** Manrope, variable (wght 200–800), Google Fonts, `font-display: swap`, preconnect. One family app-wide — remove every other font-family declaration (Plus Jakarta Sans, Sora). `JetBrains Mono` stays for transaction hashes / on-chain data only.
- **Weights:** body 400; headings, buttons, prices, labels 500; page titles 600 with `tracking-[-0.02em]`. Nothing above 600 anywhere in product UI. Replace every `font-bold`/`font-extrabold` accordingly.
- **Type scale (mobile):** 12 / 13 / 14 / 15 / 17 / 20 / 24 / 30px. Body is 15px, line-height 1.5. No sizes outside the scale.
- **Numerals:** every price, date, time, count, and balance uses `font-variant-numeric: tabular-nums`.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48. Sections separated by 32–48px and a single hairline, never by nesting cards inside cards. Desktop content max-width 1120px, centred, never full-width text.
- **Radii:** `xl` 12px (buttons, inputs), `2xl` 16px (cards), `full` 999px (pills). Remove `3xl` from `tailwind.config.js` — no radius outside these three.
- **Icons:** Phosphor Icons, Light weight, 1.5px stroke, 20px default. Remove Lucide entirely (all 22 current importers).
- **Motion:** 150–200ms ease-out on hover / press / accordion expand only. Nothing else animates.

**No AI-tell visual patterns:**
- No emojis anywhere in the UI. Ever.
- No pop-in, fade-up, slide-in, or scroll-triggered reveal animations.
- No gradients, no glassmorphism, no glowing borders, no dark overlays, no `backdrop-blur`.
- No scrolling ticker banners.
- No floating glass notification popups.
- No glassmorphic hero metrics panel — clean inline stat typography instead.
- No generic numbered markers (01 / 02 / 03) unless the content is an actual literal sequence.

**Cards:** white surface (`brand.card`), 1px `brand.hairline` border, radius 16 (`rounded-2xl`), no shadow at rest; hover/pressed only `0 1px 2px rgba(15,23,42,.04)`.

**Buttons:** solid `brand.accent`, white text weight 500, radius 12 (`rounded-xl`), height 48 mobile / 44 desktop, no gradient. Exactly 3 sizes max. Secondary = white with hairline border.

**Pills/badges:** radius 999 (`rounded-full`), height 28, 13px text, hairline border, accent-tinted background at 8% opacity.

**Auth pages (Login / Signup / ResetPassword):** centered card on `brand.canvas`; circular logo top-center with brand title below in `font-semibold` `text-brand-text`; white `rounded-2xl` card, hairline border, no shadow at rest, `p-8`; inputs `rounded-xl`, hairline border, focus ring in `brand.accent`, icon-prefixed (Phosphor); primary button solid accent, full width, following the same button rule as everything else.

**Fintech screens (checkout, MoMo, receipts, transaction/balance views — not general UI):** price display `text-3xl font-semibold tracking-tight tabular-nums`; fee breakdowns `rounded-2xl p-4` on a subtle surface; payment method selector cards accent border + accent-tinted background at 8% opacity when active; status badges Success = `emerald-700`/`emerald-50`, Pending = `amber-700`/`amber-50`; transaction hashes `font-mono text-xs` with a one-tap copy button.

## Priority order for this revamp
This is the file order agreed for the v3 token rollout — every file in this list needs its own full rewrite pass to actually apply the new tokens, even though the config change is app-wide:
1. `LandingPage.jsx`
2. `Login.jsx` / `Signup.jsx` / `ResetPassword.jsx`
3. `OrganizerScreens.jsx` (all 6 dashboard screens) — preserve the existing admitted-count bug fix, see below
4. Transaction/checkout/receipt screens (fintech token subset)
5. Remaining screens, in this order:
   - **a. `AttendeeHome.jsx`** — events listing: mobile strict 2-column grid (12px gap, 16px page padding), tablet 3 cols, desktop 4 cols in the 1120px container. Card: 1:1 artwork radius 16, lazy-loaded with width/height set (no CLS); title 15px/500 max 2 lines; meta row date ("Sep 19, 2026") + time ("6:00 PM") muted 13px tabular-nums; price pill right-aligned ("GHS 50" / "GHS 50+" for tiers / "Free" / "RSVP" — currency from the event object, never hard-coded). Filter row above the grid: horizontally snap-scrolling pills (All / Today / This weekend / For you / categories), active pill filled accent, no visible scrollbar, edge fade. Designed empty and error states. Paginate per what the API supports.
   - **b. `PublicEventPage.jsx`** — new sections below hero/description, in order, each hidden when its data is absent, separated by hairline + 32–48px: Good to know (two minimal cards, mobile horizontal snap — Highlights as thin-icon rows driven by real fields, Refund policy as title + 1–2 lines); Location (venue name 17/500, muted address, embedded map — Leaflet + OpenStreetMap unless a Google Maps key already exists in `.env`, radius 16, `h-[200px]` mobile, "Get directions" link; online events show a single "Online event — link sent after purchase" row instead); FAQ accordion (question 15/500 + chevron rotating 180°, answer in a soft-grey rounded panel, `<button aria-expanded>`, keyboard accessible, multiple open allowed); Organised by (soft surface radius 16, 64px avatar with initials fallback, name 17/500, Followers/Events/Hosting stat row with hairline dividers, Contact + Follow buttons — Follow requires auth, returns here after login); Report this event (centred text link + flag icon → modal with reason radios + textarea → report endpoint); You might also like (same card component as 5a, from a related-events endpoint, excluding this event). Sticky bottom bar (mobile only, appears once the primary CTA scrolls out of view): "From GHS 50" 15/500 over date/time 13 muted, full-height accent "Get tickets" button, optional success-tinted "Early bird applied" strip above, respects `env(safe-area-inset-bottom)`. Backend fields these sections need (age restriction, format, parking, refund policy, FAQ, venue lat/lng, organiser follower/event counts, related-events endpoint, report endpoint) are proposed separately and need approval before any migration — do not build these sections against fields that don't exist yet.
   - **c. `ResaleMarketplace.jsx`** — reuses the same event card component as 5a, no separate card implementation.
   - **d.** `SuperAdmin.jsx`, `Settings.jsx`, `DoorStaffScreens.jsx`, `PhoneFrame.jsx`/`AboutPage.jsx`, wallet screens.
6. **Shared components** (Button, Badge, Input, Card, EventCard) — rebuild once as the source of truth once the per-page passes above reveal the real patterns in use, then every page consumes these rather than styling independently

## Design references
Pull direction (not literal copying) from:
- gooddesign.tools
- seesaw.website
- craftwork.design/curated/websites
- toolfolio.io

## Working process — do not skip steps
1. **Audit first.** Before writing any code, list every file touching UI/landing/dashboard so we know the full surface area.
2. **Propose the design token system before building anything**: palette (4–6 named hex values), type pairing, icon set choice, button size scale, card pattern. Show this plan and wait for approval.
3. **Full file rewrites only** — never partial diffs or fragments to manually merge. If a file needs to change, rewrite the whole file.
4. **One file at a time with review** — show the diff, wait for explicit approval, then move to the next file. Do not batch multiple unreviewed file rewrites in a row on a project this size.
5. **Never restyle something that wasn't asked about** in the same pass as an approved change — call it out separately instead of quietly bundling it in.

## Known technical details
- QR/ticket data format: `MASTER-EVENTS:{uuid}:{event_id}`
- Contract address: `0x956F051d666fAc2B956b83BdDD6746127F270Daf`
- Platform wallet: `0x47c8BA78FC2952A7B779B16dd82bDb9dB9eDD6D7` — needs periodic Polygon Amoy faucet top-ups
- Organizer Dashboard admitted-count bug fix lives in `OrganizerScreens.jsx` (frontend-only fix, already applied — don't revert)

## What "done" looks like for this revamp
No emojis, no decorative animation, consistent button sizing app-wide, single color source of truth, landing page rebuilt first, dashboard second, shared components last as the reusable foundation — and every step reviewed before moving to the next file.claude