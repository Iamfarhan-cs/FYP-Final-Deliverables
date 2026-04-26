from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.experiment_task import ExperimentTask
from app.models.task import Task

router = APIRouter()


@router.get("/gantt/{experiment_id}")
def get_gantt(experiment_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(ExperimentTask, Task)
        .join(Task, ExperimentTask.task_id == Task.id)
        .filter(ExperimentTask.experiment_id == experiment_id)
        .filter(Task.start_time.isnot(None))
        .filter(Task.finish_time.isnot(None))
        .order_by(ExperimentTask.worker_id, Task.start_time)
        .all()
    )

    if not rows:
        raise HTTPException(status_code=404, detail="No data found for this experiment")

    return [
        {
            "worker_id": f"worker-{et.worker_id}",
            "task_id": t.id,
            "start_time": t.start_time,
            "finish_time": t.finish_time,
        }
        for et, t in rows
    ]
