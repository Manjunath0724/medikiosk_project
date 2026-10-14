import React, { useState } from "react";

export default function FloatingContact({ lang = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [attendantCalled, setAttendantCalled] = useState(false);

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackText("");
      setFeedbackSent(false);
      setIsOpen(false);
    }, 2000);
  };

  const handleCallAttendant = () => {
    setAttendantCalled(true);
    setTimeout(() => setAttendantCalled(false), 5000);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        id="floating-contact-btn"
        aria-label="Contact Kiosk Helpdesk & Emergency Assistance"
        title="Help & Emergency"
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-md bg-[#0D5C4E] hover:bg-[#09453A] text-white border border-[#15806C] flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#0D5C4E] print:hidden"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span className="text-xs font-semibold tracking-wide hidden sm:inline">
          {lang === "hi" ? "हेल्पडेस्क सहायता" : "OPD Helpdesk"}
        </span>
      </button>

      {/* Support Drawer / Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === "hi" ? "कियोस्क सहायता एवं आपातकालीन संपर्क" : "Kiosk Help & Emergency Desk"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === "hi" ? "24x7 निःशुल्क अस्पताल सहायता" : "24/7 Patient Kiosk Assistance"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Emergency Call Attendant Button */}
              <button
                type="button"
                onClick={handleCallAttendant}
                disabled={attendantCalled}
                className={`w-full py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  attendantCalled
                    ? "bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]"
                    : "bg-[#0D5C4E] hover:bg-[#09453A] text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>
                  {attendantCalled
                    ? lang === "hi"
                      ? "सहायक को बुलाया गया है (स्टेशन 04)"
                      : "Attendant notified (Kiosk Station #04)"
                    : lang === "hi"
                    ? "कियोस्क सहायक को बुलाएं"
                    : "Call Kiosk Station Attendant"}
                </span>
              </button>

              {/* Helplines Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    {lang === "hi" ? "राष्ट्रीय आयुष हेल्पलाइन:" : "National Ayush Toll-Free:"}
                  </span>
                  <a
                    href="tel:1800112233"
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    1800-11-2233
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    {lang === "hi" ? "अस्पताल हेल्पडेस्क:" : "OPD Hospital Helpdesk:"}
                  </span>
                  <a
                    href="mailto:support.opd@ayush.gov.in"
                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    support.opd@ayush.gov.in
                  </a>
                </div>
              </div>

              {/* Quick Feedback Form */}
              <form onSubmit={handleSendFeedback} className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === "hi" ? "त्वरित प्रतिक्रिया या समस्या भेजें" : "Quick Feedback or Issue Report"}
                </label>
                <textarea
                  rows="2"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={
                    lang === "hi"
                      ? "कियोस्क संचालन में किसी भी कठिनाई का विवरण दें..."
                      : "Describe any kiosk issue or feedback..."
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
                />
                {feedbackSent ? (
                  <div className="p-2 mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                    ✓ {lang === "hi" ? "प्रतिक्रिया भेजी गई! धन्यवाद।" : "Feedback submitted! Thank you."}
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="mt-2 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    {lang === "hi" ? "जमा करें" : "Send Report"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
