import React from "react";
import { Link } from "react-router-dom";

function IconEmblem({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v8M8 12h8" />
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

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] flex flex-col items-center justify-center p-6 text-center transition-colors"
    >
      {/* Emblem */}
      <div className="w-14 h-14 rounded-full border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-[#0D5C4E] dark:text-[#15806C] flex items-center justify-center mb-6">
        <IconEmblem className="w-7 h-7" />
      </div>

      <span className="px-3 py-1 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-[#4A5852] dark:text-[#8D9E97] text-[11px] font-mono uppercase font-bold tracking-wider mb-3">
        Status 404 · Record Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4] mb-3">
        Clinical Record Not Found
      </h1>

      <p className="text-xs sm:text-sm text-[#4A5852] dark:text-[#8D9E97] max-w-md mx-auto mb-8 leading-relaxed">
        The requested patient intake URL or consultation record does not exist or has been completed and transferred to the central OPD registry.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
        <Link
          to="/"
          className="w-full sm:w-auto px-5 min-h-[44px] bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs sm:text-sm rounded transition-colors inline-flex items-center justify-center gap-2"
        >
          <span>Return to OPD Kiosk</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/doctor"
          className="w-full sm:w-auto px-5 min-h-[44px] bg-white dark:bg-[#15201C] hover:bg-[#FAFBF9] text-[#121C18] dark:text-[#F2F6F4] border border-[#D3DDD8] dark:border-[#24352F] font-semibold text-xs sm:text-sm rounded transition-colors inline-flex items-center justify-center gap-2"
        >
          <span>Doctor OPD Console</span>
        </Link>
      </div>

      <div className="mt-14 pt-6 border-t border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#4A5852] dark:text-[#8D9E97] space-y-1">
        <p className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">National Ayush Mission · Ministry of Ayush</p>
        <p>
          Technical Desk:{" "}
          <a
            href="mailto:support.opd@ayush.gov.in"
            className="text-[#0D5C4E] dark:text-[#15806C] hover:underline font-semibold"
          >
            support.opd@ayush.gov.in
          </a>{" "}
          · Toll-Free Helpline:{" "}
          <a href="tel:1800112233" className="text-[#0D5C4E] dark:text-[#15806C] font-semibold hover:underline">
            1800-11-2233
          </a>
        </p>
      </div>
    </main>
  );
}
