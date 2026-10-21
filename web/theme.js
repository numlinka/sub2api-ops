let savedTheme = null;

try {
	savedTheme = localStorage.getItem("themePreference");
} catch {
	// Fall back to the system preference when browser storage is unavailable.
}

const initialTheme = savedTheme === "light" || savedTheme === "dark"
	? savedTheme
	: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

document.documentElement.dataset.theme = initialTheme;