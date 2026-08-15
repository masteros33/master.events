import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Menu, X } from "lucide-react";

const NAVY = "#1c2e53";

const NAV_LINKS = [
  { label: "Events",         target: "events" },
  { label: "For organizers", target: "organizers" },
  { label: "How it works",   target: "how" },
  { label: "FAQ",            target: "faq" },
];

export function NavBar({ onNavigate }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Section-anchor links (events/organizers/how/faq) all live on
  // the Landing page — navigate there first if we're elsewhere
  // (e.g. on the About page), then scroll to the section. ──
  const goTo = (target) => {
    setMenuOpen(false);
    const sectionTargets = ["events", "organizers", "how", "faq"];
    if (sectionTargets.includes(target)) {
      onNavigate("home");
      setTimeout(() => {
        document.querySelector(`#${target}`)?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      onNavigate(target);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-card border-b border-gray-100">
      <div className={`mx-auto flex items-center justify-between ${isMobile ? "px-4 h-14" : "max-w-6xl px-8 h-[68px]"}`}>
        <div onClick={() => onNavigate("home")} className="flex items-center gap-2.5 cursor-pointer">
          <div className={`rounded-xl flex items-center justify-center shrink-0 ${isMobile ? "w-7 h-7" : "w-9 h-9"}`} style={{ background: NAVY }}>
            <Link2 size={isMobile ? 15 : 18} strokeWidth={2} color="#fff" />
          </div>
          <span className={`font-extrabold text-brand-text tracking-tight whitespace-nowrap ${isMobile ? "text-[15px]" : "text-[17px]"}`} style={{ fontFamily: "'Sora', sans-serif" }}>
            Master Events
          </span>
        </div>

        {!isMobile && (
          <div className="flex items-center gap-7">
            {NAV_LINKS.map(({ label, target }) => (
              <span key={label} onClick={() => goTo(target)}
                className="text-sm font-medium text-brand-muted hover:text-brand-text cursor-pointer transition-colors whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isMobile && (
            <span onClick={() => onNavigate("login")} className="text-sm font-semibold text-brand-muted hover:text-brand-text cursor-pointer transition-colors">
              Log in
            </span>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => onNavigate("signup")}
            className={`rounded-full text-white font-bold whitespace-nowrap transition-colors ${isMobile ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm"}`}
            style={{ background: NAVY }}>
            Sign up free
          </motion.button>

          {isMobile && (
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setMenuOpen(true)}
              className="w-8 h-8 rounded-lg bg-brand-canvas border border-gray-200 flex items-center justify-center shrink-0">
              <Menu size={16} className="text-brand-text" />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/40 z-[100]" />
            <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.18 }}
              className="fixed top-0 left-0 right-0 bg-brand-card z-[101] border-b border-gray-100 shadow-lg">
              <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
                <span className="font-extrabold text-[15px] text-brand-text">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-lg bg-brand-canvas border border-gray-200 flex items-center justify-center">
                  <X size={15} className="text-brand-muted" />
                </button>
              </div>
              <div className="p-3">
                {NAV_LINKS.map(({ label, target }) => (
                  <div key={label} onClick={() => goTo(target)}
                    className="px-3 py-3 rounded-xl text-[15px] font-semibold text-brand-text cursor-pointer hover:bg-brand-canvas">
                    {label}
                  </div>
                ))}
                <div onClick={() => { setMenuOpen(false); onNavigate("login"); }}
                  className="px-3 py-3 rounded-xl text-[15px] font-semibold text-brand-text cursor-pointer hover:bg-brand-canvas">
                  Log in
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}