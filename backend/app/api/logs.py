from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import Task

router = APIRouter()


@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    tasks = (
        db.query(Task)
        .filter(Task.worker_id.isnot(None))
        .filter(Task.start_time.isnot(None))
        .order_by(Task.finish_time.desc().nullslast(), Task.start_time.desc())
        .limit(50)
        .all()
    )

    logs = []
    for t in reversed(tasks):
        wid = t.worker_id if t.worker_id.startswith("Worker") else f"Worker-{t.worker_id}"
        logs.append(f"{wid} started Task-{t.id}")
        if t.finish_time is not None:
            logs.append(f"{wid} finished Task-{t.id}")

    return logs[-50:]
