import React, { useState, useEffect } from "react";
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
  const [department, setDepartment] = useState("general");
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
  const [doctorSearchError, setDoctorSearchError] = useState("");
  const [doctorSearchRetry, setDoctorSearchRetry] = useState(0);
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
          const docList = Array.isArray(docs) ? docs : (docs?.doctors || []);
          setDoctorsList(docList);
          setDoctorSearchError("");
        }
      } catch (err) {
        if (active) {
          setDoctorSearchError(
            err?.message ||
              (lang === "hi"
                ? "डॉक्टर सूची उपलब्ध नहीं है। कृपया फिर से प्रयास करें।"
                : "The doctor list is unavailable. Please try again.")
          );
        }
      } finally {
        if (active) setLoadingDoctors(false);
      }
    };

    const timer = setTimeout(fetchDocs, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [doctorQuery, specialtyFilter, doctorSearchRetry, lang]);

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
      className="kiosk-screen flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] transition-colors"
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
                ? "कृपया अपना नाम और उपयुक्त ओपीडी विभाग चुनें। ABHA आईडी वैकल्पिक है और इस प्रोटोटाइप में किसी बाहरी स्वास्थ्य सेवा से नहीं जुड़ती।"
                : "Choose a specialty for your symptoms. An ABHA ID is optional and is not connected to an external health service in this prototype."}
            </p>

            {/* Search Option for Doctors & Hospitals Across All Specialties */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#15806C] flex items-center gap-1.5">
                  <IconStethoscope className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "परामर्श हेतु चिकित्सक एवं क्लिनिक खोजें" : "Find Consulting Doctor & Hospital / Clinic"}</span>
                </span>
                <span className="text-[10px] text-[#4A5852] dark:text-[#8D9E97] font-mono">
                  {doctorsList.length} {lang === "hi" ? "उपलब्ध" : "available"}
                </span>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={doctorQuery}
                  onChange={(e) => setDoctorQuery(e.target.value)}
                  aria-label={lang === "hi" ? "डॉक्टर, अस्पताल या विशेषज्ञता खोजें" : "Search doctors, clinics, or specialties"}
                  placeholder={
                    lang === "hi"
                      ? "डॉक्टर का नाम, अस्पताल या विशेषज्ञता खोजें..."
                      : "Search doctor name, hospital, or specialty (e.g. Mehta, Orthopedics, Apollo)..."
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E] focus:ring-1 focus:ring-[#0D5C4E] transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5852] dark:text-[#8D9E97]">
                  🔍
                </span>
                {doctorQuery && (
                  <button
                    type="button"
                    onClick={() => setDoctorQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A5852] hover:text-[#121C18]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Specialty Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                {[
                  { id: "all", label: lang === "hi" ? "सभी" : "All Specialties" },
                  { id: "general", label: "General Med" },
                  { id: "cardio", label: "Cardiology" },
                  { id: "ortho", label: "Orthopedics" },
                  { id: "ayush", label: "Ayush / Ayurveda" },
                  { id: "internal", label: "Internal Med" },
                  { id: "neuro", label: "Neurology" },
                  { id: "pedia", label: "Pediatrics" },
                  { id: "derma", label: "Dermatology" },
                ].map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSpecialtyFilter(spec.id)}
                    aria-pressed={specialtyFilter === spec.id}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-semibold transition-colors border ${
                      specialtyFilter === spec.id
                        ? "bg-[#0D5C4E] text-white border-[#0D5C4E]"
                        : "bg-white dark:bg-[#15201C] text-[#4A5852] dark:text-[#8D9E97] border-[#D3DDD8] dark:border-[#24352F] hover:border-[#0D5C4E]"
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>

              {/* Doctor Selection Cards (Scrollable List) */}
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {loadingDoctors && (
                  <div role="status" aria-live="polite" className="py-6 text-center text-xs text-[#4A5852] dark:text-[#8D9E97]">
                    {lang === "hi" ? "डॉक्टर सूची लोड हो रही है..." : "Finding available physicians..."}
                  </div>
                )}

                {!loadingDoctors && doctorSearchError && (
                  <div role="alert" className="p-4 rounded border border-[#B91C1C] bg-[#FEF2F2] text-[#7F1D1D] text-xs">
                    <p>{doctorSearchError}</p>
                    <button
                      type="button"
                      onClick={() => setDoctorSearchRetry((attempt) => attempt + 1)}
                      className="mt-2 min-h-[40px] rounded-md border border-[#B91C1C] px-3 font-semibold text-[#7F1D1D] hover:bg-white focus-visible:outline"
                    >
                      {lang === "hi" ? "फिर से प्रयास करें" : "Try again"}
                    </button>
                  </div>
                )}

                {!loadingDoctors && !doctorSearchError && doctorsList.length === 0 && (
                  <div className="p-4 rounded border border-dashed border-[#D3DDD8] dark:border-[#24352F] text-center text-xs text-[#4A5852] dark:text-[#8D9E97]">
                    {lang === "hi"
                      ? "कोई डॉक्टर नहीं मिला। कृपया दूसरा कीवर्ड खोजें।"
                      : "No doctors match this search. Try another name or specialty."}
                  </div>
                )}

                {!loadingDoctors &&
                  doctorsList.map((doc) => {
                    const isSelected = selectedDoctor?.id === doc.id;
                    return (
                      <button
                        type="button"
                        key={doc.id}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setError("");
                          if (doc.department) setDepartment(doc.department);
                        }}
                        className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#0D5C4E] bg-white dark:bg-[#15201C] ring-2 ring-[#0D5C4E]/60 shadow-xs"
                            : "border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:border-[#4A5852]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-[#121C18] dark:text-[#F2F6F4]">
                                {doc.full_name}
                              </span>
                              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-[#0D5C4E] dark:text-[#8BE3D2] border border-[#0D5C4E]/20">
                                {doc.specialization?.split("&")[0]?.trim() || doc.department}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
                              {doc.hospital || "City Care Multispecialty"} •{" "}
                              <strong className="text-[#0D5C4E] dark:text-[#15806C]">
                                {doc.cabin || "Cabin 101"}
                              </strong>
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center">
                            {isSelected ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-[#0D5C4E] dark:text-[#15806C]">
                                <span>✓</span>
                                <span className="hidden sm:inline">Selected</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#4A5852] dark:text-[#8D9E97] font-semibold hover:underline">
                                Select →
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
              {error && step === "form" && (
                <div role="alert" className="p-3 rounded border border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C] text-xs font-semibold">
                  {error}
                </div>
              )}
            </div>

            {/* Data sharing notice */}
            <div className="pt-2 border-t border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#4A5852] dark:text-[#8D9E97]">
              <span className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">
                {t(lang, "dpdpNotice")}
              </span>
              <p className="mt-0.5 leading-normal">
                Only the records you select are attached to this consultation request. This prototype does not provide certified compliance or secure clinical access controls.
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
                      aria-label={t(lang, "nameLabel")}
                      maxLength={120}
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
                        aria-label={t(lang, "tokenLabel")}
                        maxLength={12}
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
                        aria-label={t(lang, "abhaLabel")}
                        maxLength={20}
                        className="w-full px-3 py-2.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs font-mono text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                      />
                    </div>
                  </div>

                  {/* Selected Doctor Consultation Banner */}
                  {selectedDoctor && (
                    <div className="p-3.5 rounded border border-[#0D5C4E] bg-emerald-50/70 dark:bg-emerald-950/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0D5C4E] dark:text-[#8BE3D2] uppercase tracking-wider text-[10px]">
                          {lang === "hi" ? "चयनित चिकित्सक" : "Selected Consulting Doctor"}
                        </span>
                        <span className="text-[10px] font-mono text-[#0D5C4E] font-bold">
                          {selectedDoctor.cabin || "Cabin 101"}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-[#121C18] dark:text-[#F2F6F4] mt-0.5">
                        {selectedDoctor.full_name}
                      </p>
                      <p className="text-[11px] text-[#4A5852] dark:text-[#8D9E97]">
                        {selectedDoctor.specialization || selectedDoctor.department} • {selectedDoctor.hospital}
                      </p>
                    </div>
                  )}

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
                    onClick={() => {
                      if (!selectedDoctor) {
                        setError(
                          lang === "hi"
                            ? "क्लिनिकल संवाद शुरू करने से पहले कृपया डॉक्टर या क्लिनिक चुनें।"
                            : "Select a doctor or clinic before starting the clinical intake."
                        );
                        return;
                      }
                      setError("");
                      setStep("consent");
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>
                      {lang === "hi"
                        ? "9-चरणीय SOCRATES क्लिनिकल संवाद प्रारंभ करें"
                        : "Begin 9-Stage SOCRATES Intake Interview"}
                    </span>
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === "consent" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D5C4E] dark:text-[#15806C] uppercase tracking-wider">
                    <IconShield className="w-4 h-4" />
                    <span>{lang === "hi" ? "साझा करने से पहले आपकी अनुमति" : "Your permission before sharing"}</span>
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
