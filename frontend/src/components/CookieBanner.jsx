import React, { useEffect, useState } from "react";

export default function CookieBanner({ lang = "en" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("medikiosk_cookie_consent");
      if (!consent) {
        setShow(true);
      }
    } catch {
      setShow(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("medikiosk_cookie_consent", "accepted");
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and data privacy notice"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-xl z-50 p-4 sm:p-5 rounded-lg bg-white dark:bg-[#15201C] border border-[#D3DDD8] dark:border-[#24352F] shadow-lg text-[#121C18] dark:text-[#F2F6F4] transition-colors print:hidden"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] text-[#0D5C4E] dark:text-[#15806C] shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xs sm:text-sm font-bold text-[#121C18] dark:text-[#F2F6F4]">
            {lang === "hi" ? "स्थानीय डेटा और गोपनीयता सूचना" : "Local data & privacy notice"}
          </h2>
          <p className="mt-1 text-xs text-[#4A5852] dark:text-[#8D9E97] leading-relaxed">
            {lang === "hi"
              ? "यह प्रोटोटाइप इस डिवाइस के ब्राउज़र में आपकी साइन-इन प्रोफ़ाइल (जिसमें ABHA आईडी हो सकती है), थीम और इस सूचना की स्थिति सहेजता है। यह सुरक्षित क्लिनिकल सत्र या प्रमाणित DPDP/ABDM प्रणाली नहीं है। वास्तविक मरीज का डेटा दर्ज न करें।"
              : "This prototype stores your sign-in profile (which may include an ABHA ID), theme choice, and this notice preference in browser storage. It is not a secure clinical session or a certified DPDP/ABDM system. Do not enter real patient data."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="min-h-[44px] px-4 rounded-md text-xs font-semibold text-white bg-[#0D5C4E] hover:bg-[#09453A] transition-colors"
            >
              {lang === "hi" ? "समझ गया" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
