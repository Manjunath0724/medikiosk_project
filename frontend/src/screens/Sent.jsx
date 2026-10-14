import React from "react";
import { t } from "../i18n.js";
import CopyButton from "../components/CopyButton.jsx";

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

function IconInfo({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

export default function Sent({ lang, sessionId, token }) {
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const currentDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <main
      id="main-content"
      className="flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] flex flex-col items-center justify-center px-4 sm:px-6 py-10 transition-colors"
    >
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Status Badge */}
        <div className="w-14 h-14 rounded-full border border-[#0D5C4E] bg-[#EAF3F0] dark:bg-[#1A2622] text-[#0D5C4E] dark:text-[#8BE3D2] flex items-center justify-center mx-auto">
          <IconCheck className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4]">
            {t(lang, "sentTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5852] dark:text-[#8D9E97] mt-1.5 leading-relaxed">
            {t(lang, "sentBody")}
          </p>
        </div>

        {/* Official Printable OPD Slip Card */}
        <div className="rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] p-6 text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#D3DDD8] dark:border-[#24352F]">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#0D5C4E] dark:text-[#15806C] tracking-wider uppercase block">
                National Ayush Mission · OPD Slip
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
            <div className="text-center py-4 rounded border border-[#0D5C4E] bg-[#FAFBF9] dark:bg-[#0E1513]">
              <p className="text-xs font-semibold text-[#4A5852] dark:text-[#8D9E97] uppercase tracking-wider mb-1">
                {t(lang, "yourToken")}
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-[#0D5C4E] dark:text-[#8BE3D2] font-mono">
                {token}
              </p>
            </div>
          )}

          {sessionId && (
            <div className="flex items-center justify-between text-xs text-[#4A5852] dark:text-[#8D9E97] border-t border-[#D3DDD8] dark:border-[#24352F] pt-2.5">
              <span>Session Identifier:</span>
              <span className="font-mono text-[11px]">{sessionId.slice(0, 12)}...</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#4A5852] dark:text-[#8D9E97] space-y-1.5">
            <p className="font-bold text-[#121C18] dark:text-[#F2F6F4] flex items-center gap-1.5">
              <IconInfo className="w-3.5 h-3.5 text-[#0D5C4E] dark:text-[#15806C]" />
              <span>{lang === "hi" ? "रोगी हेतु निर्देश:" : "Patient Instructions:"}</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>
                {lang === "hi"
                  ? "कृपया प्रतीक्षालय (Waiting Area) में बैठें।"
                  : "Please wait in the outpatient waiting area."}
              </li>
              <li>
                {lang === "hi"
                  ? "डिस्प्ले बोर्ड पर अपना टोकन नंबर दिखने पर संबंधित डॉक्टर कक्ष में प्रवेश करें।"
                  : "Proceed to consulting room when your token is called on the board."}
              </li>
              <li>
                {lang === "hi"
                  ? "आपकी केस हिस्ट्री डॉक्टर के वर्कस्टेशन पर प्रेषित हो चुकी है।"
                  : "Your case sheet is ready at the physician's OPD console."}
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:bg-[#FAFBF9] text-[#121C18] dark:text-[#F2F6F4] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <IconPrinter className="w-4 h-4" />
            <span>{lang === "hi" ? "ओपीडी टोकन पर्ची प्रिंट करें" : "Print OPD Token Slip"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>
              {lang === "hi"
                ? "अगला मरीज पंजीकरण (Next Patient)"
                : "Register Next Patient"}
            </span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </main>
  );
}
