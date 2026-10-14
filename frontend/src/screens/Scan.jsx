import React, { useRef, useState } from "react";
import { t } from "../i18n.js";
import { api } from "../api.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";

function IconCamera({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconUpload({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function IconDocument({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

export default function Scan({ lang, sessionId, onComplete, onBack }) {
  const [documents, setDocuments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setProcessing(true);
    setError("");
    const previewUrl = URL.createObjectURL(file);
    try {
      const extracted = await api.extractDoc({ sessionId, file });
      setDocuments((prev) => [...prev, { ...extracted, previewUrl }]);
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
      setProcessing(false);
    }
  };

  return (
    <main
      id="main-content"
      className="flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Step Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#D3DDD8] dark:border-[#24352F]">
          <div>
            <div className="text-[11px] font-mono uppercase font-bold text-[#0D5C4E] dark:text-[#15806C] mb-1">
              Step 3 of 4 · Prior Clinical Records
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4]">
              {t(lang, "scanTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
              {t(lang, "scanSub")}
            </p>
          </div>
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
        </div>

        {/* Upload & Camera Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={processing}
            className="min-h-[48px] px-4 rounded border border-[#0D5C4E] bg-white dark:bg-[#15201C] hover:bg-[#EAF3F0] dark:hover:bg-[#1A2622] text-[#0D5C4E] dark:text-[#15806C] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <IconCamera className="w-4 h-4" />
            <span>{t(lang, "takePhoto")}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="min-h-[48px] px-4 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] hover:bg-[#FAFBF9] text-[#121C18] dark:text-[#F2F6F4] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <IconUpload className="w-4 h-4" />
            <span>{t(lang, "uploadButton")}</span>
          </button>
        </div>

        {/* OCR Ingestion Status */}
        {processing && (
          <div className="p-4 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] mb-5 flex items-center gap-3 text-xs text-[#4A5852] dark:text-[#8D9E97]">
            <LoadingSpinner size="sm" text="" />
            <span>{t(lang, "processing")}</span>
          </div>
        )}

        {error && (
          <div role="alert" className="p-3 mb-5 rounded border border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C] text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Extracted Documents List */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#4A5852] dark:text-[#8D9E97] mb-3">
            {t(lang, "documentsAdded")} ({documents.length})
          </h2>

          {documents.length === 0 && !processing && (
            <div className="p-6 rounded border border-dashed border-[#D3DDD8] dark:border-[#24352F] text-center text-xs text-[#4A5852] dark:text-[#8D9E97]">
              <IconDocument className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>{t(lang, "noDocumentsYet")}</p>
              <p className="mt-1 text-[11px] opacity-80">
                You can capture previous prescriptions, lab reports, or proceed directly to review.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="p-4 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] flex gap-4 items-center"
              >
                <img
                  src={doc.previewUrl}
                  alt="Document preview"
                  className="w-14 h-14 object-cover rounded border border-[#D3DDD8] dark:border-[#24352F] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-[#121C18] dark:text-[#F2F6F4] capitalize truncate">
                    {(doc.document_type || "Prescription / Lab Record").replace("_", " ")}
                  </p>
                  <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] truncate mt-0.5">
                    {doc.diagnoses && doc.diagnoses.length > 0
                      ? doc.diagnoses.join(", ")
                      : doc.extraction_notes || "Clinical record ingested"}
                  </p>
                  <p className="text-[11px] text-[#4A5852] dark:text-[#8D9E97] mt-0.5">
                    {doc.date || "Date unspecified"}
                  </p>
                </div>
                {doc.investigations?.some((inv) => inv.abnormal) && (
                  <span className="text-[10px] font-mono font-bold uppercase text-[#B91C1C] bg-[#FEF2F2] border border-[#B91C1C] px-2 py-0.5 rounded shrink-0">
                    {t(lang, "abnormal")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Continuation Actions */}
        <div className="space-y-2.5 pt-2 border-t border-[#D3DDD8] dark:border-[#24352F]">
          <button
            type="button"
            onClick={onComplete}
            className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>{t(lang, "continueToSummary")}</span>
            <IconArrowRight className="w-4 h-4" />
          </button>

          {documents.length === 0 && (
            <button
              type="button"
              onClick={onComplete}
              className="w-full min-h-[44px] py-2.5 px-4 rounded border border-[#D3DDD8] dark:border-[#24352F] hover:bg-white dark:hover:bg-[#15201C] text-[#4A5852] dark:text-[#8D9E97] text-xs font-semibold transition-colors"
            >
              {t(lang, "skipScan")}
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
