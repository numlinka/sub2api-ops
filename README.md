# Sub2API Ops

Sub2API 的运维面板：查看用户用量、查看模型目录、导出 Copilot 模型配置。

## 环境要求

- Python 3.11+
- 已部署的 Sub2API 实例及其管理员 Key

## 安装

```bash
python -m venv .venv
.venv\Scripts\activate        # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
```

## 配置

通过环境变量传入，`base_url` 与 `admin_key` 必填：

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `base_url` | 是 | - | Sub2API 地址，如 `https://sub2api.example.com` |
| `admin_key` | 是 | - | Sub2API 管理员 Key |
| `server_host` | 否 | `127.0.0.1` | 监听地址 |
| `server_port` | 否 | `8123` | 监听端口 |
| `debug_mode` | 否 | `false` | 为 `true` 时开启 `/docs` |

缺少 `base_url` 或 `admin_key` 会直接退出。

## 运行

```bash
python src/main.py
```

打开 <http://127.0.0.1:8123>。

## 页面

| 路径 | 说明 |
| --- | --- |
| `/` | 用户用量排行，按 Token / 请求数、今日 / 昨日 / 总量查看 |
| `/models.html` | 当前 Key 可用的模型卡片，可导出 Copilot 模型配置 |

两个页面共用浏览器 Cookie `usageApiKey` 保存的 Key，有效期 30 天。Key 无效时接口返回 403 并重新要求输入。

## 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/v1/models` | 透传 Sub2API `/v1/models`，补充名称、上下文窗口、最大输出、模态等字段 |
| `POST` | `/api/users-usage` | 按 Key 对应的用户组返回组内用量，请求体 `{"key": "..."}` |

后台每 5 分钟拉取一次用户与用量数据并缓存。

## 目录结构

```
src/
  main.py          入口
  core.py          启动流程
  basic.py         FastAPI app 与 HTTP 客户端
  constants.py     环境变量与请求头
  api/             后端接口（models、users_usage）
  typeins/         类型定义
  web/             静态文件与首页路由
web/               前端页面、样式、脚本
```

前端为原生 HTML/CSS/JS，无构建步骤，`web/` 直接由后端静态挂载。
