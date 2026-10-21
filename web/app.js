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
const usageList = document.querySelector("#usage-list");
const emptyState = document.querySelector("#empty-state");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeColor = document.querySelector("#theme-color");
const metricTotalLabel = document.querySelector("#metric-total-label");
const metricTotal = document.querySelector("#metric-total");
const topUserLabel = document.querySelector("#top-user-label");
const rangeCaption = document.querySelector("#range-caption");
const rangeButtons = [...document.querySelectorAll(".range-button")];
const metricButtons = [...document.querySelectorAll(".metric-button")];
const systemThemePreference = window.matchMedia("(prefers-color-scheme: dark)");
const numberFormat = new Intl.NumberFormat("zh-CN");
const percentFormat = new Intl.NumberFormat("zh-CN", {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});
const usageKeyCookie = "usageApiKey";
const usageKeyCookieMaxAge = 60 * 60 * 24 * 30;
const segmentTooltip = document.createElement("div");
segmentTooltip.className = "segment-tooltip";
segmentTooltip.hidden = true;
segmentTooltip.setAttribute("role", "tooltip");
document.body.append(segmentTooltip);
const metricConfig = {
	tokens: {
		unit: "tokens",
		tooltipLabel: "Tokens",
		topUserLabel: "Token 最高",
		rangeLabels: {
			total: { metric: "Token 总量", caption: "按总 Token 用量从高到低" },
			yesterday: { metric: "昨日 Token", caption: "按昨日 Token 用量从高到低" },
			today: { metric: "今日 Token", caption: "按今日 Token 用量从高到低" }
		}
	},
	requests: {
		unit: "requests",
		tooltipLabel: "请求数",
		topUserLabel: "请求数最高",
		rangeLabels: {
			total: { metric: "请求总数", caption: "按总请求数从高到低" },
			yesterday: { metric: "昨日请求数", caption: "按昨日请求数从高到低" },
			today: { metric: "今日请求数", caption: "按今日请求数从高到低" }
		}
	}
};
let selectedRange = "total";
let selectedMetric = "tokens";
let currentUsers = [];
let hoveredSegment = null;
let focusedSegment = null;

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

function saveUsageKey(key) {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${usageKeyCookie}=${encodeURIComponent(key)}; Max-Age=${usageKeyCookieMaxAge}; Path=/; SameSite=Strict${secure}`;
	sessionStorage.removeItem(usageKeyCookie);
}

function clearUsageKey() {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${usageKeyCookie}=; Max-Age=0; Path=/; SameSite=Strict${secure}`;
	sessionStorage.removeItem(usageKeyCookie);
}

function getSavedUsageKey() {
	const cookieKey = readCookie(usageKeyCookie);
	if (cookieKey) return cookieKey;

	const legacyKey = sessionStorage.getItem(usageKeyCookie) || "";
	if (legacyKey) saveUsageKey(legacyKey);
	return legacyKey;
}

function updateSegmentTooltip() {
	const segment = hoveredSegment || focusedSegment;
	if (!segment?.isConnected) {
		segmentTooltip.hidden = true;
		return;
	}

	segmentTooltip.replaceChildren();
	const period = document.createElement("strong");
	period.className = "tooltip-period";
	period.textContent = segment.dataset.period;
	segmentTooltip.append(period);

	[
		[segment.dataset.metricLabel, numberFormat.format(Number(segment.dataset.amount))],
		["阶段占比", `${segment.dataset.dayShare}%`],
		["总量占比", `${segment.dataset.totalShare}%`]
	].forEach(([label, value]) => {
		const labelElement = document.createElement("span");
		labelElement.className = "tooltip-label";
		labelElement.textContent = label;
		const valueElement = document.createElement("span");
		valueElement.className = "tooltip-value";
		valueElement.textContent = value;
		segmentTooltip.append(labelElement, valueElement);
	});
	segmentTooltip.hidden = false;
	const segmentBounds = segment.getBoundingClientRect();
	const tooltipWidth = segmentTooltip.offsetWidth;
	const tooltipHeight = segmentTooltip.offsetHeight;
	const centeredLeft = segmentBounds.left + segmentBounds.width / 2 - tooltipWidth / 2;
	const left = Math.min(Math.max(centeredLeft, 8), window.innerWidth - tooltipWidth - 8);
	segmentTooltip.style.left = `${left}px`;
	segmentTooltip.style.top = `${Math.max(8, segmentBounds.top - tooltipHeight - 8)}px`;
}

function setFeedback(message, kind = "") {
	feedback.textContent = message;
	feedback.dataset.kind = kind;
}

function setKeyFeedback(message, kind = "") {
	keyFeedback.textContent = message;
	keyFeedback.dataset.kind = kind;
}

function createCell(className, text) {
	const element = document.createElement("span");
	element.className = className;
	element.textContent = text;
	return element;
}

function readMetric(value) {
	const source = value && typeof value === "object" ? value : {};
	return {
		total: Number(source.total) || 0,
		yesterday: Number(source.yesterday) || 0,
		today: Number(source.today) || 0
	};
}

function renderUsers(users) {
	const config = metricConfig[selectedMetric];
	const sortedUsers = users
		.map((user) => ({
			username: String(user.username ?? "未命名用户"),
			tokens: readMetric(user.tokens),
			requests: readMetric(user.requests)
		}))
		.sort((left, right) => right[selectedMetric][selectedRange] - left[selectedMetric][selectedRange]);
	const sumBy = (range) => sortedUsers.reduce((total, user) => total + user[selectedMetric][range], 0);
	const totalValue = sumBy(selectedRange);
	const overallValue = sumBy("total");
	const yesterdayValue = sumBy("yesterday");
	const todayValue = sumBy("today");
	const olderValue = sortedUsers.reduce(
		(total, user) => total + Math.max(user[selectedMetric].total - user[selectedMetric].yesterday - user[selectedMetric].today, 0),
		0
	);

	document.querySelector("#user-count").textContent = numberFormat.format(sortedUsers.length);
	metricTotal.textContent = numberFormat.format(totalValue);
	document.querySelector("#top-user").textContent = sortedUsers[0]?.username ?? "-";
	metricTotalLabel.textContent = config.rangeLabels[selectedRange].metric;
	topUserLabel.textContent = config.topUserLabel;
	rangeCaption.textContent = config.rangeLabels[selectedRange].caption;
	hoveredSegment = null;
	focusedSegment = null;
	segmentTooltip.hidden = true;
	usageList.replaceChildren();
	emptyState.hidden = sortedUsers.length > 0;

	sortedUsers.forEach((user, index) => {
		const metricValues = user[selectedMetric];
		const selectedValue = metricValues[selectedRange];
		const share = totalValue > 0 ? (selectedValue / totalValue) * 100 : 0;
		const row = document.createElement("article");
		row.className = "usage-row";
		row.style.animationDelay = `${Math.min(index * 35, 350)}ms`;

		const top = document.createElement("div");
		top.className = "row-top";
		top.append(createCell("rank", String(index + 1).padStart(2, "0")));
		top.append(createCell("username", user.username));

		const amount = document.createElement("div");
		amount.className = "row-amount";
		amount.append(createCell("row-percent", `${percentFormat.format(share)}%`));
		amount.append(createCell("row-value", `${numberFormat.format(selectedValue)} ${config.unit}`));
		top.append(amount);

		const track = document.createElement("div");
		track.className = "bar-track";
		track.setAttribute("role", "progressbar");
		track.setAttribute("aria-label", `${user.username} 的${config.rangeLabels[selectedRange].metric}占比`);
		track.setAttribute("aria-valuemin", "0");
		track.setAttribute("aria-valuemax", "100");
		track.setAttribute("aria-valuenow", String(Math.round(share * 10) / 10));

		const fill = document.createElement("div");
		fill.className = "bar-fill";
		fill.style.width = `${share}%`;

		const segments = selectedRange === "total"
			? [
				["older", Math.max(metricValues.total - metricValues.yesterday - metricValues.today, 0), olderValue],
				["yesterday", metricValues.yesterday, yesterdayValue],
				["today", metricValues.today, todayValue]
			]
			: [[selectedRange, selectedValue, selectedRange === "today" ? todayValue : yesterdayValue]];
		segments.forEach(([range, value, periodTotal]) => {
			const segment = document.createElement("span");
			segment.className = `bar-segment bar-segment--${range}`;
			segment.style.flexGrow = String(value);
			const rangeName = range === "older" ? "更早" : range === "today" ? "当日" : "昨日";
			const dayShare = periodTotal > 0 ? (value / periodTotal) * 100 : 0;
			const totalShare = overallValue > 0 ? (value / overallValue) * 100 : 0;
			segment.dataset.period = rangeName;
			segment.dataset.metricLabel = config.tooltipLabel;
			segment.dataset.amount = String(value);
			segment.dataset.dayShare = percentFormat.format(dayShare);
			segment.dataset.totalShare = percentFormat.format(totalShare);
			segment.setAttribute("aria-label", `${rangeName}, ${numberFormat.format(value)} ${config.unit}, ${segment.dataset.dayShare}% 时段占比, ${segment.dataset.totalShare}% 总量占比`);
			segment.tabIndex = 0;
			fill.append(segment);
		});

		track.append(fill);

		const barLine = document.createElement("div");
		barLine.className = "bar-line";
		barLine.append(track);
		row.append(top, barLine);
		usageList.append(row);
	});

	results.hidden = false;
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

updateTheme(document.documentElement.dataset.theme || "light");

async function queryUsage(key) {
	submitButton.disabled = true;
	submitButton.textContent = "查询中...";
	refreshButton.disabled = true;
	setFeedback("正在获取用户用量...");
	setKeyFeedback("正在校验 Key...");

	try {
		const response = await fetch("/api/users-usage", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ key })
		});

		if (response.status === 403) {
			clearUsageKey();
			keyInput.value = "";
			keyOpenButton.textContent = "输入 Key";
			setKeyFeedback("Key 无效，请检查后重新输入。", "error");
			setFeedback("Key 无效，请重新输入。", "error");
			if (!keyDialog.open) keyDialog.showModal();
			keyInput.focus();
			return;
		}
		if (!response.ok) throw new Error(`请求失败（${response.status}），请稍后重试。`);

		const users = await response.json();
		if (!Array.isArray(users)) throw new Error("接口返回格式异常，请联系管理员。");

		saveUsageKey(key);
		currentUsers = users;
		renderUsers(currentUsers);
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
		submitButton.textContent = "查询用量";
		refreshButton.disabled = false;
	}
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const key = keyInput.value.trim();
	if (key) queryUsage(key);
});

keyOpenButton.addEventListener("click", () => {
	setKeyFeedback("");
	keyDialog.showModal();
	keyInput.focus();
});

keyCloseButton.addEventListener("click", () => keyDialog.close());

refreshButton.addEventListener("click", () => {
	const savedKey = getSavedUsageKey();
	if (savedKey) queryUsage(savedKey);
	else {
		setKeyFeedback("请输入有效 Key 后刷新用量。", "error");
		keyDialog.showModal();
		keyInput.focus();
	}
});

themeToggle.addEventListener("click", () => {
	const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
	updateTheme(nextTheme, true);
});

document.addEventListener("pointerover", (event) => {
	const segment = event.target.closest?.(".bar-segment");
	if (segment) {
		hoveredSegment = segment;
		updateSegmentTooltip();
	}
});

document.addEventListener("pointerout", (event) => {
	const segment = event.target.closest?.(".bar-segment");
	const nextSegment = event.relatedTarget?.closest?.(".bar-segment");
	if (segment && segment !== nextSegment && segment === hoveredSegment) {
		hoveredSegment = null;
		updateSegmentTooltip();
	}
});

document.addEventListener("focusin", (event) => {
	focusedSegment = event.target.closest?.(".bar-segment") || focusedSegment;
	updateSegmentTooltip();
});

document.addEventListener("focusout", (event) => {
	const segment = event.target.closest?.(".bar-segment");
	if (segment === focusedSegment) {
		focusedSegment = event.relatedTarget?.closest?.(".bar-segment") || null;
		updateSegmentTooltip();
	}
});

window.addEventListener("resize", updateSegmentTooltip);
window.addEventListener("scroll", updateSegmentTooltip, true);

systemThemePreference.addEventListener("change", (event) => {
	if (!localStorage.getItem("themePreference")) {
		updateTheme(event.matches ? "dark" : "light");
	}
});

function updateHeading() {
	const config = metricConfig[selectedMetric];
	metricTotalLabel.textContent = config.rangeLabels[selectedRange].metric;
	topUserLabel.textContent = config.topUserLabel;
	rangeCaption.textContent = config.rangeLabels[selectedRange].caption;
}

function syncSwitchGroup(buttons, activeButton) {
	buttons.forEach((button) => {
		const isSelected = button === activeButton;
		button.classList.toggle("is-active", isSelected);
		button.setAttribute("aria-pressed", String(isSelected));
	});
}

rangeButtons.forEach((button) => {
	button.addEventListener("click", () => {
		selectedRange = button.dataset.range;
		syncSwitchGroup(rangeButtons, button);
		if (currentUsers.length > 0) renderUsers(currentUsers);
		else updateHeading();
	});
});

metricButtons.forEach((button) => {
	button.addEventListener("click", () => {
		selectedMetric = button.dataset.metric;
		syncSwitchGroup(metricButtons, button);
		if (currentUsers.length > 0) renderUsers(currentUsers);
		else updateHeading();
	});
});

const savedKey = getSavedUsageKey();
if (savedKey) {
	keyInput.value = savedKey;
	queryUsage(savedKey);
} else {
	keyDialog.showModal();
}