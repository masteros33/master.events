import { create } from "zustand";
import { DEMO_ACCOUNTS, DEMO_ORG_EVENTS } from "../constants/data";

const useStore = create((set, get) => ({
  // ── Navigation ──────────────────────────────────────────────
  screen: "onboarding",
  activeTab: "home",
  setScreen: (screen) => set({ screen }),
  setActiveTab: (activeTab) => set({ activeTab }),

  // ── Auth ────────────────────────────────────────────────────
  currentUser: null,
  role: null,
  email: "",
  password: "",
  fullName: "",
  signupEmail: "",
  signupPassword: "",
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setFullName: (fullName) => set({ fullName }),
  setSignupEmail: (signupEmail) => set({ signupEmail }),
  setSignupPassword: (signupPassword) => set({ signupPassword }),

  handleLogin: () => {
    const { email, password } = get();
    const account = DEMO_ACCOUNTS[email];
    if (account && account.password === password) {
      const user = { name: account.name, email };
      set({ currentUser: user, role: account.role, screen: "app", activeTab: "home" });
      if (account.role === "organizer") {
        set({ orgEvents: DEMO_ORG_EVENTS.map(e => ({ ...e })) });
      }
    } else {
      alert("Wrong email or password.\nTry: mike@test.com / 123 or sam@test.com / 123");
    }
  },

  handleSignup: () => {
    const { fullName, signupEmail, signupPassword } = get();
    if (!fullName || !signupEmail || !signupPassword) {
      alert("Please fill all fields");
      return;
    }
    set({ currentUser: { name: fullName, email: signupEmail }, screen: "role" });
  },

  handleSelectRole: (role) => set({ role, screen: "app", activeTab: "home" }),

  handleLogout: () => set({
    screen: "login", currentUser: null, role: null, menuOpen: false,
    email: "", password: "", activeTab: "home",
    overlayEvent: null, checkoutEvent: null,
    doorStaffUser: null, doorCode: "", doorCodeError: "",
  }),

  // ── Onboarding ──────────────────────────────────────────────
  onboardSlide: 0,
  setOnboardSlide: (onboardSlide) => set({ onboardSlide }),

  // ── UI ──────────────────────────────────────────────────────
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),

  // ── Events / Search ─────────────────────────────────────────
  searchQ: "",
  setSearchQ: (searchQ) => set({ searchQ }),
  overlayEvent: null,
  setOverlayEvent: (overlayEvent) => set({ overlayEvent }),

  // ── Tickets ─────────────────────────────────────────────────
  myTickets: [],
  resaleListings: [],
  checkoutEvent: null,
  ticketQty: 1,
  payMethod: "momo",
  viewingTicket: null,
  setCheckoutEvent: (checkoutEvent) => set({ checkoutEvent }),
  setTicketQty: (ticketQty) => set({ ticketQty }),
  setPayMethod: (payMethod) => set({ payMethod }),
  setViewingTicket: (viewingTicket) => set({ viewingTicket }),

  handleBuyTicket: () => {
    const { checkoutEvent, ticketQty, payMethod, currentUser, myTickets } = get();
    const ticketId = "TKT-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const ticket = {
      id: ticketId,
      event: checkoutEvent,
      qty: ticketQty,
      payMethod,
      purchasedAt: new Date().toLocaleDateString(),
      owner: currentUser.name,
      ownerEmail: currentUser.email,
      status: "active",
    };
    set({
      myTickets: [...myTickets, ticket],
      checkoutEvent: null,
      overlayEvent: null,
      activeTab: "tickets",
      screen: "ticketView",
      viewingTicket: ticket,
    });
  },

  // ── Resale ───────────────────────────────────────────────────
  resaleTicket: null,
  resalePrice: "",
  resaleError: "",
  setResaleTicket: (resaleTicket) => set({ resaleTicket }),
  setResalePrice: (resalePrice) => set({ resalePrice }),
  setResaleError: (resaleError) => set({ resaleError }),

  handleListForResale: () => {
    const { resaleTicket, resalePrice, myTickets, resaleListings, currentUser } = get();
    const price = parseFloat(resalePrice);
    const orig = resaleTicket.event.price;
    if (!price || isNaN(price)) { set({ resaleError: "Please enter a valid price." }); return; }
    if (price >= orig) { set({ resaleError: `Must be less than original price (Ghc ${orig}).` }); return; }
    if (price < orig * 0.3) { set({ resaleError: `Minimum resale price: Ghc ${Math.floor(orig * 0.3)}.` }); return; }
    set({
      myTickets: myTickets.map(t => t.id === resaleTicket.id ? { ...t, status: "resale", resalePrice: price } : t),
      resaleListings: [...resaleListings, { ...resaleTicket, resalePrice: price, listedAt: new Date().toLocaleDateString(), seller: currentUser.name }],
      resaleTicket: null, resalePrice: "", resaleError: "", screen: "resaleSuccess",
    });
  },

  handleCancelResale: (ticketId) => {
    const { myTickets, resaleListings } = get();
    set({
      myTickets: myTickets.map(t => t.id === ticketId ? { ...t, status: "active", resalePrice: null } : t),
      resaleListings: resaleListings.filter(l => l.id !== ticketId),
    });
  },

  // ── Transfer ─────────────────────────────────────────────────
  transferTicket: null,
  transferEmail: "",
  transferName: "",
  transferDone: false,
  setTransferTicket: (transferTicket) => set({ transferTicket }),
  setTransferEmail: (transferEmail) => set({ transferEmail }),
  setTransferName: (transferName) => set({ transferName }),
  setTransferDone: (transferDone) => set({ transferDone }),

  handleTransfer: () => {
    const { transferEmail, transferName, transferTicket, currentUser, myTickets } = get();
    if (!transferEmail || !transferName) { alert("Please fill in recipient name and email."); return; }
    if (transferEmail === currentUser.email) { alert("You cannot transfer a ticket to yourself."); return; }
    set({
      myTickets: myTickets.filter(t => t.id !== transferTicket.id),
      transferDone: true,
    });
  },

  // ── Organizer ────────────────────────────────────────────────
  orgEvents: [],
  viewingOrgEvent: null,
  addEventForm: { name: "", subtitle: "", date: "", time: "", venue: "", price: "", description: "" },
  setOrgEvents: (orgEvents) => set({ orgEvents }),
  setViewingOrgEvent: (viewingOrgEvent) => set({ viewingOrgEvent }),
  setAddEventForm: (addEventForm) => set({ addEventForm }),

  handleAddEvent: () => {
    const { addEventForm, orgEvents, currentUser } = get();
    if (!addEventForm.name || !addEventForm.date || !addEventForm.price) {
      alert("Please fill Event Name, Date and Price");
      return;
    }
    set({
      orgEvents: [...orgEvents, {
        id: Date.now(),
        ...addEventForm,
        host: currentUser.name,
        price: parseFloat(addEventForm.price) || 0,
        color: "#f5a623", image: "", ticketsSold: 0, salesOpen: true,
      }],
      addEventForm: { name: "", subtitle: "", date: "", time: "", venue: "", price: "", description: "" },
      screen: "app", activeTab: "home",
    });
  },

  toggleSales: (eventId) => {
    const { orgEvents, viewingOrgEvent } = get();
    const updated = orgEvents.map(e => e.id === eventId ? { ...e, salesOpen: !e.salesOpen } : e);
    const updatedEvent = updated.find(e => e.id === eventId);
    set({ orgEvents: updated, viewingOrgEvent: updatedEvent });
  },

  // ── Door Staff ───────────────────────────────────────────────
  doorStaffInvites: {},   // { eventId: [{ code, eventId, eventName, used, createdAt }] }
  doorStaffUser: null,    // { code, eventId, eventName }
  doorCode: "",
  doorCodeError: "",
  setDoorCode: (doorCode) => set({ doorCode: doorCode.toUpperCase(), doorCodeError: "" }),
  setDoorCodeError: (doorCodeError) => set({ doorCodeError }),

  generateDoorCode: (eventId, eventName) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const code = `DOOR-${rand}`;
    const invite = { code, eventId, eventName, used: false, createdAt: new Date().toLocaleTimeString() };
    set(state => ({
      doorStaffInvites: {
        ...state.doorStaffInvites,
        [eventId]: [...(state.doorStaffInvites[eventId] || []), invite],
      },
    }));
    return code;
  },

  handleDoorStaffLogin: () => {
    const { doorCode, doorStaffInvites } = get();
    const trimmed = doorCode.trim().toUpperCase();
    let found = null;
    Object.values(doorStaffInvites).forEach(invites => {
      invites.forEach(inv => { if (inv.code === trimmed) found = inv; });
    });
    if (!found) { set({ doorCodeError: "Invalid code. Ask your organizer for a valid door staff code." }); return; }
    if (found.used) { set({ doorCodeError: "This code has already been used. Ask for a new one." }); return; }
    // Mark code as used
    set(state => {
      const updated = { ...state.doorStaffInvites };
      updated[found.eventId] = updated[found.eventId].map(inv =>
        inv.code === trimmed ? { ...inv, used: true } : inv
      );
      return {
        doorStaffInvites: updated,
        doorStaffUser: { code: trimmed, eventId: found.eventId, eventName: found.eventName },
        admittedList: [], scanInput: "", scanResult: null,
        screen: "doorStaffScan",
      };
    });
  },

  // ── Scanner ──────────────────────────────────────────────────
  scanInput: "",
  scanResult: null,
  verifying: false,
  admittedList: [],
  setScanInput: (scanInput) => set({ scanInput, scanResult: null }),
  setScanResult: (scanResult) => set({ scanResult }),
  setVerifying: (verifying) => set({ verifying }),
  setAdmittedList: (admittedList) => set({ admittedList }),

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