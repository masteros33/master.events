import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

const COOKIE_KEY = "me_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setTimeout(() => setVisible(true), 1200);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "all");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "essential");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="fixed bottom-4 left-4 right-4 mx-auto max-w-[480px] w-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-4 z-[9999] flex items-center gap-3.5 box-border font-sans">

          <div className="w-9 h-9 rounded-full bg-pastel-orange flex items-center justify-center shrink-0">
            <Cookie size={17} strokeWidth={1.75} className="text-brand-orange" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-brand-text mb-0.5">
              We use cookies
            </div>
            <div className="text-[11px] text-brand-muted leading-relaxed">
              Essential cookies keep the app working. Analytics help us improve.
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <motion.button whileTap={{ scale: 0.94 }} onClick={accept}
              className="px-3.5 py-1.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold whitespace-nowrap transition-colors">
              Accept All
            </motion.button>
            <motion.button whileTap={{ scale: 0.94 }} onClick={decline}
              className="px-3 py-1.5 rounded-full bg-transparent border border-gray-200 text-brand-muted text-xs font-semibold whitespace-nowrap hover:border-gray-300 transition-colors">
              Essential
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}