#
#

# internal
from . import models
from . import users_usage


def initial():
    models.initial()
    users_usage.initial()


async def over_initial():
    await users_usage.over_initial()
