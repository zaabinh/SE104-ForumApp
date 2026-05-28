from services.report_service import normalize_report_reason


def test_normalize_report_reason_maps_aliases() -> None:
    assert normalize_report_reason("scam") == "spam"
    assert normalize_report_reason("abuse") == "harassment"
    assert normalize_report_reason("fake_news") == "misinformation"


def test_normalize_report_reason_fallback() -> None:
    assert normalize_report_reason("unknown_reason") == "other"
