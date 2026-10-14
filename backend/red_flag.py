"""
Section 3.4 -- Red-flag keyword backstop.

Runs independently of the LLM's own `red_flag` field on every patient
answer. If either the LLM or this keyword check trips, the turn is
treated as a red flag. This is a deliberately dumb, deterministic
safety net: it should never be the *only* thing catching an emergency,
but it should never miss an obvious one either just because the model
had an off turn.

English keyword pairs are taken directly from the spec. Hindi
equivalents are added as a practical extension since the kiosk itself
supports Hindi -- flag if this needs to be reviewed by a clinician
before a real deployment.
"""

import re

# Each entry: (label, [set A patterns], [set B patterns] or None)
# If set B is None, a single match from set A is enough to flag.
# Otherwise, at least one pattern from EACH set must match (co-occurrence).
_RULES = [
    (
        "chest pain + breathlessness",
        [r"chest pain", r"chest.*hurt", r"सीने में दर्द", r"छाती में दर्द"],
        [
            r"breathless",
            r"can'?t breathe",
            r"cannot breathe",
            r"shortness of breath",
            r"difficulty breathing",
            r"साँस.*तकलीफ",
            r"सांस.*तकलीफ",
            r"साँस नहीं आ",
        ],
    ),
    (
        "severe headache + vision/confusion",
        [r"severe headache", r"worst headache", r"तेज़ सिरदर्द", r"तेज सिरदर्द"],
        [
            r"vision",
            r"blurr",
            r"confus",
            r"धुंधला",
            r"भ्रम",
        ],
    ),
    ("unconscious", [r"unconscious", r"not responding", r"बेहोश"], None),
    ("not breathing", [r"not breathing", r"stopped breathing", r"साँस रुक"], None),
    (
        "severe / uncontrolled bleeding",
        [
            r"severe bleeding",
            r"uncontrolled bleeding",
            r"bleeding a lot",
            r"heavy bleeding",
            r"बहुत खून",
            r"रक्तस्राव",
        ],
        None,
    ),
]


def check_red_flag_keywords(text: str):
    """Return (triggered: bool, reason: str | None) for the given text."""
    if not text:
        return False, None
    lowered = text.lower()

    for label, set_a, set_b in _RULES:
        a_hit = any(re.search(p, lowered) for p in set_a) or any(
            re.search(p, text) for p in set_a
        )
        if not a_hit:
            continue
        if set_b is None:
            return True, f"keyword backstop: {label}"
        b_hit = any(re.search(p, lowered) for p in set_b) or any(
            re.search(p, text) for p in set_b
        )
        if b_hit:
            return True, f"keyword backstop: {label}"

    return False, None
