from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.base import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
