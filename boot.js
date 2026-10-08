(function () {
	"use strict";

	const POST_LINES = [
		"Panello BIOS (C) 1995 Panello Games, Inc(rostato).",
		"Version 4.51PG",
		"",
		"Main Processor    : Panello 486XD2 62MHz",
		"Memory Test       : 65536K OK",
		"",
		"Detecting IDE drives ...",
		"  IDE Drive 0     : HDD 540MB",
		"  IDE Drive 1     : None",
		"  IDE Drive 2     : CD-ROM Drive 4X",
		"  IDE Drive 3     : 32MB Pendrive which costed all your money",
		"",
		"Starting Panello Games ... ciao :P"
	];

	const LINE_INTERVAL = 140;
	const POST_PAUSE = 700;
	const SPLASH_DURATION = 4000;

	let overlay = null;
	let postEl = null;
	let splashEl = null;
	let statusEl = null;
	let timers = [];
	let doneCb = null;
	let finished = false;

	function clearTimers() {
		for (const id of timers) {
			clearTimeout(id);
		}
		timers = [];
	}

	function later(fn, delay) {
		timers.push(setTimeout(fn, delay));
	}

	function build() {
		overlay = document.createElement("div");
		overlay.className = "pb";

		postEl = document.createElement("pre");
		postEl.className = "pb-post";

		splashEl = document.createElement("div");
		splashEl.className = "pb-splash";
		splashEl.hidden = true;
		splashEl.innerHTML =
			'<div class="pb-logo">' +
			'<img class="pb-mark" src="assets/daruma.png" alt="" aria-hidden="true">' +
			'<span class="pb-word">Panello Games</span>' +
			'<span class="pb-edition">Edition 95</span>' +
			"</div>" +
			'<div class="pb-progress"><div class="pb-progress-fill"></div></div>' +
			'<p class="pb-status">Starting Panello Games&hellip;</p>';

		overlay.appendChild(postEl);
		overlay.appendChild(splashEl);
		document.body.appendChild(overlay);

		statusEl = splashEl.querySelector(".pb-status");
	}

	function finish() {
		if (finished) return;
		finished = true;
		clearTimers();
		document.body.classList.remove("booting");
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
		overlay = null;
		postEl = null;
		splashEl = null;
		statusEl = null;
		const cb = doneCb;
		doneCb = null;
		if (cb) cb();
	}

	function showSplash() {
		if (finished) return;
		postEl.style.display = "none";
		splashEl.hidden = false;
		later(() => {
			if (statusEl) statusEl.textContent = "Loading your session\u2026";
		}, 1500);
		later(finish, SPLASH_DURATION);
	}

	function revealLine(index) {
		if (index >= POST_LINES.length) {
			later(showSplash, POST_PAUSE);
			return;
		}
		postEl.textContent += POST_LINES[index] + "\n";
		later(() => revealLine(index + 1), LINE_INTERVAL);
	}

	function play(callback) {
		doneCb = callback || null;
		finished = false;
		document.body.classList.add("booting");
		build();
		overlay.classList.add("open");
		revealLine(0);
	}

	window.playPanelloBoot = play;
})();
