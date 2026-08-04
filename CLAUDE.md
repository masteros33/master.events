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

## Design token system (v2 — supersedes v1, in effect as of 2026-07-29)

The first revamp pass used a dark canvas with border-only, shadowless cards. **That system is superseded.** The current system is a warm, light, fintech-adjacent look. Do not reintroduce dark canvases or border-only (no-shadow) cards — that rule is explicitly reversed below.

**Tokens** (`tailwind.config.js` is the single source of truth — no ad hoc hex values in component files):
- `brand.orange` `#FF5A1F` / `brand.orange-hover` `#E04810` — primary accent and its hover state (replaces the old `#F97316` accent). The old `primary`/`primary-dark` class names are kept as **deprecated aliases** pointing at these same values so unmigrated files don't break — do not use `primary`/`primary-dark` in new or rewritten code, use `brand-orange`/`brand-orange-hover`. Remove the aliases from `tailwind.config.js` once every file in the v2 rollout list below has been rewritten and confirmed.
- `brand.canvas` `#FAF9F5` — page background (warm off-white, never dark)
- `brand.card` `#FFFFFF`, `brand.text` `#121212`, `brand.muted` `#666666`
- `fintech.slate` `#0F172A`, `fintech.blue` `#2563EB`, `fintech.gray` `#F8FAFC` — reserved for checkout/payment/transaction/receipt/balance screens only, not general UI
- `fintech.green` `#10B981` (emerald) — the one exception: approved app-wide for **positive validation/success states** (password-requirement-met checklists, form validation, confirmations), not just payment success badges. Still not a general-purpose "brand color" — use it only for pass/fail or success semantics, never decoratively.
- `pastel.orange/blue/green/pink` — circular icon badge backgrounds only (`w-12 h-12 rounded-full bg-pastel-*`)
- `borderRadius`: `xl` 0.75rem, `2xl` 1rem, `3xl` 1.5rem, `full` 9999px
- Fonts: **Plus Jakarta Sans** for body/headings everywhere; **JetBrains Mono** reserved for transaction hashes and other numeric/on-chain data only — never general body text

**No AI-tell visual patterns:**
- No emojis anywhere in the UI. Ever. Icons are Lucide, single stroke weight, consistently sized, placed inside circular pastel badge containers (`w-12 h-12 rounded-full bg-pastel-[color]`) when used as a standalone visual marker.
- No pop-in, fade-up, slide-in, or scroll-triggered reveal animations. Only essential micro-interactions: hover state changes, button press feedback, focus rings.
- No gradients, no glassmorphism, no glowing borders, no dark overlays. Specifically eradicated codebase-wide (not just hero sections): `backdrop-blur`, `bg-white/5`, `bg-white/10`, glossy translucent borders, glow drop-shadows.
- No scrolling ticker banners (hero, mobile or desktop).
- No floating glass notification popups.
- No glassmorphic hero metrics panel — if stats stay on a page, they render as clean inline stat typography instead.
- No generic numbered markers (01 / 02 / 03) unless the content is an actual literal sequence.

**Cards — reversed from v1:** flat `bg-white`, `rounded-3xl`, `border-gray-100`, `shadow-sm`. This *replaces* the earlier border-only/no-shadow rule — shadow is now expected, not forbidden.

**Buttons:** primary buttons are solid `brand-orange`, pill-shaped (`rounded-full`), bold white text, no gradient, no glow. Exactly 3 size variants max (small / normal / large) — no one-off custom sizes anywhere; audit existing buttons before adding a new size.

**Auth pages (Login / Signup / ResetPassword):** centered card on the warm canvas; circular logo top-center with brand title below in bold `text-brand-text`; white `rounded-3xl` card, `border-gray-100`, `shadow-sm`, `p-8`; inputs `rounded-xl`, `border-gray-200`, `focus:border-brand-orange focus:ring-2 focus:ring-orange-100`, icon-prefixed; primary button solid orange, `rounded-full`, full width — pill-shaped like every other primary button (an earlier draft of this rule carved out `rounded-xl` as an exception for auth; that exception is reversed, auth buttons follow the same pill rule as everything else).

**Fintech screens (checkout, MoMo, receipts, transaction/balance views — not general UI):** price display `text-3xl font-bold tracking-tight`; fee breakdowns `bg-fintech-gray rounded-2xl p-4`; payment method selector cards `border-2 border-brand-orange bg-orange-50/20` when active; status badges Success = `emerald-700`/`emerald-50`, Pending = `amber-700`/`amber-50`; transaction hashes `font-mono text-xs` with a one-tap copy button.

**Consistency across the whole app:**
- Typography: Plus Jakarta Sans everywhere (headings and body); JetBrains Mono only for transaction hashes / numeric data. No per-page font swaps.
- Spacing/layout: constrained max-width layouts, not full-width stretched sections. Consistent gutter/padding scale.

## Priority order for this revamp
This is the file order agreed for the v2 token rollout — every file in this list needs its own full rewrite pass to actually apply the new tokens, even though the config change is app-wide:
1. `LandingPage.jsx`
2. `Login.jsx` / `Signup.jsx` / `ResetPassword.jsx`
3. `OrganizerScreens.jsx` (all 6 dashboard screens) — preserve the existing admitted-count bug fix, see below
4. Transaction/checkout/receipt screens (fintech token subset)
5. Remaining screens: `SuperAdmin.jsx`, `AttendeeHome.jsx`, `Settings.jsx`, `DoorStaffScreens.jsx`, `PhoneFrame.jsx`/`AboutPage.jsx`, wallet/resale screens
6. **Shared components** (Button, Badge, Input, Card) — rebuild once as the source of truth once the per-page passes above reveal the real patterns in use, then every page consumes these rather than styling independently

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