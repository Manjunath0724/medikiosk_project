"""
MediKiosk LLM Engine -- Powered by OpenRouter Claude 3.5 Sonnet & Gemini Fallback

Provides:
- call_json: For structured Module A conversation and Module C summarization.
- call_json_vision: For Module B document extraction using vision models.
- Robust JSON extraction, retry logic, and graceful clinical fallback.
"""

import base64
import json
import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MAX_OUTPUT_TOKENS = 1500
RETRY_JSON_ONLY_NOTICE = "Your previous response was not valid JSON. Please return ONLY a valid, parseable JSON object. No conversational text, no markdown fences."


def _get_openrouter_key() -> str | None:
    """Retrieve the OpenRouter API key from env or .env file."""
    key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("CLAUDE_API_KEY")
    if key and key.strip():
        return key.strip()

    # Direct search in .env files
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
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
            except Exception:
                pass
    return None


def _strip_code_fences(text: str) -> str:
    """Strip markdown code fences from JSON output."""
    text = text.strip()
    fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    if fence_match:
        return fence_match.group(1).strip()
    return text


def _try_parse_json(raw_text: str):
    """Attempt to parse JSON, falling back to regex extraction of the outermost object."""
    if not raw_text:
        return None, "empty response"
    cleaned = _strip_code_fences(raw_text)
    try:
        return json.loads(cleaned), None
    except json.JSONDecodeError as exc:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0)), None
            except json.JSONDecodeError:
                pass
        return None, str(exc)


def _call_openrouter_raw(messages: list[dict], model: str, max_tokens: int = MAX_OUTPUT_TOKENS) -> tuple[str | None, str | None]:
    """Call OpenRouter Chat API with model fallback chain."""
    key = _get_openrouter_key()
    if not key:
        return None, "No OpenRouter API key configured"

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MediKiosk Intake Kiosk",
    }

    candidate_models = [
        model,
        "anthropic/claude-sonnet-4",
        "anthropic/claude-sonnet-4.5",
        "anthropic/claude-3.5-sonnet",
        "nvidia/nemotron-3.5-lightning:free",
    ]

    last_error = None
    for candidate in candidate_models:
        payload = {
            "model": candidate,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }
        try:
            res = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                choices = data.get("choices") or []
                if choices and "message" in choices[0]:
                    return choices[0]["message"].get("content", ""), None
            elif res.status_code in (404, 400):
                # Try next candidate if endpoint name shifted
                last_error = f"HTTP {res.status_code}: {res.text[:100]}"
                continue
            else:
                last_error = f"HTTP {res.status_code}: {res.text[:100]}"
                break
        except Exception as e:
            last_error = str(e)

    return None, last_error


def call_json(system_prompt: str, messages: list, fallback: dict) -> dict:
    """Call OpenRouter Claude 3.5 Sonnet with a system prompt and conversation messages."""
    openrouter_key = _get_openrouter_key()

    if openrouter_key:
        formatted_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            role = "user" if m.get("role") in ("user", "patient") else "assistant"
            content = m.get("content") or m.get("text") or ""
            if content:
                formatted_messages.append({"role": role, "content": content})

        raw_text, err = _call_openrouter_raw(formatted_messages, model="anthropic/claude-3.5-sonnet")
        if raw_text:
            parsed, parse_err = _try_parse_json(raw_text)
            if parsed is not None:
                return parsed

            # Retry once with explicit json nudge
            retry_msgs = formatted_messages + [
                {"role": "assistant", "content": raw_text},
                {"role": "user", "content": RETRY_JSON_ONLY_NOTICE},
            ]
            retry_raw, _ = _call_openrouter_raw(retry_msgs, model="anthropic/claude-3.5-sonnet")
            if retry_raw:
                parsed, _ = _try_parse_json(retry_raw)
                if parsed is not None:
                    return parsed

    # Fallback to Gemini if GEMINI_API_KEY is present
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            contents = []
            for msg in messages:
                role = "model" if msg.get("role") in ("assistant", "model") else "user"
                text = msg.get("content") or msg.get("text") or ""
                contents.append({"role": role, "parts": [{"text": text}]})

            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                max_output_tokens=MAX_OUTPUT_TOKENS,
            )
            resp = client.models.generate_content(
                model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
                contents=contents,
                config=config,
            )
            parsed, _ = _try_parse_json(resp.text or "")
            if parsed is not None:
                return parsed
        except Exception:
            pass

    # Safe degraded fallback
    result = dict(fallback)
    result["_fallback_reason"] = "LLM offline, using progressive clinical fallback"
    return result


def call_json_vision(
    system_prompt: str,
    image_bytes: bytes,
    media_type: str,
    user_text: str,
    fallback: dict,
) -> dict:
    """Extract clinical document data from image bytes via Claude Vision / OpenRouter."""
    openrouter_key = _get_openrouter_key()
    b64_image = base64.standard_b64encode(image_bytes).decode("utf-8")

    if openrouter_key:
        data_url = f"data:{media_type};base64,{b64_image}"
        formatted_messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ]
        raw_text, _ = _call_openrouter_raw(formatted_messages, model="anthropic/claude-3.5-sonnet")
        if raw_text:
            parsed, _ = _try_parse_json(raw_text)
            if parsed is not None:
                return parsed

    # Check Gemini fallback
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            contents = [
                {
                    "role": "user",
                    "parts": [
                        {"inline_data": {"mime_type": media_type, "data": b64_image}},
                        {"text": user_text},
                    ],
                }
            ]
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                max_output_tokens=MAX_OUTPUT_TOKENS,
            )
            resp = client.models.generate_content(
                model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
                contents=contents,
                config=config,
            )
            parsed, _ = _try_parse_json(resp.text or "")
            if parsed is not None:
                return parsed
        except Exception:
            pass

    return dict(fallback)
