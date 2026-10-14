const API_BASE = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : "http://localhost:8000";
const API_TIMEOUT_MS = 45000;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function publicErrorMessage(status) {
  if (status === 400 || status === 422) {
    return "Some information could not be accepted. Review it and try again.";
  }
  if (status === 401) return "Your sign-in may have expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "This consultation or record is no longer available.";
  if (status === 409) return "This request has changed. Refresh and try again.";
  if (status === 413) return "This file is too large. Choose a file under 20 MB.";
  if (status === 415) return "This file type is not supported. Choose a PDF, JPEG, PNG, or WebP file.";
  if (status === 429) return "There are too many requests right now. Please wait and try again.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again shortly.";
  return "The request could not be completed. Please try again.";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort(externalSignal.reason);

  if (externalSignal?.aborted) {
    abortFromCaller();
  } else {
    externalSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch {
    if (timedOut) {
      throw new ApiError("The request timed out. Please try again.", 0);
    }
    if (externalSignal?.aborted) {
      throw new ApiError("The request was cancelled.", 0);
    }
    throw new ApiError("Unable to connect. Check your connection and try again.", 0);
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}

async function handle(res) {
  if (!res.ok) {
    throw new ApiError(publicErrorMessage(res.status), res.status);
  }
  return res.json();
}

async function safeFetch(path, options = {}) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`, options);
    return await handle(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("The service returned an unreadable response. Please try again.", 0);
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

  async getDoctors(arg1, arg2) {
    let q = "";
    let specialty = "";
    if (typeof arg1 === "object" && arg1 !== null) {
      q = arg1.q || "";
      specialty = arg1.specialty || "";
    } else {
      q = arg1 || "";
      specialty = arg2 || "";
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialty && specialty !== "all") params.set("specialty", specialty);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await safeFetch(`/api/doctors${queryStr}`, { method: "GET" });
    return res?.doctors || (Array.isArray(res) ? res : []);
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

  uploadPatientRecord({ sessionId, title, type, facility, summary, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("record_type", type);
    form.append("facility", facility || "");
    form.append("summary", summary || "");
    form.append("file", file);
    return safeFetch(`/api/sessions/${sessionId}/records/upload`, {
      method: "POST",
      body: form,
    });
  },

  async getPatientRecordFile(sessionId, recordId, { signal } = {}) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/api/sessions/${sessionId}/records/${recordId}/file`,
        { cache: "no-store", signal }
      );
      if (!res.ok) {
        throw new ApiError(publicErrorMessage(res.status), res.status);
      }
      return await res.blob();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("The service returned an unreadable response. Please try again.", 0);
    }
  },

  toggleDemonstration(sessionId, demonstrationActive) {
    return safeFetch(`/api/sessions/${sessionId}/toggle-demonstration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        demonstration_active: demonstrationActive,
      }),
    });
  },

  callPatient(sessionId, { doctorId, doctorName, hospital, cabin, specialization } = {}) {
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

  getSessionStatus(sessionId) {
    return safeFetch(`/api/sessions/${sessionId}/status`, { method: "GET" });
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

  quickBook({ name, department, language, abhaId, chiefComplaint, consultingDoctor } = {}) {
    return safeFetch("/api/sessions/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Walk-in Patient",
        department: department || "general",
        language: language || "en",
        abha_id: abhaId || null,
        chief_complaint: chiefComplaint || null,
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
