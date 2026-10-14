import React, { useEffect, useState } from "react";
import { t } from "../i18n.js";
import { api } from "../api.js";
import CopyButton from "../components/CopyButton.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";

const MAX_REPORT_UPLOAD_BYTES = 20 * 1024 * 1024;
const ALLOWED_REPORT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

export default function SummaryReview({
  lang,
  sessionId,
  consultingDoctor,
  onSent,
  onEditAnswers,
  onBack,
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lastUpdated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Medical Records Vault & Prior Diagnoses (Requirement 3)
  const [vaultRecords, setVaultRecords] = useState([]);
  const [pastDiagnoses, setPastDiagnoses] = useState([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [sharePastHistory, setSharePastHistory] = useState(true);

  // New Report Upload right there
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState("");
  const [newReportType, setNewReportType] = useState("MRI Scan");
  const [newReportFacility, setNewReportFacility] = useState("");
  const [newReportNotes, setNewReportNotes] = useState("");
  const [newReportFile, setNewReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [sumResult, vaultResult] = await Promise.allSettled([
          api.summarize({ sessionId }),
          api.getPatientVault(),
        ]);

        if (sumResult.status === "fulfilled") {
          setSummary(sumResult.value);
        } else {
          const err = sumResult.reason;
          if (err?.status === 404) {
            setError(
              lang === "hi"
                ? "सत्र समाप्त हो गया है। कृपया पुनः पंजीकरण करें।"
                : "Session expired. Please restart registration."
            );
            setTimeout(() => onBack && onBack(), 2500);
            return;
          }
          setError(t(lang, "backendOffline"));
        }

        if (vaultResult.status === "fulfilled" && vaultResult.value) {
          const vList = vaultResult.value.vault_records || [];
          setVaultRecords(vList);
          setPastDiagnoses(vaultResult.value.past_diagnoses || []);
          // Pre-select all vault records by default so doctor gets full picture
          setSelectedRecordIds(vList.map((r) => r.id));
        }
      } catch {
        setError(t(lang, "backendOffline"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const toggleRecordSelection = (id) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddNewReport = async (e) => {
    e.preventDefault();
    if (!newReportTitle.trim() || !newReportFile) return;

    setUploadingReport(true);
    setError("");
    try {
      const result = await api.uploadPatientRecord({
        sessionId,
        title: newReportTitle.trim(),
        type: newReportType,
        facility: newReportFacility.trim(),
        summary: newReportNotes.trim(),
        file: newReportFile,
      });
      const newRecord = result.record;
      setVaultRecords((prev) => [newRecord, ...prev]);
      setSelectedRecordIds((prev) => [newRecord.id, ...prev]);
      setNewReportTitle("");
      setNewReportFacility("");
      setNewReportNotes("");
      setNewReportFile(null);
      setShowUploadForm(false);
    } catch (err) {
      setError(`Report upload failed: ${err.message}`);
    } finally {
      setUploadingReport(false);
    }
  };

  const recap = buildRecap(summary, lang);

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      // 1. Attach chosen prior records and past diagnosis sharing flag
      const attachedRecords = vaultRecords.filter((r) => selectedRecordIds.includes(r.id));
      await api.attachRecords({
        sessionId,
        attachedRecords,
        sharePastHistory,
      });

      // 2. Route consultation request to doctor station
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
      className="kiosk-screen flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] transition-colors"
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

            {/* Consulting Doctor Target Banner */}
            {consultingDoctor && (
              <div className="p-4 rounded-lg border border-[#0D5C4E] bg-emerald-50/80 dark:bg-emerald-950/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#0D5C4E] text-white flex items-center justify-center font-bold text-sm">
                    Dr
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#0D5C4E] dark:text-[#8BE3D2]">
                      Target Consultation Doctor
                    </span>
                    <h3 className="font-bold text-sm text-[#121C18] dark:text-[#F2F6F4]">
                      {consultingDoctor.full_name || consultingDoctor.name}
                    </h3>
                    <p className="text-xs text-[#4A5852] dark:text-[#8D9E97]">
                      {consultingDoctor.specialization || consultingDoctor.department} • {consultingDoctor.hospital}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-white dark:bg-[#15201C] border border-[#0D5C4E] text-[#0D5C4E] dark:text-[#8BE3D2] text-xs font-mono font-bold">
                    {consultingDoctor.cabin || "Cabin 101"}
                  </span>
                </div>
              </div>
            )}
            
            {/* Primary Clinical Note Card */}
            <div className="p-6 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C]">
              <div className="flex items-center justify-between mb-3 border-b border-[#D3DDD8] dark:border-[#24352F] pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#15806C] flex items-center gap-1.5">
                  <IconClipboard className="w-4 h-4" />
                  <span>Clinical Case-Taking Summary (SOCRATES 9-Stage Intake)</span>
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

            {/* SECTION 3a: MEDICAL RECORDS VAULT & PRIOR SCANS (Requirement 3a) */}
            <div className="p-6 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D3DDD8] dark:border-[#24352F] pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#15806C] flex items-center gap-2">
                    <span>Diagnostic Scans & Medical Records Vault</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-[#0D5C4E] dark:text-[#8BE3D2] px-2 py-0.5 rounded font-mono font-bold">
                      ABDM Vault
                    </span>
                  </h2>
                  <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
                    Select MRI scans, X-rays, blood sugar/BP logs, or CT scans to attach to your consultation request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadForm((prev) => !prev)}
                  className="px-3 py-1.5 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>{showUploadForm ? "✕ Close Form" : "+ Upload New Report"}</span>
                </button>
              </div>

              {/* Inline Upload Form */}
              {showUploadForm && (
                <form
                  onSubmit={handleAddNewReport}
                  className="p-4 rounded-lg border border-dashed border-[#0D5C4E] bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3"
                >
                  <div className="font-bold text-xs text-[#0D5C4E] dark:text-[#8BE3D2] uppercase tracking-wider">
                    Upload New Diagnostic Scan / Lab Report Right Here
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] mb-1">
                        Report Title *
                      </label>
                      <input
                        type="text"
                        value={newReportTitle}
                        onChange={(e) => setNewReportTitle(e.target.value)}
                        placeholder="e.g. Lumbar Spine MRI Scan / Bilateral Knee X-Ray"
                        maxLength={120}
                        className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] mb-1">
                        Diagnostic Type
                      </label>
                      <select
                        value={newReportType}
                        onChange={(e) => setNewReportType(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs"
                      >
                        <option value="MRI Scan">MRI Scan</option>
                        <option value="Digital X-Ray">Digital X-Ray</option>
                        <option value="CT Scan">CT Scan</option>
                        <option value="Blood Sugar / BP Log">Blood Sugar & BP Log</option>
                        <option value="Pathology Lab Report">Pathology Lab Report</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] mb-1">
                        Diagnostic Center / Hospital
                      </label>
                      <input
                        type="text"
                        value={newReportFacility}
                        onChange={(e) => setNewReportFacility(e.target.value)}
                        placeholder="e.g. City Imaging & Scans Ltd"
                        maxLength={160}
                        className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] mb-1">
                        Attach File (PDF, JPEG, PNG or WebP)
                      </label>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && !ALLOWED_REPORT_TYPES.has(file.type)) {
                            setNewReportFile(null);
                            setError("Choose a PDF, JPEG, PNG, or WebP report.");
                            e.target.value = "";
                            return;
                          }
                          if (file && file.size > MAX_REPORT_UPLOAD_BYTES) {
                            setNewReportFile(null);
                            setError("Medical reports must be 20 MB or smaller.");
                            e.target.value = "";
                            return;
                          }
                          setError("");
                          setNewReportFile(file);
                        }}
                        className="w-full px-2 py-1 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs"
                      />
                      {newReportFile && (
                        <p className="mt-1 text-[11px] text-[#4A5852] dark:text-[#8D9E97]">
                          Selected: {newReportFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] mb-1">
                      Key Clinical Findings / Radiologist Impression
                    </label>
                    <textarea
                      rows={2}
                      value={newReportNotes}
                      onChange={(e) => setNewReportNotes(e.target.value)}
                      placeholder="e.g. L4-L5 disc protrusion noted with mild canal narrowing..."
                      maxLength={2000}
                      className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingReport}
                      className="px-4 py-1.5 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white text-xs font-bold disabled:opacity-60"
                    >
                      {uploadingReport ? "Uploading report..." : "Attach to Consultation"}
                    </button>
                  </div>
                </form>
              )}

              {/* Vault Records Checklist */}
              <div className="space-y-2.5">
                {vaultRecords.length === 0 ? (
                  <p className="text-xs text-[#4A5852] italic">No prior vault records found.</p>
                ) : (
                  vaultRecords.map((rec) => {
                    const isChecked = selectedRecordIds.includes(rec.id);
                    return (
                      <label
                        key={rec.id}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#0D5C4E] bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-[#0D5C4E]/40"
                            : "border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:border-[#4A5852]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRecordSelection(rec.id)}
                          className="mt-1 w-4 h-4 rounded text-[#0D5C4E] focus:ring-[#0D5C4E]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-[#121C18] dark:text-[#F2F6F4]">
                              {rec.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {rec.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
                            {rec.facility} • {rec.date}
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium bg-white/70 dark:bg-[#121C18]/60 p-2 rounded border border-[#D3DDD8]/60 dark:border-[#24352F]">
                            Findings: {rec.summary}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* SECTION 3b: PREVIOUS DIAGNOSIS & REMARKS SHARING (Requirement 3b) */}
            <div className="p-6 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D3DDD8] dark:border-[#24352F] pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#15806C]">
                    Past Diagnosis History & Consulting Doctors' Remarks
                  </h2>
                  <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
                    Share previous 9-stage intake summaries and previous consulting physicians' notes.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sharePastHistory}
                    onChange={(e) => setSharePastHistory(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D5C4E] focus:ring-[#0D5C4E]"
                  />
                  <span className="text-xs font-bold text-[#121C18] dark:text-[#F2F6F4]">
                    {sharePastHistory ? "✓ Sharing Enabled" : "Sharing Disabled"}
                  </span>
                </label>
              </div>

              {sharePastHistory ? (
                <div className="space-y-3">
                  {pastDiagnoses.map((pd) => (
                    <div
                      key={pd.id}
                      className="p-3.5 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#121C18] dark:text-[#F2F6F4] font-bold">
                          {pd.doctor_name} ({pd.specialization || pd.specialty})
                        </span>
                        <span className="text-[10px] text-[#4A5852] dark:text-[#8D9E97] font-mono">
                          {pd.date}
                        </span>
                      </div>
                      <p className="text-xs text-[#0D5C4E] dark:text-[#8BE3D2] font-semibold">
                        Previous intake summary: {pd.intake_summary || pd.diagnosis}
                      </p>
                      <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] bg-white dark:bg-[#15201C] p-2 rounded border border-[#D3DDD8] dark:border-[#24352F]">
                        Doctor's Remarks: "{pd.remarks || pd.doctor_remarks}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded border border-dashed border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#4A5852] text-center">
                  Past diagnosis history sharing has been toggled off by patient.
                </div>
              )}
            </div>

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
                    <span>Submitting consultation request & records to physician...</span>
                  </div>
                ) : (
                  <span>
                    Submit Consultation Request to {consultingDoctor?.full_name || "Doctor"} ({selectedRecordIds.length} Scans Attached)
                  </span>
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
