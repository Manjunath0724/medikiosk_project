import React, { useState } from "react";

export default function FaqSection({ isOpen, onClose, lang = "en" }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      qEn: "How does the MediKiosk clinical intake work?",
      qHi: "MediKiosk क्लिनिकल साक्षात्कार कैसे काम करता है?",
      aEn: "MediKiosk guides you through a nine-stage clinical history intake. You can select a doctor across specialties, choose which available records to share, and send a consultation request to the doctor workstation.",
      aHi: "MediKiosk नौ चरणों के नैदानिक इतिहास संकलन में आपका मार्गदर्शन करता है। आप विभिन्न विशेषज्ञताओं में डॉक्टर चुन सकते हैं, साझा करने योग्य रिकॉर्ड चुन सकते हैं और डॉक्टर वर्कस्टेशन पर परामर्श अनुरोध भेज सकते हैं।",
    },
    {
      qEn: "Is my personal and medical data safe under Indian regulations?",
      qHi: "क्या मेरा स्वास्थ्य डेटा भारतीय कानूनों के तहत सुरक्षित है?",
      aEn: "No. MediKiosk is a prototype and is not certified for DPDP or ABDM compliance. Its backend does not yet enforce authenticated, doctor-specific access to clinical records. Do not enter real patient data.",
      aHi: "नहीं। MediKiosk एक प्रोटोटाइप है और DPDP या ABDM अनुपालन के लिए प्रमाणित नहीं है। बैकएंड अभी क्लिनिकल रिकॉर्ड के लिए प्रमाणित लॉगिन और डॉक्टर-विशिष्ट पहुंच लागू नहीं करता। वास्तविक मरीज डेटा दर्ज न करें।",
    },
    {
      qEn: "Can I switch language between English and Hindi during the intake?",
      qHi: "क्या मैं साक्षात्कार के दौरान भाषा (अंग्रेजी / हिंदी) बदल सकता हूँ?",
      aEn: "Yes, you can toggle between English and Hindi at any time using the language selector in the top navigation bar without losing your answers.",
      aHi: "हाँ, आप बिना अपनी जानकारी खोए शीर्ष नेविगेशन बार में दिए गए भाषा बटन से कभी भी हिंदी या अंग्रेजी में बदल सकते हैं।",
    },
    {
      qEn: "What if I do not have an ABHA ID or Aadhaar card?",
      qHi: "अगर मेरे पास आभा (ABHA) आईडी या आधार नहीं है तो?",
      aEn: "ABHA is optional in this prototype. You can continue as a walk-in patient without entering an ABHA ID; this demo does not connect to an ABHA service.",
      aHi: "इस प्रोटोटाइप में ABHA वैकल्पिक है। आप ABHA आईडी के बिना वॉक-इन मरीज के रूप में आगे बढ़ सकते हैं; यह डेमो किसी ABHA सेवा से जुड़ा नहीं है।",
    },
    {
      qEn: "Can I scan past prescriptions and laboratory blood tests?",
      qHi: "क्या मैं पुराने पर्चे और लैब टेस्ट स्कैन कर सकता हूँ?",
      aEn: "Yes. In Step 3 (Scan), you can capture or upload documents. The system structures the test values and prior treatments for the physician's review.",
      aHi: "हाँ। चरण 3 (स्कैन) में आप पिछले पर्चों और रिपोर्ट की फोटो संलग्न कर सकते हैं। प्रणाली निष्कर्षों को डॉक्टर के अवलोकन हेतु व्यवस्थित करती है।",
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121C18]/60 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-title"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#15201C] rounded-lg shadow-xl border border-[#D3DDD8] dark:border-[#24352F] p-6 text-[#121C18] dark:text-[#F2F6F4] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#D3DDD8] dark:border-[#24352F] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] flex items-center justify-center text-[#0D5C4E] dark:text-[#15806C]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 id="faq-title" className="text-base font-bold font-display text-[#121C18] dark:text-[#F2F6F4]">
                {lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न (FAQ)" : "Patient FAQ & Clinical Guidelines"}
              </h2>
              <p className="text-xs text-[#4A5852] dark:text-[#8D9E97]">
                {lang === "hi" ? "आयुष कियोस्क एवं ओपीडी सहायता" : "Ministry of Ayush OPD Workflow Guide"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close FAQ dialog"
            className="p-1.5 rounded text-[#4A5852] dark:text-[#8D9E97] hover:text-[#121C18] dark:hover:text-[#F2F6F4] hover:bg-[#FAFBF9] dark:hover:bg-[#0E1513] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#D3DDD8]/50 dark:divide-[#24352F]">
          {faqs.map((faq, idx) => {
            const isExpanded = openIndex === idx;
            return (
              <div
                key={idx}
                className="pt-2.5"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isExpanded ? null : idx)}
                  aria-expanded={isExpanded}
                  className="w-full py-2 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-[#121C18] dark:text-[#F2F6F4] hover:text-[#0D5C4E] dark:hover:text-[#15806C] transition-colors"
                >
                  <span>{lang === "hi" ? faq.qHi : faq.qEn}</span>
                  <span
                    className={`transform transition-transform text-[#4A5852] dark:text-[#8D9E97] text-xs shrink-0 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {isExpanded && (
                  <div className="pb-3 pt-1 text-xs text-[#4A5852] dark:text-[#8D9E97] leading-relaxed">
                    {lang === "hi" ? faq.aHi : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-[#D3DDD8] dark:border-[#24352F] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs transition-colors"
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
