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
const saveStatusEl = document.getElementById("save-status");
const saveDetailEl = document.getElementById("save-detail");
const saveButtonEl = document.getElementById("save-button");
const resetButtonEl = document.getElementById("reset-button");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SAVE_KEY = "elderfield.visual-benchmark.save.v1";
const SAVE_VERSION = 1;
const BUILD_VERSION = "v0.3.3-hv04";
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
      watchgateOpen: false
    },
    rewards: {
      watchCacheCollected: false,
      pilgrimCacheCollected: false,
      highroadSupplyCollected: false,
      watchersCacheCollected: false
    },
    npcPhases: {
      talan: "waiting"
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
  showMessage("Benchmark Active", "The active build now contains the locked benchmark pair plus the first four production Highroad screens, all assembled from the same atlas with movement, combat, save/load, pause, debug, and progression intact.");
  saveProgress("Journey started: benchmark screen");
}

function bootGame() {
  const restored = loadProgress();
  if (restored) {
    const checkpoint = screens[state.checkpoint.screenId] ? state.checkpoint : createDefaultSaveData().checkpoint;
    loadScreen(checkpoint.screenId, checkpoint.spawnId, { skipSave: true });
    setBuildStatus("green", "Green means we are good. The benchmark booted and restored normally.");
    showMessage("Journey Restored", "Progress loaded. The benchmark pair remains locked, and the Highroad chain now continues through four live production screens under the same visual law.");
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
