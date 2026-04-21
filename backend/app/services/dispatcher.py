import logging
from dataclasses import asdict

from app.services.queue_service import push_task
from app.services.scheduler import ScheduledTask

logger = logging.getLogger(__name__)


def dispatch(scheduled_tasks: list[ScheduledTask]) -> int:
    logger.info("Dispatching %d tasks to queue", len(scheduled_tasks))

    for position, task in enumerate(scheduled_tasks, start=1):
        task_data = asdict(task)
        task_data["dispatch_order"] = position
        push_task(task_data)
        logger.info(
            "Dispatched #%d → Task %d (start=%d, finish=%d)",
            position, task.id, task.start_time, task.finish_time,
        )

    logger.info("Dispatch complete: %d tasks queued", len(scheduled_tasks))
    return len(scheduled_tasks)
