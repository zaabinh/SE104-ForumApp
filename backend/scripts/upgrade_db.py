"""Apply SQL upgrade scripts for existing database instances."""

from pathlib import Path

from sqlalchemy import text

from database import engine


def _split_batches(sql_text: str) -> list[str]:
    lines = sql_text.splitlines()
    batches: list[str] = []
    current: list[str] = []
    for line in lines:
        if line.strip().upper() == "GO":
            batch = "\n".join(current).strip()
            if batch:
                batches.append(batch)
            current = []
            continue
        current.append(line)
    tail = "\n".join(current).strip()
    if tail:
        batches.append(tail)
    return batches


def run_upgrade_script(path: Path) -> None:
    script = path.read_text(encoding="utf-8")
    batches = _split_batches(script)
    if not batches:
        print(f"Skip empty script: {path.name}")
        return

    with engine.begin() as conn:
        for idx, batch in enumerate(batches, start=1):
            conn.execute(text(batch))
            print(f"Applied {path.name} batch {idx}/{len(batches)}")


def main() -> None:
    script_path = Path(__file__).resolve().parent / "db" / "init" / "02_upgrade_moderation_and_profile.sql"
    if not script_path.exists():
        raise FileNotFoundError(f"Upgrade script not found: {script_path}")
    run_upgrade_script(script_path)
    print("Database upgrade completed.")


if __name__ == "__main__":
    main()
