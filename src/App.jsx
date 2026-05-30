import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "./store/useStore";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import Login from "./screens/auth/Login";
import { Signup, RoleSelect } from "./screens/auth/Signup";
import ResetPassword from "./screens/auth/ResetPassword";
import AttendeeHome from "./screens/attendee/AttendeeHome";
import ResaleMarketplace from "./screens/attendee/ResaleMarketplace";
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
import {
  Home, Ticket, Bell, LayoutDashboard, CalendarDays, Wallet,
  LogOut, Sun, Moon, Monitor, ChevronLeft, ChevronRight,
  PlusCircle, Zap, ScanLine, Search, Shield
} from "lucide-react";

const FULL_SCREENS = [
  "checkout","ticketView","resale","resaleSuccess",
  "transfer","paymentSuccess","addEvent","orgEventDetail",
  "scanTicket","resaleMarket",
];

function AppTabs() {
  const role      = useStore(s => s.role);
  const activeTab = useStore(s => s.activeTab);
  const setScreen = useStore(s => s.setScreen);

  const renderTab = () => {
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

  return (
    <div className="app-shell">
      <div className="tab-content">{renderTab()}</div>
      {role === "organizer" && (
        <motion.div whileTap={{ scale: 0.9 }}
          onClick={() => setScreen("addEvent")}
          style={{
            position: "fixed",
            bottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 16px)",
            right: "20px", width: "52px", height: "52px", borderRadius: "50%",
            background: "linear-gradient(135deg, #F97316, #EA6C0A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 4px 20px rgba(249,115,22,0.5)", zIndex: 200,
          }}>
          <PlusCircle size={24} color="#fff" />
        </motion.div>
      )}
      <BottomNav />
    </div>
  );
}

function NavItem({ icon: Icon, label, active, collapsed, onClick, title }) {
  return (
    <motion.div whileTap={{ scale: 0.94 }} onClick={onClick} title={title}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "10px", marginBottom: "2px", cursor: "pointer",
        background: active ? "rgba(249,115,22,0.1)" : "transparent",
        transition: "all 0.18s ease", position: "relative",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(249,115,22,0.1)" : "transparent"; }}>
      {active && (
        <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: "3px", borderRadius: "0 3px 3px 0", background: "#F97316" }} />
      )}
      <Icon size={17} strokeWidth={active ? 2.5 : 1.8} color={active ? "#F97316" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <span style={{ fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", color: active ? "#F97316" : "var(--text-secondary)" }}>
          {label}
        </span>
      )}
    </motion.div>
  );
}

function DesktopTopbar({ navItems, activeTab, isFullScreen, screen, screenTitles, role, setScreen, setActiveTab, theme, setTheme }) {
  const searchQ    = useStore(s => s.searchQ);
  const setSearchQ = useStore(s => s.setSearchQ);
  const themeOpts  = { light: Sun, dark: Moon, system: Monitor };
  const themeOrder = ["light", "dark", "system"];
  const nextTheme  = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];
  const ThemeIcon  = themeOpts[theme];
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
          onChange={e => {
            setSearchQ(e.target.value);
            if (activeTab !== "home" && role === "attendee") { setActiveTab("home"); setScreen("app"); }
          }}
          placeholder="Search events, venues..."
          style={{ width: "100%", padding: "8px 14px 8px 36px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "13px", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)", transition: "all 0.2s" }}
          onFocus={e => { e.target.style.borderColor = "#F97316"; e.target.style.background = "var(--bg-card)"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-subtle)"; e.target.style.boxShadow = "none"; }}
        />
        {searchQ && <div onClick={() => setSearchQ("")} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px" }}>✕</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "99px", border: "1px solid rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.06)" }}>
          <motion.div animate={{ scale: [1,1.5,1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono)" }}>AMOY</span>
        </div>
        <motion.div whileTap={{ scale: 0.88 }} onClick={() => setTheme(nextTheme)}
          style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; e.currentTarget.style.background = "rgba(249,115,22,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-subtle)"; }}>
          <ThemeIcon size={14} color="var(--text-secondary)" />
        </motion.div>
      </div>
    </div>
  );
}

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
    { id: "home",    Icon: Home,          label: "Discover" },
    { id: "tickets", Icon: Ticket,        label: "My Tickets" },
    { id: "alerts",  Icon: Bell,          label: "Alerts" },
  ];
  const orgNav = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "events",    Icon: CalendarDays,    label: "My Events" },
    { id: "wallet",    Icon: Wallet,          label: "Wallet" },
    { id: "alerts",    Icon: Bell,            label: "Alerts" },
  ];
  const navItems     = role === "organizer" ? orgNav : attendeeNav;
  const isFullScreen = FULL_SCREENS.includes(screen);

  const renderContent = () => {
    if (isFullScreen) {
      const map = {
        checkout: <Checkout />, ticketView: <TicketView />,
        resale: <Resale />, resaleSuccess: <ResaleSuccess />,
        transfer: <Transfer />, paymentSuccess: <PaymentSuccess />,
        addEvent: <AddEvent />, orgEventDetail: <OrganizerEventDetail />,
        scanTicket: <OrganizerScan />, doorStaffLogin: <DoorStaffLogin />,
        doorStaffScan: <DoorStaffScan />, resaleMarket: <ResaleMarketplace />,
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

  const screenTitles = {
    checkout: "Checkout", ticketView: "Your Ticket", resale: "Resell Ticket",
    resaleSuccess: "Listed!", transfer: "Transfer Ticket",
    paymentSuccess: "Payment Successful", addEvent: "Create Event",
    orgEventDetail: "Event Details", scanTicket: "Scan Tickets",
    doorStaffLogin: "Door Staff", doorStaffScan: "Door Scanner",
    resaleMarket: "Resale Market",
  };

  const sidebarW = collapsed ? "64px" : "240px";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      <motion.aside animate={{ width: sidebarW }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", boxShadow: "1px 0 0 var(--border)", position: "relative", zIndex: 10 }}>

        {/* Sidebar header */}
        <div style={{ padding: "0 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "8px", height: "60px", flexShrink: 0 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}
                style={{ display: "flex", alignItems: "center", gap: "9px", overflow: "hidden" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "linear-gradient(135deg, #F97316, #EA6C0A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(249,115,22,0.35)" }}>
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
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{currentUser?.first_name} {currentUser?.last_name}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>{currentUser?.email}</div>
                </div>
              </div>
              <div style={{ marginTop: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "99px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", fontSize: "9px", fontWeight: 700, color: "#F97316", letterSpacing: "0.5px" }}>
                  {role === "organizer" ? <><Zap size={9} color="#F97316" /> ORGANIZER</> : <><Ticket size={9} color="#F97316" /> ATTENDEE</>}
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
            <NavItem icon={Ticket} label="Resale Market" active={screen === "resaleMarket"}
              collapsed={collapsed} title={collapsed ? "Resale Market" : ""}
              onClick={() => setScreen("resaleMarket")} />
          )}
          {role === "organizer" && (
            <div style={{ marginTop: "8px" }}>
              {!collapsed && <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "8px 10px 6px", fontFamily: "var(--font-mono)" }}>ACTIONS</div>}
              <motion.div whileTap={{ scale: 0.94 }} onClick={() => setScreen("addEvent")} title={collapsed ? "Create Event" : ""}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "10px", cursor: "pointer", border: collapsed ? "none" : "1.5px dashed rgba(249,115,22,0.3)", color: "#F97316", transition: "all 0.18s ease", marginBottom: "3px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,115,22,0.07)"; if (!collapsed) e.currentTarget.style.borderColor = "#F97316"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; if (!collapsed) e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)"; }}>
                <PlusCircle size={16} color="#F97316" style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px" }}>Create Event</span>}
              </motion.div>
              <motion.div whileTap={{ scale: 0.94 }} onClick={() => setScreen("scanTicket")} title={collapsed ? "Scan Tickets" : ""}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "10px", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <ScanLine size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px" }}>Scan Tickets</span>}
              </motion.div>
            </div>
          )}
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
    </div>
  );
}

function MobileAppContent() {
  const screen = useStore(s => s.screen);
  const routes = {
    login: <Login />, signup: <Signup />, role: <RoleSelect />,
    resetPassword: <ResetPassword />, app: <AppTabs />,
    checkout: <Checkout />, ticketView: <TicketView />,
    resale: <Resale />, resaleSuccess: <ResaleSuccess />,
    transfer: <Transfer />, paymentSuccess: <PaymentSuccess />,
    addEvent: <AddEvent />, orgEventDetail: <OrganizerEventDetail />,
    scanTicket: <OrganizerScan />, doorStaffLogin: <DoorStaffLogin />,
    doorStaffScan: <DoorStaffScan />, resaleMarket: <ResaleMarketplace />,
  };
  return (
    <div key={screen} className="screen-enter app-shell" style={{ background: "var(--bg)" }}>
      {routes[screen] || <AppTabs />}
    </div>
  );
}

export default function App() {
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const screen     = useStore(s => s.screen);
  const [desktop, setDesktop] = React.useState(window.innerWidth > 768);
  useTheme();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid    = params.get("uid");
    const token  = params.get("token");
    if (uid && token) {
      useStore.getState().setResetPasswordParams({ uid, token });
      useStore.getState().setScreen("resetPassword");
    }
    if (params.get("admin") === "1") {
      useStore.getState().setScreen("adminGateway");
    }
    if (params.get("door") === "1") {
      useStore.getState().setScreen("doorStaffLogin");
    }
  }, []);

  React.useEffect(() => {
    const handler = () => setDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Top-level screens — no login required ─────────────────
  if (screen === "adminGateway")   return <AdminLogin />;
  if (screen === "adminDashboard") return <AdminDashboard />;
  if (screen === "resetPassword")  return <ResetPassword />;
  if (screen === "doorStaffLogin") return <DoorStaffLogin />;
  if (screen === "doorStaffScan")  return <DoorStaffScan />;

  if (desktop && !isLoggedIn) {
    if (screen === "signup") return <Signup />;
    if (screen === "role")   return <RoleSelect />;
    if (screen === "login")  return <Login />;
  }
  if (desktop && isLoggedIn) return <DesktopAppLayout />;

  return (
    <PhoneFrame>
      <MobileAppContent />
    </PhoneFrame>
  );
}