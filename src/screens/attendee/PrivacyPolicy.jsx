import React from "react";
import useStore from "../../store/useStore";
import { ArrowLeft, Mail } from "lucide-react";

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
    <div className="bg-brand-canvas min-h-full pb-14 font-sans">

      {/* Header */}
      <div className={`sticky top-0 z-20 bg-white border-b border-gray-100 h-15 flex items-center justify-between ${desktop ? "px-10" : "px-4"}`}>
        <button onClick={() => setScreen("settings")}
          className="flex items-center gap-1.5 text-brand-muted text-sm font-medium hover:text-brand-text transition-colors">
          <ArrowLeft size={15} strokeWidth={2} /> Back
        </button>
        <div className="font-extrabold text-base text-brand-text tracking-tight">Privacy Policy</div>
        <div className="w-14" />
      </div>

      <div className={`mx-auto ${desktop ? "max-w-[720px] px-10 py-8" : "px-4 py-5"}`}>

        {/* Hero */}
        <div className="mb-8">
          <div className="text-[11px] font-bold text-brand-muted tracking-widest font-mono mb-2">
            LAST UPDATED: JUNE 2026
          </div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-[15px] text-brand-text leading-relaxed">
            Master Events Ghana is committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how we use it.
          </p>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-2.5">
            <div className="text-sm font-bold text-brand-text mb-2.5 tracking-tight">
              {s.title}
            </div>
            <div className="text-[13px] text-brand-text leading-relaxed">
              {s.body}
            </div>
          </div>
        ))}

        {/* Contact card */}
        <div className="mt-6 bg-pastel-orange rounded-2xl p-5 text-center">
          <div className="text-[13px] text-brand-text mb-1.5">Questions about your privacy?</div>
          <a href="mailto:mastereventgh@gmail.com"
            className="inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-orange">
            <Mail size={15} strokeWidth={1.75} /> mastereventgh@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
