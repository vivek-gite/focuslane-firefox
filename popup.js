const MODE_PRESETS = {
  minimal: {
    shortsBlocked: true,
    commentsHidden: true,
    hideHomeFeed: false,
    hideWatchSidebar: false,
    hideEndScreens: false,
    hideInfoCards: false,
    hideExplore: false,
    hidePlayables: false,
    hideCommunityPosts: false,
    hideLiveChat: false,
    hideNotifications: false,
    forceAutoplayOff: false,
    endGuard: false,
    visualMode: "normal",
    intentGate: false
  },
  study: {
    shortsBlocked: true,
    commentsHidden: true,
    hideHomeFeed: false,
    hideWatchSidebar: true,
    hideEndScreens: true,
    hideInfoCards: true,
    hideExplore: false,
    hidePlayables: true,
    hideCommunityPosts: true,
    hideLiveChat: true,
    hideNotifications: true,
    forceAutoplayOff: true,
    endGuard: true,
    visualMode: "dim",
    intentGate: false
  },
  strict: {
    shortsBlocked: true,
    commentsHidden: true,
    hideHomeFeed: true,
    hideWatchSidebar: true,
    hideEndScreens: true,
    hideInfoCards: true,
    hideExplore: true,
    hidePlayables: true,
    hideCommunityPosts: true,
    hideLiveChat: true,
    hideNotifications: true,
    forceAutoplayOff: true,
    endGuard: true,
    visualMode: "title-only",
    intentGate: true
  }
};

const DEFAULT_SETTINGS = {
  settingsVersion: 2,
  focusMode: "minimal",
  shortsBlocked: true,
  commentsHidden: true,
  hideHomeFeed: false,
  hideWatchSidebar: false,
  hideEndScreens: false,
  hideInfoCards: false,
  hideExplore: false,
  hidePlayables: false,
  hideCommunityPosts: false,
  hideLiveChat: false,
  hideNotifications: false,
  forceAutoplayOff: false,
  endGuard: false,
  endGuardCloseTab: false,
  visualMode: "normal",
  dislikeCountEnabled: false,
  filterEnabled: false,
  aiFilterRule: "",
  sponsorBlockEnabled: false,
  sponsorSkipMode: "auto",
  scheduleEnabled: false,
  scheduleStart: "09:00",
  scheduleEnd: "17:00",
  scheduleDays: [1, 2, 3, 4, 5],
  pomodoroEnabled: false,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  learningStackEnabled: false
};

const STATS_DEFAULT = {
  shortsBlocked: 0,
  recommendationsHidden: 0,
  aiFiltered: 0,
  videosFiltered: 0,
  focusMinutes: 0,
  breakMinutes: 0,
  unlockCount: 0,
  estimatedMinutesSaved: 0,
  learningVideosAdded: 0,
  learningVideosCompleted: 0,
  learningSessionsCompleted: 0,
  sponsorSegmentsSkipped: 0,
  sponsorSecondsSkipped: 0,
  dislikeCountsShown: 0
};

const TOGGLES = [
  ["shortsBlocked", "Block Shorts", "Hide shelves, cards, sidebar entry, and direct Shorts pages."],
  ["commentsHidden", "Hide Comments", "Remove comment sections and comment teasers."],
  ["hideHomeFeed", "Hide Home Feed", "Replace the homepage with an intentional search prompt."],
  ["hideWatchSidebar", "Hide Watch Sidebar", "Remove recommended videos beside a playing video."],
  ["hideEndScreens", "Hide End Screens", "Remove end cards and video wall recommendations."],
  ["hideInfoCards", "Hide Info Cards", "Remove in-player cards and teasers."],
  ["hideExplore", "Hide Explore", "Hide Explore, Trending, Gaming, and Live routes."],
  ["hidePlayables", "Hide Playables", "Hide YouTube games and playables links."],
  ["hideCommunityPosts", "Hide Community Posts", "Remove posts and mixed feed community blocks."],
  ["hideLiveChat", "Hide Live Chat", "Remove live chat from watch pages."],
  ["hideNotifications", "Hide Notifications", "Hide notification entry points."],
  ["forceAutoplayOff", "Force Autoplay Off", "Turn off YouTube autoplay when it appears."],
  ["endGuard", "End Guard", "Show intentional next-step choices when a video ends."],
  ["endGuardCloseTab", "Close Tab Option", "Let End Guard close the tab after a short countdown."],
  ["intentGate", "Intent Gate", "Ask for a purpose before open-ended browsing."]
];

let currentSettings = Object.assign({}, DEFAULT_SETTINGS);
let currentStats = null;
let activeStatsPeriod = "today";

const focusMode = document.getElementById("focusMode");
const toggleList = document.getElementById("toggleList");
const dislikeCountEnabled = document.getElementById("dislikeCountEnabled");
const learningStackEnabled = document.getElementById("learningStackEnabled");
const filterEnabled = document.getElementById("filterEnabled");
const aiFilterRule = document.getElementById("aiFilterRule");
const sponsorBlockEnabled = document.getElementById("sponsorBlockEnabled");
const sponsorSkipMode = document.getElementById("sponsorSkipMode");
const scheduleEnabled = document.getElementById("scheduleEnabled");
const scheduleStart = document.getElementById("scheduleStart");
const scheduleEnd = document.getElementById("scheduleEnd");
const scheduleDays = document.getElementById("scheduleDays");
const pomodoroEnabled = document.getElementById("pomodoroEnabled");
const pomodoroFocusMinutes = document.getElementById("pomodoroFocusMinutes");
const pomodoroBreakMinutes = document.getElementById("pomodoroBreakMinutes");
const saveBtn = document.getElementById("saveBtn");
const saveStatus = document.getElementById("saveStatus");
const clearCacheBtn = document.getElementById("clearCacheBtn");
const modeStatus = document.getElementById("modeStatus");
const detailStatus = document.getElementById("detailStatus");
const unlockPhrase = document.getElementById("unlockPhrase");
const unlockStatus = document.getElementById("unlockStatus");

function getEffectiveSettings(settings) {
  const base = Object.assign({}, DEFAULT_SETTINGS, settings || {});
  if (base.focusMode === "custom") return base;
  return Object.assign({}, base, MODE_PRESETS[base.focusMode] || MODE_PRESETS.minimal);
}

function setMessage(message, type = "") {
  saveStatus.textContent = message;
  saveStatus.className = "status-line" + (type ? ` ${type}` : "");
}

function modeLabel(mode) {
  const labels = {
    minimal: "Minimal",
    study: "Study",
    strict: "Strict",
    custom: "Custom"
  };
  return labels[mode] || "Mode";
}

function createToggle([key, title, description]) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <div class="row-text">
      <strong></strong>
      <span></span>
    </div>
    <label class="toggle">
      <input type="checkbox" id="${key}" data-setting="${key}" />
      <span class="slider"></span>
    </label>
  `;
  row.querySelector("strong").textContent = title;
  row.querySelector("span").textContent = description;
  return row;
}

function renderToggles() {
  TOGGLES.forEach((toggle) => toggleList.appendChild(createToggle(toggle)));
  toggleList.addEventListener("change", (event) => {
    if (event.target.matches("[data-setting]") && focusMode.value !== "custom") {
      focusMode.value = "custom";
      currentSettings.focusMode = "custom";
      updateStatusPreview();
    }
  });
}

function renderDays() {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  labels.forEach((label, value) => {
    const wrapper = document.createElement("label");
    wrapper.className = "day";
    wrapper.innerHTML = `<input type="checkbox" value="${value}" /><span>${label}</span>`;
    scheduleDays.appendChild(wrapper);
  });
}

function setToggleValue(key, value) {
  const el = document.getElementById(key);
  if (el) el.checked = Boolean(value);
}

function getToggleValue(key) {
  const el = document.getElementById(key);
  return el ? el.checked : false;
}

function setControls(settings) {
  currentSettings = Object.assign({}, DEFAULT_SETTINGS, settings || {});
  const effective = getEffectiveSettings(currentSettings);

  focusMode.value = currentSettings.focusMode || "minimal";
  TOGGLES.forEach(([key]) => setToggleValue(key, effective[key]));
  dislikeCountEnabled.checked = Boolean(currentSettings.dislikeCountEnabled);
  learningStackEnabled.checked = Boolean(currentSettings.learningStackEnabled);

  filterEnabled.checked = Boolean(currentSettings.filterEnabled);
  aiFilterRule.value = currentSettings.aiFilterRule || currentSettings.keywords || "";
  sponsorBlockEnabled.checked = Boolean(currentSettings.sponsorBlockEnabled);
  sponsorSkipMode.value = currentSettings.sponsorSkipMode || "auto";

  scheduleEnabled.checked = Boolean(currentSettings.scheduleEnabled);
  scheduleStart.value = currentSettings.scheduleStart || "09:00";
  scheduleEnd.value = currentSettings.scheduleEnd || "17:00";
  const selectedDays = Array.isArray(currentSettings.scheduleDays) ? currentSettings.scheduleDays : DEFAULT_SETTINGS.scheduleDays;
  scheduleDays.querySelectorAll("input").forEach((input) => {
    input.checked = selectedDays.includes(Number(input.value));
  });

  pomodoroEnabled.checked = Boolean(currentSettings.pomodoroEnabled);
  pomodoroFocusMinutes.value = Number(currentSettings.pomodoroFocusMinutes) || 25;
  pomodoroBreakMinutes.value = Number(currentSettings.pomodoroBreakMinutes) || 5;

  updateStatusPreview();
}

function applyPresetToControls(mode) {
  const preset = MODE_PRESETS[mode];
  if (!preset) return;
  TOGGLES.forEach(([key]) => {
    if (key in preset) setToggleValue(key, preset[key]);
  });
  updateStatusPreview();
}

async function saveModeSelection(mode) {
  const partial = {
    settingsVersion: 2,
    focusMode: mode,
    visualMode: currentSettings.visualMode || "normal",
    dislikeCountEnabled: dislikeCountEnabled.checked,
    learningStackEnabled: learningStackEnabled.checked
  };

  TOGGLES.forEach(([key]) => {
    partial[key] = getToggleValue(key);
  });

  await browser.storage.sync.set(partial);
  currentSettings = Object.assign({}, currentSettings, partial);
  setMessage(`${modeLabel(mode)} mode applied.`, "success");
  setTimeout(() => setMessage(""), 1600);
}

function collectSettings() {
  const collected = Object.assign({}, DEFAULT_SETTINGS, currentSettings, {
    settingsVersion: 2,
    focusMode: focusMode.value,
    visualMode: currentSettings.visualMode || "normal",
    dislikeCountEnabled: dislikeCountEnabled.checked,
    learningStackEnabled: learningStackEnabled.checked,
    filterEnabled: filterEnabled.checked,
    aiFilterRule: aiFilterRule.value.trim(),
    keywords: aiFilterRule.value.trim(),
    sponsorBlockEnabled: sponsorBlockEnabled.checked,
    sponsorSkipMode: sponsorSkipMode.value === "ask" ? "ask" : "auto",
    scheduleEnabled: scheduleEnabled.checked,
    scheduleStart: scheduleStart.value || "09:00",
    scheduleEnd: scheduleEnd.value || "17:00",
    scheduleDays: Array.from(scheduleDays.querySelectorAll("input:checked")).map((input) => Number(input.value)),
    pomodoroEnabled: pomodoroEnabled.checked,
    pomodoroFocusMinutes: Math.max(1, Number(pomodoroFocusMinutes.value) || 25),
    pomodoroBreakMinutes: Math.max(1, Number(pomodoroBreakMinutes.value) || 5)
  });

  TOGGLES.forEach(([key]) => {
    collected[key] = getToggleValue(key);
  });

  return collected;
}

function updateStatusPreview() {
  const settings = collectSettings();
  const effective = getEffectiveSettings(settings);
  const labels = {
    minimal: "Minimal focus",
    study: "Study mode",
    strict: "Strict mode",
    custom: "Custom mode"
  };

  modeStatus.textContent = labels[settings.focusMode] || "focuslane";

  const active = [];
  if (effective.shortsBlocked) active.push("Shorts");
  if (effective.commentsHidden) active.push("comments");
  if (effective.hideWatchSidebar) active.push("sidebar");
  if (effective.hideHomeFeed) active.push("home feed");
  if (effective.forceAutoplayOff) active.push("autoplay");
  if (effective.dislikeCountEnabled) active.push("dislikes");
  if (effective.filterEnabled) active.push("AI filter");
  if (effective.sponsorBlockEnabled) active.push(effective.sponsorSkipMode === "ask" ? "sponsor prompts" : "sponsor auto-skip");
  detailStatus.textContent = active.length ? `Active: ${active.join(", ")}.` : "All focus controls are off.";
}

function validateSettings(settings) {
  if (settings.filterEnabled && !settings.aiFilterRule) return "Enter an AI filter rule.";
  if (settings.scheduleEnabled && settings.scheduleDays.length === 0) return "Select at least one focus day.";
  return "";
}

async function saveSettings(options = {}) {
  const nextSettings = collectSettings();
  const error = validateSettings(nextSettings);
  if (error) {
    setMessage(error, "error");
    return false;
  }

  await browser.storage.sync.set(nextSettings);
  currentSettings = nextSettings;

  if (nextSettings.pomodoroEnabled && options.startPomodoro) {
    await browser.storage.local.set({ pomodoroPhase: options.phase || "focus", pomodoroStartedAt: Date.now() });
  }

  if (!options.silent) {
    setMessage("Settings saved.", "success");
    setTimeout(() => setMessage(""), 1800);
  }
  updateStatusPreview();
  return true;
}

async function loadRuntimeState() {
  const state = await browser.storage.local.get({ unlockUntil: 0, pomodoroPhase: "focus", pomodoroStartedAt: 0 });
  const unlockUntil = Number(state.unlockUntil) || 0;
  if (unlockUntil > Date.now()) {
    unlockStatus.textContent = `Unlocked until ${new Date(unlockUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
  } else {
    unlockStatus.textContent = "No temporary unlock active.";
  }

  if (state.pomodoroStartedAt && currentSettings.pomodoroEnabled) {
    const phase = state.pomodoroPhase === "break" ? "Break" : "Focus";
    detailStatus.textContent += ` ${phase} timer is running.`;
  }
}

async function loadSettings() {
  const syncState = await browser.storage.sync.get(DEFAULT_SETTINGS);
  if (typeof syncState.aiFilterRule === "undefined" && typeof syncState.keywords !== "undefined") {
    syncState.aiFilterRule = syncState.keywords || "";
  }
  setControls(syncState);
}

function displayStats(period) {
  if (!currentStats) return;
  const data = Object.assign({}, STATS_DEFAULT, currentStats[period] || {});
  document.getElementById("statShorts").textContent = formatNumber(data.shortsBlocked);
  document.getElementById("statRecs").textContent = formatNumber(data.recommendationsHidden);
  document.getElementById("statFiltered").textContent = formatNumber(data.aiFiltered || data.videosFiltered || 0);
  document.getElementById("statSponsors").textContent = formatNumber(data.sponsorSegmentsSkipped);
  document.getElementById("statFocus").textContent = formatNumber(data.focusMinutes);
  document.getElementById("statUnlocks").textContent = formatNumber(data.unlockCount);
  document.getElementById("statSaved").textContent = formatNumber(data.estimatedMinutesSaved, 1);
}

function formatNumber(value, digits = 0) {
  const number = Number(value) || 0;
  if (digits && number % 1 !== 0) return number.toFixed(digits);
  return String(Math.round(number));
}

async function loadStats() {
  currentStats = await browser.runtime.sendMessage({ type: "GET_STATS" });
  displayStats(activeStatsPeriod);
}

async function temporaryUnlock(minutes) {
  if (unlockPhrase.value.trim().toUpperCase() !== "FOCUS") {
    setMessage("Type FOCUS to unlock temporarily.", "error");
    return;
  }
  const unlockUntil = Date.now() + minutes * 60 * 1000;
  await browser.storage.local.set({ unlockUntil });
  await browser.runtime.sendMessage({ type: "INCREMENT_STATS", delta: { unlockCount: 1 } });
  unlockPhrase.value = "";
  await loadRuntimeState();
  setMessage(`Unlocked for ${minutes} minutes.`, "success");
}

function wireEvents() {
  focusMode.addEventListener("change", async () => {
    try {
      currentSettings.focusMode = focusMode.value;
      if (focusMode.value === "custom") {
        setControls(currentSettings);
        focusMode.value = "custom";
        await saveModeSelection("custom");
        return;
      }
      applyPresetToControls(focusMode.value);
      await saveModeSelection(focusMode.value);
    } catch (err) {
      setMessage(err.message || "Could not apply focus mode.", "error");
    }
  });

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.id !== "focusMode") el.addEventListener("input", updateStatusPreview);
  });

  saveBtn.addEventListener("click", () => saveSettings());

  clearCacheBtn.addEventListener("click", async () => {
    const response = await browser.runtime.sendMessage({ type: "CLEAR_CACHE" });
    setMessage(`Caches cleared (${response?.count || 0} entries).`, "success");
  });

  document.querySelectorAll(".unlock-btn").forEach((button) => {
    button.addEventListener("click", () => temporaryUnlock(Number(button.dataset.unlock)));
  });

  document.getElementById("startPomodoroBtn").addEventListener("click", async () => {
    pomodoroEnabled.checked = true;
    if (await saveSettings({ silent: true, startPomodoro: true, phase: "focus" })) {
      setMessage("Focus timer started.", "success");
      await loadRuntimeState();
    }
  });

  document.getElementById("startBreakBtn").addEventListener("click", async () => {
    pomodoroEnabled.checked = true;
    if (await saveSettings({ silent: true, startPomodoro: true, phase: "break" })) {
      setMessage("Break timer started.", "success");
      await loadRuntimeState();
    }
  });

  document.querySelectorAll(".period-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach((item) => item.classList.remove("primary"));
      button.classList.add("primary");
      activeStatsPeriod = button.dataset.period;
      displayStats(activeStatsPeriod);
    });
  });
}

renderToggles();
renderDays();
wireEvents();

Promise.all([loadSettings()])
  .then(loadRuntimeState)
  .then(loadStats)
  .catch((err) => setMessage(err.message || "Could not load focuslane settings.", "error"));
