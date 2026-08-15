import React from "react";
import useStore from "../../store/useStore";
import { ONBOARDING } from "../../constants/data";
import { PartyPopper, Link2, ArrowUpRight, Globe } from "lucide-react";

const SLIDE_ICONS = [PartyPopper, Link2, ArrowUpRight, Globe];

export default function Onboarding() {
  const onboardSlide = useStore(s => s.onboardSlide);
  const setOnboardSlide = useStore(s => s.setOnboardSlide);
  const setScreen = useStore(s => s.setScreen);

  const slide = ONBOARDING[onboardSlide] || ONBOARDING[0];
  const isLast = onboardSlide === ONBOARDING.length - 1;
  const SlideIcon = SLIDE_ICONS[onboardSlide] || PartyPopper;

  return (
    <div className="h-full flex flex-col bg-brand-canvas relative overflow-hidden">
      {!isLast && (
        <button onClick={() => setScreen("login")}
          className="absolute top-5 right-5 z-10 bg-brand-card shadow-sm px-4 py-1.5 rounded-full text-brand-muted text-[13px] font-semibold">
          Skip
        </button>
      )}

      {/* Image area */}
      <div className="flex-1 relative overflow-hidden">
        <img src={slide.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-brand-orange border-4 border-white shadow-sm flex items-center justify-center">
          <SlideIcon size={26} strokeWidth={1.75} color="#fff" />
        </div>
      </div>

      {/* Bottom card */}
      <div className="bg-brand-card rounded-t-[28px] px-7 pt-10 pb-9 shadow-sm text-center">
        <div className="text-2xl font-extrabold text-brand-text mb-2.5 leading-tight tracking-tight">{slide.title}</div>
        <div className="text-sm text-brand-muted leading-relaxed mb-7">{slide.subtitle}</div>

        {/* Dots */}
        <div className="flex gap-2 justify-center mb-6">
          {ONBOARDING.map((_, i) => (
            <button key={i} onClick={() => setOnboardSlide(i)}
              className={`h-2 rounded-full transition-all ${i === onboardSlide ? "w-6 bg-brand-orange" : "w-2 bg-gray-200"}`} />
          ))}
        </div>

        {isLast ? (
          <div className="flex flex-col gap-2.5">
            <button onClick={() => setScreen("signup")}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full font-bold text-[15px] transition-colors">
              Get Started
            </button>
            <button onClick={() => setScreen("login")}
              className="w-full py-4 bg-brand-canvas border border-gray-200 text-brand-muted rounded-full font-semibold text-[15px]">
              Log In
            </button>
          </div>
        ) : (
          <button onClick={() => setOnboardSlide(onboardSlide + 1)}
            className="w-full py-4 bg-brand-card border-2 border-brand-orange text-brand-orange rounded-full font-bold text-[15px]">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
