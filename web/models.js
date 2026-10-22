const form = document.querySelector("#query-form");
const keyInput = document.querySelector("#api-key");
const submitButton = document.querySelector("#submit-button");
const keyDialog = document.querySelector("#key-dialog");
const keyOpenButton = document.querySelector("#key-open-button");
const keyCloseButton = document.querySelector("#key-close-button");
const keyFeedback = document.querySelector("#key-feedback");
const feedback = document.querySelector("#feedback");
const refreshButton = document.querySelector("#refresh-button");
const results = document.querySelector("#results");
const modelsGrid = document.querySelector("#models-grid");
const emptyState = document.querySelector("#empty-state");
const modelCaption = document.querySelector("#model-caption");
const copyStatus = document.querySelector("#copy-status");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeColor = document.querySelector("#theme-color");
const exportOpenButton = document.querySelector("#export-open-button");
const selectionBar = document.querySelector("#selection-bar");
const selectionCount = document.querySelector("#selection-count");
const selectionAllButton = document.querySelector("#selection-all-button");
const selectionNoneButton = document.querySelector("#selection-none-button");
const selectionCancelButton = document.querySelector("#selection-cancel-button");
const selectionExportButton = document.querySelector("#selection-export-button");
const exportDialog = document.querySelector("#export-dialog");
const exportCloseButton = document.querySelector("#export-close-button");
const exportFormatGroup = document.querySelector("#export-format");
const exportDescription = document.querySelector("#export-description");
const exportUrlBox = document.querySelector(".export-url-box");
const exportUrlList = document.querySelector("#export-url-list");
const exportUrlInput = document.querySelector("#export-url");
const exportOutput = document.querySelector("#export-output");
const exportCopyButton = document.querySelector("#export-copy-button");
const exportFeedback = document.querySelector("#export-feedback");
const systemThemePreference = window.matchMedia("(prefers-color-scheme: dark)");
const numberFormat = new Intl.NumberFormat("zh-CN");
const modelsKeyCookie = "usageApiKey";
const modelsKeyCookieMaxAge = 60 * 60 * 24 * 30;
const defaultBaseUrl = "/v1";
const defaultContextWindow = 128000;
const defaultMaxOutputTokens = 64000;
let apiBaseUrls = [];
const modalityLabels = {
	text: "文本",
	image: "图像",
	audio: "音频",
	video: "视频",
	file: "文件",
	pdf: "PDF"
};
const formatConfigs = {
	copilot: {
		label: "Copilot",
		description: "以下 JSON 可直接用于 Copilot 的自定义模型配置。",
		build: (model, baseUrl) => buildCopilotConfig(model, baseUrl)
	}
};
let currentModels = [];
let selectionMode = false;
let selectedFormat = "copilot";
const selectedModelIds = new Set();
const cardElements = new Map();

function readCookie(name) {
	const prefix = `${name}=`;
	const cookie = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
	if (!cookie) return "";

	try {
		return decodeURIComponent(cookie.slice(prefix.length));
	} catch {
		return "";
	}
}

function saveKey(key) {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${modelsKeyCookie}=${encodeURIComponent(key)}; Max-Age=${modelsKeyCookieMaxAge}; Path=/; SameSite=Strict${secure}`;
	sessionStorage.removeItem(modelsKeyCookie);
}

function clearKey() {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${modelsKeyCookie}=; Max-Age=0; Path=/; SameSite=Strict${secure}`;
	sessionStorage.removeItem(modelsKeyCookie);
}

function getSavedKey() {
	const cookieKey = readCookie(modelsKeyCookie);
	if (cookieKey) return cookieKey;

	const legacyKey = sessionStorage.getItem(modelsKeyCookie) || "";
	if (legacyKey) saveKey(legacyKey);
	return legacyKey;
}

function setFeedback(message, kind = "") {
	feedback.textContent = message;
	feedback.dataset.kind = kind;
}

function setKeyFeedback(message, kind = "") {
	keyFeedback.textContent = message;
	keyFeedback.dataset.kind = kind;
}

function setExportFeedback(message, kind = "") {
	exportFeedback.textContent = message;
	exportFeedback.dataset.kind = kind;
}

function formatTokens(value) {
	return Number.isFinite(value) && value > 0 ? numberFormat.format(value) : "未标注";
}

function readModalities(value) {
	if (!Array.isArray(value)) return [];
	return value
		.filter((item) => typeof item === "string" && item)
		.map((item) => ({ key: item, label: modalityLabels[item] ?? item }));
}

function createChips(container, modalities, modifier) {
	if (modalities.length === 0) {
		const chip = document.createElement("span");
		chip.className = `chip ${modifier} is-empty`;
		chip.textContent = "未标注";
		container.append(chip);
		return;
	}

	modalities.forEach((modality) => {
		const chip = document.createElement("span");
		chip.className = `chip ${modifier}`;
		chip.textContent = modality.label;
		chip.title = modality.key;
		container.append(chip);
	});
}

function createMetaItem(label, value) {
	const item = document.createElement("div");
	item.className = "model-meta-item";

	const term = document.createElement("dt");
	term.textContent = label;
	const detail = document.createElement("dd");
	detail.textContent = value;

	item.append(term, detail);
	return item;
}

function createIoGroup(label, modalities, modifier) {
	const group = document.createElement("div");
	group.className = "model-io-group";

	const labelElement = document.createElement("span");
	labelElement.className = "model-io-label";
	labelElement.textContent = label;

	const chips = document.createElement("span");
	chips.className = "chip-list";
	createChips(chips, modalities, modifier);

	group.append(labelElement, chips);
	return group;
}

async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const field = document.createElement("textarea");
		field.value = text;
		field.setAttribute("readonly", "");
		field.style.position = "fixed";
		field.style.opacity = "0";
		document.body.append(field);
		field.select();
		const copied = document.execCommand("copy");
		field.remove();
		return copied;
	}
}

function readContextWindow(model) {
	const value = Number(model.context_window ?? model.context_length);
	return Number.isFinite(value) && value > 0 ? value : defaultContextWindow;
}

function readMaxOutputTokens(model) {
	const value = Number(model.max_output_tokens);
	return Number.isFinite(value) && value > 0 ? value : defaultMaxOutputTokens;
}

function readVision(model) {
	const inputs = readModalities(model.input_modalities).map((item) => item.key);
	if (inputs.length === 0) return true;
	return inputs.includes("image");
}

function readReasoningEfforts(model) {
	const levels = model.effort?.supported_levels ?? model.reasoning_supported_efforts;
	if (!Array.isArray(levels)) return [];
	return levels.filter((level) => typeof level === "string" && level);
}

function buildCopilotConfig(model, baseUrl) {
	const contextWindow = readContextWindow(model);
	const config = {
		id: String(model.id),
		name: String(model.name || model.display_name || model.id),
		url: baseUrl,
		toolCalling: true,
		vision: readVision(model),
		contextWindow,
		maxInputTokens: contextWindow,
		maxOutputTokens: readMaxOutputTokens(model)
	};
	const efforts = readReasoningEfforts(model);
	if (efforts.length > 0) config.supportsReasoningEffort = efforts;
	return config;
}

function updateSelectionUi() {
	cardElements.forEach((card, modelId) => {
		const selected = selectedModelIds.has(modelId);
		card.classList.toggle("is-selected", selected);
		if (selectionMode) card.setAttribute("aria-checked", String(selected));
		else card.removeAttribute("aria-checked");
	});
	selectionCount.textContent = `已选 ${numberFormat.format(selectedModelIds.size)} 个模型`;
	selectionExportButton.disabled = selectedModelIds.size === 0;
	selectionBar.hidden = !selectionMode;
	exportOpenButton.setAttribute("aria-pressed", String(selectionMode));
	exportOpenButton.textContent = selectionMode ? "退出生成" : "生成配置";
}

function setSelectionMode(enabled) {
	selectionMode = enabled;
	if (!enabled) selectedModelIds.clear();
	modelsGrid.classList.toggle("is-selecting", selectionMode);
	cardElements.forEach((card) => {
		card.tabIndex = selectionMode ? 0 : -1;
		if (selectionMode) {
			card.setAttribute("role", "checkbox");
			card.setAttribute("aria-checked", String(selectedModelIds.has(card.dataset.modelId)));
			card.setAttribute("aria-label", `选择模型 ${card.dataset.modelName}`);
		} else {
			card.removeAttribute("role");
			card.removeAttribute("aria-checked");
			card.removeAttribute("aria-label");
		}
	});
	updateSelectionUi();
}

function toggleModelSelection(modelId) {
	if (!selectionMode) return;
	if (selectedModelIds.has(modelId)) selectedModelIds.delete(modelId);
	else selectedModelIds.add(modelId);
	updateSelectionUi();
}

function createCard(model, index) {
	const modelId = String(model.id ?? "");
	const card = document.createElement("article");
	card.className = "model-card";
	card.style.animationDelay = `${Math.min(index * 30, 300)}ms`;
	card.dataset.modelId = modelId;
	card.dataset.modelName = String(model.name || model.display_name || modelId);
	card.tabIndex = -1;
	card.addEventListener("click", (event) => {
		if (event.target.closest?.(".copy-button")) return;
		toggleModelSelection(modelId);
	});
	card.addEventListener("keydown", (event) => {
		if (!selectionMode || (event.key !== " " && event.key !== "Enter")) return;
		event.preventDefault();
		toggleModelSelection(modelId);
	});

	const name = document.createElement("h3");
	name.className = "model-name";
	name.textContent = String(model.name || model.display_name || model.id || "未命名模型");
	name.title = name.textContent;
	card.append(name);

	const idRow = document.createElement("div");
	idRow.className = "model-id-row";

	const id = document.createElement("code");
	id.className = "model-id";
	id.textContent = modelId;
	id.title = id.textContent;

	const copyButton = document.createElement("button");
	copyButton.className = "copy-button";
	copyButton.type = "button";
	copyButton.textContent = "复制";
	copyButton.setAttribute("aria-label", `复制模型 ID ${id.textContent}`);
	copyButton.addEventListener("click", async (event) => {
		event.stopPropagation();
		if (!id.textContent) return;

		const copied = await copyText(id.textContent);
		copyButton.textContent = copied ? "已复制" : "复制失败";
		copyButton.classList.toggle("is-copied", copied);
		copyStatus.textContent = copied ? `已复制模型 ID ${id.textContent}` : `复制模型 ID ${id.textContent} 失败`;
		window.setTimeout(() => {
			copyButton.textContent = "复制";
			copyButton.classList.remove("is-copied");
		}, 1600);
	});

	idRow.append(id, copyButton);

	const meta = document.createElement("dl");
	meta.className = "model-meta";
	meta.append(
		createMetaItem("上下文窗口", formatTokens(Number(model.context_window ?? model.context_length))),
		createMetaItem("最大输出", formatTokens(Number(model.max_output_tokens)))
	);

	const io = document.createElement("div");
	io.className = "model-io";
	io.append(
		createIoGroup("输入", readModalities(model.input_modalities), "chip--input"),
		createIoGroup("输出", readModalities(model.output_modalities), "chip--output")
	);

	card.append(idRow, meta, io);
	return card;
}

function renderModels(models) {
	modelsGrid.replaceChildren();
	cardElements.clear();
	modelCaption.textContent = `共 ${numberFormat.format(models.length)} 个模型`;
	emptyState.hidden = models.length > 0;
	results.hidden = false;
	exportOpenButton.disabled = models.length === 0;

	models.forEach((model, index) => {
		const card = createCard(model, index);
		modelsGrid.append(card);
		cardElements.set(card.dataset.modelId, card);
	});

	setSelectionMode(false);
}

function normalizeBaseUrl(value) {
	const text = typeof value === "string" ? value.trim() : "";
	return text ? text.replace(/\/+$/, "") : "";
}

function readBaseUrl() {
	const value = exportUrlInput.value.trim();
	if (value) return normalizeBaseUrl(value);
	return apiBaseUrls[0] ?? defaultBaseUrl;
}

function buildUrlOptions() {
	exportUrlList.replaceChildren();
	if (apiBaseUrls.length === 0) return;

	apiBaseUrls.forEach((url, index) => {
		const item = document.createElement("li");
		item.className = "export-url-option";
		item.id = `export-url-option-${index}`;
		item.setAttribute("role", "option");
		item.dataset.value = url;
		item.textContent = url;
		exportUrlList.append(item);
	});
}

let highlightedUrlIndex = -1;

function urlOptions() {
	return [...exportUrlList.querySelectorAll(".export-url-option")];
}

function setHighlightedUrl(index) {
	const options = urlOptions();
	if (options.length === 0) {
		highlightedUrlIndex = -1;
		return;
	}

	const next = Math.min(Math.max(index, -1), options.length - 1);
	highlightedUrlIndex = next;
	options.forEach((option, position) => {
		const active = position === next;
		option.classList.toggle("is-highlighted", active);
		option.setAttribute("aria-selected", String(active));
		if (active) {
			exportUrlInput.setAttribute("aria-activedescendant", option.id || "");
			option.scrollIntoView({ block: "nearest" });
		}
	});
	if (next < 0) exportUrlInput.removeAttribute("aria-activedescendant");
}

function isUrlListOpen() {
	return !exportUrlList.hidden;
}

function openUrlList() {
	if (apiBaseUrls.length === 0 || isUrlListOpen()) return;
	exportUrlList.hidden = false;
	exportUrlInput.setAttribute("aria-expanded", "true");
	exportUrlBox.classList.add("is-open");
	const current = normalizeBaseUrl(exportUrlInput.value);
	const matchIndex = apiBaseUrls.indexOf(current);
	setHighlightedUrl(matchIndex);
}

function closeUrlList() {
	if (!isUrlListOpen()) return;
	exportUrlList.hidden = true;
	exportUrlInput.setAttribute("aria-expanded", "false");
	exportUrlBox.classList.remove("is-open");
	highlightedUrlIndex = -1;
	urlOptions().forEach((option) => {
		option.classList.remove("is-highlighted");
		option.setAttribute("aria-selected", "false");
	});
	exportUrlInput.removeAttribute("aria-activedescendant");
}

function chooseUrl(value) {
	const url = normalizeBaseUrl(value);
	closeUrlList();
	if (!url) return;
	exportUrlInput.value = url;
	renderExportConfig();
}

async function loadApiBaseUrl() {
	try {
		const response = await fetch("/api/base-url", { headers: { Accept: "application/json" } });
		if (!response.ok) return;

		const payload = await response.json();
		const list = Array.isArray(payload) ? payload : [payload];
		const urls = [...new Set(list.map(normalizeBaseUrl).filter(Boolean))];
		if (urls.length === 0) return;

		apiBaseUrls = urls;
		exportUrlInput.placeholder = defaultBaseUrl;
		if (!exportUrlInput.value.trim()) exportUrlInput.value = urls[0];
		buildUrlOptions();
		if (exportDialog.open) renderExportConfig();
	} catch {
		// 后端不可用时沿用输入框内的地址。
	}
}

function renderExportConfig() {
	const baseUrl = readBaseUrl();
	const build = formatConfigs[selectedFormat]?.build ?? formatConfigs.copilot.build;
	const configs = currentModels
		.filter((model) => selectedModelIds.has(String(model.id)))
		.map((model) => build(model, baseUrl));
	exportOutput.value = JSON.stringify(configs, null, 4);
	exportCopyButton.disabled = configs.length === 0;
	setExportFeedback("");
}

function openExportDialog() {
	if (selectedModelIds.size === 0) return;
	renderExportConfig();
	if (!exportDialog.open) exportDialog.showModal();
}

function updateTheme(theme, persist = false) {
	document.documentElement.dataset.theme = theme;
	const nextThemeLabel = theme === "dark" ? "亮色" : "暗色";
	themeIcon.textContent = theme === "dark" ? "☀" : "☾";
	themeToggle.setAttribute("aria-label", `切换到${nextThemeLabel}模式`);
	themeToggle.title = `切换到${nextThemeLabel}模式`;
	themeColor.content = theme === "dark" ? "#171e19" : "#f3f5f0";
	if (persist) localStorage.setItem("themePreference", theme);
}

function openKeyDialog(message = "") {
	setKeyFeedback(message, message ? "error" : "");
	if (!keyDialog.open) keyDialog.showModal();
	keyInput.focus();
}

updateTheme(document.documentElement.dataset.theme || "light");

async function queryModels(key) {
	submitButton.disabled = true;
	submitButton.textContent = "查询中...";
	refreshButton.disabled = true;
	setFeedback("正在获取可用模型...");
	setKeyFeedback("正在校验 Key...");

	try {
		const authorization = /^Bearer\s/i.test(key) ? key : `Bearer ${key}`;
		const response = await fetch("/v1/models", {
			headers: {
				Accept: "application/json",
				Authorization: authorization
			}
		});

		if (response.status === 401 || response.status === 403) {
			clearKey();
			keyInput.value = "";
			keyOpenButton.textContent = "输入 Key";
			setFeedback("Key 无效，请重新输入。", "error");
			openKeyDialog("Key 无效，请检查后重新输入。");
			return;
		}
		if (!response.ok) throw new Error(`请求失败（${response.status}），请稍后重试。`);

		const payload = await response.json();
		const models = Array.isArray(payload) ? payload : payload?.data;
		if (!Array.isArray(models)) throw new Error("接口返回格式异常，请联系管理员。");

		const visibleModels = models.filter((model) => model && typeof model === "object" && model.id);
		saveKey(key);
		currentModels = visibleModels;
		renderModels(currentModels);
		keyOpenButton.textContent = "更换 Key";
		if (keyDialog.open) keyDialog.close();
		setKeyFeedback("");
		setFeedback(`已更新 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`, "success");
	} catch (error) {
		const message = error instanceof Error ? error.message : "请求失败，请稍后重试。";
		setFeedback(message, "error");
		setKeyFeedback(message, "error");
	} finally {
		submitButton.disabled = false;
		submitButton.textContent = "查询模型";
		refreshButton.disabled = false;
	}
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const key = keyInput.value.trim();
	if (key) queryModels(key);
});

keyOpenButton.addEventListener("click", () => openKeyDialog());
keyCloseButton.addEventListener("click", () => keyDialog.close());

refreshButton.addEventListener("click", () => {
	const savedKey = getSavedKey();
	if (savedKey) queryModels(savedKey);
	else openKeyDialog("请输入有效 Key 后刷新模型列表。");
});

themeToggle.addEventListener("click", () => {
	const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
	updateTheme(nextTheme, true);
});

exportOpenButton.addEventListener("click", () => {
	setSelectionMode(!selectionMode);
	setFeedback(selectionMode ? "请选择需要生成配置的模型，然后点击「生成配置」。" : "已退出生成配置。");
});

selectionAllButton.addEventListener("click", () => {
	if (!selectionMode) return;
	currentModels.forEach((model) => selectedModelIds.add(String(model.id)));
	updateSelectionUi();
});

selectionNoneButton.addEventListener("click", () => {
	if (!selectionMode) return;
	selectedModelIds.clear();
	updateSelectionUi();
});

selectionCancelButton.addEventListener("click", () => {
	setSelectionMode(false);
	setFeedback("已取消生成配置。");
});

selectionExportButton.addEventListener("click", openExportDialog);
exportCloseButton.addEventListener("click", () => exportDialog.close());

exportUrlInput.addEventListener("input", () => {
	renderExportConfig();
	if (isUrlListOpen()) setHighlightedUrl(-1);
});

exportUrlInput.addEventListener("focus", () => {
	if (apiBaseUrls.length > 0) openUrlList();
});

exportUrlInput.addEventListener("click", () => {
	if (apiBaseUrls.length > 0) openUrlList();
});

exportUrlInput.addEventListener("keydown", (event) => {
	const options = urlOptions();
	if (event.key === "ArrowDown" || event.key === "ArrowUp") {
		if (!isUrlListOpen()) openUrlList();
		if (options.length === 0) return;
		event.preventDefault();
		const step = event.key === "ArrowDown" ? 1 : -1;
		const start = highlightedUrlIndex < 0 ? (step > 0 ? -1 : 0) : highlightedUrlIndex;
		setHighlightedUrl(start + step);
		return;
	}
	if (event.key === "Enter" && isUrlListOpen() && highlightedUrlIndex >= 0) {
		event.preventDefault();
		chooseUrl(options[highlightedUrlIndex].dataset.value);
		return;
	}
	if (event.key === "Escape" && isUrlListOpen()) {
		event.preventDefault();
		closeUrlList();
	}
});

exportUrlInput.addEventListener("blur", () => {
	exportUrlInput.value = readBaseUrl();
	closeUrlList();
	renderExportConfig();
});

exportUrlList.addEventListener("mousedown", (event) => {
	// 用 mousedown 抢在输入框 blur 之前完成选择。
	const option = event.target.closest?.(".export-url-option");
	if (!option) return;
	event.preventDefault();
	chooseUrl(option.dataset.value);
	exportUrlInput.focus();
});

document.addEventListener("pointerdown", (event) => {
	if (isUrlListOpen() && !event.target.closest?.(".export-url-box")) closeUrlList();
});

exportFormatGroup.addEventListener("click", (event) => {
	const button = event.target.closest?.(".format-button");
	if (!button || button.disabled) return;
	const format = button.dataset.format;
	if (!format || !formatConfigs[format] || format === selectedFormat) return;
	selectedFormat = format;
	exportFormatGroup.querySelectorAll(".format-button").forEach((item) => {
		const active = item === button;
		item.classList.toggle("is-active", active);
		item.setAttribute("aria-pressed", String(active));
	});
	exportDescription.textContent = formatConfigs[selectedFormat].description;
	renderExportConfig();
});

exportCopyButton.addEventListener("click", async () => {
	const copied = await copyText(exportOutput.value);
	setExportFeedback(copied ? "已复制配置到剪贴板。" : "复制失败，请手动选中文本复制。", copied ? "success" : "error");
	exportCopyButton.textContent = copied ? "已复制" : "复制配置";
	window.setTimeout(() => { exportCopyButton.textContent = "复制配置"; }, 1600);
});

systemThemePreference.addEventListener("change", (event) => {
	if (!localStorage.getItem("themePreference")) {
		updateTheme(event.matches ? "dark" : "light");
	}
});

const savedKey = getSavedKey();
loadApiBaseUrl();
if (savedKey) {
	keyInput.value = savedKey;
	queryModels(savedKey);
} else {
	openKeyDialog();
}
