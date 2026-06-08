import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "./store/useStore";
import PhoneFrame from "./components/PhoneFrame";
import Login from "./screens/auth/Login";
import { Signup, RoleSelect } from "./screens/auth/Signup";
import ResetPassword from "./screens/auth/ResetPassword";
import AttendeeHome from "./screens/attendee/AttendeeHome";
import ResaleMarketplace from "./screens/attendee/ResaleMarketplace";
import CookieBanner from "./components/CookieBanner";
import Settings from "./screens/attendee/Settings";
import AttendeeWallet from "./screens/attendee/AttendeeWallet";
import PrivacyPolicy from "./screens/attendee/PrivacyPolicy";
import { AttendeeTickets, AttendeeAlerts } from "./screens/attendee/AttendeeScreens";
import {
  Checkout, TicketView, Resale, ResaleSuccess,
  Transfer, PaymentSuccess
} from "./screens/attendee/TransactionScreens";
import {
  OrganizerHome, OrganizerEvents, OrganizerAlerts,
  AddEvent, OrganizerEventDetail
} from "./screens/organizer/OrganizerScreens";
import OrganizerWallet from "./screens/organizer/OrganizerWallet";
import { DoorStaffLogin, DoorStaffScan, OrganizerScan } from "./screens/doorstaff/DoorStaffScreens";
import { AdminLogin, AdminDashboard } from "./screens/admin/SuperAdmin";
import { useTheme } from "./hooks/useTheme";
import { Avatar } from "./utils/avatar";
import toast from "react-hot-toast";
import {
  Home, Ticket, Bell, LayoutDashboard, CalendarDays, Wallet,
  LogOut, Sun, Moon, Monitor, ChevronLeft, ChevronRight,
  PlusCircle, Zap, ScanLine, Search, Settings as SettingsIcon,
  Menu, X, ShoppingBag
} from "lucide-react";

const BRAND = "#F97316";

const FULL_SCREENS = [
  "checkout", "ticketView", "resale", "resaleSuccess",
  "transfer", "paymentSuccess", "addEvent", "orgEventDetail",
  "scanTicket", "resaleMarket", "settings", "privacy", "attendeeWallet",
];

const APP_MODE_SCREENS = [
  "login", "signup", "role", "resetPassword",
  "adminGateway", "adminDashboard",
  "doorStaffLogin", "doorStaffScan", "app",
];

// ── Mobile Top Header ─────────────────────────────────────────
function MobileTopHeader({ onMenuOpen, title }) {
  const { theme, setTheme } = useTheme();
  const themeOrder = ["light", "dark", "system"];
  const ThemeIcons = { light: Sun, dark: Moon, system: Monitor };
  const nextTheme  = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];
  const ThemeIcon  = ThemeIcons[theme];

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      height: "56px", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 16px",
      boxShadow: "0 1px 0 var(--border)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", boxShadow: `0 3px 10px ${BRAND}35` }}>🎟️</div>
        <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
          {title || "Master Events"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => setTheme(nextTheme)}
          style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ThemeIcon size={15} color="var(--text-secondary)" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onMenuOpen}
          style={{ width: "34px", height: "34px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Menu size={17} color="var(--text-primary)" />
        </motion.button>
      </div>
    </div>
  );
}

// ── Mobile Drawer ─────────────────────────────────────────────
function MobileDrawer({ open, onClose }) {
  const role         = useStore(s => s.role);
  const activeTab    = useStore(s => s.activeTab);
  const screen       = useStore(s => s.screen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const handleLogout = useStore(s => s.handleLogout);
  const currentUser  = useStore(s => s.currentUser);

  const attendeeNav = [
  { id: "home",           icon: Home,        label: "Discover",      tab: true },
  { id: "tickets",        icon: Ticket,       label: "My Tickets",    tab: true },
  { id: "alerts",         icon: Bell,         label: "Alerts",        tab: true },
  { id: "resaleMarket",   icon: ShoppingBag,  label: "Resale Market", tab: false, screen: "resaleMarket" },
  { id: "attendeeWallet", icon: Wallet,        label: "My Wallet",     tab: false, screen: "attendeeWallet" },
];
  const orgNav = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", tab: true },
    { id: "events",    icon: CalendarDays,    label: "My Events", tab: true },
    { id: "wallet",    icon: Wallet,          label: "Wallet",    tab: true },
    { id: "alerts",    icon: Bell,            label: "Alerts",    tab: true },
  ];
  const navItems = role === "organizer" ? orgNav : attendeeNav;

  const isActive = (item) => {
    if (item.screen) return screen === item.screen;
    return activeTab === item.id && !FULL_SCREENS.includes(screen);
  };

  const handleNav = (item) => {
    onClose();
    if (item.screen) { setScreen(item.screen); }
    else { setActiveTab(item.id); setScreen("app"); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(6px)" }} />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "82%", maxWidth: "320px",
              background: "var(--bg-card)", zIndex: 201,
              display: "flex", flexDirection: "column",
              boxShadow: "-4px 0 32px rgba(0,0,0,0.25)",
              borderLeft: "1px solid var(--border)",
            }}>

            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar seed={currentUser?.email} name={currentUser?.first_name} size={38}
                  style={{ border: `2px solid ${BRAND}30`, borderRadius: "50%" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.2 }}>
                    {currentUser?.first_name} {currentUser?.last_name}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={15} color="var(--text-muted)" />
              </motion.button>
            </div>

            {/* Role badge */}
            <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "99px", background: `${BRAND}10`, border: `1px solid ${BRAND}22` }}>
                <Zap size={9} color={BRAND} />
                <span style={{ fontSize: "9px", fontWeight: 700, color: BRAND, letterSpacing: "0.8px" }}>
                  {role === "organizer" ? "ORGANIZER" : "ATTENDEE"}
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "8px 8px 6px", fontFamily: "var(--font-mono)" }}>NAVIGATE</div>
              {navItems.map(item => {
                const active = isActive(item);
                const Icon   = item.icon;
                return (
                  <motion.div key={item.id} whileTap={{ scale: 0.97 }}
                    onClick={() => handleNav(item)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "11px 10px", cursor: "pointer", borderRadius: "12px",
                      background: active ? `${BRAND}10` : "transparent",
                      border: active ? `1px solid ${BRAND}20` : "1px solid transparent",
                      marginBottom: "2px", transition: "all 0.15s",
                      position: "relative",
                    }}>
                    {active && <div style={{ position: "absolute", left: 0, top: "25%", height: "50%", width: "3px", borderRadius: "0 3px 3px 0", background: BRAND }} />}
                    <Icon size={17} strokeWidth={active ? 2.5 : 1.8} color={active ? BRAND : "var(--text-muted)"} />
                    <span style={{ fontSize: "14px", fontWeight: active ? 700 : 500, color: active ? BRAND : "var(--text-primary)" }}>{item.label}</span>
                  </motion.div>
                );
              })}

              {role === "organizer" && (
                <>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "14px 8px 6px", fontFamily: "var(--font-mono)" }}>ACTIONS</div>
                  <motion.div whileTap={{ scale: 0.97 }}
                    onClick={() => { onClose(); setScreen("addEvent"); }}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 10px", cursor: "pointer", borderRadius: "12px", border: "1.5px dashed rgba(249,115,22,0.3)", color: BRAND, marginBottom: "6px", transition: "all 0.15s" }}>
                    <PlusCircle size={17} color={BRAND} />
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>Create Event</span>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.97 }}
                    onClick={() => { onClose(); setScreen("scanTicket"); }}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 10px", cursor: "pointer", borderRadius: "12px", color: "var(--text-secondary)", marginBottom: "2px", transition: "all 0.15s" }}>
                    <ScanLine size={17} color="var(--text-secondary)" />
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>Scan Tickets</span>
                  </motion.div>
                </>
              )}
            </nav>

            {/* Footer */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "12px", flexShrink: 0, paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
              <motion.div whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); setScreen("settings"); }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 10px", cursor: "pointer", borderRadius: "12px",
                  background: screen === "settings" ? `${BRAND}08` : "transparent",
                  border: screen === "settings" ? `1px solid ${BRAND}15` : "1px solid transparent",
                  marginBottom: "6px", transition: "all 0.15s",
                }}>
                <SettingsIcon size={17} color={screen === "settings" ? BRAND : "var(--text-secondary)"} strokeWidth={1.8} />
                <span style={{ fontSize: "14px", fontWeight: 500, color: screen === "settings" ? BRAND : "var(--text-primary)" }}>Account Settings</span>
              </motion.div>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); handleLogout(); }}
                style={{
                  width: "100%", minHeight: "48px", padding: "13px 14px",
                  background: "var(--error-bg)",
                  border: "1.5px solid rgba(220,38,38,0.2)",
                  borderRadius: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                }}>
                <LogOut size={16} color="var(--error)" />
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--error)" }}>Log Out</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Mobile Tab Content ────────────────────────────────────────
function MobileTabContent() {
  const role      = useStore(s => s.role);
  const activeTab = useStore(s => s.activeTab);

  if (role === "attendee") {
    if (activeTab === "home")    return <AttendeeHome />;
    if (activeTab === "tickets") return <AttendeeTickets />;
    if (activeTab === "alerts")  return <AttendeeAlerts />;
  }
  if (role === "organizer") {
    if (activeTab === "dashboard") return <OrganizerHome />;
    if (activeTab === "events")    return <OrganizerEvents />;
    if (activeTab === "wallet")    return <OrganizerWallet />;
    if (activeTab === "alerts")    return <OrganizerAlerts />;
  }
  return null;
}

// ── Mobile App Shell ──────────────────────────────────────────
function MobileAppShell() {
  const screen  = useStore(s => s.screen);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const screenTitles = {
    checkout:       "Checkout",
    ticketView:     "My Ticket",
    resale:         "List for Resale",
    resaleSuccess:  "Listed!",
    transfer:       "Transfer Ticket",
    paymentSuccess: "Payment Successful!",
    addEvent:       "Create Event",
    orgEventDetail: "Event Details",
    scanTicket:     "Scan Tickets",
    resaleMarket:   "Resale Market",
    settings:       "Settings",
    privacy:        "Privacy Policy",
    attendeeWallet: "My Wallet",
  };

  const tabTitles = {
    home: "Discover", tickets: "My Tickets", alerts: "Alerts",
    dashboard: "Dashboard", events: "My Events", wallet: "Wallet",
  };

  const currentTitle = FULL_SCREENS.includes(screen)
    ? screenTitles[screen]
    : tabTitles[useStore.getState().activeTab] || "Master Events";

  const fullScreenMap = {
    checkout:       <Checkout />,
    ticketView:     <TicketView />,
    resale:         <Resale />,
    resaleSuccess:  <ResaleSuccess />,
    transfer:       <Transfer />,
    paymentSuccess: <PaymentSuccess />,
    addEvent:       <AddEvent />,
    orgEventDetail: <OrganizerEventDetail />,
    scanTicket:     <OrganizerScan />,
  };

  const navScreenMap = {
    resaleMarket: <ResaleMarketplace />,
    settings:     <Settings />,
    privacy:      <PrivacyPolicy />,
    attendeeWallet: <AttendeeWallet />,
  };

  if (fullScreenMap[screen]) {
    return (
      <div className="app-shell">
        <div className="tab-content">{fullScreenMap[screen]}</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <MobileTopHeader onMenuOpen={() => setDrawerOpen(true)} title={currentTitle} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="tab-content">
        {navScreenMap[screen] || <MobileTabContent />}
      </div>
    </div>
  );
}

// ── Desktop Nav Item ──────────────────────────────────────────
function NavItem({ icon: Icon, label, active, collapsed, onClick, title }) {
  return (
    <motion.div whileTap={{ scale: 0.94 }} onClick={onClick} title={title}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "10px", marginBottom: "2px", cursor: "pointer",
        background: active ? `${BRAND}10` : "transparent",
        transition: "all 0.18s ease", position: "relative",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? `${BRAND}10` : "transparent"; }}>
      {active && <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: "3px", borderRadius: "0 3px 3px 0", background: BRAND }} />}
      <Icon size={17} strokeWidth={active ? 2.5 : 1.8} color={active ? BRAND : "var(--text-muted)"} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", color: active ? BRAND : "var(--text-secondary)" }}>{label}</span>}
    </motion.div>
  );
}

// ── Desktop Topbar ────────────────────────────────────────────
function DesktopTopbar({ navItems, activeTab, isFullScreen, screen, screenTitles, role, setScreen, setActiveTab, theme, setTheme }) {
  const searchQ    = useStore(s => s.searchQ);
  const setSearchQ = useStore(s => s.setSearchQ);
  const themeOpts  = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon  = themeOpts[theme] || Sun;
  const pageTitle  = isFullScreen
    ? screenTitles[screen] || "Master Events"
    : navItems.find(n => n.id === activeTab)?.label || "Master Events";

  return (
    <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "0 28px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", position: "sticky", top: 0, zIndex: 40, boxShadow: "var(--shadow-sm)", flexShrink: 0 }}>
      <div style={{ flexShrink: 0, minWidth: "140px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>{pageTitle}</h1>
        <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>
          {new Date().toLocaleDateString("en-GH", { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>
      <div style={{ flex: 1, maxWidth: "420px", position: "relative" }}>
        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Search size={14} color="var(--text-muted)" />
        </div>
        <input value={searchQ}
          onChange={e => { setSearchQ(e.target.value); if (activeTab !== "home" && role === "attendee") { setActiveTab("home"); setScreen("app"); } }}
          placeholder="Search events, venues..."
          style={{ width: "100%", padding: "8px 14px 8px 36px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "13px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
          onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = `0 0 0 3px ${BRAND}12`; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
        />
        {searchQ && <div onClick={() => setSearchQ("")} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px" }}>✕</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "99px", border: "1px solid rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.06)" }}>
          <motion.div animate={{ scale: [1,1.5,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono)" }}>AMOY</span>
        </div>
        <motion.div whileTap={{ scale: 0.88 }}
          onClick={() => setTheme(["light","dark","system"][(["light","dark","system"].indexOf(theme) + 1) % 3])}
          style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.background = `${BRAND}08`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-subtle)"; }}>
          <ThemeIcon size={14} color="var(--text-secondary)" />
        </motion.div>
      </div>
    </div>
  );
}

// ── Desktop App Layout ────────────────────────────────────────
function DesktopAppLayout() {
  const screen       = useStore(s => s.screen);
  const role         = useStore(s => s.role);
  const activeTab    = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const currentUser  = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);

  const attendeeNav = [
    { id: "home",    Icon: Home,          label: "Discover"   },
    { id: "tickets", Icon: Ticket,        label: "My Tickets" },
    { id: "alerts",  Icon: Bell,          label: "Alerts"     },
  ];
  const orgNav = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "events",    Icon: CalendarDays,    label: "My Events" },
    { id: "wallet",    Icon: Wallet,          label: "Wallet"    },
    { id: "alerts",    Icon: Bell,            label: "Alerts"    },
  ];
  const navItems     = role === "organizer" ? orgNav : attendeeNav;
  const isFullScreen = FULL_SCREENS.includes(screen);

  const screenTitles = {
    checkout:       "Checkout",
    ticketView:     "Your Ticket",
    resale:         "Resell Ticket",
    resaleSuccess:  "Listed!",
    transfer:       "Transfer Ticket",
    paymentSuccess: "Payment Successful",
    addEvent:       "Create Event",
    orgEventDetail: "Event Details",
    scanTicket:     "Scan Tickets",
    doorStaffLogin: "Door Staff",
    doorStaffScan:  "Door Scanner",
    resaleMarket:   "Resale Market",
    settings:       "Account Settings",
    privacy:        "Privacy Policy",
    attendeeWallet: "My Wallet",
  };

  const renderContent = () => {
    if (isFullScreen) {
      const map = {
        checkout:       <Checkout />,
        ticketView:     <TicketView />,
        resale:         <Resale />,
        resaleSuccess:  <ResaleSuccess />,
        transfer:       <Transfer />,
        paymentSuccess: <PaymentSuccess />,
        addEvent:       <AddEvent />,
        orgEventDetail: <OrganizerEventDetail />,
        scanTicket:     <OrganizerScan />,
        doorStaffLogin: <DoorStaffLogin />,
        doorStaffScan:  <DoorStaffScan />,
        resaleMarket:   <ResaleMarketplace />,
        settings:       <Settings />,
        privacy:        <PrivacyPolicy />,
        attendeeWallet: <AttendeeWallet />,
      };
      return map[screen];
    }
    if (role === "attendee") {
      if (activeTab === "home")    return <AttendeeHome />;
      if (activeTab === "tickets") return <AttendeeTickets />;
      if (activeTab === "alerts")  return <AttendeeAlerts />;
    }
    if (role === "organizer") {
      if (activeTab === "dashboard") return <OrganizerHome />;
      if (activeTab === "events")    return <OrganizerEvents />;
      if (activeTab === "wallet")    return <OrganizerWallet />;
      if (activeTab === "alerts")    return <OrganizerAlerts />;
    }
    return null;
  };

  const sidebarW = collapsed ? "64px" : "240px";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      <motion.aside animate={{ width: sidebarW }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative", zIndex: 10 }}>

        {/* Sidebar header */}
        <div style={{ padding: "0 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "8px", height: "60px", flexShrink: 0 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}
                style={{ display: "flex", alignItems: "center", gap: "9px", overflow: "hidden" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ticket size={15} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Master Events</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                    <motion.div animate={{ scale: [1,1.5,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#16a34a" }} />
                    <span style={{ fontSize: "8px", color: "#16a34a", fontWeight: 700, letterSpacing: "0.8px", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>POLYGON AMOY</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setCollapsed(!collapsed)}
            style={{ width: "24px", height: "24px", borderRadius: "7px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {collapsed ? <ChevronRight size={12} color="var(--text-muted)" /> : <ChevronLeft size={12} color="var(--text-muted)" />}
          </motion.button>
        </div>

        {/* User profile */}
        <div style={{ borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {collapsed ? (
            <div style={{ padding: "10px 0", display: "flex", justifyContent: "center" }}>
              <Avatar seed={currentUser?.email} name={currentUser?.first_name} size={32} />
            </div>
          ) : (
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar seed={currentUser?.email} name={currentUser?.first_name} size={36} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.email}</div>
                </div>
              </div>
              <div style={{ marginTop: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "99px", background: `${BRAND}10`, border: `1px solid ${BRAND}20`, fontSize: "9px", fontWeight: 700, color: BRAND }}>
                  {role === "organizer" ? <><Zap size={9} color={BRAND} /> ORGANIZER</> : <><Ticket size={9} color={BRAND} /> ATTENDEE</>}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          {!collapsed && <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "8px 10px 6px", fontFamily: "var(--font-mono)" }}>NAVIGATE</div>}
          {navItems.map(item => (
            <NavItem key={item.id} icon={item.Icon} label={item.label}
              active={!isFullScreen && activeTab === item.id}
              collapsed={collapsed} title={collapsed ? item.label : ""}
              onClick={() => { setActiveTab(item.id); setScreen("app"); }} />
          ))}
          {role === "attendee" && (
            <>
              <NavItem icon={ShoppingBag} label="Resale Market" active={screen === "resaleMarket"}
                collapsed={collapsed} title={collapsed ? "Resale Market" : ""}
                onClick={() => setScreen("resaleMarket")} />
              <NavItem icon={Wallet} label="My Wallet" active={screen === "attendeeWallet"}
                collapsed={collapsed} title={collapsed ? "My Wallet" : ""}
                onClick={() => setScreen("attendeeWallet")} />
            </>
          )}
          {role === "organizer" && (
            <div style={{ marginTop: "8px" }}>
              {!collapsed && <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "8px 10px 6px", fontFamily: "var(--font-mono)" }}>ACTIONS</div>}
              <motion.div whileTap={{ scale: 0.94 }} onClick={() => setScreen("addEvent")}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "10px", cursor: "pointer", border: collapsed ? "none" : "1.5px dashed rgba(249,115,22,0.3)", color: BRAND, transition: "all 0.18s ease", marginBottom: "3px" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${BRAND}07`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <PlusCircle size={16} color={BRAND} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px" }}>Create Event</span>}
              </motion.div>
              <motion.div whileTap={{ scale: 0.94 }} onClick={() => setScreen("scanTicket")}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "10px", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <ScanLine size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px" }}>Scan Tickets</span>}
              </motion.div>
            </div>
          )}
          <div style={{ marginTop: "8px" }}>
            <NavItem icon={SettingsIcon} label="Settings" active={screen === "settings"}
              collapsed={collapsed} title={collapsed ? "Settings" : ""}
              onClick={() => setScreen("settings")} />
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: "8px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <motion.div whileTap={{ scale: 0.9 }} onClick={handleLogout} title={collapsed ? "Log Out" : ""}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "10px", cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--error-bg)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <LogOut size={16} color="var(--error)" style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--error)" }}>Log Out</span>}
          </motion.div>
        </div>
      </motion.aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <DesktopTopbar navItems={navItems} activeTab={activeTab} isFullScreen={isFullScreen}
          screen={screen} screenTitles={screenTitles} role={role}
          setScreen={setScreen} setActiveTab={setActiveTab} theme={theme} setTheme={setTheme} />
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
          <div key={screen + activeTab} className="screen-enter" style={{ minHeight: "100%" }}>
            {renderContent()}
          </div>
        </div>
      </main>

      <CookieBanner />
    </div>
  );
}

// ── Mobile App Content ────────────────────────────────────────
function MobileAppContent() {
  const screen = useStore(s => s.screen);

  const authRoutes = {
    login: <Login />, signup: <Signup />,
    role: <RoleSelect />, resetPassword: <ResetPassword />
  };

  if (authRoutes[screen]) return (
    <div key={screen} className="screen-enter app-shell" style={{ background: "var(--bg)" }}>
      {authRoutes[screen]}
    </div>
  );

  return (
    <div key={screen} className="screen-enter" style={{ height: "100dvh", overflow: "hidden", background: "var(--bg)" }}>
      <MobileAppShell />
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const screen     = useStore(s => s.screen);
  const [desktop, setDesktop] = React.useState(window.innerWidth > 768);
  useTheme();

  // ── app-mode body class ───────────────────────────────────
  React.useEffect(() => {
    const isAppMode = isLoggedIn || APP_MODE_SCREENS.includes(screen);
    if (isAppMode) {
      document.body.classList.add("app-mode");
    } else {
      document.body.classList.remove("app-mode");
    }
  }, [isLoggedIn, screen]);

  // ── URL param handler ─────────────────────────────────────
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid    = params.get("uid");
    const token  = params.get("token");
    const verify = params.get("verify");

    if (uid && token) {
      useStore.getState().setResetPasswordParams({ uid, token });
      useStore.getState().setScreen("resetPassword");
      return;
    }
    if (params.get("admin") === "1") {
      useStore.getState().setScreen("adminGateway");
      return;
    }
    if (params.get("door") === "1") {
      useStore.getState().setScreen("doorStaffLogin");
      return;
    }
    if (verify) {
      fetch("https://master-events-backend.onrender.com/api/accounts/verify-email/", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token: verify }),
      })
        .then(r => r.json())
        .then(data => {
          window.history.replaceState({}, "", "/");
          if (data.message && !data.error) {
            useStore.getState().setScreen("login");
            setTimeout(() => toast.success("✅ Email verified! You can now log in."), 400);
          } else {
            useStore.getState().setScreen("login");
            setTimeout(() => toast.error(data.error || "Verification failed. Please try again."), 400);
          }
        })
        .catch(() => {
          window.history.replaceState({}, "", "/");
          useStore.getState().setScreen("login");
        });
    }
  }, []);

  // ── Resize handler ────────────────────────────────────────
  React.useEffect(() => {
    const handler = () => setDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Top-level screens ─────────────────────────────────────
  if (screen === "adminGateway")   return <AdminLogin />;
  if (screen === "adminDashboard") return <AdminDashboard />;
  if (screen === "resetPassword")  return <ResetPassword />;
  if (screen === "doorStaffLogin") return <DoorStaffLogin />;
  if (screen === "doorStaffScan")  return <DoorStaffScan />;

  if (desktop && isLoggedIn) return <DesktopAppLayout />;

  return (
    <>
      <PhoneFrame>
        <MobileAppContent />
      </PhoneFrame>
      <CookieBanner />
    </>
  );
}