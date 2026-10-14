import React, { useEffect, useState } from "react";
import { t } from "../i18n.js";
import { api } from "../api.js";
import CopyButton from "../components/CopyButton.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function IconPrinter({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function IconVolume({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
}

function IconClipboard({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function IconLeaf({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 21c-4.97 0-9-4.03-9-9 0-5.5 4.5-9.5 10-9.5 4.5 0 8 3.5 8 8 0 5.5-4.5 10.5-9 10.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12c4 0 7 2 9 6" />
    </svg>
  );
}

function buildRecap(summary, lang) {
  if (!summary) return "";
  const parts = [];
  if (summary.chief_complaint && summary.chief_complaint !== "Not reported") {
    parts.push(t(lang, "recapChiefComplaint", { cc: summary.chief_complaint }));
  }
  if (summary.hpi && summary.hpi !== "Not reported") {
    parts.push(summary.hpi);
  }
  if (
    summary.prior_investigations_summary &&
    summary.prior_investigations_summary !== "Not reported"
  ) {
    parts.push(
      t(lang, "recapPriorReports", { text: summary.prior_investigations_summary })
    );
  }
  return parts.join(" ");
}

export default function SummaryReview({ lang, sessionId, onSent, onEditAnswers, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lastUpdated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    (async () => {
      try {
        const result = await api.summarize({ sessionId });
        setSummary(result);
      } catch (err) {
        if (err?.status === 404) {
          setError(
            lang === "hi"
              ? "सत्र समाप्त हो गया है। कृपया पुनः पंजीकरण करें।"
              : "Session expired. Please restart registration."
          );
          setTimeout(() => onBack && onBack(), 2500);
        } else {
          setError(t(lang, "backendOffline"));
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const recap = buildRecap(summary, lang);

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      await api.route({ sessionId });
      onSent();
    } catch (err) {
      if (err?.status === 404) {
        setError(
          lang === "hi"
            ? "सत्र समाप्त हो गया है। कृपया पुनः पंजीकरण करें।"
            : "Session expired. Please restart registration."
        );
        setTimeout(() => onBack && onBack(), 2500);
      } else {
        setError(t(lang, "backendOffline"));
      }
      setSending(false);
    }
  };

  return (
    <main
      id="main-content"
      className="flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#D3DDD8] dark:border-[#24352F]">
          <div>
            <div className="text-[11px] font-mono uppercase font-bold text-[#0D5C4E] dark:text-[#15806C] mb-1">
              Step 4 of 4 · Final Clinical Review
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4]">
              {t(lang, "summaryTitle")}
            </h1>
            <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
              {t(lang, "summarySub")} · <span className="font-mono">Generated {lastUpdated}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] text-xs font-semibold text-[#4A5852] dark:text-[#8D9E97] hover:bg-white dark:hover:bg-[#15201C] flex items-center gap-1.5 transition-colors"
              >
                <span>←</span>
                <span>{lang === "hi" ? "वापस" : "Back"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              title="Print Case Sheet"
              className="px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] text-xs font-semibold text-[#4A5852] dark:text-[#8D9E97] hover:bg-white dark:hover:bg-[#15201C] flex items-center gap-1.5 transition-colors"
            >
              <IconPrinter className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "प्रिंट" : "Print"}</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" text={t(lang, "loading")} />
          </div>
        )}

        {error && (
          <div role="alert" className="p-3.5 mb-5 rounded border border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C] text-xs font-semibold">
            {error}
          </div>
        )}

        {!loading && summary && (
          <div className="space-y-6">
            
            {/* Primary Clinical Note Card */}
            <div className="p-6 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C]">
              <div className="flex items-center justify-between mb-3 border-b border-[#D3DDD8] dark:border-[#24352F] pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#15806C] flex items-center gap-1.5">
                  <IconClipboard className="w-4 h-4" />
                  <span>Clinical Case-Taking Summary</span>
                </h2>
                {recap && (
                  <div className="print:hidden">
                    <CopyButton text={recap} label="Copy Notes" successLabel="Notes Copied" />
                  </div>
                )}
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-[#121C18] dark:text-[#F2F6F4]">
                {recap || "No symptoms recorded."}
              </p>
            </div>

            {/* Ayush Assessment Block */}
            {summary.ayush_assessment && (
              <div className="p-5 rounded-lg border border-[#0D5C4E] bg-white dark:bg-[#15201C] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#15806C]">
                  <IconLeaf className="w-4 h-4" />
                  <span>Ayush Pariksha & Prakriti Assessment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513]">
                    <span className="text-[#4A5852] dark:text-[#8D9E97] font-bold block text-[10px] uppercase tracking-wider">
                      Prakriti Assessment
                    </span>
                    <span className="font-semibold text-[#121C18] dark:text-[#F2F6F4] text-sm mt-0.5 block">
                      {summary.ayush_assessment.prakriti_assessment || "Vata-Pitta"}
                    </span>
                  </div>
                  <div className="p-3 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513]">
                    <span className="text-[#4A5852] dark:text-[#8D9E97] font-bold block text-[10px] uppercase tracking-wider">
                      Agni & Metabolic Status
                    </span>
                    <span className="font-semibold text-[#121C18] dark:text-[#F2F6F4] text-sm mt-0.5 block">
                      {summary.ayush_assessment.agni_status || "Samagni"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Read Aloud button */}
            <button
              type="button"
              onClick={() => speak(recap, lang)}
              className="w-full min-h-[44px] py-2 px-4 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:bg-[#FAFBF9] text-[#121C18] dark:text-[#F2F6F4] font-semibold text-xs flex items-center justify-center gap-2 transition-colors print:hidden"
            >
              <IconVolume className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
              <span>{t(lang, "readAloud")}</span>
            </button>

            {/* Submit & Edit Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#D3DDD8] dark:border-[#24352F] print:hidden">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" text="" className="text-white" />
                    <span>Submitting case sheet to physician...</span>
                  </div>
                ) : (
                  <span>{t(lang, "looksGood")}</span>
                )}
              </button>

              <button
                type="button"
                onClick={onEditAnswers}
                disabled={sending}
                className="w-full min-h-[44px] py-2.5 px-4 rounded border border-[#D3DDD8] dark:border-[#24352F] hover:bg-white dark:hover:bg-[#15201C] text-[#4A5852] dark:text-[#8D9E97] text-xs font-semibold transition-colors"
              >
                {t(lang, "editAnswers")}
              </button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
