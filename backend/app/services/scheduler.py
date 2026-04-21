from dataclasses import dataclass
from collections import deque


@dataclass
class ScheduledTask:
    id: int
    arrival_time: int
    execution_time: int
    start_time: int
    finish_time: int
    waiting_time: int
    turnaround_time: int


def schedule_fcfs(tasks: list[dict]) -> list[ScheduledTask]:
    sorted_tasks = sorted(tasks, key=lambda t: (t["arrival_time"], t["id"]))
    result = []
    current_time = 0

    for t in sorted_tasks:
        start_time = max(current_time, t["arrival_time"])
        finish_time = start_time + t["execution_time"]
        result.append(ScheduledTask(
            id=t["id"],
            arrival_time=t["arrival_time"],
            execution_time=t["execution_time"],
            start_time=start_time,
            finish_time=finish_time,
            waiting_time=start_time - t["arrival_time"],
            turnaround_time=finish_time - t["arrival_time"],
        ))
        current_time = finish_time

    return result


def schedule_sjf(tasks: list[dict]) -> list[ScheduledTask]:
    remaining = sorted(tasks, key=lambda t: (t["arrival_time"], t["id"]))
    remaining = list(remaining)
    result = []
    current_time = 0

    while remaining:
        available = [t for t in remaining if t["arrival_time"] <= current_time]

        if not available:
            current_time = remaining[0]["arrival_time"]
            available = [t for t in remaining if t["arrival_time"] <= current_time]

        chosen = min(available, key=lambda t: (t["execution_time"], t["arrival_time"], t["id"]))
        remaining.remove(chosen)

        start_time = current_time
        finish_time = start_time + chosen["execution_time"]
        result.append(ScheduledTask(
            id=chosen["id"],
            arrival_time=chosen["arrival_time"],
            execution_time=chosen["execution_time"],
            start_time=start_time,
            finish_time=finish_time,
            waiting_time=start_time - chosen["arrival_time"],
            turnaround_time=finish_time - chosen["arrival_time"],
        ))
        current_time = finish_time

    return result


def schedule_round_robin(tasks: list[dict], quantum: int = 2) -> list[ScheduledTask]:
    sorted_tasks = sorted(tasks, key=lambda t: (t["arrival_time"], t["id"]))

    remaining_time = {t["id"]: t["execution_time"] for t in sorted_tasks}
    first_start = {t["id"]: -1 for t in sorted_tasks}
    finish_time = {}

    queue: deque[dict] = deque()
    task_pool = list(sorted_tasks)
    current_time = 0
    pool_idx = 0

    # Seed the queue with tasks arriving at time 0
    while pool_idx < len(task_pool) and task_pool[pool_idx]["arrival_time"] <= current_time:
        queue.append(task_pool[pool_idx])
        pool_idx += 1

    while queue or pool_idx < len(task_pool):
        if not queue:
            current_time = task_pool[pool_idx]["arrival_time"]
            while pool_idx < len(task_pool) and task_pool[pool_idx]["arrival_time"] <= current_time:
                queue.append(task_pool[pool_idx])
                pool_idx += 1

        task = queue.popleft()
        tid = task["id"]

        if first_start[tid] == -1:
            first_start[tid] = current_time

        run_time = min(quantum, remaining_time[tid])
        current_time += run_time
        remaining_time[tid] -= run_time

        # Enqueue newly arrived tasks before re-enqueuing current task
        while pool_idx < len(task_pool) and task_pool[pool_idx]["arrival_time"] <= current_time:
            queue.append(task_pool[pool_idx])
            pool_idx += 1

        if remaining_time[tid] > 0:
            queue.append(task)
        else:
            finish_time[tid] = current_time

    result = []
    for t in sorted_tasks:
        tid = t["id"]
        ft = finish_time[tid]
        result.append(ScheduledTask(
            id=tid,
            arrival_time=t["arrival_time"],
            execution_time=t["execution_time"],
            start_time=first_start[tid],
            finish_time=ft,
            waiting_time=ft - t["arrival_time"] - t["execution_time"],
            turnaround_time=ft - t["arrival_time"],
        ))

    # Order by finish time for consistent output
    result.sort(key=lambda s: (s.finish_time, s.id))
    return result
