import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { Avatar, AVATAR_PRESETS, getSavedAvatarSeed, saveAvatarSeed } from "../../utils/avatar";
import { useTheme } from "../../hooks/useTheme";
import { User, Mail, Shield, LogOut, ChevronRight, Sun, Moon, Monitor, Bell, Globe, CheckCircle, Edit3, Save, Link2, Cookie, FileText, Lock, Eye, EyeOff, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const BACKEND  = "https://master-events-backend.onrender.com";
const BRAND    = "#F97316";
const BRAND_D  = "#EA6C0A";
const GREEN    = "#22c55e";
const RED      = "#ef4444";
const PURPLE  = "#8b5cf6";
const BLUE    = "#3b82f6";
const FONT     = "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const MONO     = "'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace";

const T = {
  bg:     "var(--bg)",
  card:   "var(--bg-card)",
  border: "var(--border)",
  text:   "var(--text-primary)",
  sub:    "var(--text-secondary)",
  muted:  "var(--text-muted)",
  subtle: "var(--bg-subtle)",
  shadow: "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
};

const isDesktop = () => window.innerWidth > 768;

function FieldInput({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", padding: "12px 14px", background: T.subtle, border: `1.5px solid ${T.border}`, borderRadius: "10px", fontSize: "14px", color: T.text, outline: "none", fontFamily: FONT, boxSizing: "border-box", transition: "border-color 0.15s,box-shadow 0.15s", ...style }}
      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: T.muted, textTransform: "uppercase", fontFamily: MONO, padding: "20px 0 8px" }}>
      {children}
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, danger, onClick, toggle, checked, onToggle, color }) {
  return (
    <motion.div whileTap={onClick ? { scale: 0.99 } : {}} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: T.card, borderRadius: "14px", marginBottom: "6px", border: `1px solid ${T.border}`, cursor: onClick ? "pointer" : "default", transition: "all 0.15s", boxShadow: T.shadow }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = danger ? "rgba(239,68,68,0.3)" : `${BRAND}40`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "11px", flexShrink: 0, background: danger ? "rgba(239,68,68,0.08)" : color ? color + "10" : T.subtle, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${danger ? "rgba(239,68,68,0.18)" : color ? color + "20" : T.border}` }}>
        <Icon size={16} color={danger ? RED : color || T.sub} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: danger ? RED : T.text, lineHeight: 1.3 }}>{label}</div>
        {value && <div style={{ fontSize: "11px", color: T.muted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>}
      </div>
      {toggle ? (
        <motion.div whileTap={{ scale: 0.9 }} onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{ width: "46px", height: "26px", borderRadius: "99px", cursor: "pointer", background: checked ? BRAND : T.subtle, border: `1px solid ${checked ? BRAND : T.border}`, position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
          <motion.div animate={{ x: checked ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ position: "absolute", top: "3px", width: "18px", height: "18px", borderRadius: "50%", background: checked ? "#fff" : T.muted }} />
        </motion.div>
      ) : onClick ? (
        <ChevronRight size={16} color={T.muted} style={{ flexShrink: 0 }} />
      ) : null}
    </motion.div>
  );
}

// ── Avatar picker modal ───────────────────────────────────────
function AvatarPickerModal({ currentSeed, onSelect, onClose }) {
  const [selected, setSelected] = useState(currentSeed);
  const [hovered,  setHovered]  = useState(null);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, backdropFilter: "blur(10px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 48 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "520px", background: T.card, borderRadius: "24px 24px 0 0", padding: "24px 20px calc(24px + env(safe-area-inset-bottom,0px))", zIndex: 301, border: `1px solid ${T.border}`, borderBottom: "none", maxHeight: "88vh", display: "flex", flexDirection: "column", fontFamily: FONT }}>
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: T.border, margin: "0 auto 22px" }} />
        <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "4px", letterSpacing: "-0.4px" }}>Choose Avatar</div>
        <div style={{ fontSize: "13px", color: T.muted, marginBottom: "20px" }}>Pick a character — stays consistent across your account</div>
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "10px" }}>
            {AVATAR_PRESETS.map(seed => {
              const isSel = selected === seed;
              return (
                <motion.div key={seed} whileTap={{ scale: 0.9 }} onClick={() => setSelected(seed)}
                  onMouseEnter={() => setHovered(seed)} onMouseLeave={() => setHovered(null)}
                  style={{ position: "relative", cursor: "pointer", borderRadius: "14px", padding: "4px", background: isSel ? `${BRAND}15` : hovered === seed ? T.subtle : "transparent", border: isSel ? `2px solid ${BRAND}` : "2px solid transparent", transition: "all 0.15s" }}>
                  <Avatar seed={seed} size={44} style={{ width: "100%", height: "auto", aspectRatio: "1", borderRadius: "10px" }} />
                  {isSel && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ position: "absolute", top: "2px", right: "2px", width: "16px", height: "16px", borderRadius: "50%", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)" }}>
                      <CheckCircle size={9} color="#fff" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: T.subtle, borderRadius: "14px", marginBottom: "14px", border: `1px solid ${T.border}` }}>
          <Avatar seed={selected} size={52} style={{ border: `3px solid ${BRAND}40`, borderRadius: "50%", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Preview</div>
            <div style={{ fontSize: "11px", color: T.muted, fontFamily: MONO, marginTop: "2px" }}>{selected}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ flex: 1, padding: "14px", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: T.sub, fontFamily: FONT }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { onSelect(selected); onClose(); }}
            style={{ flex: 2, padding: "14px", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "14px", cursor: "pointer", color: "#fff", fontFamily: FONT, boxShadow: `0 4px 16px ${BRAND}35` }}>
            Apply Avatar
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Password modal ────────────────────────────────────────────
function PasswordModal({ onClose }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    if (!current || !newPass || !confirm) { toast.error("Fill all fields"); return; }
    if (newPass.length < 8)              { toast.error("Min 8 characters"); return; }
    if (newPass !== confirm)             { toast.error("Passwords don't match"); return; }
    setSaving(true);
    const t = toast.loading("Changing password...");
    try {
      const res = await fetch(`${BACKEND}/api/auth/me/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: JSON.stringify({ current_password: current, new_password: newPass }),
      });
      const data = await res.json();
      toast.dismiss(t);
      if (res.ok) { toast.success("Password changed!"); onClose(); }
      else        { toast.error(data.error || "Failed to change password"); }
    } catch { toast.dismiss(t); toast.error("Connection error. Try again."); }
    finally { setSaving(false); }
  };

  const PassField = ({ value, onChange, placeholder, show, onToggle }) => (
    <div style={{ position: "relative", marginBottom: "12px" }}>
      <FieldInput value={value} onChange={onChange} placeholder={placeholder} type={show ? "text" : "password"} style={{ paddingRight: "44px" }} />
      <div onClick={onToggle} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
        {show ? <EyeOff size={15} color={T.muted} /> : <Eye size={15} color={T.muted} />}
      </div>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, backdropFilter: "blur(10px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 48 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: T.card, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom,0px))", zIndex: 301, border: `1px solid ${T.border}`, borderBottom: "none", fontFamily: FONT }}>
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: T.border, margin: "0 auto 22px" }} />
        <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "4px", letterSpacing: "-0.4px" }}>Change Password</div>
        <div style={{ fontSize: "13px", color: T.muted, marginBottom: "20px" }}>Minimum 8 characters.</div>

        <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>CURRENT PASSWORD</div>
        <PassField value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" show={showCur} onToggle={() => setShowCur(!showCur)} />

        <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>NEW PASSWORD</div>
        <PassField value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 8 characters" show={showNew} onToggle={() => setShowNew(!showNew)} />

        <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>CONFIRM NEW PASSWORD</div>
        <div style={{ marginBottom: "20px" }}>
          <FieldInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" type="password" />
          {confirm && newPass && confirm !== newPass && (
            <div style={{ fontSize: "11px", color: RED, marginTop: "5px" }}>Passwords don't match</div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ flex: 1, padding: "14px", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: T.sub, fontFamily: FONT }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "14px", background: saving ? T.subtle : `linear-gradient(135deg,${BRAND},${BRAND_D})`, border: "none", borderRadius: "14px", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", color: saving ? T.muted : "#fff", fontFamily: FONT }}>
            {saving ? "Saving..." : "Change Password"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Delete account modal ──────────────────────────────────────
function DeleteModal({ onClose, handleLogout }) {
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleDelete = async () => {
    if (!password) { toast.error("Enter your password"); return; }
    setDeleting(true);
    const t = toast.loading("Deleting account...");
    try {
      const res = await fetch(`${BACKEND}/api/auth/delete-account/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      toast.dismiss(t);
      if (res.ok) { toast.success("Account deleted."); handleLogout(); }
      else        { toast.error(data.error || "Failed to delete account"); }
    } catch { toast.dismiss(t); toast.error("Connection error."); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, backdropFilter: "blur(10px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 48 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: T.card, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom,0px))", zIndex: 301, border: `1px solid ${T.border}`, borderBottom: "none", fontFamily: FONT }}>
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: T.border, margin: "0 auto 22px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Trash2 size={22} color={RED} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "20px", color: RED, letterSpacing: "-0.4px" }}>Delete Account</div>
            <div style={{ fontSize: "12px", color: T.muted, marginTop: "2px" }}>This cannot be undone</div>
          </div>
        </div>

        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "12px", padding: "12px 16px", marginBottom: "18px" }}>
          <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.6 }}>
            Deleting your account permanently removes all tickets, wallet balance, and personal data. This cannot be reversed.
          </div>
        </div>

        <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "8px" }}>CONFIRM WITH PASSWORD</div>
        <div style={{ position: "relative", marginBottom: "22px" }}>
          <FieldInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type={showPass ? "text" : "password"} style={{ paddingRight: "44px", borderColor: "rgba(239,68,68,0.3)" }} />
          <div onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
            {showPass ? <EyeOff size={15} color={T.muted} /> : <Eye size={15} color={T.muted} />}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ flex: 1, padding: "14px", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: T.sub, fontFamily: FONT }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete} disabled={deleting || !password}
            style={{ flex: 1, padding: "14px", background: deleting || !password ? T.subtle : "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "14px", fontWeight: 700, fontSize: "14px", cursor: deleting || !password ? "not-allowed" : "pointer", color: RED, fontFamily: FONT }}>
            {deleting ? "Deleting..." : "Delete Forever"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Main Settings ─────────────────────────────────────────────
export default function Settings() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const currentUser  = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);
  const { theme, setTheme } = useTheme();
  const desktop = isDesktop();

  const [avatarSeed,   setAvatarSeed]   = useState(() => getSavedAvatarSeed(currentUser?.email));
  const [showPicker,   setShowPicker]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [showLogout,   setShowLogout]   = useState(false);
  const [editing,      setEditing]      = useState(false);
  const [editFirst,    setEditFirst]    = useState(currentUser?.first_name || "");
  const [editLast,     setEditLast]     = useState(currentUser?.last_name  || "");
  const [editPhone,    setEditPhone]    = useState(currentUser?.phone      || "");
  const [saving,       setSaving]       = useState(false);
  const [notifs,       setNotifs]       = useState(true);
  const [displayFirst, setDisplayFirst] = useState(currentUser?.first_name || "");
  const [displayLast,  setDisplayLast]  = useState(currentUser?.last_name  || "");

  const themeOptions = [
    { id: "light",  Icon: Sun,     label: "Light"  },
    { id: "dark",   Icon: Moon,    label: "Dark"   },
    { id: "system", Icon: Monitor, label: "System" },
  ];

  const handleAvatarSelect = (seed) => { setAvatarSeed(seed); saveAvatarSeed(currentUser?.email, seed); };

  const handleSave = async () => {
    if (!editFirst.trim()) { toast.error("First name cannot be empty"); return; }
    setSaving(true);
    const t = toast.loading("Saving...");
    try {
      const res = await fetch(`${BACKEND}/api/auth/me/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: JSON.stringify({ first_name: editFirst.trim(), last_name: editLast.trim(), phone: editPhone.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisplayFirst(data.user.first_name);
        setDisplayLast(data.user.last_name);
        const store = useStore.getState();
        if (store.currentUser) Object.assign(store.currentUser, data.user);
        const saved = JSON.parse(localStorage.getItem("me_session") || "{}");
        if (saved.currentUser) { saved.currentUser = { ...saved.currentUser, ...data.user }; localStorage.setItem("me_session", JSON.stringify(saved)); }
        toast.dismiss(t); toast.success("Profile updated!"); setEditing(false);
      } else { toast.dismiss(t); toast.error(data.first_name?.[0] || data.detail || "Update failed"); }
    } catch { toast.dismiss(t); toast.error("Connection error."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100%", paddingBottom: "60px", fontFamily: FONT }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: T.card, borderBottom: `1px solid ${T.border}`, padding: desktop ? "0 40px" : "0 16px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setScreen("app"); setActiveTab(undefined); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "13px", fontWeight: 500, fontFamily: FONT, padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: "16px", color: T.text, letterSpacing: "-0.3px" }}>Settings</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: desktop ? "600px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 80px" : "16px 16px 80px" }}>

        {/* Profile hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: T.card, borderRadius: "22px", border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: "8px", boxShadow: T.shadow }}>

          {/* Gradient header */}
          <div style={{ padding: "24px", background: `linear-gradient(135deg,${BRAND}10,transparent)`, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <motion.div whileTap={{ scale: 0.94 }} onClick={() => setShowPicker(true)}
                style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}>
                <Avatar seed={avatarSeed} size={68} style={{ border: `3px solid ${BRAND}40`, borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},${BRAND_D})`, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)", boxShadow: `0 2px 8px ${BRAND}40` }}>
                  <Edit3 size={11} color="#fff" />
                </div>
              </motion.div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: "20px", color: T.text, letterSpacing: "-0.5px", marginBottom: "3px" }}>
                  {displayFirst} {displayLast}
                </div>
                <div style={{ fontSize: "13px", color: T.muted, marginBottom: "10px" }}>{currentUser?.email}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", background: `${BRAND}12`, border: `1px solid ${BRAND}25` }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: BRAND }}>🎟️ {currentUser?.role?.toUpperCase() || "ATTENDEE"}</span>
                </div>
              </div>
            </div>

            {/* Avatar change strip */}
            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowPicker(true)}
              style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: `${BRAND}06`, border: `1px solid ${BRAND}18`, borderRadius: "12px", cursor: "pointer" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {AVATAR_PRESETS.slice(0, 5).map(seed => (
                  <Avatar key={seed} seed={seed} size={20} style={{ border: seed === avatarSeed ? `2px solid ${BRAND}` : "2px solid transparent", borderRadius: "50%" }} />
                ))}
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: T.subtle, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: T.muted, fontWeight: 700 }}>
                  +{AVATAR_PRESETS.length - 5}
                </div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: BRAND, marginLeft: "4px" }}>Change Avatar</span>
              <ChevronRight size={14} color={BRAND} style={{ marginLeft: "auto" }} />
            </motion.div>
          </div>

          {/* Edit form */}
          <AnimatePresence>
            {editing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "6px" }}>FIRST NAME</div>
                      <FieldInput value={editFirst} onChange={e => setEditFirst(e.target.value)} placeholder="First name" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "6px" }}>LAST NAME</div>
                      <FieldInput value={editLast} onChange={e => setEditLast(e.target.value)} placeholder="Last name" />
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "1px", fontFamily: MONO, marginBottom: "6px" }}>PHONE (OPTIONAL)</div>
                  <FieldInput value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="e.g. 0241234567" type="tel" />
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                      style={{ flex: 2, padding: "12px", background: saving ? T.subtle : `linear-gradient(135deg,${BRAND},${BRAND_D})`, color: saving ? T.muted : "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: saving ? "not-allowed" : "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setEditing(false); setEditFirst(displayFirst); setEditLast(displayLast); }}
                      style={{ flex: 1, padding: "12px", background: T.subtle, color: T.sub, border: `1px solid ${T.border}`, borderRadius: "12px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: FONT }}>
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!editing && (
            <div style={{ padding: "12px 24px" }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setEditing(true); setEditFirst(displayFirst); setEditLast(displayLast); setEditPhone(currentUser?.phone || ""); }}
                style={{ width: "100%", padding: "12px", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.sub, fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <Edit3 size={14} /> Edit Profile
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <SettingRow icon={Mail} label="Email Address" value={currentUser?.email} color={BLUE} />
        <SettingRow icon={User} label="Full Name" value={`${displayFirst} ${displayLast}`.trim() || "Not set"} color={BRAND} onClick={() => setEditing(true)} />
        <SettingRow icon={Lock} label="Password" value="Change your account password" color={PURPLE} onClick={() => setShowPassword(true)} />

        {/* Appearance */}
        <SectionLabel>Appearance</SectionLabel>
        <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, padding: "16px 18px", marginBottom: "6px", boxShadow: T.shadow }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: T.text, marginBottom: "14px" }}>Theme</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {themeOptions.map(({ id, Icon, label }) => {
              const active = theme === id;
              return (
                <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setTheme(id)}
                  style={{ flex: 1, padding: "13px 8px", borderRadius: "12px", cursor: "pointer", border: active ? `2px solid ${BRAND}` : `1.5px solid ${T.border}`, background: active ? `${BRAND}10` : T.subtle, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.15s", fontFamily: FONT }}>
                  <Icon size={18} color={active ? BRAND : T.muted} />
                  <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? BRAND : T.sub }}>{label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <SectionLabel>Notifications</SectionLabel>
        <SettingRow icon={Bell} label="Email Notifications" value="Ticket activity, NFT confirmations, sales" color={GREEN}
          toggle checked={notifs} onToggle={() => setNotifs(!notifs)} />

        {/* Blockchain */}
        <SectionLabel>Blockchain</SectionLabel>
        <div style={{ background: T.card, borderRadius: "16px", border: "1px solid rgba(139,92,246,0.2)", padding: "16px 18px", marginBottom: "6px", boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Link2 size={18} color="#a78bfa" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>Polygon Amoy Testnet</div>
              <div style={{ fontSize: "11px", color: T.muted, marginTop: "1px", fontFamily: MONO }}>Chain ID: 80002 · NFT tickets auto-minted</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <motion.div animate={{ scale:[1,1.4,1] }} transition={{ duration:2, repeat:Infinity }}
                style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4ade80" }} />
              <span style={{ fontSize:"9px", fontWeight:700, color:"#4ade80", fontFamily:MONO }}>LIVE</span>
            </div>
          </div>
          <div style={{ background: T.subtle, borderRadius: "10px", padding: "10px 14px", border: `1px solid ${T.border}`, marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: T.muted, fontFamily: MONO, marginBottom: "4px" }}>NFT CONTRACT</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", fontFamily: MONO, wordBreak: "break-all" }}>0x956F051d666fAc2B956b83BdDD6746127F270Daf</div>
          </div>
          <div style={{ padding: "10px 12px", background: "rgba(139,92,246,0.04)", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.1)" }}>
            <div style={{ fontSize: "12px", color: T.muted, lineHeight: 1.6 }}>
              🎟️ NFT tickets are automatically minted on Polygon when you purchase. No wallet setup needed.
            </div>
          </div>
        </div>

        {/* Legal */}
        <SectionLabel>Legal & Privacy</SectionLabel>
        <SettingRow icon={FileText} label="Privacy Policy"     color={T.muted} onClick={() => setScreen("privacy")} />
        <SettingRow icon={Shield}   label="Terms of Service"   color={T.muted} onClick={() => setScreen("privacy")} />
        <SettingRow icon={Cookie}   label="Cookie Preferences" value="Manage what we track" color={T.muted} onClick={() => { localStorage.removeItem("me_cookie_consent"); window.location.reload(); }} />

        {/* About */}
        <SectionLabel>About</SectionLabel>
        <SettingRow icon={Globe} label="Version" value="Master Events v1.0 · Built on Polygon" color="#0891b2" />

        {/* Danger zone */}
        <SectionLabel>Account Actions</SectionLabel>
        <SettingRow icon={LogOut} label="Log Out"        danger onClick={() => setShowLogout(true)} />
        <SettingRow icon={Trash2} label="Delete Account" value="Permanently delete your account and all data" danger onClick={() => setShowDelete(true)} />

        {/* Logout confirm modal */}
        <AnimatePresence>
          {showLogout && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogout(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, backdropFilter: "blur(8px)" }} />
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: T.card, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom,0px))", zIndex: 201, border: `1px solid ${T.border}`, borderBottom: "none", fontFamily: FONT }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: T.border, margin: "0 auto 22px" }} />
                <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "8px", letterSpacing: "-0.4px" }}>Log out?</div>
                <div style={{ fontSize: "14px", color: T.muted, marginBottom: "24px", lineHeight: 1.6 }}>You'll need to sign in again to access your tickets and wallet.</div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(false)}
                    style={{ flex: 1, padding: "14px", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: "14px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: T.sub, fontFamily: FONT }}>
                    Cancel
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowLogout(false); handleLogout(); }}
                    style={{ flex: 1, padding: "14px", background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)", borderRadius: "14px", fontWeight: 700, fontSize: "14px", cursor: "pointer", color: RED, fontFamily: FONT }}>
                    Log Out
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPicker   && <AvatarPickerModal currentSeed={avatarSeed} onSelect={handleAvatarSelect} onClose={() => setShowPicker(false)} />}
          {showPassword && <PasswordModal onClose={() => setShowPassword(false)} />}
          {showDelete   && <DeleteModal onClose={() => setShowDelete(false)} handleLogout={handleLogout} />}
        </AnimatePresence>
      </div>
    </div>
  );
}