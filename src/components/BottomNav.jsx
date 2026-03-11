import React from "react";
import useStore from "../store/useStore";

export default function BottomNav() {
  const activeTab = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
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
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(245,166,35,0.15)", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 300 }}>
      {tabs.map(item => (
        <div key={item.id} onClick={() => setActiveTab(item.id)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", padding: "4px 16px", borderRadius: "16px", background: activeTab === item.id ? "#f5a62315" : "transparent", transition: "all 0.2s" }}>
          <div style={{ fontSize: "22px", marginBottom: "2px" }}>{item.icon}</div>
          <div style={{ fontSize: "10px", fontWeight: activeTab === item.id ? 700 : 500, color: activeTab === item.id ? "#f5a623" : "#aaa" }}>{item.label}</div>
          {activeTab === item.id && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#f5a623", marginTop: "3px" }} />}
        </div>
      ))}
    </div>
  );
}