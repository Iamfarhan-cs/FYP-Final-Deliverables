from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import Task

router = APIRouter()


@router.get("/tasks/live")
def get_live_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.id).all()
    return [
        {
            "task_id": t.id,
            "status": t.status.value,
            "worker_id": t.worker_id,
            "start_time": t.start_time,
            "finish_time": t.finish_time,
        }
        for t in tasks
    ]
