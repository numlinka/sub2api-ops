#
#

# std
import json

# local
from fastapi import Request, Response

from basic import app, httpclient
from typeins import ModelInfo
from typeins import Modalities as ML
from typeins import SupportedLevels as SL
from constants import ADMIN_BASE_URL


MODEL_INFO_LIST = [
    ModelInfo(
        "deepseek-flash", "DeepSeek Flash",
        1024*1024, 384*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-v4.1-flash", "DeepSeek V4.1 Flash",
        1024*1024, 384*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-v4.1-flash-economy", "DeepSeek V4.1 Flash Economy",
        1024*1024, 384*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-v4-pro", "DeepSeek V4 Pro",
        1024*1024, 384*1024,
        [ML.TEXT], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "glm-5.3-flash", "GLM 5.3 Flash",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.MAX
    ),
    ModelInfo(
        "glm-5.3", "GLM 5.3",
        1024*1024, 128*1024,
        [ML.TEXT], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.MAX
    ),
    ModelInfo(
        "kimi-k3", "Kimi K3",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.MAX
    ),
    ModelInfo(
        "kimi-k2.8-preview", "Kimi K2.8 Preview",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "kimi-k2.7-code", "Kimi K2.7 Code",
        256*1024, 32*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "minimax-m3", "Minimax M3",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "mimo-v2.6-flash", "Mimo V2.6 Flash",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "mimo-v2.6-pro", "Mimo V2.6 Pro",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "mimo-v2.6-pro-ultraspeed", "Mimo V2.6 Pro UltraSpeed",
        1024*1024, 128*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "hy4-preview", "Hy4 Preview",
        1024*1024, 64*1024,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "gpt-6-astra", "GPT-6 Astra",
        1050000, 128000,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH, SL.MAX]
    ),
    ModelInfo(
        "gpt-6.1-sol", "GPT-6.1 Sol",
        1050000, 128000,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.NONE, SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH, SL.MAX], SL.MEDIUM
    ),
    ModelInfo(
        "grok-4.7", "Grok 4.7",
        500000, None,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH], SL.HIGH
    )
]

MODELS_TABLE: dict[str, ModelInfo] = {model.id: model for model in MODEL_INFO_LIST}


@app.get("/v1/models")
async def models(request: Request):
    """
    获取模型列表

    修复 Sub2API ``/models`` 端点返回的信息太少的问题
    """
    headers = {}
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
