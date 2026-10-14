import React, { useState } from "react";
import { t } from "../i18n.js";
import { api } from "../api.js";

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

/* Institutional SVG icons */
function IconEmblem({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v8M8 12h8" />
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

function IconStethoscope({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 4.5v5a4.5 4.5 0 009 0v-5M7 4.5h4M16 4.5h4M9 14v3a4 4 0 004 4h1a4 4 0 004-4v-6.5M18 10.5a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function IconCaduceus({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v18m-4-14c4-2 4 4 0 4s-4 4 0 6m8-10c-4-2-4 4 0 4s4 4 0 6" />
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

function IconVolume({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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

export default function Identify({ lang, setLang, onSessionStart, currentUser }) {
  const [step, setStep] = useState("form"); // "form" | "consent" | "disagreed"
  const [department, setDepartment] = useState(currentUser?.department || "ayush");
  const [name, setName] = useState(currentUser?.full_name || "");
  const [token, setToken] = useState("");
  const [abhaId, setAbhaId] = useState(currentUser?.abha_id || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Doctor & Clinic Search Flow
  const [doctorQuery, setDoctorQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch doctors based on search & specialty filter
  useEffect(() => {
    let active = true;
    const fetchDocs = async () => {
      setLoadingDoctors(true);
      try {
        const spec = specialtyFilter === "all" ? "" : specialtyFilter;
        const docs = await api.getDoctors(doctorQuery, spec);
        if (active) {
          setDoctorsList(docs || []);
          // Auto-select first matching doctor if none selected
          if (!selectedDoctor && docs && docs.length > 0) {
            setSelectedDoctor(docs[0]);
            if (docs[0].department) {
              setDepartment(docs[0].department);
            }
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (active) setLoadingDoctors(false);
      }
    };

    const timer = setTimeout(fetchDocs, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [doctorQuery, specialtyFilter]);

  const handleAgree = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.startSession({
        language: lang,
        name: name.trim() || (lang === "hi" ? "वॉक-इन मरीज" : "Walk-in Patient"),
        token: token.trim() || null,
        abhaId: abhaId.trim() || null,
        consent: true,
        department: selectedDoctor?.department || department,
        consultingDoctor: selectedDoctor || null,
      });
      onSessionStart(
        res.session_id,
        res.token_number,
        res.department || selectedDoctor?.department || department,
        selectedDoctor
      );
    } catch {
      setError(t(lang, "backendOffline"));
      setSubmitting(false);
    }
  };

  return (
    <main
      id="main-content"
      className="flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Clinical Department Guide & Standards (Col 1-6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs font-semibold text-[#0D5C4E] dark:text-[#15806C]">
              <IconEmblem className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
              <span>
                {lang === "hi"
                  ? "चरण 1 · मरीज पहचान एवं क्लिनिकल ओपीडी चयन"
                  : "Step 1 of 4 · Patient Identity & Clinical Department"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4] leading-[1.15]">
              {lang === "hi"
                ? "ओपीडी पंजीकरण एवं क्लिनिक चयन"
                : "OPD Patient Intake & Clinic Selection"}
            </h1>

            <p className="text-sm text-[#4A5852] dark:text-[#8D9E97] leading-relaxed max-w-xl">
              {lang === "hi"
                ? "कृपया अपना नाम और उपयुक्त ओपीडी विभाग चुनें। यदि आपके पास 14-अंकीय आभा (ABHA) आईडी है, तो इसे दर्ज करें ताकि आपका स्वास्थ्य इतिहास डॉक्टर के पास सुरक्षित रूप से पहुंच सके।"
                : "Select the clinical department matching your symptoms. Enter your legal name and optional 14-digit ABHA health ID to link previous hospital records to your attending physician."}
            </p>

            {/* Department Comparison Cards (Architectural 1px Borders) */}
            <div className="space-y-3 pt-2">
              <div
                onClick={() => setDepartment("ayush")}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  department === "ayush"
                    ? "border-[#0D5C4E] bg-white dark:bg-[#15201C] ring-1 ring-[#0D5C4E]"
                    : "border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#4A5852]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#121C18] dark:text-[#F2F6F4]">
                    <IconLeaf className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
                    <span>{t(lang, "deptAyush")}</span>
                  </div>
                  {department === "ayush" && (
                    <span className="text-[10px] font-mono uppercase font-bold text-[#0D5C4E] dark:text-[#15806C]">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-1.5 leading-normal">
                  {t(lang, "deptAyushDesc")}
                </p>
              </div>

              <div
                onClick={() => setDepartment("integrated")}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  department === "integrated"
                    ? "border-[#0D5C4E] bg-white dark:bg-[#15201C] ring-1 ring-[#0D5C4E]"
                    : "border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#4A5852]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#121C18] dark:text-[#F2F6F4]">
                    <IconCaduceus className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
                    <span>{t(lang, "deptIntegrated")}</span>
                  </div>
                  {department === "integrated" && (
                    <span className="text-[10px] font-mono uppercase font-bold text-[#0D5C4E] dark:text-[#15806C]">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-1.5 leading-normal">
                  {t(lang, "deptIntegratedDesc")}
                </p>
              </div>

              <div
                onClick={() => setDepartment("general")}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  department === "general"
                    ? "border-[#0D5C4E] bg-white dark:bg-[#15201C] ring-1 ring-[#0D5C4E]"
                    : "border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#4A5852]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#121C18] dark:text-[#F2F6F4]">
                    <IconStethoscope className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
                    <span>{t(lang, "deptGeneral")}</span>
                  </div>
                  {department === "general" && (
                    <span className="text-[10px] font-mono uppercase font-bold text-[#0D5C4E] dark:text-[#15806C]">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-1.5 leading-normal">
                  {t(lang, "deptGeneralDesc")}
                </p>
              </div>
            </div>

            {/* Compliance strip */}
            <div className="pt-2 border-t border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#4A5852] dark:text-[#8D9E97]">
              <span className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">
                {t(lang, "dpdpNotice")}
              </span>
              <p className="mt-0.5 leading-normal">
                Encrypted clinical intake transmitted exclusively to the assigned hospital doctor station.
              </p>
            </div>
          </div>

          {/* Right Column: Intake Form / Consent Card (Col 7-12) */}
          <div className="lg:col-span-6">
            <div className="rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] p-6 sm:p-8">
              
              {step === "form" && (
                <div className="space-y-5">
                  <div className="border-b border-[#D3DDD8] dark:border-[#24352F] pb-3">
                    <h2 className="text-base font-bold font-display text-[#121C18] dark:text-[#F2F6F4]">
                      {lang === "hi" ? "मरीज विवरण भरें" : "Patient Credentials & Token"}
                    </h2>
                    <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
                      {lang === "hi"
                        ? "वॉक-इन मरीज नाम दर्ज करके आगे बढ़ सकते हैं।"
                        : "Walk-in patients may proceed by entering their full name."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1.5">
                      {t(lang, "nameLabel")} *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t(lang, "namePlaceholder")}
                      className="w-full px-3.5 py-2.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-sm text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E] focus:ring-1 focus:ring-[#0D5C4E]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1.5">
                        {t(lang, "tokenLabel")}
                      </label>
                      <input
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder={lang === "hi" ? "स्वतः आवंटन (उदा. 04)" : "Auto-assigned if empty"}
                        className="w-full px-3 py-2.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-sm font-mono text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1.5">
                        {t(lang, "abhaLabel")}
                      </label>
                      <input
                        value={abhaId}
                        onChange={(e) => setAbhaId(e.target.value)}
                        placeholder={t(lang, "abhaPlaceholder")}
                        className="w-full px-3 py-2.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs font-mono text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] text-xs text-[#4A5852] dark:text-[#8D9E97]">
                    <p className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">
                      {lang === "hi" ? "आभा (ABHA) विवरण" : "National Health Account Linking"}
                    </p>
                    <p className="mt-0.5 leading-normal">
                      {lang === "hi"
                        ? "यदि आपके पास आभा संख्या नहीं है, तो खाली छोड़ें। आपको स्वतः वॉक-इन टोकन दिया जाएगा।"
                        : "Leave ABHA empty if unavailable. You will be assigned an immediate walk-in token."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("consent")}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{t(lang, "startButton")}</span>
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === "consent" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D5C4E] dark:text-[#15806C] uppercase tracking-wider">
                    <IconShield className="w-4 h-4" />
                    <span>DPDP Act 2023 & ABDM Consent Protocol</span>
                  </div>

                  <h2 className="text-lg font-bold font-display text-[#121C18] dark:text-[#F2F6F4]">
                    {t(lang, "consentTitle")}
                  </h2>

                  <div className="p-4 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] text-xs sm:text-sm text-[#4A5852] dark:text-[#8D9E97] leading-relaxed">
                    {t(lang, "consentBody")}
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(t(lang, "consentBody"), lang)}
                    className="w-full py-2.5 px-3 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:bg-[#FAFBF9] dark:hover:bg-[#0E1513] text-xs font-semibold text-[#121C18] dark:text-[#F2F6F4] flex items-center justify-center gap-2 transition-colors"
                  >
                    <IconVolume className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
                    <span>{t(lang, "listen")}</span>
                  </button>

                  {error && (
                    <div role="alert" className="p-3 rounded border border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C] text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAgree}
                      disabled={submitting}
                      className="min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50"
                    >
                      {submitting ? t(lang, "loading") : t(lang, "agree")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("disagreed")}
                      className="min-h-[44px] py-2.5 px-4 rounded border border-[#D3DDD8] dark:border-[#24352F] text-[#4A5852] dark:text-[#8D9E97] hover:bg-[#FAFBF9] text-xs sm:text-sm font-semibold transition-colors"
                    >
                      {t(lang, "disagree")}
                    </button>
                  </div>

                  <div className="text-center pt-1 border-t border-[#D3DDD8] dark:border-[#24352F]">
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="text-xs text-[#0D5C4E] dark:text-[#15806C] hover:underline font-semibold"
                    >
                      ← {lang === "hi" ? "वापस विवरण संपादित करें" : "Return to Edit Details"}
                    </button>
                  </div>
                </div>
              )}

              {step === "disagreed" && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-12 h-12 mx-auto rounded-full border border-[#D3DDD8] dark:border-[#24352F] flex items-center justify-center text-[#0D5C4E] dark:text-[#15806C]">
                    <IconShield className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold font-display text-[#121C18] dark:text-[#F2F6F4]">
                    {lang === "hi" ? "सहमति अस्वीकृत" : "Consent Declined"}
                  </h2>
                  <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] leading-relaxed">
                    {t(lang, "disagreeNotice")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("consent")}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs transition-colors"
                  >
                    {t(lang, "startButton")}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
