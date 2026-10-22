#
#

__all__ = []

# site
import uvicorn

# local
import basic
import api
import web

from constants import HOST, PORT


async def over_initial():
    await api.over_initial()


def initial():
    from constants import ADMIN_BASE_URL, ADMIN_KEY

    if (not ADMIN_BASE_URL) or (not ADMIN_KEY):
        raise SystemExit("Environment variables BASE_URL and ADMIN_KEY must be set.")

    api.initial()
    web.initial()
    basic.start_task = over_initial


def run():
    initial()
    uvicorn.run(basic.app, host=HOST, port=PORT)
