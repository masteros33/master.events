import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Ticket, Bell, LayoutDashboard, CalendarDays, Wallet, LogOut, ScanLine, PlusCircle } from "lucide-react";
import useStore from "../store/useStore";

// ── Safe area height constant ─────────────────────────────────
// The nav bar is 56px tall + safe area inset at bottom
const NAV_HEIGHT = 56;

export default function BottomNav() {
  const activeTab    = useStore(s => s.activeTab);
  const setActiveTab = useStore(s => s.setActiveTab);
  const setScreen    = useStore(s => s.setScreen);
  const handleLogout = useStore(s => s.handleLogout);
  const role         = useStore(s => s.role);
  const currentUser  = useStore(s => s.currentUser);
  const [showMenu, setShowMenu] = useState(false);

  const attendeeTabs = [
    { id: "home",    Icon: Home,          label: "Discover" },
    { id: "tickets", Icon: Ticket,        label: "Tickets"  },
    { id: "alerts",  Icon: Bell,          label: "Alerts"   },
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
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 490, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />

            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 491,
                background: "var(--bg-card)",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -12px 56px rgba(0,0,0,0.22)",
                border: "1px solid var(--border)",
                // Extend into safe area at bottom
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
              }}>

              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "4px" }}>
                <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "var(--border-strong)" }} />
              </div>

              {/* Profile card */}
              <div style={{ margin: "12px 20px 14px", padding: "14px 16px", background: "var(--bg-subtle)", borderRadius: "18px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px", fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(245,166,35,0.3)" }}>
                  {initial}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.first_name} {currentUser?.last_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser?.email}
                  </div>
                  <div style={{ marginTop: "5px", display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "99px", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)" }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#f5a623", letterSpacing: "0.5px" }}>
                      {role === "organizer" ? "⚡ ORGANIZER" : "🎟️ ATTENDEE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick actions for organizer */}
              {role === "organizer" && (
                <div style={{ display: "flex", gap: "10px", margin: "0 20px 14px" }}>
                  <motion.div whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowMenu(false); setScreen("addEvent"); }}
                    style={{ flex: 1, padding: "12px", background: "rgba(245,166,35,0.08)", border: "1.5px solid rgba(245,166,35,0.25)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
                    <PlusCircle size={16} color="#f5a623" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#f5a623" }}>Create Event</span>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowMenu(false); setScreen("scanTicket"); }}
                    style={{ flex: 1, padding: "12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
                    <ScanLine size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Scan</span>
                  </motion.div>
                </div>
              )}

              {/* Logout */}
              <div style={{ padding: "0 20px 8px" }}>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowMenu(false); handleLogout(); }}
                  style={{ width: "100%", padding: "15px", background: "var(--error-bg)", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  <LogOut size={17} color="var(--error)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--error)" }}>Log Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar — properly anchored ── */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        // The key: extend background INTO the safe area
        background: "var(--bg-card)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -1px 0 var(--border), 0 -8px 24px rgba(0,0,0,0.05)",
        // Total height = nav content + safe area
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: `${NAV_HEIGHT}px`,
        }}>
          {tabs.map(({ id, Icon, label }) => {
            const active = activeTab === id;
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.84 }}
                onClick={() => { setActiveTab(id); setScreen("app"); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: "3px", flex: 1, height: "100%",
                  cursor: "pointer", position: "relative", border: "none",
                  background: "transparent", padding: 0, fontFamily: "var(--font-sans)",
                }}>

                {/* Active pill background */}
                {active && (
                  <motion.div
                    layoutId="nav-active-bg"
                    style={{ position: "absolute", top: "6px", left: "50%", transform: "translateX(-50%)", width: "44px", height: "32px", borderRadius: "10px", background: "rgba(245,166,35,0.12)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}

                <motion.div
                  animate={{ scale: active ? 1.1 : 1, y: active ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  style={{ position: "relative", zIndex: 1 }}>
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    color={active ? "#f5a623" : "var(--text-muted)"}
                  />
                </motion.div>

                <span style={{
                  fontSize: "10px",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#f5a623" : "var(--text-muted)",
                  letterSpacing: "0.1px",
                  transition: "color 0.18s",
                  position: "relative", zIndex: 1,
                }}>
                  {label}
                </span>
              </motion.button>
            );
          })}

          {/* Me tab */}
          <motion.button
            whileTap={{ scale: 0.84 }}
            onClick={() => setShowMenu(true)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: "3px", flex: 1, height: "100%",
              cursor: "pointer", border: "none", background: "transparent",
              padding: 0, fontFamily: "var(--font-sans)", position: "relative",
            }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: "linear-gradient(135deg, #f5a623, #e8920f)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, color: "#fff",
              boxShadow: "0 2px 8px rgba(245,166,35,0.35)",
              border: showMenu ? "2px solid #f5a623" : "2px solid transparent",
              transition: "border-color 0.2s",
            }}>
              {initial}
            </div>
            <span style={{ fontSize: "10px", fontWeight: 500, color: showMenu ? "#f5a623" : "var(--text-muted)", transition: "color 0.2s" }}>Me</span>
          </motion.button>
        </div>
      </nav>
    </>
  );
}