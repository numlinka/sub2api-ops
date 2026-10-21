#
#

from enum import StrEnum
from typing import Optional, TypedDict, NotRequired


class Status (StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Granularity (StrEnum):
    HOURURLY = "hourly"
    DAILY = "daily"


class UserTrend (TypedDict):
    date: str
    user_id: int
    email: str
    username: str
    requests: int
    tokens: int
    cost: float
    actual_cost: float


class Group (TypedDict):
    id: int
    name: str
    description: str
    platform: str
    rate_multiplier: float
    is_exclusive: bool
    status: Status
    subscription_type: str
    daily_limit_usd: float
    weekly_limit_usd: float
    monthly_limit_usd: float
    long_context_pricing_enabled: bool
    allow_image_generation: bool
    allow_batch_image_generation: bool
    image_rate_independent: bool
    image_rate_multiplier: float
    batch_image_discount_multiplier: float
    batch_image_hold_multiplier: float
    video_rate_independent: bool
    video_rate_multiplier: float
    peak_rate_enabled: bool
    peak_start: str
    peak_end: str
    peak_rate_multiplier: float
    image_price_1k: Optional[float]
    image_price_2k: Optional[float]
    image_price_4k: Optional[float]
    video_price_480p: Optional[float]
    video_price_720p: Optional[float]
    video_price_1080p: Optional[float]
    web_search_price_per_call: Optional[float]
    search_price_per_1k: Optional[float]
    audio_realtime_price_per_min: Optional[float]
    audio_tts_price_per_million_chars: Optional[float]
    audio_stt_price_per_hour: Optional[float]
    claude_code_only: bool
    fallback_group_id: Optional[int]
    fallback_group_id_on_invalid_request: Optional[int]
    allow_messages_dispatch: bool
    allow_live: bool
    require_oauth_only: bool
    require_privacy_set: bool
    rpm_limit: int
    max_reasoning_effort: str
    max_reasoning_effort_over_limit: str
    reasoning_effort_mappings: list
    created_at: str
    updated_at: str


class Subscription (TypedDict):
    id: int
    user_id: int
    group_id: int
    starts_at: str
    expires_at: str
    status: Status
    daily_window_start: str
    weekly_window_start: str
    monthly_window_start: str
    daily_usage_usd: float
    weekly_usage_usd: float
    monthly_usage_usd: float
    created_at: str
    updated_at: str
    group: Group


class UserInfo (TypedDict):
    id: int
    email: str
    username: str
    role: str
    balance: int
    frozen_balance: int
    concurrency: int
    status: Status
    allowed_groups: Optional[list]  # ? Unknown
    last_active_at: str
    created_at: str
    updated_at: str
    balance_notify_enabled: bool
    balance_notify_threshold_type: str
    balance_notify_threshold: Optional[int]  # ? Unknown
    balance_notify_extra_emails: Optional[list[str]]  # ? Unknown
    total_recharged: int
    rpm_limit: int
    subscriptions: NotRequired[list[Subscription]]
    notes: str
    last_used_at: str
    restrict_public_groups: bool
    current_concurrency: int


class UserAPIKey (TypedDict):
    id: int
    user_id: int
    key: str
    name: str
    group_id: int
    status: Status
    ip_whitelist: Optional[list[str]]
    ip_blacklist: Optional[list[str]]
    last_used_at: Optional[str]
    last_used_ip: Optional[str]
    quota: int
    quota_used: int
    expires_at: Optional[str]
    created_at: str
    updated_at: str
    current_concurrency: int
    rate_limit_5h: int
    rate_limit_1d: int
    rate_limit_7d: int
    usage_5h: int
    usage_1d: int
    usage_7d: int
    window_5h_start: Optional[str]
    window_1d_start: Optional[str]
    window_7d_start: Optional[str]
    group: Group


class UsersResponseData (TypedDict):
    items: list[UserInfo]
    total: int
    page: int
    page_size: int
    pages: int


class UsersResponse (TypedDict):
    code: int
    message: str
    data: UsersResponseData


class UserAPIKeysResponseData (TypedDict):
    items: list[UserAPIKey]
    total: int
    page: int
    page_size: int
    pages: int


class UserAPIKeysResponse (TypedDict):
    code: int
    message: str
    data: UserAPIKeysResponseData


class UsersTrendResponseData (TypedDict):
    end_date: str
    granularity: str
    start_date: str
    trend: list[UserTrend]


class UsersTrendResponse (TypedDict):
    code: int
    message: str
    data: UsersTrendResponseData
