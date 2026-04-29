import React from "react";
import { motion } from "framer-motion";
import useStore from "../store/useStore";

export default function BottomNav() {
  const activeTab    = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const role         = useStore(s => s.role);

  const attendeeTabs = [
    { id: "home",    icon: "🏠", label: "Home"    },
    { id: "tickets", icon: "🎟️", label: "Tickets" },
    { id: "alerts",  icon: "🔔", label: "Alerts"  },
  ];
  const organizerTabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "events",    icon: "🎪", label: "Events"    },
    { id: "wallet",    icon: "💰", label: "Wallet"    },
    { id: "alerts",    icon: "🔔", label: "Alerts"    },
  ];

  const tabs = role === "organizer" ? organizerTabs : attendeeTabs;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
      background: "var(--bg-card)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--border)",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      height: "64px",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(item => {
        const active = activeTab === item.id;
        return (
          <motion.div key={item.id} whileTap={{ scale: 0.88 }}
            onClick={() => { setActiveTab(item.id); setScreen("app"); }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", flex: 1, height: "100%", cursor: "pointer", position: "relative" }}>
            <motion.div animate={{ scale: active ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{ fontSize: "22px", lineHeight: 1 }}>
              {item.icon}
            </motion.div>
            <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: active ? "#f5a623" : "var(--text-muted)", letterSpacing: "0.2px", transition: "color 0.2s" }}>
              {item.label}
            </span>
            <AnimatePresenceInline active={active} />
          </motion.div>
        );
      })}
    </div>
  );
}

function AnimatePresenceInline({ active }) {
  return (
    <motion.div
      animate={{ width: active ? "18px" : "0px", opacity: active ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ height: "3px", borderRadius: "2px", background: "#f5a623", position: "absolute", bottom: "6px" }}
    />
  );
}