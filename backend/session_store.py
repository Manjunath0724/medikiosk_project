import json
import logging
import re
import threading
import uuid
from datetime import datetime, timezone
import database

logger = logging.getLogger("medikiosk.session_store")

# In-memory fallback cache in case MySQL is offline
_SESSIONS_MEMORY: dict = {}
_STORE_LOCK = threading.Lock()
_TOKEN_COUNTER: int = 0


def _extract_number(token_str: str) -> int | None:
    if not token_str:
        return None
    matches = re.findall(r"\d+", str(token_str))
    if matches:
        return int(matches[-1])
    return None


def _clean_json_val(val, default=None):
    if val is None:
        return default
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return default
    return default


def _row_to_session_dict(row: dict) -> dict:
    if not row:
        return None
    created = row.get("created_at")
    if isinstance(created, datetime):
        created_str = created.isoformat()
    else:
        created_str = str(created) if created else datetime.now(timezone.utc).isoformat()

    return {
        "session_id": str(row.get("session_id")),
        "token_number": str(row.get("token_number")),
        "patient_name": row.get("patient_name") or "Guest Patient",
        "department": row.get("department") or "general",
        "language": row.get("language") or "en",
        "abha_id": row.get("abha_id"),
        "consent": bool(row.get("consent", True)),
        "created_at": created_str,
        "turn_count": int(row.get("turn_count") or 0),
        "interview_complete": bool(row.get("interview_complete", False)),
        "red_flag": bool(row.get("red_flag", False)),
        "red_flag_reason": row.get("red_flag_reason"),
        "messages": _clean_json_val(row.get("messages"), []),
        "transcript": _clean_json_val(row.get("transcript"), {
            "chief_complaint": "",
            "qa_pairs": [],
            "red_flags": [],
            "ayush_notes": {},
        }),
        "documents": _clean_json_val(row.get("documents"), []),
        "summary": _clean_json_val(row.get("summary"), None),
        "narrative_summary": _clean_json_val(row.get("narrative_summary"), None),
        "route": _clean_json_val(row.get("route"), None),
        "consulting_doctor": _clean_json_val(row.get("consulting_doctor"), None),
        "status": row.get("status") or "waiting",
        "demonstration_active": bool(row.get("demonstration_active") if row.get("demonstration_active") is not None else True),
        "attached_records": _clean_json_val(row.get("attached_records"), []),
        "share_past_history": bool(row.get("share_past_history") if row.get("share_past_history") is not None else True),
        "past_diagnoses": _clean_json_val(row.get("past_diagnoses"), []),
        "ayurveda_profile": _clean_json_val(row.get("ayurveda_profile"), None),
        "called_at": str(row.get("called_at")) if row.get("called_at") else None,
    }



# ---------------------------------------------------------------------
# Token Sequence Generator (MySQL + Fallback)
# ---------------------------------------------------------------------

def get_next_token(requested_token: str | None = None) -> str:
    """Atomically generate the next sequential token number."""
    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                if requested_token and str(requested_token).strip():
                    cleaned = str(requested_token).strip()
                    num = _extract_number(cleaned)
                    if num is not None:
                        cur.execute("UPDATE token_sequence SET current_token = GREATEST(current_token, %s) WHERE id = 1", (num,))
                    conn.close()
                    return cleaned

                cur.execute("UPDATE token_sequence SET current_token = current_token + 1 WHERE id = 1")
                cur.execute("SELECT current_token FROM token_sequence WHERE id = 1")
                res = cur.fetchone()
                conn.close()
                if res and res.get("current_token") is not None:
                    return str(res["current_token"])
        except Exception as e:
            logger.error(f"MySQL token generator error: {e}")

    # Fallback memory counter
    global _TOKEN_COUNTER
    with _STORE_LOCK:
        if requested_token and str(requested_token).strip():
            cleaned = str(requested_token).strip()
            num = _extract_number(cleaned)
            if num is not None and num > _TOKEN_COUNTER:
                _TOKEN_COUNTER = num
            return cleaned

        _TOKEN_COUNTER += 1
        return str(_TOKEN_COUNTER)


# ---------------------------------------------------------------------
# Core CRUD Operations
# ---------------------------------------------------------------------

# ---------------------------------------------------------------------
# Exact 8 Ayurveda Parameters Definitions & Clinical Profile Builder
# ---------------------------------------------------------------------

AYURVEDA_PARAMETER_DEFINITIONS = {
    "prakriti": {
        "name": "Prakriti",
        "sanskrit": "प्रकृति",
        "explanation": "The patient's natural body constitution (Vata, Pitta, Kapha, or a combination).",
    },
    "vikriti": {
        "name": "Vikriti",
        "sanskrit": "विकृति",
        "explanation": "The patient's current dosha imbalance or present health condition.",
    },
    "agni": {
        "name": "Agni",
        "sanskrit": "अग्नि",
        "explanation": "The strength and efficiency of the patient's digestion and metabolism.",
    },
    "koshtha": {
        "name": "Koshtha",
        "sanskrit": "कोष्ठ",
        "explanation": "The patient's natural bowel habit and stool pattern.",
    },
    "ahara": {
        "name": "Ahara",
        "sanskrit": "आहार",
        "explanation": "The patient's food habits, diet, and eating routine.",
    },
    "vihara": {
        "name": "Vihara",
        "sanskrit": "विहार",
        "explanation": "The patient's lifestyle, sleep, exercise, and daily activities.",
    },
    "nidana": {
        "name": "Nidana",
        "sanskrit": "निदान",
        "explanation": "The possible causes or triggers responsible for the disease.",
    },
    "samprapti": {
        "name": "Samprapti",
        "sanskrit": "सम्प्राप्ति",
        "explanation": "The progression and development of the disease inside the body.",
    },
}

DEFAULT_PATIENT_VAULT = [
    {
        "id": "rec_mri_lumbar_1",
        "title": "Lumbar Spine MRI (L3-S1 Axial & Sagittal T2)",
        "category": "mri",
        "modality": "MRI Scan",
        "scan_type": "MRI Scan",
        "body_part": "Lumbosacral Spine",
        "date": "2026-08-14",
        "facility": "Apex Neuro-Spine Diagnostic Imaging Center",
        "findings": "Mild L4-L5 disc desiccation with bilateral neural foraminal narrowing. Normal conus medullaris. No acute cord compression.",
        "abnormal": True,
        "image_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80",
    },
    {
        "id": "rec_xray_knee_1",
        "title": "Bilateral Knee Joint X-Ray (Standing AP & Lateral View)",
        "category": "xray",
        "modality": "Digital Radiography (X-Ray)",
        "scan_type": "X-Ray",
        "body_part": "Bilateral Knees",
        "date": "2026-07-22",
        "facility": "Sancheti Bone & Joint Radiology",
        "findings": "Moderate narrowing of medial tibiofemoral joint compartments bilaterally. Small marginal osteophytes on tibial plateaus consistent with Grade II Osteoarthritis (Kellgren-Lawrence).",
        "abnormal": True,
        "image_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80",
    },
    {
        "id": "rec_lab_sugar_1",
        "title": "90-Day Blood Glucose Trend Log & HbA1c Glycemic Panel",
        "category": "blood_sugar_bp",
        "modality": "Lab Trend & Vitals Log",
        "scan_type": "Blood Sugar / BP Log",
        "body_part": "Metabolic & Vascular",
        "date": "2026-09-02",
        "facility": "City Care Pathology Labs",
        "findings": "HbA1c: 8.4% (Elevated, Ref: <5.7%). Fasting Blood Glucose average: 188 mg/dL. Post-Prandial peak: 242 mg/dL. Mean Arterial BP: 142/90 mmHg over 14 days.",
        "abnormal": True,
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80",
    },
    {
        "id": "rec_ct_chest_1",
        "title": "High-Resolution Chest CT (HRCT Non-Contrast Bilateral Thorax)",
        "category": "ct",
        "modality": "Computed Tomography (CT Scan)",
        "scan_type": "CT Scan",
        "body_part": "Thorax / Lungs",
        "date": "2026-06-18",
        "facility": "Apollo Multispecialty Imaging",
        "findings": "Clear bilateral lung parenchyma. No focal consolidation, pneumothorax, or pleural effusion. Tracheobronchial tree within normal limits.",
        "abnormal": False,
        "image_url": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=300&q=80",
    },
    {
        "id": "rec_vitals_bp_1",
        "title": "Ambulatory 24-Hour Blood Pressure (BP) Monitoring Log",
        "category": "blood_sugar_bp",
        "modality": "Vitals Trend Log",
        "scan_type": "Blood Sugar / BP Log",
        "body_part": "Cardiovascular",
        "date": "2026-08-29",
        "facility": "Apollo Heart Institute Tele-Monitoring",
        "findings": "24-hr Average: 146/92 mmHg. Daytime peak: 158/98 mmHg. Non-dipper nocturnal pattern with night-time average 138/88 mmHg.",
        "abnormal": True,
        "image_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
        "thumbnail_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80",
    }
]

DEFAULT_PAST_DIAGNOSES = [
    {
        "date": "2026-06-10",
        "doctor_name": "Dr. Ananya Sen",
        "specialty": "General Medicine & Diabetology",
        "hospital": "City Care Multispecialty OPD",
        "intake_summary": "9-Stage SOCRATES Intake: Patient presented with 4-week history of fatigue and polydipsia. Evaluated for pre-diabetes and metabolic syndrome.",
        "doctor_remarks": "Initiate lifestyle modifications, 30 min daily brisk walking. Prescribed Metformin 500mg OD with meals. Monitor fasting blood glucose weekly.",
    },
    {
        "date": "2026-03-18",
        "doctor_name": "Dr. Rajesh Kulkarni",
        "specialty": "Orthopedics & Joint Replacement Surgery",
        "hospital": "Sancheti Bone & Joint Center",
        "intake_summary": "9-Stage SOCRATES Intake: Bilateral knee discomfort worse on ascending stairs, moderate stiffness in winter.",
        "doctor_remarks": "Bilateral knee OA Grade 2. Advised quadriceps strengthening exercises, avoid floor sitting. Prescribed topical anti-inflammatory gel and Calcium/Vit D3 supplementation.",
    }
]


def build_ayurveda_profile(summary: dict | None = None, transcript: dict | None = None, chief_complaint: str | None = None) -> dict:
    """Build the exact 8 Ayurveda parameters with their required one-line clinical explanations."""
    summary = summary or {}
    ayush = summary.get("ayush_assessment") or {}
    cc = (
        chief_complaint
        or summary.get("chief_complaint")
        or (transcript or {}).get("chief_complaint")
        or ""
    ).lower()
    hpi = (summary.get("hpi") or "").lower()
    text = f"{cc} {hpi}"

    if any(k in text for k in ["knee", "joint", "sandhi", "arthritis", "stiffness", "pain", "back"]):
        prakriti_val = ayush.get("prakriti_assessment") or "Vata-Kapha Prakriti"
        vikriti_val = ayush.get("vikriti_assessment") or "Vata Vriddhi (Apana & Vyana Vata) with Asthi-Majja Dhatu Kshaya"
        agni_val = ayush.get("agni_status") or "Manda Agni (sluggish digestion with frequent post-prandial bloating)"
        koshtha_val = ayush.get("koshtha_status") or "Krura Koshtha (tendency towards dry, hard bowel movements)"
        ahara_val = ayush.get("ahara_vihara_analysis") or "Habitual intake of dry, cold, or stale foods with inadequate unctuous sneha"
        vihara_val = "Sedentary routine, prolonged stair climbing without warm-up, and irregular sleep patterns"
        nidana_val = ayush.get("nidana_factors") or "Sheeta Ahara-Vihara (exposure to cold drafts), sedentary lifestyle, and suppression of bodily urges"
        samprapti_val = "Aggravated Vata settles in depleted Asthi and Sandhi seats, reducing Shleshaka Kapha lubrication and provoking joint stiffness and pain"
    elif any(k in text for k in ["sugar", "diabetes", "nocturia", "thirst", "fatigue", "urination", "prameha"]):
        prakriti_val = "Kapha-Pitta Prakriti"
        vikriti_val = "Kapha-Meda Prakopa with Kleda accumulation affecting Mutravaha and Udakavaha Srotas"
        agni_val = "Manda Agni with Dhatvagnimandya (sluggish carbohydrate breakdown and Ama formation)"
        koshtha_val = "Madhyama Koshtha with occasional sluggishness and incomplete morning evacuation"
        ahara_val = "High intake of refined carbohydrates, sweets, heavy meals, and delayed late dinners"
        vihara_val = "Prolonged desk sitting, minimal physical cardiovascular exertion (Avyayama), and irregular sleep"
        nidana_val = "Asyasukha (sedentary indulgence), Svapnasukha (excessive rest), and lack of daily sweat-inducing activity"
        samprapti_val = "Vitiated Kapha and Medas mix with circulating Kleda, overflowing into urinary channels and producing polyuria and systemic fatigue"
    elif any(k in text for k in ["acid", "reflux", "gerd", "burning", "stomach", "gastric", "amlapitta"]):
        prakriti_val = "Pitta-Vata Prakriti"
        vikriti_val = "Pitta Prakopa (Pachaka Pitta) manifesting as Vidagdha Ajirna and Amlapitta (hyperacidity)"
        agni_val = "Tikshnagni (intense digestive fire with rapid acid formation and burning hunger)"
        koshtha_val = "Mridu Koshtha (sensitive bowel habit with loose stool tendency when consuming spicy items)"
        ahara_val = "Excessive pungent (Katu), sour (Amla), and salty (Lavana) spicy fried foods with empty-stomach tea/coffee"
        vihara_val = "Mental tension, work deadlines, anger/irritation (Krodha), and lying down flat immediately after meals"
        nidana_val = "Incompatible dietary mixtures (Viruddhahara), delayed meal timings, and stress provoking Pitta"
        samprapti_val = "Pachaka Pitta increases in liquid and sour qualities (Dravatva/Amlatva), regurgitating into the esophagus causing retrosternal burning"
    else:
        prakriti_val = ayush.get("prakriti_assessment") or "Vata-Pitta Prakriti"
        vikriti_val = ayush.get("vikriti_assessment") or "Tridosha Vaishamya with dominant Vata-Pitta vitiation"
        agni_val = ayush.get("agni_status") or "Vishama Agni (variable digestive capacity with fluctuating appetite)"
        koshtha_val = ayush.get("koshtha_status") or "Madhyama Koshtha (variable bowel consistency)"
        ahara_val = ayush.get("ahara_vihara_analysis") or "Mixed diet with irregular meal hours and processed food intake"
        vihara_val = "Variable daily schedule, environmental work stress, and fragmented nighttime rest"
        nidana_val = ayush.get("nidana_factors") or "Irregular lifestyle habits, dietary indiscretion, and mental strain"
        samprapti_val = "Doshas vitiate corresponding Dhatus through compromised Agni, lodging in vulnerable Srotas and manifesting clinical symptoms"

    return {
        "prakriti": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["prakriti"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["prakriti"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["prakriti"]["explanation"],
            "assessment": prakriti_val,
            "status": "Constitutional Assessment",
        },
        "vikriti": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["vikriti"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["vikriti"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["vikriti"]["explanation"],
            "assessment": vikriti_val,
            "status": "Active Imbalance",
        },
        "agni": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["agni"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["agni"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["agni"]["explanation"],
            "assessment": agni_val,
            "status": "Digestive Fire",
        },
        "koshtha": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["koshtha"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["koshtha"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["koshtha"]["explanation"],
            "assessment": koshtha_val,
            "status": "Bowel Habit",
        },
        "ahara": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["ahara"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["ahara"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["ahara"]["explanation"],
            "assessment": ahara_val,
            "status": "Dietary Pattern",
        },
        "vihara": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["vihara"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["vihara"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["vihara"]["explanation"],
            "assessment": vihara_val,
            "status": "Lifestyle Routine",
        },
        "nidana": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["nidana"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["nidana"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["nidana"]["explanation"],
            "assessment": nidana_val,
            "status": "Etiological Triggers",
        },
        "samprapti": {
            "name": AYURVEDA_PARAMETER_DEFINITIONS["samprapti"]["name"],
            "sanskrit": AYURVEDA_PARAMETER_DEFINITIONS["samprapti"]["sanskrit"],
            "explanation": AYURVEDA_PARAMETER_DEFINITIONS["samprapti"]["explanation"],
            "assessment": samprapti_val,
            "status": "Pathogenesis",
        },
    }


# ---------------------------------------------------------------------
# Core CRUD Operations
# ---------------------------------------------------------------------

def new_session(
    language: str,
    name: str,
    token: str | None,
    abha_id: str | None,
    consent: bool,
    department: str = "general",
    chief_complaint: str | None = None,
    consulting_doctor: dict | None = None,
    attached_records: list | None = None,
    share_past_history: bool = True,
    demonstration_active: bool = True,
    status: str = "waiting",
) -> dict:
    session_id = str(uuid.uuid4())
    assigned_token = get_next_token(token)

    summary_init = {
        "chief_complaint": chief_complaint or "",
        "hpi": f"Patient presents with {chief_complaint}." if chief_complaint else "",
    } if chief_complaint else None

    ayurveda_prof = build_ayurveda_profile(summary=summary_init, chief_complaint=chief_complaint)

    session = {
        "session_id": session_id,
        "language": language or "en",
        "department": department or "general",
        "patient_name": name or "Guest Patient",
        "token_number": assigned_token,
        "abha_id": abha_id,
        "consent": consent,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": [],
        "turn_count": 0,
        "transcript": {
            "chief_complaint": chief_complaint or "",
            "qa_pairs": [],
            "red_flags": [],
            "ayush_notes": {},
        },
        "interview_complete": False,
        "red_flag": False,
        "red_flag_reason": None,
        "documents": [],
        "summary": summary_init,
        "narrative_summary": None,
        "route": None,
        "consulting_doctor": consulting_doctor,
        "status": status or "waiting",
        "demonstration_active": bool(demonstration_active),
        "attached_records": attached_records or [],
        "share_past_history": bool(share_past_history),
        "past_diagnoses": DEFAULT_PAST_DIAGNOSES if share_past_history else [],
        "ayurveda_profile": ayurveda_prof,
        "called_at": None,
    }

    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO sessions (
                        session_id, token_number, patient_name, department, language,
                        abha_id, consent, turn_count, interview_complete, red_flag,
                        red_flag_reason, messages, transcript, documents, summary,
                        narrative_summary, route, consulting_doctor, status,
                        demonstration_active, attached_records, share_past_history,
                        past_diagnoses, ayurveda_profile, created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, NOW()
                    )
                    """,
                    (
                        session["session_id"],
                        session["token_number"],
                        session["patient_name"],
                        session["department"],
                        session["language"],
                        session["abha_id"],
                        session["consent"],
                        session["turn_count"],
                        session["interview_complete"],
                        session["red_flag"],
                        session["red_flag_reason"],
                        json.dumps(session["messages"], ensure_ascii=False),
                        json.dumps(session["transcript"], ensure_ascii=False),
                        json.dumps(session["documents"], ensure_ascii=False),
                        json.dumps(session["summary"], ensure_ascii=False) if session["summary"] else None,
                        None,
                        None,
                        json.dumps(session["consulting_doctor"], ensure_ascii=False) if session["consulting_doctor"] else None,
                        session["status"],
                        session["demonstration_active"],
                        json.dumps(session["attached_records"], ensure_ascii=False),
                        session["share_past_history"],
                        json.dumps(session["past_diagnoses"], ensure_ascii=False),
                        json.dumps(session["ayurveda_profile"], ensure_ascii=False),
                    )
                )
            conn.close()
        except Exception as e:
            logger.error(f"Error inserting session to MySQL: {e}")

    with _STORE_LOCK:
        _SESSIONS_MEMORY[session_id] = session

    return session


def save_session(session: dict) -> None:
    """Persist session updates directly into MySQL."""
    if not session or not session.get("session_id"):
        return

    session_id = session["session_id"]

    # Keep memory in sync
    with _STORE_LOCK:
        _SESSIONS_MEMORY[session_id] = session

    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE sessions SET
                        token_number = %s,
                        patient_name = %s,
                        department = %s,
                        language = %s,
                        abha_id = %s,
                        consent = %s,
                        turn_count = %s,
                        interview_complete = %s,
                        red_flag = %s,
                        red_flag_reason = %s,
                        messages = %s,
                        transcript = %s,
                        documents = %s,
                        summary = %s,
                        narrative_summary = %s,
                        route = %s,
                        consulting_doctor = %s,
                        status = %s,
                        demonstration_active = %s,
                        attached_records = %s,
                        share_past_history = %s,
                        past_diagnoses = %s,
                        ayurveda_profile = %s,
                        called_at = %s
                    WHERE session_id = %s
                    """,
                    (
                        str(session.get("token_number")),
                        session.get("patient_name") or "Guest Patient",
                        session.get("department") or "general",
                        session.get("language") or "en",
                        session.get("abha_id"),
                        bool(session.get("consent", True)),
                        int(session.get("turn_count") or 0),
                        bool(session.get("interview_complete", False)),
                        bool(session.get("red_flag", False)),
                        session.get("red_flag_reason"),
                        json.dumps(session.get("messages") or [], ensure_ascii=False),
                        json.dumps(session.get("transcript") or {}, ensure_ascii=False),
                        json.dumps(session.get("documents") or [], ensure_ascii=False),
                        json.dumps(session.get("summary"), ensure_ascii=False) if session.get("summary") else None,
                        json.dumps(session.get("narrative_summary"), ensure_ascii=False) if session.get("narrative_summary") else None,
                        json.dumps(session.get("route"), ensure_ascii=False) if session.get("route") else None,
                        json.dumps(session.get("consulting_doctor"), ensure_ascii=False) if session.get("consulting_doctor") else None,
                        session.get("status") or "waiting",
                        bool(session.get("demonstration_active") if session.get("demonstration_active") is not None else True),
                        json.dumps(session.get("attached_records") or [], ensure_ascii=False),
                        bool(session.get("share_past_history") if session.get("share_past_history") is not None else True),
                        json.dumps(session.get("past_diagnoses") or [], ensure_ascii=False),
                        json.dumps(session.get("ayurveda_profile"), ensure_ascii=False) if session.get("ayurveda_profile") else None,
                        session.get("called_at"),
                        session_id,
                    )
                )
            conn.close()
        except Exception as e:
            logger.error(f"Error updating session in MySQL: {e}")



def get_session(session_id: str):
    """Retrieve session from MySQL by session_id, token_number, or prefix."""
    if not session_id:
        return None

    clean_id = str(session_id).strip()

    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                # 1. Exact match on session_id
                cur.execute("SELECT * FROM sessions WHERE session_id = %s LIMIT 1", (clean_id,))
                row = cur.fetchone()
                if row:
                    conn.close()
                    s = _row_to_session_dict(row)
                    with _STORE_LOCK:
                        _SESSIONS_MEMORY[s["session_id"]] = s
                    return s

                # 2. Token match (e.g. "1", "2")
                cur.execute("SELECT * FROM sessions WHERE token_number = %s LIMIT 1", (clean_id,))
                row = cur.fetchone()
                if row:
                    conn.close()
                    s = _row_to_session_dict(row)
                    with _STORE_LOCK:
                        _SESSIONS_MEMORY[s["session_id"]] = s
                    return s

                # 3. Prefix match
                cur.execute("SELECT * FROM sessions WHERE session_id LIKE %s LIMIT 1", (f"{clean_id}%",))
                row = cur.fetchone()
                if row:
                    conn.close()
                    s = _row_to_session_dict(row)
                    with _STORE_LOCK:
                        _SESSIONS_MEMORY[s["session_id"]] = s
                    return s

            conn.close()
        except Exception as e:
            logger.error(f"Error fetching session from MySQL: {e}")

    # Fallback to in-memory store
    with _STORE_LOCK:
        if clean_id in _SESSIONS_MEMORY:
            return _SESSIONS_MEMORY[clean_id]
        for s in _SESSIONS_MEMORY.values():
            if str(s.get("token_number")) == clean_id:
                return s
        for s in _SESSIONS_MEMORY.values():
            if s.get("session_id", "").startswith(clean_id):
                return s
        return None


def all_sessions() -> dict:
    """Return dictionary of all sessions keyed by session_id."""
    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM sessions ORDER BY created_at DESC")
                rows = cur.fetchall()
                conn.close()
                return {row["session_id"]: _row_to_session_dict(row) for row in rows}
        except Exception as e:
            logger.error(f"Error fetching all sessions from MySQL: {e}")

    with _STORE_LOCK:
        return dict(_SESSIONS_MEMORY)


def get_all_sessions_summary() -> list[dict]:
    """Return list of all OPD sessions ordered by token / creation time for Doctor Console."""
    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM sessions")
                rows = cur.fetchall()
                conn.close()
                sessions = [_row_to_session_dict(r) for r in rows]

                def sort_key(s):
                    num = _extract_number(s.get("token_number"))
                    return (num if num is not None else 999999, s.get("created_at") or "")

                sessions.sort(key=sort_key)
                return [
                    {
                        "session_id": s["session_id"],
                        "token_number": s.get("token_number"),
                        "patient_name": s.get("patient_name"),
                        "department": s.get("department", "general"),
                        "language": s.get("language", "en"),
                        "created_at": s.get("created_at"),
                        "red_flag": s.get("red_flag", False),
                        "red_flag_reason": s.get("red_flag_reason"),
                        "interview_complete": s.get("interview_complete", False),
                        "has_summary": bool(s.get("summary")),
                        "is_approved": bool(s.get("route")),
                        "chief_complaint": (s.get("transcript") or {}).get("chief_complaint") or (s.get("summary") or {}).get("chief_complaint"),
                        "documents_count": sum(
                            1 for document in s.get("documents") or []
                            if not document.get("patient_record")
                        ) if s.get("demonstration_active", True) else 0,
                        "consulting_doctor": s.get("consulting_doctor"),
                        "status": s.get("status") or "waiting",
                        "demonstration_active": bool(s.get("demonstration_active") if s.get("demonstration_active") is not None else True),
                        "attached_records_count": len(s.get("attached_records") or [])
                        if s.get("demonstration_active", True) else 0,
                        "attached_records": s.get("attached_records") or []
                        if s.get("demonstration_active", True) else [],
                        "share_past_history": bool(
                            s.get("share_past_history")
                            if s.get("share_past_history") is not None else True
                        ) and bool(s.get("demonstration_active", True)),
                        "called_at": s.get("called_at"),
                    }
                    for s in sessions
                ]
        except Exception as e:
            logger.error(f"Error fetching summaries from MySQL: {e}")

    # Fallback to memory
    with _STORE_LOCK:
        sessions = list(_SESSIONS_MEMORY.values())

    def sort_key(s):
        num = _extract_number(s.get("token_number"))
        return (num if num is not None else 999999, s.get("created_at") or "")

    sessions.sort(key=sort_key)
    return [
        {
            "session_id": s["session_id"],
            "token_number": s.get("token_number"),
            "patient_name": s.get("patient_name"),
            "department": s.get("department", "general"),
            "language": s.get("language", "en"),
            "created_at": s.get("created_at"),
            "red_flag": s.get("red_flag", False),
            "red_flag_reason": s.get("red_flag_reason"),
            "interview_complete": s.get("interview_complete", False),
            "has_summary": bool(s.get("summary")),
            "is_approved": bool(s.get("route")),
            "chief_complaint": (s.get("transcript") or {}).get("chief_complaint") or (s.get("summary") or {}).get("chief_complaint"),
            "documents_count": sum(
                1 for document in s.get("documents") or []
                if not document.get("patient_record")
            ) if s.get("demonstration_active", True) else 0,
            "consulting_doctor": s.get("consulting_doctor"),
            "status": s.get("status") or "waiting",
            "demonstration_active": bool(s.get("demonstration_active") if s.get("demonstration_active") is not None else True),
            "attached_records_count": len(s.get("attached_records") or [])
            if s.get("demonstration_active", True) else 0,
            "attached_records": s.get("attached_records") or []
            if s.get("demonstration_active", True) else [],
            "share_past_history": bool(
                s.get("share_past_history")
                if s.get("share_past_history") is not None else True
            ) and bool(s.get("demonstration_active", True)),
            "called_at": s.get("called_at"),
        }
        for s in sessions
    ]



# ---------------------------------------------------------------------
# Demo Patient Seeding
# ---------------------------------------------------------------------

def seed_demo_patients_if_empty():
    """Ensure the 4 demo clinical patients exist in database or memory."""
    demo_patients = [
        {
            "token_number": "1",
            "patient_name": "Asha Devi",
            "department": "ayush",
            "language": "hi",
            "abha_id": "91-4523-8819-2041",
            "chief_complaint": "Severe bilateral knee pain and morning stiffness for 6 months, aggravated in cold weather (Sandhigata Vata)",
            "summary": {
                "chief_complaint": "Bilateral knee joint pain and morning stiffness for 6 months (Sandhigata Vata).",
                "hpi": "52-year-old female presents with progressive pain in bilateral knees, worse on climbing stairs and during cold mornings. Reports stiffness lasting 25-30 minutes upon waking. Relieved moderately by warm oil massage (Abhyanga) and warm compresses.",
                "past_medical_surgical": "No history of diabetes or cardiac disease. Menopause 4 years ago.",
                "drug_allergy_history": "No known drug allergies.",
                "family_history": "Mother had severe joint arthritis.",
                "personal_history": "Non-vegetarian, sedentary daily routine, irregular meal hours.",
                "review_of_systems": "Mild weight gain noted. No chest pain or respiratory distress.",
                "prior_investigations_summary": "X-ray bilateral knees shows reduced medial joint space and marginal osteophytes consistent with Grade II Osteoarthritis.",
                "ayush_assessment": {
                    "prakriti_assessment": "Vata-Kapha Prakriti",
                    "vikriti_assessment": "Vata Vriddhi with Dhatu Kshaya (Asthi & Majja Dhatu)",
                    "agni_status": "Manda Agni (sluggish digestion with frequent bloating)",
                    "koshtha_status": "Krura Koshtha (tendency towards hard, irregular bowel movements)",
                    "ahara_vihara_analysis": "Habitual intake of dry, stale foods, irregular meal schedules, lack of daily physical activity.",
                    "nidana_factors": "Ativyayama followed by sudden sedentary habits, Sheeta Ahara-Vihara (exposure to cold air).",
                    "dashavidha_pariksha": {
                        "sara": "Madhyama",
                        "samhanana": "Avara",
                        "pramana": "Madhyama",
                        "satmya": "Mixed",
                        "sattva": "Madhyama",
                        "ahara_shakti": "Avara",
                        "vyayama_shakti": "Avara",
                        "vaya": "Pravriddha Vaya (52 years)"
                    }
                }
            }
        },
        {
            "token_number": "2",
            "patient_name": "Rajesh Sharma",
            "department": "general",
            "language": "en",
            "abha_id": "91-8834-1290-7712",
            "chief_complaint": "Fasting blood sugar 195 mg/dL, frequent night urination and daytime fatigue for 3 weeks",
            "summary": {
                "chief_complaint": "Elevated fasting blood sugar (195 mg/dL) with polyuria and lethargy for 3 weeks.",
                "hpi": "45-year-old IT executive reporting new-onset nocturia (3-4 times/night), polydipsia, and unrefreshed sleep. Recorded OPD blood pressure is 144/92 mmHg.",
                "past_medical_surgical": "Diagnosed with pre-diabetes 18 months ago, not on regular pharmacological therapy.",
                "drug_allergy_history": "Allergic to Penicillin (causes urticaria).",
                "family_history": "Both parents have Type 2 Diabetes Mellitus.",
                "personal_history": "Sedentary desk work, high screen time, high carbohydrate diet.",
                "review_of_systems": "No vision blurring, no chest discomfort, no lower extremity edema.",
                "prior_investigations_summary": "Recent Fasting Blood Sugar: 195 mg/dL (Abnormal, Ref: 70-100). HbA1c: 8.4% (Abnormal, Ref: <5.7%).",
                "ayush_assessment": {
                    "prakriti_assessment": "Kapha-Pitta Prakriti",
                    "vikriti_assessment": "Kapha-Meda Dushti manifesting as Prameha Purvarupa",
                    "agni_status": "Manda Agni with Ama accumulation",
                    "koshtha_status": "Madhyama Koshtha",
                    "ahara_vihara_analysis": "Excessive intake of sweet, refined carbohydrates, dairy, and daytime sleep (Divasvapna).",
                    "dashavidha_pariksha": {
                        "sara": "Madhyama",
                        "samhanana": "Madhyama",
                        "pramana": "Sthula (Overweight BMI 28.2)",
                        "satmya": "Madhura Satmya",
                        "sattva": "Pravara",
                        "ahara_shakti": "Madhyama",
                        "vyayama_shakti": "Avara",
                        "vaya": "Madhyama Vaya (45 years)"
                    }
                }
            }
        },
        {
            "token_number": "3",
            "patient_name": "Meera Patel",
            "department": "integrated",
            "language": "en",
            "abha_id": "91-6211-9043-4481",
            "chief_complaint": "Severe acid reflux, retrosternal burning and sour belching after spicy meals (Amlapitta)",
            "summary": {
                "chief_complaint": "Heartburn and sour regurgitation for 2 months (Amlapitta).",
                "hpi": "29-year-old female presents with severe epigastric and retrosternal burning sensation occurring 30-45 minutes postprandially, exacerbated by fried foods, tomatoes, and lying flat at night.",
                "past_medical_surgical": "No prior surgeries. Mild migraine headaches managed with paracetamol.",
                "drug_allergy_history": "No known drug allergies.",
                "family_history": "Father has GERD and peptic ulcer history.",
                "personal_history": "High intake of tea/coffee (4 cups daily), late-night dinners.",
                "review_of_systems": "No dysphagia, no melena, no hematemesis, no unintentional weight loss.",
                "prior_investigations_summary": "H. pylori stool antigen: Negative. Upper GI Endoscopy: Grade A Reflux Esophagitis.",
                "ayush_assessment": {
                    "prakriti_assessment": "Pitta-Vata Prakriti",
                    "vikriti_assessment": "Pitta Dosha Prakopa with Vidagdha Ajirna (Amlapitta)",
                    "agni_status": "Tikshna Agni (intense hunger with rapid acid formation)",
                    "koshtha_status": "Mridu Koshtha (tendency to loose stools with spicy food)",
                    "ahara_vihara_analysis": "Katu-Amla-Lavana Rasa excessive consumption, irregular eating intervals.",
                    "dashavidha_pariksha": {
                        "sara": "Madhyama",
                        "samhanana": "Madhyama",
                        "pramana": "Madhyama",
                        "satmya": "Mixed",
                        "sattva": "Madhyama",
                        "ahara_shakti": "Madhyama",
                        "vyayama_shakti": "Madhyama",
                        "vaya": "Yuva Vaya (29 years)"
                    }
                }
            }
        },
        {
            "token_number": "4",
            "patient_name": "Vikram Singh",
            "department": "ayush",
            "language": "hi",
            "abha_id": "91-3145-7729-6500",
            "chief_complaint": "Resting tremor in right hand and sleep onset insomnia for 4 months (Kampavata)",
            "summary": {
                "chief_complaint": "Right hand tremor and chronic sleep disruption (Kampavata / Vata Vyadhi).",
                "hpi": "61-year-old male reporting progressive involuntary rhythmic tremor of right fingers at rest, disappearing with purposeful action. Accompanied by muscle stiffness and disturbed sleep (Nidranasha).",
                "past_medical_surgical": "Hypertension on Amlodipine 5mg for 5 years.",
                "drug_allergy_history": "No known allergies.",
                "family_history": "No Parkinsonian disorders reported.",
                "personal_history": "Retired government clerk, vegetarian, non-smoker.",
                "review_of_systems": "No postural lightheadedness, no visual hallucinations.",
                "prior_investigations_summary": "Brain MRI: Age-related cerebral atrophy without focal acute infarction.",
                "ayush_assessment": {
                    "prakriti_assessment": "Vata Pradhana Prakriti",
                    "vikriti_assessment": "Vata Prakopa localized to Majjadhatu and Siras (Kampavata)",
                    "agni_status": "Vishama Agni (unpredictable digestive capacity)",
                    "koshtha_status": "Krura Koshtha with chronic flatulence",
                    "ahara_vihara_analysis": "Vata-vitiating dry diet, mental anxiety, insufficient liquid nourishment.",
                    "dashavidha_pariksha": {
                        "sara": "Avara",
                        "samhanana": "Madhyama",
                        "pramana": "Madhyama",
                        "satmya": "Mixed",
                        "sattva": "Madhyama",
                        "ahara_shakti": "Avara",
                        "vyayama_shakti": "Avara",
                        "vaya": "Vriddha Vaya (61 years)"
                    }
                }
            }
        }
    ]

    doctor_assignments = [
        {"id": "usr_doc_ortho_1", "name": "Dr. Rajesh Kulkarni", "specialization": "Orthopedics & Joint Replacement Surgery", "hospital": "Sancheti Bone & Joint Center", "cabin": "Cabin 108", "department": "orthopedics"},
        {"id": "usr_doc_genmed_1", "name": "Dr. Ananya Sen", "specialization": "General Medicine & Diabetology", "hospital": "City Care Multispecialty OPD", "cabin": "Room 102", "department": "general"},
        {"id": "usr_doc_intmed_1", "name": "Dr. Vikramaditya Rathore", "specialization": "Internal Medicine & Critical Care", "hospital": "Apex Multispecialty Hospital", "cabin": "Cabin 305", "department": "integrated"},
        {"id": "usr_doc_neuro_1", "name": "Dr. Rohan Deshmukh", "specialization": "Neurology & Neuro-Spine Science", "hospital": "Brain & Spine Neuro Institute", "cabin": "Room 212", "department": "general"},
    ]

    records_assignments = [
        [DEFAULT_PATIENT_VAULT[0], DEFAULT_PATIENT_VAULT[1]], # MRI + Knee X-ray
        [DEFAULT_PATIENT_VAULT[2], DEFAULT_PATIENT_VAULT[4]], # Glucose/HbA1c + BP Log
        [DEFAULT_PATIENT_VAULT[3]],                           # CT Chest
        [DEFAULT_PATIENT_VAULT[0]],                           # Spine/Brain MRI
    ]

    if database.is_mysql_available() and database.init_database():
        try:
            conn = database.get_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) as cnt FROM sessions")
                res = cur.fetchone()
                if res and res["cnt"] == 0:
                    for idx, p in enumerate(demo_patients):
                        s_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"medikiosk-token-{p['token_number']}"))
                        ayurveda_prof = build_ayurveda_profile(p["summary"], chief_complaint=p["chief_complaint"])
                        doc = doctor_assignments[idx % len(doctor_assignments)]
                        recs = records_assignments[idx % len(records_assignments)]

                        cur.execute(
                            """
                            INSERT INTO sessions (
                                session_id, token_number, patient_name, department, language,
                                abha_id, consent, turn_count, interview_complete, red_flag,
                                red_flag_reason, messages, transcript, documents, summary,
                                consulting_doctor, status, demonstration_active, attached_records,
                                share_past_history, past_diagnoses, ayurveda_profile, created_at
                            ) VALUES (
                                %s, %s, %s, %s, %s,
                                %s, %s, %s, %s, %s,
                                %s, %s, %s, %s, %s,
                                %s, %s, %s, %s,
                                %s, %s, %s, NOW()
                            )
                            """,
                            (
                                s_id,
                                p["token_number"],
                                p["patient_name"],
                                p["department"],
                                p["language"],
                                p["abha_id"],
                                True,
                                8,
                                True,
                                False,
                                None,
                                "[]",
                                json.dumps({
                                    "chief_complaint": p["chief_complaint"],
                                    "qa_pairs": [],
                                    "red_flags": [],
                                    "ayush_notes": {}
                                }),
                                "[]",
                                json.dumps(p["summary"], ensure_ascii=False),
                                json.dumps(doc, ensure_ascii=False),
                                "waiting",
                                True,
                                json.dumps(recs, ensure_ascii=False),
                                True,
                                json.dumps(DEFAULT_PAST_DIAGNOSES, ensure_ascii=False),
                                json.dumps(ayurveda_prof, ensure_ascii=False),
                            )
                        )
            conn.close()
        except Exception as e:
            logger.error(f"Error seeding demo patients into MySQL: {e}")

    # Also seed memory cache
    global _TOKEN_COUNTER
    with _STORE_LOCK:
        if len(_SESSIONS_MEMORY) == 0:
            for idx, p in enumerate(demo_patients):
                s_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"medikiosk-token-{p['token_number']}"))
                ayurveda_prof = build_ayurveda_profile(p["summary"], chief_complaint=p["chief_complaint"])
                doc = doctor_assignments[idx % len(doctor_assignments)]
                recs = records_assignments[idx % len(records_assignments)]

                _SESSIONS_MEMORY[s_id] = {
                    "session_id": s_id,
                    "language": p["language"],
                    "department": p["department"],
                    "patient_name": p["patient_name"],
                    "token_number": p["token_number"],
                    "abha_id": p["abha_id"],
                    "consent": True,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "messages": [],
                    "turn_count": 8,
                    "transcript": {
                        "chief_complaint": p["chief_complaint"],
                        "qa_pairs": [],
                        "red_flags": [],
                        "ayush_notes": {},
                    },
                    "interview_complete": True,
                    "red_flag": False,
                    "red_flag_reason": None,
                    "documents": [],
                    "summary": p["summary"],
                    "narrative_summary": None,
                    "route": None,
                    "consulting_doctor": doc,
                    "status": "waiting",
                    "demonstration_active": True,
                    "attached_records": recs,
                    "share_past_history": True,
                    "past_diagnoses": DEFAULT_PAST_DIAGNOSES,
                    "ayurveda_profile": ayurveda_prof,
                    "called_at": None,
                }
            _TOKEN_COUNTER = 4


# Initialize on import
seed_demo_patients_if_empty()
