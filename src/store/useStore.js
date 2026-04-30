import { create } from "zustand";
import toast from "react-hot-toast";
import { DEMO_ORG_EVENTS } from "../constants/data";

const BACKEND = "https://master-events-backend.onrender.com";
const ping = () => fetch(BACKEND + "/api/events/").catch(() => {});
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

// ── Cookie helpers ────────────────────────────────────────────
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

// ── Session persistence ───────────────────────────────────────
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
    setCookie("me_access",  access,  1);   // 1 day
    setCookie("me_refresh", refresh, 30);  // 30 days
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

// ── Boot — restore session on page load ──────────────────────
const saved    = loadSession();
const token    = getToken();
const bootState = saved && token ? {
  currentUser: saved.currentUser,
  role:        saved.role,
  isLoggedIn:  true,
  screen:      "app",
  activeTab:   saved.role === "organizer" ? "dashboard" : "home",
} : {
  currentUser: null,
  role:        null,
  isLoggedIn:  false,
  screen:      "login",
  activeTab:   "home",
};

// ─────────────────────────────────────────────────────────────
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
  setEmail:           (v) => set({ email: v }),
  setPassword:        (v) => set({ password: v }),
  setFullName:        (v) => set({ fullName: v }),
  setSignupEmail:     (v) => set({ signupEmail: v }),
  setSignupPassword:  (v) => set({ signupPassword: v }),
  setSignupData:      (v) => set({ signupData: v }),

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
        set({
          currentUser: user, role: user.role,
          screen: "app", activeTab: firstTab,
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
        set({
          currentUser: user, role: user.role,
          screen: "app", activeTab: firstTab,
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

  handleLogout: () => {
    clearSession();
    toast.success("Logged out successfully");
    set({
      screen: "login", currentUser: null, role: null,
      isLoggedIn: false, menuOpen: false,
      email: "", password: "", loginError: "", activeTab: "home",
      overlayEvent: null, checkoutEvent: null,
      doorStaffUser: null, doorCode: "", doorCodeError: "",
      doorStaffInvites: {}, orgEvents: [], myTickets: [],
    });
  },

  // ── Onboarding ─────────────────────────────────────────────
  onboardSlide: 0,
  setOnboardSlide: (v) => set({ onboardSlide: v }),

  // ── UI ─────────────────────────────────────────────────────
  menuOpen:    false,
  setMenuOpen: (v) => set({ menuOpen: v }),

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
  setCheckoutEvent: (v) => set({ checkoutEvent: v }),
  setTicketQty:     (v) => set({ ticketQty: v }),
  setPayMethod:     (v) => set({ payMethod: v }),
  setViewingTicket: (v) => set({ viewingTicket: v }),

handleBuyTicket: async () => {
  const { ticketsAPI } = await import("../api");
  const { checkoutEvent, ticketQty, payMethod, myTickets } = get();
  const loadingToast = toast.loading("Processing payment...");
  try {
    const reference = "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const data = await ticketsAPI.purchase({
      event_id: checkoutEvent.id, quantity: ticketQty,
      payment_reference: reference,
    });

    // ── Success detection — handle all backend response shapes ──
    // Backend returns ticket_id at top level on success (HTTP 201)
    // Also accept: id, or _status 200/201 with any ticket identifier
    const ticketId = data.ticket_id || data.id || data.pk;
    const isSuccess = ticketId || data._status === 201 || data._status === 200;

    if (isSuccess) {
      const ticket = {
        id:           ticketId || reference,
        ticket_id:    ticketId || reference,
        event:        checkoutEvent,
        qty:          ticketQty,
        quantity:     ticketQty,
        payMethod,
        purchasedAt:  new Date().toLocaleDateString(),
        owner:        (data.owner?.first_name || "") + " " + (data.owner?.last_name || ""),
        ownerEmail:   data.owner?.email,
        status:       data.status || "active",
        qr_data:      data.qr_data || null,
        dynamic_qr:   data.dynamic_qr || null,
        qr_base64:    data.dynamic_qr || null,
        qr_image_url: data.qr_image_url || null,
        qr_image:     data.qr_image
          ? (data.qr_image.startsWith("http") ? data.qr_image : BACKEND + data.qr_image)
          : null,
        nft_tx_hash:  data.nft_tx_hash  || null,
        nft_token_id: data.nft_token_id || null,
      };
      set({
        myTickets:     [...myTickets, ticket],
        checkoutEvent: null,
        overlayEvent:  null,
        activeTab:     "tickets",
        screen:        "paymentSuccess",
        viewingTicket: ticket,
      });
      toast.dismiss(loadingToast);
      toast.success("🎉 Payment successful!");
    } else {
      toast.dismiss(loadingToast);
      // Show the actual backend error if available
      const errMsg = data.error || data.detail || data.message ||
        (typeof data === "object" ? Object.values(data).flat().join(" ") : "Purchase failed.");
      toast.error(errMsg);
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

  handleListForResale: () => {
    const { resaleTicket, resalePrice, myTickets, resaleListings, currentUser } = get();
    const price = parseFloat(resalePrice);
    const orig  = resaleTicket.event.price;
    if (!price || isNaN(price))  { set({ resaleError: "Please enter a valid price." }); return; }
    if (price >= orig)            { set({ resaleError: "Must be less than original price (Ghc " + orig + ")." }); return; }
    if (price < orig * 0.3)       { set({ resaleError: "Minimum resale price: Ghc " + Math.floor(orig * 0.3) + "." }); return; }
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
    toast.success("Ticket listed for resale!");
  },

  handleCancelResale: (ticketId) => {
    const { myTickets, resaleListings } = get();
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
        ticket_id: transferTicket.id, to_email: transferEmail,
      });
      if (data.message) {
        set({ myTickets: myTickets.filter(t => t.id !== transferTicket.id), transferDone: true });
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
    if (!addEventForm.name || !addEventForm.date || !addEventForm.price) {
      toast.error("Please fill Event Name, Date and Price"); return;
    }
    const loadingToast = toast.loading("Creating event...");
    try {
      const payload = {
        name:          addEventForm.name.trim(),
        description:   addEventForm.description?.trim() || "No description provided.",
        category:      addEventForm.category || "other",
        venue:         addEventForm.venue?.trim() || "TBA",
        city:          addEventForm.city?.trim()  || "Accra",
        date:          addEventForm.date,
        time:          addEventForm.time || "20:00:00",
        price:         parseFloat(addEventForm.price) || 0,
        total_tickets: parseInt(addEventForm.totalTickets) || 100,
        sales_open:    true,
      };
      if (addEventForm.image?.trim()) payload.image = addEventForm.image.trim();
      const data = await eventsAPI.create(payload);
      if (data.id) {
        const cat = data.category || addEventForm.category || "other";
        set({
          orgEvents: [...orgEvents, {
            id: data.id, name: data.name, date: data.date, venue: data.venue,
            category: cat, price: parseFloat(data.price),
            totalTickets: data.total_tickets, ticketsSold: data.tickets_sold || 0,
            salesOpen: data.sales_open, description: data.description,
            image: data.image || categoryImages[cat] || categoryImages.other,
          }],
          addEventForm: {
            name: "", subtitle: "", date: "", time: "", venue: "",
            city: "", price: "", description: "", category: "", totalTickets: "", image: "",
          },
          screen: "app", activeTab: "events",
        });
        toast.dismiss(loadingToast);
        toast.success("🎉 Event created successfully!");
      } else {
        toast.dismiss(loadingToast);
        const errMsg = typeof data === "object"
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
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

export default useStore;