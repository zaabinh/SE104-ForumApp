import pytest
from pydantic import ValidationError

from schemas.report_schema import ReportCreate


def test_report_reason_accepts_standardized_values() -> None:
    payload = ReportCreate(reason="spam", details="x")
    assert payload.reason == "spam"


def test_report_reason_rejects_unknown_values() -> None:
    with pytest.raises(ValidationError):
        ReportCreate(reason="illegal_reason")
