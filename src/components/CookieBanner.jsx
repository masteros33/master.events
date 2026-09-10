import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "@phosphor-icons/react";

const CONSENT_KEY = "me_cookie_consent";

// Consent has to survive in an in-app browser — most of our traffic arrives
// from a WhatsApp or Gmail webview, and some of those refuse localStorage
// outright. Every read and write is therefore guarded, and a cookie backs the
// value up. Previously `localStorage.setItem` threw before `setVisible(false)`
// ran, so tapping Accept did nothing and the banner sat over the page for the
// whole session, on every screen.

function readConsent() {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v) return v;
  } catch { /* storage blocked */ }
  try {
    const m = document.cookie.match(/(^| )me_cookie_consent=([^;]+)/);
    return m ? decodeURIComponent(m[2]) : null;
  } catch { return null; }
}

function writeConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* storage blocked */ }
  try {
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
  } catch { /* nothing left to try */ }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent()) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Dismiss first, persist second. If persistence fails the banner still goes
  // away for this session rather than becoming impossible to get rid of.
  const choose = (value) => {
    setVisible(false);
    writeConsent(value);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 100, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed left-4 right-4 mx-auto max-w-[480px] w-auto bg-brand-card border border-brand-hairline rounded-2xl p-4 z-[9999] flex items-center gap-3.5 box-border font-sans"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>

          <div className="w-9 h-9 rounded-full bg-brand-canvas border border-brand-hairline flex items-center justify-center shrink-0">
            <Cookie size={18} weight="light" className="text-brand-muted" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-brand-text mb-0.5">We use cookies</div>
            <div className="text-xs text-brand-muted leading-relaxed">
              Essential cookies keep the app working. Analytics help us improve.
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button onClick={() => choose("all")}
              className="px-3.5 py-1.5 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-medium whitespace-nowrap transition-colors">
              Accept all
            </button>
            <button onClick={() => choose("essential")}
              className="px-3 py-1.5 rounded-full border border-brand-hairline text-brand-muted text-xs font-medium whitespace-nowrap transition-colors">
              Essential
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
