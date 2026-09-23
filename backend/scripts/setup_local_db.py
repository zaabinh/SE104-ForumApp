"""One-command local database setup.

Default behavior is non-destructive:
- create the target SQL Server database if it does not exist
- create missing tables from SQLAlchemy models
- run SQL upgrade script

Use --reset only when you intentionally want to drop/recreate all tables.
"""

from __future__ import annotations

import argparse
import os
import time

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Setup the local StudentForum database.")
    parser.add_argument("--reset", action="store_true", help="Drop and recreate all tables before running upgrades.")
    parser.add_argument("--seed", action="store_true", help="Seed demo data after setup.")
    parser.add_argument("--skip-upgrade", action="store_true", help="Skip upgrade_db.py.")
    parser.add_argument("--wait", type=int, default=60, help="Seconds to wait for SQL Server to accept connections.")
    return parser.parse_args()


def get_database_url() -> str:
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("Missing DATABASE_URL in environment.")
    return database_url


def quote_sqlserver_identifier(identifier: str) -> str:
    return f"[{identifier.replace(']', ']]')}]"


def create_database_if_missing(database_url: str, wait_seconds: int) -> None:
    url = make_url(database_url)
    database_name = url.database
    if not database_name:
        raise RuntimeError("DATABASE_URL must include a database name.")

    master_url = url.set(database="master")
    deadline = time.monotonic() + max(wait_seconds, 0)
    last_error: Exception | None = None

    while True:
        try:
            engine = create_engine(master_url, pool_pre_ping=True, future=True, isolation_level="AUTOCOMMIT")
            with engine.connect() as conn:
                conn.execute(
                    text(
                        "IF DB_ID(:database_name) IS NULL "
                        f"EXEC('CREATE DATABASE {quote_sqlserver_identifier(database_name)}')"
                    ),
                    {"database_name": database_name},
                )
            engine.dispose()
            print(f"Database ready: {database_name}")
            return
        except OperationalError as exc:
            last_error = exc
            if time.monotonic() >= deadline:
                break
            time.sleep(2)

    raise RuntimeError(f"SQL Server is not ready after {wait_seconds}s.") from last_error


def create_or_reset_tables(reset: bool) -> None:
    from database import Base, engine
    import models  # noqa: F401 - ensure all model metadata is registered

    if reset:
        Base.metadata.drop_all(bind=engine)
        print("Dropped existing tables.")

    Base.metadata.create_all(bind=engine)
    print("Database tables are ready.")


def run_upgrade() -> None:
    from upgrade_db import main as upgrade_main

    upgrade_main()


def run_seed() -> None:
    from seed import run_seed

    run_seed()


def main() -> None:
    args = parse_args()
    database_url = get_database_url()

    create_database_if_missing(database_url, args.wait)
    create_or_reset_tables(reset=args.reset)

    if not args.skip_upgrade:
        run_upgrade()

    if args.seed:
        run_seed()

    print("Local database setup completed.")


if __name__ == "__main__":
    main()
