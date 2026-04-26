from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.task import Task, TaskStatus
from app.services.dataset_parser import parse_dataset

router = APIRouter()


@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    tasks = parse_dataset(content, file.filename)

    db.query(Task).delete()

    task_objects = [
        Task(
            id=t["id"],
            execution_time=t["execution_time"],
            arrival_time=t["arrival_time"],
            status=TaskStatus.PENDING,
        )
        for t in tasks
    ]
    db.bulk_save_objects(task_objects)
    db.commit()

    return {"count": len(task_objects)}


@router.get("/dataset-insights")
def get_dataset_insights(db: Session = Depends(get_db)):
    result = db.query(
        func.min(Task.execution_time).label("min_execution_time"),
        func.max(Task.execution_time).label("max_execution_time"),
        func.avg(Task.execution_time).label("avg_execution_time"),
        func.count(Task.id).label("total_tasks"),
    ).first()

    if not result or result.total_tasks == 0:
        raise HTTPException(status_code=404, detail="No dataset loaded")

    return {
        "min_execution_time": result.min_execution_time,
        "max_execution_time": result.max_execution_time,
        "avg_execution_time": round(result.avg_execution_time, 2),
        "total_tasks": result.total_tasks,
    }
