from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.experiment_task import ExperimentTask
from app.models.task import Task

router = APIRouter()


@router.get("/metrics/{experiment_id}")
def get_metrics(experiment_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(
            func.avg(ExperimentTask.waiting_time),
            func.avg(ExperimentTask.turnaround_time),
            func.count(ExperimentTask.id),
            func.max(Task.finish_time),
            func.min(Task.arrival_time),
        )
        .join(Task, ExperimentTask.task_id == Task.id)
        .filter(ExperimentTask.experiment_id == experiment_id)
        .first()
    )

    total_tasks = result[2]
    if total_tasks == 0:
        raise HTTPException(status_code=404, detail="No data found for this experiment")

    max_finish_time = result[3]
    min_arrival_time = result[4]
    makespan = (
        round(max_finish_time - min_arrival_time, 4)
        if max_finish_time is not None and min_arrival_time is not None
        else 0
    )
    throughput = round(total_tasks / makespan, 4) if makespan > 0 else 0

    return {
        "avg_waiting_time": round(result[0], 2),
        "avg_turnaround_time": round(result[1], 2),
        "total_tasks": total_tasks,
        "makespan": makespan,
        "throughput": throughput,
    }
