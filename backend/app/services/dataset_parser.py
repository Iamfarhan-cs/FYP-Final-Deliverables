import csv
import io
from fastapi import HTTPException


def parse_dataset(content: bytes, filename: str) -> list[dict]:
    text = content.decode("utf-8")
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension == "csv":
        tasks = _parse_csv(text)
    elif extension == "txt":
        tasks = _parse_txt(text)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use .csv or .txt")

    _validate_tasks(tasks)
    return tasks


def _parse_csv(text: str) -> list[dict]:
    lines = text.strip().splitlines()
    header = lines[0].strip() if lines else ""

    # Single-column CSV: just execution_time values, one per line
    if "," not in header and header.isdigit():
        tasks = []
        for line_num, line in enumerate(lines, start=1):
            val = line.strip()
            if not val:
                continue
            try:
                tasks.append({
                    "id": line_num,
                    "execution_time": int(val),
                    "arrival_time": 0,
                })
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid data at row {line_num}: {e}",
                )
        return tasks

    reader = csv.DictReader(io.StringIO(text))
    tasks = []
    for row_num, row in enumerate(reader, start=2):
        try:
            tasks.append({
                "id": int(row["id"]),
                "execution_time": int(row["execution_time"]),
                "arrival_time": int(row["arrival_time"]),
            })
        except (KeyError, ValueError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid data at row {row_num}: {e}",
            )
    return tasks


def _parse_txt(text: str) -> list[dict]:
    tasks = []
    for line_num, line in enumerate(text.strip().splitlines(), start=1):
        parts = line.split()
        if len(parts) == 1:
            # Single-column format: just execution_time per line
            try:
                tasks.append({
                    "id": line_num,
                    "execution_time": int(parts[0]),
                    "arrival_time": 0,
                })
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid data at line {line_num}: {e}",
                )
        elif len(parts) == 3:
            try:
                tasks.append({
                    "id": int(parts[0]),
                    "execution_time": int(parts[1]),
                    "arrival_time": int(parts[2]),
                })
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid data at line {line_num}: {e}",
                )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid format at line {line_num}: expected 1 or 3 space-separated values",
            )
    return tasks


def _validate_tasks(tasks: list[dict]) -> None:
    count = len(tasks)
    if count < 100 or count > 1000:
        raise HTTPException(
            status_code=400,
            detail=f"Task count must be between 100 and 1000, got {count}",
        )

    for i, t in enumerate(tasks):
        if t["execution_time"] <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"Task {t['id']}: execution_time must be > 0",
            )
        if t["arrival_time"] < 0:
            raise HTTPException(
                status_code=400,
                detail=f"Task {t['id']}: arrival_time must be >= 0",
            )
