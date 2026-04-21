from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.experiment_task import ExperimentTask

router = APIRouter()


@router.get("/metrics/{experiment_id}")
def get_metrics(experiment_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(
            func.avg(ExperimentTask.waiting_time),
            func.avg(ExperimentTask.turnaround_time),
            func.count(ExperimentTask.id),
            func.max(ExperimentTask.turnaround_time),
        )
        .filter(ExperimentTask.experiment_id == experiment_id)
        .first()
    )

    total_tasks = result[2]
    if total_tasks == 0:
        raise HTTPException(status_code=404, detail="No data found for this experiment")

    makespan = result[3]
    throughput = round(total_tasks / makespan, 4) if makespan and makespan > 0 else 0

    return {
        "avg_waiting_time": round(result[0], 2),
        "avg_turnaround_time": round(result[1], 2),
        "total_tasks": total_tasks,
        "makespan": makespan,
        "throughput": throughput,
    }
