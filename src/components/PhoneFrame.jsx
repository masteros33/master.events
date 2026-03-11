import React from "react";
import StatusBar from "./StatusBar";

export default function PhoneFrame({ children }) {
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", left: "calc(50% - 208px)", top: "180px", width: "4px", height: "32px", background: "#333", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: "calc(50% - 208px)", top: "230px", width: "4px", height: "56px", background: "#333", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: "calc(50% - 208px)", top: "300px", width: "4px", height: "56px", background: "#333", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: "calc(50% - 208px)", top: "220px", width: "4px", height: "80px", background: "#333", borderRadius: "0 2px 2px 0" }} />
        <div style={{ width: "390px", height: "844px", background: "#fafaf8", borderRadius: "50px", boxShadow: "0 0 0 2px #555, 0 0 0 12px #1a1a1a, 0 0 0 14px #444, 0 50px 100px rgba(0,0,0,0.7)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", zIndex: 10, flexShrink: 0 }}>
            <StatusBar />
          </div>
          <div style={{ flex: 1, overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}