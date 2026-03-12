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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderTab()}
      </div>
      {role === "organizer" && (
        <div onClick={() => setScreen("addEvent")}
          style={{ position: "absolute", bottom: "90px", right: "16px", width: "52px", height: "52px", borderRadius: "50%", background: "#f5a623", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,166,35,0.5)", color: "#fff", zIndex: 50 }}>
          +
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function AppContent() {
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
  return routes[screen] || <Login />;
}

export default function App() {
  return (
    <PhoneFrame>
      <AppContent />
    </PhoneFrame>
  );
}