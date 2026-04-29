import React from "react";
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
import ThemeToggle from "./components/ThemeToggle";

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
        <div onClick={() => setScreen("addEvent")}
          style={{ position: "fixed", bottom: "80px", right: "20px", width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,166,35,0.5)", color: "#fff", zIndex: 200 }}>+</div>
      )}
      <BottomNav />
    </div>
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

  const attendeeNav = [
    { id: "home",    icon: "🏠", label: "Discover Events" },
    { id: "tickets", icon: "🎟️", label: "My Tickets"      },
    { id: "alerts",  icon: "🔔", label: "Alerts"           },
  ];
  const orgNav = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "events",    icon: "🎪", label: "My Events"  },
    { id: "wallet",    icon: "💰", label: "Wallet"     },
    { id: "alerts",    icon: "🔔", label: "Alerts"     },
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
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: "256px", flexShrink: 0, background: "var(--bg-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", boxShadow: "2px 0 20px rgba(0,0,0,0.04)" }}>

        {/* Logo */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 12px rgba(245,166,35,0.3)", flexShrink: 0 }}>🎟️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Master Events</div>
              <div style={{ fontSize: "11px", color: "#f5a623", fontWeight: 600, marginTop: "2px" }}>{role === "organizer" ? "Organizer" : "Attendee"}</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {currentUser?.first_name?.[0] || "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.first_name} {currentUser?.last_name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "0 12px", marginBottom: "10px" }}>MENU</div>
          {navItems.map(item => {
            const isActive = !isFullScreen && activeTab === item.id;
            return (
              <div key={item.id}
                onClick={() => { setActiveTab(item.id); setScreen("app"); }}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", marginBottom: "2px", cursor: "pointer", background: isActive ? "rgba(245,166,35,0.1)" : "transparent", color: isActive ? "#f5a623" : "var(--text-secondary)", transition: "all 0.18s ease" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{item.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>{item.label}</span>
                {isActive && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#f5a623" }} />}
              </div>
            );
          })}

          {role === "organizer" && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1.5px", padding: "0 12px", marginBottom: "10px" }}>ACTIONS</div>
              <div onClick={() => setScreen("addEvent")}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", border: "1.5px dashed rgba(245,166,35,0.3)", color: "#f5a623", transition: "all 0.18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,166,35,0.06)"; e.currentTarget.style.borderColor = "#f5a623"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(245,166,35,0.3)"; }}>
                <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>➕</span>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>Create Event</span>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom — theme + logout */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ padding: "8px 12px", marginBottom: "4px" }}>
            <ThemeToggle compact={false} />
          </div>
          <div onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", color: "var(--error)", transition: "background 0.18s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--error-bg)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>🚪</span>
            <span style={{ fontWeight: 600, fontSize: "13px" }}>Log Out</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40, boxShadow: "var(--shadow-sm)" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
              {isFullScreen
                ? screenTitles[screen] || "Master Events"
                : navItems.find(n => n.id === activeTab)?.label || "Master Events"
              }
            </h1>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Master Events · Ghana Blockchain Ticketing</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "99px", border: "1px solid rgba(22,163,74,0.2)", background: "rgba(22,163,74,0.06)" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
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