import React from "react";
import { t } from "../i18n.js";

export default function RedFlagAlert({ lang }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#B91C1C] text-white p-8 text-center"
    >
      <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center mb-6" aria-hidden="true">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold font-display mb-4 tracking-tight">{t(lang, "redFlagTitle")}</h1>
      <p className="text-lg max-w-md mb-2 font-medium">{t(lang, "redFlagBody")}</p>
      <p className="text-sm text-white/80 max-w-sm">{t(lang, "redFlagSub")}</p>
    </div>
  );
}
