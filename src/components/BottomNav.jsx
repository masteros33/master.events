import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../store/useStore";
import {
  Home, Ticket, Bell, LayoutDashboard,
  CalendarDays, Wallet, LogOut, X, Menu
} from "lucide-react";

export default function BottomNav() {
  const activeTab    = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const handleLogout = useStore(s => s.handleLogout);
  const role         = useStore(s => s.role);
  const currentUser  = useStore(s => s.currentUser);
  const [showMenu, setShowMenu] = useState(false);

  const attendeeTabs = [
    { id: "home",    Icon: Home,          label: "Home"    },
    { id: "tickets", Icon: Ticket,        label: "Tickets" },
    { id: "alerts",  Icon: Bell,          label: "Alerts"  },
  ];
  const organizerTabs = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "events",    Icon: CalendarDays,    label: "Events"    },
    { id: "wallet",    Icon: Wallet,          label: "Wallet"    },
    { id: "alerts",    Icon: Bell,            label: "Alerts"    },
  ];

  const tabs = role === "organizer" ? organizerTabs : attendeeTabs;

  return (
    <>
      {/* ── Profile menu overlay ── */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400 }} />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401, background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "20px 24px 40px", boxShadow: "0 -8px 40px rgba(0,0,0,0.2)", border: "1px solid var(--border)" }}>
              <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "var(--border)", margin: "0 auto 20px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", padding: "14px", background: "var(--bg-subtle)", borderRadius: "16px", border: "1px solid var(--border)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>{currentUser?.first_name} {currentUser?.last_name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{currentUser?.email}</div>
                  <div style={{ marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "99px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)" }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#f5a623" }}>{role === "organizer" ? "⚡ ORGANIZER" : "🎟️ ATTENDEE"}</span>
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setShowMenu(false); handleLogout(); }}
                style={{ width: "100%", padding: "16px", background: "var(--error-bg)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <LogOut size={18} color="var(--error)" />
                <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--error)" }}>Log Out</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ── */}
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
              <motion.div animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <item.Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? "#f5a623" : "var(--text-muted)"}
                />
              </motion.div>
              <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: active ? "#f5a623" : "var(--text-muted)", letterSpacing: "0.2px", transition: "color 0.2s" }}>
                {item.label}
              </span>
              <motion.div
                animate={{ width: active ? "18px" : "0px", opacity: active ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ height: "3px", borderRadius: "2px", background: "#f5a623", position: "absolute", bottom: "6px" }} />
            </motion.div>
          );
        })}

        {/* Profile / logout button */}
        <motion.div whileTap={{ scale: 0.88 }}
          onClick={() => setShowMenu(true)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", flex: 1, height: "100%", cursor: "pointer", position: "relative" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>
            {currentUser?.first_name?.[0]?.toUpperCase() || "U"}
          </div>
          <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.2px" }}>
            Me
          </span>
        </motion.div>
      </div>
    </>
  );
}