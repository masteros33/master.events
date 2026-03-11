import React from "react";
import useStore from "../../store/useStore";
import { ONBOARDING } from "../../constants/data";
import { btnStyle } from "../../styles/common";

export default function Onboarding() {
  const onboardSlide = useStore(s => s.onboardSlide);
  const setOnboardSlide = useStore(s => s.setOnboardSlide);
  const setScreen = useStore(s => s.setScreen);

  const slide = ONBOARDING[onboardSlide] || ONBOARDING[0];
  const isLast = onboardSlide === ONBOARDING.length - 1;

  return (
    <div style={{ height: "800px", display: "flex", flexDirection: "column", background: slide.bg, position: "relative", overflow: "hidden" }}>
      {!isLast && (
        <div onClick={() => setScreen("login")} style={{ position: "absolute", top: "20px", right: "20px", color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, cursor: "pointer", zIndex: 10, background: "rgba(0,0,0,0.2)", padding: "6px 14px", borderRadius: "20px" }}>Skip</div>
      )}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <img src={slide.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.4) 100%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)", fontSize: "90px", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))" }}>{slide.icon}</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(24px)", borderRadius: "28px 28px 0 0", padding: "28px 28px 36px" }}>
        <div style={{ fontSize: "26px", fontWeight: 900, color: "#fff", marginBottom: "10px", lineHeight: 1.2 }}>{slide.title}</div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "28px" }}>{slide.subtitle}</div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
          {ONBOARDING.map((_, i) => (
            <div key={i} onClick={() => setOnboardSlide(i)} style={{ width: i === onboardSlide ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === onboardSlide ? "#fff" : "rgba(255,255,255,0.35)", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
        {isLast ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={() => setScreen("login")} style={{ ...btnStyle, background: "#fff", color: "#f5a623" }}>LOG IN</button>
            <button onClick={() => setScreen("signup")} style={{ ...btnStyle, background: "transparent", border: "2px solid rgba(255,255,255,0.6)", color: "#fff" }}>SIGN UP</button>
          </div>
        ) : (
          <button onClick={() => setOnboardSlide(onboardSlide + 1)} style={{ ...btnStyle, background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff" }}>NEXT →</button>
        )}
      </div>
    </div>
  );
}