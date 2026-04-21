from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.dataset import router as dataset_router
from app.api.experiment import router as experiment_router
from app.api.task_complete import router as task_complete_router
from app.api.metrics import router as metrics_router
from app.api.export import router as export_router
from app.api.live import router as live_router
from app.api.worker_stats import router as worker_stats_router
from app.db.session import engine
from app.db.base import Base
import app.models  # noqa: F401 — register models with Base before create_all

app = FastAPI(title="FYP API", version="1.0.0")

app.include_router(health_router)
app.include_router(dataset_router)
app.include_router(experiment_router)
app.include_router(task_complete_router)
app.include_router(metrics_router)
app.include_router(export_router)
app.include_router(live_router)
app.include_router(worker_stats_router)


@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)
