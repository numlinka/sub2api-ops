#
#

__all__ = []

# local
from typeins import ModelInfo
from typeins import Modalities as ML
from typeins import SupportedLevels as SL


K = 1024


MODEL_INFO_LIST = [
    # ================================ DeepSeek ================================
    ModelInfo(
        "deepseek-v4-flash", "DeepSeek V4 Flash",                               # ! Remove from sale
        1024*K, 384*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-v4-pro", "DeepSeek V4 Pro",
        1024*K, 384*K,
        [ML.TEXT], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-flash", "DeepSeek Flash",
        1024*K, 384*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-v4.1-flash", "DeepSeek V4.1 Flash",
        1024*K, 384*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    ModelInfo(
        "deepseek-v4.1-flash-economy", "DeepSeek V4.1 Flash Economy",           # ? VolcEngine only
        1024*K, 384*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    # ================================== GLM ===================================
    ModelInfo(
        "glm-5.3-flash", "GLM 5.3 Flash",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.MAX
    ),
    ModelInfo(
        "glm-5.3", "GLM 5.3",
        1024*K, 128*K,
        [ML.TEXT], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.MAX
    ),
    # ================================== Kimi ==================================
    ModelInfo(
        "kimi-k2.7-code", "Kimi K2.7 Code",                                     # ! Remove from sale
        256*K, 32*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "kimi-k3", "Kimi K3",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.MAX
    ),
    ModelInfo(
        "kimi-k2.8-preview", "Kimi K2.8 Preview",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH, SL.MAX], SL.HIGH
    ),
    # ================================ MiniMax =================================
    ModelInfo(
        "minimax-m3", "MiniMax M3",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "minimax-m3.1-flash", "MiniMax M3.1 Flash",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH, SL.MAX], SL.HIGH
    ),
    # ================================== Mimo ==================================
    ModelInfo(
        "mimo-v2.6-flash", "Mimo V2.6 Flash",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "mimo-v2.6-pro", "Mimo V2.6 Pro",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    ModelInfo(
        "mimo-v2.6-pro-ultraspeed", "Mimo V2.6 Pro UltraSpeed",
        1024*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT]
    ),
    # ================================= Doubao =================================
    ModelInfo(
        "doubao-seed-2.0-mini", "Doubao Seed 2.0 Mini",
        256*K, 128*K,
        [ML.TEXT, ML.IMAGE, ML.VIDEO, ML.AUDIO], [ML.TEXT]
    ),
    ModelInfo(
        "doubao-seed-2.1-lite", "Doubao Seed 2.1 Lite",
        1024*K, 256*K,
        [ML.TEXT, ML.IMAGE, ML.VIDEO, ML.AUDIO], [ML.TEXT]
    ),
    ModelInfo(
        "doubao-seed-2.1-pro", "Doubao Seed 2.1 Pro",
        1024*K, 256*K,
        [ML.TEXT, ML.IMAGE, ML.VIDEO, ML.AUDIO], [ML.TEXT]
    ),
    # ================================ HunYuan =================================
    ModelInfo(
        "hy3", "HunYuan 3",
        192*K, 64*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.HIGH], SL.HIGH
    ),
    ModelInfo(
        "hy4-preview", "HunYuan 4 Preview",                                     # ! Remove from sale
        960*K, 64*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.HIGH], SL.HIGH
    ),
    ModelInfo(
        "hy4std", "HunYuan 4 Standard",
        960*K, 64*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.HIGH], SL.HIGH
    ),
    ModelInfo(
        "hy4free", "HunYuan 4 Free",
        960*K, 64*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.HIGH], SL.HIGH
    ),
    # ================================== GPT ===================================
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
    # ================================== Grok ==================================
    ModelInfo(
        "grok-4.5", "Grok 4.5",
        1000000, None,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH], SL.HIGH
    ),
    ModelInfo(
        "grok-4.6", "Grok 4.6",
        500000, 500000,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH], SL.HIGH
    ),
    ModelInfo(
        "grok-4.7", "Grok 4.7",
        500000, 500000,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH], SL.HIGH
    ),
    # ================================== Step ==================================
    ModelInfo(
        "step-5-preview", "Step 5 Preview",
        1000*K, 64*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH], SL.HIGH
    ),
    # ! ============================== Anonymous ===============================
    ModelInfo(
        "space-bunny", "Space-Bunny",                                           # ? MiniMax M3.1 Flash
        1000*K, 128*K,
        [ML.TEXT, ML.IMAGE], [ML.TEXT],
        [SL.LOW, SL.MEDIUM, SL.HIGH, SL.XHIGH, SL.MAX], SL.HIGH
    )
]

MODELS_TABLE: dict[str, ModelInfo] = {model.id: model for model in MODEL_INFO_LIST}
