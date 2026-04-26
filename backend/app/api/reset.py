from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.experiment_task import ExperimentTask
from app.models.experiment import Experiment
from app.models.task import Task

router = APIRouter()


@router.post("/reset")
def reset_system(db: Session = Depends(get_db)):
    # Delete in FK-safe order: child tables first
    db.query(ExperimentTask).delete()
    db.query(Experiment).delete()
    db.query(Task).delete()
    db.commit()
    return {"message": "system reset"}
