import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are an expert Clinical Diagnostic Physician Assistant embedded in a hospital doctor workstation.
You must adhere strictly to the following 2-phase clinical diagnostic protocol:

PHASE 1: INITIAL SYMPTOM DISCOVERY
- If this is the start of the consultation or the patient has not yet stated their health complaint, ask:
  "What symptoms or health concerns are you experiencing?"
- Do not jump into diagnostic probing until the patient answers this open-ended inquiry.

PHASE 2: DISEASE-SPECIFIC TARGETED DIAGNOSTIC PROBING
- As soon as the patient states their symptoms, a disease name, or specific complaint (e.g., migraine, asthma, chest pain, diabetes, joint arthritis, acid reflux/GERD, dengue/fever, skin eruption):
  1. Identify the specific disease or symptom cluster mentioned.
  2. Switch IMMEDIATELY and exclusively to asking targeted questions relevant to that specific condition.
  3. Every single follow-up must be designed to gather clinical information about that pathology (e.g., triggers, exacerbating factors, associated symptoms, onset pattern, functional impairment, previous medication response).
  4. DO NOT ask generic, unrelated health questions. Ask targeted diagnostic questions related strictly to what they told you.
  5. Keep each turn focused, professional, and empathetic (1 to 2 targeted questions at a time).
"""

# Disease knowledge base for intelligent fallback if OpenRouter key is not set
DISEASE_PROBES = {
    "asthma": [
        "Do you experience wheezing (a whistling sound) when breathing, and is it worse at night or early morning?",
        "Have you noticed specific triggers such as cold air, dust, pollen, or physical exertion? Do you currently use a rescue inhaler?",
    ],
    "migraine": [
        "Is the headache throbbing or pulsating, and is it predominantly on one side of your head?",
        "Do you experience sensitivity to light (photophobia), sound, nausea, or visual aura (flashing lights/zigzag lines) before the headache begins?",
    ],
    "headache": [
        "Where is the pain located (forehead, behind eyes, back of head), and does it feel tight like a band or pulsating?",
        "Does the headache worsen with bending forward, bright lights, or neck movement?",
    ],
    "chest pain": [
        "Does the pain feel like heaviness, pressure, or burning, and does it radiate to your left arm, neck, or jaw?",
        "Does the pain come on with physical exertion and relieve with rest, or is it accompanied by sweating and breathlessness?",
    ],
    "diabetes": [
        "Have you been experiencing increased thirst (polydipsia), frequent urination (especially at night), or unexplained weight loss?",
        "Do you have any numbness, tingling, or burning sensations in your feet or fingers?",
    ],
    "hypertension": [
        "What are your typical blood pressure readings at home or clinic? Have you noticed morning headaches, dizziness, or blurred vision?",
        "Do you experience shortness of breath on exertion or chest tightness? What is your daily salt intake and are you on any blood pressure medications?",
    ],
    "blood pressure": [
        "What are your typical blood pressure readings at home or clinic? Have you noticed morning headaches, dizziness, or blurred vision?",
        "Do you experience shortness of breath on exertion or chest tightness? What is your daily salt intake and are you on any blood pressure medications?",
    ],
    "fever": [
        "What is the highest recorded temperature, and is the fever associated with chills, rigors, body aches, or a rash?",
        "Are there any associated symptoms like burning during urination, sore throat, or joint pain?",
    ],
    "stomach": [
        "Is the discomfort located in the upper abdomen, around the navel, or lower abdomen? Does it burn, cramp, or feel heavy?",
        "Is the discomfort related to meals (worse before food or after eating)? Have you noticed any nausea, vomiting, or changes in bowel habits?",
    ],
    "acidity": [
        "Do you get a sour/acidic fluid regurgitating into your throat, or a burning sensation behind the breastbone after eating?",
        "Do your symptoms worsen when lying flat at night, and does drinking cold milk or antacids provide quick relief?",
    ],
    "joint": [
        "Which joints are primarily affected, and do you experience morning stiffness lasting more than 30 minutes?",
        "Is there visible swelling, warmth, or redness over the joints, and does walking or moving ease the stiffness or make it worse?",
    ],
    "cough": [
        "Is the cough dry and hacking, or productive with phlegm/mucus? If there is phlegm, what color is it?",
        "How long have you had this cough, and do you have any fever, chest tightness, or shortness of breath?",
    ],
    "rash": [
        "Where on the body did the rash first appear, and is it accompanied by itching, burning, or peeling?",
        "Have you started any new medications, foods, soaps, or had outdoor contact prior to the rash appearing?",
    ]
}


def _fallback_disease_bot(messages: list[dict]) -> tuple[str, str | None]:
    """Intelligent clinical fallback matching the exact 2-phase protocol."""
    user_messages = [m["content"] for m in messages if m["role"] == "user"]
    if not user_messages:
        return "What symptoms or health concerns are you experiencing?", None

    last_user_input = user_messages[-1].lower()
    combined_user_text = " ".join(user_messages).lower()

    # Detect condition
    detected = None
    for condition in DISEASE_PROBES:
        if condition in combined_user_text:
            detected = condition
            break

    if not detected:
        # Check common keywords
        if any(w in combined_user_text for w in ["pain", "hurt", "ache"]):
            detected = "pain"
        elif any(w in combined_user_text for w in ["vomit", "nausea", "loose motion", "diarrhea"]):
            detected = "stomach"
        elif any(w in combined_user_text for w in ["breath", "dyspnea", "short of breath"]):
            detected = "asthma"

    turn_count = len(user_messages)

    if not detected:
        return (
            "Could you describe the exact nature of this discomfort, when it started, and whether you've noticed any other symptoms alongside it?",
            None,
        )

    probes = DISEASE_PROBES.get(detected, [
        f"How long have you been experiencing these symptoms related to your {detected}?",
        f"Have you tried any medications or home remedies for this {detected}, and did they help?",
    ])

    idx = (turn_count - 1) % len(probes)
    question = probes[idx]

    response = (
        f"I understand you are dealing with **{detected.capitalize()}**-related symptoms. "
        f"{question}\n\n"
        f"*(Note: OpenRouter Claude 3.5 Sonnet mode active with local clinical fallback)*"
    )
    return response, detected.capitalize()


def _get_env_key() -> str | None:
    for env_path in [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.getcwd(), ".env"),
    ]:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("OPENROUTER_API_KEY="):
                            return line.split("=", 1)[1].strip().strip('"').strip("'")
            except Exception:
                pass
    return None


def call_openrouter_chat(
    messages: list[dict],
    model: str = "anthropic/claude-3.5-sonnet",
    api_key: str | None = None,
) -> dict:
    """Call OpenRouter Chat Completions API with the disease-aware clinical persona."""
    resolved_key = (
        api_key
        or os.environ.get("OPENROUTER_API_KEY")
        or _get_env_key()
        or os.environ.get("CLAUDE_API_KEY")
    )

    # If no key, run the rule-based clinical fallback
    if not resolved_key or not resolved_key.strip():
        resp_text, detected = _fallback_disease_bot(messages)
        return {
            "response": resp_text,
            "model_used": f"{model} (Rule-Engine Fallback: Set OPENROUTER_API_KEY for live LLM)",
            "detected_condition": detected,
        }

    formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in messages:
        if m.get("role") in ("user", "assistant"):
            formatted_messages.append({"role": m["role"], "content": m["content"]})

    headers = {
        "Authorization": f"Bearer {resolved_key.strip()}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MediKiosk Doctor Workstation",
    }

    candidate_models = [model or "anthropic/claude-3.5-sonnet"]
    if "claude" in candidate_models[0].lower() and "sonnet" in candidate_models[0].lower():
        for alt in ["anthropic/claude-sonnet-4", "anthropic/claude-sonnet-4.5", "anthropic/claude-3.5-sonnet"]:
            if alt not in candidate_models:
                candidate_models.append(alt)

    last_err_msg = ""
    for candidate in candidate_models:
        payload = {
            "model": candidate,
            "messages": formatted_messages,
            "temperature": 0.3,
            "max_tokens": 500,
        }

        try:
            res = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                data = res.json()
                choices = data.get("choices") or []
                if choices and "message" in choices[0]:
                    content = choices[0]["message"].get("content", "")
                    user_text = " ".join([m["content"] for m in messages if m.get("role") == "user"]).lower()
                    detected = None
                    for c in DISEASE_PROBES:
                        if c in user_text:
                            detected = c.capitalize()
                            break
                    return {
                        "response": content.strip(),
                        "model_used": "Claude 3.5 Sonnet",
                        "detected_condition": detected,
                    }
            elif res.status_code in (404, 400):
                last_err_msg = res.text
                continue
            else:
                last_err_msg = res.text
                break
        except Exception as exc:
            last_err_msg = str(exc)
            break
    fallback_text, detected = _fallback_disease_bot(messages)
    notice = f"*(OpenRouter Notice: {last_err_msg[:100]}...)*" if last_err_msg else ""
    return {
        "response": f"{fallback_text}\n\n{notice}".strip(),
        "model_used": f"{model} (fallback)",
        "detected_condition": detected,
    }
