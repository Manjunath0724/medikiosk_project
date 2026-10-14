const API_BASE = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : "http://localhost:8000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      // ignore -- keep statusText
    }
    throw new ApiError(detail, res.status);
  }
  return res.json();
}

async function safeFetch(path, options) {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    return await handle(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network-level failure (backend not running, CORS, etc.)
    throw new ApiError("network", 0);
  }
}

export const api = {
  startSession({ language, name, token, abhaId, consent, department, consultingDoctor }) {
    return safeFetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        name,
        token,
        abha_id: abhaId || null,
        consent,
        department: department || "general",
        consulting_doctor: consultingDoctor || null,
      }),
    });
  },

  getDoctors({ q, specialty } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialty && specialty !== "all") params.set("specialty", specialty);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return safeFetch(`/api/doctors${queryStr}`, { method: "GET" });
  },

  getPatientVault() {
    return safeFetch("/api/patient-vault", { method: "GET" });
  },

  attachRecords({ sessionId, attachedRecords, sharePastHistory }) {
    return safeFetch(`/api/sessions/${sessionId}/attach-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attached_records: attachedRecords || [],
        share_past_history: sharePastHistory !== false,
      }),
    });
  },

  toggleDemonstration({ sessionId, demonstrationActive } = {}) {
    return safeFetch(`/api/sessions/${sessionId}/toggle-demonstration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        demonstration_active: demonstrationActive,
      }),
    });
  },

  callPatient({ sessionId, doctorId, doctorName, hospital, cabin, specialization } = {}) {
    return safeFetch(`/api/sessions/${sessionId}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctorId || null,
        doctor_name: doctorName || null,
        hospital: hospital || null,
        cabin: cabin || null,
        specialization: specialization || null,
      }),
    });
  },

  updateSessionStatus({ sessionId, status }) {
    return safeFetch(`/api/sessions/${sessionId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },

  converse({ sessionId, patientMessage }) {
    return safeFetch("/api/converse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        patient_message: patientMessage ?? null,
      }),
    });
  },

  extractDoc({ sessionId, file }) {
    const form = new FormData();
    form.append("session_id", sessionId);
    form.append("image", file);
    return safeFetch("/api/extract-doc", {
      method: "POST",
      body: form,
    });
  },

  summarize({ sessionId }) {
    return safeFetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  route({ sessionId, physicianEdits }) {
    return safeFetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        physician_edits: physicianEdits || null,
      }),
    });
  },

  getSession(sessionId) {
    return safeFetch(`/api/session/${sessionId}`, { method: "GET" });
  },

  getSessions() {
    return safeFetch("/api/sessions", { method: "GET" });
  },

  quickBook({ name, department, language, abhaId, consultingDoctor } = {}) {
    return safeFetch("/api/sessions/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Walk-in Patient",
        department: department || "general",
        language: language || "en",
        abha_id: abhaId || null,
        consulting_doctor: consultingDoctor || null,
      }),
    });
  },

  doctorChat({ messages, model, apiKey, sessionId }) {
    return safeFetch("/api/doctor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: model || "anthropic/claude-3.5-sonnet",
        api_key: apiKey || null,
        session_id: sessionId || null,
      }),
    });
  },

  getNarrativeSummary(sessionId, { refresh = false } = {}) {
    return safeFetch(`/api/sessions/${sessionId}/narrative-summary${refresh ? "?refresh=true" : ""}`, {
      method: "POST",
    });
  },

  login({ username, password }) {
    return safeFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },

  signup(userData) {
    return safeFetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },

  getUsers() {
    return safeFetch("/api/auth/users", { method: "GET" });
  },
};

export { ApiError };

