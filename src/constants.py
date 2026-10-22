#
#

__all__ = []

# std
import os


HOST = os.environ.get("server_host", "127.0.0.1")
PORT = int(os.environ.get("server_port", 8123))

ADMIN_BASE_URL = os.environ.get("admin_base_url", None)
ADMIN_KEY = os.environ.get("admin_key", None)
API_BASE_URL = os.environ.get("api_base_url", None)

DEBUG_MODE = os.environ.get("debug_mode", "false").lower() == "true"


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome",
    "x-api-key": ADMIN_KEY
}
