"""Render-compatible backend startup."""

from __future__ import annotations

import os


def env_flag(name: str, default: bool = False) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def run_database_setup() -> None:
    from setup_local_db import create_or_reset_tables, get_database_url, run_upgrade

    _ = get_database_url()
    create_or_reset_tables(reset=False)

    if not env_flag("SKIP_DB_UPGRADE"):
        run_upgrade()


def main() -> None:
    if env_flag("RUN_DB_SETUP_ON_START"):
        run_database_setup()

    port = os.getenv("PORT", "10000")
    os.execvp(
        "uvicorn",
        [
            "uvicorn",
            "main:app",
            "--host",
            "0.0.0.0",
            "--port",
            port,
        ],
    )


if __name__ == "__main__":
    main()
