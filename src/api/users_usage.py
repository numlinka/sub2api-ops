#
#

# std
import asyncio
import datetime
import traceback
from typeins import UserUsageDetails, UserAPIKey
from typeins.sub2api import UsersTrendResponse, UsersResponse, UserAPIKeysResponse

# site
from typex import Static
from fastapi import Response

# local
from basic import app, httpclient
from constants import BASE_URL, HEADERS


class Cache (Static):
    lock: asyncio.Lock = asyncio.Lock()
    usage_data: dict[int, UserUsageDetails] = {}
    key_for_group: dict[str, int] = {}  # key -> group_id
    subscriptions_tuple: dict[int, list[int]] = {}  # group_id -> uid_lst


@app.post("/api/users-usage")
async def post_users_usage(item: UserAPIKey) -> list[UserUsageDetails]:
    """
    获取用户使用详情

    获得同组用户的使用详情
    """
    if not await is_valid_key(item.key):
        await asyncio.sleep(5)
        return Response(status_code=403, content="Invalid key")  # type: ignore

    async with Cache.lock:
        if item.key not in Cache.key_for_group:
            return []
        group_id = Cache.key_for_group[item.key]
        if group_id not in Cache.subscriptions_tuple:
            return []
        uid_lst = Cache.subscriptions_tuple[group_id]
        lst = []

        for uid in uid_lst:
            if uid not in Cache.usage_data: continue
            lst.append(Cache.usage_data[uid])

        return lst


async def update_users_usage() -> None:
    try:
        now = datetime.datetime.now()
        date = now.date()

        today_str = now.date().strftime("%Y-%m-%d")
        yesterday_str = (now.date() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        this_month_str = now.date().replace(day=1).strftime("%Y-%m-%d")

        response = await httpclient.get(
            f"{BASE_URL}/api/v1/admin/dashboard/users-trend",
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
                userdata.user_id = user_id
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


async def is_valid_key(key: str) -> bool:
    if key in Cache.key_for_group:
        return True

    return False


async def update_all_users_keys() -> None:
    try:
        response = await httpclient.get(
            f"{BASE_URL}/api/v1/admin/users",
            headers=HEADERS
        )

        users_data: UsersResponse = response.json()
        items = users_data["data"]["items"]
        uid_lst = []
        subscriptions_tuple = {}

        for user_info in items:
            uid = user_info["id"]
            uid_lst.append(uid)

            if "subscriptions" not in user_info: continue
            for subscription in user_info["subscriptions"]:
                group_id = subscription["group_id"]
                if group_id not in subscriptions_tuple:
                    subscriptions_tuple[group_id] = []
                subscriptions_tuple[group_id].append(uid)

        key_for_group = {}

        for uid in uid_lst:
            response = await httpclient.get(
                f"{BASE_URL}/api/v1/admin/users/1/api-keys",
                headers=HEADERS
            )

            keys_data: UserAPIKeysResponse = response.json()
            items = keys_data["data"]["items"]

            for key_info in items:
                key = key_info["key"]
                group_id = key_info["group_id"]
                key_for_group[key] = group_id

        async with Cache.lock:
            Cache.key_for_group = key_for_group
            Cache.subscriptions_tuple = subscriptions_tuple

    except Exception as _:
        print(traceback.format_exc())

    finally:
        ...


async def auto_update():
    while True:
        await update_all_users_keys()
        await update_users_usage()
        await asyncio.sleep(300)


async def over_initial():
    asyncio.create_task(auto_update())


def initial():
    ...
