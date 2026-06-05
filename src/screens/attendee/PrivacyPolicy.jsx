import React from "react";
import { motion } from "framer-motion";
import useStore from "../../store/useStore";

const isDesktop = () => window.innerWidth > 768;

export default function PrivacyPolicy() {
  const setScreen = useStore(s => s.setScreen);
  const desktop   = isDesktop();

  const sections = [
    {
      title: "1. Information We Collect",
      body: "We collect information you provide directly: your name, email address, and phone number when you register. When you purchase tickets, we collect payment references processed securely through Paystack. We do not store your card or MoMo details.",
    },
    {
      title: "2. How We Use Your Information",
      body: "We use your information to: create and manage your account, process ticket purchases and issue NFT tickets on the Polygon blockchain, send transactional emails (ticket confirmations, transfer notifications), and improve our platform.",
    },
    {
      title: "3. NFT Tickets & Blockchain",
      body: "When you purchase a ticket, an NFT is minted on the Polygon Amoy blockchain. Your ticket data (event name, seat, date) is stored on-chain and is publicly visible on the blockchain. Your personal details are never stored on-chain.",
    },
    {
      title: "4. Payment Processing",
      body: "All payments are processed by Paystack, a PCI-DSS compliant payment processor. Master Events does not store any payment card or mobile money account details. Paystack's privacy policy governs the handling of payment data.",
    },
    {
      title: "5. Cookies",
      body: "We use essential cookies to keep you logged in and remember your preferences. With your consent, we use analytics cookies to understand how the platform is used. You can manage cookie preferences at any time from Settings.",
    },
    {
      title: "6. Data Sharing",
      body: "We do not sell your personal data. We share data only with: Paystack (payment processing), Cloudinary (image storage), Resend (email delivery), and Polygon/Alchemy (blockchain infrastructure). All processors are bound by data protection agreements.",
    },
    {
      title: "7. Data Retention",
      body: "We retain your account data for as long as your account is active. Ticket records are kept for 7 years for financial compliance. You may request deletion of your account and personal data at any time from Settings > Delete Account.",
    },
    {
      title: "8. Your Rights",
      body: "You have the right to: access your personal data, correct inaccurate data, request deletion of your data, withdraw consent for analytics cookies, and export your data. Contact us at mastereventgh@gmail.com to exercise these rights.",
    },
    {
      title: "9. Security",
      body: "We use industry-standard security: HTTPS encryption, JWT authentication with 2-hour expiry, bcrypt password hashing, and row-level security on our database. Sensitive keys are never exposed client-side.",
    },
    {
      title: "10. Contact",
      body: "For privacy questions or data requests, contact us at mastereventgh@gmail.com. We are based in Accra, Ghana and respond within 5 business days.",
    },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", paddingBottom: "60px" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: desktop ? "0 40px" : "0 16px",
        height: "60px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => setScreen("settings")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-sans)", padding: 0 }}>
          ← Back
        </motion.button>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Privacy Policy</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: desktop ? "720px" : "100%", margin: "0 auto", padding: desktop ? "32px 40px 60px" : "20px 16px 60px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "2px", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
            LAST UPDATED: JUNE 2026
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: "12px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.75 }}>
            Master Events Ghana is committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how we use it.
          </p>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: "var(--bg-card)",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "10px",
              border: "1px solid var(--border)",
            }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", letterSpacing: "-0.2px" }}>
              {s.title}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.75 }}>
              {s.body}
            </div>
          </motion.div>
        ))}

        {/* Contact card */}
        <div style={{ marginTop: "24px", background: "linear-gradient(135deg, rgba(249,115,22,0.06), transparent)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>Questions about your privacy?</div>
          <a href="mailto:mastereventgh@gmail.com"
            style={{ fontSize: "15px", fontWeight: 700, color: "#F97316", textDecoration: "none" }}>
            mastereventgh@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}