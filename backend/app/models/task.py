from sqlalchemy import Column, Integer, Float, String, Enum as SAEnum
from app.db.base import Base
import enum


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    execution_time = Column(Integer, nullable=False)
    arrival_time = Column(Integer, nullable=False)
    status = Column(SAEnum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    start_time = Column(Float, nullable=True)
    finish_time = Column(Float, nullable=True)
    worker_id = Column(String, nullable=True)
