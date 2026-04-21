import json
import os
import time
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
QUEUE_NAME = "task_queue"
MAX_RETRIES = 5
RETRY_DELAY = 2


def _get_client() -> redis.Redis:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
            client.ping()
            return client
        except redis.ConnectionError:
            if attempt == MAX_RETRIES:
                raise
            time.sleep(RETRY_DELAY)


def push_task(task: dict) -> None:
    client = _get_client()
    client.rpush(QUEUE_NAME, json.dumps(task))


def pop_task() -> dict | None:
    client = _get_client()
    data = client.lpop(QUEUE_NAME)
    if data is None:
        return None
    return json.loads(data)
