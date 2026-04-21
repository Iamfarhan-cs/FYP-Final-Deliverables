import json
import os
import time
import logging
import redis
import requests

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
WORKER_ID = int(os.getenv("WORKER_ID", "1"))
QUEUE_NAME = "task_queue"
MAX_RETRIES = 10
RETRY_DELAY = 3
POLL_INTERVAL = 1

logging.basicConfig(level=logging.INFO, format=f"[Worker {WORKER_ID}] %(message)s")
logger = logging.getLogger(__name__)


def get_redis_client() -> redis.Redis:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
            client.ping()
            logger.info("Connected to Redis")
            return client
        except redis.ConnectionError:
            logger.warning("Redis unavailable, retry %d/%d ...", attempt, MAX_RETRIES)
            if attempt == MAX_RETRIES:
                raise
            time.sleep(RETRY_DELAY)


def report_completion(task: dict, start_time: int, finish_time: int) -> None:
    payload = {
        "task_id": task["id"],
        "worker_id": WORKER_ID,
        "start_time": start_time,
        "finish_time": finish_time,
        "experiment_id": task.get("experiment_id", 0),
    }
    try:
        resp = requests.post(f"{BACKEND_URL}/task-complete", json=payload, timeout=10)
        resp.raise_for_status()
        logger.info("Reported task %d complete", task["id"])
    except requests.RequestException as e:
        logger.error("Failed to report task %d: %s", task["id"], e)


def run() -> None:
    logger.info("Starting worker (WORKER_ID=%d)", WORKER_ID)
    client = get_redis_client()
    clock = 0

    while True:
        data = client.lpop(QUEUE_NAME)
        if data is None:
            time.sleep(POLL_INTERVAL)
            continue

        task = json.loads(data)
        logger.info("Worker-%d executing Task-%d (exec_time=%d)", WORKER_ID, task["id"], task["execution_time"])

        start_time = clock
        time.sleep(task["execution_time"])
        clock = start_time + task["execution_time"]
        finish_time = clock

        report_completion(task, start_time, finish_time)


if __name__ == "__main__":
    run()
