from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as StarletteHTTPException
from app.api.health import router as health_router
from app.api.dataset import router as dataset_router
from app.api.experiment import router as experiment_router
from app.api.task_complete import router as task_complete_router
from app.api.metrics import router as metrics_router
from app.api.export import router as export_router
from app.api.live import router as live_router
from app.api.worker_stats import router as worker_stats_router
from app.api.gantt import router as gantt_router
from app.api.reset import router as reset_router
from app.api.logs import router as logs_router
from app.db.session import engine
from app.db.base import Base
import app.models  # noqa: F401 — register models with Base before create_all

app = FastAPI(title="FYP API", version="1.0.0")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

app.include_router(health_router)
app.include_router(dataset_router)
app.include_router(experiment_router)
app.include_router(task_complete_router)
app.include_router(metrics_router)
app.include_router(export_router)
app.include_router(live_router)
app.include_router(worker_stats_router)
app.include_router(gantt_router)
app.include_router(reset_router)
app.include_router(logs_router)


@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)
