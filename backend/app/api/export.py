import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.experiment import Experiment
from app.models.experiment_task import ExperimentTask
from app.models.task import Task

router = APIRouter()


@router.get("/export/{experiment_id}")
def export_experiment(experiment_id: int, db: Session = Depends(get_db)):
    experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    rows = (
        db.query(
            ExperimentTask.task_id,
            Task.execution_time,
            ExperimentTask.waiting_time,
            ExperimentTask.turnaround_time,
            ExperimentTask.worker_id,
        )
        .join(Task, ExperimentTask.task_id == Task.id)
        .filter(ExperimentTask.experiment_id == experiment_id)
        .order_by(ExperimentTask.task_id)
        .all()
    )

    if not rows:
        raise HTTPException(status_code=404, detail="No data found for this experiment")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["task_id", "algorithm", "execution_time", "waiting_time", "turnaround_time", "worker_id"])
    for r in rows:
        writer.writerow([r.task_id, experiment.algorithm, r.execution_time, r.waiting_time, r.turnaround_time, r.worker_id])
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=experiment_{experiment_id}.csv"},
    )
