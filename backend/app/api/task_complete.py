from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import Task, TaskStatus
from app.models.experiment_task import ExperimentTask

router = APIRouter()


class TaskCompleteRequest(BaseModel):
    task_id: int
    worker_id: int
    start_time: float
    finish_time: float
    experiment_id: int


@router.post("/task-complete")
def task_complete(body: TaskCompleteRequest, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == body.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = TaskStatus.DONE
    task.start_time = body.start_time
    task.finish_time = body.finish_time
    task.worker_id = str(body.worker_id)

    waiting_time = body.start_time - task.arrival_time
    turnaround_time = body.finish_time - task.arrival_time

    exp_task = (
        db.query(ExperimentTask)
        .filter(
            ExperimentTask.experiment_id == body.experiment_id,
            ExperimentTask.task_id == body.task_id,
        )
        .first()
    )

    if exp_task:
        exp_task.waiting_time = waiting_time
        exp_task.turnaround_time = turnaround_time
        exp_task.worker_id = body.worker_id
    else:
        exp_task = ExperimentTask(
            experiment_id=body.experiment_id,
            task_id=body.task_id,
            waiting_time=waiting_time,
            turnaround_time=turnaround_time,
            worker_id=body.worker_id,
        )
        db.add(exp_task)

    db.commit()

    return {
        "task_id": body.task_id,
        "status": "done",
        "waiting_time": waiting_time,
        "turnaround_time": turnaround_time,
    }
