import React from "react";
import useStore from "../../store/useStore";
import { EVENTS } from "../../constants/data";
import { btnStyle } from "../../styles/common";

export default function AttendeeHome() {
  const setScreen = useStore(s => s.setScreen);
  const setCheckoutEvent = useStore(s => s.setCheckoutEvent);
  const setTicketQty = useStore(s => s.setTicketQty);
  const setOverlayEvent = useStore(s => s.setOverlayEvent);
  const overlayEvent = useStore(s => s.overlayEvent);
  const searchQ = useStore(s => s.searchQ);
  const setSearchQ = useStore(s => s.setSearchQ);
  const menuOpen = useStore(s => s.menuOpen);
  const setMenuOpen = useStore(s => s.setMenuOpen);
  const handleLogout = useStore(s => s.handleLogout);
  const currentUser = useStore(s => s.currentUser);

  const filtered = EVENTS.filter(e =>
    e.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (overlayEvent) {
    return (
      <div style={{ background: "#fff", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ height: "260px", position: "relative", flexShrink: 0 }}>
          <img src={overlayEvent.image} alt={overlayEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%)" }} />
          <button
            onClick={() => setOverlayEvent(null)}
            style={{ position: "absolute", top: "16px", left: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#fff", fontSize: "20px", fontWeight: 700 }}>
            &#8592;
          </button>
          <div style={{ position: "absolute", top: "12px", right: "12px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px" }}>{overlayEvent.category}</div>
          <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px" }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: "20px", marginBottom: "4px", lineHeight: 1.2 }}>{overlayEvent.name}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px" }}>{overlayEvent.venue}</div>
          </div>
        </div>

        <div style={{ padding: "20px", flex: 1 }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {[["📅", overlayEvent.date], ["🕐", overlayEvent.time], ["🎟️", (overlayEvent.totalTickets - overlayEvent.ticketsSold) + " left"]].map(([icon, val]) => (
              <div key={val} style={{ flex: 1, background: "#f9f9f9", borderRadius: "14px", padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>{icon}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#111" }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "15px", fontWeight: 800, color: "#111", marginBottom: "8px" }}>About This Event</div>
          <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.8, marginBottom: "20px" }}>{overlayEvent.description}</div>

          <div style={{ background: "#fff9f0", border: "1px solid #f5a62333", borderRadius: "16px", padding: "14px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>Ticket Price</div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#f5a623" }}>{overlayEvent.price === 0 ? "FREE" : "Ghc " + overlayEvent.price}</div>
            </div>
            <div style={{ fontSize: "12px", color: "#888", textAlign: "right" }}>
              <div>{overlayEvent.totalTickets - overlayEvent.ticketsSold}</div>
              <div>remaining</div>
            </div>
          </div>

          <button onClick={() => { setCheckoutEvent(overlayEvent); setTicketQty(1); setOverlayEvent(null); setScreen("checkout"); }} style={btnStyle}>
            {overlayEvent.price === 0 ? "GET FREE TICKET" : "BUY TICKET — Ghc " + overlayEvent.price}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fafaf8", minHeight: "100%", paddingBottom: "100px" }}>
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "75%", maxWidth: "280px", height: "100%", background: "#fff", zIndex: 101, padding: "60px 24px 40px", display: "flex", flexDirection: "column", boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f5a623", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "12px" }}>👤</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{currentUser?.name || "User"}</div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "32px" }}>{currentUser?.email}</div>
            {[["🏠", "Home"], ["🎟️", "My Tickets"], ["🔔", "Alerts"], ["⚙️", "Settings"]].map(([icon, label]) => (
              <div key={label} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>{label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} style={{ ...btnStyle, background: "#e74c3c" }}>LOG OUT</button>
          </div>
        </>
      )}

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#111" }}>Discover Events</div>
            <div style={{ fontSize: "12px", color: "#888" }}>Ghana · {filtered.length} events</div>
          </div>
          <div onClick={() => setMenuOpen(true)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f5a623", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer" }}>
            <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
            <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
            <div style={{ width: "16px", height: "2px", background: "#fff", borderRadius: "2px" }} />
          </div>
        </div>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search events, venues, categories..."
            style={{ width: "100%", padding: "14px 44px 14px 18px", border: "2px solid #f5a62333", borderRadius: "50px", fontSize: "14px", outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "sans-serif" }} />
          {searchQ
            ? <div onClick={() => setSearchQ("")} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontSize: "20px" }}>✕</div>
            : <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#ccc", fontSize: "16px" }}>🔍</div>
          }
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>No events found</div>
            <div style={{ fontSize: "13px", marginTop: "6px" }}>Try a different search</div>
          </div>
        )}
        {filtered.map(ev => (
          <div key={ev.id} onClick={() => setOverlayEvent(ev)} style={{ background: "#fff", borderRadius: "20px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", cursor: "pointer" }}>
            <div style={{ height: "160px", position: "relative" }}>
              <img src={ev.image} alt={ev.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75))" }} />
              <div style={{ position: "absolute", top: "12px", right: "12px", background: "#f5a623", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>{ev.category}</div>
              <div style={{ position: "absolute", bottom: "14px", left: "14px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px", marginBottom: "2px" }}>{ev.name}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>📍 {ev.venue} · {ev.date}</div>
              </div>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#f5a623", fontWeight: 800, fontSize: "16px" }}>{ev.price === 0 ? "FREE" : "Ghc " + ev.price}</span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>{ev.totalTickets - ev.ticketsSold} tickets left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}