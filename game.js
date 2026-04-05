const atlas = window.ElderfieldBenchmarkAtlasData;
const benchmarkScreen = window.ElderfieldBenchmarkScreen;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const screenIdEl = document.getElementById("screen-id");
const screenNameEl = document.getElementById("screen-name");
const screenRegionEl = document.getElementById("screen-region");
const objectiveTextEl = document.getElementById("objective-text");
const inventoryListEl = document.getElementById("inventory-list");
const messageBoxEl = document.getElementById("message-box");
const messageTitleEl = document.getElementById("message-title");
const messageTextEl = document.getElementById("message-text");
const buildVersionEl = document.getElementById("build-version");
const buildStatusEl = document.getElementById("build-status");
const buildStatusLabelEl = document.getElementById("build-status-label");
const buildNoteEl = document.getElementById("build-note");
const currentSliceEl = document.getElementById("current-slice");
const saveStatusEl = document.getElementById("save-status");
const saveDetailEl = document.getElementById("save-detail");
const saveButtonEl = document.getElementById("save-button");
const resetButtonEl = document.getElementById("reset-button");
const debugScanButtonEl = document.getElementById("debug-scan-button");
const debugReportButtonEl = document.getElementById("debug-report-button");
const debugCopyButtonEl = document.getElementById("debug-copy-button");
const debugScanStatusEl = document.getElementById("debug-scan-status");
const debugScanStatusLabelEl = document.getElementById("debug-scan-status-label");
const debugScanStatusDetailEl = document.getElementById("debug-scan-status-detail");
const debugScanFeedbackEl = document.getElementById("debug-scan-feedback");
const debugScanSummaryEl = document.getElementById("debug-scan-summary");
const debugReportEl = document.getElementById("debug-report");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SAVE_KEY = "elderfield.visual-benchmark.save.v1";
const SAVE_VERSION = 1;
const BUILD_VERSION = "v0.3.21-fc04-presence";
const BUILD_STATUS_TEXT = {
  green: "Good",
  yellow: "Needs Help",
  red: "Bad Error"
};

const screens = window.ElderfieldBenchmarkScreens || {
  [benchmarkScreen.id]: benchmarkScreen
};

const keysDown = new Set();
const keysPressed = new Set();

window.addEventListener("keydown", (event) => {
  const tracked = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyE",
    "KeyJ",
    "Enter",
    "Space",
    "Escape",
    "Backquote"
  ];

  if (tracked.includes(event.code)) {
    event.preventDefault();
  }

  if (!keysDown.has(event.code)) {
    keysPressed.add(event.code);
  }

  keysDown.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.code);
});

function justPressed(code) {
  return keysPressed.has(code);
}

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function centerOf(box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createDefaultSaveData() {
  return {
    version: SAVE_VERSION,
    savedAt: null,
    items: {
      sword: true,
      lanternOfDawn: true
    },
    quest: {
      landmarkRead: false,
      caretakerMet: false,
      briarCleared: false,
      pilgrimBriarCleared: false,
      highroadGateCleared: false,
      watchersUpperBriarCleared: false,
      watchgateLeftLit: false,
      watchgateRightLit: false,
      watchgateWinchCleared: false,
      watchgateOpen: false,
      waysideUpperLeftLit: false,
      waysideUpperRightLit: false,
      waysideLowerLeftLit: false,
      waysideLowerRightLit: false,
      waysideEchoResolved: false,
      greyfenDescentLeftLit: false,
      greyfenDescentRightLit: false,
      greyfenDescentBriarCleared: false,
      greyfenDescentOpen: false,
      falseMarkerLeftLit: false,
      falseMarkerRightLit: false,
      falseMarkerRevealed: false,
      memorialFlatsPathCleared: false,
      namelessStoneClueFound: false,
      causewayLeftLit: false,
      causewayRightLit: false,
      causewayClear: false,
        fenwatchWinchCleared: false,
        hallNamesWitnessed: false,
        echoAbandonmentWitnessed: false,
        wardenTestimonyWitnessed: false,
        marshalConfrontationWitnessed: false
      },
    rewards: {
      watchCacheCollected: false,
      pilgrimCacheCollected: false,
      highroadSupplyCollected: false,
      watchersCacheCollected: false,
      watchgateWallCacheCollected: false,
      waysideTabletRead: false,
      greyfenNicheCollected: false,
      marshfootChestCollected: false,
      ferrymanDockCacheCollected: false,
      falseMarkerEpitaphRead: false,
      memorialTombCollected: false
    },
    npcPhases: {
      talan: "waiting",
      toma: "waiting"
    },
    checkpoint: {
      screenId: benchmarkScreen.id,
      spawnId: "default"
    }
  };
}

function normalizeSaveData(raw) {
  const defaults = createDefaultSaveData();

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  return {
    version: SAVE_VERSION,
    savedAt: raw.savedAt || null,
    items: { ...defaults.items, ...(raw.items || {}) },
    quest: { ...defaults.quest, ...(raw.quest || {}) },
    rewards: { ...defaults.rewards, ...(raw.rewards || {}) },
    npcPhases: { ...defaults.npcPhases, ...(raw.npcPhases || {}) },
    checkpoint: {
      screenId: raw.checkpoint?.screenId || defaults.checkpoint.screenId,
      spawnId: raw.checkpoint?.spawnId || defaults.checkpoint.spawnId
    }
  };
}

function createRuntimeState() {
  const saveData = createDefaultSaveData();

  return {
    currentScreen: saveData.checkpoint.screenId,
    currentSpawn: saveData.checkpoint.spawnId,
    player: {
      x: 154,
      y: 160,
      w: 10,
      h: 12,
      speed: 64,
      dir: "up",
      hp: 3,
      attackTimer: 0,
      invincibleTimer: 0
    },
    items: cloneData(saveData.items),
    quest: cloneData(saveData.quest),
    rewards: cloneData(saveData.rewards),
    npcPhases: cloneData(saveData.npcPhases),
    checkpoint: cloneData(saveData.checkpoint),
    enemies: [],
    message: null,
    prompt: null,
    paused: false,
    debug: false,
    transitionCooldown: 0,
    lastTime: 0,
    meta: {
      saveLoaded: false,
      lastSaveReason: "Fresh journey",
      lastSaveTime: null,
      buildVersion: BUILD_VERSION,
      buildStatus: "green",
      buildNote: "Green means we are good. Yellow means this build needs help. Red means a bad error is active."
    }
  };
}

const state = createRuntimeState();
const debugToolState = {
  lastScan: null,
  lastReport: "",
  lastCopyResult: null
};

function activeScreen() {
  return screens[state.currentScreen] || benchmarkScreen;
}

function storage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function syncDerivedProgress() {
  state.quest.watchgateOpen = Boolean(
    state.quest.watchgateLeftLit &&
    state.quest.watchgateRightLit &&
    state.quest.watchgateWinchCleared
  );

  state.quest.waysideEchoResolved = Boolean(
    state.quest.waysideUpperLeftLit &&
    state.quest.waysideUpperRightLit &&
    state.quest.waysideLowerLeftLit &&
    state.quest.waysideLowerRightLit
  );

  state.quest.greyfenDescentOpen = Boolean(
    state.quest.greyfenDescentLeftLit &&
    state.quest.greyfenDescentRightLit &&
    state.quest.greyfenDescentBriarCleared
  );

  state.quest.falseMarkerRevealed = Boolean(
    state.quest.falseMarkerLeftLit &&
    state.quest.falseMarkerRightLit
  );

  state.quest.causewayClear = Boolean(
    state.quest.causewayLeftLit &&
    state.quest.causewayRightLit
  );

  if (state.rewards.watchCacheCollected) {
    state.npcPhases.talan = "resolved";
  } else if (state.quest.landmarkRead) {
    state.npcPhases.talan = "awakened";
  } else if (state.quest.caretakerMet) {
    state.npcPhases.talan = "met";
  } else {
    state.npcPhases.talan = "waiting";
  }
}

function buildSaveData() {
  syncDerivedProgress();
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    items: cloneData(state.items),
    quest: cloneData(state.quest),
    rewards: cloneData(state.rewards),
    npcPhases: cloneData(state.npcPhases),
    checkpoint: cloneData(state.checkpoint)
  };
}

function applySaveData(saveData) {
  const normalized = normalizeSaveData(saveData);
  state.items = cloneData(normalized.items);
  state.quest = cloneData(normalized.quest);
  state.rewards = cloneData(normalized.rewards);
  state.npcPhases = cloneData(normalized.npcPhases);
  state.checkpoint = cloneData(normalized.checkpoint);
  state.currentScreen = normalized.checkpoint.screenId;
  state.currentSpawn = normalized.checkpoint.spawnId;
  state.player.hp = 3;
  state.player.attackTimer = 0;
  state.player.invincibleTimer = 0;
  state.paused = false;
  state.message = null;
  state.prompt = null;
  syncDerivedProgress();
}

function saveProgress(reason = "Progress saved") {
  const store = storage();
  if (!store) {
    state.meta.saveLoaded = false;
    state.meta.lastSaveReason = "Save unavailable";
    setBuildStatus("yellow", "Yellow means this build needs help. Save storage is unavailable, so persistence needs attention.");
    updateSavePanel();
    return false;
  }

  try {
    const payload = buildSaveData();
    store.setItem(SAVE_KEY, JSON.stringify(payload));
    state.meta.saveLoaded = true;
    state.meta.lastSaveReason = reason;
    state.meta.lastSaveTime = payload.savedAt;
    if (state.meta.buildStatus !== "red") {
      setBuildStatus("green", "Green means we are good. Core benchmark systems are running and saving normally.");
    }
    updateSavePanel();
    return true;
  } catch (error) {
    state.meta.saveLoaded = false;
    state.meta.lastSaveReason = "Save failed";
    setBuildStatus("yellow", "Yellow means this build needs help. Save failed, so persistence needs attention.");
    updateSavePanel();
    console.error("Failed to save Elderfield benchmark progress.", error);
    return false;
  }
}

function loadProgress() {
  const store = storage();
  if (!store) return false;

  try {
    const raw = store.getItem(SAVE_KEY);
    if (!raw) return false;
    const payload = normalizeSaveData(JSON.parse(raw));
    applySaveData(payload);
    const checkpoint = screens[state.checkpoint.screenId] ? state.checkpoint : createDefaultSaveData().checkpoint;
    loadScreen(checkpoint.screenId, checkpoint.spawnId, { skipSave: true });
    state.meta.saveLoaded = true;
    state.meta.lastSaveReason = "Journey restored";
    state.meta.lastSaveTime = payload.savedAt;
    if (state.meta.buildStatus !== "red") {
      setBuildStatus("green", "Green means we are good. The benchmark restored cleanly from save.");
    }
    updateSavePanel();
    return true;
  } catch (error) {
    state.meta.saveLoaded = false;
    state.meta.lastSaveReason = "Save unreadable";
    setBuildStatus("yellow", "Yellow means this build needs help. A save file could not be read cleanly.");
    updateSavePanel();
    console.error("Failed to load Elderfield benchmark progress.", error);
    return false;
  }
}

function clearSavedProgress() {
  const store = storage();
  if (!store) return;

  try {
    store.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear Elderfield benchmark save.", error);
  }
}

function updateCheckpoint(screenId = state.currentScreen, spawnId = state.currentSpawn || "default") {
  state.checkpoint.screenId = screenId;
  state.checkpoint.spawnId = spawnId;
}

function formatSaveTime(value) {
  if (!value) return "No save timestamp yet.";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return "Saved recently.";
  }
}

function describeCheckpoint() {
  const screen = screens[state.checkpoint.screenId];
  if (!screen) {
    return `${state.checkpoint.screenId} (${state.checkpoint.spawnId})`;
  }
  return `${screen.name} (${state.checkpoint.spawnId})`;
}

function updateSavePanel() {
  if (!saveStatusEl || !saveDetailEl) return;

  saveStatusEl.textContent = state.meta.lastSaveReason;
  saveDetailEl.textContent = `${describeCheckpoint()} • ${formatSaveTime(state.meta.lastSaveTime)}`;
}

function updateBuildStatusPanel() {
  if (buildVersionEl) {
    buildVersionEl.textContent = state.meta.buildVersion;
  }

  if (buildStatusEl) {
    buildStatusEl.dataset.state = state.meta.buildStatus;
  }

  if (buildStatusLabelEl) {
    buildStatusLabelEl.textContent = BUILD_STATUS_TEXT[state.meta.buildStatus] || BUILD_STATUS_TEXT.green;
  }

  if (buildNoteEl) {
    buildNoteEl.textContent = state.meta.buildNote;
  }
}

function setBuildStatus(level, note, options = {}) {
  if (!BUILD_STATUS_TEXT[level]) return;

  if (state.meta.buildStatus === "red" && level !== "red" && !options.force) {
    return;
  }

  state.meta.buildStatus = level;
  if (note) {
    state.meta.buildNote = note;
  }
  updateBuildStatusPanel();
}

function renderInventory() {
  if (!inventoryListEl) return;
  const chips = [];
  if (state.items.sword) chips.push("Sword");
  if (state.items.lanternOfDawn) chips.push("Lantern of Dawn");
  inventoryListEl.innerHTML = chips.map((item) => `<span class="chip">${item}</span>`).join("");
}

function objectiveText() {
  if (state.currentScreen === "FC-04") {
    if (!state.quest.marshalConfrontationWitnessed) {
      return "Confront the Bell-Mourned marshal so consequence becomes direct without tipping this chamber into combat or spectacle.";
    }
    return "Bell-Mourned Marshal Chamber should now read as consequence directly faced: the chamber has shifted from shell to confrontation-state without reward, spectacle, or boss escalation.";
  }
  if (state.currentScreen === "FC-03") {
    if (!state.quest.wardenTestimonyWitnessed) {
      return "Witness the Warden testimony so Fenwatch's accusation becomes proof without turning into spectacle.";
    }
    return "Warden Testimony should now read as proof chamber, not escalation: the Wardens are cleared, and the north gate should now open into consequence without turning Fenwatch into a boss arena.";
  }
  if (state.currentScreen === "FC-02") {
    if (!state.quest.echoAbandonmentWitnessed) {
      return "Witness the abandonment echo so Fenwatch deepens through testimony, not puzzle escalation.";
    }
    return "Echo of Abandonment should now read as a deeper witness chamber: the plea is heard, the sealing order is understood, and the northward holdback remains deliberate.";
  }
  if (state.currentScreen === "FC-01") {
    if (!state.quest.hallNamesWitnessed) {
      return "Read the register of names so Fenwatch begins with witness, not mechanism.";
    }
    return "Hall of Names should now read as a disciplined witnessing space: named dead at the center, and the deeper chamber only opening once the names have actually been faced.";
  }
  if (state.currentScreen === "GF-10") {
    if (!state.quest.fenwatchWinchCleared) {
      return "Burn the thorn-choked chain winch so Fenwatch stops reading like distant accusation and becomes a true dungeon threshold.";
    }
    return "The catacomb door is open. Step into Hall of Names so Fenwatch begins with witness instead of spectacle.";
  }
  if (state.currentScreen === "GF-07") {
    if (!state.quest.causewayClear) {
      return "Light both causeway braziers so the drowned road stops reading like blind pressure and starts reading like a disciplined line toward Fenwatch.";
    }
    return "Drowned Causeway should now read as compressed Greyfen pressure: one defended stone line, one clear southward pull, and Fenwatch weight gathering just beyond view.";
  }
  if (state.currentScreen === "GF-06") {
    if (!state.quest.memorialFlatsPathCleared) {
      return "Burn the thorn-choked grave rows so the dry line through Memorial Flats reappears without turning the field into clutter.";
    }
    if (!state.quest.namelessStoneClueFound) {
      return "Inspect the unfinished west graves and recover the clue fragment so the flats carry named loss instead of anonymous ruin.";
    }
    if (!state.rewards.memorialTombCollected) {
      return "Sweep the raised west tomb pocket so Memorial Flats keeps one deliberate reward space inside all this neglect.";
    }
    return "Memorial Flats should now read as scale consequence: a clear path through neglected dead, with dignity still visible in what little was kept.";
  }
  if (state.currentScreen === "GF-05") {
    if (!state.quest.falseMarkerRevealed) {
      return "Light both memorial braziers so the false monument stops reading like accepted history and starts exposing the lie beneath it.";
    }
    if (!state.rewards.falseMarkerEpitaphRead) {
      return "The lie is cracked open. Read the revealed epitaph so False Marker Knoll becomes accusation instead of scenery.";
    }
    return "False Marker Knoll should now read as Greyfen's first open warning: a dominant monument, a broken official story, and a south road carrying the danger forward.";
  }
  if (state.currentScreen === "GF-02") {
    if (state.npcPhases.toma === "waiting") {
      return "Speak to Toma so Ferryman's Reach reads as Greyfen's first lived-in foothold, not just another stretch of marsh road.";
    }
    if (!state.rewards.ferrymanDockCacheCollected) {
      return "Sweep the ribboned dock cache so the crossing keeps one authored optional pocket instead of flattening into pure route logic.";
    }
    return "Ferryman's Reach should now read as a true crossing-place: one keeper, one mournful dock landmark, and one clear southward promise held in reserve.";
  }
  if (state.currentScreen === "GF-01") {
    if (!state.rewards.marshfootChestCollected) {
      return "Marshfoot Entry should feel like the first true threshold into Greyfen: claim the west cache so the optional pocket proves the road is still authored even as the ground softens.";
    }
    return "Marshfoot Entry should now read as a careful threshold: Highroad stone behind, wet lowland memory ahead, and the road still readable enough to trust.";
  }
  if (state.currentScreen === "HV-10") {
    if (!state.quest.greyfenDescentBriarCleared) {
      return "Burn the corruption-thorn on the descent switchback so the road can begin to sag out of the uplands and toward Greyfen.";
    }
    if (!state.quest.greyfenDescentLeftLit || !state.quest.greyfenDescentRightLit) {
      return "Light both descent braziers so the Greyfen road feels consecrated and safe enough to follow downward.";
    }
    if (!state.rewards.greyfenNicheCollected) {
      return "Sweep the east-wall niche chest before leaving the last dry stone above Greyfen behind.";
    }
    return "Greyfen Descent should now feel like the true downward turn out of Highroad shelter and into lowland memory.";
  }
  if (state.currentScreen === "HV-07") {
    return "Shepherd's Rest should read as the first true upland hub: shelter, standing stone, one live Greyfen branch, and two future roads held in reserve.";
  }
  if (state.currentScreen === "HV-06") {
    if (!state.quest.waysideEchoResolved) {
      return "Light all four wayside braziers so the bell shrine answers the road and proves this place is more than a passage screen.";
    }
    if (!state.rewards.waysideTabletRead) {
      return "The shrine has answered. Read the altar tablet beneath the bell so the road's buried memory becomes part of the route, not just scenery.";
    }
    return "Bell of the Wayside should now read as a true main-route memory beat: sacred bell, answered fires, and a north road waiting beyond.";
  }
  if (state.currentScreen === "HV-05") {
    if (!state.rewards.watchgateWallCacheCollected) {
      return "Sweep the west turret pocket so the upper wall feels claimed and memorable, not like empty fortification dressing.";
    }
    return "Watchgate Upper Wall should now feel like the first true payoff above the gate: towers, parapet road, and a clear east pull toward the bell road.";
  }
  if (state.currentScreen === "HV-04") {
    if (!state.quest.watchgateLeftLit || !state.quest.watchgateRightLit) {
      return "Light both gate braziers so Watchgate reads like a true threshold instead of just another climb.";
    }
    if (!state.quest.watchgateWinchCleared) {
      return "Burn the briars choking the court winch and let the broken gateworks finally answer the road.";
    }
    return "Watchgate South Court should now feel distinct: twin towers, ritual braziers, a cleared winch, and the lifted road beyond.";
  }
  if (state.currentScreen === "HV-03") {
    if (!state.quest.watchersUpperBriarCleared) {
      return "Burn the thorn-choked wagon pile on the north ramp so the climb can finally reveal the Watchgate road ahead.";
    }
    return "Watcher's Steps Upper should now sell the wider Highroad promise: Greyfen below, Watchgate ahead, and a future east-hook pocket worth remembering.";
  }
  if (state.currentScreen === "HV-02") {
    if (!state.rewards.watchersCacheCollected) {
      return "Climb the lower steps, then sweep the west herb alcove so the side pocket reads as part of the road instead of dead filler.";
    }
    return "Watcher's Steps Lower should now read as a stable continuation of the Highroad chain under the locked benchmark law.";
  }
  if (state.currentScreen === "HV-01") {
    if (!state.quest.highroadGateCleared) {
      return "Burn the thorn wall at the north road and reopen the first true Highroad gate.";
    }
    if (!state.rewards.highroadSupplyCollected) {
      return "Sweep the east shoulder ruin for the tucked supply chest before pressing farther into the uplands.";
    }
    return "The Highroad Spur stands open. This screen should now feel like real Elderfield content built under the locked benchmark law.";
  }
  if (state.currentScreen === "BM-02") {
    if (!state.quest.pilgrimBriarCleared) {
      return "Pilgrim's Cut should feel authored in one glance: landmark above, shelter below, and a thorned cache nook tucked off the road.";
    }
    if (!state.rewards.pilgrimCacheCollected) {
      return "The briars are gone. Claim the pilgrim cache and judge whether BM-02 now carries the same optional-pocket strength as BM-01.";
    }
    return "BM-02 should now carry the law cleanly enough to hand off into the real Highroad path on its eastern shoulder.";
  }
  if (!state.quest.landmarkRead) {
    return "Climb the stairs and read the Warden Stone. The benchmark screen is built to pull your eye toward it.";
  }
  if (!state.quest.caretakerMet) {
    return "Speak to Watchkeeper Talan beside the house. NPC placement should feel safe, readable, and intentional.";
  }
  if (!state.quest.briarCleared) {
    return "Use the Lantern of Dawn on the briar choke at the cliff foot. Progression needs to stay visible in the space.";
  }
  if (!state.rewards.watchCacheCollected) {
    return "Claim the watch-cache from the opened alcove. Optional rewards should sit in clear, memorable pockets.";
  }
  return "Benchmark complete. This screen now sets the visual law for Elderfield's rebuild.";
}

function getDebugLines() {
  let lineA = `stone:${state.quest.landmarkRead} briar:${state.quest.briarCleared}`;
  let lineB = `cache:${state.rewards.watchCacheCollected} npc:${state.npcPhases.talan}`;

  if (state.currentScreen === "BM-02") {
    lineA = `nook:${state.quest.pilgrimBriarCleared} cache:${state.rewards.pilgrimCacheCollected}`;
    lineB = "law:benchmark handoff east";
  }
  if (state.currentScreen === "HV-01") {
    lineA = `gate:${state.quest.highroadGateCleared} cache:${state.rewards.highroadSupplyCollected}`;
    lineB = "path:highroad spur";
  }
  if (state.currentScreen === "HV-02") {
    lineA = `cache:${state.rewards.watchersCacheCollected} route:steps`;
    lineB = "path:watcher's steps";
  }
  if (state.currentScreen === "HV-03") {
    lineA = `gate:${state.quest.watchersUpperBriarCleared} lookout:east`;
    lineB = "path:watcher's upper";
  }
  if (state.currentScreen === "HV-04") {
    lineA = `left:${state.quest.watchgateLeftLit} right:${state.quest.watchgateRightLit}`;
    lineB = `winch:${state.quest.watchgateWinchCleared} gate:${state.quest.watchgateOpen}`;
  }
  if (state.currentScreen === "HV-05") {
    lineA = `cache:${state.rewards.watchgateWallCacheCollected} wall:upper`;
    lineB = "path:watchgate parapet";
  }
  if (state.currentScreen === "HV-06") {
    const firesLit = [
      state.quest.waysideUpperLeftLit,
      state.quest.waysideUpperRightLit,
      state.quest.waysideLowerLeftLit,
      state.quest.waysideLowerRightLit
    ].filter(Boolean).length;
    lineA = `fires:${firesLit}/4 echo:${state.quest.waysideEchoResolved}`;
    lineB = `tablet:${state.rewards.waysideTabletRead} path:wayside`;
  }
  if (state.currentScreen === "HV-07") {
    lineA = "hub:shepherd's rest npc:yselle";
    lineB = "paths:north east southeast";
  }
  if (state.currentScreen === "HV-10") {
    lineA = `left:${state.quest.greyfenDescentLeftLit} right:${state.quest.greyfenDescentRightLit}`;
    lineB = `thorn:${state.quest.greyfenDescentBriarCleared} open:${state.quest.greyfenDescentOpen}`;
  }
  if (state.currentScreen === "GF-01") {
    lineA = `cache:${state.rewards.marshfootChestCollected} route:marshfoot`;
    lineB = "path:greyfen threshold";
  }
  if (state.currentScreen === "GF-02") {
    lineA = `toma:${state.npcPhases.toma} cache:${state.rewards.ferrymanDockCacheCollected}`;
    lineB = "path:ferryman's reach";
  }
  if (state.currentScreen === "GF-05") {
    lineA = `left:${state.quest.falseMarkerLeftLit} right:${state.quest.falseMarkerRightLit}`;
    lineB = `truth:${state.quest.falseMarkerRevealed} epitaph:${state.rewards.falseMarkerEpitaphRead}`;
  }
  if (state.currentScreen === "GF-06") {
    lineA = `path:${state.quest.memorialFlatsPathCleared} clue:${state.quest.namelessStoneClueFound}`;
    lineB = `cache:${state.rewards.memorialTombCollected} flats:memorial`;
  }
  if (state.currentScreen === "GF-07") {
    lineA = `left:${state.quest.causewayLeftLit} right:${state.quest.causewayRightLit}`;
    lineB = `clear:${state.quest.causewayClear} path:causeway`;
  }
  if (state.currentScreen === "GF-10") {
    lineA = `winch:${state.quest.fenwatchWinchCleared} gate:fenwatch`;
    lineB = "path:final exterior";
  }
  if (state.currentScreen === "FC-01") {
    lineA = `witness:${state.quest.hallNamesWitnessed} hall:names`;
    lineB = "path:first interior";
  }
  if (state.currentScreen === "FC-02") {
    lineA = `echo:${state.quest.echoAbandonmentWitnessed} chamber:abandonment`;
    lineB = "path:second interior";
  }
  if (state.currentScreen === "FC-03") {
    lineA = `proof:${state.quest.wardenTestimonyWitnessed} chamber:testimony`;
    lineB = "path:third interior";
  }
  if (state.currentScreen === "FC-04") {
    const presence = getMarshalPresenceCueState();
    lineA = `confront:${state.quest.marshalConfrontationWitnessed} presence:${presence.label}`;
    lineB = "path:boss-side consequence";
  }

  return { lineA, lineB };
}

function getCurrentQuestFlags() {
  const flagsByScreen = {
    "BM-01": ["landmarkRead", "caretakerMet", "briarCleared"],
    "BM-02": ["pilgrimBriarCleared"],
    "HV-01": ["highroadGateCleared"],
    "HV-03": ["watchersUpperBriarCleared"],
    "HV-04": ["watchgateLeftLit", "watchgateRightLit", "watchgateWinchCleared", "watchgateOpen"],
    "HV-06": ["waysideUpperLeftLit", "waysideUpperRightLit", "waysideLowerLeftLit", "waysideLowerRightLit", "waysideEchoResolved"],
    "HV-10": ["greyfenDescentLeftLit", "greyfenDescentRightLit", "greyfenDescentBriarCleared", "greyfenDescentOpen"],
    "GF-05": ["falseMarkerLeftLit", "falseMarkerRightLit", "falseMarkerRevealed"],
    "GF-06": ["memorialFlatsPathCleared", "namelessStoneClueFound"],
    "GF-07": ["causewayLeftLit", "causewayRightLit", "causewayClear"],
    "GF-10": ["fenwatchWinchCleared"],
    "FC-01": ["hallNamesWitnessed"],
    "FC-02": ["echoAbandonmentWitnessed"],
    "FC-03": ["wardenTestimonyWitnessed"],
    "FC-04": ["wardenTestimonyWitnessed", "marshalConfrontationWitnessed"]
  };

  const names = flagsByScreen[state.currentScreen] || [];
  return names.map((name) => ({
    name,
    value: Boolean(state.quest[name])
  }));
}

function getRelevantBarrierStatuses() {
  const screen = activeScreen();
  const solids = getSolids();
  const statuses = [];
  const props = screen.props || {};

  for (const [key, rectBox] of Object.entries(props)) {
    if (!rectBox || typeof rectBox.x !== "number") continue;

    if (!(key.endsWith("Threshold") || /(Seal|Gate|Briar)$/.test(key))) {
      continue;
    }

    const blocked = solids.some((solid) => overlaps(solid, rectBox));
    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
    const kind = key.endsWith("Threshold") ? "threshold" : "gate";

    statuses.push({
      key,
      kind,
      label,
      state: blocked ? (kind === "threshold" ? "blocked" : "closed") : (kind === "threshold" ? "open" : "open / cleared")
    });
  }

  return statuses;
}

function summarizeTransitions(screen) {
  return (screen.transitions || []).map((transition) => {
    const target = screens[transition.to];
    const spawnExists = Boolean(target?.spawns?.[transition.spawn]);
    return {
      to: transition.to,
      name: target?.name || "Missing screen",
      spawn: transition.spawn,
      ok: Boolean(target) && spawnExists
    };
  });
}

function createScannerCheck(label, stateLabel, detail) {
  return { label, state: stateLabel, detail };
}

function runDebugScanner() {
  syncDerivedProgress();

  const screen = activeScreen();
  const currentObjective = objectiveText();
  const debugLines = getDebugLines();
  const keyFlags = getCurrentQuestFlags();
  const transitions = summarizeTransitions(screen);
  const barrierStatuses = getRelevantBarrierStatuses();
  const warnings = [];
  const checks = [];
  const store = storage();
  const buildVersionMatches = buildVersionEl ? buildVersionEl.textContent.trim() === state.meta.buildVersion : true;
  const screenIdMatches = screenIdEl ? screenIdEl.textContent.trim() === state.currentScreen : true;
  const objectiveMatches = objectiveTextEl ? objectiveTextEl.textContent.trim() === currentObjective : true;
  const currentSliceMentionsScreen = currentSliceEl ? currentSliceEl.textContent.includes(screen.name) : true;
  const currentSpawnValid = Boolean(screen.spawns?.[state.currentSpawn]);
  const checkpointScreen = screens[state.checkpoint.screenId];
  const checkpointValid = Boolean(checkpointScreen?.spawns?.[state.checkpoint.spawnId]);
  const saveReady = (() => {
    try {
      buildSaveData();
      return true;
    } catch (error) {
      return false;
    }
  })();
  const transitionsValid = transitions.every((transition) => transition.ok);

  checks.push(createScannerCheck(
    "Build honesty",
    buildVersionMatches ? "pass" : "fail",
    buildVersionMatches ? "Runtime build version matches the published panel text." : "Runtime build version and published panel text are out of sync."
  ));
  checks.push(createScannerCheck(
    "HUD honesty",
    screenIdMatches && objectiveMatches ? "pass" : "fail",
    screenIdMatches && objectiveMatches ? "Current screen and objective panels match runtime state." : "Screen or objective panel text has drifted from runtime state."
  ));
  checks.push(createScannerCheck(
    "Current spawn",
    currentSpawnValid ? "pass" : "fail",
    currentSpawnValid ? `Spawn '${state.currentSpawn}' is valid for ${state.currentScreen}.` : `Spawn '${state.currentSpawn}' is not valid for ${state.currentScreen}.`
  ));
  checks.push(createScannerCheck(
    "Checkpoint",
    checkpointValid ? "pass" : "fail",
    checkpointValid ? `Checkpoint ${state.checkpoint.screenId} (${state.checkpoint.spawnId}) is restorable.` : `Checkpoint ${state.checkpoint.screenId} (${state.checkpoint.spawnId}) is not restorable.`
  ));
  checks.push(createScannerCheck(
    "Transitions",
    transitionsValid ? "pass" : "fail",
    transitions.length ? transitions.map((transition) => `${transition.to}:${transition.spawn}`).join(", ") : "No live transitions on this screen."
  ));
  checks.push(createScannerCheck(
    "Thresholds / gates",
    barrierStatuses.every((entry) => entry.state !== "blocked" || entry.kind !== "gate") ? "pass" : "warn",
    barrierStatuses.length ? barrierStatuses.map((entry) => `${entry.label}=${entry.state}`).join(", ") : "No relevant threshold or gate props on this screen."
  ));
  checks.push(createScannerCheck(
    "Save readiness",
    store && saveReady ? "pass" : "fail",
    store && saveReady ? "Storage is available and a save payload builds cleanly." : "Storage or save payload generation is failing."
  ));
  checks.push(createScannerCheck(
    "Current slice honesty",
    currentSliceMentionsScreen ? "pass" : "warn",
    currentSliceMentionsScreen ? `${screen.name} is present in the published current-slice text.` : `${screen.name} is missing from the published current-slice text.`
  ));
  checks.push(createScannerCheck(
    "Prototype honesty",
    "pass",
    "Live runtime can confirm root honesty here; prototype mirror alignment should be checked separately after runtime file changes."
  ));

  for (const check of checks) {
    if (check.state !== "pass") {
      warnings.push(`${check.label}: ${check.detail}`);
    }
  }

  const passCount = checks.filter((check) => check.state === "pass").length;
  const warnCount = checks.filter((check) => check.state === "warn").length;
  const failCount = checks.filter((check) => check.state === "fail").length;
  const overallState = failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass";

  const report = {
    overallState,
    passCount,
    warnCount,
    failCount,
    buildVersion: state.meta.buildVersion,
    currentScreen: {
      id: state.currentScreen,
      name: screen.name,
      region: screen.region
    },
    currentSpawn: state.currentSpawn,
    checkpoint: {
      screenId: state.checkpoint.screenId,
      spawnId: state.checkpoint.spawnId
    },
    keyFlags,
    objective: currentObjective,
    debugState: {
      overlay: state.debug,
      lineA: debugLines.lineA,
      lineB: debugLines.lineB
    },
    transitions,
    barrierStatuses,
    warnings,
    checks
  };

  debugToolState.lastScan = report;
  return report;
}

function buildFullDebugReport(report = runDebugScanner()) {
  const lines = [
    "ELDERFIELD DEBUG REPORT",
    "=======================",
    `Build Version: ${report.buildVersion}`,
    `Current Screen: ${report.currentScreen.id} - ${report.currentScreen.name}`,
    `Current Region: ${report.currentScreen.region}`,
    `Current Spawn: ${report.currentSpawn}`,
    `Checkpoint: ${report.checkpoint.screenId} (${report.checkpoint.spawnId})`,
    "",
    "Key Quest Flags:"
  ];

  if (report.keyFlags.length) {
    for (const flag of report.keyFlags) {
      lines.push(`- ${flag.name}: ${flag.value}`);
    }
  } else {
    lines.push("- none specific to this screen");
  }

  lines.push(
    "",
    "Objective:",
    `- ${report.objective}`,
    "",
    "Debug State:",
    `- overlay: ${report.debugState.overlay}`,
    `- lineA: ${report.debugState.lineA}`,
    `- lineB: ${report.debugState.lineB}`,
    "",
    "Transitions:"
  );

  if (report.transitions.length) {
    for (const transition of report.transitions) {
      lines.push(`- ${transition.to} (${transition.name}) via spawn '${transition.spawn}' [${transition.ok ? "ok" : "invalid"}]`);
    }
  } else {
    lines.push("- none");
  }

  lines.push("", "Thresholds / Gates:");
  if (report.barrierStatuses.length) {
    for (const entry of report.barrierStatuses) {
      lines.push(`- ${entry.label}: ${entry.state}`);
    }
  } else {
    lines.push("- none detected on this screen");
  }

  lines.push("", "Scanner Checks:");
  for (const check of report.checks) {
    lines.push(`- ${check.state.toUpperCase()}: ${check.label} - ${check.detail}`);
  }

  lines.push("", "Warnings:");
  if (report.warnings.length) {
    for (const warning of report.warnings) {
      lines.push(`- ${warning}`);
    }
  } else {
    lines.push("- none");
  }

  const text = lines.join("\n");
  debugToolState.lastReport = text;
  return text;
}

function renderScannerSummary(report) {
  if (!debugScanStatusEl || !debugScanStatusLabelEl || !debugScanStatusDetailEl || !debugScanSummaryEl) return;

  debugScanStatusEl.dataset.state = report.overallState;
  debugScanStatusLabelEl.textContent = report.overallState === "fail" ? "Fail" : report.overallState === "warn" ? "Pass With Warnings" : "Pass";
  debugScanStatusDetailEl.textContent = `${report.passCount} pass, ${report.warnCount} warn, ${report.failCount} fail`;

  debugScanSummaryEl.innerHTML = "";
  for (const check of report.checks) {
    const item = document.createElement("div");
    item.className = "debug-scan-item";

    const line = document.createElement("div");
    line.className = "debug-scan-line";

    const badge = document.createElement("span");
    badge.className = "debug-badge mono";
    badge.dataset.state = check.state;
    badge.textContent = check.state;

    const label = document.createElement("span");
    label.className = "strong";
    label.textContent = check.label;

    const detail = document.createElement("p");
    detail.className = "muted";
    detail.textContent = check.detail;

    line.appendChild(badge);
    line.appendChild(label);
    item.appendChild(line);
    item.appendChild(detail);
    debugScanSummaryEl.appendChild(item);
  }
}

function setDebugFeedback(text) {
  if (debugScanFeedbackEl) {
    debugScanFeedbackEl.textContent = text;
  }
}

function renderDebugReport(text) {
  if (debugReportEl) {
    debugReportEl.textContent = text;
  }
}

function runScannerAction() {
  const report = runDebugScanner();
  renderScannerSummary(report);
  setDebugFeedback(
    report.overallState === "fail"
      ? "Scan complete. Failures were found in the current runtime state."
      : report.overallState === "warn"
        ? "Scan complete. The runtime is playable, but the scanner found warnings to review."
        : "Scan complete. Runtime checks passed cleanly."
  );
  return report;
}

function runFullReportAction() {
  const report = runScannerAction();
  renderDebugReport(buildFullDebugReport(report));
  setDebugFeedback(
    report.overallState === "fail"
      ? "Full report generated with failures called out."
      : report.overallState === "warn"
        ? "Full report generated with warnings called out."
        : "Full report generated cleanly."
  );
  return report;
}

function copyTextFallback(text) {
  if (!document.createElement || !document.body) return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);

  if (typeof textarea.select === "function") {
    textarea.select();
  }
  if (typeof textarea.setSelectionRange === "function") {
    textarea.setSelectionRange(0, text.length);
  }

  let copied = false;
  if (typeof document.execCommand === "function") {
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
  }

  if (typeof textarea.remove === "function") {
    textarea.remove();
  } else if (document.body.removeChild) {
    document.body.removeChild(textarea);
  }

  return copied;
}

async function copyFullDebugReport() {
  const text = debugToolState.lastReport || buildFullDebugReport(runDebugScanner());

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      debugToolState.lastCopyResult = { ok: true, message: "Report copied to clipboard." };
      setDebugFeedback("Report copied to clipboard.");
      return debugToolState.lastCopyResult;
    } catch (error) {
      // Try fallback below.
    }
  }

  const copied = copyTextFallback(text);
  if (copied) {
    debugToolState.lastCopyResult = { ok: true, message: "Report copied with fallback copy support." };
    setDebugFeedback("Report copied with fallback copy support.");
    return debugToolState.lastCopyResult;
  }

  debugToolState.lastCopyResult = { ok: false, message: "Copy failed. Clipboard access was unavailable in this runtime." };
  setDebugFeedback("Copy failed. Clipboard access was unavailable in this runtime.");
  return debugToolState.lastCopyResult;
}

function updateHud() {
  const screen = screens[state.currentScreen];
  screenIdEl.textContent = state.currentScreen;
  screenNameEl.textContent = screen.name;
  screenRegionEl.textContent = screen.region;
  objectiveTextEl.textContent = objectiveText();
  renderInventory();
  updateSavePanel();
  updateBuildStatusPanel();
}

function commitProgress(reason) {
  syncDerivedProgress();
  updateHud();
  saveProgress(reason);
}

function showMessage(title, text) {
  state.message = { title, text };
  messageTitleEl.textContent = title;
  messageTextEl.textContent = text;
  messageBoxEl.classList.remove("hidden");
}

function hideMessage() {
  state.message = null;
  messageBoxEl.classList.add("hidden");
}

function hasLanternOfDawn() {
  return Boolean(state.items.lanternOfDawn);
}

function makeEnemy(config) {
  return {
    type: config.type,
    x: config.x,
    y: config.y,
    w: 12,
    h: 10,
    dir: config.dir || "left",
    speed: config.speed || 18,
    min: config.min ?? config.x - 16,
    max: config.max ?? config.x + 16,
    axis: config.axis || "x",
    hp: config.hp || 1,
    alive: true,
    touchDamage: 1
  };
}

function spawnEnemies(screen) {
  return screen.enemySpawns.map((config) => makeEnemy(config));
}

function loadScreen(id, spawn = "default", options = {}) {
  const screen = screens[id];
  const point = screen.spawns[spawn] || screen.spawns.default;

  state.currentScreen = id;
  state.currentSpawn = spawn;
  state.enemies = spawnEnemies(screen);
  state.player.x = point.x;
  state.player.y = point.y;
  const facingBySpawn = {
    south: "up",
    north: "down",
    east: "left",
    west: "right",
    terrace: "down"
  };
  state.player.dir = facingBySpawn[spawn] || "up";
  state.transitionCooldown = 0.25;
  updateCheckpoint(id, spawn);
  updateHud();

  if (!options.skipSave) {
    saveProgress(`Checkpoint saved: ${id}`);
  }
}

function drawLayer(layer) {
  for (const tile of layer) {
    atlas.drawSprite(ctx, tile.sprite, tile.x, tile.y);
  }
}

function drawBriar() {
  const screen = activeScreen();
  if (state.currentScreen === "BM-01") {
    if (state.quest.briarCleared || !screen.props.briar) return;
    const { x, y, w } = screen.props.briar;
    for (let offset = 0; offset < w; offset += atlas.tileSize) {
      atlas.drawSprite(ctx, "briar", x + offset, y);
    }
    return;
  }

  if (state.currentScreen === "BM-02") {
    if (state.quest.pilgrimBriarCleared || !screen.props.pilgrimBriar) return;
    const { x, y, w } = screen.props.pilgrimBriar;
    for (let offset = 0; offset < w; offset += atlas.tileSize) {
      atlas.drawSprite(ctx, "briar", x + offset, y);
    }
    return;
  }

  if (state.currentScreen === "HV-01") {
    if (state.quest.highroadGateCleared || !screen.props.highroadBriar) return;
    const { x, y, w } = screen.props.highroadBriar;
    for (let offset = 0; offset < w; offset += atlas.tileSize) {
      atlas.drawSprite(ctx, "briar", x + offset, y);
    }
    return;
  }

  if (state.currentScreen === "HV-03") {
    if (state.quest.watchersUpperBriarCleared || !screen.props.upperBriar) return;
    const { x, y, w } = screen.props.upperBriar;
    for (let offset = 0; offset < w; offset += atlas.tileSize) {
      atlas.drawSprite(ctx, "briar", x + offset, y);
    }
    return;
  }

  if (state.currentScreen === "HV-04") {
    if (!state.quest.watchgateOpen && screen.props.watchgateGateThorn) {
      const { x, y, w } = screen.props.watchgateGateThorn;
      for (let offset = 0; offset < w; offset += atlas.tileSize) {
        atlas.drawSprite(ctx, "briar", x + offset, y);
      }
    }

    if (!state.quest.watchgateWinchCleared && screen.props.watchgateWinchBriar) {
      const { x, y, w } = screen.props.watchgateWinchBriar;
      for (let offset = 0; offset < w; offset += atlas.tileSize) {
        atlas.drawSprite(ctx, "briar", x + offset, y);
      }
    }
  }

  if (state.currentScreen === "HV-10") {
    if (!state.quest.greyfenDescentBriarCleared && screen.props.descentBriar) {
      const { x, y, w } = screen.props.descentBriar;
      for (let offset = 0; offset < w; offset += atlas.tileSize) {
        atlas.drawSprite(ctx, "briar", x + offset, y);
      }
    }
  }

  if (state.currentScreen === "GF-06") {
    if (!state.quest.memorialFlatsPathCleared && screen.props.graveBriar) {
      const { x, y, w } = screen.props.graveBriar;
      for (let offset = 0; offset < w; offset += atlas.tileSize) {
        atlas.drawSprite(ctx, "briar", x + offset, y);
      }
    }
  }

  if (state.currentScreen === "GF-10") {
    if (!state.quest.fenwatchWinchCleared && screen.props.winchBriar) {
      const { x, y, w } = screen.props.winchBriar;
      for (let offset = 0; offset < w; offset += atlas.tileSize) {
        atlas.drawSprite(ctx, "briar", x + offset, y);
      }
    }
  }
}

function drawCache() {
  const screen = activeScreen();
  if (screen.props.cache) {
    const cache = screen.props.cache;
    atlas.drawSprite(ctx, state.rewards.watchCacheCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.pilgrimCache) {
    const cache = screen.props.pilgrimCache;
    atlas.drawSprite(ctx, state.rewards.pilgrimCacheCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.spurCache) {
    const cache = screen.props.spurCache;
    atlas.drawSprite(ctx, state.rewards.highroadSupplyCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.stepsCache) {
    const cache = screen.props.stepsCache;
    atlas.drawSprite(ctx, state.rewards.watchersCacheCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.wallCache) {
    const cache = screen.props.wallCache;
    atlas.drawSprite(ctx, state.rewards.watchgateWallCacheCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.nicheCache) {
    const cache = screen.props.nicheCache;
    atlas.drawSprite(ctx, state.rewards.greyfenNicheCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.marshCache) {
    const cache = screen.props.marshCache;
    atlas.drawSprite(ctx, state.rewards.marshfootChestCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.dockCache) {
    const cache = screen.props.dockCache;
    atlas.drawSprite(ctx, state.rewards.ferrymanDockCacheCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.tombCache) {
    const cache = screen.props.tombCache;
    atlas.drawSprite(ctx, state.rewards.memorialTombCollected ? "chestOpen" : "chestClosed", cache.x, cache.y);
  }

  if (screen.props.ledgeCache) {
    const cache = screen.props.ledgeCache;
    atlas.drawSprite(ctx, "chestClosed", cache.x, cache.y);
  }
}

function drawNpc() {
  const screen = activeScreen();
  if (!screen.props.npc) return;
  const npc = screen.props.npc;
  atlas.drawSprite(ctx, "npcCaretaker", npc.x, npc.y);
}

function drawEnemy(enemy) {
  if (!enemy.alive) return;
  atlas.drawSprite(ctx, "enemyHound", Math.round(enemy.x) - 2, Math.round(enemy.y) - 4, {
    flipX: enemy.dir === "left"
  });
}

function attackHitbox() {
  const player = state.player;
  switch (player.dir) {
    case "up":
      return rect(player.x - 2, player.y - 8, 14, 8);
    case "down":
      return rect(player.x - 2, player.y + player.h, 14, 8);
    case "left":
      return rect(player.x - 8, player.y - 2, 8, 14);
    default:
      return rect(player.x + player.w, player.y - 2, 8, 14);
  }
}

function drawPlayer() {
  const player = state.player;
  let sprite = "playerDown";
  if (player.dir === "up") sprite = "playerUp";
  if (player.dir === "left") sprite = "playerLeft";
  if (player.dir === "right") sprite = "playerRight";
  atlas.drawSprite(ctx, sprite, Math.round(player.x) - 3, Math.round(player.y) - 4);

  if (player.attackTimer > 0) {
    const hitbox = attackHitbox();
    const slashSprite = player.dir === "left" || player.dir === "right" ? "slashH" : "slashV";
    const drawX = player.dir === "left" ? hitbox.x - 4 : hitbox.x;
    const drawY = player.dir === "up" ? hitbox.y - 4 : hitbox.y;
    atlas.drawSprite(ctx, slashSprite, drawX, drawY, {
      flipX: player.dir === "left",
      flipY: player.dir === "up"
    });
  }
}

function drawRuneGlow() {
  const screen = activeScreen();
  if (!screen.props.landmark) return;
  if (state.currentScreen === "BM-01" && !state.quest.landmarkRead) return;
  const { x, y, w } = screen.props.landmark;
  const centerX = x + Math.floor(w / 2);
  const topY = y + 14;
  ctx.save();
  ctx.fillStyle = atlas.palette.rune;
  ctx.fillRect(centerX - 7, topY, 2, 5);
  ctx.fillRect(centerX - 1, topY + 4, 2, 2);
  ctx.fillRect(centerX + 5, topY, 2, 5);
  ctx.restore();
}

function getMarshalPresenceCueState() {
  const active = state.currentScreen === "FC-04" && state.quest.marshalConfrontationWitnessed;
  const phase = active ? (Math.sin(state.lastTime * 0.004) + 1) / 2 : 0;
  return {
    active,
    phase,
    label: active ? "held" : "dormant"
  };
}

function drawMarshalPresenceCue() {
  const cue = getMarshalPresenceCueState();
  if (!cue.active) return;

  const screen = activeScreen();
  const { x, y, w, h } = screen.props.landmark;
  const sideAlpha = 0.08 + cue.phase * 0.08;
  const baseAlpha = 0.18 + cue.phase * 0.08;

  ctx.save();
  ctx.fillStyle = `rgba(213, 202, 142, ${sideAlpha.toFixed(3)})`;
  ctx.fillRect(x + 8, y + 10, 1, h - 18);
  ctx.fillRect(x + w - 9, y + 10, 1, h - 18);
  ctx.fillStyle = `rgba(21, 18, 16, ${baseAlpha.toFixed(3)})`;
  ctx.fillRect(x + 6, y + h - 11, w - 12, 3);
  ctx.fillRect(x + 12, y + h - 14, w - 24, 1);
  ctx.restore();
}

function drawHearts() {
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = "#241816";
    ctx.fillRect(10 + i * 14, 10, 12, 8);
    ctx.fillStyle = i < state.player.hp ? "#cf5c55" : "#4b2624";
    ctx.fillRect(11 + i * 14, 11, 10, 6);
  }
}

function drawPromptLine(text) {
  if (!text) return;
  const width = text.length * 6 + 14;
  const x = WIDTH / 2 - width / 2;
  const y = HEIGHT - 18;
  ctx.fillStyle = "rgba(13, 11, 10, 0.88)";
  ctx.fillRect(x, y, width, 12);
  ctx.strokeStyle = "#d1c089";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 11);
  drawPixelText(text, x + width / 2, y + 8, "#efe8d0", "center");
}

function drawPixelText(text, x, y, color = "#efe8d0", align = "left") {
  ctx.fillStyle = color;
  ctx.font = '8px "Courier New", monospace';
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function drawDebugOverlay() {
  if (!state.debug) return;

  ctx.save();
  ctx.fillStyle = "rgba(12, 11, 10, 0.86)";
  ctx.fillRect(8, 26, 170, 70);
  ctx.strokeStyle = "#d5ca8e";
  ctx.strokeRect(8.5, 26.5, 169, 69);
  const { lineA, lineB } = getDebugLines();
  drawPixelText(`x:${Math.round(state.player.x)} y:${Math.round(state.player.y)} dir:${state.player.dir}`, 14, 40);
  drawPixelText(lineA, 14, 52);
  drawPixelText(lineB, 14, 64);
  drawPixelText(`paused:${state.paused} prompt:${state.prompt ? "yes" : "no"}`, 14, 76);
  drawPixelText("` toggles debug", 14, 88, "#d5ca8e");

  ctx.strokeStyle = "rgba(237, 208, 117, 0.75)";
  for (const solid of getSolids()) {
    ctx.strokeRect(solid.x + 0.5, solid.y + 0.5, solid.w, solid.h);
  }

  ctx.strokeStyle = "rgba(104, 190, 255, 0.75)";
  for (const target of getInteractionTargets()) {
    ctx.strokeRect(target.rect.x + 0.5, target.rect.y + 0.5, target.rect.w, target.rect.h);
  }
  ctx.restore();
}

function drawPauseOverlay() {
  if (!state.paused) return;

  ctx.fillStyle = "rgba(10, 8, 7, 0.72)";
  ctx.fillRect(76, 66, 168, 60);
  ctx.strokeStyle = "#d5ca8e";
  ctx.strokeRect(76.5, 66.5, 167, 59);
  drawPixelText("Paused", WIDTH / 2, 86, "#efe0a7", "center");
  drawPixelText("Press Escape to resume", WIDTH / 2, 100, "#efe8d0", "center");
  drawPixelText("Press ` for debug boxes", WIDTH / 2, 112, "#d5ca8e", "center");
}

function drawPrompt() {
  if (!state.prompt || state.message || state.paused) return;
  drawPromptLine(state.prompt.text);
}

function drawScene() {
  const screen = activeScreen();
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawLayer(screen.layers.ground);
  drawLayer(screen.layers.mid);
  drawBriar();
  drawCache();
  drawRuneGlow();
  drawMarshalPresenceCue();
  drawNpc();

  for (const enemy of state.enemies) {
    drawEnemy(enemy);
  }

  drawPlayer();
  drawHearts();
  drawPixelText(screen.name, WIDTH - 12, 16, "#efe0a7", "right");
  drawPrompt();
  drawDebugOverlay();
  drawPauseOverlay();
}

function getSolids() {
  const screen = activeScreen();
  const solids = screen.baseSolids.map((box) => ({ ...box }));
  if (state.currentScreen === "BM-01" && !state.quest.briarCleared && screen.props.briar) {
    solids.push({ ...screen.props.briar });
  }
  if (state.currentScreen === "BM-02" && !state.quest.pilgrimBriarCleared && screen.props.pilgrimBriar) {
    solids.push({ ...screen.props.pilgrimBriar });
  }
  if (state.currentScreen === "HV-01" && !state.quest.highroadGateCleared && screen.props.highroadBriar) {
    solids.push({ ...screen.props.highroadBriar });
  }
  if (state.currentScreen === "HV-03" && !state.quest.watchersUpperBriarCleared && screen.props.upperBriar) {
    solids.push({ ...screen.props.upperBriar });
  }
  if (state.currentScreen === "HV-04") {
    if (!state.quest.watchgateOpen && screen.props.watchgateGateThorn) {
      solids.push({ ...screen.props.watchgateGateThorn });
    }
    if (!state.quest.watchgateWinchCleared && screen.props.watchgateWinchBriar) {
      solids.push({ ...screen.props.watchgateWinchBriar });
    }
  }
  if (state.currentScreen === "HV-06" && !state.quest.waysideEchoResolved && screen.props.northSeal) {
    solids.push({ ...screen.props.northSeal });
  }
  if (state.currentScreen === "HV-10") {
    if (!state.quest.greyfenDescentBriarCleared && screen.props.descentBriar) {
      solids.push({ ...screen.props.descentBriar });
    }
    if (!state.quest.greyfenDescentOpen && screen.props.southSeal) {
      solids.push({ ...screen.props.southSeal });
    }
  }
  if (state.currentScreen === "GF-06" && !state.quest.memorialFlatsPathCleared && screen.props.graveBriar) {
    solids.push({ ...screen.props.graveBriar });
  }
  if (state.currentScreen === "GF-07" && !state.quest.causewayClear && screen.props.southSeal) {
    solids.push({ ...screen.props.southSeal });
  }
  if (state.currentScreen === "GF-10" && !state.quest.fenwatchWinchCleared && screen.props.doorSeal) {
    solids.push({ ...screen.props.doorSeal });
  }
  if (state.currentScreen === "FC-01" && !state.quest.hallNamesWitnessed && screen.props.innerSeal) {
    solids.push({ ...screen.props.innerSeal });
  }
  if (state.currentScreen === "FC-02" && !state.quest.echoAbandonmentWitnessed && screen.props.northSeal) {
    solids.push({ ...screen.props.northSeal });
  }
  if (state.currentScreen === "FC-03" && !state.quest.wardenTestimonyWitnessed && screen.props.northSeal) {
    solids.push({ ...screen.props.northSeal });
  }
  return solids;
}

function collidesWithSolids(box) {
  return getSolids().some((solid) => overlaps(box, solid));
}

function movePlayerAxis(dx, dy) {
  const next = {
    x: clamp(state.player.x + dx, 0, WIDTH - state.player.w),
    y: clamp(state.player.y + dy, 0, HEIGHT - state.player.h),
    w: state.player.w,
    h: state.player.h
  };

  if (!collidesWithSolids(next)) {
    state.player.x = next.x;
    state.player.y = next.y;
  }
}

function movePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keysDown.has("ArrowLeft") || keysDown.has("KeyA")) dx -= 1;
  if (keysDown.has("ArrowRight") || keysDown.has("KeyD")) dx += 1;
  if (keysDown.has("ArrowUp") || keysDown.has("KeyW")) dy -= 1;
  if (keysDown.has("ArrowDown") || keysDown.has("KeyS")) dy += 1;

  if (dx === 0 && dy === 0) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    state.player.dir = dx > 0 ? "right" : "left";
  } else {
    state.player.dir = dy > 0 ? "down" : "up";
  }

  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = state.player.speed * dt;

  movePlayerAxis((dx / length) * speed, 0);
  movePlayerAxis(0, (dy / length) * speed);
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    const delta = enemy.speed * dt;
    if (enemy.axis === "x") {
      enemy.x += enemy.dir === "right" ? delta : -delta;
      if (enemy.x <= enemy.min) enemy.dir = "right";
      if (enemy.x >= enemy.max) enemy.dir = "left";
    } else {
      enemy.y += enemy.dir === "down" ? delta : -delta;
      if (enemy.y <= enemy.min) enemy.dir = "down";
      if (enemy.y >= enemy.max) enemy.dir = "up";
    }

    if (state.player.invincibleTimer <= 0 && overlaps(state.player, enemy)) {
      state.player.hp -= enemy.touchDamage;
      state.player.invincibleTimer = 1;
      if (state.player.hp <= 0) {
        state.player.hp = 3;
        loadScreen(state.currentScreen, "south", { skipSave: true });
        showMessage("Fallen", "This slice keeps the failure loop simple: you stand back up at the south road so the screen stays easy to read and replay.");
        return;
      }
    }
  }
}

function attackEnemies() {
  if (!justPressed("KeyJ") || state.player.attackTimer > 0) return;
  state.player.attackTimer = 0.18;
  const hitbox = attackHitbox();

  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    if (overlaps(hitbox, enemy)) {
      enemy.hp -= 1;
      if (enemy.hp <= 0) {
        enemy.alive = false;
      }
    }
  }
}

function interactionSearchBox() {
  return rect(state.player.x - 10, state.player.y - 10, state.player.w + 20, state.player.h + 20);
}

function getInteractionTargets() {
  const screen = activeScreen();
  const targets = [];

  if (state.currentScreen === "HV-01") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read roadstone",
      onInteract: () => showMessage("Roadstone", "The old Highroad stone still bears a Warden mark beneath the soot. Rowan Hollow was never truly outside the kingdom's sacred road network.")
    });

    targets.push({
      rect: screen.props.highroadBriar,
      label: state.quest.highroadGateCleared ? "Gate cleared" : "Burn road briars",
      onInteract: () => {
        if (state.quest.highroadGateCleared) {
          showMessage("Highroad Gate", "The thorns are gone. The upland road now reads as a real continuation, not a promise cut short.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The Highroad spur is choked by the same black thorn that sealed other sacred routes.");
          return;
        }
        state.quest.highroadGateCleared = true;
        commitProgress("Route saved: Highroad spur opened");
        showMessage("Highroad Gate", "Sacred fire burns the thorn wall back to the stones. The first true Highroad route opens ahead.");
      }
    });

    targets.push({
      rect: screen.props.spurCache,
      label: state.rewards.highroadSupplyCollected ? "Inspect supply chest" : "Open supply chest",
      onInteract: () => {
        if (!state.rewards.highroadSupplyCollected) {
          state.rewards.highroadSupplyCollected = true;
          commitProgress("Reward saved: Highroad supply chest collected");
          showMessage("Supply Chest", "Inside rests lamp oil, old road cord, and a weather-stiff satchel strap. The chest is small, but the shoulder nook earns its place by being clearly authored.");
          return;
        }
        showMessage("Supply Chest", "The supply chest sits empty in the east shoulder niche, but the pocket still reads as a deliberate detour.");
      }
    });

    targets.push({
      rect: screen.props.southWaypost,
      label: "Read south waypost",
      onInteract: () => showMessage("South Waypost", "Rowan Hollow lies below the rise. Even here, the valley still feels close enough to return to.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.highroadGateCleared ? "Look north" : "Road blocked",
      onInteract: () => {
        if (!state.quest.highroadGateCleared) {
          showMessage("North Road", "The Highroad is still sealed by black thorn. Burn the choke and the climb will open again.");
          return;
        }
        showMessage("North Road", "The old stones climb on toward Watcher's Steps. This is where the wider Highroad rebuild should continue next.");
      }
    });

    return targets;
  }

  if (state.currentScreen === "HV-02") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read saint marker",
      onInteract: () => showMessage("Saint Marker", "A saint of the old road lies half-broken in the turf, turned from shrine to milestone. The Steps still feel ceremonial even in ruin, which is exactly the memory this climb needs.")
    });

    targets.push({
      rect: screen.props.stepsCache,
      label: state.rewards.watchersCacheCollected ? "Inspect herb satchel" : "Open herb satchel",
      onInteract: () => {
        if (!state.rewards.watchersCacheCollected) {
          state.rewards.watchersCacheCollected = true;
          commitProgress("Reward saved: Watcher's herb satchel collected");
          showMessage("Herb Satchel", "A dry satchel of vale herbs rests in the west alcove. The reward is modest, but the pocket proves the climb was authored, not just left over around the road.");
          return;
        }
        showMessage("Herb Satchel", "The satchel is empty now, but the alcove still reads as a deliberate roadside pause.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Road", "The gate below still points back toward Rowan Hollow. Even one screen higher, the valley remains part of the route's emotional logic.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look north",
      onInteract: () => showMessage("North Steps", "The old road narrows and rises again toward Watcher's Steps Upper. This chain now has enough stability to continue forward without falling back to benchmark-only space.")
    });

    return targets;
  }

  if (state.currentScreen === "HV-03") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read overlook stone",
      onInteract: () => showMessage("Overlook Stone", "Mist from Greyfen hangs below the road while the climb bends toward Watchgate above. This is the first place the Highroad feels like a wounded kingdom spine instead of a local path.")
    });

    targets.push({
      rect: screen.props.upperBriar,
      label: state.quest.watchersUpperBriarCleared ? "Ramp cleared" : "Burn wagon choke",
      onInteract: () => {
        if (state.quest.watchersUpperBriarCleared) {
          showMessage("North Ramp", "The wagon choke is gone. The upper road now points cleanly toward Watchgate.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The thorn-black wagon pile still seals the north ramp.");
          return;
        }
        state.quest.watchersUpperBriarCleared = true;
        commitProgress("Route saved: Watcher's Steps Upper ramp opened");
        showMessage("North Ramp", "The Lantern burns the choke apart and the road opens toward the ruined gateworks above.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Road", "From here the lower steps and the first Highroad gate fall into one remembered line. The chain is finally beginning to hold together.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.watchersUpperBriarCleared ? "Look to Watchgate" : "Road blocked",
      onInteract: () => {
        if (!state.quest.watchersUpperBriarCleared) {
          showMessage("North Road", "A thorn-choked wagon barricade still blocks the climb to Watchgate.");
          return;
        }
        showMessage("North Road", "Watchgate's broken crown rises ahead. The next real Highroad screen belongs there, not back in benchmark space.");
      }
    });

    targets.push({
      rect: screen.props.eastLookout,
      label: "Inspect east ledge",
      onInteract: () => showMessage("East Ledge", "A narrow ledge drops away toward Greyfen. Something useful could be reached there later with the right pull across the gap, which is exactly the kind of remembered future pocket this road needs.")
    });

    return targets;
  }

  if (state.currentScreen === "HV-04") {
    targets.push({
      rect: screen.props.gateStone,
      label: "Read gate oath",
      onInteract: () => showMessage("Gate Oath", "Watchgate is more than a bend in the road. Twin ward towers, braziers, and the lift winch make it feel like a kingdom threshold that once chose who passed into the higher vale.")
    });

    targets.push({
      rect: screen.props.leftBrazier,
      label: state.quest.watchgateLeftLit ? "Inspect left brazier" : "Light left brazier",
      onInteract: () => {
        if (state.quest.watchgateLeftLit) {
          showMessage("Left Brazier", "The left brazier already burns with Lantern fire. One side of Watchgate has remembered its duty.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The cold brazier wants sacred fire before the court can answer the road.");
          return;
        }
        state.quest.watchgateLeftLit = true;
        commitProgress("Route saved: Watchgate left brazier lit");
        if (state.quest.watchgateOpen) {
          showMessage("Left Brazier", "The last ember catches and the old gate finally yields. Watchgate now reads like a living threshold instead of a dead facade.");
          return;
        }
        showMessage("Left Brazier", "Sacred flame wakes the left brazier. Half the court is answered; the gate still waits on the rest.");
      }
    });

    targets.push({
      rect: screen.props.rightBrazier,
      label: state.quest.watchgateRightLit ? "Inspect right brazier" : "Light right brazier",
      onInteract: () => {
        if (state.quest.watchgateRightLit) {
          showMessage("Right Brazier", "The right brazier is already lit, throwing a warm mark against the broken gate stones.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The right brazier remains cold until the Lantern of Dawn touches it.");
          return;
        }
        state.quest.watchgateRightLit = true;
        commitProgress("Route saved: Watchgate right brazier lit");
        if (state.quest.watchgateOpen) {
          showMessage("Right Brazier", "The second flame takes hold and the gate answers at last. The court now has a stronger sense of purpose than any ordinary road screen.");
          return;
        }
        showMessage("Right Brazier", "The right brazier wakes. The court feels more ceremonial now, but the winch still holds the road closed.");
      }
    });

    targets.push({
      rect: screen.props.watchgateWinchBriar,
      label: state.quest.watchgateWinchCleared ? "Inspect cleared winch" : "Burn winch briars",
      onInteract: () => {
        if (state.quest.watchgateWinchCleared) {
          showMessage("Gate Winch", "The winch stands clear again. Even broken machinery gives the court a sense of purpose beyond simple scenery.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The winch is still strangled by black thorn.");
          return;
        }
        state.quest.watchgateWinchCleared = true;
        commitProgress("Route saved: Watchgate winch cleared");
        if (state.quest.watchgateOpen) {
          showMessage("Gate Winch", "With the briars burned back, the old mechanism answers the lit braziers and the gate lifts clear of the road.");
          return;
        }
        showMessage("Gate Winch", "The winch is clear now, but the gate still waits for both braziers to answer.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Court", "The climb below now reads in one unbroken line: spur gate, lower steps, upper road, then this court. The Highroad chain is holding together.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.watchgateOpen ? "Look beyond gate" : "Gate sealed",
      onInteract: () => {
        if (!state.quest.watchgateOpen) {
          showMessage("North Gate", "Watchgate is still sealed. Light both braziers and free the winch so the court can fulfill its purpose.");
          return;
        }
        showMessage("North Gate", "The gate stands open onto the higher road beyond. The next production screen can continue forward cleanly from here without breaking the law.");
      }
    });

    targets.push({
      rect: screen.props.bannerRack,
      label: "Inspect banner rack",
      onInteract: () => showMessage("Banner Rack", "Only splintered poles and a strip of blue cloth remain. It is a tiny detail, but it helps the court feel like a guarded place that once mattered, not just a shape in the route.")
    });

    return targets;
  }

  if (state.currentScreen === "HV-05") {
    targets.push({
      rect: screen.props.wallMarker,
      label: "Read wall marker",
      onInteract: () => showMessage("Wall Marker", "From the upper wall the kingdom finally opens in two directions at once: the capital road bridge far off in ruin, and Greyfen lying low beneath the mist. Watchgate feels like a real boundary from here, not merely another climb.")
    });

    targets.push({
      rect: screen.props.wallCache,
      label: state.rewards.watchgateWallCacheCollected ? "Inspect turret chest" : "Open turret chest",
      onInteract: () => {
        if (!state.rewards.watchgateWallCacheCollected) {
          state.rewards.watchgateWallCacheCollected = true;
          commitProgress("Reward saved: Watchgate turret chest collected");
          showMessage("Turret Chest", "Inside rests the Gate Banner Clasp wrapped in old oilcloth. It is a small reward, but the west turret pocket now proves the wall is a place to own and remember, not just pass through.");
          return;
        }
        showMessage("Turret Chest", "The turret chest is empty now, but the west pocket still reads as a deliberate piece of the wall's design.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Wall", "Below you, the whole approach resolves at once: the gate court, the upper climb, the lower steps, and the spur beyond. Watchgate finally feels vertical and coherent.")
    });

    targets.push({
      rect: screen.props.eastDrop,
      label: "Inspect east drop",
      onInteract: () => showMessage("East Drop", "A service descent carries the road down toward the Bell of the Wayside. The wall no longer feels isolated; it now hands the route forward into memory.")
    });

    return targets;
  }

  if (state.currentScreen === "HV-06") {
    const makeWaysideBrazier = (rect, questKey, title) => ({
      rect,
      label: state.quest[questKey] ? `Inspect ${title.toLowerCase()}` : `Light ${title.toLowerCase()}`,
      onInteract: () => {
        if (state.quest[questKey]) {
          showMessage(title, `${title} already burns with Lantern fire. The wayside keeps count even when the road does not.`);
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The shrine waits on sacred fire before the bell will answer.");
          return;
        }
        state.quest[questKey] = true;
        commitProgress(`Route saved: ${title} lit`);
        if (state.quest.waysideEchoResolved) {
          showMessage(title, "The fourth flame answers with a low bell-shudder through the stones. The Wayside is awake, and the north road no longer feels mute.");
          return;
        }
        showMessage(title, `${title} catches and steadies. One more part of the shrine remembers what the road once was.`);
      }
    });

    targets.push({
      rect: screen.props.bellShrine,
      label: "Read bell shrine",
      onInteract: () => showMessage("Bell Shrine", "Offerings of wax, cord, and weathered flowers have piled here for generations. Even after the kingdom forgot the oath behind it, people still stopped at this bell to ask the road to remember them.")
    });

    targets.push(makeWaysideBrazier(screen.props.upperLeftBrazier, "waysideUpperLeftLit", "Upper Left Brazier"));
    targets.push(makeWaysideBrazier(screen.props.upperRightBrazier, "waysideUpperRightLit", "Upper Right Brazier"));
    targets.push(makeWaysideBrazier(screen.props.lowerLeftBrazier, "waysideLowerLeftLit", "Lower Left Brazier"));
    targets.push(makeWaysideBrazier(screen.props.lowerRightBrazier, "waysideLowerRightLit", "Lower Right Brazier"));

    targets.push({
      rect: screen.props.altarTablet,
      label: state.rewards.waysideTabletRead ? "Read altar tablet" : "Inspect altar tablet",
      onInteract: () => {
        if (!state.quest.waysideEchoResolved) {
          showMessage("Altar Tablet", "Soot and coin offerings hide the inscription. The bell needs all four fires before the stone will yield its testimony.");
          return;
        }
        if (!state.rewards.waysideTabletRead) {
          state.rewards.waysideTabletRead = true;
          commitProgress("Lore saved: Wayside altar tablet read");
          showMessage("Altar Tablet", "The tablet names the Sundering as a wound carried by the road, not a triumph. That one line makes the bell feel like history speaking forward instead of decoration.");
          return;
        }
        showMessage("Altar Tablet", "Pilgrims carved names into the stone lip below the text. The road stayed sacred here long after the kingdom lost the language for why.");
      }
    });

    targets.push({
      rect: screen.props.westThreshold,
      label: "Look west",
      onInteract: () => showMessage("West Road", "The wall descent and Watchgate rise behind you. The route into the Wayside now feels like a deliberate handoff from fortification to memory.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.waysideEchoResolved ? "Look north" : "Road waiting",
      onInteract: () => {
        if (!state.quest.waysideEchoResolved) {
          showMessage("North Road", "The road beyond the bell waits in silence. Light all four braziers and let the shrine answer before pushing on.");
          return;
        }
        showMessage("North Road", "The bell has answered and the north road stands ready for Shepherd's Rest. The next production screen should continue there.");
      }
    });

    return targets;
  }

  if (state.currentScreen === "HV-07") {
    targets.push({
      rect: screen.props.npc,
      label: "Talk to Yselle",
      onInteract: () => showMessage("Yselle", "This is where the road remembers how to breathe. Traders, mourners, and shepherds still stop here even now, because the Highroad feels less alone once a fire is kept for the next traveler.")
    });

    targets.push({
      rect: screen.props.landmark,
      label: "Read rest stone",
      onInteract: () => showMessage("Rest Stone", "The stone marks Shepherd's Rest as a place of keeping, not conquest. That shift matters: after Watchgate's defenses and the bell's testimony, the road finally offers shelter instead of command.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Road", "The Bell of the Wayside and Watchgate lie back down the slope. The road behind you now carries a readable sequence of fortification, memory, and rest.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look north",
      onInteract: () => showMessage("North Road", "The northern rise leaves Shepherd's Rest and climbs toward harsher country. The next production screen can continue there without needing a new visual language.")
    });

    targets.push({
      rect: screen.props.eastMarker,
      label: "Inspect east marker",
      onInteract: () => showMessage("East Marker", "The east road bends toward the old toll line. Even unopened, it reads as one branch of a real crossroads rather than decorative space.")
    });

    targets.push({
      rect: screen.props.southeastMarker,
      label: "Inspect southeast branch",
      onInteract: () => showMessage("Southeast Branch", "The lower branch now leads into Greyfen Descent. Shepherd's Rest finally hands the main route down into the marsh approach instead of only promising it.")
    });

    return targets;
  }

  if (state.currentScreen === "HV-10") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read descent stone",
      onInteract: () => showMessage("Descent Stone", "Here the Highroad stops feeling lofty and begins to bow toward the drowned lowlands. The old marker was meant to steady travelers before the mist took the horizon from them.")
    });

    const makeDescentBrazier = (rect, questKey, title) => ({
      rect,
      label: state.quest[questKey] ? `Inspect ${title.toLowerCase()}` : `Light ${title.toLowerCase()}`,
      onInteract: () => {
        if (state.quest[questKey]) {
          showMessage(title, `${title} already burns with Lantern fire. The descent keeps its warning light alive.`);
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The descent brazier waits for sacred flame before the road can be trusted further.");
          return;
        }
        state.quest[questKey] = true;
        commitProgress(`Route saved: ${title} lit`);
        if (state.quest.greyfenDescentOpen) {
          showMessage(title, "The last warning light answers and the Greyfen road feels safe enough to claim. The slope below is still ominous, but no longer unreadable.");
          return;
        }
        showMessage(title, `${title} catches and holds. The descent is becoming legible as a real route, not a void.`);
      }
    });

    targets.push(makeDescentBrazier(screen.props.leftBrazier, "greyfenDescentLeftLit", "Left Descent Brazier"));
    targets.push(makeDescentBrazier(screen.props.rightBrazier, "greyfenDescentRightLit", "Right Descent Brazier"));

    targets.push({
      rect: screen.props.descentBriar,
      label: state.quest.greyfenDescentBriarCleared ? "Inspect cleared switchback" : "Burn switchback thorn",
      onInteract: () => {
        if (state.quest.greyfenDescentBriarCleared) {
          showMessage("Switchback Thorn", "The corruption-thorn is gone. The road can finally sag toward Greyfen instead of dying on the stone.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The switchback is still choked by corruption-thorn.");
          return;
        }
        state.quest.greyfenDescentBriarCleared = true;
        commitProgress("Route saved: Greyfen switchback cleared");
        if (state.quest.greyfenDescentOpen) {
          showMessage("Switchback Thorn", "The thorn burns away and the descent opens fully. The last dry turn of Highroad now gives way to Greyfen below.");
          return;
        }
        showMessage("Switchback Thorn", "The thorn blackens and falls, revealing the east wall niche and the safer line of the descent.");
      }
    });

    targets.push({
      rect: screen.props.nicheCache,
      label: state.rewards.greyfenNicheCollected ? "Inspect niche chest" : "Open niche chest",
      onInteract: () => {
        if (!state.quest.greyfenDescentBriarCleared) {
          showMessage("Niche Chest", "You can spot the chest tucked into the east wall, but the switchback thorn still owns the approach.");
          return;
        }
        if (!state.rewards.greyfenNicheCollected) {
          state.rewards.greyfenNicheCollected = true;
          commitProgress("Reward saved: Greyfen niche chest collected");
          showMessage("Niche Chest", "Inside rests waxed cord and a marsh-wrapped charm. It is a small find, but the east pocket helps the descent feel authored instead of merely functional.");
          return;
        }
        showMessage("Niche Chest", "The niche chest is empty now, but the east wall pocket still reads as a deliberate roadside hold.");
      }
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look back to Shepherd's Rest",
      onInteract: () => showMessage("Upper Road", "Shepherd's Rest is still close enough to feel warm behind you, which makes the drop toward Greyfen feel sharper and more deliberate.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: state.quest.greyfenDescentOpen ? "Look down to Greyfen" : "Descent blocked",
      onInteract: () => {
        if (!state.quest.greyfenDescentOpen) {
          showMessage("Lower Descent", "The Greyfen road is not ready yet. Clear the switchback thorn and light both descent braziers before committing the turn downward.");
          return;
        }
        showMessage("Lower Descent", "The stone road sags into wet earth and vanishes into fog. Marshfoot waits below as the first true Greyfen threshold, not a full swamp reveal.");
      }
    });

    return targets;
  }

  if (state.currentScreen === "GF-01") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read marsh stone",
      onInteract: () => showMessage("Marsh Stone", "The last upright roadstone here marks not a border of kingdoms, but a border of certainty. Beyond it the Highroad must learn to survive on softer ground without losing its memory.")
    });

    targets.push({
      rect: screen.props.marshCache,
      label: state.rewards.marshfootChestCollected ? "Inspect marsh cache" : "Open marsh cache",
      onInteract: () => {
        if (!state.rewards.marshfootChestCollected) {
          state.rewards.marshfootChestCollected = true;
          commitProgress("Reward saved: Marshfoot cache collected");
          showMessage("Marsh Cache", "Inside rests waxed cord, a sealed candle stub, and dry wrapping for road maps. The pocket is small, but it proves the route is still hand-kept even where the upland stone begins to fail.");
          return;
        }
        showMessage("Marsh Cache", "The cache is empty now, but the west shoulder nook still reads as a deliberate hold at the edge of Greyfen.");
      }
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look back uphill",
      onInteract: () => showMessage("Upper Road", "Greyfen Descent still rises behind you in dry, old stone. Marshfoot works because the Highroad remains visible in memory even as the land begins to soften.")
    });

    targets.push({
      rect: screen.props.eastMarker,
      label: "Inspect east marker",
      onInteract: () => showMessage("East Marker", "A drowned post leans toward Ferryman's Reach, where Greyfen first becomes a place people still keep instead of a road the kingdom abandoned.")
    });

    targets.push({
      rect: screen.props.westMarker,
      label: "Inspect west marker",
      onInteract: () => showMessage("West Marker", "A split marker points toward the reed road. That branch belongs to a later return, not this main-route pass.")
    });

    return targets;
  }

  if (state.currentScreen === "GF-02") {
    targets.push({
      rect: screen.props.npc,
      label: "Talk to Toma",
      onInteract: () => {
        if (state.npcPhases.toma === "waiting") {
          state.npcPhases.toma = "met";
          commitProgress("Dialogue saved: Toma met");
          showMessage("Toma", "No one crosses Greyfen clean anymore. They stop here, leave a ribbon or a coin, and ask the Reach to remember the names the marsh keeps taking. That is enough to make this place feel inhabited, not merely traversed.");
          return;
        }
        if (state.rewards.ferrymanDockCacheCollected) {
          showMessage("Toma", "Now it sits right. Hut, dock, offerings, and cache all read like one kept edge of the world instead of scattered props in wet ground.");
          return;
        }
        showMessage("Toma", "The little dock cache is still tucked behind the memorial posts. Even in Greyfen, a good road keeps one useful kindness close to hand.");
      }
    });

    targets.push({
      rect: screen.props.landmark,
      label: "Read reach stone",
      onInteract: () => showMessage("Reach Stone", "The stone names this place not for ownership, but for passing and return. Ferryman's Reach is where the road stops commanding the land and starts pleading with it.")
    });

    targets.push({
      rect: screen.props.dockCache,
      label: state.rewards.ferrymanDockCacheCollected ? "Inspect dock cache" : "Open dock cache",
      onInteract: () => {
        if (!state.rewards.ferrymanDockCacheCollected) {
          state.rewards.ferrymanDockCacheCollected = true;
          commitProgress("Reward saved: Ferryman dock cache collected");
          showMessage("Dock Cache", "Inside rests dry twine, wrapped bread, and lamp wax sealed against the wet. The reward is humble, but the little dock pocket makes the Reach feel truly kept by human hands.");
          return;
        }
        showMessage("Dock Cache", "The dock cache is empty now, but the ribboned corner still reads as a deliberate kindness at the edge of the marsh.");
      }
    });

    targets.push({
      rect: screen.props.westThreshold,
      label: "Look back to Marshfoot",
      onInteract: () => showMessage("West Road", "Marshfoot still holds the last clear memory of the Highroad's stone. Ferryman's Reach works because that memory remains visible behind the softer ground.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Road", "The causeway falls away toward False Marker Knoll, where Greyfen first points the road at the wrong dead on purpose.")
    });

    targets.push({
      rect: screen.props.eastMarker,
      label: "Inspect dock posts",
      onInteract: () => showMessage("Dock Posts", "Every post wears ribbons, coins, or names for the dead. The detail is small, but it gives Greyfen mourning culture without turning the screen into lore clutter.")
    });

    return targets;
  }

  if (state.currentScreen === "GF-05") {
    const makeFalseMarkerBrazier = (rect, questKey, title) => ({
      rect,
      label: state.quest[questKey] ? `Inspect ${title.toLowerCase()}` : `Light ${title.toLowerCase()}`,
      onInteract: () => {
        if (state.quest[questKey]) {
          showMessage(title, `${title} already burns low against the wet wind. The knoll no longer feels mute.`);
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The memorial brazier needs sacred flame before the false stone will answer.");
          return;
        }
        state.quest[questKey] = true;
        commitProgress(`Route saved: ${title} lit`);
        if (state.quest.falseMarkerRevealed) {
          showMessage(title, "The second flame catches and the mud-sunk base inscription answers at last. The monument still stands, but now it accuses the lie written above it.");
          return;
        }
        showMessage(title, `${title} wakes with a shallow ember. One side of the knoll remembers more than the monument admits.`);
      }
    });

    targets.push({
      rect: screen.props.npc,
      label: "Talk to Nara",
      onInteract: () => showMessage("Nara", "They come here to read the kingdom's version of the dead. Then the marsh heaves and another name works loose from the mud below. That is why no one in Greyfen trusts a clean monument anymore.")
    });

    targets.push({
      rect: screen.props.landmark,
      label: state.rewards.falseMarkerEpitaphRead ? "Read revealed epitaph" : "Read false marker",
      onInteract: () => {
        if (!state.quest.falseMarkerRevealed) {
          showMessage("False Marker", "The carved face blames the Wardens for abandoning Greyfen in the old war. The words are too neat for this place, which is exactly why the stone feels dangerous.");
          return;
        }
        if (!state.rewards.falseMarkerEpitaphRead) {
          state.rewards.falseMarkerEpitaphRead = true;
          commitProgress("Lore saved: False marker epitaph read");
          showMessage("Buried Epitaph", "Under the official inscription, older names push through the mud: wardens, bearers, ferrymen, kin. The kingdom did not mark a betrayal here. It buried the people who tried to hold the road.");
          return;
        }
        showMessage("Buried Epitaph", "Once you know to look beneath the official carving, the whole knoll reads differently. The monument is no longer history. It is evidence.");
      }
    });

    targets.push(makeFalseMarkerBrazier(screen.props.leftBrazier, "falseMarkerLeftLit", "Left Memorial Brazier"));
    targets.push(makeFalseMarkerBrazier(screen.props.rightBrazier, "falseMarkerRightLit", "Right Memorial Brazier"));

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look back to Ferryman's Reach",
      onInteract: () => showMessage("North Road", "Ferryman's Reach still feels human behind you. That warmth makes the false monument ahead feel colder and more deliberate.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Road", "The graves thicken below the knoll and the road sinks deeper into the dead. `GF-06 Memorial Flats` is the next main-route screen after this warning point.")
    });

    return targets;
  }

  if (state.currentScreen === "GF-06") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read raised tomb",
      onInteract: () => showMessage("Raised Tomb", "Someone lifted this one memorial above the wet ground and finished the carving with care. That small act is what keeps the flats from feeling abandoned entirely.")
    });

    targets.push({
      rect: screen.props.graveBriar,
      label: state.quest.memorialFlatsPathCleared ? "Inspect cleared grave rows" : "Burn grave-row thorn",
      onInteract: () => {
        if (state.quest.memorialFlatsPathCleared) {
          showMessage("Grave Rows", "The thorn is gone and the dry cut through the flats can be followed without trampling what little order remains.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The grave rows are sealed by the same black thorn now threading the kingdom's forgotten places.");
          return;
        }
        state.quest.memorialFlatsPathCleared = true;
        commitProgress("Route saved: Memorial Flats path cleared");
        showMessage("Grave Rows", "The thorn curls back from the memorial stones and the dry line through the flats reappears. The field is still neglected, but no longer unreadable.");
      }
    });

    targets.push({
      rect: screen.props.clueGraves,
      label: state.quest.namelessStoneClueFound ? "Inspect unfinished graves" : "Read unfinished graves",
      onInteract: () => {
        if (!state.quest.namelessStoneClueFound) {
          state.quest.namelessStoneClueFound = true;
          commitProgress("Clue saved: Nameless Stone fragment found");
          showMessage("Unfinished Graves", "One stone bears only a rank mark and three scratched letters before the carving stops. Even the half-made names here carry more honor than the monument behind you.");
          return;
        }
        showMessage("Unfinished Graves", "The unfinished stones tell the truth quietly: too many dead, too little time, and someone still trying not to let them vanish entirely.");
      }
    });

    targets.push({
      rect: screen.props.tombCache,
      label: state.rewards.memorialTombCollected ? "Inspect tomb cache" : "Open tomb cache",
      onInteract: () => {
        if (!state.rewards.memorialTombCollected) {
          state.rewards.memorialTombCollected = true;
          commitProgress("Reward saved: Memorial tomb cache collected");
          showMessage("Tomb Cache", "Inside rests a sealed votive strip and one intact name-ring kept dry in waxed cloth. The reward is small, but the raised tomb pocket proves someone fought neglect here with care.");
          return;
        }
        showMessage("Tomb Cache", "The little tomb cache is empty now, but the west terrace still reads as a kept memorial instead of just another ruin perch.");
      }
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look back to False Marker",
      onInteract: () => showMessage("North Road", "False Marker Knoll still stands behind you, but here the lie has spread into scale. The dead are no longer one stone. They are a field.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look south",
      onInteract: () => showMessage("South Road", "The dry line continues into the Drowned Causeway, where Greyfen stops mourning in fields and starts compressing into defended stone.")
    });

    targets.push({
      rect: screen.props.eastBreach,
      label: "Inspect east breach",
      onInteract: () => showMessage("East Breach", "A broken edge in the flats hints at older floodworks beyond. It reads as a later return line, not part of this first push south.")
    });

    return targets;
  }

  if (state.currentScreen === "GF-07") {
    const makeCausewayBrazier = (rect, questKey, title) => ({
      rect,
      label: state.quest[questKey] ? `Inspect ${title.toLowerCase()}` : `Light ${title.toLowerCase()}`,
      onInteract: () => {
        if (state.quest[questKey]) {
          showMessage(title, `${title} already burns through the wet haze. The causeway no longer feels blind where this fire reaches.`);
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The causeway brazier needs sacred flame before the road through the mist can be trusted.");
          return;
        }
        state.quest[questKey] = true;
        commitProgress(`Route saved: ${title} lit`);
        if (state.quest.causewayClear) {
          showMessage(title, "The second flame answers and the lower causeway resolves into disciplined stone. Greyfen still grieves, but the road is no longer lost in it.");
          return;
        }
        showMessage(title, `${title} catches and steadies. Half the causeway now feels read instead of guessed.`);
      }
    });

    targets.push({
      rect: screen.props.landmark,
      label: "Read causeway stone",
      onInteract: () => showMessage("Causeway Stone", "The inscription no longer asks travelers to remember the dead. It orders them to pass quietly and keep the line. Greyfen's grief is hardening into defended stone here.")
    });

    targets.push(makeCausewayBrazier(screen.props.leftBrazier, "causewayLeftLit", "Left Causeway Brazier"));
    targets.push(makeCausewayBrazier(screen.props.rightBrazier, "causewayRightLit", "Right Causeway Brazier"));

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look back to Memorial Flats",
      onInteract: () => showMessage("North Road", "Memorial Flats still lies behind you in open neglect. Here the same dead are being forced into line by masonry, torchlight, and command.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: state.quest.causewayClear ? "Look south to Fenwatch" : "Fogbound lower causeway",
      onInteract: () => {
        if (!state.quest.causewayClear) {
          showMessage("Lower Causeway", "The causeway drops into wet haze and broken footing. Answer both braziers first so the southern line becomes trustworthy.");
          return;
        }
        showMessage("Lower Causeway", "The line holds now. Fenwatch gathers just beyond the visible road in chains, vaults, and bell-stone. `GF-10 Fenwatch Approach` is the next main-route screen after this passage.");
      }
    });

    targets.push({
      rect: screen.props.sideChain,
      label: "Inspect side chain",
      onInteract: () => showMessage("Side Chain", "A side chain hangs above deeper water at the causeway edge. It reads as later return infrastructure, not something this first southbound pass should depend on.")
    });

    return targets;
  }

  if (state.currentScreen === "GF-10") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read gate stone",
      onInteract: () => showMessage("Gate Stone", "The final stone names Fenwatch not as fortress alone, but as a kept line between the honored dead and what the kingdom feared to uncover below them. This is where Greyfen's grief becomes evidence.")
    });

    targets.push({
      rect: screen.props.winchBriar,
      label: state.quest.fenwatchWinchCleared ? "Inspect cleared chain winch" : "Burn chain-winch thorn",
      onInteract: () => {
        if (state.quest.fenwatchWinchCleared) {
          showMessage("Chain Winch", "The briars are gone and the old chain answers cleanly. Fenwatch now reads as a true threshold instead of a sealed accusation.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The chain winch is still strangled by black thorn.");
          return;
        }
        state.quest.fenwatchWinchCleared = true;
        commitProgress("Route saved: Fenwatch chain winch cleared");
        showMessage("Chain Winch", "The thorn burns back from the chain housing and the gate mouth answers with a low iron groan. The Hall of Names lies open below, and Fenwatch can finally begin as witness instead of rumor.");
      }
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: "Look back to Drowned Causeway",
      onInteract: () => showMessage("North Road", "The causeway behind you still holds its disciplined line through the marsh. That pressure is what makes Fenwatch feel earned instead of abrupt.")
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: state.quest.fenwatchWinchCleared ? "Enter Hall of Names" : "Catacomb door sealed",
      onInteract: () => {
        if (!state.quest.fenwatchWinchCleared) {
          showMessage("Catacomb Door", "The lower door remains bound by the jammed chain works. Clear the winch first so the approach can finish becoming a real destination.");
          return;
        }
        showMessage("Catacomb Door", "The door stands open now. Beyond it is the Hall of Names: the first place in Fenwatch where the dead are encountered directly instead of through marsh signs, bells, and accusation.");
      }
    });

    targets.push({
      rect: screen.props.westReturnHint,
      label: "Inspect west chain post",
      onInteract: () => showMessage("West Chain Post", "A return chain post sits half-submerged off the west edge. It promises a later Greyfen shortcut without pulling focus away from Fenwatch itself.")
    });

    return targets;
  }

  if (state.currentScreen === "FC-01") {
    targets.push({
      rect: screen.props.landmark,
      label: state.quest.hallNamesWitnessed ? "Read memorial register" : "Witness memorial register",
      onInteract: () => {
        if (!state.quest.hallNamesWitnessed) {
          state.quest.hallNamesWitnessed = true;
          commitProgress("Lore saved: Hall of Names witnessed");
          showMessage("Hall of Names", "Rows of names crowd the stone, then thin into scratches, gaps, and unfinished cuts. Fenwatch does not begin with a mechanism here. It begins by making you face how many dead were nearly left unnamed.");
          return;
        }
        showMessage("Hall of Names", "Once the register is read, the whole room changes weight. The hall is not decoration. It is a ledger of grief the kingdom tried to bury under cleaner stories.");
      }
    });

    targets.push({
      rect: screen.props.leftRegister,
      label: "Inspect west wall names",
      onInteract: () => showMessage("West Name Wall", "These carvings are cramped but careful. Families, ferrymen, road-keepers, Wardens. Even here, someone still tried to keep the dead in relation to one another.")
    });

    targets.push({
      rect: screen.props.rightRegister,
      label: "Inspect east wall names",
      onInteract: () => showMessage("East Name Wall", "Whole lines were never finished. In a few places the last cuts stop mid-letter, as if the hall itself remembers the moment duty gave way to sealing and silence.")
    });

    targets.push({
      rect: screen.props.innerSeal,
      label: state.quest.hallNamesWitnessed ? "Inspect opened inner gate" : "Inspect sealed inner gate",
      onInteract: () => {
        if (!state.quest.hallNamesWitnessed) {
          showMessage("Inner Seal", "The deeper crypt is held behind a disciplined stone seal. Fenwatch is careful here: first witness, then descent.");
          return;
        }
        showMessage("Inner Seal", "Once the names are faced, the inner seal yields just enough to continue. Fenwatch is still controlling the descent, but no longer refusing it.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look back to Fenwatch Approach",
      onInteract: () => showMessage("South Threshold", "The bell, chain, and gate above now feel distant. Inside Fenwatch, accusation gives way to names, and that change in pressure is exactly what this first room must protect.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.hallNamesWitnessed ? "Continue into deeper Fenwatch" : "North way sealed",
      onInteract: () => {
        if (!state.quest.hallNamesWitnessed) {
          showMessage("North Way", "The room will not let you continue until the register itself has been witnessed. Fenwatch's first law is reverence, not momentum.");
          return;
        }
        showMessage("North Way", "Beyond the first hall, another chamber holds the voices of those who asked the dead be named properly before the vault was sealed.");
      }
    });

    return targets;
  }

  if (state.currentScreen === "FC-02") {
    targets.push({
      rect: screen.props.landmark,
      label: state.quest.echoAbandonmentWitnessed ? "Hear echo stone again" : "Witness abandonment echo",
      onInteract: () => {
        if (!state.quest.echoAbandonmentWitnessed) {
          state.quest.echoAbandonmentWitnessed = true;
          commitProgress("Lore saved: Echo of Abandonment witnessed");
          showMessage("Echo of Abandonment", "A survivor's voice breaks across the chamber: name them before you seal them, let the families know where they lie. Another voice, colder and higher, answers that the vault closes now and the record will be corrected later. The later never came.");
          return;
        }
        showMessage("Echo of Abandonment", "The echo does not accuse with spectacle. It accuses with procedure: one plea for names, one command to seal, and all the damage hidden inside that gap.");
      }
    });

    targets.push({
      rect: screen.props.leftAlcove,
      label: "Inspect west alcove",
      onInteract: () => showMessage("West Alcove", "Coins and wax traces still cling to the stone lip. People came here after the sealing order, trying to keep private acts of naming alive where the official record failed.")
    });

    targets.push({
      rect: screen.props.rightAlcove,
      label: "Inspect east alcove",
      onInteract: () => showMessage("East Alcove", "A narrow water cut slips under the chamber wall and vanishes north. The first hint of Fenwatch's flood logic is here, but it stays subordinate to the testimony in this room.")
    });

    targets.push({
      rect: screen.props.northSeal,
      label: state.quest.echoAbandonmentWitnessed ? "Inspect opened testimony gate" : "Inspect deeper seal",
      onInteract: () => {
        if (!state.quest.echoAbandonmentWitnessed) {
          showMessage("Deeper Seal", "The next descent remains barred. The chamber has given you the plea and the order; deeper Fenwatch will have to answer with proof later.");
          return;
        }
        showMessage("Testimony Gate", "The deeper seal opens once the echo is witnessed. Fenwatch's descent is still controlled, but now it is leading toward proof instead of only grief.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look back to Hall of Names",
      onInteract: () => showMessage("South Threshold", "The Hall of Names behind you established scale. This chamber gives that scale a voice, which is why it can be smaller and still feel heavier.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.echoAbandonmentWitnessed ? "Continue to Warden Testimony" : "North way sealed",
      onInteract: () => {
        if (!state.quest.echoAbandonmentWitnessed) {
          showMessage("North Way", "The deeper chamber stays barred until the abandonment echo has actually been heard. Fenwatch is still descending by testimony, not by impatience.");
          return;
        }
        showMessage("North Way", "Beyond this gate waits the first true proof chamber, where the Wardens' own testimony begins to answer the lie above.");
      }
    });

    return targets;
  }

  if (state.currentScreen === "FC-03") {
    targets.push({
      rect: screen.props.landmark,
      label: state.quest.wardenTestimonyWitnessed ? "Read Warden testimony again" : "Witness Warden testimony",
      onInteract: () => {
        if (!state.quest.wardenTestimonyWitnessed) {
          state.quest.wardenTestimonyWitnessed = true;
          commitProgress("Lore saved: Warden testimony witnessed");
          showMessage("Warden Testimony", "The preserved record is plain where the monuments above were not: the Wardens held the retreat line, guarded the seal, and died where they stood. They were blamed afterward because the truth reached too close to crown and temple alike.");
          return;
        }
        showMessage("Warden Testimony", "The chamber does not need to shout. The proof holds because it is specific: duty assigned, line held, seal guarded, blame rewritten after death.");
      }
    });

    targets.push({
      rect: screen.props.leftRecess,
      label: "Inspect west recess",
      onInteract: () => showMessage("West Recess", "Wax drippings and old oath-cords lie hardened in the recess. This was a place of record and vow before it became a place of concealment.")
    });

    targets.push({
      rect: screen.props.rightRecess,
      label: "Inspect east recess",
      onInteract: () => showMessage("East Recess", "The wall cut here carries a thin trickle of floodwater under the stones. Fenwatch's deeper mechanics are still present, but this room keeps them subordinate to the evidence itself.")
    });

    targets.push({
      rect: screen.props.northSeal,
      label: state.quest.wardenTestimonyWitnessed ? "Inspect opened marshal gate" : "Inspect deeper seal",
      onInteract: () => {
        if (!state.quest.wardenTestimonyWitnessed) {
          showMessage("Deeper Seal", "The next descent remains held. Fenwatch has moved from names, to plea, to proof. Whatever lies deeper should only follow once that proof has properly landed.");
          return;
        }
        showMessage("Marshal Gate", "Once the testimony is faced, the seal yields just enough to admit the chamber beyond. Fenwatch is no longer asking for proof. It is forcing consequence into view.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look back to Echo of Abandonment",
      onInteract: () => showMessage("South Threshold", "The chamber behind you gave grief a voice. This one gives it documentary force, which is why it must stay colder and more exact.")
    });

    targets.push({
      rect: screen.props.northThreshold,
      label: state.quest.wardenTestimonyWitnessed ? "Continue to Bell-Mourned chamber" : "North way sealed",
      onInteract: () => {
        if (!state.quest.wardenTestimonyWitnessed) {
          showMessage("North Way", "Fenwatch still refuses the deeper chamber until the Warden testimony has actually been witnessed. Proof has to land before consequence is allowed to stand before you.");
          return;
        }
        showMessage("North Way", "Beyond this gate the proof stops being documentary and becomes embodied burden. The next chamber should read as consequence, not spectacle.");
      }
    });

    return targets;
  }

  if (state.currentScreen === "FC-04") {
    targets.push({
      rect: screen.props.landmark,
      label: state.quest.marshalConfrontationWitnessed ? "Inspect Bell-Mourned marshal" : "Confront Bell-Mourned marshal",
      onInteract: () => {
        if (!state.quest.marshalConfrontationWitnessed) {
          state.quest.marshalConfrontationWitnessed = true;
          commitProgress("State saved: Bell-Mourned confrontation witnessed");
          showMessage("Bell-Mourned Marshal", "Standing before it directly changes the room. The chamber still refuses combat spectacle, but the burden at its center no longer reads as distant evidence. It now reads as consequence you have personally faced.");
          return;
        }
        showMessage("Bell-Mourned Marshal", "What stands at the center is not a clean monument and not yet a boss performance. Record, armor, chain, and burden have been forced into one violated memorial mass. The confrontation-state holds because the chamber now treats you as witness to consequence, not merely as reader of proof.");
      }
    });

    targets.push({
      rect: screen.props.leftRecess,
      label: "Inspect west oath recess",
      onInteract: () => showMessage("West Oath Recess", "Broken oath cords and command seals have been pressed into the recess stone. The chamber keeps reminding you that this was once a place of sworn duty before it became a place of accusation.")
    });

    targets.push({
      rect: screen.props.rightScar,
      label: "Inspect east flood scar",
      onInteract: () => showMessage("East Flood Scar", "The flood mark is low, controlled, and ugly. Even here the water remains subordinate to the chamber's human crime. It records damage without taking the room away from the dead it was built to hold.")
    });

    targets.push({
      rect: screen.props.northScar,
      label: "Inspect scarred inner seal",
      onInteract: () => {
        if (!state.quest.marshalConfrontationWitnessed) {
          showMessage("Scarred Seal", "The deeper stone is cracked but not yielded. Bell-Mourned consequence stands here, but the later reward, the later item, and the later continuation still do not belong to this first chamber pass.");
          return;
        }
        showMessage("Scarred Seal", "After the confrontation, the deeper scar reads less like a teaser and more like a held boundary. The chamber has advanced one step in pressure, but it is still refusing the later reward and route bleed.");
      }
    });

    targets.push({
      rect: screen.props.southThreshold,
      label: "Look back to Warden Testimony",
      onInteract: () => showMessage("South Threshold", "The chamber behind you proved what happened. This one makes that proof intolerably physical. The route still reads south to testimony, north to unresolved consequence.")
    });

    return targets;
  }

  if (state.currentScreen === "BM-02") {
    targets.push({
      rect: screen.props.landmark,
      label: "Read pilgrim marker",
      onInteract: () => showMessage("Pilgrim Marker", "The old terrace marker still wins the ridge, even from the side road. A good landmark does not need the same approach angle twice to stay legible.")
    });

    targets.push({
      rect: screen.props.npc,
      label: "Talk to Elira",
      onInteract: () => {
        if (state.rewards.pilgrimCacheCollected) {
          showMessage("Elira", "Now it feels settled. The shelter, the cut road, and the cache nook make this place feel kept, not drafted.");
          return;
        }
        if (state.quest.pilgrimBriarCleared) {
          showMessage("Elira", "The thorn choke was hiding the best part of the cut. Once the nook opens, the whole lower field finally reads like it belongs to the same road culture as Warden's Rise.");
          return;
        }
        showMessage("Elira", "Pilgrims once paused at the shelter below before climbing to the marker. If the lower field feels thin, the screen is still missing part of its promise.");
      }
    });

    targets.push({
      rect: screen.props.westWaypost,
      label: "Read west waypost",
      onInteract: () => showMessage("West Waypost", "Warden's Rise lies west along the kept road. This cut should feel like a neighbor to that screen, not a different art language.")
    });

    targets.push({
      rect: screen.props.terraceMarker,
      label: "Inspect ascent marker",
      onInteract: () => showMessage("Ascent Marker", "The stair break shifts the climb sideways, but the route still reads cleanly: road first, terrace second, shelter and pocket below.")
    });

    targets.push({
      rect: screen.props.eastWaypost,
      label: "Read east marker",
      onInteract: () => showMessage("East Marker", "The cut road picks up again beyond the broken shoulder. Follow it and the first true Highroad gate comes into view.")
    });

    targets.push({
      rect: screen.props.pilgrimBriar,
      label: state.quest.pilgrimBriarCleared ? "Nook cleared" : "Burn thorned nook",
      onInteract: () => {
        if (state.quest.pilgrimBriarCleared) {
          showMessage("Pilgrim Nook", "The thorn choke is gone. The shelter and cache now read as one intentional lower-field pocket.");
          return;
        }
        if (!hasLanternOfDawn()) {
          showMessage("Lantern Needed", "The thorned nook expects the Lantern of Dawn, just like BM-01's briar gate.");
          return;
        }
        state.quest.pilgrimBriarCleared = true;
        commitProgress("Route saved: Pilgrim nook cleared");
        showMessage("Pilgrim Nook", "One burn opens the collapsed shelter's side cache. The lower field should feel denser and more authored now, not like empty staging ground.");
      }
    });

    targets.push({
      rect: screen.props.pilgrimCache,
      label: state.rewards.pilgrimCacheCollected ? "Inspect pilgrim cache" : "Open pilgrim cache",
      onInteract: () => {
        if (!state.quest.pilgrimBriarCleared) {
          showMessage("Pilgrim Cache", "You can spot the cache tucked beside the shelter ruins, but the briars still own the approach.");
          return;
        }
        if (!state.rewards.pilgrimCacheCollected) {
          state.rewards.pilgrimCacheCollected = true;
          commitProgress("Reward saved: Pilgrim cache collected");
          showMessage("Pilgrim Cache", "Inside lies a wayfarer's seal and a strip of weathered mapcloth. The reward is small, but the nook now earns its place in the composition.");
          return;
        }
        showMessage("Pilgrim Cache", "The chest is empty now, but the shelter pocket still reads as a real optional discovery.");
      }
    });

    return targets;
  }

  targets.push({
    rect: screen.props.landmark,
    label: "Read Warden Stone",
    onInteract: () => {
      if (!state.quest.landmarkRead) {
        state.quest.landmarkRead = true;
        commitProgress("Lore saved: Warden Stone read");
        showMessage("Warden Stone", "The runes speak of roads kept bright so the realm would remember itself. This upper terrace is the screen's focal promise: history above, journey below.");
        return;
      }
      showMessage("Warden Stone", "The carved oath is short: hold the road, keep the light, let the kingdom outlive the watch.");
    }
  });

  targets.push({
    rect: screen.props.npc,
    label: "Talk to Watchkeeper Talan",
    onInteract: () => {
      if (!state.quest.caretakerMet) {
        state.quest.caretakerMet = true;
        commitProgress("Dialogue saved: Watchkeeper Talan met");
      }

      if (state.rewards.watchCacheCollected) {
        showMessage("Talan", "Now the screen sings properly. Road, house, stone, and hidden reward all read in one breath. Build the rest of Elderfield to that standard.");
        return;
      }
      if (state.quest.landmarkRead && !state.quest.briarCleared) {
        showMessage("Talan", "The old cache niche woke when you read the stone. Burn the briars at the cliff foot and you will see how progression should sit in the scenery instead of on top of it.");
        return;
      }
      if (!state.quest.landmarkRead) {
        showMessage("Talan", "Don't start with chatter. Start with the stone. If a player cannot tell what matters before they hear dialogue, the screen is doing the work backward.");
        return;
      }
      showMessage("Talan", "There is a watch-cache hidden behind the thorn choke below. Optional rewards belong in tucked, legible pockets, not in random noise.");
    }
  });

  targets.push({
    rect: screen.props.briar,
    label: state.quest.briarCleared ? "Briars cleared" : "Burn thorn choke",
    onInteract: () => {
      if (state.quest.briarCleared) {
        showMessage("Cliff Foot", "The briars are gone. The alcove is readable now, and the reward pocket feels intentional instead of accidental.");
        return;
      }
      if (!hasLanternOfDawn()) {
        showMessage("Lantern Needed", "This progression pocket expects the Lantern of Dawn. The benchmark keeps the lantern equipped so the terrain gate is testable immediately.");
        return;
      }
      state.quest.briarCleared = true;
      commitProgress("Route saved: Briar choke cleared");
      showMessage("Thorn Choke", "The Lantern burns the black briars back to the cliff. One small change recontextualizes the whole lower-left corner, which is exactly the kind of environmental payoff this project needs.");
    }
  });

  targets.push({
    rect: screen.props.cache,
    label: state.rewards.watchCacheCollected ? "Inspect watch-cache" : "Open watch-cache",
    onInteract: () => {
      if (!state.quest.briarCleared) {
        showMessage("Watch Cache", "You can see the cache tucked in the ruin pocket, but the briars still own the entrance.");
        return;
      }
      if (!state.rewards.watchCacheCollected) {
        state.rewards.watchCacheCollected = true;
        commitProgress("Reward saved: Watch-cache collected");
        showMessage("Watch Cache", "Inside lies a Warden brooch wrapped in lampcloth. The reward is modest, but the placement matters: curiosity should pay off in memorable little sanctuaries.");
        return;
      }
      showMessage("Watch Cache", "Only the cloth impression remains in the chest. The nook still reads clearly as an optional reward pocket.");
    }
  });

  targets.push({
    rect: screen.props.southWaypost,
    label: "Read south waypost",
    onInteract: () => showMessage("South Waypost", "Rowan Hollow lies beyond this road. The benchmark ends here on purpose so composition can be judged before the world grows again.")
  });

  targets.push({
    rect: screen.props.eastWaypost,
    label: "Read east waypost",
    onInteract: () => showMessage("East Waypost", "This east cut now leads to BM-02, the replication test screen. The point is to prove the benchmark can translate, not to start a region.")
  });

  return targets;
}

function getNearestInteraction() {
  const search = interactionSearchBox();
  const playerCenter = centerOf(state.player);
  const available = getInteractionTargets().filter((target) => overlaps(search, target.rect) || distance(playerCenter, centerOf(target.rect)) < 30);
  if (available.length === 0) return null;

  available.sort((a, b) => distance(playerCenter, centerOf(a.rect)) - distance(playerCenter, centerOf(b.rect)));
  return available[0];
}

function handleTransitions() {
  if (state.transitionCooldown > 0) return;

  const screen = activeScreen();
  const transitions = screen.transitions || [];
  for (const transition of transitions) {
    if (overlaps(state.player, transition.rect)) {
      loadScreen(transition.to, transition.spawn || "default");
      return;
    }
  }
}

function handleInteraction() {
  const target = getNearestInteraction();
  if (target) {
    state.prompt = { text: `[E] ${target.label}` };
    if (justPressed("KeyE")) {
      target.onInteract();
    }
  } else {
    state.prompt = null;
  }
}

function update(dt) {
  if (state.transitionCooldown > 0) state.transitionCooldown -= dt;

  if (justPressed("Backquote")) {
    state.debug = !state.debug;
  }

  if (state.player.attackTimer > 0) state.player.attackTimer -= dt;
  if (state.player.invincibleTimer > 0) state.player.invincibleTimer -= dt;

  if (state.message) {
    if (justPressed("Enter") || justPressed("Space") || justPressed("KeyE") || justPressed("Escape")) {
      hideMessage();
    }
    return;
  }

  if (justPressed("Escape")) {
    state.paused = !state.paused;
    return;
  }

  if (state.paused) return;

  movePlayer(dt);
  updateEnemies(dt);
  attackEnemies();
  handleInteraction();
  handleTransitions();
}

function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = Math.min(0.033, (timestamp - state.lastTime) / 1000);
  state.lastTime = timestamp;
  update(dt);
  drawScene();
  keysPressed.clear();
  requestAnimationFrame(loop);
}

function startFreshJourney() {
  applySaveData(createDefaultSaveData());
  state.meta.saveLoaded = false;
  state.meta.lastSaveReason = "Fresh journey";
  state.meta.lastSaveTime = null;
  state.lastTime = 0;
  loadScreen(benchmarkScreen.id, "default", { skipSave: true });
  showMessage("Benchmark Active", "The active build now contains the locked benchmark pair plus eighteen live production screens, carrying the same atlas law from benchmark ground through Hall of Names, Echo of Abandonment, and Warden Testimony into a lawful Bell-Mourned confrontation-state chamber pass with movement, combat, save/load, pause, debug, and progression intact.");
  saveProgress("Journey started: benchmark screen");
}

function bootGame() {
  const restored = loadProgress();
  if (restored) {
    const checkpoint = screens[state.checkpoint.screenId] ? state.checkpoint : createDefaultSaveData().checkpoint;
    loadScreen(checkpoint.screenId, checkpoint.spawnId, { skipSave: true });
    setBuildStatus("green", "Green means we are good. The benchmark booted and restored normally.");
    showMessage("Journey Restored", "Progress loaded. The benchmark pair remains locked, and the live route now continues through eighteen production screens into a lawful Bell-Mourned confrontation-state chamber pass under the same visual law.");
  } else {
    startFreshJourney();
    setBuildStatus("green", "Green means we are good. The benchmark booted cleanly and is ready for review.");
  }
}

if (saveButtonEl) {
  saveButtonEl.addEventListener("click", () => {
    saveProgress(`Manual save: ${state.currentScreen}`);
  });
}

if (resetButtonEl) {
  resetButtonEl.addEventListener("click", () => {
    clearSavedProgress();
    startFreshJourney();
    showMessage("Save Reset", "The benchmark save was cleared and the screen reset to its default state.");
  });
}

if (debugScanButtonEl) {
  debugScanButtonEl.addEventListener("click", () => {
    runScannerAction();
  });
}

if (debugReportButtonEl) {
  debugReportButtonEl.addEventListener("click", () => {
    runFullReportAction();
  });
}

if (debugCopyButtonEl) {
  debugCopyButtonEl.addEventListener("click", async () => {
    if (!debugToolState.lastReport) {
      runFullReportAction();
    }
    await copyFullDebugReport();
  });
}

window.ElderfieldDebug = {
  state,
  screen: benchmarkScreen,
  screens,
  saveProgress,
  loadProgress,
  clearSavedProgress,
  startFreshJourney,
  buildSaveData,
  loadScreen: (id, spawn = "default") => loadScreen(id, spawn, { skipSave: true }),
  activeScreen,
  toggleDebug() {
    state.debug = !state.debug;
    return state.debug;
  },
  setBuildStatus,
  getBuildStatus() {
    return {
      version: state.meta.buildVersion,
      status: state.meta.buildStatus,
      note: state.meta.buildNote
    };
  },
  getMarshalPresenceCueState,
  runScanner: runDebugScanner,
  buildFullReport: buildFullDebugReport,
  async copyFullReport() {
    return copyFullDebugReport();
  },
  getLastScan() {
    return debugToolState.lastScan;
  },
  getLastReport() {
    return debugToolState.lastReport;
  },
  getStoredSave() {
    const store = storage();
    const raw = store ? store.getItem(SAVE_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  }
};

window.addEventListener("error", (event) => {
  const message = event?.message || "Unknown runtime error";
  setBuildStatus("red", `Red means a bad error is active. Runtime error: ${message}`, { force: true });
});

window.addEventListener("unhandledrejection", () => {
  setBuildStatus("red", "Red means a bad error is active. An unhandled async error reached the runtime.", { force: true });
});

bootGame();
requestAnimationFrame(loop);
