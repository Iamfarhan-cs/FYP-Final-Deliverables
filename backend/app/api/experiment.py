from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Literal, Optional

from app.db.session import get_db
from app.models.task import Task
from app.models.experiment import Experiment
from app.models.experiment_task import ExperimentTask
from app.services.scheduler import schedule_fcfs, schedule_sjf, schedule_round_robin
from app.services.dispatcher import dispatch

router = APIRouter()


class RunExperimentRequest(BaseModel):
    algorithm: Literal["FCFS", "SJF", "RR"]
    num_workers: int = 10
    quantum: Optional[int] = 2


@router.post("/run-experiment")
def run_experiment(body: RunExperimentRequest, db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    if not tasks:
        raise HTTPException(status_code=400, detail="No tasks in database. Upload a dataset first.")

    task_dicts = [
        {"id": t.id, "execution_time": t.execution_time, "arrival_time": t.arrival_time}
        for t in tasks
    ]

    if body.algorithm == "RR":
        scheduled = schedule_round_robin(task_dicts, quantum=body.quantum)
    elif body.algorithm == "SJF":
        scheduled = schedule_sjf(task_dicts)
    else:
        scheduled = schedule_fcfs(task_dicts)

    experiment = Experiment(algorithm=body.algorithm)
    db.add(experiment)
    db.flush()

    experiment_tasks = [
        ExperimentTask(
            experiment_id=experiment.id,
            task_id=st.id,
            waiting_time=st.waiting_time,
            turnaround_time=st.turnaround_time,
            worker_id=(i % body.num_workers) + 1,
        )
        for i, st in enumerate(scheduled)
    ]
    db.bulk_save_objects(experiment_tasks)
    db.commit()

    dispatch(scheduled)

    return {"experiment_id": experiment.id}
