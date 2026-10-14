import React, { useEffect, useRef, useState } from "react";
import { t } from "../i18n.js";
import { api } from "../api.js";
import MicButton from "../components/MicButton.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import RedFlagAlert from "../components/RedFlagAlert.jsx";

function speakQuestion(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function IconVolume({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
}

function IconStethoscope({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 4.5v5a4.5 4.5 0 009 0v-5M7 4.5h4M16 4.5h4M9 14v3a4 4 0 004 4h1a4 4 0 004-4v-6.5M18 10.5a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function IconCheck({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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

export default function Converse({ lang, sessionId, department = "ayush", onComplete, onBack }) {
  const [log, setLog] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [draft, setDraft] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redFlag, setRedFlag] = useState(false);
  const [redFlagReason, setRedFlagReason] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const startedRef = useRef(false);

  const applyResponse = (response) => {
    setCurrentQuestion(response.next_question);
    setCurrentOptions(response.quick_options || []);
    setTurnCount((n) => n + 1);
    if (response.red_flag) {
      setRedFlag(true);
      setRedFlagReason(response.red_flag_reason);
    }
    if (response.interview_complete) {
      setInterviewComplete(true);
    }
    if (response.next_question) {
      setLog((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && lastMsg.text === response.next_question) {
          return prev;
        }
        return [...prev, { role: "assistant", text: response.next_question }];
      });
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const response = await api.converse({ sessionId, patientMessage: null });
        applyResponse(response);
      } catch (err) {
        if (err?.status === 404) {
          setError(lang === "hi" ? "सत्र समाप्त हो गया है। कृपया पुनः पंजीकरण करें।" : "Session expired. Please restart registration.");
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, loading, currentOptions]);

  const submitAnswer = async (text) => {
    const answer = text.trim();
    if (!answer || loading || interviewComplete) return;
    setLog((prev) => [...prev, { role: "patient", text: answer }]);
    setDraft("");
    setCurrentOptions([]);
    setLoading(true);
    setError("");
    try {
      const response = await api.converse({ sessionId, patientMessage: answer });
      applyResponse(response);
    } catch (err) {
      if (err?.status === 404) {
        setError(lang === "hi" ? "सत्र समाप्त हो गया है। कृपया पुनः पंजीकरण करें।" : "Session expired. Please restart registration.");
        setTimeout(() => onBack && onBack(), 2500);
      } else {
        setError(t(lang, "backendOffline"));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStageName = () => {
    if (interviewComplete) return t(lang, "stageComplete");
    if (turnCount <= 1) return t(lang, "stageChiefComplaint");
    if (turnCount <= 3) return t(lang, "stageSocrates");
    if (turnCount <= 5) return t(lang, "stageAyush");
    return t(lang, "stagePast");
  };

  const getDoctorRoleLabel = () => {
    if (department === "ayush") {
      return lang === "hi"
        ? "आयुष केस-टेकिंग वैद्य (Ayush Intake)"
        : "Ayush Clinical Intake Vaidya";
    }
    if (department === "integrated") {
      return lang === "hi"
        ? "एकीकृत चिकित्सा परामर्शक (Integrative Medicine)"
        : "Integrative Medicine Clinical Intake";
    }
    return lang === "hi"
      ? "ओपीडी केस-टेकिंग चिकित्सक (OPD Physician)"
      : "Clinical Outpatient Intake Physician";
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] overflow-hidden transition-colors">
      {redFlag && <RedFlagAlert lang={lang} />}

      {/* Top Clinical Header */}
      <header className="px-4 sm:px-6 py-3 bg-white dark:bg-[#15201C] border-b border-[#D3DDD8] dark:border-[#24352F] shrink-0">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-2.5 py-1 rounded border border-[#D3DDD8] dark:border-[#24352F] text-xs font-semibold text-[#4A5852] dark:text-[#8D9E97] hover:bg-[#FAFBF9] flex items-center gap-1 transition-colors"
                title="Return to Registration"
              >
                <span>←</span>
                <span>{lang === "hi" ? "वापस" : "Back"}</span>
              </button>
            )}
            <div className="w-7 h-7 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] flex items-center justify-center text-[#0D5C4E] dark:text-[#15806C]">
              <IconStethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#121C18] dark:text-[#F2F6F4]">
                {getDoctorRoleLabel()}
              </div>
              <div className="text-[11px] text-[#4A5852] dark:text-[#8D9E97]">
                {t(lang, "appName")} · SOCRATES & Pariksha Protocol
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-[#0D5C4E] dark:border-[#15806C] bg-[#EAF3F0] dark:bg-[#1A2622] text-[#0D5C4E] dark:text-[#8BE3D2] font-semibold">
              {getStageName()}
            </span>
            {!interviewComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="text-xs font-semibold text-[#0D5C4E] dark:text-[#15806C] hover:underline ml-1"
                title="Skip conversational interview and proceed to documents"
              >
                {lang === "hi" ? "छोड़ें ➔" : "Skip ➔"}
              </button>
            )}
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <ProgressBar lang={lang} current={Math.max(turnCount, 1)} />
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 max-w-4xl w-full mx-auto">
        {log.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.role === "patient" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-md px-4 py-3 text-sm leading-relaxed ${
                entry.role === "patient"
                  ? "bg-[#0D5C4E] text-white"
                  : "bg-white dark:bg-[#15201C] text-[#121C18] dark:text-[#F2F6F4] border border-[#D3DDD8] dark:border-[#24352F]"
              }`}
            >
              {entry.role === "assistant" && (
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#0D5C4E] dark:text-[#15806C] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <IconStethoscope className="w-3.5 h-3.5" />
                    <span>{t(lang, "doctorIntakeRole")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => speakQuestion(entry.text, lang)}
                    className="text-[#4A5852] dark:text-[#8D9E97] hover:text-[#0D5C4E] p-0.5"
                    title="Read question aloud"
                  >
                    <IconVolume className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="whitespace-pre-line">{entry.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#15201C] border border-[#D3DDD8] dark:border-[#24352F] rounded-md px-4 py-2.5 text-[#4A5852] dark:text-[#8D9E97] text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0D5C4E] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[#0D5C4E] animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-[#0D5C4E] animate-pulse [animation-delay:300ms]" />
              <span>{t(lang, "loading")}</span>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="p-3 bg-[#FEF2F2] border border-[#B91C1C] text-[#B91C1C] text-xs rounded-md text-center">
            {error}
          </div>
        )}

        {interviewComplete && !redFlag && (
          <div className="p-6 sm:p-8 rounded-lg border border-[#0D5C4E] bg-white dark:bg-[#15201C] text-center space-y-4 my-4">
            <div className="w-12 h-12 rounded-full border border-[#0D5C4E] bg-[#EAF3F0] dark:bg-[#1A2622] text-[#0D5C4E] dark:text-[#8BE3D2] flex items-center justify-center mx-auto">
              <IconCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-[#121C18] dark:text-[#F2F6F4]">
                {lang === "hi" ? "केस-टेकिंग साक्षात्कार पूर्ण हुआ" : "Clinical Intake Interview Complete"}
              </h3>
              <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-1 max-w-md mx-auto leading-relaxed">
                {lang === "hi"
                  ? "आपकी सभी जानकारियां रिकॉर्ड कर ली गई हैं। अब आप अपने पुराने पर्चे या लैब रिपोर्ट संलग्न कर सकते हैं।"
                  : "All clinical observations have been recorded for the doctor. Proceed to upload prior diagnostic reports and prescriptions."}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onComplete}
                className="w-full sm:w-auto px-8 min-h-[44px] py-2.5 bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>{t(lang, "continueToScan")}</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Footer Controls: Quick Tap Chips + Voice / Text Input */}
      {!interviewComplete && !redFlag && (
        <footer className="px-4 sm:px-6 pb-4 pt-3 bg-white dark:bg-[#15201C] border-t border-[#D3DDD8] dark:border-[#24352F] max-w-4xl w-full mx-auto space-y-3 shrink-0">
          {currentOptions.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[#0D5C4E] dark:text-[#15806C] uppercase tracking-wider">
                {t(lang, "quickOptionsHint")}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => submitAnswer(opt)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#0D5C4E] hover:text-[#0D5C4E] text-[#121C18] dark:text-[#F2F6F4] text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAnswer(draft);
            }}
            className="flex items-center gap-2"
          >
            <MicButton
              lang={lang}
              disabled={loading}
              onResult={(text) => setDraft(text)}
              labelListening={t(lang, "listening")}
              labelIdle={t(lang, "tapToSpeak")}
              unsupportedLabel={t(lang, "micUnsupported")}
            />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t(lang, "typeAnswer")}
              disabled={loading}
              className="flex-1 h-11 px-3.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-sm text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E] focus:ring-1 focus:ring-[#0D5C4E]"
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              className="h-11 px-4 bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold rounded text-xs sm:text-sm transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <span>{t(lang, "send")}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </footer>
      )}
    </div>
  );
}
