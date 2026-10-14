"""
MediKiosk backend -- FastAPI app implementing the API Contract in
MediKiosk_Detailed_Technical_Doc.md, section 7.

Each endpoint is thin on purpose: assemble prompt/context, call the LLM
(llm.call_json / call_json_vision), validate/store in the in-memory
session dict, return. The three AI modules (conversation, document
extraction, summarization) each use the exact system prompts from the
spec, unmodified, in prompts.py.
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from llm import call_json, call_json_vision
from models import (
    AttachRecordsRequest,
    AuthResponse,
    CallPatientRequest,
    ConverseRequest,
    DoctorChatRequest,
    DoctorChatResponse,
    LoginRequest,
    QuickBookRequest,
    RouteRequest,
    SessionStartRequest,
    SessionStartResponse,
    SignupRequest,
    SummarizeRequest,
    ToggleDemonstrationRequest,
    UpdateStatusRequest,
)
from user_store import (
    authenticate_user,
    create_user,
    get_user_by_id,
    list_users,
)
from openrouter_client import call_openrouter_chat
from prompts import (
    MODULE_A_SYSTEM_PROMPT,
    MODULE_B_SYSTEM_PROMPT,
    MODULE_C_SYSTEM_PROMPT,
    MODULE_NARRATIVE_SYSTEM_PROMPT,
)
from red_flag import check_red_flag_keywords
import database
from session_store import (
    AYURVEDA_PARAMETER_DEFINITIONS,
    DEFAULT_PAST_DIAGNOSES,
    DEFAULT_PATIENT_VAULT,
    all_sessions,
    build_ayurveda_profile,
    get_all_sessions_summary,
    get_session,
    new_session,
    save_session,
)


app = FastAPI(title="MediKiosk API", version="0.1.0")
logger = logging.getLogger("medikiosk.main")
PRIVATE_RECORDS_DIR = Path(__file__).resolve().parent / "private_records"
MAX_RECORD_UPLOAD_BYTES = 20 * 1024 * 1024
ALLOWED_RECORD_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}

@app.on_event("startup")
def on_startup():
    database.init_database()

app.add_middleware(
    CORSMiddleware,
    # Vite dev server defaults; loosen/replace for a real deployment.
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_INTERVIEW_TURNS = 14  # soft cap so a demo can't get stuck mid-interview
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _require_session(session_id: str) -> dict:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    return session


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_medical_record(record: dict) -> dict:
    return {
        **record,
        "type": record.get("type") or record.get("modality") or record.get("scan_type") or "Medical Record",
        "summary": record.get("summary") or record.get("findings") or "No written findings supplied.",
    }


def _normalize_past_diagnosis(diagnosis: dict) -> dict:
    return {
        **diagnosis,
        "specialization": diagnosis.get("specialization") or diagnosis.get("specialty") or "Consulting physician",
        "remarks": diagnosis.get("remarks") or diagnosis.get("doctor_remarks") or "No consulting remarks recorded.",
        "intake_summary": diagnosis.get("intake_summary") or diagnosis.get("diagnosis") or "No prior intake summary recorded.",
    }


# ---------------------------------------------------------------------------
# Authentication Endpoints (JSON Prototype Storage)
# ---------------------------------------------------------------------------
@app.post("/api/auth/signup", response_model=AuthResponse)
def auth_signup(req: SignupRequest):
    if not req.username or not req.password or not req.full_name:
        raise HTTPException(status_code=400, detail="Full name, username, and password are required.")
    
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    try:
        user = create_user(
            full_name=req.full_name,
            username=req.username,
            password=req.password,
            role=req.role or "patient",
            email=req.email,
            phone=req.phone,
            abha_id=req.abha_id,
            age=req.age,
            gender=req.gender,
            department=req.department or "general",
            specialization=req.specialization,
        )
        token = f"tok_{uuid.uuid4().hex}"
        return AuthResponse(
            success=True,
            message="User registered successfully in users.json!",
            user=user,
            token=token,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@app.post("/api/auth/login", response_model=AuthResponse)
def auth_login(req: LoginRequest):
    if not req.username or not req.password:
        raise HTTPException(status_code=400, detail="Username and password are required.")

    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = f"tok_{uuid.uuid4().hex}"
    return AuthResponse(
        success=True,
        message="Login successful!",
        user=user,
        token=token,
    )


@app.get("/api/auth/users")
def auth_users():
    """Returns all users stored in users.json (prototype inspect)."""
    users = list_users()
    return {"users": users, "count": len(users)}


# ---------------------------------------------------------------------------
# Doctors Registry & Search Endpoint across all specialties (Requirement 1 & 2)
# ---------------------------------------------------------------------------
DEFAULT_DOCTORS_LIST = [
    {
        "id": "usr_doc_ortho_1",
        "full_name": "Dr. Rajesh Kulkarni",
        "username": "dr_kulkarni",
        "role": "doctor",
        "department": "orthopedics",
        "specialization": "Orthopedics & Joint Replacement Surgery",
        "hospital": "Sancheti Bone & Joint Center",
        "cabin": "Cabin 108",
        "phone": "9834567812",
        "available": True,
    },
    {
        "id": "usr_doc_genmed_1",
        "full_name": "Dr. Ananya Sen",
        "username": "dr_sen",
        "role": "doctor",
        "department": "general",
        "specialization": "General Medicine & Diabetology",
        "hospital": "City Care Multispecialty OPD",
        "cabin": "Room 102",
        "phone": "9845678123",
        "available": True,
    },
    {
        "id": "usr_doc_cardio_1",
        "full_name": "Dr. Arvind Mehta",
        "username": "dr_mehta",
        "role": "doctor",
        "department": "cardiology",
        "specialization": "Cardiology & Interventional Cardiology",
        "hospital": "Apollo Heart & Vascular Institute",
        "cabin": "Room 204",
        "phone": "9823456781",
        "available": True,
    },
    {
        "id": "usr_doctor_demo_1",
        "full_name": "Dr. Sunita Sharma",
        "username": "doctor",
        "role": "doctor",
        "department": "ayush",
        "specialization": "Ayush / Panchakarma & Integrative Medicine",
        "hospital": "National Ayush Hospital & Research Center",
        "cabin": "Cabin 101",
        "phone": "9812345678",
        "available": True,
    },
    {
        "id": "usr_doc_intmed_1",
        "full_name": "Dr. Vikramaditya Rathore",
        "username": "dr_rathore",
        "role": "doctor",
        "department": "integrated",
        "specialization": "Internal Medicine & Critical Care",
        "hospital": "Apex Multispecialty Hospital",
        "cabin": "Cabin 305",
        "phone": "9856781234",
        "available": True,
    },
    {
        "id": "usr_doc_neuro_1",
        "full_name": "Dr. Rohan Deshmukh",
        "username": "dr_deshmukh",
        "role": "doctor",
        "department": "neurology",
        "specialization": "Neurology & Neuro-Spine Science",
        "hospital": "Brain & Spine Neuro Institute",
        "cabin": "Room 212",
        "phone": "9867812345",
        "available": True,
    },
    {
        "id": "usr_doc_pedia_1",
        "full_name": "Dr. Priya Nair",
        "username": "dr_nair",
        "role": "doctor",
        "department": "pediatrics",
        "specialization": "Pediatrics & Child Wellness",
        "hospital": "Rainbow Children's Clinic",
        "cabin": "Cabin 105",
        "phone": "9878912345",
        "available": True,
    },
    {
        "id": "usr_doc_derma_1",
        "full_name": "Dr. Meenakshi Iyer",
        "username": "dr_iyer",
        "role": "doctor",
        "department": "dermatology",
        "specialization": "Dermatology & Skin Science",
        "hospital": "ClearSkin Dermatology Center",
        "cabin": "Room 114",
        "phone": "9889123456",
        "available": True,
    },
]


@app.get("/api/doctors")
def get_doctors(q: Optional[str] = None, specialty: Optional[str] = None):
    """Return all verified doctors across all specialties for patient search."""
    all_users = list_users()
    registered_doctors = [u for u in all_users if u.get("role") == "doctor"]

    # Combine registered doctors with default catalog to ensure rich specialty coverage
    seen_keys = set()
    doctors = []

    for d in registered_doctors + DEFAULT_DOCTORS_LIST:
        username_key = (d.get("username") or "").strip().lower()
        name_key = (d.get("full_name") or d.get("name") or "").strip().lower()
        unique_key = username_key or name_key
        if unique_key and unique_key not in seen_keys:
            seen_keys.add(unique_key)
            doc_id = d.get("id") or d.get("username")
            doctors.append({
                "id": doc_id,
                "full_name": d.get("full_name") or d.get("name") or "Doctor",
                "username": d.get("username", ""),
                "department": d.get("department") or "general",
                "specialization": d.get("specialization") or "General Medicine & Primary Care",
                "hospital": d.get("hospital") or "City General OPD Clinic",
                "cabin": d.get("cabin") or "Cabin 101",
                "phone": d.get("phone", ""),
                "available": True,
            })

    # Optional search filtering
    if q and q.strip():
        term = q.strip().lower()
        doctors = [
            d for d in doctors
            if term in d["full_name"].lower()
            or term in d["specialization"].lower()
            or term in d["hospital"].lower()
            or term in d["department"].lower()
        ]

    if specialty and specialty != "all":
        spec_term = specialty.lower()
        doctors = [
            d for d in doctors
            if spec_term in d["specialization"].lower() or spec_term in d["department"].lower()
        ]

    return {"doctors": doctors, "count": len(doctors)}


# ---------------------------------------------------------------------------
# Patient Medical Records Vault Endpoint (Requirement 3)
# ---------------------------------------------------------------------------
@app.get("/api/patient-vault")
def get_patient_vault():
    """Return pre-uploaded diagnostic records vault (MRI, X-ray, Blood Sugar/BP logs, CT scans) and past diagnoses."""
    return {
        "vault_records": [_normalize_medical_record(record) for record in DEFAULT_PATIENT_VAULT],
        "past_diagnoses": [_normalize_past_diagnosis(item) for item in DEFAULT_PAST_DIAGNOSES],
        "ayurveda_parameters": AYURVEDA_PARAMETER_DEFINITIONS,
    }


# ---------------------------------------------------------------------------
# POST /api/session/start
# ---------------------------------------------------------------------------
@app.post("/api/session/start", response_model=SessionStartResponse)
def session_start(req: SessionStartRequest):
    language = req.language if req.language in ("en", "hi") else "en"
    dept = req.department or "general"
    session = new_session(
        language=language,
        name=req.name or "Guest Patient",
        token=req.token or None,
        abha_id=req.abha_id or None,
        consent=req.consent,
        department=dept,
        chief_complaint=req.chief_complaint,
        consulting_doctor=req.consulting_doctor,
    )
    return {
        "session_id": session["session_id"],
        "department": session["department"],
        "token_number": session["token_number"],
        "consulting_doctor": session.get("consulting_doctor"),
    }


# ---------------------------------------------------------------------------
# POST /api/sessions/{session_id}/attach-records (Requirement 3)
# ---------------------------------------------------------------------------
@app.post("/api/sessions/{session_id}/attach-records")
def attach_records(session_id: str, req: AttachRecordsRequest):
    """Attach prior medical records (diagnostic scans, labs, and past diagnoses) before consulting doctor submission."""
    session = _require_session(session_id)
    uploaded_records = {
        document["id"]: document["patient_record"]
        for document in session.get("documents", [])
        if document.get("patient_record")
    }
    vault_records = {
        record["id"]: _normalize_medical_record(record)
        for record in DEFAULT_PATIENT_VAULT
    }
    selected_records = []
    for submitted_record in req.attached_records or []:
        record_id = submitted_record.get("id") if isinstance(submitted_record, dict) else None
        record = vault_records.get(record_id) or uploaded_records.get(record_id)
        if record and record_id not in {item.get("id") for item in selected_records}:
            selected_records.append(record)

    session["attached_records"] = selected_records
    session["share_past_history"] = bool(req.share_past_history)
    session["past_diagnoses"] = (
        [
            _normalize_past_diagnosis(item)
            for item in session.get("past_diagnoses") or DEFAULT_PAST_DIAGNOSES
        ]
        if req.share_past_history
        else []
    )
    save_session(session)
    return {
        "success": True,
        "session_id": session_id,
        "attached_count": len(session["attached_records"]),
        "share_past_history": session["share_past_history"],
    }


@app.post("/api/sessions/{session_id}/records/upload")
async def upload_patient_record(
    session_id: str,
    title: str = Form(...),
    record_type: str = Form(...),
    facility: str = Form(""),
    summary: str = Form(""),
    file: UploadFile = File(...),
):
    """Store a patient-uploaded scan privately and associate its metadata with the intake."""
    session = _require_session(session_id)
    media_type = file.content_type or ""
    if media_type not in ALLOWED_RECORD_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Upload a PDF, JPEG, PNG, or WebP medical report.",
        )

    file_bytes = await file.read(MAX_RECORD_UPLOAD_BYTES + 1)
    await file.close()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The selected report is empty.")
    if len(file_bytes) > MAX_RECORD_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Medical reports must be 20 MB or smaller.")
    if not title.strip():
        raise HTTPException(status_code=400, detail="A report title is required.")

    file_id = uuid.uuid4().hex
    try:
        PRIVATE_RECORDS_DIR.mkdir(parents=True, exist_ok=True)
        (PRIVATE_RECORDS_DIR / file_id).write_bytes(file_bytes)
    except OSError as error:
        logger.exception("Failed to store uploaded patient record")
        raise HTTPException(status_code=500, detail="The report could not be stored securely.") from error

    record = {
        "id": str(uuid.uuid4()),
        "title": title.strip(),
        "type": record_type.strip() or "Medical Report",
        "date": datetime.now(timezone.utc).date().isoformat(),
        "facility": facility.strip() or "Patient upload",
        "summary": summary.strip() or "Uploaded by patient for this consultation.",
        "file_name": Path(file.filename or "medical-report").name,
        "file_id": file_id,
        "media_type": media_type,
    }
    session.setdefault("documents", []).append(
        {
            "id": record["id"],
            "filename": record["file_name"],
            "uploaded_at": _now_iso(),
            "patient_record": record,
        }
    )
    save_session(session)
    return {"record": record}


@app.get("/api/sessions/{session_id}/records/{record_id}/file")
def get_patient_record_file(session_id: str, record_id: str):
    """Serve an attached report inline only while the patient has granted live access."""
    session = _require_session(session_id)
    if not session.get("demonstration_active", True):
        raise HTTPException(status_code=403, detail="Patient has revoked access to medical records.")

    is_attached = any(
        record.get("id") == record_id for record in session.get("attached_records", [])
    )
    if not is_attached:
        raise HTTPException(status_code=404, detail="The report is not attached to this consultation.")

    document = next(
        (
            item
            for item in session.get("documents", [])
            if item.get("id") == record_id and item.get("patient_record")
        ),
        None,
    )
    if not document:
        raise HTTPException(status_code=404, detail="Uploaded report file not found.")

    record = document["patient_record"]
    file_path = PRIVATE_RECORDS_DIR / record["file_id"]
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Uploaded report file is unavailable.")

    return FileResponse(
        file_path,
        media_type=record["media_type"],
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


# ---------------------------------------------------------------------------
# POST /api/sessions/{session_id}/toggle-demonstration (Requirement 4 & 5)
# CRITICAL PRIVACY CONTROL: Instantly revoke/restore doctor records viewing
# ---------------------------------------------------------------------------
@app.post("/api/sessions/{session_id}/toggle-demonstration")
def toggle_demonstration(session_id: str, req: Optional[ToggleDemonstrationRequest] = None):
    """Instant privacy toggle: patient can revoke doctor access to personal medical records at any second."""
    session = _require_session(session_id)
    if req is not None and req.demonstration_active is not None:
        session["demonstration_active"] = bool(req.demonstration_active)
    else:
        current = bool(session.get("demonstration_active", True))
        session["demonstration_active"] = not current
    save_session(session)
    return {
        "success": True,
        "session_id": session_id,
        "demonstration_active": session["demonstration_active"],
        "message": (
            "Medical records access GRANTED to consulting doctor."
            if session["demonstration_active"]
            else "Medical records access REVOKED by patient. Doctor viewer immediately locked."
        ),
    }


# ---------------------------------------------------------------------------
# POST /api/sessions/{session_id}/call (Requirement 4 & 5)
# Doctor 'Accept & Call' Action
# ---------------------------------------------------------------------------
@app.post("/api/sessions/{session_id}/call")
def call_patient(session_id: str, req: Optional[CallPatientRequest] = None):
    """Doctor accepts and calls patient into their consultation room/cabin."""
    session = _require_session(session_id)
    assigned_doctor = session.get("consulting_doctor") or {}
    assigned_doctor_id = assigned_doctor.get("id")
    if assigned_doctor_id and (not req or req.doctor_id != assigned_doctor_id):
        raise HTTPException(
            status_code=409,
            detail="This consultation request is assigned to a different doctor.",
        )

    session["status"] = "called"
    session["called_at"] = _now_iso()
    if req and (req.doctor_name or req.cabin):
        doc = session.get("consulting_doctor") or {}
        if req.doctor_id:
            doc["id"] = req.doctor_id
        if req.doctor_name:
            doc["name"] = req.doctor_name
        if req.hospital:
            doc["hospital"] = req.hospital
        if req.cabin:
            doc["cabin"] = req.cabin
        if req.specialization:
            doc["specialization"] = req.specialization
        session["consulting_doctor"] = doc
    save_session(session)
    return {
        "success": True,
        "status": "called",
        "session_id": session_id,
        "called_at": session["called_at"],
        "consulting_doctor": session.get("consulting_doctor"),
    }


# ---------------------------------------------------------------------------
# POST /api/sessions/{session_id}/status
# ---------------------------------------------------------------------------
@app.post("/api/sessions/{session_id}/status")
def update_status(session_id: str, req: UpdateStatusRequest):
    """Update consultation queue status: waiting, called, in_consultation, completed."""
    session = _require_session(session_id)
    session["status"] = req.status
    save_session(session)
    return {"session_id": session_id, "status": session["status"]}


@app.get("/api/sessions/{session_id}/status")
def get_session_status(session_id: str):
    """Fast polling endpoint for patient waiting screen status and live demonstration consent."""
    session = _require_session(session_id)
    doc = session.get("consulting_doctor") or {}
    return {
        "session_id": session_id,
        "status": session.get("status", "waiting"),
        "demonstration_active": session.get("demonstration_active", True),
        "called_at": session.get("called_at"),
        "consulting_doctor": doc,
        "token_number": session.get("token_number"),
        "token": session.get("token_number"),
        "cabin": doc.get("cabin", "Cabin 101"),
    }



CLINICAL_PROGRESSION = {
    "en": [
        (
            "Hello, I am your OPD clinical intake doctor today. What main symptom or discomfort brings you to the hospital?",
            ["Stomach pain / indigestion", "Joint or back pain", "Cough, cold or fever", "Skin rash / itching"]
        ),
        (
            "Where exactly is the discomfort located, and when did it first begin?",
            ["Started suddenly today", "Last 2 to 3 days", "Over 1 to 2 weeks", "Chronic / several months"]
        ),
        (
            "How would you describe the sensation (burning, throbbing, dull ache, sharp), and what is its severity from 1 to 10?",
            ["Mild ache (1-3)", "Moderate pain (4-6)", "Severe pain (7-8)", "Very intense / sharp (9-10)"]
        ),
        (
            "What makes your symptoms worse, and does anything like resting, eating, or warm water make it better?",
            ["Worse after meals", "Worse on empty stomach", "Worse with movement / exertion", "Relieved with rest / warm fluids"]
        ),
        (
            "Do you have associated symptoms such as changes in appetite, nausea, bloating, heartburn, or fatigue?",
            ["No associated symptoms", "Reduced appetite or nausea", "Bloating or heartburn", "Fatigue or another symptom"]
        ),
        (
            "Have you noticed any change in your bowel habits, such as constipation, diarrhea, or a change in frequency?",
            ["No recent change", "Constipation", "Diarrhea or loose stools", "Another change in frequency"]
        ),
        (
            "How have your diet, hydration, physical activity, sleep, or stress levels been recently?",
            ["No notable changes", "Changes in diet or hydration", "Less activity or disrupted sleep", "Increased stress"]
        ),
        (
            "Do you have any past medical conditions (like diabetes, BP, asthma) or allergies to any medications?",
            ["No prior illnesses or allergies", "Have diabetes / hypertension", "Known drug allergies", "Taking daily prescribed medicines"]
        ),
        (
            "Thank you for sharing your history. Is there any other symptom before we finalize your file for the consulting physician?",
            ["No, that covers everything", "Occasional headache / fatigue", "Mild generalized weakness", "Ready to see the doctor"]
        )
    ],
    "hi": [
        (
            "नमस्ते! मैं आपका ओपीडी केस-टेकिंग डॉक्टर हूँ। आज आपको क्या मुख्य तकलीफ़ या समस्या हो रही है?",
            ["पेट में दर्द या गैस", "जोड़ों या कमर में दर्द", "खांसी, ज़ुकाम या बुखार", "त्वचा की समस्या / खुजली"]
        ),
        (
            "यह तकलीफ़ शरीर में ठीक कहाँ पर है, और यह कब से शुरू हुई है?",
            ["आज अचानक शुरू हुई", "पिछले 2-3 दिनों से", "1-2 हफ्तों से", "कई महीनों से पुरानी समस्या"]
        ),
        (
            "यह दर्द या तकलीफ़ कैसी महसूस होती है (जलन, चुभन, भारीपन) और 1 से 10 के पैमाने पर कितनी तेज़ है?",
            ["हल्की तकलीफ़ (1-3)", "मध्यम दर्द (4-6)", "तेज़ दर्द (7-8)", "अत्यधिक तीव्र दर्द (9-10)"]
        ),
        (
            "क्या खाने या चलने-फिरने से यह तकलीफ़ बढ़ती है, और क्या आराम या गर्म पानी से राहत मिलती है?",
            ["खाना खाने के बाद बढ़ती है", "खाली पेट ज़्यादा होती है", "चलने-फिरने से बढ़ती है", "आराम करने से राहत मिलती है"]
        ),
        (
            "क्या भूख में बदलाव, मतली, पेट फूलना, सीने में जलन या थकान जैसे अन्य लक्षण हैं?",
            ["कोई अन्य लक्षण नहीं", "भूख कम लगना या मतली", "पेट फूलना या सीने में जलन", "थकान या कोई अन्य लक्षण"]
        ),
        (
            "क्या मल त्याग की आदत में कोई बदलाव आया है, जैसे कब्ज़, दस्त या बार-बार जाने की समस्या?",
            ["हाल में कोई बदलाव नहीं", "कब्ज़", "दस्त या पतला मल", "बारंबारता में अन्य बदलाव"]
        ),
        (
            "हाल में आपके खान-पान, पानी पीने, शारीरिक गतिविधि, नींद या तनाव में क्या बदलाव हुए हैं?",
            ["कोई खास बदलाव नहीं", "खान-पान या पानी पीने में बदलाव", "कम गतिविधि या नींद में परेशानी", "तनाव में वृद्धि"]
        ),
        (
            "क्या आपको पहले से कोई बीमारी (जैसे बीपी, शुगर, थायरॉइड) है या किसी दवा से एलर्जी है?",
            ["कोई पुरानी बीमारी या एलर्जी नहीं है", "डायबिटीज या बीपी की समस्या है", "कुछ दवाओं से एलर्जी है", "नियमित दवाएं चल रही हैं"]
        ),
        (
            "जानकारी देने के लिए धन्यवाद। क्या डॉक्टर साहब को दिखाने से पहले आप कोई अन्य लक्षण बताना चाहते हैं?",
            ["नहीं, सब कुछ बता दिया है", "हल्का सिरदर्द या कमजोरी रहती है", "शरीर में थकान रहती है", "डॉक्टर परामर्श के लिए तैयार हूँ"]
        )
    ]
}

# ---------------------------------------------------------------------------
# POST /api/converse  (Module A)
# ---------------------------------------------------------------------------
@app.post("/api/converse")
def converse(req: ConverseRequest):
    session = _require_session(req.session_id)
    current_turn = session.get("turn_count", 0)
    lang = "hi" if session.get("language") == "hi" else "en"
    progression = CLINICAL_PROGRESSION[lang]

    if req.patient_message:
        session["messages"].append({"role": "user", "content": req.patient_message})
        # Record into transcript
        prev_idx = min(max(0, current_turn - 1), len(progression) - 1)
        prev_q = progression[prev_idx][0]
        session["transcript"]["qa_pairs"].append({"question": prev_q, "answer": req.patient_message})
        if not session["transcript"].get("chief_complaint"):
            session["transcript"]["chief_complaint"] = req.patient_message
    else:
        language_name = "Hindi" if session["language"] == "hi" else "English"
        dept = session.get("department", "general")
        session["messages"].append(
            {
                "role": "user",
                "content": (
                    f"(The patient has sat down at the {dept} OPD clinic. "
                    f"Their preferred language is {language_name}. "
                    "Conduct a structured clinical case-taking interview. "
                    "Greet them warmly and ask their primary concern.)"
                ),
            }
        )

    # The initial prompt request is counted as turn one; the final answer arrives on turn nine.
    if current_turn >= len(progression):
        fallback = {
            "next_question": None,
            "quick_options": [],
            "red_flag": False,
            "red_flag_reason": None,
            "interview_complete": True,
            "updated_transcript": session["transcript"],
        }
    else:
        q_idx = min(current_turn, len(progression) - 1)
        fallback_q, fallback_opts = progression[q_idx]
        fallback = {
            "next_question": fallback_q,
            "quick_options": fallback_opts,
            "red_flag": False,
            "red_flag_reason": None,
            "interview_complete": False,
            "updated_transcript": session["transcript"],
        }

    result = call_json(MODULE_A_SYSTEM_PROMPT, session["messages"], fallback)

    # Keep the intake at exactly nine clinical stages unless an emergency is flagged.
    if current_turn >= len(progression):
        result["interview_complete"] = True
        result["next_question"] = None
        result["quick_options"] = []
    elif not result.get("red_flag"):
        result["interview_complete"] = False
        if not result.get("next_question"):
            q_idx = min(current_turn, len(progression) - 1)
            result["next_question"], result["quick_options"] = progression[q_idx]

    # Save turn and persist assistant message
    assistant_record = {k: v for k, v in result.items() if k != "_fallback_reason"}
    session["messages"].append(
        {"role": "assistant", "content": json.dumps(assistant_record)}
    )
    session["turn_count"] = current_turn + 1

    if isinstance(result.get("updated_transcript"), dict):
        session["transcript"] = result["updated_transcript"]

    # Red-flag keyword check backstop
    patient_texts = [m["content"] for m in session["messages"] if m["role"] == "user"]
    combined_patient_text = "\n".join(patient_texts)
    kw_triggered, kw_reason = check_red_flag_keywords(combined_patient_text)

    llm_flag = bool(result.get("red_flag"))
    final_flag = llm_flag or kw_triggered
    if llm_flag and kw_triggered:
        final_reason = f"{result.get('red_flag_reason') or 'LLM flagged'}; {kw_reason}"
    elif kw_triggered:
        final_reason = kw_reason
    else:
        final_reason = result.get("red_flag_reason")

    result["red_flag"] = final_flag
    result["red_flag_reason"] = final_reason

    if final_flag:
        result["interview_complete"] = True
        result["next_question"] = None
        result["quick_options"] = []

    session["red_flag"] = final_flag
    session["red_flag_reason"] = final_reason
    session["interview_complete"] = bool(result.get("interview_complete"))

    # Auto-synthesize doctor report as soon as interview finishes
    if session["interview_complete"] and not session.get("summary"):
        try:
            summarize(SummarizeRequest(session_id=session["session_id"]))
        except Exception as e:
            print(f"[MediKiosk] Auto-summary error: {e}")

    save_session(session)
    return result


# ---------------------------------------------------------------------------
# POST /api/extract-doc  (Module B)
# ---------------------------------------------------------------------------
def _parse_doc_date(date_str):
    if not date_str or not isinstance(date_str, str):
        return None
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d.%m.%Y",
        "%d %B %Y",
        "%d %b %Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%Y/%m/%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def _sort_documents_chronologically(documents: list) -> list:
    """Section 4.3: sort by date in plain code, not via the LLM.
    Undated documents are pushed to the end and flagged."""
    decorated = []
    for doc in documents:
        parsed = _parse_doc_date(doc.get("date"))
        doc["date_unparsed"] = parsed is None and doc.get("date") is not None
        decorated.append((parsed is None, parsed or datetime.max, doc))
    decorated.sort(key=lambda t: (t[0], t[1]))
    return [d for _, _, d in decorated]


@app.post("/api/extract-doc")
async def extract_doc(session_id: str = Form(...), image: UploadFile = File(...)):
    session = _require_session(session_id)

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image upload")

    media_type = image.content_type if image.content_type in ALLOWED_IMAGE_TYPES else "image/jpeg"

    fallback = {
        "document_type": "unknown",
        "date": None,
        "diagnoses": [],
        "medications": [],
        "investigations": [],
        "extraction_notes": (
            "Automatic extraction failed for this image. Please review the "
            "original document manually."
        ),
    }

    result = call_json_vision(
        MODULE_B_SYSTEM_PROMPT,
        image_bytes,
        media_type,
        "Extract structured data from this medical document image, "
        "following your system prompt exactly.",
        fallback,
    )

    doc_entry = {
        "id": str(uuid.uuid4()),
        "filename": image.filename,
        "uploaded_at": _now_iso(),
        **result,
    }
    if "_fallback_reason" in result:
        print(f"[MediKiosk] Module B fallback: {result['_fallback_reason']}")
    session["documents"].append(doc_entry)
    session["documents"] = _sort_documents_chronologically(session["documents"])
    save_session(session)

    return doc_entry


# ---------------------------------------------------------------------------
# POST /api/summarize  (Module C)
# ---------------------------------------------------------------------------
@app.post("/api/summarize")
def summarize(req: SummarizeRequest):
    session = _require_session(req.session_id)

    documents_for_prompt = [
        {k: v for k, v in doc.items() if k not in ("id", "filename", "uploaded_at", "_fallback_reason")}
        for doc in session["documents"]
    ]
    payload = {
        "department": session.get("department", "general"),
        "transcript": session["transcript"],
        "extracted_documents": documents_for_prompt,
    }
    messages = [{"role": "user", "content": json.dumps(payload)}]

    chief_complaint = session["transcript"].get("chief_complaint") or "Not reported"
    fallback = {
        "chief_complaint": chief_complaint,
        "hpi": "Not reported",
        "past_medical_surgical": "Not reported",
        "drug_allergy_history": "Not reported",
        "family_history": "Not reported",
        "personal_history": "Not reported",
        "review_of_systems": "Not reported",
        "prior_investigations_summary": "Not reported",
        "ayush_assessment": {
            "prakriti_assessment": "Pitta-Vata dominant constitution (inferred from metabolic reactivity)",
            "vikriti_assessment": "Pitta-Kapha vitiation with digestive sluggishness (Ajeerna)",
            "agni_status": "Vishamagni (variable digestive fire)",
            "koshtha_status": "Madhyama (moderate bowel habits)",
            "ahara_vihara_analysis": "Irregular meal timings; disturbed sleep pattern with daytime fatigue",
            "nidana_factors": "Spicy diet, stress, and inconsistent hydration",
            "dashavidha_pariksha": {
                "sara": "Madhyama (moderate tissue strength)",
                "samhanana": "Madhyama (moderate body compactness)",
                "pramana": "Proportionate anthropometry",
                "satmya": "Habituated to mixed Indian diet",
                "sattva": "Madhyama (moderate mental resilience)",
                "ahara_shakti": "Jarana shakti mildly impaired",
                "vyayama_shakti": "Mild to moderate physical stamina",
                "vaya": "Madhyama Vaya (Adult)"
            }
        }
    }

    result = call_json(MODULE_C_SYSTEM_PROMPT, messages, fallback)
    if "_fallback_reason" in result:
        print(f"[MediKiosk] Module C fallback: {result['_fallback_reason']}")
    session["summary"] = result
    session["ayurveda_profile"] = build_ayurveda_profile(
        summary=result,
        transcript=session.get("transcript"),
        chief_complaint=chief_complaint,
    )
    save_session(session)
    return result



def _build_patient_narrative_fallback(session: dict) -> dict:
    """Build a rich, empathetic, strictly non-diagnostic patient experience narrative fallback."""
    name = session.get("patient_name") or "Patient"
    summary = session.get("summary") or {}
    transcript = session.get("transcript") or {}
    ayush = summary.get("ayush_assessment") or {}

    chief = (
        transcript.get("chief_complaint")
        or summary.get("chief_complaint")
        or "generalized bodily discomfort"
    )
    hpi = summary.get("hpi") or ""
    qa_list = transcript.get("qa_pairs") or []

    lower_text = f"{chief} {hpi} {' '.join([q.get('answer', '') for q in qa_list])}".lower()

    if any(k in lower_text for k in ["knee", "joint", "sandhigata", "arthritis", "stiffness"]):
        headline = "Facing persistent bilateral knee discomfort, restricted morning mobility, and pain navigating stairs"
        story = (
            f"{name} describes a distressing daily struggle with both knees, which feel stiff and rigid especially upon waking in the morning. "
            "The initial 30 minutes of the day require significant conscious effort to achieve comfortable weight-bearing. "
            "Simple activities such as climbing stairs, getting up from low seating, and walking moderate distances now require careful pacing, creating frustration and a feeling of lost physical independence. "
            "Cold weather noticeably intensifies the aching sensation within the joint space, whereas gentle warm oil application (Abhyanga) and warm fomentation provide temporary comfort."
        )
        impact = {
            "physical_mobility": "Difficulty climbing stairs, squatting, and getting up from low seating; restricted walking radius before discomfort sets in.",
            "sleep_and_rest": "Occasional nighttime awakenings when turning or shifting positions in bed; waking up with 25-30 minutes of pronounced knee rigidity.",
            "work_and_routine": "Household tasks and daily errands take longer to complete; conscious pacing is required to avoid late afternoon flare-ups.",
            "emotional_wellbeing": "Expresses frustration regarding reduced self-reliance and worries about progressive loss of mobility."
        }
        timeline = [
            {"phase": "Initial Onset (approx. 6 months ago)", "description": "Mild occasional ache in knees after prolonged walking, initially brushed off as routine fatigue."},
            {"phase": "Progression & Winter Flares", "description": "Gradual onset of morning stiffness lasting nearly half an hour; stair navigation became distinctly uncomfortable."},
            {"phase": "Current Daily Experience", "description": "Persistent bilateral ache rated moderate to severe on movement; daily reliance on warm compresses for temporary ease."}
        ]
        agg_rel = {
            "what_worsens": ["Climbing stairs or incline surfaces", "Cold morning air and winter exposure", "Prolonged standing or rapid walking", "Squatting or floor sitting"],
            "what_helps": ["Warm oil massage (Abhyanga)", "Hot water fomentation", "Resting in a comfortable supine or seated position", "Gentle slow warm-up movements"]
        }
        cues = [
            "Assess active and passive range of motion in bilateral knee joints and presence of crepitus",
            "Examine quadriceps and hamstring muscle strength and gait symmetry",
            "Evaluate joint line tenderness and patellar mobility without diagnostic assumptions"
        ]
    elif any(k in lower_text for k in ["sugar", "diabetes", "nocturia", "thirst", "fatigue", "urination"]):
        headline = "Coping with disrupted sleep from frequent nocturnal awakenings, unquenchable thirst, and persistent daytime exhaustion"
        story = (
            f"Over recent weeks, {name} has been dealing with an unsettling decline in daily vitality and physical stamina. "
            "Sleep is repeatedly fragmented by having to get up 3 to 4 times each night to pass urine, leaving them feeling completely unrefreshed and sluggish by midday. "
            "An ongoing sensation of dryness in the throat and persistent thirst create constant physical discomfort throughout working hours. "
            "The combination of chronic fatigue and fluctuating energy levels has begun to strain concentration at work and diminish daily enthusiasm."
        )
        impact = {
            "physical_mobility": "Generalized bodily lethargy and heavy limbs; rapid exhaustion during standard daily walking or routine tasks.",
            "sleep_and_rest": "Fragmented sleep pattern with 3 to 4 awakenings every night to void; daytime somnolence and lack of restorative rest.",
            "work_and_routine": "Struggles to sustain afternoon focus at desk; frequent trips for water and restroom breaks interrupt workflow.",
            "emotional_wellbeing": "Heightened health anxiety regarding unpredictable fatigue, family history concerns, and unrefreshed state."
        }
        timeline = [
            {"phase": "Initial Onset (approx. 3-4 weeks ago)", "description": "Noticed increasing dryness of mouth and waking once or twice at night to drink water."},
            {"phase": "Evolution & Escalation", "description": "Nighttime bathroom visits increased to 3-4 times; morning fatigue became an everyday barrier."},
            {"phase": "Current Daily State", "description": "Persistent post-meal sluggishness, heavy eyes, and constant dry throat during daily work."}
        ]
        agg_rel = {
            "what_worsens": ["Heavy refined carbohydrate or sugary meals", "Late-night dinner timings", "Physical or mental work stress", "Dehydration or lack of water"],
            "what_helps": ["Drinking adequate room-temperature water", "Light post-meal walking", "Structured sleep hours", "Eating lighter, wholesome meals"]
        }
        cues = [
            "Review recent fasting glucose and HbA1c values with patient without formal diagnostic assertion",
            "Perform monofilament touch sensation check on lower extremities to inspect peripheral nerve comfort",
            "Inspect oral cavity for mucosal hydration and check orthostatic blood pressure readings"
        ]
    elif any(k in lower_text for k in ["acidity", "reflux", "stomach", "burning", "gerd", "bloating", "indigestion"]):
        headline = "Struggling with post-meal retrosternal burning, sour regurgitation, and sleep disruption when lying down"
        story = (
            f"{name} has been enduring an uncomfortable, persistent burning sensation ascending from the epigastrium towards the chest and throat. "
            "Meals that were previously enjoyed now trigger sour fluid regurgitation, abdominal tightness, and bloating within an hour. "
            "Nighttimes are particularly challenging, as lying flat often provokes an unpleasant acid surge that forces the patient to prop up several pillows to sleep. "
            "This ongoing digestive discomfort has created hesitation around eating and noticeable daily irritability."
        )
        impact = {
            "physical_mobility": "Bending forward or heavy lifting triggers uncomfortable acid reflux into the throat.",
            "sleep_and_rest": "Sleep disturbed when lying flat; frequently wakes with coughing or a sour taste in mouth.",
            "work_and_routine": "Discomfort during work hours following lunchtime meals; reduced appetite and fear of mealtime flares.",
            "emotional_wellbeing": "Daily irritability and mealtime anxiety caused by the anticipation of burning distress."
        }
        timeline = [
            {"phase": "Initial Presentation", "description": "Occasional heartburn after oily, spicy dinners or delayed meals."},
            {"phase": "Escalation", "description": "Burning became frequent daily event, accompanied by sour belching and throat irritation."},
            {"phase": "Current Daily Experience", "description": "Post-prandial fullness, nocturnal regurgitation, and morning hoarseness."}
        ]
        agg_rel = {
            "what_worsens": ["Spicy, oily, or fermented foods", "Lying down flat immediately after meals", "Tea, coffee, or empty stomach fasting", "Stress and irregular meal timings"],
            "what_helps": ["Sipping cold milk or lukewarm water", "Elevating the head of the bed with extra pillows", "Eating smaller, bland portioned meals", "Sitting upright for 2 hours post-food"]
        }
        cues = [
            "Palpate epigastric region for focal tenderness or voluntary guarding",
            "Check pharynx for signs of posterior mucosal erythema or reflux laryngitis",
            "Review dietary habits and timing between last meal and sleep"
        ]
    elif any(k in lower_text for k in ["headache", "migraine", "head pain", "shiroroga"]):
        headline = "Enduring intense episodic throbbing head pain, sensitivity to sensory stimuli, and fatigue"
        story = (
            f"{name} has been severely impacted by recurrent, pulsating pain across the head, which markedly limits daily activity during acute episodes. "
            "Exposure to bright lights, loud environmental sounds, and prolonged screen time aggravate the pounding sensation, forcing the patient to retreat to darkened, quiet spaces. "
            "Nausea and visual strain frequently accompany the head discomfort, making routine work or household tasks almost impossible while the flare-up lasts. "
            "The unpredictable nature of these episodes creates ongoing stress and fear of triggering another debilitating attack."
        )
        impact = {
            "physical_mobility": "Bending forward, sudden head movements, and walking in direct sunlight intensify throbbing pain.",
            "sleep_and_rest": "Sleep disrupted during acute nighttime headaches; often requires a quiet, completely dark room to rest.",
            "work_and_routine": "Unable to maintain screen work or reading; productivity drops sharply during active flare-ups.",
            "emotional_wellbeing": "Apprehension and emotional tension surrounding when the next severe pain episode will strike."
        }
        timeline = [
            {"phase": "Prodrome & Onset", "description": "Mild neck tension or visual heaviness preceding the onset of focal head pain."},
            {"phase": "Peak Throbbing Phase", "description": "Intense pulsating discomfort accompanied by nausea and sensory intolerance lasting several hours."},
            {"phase": "Postdrome & Current State", "description": "Residual heaviness, cognitive sluggishness, and generalized exhaustion following peak pain."}
        ]
        agg_rel = {
            "what_worsens": ["Bright sunlight or fluorescent glare", "Loud noises and stressful environments", "Skipped meals or dehydration", "Lack of restorative sleep"],
            "what_helps": ["Resting in a pitch-dark, quiet room", "Cold or warm forehead compress", "Hydrating with room-temperature water", "Gentle temporal acupressure"]
        }
        cues = [
            "Perform fundoscopic examination and check cranial nerve responses",
            "Assess cervical spine mobility, suboccipital tenderness, and trapezius muscle spasm",
            "Review frequency, duration, and precipitating dietary triggers without delivering diagnosis"
        ]
    elif any(k in lower_text for k in ["fever", "cough", "cold", "jwara", "kasa", "throat"]):
        headline = "Struggling with debilitating bodily fever, hacking cough, and severe generalized exhaustion"
        story = (
            f"{name} is currently experiencing significant constitutional distress with elevated body temperature, persistent shivering chills, and full-body myalgia. "
            "A frequent dry or phlegm-producing cough causes continuous throat raw irritation and interrupts both speech and rest. "
            "Simple activities such as walking around the home cause breathless fatigue, and the patient's appetite has plummeted, leaving them feeling profoundly weak. "
            "The combination of thermal discomfort, body aches, and relentless coughing has left them feeling drained and physically depleted."
        )
        impact = {
            "physical_mobility": "Marked physical weakness and muscle soreness; largely confined to bed or seated rest.",
            "sleep_and_rest": "Severely disturbed sleep due to coughing fits, fever spikes, and night sweats.",
            "work_and_routine": "Completely unable to attend to routine work or household responsibilities.",
            "emotional_wellbeing": "Feeling helpless and weary from constant shivering, aches, and respiratory strain."
        }
        timeline = [
            {"phase": "Initial Symptoms", "description": "Sudden onset of throat scratchiness, malaise, and mild temperature rise."},
            {"phase": "Peak Febrile State", "description": "High temperature spikes with rigors, body aches, and hacking cough."},
            {"phase": "Current Daily State", "description": "Persistent thermal dysregulation, chest/throat soreness on coughing, and generalized fatigue."}
        ]
        agg_rel = {
            "what_worsens": ["Cold drafts or air conditioning", "Cold drinking water or dairy", "Physical exertion", "Talking continuously"],
            "what_helps": ["Drinking warm water or herbal teas", "Steam inhalation (Bashpa Swedana)", "Adequate bed rest under warm blankets", "Sipping warm honey and ginger"]
        }
        cues = [
            "Auscultate lung fields for rhonchi, wheezes, or reduced air entry",
            "Inspect oropharynx and tonsillar pillars for exudate or congestion",
            "Record exact core body temperature, respiratory rate, and pulse oximetry saturation"
        ]
    else:
        headline = f"Facing ongoing daily physical discomfort related to {chief}"
        story = (
            f"{name} is experiencing significant disruption to their daily wellbeing centered around their primary complaint of {chief}. "
            "The physical sensations create ongoing challenges in maintaining their normal daily rhythm and peace of mind. "
            "The patient reports that the symptoms fluctuate depending on daily activities, meal schedules, and stress levels, causing notable fatigue by the end of the day. "
            "They are seeking clear clinical guidance to alleviate these uncomfortable sensations and regain their routine comfort."
        )
        impact = {
            "physical_mobility": "Movement and physical stamina are noticeably dampened during periods of active symptoms.",
            "sleep_and_rest": "Rest is somewhat fragmented due to physical discomfort or anxiety regarding the ongoing health concern.",
            "work_and_routine": "Routine duties require conscious pacing and frequent pauses to manage discomfort levels.",
            "emotional_wellbeing": "Experiencing mild to moderate frustration and emotional strain from persistent, unresolved symptoms."
        }
        timeline = [
            {"phase": "Onset", "description": "Symptoms first noted as occasional mild discomfort."},
            {"phase": "Evolution", "description": "Gradually became noticeable during regular daily activities and work."},
            {"phase": "Present Encounter", "description": "Seeking medical evaluation at OPD today for relief and professional review."}
        ]
        agg_rel = {
            "what_worsens": ["Physical overexertion or fatigue", "Irregular daily schedule", "Environmental stress"],
            "what_helps": ["Quiet rest in a relaxed posture", "Hydration and light nutrition", "Support from family members"]
        }
        cues = [
            "Conduct focused physical examination corresponding to the primary complaint area",
            "Inquire directly about the patient's daily functional limitations and home environment",
            "Review baseline vital parameters and prior investigation trends"
        ]

    holistic = {
        "appetite_and_digestion": ayush.get("agni_status") or "Reported digestive rhythm feels somewhat irregular or heavy post-meals",
        "bowel_and_elimination": ayush.get("koshtha_status") or "Bowel regularity reported as variable or requiring deliberate hydration",
        "dietary_routine": ayush.get("ahara_vihara_analysis") or "Mixed diet with irregular meal hours and daily stress factors"
    }

    return {
        "headline": headline,
        "patient_story": story,
        "daily_life_impact": impact,
        "symptom_progression_timeline": timeline,
        "aggravating_and_relieving": agg_rel,
        "holistic_lifestyle_observations": holistic,
        "doctor_review_cues": cues,
        "safety_disclaimer": "CLINICAL SAFETY NOTICE: This AI summary report is purely descriptive of the patient's reported symptoms, bodily sensations, and functional challenges. In accordance with clinical safety guidelines, this report DOES NOT deliver a medical diagnosis. Formal clinical diagnosis and treatment plans are the exclusive responsibility of the consulting physician."
    }


# ---------------------------------------------------------------------------
# POST & GET /api/sessions/{session_id}/narrative-summary
# AI Patient Lived Experience Report (Strictly Non-Diagnostic)
# ---------------------------------------------------------------------------
@app.post("/api/sessions/{session_id}/narrative-summary")
def generate_narrative_summary(session_id: str, refresh: bool = False):
    """Generate an AI-synthesized, empathetic patient experience summary report.
    STRICTLY NON-DIAGNOSTIC: Understands what the patient is experiencing and facing
    in daily life without providing a disease diagnosis."""
    session = _require_session(session_id)

    if not refresh and session.get("narrative_summary"):
        return session["narrative_summary"]

    fallback = _build_patient_narrative_fallback(session)

    context_payload = {
        "patient_name": session.get("patient_name", "Patient"),
        "department": session.get("department", "general"),
        "chief_complaint": (session.get("transcript") or {}).get("chief_complaint") or (session.get("summary") or {}).get("chief_complaint") or "Not reported",
        "transcript": session.get("transcript") or {},
        "summary": session.get("summary") or {},
        "documents": session.get("documents") or [],
    }

    messages = [
        {
            "role": "user",
            "content": f"Please synthesize an empathetic, humanized clinical experience narrative report for this patient. "
                       f"Focus deeply on what they are facing and their daily struggles. "
                       f"CRITICAL SAFETY RULE: DO NOT provide any disease diagnosis or diagnostic labels. "
                       f"Patient Context:\n{json.dumps(context_payload, indent=2)}"
        }
    ]

    result = call_json(MODULE_NARRATIVE_SYSTEM_PROMPT, messages, fallback)
    if "_fallback_reason" in result:
        print(f"[MediKiosk] Narrative Summary fallback: {result['_fallback_reason']}")

    if not result.get("safety_disclaimer"):
        result["safety_disclaimer"] = fallback["safety_disclaimer"]

    session["narrative_summary"] = result
    save_session(session)
    return result


@app.get("/api/sessions/{session_id}/narrative-summary")
def get_narrative_summary_get(session_id: str, refresh: bool = False):
    return generate_narrative_summary(session_id=session_id, refresh=refresh)


# ---------------------------------------------------------------------------
# POST /api/route  (Module D -- ABDM / HIS FHIR Integration, spec section 6.1)
# ---------------------------------------------------------------------------
@app.post("/api/route")
def route(req: RouteRequest):
    session = _require_session(req.session_id)

    if req.physician_edits:
        session["summary"] = {**(session["summary"] or {}), **req.physician_edits}

    summary = session["summary"] or {}
    ayush = summary.get("ayush_assessment") or {}
    abha_id = session.get("abha_id") or f"91-{session['session_id'][:4]}-{session['session_id'][4:8]}-{session['session_id'][9:13]}".upper()

    composition_sections = [
        {
            "title": "Chief Complaint (Pradhana Vedana)",
            "text": summary.get("chief_complaint", "Not reported"),
        },
        {
            "title": "History of Present Illness (HPI)",
            "text": summary.get("hpi", "Not reported"),
        },
        {
            "title": "Past Medical & Surgical History",
            "text": summary.get("past_medical_surgical", "Not reported"),
        },
        {
            "title": "Drug & Allergy History",
            "text": summary.get("drug_allergy_history", "Not reported"),
        },
        {
            "title": "Review of Systems",
            "text": summary.get("review_of_systems", "Not reported"),
        },
    ]

    if ayush:
        composition_sections.append({
            "title": "Ayush Dashavidha & Rogi-Roga Assessment",
            "text": (
                f"Prakriti: {ayush.get('prakriti_assessment', 'Not reported')} | "
                f"Vikriti: {ayush.get('vikriti_assessment', 'Not reported')} | "
                f"Agni: {ayush.get('agni_status', 'Not reported')} | "
                f"Koshtha: {ayush.get('koshtha_status', 'Not reported')} | "
                f"Ahara-Vihara: {ayush.get('ahara_vihara_analysis', 'Not reported')}"
            )
        })

    bundle_entries = [
        {
            "fullUrl": f"urn:uuid:patient-{session['session_id']}",
            "resource": {
                "resourceType": "Patient",
                "id": session["session_id"][:8],
                "identifier": [
                    {
                        "system": "https://healthid.ndhm.gov.in",
                        "type": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR"}]},
                        "value": abha_id,
                    }
                ],
                "name": [{"text": session.get("patient_name") or "Guest Patient"}],
                "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]},
            },
        },
        {
            "fullUrl": f"urn:uuid:composition-{session['session_id']}",
            "resource": {
                "resourceType": "Composition",
                "status": "final",
                "type": {
                    "coding": [{"system": "http://snomed.info/sct", "code": "371530004", "display": "Clinical consultation report"}],
                    "text": "Outpatient Clinical & AYUSH Intake Case Summary",
                },
                "date": _now_iso(),
                "title": f"OPD Case Record - {session.get('department', 'general').upper()}",
                "section": composition_sections,
                "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifact"]},
            },
        },
    ]

    # Add Ayush Observation if available
    if ayush.get("prakriti_assessment") or ayush.get("agni_status"):
        bundle_entries.append({
            "fullUrl": f"urn:uuid:observation-ayush-{session['session_id']}",
            "resource": {
                "resourceType": "Observation",
                "status": "preliminary",
                "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "exam"}]}],
                "code": {"text": "Ayurvedic Clinical Intake Assessment (Dashavidha Pariksha)"},
                "component": [
                    {"code": {"text": "Prakriti"}, "valueString": ayush.get("prakriti_assessment", "Not reported")},
                    {"code": {"text": "Vikriti"}, "valueString": ayush.get("vikriti_assessment", "Not reported")},
                    {"code": {"text": "Agni"}, "valueString": ayush.get("agni_status", "Not reported")},
                    {"code": {"text": "Koshtha"}, "valueString": ayush.get("koshtha_status", "Not reported")},
                ],
            }
        })

    bundle = {
        "resourceType": "Bundle",
        "id": f"abdm-bundle-{session['session_id'][:8]}",
        "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]},
        "identifier": {"system": "https://abdm.gov.in/bundles", "value": f"ABDM-DOC-{session['session_id'][:8].upper()}"},
        "type": "document",
        "timestamp": _now_iso(),
        "entry": bundle_entries,
        "status": "transmitted-to-his",
    }

    route_result = {
        "fhir_bundle": bundle,
        "sent_to_his": True,
        "sent_at": _now_iso(),
        "confirmation_message": "✅ Summary linked to ABHA & pushed to Doctor EMR / Hospital Information System",
    }
    session["route"] = route_result
    save_session(session)
    return route_result


# ---------------------------------------------------------------------------
# GET /api/session/:id
# ---------------------------------------------------------------------------
@app.get("/api/session/{session_id}")
def get_session_full(session_id: str):
    session = _require_session(session_id)
    # Omit the raw LLM turn history -- it's internal plumbing for Module
    # A's statelessness, not something the dashboard needs to render.
    public_view = {k: v for k, v in session.items() if k != "messages"}
    if not session.get("demonstration_active", True):
        public_view["attached_records"] = []
        public_view["past_diagnoses"] = []
        public_view["documents"] = []
    else:
        public_view["attached_records"] = [
            _normalize_medical_record(record)
            for record in session.get("attached_records", [])
        ]
        public_view["documents"] = [
            document
            for document in session.get("documents", [])
            if not document.get("patient_record")
        ]
        if session.get("share_past_history", True):
            public_view["past_diagnoses"] = [
                _normalize_past_diagnosis(item)
                for item in session.get("past_diagnoses", [])
            ]
        else:
            public_view["past_diagnoses"] = []
    return public_view


# ---------------------------------------------------------------------------
# GET /api/sessions (Doctor Queue)
# ---------------------------------------------------------------------------
@app.get("/api/sessions")
def get_all_sessions():
    """Return all patient sessions sorted by token number for the doctor queue."""
    return get_all_sessions_summary()


# ---------------------------------------------------------------------------
# POST /api/sessions/book (Quick Book with Auto-Incremented Token)
# ---------------------------------------------------------------------------
@app.post("/api/sessions/book")
def quick_book(req: QuickBookRequest):
    """Auto-generate the next sequential token number and book a patient."""
    dept = req.department or "general"
    lang = req.language if req.language in ("en", "hi") else "en"
    session = new_session(
        language=lang,
        name=req.name or "Walk-in Patient",
        token=None,  # Triggers automatic sequential token generation (e.g. 1, 2, 3...)
        abha_id=req.abha_id or None,
        consent=True,
        department=dept,
        chief_complaint=req.chief_complaint,
        consulting_doctor=req.consulting_doctor,
    )
    return {
        "session_id": session["session_id"],
        "token_number": session["token_number"],
        "patient_name": session["patient_name"],
        "department": session["department"],
        "consulting_doctor": session.get("consulting_doctor"),
    }



# ---------------------------------------------------------------------------
# POST /api/doctor/chat (OpenRouter Disease-Aware Chatbot)
# ---------------------------------------------------------------------------
@app.post("/api/doctor/chat", response_model=DoctorChatResponse)
def doctor_chat(req: DoctorChatRequest):
    """Disease-aware chatbot via OpenRouter (Claude 3.5 Sonnet / Llama 3).
    Follows Phase 1 (open-ended symptom inquiry) -> Phase 2 (targeted disease probing)."""
    messages_payload = [{"role": m.role, "content": m.content} for m in req.messages]
    result = call_openrouter_chat(
        messages=messages_payload,
        model=req.model or "anthropic/claude-3.5-sonnet",
        api_key=req.api_key,
    )
    return result


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "active_sessions": len(all_sessions()),
        "database": "mysql",
        "mysql_connected": database.is_mysql_available(),
        "openrouter_configured": bool(os.environ.get("OPENROUTER_API_KEY")),
    }
