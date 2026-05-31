const BASE_URL = "https://master-events-backend.onrender.com/api";

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

export const authAPI = {
  register: (data) =>
    fetch(`${BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  login: (data) =>
    fetch(`${BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  me: () =>
    fetch(`${BASE_URL}/auth/me/`, { headers: headers() }).then(r => r.json()),
};

export const eventsAPI = {
  list: (params = "") =>
    fetch(`${BASE_URL}/events/${params}`, { headers: headers() }).then(r => r.json()),

  detail: (id) =>
    fetch(`${BASE_URL}/events/${id}/`, { headers: headers() }).then(r => r.json()),

  create: (data) =>
    fetch(`${BASE_URL}/events/create/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  myEvents: () =>
    fetch(`${BASE_URL}/events/my-events/`, { headers: headers() }).then(r => r.json()),

  toggleSales: (id) =>
    fetch(`${BASE_URL}/events/${id}/toggle-sales/`, {
      method: "POST",
      headers: headers(),
    }).then(r => r.json()),
};

export const ticketsAPI = {
  myTickets: () =>
    fetch(`${BASE_URL}/tickets/my/`, { headers: headers() }).then(r => r.json()),

  purchase: async (data) => {
    const res = await fetch(`${BASE_URL}/tickets/purchase/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { ...json, _status: res.status };
  },

  transfer: (data) =>
    fetch(`${BASE_URL}/tickets/transfer/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  verify: (data) =>
    fetch(`${BASE_URL}/tickets/verify/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  publicScan: (data) =>
    fetch(`${BASE_URL}/tickets/scan/public/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  generateDoorCode: (eventId) =>
    fetch(`${BASE_URL}/tickets/event/${eventId}/door-code/`, {
      method: "POST",
      headers: headers(),
    }).then(r => r.json()),

  doorStaffLogin: (code) =>
    fetch(`${BASE_URL}/tickets/door-staff/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).then(r => r.json()),

  // ── Resale marketplace ────────────────────────────────────
  resaleListings: () =>
    fetch(`${BASE_URL}/tickets/resale/`, {
      headers: headers(),
    }).then(r => r.json()),

  buyResale: async (data) => {
    const res = await fetch(`${BASE_URL}/tickets/resale/buy/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { ...json, _status: res.status };
  },

  listForResale: (data) =>
    fetch(`${BASE_URL}/tickets/resale/list/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  cancelResale: (ticket_id) =>
    fetch(`${BASE_URL}/tickets/resale/cancel/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ ticket_id }),
    }).then(r => r.json()),

  // ── Payment init ──────────────────────────────────────────
  initializePayment: async (data) => {
    const res = await fetch(`${BASE_URL}/payments/initialize/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { ...json, _status: res.status };
  },
};

export const paymentsAPI = {
  wallet: () =>
    fetch(`${BASE_URL}/payments/wallet/`, { headers: headers() }).then(r => r.json()),

  withdraw: (data) =>
    fetch(`${BASE_URL}/payments/withdraw/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  transactions: () =>
    fetch(`${BASE_URL}/payments/transactions/`, { headers: headers() }).then(r => r.json()),

  attendeeWallet: () =>
    fetch(`${BASE_URL}/payments/attendee-wallet/`, { headers: headers() }).then(r => r.json()),

  attendeeWithdraw: (data) =>
    fetch(`${BASE_URL}/payments/attendee-withdraw/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),
};