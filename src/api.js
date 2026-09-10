const BASE_URL = import.meta.env.VITE_API_BASE || "https://master-events-backend.onrender.com/api";

const getToken = () => {
  try {
    const ls = localStorage.getItem("access_token");
    if (ls) return ls;
    const match = document.cookie.match(/(^| )me_access=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  } catch { return null; }
};

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Every call goes through here so a screen never has to think about status
// codes. `_status` is always present; `ok` tells you whether it worked.
const request = async (path, { method = "GET", body, auth = true, extraHeaders } = {}) => {
  const h = auth ? headers() : { "Content-Type": "application/json" };
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { ...h, ...(extraHeaders || {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    let json = {};
    try { json = await res.json(); } catch { json = {}; }
    if (Array.isArray(json)) return Object.assign([...json], { _status: res.status, ok: res.ok });
    return { ...json, _status: res.status, ok: res.ok };
  } catch {
    return { _status: 0, ok: false, error: "Connection error. Please check your network." };
  }
};

export const authAPI = {
  register: (data) => request("/auth/register/", { method: "POST", body: data, auth: false }),
  login:    (data) => request("/auth/login/",    { method: "POST", body: data, auth: false }),
  me:       ()     => request("/auth/me/"),
  resendVerification: (email) =>
    request("/auth/resend-verification/", { method: "POST", body: { email }, auth: false }),
};

export const eventsAPI = {
  list:        (params = "") => request(`/events/${params}`, { auth: !!getToken() }),
  detail:      (id)   => request(`/events/${id}/`),
  bySlug:      (slug) => request(`/events/slug/${slug}/`, { auth: false }),
  create:      (data) => request("/events/create/", { method: "POST", body: data }),
  myEvents:    ()     => request("/events/my-events/"),
  toggleSales: (id)   => request(`/events/${id}/toggle-sales/`, { method: "POST" }),
  // A rejected event can be fixed and sent back for review.
  resubmit:    (id)   => request(`/events/${id}/resubmit/`, { method: "POST" }),
};

// ═══════════════════════════════════════════════════════════════
//  CHECKOUT
//
//  The server prices the order — we send what we want, never an amount.
//    initialize({event_id, tier_id, quantity})  → { access_code, reference }
//    Paystack collects
//    verify(reference)                          → { state, tickets }
//
//  verify() can come back "pending" when Paystack hasn't finished. That is
//  not an error: awaitTickets() keeps asking the order endpoint until the
//  webhook lands, so a slow network never loses somebody's ticket.
// ═══════════════════════════════════════════════════════════════

export const paymentsAPI = {
  initialize: ({ event_id, tier_id, quantity, pay_with_credits }) =>
    request("/payments/initialize/", {
      method: "POST",
      body: { event_id, quantity, ...(tier_id ? { tier_id } : {}), ...(pay_with_credits ? { pay_with_credits: true } : {}) },
    }),

  verify: (reference) => request("/payments/verify/", { method: "POST", body: { reference } }),

  orderStatus: (reference) => request(`/payments/orders/${reference}/`),

  // Poll until the payment is confirmed. Returns the same shape as verify().
  awaitTickets: async (reference, { attempts = 10, delayMs = 3000 } = {}) => {
    let last = await paymentsAPI.verify(reference);
    if (last.state === "fulfilled" || last.state === "failed" || last.state === "sold_out") return last;
    for (let i = 0; i < attempts; i++) {
      await new Promise(r => setTimeout(r, delayMs));
      const res = await paymentsAPI.orderStatus(reference);
      if (res.ok && res.order?.status === "fulfilled") {
        return { ...res, state: "fulfilled", tickets: res.tickets || [], count: (res.tickets || []).length, ok: true };
      }
      if (res.ok && ["failed", "cancelled", "expired", "refunded"].includes(res.order?.status)) {
        return { ...res, state: "failed", message: "Payment was not completed." };
      }
      last = res;
    }
    return { ...last, state: "pending", message: "Payment received — your ticket will appear in My Tickets shortly." };
  },

  // Organizer earnings (ledger-backed; same shape the wallet screen already reads)
  wallet:       () => request("/payments/wallet/"),
  withdraw:     (data) => request("/payments/withdraw/", { method: "POST", body: data }),
  transactions: () => request("/payments/transactions/"),

  // Attendee Master Events Credits. Closed loop — spendable, not withdrawable.
  attendeeWallet: () => request("/payments/attendee-wallet/"),
};

// ═══════════════════════════════════════════════════════════════
//  RESALE
// ═══════════════════════════════════════════════════════════════

// The marketplace moved to its own app and the row shape changed. Normalising
// here keeps every existing screen working off the field names it already uses.
const normaliseListing = (l) => ({
  ...l,
  listing_id:     l.id,
  ticket_id:      l.ticket_id,
  resale_price:   parseFloat(l.price),
  original_price: parseFloat(l.original_price),
  seller:         l.seller,
  is_transfer:    true,
});

export const resaleAPI = {
  listings: async (eventId) => {
    const data = await request(`/resale/${eventId ? `?event_id=${eventId}` : ""}`, { auth: !!getToken() });
    return Array.isArray(data) ? data.map(normaliseListing) : [];
  },

  mine: async () => {
    const data = await request("/resale/mine/");
    return Array.isArray(data) ? data.map(normaliseListing) : [];
  },

  // What the seller actually receives after the platform fee.
  quote: (price) => request(`/resale/quote/?price=${encodeURIComponent(price)}`, { auth: false }),

  list:   ({ ticket_id, price }) => request("/resale/list/", { method: "POST", body: { ticket_id, price } }),
  cancel: (listingId) => request(`/resale/${listingId}/cancel/`, { method: "POST" }),

  // Server prices it from the listing — we only say which listing and how we pay.
  checkout: (listingId, { pay_with_credits } = {}) =>
    request(`/resale/${listingId}/checkout/`, {
      method: "POST",
      body: pay_with_credits ? { pay_with_credits: true } : {},
    }),
};

// ═══════════════════════════════════════════════════════════════
//  TICKETS
// ═══════════════════════════════════════════════════════════════

export const ticketsAPI = {
  myTickets:    () => request("/tickets/my/"),
  transfer:     (data) => request("/tickets/transfer/", { method: "POST", body: data }),
  registerFree: (data) => request("/tickets/register-free/", { method: "POST", body: data }),
  publicScan:   (data) => request("/tickets/scan/public/", { method: "POST", body: data, auth: false }),
  publicVerify: (ticketId) => request(`/tickets/verify/${ticketId}/`, { auth: false }),
  eventTickets: (eventId) => request(`/tickets/event/${eventId}/`),
  platformStats:() => request("/tickets/platform-stats/", { auth: false }),

  // Kept so older call sites still resolve. Both now run through the order flow.
  resaleListings: () => resaleAPI.listings(),
  listForResale:  ({ ticket_id, resale_price, price }) => resaleAPI.list({ ticket_id, price: resale_price ?? price }),
};

// ═══════════════════════════════════════════════════════════════
//  DOOR SCANNING
//
//  Signing in with a door code returns a scan token. Every scan must carry
//  it as X-Scan-Token — a logged-in account is no longer enough to admit
//  somebody, which is the point.
// ═══════════════════════════════════════════════════════════════

const SCAN_TOKEN_KEY = "me_scan_token";
const SCAN_EVENT_KEY = "me_scan_event";

export const scanAPI = {
  getToken:   () => { try { return localStorage.getItem(SCAN_TOKEN_KEY); } catch { return null; } },
  getEventId: () => { try { return JSON.parse(localStorage.getItem(SCAN_EVENT_KEY) || "null")?.event_id ?? null; } catch { return null; } },
  getSession: () => { try { return JSON.parse(localStorage.getItem(SCAN_EVENT_KEY) || "null"); } catch { return null; } },

  login: async (code) => {
    const res = await request("/scanning/login/", { method: "POST", body: { code, device_label: navigator.userAgent.slice(0, 100) }, auth: false });
    if (res.ok && res.scan_token) {
      try {
        localStorage.setItem(SCAN_TOKEN_KEY, res.scan_token);
        localStorage.setItem(SCAN_EVENT_KEY, JSON.stringify({
          event_id: res.event_id, event_name: res.event_name,
          event_date: res.event_date, venue: res.venue, expires_at: res.expires_at,
        }));
      } catch { /* private mode — the token still works for this session */ }
    }
    return res;
  },

  logout: async () => {
    const token = scanAPI.getToken();
    if (token) await request("/scanning/logout/", { method: "POST", auth: false, extraHeaders: { "X-Scan-Token": token } });
    try { localStorage.removeItem(SCAN_TOKEN_KEY); localStorage.removeItem(SCAN_EVENT_KEY); } catch { /* ignore */ }
  },

  // Works two ways: a door-code device (scan token) or an organizer / assigned
  // staff member signed in normally (JWT + event_id).
  scan: (qr_data, eventId) => {
    const token = scanAPI.getToken();
    const event_id = eventId ?? scanAPI.getEventId();
    return request("/scanning/scan/", {
      method: "POST",
      body: { qr_data, ...(event_id ? { event_id } : {}) },
      auth: !token,
      extraHeaders: token ? { "X-Scan-Token": token } : undefined,
    });
  },

  myEvents:      () => request("/scanning/my-events/"),
  stats:         (eventId) => request(`/scanning/events/${eventId}/stats/`),
  logs:          (eventId, result) => request(`/scanning/events/${eventId}/logs/${result ? `?result=${result}` : ""}`),
  generateCode:  (eventId, body = {}) => request(`/scanning/events/${eventId}/door-code/`, { method: "POST", body }),
  doorCodes:     (eventId) => request(`/scanning/events/${eventId}/door-codes/`),
  staff:         (eventId) => request(`/scanning/events/${eventId}/staff/`),
  addStaff:      (eventId, email, role = "scanner") => request(`/scanning/events/${eventId}/staff/`, { method: "POST", body: { email, role } }),
  removeStaff:   (eventId, staffId) => request(`/scanning/events/${eventId}/staff/${staffId}/`, { method: "DELETE" }),
};

// ═══════════════════════════════════════════════════════════════
//  ORGANIZER
// ═══════════════════════════════════════════════════════════════

export const organizersAPI = {
  profile:            () => request("/organizers/me/"),
  updateProfile:      (data) => request("/organizers/me/", { method: "PATCH", body: data }),
  submitVerification: (data) => request("/organizers/me/submit-verification/", { method: "POST", body: data }),
  payoutAccounts:     () => request("/organizers/me/payout-accounts/"),
  addPayoutAccount:   (data) => request("/organizers/me/payout-accounts/", { method: "POST", body: data }),
  setDefaultAccount:  (id) => request(`/organizers/me/payout-accounts/${id}/`, { method: "POST" }),
  removeAccount:      (id) => request(`/organizers/me/payout-accounts/${id}/`, { method: "DELETE" }),
  banks:              (type) => request(`/organizers/banks/${type ? `?type=${type}` : ""}`),
  publicProfile:      (id) => request(`/organizers/${id}/`, { auth: false }),
};

export const ledgerAPI = {
  earnings:      () => request("/ledger/earnings/"),
  settlements:   (eventId) => request(`/ledger/settlements/${eventId ? `?event_id=${eventId}` : ""}`),
  payouts:       () => request("/ledger/payouts/"),
  requestPayout: (amount, payout_account_id) =>
    request("/ledger/payouts/", { method: "POST", body: { amount, ...(payout_account_id ? { payout_account_id } : {}) } }),
  credits:       () => request("/ledger/credits/"),
};

// ═══════════════════════════════════════════════════════════════
//  REFUNDS + NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const refundsAPI = {
  policy:   (eventId) => request(`/refunds/events/${eventId}/policy/`, { auth: false }),
  request:  (data) => request("/refunds/request/", { method: "POST", body: data }),
  mine:     () => request("/refunds/mine/"),
  organizer:(eventId) => request(`/refunds/organizer/${eventId ? `?event_id=${eventId}` : ""}`),
  cancelEvent: (eventId, reason) => request(`/refunds/events/${eventId}/cancel/`, { method: "POST", body: { reason } }),
};

export const notificationsAPI = {
  list:           (unreadOnly) => request(`/notifications/${unreadOnly ? "?unread=true" : ""}`),
  unreadCount:    () => request("/notifications/unread-count/"),
  markRead:       (ids) => request("/notifications/read/", { method: "POST", body: ids ? { ids } : {} }),
  preferences:    () => request("/notifications/preferences/"),
  setPreferences: (data) => request("/notifications/preferences/", { method: "PATCH", body: data }),
};

// ═══════════════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════════════

// The admin portal keeps its own session under `admin_access_token` — a
// super admin can be signed in as themselves and as an admin at the same time,
// and the admin token is the one that carries the `mfa` claim. Every admin call
// goes out with that token, never the attendee one.
const adminToken = () => {
  try { return localStorage.getItem("admin_access_token"); } catch { return null; }
};
const arequest = (path, opts = {}) => {
  const t = adminToken();
  return request(path, {
    ...opts,
    extraHeaders: { ...(opts.extraHeaders || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  });
};

export const adminAPI = {
  // otp is only needed once the admin has enrolled an authenticator app.
  login: (email, password, otp) =>
    request("/admin/login/", { method: "POST", body: { email, password, ...(otp ? { otp } : {}) }, auth: false }),

  overview:      () => arequest("/admin/overview/"),
  events:        (status, search) => arequest(`/admin/events/?status=${status || ""}&search=${encodeURIComponent(search || "")}`),
  eventDetail:   (id) => arequest(`/admin/events/${id}/`),
  approveEvent:  (id, notes) => arequest(`/admin/events/${id}/approve/`, { method: "POST", body: { notes } }),
  rejectEvent:   (id, reason) => arequest(`/admin/events/${id}/reject/`, { method: "POST", body: { reason } }),
  suspendEvent:  (id, reason) => arequest(`/admin/events/${id}/suspend/`, { method: "POST", body: { reason } }),
  reinstateEvent:(id, reason) => arequest(`/admin/events/${id}/reinstate/`, { method: "POST", body: { reason } }),

  organizers:    () => arequest("/admin/organizers/"),
  users:         (params = "") => arequest(`/admin/users/${params}`),
  userDetail:    (id) => arequest(`/admin/users/${id}/`),
  suspendUser:   (id, reason) => arequest(`/admin/users/${id}/suspend/`, { method: "POST", body: { reason } }),

  orders:        (params = "") => arequest(`/admin/orders/${params}`),
  orderDetail:   (ref) => arequest(`/admin/orders/${ref}/`),
  payments:      (params = "") => arequest(`/admin/payments/${params}`),
  webhooks:      (params = "") => arequest(`/admin/webhooks/${params}`),
  replayWebhook: (id) => arequest(`/admin/webhooks/${id}/replay/`, { method: "POST" }),
  transactions:  () => arequest("/admin/transactions/"),
  ticketHolders: (search) => arequest(`/admin/ticket-holders/${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  liveActivity:  () => arequest("/admin/live-activity/"),
  auditLogs:     (params = "") => arequest(`/admin/audit-logs/${params}`),
  settings:      () => arequest("/admin/settings/"),
  setSetting:    (key, value, reason) => arequest("/admin/settings/", { method: "POST", body: { key, value, reason } }),

  mfaStatus:  () => arequest("/admin/mfa/status/"),
  mfaSetup:   () => arequest("/admin/mfa/setup/", { method: "POST" }),
  mfaConfirm: (code) => arequest("/admin/mfa/confirm/", { method: "POST", body: { code } }),

  // Organizer verification queue
  organizerQueue:     (status) => arequest(`/organizers/admin/?status=${status || ""}`),
  verifyOrganizer:    (id, notes) => arequest(`/organizers/admin/${id}/verify/`, { method: "POST", body: { notes } }),
  rejectOrganizer:    (id, reason) => arequest(`/organizers/admin/${id}/reject/`, { method: "POST", body: { reason } }),
  suspendOrganizer:   (id, reason) => arequest(`/organizers/admin/${id}/suspend/`, { method: "POST", body: { reason } }),
  reinstateOrganizer: (id, reason) => arequest(`/organizers/admin/${id}/reinstate/`, { method: "POST", body: { reason } }),

  // Money
  ledgerOverview: () => arequest("/ledger/admin/overview/"),
  ledgerEntries:  (params = "") => arequest(`/ledger/admin/entries/${params}`),
  adminPayouts:   (status) => arequest(`/ledger/admin/payouts/${status ? `?status=${status}` : ""}`),
  markPayoutPaid: (id, provider_reference, note) =>
    arequest(`/ledger/admin/payouts/${id}/mark-paid/`, { method: "POST", body: { provider_reference, note } }),
  markPayoutFailed: (id, reason) => arequest(`/ledger/admin/payouts/${id}/mark-failed/`, { method: "POST", body: { reason } }),
  settlements:    (params = "") => arequest(`/ledger/admin/settlements/${params}`),
  reconcile:      () => arequest("/ledger/admin/reconcile/", { method: "POST" }),
  issues:         (status) => arequest(`/ledger/admin/issues/${status ? `?status=${status}` : ""}`),

  // Refunds
  refunds:       (status) => arequest(`/refunds/admin/?status=${status || "open"}`),
  approveRefund: (id, notes, method) => arequest(`/refunds/admin/${id}/approve/`, { method: "POST", body: { notes, method } }),
  rejectRefund:  (id, reason) => arequest(`/refunds/admin/${id}/reject/`, { method: "POST", body: { reason } }),
  retryRefund:   (id) => arequest(`/refunds/admin/${id}/retry/`, { method: "POST" }),

  // NFT
  nftStats:   () => arequest("/nft/admin/stats/"),
  nftList:    (status) => arequest(`/nft/admin/list/?status=${status || "failed"}`),
  requeueMint:(ref) => arequest(`/nft/admin/${ref}/requeue/`, { method: "POST" }),
};

export default {
  authAPI, eventsAPI, ticketsAPI, paymentsAPI, resaleAPI,
  scanAPI, organizersAPI, ledgerAPI, refundsAPI, notificationsAPI, adminAPI,
};
