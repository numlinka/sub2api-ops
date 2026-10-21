#
#

# site
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# internal
from basic import app


@app.get("/")
async def index() -> FileResponse:
    """index file"""
    return FileResponse("web/index.html")


def initial_static_files():
    app.mount("/", StaticFiles(directory="web"), name="/")


def initial():
    initial_static_files()
