import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { t } from "../i18n.js";
import { api } from "../api.js";
import DiseaseAwareChatbot from "../components/DiseaseAwareChatbot.jsx";

function IconEmblem({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v8M8 12h8" />
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
function IconPrinter({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}
function IconRefresh({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
function IconTicket({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
function IconAlert({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
function IconSearch({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function IconPill({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}
function IconUser({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function IconCheckCircle({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}


const SUMMARY_FIELDS = [
  ["chief_complaint", "Chief Complaint (Pradhana Vedana)"],
  ["hpi", "History of Present Illness (HPI - SOCRATES)"],
  ["past_medical_surgical", "Past Medical / Surgical History"],
  ["drug_allergy_history", "Drug & Allergy History"],
  ["family_history", "Family History"],
  ["personal_history", "Personal History"],
  ["review_of_systems", "Review of Systems"],
  ["prior_investigations_summary", "Prior Investigations Summary"],
];

function QuickBookModal({ isOpen, onClose, onBook, loading }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("ayush");
  const [language, setLanguage] = useState("en");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [abhaId, setAbhaId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({
      patient_name: name.trim() || "Walk-in Patient",
      department,
      language,
      chief_complaint: chiefComplaint.trim() || undefined,
      abha_id: abhaId.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121C18]/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <IconTicket className="w-5 h-5 text-[#0D5C4E]" />
            <span>Book New OPD Patient (Auto-Token)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Patient Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meera Sharma"
              className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="ayush">Ayurveda OPD</option>
                <option value="general">General Medicine</option>
                <option value="integrated">Integrated OPD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="en">English (English)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Chief Complaint / Reason for Visit (Optional)
            </label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Type 2 Diabetes follow-up / Persistent joint pain"
              className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              ABHA ID (Optional)
            </label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              placeholder="14-digit ABHA number"
              className="w-full h-11 px-3.5 rounded-md border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <IconEmblem className="w-4 h-4 text-[#0D5C4E] shrink-0" />
            <span>
              The system will <strong>automatically assign the next sequential token number</strong> based on the last booked patient.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Generating Token..." : "Confirm & Assign Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorDashboard({ lang = "en" }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [editedSummary, setEditedSummary] = useState(null);
  const [editedAyush, setEditedAyush] = useState(null);
  const [activeTab, setActiveTab] = useState("clinical"); // "clinical" | "narrative" | "ai" | "ayush" | "docs" | "abha"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [approved, setApproved] = useState(false);

  // AI Patient Experience Narrative (Non-Diagnostic)
  const [narrativeReport, setNarrativeReport] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState("");

  // Patient Queue
  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [queueCategory, setQueueCategory] = useState("all"); // "all" | "ayush" | "general" | "integrated" | "priority"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sideAiOpen, setSideAiOpen] = useState(false);
  const [showRawFhir, setShowRawFhir] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Load Queue
  const loadQueue = useCallback(async () => {
    try {
      setQueueLoading(true);
      const data = await api.getSessions();
      setQueue(data || []);
    } catch {
      // Backend offline or error
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // Poll Queue
  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 6000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  // Fetch AI Narrative Summary
  const fetchNarrative = useCallback(async (id, refresh = false) => {
    if (!id) return;
    setNarrativeLoading(true);
    setNarrativeError("");
    try {
      const data = await api.getNarrativeSummary(id, { refresh });
      setNarrativeReport(data);
      if (refresh) {
        showToast("AI narrative summary refreshed!", "success");
      }
    } catch (err) {
      setNarrativeError(err.message || "Failed to generate AI narrative report");
      showToast("Error generating AI narrative summary", "error");
    } finally {
      setNarrativeLoading(false);
    }
  }, []);

  // Load active session
  const loadSession = useCallback(async (id) => {
    if (!id) {
      setSession(null);
      setNarrativeReport(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.getSession(id);
      setSession(data);
      setEditedSummary(data.summary || {});
      setEditedAyush(data.summary?.ayush_assessment || {});
      setApproved(Boolean(data.route));
      if (data.narrative_summary) {
        setNarrativeReport(data.narrative_summary);
      } else {
        setNarrativeReport(null);
      }
    } catch (err) {
      if (err?.status === 404) {
        // Patient session not found in active queue (e.g. from an earlier server run or expired token)
        try {
          const activeSessions = await api.getSessions();
          if (activeSessions && activeSessions.length > 0) {
            showToast("Previous patient record expired. Opening active patient from queue.", "info");
            navigate(`/doctor/${activeSessions[0].session_id}`, { replace: true });
            return;
          }
        } catch {
          // ignore
        }
        navigate("/doctor", { replace: true });
      } else {
        setError(t(lang, "backendOffline"));
      }
    } finally {
      setLoading(false);
    }
  }, [lang, navigate]);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    } else {
      setSession(null);
      setNarrativeReport(null);
    }
  }, [sessionId, loadSession]);

  // Auto-fetch narrative when narrative tab is selected and not yet cached
  useEffect(() => {
    if (activeTab === "narrative" && sessionId && !narrativeReport && !narrativeLoading) {
      fetchNarrative(sessionId);
    }
  }, [activeTab, sessionId, narrativeReport, narrativeLoading, fetchNarrative]);

  const handleApprove = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const mergedSummary = {
        ...(editedSummary || {}),
        ayush_assessment: editedAyush || {},
      };
      await api.route({ sessionId, physicianEdits: mergedSummary });
      await loadSession(sessionId);
      await loadQueue();
      setApproved(true);
      showToast("Case sheet approved & ABDM FHIR Bundle generated!", "success");
    } catch {
      setError(t(lang, "backendOffline"));
      showToast("Failed to save physician approval", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickBook = async (bookData) => {
    setBookingLoading(true);
    try {
      const res = await api.quickBook(bookData);
      setShowQuickBook(false);
      await loadQueue();
      if (res?.session_id) {
        navigate(`/doctor/${res.session_id}`);
      }
      showToast(`Booked ${res?.patient_name || "Patient"} successfully with Token #${res?.token_number}!`, "success");
    } catch (err) {
      showToast("Booking failed: " + (err.message || "Network error"), "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAppendToHpi = (notes) => {
    setEditedSummary((prev) => {
      const existing = prev?.hpi || "";
      const addition = `\n\n--- [AI Clinical Follow-up Notes] ---\n${notes}`;
      return {
        ...prev,
        hpi: existing ? existing + addition : notes,
      };
    });
    showToast("AI consultation findings appended to Patient HPI!", "success");
  };

  const handleDownloadFhir = () => {
    const bundle = session?.route?.fhir_bundle || {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: "Patient",
            name: [{ text: session?.patient_name || "Patient" }],
            identifier: [{ system: "https://healthid.ndhm.gov.in", value: session?.abha_id || "NOT_PROVIDED" }],
          },
        },
        {
          resource: {
            resourceType: "Composition",
            status: "final",
            title: "OPD Clinical Summary & Ayush Assessment",
            date: new Date().toISOString(),
            section: Object.entries(session?.summary || {}).map(([k, v]) => ({
              title: k,
              text: { status: "generated", div: typeof v === "string" ? v : JSON.stringify(v) },
            })),
          },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fhir_bundle_${session?.session_id || "patient"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("ABDM FHIR R4 Bundle downloaded successfully!", "success");
  };

  const handleDownloadNarrativeTxt = () => {
    if (!narrativeReport) {
      showToast("Please wait for the AI summary to load first", "error");
      return;
    }

    const patientName = session?.patient_name || "Patient";
    const token = session?.token_number || "—";
    const abha = session?.abha_id || "Unlinked";
    const dept = session?.department === "ayush" ? "Ayurveda OPD" : session?.department === "integrated" ? "Integrated OPD" : "General Medicine";
    const now = new Date().toLocaleString();

    const timelineText = (narrativeReport.symptom_progression_timeline || [])
      .map((item, idx) => `[${item.phase || `Stage ${idx + 1}`}]\n${item.description}`)
      .join("\n\n");

    const worsensList = (narrativeReport.aggravating_and_relieving?.what_worsens || [])
      .map((w) => `  • ${w}`)
      .join("\n") || "  • None reported";

    const helpsList = (narrativeReport.aggravating_and_relieving?.what_helps || [])
      .map((h) => `  • ${h}`)
      .join("\n") || "  • None reported";

    const cuesList = (narrativeReport.doctor_review_cues || [])
      .map((c, i) => `  ${i + 1}. ${c}`)
      .join("\n") || "  • Standard clinical evaluation";

    const docContent = `================================================================================
MINISTRY OF AYUSH & NATIONAL HEALTH MISSION • CLINICAL WORKSTATION
OUTPATIENT DEPARTMENT (OPD) - PATIENT EXPERIENCE SUMMARY REPORT
================================================================================
REPORT NATURE: AI-Synthesized Patient Experience & Lived Symptoms (NON-DIAGNOSTIC)
GENERATED ON:  ${now}
TOKEN NUMBER:  #${token}
PATIENT NAME:  ${patientName}
ABHA ID:       ${abha}
DEPARTMENT:    ${dept}
LANGUAGE:      ${session?.language === "hi" ? "Hindi (हिंदी)" : "English"}
================================================================================

1. WHAT THE PATIENT IS EXPERIENCING & FACING:
--------------------------------------------------------------------------------
Headline:
${narrativeReport.headline || "Patient Clinical Intake Summary"}

Patient Experience Story:
${narrativeReport.patient_story || "No narrative details recorded."}


2. FUNCTIONAL & DAILY LIFE IMPACT MATRIX:
--------------------------------------------------------------------------------
• Physical Mobility & Activities:
  ${narrativeReport.daily_life_impact?.physical_mobility || "Not reported"}

• Sleep & Rest Quality:
  ${narrativeReport.daily_life_impact?.sleep_and_rest || "Not reported"}

• Work & Daily Household Routine:
  ${narrativeReport.daily_life_impact?.work_and_routine || "Not reported"}

• Emotional & Psychological Toll:
  ${narrativeReport.daily_life_impact?.emotional_wellbeing || "Not reported"}


3. SYMPTOM PROGRESSION & CHRONOLOGY TIMELINE:
--------------------------------------------------------------------------------
${timelineText || "Chronology based on initial outpatient intake."}


4. AGGRAVATING FACTORS (TRIGGERS) & RELIEF MEASURES:
--------------------------------------------------------------------------------
[!] What Worsens / Triggers Discomfort:
${worsensList}

[✓] What Eases / Provides Comfort:
${helpsList}


5. HOLISTIC LIFESTYLE & CLINICAL INTAKE OBSERVATIONS:
--------------------------------------------------------------------------------
• Digestive Capacity (Agni) & Appetite:
  ${narrativeReport.holistic_lifestyle_observations?.appetite_and_digestion || "Not reported"}

• Bowel Elimination Habits (Koshtha):
  ${narrativeReport.holistic_lifestyle_observations?.bowel_and_elimination || "Not reported"}

• Diet & Daily Routine (Ahara-Vihara):
  ${narrativeReport.holistic_lifestyle_observations?.dietary_routine || "Not reported"}


6. ATTENDING PHYSICIAN EXAMINATION CUES (FOCUS AREAS):
--------------------------------------------------------------------------------
${cuesList}


================================================================================
CRITICAL MEDICAL SAFETY MANDATE & DISCLAIMER:
--------------------------------------------------------------------------------
${narrativeReport.safety_disclaimer || "CLINICAL SAFETY NOTICE: This AI summary report is purely descriptive of the patient's reported symptoms, bodily sensations, and functional challenges. In accordance with clinical safety guidelines, this report DOES NOT deliver a medical diagnosis. Formal clinical diagnosis and treatment plans are the exclusive responsibility of the consulting physician."}
================================================================================


ATTENDING PHYSICIAN IN-PERSON EVALUATION & OFFICIAL DIAGNOSIS:
--------------------------------------------------------------------------------
Attending Doctor's Official Clinical Diagnosis:
________________________________________________________________________________
________________________________________________________________________________

Clinical Orders / Prescriptions / Regimen:
________________________________________________________________________________
________________________________________________________________________________

Doctor Name & Registration Number: _____________________________________________

Doctor Signature & Hospital Stamp: _____________________________________________
Date: ________________________
================================================================================
`;

    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Patient_Summary_Token_${token}_${patientName.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("AI Summary Report downloaded successfully!", "success");
  };

  const filteredQueue = queue.filter((item) => {
    if (queueCategory === "ayush" && item.department !== "ayush") return false;
    if (queueCategory === "general" && item.department !== "general") return false;
    if (queueCategory === "integrated" && item.department !== "integrated") return false;
    if (queueCategory === "priority" && item.triage_level !== "emergency" && !item.triage_level?.includes("triage") && !item.summary?.red_flags?.length) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (item.patient_name && item.patient_name.toLowerCase().includes(q)) ||
      (item.token_number && String(item.token_number).includes(q)) ||
      (item.department && item.department.toLowerCase().includes(q)) ||
      (item.session_id && item.session_id.toLowerCase().includes(q))
    );
  });

  const abnormalCount = (session?.documents || []).reduce(
    (sum, doc) => sum + (doc.investigations || []).filter((i) => i.abnormal).length,
    0
  );

  const ayush = editedAyush || session?.summary?.ayush_assessment || {};
  const dashavidha = ayush.dashavidha_pariksha || {};

  return (
    <div className="h-screen bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] flex flex-col overflow-hidden print:bg-white print:p-0 print:h-auto print:overflow-visible">
      <QuickBookModal
        isOpen={showQuickBook}
        onClose={() => setShowQuickBook(false)}
        onBook={handleQuickBook}
        loading={bookingLoading}
      />

      {/* Top Ministry & Admin Portal Bar */}
      <div className="bg-[#0D5C4E] dark:bg-[#121C18] text-[#EAF3F0] dark:text-[#D3DDD8] text-xs px-4 sm:px-6 py-2.5 flex justify-between items-center print:hidden z-30 shrink-0">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#15806C] bg-[#09453A] text-[9px] font-bold text-white tracking-wider">GOI</span>
          <span className="font-bold tracking-wide">Ministry of Ayush</span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline text-emerald-300 font-semibold">OPD Physician Console (Admin Workstation)</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white px-2.5 py-1 rounded-lg font-sans text-xs font-semibold transition border border-emerald-700/60"
          >
            <IconLeaf className="w-4 h-4 text-[#0D5C4E] inline mr-1" />
            <span>Switch to Kiosk / Login</span>
          </Link>
          <span className="hidden md:inline bg-emerald-900 px-2 py-0.5 rounded text-emerald-300">
            Sequential Auto-Tokening Active
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live OPD Server</span>
          </span>
        </div>
      </div>

      {/* Main Layout: Sidebar (Queue) + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Patient Queue */}
        <aside
          className={`bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all duration-200 z-20 print:hidden ${
            sidebarOpen ? "w-80 sm:w-96" : "w-16"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            {sidebarOpen ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <IconEmblem className="w-4 h-4 text-[#0D5C4E] inline mr-1" />
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Live Patient Queue
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {queue.length} Active {queue.length === 1 ? "Patient" : "Patients"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowQuickBook(true)}
                    title="Book Walk-in Patient (Auto-Token)"
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>+</span>
                    <span className="hidden sm:inline">Book</span>
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    title="Collapse Queue"
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 text-xs"
                  >
                    ◀
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full py-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  title="Expand Queue"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 text-sm"
                >
                  ▶
                </button>
                <button
                  onClick={() => setShowQuickBook(true)}
                  title="Quick Book"
                  className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <>
              {/* Search Box & Category Filters */}
              <div className="p-2.5 border-b border-slate-100 bg-white space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search name, token #..."
                    className="w-full h-8 pl-7 pr-3 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none border border-transparent focus:border-emerald-500"
                  />
                  <span className="absolute left-2.5 top-2.5 text-[#4A5852]"><IconSearch className="w-3.5 h-3.5" /></span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "ayush", label: "Ayush OPD" },
                    { id: "general", label: "General Med" },
                    { id: "integrated", label: "Integrated" },
                    { id: "priority", label: "Priority / Alert" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setQueueCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition ${
                        queueCategory === cat.id
                          ? "bg-emerald-800 text-white "
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {queueLoading && queue.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                    Refreshing OPD Queue...
                  </div>
                )}

                {filteredQueue.length === 0 && !queueLoading && (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-xs text-slate-500">No patients in queue</p>
                    <button
                      onClick={() => setShowQuickBook(true)}
                      className="text-xs text-emerald-700 font-bold underline"
                    >
                      Book First Patient
                    </button>
                  </div>
                )}

                {filteredQueue.map((item) => {
                  const isSelected = item.session_id === sessionId;
                  return (
                    <div
                      key={item.session_id}
                      onClick={() => navigate(`/doctor/${item.session_id}`)}
                      className={`p-3 cursor-pointer transition flex items-start justify-between gap-2.5 ${
                        isSelected
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 ring-1 ring-inset ring-emerald-600/40 rounded-md "
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-md"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#121C18] text-[#FAFBF9] font-mono">
                            #{item.token_number ?? "—"}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.patient_name || "Guest Patient"}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                              item.department === "ayush"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.department === "integrated"
                                ? "bg-white text-[#121C18] border border-[#D3DDD8]"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.department === "ayush"
                              ? "Ayush"
                              : item.department === "integrated"
                              ? "Integ."
                              : "General"}
                          </span>
                          {item.created_at && (
                            <span>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          )}
                        </div>

                        {item.chief_complaint && (
                          <p className="text-[11px] text-slate-600 truncate mt-1 italic">
                            "{item.chief_complaint}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {item.red_flag && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase animate-pulse">
                            Triage
                          </span>
                        )}
                        {item.has_route ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            ✓ Done
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#4A5852] font-semibold bg-[#FAFBF9] px-1.5 py-0.5 rounded-sm border border-[#121C18]/15 text-[#4A5852]">
                            Waiting
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  onClick={loadQueue}
                  className="flex items-center gap-1 hover:text-emerald-700 font-medium"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
                <button
                  onClick={() => setShowQuickBook(true)}
                  className="font-bold text-emerald-700 hover:text-emerald-800"
                >
                  + New Walk-in
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Right Main Area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
          {/* If No Session Selected: Show Queue Dashboard View */}
          {!sessionId && (
            <div className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
              {/* Institutional Gazette Docket Header */}
              <div className="rounded-md border-t-4 border-[#0D5C4E] border-x border-b border-[#121C18]/15 bg-white dark:bg-[#15201C] p-6 sm:p-8 text-[#121C18] dark:text-[#F2F6F4]">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-[#0D5C4E] text-[11px] font-bold text-white tracking-widest font-mono">
                      GOI
                    </span>
                    <div>
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[#4A5852] font-mono">
                        Ministry of Ayush • National Ayush Mission
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4] mt-0.5">
                        OPD Clinical Workstation & Consultation Registry
                      </h1>
                    </div>
                  </div>
                  <p className="text-sm text-[#4A5852] dark:text-[#9AA5A0] leading-relaxed">
                    Standardized clinical intake verification, Ayush Dashavidha diagnostic assessment matrix, and ABDM interoperable EHR records.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowQuickBook(true)}
                      className="px-4 py-2.5 rounded-sm bg-[#0D5C4E] hover:bg-[#09453A] text-white font-bold text-xs transition flex items-center gap-2"
                    >
                      <IconTicket className="w-3.5 h-3.5" />
                      <span>Register Walk-in Patient</span>
                    </button>
                    {queue.length > 0 && (
                      <button
                        onClick={() => navigate(`/doctor/${queue[0].session_id}`)}
                        className="px-4 py-2.5 rounded-sm border border-[#0D5C4E] text-[#0D5C4E] hover:bg-[#0D5C4E]/5 font-bold text-xs transition flex items-center gap-2"
                      >
                        <IconClipboard className="w-3.5 h-3.5" />
                        <span>Call Next Patient: Token #{queue[0].token_number ?? "1"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contiguous Clinical Ledger Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#121C18]/15 bg-white dark:bg-[#15201C] rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-[#121C18]/12">
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] text-[#4A5852] font-bold uppercase tracking-wider block font-mono">Total Booked</span>
                  <p className="text-2xl font-bold font-mono text-[#121C18] dark:text-white mt-1">{queue.length}</p>
                  <span className="text-[11px] text-[#4A5852] font-mono">Sequential tokens</span>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] text-[#4A5852] font-bold uppercase tracking-wider block font-mono">Awaiting Consult</span>
                  <p className="text-2xl font-bold font-mono text-[#0D5C4E] mt-1">
                    {queue.filter((q) => !q.has_route).length}
                  </p>
                  <span className="text-[11px] text-[#4A5852] font-mono">In waiting room</span>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] text-[#4A5852] font-bold uppercase tracking-wider block font-mono">Priority Triages</span>
                  <p className="text-2xl font-bold font-mono text-[#B91C1C] mt-1">
                    {queue.filter((q) => q.red_flag).length}
                  </p>
                  <span className="text-[11px] text-[#B91C1C] font-mono font-medium">Red flag alert</span>
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] text-[#4A5852] font-bold uppercase tracking-wider block font-mono">Next Token Up</span>
                  <p className="text-2xl font-bold font-mono text-[#0D5C4E] mt-1">
                    #{queue.find((q) => !q.has_route)?.token_number ?? (queue.length > 0 ? (Math.max(...queue.map((q) => q.token_number || 0)) + 1) : 1)}
                  </p>
                  <span className="text-[11px] text-[#4A5852] font-mono">Ready for consult</span>
                </div>
              </div>

              {/* Waiting Patients Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <IconClipboard className="w-3.5 h-3.5" />
                    <span>Patients in OPD Queue</span>
                  </h3>
                  <button
                    onClick={loadQueue}
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
                  >
                    <span className="inline-flex items-center gap-1"><IconRefresh className="w-3 h-3" /> Refresh</span>
                  </button>
                </div>

                {queue.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded border border-[#D3DDD8] dark:border-[#24352F] flex items-center justify-center text-[#4A5852]"><IconClipboard className="w-6 h-6" /></div>
                    <p className="text-sm text-slate-600 font-medium">No patients currently registered.</p>
                    <button
                      onClick={() => setShowQuickBook(true)}
                      className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-md"
                    >
                      Book Walk-in Patient Now
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-3 px-4">Token</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Chief Concern</th>
                          <th className="py-3 px-4">Triage</th>
                          <th className="py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queue.map((p) => (
                          <tr key={p.session_id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-bold font-mono text-emerald-800 text-sm">
                              #{p.token_number ?? "—"}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {p.patient_name || "Guest Patient"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-sm font-mono text-[11px] ${
                                  p.department === "ayush"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.department === "integrated"
                                    ? "bg-white text-[#121C18] border border-[#D3DDD8]"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {p.department === "ayush"
                                  ? "Ayurveda"
                                  : p.department === "integrated"
                                  ? "Integrated"
                                  : "General"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 italic truncate max-w-xs">
                              {p.chief_complaint || "Awaiting intake"}
                            </td>
                            <td className="py-3 px-4">
                              {p.red_flag ? (
                                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] uppercase">
                                  Priority
                                </span>
                              ) : p.has_route ? (
                                <span className="text-emerald-700 font-semibold text-[11px]">Completed</span>
                              ) : (
                                <span className="text-[#4A5852] font-semibold text-[11px]">Waiting</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => navigate(`/doctor/${p.session_id}`)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1"
                              >
                                <span>Open Case</span>
                                
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Session Content */}
          {sessionId && (
            <>
              {loading && (
                <div className="p-12 text-center text-slate-500 font-medium">
                  {t(lang, "loading")}
                </div>
              )}

              {error && !loading && (
                <div className="p-10 text-center space-y-4 max-w-md mx-auto my-auto">
                  <div className="w-12 h-12 rounded-md border border-[#B91C1C] bg-[#FEF2F2] flex items-center justify-center mx-auto">
                    <IconAlert className="w-7 h-7 text-[#B91C1C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Connection Notice
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {error}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        navigate("/doctor", { replace: true });
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold transition"
                    >
                      Go to OPD Queue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        if (sessionId) loadSession(sessionId);
                      }}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-bold transition"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              )}

              {session && !loading && (
                <div className="flex-1 flex flex-col">
                  {/* Red Flag Alert Banner */}
                  {session.red_flag && (
                    <div className="bg-rose-600 text-white px-6 py-3.5 flex items-center justify-between gap-3 print:hidden">
                      <div className="flex items-center gap-3">
                        <IconAlert className="w-6 h-6 text-white shrink-0" />
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wider">
                            {t(lang, "dashboardRedFlag")}
                          </p>
                          {session.red_flag_reason && (
                            <p className="text-xs text-rose-100 font-medium">
                              {session.red_flag_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="bg-white text-[#B91C1C] text-xs font-bold px-2.5 py-0.5 rounded-sm uppercase font-mono">
                        Priority Triage
                      </span>
                    </div>
                  )}

                  {/* Patient Header Banner */}
                  <header className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-950 flex items-center gap-2">
                          <span>{session.patient_name || "Guest Patient"}</span>
                          <span className="text-xs bg-[#0D5C4E] text-white font-bold px-2.5 py-1 rounded-sm border border-[#0D5C4E] font-mono">
                            Token #{session.token_number || "—"}
                          </span>
                        </h1>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-sm font-mono ${
                            session.department === "ayush"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : session.department === "integrated"
                              ? "bg-white text-[#121C18] border border-[#D3DDD8]"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {session.department === "ayush"
                            ? "Ayurveda OPD"
                            : session.department === "integrated"
                            ? "Integrated OPD"
                            : "General Medicine"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span>
                          ABHA: <strong className="text-slate-800 font-mono">{session.abha_id || "Unlinked"}</strong>
                        </span>
                        <span>Lang: {session.language === "hi" ? "हिंदी" : "English"}</span>
                        <span>Recorded: {new Date(session.created_at).toLocaleTimeString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 print:hidden">
                      {/* AI Patient Summary Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("narrative");
                          if (!narrativeReport && sessionId) {
                            fetchNarrative(sessionId);
                          }
                        }}
                        className={`px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5  transition border ${
                          activeTab === "narrative"
                            ? "bg-emerald-800 text-white border-emerald-800 ring-2 ring-emerald-600/30"
                            : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                        }`}
                        title="View empathetic AI summary of what the patient is facing (Non-Diagnostic)"
                      >
                        <IconClipboard className="w-3.5 h-3.5" />
                        <span>AI Summary Report</span>
                      </button>

                      {/* Toggle Dock AI Assistant */}
                      <button
                        type="button"
                        onClick={() => setSideAiOpen((prev) => !prev)}
                        className={`px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5  transition border ${
                          sideAiOpen
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }`}
                        title="Open AI Diagnostic Assistant Side-by-Side"
                      >
                        <IconStethoscope className="w-3.5 h-3.5" />
                        <span>{sideAiOpen ? "Hide AI Sidecar" : "Dock AI Assistant"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <IconPrinter className="w-3.5 h-3.5" />
                        <span>{t(lang, "printCaseSheet")}</span>
                      </button>

                      <button
                        onClick={handleApprove}
                        disabled={saving}
                        className={`px-4 sm:px-5 py-2 rounded-md font-bold text-xs sm:text-sm flex items-center gap-2  transition-all ${
                          approved
                            ? "bg-emerald-700 text-white "
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <span>{approved ? t(lang, "dashboardApproved") : t(lang, "dashboardApprove")}</span>
                      </button>
                    </div>
                  </header>

                  {/* Tabs Navigation */}
                  <div className="px-6 pt-3 bg-[#FAFBF9] dark:bg-[#0E1513] print:hidden">
                    <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 overflow-x-auto">
                      {[
                        { id: "clinical", label: t(lang, "tabClinical"), icon: "" },
                        { id: "narrative", label: "Clinical Summary & HPI", icon: "" },
                        { id: "ai", label: "Differential Diagnostic Probe", icon: "" },
                        { id: "ayush", label: t(lang, "tabAyush"), icon: "" },
                        { id: "docs", label: `${t(lang, "tabDocs")} (${(session.documents || []).length})`, icon: "" },
                        { id: "abha", label: "ABHA Record & History", icon: "" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id
                              ? "border-emerald-600 text-emerald-800 bg-emerald-50/50"
                              : "border-transparent text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                          {tab.id === "docs" && abnormalCount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-[#B91C1C] text-white rounded-sm font-mono">
                              {abnormalCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Work Area: Supports Optional Docked Sidecar */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Primary Tab Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                      {/* TAB 1: Clinical Case Summary */}
                      {(activeTab === "clinical" || window.matchMedia?.("print").matches) && (
                        <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-5">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <IconClipboard className="w-3.5 h-3.5" />
                              <span>Standard Clinical Intake Summary (Physician Draft)</span>
                            </h2>
                            <span className="text-xs text-slate-500 italic">Editable before approval</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {SUMMARY_FIELDS.map(([key, label]) => (
                              <div
                                key={key}
                                className={key === "chief_complaint" || key === "hpi" ? "md:col-span-2" : ""}
                              >
                                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
                                  {label}
                                </label>
                                <textarea
                                  value={editedSummary?.[key] ?? ""}
                                  onChange={(e) =>
                                    setEditedSummary((prev) => ({ ...prev, [key]: e.target.value }))
                                  }
                                  rows={key === "hpi" ? 4 : 2}
                                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 focus:bg-white leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAB: AI Patient Experience Narrative Summary (Strictly Non-Diagnostic) */}
                      {activeTab === "narrative" && (
                        <div className="space-y-6">
                          {/* Top Controls Bar */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded border border-[#D3DDD8] bg-[#FAFBF9] text-[#0D5C4E] flex items-center justify-center">
                                <IconClipboard className="w-4 h-4" />
                              </span>
                              <div>
                                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                  <span>AI-Synthesized Patient Experience Report</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#FAFBF9] text-[#0D5C4E] font-bold uppercase tracking-wider border border-[#121C18]/20 font-mono">
                                    Non-Diagnostic
                                  </span>
                                </h2>
                                <p className="text-xs text-slate-500">
                                  Empathetic synthesis of what the patient is facing and enduring in daily life. Clinical diagnosis reserved for the attending physician.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => fetchNarrative(sessionId, true)}
                                disabled={narrativeLoading}
                                className="px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                title="Re-synthesize narrative with Medical AI"
                              >
                                <IconRefresh className={`w-3.5 h-3.5 ${narrativeLoading ? "animate-spin" : ""}`} />
                                <span>{narrativeLoading ? "Synthesizing..." : "Refresh AI Analysis"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleDownloadNarrativeTxt}
                                disabled={narrativeLoading || !narrativeReport}
                                className="px-3.5 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                title="Download complete OPD narrative summary as a formatted medical document"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                <span>Download Summary Report (.txt)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                                title="Print report or save as PDF"
                              >
                                <IconPrinter className="w-3.5 h-3.5" />
                                <span>Print / PDF</span>
                              </button>
                            </div>
                          </div>

                          {narrativeLoading && !narrativeReport && (
                            <div className="bg-white rounded-lg p-12 border border-slate-200 text-center space-y-3">
                              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
                              <h3 className="text-sm font-bold text-slate-800">
                                Synthesizing Patient Experience with Medical AI...
                              </h3>
                              <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Analyzing intake responses, timeline progression, lifestyle factors, and functional challenges to construct an empathetic, non-diagnostic overview.
                              </p>
                            </div>
                          )}

                          {narrativeError && !narrativeReport && (
                            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3">
                              <IconAlert className="w-5 h-5 text-[#B91C1C]" />
                              <p className="text-xs font-bold text-rose-800">{narrativeError}</p>
                              <button
                                onClick={() => fetchNarrative(sessionId, true)}
                                className="px-4 py-2 rounded-md bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition"
                              >
                                Try Again
                              </button>
                            </div>
                          )}

                          {narrativeReport && (
                            <div className="space-y-6">
                              {/* 1. Hero Headline & Lived Experience Story Card */}
                              <div className="rounded-lg border border-[#D3DDD8] bg-white dark:bg-[#15201C] p-6 space-y-5">
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                                  <div className="flex items-center gap-2.5">
                                    <span className="px-2.5 py-0.5 rounded-sm bg-[#0D5C4E] text-white text-xs font-bold font-mono">
                                      Token #{session.token_number || "—"}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-extrabold text-slate-950">
                                      {session.patient_name || "Patient"} • Clinical Intake Narrative
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-medium">
                                      Recorded: {new Date(session.created_at || Date.now()).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs font-bold text-[#0D5C4E] bg-[#FAFBF9] px-2 py-0.5 rounded-sm border border-[#121C18]/20 font-mono uppercase">
                                      Doctor Eyes Only
                                    </span>
                                  </div>
                                </div>

                                {/* Headline Banner */}
                                <div className="p-4 bg-emerald-900 text-white rounded-lg flex items-start gap-3">
                                  <IconClipboard className="w-4 h-4 text-[#0D5C4E] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block mb-0.5">
                                      Primary Patient Experience Headline
                                    </span>
                                    <h4 className="text-sm sm:text-base font-bold leading-snug">
                                      "{narrativeReport.headline}"
                                    </h4>
                                  </div>
                                </div>

                                {/* Patient Narrative Story */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <IconClipboard className="w-3.5 h-3.5" />
                                    <span>What the Patient is Facing & Enduring (Daily Reality)</span>
                                  </div>
                                  <div className="p-5 bg-white rounded-lg border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal space-y-3">
                                    {narrativeReport.patient_story}
                                  </div>
                                </div>
                              </div>

                              {/* 2. Functional & Daily Life Impact (4-card Grid) */}
                              <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                  <IconAlert className="w-3.5 h-3.5" />
                                  <span>Daily Life & Functional Impact Assessment</span>
                                </h3>
                                <div className="rounded-lg border border-[#D3DDD8] bg-white divide-y divide-[#D3DDD8]">
                                  <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E]">Physical Mobility</span>
                                    <p className="sm:col-span-3 text-xs sm:text-sm text-[#121C18] leading-relaxed">
                                      {narrativeReport.daily_life_impact?.physical_mobility || "No specific mobility limitation reported."}
                                    </p>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E]">Sleep & Rest</span>
                                    <p className="sm:col-span-3 text-xs sm:text-sm text-[#121C18] leading-relaxed">
                                      {narrativeReport.daily_life_impact?.sleep_and_rest || "Sleep pattern within acceptable limits."}
                                    </p>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E]">Work & Routine</span>
                                    <p className="sm:col-span-3 text-xs sm:text-sm text-[#121C18] leading-relaxed">
                                      {narrativeReport.daily_life_impact?.work_and_routine || "Managing daily tasks without major disruption."}
                                    </p>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E]">Emotional Toll</span>
                                    <p className="sm:col-span-3 text-xs sm:text-sm text-[#121C18] leading-relaxed">
                                      {narrativeReport.daily_life_impact?.emotional_wellbeing || "Emotional resilience appears stable."}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Symptom Progression & Chronology Timeline */}
                              {narrativeReport.symptom_progression_timeline?.length > 0 && (
                                <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <IconRefresh className="w-3.5 h-3.5" />
                                    <span>Symptom Progression & Chronological Timeline</span>
                                  </h3>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {narrativeReport.symptom_progression_timeline.map((step, idx) => (
                                      <div
                                        key={idx}
                                        className="p-4 rounded-md bg-slate-50 border border-slate-200 relative"
                                      >
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <span className="w-6 h-6 rounded-sm bg-[#0D5C4E] text-white font-bold text-[11px] flex items-center justify-center font-mono">
                                            {idx + 1}
                                          </span>
                                          <h4 className="text-xs font-bold text-slate-900">{step.phase}</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 4. Aggravating Triggers & Relieving Measures */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Triggers */}
                                <div className="bg-white rounded-lg p-5 border border-rose-200 space-y-3">
                                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-rose-100">
                                    <IconAlert className="w-3.5 h-3.5 text-[#B91C1C]" />
                                    <span>Aggravating Triggers (What Worsens Symptoms)</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(narrativeReport.aggravating_and_relieving?.what_worsens || []).map((t, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 rounded-md text-xs bg-rose-50 text-rose-900 border border-rose-200 font-medium flex items-center gap-1.5"
                                      >
                                        <span className="text-rose-500 font-bold">•</span>
                                        <span>{t}</span>
                                      </span>
                                    ))}
                                    {(!narrativeReport.aggravating_and_relieving?.what_worsens || narrativeReport.aggravating_and_relieving.what_worsens.length === 0) && (
                                      <span className="text-xs text-slate-400 italic">None reported.</span>
                                    )}
                                  </div>
                                </div>

                                {/* Relief Measures */}
                                <div className="bg-white rounded-lg p-5 border border-emerald-200 space-y-3">
                                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-emerald-100">
                                    <IconEmblem className="w-3.5 h-3.5" />
                                    <span>Relieving Measures (What Provides Ease)</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(narrativeReport.aggravating_and_relieving?.what_helps || []).map((h, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 rounded-md text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium flex items-center gap-1.5"
                                      >
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>{h}</span>
                                      </span>
                                    ))}
                                    {(!narrativeReport.aggravating_and_relieving?.what_helps || narrativeReport.aggravating_and_relieving.what_helps.length === 0) && (
                                      <span className="text-xs text-slate-400 italic">None reported.</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 5. Holistic & Intake Observations */}
                              {narrativeReport.holistic_lifestyle_observations && (
                                <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <IconLeaf className="w-4 h-4 text-[#0D5C4E] inline mr-1" />
                                    <span>Holistic & Constitutional Intake Factors</span>
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                      <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        Agni & Metabolic State
                                      </span>
                                      <p className="mt-1 font-medium text-slate-800">
                                        {narrativeReport.holistic_lifestyle_observations.appetite_and_digestion}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                      <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        Koshtha & Bowel Habit
                                      </span>
                                      <p className="mt-1 font-medium text-slate-800">
                                        {narrativeReport.holistic_lifestyle_observations.bowel_and_elimination}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                      <span className="block text-[10px] font-bold uppercase text-slate-400">
                                        Ahara-Vihara & Diet Routine
                                      </span>
                                      <p className="mt-1 font-medium text-slate-800">
                                        {narrativeReport.holistic_lifestyle_observations.dietary_routine}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 6. Attending Doctor Focus Cues */}
                              {narrativeReport.doctor_review_cues?.length > 0 && (
                                <div className="bg-slate-900 text-white rounded-lg p-5 space-y-3">
                                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                    <IconSearch className="w-3.5 h-3.5" />
                                    <span>Attending Physician Physical Exam & Follow-up Cues</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {narrativeReport.doctor_review_cues.map((cue, i) => (
                                      <div key={i} className="p-3 bg-slate-800/80 rounded-md border border-slate-700 text-xs flex items-start gap-2">
                                        <span className="text-emerald-400 font-bold font-mono">#{i + 1}</span>
                                        <p className="text-slate-200 leading-relaxed">{cue}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 7. STRICT NON-DIAGNOSTIC CLINICAL SAFETY NOTICE */}
                              <div className="p-4 bg-[#FAFBF9] border border-[#D3DDD8] rounded-lg flex items-start gap-3 text-[#121C18]">
                                <IconEmblem className="w-4 h-4 text-[#0D5C4E] shrink-0 mt-0.5" />
                                <div className="text-xs leading-relaxed space-y-1">
                                  <strong className="block font-bold text-[#121C18] uppercase tracking-wide">
                                    Mandatory Clinical Safety Notice & Non-Diagnostic Guarantee
                                  </strong>
                                  <p>{narrativeReport.safety_disclaimer}</p>
                                </div>
                              </div>

                              {/* 8. Attending Physician In-Person Diagnosis & Clinical Action */}
                              <div className="bg-white rounded-lg p-6 border-2 border-slate-300 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <IconClipboard className="w-3.5 h-3.5" />
                                    <span>Attending Physician Official Clinical Assessment & Diagnosis</span>
                                  </h3>
                                  <span className="text-xs text-slate-500 font-medium">To be entered during consult</span>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                      Official Diagnosis (Documented Exclusively by Consulting Doctor)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Primary Knee Osteoarthritis (Grade II) / Sandhigata Vata with Asthi Kshaya"
                                      className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                      Consultation Orders / Pharmacological & Ayush Regimen
                                    </label>
                                    <textarea
                                      rows={2}
                                      placeholder="Document prescribed medications, dosage instructions, panchakarma therapies, and dietary precautions..."
                                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
                                  <span>Preserved under Digital Health Record (ABDM FHIR R4)</span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={handleDownloadNarrativeTxt}
                                      className="font-bold text-emerald-700 hover:text-emerald-800 underline"
                                    >
                                      Download Summary (.txt)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleApprove}
                                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md transition"
                                    >
                                      Approve & Link to ABHA Record
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === "ai" && (
                        <div className="h-[650px]">
                          <DiseaseAwareChatbot
                            currentSession={session}
                            onAppendToHpi={handleAppendToHpi}
                          />
                        </div>
                      )}

                      {/* TAB 3: AYUSH Dashavidha Pariksha */}
                      {activeTab === "ayush" && (
                        <div className="space-y-6">
                          {/* Primary Ayurvedic Assessment Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Prakriti Card */}
                            <div className="bg-white rounded-lg p-5 border border-emerald-200 relative overflow-hidden">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                  {t(lang, "prakritiTitle")}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                                  Constitution
                                </span>
                              </div>
                              <textarea
                                value={editedAyush?.prakriti_assessment ?? ""}
                                onChange={(e) =>
                                  setEditedAyush((prev) => ({ ...prev, prakriti_assessment: e.target.value }))
                                }
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white"
                              />
                            </div>

                            {/* Vikriti Card */}
                            <div className="bg-white rounded-lg p-5 border border-[#D3DDD8] relative overflow-hidden">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#4A5852]">
                                  {t(lang, "vikritiTitle")}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-[#FAFBF9] text-[#4A5852] border border-[#D3DDD8] font-bold rounded">
                                  Current Imbalance
                                </span>
                              </div>
                              <textarea
                                value={editedAyush?.vikriti_assessment ?? ""}
                                onChange={(e) =>
                                  setEditedAyush((prev) => ({ ...prev, vikriti_assessment: e.target.value }))
                                }
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white"
                              />
                            </div>

                            {/* Agni Card */}
                            <div className="bg-white rounded-lg p-5 border border-[#121C18]/15">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E]">
                                  {t(lang, "agniTitle")}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-[#FAFBF9] text-[#0D5C4E] border border-[#121C18]/15 font-bold rounded-sm font-mono">
                                  Metabolism
                                </span>
                              </div>
                              <input
                                value={editedAyush?.agni_status ?? ""}
                                onChange={(e) =>
                                  setEditedAyush((prev) => ({ ...prev, agni_status: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white"
                              />
                            </div>

                            {/* Koshtha Card */}
                            <div className="bg-white rounded-lg p-5 border border-[#121C18]/15">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E]">
                                  {t(lang, "koshthaTitle")}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-[#FAFBF9] text-[#0D5C4E] border border-[#121C18]/15 font-bold rounded-sm font-mono">
                                  Bowel Habit
                                </span>
                              </div>
                              <input
                                value={editedAyush?.koshtha_status ?? ""}
                                onChange={(e) =>
                                  setEditedAyush((prev) => ({ ...prev, koshtha_status: e.target.value }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white"
                              />
                            </div>
                          </div>

                          {/* Ahara-Vihara & Nidana */}
                          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <IconLeaf className="w-3.5 h-3.5" />
                              <span>{t(lang, "aharaViharaTitle")}</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Dietary & Lifestyle Patterns (Ahara-Vihara)
                                </label>
                                <textarea
                                  value={editedAyush?.ahara_vihara_analysis ?? ""}
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, ahara_vihara_analysis: e.target.value }))
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50 focus:bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Etiological & Lifestyle Triggers (Nidana Factors)
                                </label>
                                <textarea
                                  value={editedAyush?.nidana_factors ?? ""}
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, nidana_factors: e.target.value }))
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50 focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Dashavidha Pariksha Matrix */}
                          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                                <IconClipboard className="w-3.5 h-3.5" />
                                <span>{t(lang, "dashavidhaTitle")}</span>
                              </h3>
                              <span className="text-xs text-emerald-700 font-semibold">
                                Charaka Samhita Vimanashana 8/94
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { key: "sara", label: t(lang, "sara"), val: dashavidha.sara || "Madhyama" },
                                { key: "samhanana", label: t(lang, "samhanana"), val: dashavidha.samhanana || "Madhyama" },
                                { key: "pramana", label: t(lang, "pramana"), val: dashavidha.pramana || "Normal" },
                                { key: "satmya", label: t(lang, "satmya"), val: dashavidha.satmya || "Mixed" },
                                { key: "sattva", label: t(lang, "sattva"), val: dashavidha.sattva || "Madhyama" },
                                { key: "ahara_shakti", label: t(lang, "aharaShakti"), val: dashavidha.ahara_shakti || "Normal" },
                                { key: "vyayama_shakti", label: t(lang, "vyayamaShakti"), val: dashavidha.vyayama_shakti || "Moderate" },
                                { key: "vaya", label: t(lang, "vaya"), val: dashavidha.vaya || "Madhyama Vaya" },
                              ].map((item) => (
                                <div key={item.key} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                  <span className="block text-[11px] font-bold text-slate-500 uppercase leading-tight">
                                    {item.label}
                                  </span>
                                  <span className="block text-xs font-semibold text-emerald-950 mt-1">
                                    {item.val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: Prior Documents & Labs */}
                      {activeTab === "docs" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900">{t(lang, "tabDocs")}</h2>
                            {abnormalCount > 0 && (
                              <span className="text-xs font-bold text-[#B91C1C] bg-[#FEF2F2] px-2.5 py-0.5 rounded-sm border border-[#B91C1C]/30 font-mono">
                                {abnormalCount} {t(lang, "abnormal")} Findings Detected
                              </span>
                            )}
                          </div>

                          {(session.documents || []).length === 0 && (
                            <div className="bg-white rounded-lg p-8 text-center border border-slate-200 text-slate-500 text-sm">
                              No physical documents uploaded during intake.
                            </div>
                          )}

                          <div className="space-y-4">
                            {(session.documents || []).map((doc, idx) => (
                              <div key={doc.id || idx} className="bg-white rounded-lg p-5 border border-slate-200">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-3">
                                  <div className="flex items-center gap-2 font-bold text-slate-900 capitalize text-sm">
                                    <IconFileText className="w-3.5 h-3.5" />
                                    <span>{(doc.document_type || "Document").replace("_", " ")}</span>
                                  </div>
                                  <span className="text-xs text-slate-500 font-mono">
                                    {doc.date ? `Date: ${doc.date}` : "Date: Not specified"}
                                  </span>
                                </div>

                                {doc.diagnoses?.length > 0 && (
                                  <p className="text-sm mb-2 text-slate-800">
                                    <strong className="text-slate-600">Extracted Diagnoses: </strong>
                                    {doc.diagnoses.join(", ")}
                                  </p>
                                )}

                                {doc.medications?.length > 0 && (
                                  <div className="mb-3">
                                    <strong className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                                      Prescribed Medications
                                    </strong>
                                    <div className="flex flex-wrap gap-1.5">
                                      {doc.medications.map((m, i) => (
                                        <span
                                          key={i}
                                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-800 border border-slate-200"
                                        >
                                          {m.name} {m.dosage ? `(${m.dosage})` : ""}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {doc.investigations?.length > 0 && (
                                  <div>
                                    <strong className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                                      Laboratory / Diagnostic Test Results
                                    </strong>
                                    <div className="overflow-x-auto border border-slate-200 rounded-md">
                                      <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                                          <tr>
                                            <th className="py-2 px-3">Test Parameter</th>
                                            <th className="py-2 px-3">Observed Value</th>
                                            <th className="py-2 px-3">Reference Range</th>
                                            <th className="py-2 px-3">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {doc.investigations.map((inv, i) => (
                                            <tr
                                              key={i}
                                              className={inv.abnormal ? "bg-rose-50/80 font-bold text-rose-800" : "text-slate-800"}
                                            >
                                              <td className="py-2 px-3">{inv.test}</td>
                                              <td className="py-2 px-3">{inv.value}</td>
                                              <td className="py-2 px-3 text-slate-500">{inv.reference_range || "—"}</td>
                                              <td className="py-2 px-3">
                                                {inv.abnormal ? (
                                                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                                                    ABNORMAL
                                                  </span>
                                                ) : (
                                                  <span className="text-emerald-700 font-medium text-[11px]">Normal</span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {doc.extraction_notes && (
                                  <p className="text-xs text-slate-500 italic mt-3 bg-slate-50 p-2 rounded-lg">
                                    Note: {doc.extraction_notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAB 5: ABHA Card & Linked Hospital Treatment Records */}
                      {activeTab === "abha" && (
                        <div className="space-y-6">
                          {/* 1. Official Visual ABHA Digital Health ID Card */}
                          <div className="max-w-2xl mx-auto bg-white dark:bg-[#15201C] rounded-md border border-[#121C18]/20 overflow-hidden">
                            {/* Tricolor Top Stripe */}
                            <div className="h-1 w-full bg-[#0D5C4E]"></div>

                            {/* Card Header */}
                            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-[#15806C] bg-[#09453A] text-[10px] font-bold text-white tracking-wider">GOI</span>
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                    राष्ट्रीय स्वास्थ्य प्राधिकरण • National Health Authority
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    स्वास्थ्य एवं परिवार कल्याण मंत्रालय • Ministry of Health & Family Welfare
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#FAFBF9] text-[#0D5C4E] border border-[#0D5C4E] font-mono">
                                  ✓ ABHA Verified
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                              {/* Left: Patient Avatar */}
                              <div className="flex flex-col items-center text-center space-y-2">
                                <div className="w-24 h-24 rounded-lg bg-[#0D5C4E] flex items-center justify-center text-white text-4xl border border-[#0D5C4E]">
                                  <IconUser className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Digital Health ID
                                </span>
                              </div>

                              {/* Middle: Patient Identity Details */}
                              <div className="space-y-2 sm:col-span-1">
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    Name / नाम
                                  </span>
                                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                    {session.patient_name || "Guest Patient"}
                                  </h3>
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    ABHA Number / आभा संख्या
                                  </span>
                                  <p className="text-xs font-mono font-bold text-emerald-900 tracking-wide bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                                    {session.abha_id || "91-4523-8819-2041"}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    ABHA Address / आभा पता
                                  </span>
                                  <p className="text-xs font-mono text-slate-700">
                                    {(session.patient_name || "patient").toLowerCase().replace(/\s+/g, ".")}@abdm
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                                  <div>
                                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Gender</span>
                                    <span>{session.patient_name?.toLowerCase().includes("devi") || session.patient_name?.toLowerCase().includes("meera") ? "Female" : "Male"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-bold uppercase text-slate-400 block">DOB / Age</span>
                                    <span>1974 (52 Yrs)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Scannable QR Code */}
                              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-center">
                                {/* SVG QR Representation */}
                                <div className="w-24 h-24 bg-slate-900 p-2 rounded-md flex items-center justify-center text-white">
                                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                                    <rect x="10" y="10" width="25" height="25" fill="white" />
                                    <rect x="15" y="15" width="15" height="15" fill="#0f172a" />
                                    <rect x="18" y="18" width="9" height="9" fill="white" />
                                    <rect x="65" y="10" width="25" height="25" fill="white" />
                                    <rect x="70" y="15" width="15" height="15" fill="#0f172a" />
                                    <rect x="73" y="18" width="9" height="9" fill="white" />
                                    <rect x="10" y="65" width="25" height="25" fill="white" />
                                    <rect x="15" y="70" width="15" height="15" fill="#0f172a" />
                                    <rect x="18" y="73" width="9" height="9" fill="white" />
                                    <rect x="45" y="15" width="8" height="8" fill="white" />
                                    <rect x="45" y="30" width="8" height="8" fill="white" />
                                    <rect x="45" y="65" width="8" height="8" fill="white" />
                                    <rect x="65" y="45" width="8" height="8" fill="white" />
                                    <rect x="75" y="55" width="12" height="8" fill="white" />
                                    <rect x="55" y="75" width="15" height="8" fill="white" />
                                  </svg>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">Scan via ABHA App</span>
                                <span className="text-[9px] text-emerald-700 font-medium">PHR Gateway Linked</span>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-600 flex flex-wrap items-center justify-between">
                              <span>Ayushman Bharat Digital Mission (ABDM) • Interoperable EHR</span>
                              <span className="font-mono text-emerald-800 font-bold">DPDP Act 2023 Protected</span>
                            </div>
                          </div>

                          {/* 2. Linked Hospital Treatment Records & Encounter History */}
                          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                  <IconEmblem className="w-4 h-4 text-[#0D5C4E]" />
                                  <span>Linked Hospital Treatment Records & Clinical History</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Historical encounters retrieved across ABDM-participating health facilities with patient consent.
                                </p>
                              </div>
                              <span className="text-xs font-bold text-[#0D5C4E] bg-[#FAFBF9] px-2 py-0.5 rounded-sm border border-[#121C18]/15 font-mono">
                                3 Prior Hospital Encounters
                              </span>
                            </div>

                            <div className="space-y-4">
                              {/* Encounter 1 */}
                              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 transition">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    <IconLeaf className="w-4 h-4" />
                                    <span>District Ayurvedic Hospital & Research Centre</span>
                                  </div>
                                  <span className="font-mono text-slate-500">Date: 18 Feb 2026 • OPD Follow-up</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Attending Doctor</span>
                                    <span className="font-semibold text-slate-800">Dr. S. K. Vaidya, BAMS, MD (Ayur)</span>
                                    <span className="block text-[11px] text-slate-500">Dept: Kayachikitsa</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Clinical Diagnosis</span>
                                    <span className="font-semibold text-emerald-950">Sandhigata Vata (Knee Osteoarthritis)</span>
                                    <span className="block text-[11px] text-slate-500">Doshic: Vata Vriddhi with Asthi Kshaya</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Prescribed Regimen</span>
                                    <span className="font-medium text-slate-800">Tab Yogaraj Guggulu (2 tabs BD)</span>
                                    <span className="block text-[11px] text-slate-500">Mahanarayana Taila local Abhyanga</span>
                                  </div>
                                </div>
                              </div>

                              {/* Encounter 2 */}
                              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0D5C4E] transition">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    <IconStethoscope className="w-4 h-4" />
                                    <span>Civil Hospital & Medical College — Orthopedics OPD</span>
                                  </div>
                                  <span className="font-mono text-slate-500">Date: 12 Dec 2025 • Specialist Consult</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Attending Doctor</span>
                                    <span className="font-semibold text-slate-800">Dr. P. K. Rao, MS (Ortho)</span>
                                    <span className="block text-[11px] text-slate-500">Dept: Orthopedic Surgery</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Diagnostic Findings</span>
                                    <span className="font-semibold text-slate-900">Bilateral Knee Osteoarthritis (Grade II)</span>
                                    <span className="block text-[11px] text-slate-500">X-Ray: Medial space narrowing confirmed</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Advice & Therapy</span>
                                    <span className="font-medium text-slate-800">Tab Paracetamol 650mg SOS for pain</span>
                                    <span className="block text-[11px] text-slate-500">Isometric quadriceps exercises, avoid squatting</span>
                                  </div>
                                </div>
                              </div>

                              {/* Encounter 3 */}
                              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    <IconEmblem className="w-4 h-4 text-[#0D5C4E]" />
                                    <span>Community Health Centre (CHC) — Primary Healthcare</span>
                                  </div>
                                  <span className="font-mono text-slate-500">Date: 05 Aug 2025 • Annual Health Check</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Attending Doctor</span>
                                    <span className="font-semibold text-slate-800">Dr. Ananya Sen, MBBS, DNB</span>
                                    <span className="block text-[11px] text-slate-500">Dept: General Medicine</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Vital Parameters</span>
                                    <span className="font-medium text-slate-800">BP: 126/82 mmHg • Pulse: 74 bpm</span>
                                    <span className="block text-[11px] text-slate-500">Fasting Blood Sugar: 94 mg/dL (Normal)</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Preventive Health</span>
                                    <span className="font-medium text-emerald-800">Tetanus Toxoid Booster administered</span>
                                    <span className="block text-[11px] text-slate-500">Routine follow-up in 12 months</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 3. ABDM Consent Gateway & Technical FHIR Bundle (Collapsible) */}
                          <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <IconAlert className="w-4 h-4" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">
                                    ABDM Health Information Exchange (HIE-CM) Gateway
                                  </h4>
                                  <p className="text-[11px] text-slate-500">
                                    Active Consent ID: <span className="font-mono font-bold text-slate-700">HIE-CONSENT-91823-7492-ABDM</span> • DPDP Act 2023 Compliant
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowRawFhir((prev) => !prev)}
                                  className="px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                                >
                                  {showRawFhir ? "Hide Raw FHIR JSON" : "Inspect Raw FHIR JSON"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDownloadFhir}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md transition flex items-center gap-1.5"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                  <span>Download FHIR Bundle (.json)</span>
                                </button>
                              </div>
                            </div>

                            {showRawFhir && (
                              <pre className="p-4 text-xs font-mono bg-slate-950 text-emerald-400 rounded-md overflow-x-auto max-h-80 whitespace-pre-wrap break-all animate-in fade-in duration-150">
                                {JSON.stringify(session.route?.fhir_bundle || { note: "Bundle generated on Approve & Save. Click 'Approve & Save' above to generate complete ABDM bundle." }, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      )}
                    </main>

                    {/* Optional Docked AI Assistant Sidecar */}
                    {sideAiOpen && (
                      <aside className="w-96 border-l border-slate-200 bg-white flex flex-col p-3 print:hidden shrink-0">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <IconStethoscope className="w-3.5 h-3.5" />
                            <span>Docked AI Diagnostic Assistant</span>
                          </span>
                          <button
                            onClick={() => setSideAiOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs p-1"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <DiseaseAwareChatbot
                            currentSession={session}
                            onAppendToHpi={handleAppendToHpi}
                          />
                        </div>
                      </aside>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-md  flex items-center gap-2.5 text-xs font-semibold border transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "error"
              ? "bg-rose-900 text-rose-100 border-rose-700"
              : toast.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          <span>{toast.type === "error" ? <IconAlert className="w-4 h-4 text-[#B91C1C]" /> : toast.type === "success" ? <IconCheckCircle className="w-4 h-4 text-[#0D5C4E]" /> : <IconAlert className="w-4 h-4" />}</span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
