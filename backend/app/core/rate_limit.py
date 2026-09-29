"""Простой in-memory rate limiter со скользящим окном.

Ограничения: состояние хранится в памяти процесса — при перезапуске сбрасывается
и не разделяется между несколькими инстансами. Для одного инстанса на Render
этого достаточно; при масштабировании на несколько инстансов нужен Redis.
"""
import math
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_SWEEP_EVERY_SECONDS = 300
_MAX_KEY_AGE_SECONDS = 24 * 60 * 60


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._last_sweep = time.monotonic()

    def _sweep(self, now: float) -> None:
        if now - self._last_sweep < _SWEEP_EVERY_SECONDS:
            return
        self._last_sweep = now
        stale = [k for k, q in self._hits.items() if not q or q[-1] < now - _MAX_KEY_AGE_SECONDS]
        for key in stale:
            del self._hits[key]

    def blocked_for(self, key: str, limit: int, window: int) -> int:
        """Сколько секунд ждать до следующей попытки (0 — можно)."""
        now = time.monotonic()
        self._sweep(now)
        q = self._hits.get(key)
        if not q:
            return 0
        while q and q[0] <= now - window:
            q.popleft()
        if len(q) >= limit:
            return max(1, math.ceil(q[0] + window - now))
        return 0

    def add(self, key: str) -> None:
        self._hits[key].append(time.monotonic())

    def clear(self, key: str) -> None:
        self._hits.pop(key, None)

    def hit(self, key: str, limit: int, window: int) -> int:
        """Считает запрос; возвращает 0, если разрешён, иначе секунды ожидания."""
        retry = self.blocked_for(key, limit, window)
        if retry:
            return retry
        self.add(key)
        return 0


limiter = SlidingWindowLimiter()


def client_ip(request: Request) -> str:
    # За прокси (Cloudflare/Render) реальный IP приходит в заголовках.
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def too_many_requests(retry_after: int) -> HTTPException:
    return HTTPException(
        status.HTTP_429_TOO_MANY_REQUESTS,
        "Too many requests, try again later",
        headers={"Retry-After": str(retry_after)},
    )


def rate_limit(scope: str, limit: int, window: int):
    """Dependency: не более `limit` запросов за `window` секунд с одного IP."""

    async def dependency(request: Request) -> None:
        retry = limiter.hit(f"{scope}:{client_ip(request)}", limit, window)
        if retry:
            raise too_many_requests(retry)

    return dependency
