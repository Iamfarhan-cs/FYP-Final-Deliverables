from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
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
