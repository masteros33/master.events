import React from "react";
import useStore from "../store/useStore";

export default function BottomNav() {
  const activeTab = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen = useStore(s => s.setScreen);
  const role = useStore(s => s.role);

  const attendeeTabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "tickets", icon: "🎟️", label: "Tickets" },
    { id: "alerts", icon: "🔔", label: "Alerts" },
  ];

  const organizerTabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "events", icon: "🎪", label: "Events" },
    { id: "wallet", icon: "💰", label: "Wallet" },
    { id: "alerts", icon: "🔔", label: "Alerts" },
  ];

  const tabs = role === "organizer" ? organizerTabs : attendeeTabs;

  return (
    <div style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      zIndex: 300,
      background: "rgba(20,13,3,0.97)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(245,166,35,0.2)",
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 0 env(safe-area-inset-bottom, 20px)",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
    }}>
      {tabs.map(item => (
        <div key={item.id} onClick={() => { setActiveTab(item.id); setScreen("app"); }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            cursor: "pointer", padding: "6px 20px", borderRadius: "16px",
            background: activeTab === item.id ? "rgba(245,166,35,0.12)" : "transparent",
            minWidth: "60px",
          }}>
          <div style={{ fontSize: "22px", marginBottom: "2px" }}>{item.icon}</div>
          <div style={{
            fontSize: "10px",
            fontWeight: activeTab === item.id ? 700 : 500,
            color: activeTab === item.id ? "#f5a623" : "#6b5a3e",
          }}>{item.label}</div>
          {activeTab === item.id && (
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#f5a623", marginTop: "3px" }} />
          )}
        </div>
      ))}
    </div>
  );
}