import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../../store/useStore";
import { ticketsAPI } from "../../api";
import { Html5Qrcode } from "html5-qrcode";
import {
  DoorOpen, Scan, Keyboard, CheckCircle, XCircle,
  Warning, Link, User, Ticket, ArrowLeft,
  SignOut, Camera, CircleNotch, ShieldCheck, Prohibit, ArrowSquareOut,
} from "@phosphor-icons/react";

const inputClass = "w-full px-4 py-3.5 bg-brand-canvas border border-brand-hairline focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 rounded-xl text-brand-text text-sm font-mono outline-none transition-colors";

const RESULT_META = {
  valid:       { badgeBg: "bg-emerald-50",  text: "text-emerald-700", Icon: CheckCircle, label: "VALID" },
  redeemed:    { badgeBg: "bg-red-50",        text: "text-red-600",       Icon: Prohibit,          label: "ALREADY USED" },
  wrong_event: { badgeBg: "bg-[var(--brand-light)]", text: "text-brand-accent",  Icon: Warning, label: "WRONG EVENT" },
  invalid:     { badgeBg: "bg-red-50",        text: "text-red-600",       Icon: XCircle,       label: "INVALID" },
  error:       { badgeBg: "bg-red-50",        text: "text-red-600",       Icon: XCircle,       label: "ERROR" },
};

// ── Panel shell — matches OrganizerScreens.jsx Panel ───────────
function Panel({ children, className = "" }) {
  return <div className={`bg-brand-card border border-brand-hairline rounded-2xl ${className}`}>{children}</div>;
}

// ── Stat tile — matches OrganizerHome's stat-tile pattern ──────
function StatTile({ label, value, color = "text-brand-text", sub }) {
  return (
    <div className="flex-1 bg-brand-card border border-brand-hairline rounded-2xl px-3.5 py-3 min-w-[90px]">
      <div className="text-xs font-semibold text-brand-muted tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-semibold tracking-tight tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-xs text-brand-muted mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Blockchain verification chip — same pattern as TicketView's ChainStrip ──
function ChainStrip({ txHash, tokenId }) {
  const url = txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;
  return (
    <div className="flex items-center justify-between gap-2.5 bg-blue-50 rounded-xl px-4 py-3 mt-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
          <Link size={15} weight="light" className="text-blue-700" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-blue-700">Verified on Polygon</div>
          <div className="font-mono text-xs text-brand-muted mt-0.5 truncate">
            {tokenId ? `NFT #${tokenId}` : "On-chain record"}
          </div>
        </div>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-brand-card px-3 py-1.5 rounded-full whitespace-nowrap shrink-0">
          Verify <ArrowSquareOut size={11} weight="light" />
        </a>
      )}
    </div>
  );
}

// ── QR Scanner ────────────────────────────────────────────────
function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [camError, setCamError] = useState(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const id = "qr-" + Math.random().toString(36).substr(2, 5);
    if (scannerRef.current) scannerRef.current.id = id;
    const scanner = new Html5Qrcode(id);
    html5QrRef.current = scanner;
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (text) => { onScanRef.current(text); },
      () => {}
    ).catch(() => setCamError(true));
    return () => {
      if (html5QrRef.current?.isScanning) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (camError) return (
    <Panel className="py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-3.5">
        <Camera size={24} weight="light" className="text-brand-accent" />
      </div>
      <div className="text-brand-text text-sm font-semibold mb-1.5">Camera unavailable</div>
      <div className="text-brand-muted text-xs">Switch to Manual entry below</div>
    </Panel>
  );

  return (
    <div className="rounded-2xl overflow-hidden relative bg-black border border-brand-hairline">
      <div ref={scannerRef} className="w-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 pointer-events-none">
        <div className="absolute inset-0" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }} />
        <span className="absolute w-7 h-7 top-0 left-0 border-t-[3px] border-l-[3px] border-brand-accent rounded-tl" />
        <span className="absolute w-7 h-7 top-0 right-0 border-t-[3px] border-r-[3px] border-brand-accent rounded-tr" />
        <span className="absolute w-7 h-7 bottom-0 left-0 border-b-[3px] border-l-[3px] border-brand-accent rounded-bl" />
        <span className="absolute w-7 h-7 bottom-0 right-0 border-b-[3px] border-r-[3px] border-brand-accent rounded-br" />
      </div>
    </div>
  );
}

// ── Mode toggle ───────────────────────────────────────────────
function TabToggle({ cameraMode, setCameraMode }) {
  return (
    <div className="flex gap-1.5 mb-4 bg-brand-card border border-brand-hairline rounded-2xl p-1">
      {[[Camera, "Camera", true], [Keyboard, "Manual", false]].map(([Icon, label, mode]) => (
        <button key={label} onClick={() => setCameraMode(mode)}
          className={`flex-1 py-2.5 rounded-xl font-medium text-[13px] flex items-center justify-center gap-1.5 transition-colors ${cameraMode === mode ? "bg-brand-accent text-white" : "bg-transparent text-brand-muted"}`}>
          <Icon size={14} weight="light" /> {label}
        </button>
      ))}
    </div>
  );
}

// ── Scan result card — Panel + pastel badge system, with chain verification ──
function ResultCard({ result }) {
  if (!result) return null;
  const meta = RESULT_META[result.status] || RESULT_META.invalid;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Panel className="px-5 py-6 mb-4 text-center">
        <div className={`w-14 h-14 rounded-2xl ${meta.badgeBg} flex items-center justify-center mx-auto mb-3.5`}>
          <meta.Icon size={26} weight="light" className={meta.text} />
        </div>

        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2.5 ${meta.badgeBg} ${meta.text}`}>
          {meta.label}
        </span>

        <div className={`font-semibold text-xl mb-2 tracking-tight ${meta.text}`}>{result.title}</div>

        {result.holder && (
          <div className="text-brand-text text-sm font-semibold mb-1 flex items-center justify-center gap-1.5">
            <User size={14} weight="light" /> {result.holder}
          </div>
        )}

        {result.event_name && (
          <div className="text-brand-muted text-xs mb-2.5 flex items-center justify-center gap-1.5">
            <Ticket size={12} weight="light" /> {result.event_name}
          </div>
        )}

        <div className="text-brand-muted text-[13px] leading-relaxed">{result.msg}</div>

        {result.status === "valid" && (result.tx_hash || result.token_id) && (
          <ChainStrip txHash={result.tx_hash} tokenId={result.token_id} />
        )}
      </Panel>
    </motion.div>
  );
}

// ── Door Staff Login ──────────────────────────────────────────
export function DoorStaffLogin() {
  const setScreen            = useStore(s => s.setScreen);
  const handleDoorStaffLogin = useStore(s => s.handleDoorStaffLogin);
  const doorCode             = useStore(s => s.doorCode);
  const setDoorCode          = useStore(s => s.setDoorCode);
  const doorCodeError        = useStore(s => s.doorCodeError);

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col items-center justify-center px-6 py-10 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="w-full max-w-[400px]">

        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center mx-auto mb-4">
            <DoorOpen size={30} weight="light" color="#fff" />
          </div>
          <div className="text-xs font-medium text-brand-accent tracking-widest mb-2">
            MASTER EVENTS · DOOR STAFF
          </div>
          <h1 className="text-2xl font-semibold text-brand-text tracking-tight mb-2">Door Staff Access</h1>
          <p className="text-sm text-brand-muted leading-relaxed max-w-[300px] mx-auto">
            Enter the invite code from your organizer to start scanning tickets
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 w-fit mx-auto mb-6">
          <Link size={13} weight="light" className="text-blue-700" />
          <span className="text-xs font-semibold text-blue-700">Real-time Polygon blockchain verification</span>
        </div>

        <Panel className="p-7">
          <div className="text-xs font-medium text-brand-muted tracking-wide mb-2.5 text-center">
            ENTER YOUR DOOR CODE
          </div>
          <input
            value={doorCode}
            onChange={e => setDoorCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleDoorStaffLogin()}
            placeholder="DOOR-XXXXXX"
            className={`w-full py-4 px-5 mb-3 rounded-2xl text-center font-mono font-semibold text-xl tracking-[4px] text-brand-text bg-brand-canvas outline-none border-2 transition-colors ${doorCodeError ? "border-red-300" : "border-brand-accent focus:ring-2 focus:ring-brand-accent/20"}`}
          />
          <AnimatePresence>
            {doorCodeError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3.5 text-red-600 text-xs font-semibold">
                <Warning size={14} weight="light" /> {doorCodeError}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleDoorStaffLogin}
            className="w-full h-12 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-colors">
            <DoorOpen size={18} weight="light" /> Enter Event
          </button>
        </Panel>

        <div className="text-center mt-5">
          <span onClick={() => setScreen("login")}
            className="text-xs text-brand-muted cursor-pointer hover:text-brand-accent transition-colors">
            Attendee? Log in here →
          </span>
        </div>
      </motion.div>
    </div>
  );
}
// ── Door Staff Scan — fintech rebuild, width-constrained ───────
export function DoorStaffScan() {
  const handleLogout  = useStore(s => s.handleLogout);
  const doorStaffUser = useStore(s => s.doorStaffUser);
  const setScreen     = useStore(s => s.setScreen);
  const [scanInput,    setScanInput]    = useState("");
  const [result,       setResult]       = useState(null);
  const [verifying,    setVerifying]    = useState(false);
  const [admittedList, setAdmittedList] = useState([]);
  const [deniedCount,  setDeniedCount]  = useState(0);
  const [cameraMode,   setCameraMode]   = useState(true);
  const lastScan = useRef(null);

  const processId = async (id) => {
    if (!id?.trim() || verifying) return;
    const trimmed = id.trim();
    if (trimmed === lastScan.current) return;
    lastScan.current = trimmed;
    setTimeout(() => { lastScan.current = null; }, 3000);
    setVerifying(true); setResult(null);
    try {
      const data = await ticketsAPI.verify({ qr_data: trimmed });
      const res  = buildResult(data, trimmed);
      setResult(res);
      if (res.status === "valid") {
        setAdmittedList(prev => [{
          id: trimmed,
          ticketId: res.ticket_id || trimmed,
          holder: res.holder || "Guest",
          event: res.event_name || doorStaffUser?.eventName || "Event",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          tokenId: res.token_id,
        }, ...prev.slice(0, 29)]);
      } else {
        setDeniedCount(c => c + 1);
      }
    } catch {
      setResult({ status: "error", title: "Verification Failed", msg: "Could not verify. Check your connection.", holder: null });
      setDeniedCount(c => c + 1);
    }
    setVerifying(false); setScanInput("");
  };

  return (
    <div className="bg-brand-canvas min-h-screen pb-8 font-sans">

      {/* Header — full width */}
      <div className="bg-brand-card px-4.5 py-3.5 flex justify-between items-center border-b border-brand-hairline sticky top-0 z-10">
        <div className="max-w-[560px] mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center shrink-0">
              <Scan size={17} weight="light" color="#fff" />
            </div>
            <div className="min-w-0">
              <div className="text-brand-text font-medium text-[15px] tracking-tight truncate">Door Scanner</div>
              <div className="text-brand-muted text-xs truncate">
                {doorStaffUser?.eventName || "Event"}
              </div>
            </div>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 ml-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-xs font-medium text-blue-700">LIVE</span>
            </span>
          </div>
          <button onClick={() => { setScreen("home"); handleLogout(); }}
            className="flex items-center gap-1.5 h-8 px-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium shrink-0">
            <SignOut size={13} weight="light" /> Exit
          </button>
        </div>
      </div>

      {/* Content — constrained + centered */}
      <div className="max-w-[560px] mx-auto p-4">

        {/* ── Stat strip ── */}
        <div className="flex gap-2.5 mb-4">
          <StatTile label="ADMITTED" value={admittedList.length} color="text-emerald-700" sub="this session" />
          <StatTile label="DENIED" value={deniedCount} color={deniedCount > 0 ? "text-red-600" : "text-brand-muted"} sub="this session" />
          <StatTile label="STATUS" value="Live" color="text-blue-700" sub="scanning active" />
        </div>

        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />

        {/* Camera mode */}
        {cameraMode ? (
          <div className="mb-4">
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-brand-accent mt-3.5 text-sm font-medium">
                  <CircleNotch size={16} className="animate-spin" />
                  Verifying on blockchain...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Manual */
          <Panel className="p-4 mb-4">
            <div className="text-xs font-medium text-brand-muted tracking-wide mb-2.5">MANUAL ENTRY</div>
            <input
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Paste ticket ID or QR data"
              className={`${inputClass} mb-2.5`}
            />
            <button onClick={() => processId(scanInput)} disabled={verifying}
              className="w-full py-3.5 bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-70 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
              {verifying
                ? <><CircleNotch size={15} className="animate-spin" /> Verifying...</>
                : <><ShieldCheck size={15} weight="light" /> Verify Ticket</>
              }
            </button>
          </Panel>
        )}

        {/* Result */}
        <ResultCard result={result} />

        {/* Admitted list — ledger treatment */}
        {admittedList.length > 0 && (
          <Panel className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-brand-text font-medium text-sm flex items-center gap-2">
                <CheckCircle size={16} weight="light" className="text-emerald-700" /> Admitted This Session
              </div>
              <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full tabular-nums">
                {admittedList.length}
              </span>
            </div>
            <div className="flex flex-col">
              {admittedList.slice(0, 10).map((a, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-brand-hairline last:border-b-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-brand-text text-[13px] font-medium truncate">{a.holder}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-brand-muted text-xs truncate">
                          {String(a.ticketId).slice(0, 14)}…
                        </span>
                        {a.tokenId && (
                          <span className="font-mono text-xs font-medium text-brand-text">NFT #{a.tokenId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-brand-muted text-xs shrink-0 ml-2 tabular-nums">{a.time}</span>
                </div>
              ))}
            </div>
            {admittedList.length > 10 && (
              <div className="text-brand-muted text-xs text-center mt-2.5 tabular-nums">
                +{admittedList.length - 10} more this session
              </div>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

// ── Organizer Scan — width-constrained ──────────────────────────
export function OrganizerScan() {
  const setScreen = useStore(s => s.setScreen);
  const [scanInput,  setScanInput]  = useState("");
  const [result,     setResult]     = useState(null);
  const [verifying,  setVerifying]  = useState(false);
  const [cameraMode, setCameraMode] = useState(true);
  const lastScan = useRef(null);

  const processId = async (id) => {
    if (!id?.trim() || verifying) return;
    const trimmed = id.trim();
    if (trimmed === lastScan.current) return;
    lastScan.current = trimmed;
    setTimeout(() => { lastScan.current = null; }, 3000);
    setVerifying(true); setResult(null);
    try {
      const data = await ticketsAPI.verify({ qr_data: trimmed });
      setResult(buildResult(data, trimmed));
    } catch {
      setResult({ status: "error", title: "Verification Failed", msg: "Could not connect to server.", holder: null });
    }
    setVerifying(false); setScanInput("");
  };

  return (
    <div className="bg-brand-canvas min-h-full pb-10 font-sans">
      {/* Header — full width */}
      <div className="bg-brand-card border-b border-brand-hairline sticky top-0 z-10">
        <div className="max-w-[560px] mx-auto flex items-center px-5 py-4 gap-3.5">
          <button onClick={() => setScreen("orgEventDetail")}
            className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-hairline flex items-center justify-center shrink-0">
            <ArrowLeft size={17} weight="light" className="text-brand-text" />
          </button>
          <div>
            <div className="text-[17px] font-semibold text-brand-text tracking-tight">Scan Tickets</div>
            <div className="text-xs text-brand-muted mt-0.5 flex items-center gap-1.5">
              <Link size={11} weight="light" className="text-blue-700" />
              <span className="text-blue-700">Real-time blockchain verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content — constrained + centered */}
      <div className="max-w-[560px] mx-auto p-4">
        <TabToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />

        {cameraMode ? (
          <div className="mb-4">
            <QRScanner onScan={processId} />
            <AnimatePresence>
              {verifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-blue-700 mt-3.5 text-[13px] font-medium">
                  <CircleNotch size={15} className="animate-spin" />
                  Verifying on Polygon...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Panel className="p-4 mb-4">
            <input value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processId(scanInput)}
              placeholder="Enter ticket ID or paste QR data"
              className={`${inputClass} mb-2.5`} />
            <button onClick={() => processId(scanInput)} disabled={verifying}
              className="w-full py-3.5 bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-70 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
              {verifying
                ? <><CircleNotch size={15} className="animate-spin" /> Verifying...</>
                : <><ShieldCheck size={15} weight="light" /> Verify Ticket</>
              }
            </button>
          </Panel>
        )}

        <ResultCard result={result} />
      </div>
    </div>
  );
}
