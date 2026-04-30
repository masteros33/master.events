import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Ticket, Bell, LayoutDashboard, CalendarDays, Wallet, LogOut, User } from "lucide-react";
import useStore from "../store/useStore";

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
    { id: "dashboard", Icon: LayoutDashboard, label: "Home"   },
    { id: "events",    Icon: CalendarDays,    label: "Events" },
    { id: "wallet",    Icon: Wallet,          label: "Wallet" },
    { id: "alerts",    Icon: Bell,            label: "Alerts" },
  ];

  const tabs = role === "organizer" ? organizerTabs : attendeeTabs;
  const initial = currentUser?.first_name?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* ── Profile / logout sheet ── */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, backdropFilter: "blur(4px)" }} />

            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401, background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "0 0 env(safe-area-inset-bottom, 20px)", boxShadow: "0 -8px 48px rgba(0,0,0,0.18)", border: "1px solid var(--border)" }}>

              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border)" }} />
              </div>

              {/* Profile card */}
              <div style={{ margin: "12px 20px 16px", padding: "16px", background: "var(--bg-subtle)", borderRadius: "18px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {initial}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.first_name} {currentUser?.last_name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.email}
                  </div>
                  <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "99px", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#f5a623", letterSpacing: "0.3px" }}>
                      {role === "organizer" ? "⚡ ORGANIZER" : "🎟️ ATTENDEE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <div style={{ padding: "0 20px 24px" }}>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowMenu(false); handleLogout(); }}
                  style={{ width: "100%", padding: "16px", background: "var(--error-bg)", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  <LogOut size={18} color="var(--error)" />
                  <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--error)" }}>Log Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
        background: "var(--bg-card)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        height: "64px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {tabs.map(({ id, Icon, label }) => {
          const active = activeTab === id;
          return (
            <motion.div key={id} whileTap={{ scale: 0.86 }}
              onClick={() => { setActiveTab(id); setScreen("app"); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", flex: 1, height: "100%", cursor: "pointer", position: "relative" }}>

              <motion.div
                animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? "#f5a623" : "var(--text-muted)"}
                />
              </motion.div>

              <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: active ? "#f5a623" : "var(--text-muted)", letterSpacing: "0.2px", transition: "color 0.18s" }}>
                {label}
              </span>

              {/* Active dot */}
              <motion.div
                animate={{ width: active ? "20px" : "0px", opacity: active ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{ height: "3px", borderRadius: "2px", background: "#f5a623", position: "absolute", bottom: "7px" }} />
            </motion.div>
          );
        })}

        {/* Me / profile tab */}
        <motion.div whileTap={{ scale: 0.86 }}
          onClick={() => setShowMenu(true)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", flex: 1, height: "100%", cursor: "pointer" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff", boxShadow: "0 2px 8px rgba(245,166,35,0.3)" }}>
            {initial}
          </div>
          <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-muted)" }}>Me</span>
        </motion.div>
      </div>
    </>
  );
}