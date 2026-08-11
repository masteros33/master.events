import { create } from "zustand";
import toast from "react-hot-toast";
import { DEMO_ORG_EVENTS } from "../constants/data";
import { authAPI, eventsAPI, ticketsAPI } from "../api";

const BACKEND = "https://master-events-backend.onrender.com";
const ping = () => fetch(BACKEND + "/health/").catch(() => {});
ping();
setInterval(ping, 5 * 60 * 1000);

const categoryImages = {
  music:    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  tech:     "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600",
  food:     "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
  arts:     "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600",
  sports:   "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
  other:    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
};

function setCookie(name, value, days = 30) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
  } catch {}
}
function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  } catch { return null; }
}
function removeCookie(name) {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  } catch {}
}

function saveSession(data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem("me_session", json);
    setCookie("me_session", json, 30);
    setCookie("me_role",    data.role || "", 30);
    setCookie("me_name",    data.currentUser?.first_name || "", 30);
  } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem("me_session") || getCookie("me_session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveTokens(access, refresh) {
  try {
    localStorage.setItem("access_token",  access);
    localStorage.setItem("refresh_token", refresh);
    setCookie("me_access",  access,  1);
    setCookie("me_refresh", refresh, 30);
  } catch {}
}

function getToken() {
  try {
    return localStorage.getItem("access_token") || getCookie("me_access") || null;
  } catch { return null; }
}

function clearSession() {
  try {
    ["me_session","access_token","refresh_token"].forEach(k => localStorage.removeItem(k));
    ["me_session","me_access","me_refresh","me_role","me_name"].forEach(removeCookie);
  } catch {}
}

// ── Detect event slug at boot time before any redirect clears the URL ──
const _bootSlug = (new URLSearchParams(window.location.search)).get("event") ||
  (window.location.pathname.match(/^\/events\/(.+)/) || [])[1];
if (_bootSlug) {
  localStorage.setItem("pending_event_slug", _bootSlug);
}

const saved     = loadSession();
const token     = getToken();
const bootState = saved && token ? {
  currentUser: saved.currentUser,
  role:        saved.role,
  isLoggedIn:  true,
  screen:      _bootSlug ? "pendingEvent" : "app",
  activeTab:   saved.role === "organizer" ? "dashboard" : "home",
} : {
  currentUser: null,
  role:        null,
  isLoggedIn:  false,
  screen:      _bootSlug ? "pendingEvent" : "home",
  activeTab:   "home",
};

let _isRestoringFromHistory = false;
export function _setRestoringFromHistory(v) { _isRestoringFromHistory = v; }

const useStore = create((set, get) => ({

  // ── Navigation ─────────────────────────────────────────────
  screen:       bootState.screen,
  activeTab:    bootState.activeTab,
  setScreen:    (screen)    => set({ screen }),
  setActiveTab: (activeTab) => set({ activeTab }),

  // ── Auth ───────────────────────────────────────────────────
  currentUser:    bootState.currentUser,
  role:           bootState.role,
  isLoggedIn:     bootState.isLoggedIn,
  email:          "",
  password:       "",
  loginError:     "",
  signupData:     {},
  fullName:       "",
  signupEmail:    "",
  signupPassword: "",
  signupError:    "",
  setEmail:          (v) => set({ email: v }),
  setPassword:       (v) => set({ password: v }),
  setFullName:       (v) => set({ fullName: v }),
  setSignupEmail:    (v) => set({ signupEmail: v }),
  setSignupPassword: (v) => set({ signupPassword: v }),
  setSignupData:     (v) => set({ signupData: v }),

  handleLogin: async () => {
    const { authAPI } = await import("../api");
    const { email, password } = get();
    set({ loginError: "" });
    try {
      const data = await authAPI.login({ email, password });
      if (data.tokens) {
        saveTokens(data.tokens.access, data.tokens.refresh);
        const user     = data.user;
        const firstTab = user.role === "organizer" ? "dashboard" : "home";
        saveSession({ currentUser: user, role: user.role });
        const postAuthScreen = localStorage.getItem("post_auth_screen") || "app";
        localStorage.removeItem("post_auth_screen");
        set({
          currentUser: user, role: user.role,
          screen: postAuthScreen, activeTab: firstTab,
          isLoggedIn: true, loginError: "",
        });
        toast.success("Welcome back, " + user.first_name + "!");
        if (user.role === "organizer") {
          try {
            const { eventsAPI } = await import("../api");
            const events = await eventsAPI.myEvents();
            if (Array.isArray(events) && events.length > 0) {
              set({
                orgEvents: events.map(e => ({
                  id: e.id, name: e.name, date: e.date, venue: e.venue,
                  category: e.category, price: parseFloat(e.price),
                  totalTickets: e.total_tickets, ticketsSold: e.tickets_sold || 0,
                  salesOpen: e.sales_open, description: e.description,
                  image: e.image || categoryImages[e.category] || categoryImages.other,
                }))
              });
            } else {
              set({ orgEvents: DEMO_ORG_EVENTS.map(e => ({ ...e })) });
            }
          } catch {
            set({ orgEvents: DEMO_ORG_EVENTS.map(e => ({ ...e })) });
          }
        }
      } else {
        set({ loginError: data.detail || "Invalid email or password" });
      }
    } catch {
      set({ loginError: "Connection error. Please try again." });
    }
  },

  handleSignup: async () => {
    const { authAPI } = await import("../api");
    const { fullName, signupEmail, signupPassword, signupData } = get();
    const parts      = fullName.trim().split(" ");
    const first_name = parts[0] || "";
    const last_name  = parts.slice(1).join(" ") || "";
    set({ signupError: "" });
    if (!fullName || !signupEmail || !signupPassword) {
      set({ signupError: "Please fill all fields" }); return;
    }
    try {
      const data = await authAPI.register({
        first_name, last_name,
        email: signupEmail, password: signupPassword,
        phone: signupData.phone || "", role: signupData.role || "attendee",
      });
      if (data.tokens) {
        saveTokens(data.tokens.access, data.tokens.refresh);
        const user     = data.user;
        const firstTab = user.role === "organizer" ? "dashboard" : "home";
        saveSession({ currentUser: user, role: user.role });
        const postAuthScreen = localStorage.getItem("post_auth_screen") || "app";
        localStorage.removeItem("post_auth_screen");
        set({
          currentUser: user, role: user.role,
          screen: postAuthScreen, activeTab: firstTab,
          isLoggedIn: true, signupError: "",
        });
        toast.success("Welcome to Master Events, " + user.first_name + "!");
      } else {
        set({ signupError: data.email?.[0] || data.password?.[0] || "Registration failed" });
      }
    } catch {
      set({ signupError: "Connection error. Please try again." });
    }
  },

  handleSelectRole: (role) => {
    const firstTab = role === "organizer" ? "dashboard" : "home";
    set({ role, screen: "app", activeTab: firstTab });
  },

  // ── Logout ─────────────────────────────────────────────────
  handleLogout: async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      const access  = localStorage.getItem("access_token");
      if (refresh && access) {
        await fetch(`${BACKEND}/api/auth/logout/`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${access}`,
          },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch (e) {
      console.log("Logout blacklist failed (non-critical):", e);
    }
    clearSession();
    toast.success("Logged out successfully");
    set({
      screen:      "home",
      currentUser: null,
      role:        null,
      isLoggedIn:  false,
      activeTab:   "home",
      myTickets:   [],
      orgEvents:   [],
    });
  },

  // ── Onboarding ─────────────────────────────────────────────
  onboardSlide: 0,
  setOnboardSlide: (v) => set({ onboardSlide: v }),

  // ── UI ─────────────────────────────────────────────────────
  menuOpen:    false,
  setMenuOpen: (v) => set({ menuOpen: v }),

  // ── Password reset params ──────────────────────────────────
  resetPasswordParams:    null,
  setResetPasswordParams: (v) => set({ resetPasswordParams: v }),

  // ── Ticket notification ────────────────────────────────────
  newTicketCount:        0,
  showSuccessToast:      false,
  successToastTicket:    null,
  setNewTicketCount:     (v) => set({ newTicketCount: v }),
  setShowSuccessToast:   (v) => set({ showSuccessToast: v }),
  setSuccessToastTicket: (v) => set({ successToastTicket: v }),

  // ── Events / Search ────────────────────────────────────────
  searchQ:         "",
  setSearchQ:      (v) => set({ searchQ: v }),
  overlayEvent:    null,
  setOverlayEvent: (v) => set({ overlayEvent: v }),

  // ── Tickets ────────────────────────────────────────────────
  myTickets:        [],
  resaleListings:   [],
  checkoutEvent:    null,
  ticketQty:        1,
  payMethod:        "momo",
  viewingTicket:    null,
  selectedTier:     null,
  // ── NEW: holds the full batch from a multi-ticket purchase, so
  // PaymentSuccess can show "You got 3 tickets" instead of just one ──
  lastPurchaseBatch: null,
  setCheckoutEvent: (v) => set({ checkoutEvent: v }),
  setTicketQty:     (v) => set({ ticketQty: v }),
  setPayMethod:     (v) => set({ payMethod: v }),
  setViewingTicket: (v) => set({ viewingTicket: v }),
  setSelectedTier:  (v) => set({ selectedTier: v }),

  handleRegisterFree: async () => {
    const { checkoutEvent } = get();
    if (!checkoutEvent) return;
    const loadingToast = toast.loading("Registering...");
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${BACKEND}/api/tickets/register-free/`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ event_id: checkoutEvent.id, quantity: 1 }),
      });
      const data = await res.json();

      if (res.ok && (data.registration_id || data.id)) {
        const registration = {
          id:           data.registration_id || data.id,
          ticket_id:    data.registration_id || data.id,
          event: {
            id:    checkoutEvent.id,
            name:  checkoutEvent.name,
            date:  checkoutEvent.date,
            venue: checkoutEvent.venue,
            price: 0,
            image: checkoutEvent.image,
          },
          qty:          1,
          quantity:     1,
          purchasedAt:  new Date().toLocaleDateString(),
          status:       data.status || "active",
          qr_data:      data.qr_data      || null,
          qr_base64:    data.qr_base64    || null,
          qr_image_url: data.qr_image_url || null,
          qr_image:     data.qr_image
            ? (data.qr_image.startsWith("http") ? data.qr_image : BACKEND + data.qr_image)
            : null,
          is_free_registration: true,
        };

        set({
          myTickets:          [...get().myTickets, registration],
          checkoutEvent:      null,
          selectedTier:       null,
          overlayEvent:       null,
          activeTab:          "tickets",
          screen:             "paymentSuccess",
          viewingTicket:      registration,
          lastPurchaseBatch:  [registration],
          newTicketCount:     (get().newTicketCount || 0) + 1,
          successToastTicket: registration,
          showSuccessToast:   true,
        });
        toast.dismiss(loadingToast);
        toast.success("🎉 Registered! Check your email for your entry pass.");
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Registration failed. Please try again.");
      }
    } catch (e) {
      console.error("Free registration error:", e);
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please try again.");
    }
  },

  // ── handleBuyTicket — rewritten for the new purchase_ticket
  // response shape: { tickets: [...], count, message } instead of a
  // single ticket object. Each unit purchased is now its own real
  // Ticket row (own QR, own NFT, own identity) — so a qty-3 purchase
  // returns 3 separate ticket objects, all added to myTickets, with
  // the FIRST one shown on PaymentSuccess/viewingTicket and the full
  // batch stored in lastPurchaseBatch for a "you got N tickets"
  // summary view if PaymentSuccess wants to show one. ──
  handleBuyTicket: async (paymentReference) => {
    const { ticketsAPI } = await import("../api");
    const { checkoutEvent, ticketQty, payMethod, myTickets, selectedTier } = get();
    const loadingToast = toast.loading("Verifying payment...");

    const buildTicketFrom = (raw) => ({
      id:           raw.ticket_id || raw.id,
      ticket_id:    raw.ticket_id || raw.id,
      event: {
        ...(raw.event || {}),
        id:       raw.event?.id       || checkoutEvent?.id,
        name:     raw.event?.name     || checkoutEvent?.name,
        date:     raw.event?.date     || checkoutEvent?.date,
        time:     raw.event?.time     || checkoutEvent?.time,
        venue:    raw.event?.venue    || checkoutEvent?.venue,
        city:     raw.event?.city     || checkoutEvent?.city,
        category: raw.event?.category || checkoutEvent?.category,
        price:    raw.event?.price    || checkoutEvent?.price,
        image:    raw.event?.image    || checkoutEvent?.image,
      },
      tierName:     raw.tier?.name    || selectedTier?.name || null,
      // ── Each row is now individually quantity=1 from the backend —
      // qty/quantity here reflect that single unit, not the original
      // basket size. ──
      qty:          raw.quantity || 1,
      quantity:     raw.quantity || 1,
      payMethod,
      purchasedAt:  new Date().toLocaleDateString(),
      owner:        typeof raw.owner === "object"
        ? ((raw.owner?.first_name || "") + " " + (raw.owner?.last_name || "")).trim()
        : (raw.owner || ""),
      ownerEmail:   raw.owner?.email || null,
      status:       raw.status       || "active",
      qr_data:      raw.qr_data      || null,
      dynamic_qr:   raw.dynamic_qr   || null,
      qr_base64:    raw.dynamic_qr   || raw.qr_base64 || null,
      qr_image_url: raw.qr_image_url || null,
      qr_image:     raw.qr_image
        ? (raw.qr_image.startsWith("http") ? raw.qr_image : BACKEND + raw.qr_image)
        : null,
      nft_tx_hash:  raw.nft_tx_hash  || null,
      nft_token_id: raw.nft_token_id || null,
      nft_minting:  true,
    });

    const showBatchSuccess = (rawTickets) => {
      const built = rawTickets.map(buildTicketFrom);
      toast.dismiss();
      set({
        myTickets:          [...get().myTickets, ...built],
        checkoutEvent:      null,
        selectedTier:       null,
        overlayEvent:       null,
        activeTab:          "tickets",
        screen:             "paymentSuccess",
        viewingTicket:      built[0],
        lastPurchaseBatch:  built,
        newTicketCount:     (get().newTicketCount || 0) + built.length,
        successToastTicket: built[0],
        showSuccessToast:   true,
      });
      toast.success(
        built.length > 1
          ? `🎉 ${built.length} tickets confirmed! Each one is yours to keep or gift.`
          : "🎉 Payment confirmed! Ticket is yours."
      );
    };

    const fetchAndShow = async () => {
      await new Promise(r => setTimeout(r, 2000));
      const tickets = await ticketsAPI.myTickets();
      if (Array.isArray(tickets) && tickets.length > 0) {
        // Match every ticket from this purchase by event, not just one —
        // a fallback fetch after a slow/timed-out request should still
        // surface the whole batch, not just the first match.
        const matches = tickets.filter(t =>
          t.event?.id   === checkoutEvent?.id ||
          t.event?.name === checkoutEvent?.name
        );
        const toShow = matches.length > 0 ? matches.slice(0, ticketQty) : [tickets[0]];
        showBatchSuccess(toShow);
        return true;
      }
      return false;
    };

    try {
      const reference = paymentReference ||
        ("PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase());

      let data;
      try {
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 120000);
        const body = {
          event_id:          checkoutEvent.id,
          quantity:          ticketQty,
          payment_reference: reference,
        };
        if (selectedTier?.id) body.tier_id = selectedTier.id;

        const res = await fetch(`${BACKEND}/api/tickets/purchase/`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        data = { ...await res.json(), _status: res.status };

      } catch (fetchErr) {
        toast.dismiss(loadingToast);
        toast.loading("Payment received — confirming ticket...");
        try {
          const shown = await fetchAndShow();
          if (!shown) {
            toast.dismiss();
            toast.error("Payment received — your ticket will appear in My Tickets shortly.");
            set({ screen: "app", activeTab: "tickets" });
          }
        } catch {
          toast.dismiss();
          toast.error("Payment received — your ticket will appear in My Tickets shortly.");
          set({ screen: "app", activeTab: "tickets" });
        }
        return;
      }

      if (data._status === 409) {
        toast.dismiss(loadingToast);
        toast.loading("Confirming your ticket...");
        try {
          const shown = await fetchAndShow();
          if (!shown) {
            toast.dismiss();
            toast.success("🎉 Payment confirmed! Check My Tickets.");
            set({ screen: "app", activeTab: "tickets", checkoutEvent: null, selectedTier: null });
          }
        } catch {
          toast.dismiss();
          toast.success("🎉 Payment confirmed! Check My Tickets.");
          set({ screen: "app", activeTab: "tickets", checkoutEvent: null, selectedTier: null });
        }
        return;
      }

      // ── NEW shape: { tickets: [...], count, message } ──
      const rawTickets = Array.isArray(data.tickets) ? data.tickets : null;
      const isSuccess  = data._status === 201 && rawTickets && rawTickets.length > 0;

      if (isSuccess) {
        showBatchSuccess(rawTickets);
        toast.dismiss(loadingToast);
      } else {
        toast.dismiss(loadingToast);
        const errMsg = data.error || data.detail || data.message ||
          (typeof data === "object"
            ? Object.values(data).filter(v => typeof v === "string").join(" ")
            : "Purchase failed.");
        toast.error(errMsg || "Purchase failed. Please try again.");
      }

    } catch (e) {
      console.error("Purchase error:", e);
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please try again.");
    }
  },

  // ── Resale ─────────────────────────────────────────────────
  resaleTicket: null, resalePrice: "", resaleError: "",
  setResaleTicket: (v) => set({ resaleTicket: v }),
  setResalePrice:  (v) => set({ resalePrice: v }),
  setResaleError:  (v) => set({ resaleError: v }),

  handleListForResale: async () => {
    const { resaleTicket, resalePrice, myTickets, resaleListings, currentUser } = get();
    const price = parseFloat(resalePrice);
    const orig  = resaleTicket.event.price;

    if (!price || isNaN(price)) { set({ resaleError: "Please enter a valid price." }); return; }
    if (price >= orig)           { set({ resaleError: "Must be less than original price (GHS " + orig + ")." }); return; }
    if (price < orig * 0.3)      { set({ resaleError: "Minimum resale price: GHS " + Math.floor(orig * 0.3) + "." }); return; }

    const loadingToast = toast.loading("Listing ticket...");
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${BACKEND}/api/tickets/resale/list/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          ticket_id:    resaleTicket.ticket_id || resaleTicket.id,
          resale_price: price,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        set({
          myTickets: myTickets.map(t =>
            t.id === resaleTicket.id ? { ...t, status: "resale", resalePrice: price } : t
          ),
          resaleListings: [...resaleListings, {
            ...resaleTicket, resalePrice: price,
            listedAt: new Date().toLocaleDateString(),
            seller: currentUser?.first_name,
          }],
          resaleTicket: null, resalePrice: "", resaleError: "",
          screen: "resaleSuccess",
        });
        toast.dismiss(loadingToast);
        toast.success("Ticket listed for resale!");
      } else {
        toast.dismiss(loadingToast);
        set({ resaleError: data.error || "Failed to list ticket." });
      }
    } catch {
      toast.dismiss(loadingToast);
      set({ resaleError: "Connection error. Try again." });
    }
  },

  handleCancelResale: async (ticketId) => {
    const { myTickets, resaleListings } = get();
    const ticket = myTickets.find(t => t.id === ticketId);

    try {
      const token = localStorage.getItem("access_token") || "";
      await fetch(`${BACKEND}/api/tickets/resale/cancel/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ticket_id: ticket?.ticket_id || ticketId }),
      });
    } catch {}

    set({
      myTickets:      myTickets.map(t => t.id === ticketId ? { ...t, status: "active", resalePrice: null } : t),
      resaleListings: resaleListings.filter(l => l.id !== ticketId),
    });
    toast.success("Resale listing cancelled");
  },

  // ── Transfer ───────────────────────────────────────────────
  transferTicket: null, transferEmail: "", transferName: "", transferDone: false,
  setTransferTicket: (v) => set({ transferTicket: v }),
  setTransferEmail:  (v) => set({ transferEmail: v }),
  setTransferName:   (v) => set({ transferName: v }),
  setTransferDone:   (v) => set({ transferDone: v }),

  handleTransfer: async () => {
    const { ticketsAPI } = await import("../api");
    const { transferEmail, transferTicket, myTickets } = get();
    if (!transferEmail) { toast.error("Please enter recipient email."); return; }
    const loadingToast = toast.loading("Transferring ticket...");
    try {
      const data = await ticketsAPI.transfer({
        ticket_id: transferTicket.ticket_id || transferTicket.id,
        to_email:  transferEmail,
      });
      if (data.message) {
        set({
          myTickets:    myTickets.filter(t => t.id !== transferTicket.id),
          transferDone: true,
        });
        toast.dismiss(loadingToast);
        toast.success("Ticket transferred successfully!");
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Transfer failed.");
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Connection error.");
    }
  },

  // ── Organizer ──────────────────────────────────────────────
  orgEvents: [], viewingOrgEvent: null,
  addEventForm: {
    name: "", subtitle: "", date: "", time: "",
    venue: "", city: "", price: "", description: "",
    category: "", totalTickets: "", image: "",
  },
  setOrgEvents:       (v) => set({ orgEvents: v }),
  setViewingOrgEvent: (v) => set({ viewingOrgEvent: v }),
  setAddEventForm:    (v) => set({ addEventForm: v }),

  handleAddEvent: async () => {
    const { eventsAPI } = await import("../api");
    const { addEventForm, orgEvents } = get();
    if (!addEventForm.name || !addEventForm.date) {
      toast.error("Please fill Event Name and Date"); return;
    }
    const loadingToast = toast.loading("Creating event...");
    try {
      const payload = {
        name:          addEventForm.name.trim(),
        description:   addEventForm.description?.trim() || "No description provided.",
        category:      addEventForm.category || "other",
        venue:         addEventForm.venue?.trim()  || "TBA",
        city:          addEventForm.city?.trim()   || "Accra",
        country:       addEventForm.country        || "Ghana",
        date:          addEventForm.date,
        time:          addEventForm.time || "20:00:00",
        event_type:    addEventForm.event_type     || "paid",
        currency:      addEventForm.currency       || "GHS",
        price:         parseFloat(addEventForm.price) || 0,
        total_tickets: parseInt(addEventForm.totalTickets) || 100,
        sales_open:    true,
      };
      if (addEventForm.image) payload.image = addEventForm.image;
      if (Array.isArray(addEventForm.ticket_tiers) && addEventForm.ticket_tiers.length) {
        payload.ticket_tiers = addEventForm.ticket_tiers;
      }
      const data = await eventsAPI.create(payload);
      if (data.id) {
        const cat = data.category || addEventForm.category || "other";
        set({
          orgEvents: [...orgEvents, {
            id: data.id, name: data.name, date: data.date, venue: data.venue,
            category: cat, price: parseFloat(data.price),
            totalTickets: data.total_tickets, ticketsSold: data.tickets_sold || 0,
            salesOpen: data.sales_open, description: data.description,
            event_type: data.event_type || "paid",
            currency: data.currency || "GHS",
            slug: data.slug || "",
            event_url: data.event_url || "",
            tiers: data.tiers || [],
            image: data.image || categoryImages[cat] || categoryImages.other,
          }],
          addEventForm: {
            name: "", subtitle: "", date: "", time: "", venue: "",
            city: "", price: "", description: "", category: "",
            totalTickets: "", image: "", event_type: "paid", currency: "GHS",
          },
          screen: "app", activeTab: "events",
        });
        toast.dismiss(loadingToast);
        toast.success("🎉 Event created successfully!");
      } else {
        toast.dismiss(loadingToast);
        const errMsg = typeof data === "object"
          ? Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
          : "Failed to create event.";
        toast.error(errMsg);
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please try again.");
    }
  },

  toggleSales: async (eventId) => {
    const { eventsAPI } = await import("../api");
    const { orgEvents } = get();
    try {
      const data    = await eventsAPI.toggleSales(eventId);
      const updated = orgEvents.map(e => e.id === eventId ? { ...e, salesOpen: data.sales_open } : e);
      set({ orgEvents: updated, viewingOrgEvent: updated.find(e => e.id === eventId) });
      toast.success(data.sales_open ? "Ticket sales resumed!" : "Ticket sales paused");
    } catch {
      const updated = orgEvents.map(e => e.id === eventId ? { ...e, salesOpen: !e.salesOpen } : e);
      set({ orgEvents: updated });
    }
  },

  // ── Door Staff ─────────────────────────────────────────────
  doorStaffInvites: {}, doorStaffUser: null,
  doorCode: "", doorCodeError: "",
  setDoorCode:      (v) => set({ doorCode: v.toUpperCase(), doorCodeError: "" }),
  setDoorCodeError: (v) => set({ doorCodeError: v }),

  generateDoorCode: async (eventId, eventName) => {
    const { ticketsAPI } = await import("../api");
    const loadingToast = toast.loading("Generating code...");
    try {
      const data = await ticketsAPI.generateDoorCode(eventId);
      if (data.code) {
        const invite = { code: data.code, eventId, eventName, used: false, createdAt: new Date().toLocaleTimeString() };
        set(state => ({
          doorStaffInvites: {
            ...state.doorStaffInvites,
            [eventId]: [...(state.doorStaffInvites[eventId] || []), invite],
          },
        }));
        toast.dismiss(loadingToast);
        toast.success("Code generated: " + data.code);
      }
    } catch {
      const chars  = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const rand   = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const code   = "DOOR-" + rand;
      const invite = { code, eventId, eventName, used: false, createdAt: new Date().toLocaleTimeString() };
      set(state => ({
        doorStaffInvites: {
          ...state.doorStaffInvites,
          [eventId]: [...(state.doorStaffInvites[eventId] || []), invite],
        },
      }));
      toast.dismiss(loadingToast);
      toast.success("Code generated: " + code);
    }
  },

  handleDoorStaffLogin: async () => {
    const { ticketsAPI } = await import("../api");
    const { doorCode, doorStaffInvites } = get();
    const trimmed = doorCode.trim().toUpperCase();
    try {
      const data = await ticketsAPI.doorStaffLogin(trimmed);
      if (data.valid) {
        set({
          doorStaffUser: {
            code: trimmed, eventId: data.event_id,
            eventName: data.event_name, name: "Door Staff",
          },
          admittedList: [], scanInput: "", scanResult: null,
          screen: "doorStaffScan", doorCodeError: "",
        });
        toast.success("Access granted: " + data.event_name);
        return;
      }
    } catch {}
    let found = null;
    Object.values(doorStaffInvites).forEach(invites => {
      invites.forEach(inv => { if (inv.code === trimmed) found = inv; });
    });
    if (!found)     { set({ doorCodeError: "Invalid code. Ask your organizer for a valid door staff code." }); return; }
    if (found.used) { set({ doorCodeError: "This code has already been used. Ask for a new one." }); return; }
    set(state => {
      const updated = { ...state.doorStaffInvites };
      updated[found.eventId] = updated[found.eventId].map(inv =>
        inv.code === trimmed ? { ...inv, used: true } : inv
      );
      return {
        doorStaffInvites: updated,
        doorStaffUser: {
          code: trimmed, eventId: found.eventId,
          eventName: found.eventName, name: "Door Staff",
        },
        admittedList: [], scanInput: "", scanResult: null,
        screen: "doorStaffScan",
      };
    });
  },

  // ── Scanner ────────────────────────────────────────────────
  scanInput: "", scanResult: null, verifying: false, admittedList: [],
  setScanInput:    (v) => set({ scanInput: v, scanResult: null }),
  setScanResult:   (v) => set({ scanResult: v }),
  setVerifying:    (v) => set({ verifying: v }),
  setAdmittedList: (v) => set({ admittedList: v }),

  handleAdmit: (isDoorStaff = false) => {
    const { scanResult, admittedList, orgEvents, doorStaffUser } = get();
    if (!scanResult?.ticket) return;
    const newList = [...admittedList, scanResult.ticket.tokenId];
    const updates = { admittedList: newList, scanInput: "", scanResult: null };
    if (isDoorStaff && doorStaffUser?.eventId) {
      updates.orgEvents = orgEvents.map(ev =>
        ev.id === doorStaffUser.eventId
          ? { ...ev, admittedCount: (ev.admittedCount || 0) + 1 }
          : ev
      );
    }
    set(updates);
  },

}));

if (typeof window !== "undefined") {
  window.history.replaceState(
    { screen: bootState.screen },
    "",
    window.location.pathname + window.location.search + window.location.hash
  );
  let _lastPushedScreen = bootState.screen;
  useStore.subscribe((state) => {
    if (state.screen !== _lastPushedScreen) {
      _lastPushedScreen = state.screen;
      if (!_isRestoringFromHistory) {
        window.history.pushState(
          { screen: state.screen },
          "",
          window.location.pathname + window.location.search + window.location.hash
        );
      }
    }
  });
}

export default useStore;