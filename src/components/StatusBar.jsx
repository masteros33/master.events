import React, { useState, useEffect } from "react";

export default function StatusBar() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  });
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "relative", height: "44px",
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      padding: "0 28px 8px", zIndex: 100, background: "transparent",
    }}>
      <span style={{ fontWeight: 700, fontSize: "14px", color: "#111" }}>{time}</span>
      <div style={{ width: "120px", height: "32px", background: "#000", borderRadius: "20px", position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Signal bars */}
        <svg width="18" height="13" viewBox="0 0 18 13">
          {[0,1,2,3].map(i => (
            <rect key={i} x={i * 4.5} y={12 - (i + 1) * 3} width="3" height={(i + 1) * 3} rx="0.8"
              fill={i < 3 ? "#111" : "#ccc"} />
          ))}
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="#111"/>
          <path d="M4.5 7C5.8 5.7 6.8 5 8 5s2.2.7 3.5 2" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M1.5 4C3.5 2 5.6 1 8 1s4.5 1 6.5 3" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
        {/* Battery */}
        <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
          <div style={{ width: "22px", height: "12px", border: "1.5px solid #111", borderRadius: "3px", padding: "1.5px", display: "flex", alignItems: "center" }}>
            <div style={{ width: "75%", height: "100%", background: "#111", borderRadius: "1.5px" }} />
          </div>
          <div style={{ width: "2px", height: "5px", background: "#111", borderRadius: "0 1px 1px 0" }} />
        </div>
      </div>
    </div>
  );
}
