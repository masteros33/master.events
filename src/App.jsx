import React, { useEffect, useRef, useState } from "react";
import useStore from "./store/useStore";
import { Toaster } from "react-hot-toast";

// ── Screens ───────────────────────────────────────────────────
import AttendeeHome           from "./screens/attendee/AttendeeHome";
import { AttendeeTickets, AttendeeAlerts } from "./screens/attendee/AttendeeScreens";
import AttendeeWallet         from "./screens/attendee/AttendeeWallet";
import Settings               from "./screens/attendee/Settings";
import { Checkout, TicketView, PaymentSuccess, Resale, ResaleSuccess, Transfer } from "./screens/attendee/TransactionScreens";
import { PublicEventPage }    from "./screens/attendee/PublicEventPage";
import { ResaleMarket }       from "./screens/attendee/ResaleMarket";
import { OrganizerHome, OrganizerEvents, OrganizerAlerts, AddEvent, OrganizerEventDetail } from "./screens/organizer/OrganizerScreens";
import Login                  from "./screens/auth/Login";
import Signup                 from "./screens/auth/Signup";
import { ForgotPassword, ResetPassword } from "./screens/auth/ForgotPassword";
import { AdminLogin, AdminDashboard }    from "./screens/admin/AdminScreens";
import { DoorStaffLogin, DoorStaffScan } from "./screens/doorstaff/DoorStaffScreens";
import { DesktopAppLayout }   from "./screens/layout/DesktopLayout";
import { CookieBanner }       from "./components/CookieBanner";
import { PrivacyPolicy }      from "./screens/misc/PrivacyPolicy";
import { Onboarding }         from "./screens/misc/Onboarding";

const FONT = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const BRAND = "#F97316";

const isDesktop = () => window.innerWidth > 768;

// ── Mobile top header (for logged-in shell) ───────────────────
function MobileTopHeader({ onMenuOpen, title }) {
  const setScreen  = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const isLoggedIn = useStore(s => s.isLoggedIn);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", height: "56px", background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg,${BRAND},#EA6C0A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>🎟️</div>
        <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>{title || "Master Events"}</span>
      </div>
      <button onClick={onMenuOpen}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--text-primary)", padding: "4px" }}>
        ☰
      </button>
    </div>
  );
}

// ── Public mobile navbar (unauthenticated landing) ────────────
function PublicMobileNavbar({ scrolled }) {
  const setScreen  = useStore(s => s.setScreen);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const { theme, setTheme } = useThemeSafe();

  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "0 16px", height: "56px",
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      position: "relative",
    }}>
      {/* Logo — left when not scrolled, centered when scrolled */}
      <div style={{
        position: "absolute",
        left: scrolled ? "50%" : "16px",
        transform: scrolled ? "translateX(-50%)" : "none",
        transition: "left 0.3s ease, transform 0.3s ease",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg,${BRAND},#EA6C0A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🎟️</div>
        <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Master Events</span>
      </div>

      {/* Right side — login/signup + theme toggle, hidden when scrolled */}
      <div style={{
        marginLeft: "auto",
        display: "flex", alignItems: "center", gap: "6px",
        opacity: scrolled ? 0 : 1,
        pointerEvents: scrolled ? "none" : "auto",
        transition: "opacity 0.25s ease",
        flexShrink: 0,
      }}>
        {/* Theme toggle */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", flexShrink: 0 }}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {!isLoggedIn && (
          <>
            <button onClick={() => setScreen("login")}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", flexShrink: 0 }}>
              Log in
            </button>
            <button onClick={() => setScreen("signup")}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "none", background: `linear-gradient(135deg,${BRAND},#EA6C0A)`, color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", flexShrink: 0, boxShadow: `0 2px 8px ${BRAND}40` }}>
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Safe theme hook fallback
function useThemeSafe() {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem("me_theme") || "light"; } catch { return "light"; }
  });
  const setTheme = (t) => {
    setThemeState(t);
    try { localStorage.setItem("me_theme", t); document.documentElement.setAttribute("data-theme", t); } catch {}
  };
  return { theme, setTheme };
}

// ── Mobile drawer ─────────────────────────────────────────────
function MobileDrawer({ open, onClose }) {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const currentUser  = useStore(s => s.currentUser);
  const role         = useStore(s => s.role);
  const handleLogout = useStore(s => s.handleLogout);
  const isLoggedIn   = useStore(s => s.isLoggedIn);

  const attendeeTabs = [
    { icon:"🏠", label:"Home",      tab:"home",    screen:"app" },
    { icon:"🎟️", label:"Tickets",   tab:"tickets", screen:"app" },
    { icon:"💰", label:"Wallet",    screen:"wallet" },
    { icon:"🔔", label:"Alerts",    tab:"alerts",  screen:"app" },
    { icon:"⚙️", label:"Settings",  screen:"settings" },
  ];
  const organizerTabs = [
    { icon:"📊", label:"Dashboard", tab:"dashboard", screen:"app" },
    { icon:"🎪", label:"Events",    tab:"events",    screen:"app" },
    { icon:"🔔", label:"Alerts",    tab:"orgAlerts", screen:"app" },
    { icon:"➕", label:"New Event", screen:"addEvent" },
    { icon:"⚙️", label:"Settings",  screen:"settings" },
  ];
  const tabs = role === "organizer" ? organizerTabs : attendeeTabs;

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(4px)" }} />
      )}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "260px",
        background: "var(--bg-card)", borderLeft: "1px solid var(--border)",
        zIndex: 101, transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column", fontFamily: FONT,
      }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Menu</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--text-muted)" }}>✕</button>
          </div>
          {isLoggedIn && currentUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},#EA6C0A)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "14px", flexShrink: 0 }}>
                {currentUser.first_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUser.first_name} {currentUser.last_name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {tabs.map(item => (
            <button key={item.label} onClick={() => {
              if (item.tab) setActiveTab(item.tab);
              if (item.screen) setScreen(item.screen);
              onClose();
            }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", border: "none", background: "transparent", cursor: "pointer", fontFamily: FONT, fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", textAlign: "left", marginBottom: "2px", transition: "background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
          {isLoggedIn ? (
            <button onClick={() => { handleLogout(); onClose(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", border: "none", background: "rgba(239,68,68,0.08)", cursor: "pointer", fontFamily: FONT, fontSize: "14px", fontWeight: 600, color: "#ef4444", textAlign: "left" }}>
              <span>🚪</span> Log Out
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setScreen("login"); onClose(); }}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Log in
              </button>
              <button onClick={() => { setScreen("signup"); onClose(); }}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg,${BRAND},#EA6C0A)`, cursor: "pointer", fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Mobile tab bar ────────────────────────────────────────────
function MobileTabBar() {
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const activeTab    = useStore(s => s.activeTab);
  const role         = useStore(s => s.role);

  const attendeeTabs = [
    { icon:"🏠", label:"Home",    tab:"home"    },
    { icon:"🎟️", label:"Tickets", tab:"tickets" },
    { icon:"🔔", label:"Alerts",  tab:"alerts"  },
    { icon:"👤", label:"Account", tab:"account" },
  ];
  const orgTabs = [
    { icon:"📊", label:"Dashboard", tab:"dashboard" },
    { icon:"🎪", label:"Events",    tab:"events"    },
    { icon:"🔔", label:"Alerts",    tab:"orgAlerts" },
    { icon:"👤", label:"Account",   tab:"account"   },
  ];
  const tabs = role === "organizer" ? orgTabs : attendeeTabs;

  return (
    <div style={{ display: "flex", background: "var(--bg-card)", borderTop: "1px solid var(--border)", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
      {tabs.map(t => {
        const active = activeTab === t.tab;
        return (
          <button key={t.tab} onClick={() => { setActiveTab(t.tab); setScreen("app"); }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: "8px 4px 6px", background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>
            <span style={{ fontSize: "20px" }}>{t.icon}</span>
            <span style={{ fontSize: "9px", fontWeight: active ? 700 : 400, color: active ? BRAND : "var(--text-muted)", letterSpacing: "0.3px" }}>{t.label}</span>
            {active && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: BRAND, marginTop: "1px" }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Mobile tab content ────────────────────────────────────────
function MobileTabContent() {
  const activeTab   = useStore(s => s.activeTab);
  const role        = useStore(s => s.role);
  const currentUser = useStore(s => s.currentUser);
  const setScreen   = useStore(s => s.setScreen);

  if (role === "organizer") {
    if (activeTab === "dashboard") return <OrganizerHome />;
    if (activeTab === "events")    return <OrganizerEvents />;
    if (activeTab === "orgAlerts") return <OrganizerAlerts />;
    if (activeTab === "account")   return <Settings />;
    return <OrganizerHome />;
  }
  if (activeTab === "tickets") return <AttendeeTickets />;
  if (activeTab === "alerts")  return <AttendeeAlerts />;
  if (activeTab === "account") return <Settings />;
  return <AttendeeHome />;
}

// ── Mobile app shell (logged-in) ──────────────────────────────
function MobileAppShell() {
  const screen     = useStore(s => s.screen);
  const activeTab  = useStore(s => s.activeTab);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const titleMap = {
    home:      "Master Events",
    tickets:   "My Tickets",
    alerts:    "Alerts",
    account:   "Settings",
    dashboard: "Dashboard",
    events:    "My Events",
    orgAlerts: "Alerts",
  };
  const currentTitle = titleMap[activeTab] || "Master Events";

  const fullScreenMap = {
    checkout:       <Checkout />,
    ticketView:     <TicketView />,
    paymentSuccess: <PaymentSuccess />,
    resale:         <Resale />,
    resaleSuccess:  <ResaleSuccess />,
    transfer:       <Transfer />,
    addEvent:       <AddEvent />,
    orgEventDetail: <OrganizerEventDetail />,
    pendingEvent:   <PublicEventPage />,
    resaleMarket:   <ResaleMarket />,
    wallet:         <AttendeeWallet />,
    settings:       <Settings />,
    scanTicket:     <DoorStaffScan />,
    privacy:        <PrivacyPolicy />,
  };

  if (fullScreenMap[screen]) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {fullScreenMap[screen]}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <MobileTopHeader onMenuOpen={() => setDrawerOpen(true)} title={currentTitle} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <MobileTabContent />
      </div>
      <MobileTabBar />
    </div>
  );
}

// ── Public mobile shell (unauthenticated home) ────────────────
function PublicMobileShell() {
  const screen    = useStore(s => s.screen);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Full screen public pages (no navbar)
  const fullScreenMap = {
    pendingEvent: <PublicEventPage />,
    privacy:      <PrivacyPolicy />,
  };

  if (fullScreenMap[screen]) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {fullScreenMap[screen]}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <PublicMobileNavbar scrolled={scrolled} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <AttendeeHome hideNavbar />
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const screen     = useStore(s => s.screen);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const [desktop,  setDesktop]  = useState(isDesktop());
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    const r = () => setDesktop(isDesktop());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem("me_onboarded");
    if (!seen && !isLoggedIn) setShowOnboard(true);
  }, []);

  // ── Screens that always render standalone ──────────────────
  if (screen === "adminGateway")   return <><AdminLogin /><Toaster position="top-center" /></>;
  if (screen === "adminDashboard") return <><AdminDashboard /><Toaster position="top-center" /></>;
  if (screen === "resetPassword")  return <><ResetPassword /><Toaster position="top-center" /></>;
  if (screen === "doorStaffLogin") return <><DoorStaffLogin /><Toaster position="top-center" /></>;
  if (screen === "doorStaffScan")  return <><DoorStaffScan /><Toaster position="top-center" /></>;

  // ── Auth screens ───────────────────────────────────────────
  if (screen === "login")          return <><Login /><Toaster position="top-center" /></>;
  if (screen === "signup")         return <><Signup /><Toaster position="top-center" /></>;
  if (screen === "forgotPassword") return <><ForgotPassword /><Toaster position="top-center" /></>;

  // ── Onboarding ─────────────────────────────────────────────
  if (showOnboard && screen === "home") return (
    <>
      <Onboarding onDone={() => { setShowOnboard(false); localStorage.setItem("me_onboarded","1"); }} />
      <Toaster position="top-center" />
    </>
  );

  // ── Desktop layout ─────────────────────────────────────────
  if (desktop && isLoggedIn) return (
    <>
      <DesktopAppLayout />
      <Toaster position="top-right" />
    </>
  );

  // ── Desktop public (unauthenticated) ───────────────────────
  if (desktop && !isLoggedIn) return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <AttendeeHome />
      </div>
      <Toaster position="top-right" />
      <CookieBanner />
    </div>
  );

  // ── Mobile: unauthenticated ────────────────────────────────
  if (!isLoggedIn) return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <PublicMobileShell />
      <Toaster position="top-center" />
      <CookieBanner />
    </div>
  );

  // ── Mobile: authenticated ──────────────────────────────────
  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <MobileAppShell />
      <Toaster position="top-center" />
    </div>
  );
}