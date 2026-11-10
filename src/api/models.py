#
#

# std
import json

# local
from fastapi import Request, Response
from basic import app, httpclient
from constants import ADMIN_BASE_URL

# internal
from .models_info import MODELS_TABLE


@app.get("/models")
@app.get("/v1/models")
async def models(request: Request):
    """
    获取模型列表

    修复 Sub2API ``/models`` 端点返回的信息太少的问题
    """
    headers: dict[str, str] = {}
    if authorization := request.headers.get("authorization"):
        headers["authorization"] = authorization

    response = await httpclient.get(
        f"{ADMIN_BASE_URL}/v1/models",
        params=request.query_params,
        headers=headers,
    )

    if response.status_code != 200:
        return Response(
            content=response.content,
            status_code=response.status_code,
            media_type=response.headers.get("content-type"),
        )

    jsondata = response.json()
    
    for _, model in enumerate(jsondata["data"]):
        model_info = MODELS_TABLE.get(model["id"])
        if not model_info: continue

        model["name"] = model_info.name
        model["display_name"] = model_info.name

        if model_info.context_length:
            model["context_length"] = model_info.context_length
            model["context_window"] = model_info.context_length
            model["max_allowed_size"] = model_info.context_length

        if model_info.max_output_tokens:
            model["max_output_tokens"] = model_info.max_output_tokens

        if model_info.input_modalities:
            model["input_modalities"] = model_info.input_modalities

        if model_info.output_modalities:
            model["output_modalities"] = model_info.output_modalities

        if model_info.supported_levels:
            model["effort"] = {}
            model["effort"]["supported_levels"] = model_info.supported_levels
            model["reasoning_supported_efforts"] = model_info.supported_levels

            if model_info.default_level:
                model["effort"]["default_level"] = model_info.default_level
                model["reasoning_effort"] = model_info.default_level

        model["object"] = "model"
        model["type"] = "model"

    return Response(
        content=json.dumps(jsondata),
        status_code=200,
        media_type=response.headers.get("content-type"),
    )


def initial():
    ...
