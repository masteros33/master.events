import React from "react";
import { motion } from "framer-motion";
import { Warning, Ticket } from "@phosphor-icons/react";
import { looksLikeStaleBuild, recoverFromStaleBuild } from "../utils/staleBuild";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, recovering: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, recovering: looksLikeStaleBuild(error) };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production you'd send this to Sentry / LogRocket
    console.error("[ErrorBoundary caught]", error, errorInfo);

    // Most crashes users actually see are a deploy landing under an open tab,
    // not a bug in the screen. Those we fix without asking: clear the old
    // build's caches and reload. If recovery has already been tried in this
    // tab it returns false and the error screen stands.
    if (looksLikeStaleBuild(error)) {
      recoverFromStaleBuild().then(started => {
        if (!started) this.setState({ recovering: false });
      });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    // A reload is already in flight — don't flash an error at someone whose
    // page is about to replace itself.
    if (this.state.recovering) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#080810",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }} />
      );
    }

    const reload = () => {
      this.setState({ hasError: false, error: null, errorInfo: null });
      // Always tear the caches down first. If a bad build is what put the user
      // here, a plain reload just serves it back to them.
      // force: the user asked for this one, so the once-per-tab guard that
      // stops automatic reload loops shouldn't stand in their way.
      recoverFromStaleBuild({ force: true }).then(started => {
        if (!started) window.location.reload();
      });
    };

    return (
      <div style={{
        minHeight: "100vh",
        background: "#080810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            maxWidth: "460px",
            width: "100%",
            textAlign: "center",
          }}>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            style={{
              width: "72px", height: "72px",
              borderRadius: "20px",
              background: "rgba(220,38,38,0.12)",
              border: "1.5px solid rgba(220,38,38,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
            <Warning size={32} weight="light" color="#dc2626" />
          </motion.div>

          <h1 style={{
            fontSize: "22px", fontWeight: 800,
            color: "#fff", letterSpacing: "-0.5px",
            marginBottom: "10px",
          }}>
            Something went wrong
          </h1>

          <p style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
            marginBottom: "28px",
            maxWidth: "340px",
            margin: "0 auto 28px",
          }}>
            Master Events hit an unexpected error. Your tickets and account are safe — this is a display issue only.
          </p>

          {/* Error detail — dev only */}
          {import.meta.env.DEV && this.state.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "24px",
                textAlign: "left",
              }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444", letterSpacing: "1px", marginBottom: "8px" }}>
                DEV ERROR
              </div>
              <pre style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.5)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                lineHeight: 1.6,
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack?.slice(0, 400)}
              </pre>
            </motion.div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={reload}
              style={{
                padding: "13px 28px",
                background: "linear-gradient(135deg, #f5a623, #e8920f)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(245,166,35,0.4)",
                fontFamily: "inherit",
              }}>
              Reload App
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = "/"}
              style={{
                padding: "13px 28px",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}>
              Go Home
            </motion.button>
          </div>

          {/* Brand */}
          <div style={{
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: 0.4,
          }}>
            <Ticket size={14} weight="light" color="#fff" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>Master Events</span>
          </div>
        </motion.div>
      </div>
    );
  }
}