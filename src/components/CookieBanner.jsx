import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          style={{
            position: "fixed",
            bottom: "16px",
            left: "16px",
            right: "16px",
            margin: "0 auto",
            maxWidth: "480px",
            width: "auto",
            background: "#111",
            border: "1px solid #333",
            borderRadius: "14px",
            padding: "14px 16px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            boxSizing: "border-box",
          }}>

          {/* Icon */}
          <div style={{ fontSize: "20px", flexShrink: 0 }}>🍪</div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>
              We use cookies
            </div>
            <div style={{ fontSize: "11px", color: "#888", lineHeight: 1.5 }}>
              Essential cookies keep the app working. Analytics help us improve.
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
            <motion.button whileTap={{ scale: 0.94 }} onClick={accept}
              style={{
                padding: "7px 14px", borderRadius: "8px",
                background: "#fff", border: "none",
                color: "#111", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
              Accept All
            </motion.button>
            <motion.button whileTap={{ scale: 0.94 }} onClick={decline}
              style={{
                padding: "7px 12px", borderRadius: "8px",
                background: "transparent", border: "1px solid #444",
                color: "#aaa", fontSize: "12px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
              Essential
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}