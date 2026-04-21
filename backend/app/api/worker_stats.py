from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.experiment_task import ExperimentTask
from app.models.task import Task

router = APIRouter()


@router.get("/worker-stats")
def get_worker_stats(db: Session = Depends(get_db)):
    rows = (
        db.query(
            ExperimentTask.worker_id,
            func.count(ExperimentTask.id).label("tasks_processed"),
            func.sum(Task.finish_time - Task.start_time).label("busy_time"),
        )
        .join(Task, ExperimentTask.task_id == Task.id)
        .filter(ExperimentTask.worker_id.isnot(None))
        .group_by(ExperimentTask.worker_id)
        .order_by(ExperimentTask.worker_id)
        .all()
    )

    return [
        {
            "worker_id": f"worker-{r.worker_id}",
            "tasks_processed": r.tasks_processed,
            "busy_time": round(r.busy_time, 2) if r.busy_time else 0,
        }
        for r in rows
    ]
