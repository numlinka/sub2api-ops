#
#

__all__ = ["app", "httpclient"]

# std
from contextlib import asynccontextmanager

# site
from fastapi import FastAPI
from httpx import AsyncClient

# local
from constants import DEBUG_MODE


async def start_task():
    ...


async def stop_task():
    await httpclient.aclose()


@asynccontextmanager
async def lifespan(*_):
    await start_task()
    yield
    await stop_task()


app = FastAPI(docs_url="/docs" if DEBUG_MODE else None, lifespan=lifespan)
httpclient = AsyncClient(timeout=10.0)
