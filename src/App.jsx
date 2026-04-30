import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "./store/useStore";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import Login from "./screens/auth/Login";
import { Signup, RoleSelect } from "./screens/auth/Signup";
import AttendeeHome from "./screens/attendee/AttendeeHome";
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
import { useTheme } from "./hooks/useTheme";
import {
  Home, Ticket, Bell, LayoutDashboard, CalendarDays, Wallet,
  LogOut, Sun, Moon, Monitor, ChevronLeft, ChevronRight,
  PlusCircle, Zap, ScanLine, Settings
} from "lucide-react";

// ── Mobile app tabs ───────────────────────────────────────────
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)", position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: "72px" }}>
        {renderTab()}
      </div>
      {role === "organizer" && (
        <motion.div whileTap={{ scale: 0.92 }} onClick={() => setScreen("addEvent")}
          style={{ position: "fixed", bottom: "80px", right: "20px", width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,166,35,0.5)", zIndex: 200 }}>
          <PlusCircle size={24} color="#fff" />
        </motion.div>
      )}
      <BottomNav />
    </div>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────
function NavItem({ icon: Icon, label, active, collapsed, onClick, title }) {
  return (
    <motion.div whileTap={{ scale: 0.94 }} onClick={onClick} title={title}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "12px", marginBottom: "2px", cursor: "pointer", background: active ? "rgba(245,166,35,0.1)" : "transparent", transition: "all 0.18s ease" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "rgba(245,166,35,0.1)" : "transparent"; }}>
      <Icon size={17} strokeWidth={active ? 2.5 : 1.8} color={active ? "#f5a623" : "var(--text-secondary)"} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", color: active ? "#f5a623" : "var(--text-secondary)" }}>{label}</span>}
      {!collapsed && active && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#f5a623" }} />}
    </motion.div>
  );
}

// ── Desktop app layout ────────────────────────────────────────
function DesktopAppLayout() {
  const screen       = useStore(s => s.screen);
  const role         = useStore(s => s.role);
  const activeTab    = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const currentUser  = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed]     = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(true);

  const attendeeNav = [
    { id: "home",    Icon: Home,          label: "Discover Events" },
    { id: "tickets", Icon: Ticket,        label: "My Tickets"      },
    { id: "alerts",  Icon: Bell,          label: "Alerts"          },
  ];
  const orgNav = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "events",    Icon: CalendarDays,    label: "My Events"  },
    { id: "wallet",    Icon: Wallet,          label: "Wallet"     },
    { id: "alerts",    Icon: Bell,            label: "Alerts"     },
  ];
  const navItems = role === "organizer" ? orgNav : attendeeNav;

  const isFullScreen = [
    "checkout", "ticketView", "resale", "resaleSuccess",
    "transfer", "paymentSuccess", "addEvent", "orgEventDetail",
    "scanTicket", "doorStaffLogin", "doorStaffScan"
  ].includes(screen);

  const renderContent = () => {
    if (isFullScreen) {
      const fullRoutes = {
        checkout: <Checkout />, ticketView: <TicketView />,
        resale: <Resale />, resaleSuccess: <ResaleSuccess />,
        transfer: <Transfer />, paymentSuccess: <PaymentSuccess />,
        addEvent: <AddEvent />, orgEventDetail: <OrganizerEventDetail />,
        scanTicket: <OrganizerScan />, doorStaffLogin: <DoorStaffLogin />,
        doorStaffScan: <DoorStaffScan />,
      };
      return fullRoutes[screen];
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
    checkout: "Checkout", ticketView: "Your Ticket",
    resale: "Resell Ticket", resaleSuccess: "Listed!",
    transfer: "Transfer Ticket", paymentSuccess: "Payment Successful",
    addEvent: "Create Event", orgEventDetail: "Event Details",
    scanTicket: "Scan Tickets", doorStaffLogin: "Door Staff",
    doorStaffScan: "Door Scanner",
  };

  const themeOptions = { light: { Icon: Sun, label: "Light" }, dark: { Icon: Moon, label: "Dark" }, system: { Icon: Monitor, label: "System" } };
  const themeOrder   = ["light", "dark", "system"];
  const nextTheme    = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];
  const ThemeIcon    = themeOptions[theme].Icon;
  const sidebarW     = collapsed ? "68px" : "256px";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden", boxShadow: "2px 0 20px rgba(0,0,0,0.04)" }}>

        {/* ── Brand ── */}
        <div style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "8px", minHeight: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", flex: 1 }}>
            {/* Logo mark — always visible */}
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>
              <Ticket size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }} style={{ overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Master Events</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                      style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#16a34a" }} />
                    <span style={{ fontSize: "9px", color: "#16a34a", fontWeight: 700, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>POLYGON LIVE</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: "26px", height: "26px", borderRadius: "8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {collapsed ? <ChevronRight size={13} color="var(--text-muted)" /> : <ChevronLeft size={13} color="var(--text-muted)" />}
          </motion.button>
        </div>

        {/* ── Profile — collapsible ── */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          {collapsed ? (
            <motion.div whileHover={{ background: "var(--bg-hover)" }} whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(false)}
              title={currentUser?.first_name + " " + currentUser?.last_name}
              style={{ padding: "12px 0", display: "flex", justifyContent: "center", cursor: "pointer" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
              </div>
            </motion.div>
          ) : (
            <motion.div onClick={() => setProfileOpen(!profileOpen)}
              style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.first_name} {currentUser?.last_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.email}
                  </div>
                </div>
                <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronLeft size={12} color="var(--text-muted)" style={{ transform: "rotate(-90deg)" }} />
                </motion.div>
              </div>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}>
                    <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "99px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)" }}>
                      {role === "organizer"
                        ? <Zap size={9} color="#f5a623" />
                        : <Ticket size={9} color="#f5a623" />
                      }
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#f5a623", letterSpacing: "0.5px" }}>
                        {role === "organizer" ? "ORGANIZER" : "ATTENDEE"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {!collapsed && (
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "0 8px", marginBottom: "8px" }}>MENU</div>
          )}
          {navItems.map(item => (
            <NavItem key={item.id} icon={item.Icon} label={item.label}
              active={!isFullScreen && activeTab === item.id}
              collapsed={collapsed}
              title={collapsed ? item.label : ""}
              onClick={() => { setActiveTab(item.id); setScreen("app"); }} />
          ))}

          {role === "organizer" && (
            <div style={{ marginTop: "12px" }}>
              {!collapsed && (
                <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "0 8px", marginBottom: "8px" }}>ACTIONS</div>
              )}
              <motion.div whileTap={{ scale: 0.94 }}
                onClick={() => setScreen("addEvent")}
                title={collapsed ? "Create Event" : ""}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "12px", cursor: "pointer", border: collapsed ? "none" : "1.5px dashed rgba(245,166,35,0.3)", color: "#f5a623", transition: "all 0.18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,166,35,0.06)"; if (!collapsed) e.currentTarget.style.borderColor = "#f5a623"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; if (!collapsed) e.currentTarget.style.borderColor = "rgba(245,166,35,0.3)"; }}>
                <PlusCircle size={17} style={{ flexShrink: 0 }} color="#f5a623" />
                {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px" }}>Create Event</span>}
              </motion.div>

              <motion.div whileTap={{ scale: 0.94 }}
                onClick={() => setScreen("scanTicket")}
                title={collapsed ? "Scan Tickets" : ""}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "12px", cursor: "pointer", marginTop: "4px", color: "var(--text-secondary)", transition: "all 0.18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <ScanLine size={17} style={{ flexShrink: 0 }} color="var(--text-secondary)" />
                {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px" }}>Scan Tickets</span>}
              </motion.div>
            </div>
          )}
        </nav>

        {/* ── Bottom — theme + logout ── */}
        <div style={{ padding: "8px", borderTop: "1px solid var(--border)" }}>
          <motion.div whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(nextTheme)}
            title={collapsed ? themeOptions[theme].label + " mode" : "Switch to " + nextTheme}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "12px", cursor: "pointer", marginBottom: "2px", transition: "background 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <ThemeIcon size={17} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {themeOptions[theme].label} mode
              </span>
            )}
          </motion.div>

          <motion.div whileTap={{ scale: 0.9 }} onClick={handleLogout}
            title={collapsed ? "Log Out" : ""}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "10px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "12px", cursor: "pointer", transition: "background 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--error-bg)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <LogOut size={17} color="var(--error)" style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--error)" }}>Log Out</span>}
          </motion.div>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40, boxShadow: "var(--shadow-sm)" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "19px", color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
              {isFullScreen
                ? screenTitles[screen] || "Master Events"
                : navItems.find(n => n.id === activeTab)?.label || "Master Events"
              }
            </h1>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
              {new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "99px", border: "1px solid rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.06)" }}>
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>Polygon Live</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div key={screen + activeTab} className="screen-enter" style={{ minHeight: "100%" }}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Mobile content ────────────────────────────────────────────
function MobileAppContent() {
  const screen = useStore(s => s.screen);

  const routes = {
    login:          <Login />,
    signup:         <Signup />,
    role:           <RoleSelect />,
    app:            <AppTabs />,
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
  };

  return (
    <div key={screen} className="screen-enter"
      style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {routes[screen] || <Login />}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const [desktop, setDesktop] = React.useState(window.innerWidth > 768);
  useTheme();

  React.useEffect(() => {
    const handler = () => setDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (desktop && isLoggedIn) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { overflow-y: auto; font-family: var(--font-sans); background: var(--bg); color: var(--text-primary); }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-thumb { background: #f5a623; border-radius: 3px; }
          .skeleton { background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--bg-hover) 50%, var(--bg-subtle) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px; }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
          .screen-enter { animation: fadeSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .stagger > *:nth-child(1) { animation: fadeSlideUp 0.25s 0.04s both; }
          .stagger > *:nth-child(2) { animation: fadeSlideUp 0.25s 0.08s both; }
          .stagger > *:nth-child(3) { animation: fadeSlideUp 0.25s 0.12s both; }
          .stagger > *:nth-child(4) { animation: fadeSlideUp 0.25s 0.16s both; }
          .stagger > *:nth-child(5) { animation: fadeSlideUp 0.25s 0.20s both; }
          .stagger > *:nth-child(6) { animation: fadeSlideUp 0.25s 0.24s both; }
          .stagger > *:nth-child(7) { animation: fadeSlideUp 0.25s 0.28s both; }
          .stagger > *:nth-child(8) { animation: fadeSlideUp 0.25s 0.32s both; }
          .event-card { transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s; cursor: pointer; }
          .event-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.13) !important; }
          .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
          .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important; }
          .chip { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
          .chip:active { transform: scale(0.95); }
          .pulse { animation: pulse 2s ease-in-out infinite; }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
          .fade-in { animation: fadeIn 0.3s ease forwards; }
          @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
          .overlay-fade { animation: fadeIn 0.2s ease forwards; }
        `}</style>
        <DesktopAppLayout />
      </>
    );
  }

  return (
    <PhoneFrame>
      <MobileAppContent />
    </PhoneFrame>
  );
}