import React, { useState, useEffect, useRef } from "react";
import { t } from "../i18n.js";
import { api } from "../api.js";
import CopyButton from "../components/CopyButton.jsx";

function speakAlert(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function IconCheck({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconPrinter({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function IconShield({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function IconLock({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconBell({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function Sent({ lang, sessionId, token, consultingDoctor }) {
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const currentDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // Live Waiting Status & Consent State (Requirement 4)
  const [status, setStatus] = useState("waiting"); // "waiting" | "called" | "in_consultation" | "completed"
  const [demonstrationActive, setDemonstrationActive] = useState(true);
  const [docInfo, setDocInfo] = useState(consultingDoctor || null);
  const docInfoRef = useRef(consultingDoctor || null);
  const [togglingConsent, setTogglingConsent] = useState(false);
  const [consentMessage, setConsentMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const announcedRef = useRef(false);
  const pollingRef = useRef(false);

  // Poll session status every 2 seconds
  useEffect(() => {
    let active = true;

    const pollStatus = async () => {
      if (!sessionId || pollingRef.current) return;
      pollingRef.current = true;
      try {
        const res = await api.getSessionStatus(sessionId);
        if (active && res) {
          setStatusMessage("");
          if (res.status) {
            setStatus(res.status);
            // Announce doctor call once when status changes to called
            if (res.status === "called" && !announcedRef.current) {
              announcedRef.current = true;
              const cabin = res.consulting_doctor?.cabin || docInfoRef.current?.cabin || "Cabin 101";
              const alertMsg =
                lang === "hi"
                  ? `डॉक्टर आपके लिए तैयार हैं! कृपया ${cabin} में पधारें।`
                  : `Doctor is ready for you! Please proceed to ${cabin}.`;
              speakAlert(alertMsg, lang);
            }
          }
          if (typeof res.demonstration_active === "boolean") {
            setDemonstrationActive(res.demonstration_active);
          }
          if (res.consulting_doctor) {
            docInfoRef.current = res.consulting_doctor;
            setDocInfo(res.consulting_doctor);
          }
        }
      } catch {
        if (active) {
          setStatusMessage(
            lang === "hi"
              ? "लाइव स्थिति अपडेट नहीं हो रही है। हम फिर से प्रयास कर रहे हैं।"
              : "Live status updates are unavailable right now. We’ll keep trying."
          );
        }
      } finally {
        pollingRef.current = false;
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sessionId, lang]);

  // Handle instant Stop/Resume Demonstration
  const handleToggleDemonstration = async () => {
    setTogglingConsent(true);
    const nextState = !demonstrationActive;
    try {
      const res = await api.toggleDemonstration(sessionId, nextState);
      if (res && typeof res.demonstration_active === "boolean") {
        setDemonstrationActive(res.demonstration_active);
        setConsentMessage(res.message);
      } else {
        setDemonstrationActive(nextState);
      }
    } catch (err) {
      setConsentMessage(
        `Could not update records access: ${err.message}. Your current setting has not changed.`
      );
    } finally {
      setTogglingConsent(false);
      setTimeout(() => setConsentMessage(""), 5000);
    }
  };

  const isCalled = status === "called";
  const cabinName = docInfo?.cabin || "Cabin 101";
  const doctorName = docInfo?.full_name || docInfo?.name || "Consulting Physician";

  return (
    <main
      id="main-content"
      className="kiosk-screen flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] flex flex-col items-center justify-center px-4 sm:px-6 py-8 transition-colors"
    >
      <div className="max-w-xl w-full text-center space-y-6">
        
        {/* LIVE STATUS BANNER */}
        {isCalled ? (
          <div className="p-5 rounded-xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 animate-in fade-in zoom-in-95 duration-200 shadow-lg text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <IconBell className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  DOCTOR CALL ACTIVE · PROCEED IMMEDIATELY
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-100">
                  Doctor is ready for you!
                </h2>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white dark:bg-[#15201C] border border-emerald-300 dark:border-emerald-700 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Please enter consultation room:</p>
                <p className="text-2xl font-black font-mono text-emerald-800 dark:text-emerald-300">
                  {cabinName}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  Attending: {doctorName}
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-700 text-white font-bold text-xs">
                Cabin Open Now →
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/30 flex items-center gap-3 text-left">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block uppercase tracking-wider">
                Waiting for Doctor's Call
              </span>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                Your consultation request has been queued at {doctorName}'s workstation ({cabinName}). Please wait for your token to be called.
              </p>
            </div>
          </div>
        )}

        {statusMessage && (
          <p role="status" className="text-xs text-[#7A4A00] dark:text-amber-200">
            {statusMessage}
          </p>
        )}

        {/* CRITICAL PRIVACY FEATURE: STOP DEMONSTRATION CONTROL (Requirement 4) */}
        <div className="rounded-xl border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] p-5 sm:p-6 text-left space-y-3.5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D3DDD8] dark:border-[#24352F] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#0D5C4E] dark:text-[#15806C]">
                <IconShield className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#121C18] dark:text-[#F2F6F4]">
                  Live records access control
                </h3>
                <p className="text-[11px] text-[#4A5852] dark:text-[#8D9E97]">
                  You have full autonomy over your personal health records.
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                demonstrationActive
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 animate-pulse"
              }`}
            >
              {demonstrationActive ? "● Access Active" : "■ Access Revoked"}
            </span>
          </div>

          {demonstrationActive ? (
            <div className="space-y-3">
              <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] leading-relaxed">
                The doctor is currently permitted to view your uploaded MRI scans, X-rays, blood sugar logs, and past 9-stage intake history on their OPD screen.
              </p>

              <button
                type="button"
                onClick={handleToggleDemonstration}
                disabled={togglingConsent}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <IconLock className="w-4 h-4" />
                <span>
                  {togglingConsent
                    ? "Locking Doctor's Screen..."
                    : "🛑 Stop Demonstration (Revoke Doctor's Access Now)"}
                </span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-xs uppercase tracking-wider">
                <IconLock className="w-4 h-4 text-rose-600" />
                <span>DEMONSTRATION STOPPED: Doctor Screen is Locked</span>
              </div>
              <p className="text-xs text-rose-900/90 dark:text-rose-200/90 leading-relaxed">
                You have revoked permission. The doctor's diagnostic records terminal is currently shielded and cannot view any of your scans, reports, or history.
              </p>

              <button
                type="button"
                onClick={handleToggleDemonstration}
                disabled={togglingConsent}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <IconCheck className="w-4 h-4" />
                <span>
                  {togglingConsent
                    ? "Unlocking Screen..."
                    : "🔓 Resume Demonstration (Restore Doctor's Access)"}
                </span>
              </button>
            </div>
          )}

          {consentMessage && (
            <div className="text-[11px] font-semibold text-center text-[#0D5C4E] dark:text-[#8BE3D2] pt-1">
              {consentMessage}
            </div>
          )}
        </div>

        {/* Official Printable OPD Slip Card */}
        <div className="rounded-xl border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] p-6 text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#D3DDD8] dark:border-[#24352F]">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#0D5C4E] dark:text-[#15806C] tracking-wider uppercase block">
                Hospital OPD Case Slip
              </span>
              <span className="text-[11px] text-[#4A5852] dark:text-[#8D9E97]">
                {currentDate} · {currentTime}
              </span>
            </div>
            {token && (
              <div className="print:hidden">
                <CopyButton text={token} label="Copy Token" successLabel="Copied" />
              </div>
            )}
          </div>

          {token && (
            <div className="text-center py-4 rounded-lg border border-[#0D5C4E] bg-[#FAFBF9] dark:bg-[#0E1513]">
              <p className="text-xs font-semibold text-[#4A5852] dark:text-[#8D9E97] uppercase tracking-wider mb-1">
                {t(lang, "yourToken")}
              </p>
              <p className="text-4xl font-black tracking-tight text-[#0D5C4E] dark:text-[#8BE3D2] font-mono">
                {token}
              </p>
              {docInfo && (
                <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-1 font-semibold">
                  Assigned: {docInfo.full_name || docInfo.name} ({cabinName})
                </p>
              )}
            </div>
          )}

          {sessionId && (
            <div className="flex items-center justify-between text-xs text-[#4A5852] dark:text-[#8D9E97] border-t border-[#D3DDD8] dark:border-[#24352F] pt-2.5">
              <span>Session Identifier:</span>
              <span className="font-mono text-[11px]">{sessionId.slice(0, 14)}...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:bg-[#FAFBF9] text-[#121C18] dark:text-[#F2F6F4] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <IconPrinter className="w-4 h-4" />
            <span>{lang === "hi" ? "ओपीडी टोकन पर्ची प्रिंट करें" : "Print OPD Token Slip"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>
              {lang === "hi"
                ? "अगला मरीज पंजीकरण (Next Patient)"
                : "Register Next Patient"}
            </span>
            <span>→</span>
          </button>
        </div>

      </div>
    </main>
  );
}
