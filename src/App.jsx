import React from "react";
import useStore from "./store/useStore";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import Onboarding from "./screens/onboarding/Onboarding";
import Login from "./screens/auth/Login";
import { Signup, RoleSelect } from "./screens/auth/Signup";
import AttendeeHome from "./screens/attendee/AttendeeHome";
import { AttendeeTickets, AttendeeAlerts } from "./screens/attendee/AttendeeScreens";
import { Checkout, TicketView, Resale, ResaleSuccess, Transfer } from "./screens/attendee/TransactionScreens";
import { OrganizerHome, OrganizerEvents, OrganizerAlerts, AddEvent, OrganizerEventDetail } from "./screens/organizer/OrganizerScreens";
import OrganizerWallet from "./screens/organizer/OrganizerWallet";
import { DoorStaffLogin, DoorStaffScan, OrganizerScan } from "./screens/doorstaff/DoorStaffScreens";

// ── Mobile app tabs (unchanged) ──────────────────────────────
function AppTabs() {
  const role = useStore(s => s.role);
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f8f8f6", position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: "72px" }}>
        {renderTab()}
      </div>
      {role === "organizer" && (
        <div onClick={() => setScreen("addEvent")} style={{ position: "fixed", bottom: "80px", right: "20px", width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,166,35,0.5)", color: "#fff", zIndex: 200 }}>+</div>
      )}
      <BottomNav />
    </div>
  );
}

// ── Desktop app layout — full website with sidebar ───────────
function DesktopAppLayout() {
  const screen = useStore(s => s.screen);
  const role = useStore(s => s.role);
  const activeTab = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen = useStore(s => s.setScreen);
  const currentUser = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);

  const attendeeNav = [
    { id: "home",    icon: "🏠", label: "Discover Events" },
    { id: "tickets", icon: "🎟️", label: "My Tickets" },
    { id: "alerts",  icon: "🔔", label: "Alerts" },
  ];

  const orgNav = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "events",    icon: "🎪", label: "My Events" },
    { id: "wallet",    icon: "💰", label: "Wallet" },
    { id: "alerts",    icon: "🔔", label: "Alerts" },
  ];

  const navItems = role === "organizer" ? orgNav : attendeeNav;

  // Screens that take over full content area (no tabs)
  const isFullScreen = ["checkout","ticketView","resale","resaleSuccess","transfer","addEvent","orgEventDetail","scanTicket","doorStaffLogin","doorStaffScan"].includes(screen);

  const renderContent = () => {
    if (isFullScreen) {
      const fullRoutes = {
        checkout:       <Checkout />,
        ticketView:     <TicketView />,
        resale:         <Resale />,
        resaleSuccess:  <ResaleSuccess />,
        transfer:       <Transfer />,
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

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen"
        style={{ boxShadow: "2px 0 20px rgba(0,0,0,0.04)" }}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)", boxShadow: "0 4px 12px rgba(245,166,35,0.3)" }}>🎟️</div>
            <div>
              <div className="font-extrabold text-gray-900 text-sm tracking-tight leading-none">Master Events</div>
              <div className="text-xs text-amber-500 font-semibold mt-0.5">{role === "organizer" ? "Organizer" : "Attendee"}</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f5a623, #e8920f)" }}>
              {currentUser?.first_name?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-gray-900 truncate">{currentUser?.first_name} {currentUser?.last_name}</div>
              <div className="text-xs text-gray-400 truncate">{currentUser?.email}</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-xs font-bold text-gray-300 tracking-widest px-3 mb-3">MENU</div>
          {navItems.map(item => {
            const isActive = !isFullScreen && activeTab === item.id;
            return (
              <div key={item.id}
                onClick={() => { setActiveTab(item.id); setScreen("app"); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all"
                style={{
                  background: isActive ? "rgba(245,166,35,0.1)" : "transparent",
                  color: isActive ? "#f5a623" : "#6b6b6b",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9f9f9"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <span className="text-lg w-6 text-center">{item.icon}</span>
                <span className="font-semibold text-sm">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </div>
            );
          })}

          {role === "organizer" && (
            <div className="mt-4">
              <div className="text-xs font-bold text-gray-300 tracking-widest px-3 mb-3">ACTIONS</div>
              <div onClick={() => setScreen("addEvent")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                style={{ color: "#f5a623" }}>
                <span className="text-lg w-6 text-center">➕</span>
                <span className="font-semibold text-sm">Create Event</span>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-50 transition-all"
            style={{ color: "#e74c3c" }}
            onClick={handleLogout}>
            <span className="text-lg w-6 text-center">🚪</span>
            <span className="font-semibold text-sm">Log Out</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40"
          style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
          <div>
            <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">
              {isFullScreen
                ? { checkout: "Checkout", ticketView: "Your Ticket", resale: "Resell Ticket", transfer: "Transfer Ticket", addEvent: "Create Event", orgEventDetail: "Event Details", scanTicket: "Scan Tickets", doorStaffLogin: "Door Staff", resaleSuccess: "Listed!" }[screen] || "Master Events"
                : navItems.find(n => n.id === activeTab)?.label || "Master Events"
              }
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Master Events · Ghana Blockchain Ticketing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-100 bg-green-50">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-green-600">Polygon Live</span>
            </div>
          </div>
        </div>

        {/* Page content — full width, scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div key={screen + activeTab} className="screen-enter" style={{ minHeight: "100%" }}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Mobile app content ───────────────────────────────────────
function MobileAppContent() {
  const screen = useStore(s => s.screen);

  const routes = {
    onboarding:     <Onboarding />,
    login:          <Login />,
    signup:         <Signup />,
    role:           <RoleSelect />,
    app:            <AppTabs />,
    checkout:       <Checkout />,
    ticketView:     <TicketView />,
    resale:         <Resale />,
    resaleSuccess:  <ResaleSuccess />,
    transfer:       <Transfer />,
    addEvent:       <AddEvent />,
    orgEventDetail: <OrganizerEventDetail />,
    scanTicket:     <OrganizerScan />,
    doorStaffLogin: <DoorStaffLogin />,
    doorStaffScan:  <DoorStaffScan />,
  };

  return (
    <div key={screen} className="screen-enter"
      style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f8f8f6" }}>
      {routes[screen] || <Login />}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  const screen = useStore(s => s.screen);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Desktop + logged in = full desktop layout, no frame
  if (!isMobile && isLoggedIn) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { overflow-y: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #f5a623; border-radius: 3px; }
          .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 10px; }
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
          .slide-in-left { animation: slideInLeft 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
          @keyframes slideInLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        `}</style>
        <DesktopAppLayout />
      </>
    );
  }

  // Mobile OR not logged in = PhoneFrame (landing, auth, onboarding)
  return (
    <PhoneFrame>
      <MobileAppContent />
    </PhoneFrame>
  );
}