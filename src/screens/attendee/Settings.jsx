import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import {
  Avatar, AVATAR_PRESETS, getSavedAvatarSeed,
  saveAvatarSeed
} from "../../utils/avatar";
import {
  User, Mail, Shield, LogOut, ChevronRight, ArrowLeft,
  Bell, Globe, CheckCircle, Edit3, Save, Link2, Cookie,
  FileText, Lock, Eye, EyeOff, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const BACKEND   = "https://master-events-backend.onrender.com";
const isDesktop = () => window.innerWidth > 768;

function SectionHeader({ title }) {
  return (
    <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest font-mono pt-5 pb-2">
      {title}
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, action, danger, onClick, toggle, checked, onToggle, badgeBg = "bg-pastel-blue", iconClass = "text-fintech-blue" }) {
  return (
    <div onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm mb-1.5 transition-colors ${onClick ? "cursor-pointer hover:border-gray-200" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : badgeBg}`}>
        <Icon size={16} strokeWidth={1.75} className={danger ? "text-red-600" : iconClass} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold leading-tight ${danger ? "text-red-600" : "text-brand-text"}`}>{label}</div>
        {value && <div className="text-xs text-brand-muted mt-0.5 truncate">{value}</div>}
      </div>
      {toggle ? (
        <button onClick={e => { e.stopPropagation(); onToggle(); }}
          className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${checked ? "bg-brand-orange" : "bg-gray-200"}`}>
          <motion.div animate={{ x: checked ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow" />
        </button>
      ) : onClick ? (
        <ChevronRight size={16} strokeWidth={1.75} className="text-brand-muted shrink-0" />
      ) : action ? (
        <span className="text-xs font-semibold text-brand-orange shrink-0">{action}</span>
      ) : null}
    </div>
  );
}

function SheetShell({ onClose, children, maxWidth = "480px" }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[300] bg-black/40" />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 mx-auto z-[301] bg-white rounded-t-3xl border border-gray-100 p-6"
        style={{ maxWidth, paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5 shrink-0" />
        {children}
      </motion.div>
    </>
  );
}

const fieldClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-brand-text outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 transition-colors";

function AvatarPickerModal({ currentSeed, onSelect, onClose }) {
  const [selected, setSelected] = useState(currentSeed);

  return (
    <SheetShell onClose={onClose}>
      <div className="font-extrabold text-lg text-brand-text mb-1.5">Choose Your Avatar</div>
      <div className="text-sm text-brand-muted mb-5">Pick a character — it stays consistent across your account</div>
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="grid grid-cols-6 gap-2.5">
          {AVATAR_PRESETS.map(seed => {
            const isSelected = selected === seed;
            return (
              <button key={seed} onClick={() => setSelected(seed)}
                className={`relative rounded-2xl p-1 border-2 transition-colors ${isSelected ? "border-brand-orange bg-pastel-orange" : "border-transparent"}`}>
                <Avatar seed={seed} size={44} style={{ width: "100%", height: "auto", aspectRatio: "1", borderRadius: "10px" }} />
                {isSelected && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center border-2 border-white">
                    <CheckCircle size={9} className="text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3.5 bg-brand-canvas border border-gray-100 rounded-2xl p-4 mb-3.5">
        <Avatar seed={selected} size={52} style={{ borderRadius: "50%", flexShrink: 0 }} />
        <div>
          <div className="text-sm font-bold text-brand-text">Preview</div>
          <div className="text-[11px] text-brand-muted font-mono mt-0.5">{selected}</div>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-full bg-brand-canvas border border-gray-200 font-semibold text-sm text-brand-text">
          Cancel
        </button>
        <button onClick={() => { onSelect(selected); onClose(); }}
          className="flex-[2] py-3 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm transition-colors">
          Apply Avatar
        </button>
      </div>
    </SheetShell>
  );
}

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

  return (
    <SheetShell onClose={onClose}>
      <div className="font-extrabold text-lg text-brand-text mb-1.5">Change Password</div>
      <div className="text-sm text-brand-muted mb-5">At least 8 characters.</div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-brand-muted mb-1.5">Current Password</div>
        <div className="relative">
          <input type={showCur ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" className={fieldClass} />
          <button onClick={() => setShowCur(!showCur)} type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted">
            {showCur ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-brand-muted mb-1.5">New Password</div>
        <div className="relative">
          <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 8 characters" className={fieldClass} />
          <button onClick={() => setShowNew(!showNew)} type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted">
            {showNew ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs font-semibold text-brand-muted mb-1.5">Confirm New Password</div>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" className={fieldClass} />
        {confirm && newPass && confirm !== newPass && (
          <div className="text-[11px] text-red-600 mt-1">Passwords don't match</div>
        )}
      </div>

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 py-3 rounded-full bg-brand-canvas border border-gray-200 font-semibold text-sm text-brand-text">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-[2] py-3 rounded-full bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold text-sm transition-colors">
          {saving ? "Saving..." : "Change Password"}
        </button>
      </div>
    </SheetShell>
  );
}

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
    <SheetShell onClose={onClose}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
          <Trash2 size={20} strokeWidth={1.75} className="text-red-600" />
        </div>
        <div>
          <div className="font-extrabold text-lg text-red-600">Delete Account</div>
          <div className="text-xs text-brand-muted mt-0.5">This cannot be undone</div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 mb-4.5">
        <div className="text-sm text-brand-text leading-relaxed">
          Deleting your account will permanently remove all your tickets, wallet balance, and personal data. This action cannot be reversed.
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs font-semibold text-brand-muted mb-1.5">Confirm with your password</div>
        <div className="relative">
          <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 bg-white text-sm text-brand-text outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors" />
          <button onClick={() => setShowPass(!showPass)} type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted">
            {showPass ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 py-3.5 rounded-full bg-brand-canvas border border-gray-200 font-semibold text-sm text-brand-text">
          Cancel
        </button>
        <button onClick={handleDelete} disabled={deleting || !password}
          className="flex-1 py-3.5 rounded-full bg-red-50 border border-red-200 disabled:opacity-60 font-bold text-sm text-red-600">
          {deleting ? "Deleting..." : "Delete Forever"}
        </button>
      </div>
    </SheetShell>
  );
}

export default function Settings() {
  const setScreen    = useStore(s => s.setScreen);
  const setActiveTab = useStore(s => s.setActiveTab);
  const currentUser  = useStore(s => s.currentUser);
  const handleLogout = useStore(s => s.handleLogout);
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
    <div className="bg-brand-canvas min-h-full pb-14 font-sans">

      {/* ── Header — icon-only back button ── */}
      <div className={`sticky top-0 z-20 bg-white border-b border-gray-100 h-15 flex items-center justify-between ${desktop ? "px-10" : "px-4"}`}>
        <button onClick={() => { setScreen("app"); setActiveTab(undefined); }}
          className="w-9 h-9 rounded-full bg-brand-canvas border border-gray-100 flex items-center justify-center shrink-0">
          <ArrowLeft size={16} strokeWidth={2} className="text-brand-text" />
        </button>
        <div className="font-extrabold text-base text-brand-text tracking-tight">Settings</div>
        <div className="w-9" />
      </div>

      <div className={`mx-auto ${desktop ? "max-w-[640px] px-10 py-6" : "px-4 py-4"}`}>

        {/* ── Profile card ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-2">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowPicker(true)} className="relative shrink-0">
                <Avatar seed={avatarSeed} size={64} style={{ borderRadius: "50%" }} />
                <span className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-brand-orange flex items-center justify-center border-2 border-white">
                  <Edit3 size={10} className="text-white" />
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xl text-brand-text tracking-tight">
                  {displayFirst} {displayLast}
                </div>
                <div className="text-sm text-brand-muted mt-0.5">{currentUser?.email}</div>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-pastel-orange">
                  <span className="text-[10px] font-bold text-brand-orange">{(currentUser?.role || "ATTENDEE").toUpperCase()}</span>
                </span>
              </div>
            </div>

            <button onClick={() => setShowPicker(true)}
              className="w-full mt-3.5 flex items-center gap-2 px-3.5 py-2.5 bg-pastel-orange rounded-xl">
              <div className="flex gap-1">
                {AVATAR_PRESETS.slice(0, 5).map(seed => (
                  <Avatar key={seed} seed={seed} size={20}
                    style={{ borderRadius: "50%", border: seed === avatarSeed ? "2px solid #FF5A1F" : "2px solid transparent" }} />
                ))}
                <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[9px] font-bold text-brand-muted">
                  +{AVATAR_PRESETS.length - 5}
                </div>
              </div>
              <span className="text-xs font-semibold text-brand-orange ml-1">Change Avatar</span>
              <ChevronRight size={14} strokeWidth={2} className="text-brand-orange ml-auto" />
            </button>
          </div>

          <AnimatePresence>
            {editing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex gap-2.5 mb-2.5">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-brand-muted mb-1.5">First Name</div>
                      <input value={editFirst} onChange={e => setEditFirst(e.target.value)} className={fieldClass} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-brand-muted mb-1.5">Last Name</div>
                      <input value={editLast} onChange={e => setEditLast(e.target.value)} className={fieldClass} />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-brand-muted mb-1.5">Phone (optional)</div>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="e.g. 0241234567" type="tel" className={fieldClass} />
                  <div className="flex gap-2 mt-3.5">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-[2] py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-colors">
                      <Save size={14} strokeWidth={2} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => { setEditing(false); setEditFirst(displayFirst); setEditLast(displayLast); }}
                      className="flex-1 py-2.5 rounded-full bg-brand-canvas border border-gray-200 text-brand-text font-semibold text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-3">
            {!editing && (
              <button
                onClick={() => { setEditing(true); setEditFirst(displayFirst); setEditLast(displayLast); setEditPhone(currentUser?.phone || ""); }}
                className="w-full py-2.5 bg-brand-canvas border border-gray-200 rounded-full text-brand-text font-semibold text-sm flex items-center justify-center gap-1.5">
                <Edit3 size={14} strokeWidth={1.75} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ── Account — FIX: the "Full Name" row below duplicated the
        name already shown in the profile card above. That row is
        removed; email stays since it's genuinely not shown elsewhere
        with an edit affordance. ── */}
        <SectionHeader title="Account" />
        <SettingRow icon={Mail} label="Email Address" value={currentUser?.email} badgeBg="bg-pastel-blue" iconClass="text-fintech-blue" />
        <SettingRow icon={Lock} label="Password" value="Change your account password" badgeBg="bg-pastel-blue" iconClass="text-fintech-blue" onClick={() => setShowPassword(true)} />

        <SectionHeader title="Notifications" />
        <SettingRow icon={Bell} label="Email Notifications" value="Ticket activity, NFT confirmations, sales" badgeBg="bg-pastel-orange" iconClass="text-brand-orange"
          toggle checked={notifs} onToggle={() => setNotifs(!notifs)} />

        <SectionHeader title="Blockchain" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-1.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-pastel-blue flex items-center justify-center shrink-0">
              <Link2 size={16} strokeWidth={1.75} className="text-fintech-blue" />
            </div>
            <div>
              <div className="text-sm font-bold text-fintech-blue">Polygon Amoy Testnet</div>
              <div className="text-[11px] text-brand-muted font-mono mt-0.5">Chain ID: 80002 · NFT tickets auto-minted</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-700 font-mono">LIVE</span>
            </div>
          </div>
          <div className="bg-brand-canvas border border-gray-100 rounded-xl px-3 py-2.5 mb-2.5">
            <div className="text-[10px] text-brand-muted font-mono mb-1">NFT CONTRACT</div>
            <div className="text-[11px] font-bold text-fintech-blue font-mono break-all">
              0x956F051d666fAc2B956b83BdDD6746127F270Daf
            </div>
          </div>
          <div className="px-3 py-2.5 bg-pastel-blue rounded-xl">
            <div className="text-[11px] text-brand-text leading-relaxed">
              NFT tickets are automatically minted on Polygon when you purchase. No wallet setup needed.
            </div>
          </div>
        </div>

        <SectionHeader title="Legal & Privacy" />
        <SettingRow icon={FileText} label="Privacy Policy"     badgeBg="bg-gray-100" iconClass="text-brand-muted" onClick={() => setScreen("privacy")} />
        <SettingRow icon={Shield}   label="Terms of Service"   badgeBg="bg-gray-100" iconClass="text-brand-muted" onClick={() => setScreen("privacy")} />
        <SettingRow icon={Cookie}   label="Cookie Preferences" value="Manage what we track" badgeBg="bg-gray-100" iconClass="text-brand-muted" onClick={() => {
          localStorage.removeItem("me_cookie_consent");
          window.location.reload();
        }} />

        <SectionHeader title="About" />
        <SettingRow icon={Globe} label="Version" value="Master Events v1.0 · Built on Polygon" badgeBg="bg-pastel-blue" iconClass="text-fintech-blue" />

        <SectionHeader title="Account Actions" />
        <SettingRow icon={LogOut} label="Log Out" danger onClick={() => setShowLogout(true)} />
        <SettingRow icon={Trash2} label="Delete Account" value="Permanently delete your account and all data" danger onClick={() => setShowDelete(true)} />

        <AnimatePresence>
          {showLogout && (
            <SheetShell onClose={() => setShowLogout(false)}>
              <div className="font-extrabold text-lg text-brand-text mb-2">Log out?</div>
              <div className="text-sm text-brand-muted mb-6 leading-relaxed">You'll need to sign in again to access your tickets and wallet.</div>
              <div className="flex gap-2.5">
                <button onClick={() => setShowLogout(false)}
                  className="flex-1 py-3.5 rounded-full bg-brand-canvas border border-gray-200 font-semibold text-sm text-brand-text">
                  Cancel
                </button>
                <button onClick={() => { setShowLogout(false); handleLogout(); }}
                  className="flex-1 py-3.5 rounded-full bg-red-50 border border-red-200 font-bold text-sm text-red-600">
                  Log Out
                </button>
              </div>
            </SheetShell>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPicker && (
            <AvatarPickerModal currentSeed={avatarSeed} onSelect={handleAvatarSelect} onClose={() => setShowPicker(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPassword && <PasswordModal onClose={() => setShowPassword(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {showDelete && <DeleteModal onClose={() => setShowDelete(false)} handleLogout={handleLogout} />}
        </AnimatePresence>
      </div>
    </div>
  );
}