# QA Round 1

Tracking list for the current bug-fix pass on `fix/qa-round-1`. One fix per commit, diff shown, wait for approval before moving to the next item. Check items off as they land.

## P1 — invisible text (contrast)

Root cause: text colours hard-coded for a light canvas while these screens render on a dark canvas (or vice versa). Fix at the token level first, then verify each instance. Every text/background pair must pass 4.5:1.

- [x] 1. `PublicEventPage.jsx` — "Hosted by" organiser name inside the pale card: invisible. **Already fixed** — verified live (`/events/afrobeat-night`): the org row already uses `text-brand-text`/`text-brand-muted` tokens, computed color is `#1a1714` on white. Resolved by the v3 token rewrite (`6cf2f87`), no further change needed.
- [ ] 2. `Signup.jsx` — "Sign up with Google as Attendee" button label: white on white.
- [ ] 3. `VerifyTicket.jsx` / ticket view — owner name under the green "Verified owner" banner: invisible.
- [ ] 4. `ResaleMarketplace.jsx` — "NFT TRANSFER" badge text invisible; "NFT" badge on event cards invisible.
- [ ] 5. `AttendeeScreens.jsx` My Tickets — "NFT #56" and "MINTING" badge text invisible.
- [ ] 6. `AttendeeWallet.jsx` — info box text under the balance card: invisible.
- [ ] 7. Signup form — email field label/placeholder invisible; label-to-input gap should be 8px, group-to-group 16px (labels currently sit too far from inputs).

Add to the grep step: no `text-white` on light surfaces, no `text-gray-x00` on dark surfaces, without an explicit reason.

## P2 — UX gaps from tester feedback

- [ ] 8. After login the landing page flashes ~5s before redirecting. Add an auth-resolving state: minimal branded loading screen (logo + thin progress line) while session/role resolves, then route straight to the correct home. No landing flash.
- [ ] 9. Sessions expire after 12 hours of inactivity: frontend idle timeout (reset on interaction) + matching token lifetime on the backend.
- [ ] 10. Resell/send: when a user holds N tickets for an event, let them choose how many (1..N) to list or transfer; price applies per ticket.
- [ ] 11. `AttendeeWallet.jsx` — remove the redundant "My Wallet" title bar with back arrow; the wallet is a tab destination, the page heading is enough.
- [ ] 12. Dates/times app-wide: no ISO strings in mono ("2026-08-21", "05:42"). Human format — "Sat, Aug 21, 2026 · 5:42 PM" — in Manrope with tabular-nums. Mono only for tx hashes and ticket codes.
- [ ] 13. Payment-confirmed page uses emoji for date/location. Remove; thin Phosphor icons only. Grep the repo for emoji again.
- [ ] 14. Any attendee screen still on a dark canvas (event page, My Tickets, wallet, checkout) goes onto the white canvas. No dark mode anywhere.

One fix per commit, show diff, wait.
