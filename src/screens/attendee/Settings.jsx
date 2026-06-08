import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import {
  Avatar, AVATAR_PRESETS, getSavedAvatarSeed,
  saveAvatarSeed
} from "../../utils/avatar";
import { useTheme } from "../../hooks/useTheme";
import {
  User, Mail, Shield, LogOut, ChevronRight,
  Sun, Moon, Monitor, Bell, Globe,
  CheckCircle, Edit3, Save, Link2, Cookie,
  FileText, Lock, Eye, EyeOff, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const BACKEND   = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;
const BRAND     = "#F97316";

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
    <motion.div whileTap={onClick ? { scale: 0.99 } : {}} onClick={onClick}
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
          style={{ width: "44px", height: "24px", borderRadius: "99px", cursor: "pointer", background: checked ? BRAND : "var(--bg-subtle)", border: `1px solid ${checked ? BRAND : "var(--border)"}`, position: "relative", transition: "all 0.2s" }}>
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

// ── Avatar Picker Modal ───────────────────────────────────────
function AvatarPickerModal({ currentSeed, onSelect, onClose }) {
  const [selected, setSelected] = useState(currentSeed);
  const [hovered,  setHovered]  = useState(null);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, backdropFilter: "blur(8px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          margin: "0 auto", maxWidth: "520px",
          background: "var(--bg-card)", borderRadius: "24px 24px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          zIndex: 301, border: "1px solid var(--border)", borderBottom: "none",
          maxHeight: "85vh", display: "flex", flexDirection: "column",
        }}>
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)", margin: "0 auto 20px" }} />
        <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "6px", letterSpacing: "-0.3px" }}>Choose Your Avatar</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Pick a character — it stays consistent across your account</div>
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
            {AVATAR_PRESETS.map(seed => {
              const isSelected = selected === seed;
              const isHovered  = hovered === seed;
              return (
                <motion.div key={seed} whileTap={{ scale: 0.92 }}
                  onClick={() => setSelected(seed)}
                  onMouseEnter={() => setHovered(seed)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: "relative", cursor: "pointer", borderRadius: "14px", padding: "4px",
                    background: isSelected ? `${BRAND}15` : isHovered ? "var(--bg-subtle)" : "transparent",
                    border: isSelected ? `2px solid ${BRAND}` : "2px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  <Avatar seed={seed} size={44} style={{ width: "100%", height: "auto", aspectRatio: "1", borderRadius: "10px" }} />
                  {isSelected && (
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
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "var(--bg-subtle)", borderRadius: "14px", marginBottom: "14px", border: "1px solid var(--border)" }}>
          <Avatar seed={selected} size={52} style={{ border: `3px solid ${BRAND}40`, borderRadius: "50%", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Preview</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{selected}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ flex: 1, padding: "13px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { onSelect(selected); onClose(); }}
            style={{ flex: 2, padding: "13px", background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", color: "#fff", fontFamily: "var(--font-sans)" }}>
            Apply Avatar
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Password Change Modal ─────────────────────────────────────
function PasswordModal({ onClose }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    if (!current || !newPass || !confirm) { toast.error("Fill all fields"); return; }
    if (newPass.length < 8)               { toast.error("Min 8 characters"); return; }
    if (newPass !== confirm)              { toast.error("Passwords don't match"); return; }
    setSaving(true);
    const t = toast.loading("Changing password...");
    try {
      const res = await fetch(`${BACKEND}/api/auth/me/change-password/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: JSON.stringify({ current_password: current, new_password: newPass }),
      });
      const data = await res.json();
      toast.dismiss(t);
      if (res.ok) { toast.success("Password changed!"); onClose(); }
      else        { toast.error(data.error || "Failed to change password"); }
    } catch {
      toast.dismiss(t);
      toast.error("Connection error. Try again.");
    } finally { setSaving(false); }
  };

  const inp = {
    width: "100%", padding: "11px 42px 11px 14px",
    background: "var(--bg-subtle)", border: "1.5px solid var(--border)",
    borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)",
    outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, backdropFilter: "blur(8px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", zIndex: 301, border: "1px solid var(--border)", borderBottom: "none" }}>
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)", margin: "0 auto 20px" }} />
        <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "6px" }}>Change Password</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>At least 8 characters.</div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Current Password</div>
          <div style={{ position: "relative" }}>
            <input type={showCur ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" style={inp}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
            <div onClick={() => setShowCur(!showCur)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
              {showCur ? <EyeOff size={15} color="var(--text-muted)" /> : <Eye size={15} color="var(--text-muted)" />}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>New Password</div>
          <div style={{ position: "relative" }}>
            <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 8 characters" style={inp}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
            <div onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
              {showNew ? <EyeOff size={15} color="var(--text-muted)" /> : <Eye size={15} color="var(--text-muted)" />}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Confirm New Password</div>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" style={inp}
            onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          {confirm && newPass && confirm !== newPass && (
            <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>Passwords don't match</div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ flex: 1, padding: "13px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "13px", background: saving ? "var(--bg-subtle)" : `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", color: saving ? "var(--text-muted)" : "#fff", fontFamily: "var(--font-sans)" }}>
            {saving ? "Saving..." : "Change Password"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Delete Account Modal ──────────────────────────────────────
function DeleteModal({ onClose, handleLogout }) {
  const [password,  setPassword]  = useState("");
  const [deleting,  setDeleting]  = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleDelete = async () => {
    if (!password) { toast.error("Enter your password"); return; }
    setDeleting(true);
    const t = toast.loading("Deleting account...");
    try {
      const res = await fetch(`${BACKEND}/api/auth/delete-account/`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      toast.dismiss(t);
      if (res.ok) {
        toast.success("Account deleted.");
        handleLogout();
      } else {
        toast.error(data.error || "Failed to delete account");
      }
    } catch {
      toast.dismiss(t);
      toast.error("Connection error.");
    } finally { setDeleting(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, backdropFilter: "blur(8px)" }} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", zIndex: 301, border: "1px solid var(--border)", borderBottom: "none" }}>
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)", margin: "0 auto 20px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Trash2 size={20} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "18px", color: "#dc2626", letterSpacing: "-0.3px" }}>Delete Account</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>This cannot be undone</div>
          </div>
        </div>

        <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Deleting your account will permanently remove all your tickets, wallet balance, and personal data. This action cannot be reversed.
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Confirm with your password</div>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: "100%", padding: "12px 42px 12px 14px", background: "var(--bg-subtle)", border: "1.5px solid rgba(220,38,38,0.3)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 3px rgba(220,38,38,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(220,38,38,0.3)"; e.target.style.boxShadow = "none"; }}
            />
            <div onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
              {showPass ? <EyeOff size={15} color="var(--text-muted)" /> : <Eye size={15} color="var(--text-muted)" />}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ flex: 1, padding: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "13px", fontWeight: 600, fontSize: "14px", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete}
            disabled={deleting || !password}
            style={{ flex: 1, padding: "14px", background: deleting || !password ? "var(--bg-subtle)" : "rgba(220,38,38,0.12)", border: "1.5px solid rgba(220,38,38,0.3)", borderRadius: "13px", fontWeight: 700, fontSize: "14px", cursor: deleting || !password ? "not-allowed" : "pointer", color: "#dc2626", fontFamily: "var(--font-sans)" }}>
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
  const [editing,      setEditing]      = useState(false);
  const [editFirst,    setEditFirst]    = useState(currentUser?.first_name || "");
  const [editLast,     setEditLast]     = useState(currentUser?.last_name  || "");
  const [editPhone,    setEditPhone]    = useState(currentUser?.phone      || "");
  const [saving,       setSaving]       = useState(false);
  const [notifs,       setNotifs]       = useState(true);
  const [showLogout,   setShowLogout]   = useState(false);

  const [displayFirst, setDisplayFirst] = useState(currentUser?.first_name || "");
  const [displayLast,  setDisplayLast]  = useState(currentUser?.last_name  || "");

  const themeOptions = [
    { id: "light",  icon: Sun,     label: "Light"  },
    { id: "dark",   icon: Moon,    label: "Dark"   },
    { id: "system", icon: Monitor, label: "System" },
  ];

  const handleAvatarSelect = (seed) => {
    setAvatarSeed(seed);
    saveAvatarSeed(currentUser?.email, seed);
  };

  const handleSave = async () => {
    if (!editFirst.trim()) { toast.error("First name cannot be empty"); return; }
    setSaving(true);
    const t = toast.loading("Saving...");
    try {
      const res = await fetch(`${BACKEND}/api/auth/me/update/`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
        body: JSON.stringify({ first_name: editFirst.trim(), last_name: editLast.trim(), phone: editPhone.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisplayFirst(data.user.first_name);
        setDisplayLast(data.user.last_name);
        const store = useStore.getState();
        const saved = JSON.parse(localStorage.getItem("me_session") || "{}");
        if (store.currentUser) {
          Object.assign(store.currentUser, data.user);
          if (saved.currentUser) {
            saved.currentUser = { ...saved.currentUser, ...data.user };
            localStorage.setItem("me_session", JSON.stringify(saved));
          }
        }
        toast.dismiss(t);
        toast.success("Profile updated!");
        setEditing(false);
      } else {
        toast.dismiss(t);
        toast.error(data.first_name?.[0] || data.detail || "Update failed");
      }
    } catch {
      toast.dismiss(t);
      toast.error("Connection error.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: desktop ? "0 40px" : "0 16px",
        height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { setScreen("app"); setActiveTab(undefined); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-sans)", padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Settings</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: desktop ? "640px" : "100%", margin: "0 auto", padding: desktop ? "24px 40px 60px" : "16px 16px 60px" }}>

        {/* ── Profile card ── */}
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{ padding: "24px", background: `linear-gradient(135deg, ${BRAND}08, transparent)`, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <motion.div whileTap={{ scale: 0.94 }} onClick={() => setShowPicker(true)}
                style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}>
                <Avatar seed={avatarSeed} size={64} style={{ border: `3px solid ${BRAND}40`, borderRadius: "50%" }} />
                <motion.div whileHover={{ scale: 1.1 }}
                  style={{ position: "absolute", bottom: 0, right: 0, width: "22px", height: "22px", borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)", boxShadow: `0 2px 8px ${BRAND}40` }}>
                  <Edit3 size={10} color="#fff" />
                </motion.div>
              </motion.div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                  {displayFirst} {displayLast}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{currentUser?.email}</div>
                <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "99px", background: `${BRAND}12`, border: `1px solid ${BRAND}25` }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: BRAND }}>🎟️ {currentUser?.role?.toUpperCase() || "ATTENDEE"}</span>
                </div>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowPicker(true)}
              style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: `${BRAND}06`, border: `1px solid ${BRAND}18`, borderRadius: "11px", cursor: "pointer" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {AVATAR_PRESETS.slice(0, 5).map(seed => (
                  <Avatar key={seed} seed={seed} size={20}
                    style={{ border: seed === avatarSeed ? `2px solid ${BRAND}` : "2px solid transparent", borderRadius: "50%" }} />
                ))}
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "var(--text-muted)", fontWeight: 700 }}>
                  +{AVATAR_PRESETS.length - 5}
                </div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: BRAND, marginLeft: "4px" }}>Change Avatar</span>
              <ChevronRight size={14} color={BRAND} style={{ marginLeft: "auto" }} />
            </motion.div>
          </div>

          {/* Edit form */}
          <AnimatePresence>
            {editing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>First Name</div>
                      <input value={editFirst} onChange={e => setEditFirst(e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Last Name</div>
                      <input value={editLast} onChange={e => setEditLast(e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>Phone (optional)</div>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    placeholder="e.g. 0241234567" type="tel"
                    style={{ width: "100%", padding: "11px 14px", background: "var(--bg-subtle)", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", color: "var(--text-primary)", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}15`; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                      style={{ flex: 2, padding: "12px", background: saving ? "var(--bg-subtle)" : `linear-gradient(135deg, ${BRAND}, #EA6C0A)`, color: saving ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "11px", fontWeight: 700, fontSize: "13px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setEditing(false); setEditFirst(displayFirst); setEditLast(displayLast); }}
                      style={{ flex: 1, padding: "12px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "11px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ padding: "12px 24px" }}>
            {!editing && (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setEditing(true); setEditFirst(displayFirst); setEditLast(displayLast); setEditPhone(currentUser?.phone || ""); }}
                style={{ width: "100%", padding: "11px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "11px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <Edit3 size={14} /> Edit Profile
              </motion.button>
            )}
          </div>
        </div>

        {/* Account */}
        <SectionHeader title="Account" />
        <SettingRow icon={Mail} label="Email Address" value={currentUser?.email} color="#2563eb" />
        <SettingRow icon={User} label="Full Name" value={`${displayFirst} ${displayLast}`.trim() || "Not set"} color={BRAND} onClick={() => setEditing(true)} action="Edit" />
        <SettingRow icon={Lock} label="Password" value="Change your account password" color="#7c3aed" onClick={() => setShowPassword(true)} />

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", padding: "16px", marginBottom: "6px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Theme</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {themeOptions.map(({ id, icon: Icon, label }) => {
              const active = theme === id;
              return (
                <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setTheme(id)}
                  style={{ flex: 1, padding: "12px 8px", borderRadius: "12px", cursor: "pointer", border: active ? `1.5px solid ${BRAND}` : "1.5px solid var(--border)", background: active ? `${BRAND}10` : "var(--bg-subtle)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.15s", fontFamily: "var(--font-sans)" }}>
                  <Icon size={18} color={active ? BRAND : "var(--text-muted)"} />
                  <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? BRAND : "var(--text-secondary)" }}>{label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <SettingRow icon={Bell} label="Email Notifications" value="Ticket activity, NFT confirmations, sales" color="#16a34a"
          toggle checked={notifs} onToggle={() => setNotifs(!notifs)} />

        {/* Blockchain info — no connect button */}
        <SectionHeader title="Blockchain" />
        <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid rgba(124,58,237,0.2)", padding: "16px", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Link2 size={17} color="#a78bfa" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>Polygon Amoy Testnet</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>Chain ID: 80002 · NFT tickets auto-minted</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
              <motion.div animate={{ scale: [1,1.4,1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", fontFamily: "var(--font-mono)" }}>LIVE</span>
            </div>
          </div>
          <div style={{ background: "var(--bg-subtle)", borderRadius: "10px", padding: "10px 12px", border: "1px solid var(--border)", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>NFT CONTRACT</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
              0x956F051d666fAc2B956b83BdDD6746127F270Daf
            </div>
          </div>
          <div style={{ padding: "9px 12px", background: "rgba(124,58,237,0.04)", borderRadius: "9px", border: "1px solid rgba(124,58,237,0.1)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              🎟️ NFT tickets are automatically minted on Polygon when you purchase. No wallet setup needed.
            </div>
          </div>
        </div>

        {/* Legal */}
        <SectionHeader title="Legal & Privacy" />
        <SettingRow icon={FileText} label="Privacy Policy"     color="var(--text-muted)" onClick={() => setScreen("privacy")} />
        <SettingRow icon={Shield}   label="Terms of Service"   color="var(--text-muted)" onClick={() => setScreen("privacy")} />
        <SettingRow icon={Cookie}   label="Cookie Preferences" value="Manage what we track" color="var(--text-muted)" onClick={() => {
          localStorage.removeItem("me_cookie_consent");
          window.location.reload();
        }} />

        {/* About */}
        <SectionHeader title="About" />
        <SettingRow icon={Globe} label="Version" value="Master Events v1.0 · Built on Polygon" color="#0891b2" />

        {/* Account Actions */}
        <SectionHeader title="Account Actions" />
        <SettingRow icon={LogOut} label="Log Out" danger onClick={() => setShowLogout(true)} />
        <SettingRow icon={Trash2} label="Delete Account" value="Permanently delete your account and all data" danger onClick={() => setShowDelete(true)} />

        {/* Logout modal */}
        <AnimatePresence>
          {showLogout && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowLogout(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }} />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", maxWidth: "480px", background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", zIndex: 201, border: "1px solid var(--border)", borderBottom: "none" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--border-strong)", margin: "0 auto 20px" }} />
                <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>Log out?</div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.6 }}>You'll need to sign in again to access your tickets and wallet.</div>
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

        {/* Avatar picker */}
        <AnimatePresence>
          {showPicker && (
            <AvatarPickerModal currentSeed={avatarSeed} onSelect={handleAvatarSelect} onClose={() => setShowPicker(false)} />
          )}
        </AnimatePresence>

        {/* Password modal */}
        <AnimatePresence>
          {showPassword && <PasswordModal onClose={() => setShowPassword(false)} />}
        </AnimatePresence>

        {/* Delete account modal */}
        <AnimatePresence>
          {showDelete && <DeleteModal onClose={() => setShowDelete(false)} handleLogout={handleLogout} />}
        </AnimatePresence>
      </div>
    </div>
  );
}