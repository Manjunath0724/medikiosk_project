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
function IconLock({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" strokeWidth="1.8" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10V7a4 4 0 118 0v3m-4 4v3" />
    </svg>
  );
}
function IconShield({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2.8 20 6v5.2c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3.2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m8.5 12 2.2 2.2 4.8-4.8" />
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
  const [department, setDepartment] = useState("general");
  const [language, setLanguage] = useState("en");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [abhaId, setAbhaId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({
      name: name.trim() || "Walk-in Patient",
      department,
      language,
      chiefComplaint: chiefComplaint.trim() || undefined,
      abhaId: abhaId.trim() || undefined,
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
                <option value="internal">Internal Medicine</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="cardiology">Cardiology</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="dermatology">Dermatology</option>
                <option value="neurology">Neurology</option>
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
  const [queueError, setQueueError] = useState("");
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [callingSessionId, setCallingSessionId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [queueCategory, setQueueCategory] = useState("all"); // "all" | "waiting" | "called" | "priority"
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 640
  );
  const [sideAiOpen, setSideAiOpen] = useState(false);
  const [showRawFhir, setShowRawFhir] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null); // Embedded read-only viewer modal
  const [selectedScanFileUrl, setSelectedScanFileUrl] = useState("");
  const [selectedScanFileLoading, setSelectedScanFileLoading] = useState(false);
  const [selectedScanFileError, setSelectedScanFileError] = useState("");

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem("medikiosk_user");
      if (!saved) return null;
      const user = JSON.parse(saved);
      if (
        !user ||
        typeof user !== "object" ||
        typeof user.id !== "string" ||
        !["doctor", "patient"].includes(user.role)
      ) {
        localStorage.removeItem("medikiosk_user");
        return null;
      }
      const profile = {
        id: user.id,
        username: typeof user.username === "string" ? user.username : "",
        role: user.role,
        full_name: typeof user.full_name === "string" ? user.full_name : "",
        department: typeof user.department === "string" ? user.department : "",
        specialization: typeof user.specialization === "string" ? user.specialization : "",
        hospital: typeof user.hospital === "string" ? user.hospital : "",
        cabin: typeof user.cabin === "string" ? user.cabin : "",
        abha_id: typeof user.abha_id === "string" ? user.abha_id : "",
      };
      localStorage.setItem("medikiosk_user", JSON.stringify(profile));
      return profile;
    } catch {
      return null;
    }
  })();
  const doctorId = currentUser?.role === "doctor" ? currentUser.id : null;

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Handle "Accept & Call" patient action (Requirement 5a)
  const handleAcceptAndCall = async (targetSession) => {
    if (!doctorId) return;
    const sId = targetSession.session_id || targetSession;
    if (callingSessionId === sId) return;
    setCallingSessionId(sId);
    try {
      const res = await api.callPatient(sId, {
        doctorId,
        doctorName: currentUser?.full_name || "Dr. Attending Physician",
        cabin: currentUser?.cabin || "Cabin 101",
        hospital: currentUser?.hospital || "Hospital OPD",
        specialization: currentUser?.specialization || "Clinical OPD",
      });
      showToast(
        `Patient called to ${res.consulting_doctor?.cabin || currentUser?.cabin || "your consultation room"}.`,
        "success"
      );
      await loadQueue();
      if (window.matchMedia("(max-width: 639px)").matches) {
        setSidebarOpen(false);
      }
      if (sessionId !== sId) {
        navigate(`/doctor/${sId}`);
      } else {
        await loadSession(sId);
      }
    } catch (err) {
      showToast(err.message || "Failed to call patient", "error");
    } finally {
      setCallingSessionId(null);
    }
  };

  // Live polling for patient demonstration consent & status (Requirement 5e)
  useEffect(() => {
    if (!doctorId || !sessionId) return;
    let previousConsent = null;
    let active = true;
    const interval = setInterval(async () => {
      try {
        const st = await api.getSessionStatus(sessionId);
        if (active && st) {
          const consentRestored = previousConsent === false && st.demonstration_active === true;
          previousConsent = st.demonstration_active;
          if (!st.demonstration_active) {
            setSelectedScan(null);
          } else if (consentRestored) {
            const refreshedSession = await api.getSession(sessionId);
            if (active) setSession(refreshedSession);
          }
          setSession((prev) => {
            if (!prev) return prev;
            const next = {
              ...prev,
              demonstration_active: st.demonstration_active,
              status: st.status,
              ...(st.demonstration_active
                ? {}
                : { attached_records: [], past_diagnoses: [], documents: [] }),
            };
            return next.demonstration_active === prev.demonstration_active &&
              next.status === prev.status &&
              next.attached_records === prev.attached_records &&
              next.past_diagnoses === prev.past_diagnoses &&
              next.documents === prev.documents
              ? prev
              : next;
          });
        }
      } catch {
        // silent
      }
    }, 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [doctorId, sessionId]);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    const controller = new AbortController();
    setSelectedScanFileUrl("");
    setSelectedScanFileError("");

    if (!doctorId || !sessionId || !selectedScan?.file_id) {
      setSelectedScanFileLoading(false);
      return undefined;
    }

    setSelectedScanFileLoading(true);
    api.getPatientRecordFile(sessionId, selectedScan.id, { signal: controller.signal })
      .then((file) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(file);
        setSelectedScanFileUrl(objectUrl);
      })
      .catch((err) => {
        if (active) setSelectedScanFileError(err.message || "The report could not be opened.");
      })
      .finally(() => {
        if (active) setSelectedScanFileLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doctorId, sessionId, selectedScan]);

  // Load Queue
  const loadQueue = useCallback(async () => {
    if (!doctorId) {
      setQueue([]);
      setQueueError("");
      return;
    }
    try {
      setQueueLoading(true);
      setQueueError("");
      const data = await api.getSessions();
      setQueue(
        (data || []).filter((item) => {
          const assignedDoctorId = item.consulting_doctor?.id;
          return !assignedDoctorId || assignedDoctorId === doctorId;
        })
      );
    } catch (err) {
      setQueueError(err.message || "Could not load the patient queue. Try refreshing.");
    } finally {
      setQueueLoading(false);
    }
  }, [doctorId]);

  // Poll Queue
  useEffect(() => {
    if (!doctorId) return undefined;
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [doctorId, loadQueue]);

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
    if (!doctorId || !id) {
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
  }, [doctorId, lang, navigate]);

  useEffect(() => {
    if (!doctorId) return;
    if (sessionId) {
      loadSession(sessionId);
    } else {
      setSession(null);
      setNarrativeReport(null);
    }
  }, [doctorId, sessionId, loadSession]);

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
      const res = await api.quickBook({
        ...bookData,
        consultingDoctor: currentUser
          ? {
              id: currentUser.id,
              full_name: currentUser.full_name,
              specialization: currentUser.specialization,
              hospital: currentUser.hospital,
              cabin: currentUser.cabin,
              department: currentUser.department,
            }
          : undefined,
      });
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

  const isWaitingForDoctor = (item) =>
    !item.has_route && (!item.status || item.status === "waiting");

  const filteredQueue = queue.filter((item) => {
    if (queueCategory === "waiting" && !isWaitingForDoctor(item)) return false;
    if (queueCategory === "called" && item.status !== "called") return false;
    if (
      queueCategory === "priority" &&
      !item.red_flag &&
      item.triage_level !== "emergency" &&
      !item.triage_level?.includes("triage") &&
      !item.summary?.red_flags?.length
    ) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (item.patient_name && item.patient_name.toLowerCase().includes(q)) ||
      (item.token_number && String(item.token_number).includes(q)) ||
      (item.department && item.department.toLowerCase().includes(q)) ||
      (item.consulting_doctor?.specialization && item.consulting_doctor.specialization.toLowerCase().includes(q)) ||
      (item.session_id && item.session_id.toLowerCase().includes(q))
    );
  });
  const waitingQueue = queue.filter(isWaitingForDoctor);

  const abnormalCount = (session?.documents || []).reduce(
    (sum, doc) => sum + (doc.investigations || []).filter((i) => i.abnormal).length,
    0
  );

  const ayush = editedAyush || session?.summary?.ayush_assessment || {};
  const dashavidha = ayush.dashavidha_pariksha || {};

  return !doctorId ? (
      <main className="min-h-screen bg-[#FAFBF9] text-[#121C18] flex items-center justify-center p-6">
        <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <IconStethoscope className="mx-auto h-8 w-8 text-[#0D5C4E]" />
          <h1 className="mt-4 text-xl font-bold">Doctor sign-in required</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with a doctor account to open the consultation queue and patient records.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#0D5C4E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#09453A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C4E]"
          >
            Go to sign in
          </Link>
        </section>
      </main>
    ) : (
    <div className="kiosk-screen doctor-workstation h-screen bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] flex flex-col overflow-hidden print:bg-white print:p-0 print:h-auto print:overflow-visible">
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
          <span className="hidden sm:inline text-emerald-300 font-semibold">Multispecialty Doctor Workstation</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <Link
            to="/"
            aria-label="Switch to patient kiosk or sign in"
            className="inline-flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white px-2.5 py-1 rounded-lg font-sans text-xs font-semibold transition border border-emerald-700/60"
          >
            <IconLeaf className="w-4 h-4 text-emerald-200 inline mr-1" />
            <span className="hidden sm:inline">Switch to Kiosk / Login</span>
          </Link>
          <span className="hidden md:inline bg-emerald-900 px-2 py-0.5 rounded text-emerald-300">
            Sequential Auto-Tokening Active
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Live OPD Server</span>
          </span>
        </div>
      </div>

      {/* Main Layout: Sidebar (Queue) + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Patient Queue */}
        <aside
          className={`bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all duration-200 z-20 print:hidden ${
            sidebarOpen ? "w-full sm:w-80 lg:w-96" : "w-14 sm:w-16"
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
                    aria-label="Search the patient queue"
                    className="w-full h-8 pl-7 pr-3 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none border border-transparent focus:border-emerald-500"
                  />
                  <span className="absolute left-2.5 top-2.5 text-[#4A5852]"><IconSearch className="w-3.5 h-3.5" /></span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "waiting", label: "Waiting" },
                    { id: "called", label: "Called" },
                    { id: "priority", label: "Priority" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setQueueCategory(cat.id)}
                      aria-pressed={queueCategory === cat.id}
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
                {queueError && (
                  <div role="alert" className="m-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                    <p className="font-semibold">Queue could not be refreshed.</p>
                    <p className="mt-1">{queueError}</p>
                    <button type="button" onClick={loadQueue} className="mt-2 font-bold underline underline-offset-2">
                      Retry
                    </button>
                  </div>
                )}
                {queueLoading && queue.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                    Refreshing OPD Queue...
                  </div>
                )}

                {filteredQueue.length === 0 && !queueLoading && !queueError && (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      {queue.length ? "No patients match this filter." : "No consultation requests are waiting for your clinic."}
                    </p>
                    <button
                      onClick={() => setShowQuickBook(true)}
                      className="text-xs text-emerald-700 font-bold underline"
                    >
                      Register a walk-in patient
                    </button>
                  </div>
                )}

                {filteredQueue.map((item) => {
                  const isSelected = item.session_id === sessionId;
                  return (
                    <div
                      key={item.session_id}
                      onClick={() => {
                        navigate(`/doctor/${item.session_id}`);
                        if (window.matchMedia("(max-width: 639px)").matches) {
                          setSidebarOpen(false);
                        }
                      }}
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
                                : item.consulting_doctor?.specialization
                                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                                    {item.consulting_doctor?.specialization ||
                                      (item.department === "ayush"
                                        ? "Ayush"
                                        : item.department === "integrated"
                                        ? "Integrated"
                                        : item.department === "general"
                                        ? "General"
                                        : item.department || "Unassigned")}
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

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {item.red_flag && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase animate-pulse">
                            Triage
                          </span>
                        )}
                        {item.has_route ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            ✓ Done
                          </span>
                        ) : item.status === "called" ? (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                            Called
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#4A5852] font-semibold bg-[#FAFBF9] px-1.5 py-0.5 rounded-sm border border-[#121C18]/15">
                            Waiting
                          </span>
                        )}
                        {isWaitingForDoctor(item) && (
                          <button
                            type="button"
                            disabled={callingSessionId === item.session_id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptAndCall(item);
                            }}
                            className="px-2 py-0.5 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white text-[10px] font-bold transition flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                            title="Accept and call patient into your consultation cabin"
                          >
                            <span>{callingSessionId === item.session_id ? "Calling…" : "Accept & Call"}</span>
                          </button>
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
        <div className={`flex-1 flex-col overflow-y-auto min-w-0 ${sidebarOpen ? "hidden sm:flex" : "flex"}`}>
          {/* If No Session Selected: Show Queue Dashboard View */}
          {!sessionId && (
            <div className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
              {/* Institutional Gazette Docket Header */}
              <div className="rounded-md border border-[#121C18]/15 bg-white dark:bg-[#15201C] p-6 sm:p-8 text-[#121C18] dark:text-[#F2F6F4]">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-[#0D5C4E] text-[11px] font-bold text-white tracking-widest font-mono">
                      GOI
                    </span>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4] mt-0.5">
                        Multispecialty Doctor Workstation & Consultation Queue
                      </h1>
                    </div>
                  </div>
                  <p className="text-sm text-[#4A5852] dark:text-[#9AA5A0] leading-relaxed">
                    Review nine-stage clinical intakes, call patients to your room, and inspect records they have chosen to share.
                  </p>
                  <p className="text-xs font-semibold text-[#0D5C4E]">
                    {currentUser.full_name} · {currentUser.specialization || "Consulting doctor"} · {currentUser.cabin || "Consultation room"}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowQuickBook(true)}
                      className="px-4 py-2.5 rounded-sm bg-[#0D5C4E] hover:bg-[#09453A] text-white font-bold text-xs transition flex items-center gap-2"
                    >
                      <IconTicket className="w-3.5 h-3.5" />
                      <span>Register Walk-in Patient</span>
                    </button>
                    {waitingQueue.length > 0 && (
                      <button
                        onClick={() => handleAcceptAndCall(waitingQueue[0])}
                        disabled={callingSessionId === waitingQueue[0].session_id}
                        className="px-4 py-2.5 rounded-sm border border-[#0D5C4E] text-[#0D5C4E] hover:bg-[#0D5C4E]/5 font-bold text-xs transition flex items-center gap-2"
                      >
                        <IconClipboard className="w-3.5 h-3.5" />
                        <span>
                          {callingSessionId === waitingQueue[0].session_id
                            ? "Calling patient…"
                            : `Accept & Call Next: Token #${waitingQueue[0].token_number ?? "—"}`}
                        </span>
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
                    {waitingQueue.length}
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
                    #{waitingQueue[0]?.token_number ?? (queue.length > 0 ? (Math.max(...queue.map((q) => q.token_number || 0)) + 1) : 1)}
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

                {queue.length === 0 && queueError ? (
                  <div role="alert" className="p-10 text-center space-y-3">
                    <IconAlert className="mx-auto h-8 w-8 text-rose-700" />
                    <p className="text-sm font-semibold text-rose-900">The consultation queue could not be loaded.</p>
                    <p className="text-xs text-slate-600">{queueError}</p>
                    <button type="button" onClick={loadQueue} className="text-xs font-bold text-emerald-800 underline underline-offset-2">
                      Retry queue
                    </button>
                  </div>
                ) : queue.length === 0 && queueLoading ? (
                  <div className="p-10 text-center text-sm text-slate-500">Loading your consultation queue…</div>
                ) : queue.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded border border-[#D3DDD8] dark:border-[#24352F] flex items-center justify-center text-[#4A5852]"><IconClipboard className="w-6 h-6" /></div>
                    <p className="text-sm text-slate-600 font-medium">
                      {queueError ? "The queue could not be loaded." : "No consultation requests are waiting for your clinic."}
                    </p>
                    {queueError && (
                      <button type="button" onClick={loadQueue} className="text-xs font-bold text-rose-800 underline underline-offset-2">
                        Retry queue
                      </button>
                    )}
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
                          <th className="py-3 px-4">Specialty</th>
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
                                  p.consulting_doctor?.specialization
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.department === "integrated"
                                    ? "bg-white text-[#121C18] border border-[#D3DDD8]"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {p.consulting_doctor?.specialization ||
                                  (p.department === "ayush"
                                    ? "Ayush"
                                    : p.department === "integrated"
                                    ? "Integrated"
                                    : p.department === "general"
                                    ? "General"
                                    : p.department || "Unassigned")}
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
                              ) : p.status === "called" ? (
                                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                                  Called
                                </span>
                              ) : (
                                <span className="text-[#4A5852] font-semibold text-[11px]">Waiting</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {isWaitingForDoctor(p) && (
                                  <button
                                    type="button"
                                    disabled={callingSessionId === p.session_id}
                                    onClick={() => handleAcceptAndCall(p)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0D5C4E] hover:bg-[#09453A] text-white font-bold text-xs transition disabled:cursor-wait disabled:opacity-60"
                                    title="Call patient to your consultation cabin"
                                  >
                                    {callingSessionId === p.session_id ? "Calling…" : "Accept & Call"}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => navigate(`/doctor/${p.session_id}`)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                                >
                                  Open Case
                                </button>
                              </div>
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
                      <div className="flex items-center gap-3 flex-wrap">
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
                          {session.consulting_doctor?.specialization ||
                            currentUser?.specialization ||
                            (session.department === "ayush"
                              ? "Ayush"
                              : session.department === "integrated"
                              ? "Integrated"
                              : session.department === "general"
                              ? "General Medicine"
                              : session.department || "Clinical OPD")}
                        </span>

                        {/* Live Call Status Badge & Action */}
                        {session.status === "called" ? (
                          <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                            <span>Patient Called to Cabin</span>
                          </span>
                        ) : isWaitingForDoctor({ has_route: Boolean(session.route), status: session.status }) && (
                          <button
                            type="button"
                          disabled={callingSessionId === session.session_id}
                          onClick={() => handleAcceptAndCall(session)}
                          className="px-3 py-1 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white text-xs font-bold transition flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                        >
                          <span>{callingSessionId === session.session_id ? "Calling…" : "Accept & Call Patient"}</span>
                        </button>
                        )}

                        {/* Live Consent / Demonstration Status Badge */}
                        {session.demonstration_active === false ? (
                          <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-rose-600 text-white animate-pulse flex items-center gap-1">
                            <IconLock className="w-3.5 h-3.5" />
                            <span>Access Revoked by Patient (Demo Stopped)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            ✓ Records Demonstration Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span>
                          ABHA: <strong className="text-slate-800 font-mono">{session.abha_id || "Unlinked"}</strong>
                        </span>
                        <span>Lang: {session.language === "hi" ? "हिंदी" : "English"}</span>
                        <span>Recorded: {new Date(session.created_at).toLocaleTimeString()}</span>
                        {session.consulting_doctor && (
                          <span>
                            Assigned Doctor:{" "}
                            <strong className="text-emerald-800">
                              {session.consulting_doctor.full_name || session.consulting_doctor.name} ({session.consulting_doctor.cabin || "Cabin 101"})
                            </strong>
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                      {/* AI Patient Summary Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("narrative");
                          if (!narrativeReport && sessionId) {
                            fetchNarrative(sessionId);
                          }
                        }}
                        className={`whitespace-nowrap px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition border ${
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
                        className={`whitespace-nowrap px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition border ${
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
                        className="whitespace-nowrap px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <IconPrinter className="w-3.5 h-3.5" />
                        <span>{t(lang, "printCaseSheet")}</span>
                      </button>

                      <button
                        onClick={handleApprove}
                        disabled={saving}
                        className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-md font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
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
                        { id: "ayush", label: "Ayurveda Holistic Analysis (8 Parameters)", icon: "" },
                        {
                          id: "docs",
                          label: `Diagnostic Scans & Records (${
                            (session.attached_records || []).length +
                            (session.documents || []).filter((doc) => !doc.patient_record).length
                          })`,
                          icon: "",
                        },
                        { id: "abha", label: "ABHA Record & History", icon: "" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          aria-pressed={activeTab === tab.id}
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

                      {/* TAB 3: DEDICATED AYURVEDA ANALYSIS TAB (Requirement 6 - All 8 Parameters) */}
                      {activeTab === "ayush" && (
                        <div className="space-y-6">
                          {/* Institutional Holistic Header */}
                          <div className="p-5 rounded-lg border border-[#0D5C4E] bg-emerald-50/70 dark:bg-emerald-950/30 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D5C4E] dark:text-[#8BE3D2]">
                                <IconLeaf className="w-4 h-4" />
                                <span>Holistic Ayurvedic Clinical Profile · 8 Core Parameters</span>
                              </div>
                              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                Patient Comprehensive Ayurvedic Constitution & Pathogenesis
                              </h2>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                Available to any consulting doctor (General Medicine, Internal Medicine, Orthopedics, Cardiology, Ayush) for integrative clinical evaluation.
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-sm bg-white dark:bg-[#15201C] border border-[#0D5C4E] text-[#0D5C4E] dark:text-[#8BE3D2] text-xs font-mono font-bold">
                              Classical Ayurveda Matrix
                            </span>
                          </div>

                          {/* EXACT 8 AYURVEDA PARAMETERS (Requirement 6) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* 1. Prakriti */}
                            <div className="bg-white rounded-lg p-5 border border-emerald-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                  <span>1. Prakriti (प्रकृति)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                                  Natural Constitution
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The patient's natural body constitution (Vata, Pitta, Kapha, or a combination)."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Assessed Doshic Constitution:
                                </label>
                                <input
                                  type="text"
                                  value={editedAyush?.prakriti_assessment ?? "Vata-Pitta Prakriti"}
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, prakriti_assessment: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 2. Vikriti */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                  <span>2. Vikriti (विकृति)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                                  Current Imbalance
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The patient's current dosha imbalance or present health condition."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Doshic Imbalance & Health State:
                                </label>
                                <input
                                  type="text"
                                  value={editedAyush?.vikriti_assessment ?? "Vata-Kapha Vriddhi with Asthi-Sandhi Shoola"}
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, vikriti_assessment: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 3. Agni */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E] flex items-center gap-1.5">
                                  <span>3. Agni (अग्नि)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded font-mono">
                                  Digestive Fire
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The strength and efficiency of the patient's digestion and metabolism."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Metabolic State (Samagni / Vishamagni / Mandagni / Tikshnagni):
                                </label>
                                <input
                                  type="text"
                                  value={editedAyush?.agni_status ?? "Mandagni (Slow / impaired digestion with post-prandial heaviness)"}
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, agni_status: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 4. Koshtha */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C4E] flex items-center gap-1.5">
                                  <span>4. Koshtha (कोष्ठ)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded font-mono">
                                  Elimination Habit
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The patient's natural bowel habit and stool pattern."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Bowel Pattern (Mridu / Madhyama / Krura):
                                </label>
                                <input
                                  type="text"
                                  value={editedAyush?.koshtha_status ?? "Krura Koshtha (Tendency towards constipation / dry hard stool)"}
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, koshtha_status: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 5. Ahara */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                  <span>5. Ahara (आहार)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
                                  Diet & Eating Routine
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The patient's food habits, diet, and eating routine."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Nutritional Habits & Dietary Factors:
                                </label>
                                <textarea
                                  rows={2}
                                  value={
                                    editedAyush?.ahara_analysis ??
                                    "Predominance of dry, cold, or irregular meal timings (Vishamashana); frequent tea/caffeine; low fiber and inadequate hydration."
                                  }
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, ahara_analysis: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 6. Vihara */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                  <span>6. Vihara (विहार)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">
                                  Lifestyle & Sleep Routine
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The patient's lifestyle, sleep, exercise, and daily activities."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Daily Activity, Sleep (Nidra) & Physical Exertion:
                                </label>
                                <textarea
                                  rows={2}
                                  value={
                                    editedAyush?.vihara_analysis ??
                                    "Sedentary occupational posture; late sleep hours (Ratri Jagarana ~5-6 hrs disturbed sleep); lack of regular joint mobility or warm oil application."
                                  }
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, vihara_analysis: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 7. Nidana */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                                  <span>7. Nidana (निदान)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 font-bold rounded">
                                  Etiological Triggers
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The possible causes or triggers responsible for the disease."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Causes, Aggravating Factors & Provocations:
                                </label>
                                <textarea
                                  rows={2}
                                  value={
                                    editedAyush?.nidana_factors ??
                                    "Excessive weight bearing, age-related Dhatu Kshaya, prolonged exposure to cold draft/AC, history of repetitive micro-trauma without Snehan."
                                  }
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, nidana_factors: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* 8. Samprapti */}
                            <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                  <span>8. Samprapti (सम्प्राप्ति)</span>
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 font-bold rounded">
                                  Disease Progression
                                </span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
                                "The progression and development of the disease inside the body."
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                  Pathogenesis & Srotas Involvement:
                                </label>
                                <textarea
                                  rows={2}
                                  value={
                                    editedAyush?.samprapti_progression ??
                                    "Aggravated Vata moves into Asthi-Vaha Srotas; Sleshaka Kapha depletion in joint capsules leading to friction, pain (Shoola), and localized stiffness (Stambha)."
                                  }
                                  onChange={(e) =>
                                    setEditedAyush((prev) => ({ ...prev, samprapti_progression: e.target.value }))
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>

                          </div>

                          {/* Dashavidha Pariksha Matrix Reference Card */}
                          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                                <IconClipboard className="w-3.5 h-3.5" />
                                <span>Dashavidha Pariksha Matrix Reference</span>
                              </h3>
                              <span className="text-xs text-emerald-700 font-semibold">
                                Classical Charaka Samhita Reference
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { key: "sara", label: "Dhatu Sara (Tissue Integrity)", val: dashavidha.sara || "Madhyama (Moderate)" },
                                { key: "samhanana", label: "Samhanana (Compactness)", val: dashavidha.samhanana || "Madhyama (Balanced)" },
                                { key: "pramana", label: "Pramana (Anthropometry)", val: dashavidha.pramana || "Normal Proportions" },
                                { key: "satmya", label: "Satmya (Habituation)", val: dashavidha.satmya || "Mixed Satmya" },
                                { key: "sattva", label: "Sattva (Mental Resilience)", val: dashavidha.sattva || "Madhyama Sattva" },
                                { key: "ahara_shakti", label: "Ahara Shakti (Digestion)", val: dashavidha.ahara_shakti || "Normal Appetite" },
                                { key: "vyayama_shakti", label: "Vyayama Shakti (Endurance)", val: dashavidha.vyayama_shakti || "Moderate Tolerance" },
                                { key: "vaya", label: "Vaya (Chronological Stage)", val: dashavidha.vaya || "Madhyama Vaya (Adult)" },
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

                      {/* TAB 4: DIAGNOSTIC SCANS & MEDICAL RECORDS (Requirement 5 - Anti-Exfiltration & Live Consent Lock) */}
                      {activeTab === "docs" && (
                        <div className="space-y-6">

                          {/* LIVE CONSENT LOCK SHIELD (Requirement 5e) */}
                          {session.demonstration_active === false ? (
                            <div className="p-8 sm:p-12 rounded-xl border-2 border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-center space-y-4 shadow-md animate-in fade-in zoom-in-95 duration-200">
                              <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                                <IconLock className="w-8 h-8" />
                              </div>
                              <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                PATIENT CONSENT REVOKED · RECORD VIEWER LOCKED
                              </span>
                              <h3 className="text-2xl font-black text-rose-950 dark:text-rose-100">
                                ACCESS REVOKED BY PATIENT: DEMONSTRATION STOPPED
                              </h3>
                              <p className="text-sm text-rose-800 dark:text-rose-200 max-w-xl mx-auto leading-relaxed">
                                The patient revoked sharing, so this dashboard no longer displays their attached scans or history. This control cannot recall information already viewed or captured.
                              </p>
                              <div className="inline-block p-3 rounded-lg bg-white dark:bg-[#15201C] border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                                This terminal will automatically unlock when the patient toggles "Resume Demonstration" on their waiting screen.
                              </div>
                            </div>
                          ) : (
                            /* Consent-gated read-only report viewer */
                            <div
                              onContextMenu={(e) => {
                                e.preventDefault();
                                showToast("Context menu disabled in the report viewer.", "info");
                              }}
                              style={{ userSelect: "none", WebkitUserSelect: "none" }}
                              className="space-y-6"
                            >
                              {/* Security Watermark Banner */}
                              <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <IconShield className="w-4 h-4 text-amber-700 shrink-0" />
                                  <span>
                                    <strong>CONSENT-GATED REPORT VIEWER:</strong> No download or export controls are provided. A visible watermark and in-page context-menu restriction deter casual copying; they cannot prevent screenshots or all browser-level capture. Viewed by Dr. {currentUser?.full_name || "Attending Doctor"}.
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                                  Read-only · consent gated
                                </span>
                              </div>

                              {/* Section 1: Patient Attached Diagnostic Scans (MRI, X-ray, Labs, CT) */}
                              <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                      <IconClipboard className="w-4 h-4 text-[#0D5C4E]" />
                                      <span>Attached Diagnostic Scans & Laboratory Reports (ABDM Vault)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Patient-attached scans from their medical records vault for this consultation.
                                    </p>
                                  </div>
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {(session.attached_records || []).length} Attached Scans
                                  </span>
                                </div>

                                {(session.attached_records || []).length === 0 ? (
                                  <div className="p-6 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                                    No prior scans were attached by patient for this intake.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(session.attached_records || []).map((scan, i) => (
                                      <div
                                        key={scan.id || i}
                                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-emerald-500 transition-colors space-y-2.5 relative overflow-hidden"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <span className="font-bold text-xs text-slate-900 block">
                                              {scan.title}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              {scan.facility} • {scan.date}
                                            </span>
                                          </div>
                                          <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                            {scan.type}
                                          </span>
                                        </div>

                                        <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                                          <strong>Findings:</strong> {scan.summary}
                                        </p>

                                        <div className="flex items-center justify-between pt-1 text-xs">
                                          <span className="text-[11px] text-emerald-700 font-semibold">
                                            ✓ Read-Only Verified
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedScan(scan)}
                                            className="px-3 py-1 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                                          >
                                            <span>Inspect Scan (Viewer)</span>
                                            <IconSearch className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Section 2: Shared Past Diagnosis History & Doctors' Remarks */}
                              {session.share_past_history && (
                                <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <IconStethoscope className="w-4 h-4 text-[#0D5C4E]" />
                                        <span>Previous 9-Stage Intake Summaries & Past Doctors' Remarks</span>
                                      </h3>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Patient authorized sharing of prior clinical encounters and attending physician remarks.
                                      </p>
                                    </div>
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Sharing Active
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    {(session.past_diagnoses || []).map((pd) => (
                                      <div
                                        key={pd.id}
                                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-900">
                                            {pd.doctor_name} ({pd.specialization || pd.specialty})
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-mono">
                                            {pd.date}
                                          </span>
                                        </div>
                                        <p className="font-semibold text-emerald-800">
                                          Previous intake summary: {pd.intake_summary || pd.diagnosis}
                                        </p>
                                        <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 italic">
                                          "{pd.remarks || pd.doctor_remarks}"
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Section 3: Physical Documents Uploaded During Kiosk Scan */}
                              <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                  <h3 className="text-sm font-bold text-slate-900">
                                    Physical Prescriptions & Camera Scans ({
                                      (session.documents || []).filter((doc) => !doc.patient_record).length
                                    })
                                  </h3>
                                  {abnormalCount > 0 && (
                                    <span className="text-xs font-bold text-[#B91C1C] bg-[#FEF2F2] px-2.5 py-0.5 rounded-sm border border-[#B91C1C]/30 font-mono">
                                      {abnormalCount} Abnormal Findings
                                    </span>
                                  )}
                                </div>

                                {(session.documents || []).filter((doc) => !doc.patient_record).length === 0 ? (
                                  <div className="text-xs text-slate-400 italic">
                                    No physical documents scanned via kiosk camera.
                                  </div>
                                ) : (
                                  (session.documents || [])
                                    .filter((doc) => !doc.patient_record)
                                    .map((doc, idx) => (
                                    <div key={doc.id || idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                                        <span>{(doc.document_type || "Document").replace("_", " ")}</span>
                                        <span className="text-slate-500 font-mono text-[10px]">{doc.date || "Date: Not specified"}</span>
                                      </div>
                                      {doc.diagnoses?.length > 0 && (
                                        <p className="text-xs text-slate-800">
                                          <strong>Extracted Diagnoses:</strong> {doc.diagnoses.join(", ")}
                                        </p>
                                      )}
                                      {doc.extraction_notes && (
                                        <p className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                                          {doc.extraction_notes}
                                        </p>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

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
                                <span className="text-[10px] font-bold text-slate-500">Sample QR preview</span>
                                <span className="text-[9px] text-emerald-700 font-medium">No live PHR connection</span>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-600 flex flex-wrap items-center justify-between">
                              <span>FHIR R4 demonstration data • local prototype only</span>
                              <span className="font-mono text-emerald-800 font-bold">Not certified</span>
                            </div>
                          </div>

                          {/* 2. Linked Hospital Treatment Records & Encounter History */}
                          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                  <IconEmblem className="w-4 h-4 text-[#0D5C4E]" />
                                  <span>Sample Prior Encounters & Clinical History</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Demonstration history only. No ABDM-participating facility is connected.
                                </p>
                              </div>
                              <span className="text-xs font-bold text-[#0D5C4E] bg-[#FAFBF9] px-2 py-0.5 rounded-sm border border-[#121C18]/15 font-mono">
                                3 Demo Encounters
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
                                    FHIR R4 Demonstration Bundle
                                  </h4>
                                  <p className="text-[11px] text-slate-500">
                                    Consent state: <span className="font-mono font-bold text-slate-700">demo only</span> • No live HIE connection
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

      {/* Embedded consent-gated read-only scan viewer */}
      {selectedScan && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150"
          onContextMenu={(e) => {
            e.preventDefault();
            showToast("Right-click context menu disabled (Anti-Exfiltration Security)", "error");
          }}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
        >
          <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs uppercase bg-[#0D5C4E] text-white">
                  {selectedScan.type}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{selectedScan.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">● READ-ONLY PROTECTED</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: {session?.patient_name || "Patient"} • {selectedScan.facility} • {selectedScan.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded bg-amber-950/40">
                  No report download control
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                >
                  Close Viewer ✕
                </button>
              </div>
            </div>

            {/* Medical Imaging Radiologic Viewport with Forensic Watermark Overlay */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative bg-black">

              {/* DIAGONAL FORENSIC WATERMARK OVERLAY (Requirement 5d) */}
              <div
                className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-around opacity-25 overflow-hidden select-none"
                aria-hidden="true"
              >
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="rotate-[-25deg] text-[13px] sm:text-[15px] font-black font-mono tracking-widest text-slate-300 uppercase whitespace-nowrap"
                  >
                    DEMONSTRATION RECORD • IN-APP VIEW ONLY • DR. {currentUser?.full_name?.toUpperCase() || "OPD PHYSICIAN"} • SCREENSHOTS CANNOT BE PREVENTED
                  </div>
                ))}
              </div>

              {/* Viewport Content */}
              <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-4 shadow-inner">
                {selectedScan.file_id ? (
                  selectedScanFileLoading ? (
                    <p className="py-24 text-center text-sm text-slate-300">Loading shared report…</p>
                  ) : selectedScanFileError ? (
                    <p role="alert" className="py-24 text-center text-sm text-rose-300">
                      {selectedScanFileError}
                    </p>
                  ) : selectedScanFileUrl && selectedScan.media_type?.startsWith("image/") ? (
                    <img
                      src={selectedScanFileUrl}
                      alt={`${selectedScan.title} uploaded by the patient`}
                      draggable="false"
                      className="max-h-[65vh] max-w-full object-contain mx-auto"
                    />
                  ) : selectedScanFileUrl ? (
                    <iframe
                      title={`${selectedScan.title} read-only report`}
                      src={`${selectedScanFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-[65vh] bg-white"
                      style={{ pointerEvents: "none" }}
                    />
                  ) : null
                ) : selectedScan.type?.toLowerCase().includes("mri") ? (
                  <div className="space-y-4 text-center">
                    <div className="h-64 sm:h-80 w-full rounded-md bg-gradient-to-b from-slate-950 via-slate-900 to-black border border-slate-700/80 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      {/* Simulated Spinal Column Radiography Graphic */}
                      <svg viewBox="0 0 200 240" className="w-44 h-56 stroke-emerald-400/80 fill-none stroke-[1.5]">
                        <ellipse cx="100" cy="30" rx="36" ry="14" className="stroke-slate-400" />
                        <ellipse cx="100" cy="65" rx="38" ry="15" className="stroke-slate-400" />
                        <ellipse cx="100" cy="100" rx="40" ry="16" className="stroke-slate-400" />
                        <ellipse cx="100" cy="138" rx="42" ry="17" className="stroke-amber-400 stroke-2" />
                        <ellipse cx="100" cy="178" rx="44" ry="18" className="stroke-rose-500 stroke-2" />
                        <path d="M 85 20 Q 95 120 85 220" className="stroke-emerald-400/60 stroke-1 stroke-dasharray-[3,3]" />
                        <path d="M 115 20 Q 105 120 115 220" className="stroke-emerald-400/60 stroke-1 stroke-dasharray-[3,3]" />
                        <text x="148" y="142" fill="#FBBF24" fontSize="8" fontFamily="monospace">L4-L5</text>
                        <text x="148" y="182" fill="#F87171" fontSize="8" fontFamily="monospace">L5-S1</text>
                      </svg>
                      <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 text-left">
                        <div>SAG T2 FRFSE</div>
                        <div>TE: 104ms TR: 3800ms</div>
                        <div>FOV: 26cm • Slice: 4.0mm</div>
                      </div>
                      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 text-right">
                        <div>APEX MRI 3.0T</div>
                        <div>ID: {selectedScan.id}</div>
                      </div>
                    </div>
                  </div>
                ) : selectedScan.type?.toLowerCase().includes("x-ray") ? (
                  <div className="space-y-4 text-center">
                    <div className="h-64 sm:h-80 w-full rounded-md bg-gradient-to-b from-slate-950 via-slate-900 to-black border border-slate-700/80 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      {/* Simulated Knee Joint Space Radiography Graphic */}
                      <svg viewBox="0 0 200 240" className="w-48 h-60 stroke-slate-300 fill-none stroke-[1.8]">
                        {/* Femur Condyles */}
                        <path d="M 60 20 L 60 90 C 60 115 85 120 95 105 C 105 120 130 115 130 90 L 130 20" />
                        {/* Joint Space Gap */}
                        <line x1="65" y1="126" x2="125" y2="126" className="stroke-amber-400 stroke-2 stroke-dashed" />
                        {/* Tibia Plateau */}
                        <path d="M 50 145 C 75 135 95 142 100 138 C 105 142 125 135 150 145 L 140 220 L 60 220 Z" />
                        {/* Fibula */}
                        <path d="M 152 160 L 160 220" className="stroke-slate-500 stroke-1" />
                        <text x="25" y="128" fill="#FBBF24" fontSize="8" fontFamily="monospace">Medial Gap</text>
                        <text x="25" y="138" fill="#F87171" fontSize="7" fontFamily="monospace">Narrowing (Gr. II)</text>
                      </svg>
                      <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-300 text-left">
                        <div>DIGITAL RADIOGRAPH PA VIEW</div>
                        <div>80 kVp • 25 mAs</div>
                      </div>
                      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 text-right">
                        <div>CIVIL DIAGNOSTICS DR</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="h-64 sm:h-80 w-full rounded-md bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-left">
                      <div className="w-full space-y-3 font-mono text-xs text-slate-200">
                        <div className="flex justify-between border-b border-slate-800 pb-2 text-emerald-400 font-bold">
                          <span>PARAMETRIC DIAGNOSTIC TELEMETRY</span>
                          <span>STATUS: RECORD VALID</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <span className="text-slate-500 block text-[10px]">RECORD CLASSIFICATION</span>
                            <span className="font-bold text-white">{selectedScan.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">CAPTURED TIMESTAMP</span>
                            <span className="text-white">{selectedScan.date}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">FACILITY SOURCE</span>
                            <span className="text-white">{selectedScan.facility}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">SECURITY HASH</span>
                            <span className="text-emerald-400 font-mono text-[10px]">Read-only access</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Radiologist Clinical Interpretation */}
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                    Radiologist / Pathologist Clinical Impression
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {selectedScan.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer (No Download Buttons) */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <IconShield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consent-aware prototype controls · screenshots cannot be prevented</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-4 py-1.5 rounded-md bg-[#0D5C4E] hover:bg-[#09453A] text-white font-bold text-xs transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
}
