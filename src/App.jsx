import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore, { _setRestoringFromHistory } from "./store/useStore";
import PhoneFrame from "./components/PhoneFrame";
import Login from "./screens/auth/Login";
import { Signup, RoleSelect } from "./screens/auth/Signup";
import ResetPassword from "./screens/auth/ResetPassword";
import AttendeeHome from "./screens/attendee/AttendeeHome";
import LandingPage from "./screens/landing/LandingPage";
import AboutPage from "./screens/landing/AboutPage";
import VerifyTicket from "./screens/attendee/VerifyTicket";
import ResaleMarketplace from "./screens/attendee/ResaleMarketplace";
import CookieBanner from "./components/CookieBanner";
import Settings from "./screens/attendee/Settings";
import AttendeeWallet from "./screens/attendee/AttendeeWallet";
import PrivacyPolicy from "./screens/attendee/PrivacyPolicy";
import PublicEventPage from "./screens/attendee/PublicEventPage";
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

const FULL_SCREENS = [
  "checkout", "ticketView", "resale", "resaleSuccess",
  "transfer", "paymentSuccess", "addEvent", "orgEventDetail",
  "scanTicket", "resaleMarket", "settings", "privacy", "attendeeWallet",
  "pendingEvent",
];

const APP_MODE_SCREENS = [
  "login", "signup", "role", "resetPassword",
  "adminGateway", "adminDashboard",
  "doorStaffLogin", "doorStaffScan", "app",
];

function publicNavigate(target) {
  const setScreen = useStore.getState().setScreen;
  if (target === "home")   { setScreen("landing"); return; }
  if (target === "about")  { setScreen("about");   return; }
  if (target === "signup") { setScreen("signup");  return; }
  if (target === "login")  { setScreen("login");   return; }
}

// ── FIX: bg-white → bg-brand-card. This header wraps every mobile
// content screen — it was the reason dark mode looked "half done" on
// mobile: Discover/Checkout/Ticket View content went dark correctly,
// but the header sitting above them stayed hardcoded light. ──
function MobileTopHeader({ onMenuOpen, title }) {
  const { theme, setTheme } = useTheme();
  const themeOrder = ["light", "dark", "system"];
  const ThemeIcons = { light: Sun, dark: Moon, system: Monitor };
  const nextTheme  = themeOrder[(themeOrder.indexOf(theme) + 1) % 3];
  const ThemeIcon  = ThemeIcons[theme];
  return (
    <div className="sticky top-0 z-50 bg-brand-card border-b border-gray-100 h-14 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center shrink-0">
          <Ticket size={15} strokeWidth={2} color="#fff" />
        </div>
        <span className="font-extrabold text-[15px] text-brand-text tracking-tight">{title || "Master Events"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => setTheme(nextTheme)}
          className="w-[34px] h-[34px] rounded-xl bg-brand-canvas border border-gray-200 flex items-center justify-center">
          <ThemeIcon size={15} className="text-brand-muted" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onMenuOpen}
          className="w-[34px] h-[34px] rounded-xl bg-brand-canvas border border-gray-200 flex items-center justify-center">
          <Menu size={17} className="text-brand-text" />
        </motion.button>
      </div>
    </div>
  );
}

// ── FIX: bg-white → bg-brand-card on the slide-out drawer panel ──
function MobileDrawer({ open, onClose }) {
  const role         = useStore(s => s.role);
  const activeTab    = useStore(s => s.activeTab);
  const screen       = useStore(s => s.screen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const handleLogout = useStore(s => s.handleLogout);
  const currentUser  = useStore(s => s.currentUser);

  const attendeeNav = [
    { id:"home",           icon:Home,        label:"Discover",      tab:true },
    { id:"tickets",        icon:Ticket,      label:"My Tickets",    tab:true },
    { id:"alerts",         icon:Bell,        label:"Alerts",        tab:true },
    { id:"resaleMarket",   icon:ShoppingBag, label:"Resale Market", tab:false, screen:"resaleMarket" },
    { id:"attendeeWallet", icon:Wallet,      label:"My Wallet",     tab:false, screen:"attendeeWallet" },
  ];
  const orgNav = [
    { id:"dashboard", icon:LayoutDashboard, label:"Dashboard", tab:true },
    { id:"events",    icon:CalendarDays,    label:"My Events", tab:true },
    { id:"wallet",    icon:Wallet,          label:"Wallet",    tab:true },
    { id:"alerts",    icon:Bell,            label:"Alerts",    tab:true },
  ];
  const navItems = role === "organizer" ? orgNav : attendeeNav;
  const isActive = (item) => item.screen ? screen === item.screen : activeTab === item.id && !FULL_SCREENS.includes(screen);
  const handleNav = (item) => { onClose(); item.screen ? setScreen(item.screen) : (setActiveTab(item.id), setScreen("app")); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[200]" />
          <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ duration:0.15 }}
            className="fixed top-0 right-0 bottom-0 w-[82%] max-w-[320px] bg-brand-card z-[201] flex flex-col shadow-xl border-l border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Avatar seed={currentUser?.email} name={currentUser?.first_name} size={38} className="rounded-full border-2 border-pastel-orange" />
                <div>
                  <div className="font-bold text-sm text-brand-text leading-tight">{currentUser?.first_name} {currentUser?.last_name}</div>
                  <div className="text-[10px] text-brand-muted mt-0.5 truncate max-w-[160px]">{currentUser?.email}</div>
                </div>
              </div>
              <motion.button whileTap={{ scale:0.9 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-brand-canvas border border-gray-200 flex items-center justify-center">
                <X size={15} className="text-brand-muted" />
              </motion.button>
            </div>

            <div className="px-5 py-2.5 border-b border-gray-100 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pastel-orange">
                <Zap size={9} className="text-brand-orange" />
                <span className="text-[9px] font-bold text-brand-orange tracking-wide">{role === "organizer" ? "ORGANIZER" : "ATTENDEE"}</span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-2 overflow-y-auto">
              <div className="text-[9px] font-bold text-brand-muted tracking-widest px-2 pt-2 pb-1.5 font-mono">NAVIGATE</div>
              {navItems.map(item => {
                const active = isActive(item);
                const Icon   = item.icon;
                return (
                  <motion.div key={item.id} whileTap={{ scale:0.97 }} onClick={() => handleNav(item)}
                    className={`flex items-center gap-3 px-2.5 py-2.5 mb-0.5 rounded-xl cursor-pointer relative ${active ? "bg-pastel-orange" : ""}`}>
                    {active && <div className="absolute left-0 top-[25%] h-1/2 w-[3px] rounded-r-full bg-brand-orange" />}
                    <Icon size={17} strokeWidth={active ? 2.5 : 1.75} className={active ? "text-brand-orange" : "text-brand-muted"} />
                    <span className={`text-sm ${active ? "font-bold text-brand-orange" : "font-medium text-brand-text"}`}>{item.label}</span>
                  </motion.div>
                );
              })}
              {role === "organizer" && (
                <>
                  <div className="text-[9px] font-bold text-brand-muted tracking-widest px-2 pt-3.5 pb-1.5 font-mono">ACTIONS</div>
                  <motion.div whileTap={{ scale:0.97 }} onClick={() => { onClose(); setScreen("addEvent"); }}
                    className="flex items-center gap-3 px-2.5 py-2.5 mb-1.5 rounded-xl cursor-pointer border-[1.5px] border-dashed border-brand-orange/30 text-brand-orange">
                    <PlusCircle size={17} /><span className="text-sm font-semibold">Create Event</span>
                  </motion.div>
                  <motion.div whileTap={{ scale:0.97 }} onClick={() => { onClose(); setScreen("scanTicket"); }}
                    className="flex items-center gap-3 px-2.5 py-2.5 mb-0.5 rounded-xl cursor-pointer text-brand-muted">
                    <ScanLine size={17} /><span className="text-sm font-medium">Scan Tickets</span>
                  </motion.div>
                </>
              )}
            </nav>

            <div className="border-t border-gray-100 pt-3 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shrink-0">
              <motion.div whileTap={{ scale:0.97 }} onClick={() => { onClose(); setScreen("settings"); }}
                className={`flex items-center gap-3 px-2.5 py-3 mb-1.5 rounded-xl cursor-pointer ${screen === "settings" ? "bg-pastel-orange" : ""}`}>
                <SettingsIcon size={17} strokeWidth={1.75} className={screen === "settings" ? "text-brand-orange" : "text-brand-muted"} />
                <span className={`text-sm font-medium ${screen === "settings" ? "text-brand-orange" : "text-brand-text"}`}>Account Settings</span>
              </motion.div>
              <motion.button whileTap={{ scale:0.97 }} onClick={() => { onClose(); handleLogout(); }}
                className="w-full min-h-[48px] px-3.5 py-3 rounded-xl bg-red-50 border-[1.5px] border-red-200 flex items-center justify-center gap-2.5">
                <LogOut size={16} className="text-red-600" /><span className="font-bold text-sm text-red-600">Log Out</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

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

function MobileAppShell() {
  const screen = useStore(s => s.screen);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const screenTitles = {
    checkout:"Checkout", ticketView:"My Ticket", resale:"List for Resale",
    resaleSuccess:"Listed!", transfer:"Transfer Ticket", paymentSuccess:"Payment Successful!",
    addEvent:"Create Event", orgEventDetail:"Event Details", scanTicket:"Scan Tickets",
    resaleMarket:"Resale Market", settings:"Settings", privacy:"Privacy Policy",
    attendeeWallet:"My Wallet", pendingEvent:"Event",
  };
  const tabTitles = { home:"Discover", tickets:"My Tickets", alerts:"Alerts", dashboard:"Dashboard", events:"My Events", wallet:"Wallet" };
  const currentTitle = FULL_SCREENS.includes(screen) ? screenTitles[screen] : tabTitles[useStore.getState().activeTab] || "Master Events";

  const fullScreenMap = {
    checkout:<Checkout />, ticketView:<TicketView />, resale:<Resale />,
    resaleSuccess:<ResaleSuccess />, transfer:<Transfer />, paymentSuccess:<PaymentSuccess />,
    addEvent:<AddEvent />, orgEventDetail:<OrganizerEventDetail />, scanTicket:<OrganizerScan />,
    pendingEvent:<PublicEventPage />,
  };
  const navScreenMap = {
    resaleMarket:<ResaleMarketplace />, settings:<Settings />,
    privacy:<PrivacyPolicy />, attendeeWallet:<AttendeeWallet />,
  };

  const isLoggedIn = useStore(s => s.isLoggedIn);
  const activeTab  = useStore(s => s.activeTab);

  if (!isLoggedIn && activeTab === "home" && screen === "app") return (
    <div className="app-shell">
      <div className="tab-content"><LandingPage onNavigate={publicNavigate} /></div>
    </div>
  );

  if (fullScreenMap[screen]) return (
    <div className="app-shell"><div className="tab-content">{fullScreenMap[screen]}</div></div>
  );
  return (
    <div className="app-shell">
      <MobileTopHeader onMenuOpen={() => setDrawerOpen(true)} title={currentTitle} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="tab-content">{navScreenMap[screen] || <MobileTabContent />}</div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, collapsed, onClick, title }) {
  return (
    <motion.div whileTap={{ scale:0.94 }} onClick={onClick} title={title}
      className={`flex items-center gap-2.5 mb-0.5 rounded-xl cursor-pointer relative transition-colors
        ${collapsed ? "justify-center py-2.5" : "justify-start px-3 py-2.5"}
        ${active ? "bg-pastel-orange" : "hover:bg-brand-canvas"}`}>
      {active && <div className="absolute left-0 top-[20%] h-3/5 w-[3px] rounded-r-full bg-brand-orange" />}
      <Icon size={17} strokeWidth={active ? 2.5 : 1.75} className={`shrink-0 ${active ? "text-brand-orange" : "text-brand-muted"}`} />
      {!collapsed && <span className={`text-[13px] whitespace-nowrap ${active ? "font-bold text-brand-orange" : "font-semibold text-brand-text"}`}>{label}</span>}
    </motion.div>
  );
}

// ── FIX: bg-white → bg-brand-card on the desktop topbar — this is
// the exact bar sitting above Discover/My Tickets on desktop that
// stayed light while the content below it went dark. ──
function DesktopTopbar({ navItems, activeTab, isFullScreen, screen, screenTitles, role, setScreen, setActiveTab, theme, setTheme, currentUser }) {
  const searchQ    = useStore(s => s.searchQ);
  const setSearchQ = useStore(s => s.setSearchQ);
  const themeOpts  = { light:Sun, dark:Moon, system:Monitor };
  const ThemeIcon  = themeOpts[theme] || Sun;
  const pageTitle  = isFullScreen ? screenTitles[screen] || "Master Events" : navItems.find(n => n.id === activeTab)?.label || "Master Events";

  return (
    <div className="sticky top-0 z-40 bg-brand-card border-b border-gray-100 h-[60px] px-7 flex items-center justify-between gap-5 shrink-0">
      <div className="shrink-0 min-w-[120px]">
        <h1 className="font-extrabold text-[16px] text-brand-text tracking-tight leading-tight">{pageTitle}</h1>
        <p className="text-[10px] text-brand-muted mt-0.5 font-mono">{new Date().toLocaleDateString("en-GH", { weekday:"short", month:"short", day:"numeric" })}</p>
      </div>

      <div className="flex-1 max-w-[420px] relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
        <input value={searchQ} onChange={e => { setSearchQ(e.target.value); if (activeTab !== "home" && role === "attendee") { setActiveTab("home"); setScreen("app"); } }}
          placeholder="Search events, venues..."
          className="w-full pl-9 pr-3.5 py-2 bg-brand-canvas border border-gray-200 rounded-xl text-[13px] text-brand-text outline-none focus:border-brand-orange focus:bg-brand-card transition-colors" />
        {searchQ && (
          <button onClick={() => setSearchQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted">
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-[10px] font-bold text-emerald-600 font-mono">AMOY</span>
        </div>
        <motion.button whileTap={{ scale:0.88 }} onClick={() => setTheme(["light","dark","system"][(["light","dark","system"].indexOf(theme)+1)%3])}
          className="w-8 h-8 rounded-xl bg-brand-canvas border border-gray-200 flex items-center justify-center hover:border-brand-orange transition-colors">
          <ThemeIcon size={14} className="text-brand-muted" />
        </motion.button>
        <div className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-brand-canvas border border-gray-200">
          <Avatar seed={currentUser?.email} name={currentUser?.first_name} size={28} className="rounded-full shrink-0" />
          <span className="text-xs font-semibold text-brand-text whitespace-nowrap max-w-[100px] truncate">{currentUser?.first_name} {currentUser?.last_name}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-pastel-orange text-[8px] font-bold text-brand-orange whitespace-nowrap">{role === "organizer" ? "ORGANIZER" : "ATTENDEE"}</span>
        </div>
      </div>
    </div>
  );
}

// ── FIX: bg-white → bg-brand-card on the desktop sidebar — the
// other half of the "navbar stays light" report on desktop. ──
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
    { id:"home",    Icon:Home,           label:"Discover"   },
    { id:"tickets", Icon:Ticket,         label:"My Tickets" },
    { id:"alerts",  Icon:Bell,           label:"Alerts"     },
  ];
  const orgNav = [
    { id:"dashboard", Icon:LayoutDashboard, label:"Dashboard" },
    { id:"events",    Icon:CalendarDays,    label:"My Events" },
    { id:"wallet",    Icon:Wallet,          label:"Wallet"    },
    { id:"alerts",    Icon:Bell,            label:"Alerts"    },
  ];
  const navItems     = role === "organizer" ? orgNav : attendeeNav;
  const isFullScreen = FULL_SCREENS.includes(screen);

  const screenTitles = {
    checkout:"Checkout", ticketView:"Your Ticket", resale:"Resell Ticket",
    resaleSuccess:"Listed!", transfer:"Transfer Ticket", paymentSuccess:"Payment Successful",
    addEvent:"Create Event", orgEventDetail:"Event Details", scanTicket:"Scan Tickets",
    doorStaffLogin:"Door Staff", doorStaffScan:"Door Scanner", resaleMarket:"Resale Market",
    settings:"Account Settings", privacy:"Privacy Policy", attendeeWallet:"My Wallet",
    pendingEvent:"Event",
  };

  const renderContent = () => {
    if (isFullScreen) {
      const map = {
        checkout:<Checkout />, ticketView:<TicketView />, resale:<Resale />,
        resaleSuccess:<ResaleSuccess />, transfer:<Transfer />, paymentSuccess:<PaymentSuccess />,
        addEvent:<AddEvent />, orgEventDetail:<OrganizerEventDetail />, scanTicket:<OrganizerScan />,
        doorStaffLogin:<DoorStaffLogin />, doorStaffScan:<DoorStaffScan />,
        resaleMarket:<ResaleMarketplace />, settings:<Settings />, privacy:<PrivacyPolicy />,
        attendeeWallet:<AttendeeWallet />, pendingEvent:<PublicEventPage />,
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

  return (
    <div className="flex h-screen bg-brand-canvas font-sans overflow-hidden">
      <motion.aside animate={{ width: collapsed ? 64 : 220 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
        className="shrink-0 bg-brand-card border-r border-gray-100 flex flex-col h-screen overflow-hidden relative z-10">
        <div className={`border-b border-gray-100 h-[60px] flex items-center gap-2 shrink-0 ${collapsed ? "justify-center px-0" : "justify-between px-3"}`}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.16 }}
                className="flex items-center gap-2 overflow-hidden">
                <div className="w-[30px] h-[30px] rounded-xl bg-brand-orange flex items-center justify-center shrink-0">
                  <Ticket size={15} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-extrabold text-[13px] text-brand-text tracking-tight whitespace-nowrap">Master Events</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 pulse-dot" />
                    <span className="text-[8px] text-emerald-600 font-bold tracking-wide font-mono whitespace-nowrap">POLYGON AMOY</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileTap={{ scale:0.88 }} onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 rounded-lg bg-brand-canvas border border-gray-200 flex items-center justify-center shrink-0">
            {collapsed ? <ChevronRight size={12} className="text-brand-muted" /> : <ChevronLeft size={12} className="text-brand-muted" />}
          </motion.button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {!collapsed && <div className="text-[9px] font-bold text-brand-muted tracking-widest px-2.5 pt-2 pb-1.5 font-mono">NAVIGATE</div>}
          {navItems.map(item => (
            <NavItem key={item.id} icon={item.Icon} label={item.label} active={!isFullScreen && activeTab === item.id}
              collapsed={collapsed} title={collapsed ? item.label : ""} onClick={() => { setActiveTab(item.id); setScreen("app"); }} />
          ))}
          {role === "attendee" && (
            <>
              <NavItem icon={ShoppingBag} label="Resale Market" active={screen==="resaleMarket"} collapsed={collapsed} title={collapsed?"Resale Market":""} onClick={() => setScreen("resaleMarket")} />
              <NavItem icon={Wallet} label="My Wallet" active={screen==="attendeeWallet"} collapsed={collapsed} title={collapsed?"My Wallet":""} onClick={() => setScreen("attendeeWallet")} />
            </>
          )}
          {role === "organizer" && (
            <div className="mt-2">
              {!collapsed && <div className="text-[9px] font-bold text-brand-muted tracking-widest px-2.5 pt-2 pb-1.5 font-mono">ACTIONS</div>}
              <motion.div whileTap={{ scale:0.94 }} onClick={() => setScreen("addEvent")}
                className={`flex items-center gap-2.5 mb-0.5 rounded-xl cursor-pointer text-brand-orange hover:bg-pastel-orange transition-colors
                  ${collapsed ? "justify-center py-2.5" : "justify-start px-3 py-2.5 border-[1.5px] border-dashed border-brand-orange/30"}`}>
                <PlusCircle size={16} className="shrink-0" />
                {!collapsed && <span className="font-semibold text-[13px]">Create Event</span>}
              </motion.div>
              <motion.div whileTap={{ scale:0.94 }} onClick={() => setScreen("scanTicket")}
                className={`flex items-center gap-2.5 mb-0.5 rounded-xl cursor-pointer text-brand-muted hover:bg-brand-canvas transition-colors
                  ${collapsed ? "justify-center py-2.5" : "justify-start px-3 py-2.5"}`}>
                <ScanLine size={16} className="shrink-0" />
                {!collapsed && <span className="font-semibold text-[13px]">Scan Tickets</span>}
              </motion.div>
            </div>
          )}
          <div className="mt-2">
            <NavItem icon={SettingsIcon} label="Settings" active={screen==="settings"} collapsed={collapsed} title={collapsed?"Settings":""} onClick={() => setScreen("settings")} />
          </div>
        </nav>

        <div className="p-2 border-t border-gray-100 shrink-0">
          <motion.div whileTap={{ scale:0.9 }} onClick={handleLogout} title={collapsed?"Log Out":""}
            className={`flex items-center gap-2.5 rounded-xl cursor-pointer hover:bg-red-50 transition-colors
              ${collapsed ? "justify-center py-2.5" : "justify-start px-3 py-2.5"}`}>
            <LogOut size={16} className="text-red-600 shrink-0" />
            {!collapsed && <span className="font-semibold text-[13px] text-red-600">Log Out</span>}
          </motion.div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DesktopTopbar navItems={navItems} activeTab={activeTab} isFullScreen={isFullScreen} screen={screen} screenTitles={screenTitles} role={role} setScreen={setScreen} setActiveTab={setActiveTab} theme={theme} setTheme={setTheme} currentUser={currentUser} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div key={screen + activeTab} className="screen-enter min-h-full">{renderContent()}</div>
        </div>
      </main>
      <CookieBanner />
    </div>
  );
}

function MobileAppContent() {
  const screen = useStore(s => s.screen);
  const authRoutes = { login:<Login />, signup:<Signup />, role:<RoleSelect />, resetPassword:<ResetPassword /> };
  if (authRoutes[screen]) return (
    <div key={screen} className="screen-enter app-shell bg-brand-canvas">{authRoutes[screen]}</div>
  );
  return (
    <div key={screen} className="screen-enter h-dvh overflow-hidden bg-brand-canvas">
      <MobileAppShell />
    </div>
  );
}

export default function App() {
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const screen     = useStore(s => s.screen);
  const [desktop, setDesktop] = React.useState(window.innerWidth > 768);
  const oauthHandled = React.useRef(false);
  const [verifyingTicketId, setVerifyingTicketId] = React.useState(null);
  useTheme();

  React.useEffect(() => {
    const isAppMode = isLoggedIn || APP_MODE_SCREENS.includes(screen);
    if (isAppMode) document.body.classList.add("app-mode");
    else           document.body.classList.remove("app-mode");
  }, [isLoggedIn, screen]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid    = params.get("uid");
    const token  = params.get("token");
    const verify = params.get("verify");
    const code   = params.get("code");

    if (code && window.location.pathname === "/auth/callback") {
      if (oauthHandled.current) return;
      oauthHandled.current = true;
      const pendingRole = localStorage.getItem("google_auth_role") || "attendee";
      localStorage.removeItem("google_auth_role");
      fetch("https://master-events-backend.onrender.com/api/auth/google/callback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, role: pendingRole, redirect_uri: `${window.location.origin}/auth/callback` }),
      })
        .then(r => r.json())
        .then(data => {
          window.history.replaceState({}, "", "/");
          if (data.tokens) {
            localStorage.setItem("access_token", data.tokens.access);
            localStorage.setItem("refresh_token", data.tokens.refresh);
            const user = data.user;
            const firstTab = user.role === "organizer" ? "dashboard" : "home";
            const postAuthScreen = localStorage.getItem("post_auth_screen") || "app";
            localStorage.removeItem("post_auth_screen");
            if (postAuthScreen !== "pendingEvent") {
              localStorage.removeItem("pending_event_slug");
            }
            useStore.setState({
              currentUser: user, role: user.role, isLoggedIn: true,
              activeTab: firstTab, screen: postAuthScreen,
            });
            toast.success("Welcome, " + user.first_name + "!");
          } else {
            useStore.getState().setScreen("login");
            setTimeout(() => toast.error(data.error || "Google sign-in failed."), 400);
          }
        })
        .catch(() => {
          window.history.replaceState({}, "", "/");
          useStore.getState().setScreen("login");
          setTimeout(() => toast.error("Connection error during Google sign-in."), 400);
        });
      return;
    }

    if (uid && token) {
      useStore.getState().setResetPasswordParams({ uid, token });
      useStore.getState().setScreen("resetPassword");
      return;
    }
    if (params.get("admin") === "1") { useStore.getState().setScreen("adminGateway"); return; }
    if (params.get("door")  === "1") { useStore.getState().setScreen("doorStaffLogin"); return; }

    const verifyMatch = window.location.pathname.match(/^\/verify\/(.+)$/);
    if (verifyMatch) {
      setVerifyingTicketId(decodeURIComponent(verifyMatch[1]));
      useStore.getState().setScreen("verifyTicket");
      return;
    }

    const eventSlug = params.get("event") || (window.location.pathname.match(/^\/events\/(.+)/) || [])[1];
    if (eventSlug) {
      localStorage.setItem("pending_event_slug", eventSlug);
      window.history.replaceState({}, "", "/");
      useStore.getState().setScreen("pendingEvent");
      return;
    }

    if (verify) {
      fetch("https://master-events-backend.onrender.com/api/accounts/verify-email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ token: verify }),
      })
        .then(r => r.json())
        .then(data => {
          window.history.replaceState({}, "", "/");
          if (data.message && !data.error) {
            useStore.getState().setScreen("login");
            setTimeout(() => toast.success("✅ Email verified! You can now log in."), 400);
          } else {
            useStore.getState().setScreen("login");
            setTimeout(() => toast.error(data.error || "Verification failed."), 400);
          }
        })
        .catch(() => { window.history.replaceState({}, "", "/"); useStore.getState().setScreen("login"); });
    }
  }, []);

  React.useEffect(() => {
    const onPopState = (e) => {
      const prevScreen = e.state?.screen;
      _setRestoringFromHistory(true);
      if (prevScreen) {
        useStore.setState({ screen: prevScreen });
      } else {
        useStore.setState({ screen: useStore.getState().isLoggedIn ? "app" : "home" });
      }
      _setRestoringFromHistory(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  React.useEffect(() => {
    const handler = () => setDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (screen === "adminGateway")   return <AdminLogin />;
  if (screen === "adminDashboard") return <AdminDashboard />;
  if (screen === "resetPassword")  return <ResetPassword />;
  if (screen === "doorStaffLogin") return <DoorStaffLogin />;
  if (screen === "doorStaffScan")  return <DoorStaffScan />;
  if (screen === "pendingEvent")   return <PhoneFrame><PublicEventPage /></PhoneFrame>;
  if (screen === "verifyTicket")   return <VerifyTicket ticketId={verifyingTicketId} />;
  if (screen === "landing")        return <LandingPage onNavigate={publicNavigate} />;
  if (screen === "about")          return <AboutPage onNavigate={publicNavigate} />;
  if (desktop && isLoggedIn)       return <DesktopAppLayout />;

  return (
    <>
      <PhoneFrame><MobileAppContent /></PhoneFrame>
      <CookieBanner />
    </>
  );
}