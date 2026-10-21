#
# 

__all__ = []

# std
from enum import StrEnum
from typing import Optional
from dataclasses import dataclass, field

# site
from pydantic import BaseModel


class Modalities(StrEnum):
    TEXT = "text"
    IMAGE = "image"


class SupportedLevels(StrEnum):
    NONE = "none"
    MINIMAL = "minimal"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    XHIGH = "xhigh"
    MAX = "max"
    ULTRA = "ultra"


@dataclass
class UsageDetailsForDay (object):
    today: int = 0
    yesterday: int = 0
    total: int = 0


@dataclass
class UserUsageDetails (object):
    user_id: int = 0
    username: str = ""
    tokens: UsageDetailsForDay = field(default_factory=UsageDetailsForDay)
    requests: UsageDetailsForDay = field(default_factory=UsageDetailsForDay)


class UserAPIKey (BaseModel):
    key: str


@dataclass
class ModelInfo (object):
    id: str
    name: str = ""  # display_name
    context_length: Optional[int] = None  # context_window / max_allowed_size
    max_output_tokens: Optional[int] = None
    input_modalities: Optional[list[Modalities]] = None  # supports_images
    output_modalities: Optional[list[Modalities]] = None
    supported_levels: Optional[list[SupportedLevels]] = None  # effort.supported_levels / reasoning_supported_efforts // supports_reasoning
    default_level: Optional[SupportedLevels] = None  # effort.default_level / reasoning_default_effort
    owned_by: str = ""
    created: int = 1753600000
    object: str = "model"

