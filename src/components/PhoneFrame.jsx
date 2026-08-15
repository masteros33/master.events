import React from "react";
import useStore from "../store/useStore";
import { useTheme } from "../hooks/useTheme";
import LandingPage from "../screens/landing/LandingPage";
import AboutPage from "../screens/landing/AboutPage";

export default function PhoneFrame({ children }) {
  const setScreen  = useStore(s => s.setScreen);
  const screen     = useStore(s => s.screen);
  const isLoggedIn = useStore(s => s.isLoggedIn);
  useTheme();

  const getPage = () => {
    if (screen === "pendingEvent") return "app";
    if (isLoggedIn) return "app";
    if (screen === "home")  return "home";
    if (screen === "about") return "about";
    if (screen === "login" || screen === "signup" || screen === "role") return "app";
    return "home";
  };

  const handleNavigate = (page) => {
    if (page === "login" || page === "signup") setScreen(page);
    else if (page === "home")  setScreen("home");
    else if (page === "about") setScreen("about");
    else setScreen(page);
  };

  const page = getPage();
  if (page === "home")  return <LandingPage onNavigate={handleNavigate} />;
  if (page === "about") return <AboutPage   onNavigate={handleNavigate} />;

  return (
    <div className="h-screen w-full overflow-hidden bg-brand-canvas font-sans">
      {children}
    </div>
  );
}