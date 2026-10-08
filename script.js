const RELEASE_DATE = new Date(2026, 10, 4, 0, 0, 0);

const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMins = document.getElementById("cd-mins");
const cdSecs = document.getElementById("cd-secs");

let countdownTimer = null;

function pad2(n) {
	return String(n).padStart(2, "0");
}

function updateCountdown() {
	const diff = RELEASE_DATE - new Date();

	if (diff <= 0) {
		cdDays.textContent = "00";
		cdHours.textContent = "00";
		cdMins.textContent = "00";
		cdSecs.textContent = "00";
		document.querySelector(".countdown-label").textContent = "SUSHIAMO IS OUT NOW!";
		clearInterval(countdownTimer);
		return;
	}

	const totalSeconds = Math.floor(diff / 1000);
	cdDays.textContent = pad2(Math.floor(totalSeconds / 86400));
	cdHours.textContent = pad2(Math.floor((totalSeconds % 86400) / 3600));
	cdMins.textContent = pad2(Math.floor((totalSeconds % 3600) / 60));
	cdSecs.textContent = pad2(totalSeconds % 60);
}

if (cdDays) {
	updateCountdown();
	countdownTimer = setInterval(updateCountdown, 1000);
}

const counterEl = document.getElementById("visitor-counter");
if (counterEl) {
	const key = "sushiamo_visits";
	let visits = 1;

	// storage can throw exception, put a fake number
	try {
		const stored = window.localStorage.getItem(key);
		if (stored) visits = parseInt(stored, 10) + 1;
		window.localStorage.setItem(key, String(visits));
	} catch (e) {
		visits = Math.floor(Math.random() * 9000) + 1000;
	}

	const shown = visits + 10437;
	counterEl.textContent = String(shown).padStart(7, "0");
}

function copyToClipboard(text, done) {
	function finish() {
		if (done) done();
	}

	function fallback() {
		const tmp = document.createElement("textarea");
		tmp.value = text;
		tmp.style.position = "fixed";
		tmp.style.opacity = "0";
		document.body.appendChild(tmp);
		tmp.select();
		try {
			document.execCommand("copy");
		} catch (e) {
			// idk it doesn't matter
		}
		tmp.remove();
		finish();
	}

	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).then(finish, fallback);
	} else {
		fallback();
	}
}

const copyEl = document.querySelector(".copy-email");
if (copyEl) {
	const statusEl = document.querySelector(".copy-status");
	const email = copyEl.dataset.email;
	const defaultLabel = "click to copy";
	let resetTimer = null;

	function copyEmail() {
		copyToClipboard(email, () => {
			if (statusEl) statusEl.textContent = "copied!";
			copyEl.classList.add("copied");
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => {
				if (statusEl) statusEl.textContent = defaultLabel;
				copyEl.classList.remove("copied");
			}, 1500);
		});
	}

	copyEl.addEventListener("click", copyEmail);
	copyEl.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			copyEmail();
		}
	});
}

const clockEl = document.getElementById("taskbar-clock");
if (clockEl) {
	const tickClock = () => {
		const now = new Date();
		let hours = now.getHours();
		const minutes = pad2(now.getMinutes());
		const suffix = hours >= 12 ? "PM" : "AM";
		hours = hours % 12 || 12;
		clockEl.textContent = `${hours}:${minutes} ${suffix}`;
	};

	tickClock();
	setInterval(tickClock, 1000);
}

const startBtn = document.getElementById("start-btn");
const startMenu = document.getElementById("start-menu");
const taskBtn = document.getElementById("task-btn");

if (startBtn && startMenu) {
	function closeMenu() {
		startMenu.classList.remove("open");
	}

	startBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		startMenu.classList.toggle("open");
	});

	startMenu.addEventListener("click", (e) => {
		if (e.target.closest("a")) closeMenu();
	});

	document.addEventListener("click", (e) => {
		if (!startMenu.contains(e.target) && e.target !== startBtn) closeMenu();
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeMenu();
	});
}

const menuBar = document.querySelector(".menu-bar");
if (menuBar) {
	const menus = menuBar.querySelectorAll(".menu");
	let openMenu = null;

	function closeMenus() {
		menus.forEach((m) => m.classList.remove("open"));
		openMenu = null;
	}

	function openMenuEl(menu) {
		menus.forEach((m) => m.classList.remove("open"));
		menu.classList.add("open");
		openMenu = menu;
	}

	menus.forEach((menu) => {
		const btn = menu.querySelector(".menu-btn");

		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (menu.classList.contains("open")) {
				closeMenus();
			} else {
				openMenuEl(menu);
			}
		});

		menu.addEventListener("mouseenter", () => {
			if (openMenu && openMenu !== menu) openMenuEl(menu);
		});

		menu.querySelectorAll(".menu-item").forEach((item) => {
			item.addEventListener("click", () => {
				const action = item.dataset.action;
				closeMenus();

				if (action === "print") {
					window.print();
				} else if (action === "copy-link") {
					copyToClipboard(window.location.href);
				} else if (action === "copy-email") {
					copyToClipboard("sushiamo.game@gmail.com");
				}
			});
		});
	});

	document.addEventListener("click", (e) => {
		if (!menuBar.contains(e.target)) closeMenus();
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeMenus();
	});
}

const page = document.querySelector(".page");
const tbMin = document.getElementById("tb-min");
const tbMax = document.getElementById("tb-max");
const tbClose = document.getElementById("tb-close");
const titleBar = document.querySelector(".title-bar");

const dialog = document.getElementById("dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogMessage = document.getElementById("dialog-message");
const dialogYes = document.getElementById("dialog-yes");
const dialogNo = document.getElementById("dialog-no");
const dialogClose = document.getElementById("dialog-close");
const bsod = document.getElementById("bsod");
const shutdownItem = document.getElementById("shutdown-item");
const reopenShortcut = document.getElementById("reopen-shortcut");

const maxGlyph = "\u25A1";
const restoreGlyph = "\u2750";

let maximized = false;
let minimized = false;
let windowClosed = false;
let hideTimer = null;
let dialogMode = null;

function renderWindow() {
	if (!page) return;
	page.classList.toggle("maximized", maximized);

	if (tbMax) {
		tbMax.textContent = maximized ? restoreGlyph : maxGlyph;
		tbMax.setAttribute("aria-label", maximized ? "Restore" : "Maximize");
	}

	if (taskBtn) {
		taskBtn.hidden = windowClosed;
		taskBtn.classList.toggle("active", minimized);
	}
}

function hidePage(animClass, after) {
	if (!page) return;
	clearTimeout(hideTimer);
	page.classList.remove("restoring");
	page.classList.add(animClass);
	hideTimer = setTimeout(() => {
		page.classList.remove(animClass);
		page.classList.add("hidden");
		if (after) after();
	}, 220);
}

function showPage() {
	if (!page) return;
	clearTimeout(hideTimer);
	page.classList.remove("hidden", "minimizing", "closing");
	page.classList.add("restoring");
	setTimeout(() => page.classList.remove("restoring"), 220);
}

function minimizeWindow() {
	if (windowClosed || minimized) return;
	minimized = true;
	hidePage("minimizing");
	renderWindow();
}

function restoreWindow() {
	if (windowClosed || !minimized) return;
	minimized = false;
	showPage();
	renderWindow();
}

function toggleMaximize() {
	if (windowClosed || minimized) return;
	maximized = !maximized;
	renderWindow();
}

function closeWindow() {
	if (windowClosed) return;
	windowClosed = true;
	minimized = false;
	hidePage("closing", () => document.body.classList.add("closed"));
	renderWindow();
}

function reopenWindow() {
	if (!windowClosed && !minimized) return;
	windowClosed = false;
	minimized = false;
	document.body.classList.remove("closed");
	showPage();
	renderWindow();
}

function openDialog(mode) {
	if (!dialog) return;
	dialogMode = mode;
	if (mode === "shutdown") {
		dialogTitle.textContent = "Shut Down Panello Games";
		dialogMessage.textContent = "Are you sure you want to shut down the computer?";
	} else {
		dialogTitle.textContent = "Panello Games";
		dialogMessage.textContent = "Are you sure you want to close Panello Games?";
	}
	dialog.classList.add("open");
}

function closeDialog() {
	if (dialog) dialog.classList.remove("open");
	dialogMode = null;
}

function showBsod() {
	if (bsod) bsod.classList.add("open");
}

function reloadPage() {
	if (typeof window.playPanelloBoot === "function") {
		window.playPanelloBoot(() => window.location.reload());
		return;
	}
	window.location.reload();
}

if (tbMin) tbMin.addEventListener("click", minimizeWindow);
if (tbMax) tbMax.addEventListener("click", toggleMaximize);
if (tbClose) tbClose.addEventListener("click", closeWindow);

if (titleBar) {
	titleBar.addEventListener("dblclick", (e) => {
		if (e.target.closest(".title-bar-controls")) return;
		toggleMaximize();
	});
}

if (taskBtn) {
	taskBtn.addEventListener("click", () => {
		if (minimized) {
			restoreWindow();
		} else if (!windowClosed) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	});
}

if (dialog) {
	dialogNo.addEventListener("click", closeDialog);
	dialogClose.addEventListener("click", closeDialog);
	dialog.addEventListener("click", (e) => {
		if (e.target === dialog) closeDialog();
	});

	dialogYes.addEventListener("click", () => {
		const mode = dialogMode;
		closeDialog();
		if (mode === "shutdown") {
			showBsod();
		} else {
			closeWindow();
		}
	});
}

if (shutdownItem) {
	shutdownItem.addEventListener("click", (e) => {
		e.preventDefault();
		openDialog("shutdown");
	});
}

if (reopenShortcut) {
	reopenShortcut.addEventListener("click", reopenWindow);
	reopenShortcut.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			reopenWindow();
		}
	});
}

if (bsod) {
	bsod.addEventListener("click", reloadPage);
	document.addEventListener("keydown", (e) => {
		if (bsod.classList.contains("open")) {
			e.preventDefault();
			reloadPage();
		}
	});
}

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && dialog && dialog.classList.contains("open")) closeDialog();
});

renderWindow();
