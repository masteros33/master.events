import { useEffect } from "react";
import useStore, { IDLE_LIMIT_MS, touchActivity } from "../store/useStore";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
const CHECK_INTERVAL_MS = 60 * 1000;

export function useIdleTimeout() {
  const isLoggedIn   = useStore(s => s.isLoggedIn);
  const handleLogout = useStore(s => s.handleLogout);

  useEffect(() => {
    if (!isLoggedIn) return;

    touchActivity();
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, touchActivity, { passive: true }));

    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem("me_last_activity") || "0", 10);
      if (last && Date.now() - last > IDLE_LIMIT_MS) {
        handleLogout("Your session expired after 12 hours of inactivity.");
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, touchActivity));
      clearInterval(interval);
    };
  }, [isLoggedIn, handleLogout]);
}
