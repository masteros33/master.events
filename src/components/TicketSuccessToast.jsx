import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../store/useStore";

export default function TicketSuccessToast() {
  const showSuccessToast    = useStore(s => s.showSuccessToast);
  const successToastTicket  = useStore(s => s.successToastTicket);
  const setShowSuccessToast = useStore(s => s.setShowSuccessToast);
  const setActiveTab        = useStore(s => s.setActiveTab);
  const setScreen           = useStore(s => s.setScreen);
  const setViewingTicket    = useStore(s => s.setViewingTicket);

  useEffect(() => {
    if (!showSuccessToast) return;
    const t = setTimeout(() => setShowSuccessToast(false), 4000);
    return () => clearTimeout(t);
  }, [showSuccessToast]);

  // ── Guard: don't render if ticket or event is missing ──────
  if (!showSuccessToast || !successToastTicket) return null;

  const ev       = successToastTicket?.event || null;
  const evName   = ev?.name   || successToastTicket?.event_name || "Your Event";
  const evImage  = ev?.image  || null;

  return (
    <AnimatePresence>
      {showSuccessToast && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0,   opacity: 1, scale: 1   }}
          exit={{
            y: 80, opacity: 0, scale: 0.5, x: "35vw",
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
            left: "16px", right: "16px",
            zIndex: 500,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)",
            cursor: "pointer",
          }}
          onClick={() => {
            setShowSuccessToast(false);
            setViewingTicket(successToastTicket);
            setScreen("ticketView");
          }}>

          {/* Event image background */}
          {evImage && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${evImage})`,
              backgroundSize: "cover", backgroundPosition: "center",
              filter: "blur(20px) saturate(1.5) brightness(0.4)",
              transform: "scale(1.1)",
            }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 1,
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>

            {/* Thumbnail */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              overflow: "hidden", flexShrink: 0,
              border: "1.5px solid rgba(255,255,255,0.15)",
            }}>
              {evImage
                ? <img src={evImage} alt={evName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f5a623, #e8920f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🎟️</div>
              }
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                  style={{ fontSize: "14px" }}>
                  🎉
                </motion.div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.3px" }}>
                  TICKET CONFIRMED
                </span>
              </div>
              <div style={{
                fontSize: "14px", fontWeight: 700, color: "#fff",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {evName}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "2px" }}>
                Tap to view your ticket →
              </div>
            </div>

            {/* NFT badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
              }}>⛓️</div>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.3px" }}>NFT</span>
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            style={{
              height: "3px",
              background: "linear-gradient(90deg, #f5a623, #4ade80)",
              transformOrigin: "left",
              position: "relative", zIndex: 1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}