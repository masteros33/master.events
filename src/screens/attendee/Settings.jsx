import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { Avatar } from "../../utils/avatar";
import { useTheme } from "../../hooks/useTheme";
import {
  User, Mail, Phone, Shield, LogOut, ChevronRight,
  Sun, Moon, Monitor, Bell, Lock, Wallet, Globe,
  CheckCircle, Edit3, Save, X
} from "lucide-react";

const isDesktop = () => window.innerWidth > 768;

const BRAND = "#F97316";

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
      color: "var(--text-muted)", textTransform: "uppercase",
      fontFamily: "var(--font-mono)", padding: "20px 0 8px",
    }}>
      {title}
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, action, danger, onClick, toggle, checked, onToggle, color }) {
  return (
    <motion.div whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "14px 16px", background: "var(--bg-card)",
        borderRadius: "14px", marginBottom: "6px",
        border: "1px solid var(--border)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = danger ? "rgba(220,38,38,0.3)" : `${BRAND}40`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
        background: danger ? "rgba(220,38,38,0.08)" : color ? color + "12" : "var(--bg-subtle)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${danger ? "rgba(220,38,38,0.15)" : color ? color + "20" : "var(--border)"}`,
      }}>
        <Icon size={16} color={danger ? "#dc2626" : color || "var(--text-secondary)"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: danger ? "#dc2626" : "var(--text-primary)", lineHeight: 1.3 }}>{label}</div>
        {value && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>}
      </div>
      {toggle ? (
        <motion.div whileTap={{ scale: 0.9 }} onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{
            width: "44px", height: "24px", borderRadius: "99px", cursor: "pointer",
            background: checked ? BRAND : "var(--bg-subtle)",
            border: `1px solid ${checked ? BRAND : "var(--border)"}`,
            position: "relative", transition: "all 0.2s",
          }}>
          <motion.div animate={{ x: checked ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ position: "absolute", top: "2px", width: "18px", height: "18px", borderRadius: "50%", background: checked ? "#fff" : "var(--text-muted)" }} />
        </motion.div>
      ) : onClick ? (
        <ChevronRight size={16} color="var(--text-muted)" />
      ) : action ? (
        <span style={{ fontSize: "12px", color: BRAND, fontWeight: 600 }}>{action}</span>
      ) : null}
    </motion.div>
  );
}

export default function Settings() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const currentUser  = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const desktop = isDesktop();

  const [editing,      setEditing]      = useState(false);
  const [editName,     setEditName]     = useState(currentUser?.first_name || "");
  const [editPhone,    setEditPhone]    = useState("");
  const [notifs,       setNotifs]       = useState(true);
  const [showLogout,   setShowLogout]   = useState(false);
  const [saved,        setSaved]        = useState(false);

  const themeOptions = [
    { id: "light",  icon: Sun,     label: "Light" },
    { id: "dark",   icon: Moon,    label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ];

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: desktop ? "0 40px" : "0 16px",
        height: "60px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "16px",
      }}>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { setScreen("app"); setActiveTab(undefined); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-sans)", padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Settings</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: desktop ? "640px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 60px" }}>

        {/* ── Profile card ── */}
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{
            padding: "24px", background: `linear-gradient(135deg, ${BRAND}10, transparent)`,
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ position: "relative" }}>
                <Avatar seed={currentUser?.email} name={currentUser?.first_name} size={64}
                  style={{ border: `3px solid ${BRAND}40`, borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "20px", height: "20px", borderRadius: "50%", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)" }}>
                  <Edit3 size={10} color="#fff" />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                  {currentUser?.first_name} {currentUser?.last_name}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{currentUser?.email}</div>
                <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "99px", background: `${BRAND}12`, border: `1px solid ${BRAND}25` }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: BRAND, letterSpacing: "0.5px" }}>
                    🎟️ ATTENDEE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <AnimatePresence>
            {editing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Display Name</div>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box", marginBottom: "10px" }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Phone (optional)</div>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    placeholder="e.g. 0241234567" type="tel"
                    style={{ width: "100%", padding: "11px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                      style={{ flex: 2, padding: "12px", background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, color: "#fff", border: "none", borderRadius: "11px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Save size={14} /> Save Changes
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(false)}
                      style={{ flex: 1, padding: "12px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "11px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ padding: "12px 24px" }}>
            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "10px", marginBottom: "10px" }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#16a34a" }}>Profile updated!</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!editing && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(true)}
                style={{ width: "100%", padding: "11px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "11px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <Edit3 size={14} /> Edit Profile
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Account info ── */}
        <SectionHeader title="Account" />
        <SettingRow icon={Mail}   label="Email Address" value={currentUser?.email} color="#2563eb" />
        <SettingRow icon={User}   label="Full Name" value={`${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "Not set"} color={BRAND} onClick={() => setEditing(true)} action="Edit" />
        <SettingRow icon={Shield} label="Password" value="Last changed: unknown" color="#7c3aed" onClick={() => {}} action="Change" />

        {/* ── Appearance ── */}
        <SectionHeader title="Appearance" />
        <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", padding: "16px", marginBottom: "6px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Theme</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {themeOptions.map(({ id, icon: Icon, label }) => {
              const active = theme === id;
              return (
                <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setTheme(id)}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: "12px", cursor: "pointer",
                    border: active ? `1.5px solid ${BRAND}` : "1.5px solid var(--border)",
                    background: active ? `${BRAND}10` : "var(--bg-subtle)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                    transition: "all 0.15s", fontFamily: "var(--font-sans)",
                  }}>
                  <Icon size={18} color={active ? BRAND : "var(--text-muted)"} />
                  <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? BRAND : "var(--text-secondary)" }}>{label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Notifications ── */}
        <SectionHeader title="Notifications" />
        <SettingRow icon={Bell} label="Push Notifications" value="Email alerts for ticket activity" color="#16a34a"
          toggle checked={notifs} onToggle={() => setNotifs(!notifs)} />

        {/* ── Blockchain ── */}
        <SectionHeader title="Blockchain" />
        <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid rgba(124,58,237,0.2)", padding: "16px", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "16px" }}>⛓️</span>
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>Polygon Amoy Testnet</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>Chain ID: 80002</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
              <motion.div animate={{ scale: [1,1.4,1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono)" }}>LIVE</span>
            </div>
          </div>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "10px 12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>NFT CONTRACT</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
              0x956F051d666fAc2B956b83BdDD6746127F270Daf
            </div>
          </div>
        </div>
        <SettingRow icon={Wallet} label="Connect Wallet" value="Link your MetaMask for NFT management" color="#7c3aed" onClick={() => {}} action="Connect" />

        {/* ── About ── */}
        <SectionHeader title="About" />
        <SettingRow icon={Globe}  label="Version" value="Master Events v1.0 · Built on Polygon" color="#0891b2" />
        <SettingRow icon={Shield} label="Privacy Policy" color="var(--text-muted)" onClick={() => {}} />
        <SettingRow icon={Shield} label="Terms of Service" color="var(--text-muted)" onClick={() => {}} />

        {/* ── Danger zone ── */}
        <SectionHeader title="Account Actions" />
        <SettingRow icon={LogOut} label="Log Out" danger onClick={() => setShowLogout(true)} />

        {/* ── Logout confirm modal ── */}
        <AnimatePresence>
          {showLogout && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowLogout(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }} />
              <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
                style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", zIndex: 201, border: "1px solid var(--border)", borderBottom: "none" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)", margin: "0 auto 20px" }} />
                <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.3px" }}>Log out?</div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.6 }}>You'll need to sign in again to access your tickets and account.</div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(false)}
                    style={{ flex: 1, padding: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "13px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                    Cancel
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowLogout(false); handleLogout(); }}
                    style={{ flex: 1, padding: "14px", background: "rgba(220,38,38,0.1)", border: "1.5px solid rgba(220,38,38,0.25)", borderRadius: "13px", fontWeight: 700, fontSize: "14px", cursor: "pointer", color: "#dc2626", fontFamily: "var(--font-sans)" }}>
                    Log Out
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}