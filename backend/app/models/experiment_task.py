from sqlalchemy import Column, Integer, ForeignKey
from app.db.base import Base


class ExperimentTask(Base):
    __tablename__ = "experiment_tasks"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    waiting_time = Column(Integer, nullable=True)
    turnaround_time = Column(Integer, nullable=True)
    worker_id = Column(Integer, nullable=True)
