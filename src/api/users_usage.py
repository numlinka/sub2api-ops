#
#

# std
import asyncio
import datetime
import traceback

from typeins import UserUsageDetails, UserAPIKey
from typeins.sub2api import UsersTrendResponse, UsersResponse, UserAPIKeysResponse, Role

# site
from typex import Static
from fastapi import Response

# local
from basic import app, httpclient
from constants import ADMIN_BASE_URL, HEADERS


class Cache (Static):
    lock: asyncio.Lock = asyncio.Lock()
    usage_data: dict[int, UserUsageDetails] = {}


@app.post("/api/users-usage")
async def post_users_usage(item: UserAPIKey) -> list[UserUsageDetails]:
    """
    获取用户使用详情

    获得同组用户的使用详情
    """
    if not item.key:
        await asyncio.sleep(5)
        return Response(status_code=403, content="Invalid key")  # type: ignore

    response = await httpclient.get(
        f"{ADMIN_BASE_URL}/api/v1/admin/users",
        headers=HEADERS,
        params={
            "search": item.key
        }
    )

    jsondata: UsersResponse = response.json()

    if len(jsondata["data"]["items"]) == 0:
        await asyncio.sleep(5)
        return []

    user_info = jsondata["data"]["items"][0]
    user_role = user_info["role"]

    if user_role == Role.ADMIN:
        async with Cache.lock:
            return list(Cache.usage_data.values())

    user_id = user_info["id"]
    uid_lst = [user_id]

    if "subscriptions" in user_info:
        user_groups = [item["group_id"] for item in user_info["subscriptions"]]

        for group_id in user_groups:
            response = await httpclient.get(
                f"{ADMIN_BASE_URL}/api/v1/admin/users",
                headers=HEADERS,
                params={
                    "api_key_group_id": group_id
                }
            )
            jsondata: UsersResponse = response.json()
            uid_lst = [item["id"] for item in jsondata["data"]["items"]]

    async with Cache.lock:
        return [v for k, v in Cache.usage_data.items() if k in uid_lst]


async def update_users_usage() -> None:
    try:
        now = datetime.datetime.now()
        date = now.date()

        today_str = now.date().strftime("%Y-%m-%d")
        yesterday_str = (now.date() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        this_month_str = now.date().replace(day=1).strftime("%Y-%m-%d")

        response = await httpclient.get(
            f"{ADMIN_BASE_URL}/api/v1/admin/dashboard/users-trend",
            params={
                "metric": "tokens",
                "start_date": this_month_str,
                "end_date": today_str
            },
            headers=HEADERS
        )

        jsondata: UsersTrendResponse = response.json()
        trend = jsondata["data"]["trend"]
        users_usage: dict[int, UserUsageDetails] = {}

        for item in trend:
            user_id = item["user_id"]
            if user_id not in users_usage:
                userdata = UserUsageDetails()
                users_usage[user_id] = userdata
                userdata.username = item["username"] if item["username"] else item["email"]
                userdata.tokens.total = item["tokens"]
                userdata.requests.total = item["requests"]

            else:
                userdata = users_usage[user_id]
                userdata.requests.total += item["requests"]
                userdata.tokens.total += item["tokens"]

            date = item["date"]
            if date == today_str:
                userdata.tokens.today = item["tokens"]
                userdata.requests.today = item["requests"]

            elif date == yesterday_str:
                userdata.requests.yesterday = item["requests"]
                userdata.tokens.yesterday = item["tokens"]

        async with Cache.lock:
            Cache.usage_data = users_usage

    except Exception as _:
        print(traceback.format_exc())

    finally:
        ...


async def auto_update():
    while True:
        await update_users_usage()
        await asyncio.sleep(300)


async def over_initial():
    asyncio.create_task(auto_update())


def initial():
    ...
