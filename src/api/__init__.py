#
#

# local
from basic import app
from constants import ADMIN_BASE_URL, API_BASE_URL

# internal
from . import models
from . import users_usage


@app.get("/api/base-url")
def get_base_url() -> list[str]:
    """
    API 端点地址
    """
    if API_BASE_URL is None:
        return [ADMIN_BASE_URL]  # type: ignore

    return API_BASE_URL.split(";")



def initial():
    models.initial()
    users_usage.initial()


async def over_initial():
    await users_usage.over_initial()
