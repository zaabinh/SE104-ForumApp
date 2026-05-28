STANDARD_REPORT_REASONS = {
    "spam": "spam",
    "scam": "spam",
    "harassment": "harassment",
    "abuse": "harassment",
    "hate_speech": "hate_speech",
    "hate": "hate_speech",
    "violence": "violence",
    "misinformation": "misinformation",
    "fake_news": "misinformation",
    "other": "other",
}


def normalize_report_reason(reason: str) -> str:
    normalized = reason.strip().lower()
    return STANDARD_REPORT_REASONS.get(normalized, "other")
