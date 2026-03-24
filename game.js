const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const screenIdEl = document.getElementById("screen-id");
const screenNameEl = document.getElementById("screen-name");
const screenRegionEl = document.getElementById("screen-region");
const objectiveTextEl = document.getElementById("objective-text");
const inventoryListEl = document.getElementById("inventory-list");
const messageBoxEl = document.getElementById("message-box");
const messageTitleEl = document.getElementById("message-title");
const messageTextEl = document.getElementById("message-text");
const saveStatusEl = document.getElementById("save-status");
const saveDetailEl = document.getElementById("save-detail");
const saveButtonEl = document.getElementById("save-button");
const resetButtonEl = document.getElementById("reset-button");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SAVE_KEY = "elderfield.return_light.save.v1";
const SAVE_VERSION = 1;

const palette = {
  grass: "#5f9550",
  grassAlt: "#75ab63",
  deepGrass: "#456f39",
  marsh: "#445c48",
  marshAlt: "#59735b",
  water: "#365d6e",
  waterAlt: "#4f7b86",
  reed: "#a9a56b",
  reedDark: "#6e6b43",
  road: "#b18b5f",
  roadShade: "#916f48",
  stone: "#8d8b82",
  stoneDark: "#6a6862",
  crypt: "#595651",
  cryptDark: "#312d2b",
  cryptFloor: "#7a766e",
  chain: "#b7aa86",
  wood: "#6b4933",
  roof: "#8a5747",
  chapel: "#d7cfbf",
  fog: "rgba(214,225,217,0.45)",
  bramble: "#6d2c34",
  fire: "#ffd26b",
  health: "#d96063",
  healthBg: "#4b2424",
  white: "#f7f3ea",
  crow: "#1d1a25",
  scavenger: "#6a4030",
  hound: "#8f5d45",
  wraith: "#7e80b8"
};

const keysDown = new Set();
const keysPressed = new Set();

window.addEventListener("keydown", (event) => {
  const tracked = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "KeyJ", "KeyK", "Enter", "Space", "Escape"];
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

function centerOf(r) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeEnemy(type, x, y, options = {}) {
  return {
    type,
    x,
    y,
    w: 10,
    h: 10,
    dir: options.dir || "left",
    speed: options.speed || 18,
    min: options.min ?? x - 16,
    max: options.max ?? x + 16,
    axis: options.axis || "x",
    hp: options.hp || 1,
    alive: true,
    touchDamage: 1
  };
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function createDefaultSaveData() {
  return {
    version: SAVE_VERSION,
    savedAt: null,
    items: {
      sword: true,
      lanternOfDawn: true,
      marshHook: false
    },
    quest: {
      muralRead: false,
      highroadBurned: false,
      watchgateBrazierA: false,
      watchgateBrazierB: false,
      watchgateOpen: false,
      waysideLit: [false, false, false, false],
      waysideEchoSeen: false,
      reachedShepherdsRest: false,
      greyfenBranchBurned: false,
      greyfenLiftFreed: false,
      ferrymanMet: false,
      sunkenBranchBurned: false,
      sunkenBraziersLit: [false, false],
      sunkenForecourtCleared: false,
      falseMarkerBraziersLit: [false, false],
      falseMarkerRevealed: false,
      graveRowsBurned: false,
      causewayBraziersLit: [false, false],
      causewayCleared: false,
      bellwaterBreachOpened: false,
      bellwaterFenwatchBridgeOpened: false,
      bellwaterMemorialFerryOpened: false,
      fenwatchWinchFreed: false,
      reachedFenwatch: false,
      reachedBellwaterLock: false,
      fenwatchHallEchoSeen: false,
      fenwatchSluiceOpened: false,
      fenwatchReliquaryGateOpen: false,
      fenwatchBridgePulled: false,
      fenwatchTestimonySeen: false,
      fenwatchSealDoorSeen: false,
      namelessStoneResolved: false
    },
    shortcuts: {
      highroadNorthOpen: false,
      watchgateShortcutOpen: false,
      waysideNorthOpen: false,
      greyfenApproachReady: false,
      greyfenBranchOpen: false,
      greyfenLiftOpen: false,
      causewaySouthOpen: false,
      fenwatchDoorOpen: false,
      fenwatchReliquaryOpen: false,
      fenwatchBridgeOpen: false,
      bellwaterBreachOpen: false,
      bellwaterFenwatchBridgeOpen: false,
      bellwaterMemorialFerryOpen: false
    },
    rewards: {
      shrineCacheCollected: false,
      waysideLoreTabletRead: false,
      shepherdTradeCacheInspected: false,
      marshfootChestCollected: false,
      sunkenLoreTabletRead: false,
      namelessStoneClueRead: false,
      memorialHeartCollected: false,
      bellwaterTabletRead: false,
      memorialIsleHeartCollected: false,
      fenwatchLedgerRead: false,
      fenwatchTestimonyTabletRead: false
    },
    npcPhases: {
      maelin: "opening",
      theon: "opening",
      yselle: "unmet",
      toma: "unmet",
      nara: "unmet",
      mirelle: "absent"
    },
    sideQuests: {
      pilgrimCharm: "unstarted",
      waysideWitness: "unstarted",
      shepherdTradeCache: "unstarted",
      ferrymanAtDusk: "unstarted",
      heirloomBell: "unstarted",
      namelessStone: "unstarted"
    },
    checkpoint: {
      screenId: "RH-01",
      spawnId: "default"
    }
  };
}

function normalizeSaveData(raw) {
  const defaults = createDefaultSaveData();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const normalized = {
    version: SAVE_VERSION,
    savedAt: raw.savedAt || null,
    items: { ...defaults.items, ...(raw.items || {}) },
    quest: { ...defaults.quest, ...(raw.quest || {}) },
    shortcuts: { ...defaults.shortcuts, ...(raw.shortcuts || {}) },
    rewards: { ...defaults.rewards, ...(raw.rewards || {}) },
    npcPhases: { ...defaults.npcPhases, ...(raw.npcPhases || {}) },
    sideQuests: { ...defaults.sideQuests, ...(raw.sideQuests || {}) },
    checkpoint: {
      screenId: raw.checkpoint?.screenId || defaults.checkpoint.screenId,
      spawnId: raw.checkpoint?.spawnId || defaults.checkpoint.spawnId
    }
  };

  normalized.quest.waysideLit = defaults.quest.waysideLit.map((_, index) => Boolean(raw.quest?.waysideLit?.[index]));
  normalized.quest.sunkenBraziersLit = defaults.quest.sunkenBraziersLit.map((_, index) => Boolean(raw.quest?.sunkenBraziersLit?.[index]));
  normalized.quest.falseMarkerBraziersLit = defaults.quest.falseMarkerBraziersLit.map((_, index) => Boolean(raw.quest?.falseMarkerBraziersLit?.[index]));
  normalized.quest.causewayBraziersLit = defaults.quest.causewayBraziersLit.map((_, index) => Boolean(raw.quest?.causewayBraziersLit?.[index]));

  return normalized;
}

function createRuntimeState() {
  const saveData = createDefaultSaveData();
  return {
    currentScreen: saveData.checkpoint.screenId,
    currentSpawn: saveData.checkpoint.spawnId,
    player: {
      x: 152,
      y: 118,
      w: 10,
      h: 12,
      speed: 56,
      dir: "down",
      hp: 3,
      attackTimer: 0,
      invincibleTimer: 0
    },
    items: cloneData(saveData.items),
    quest: cloneData(saveData.quest),
    shortcuts: cloneData(saveData.shortcuts),
    rewards: cloneData(saveData.rewards),
    npcPhases: cloneData(saveData.npcPhases),
    sideQuests: cloneData(saveData.sideQuests),
    checkpoint: cloneData(saveData.checkpoint),
    message: null,
    enemies: [],
    prompt: null,
    transitionCooldown: 0,
    lastTime: 0,
    meta: {
      saveLoaded: false,
      lastSaveReason: "Fresh journey",
      lastSaveTime: null
    }
  };
}

const state = createRuntimeState();

function storage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
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
  return `${state.checkpoint.screenId} ${screen.name} (${state.checkpoint.spawnId})`;
}

function updateSavePanel() {
  if (!saveStatusEl || !saveDetailEl) return;
  saveStatusEl.textContent = state.meta.saveLoaded ? state.meta.lastSaveReason : "Fresh journey";
  saveDetailEl.textContent = `Checkpoint: ${describeCheckpoint()} | ${formatSaveTime(state.meta.lastSaveTime)}`;
}

function renderInventory() {
  if (!inventoryListEl) return;
  const chips = [];
  if (state.items.sword) chips.push("Sword");
  if (state.items.lanternOfDawn) chips.push("Lantern of Dawn");
  if (state.items.marshHook) chips.push("Marsh Hook");
  inventoryListEl.innerHTML = chips.map((item) => `<span class="chip">${item}</span>`).join("");
}

function syncDerivedProgress() {
  state.shortcuts.highroadNorthOpen = state.quest.highroadBurned && state.items.lanternOfDawn;
  state.shortcuts.watchgateShortcutOpen = state.quest.watchgateOpen;
  state.shortcuts.waysideNorthOpen = state.quest.waysideEchoSeen;
  state.shortcuts.greyfenApproachReady = state.quest.reachedShepherdsRest;
  state.shortcuts.greyfenBranchOpen = state.quest.greyfenBranchBurned;
  state.shortcuts.greyfenLiftOpen = state.quest.greyfenLiftFreed;
  state.shortcuts.causewaySouthOpen = state.quest.causewayCleared;
  state.shortcuts.bellwaterBreachOpen = state.quest.bellwaterBreachOpened;
  state.shortcuts.bellwaterFenwatchBridgeOpen = state.quest.bellwaterFenwatchBridgeOpened;
  state.shortcuts.bellwaterMemorialFerryOpen = state.quest.bellwaterMemorialFerryOpened;
  state.shortcuts.fenwatchDoorOpen = state.quest.fenwatchWinchFreed;
  state.shortcuts.fenwatchReliquaryOpen = state.quest.fenwatchReliquaryGateOpen;
  state.shortcuts.fenwatchBridgeOpen = state.quest.fenwatchBridgePulled;

  if (state.quest.highroadBurned) {
    state.npcPhases.maelin = "road_open";
  } else if (state.quest.muralRead) {
    state.npcPhases.maelin = "road_awakened";
  } else {
    state.npcPhases.maelin = "opening";
  }

  if (state.quest.waysideEchoSeen) {
    state.npcPhases.theon = "echo_witnessed";
  } else if (state.quest.muralRead) {
    state.npcPhases.theon = "mural_understood";
  } else {
    state.npcPhases.theon = "opening";
  }

  if (state.quest.reachedShepherdsRest && state.npcPhases.yselle === "unmet") {
    state.npcPhases.yselle = "waiting";
  }
  if (state.quest.namelessStoneResolved) {
    state.npcPhases.yselle = "memorial_truth";
  } else if (state.quest.greyfenBranchBurned) {
    state.npcPhases.yselle = "greyfen_open";
  }

  if (state.quest.namelessStoneResolved) {
    state.npcPhases.toma = "memorial_resolved";
  } else if (state.quest.falseMarkerRevealed) {
    state.npcPhases.toma = "truth_heard";
  } else if (state.quest.ferrymanMet) {
    state.npcPhases.toma = "met";
  } else {
    state.npcPhases.toma = "unmet";
  }

  if (state.quest.namelessStoneResolved) {
    state.npcPhases.nara = "stone_resolved";
  } else if (state.quest.falseMarkerRevealed) {
    state.npcPhases.nara = "truth_shown";
  } else if (state.sideQuests.namelessStone !== "unstarted") {
    state.npcPhases.nara = "met";
  } else {
    state.npcPhases.nara = "unmet";
  }

  if (state.quest.sunkenForecourtCleared) {
    state.npcPhases.mirelle = "waiting";
  } else {
    state.npcPhases.mirelle = "absent";
  }

  if (state.rewards.shrineCacheCollected) {
    state.sideQuests.pilgrimCharm = "completed";
  }

  if (state.rewards.waysideLoreTabletRead) {
    state.sideQuests.waysideWitness = "completed";
  } else if (state.quest.waysideEchoSeen && state.sideQuests.waysideWitness === "unstarted") {
    state.sideQuests.waysideWitness = "available";
  }

  if (state.rewards.shepherdTradeCacheInspected) {
    state.sideQuests.shepherdTradeCache = "hinted";
  } else if (state.quest.reachedShepherdsRest && state.sideQuests.shepherdTradeCache === "unstarted") {
    state.sideQuests.shepherdTradeCache = "available";
  }

  if (state.quest.ferrymanMet && state.sideQuests.ferrymanAtDusk === "unstarted") {
    state.sideQuests.ferrymanAtDusk = "active";
  }
  if (state.quest.falseMarkerRevealed && state.sideQuests.ferrymanAtDusk === "active") {
    state.sideQuests.ferrymanAtDusk = "updated";
  }

  if (state.quest.sunkenForecourtCleared && state.sideQuests.heirloomBell === "unstarted") {
    state.sideQuests.heirloomBell = "available";
  }
  if (state.rewards.sunkenLoreTabletRead && state.sideQuests.heirloomBell === "available") {
    state.sideQuests.heirloomBell = "updated";
  }

  if (state.quest.falseMarkerRevealed && state.sideQuests.namelessStone === "unstarted") {
    state.sideQuests.namelessStone = "active";
  }
  if (state.rewards.namelessStoneClueRead && state.sideQuests.namelessStone === "active") {
    state.sideQuests.namelessStone = "updated";
  }
  if (state.quest.namelessStoneResolved) {
    state.sideQuests.namelessStone = "completed";
  }
}

function buildSaveData() {
  syncDerivedProgress();
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    items: cloneData(state.items),
    quest: {
      ...cloneData(state.quest),
      waysideLit: state.quest.waysideLit.map((value) => Boolean(value)),
      sunkenBraziersLit: state.quest.sunkenBraziersLit.map((value) => Boolean(value)),
      falseMarkerBraziersLit: state.quest.falseMarkerBraziersLit.map((value) => Boolean(value)),
      causewayBraziersLit: state.quest.causewayBraziersLit.map((value) => Boolean(value))
    },
    shortcuts: cloneData(state.shortcuts),
    rewards: cloneData(state.rewards),
    npcPhases: cloneData(state.npcPhases),
    sideQuests: cloneData(state.sideQuests),
    checkpoint: cloneData(state.checkpoint)
  };
}

function applySaveData(saveData) {
  const normalized = normalizeSaveData(saveData);
  state.items = cloneData(normalized.items);
  state.quest = cloneData(normalized.quest);
  state.shortcuts = cloneData(normalized.shortcuts);
  state.rewards = cloneData(normalized.rewards);
  state.npcPhases = cloneData(normalized.npcPhases);
  state.sideQuests = cloneData(normalized.sideQuests);
  state.checkpoint = cloneData(normalized.checkpoint);
  state.currentScreen = normalized.checkpoint.screenId;
  state.currentSpawn = normalized.checkpoint.spawnId;
  state.player.hp = 3;
  state.player.attackTimer = 0;
  state.player.invincibleTimer = 0;
  state.message = null;
  state.prompt = null;
  syncDerivedProgress();
}

function saveProgress(reason = "Progress saved") {
  const store = storage();
  if (!store) {
    state.meta.saveLoaded = false;
    state.meta.lastSaveReason = "Save unavailable";
    updateSavePanel();
    return false;
  }

  try {
    const payload = buildSaveData();
    store.setItem(SAVE_KEY, JSON.stringify(payload));
    state.meta.saveLoaded = true;
    state.meta.lastSaveReason = reason;
    state.meta.lastSaveTime = payload.savedAt;
    updateSavePanel();
    return true;
  } catch (error) {
    state.meta.saveLoaded = false;
    state.meta.lastSaveReason = "Save failed";
    updateSavePanel();
    console.error("Failed to save Elderfield progress.", error);
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
    updateSavePanel();
    return true;
  } catch (error) {
    state.meta.saveLoaded = false;
    state.meta.lastSaveReason = "Save unreadable";
    updateSavePanel();
    console.error("Failed to load Elderfield progress.", error);
    return false;
  }
}

function clearSavedProgress() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear Elderfield progress.", error);
  }
}

function updateCheckpoint(screenId = state.currentScreen, spawnId = state.currentSpawn || "default") {
  state.checkpoint.screenId = screenId;
  state.checkpoint.spawnId = spawnId;
}

function commitProgress(reason) {
  syncDerivedProgress();
  updateHud();
  saveProgress(reason);
}

function hasLanternOfDawn() {
  return Boolean(state.items.lanternOfDawn);
}

function hasMarshHook() {
  return Boolean(state.items.marshHook);
}

function lanternLockedMessage() {
  showMessage("Lantern Needed", "This action needs the Lantern of Dawn. The slice starts with it equipped, and later saves will treat it as a persistent item unlock.");
}

function marshHookLockedMessage() {
  showMessage("Marsh Hook Needed", "This anchor point needs the Marsh Hook. The catacombs are showing you the route now so the item payoff reads cleanly when you reach the reliquary.");
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

function objectiveText() {
  if (!state.quest.muralRead) {
    return "Inspect the chapel mural. The old road will make more sense once the village remembers what it was built on.";
  }
  if (!state.quest.highroadBurned) {
    return "Take the Lantern to the north edge of Rowan Hollow and burn open the Highroad brambles.";
  }
  if (!state.quest.watchgateOpen) {
    return "Climb to Watchgate, light both braziers, and burn the winch free so the old road can open.";
  }
  if (!state.quest.waysideEchoSeen) {
    return "Reach the Bell of the Wayside and awaken all four braziers to trigger the roadside echo.";
  }
  if (!state.quest.reachedShepherdsRest) {
    return "Continue north and reach Shepherd's Rest. Greyfen opens from there now.";
  }
  if (!state.quest.greyfenBranchBurned) {
    return "At Shepherd's Rest, burn through the southeast vine mat to open the Greyfen descent.";
  }
  if (!state.quest.ferrymanMet) {
    return "Descend into Greyfen and reach Ferryman's Reach. Someone there still keeps names for the dead.";
  }
  if (!state.quest.falseMarkerRevealed) {
    return "Follow the dry path south to False Marker Knoll and reveal what the memorial is hiding.";
  }
  if (!state.quest.graveRowsBurned) {
    return "Push south into the Memorial Flats and burn clear the thorn-choked grave rows.";
  }
  if (!state.quest.causewayCleared) {
    return "Reach the Drowned Causeway and light its braziers to cut the fog and expose the safe path.";
  }
  if (!state.quest.reachedFenwatch) {
    return "Make the final push to Fenwatch Approach and free the catacomb winch.";
  }
  if (!state.quest.fenwatchWinchFreed) {
    return "Burn the thorn from Fenwatch's chain winch and open the catacomb door.";
  }
  if (!state.quest.fenwatchHallEchoSeen) {
    return "Enter Fenwatch Catacombs and read the Hall of Names.";
  }
  if (!state.quest.fenwatchReliquaryGateOpen) {
    return "Work through Fenwatch's sluice and bell route to open the Warden Reliquary.";
  }
  if (!state.items.marshHook) {
    return "Claim the Marsh Hook from the Warden Reliquary.";
  }
  if (!state.quest.fenwatchBridgePulled) {
    return "Use the Marsh Hook in Chain Gallery to pull a path deeper into Fenwatch.";
  }
  if (!state.quest.fenwatchTestimonySeen) {
    return "Cross into the Testimony Vault and uncover what Fenwatch buried with its dead.";
  }
  if (state.items.marshHook && !state.shortcuts.bellwaterBreachOpen) {
    return "Optional: return to Memorial Flats and use the Marsh Hook on the east breach chain to open Bellwater Lock.";
  }
  if (state.shortcuts.bellwaterBreachOpen && !state.quest.namelessStoneResolved) {
    return "Optional: ride the Bellwater ferry to Memorial Isle and resolve the hidden Warden memorial.";
  }
  if (!state.quest.sunkenForecourtCleared) {
    return "The main clue is uncovered. Optional: take the west branch from Marshfoot Landing and clear the Sunken Chapel forecourt.";
  }
  return "Fenwatch's first dungeon slice is complete. Bellwater and Memorial Isle now sit open on the Marsh Hook return route.";
}

function updateHud() {
  const screen = screens[state.currentScreen];
  screenIdEl.textContent = state.currentScreen;
  screenNameEl.textContent = screen.name;
  screenRegionEl.textContent = screen.region;
  objectiveTextEl.textContent = objectiveText();
  renderInventory();
  updateSavePanel();
}

function drawPixelText(text, x, y, color = palette.white, align = "left", size = 8) {
  ctx.fillStyle = color;
  ctx.font = `${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function drawPanel(x, y, w, h, title, body) {
  ctx.fillStyle = "rgba(18, 14, 12, 0.76)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(239, 227, 201, 0.7)";
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  drawPixelText(title, x + 8, y + 12, "#f7e2a2", "left", 8);
  drawPixelText(body, x + 8, y + 26, palette.white, "left", 7);
}

function drawPromptLine(text) {
  if (!text) return;
  const width = text.length * 6 + 14;
  const x = WIDTH / 2 - width / 2;
  const y = HEIGHT - 18;
  ctx.fillStyle = "rgba(16, 12, 10, 0.74)";
  ctx.fillRect(x, y, width, 12);
  ctx.strokeStyle = "rgba(247, 227, 165, 0.75)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 11);
  drawPixelText(text, x + width / 2, y + 8, palette.white, "center", 7);
}

function drawHouse(x, y, w, h) {
  ctx.fillStyle = palette.roof;
  ctx.fillRect(x - 4, y - 8, w + 8, 12);
  ctx.fillStyle = palette.chapel;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = palette.wood;
  ctx.fillRect(x + Math.floor(w / 2) - 6, y + h - 14, 12, 14);
  ctx.fillStyle = "#7f8ba1";
  ctx.fillRect(x + 6, y + 8, 8, 8);
  ctx.fillRect(x + w - 14, y + 8, 8, 8);
}

function drawTree(x, y, size = 14) {
  ctx.fillStyle = palette.deepGrass;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.grassAlt;
  ctx.beginPath();
  ctx.arc(x - 3, y - 2, size / 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.wood;
  ctx.fillRect(x - 2, y + size / 4, 4, 8);
}

function drawReeds(x, y, w, h) {
  ctx.fillStyle = palette.reedDark;
  for (let px = x; px < x + w; px += 6) {
    const height = 6 + ((px + y) % 7);
    ctx.fillRect(px, y + h - height, 2, height);
    ctx.fillRect(px + 2, y + h - height + 2, 2, height - 2);
  }
}

function cryptBackdrop() {
  ctx.fillStyle = palette.cryptDark;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = palette.crypt;
  ctx.fillRect(8, 8, WIDTH - 16, HEIGHT - 16);
  ctx.fillStyle = palette.cryptFloor;
  for (let y = 16; y < HEIGHT - 16; y += 16) {
    for (let x = 16; x < WIDTH - 16; x += 24) {
      ctx.fillRect(x, y, 10, 2);
    }
  }
}

function drawPortcullis(x, y, w, h, open) {
  ctx.fillStyle = open ? "#5a5148" : "#463f39";
  ctx.fillRect(x, y, w, open ? 6 : h);
  if (!open) {
    ctx.strokeStyle = "#8a7a62";
    for (let px = x + 4; px < x + w; px += 8) {
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + h);
      ctx.stroke();
    }
  }
}

function drawBell(x, y) {
  ctx.fillStyle = "#957651";
  ctx.fillRect(x - 8, y - 6, 16, 10);
  ctx.fillStyle = "#6c5841";
  ctx.fillRect(x - 2, y + 4, 4, 4);
}

function drawChainSegment(x, y, length = 24, vertical = true) {
  ctx.fillStyle = palette.chain;
  if (vertical) {
    for (let py = y; py < y + length; py += 6) {
      ctx.fillRect(x, py, 2, 4);
    }
  } else {
    for (let px = x; px < x + length; px += 6) {
      ctx.fillRect(px, y, 4, 2);
    }
  }
}

function drawHookRing(x, y, active = true) {
  ctx.strokeStyle = active ? "#d3c39b" : "#736b5f";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = active ? "#d3c39b" : "#736b5f";
  ctx.fillRect(x - 1, y - 7, 2, 4);
}

function drawBramble(x, y, w, h, cleared) {
  ctx.fillStyle = cleared ? "#57392e" : palette.bramble;
  ctx.fillRect(x, y, w, h);
  if (!cleared) {
    ctx.strokeStyle = "#a14b59";
    for (let i = 0; i < w; i += 6) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + 4, y);
      ctx.stroke();
    }
  }
}

function drawBrazier(x, y, lit) {
  ctx.fillStyle = palette.stoneDark;
  ctx.fillRect(x - 3, y - 2, 6, 6);
  ctx.fillStyle = lit ? palette.fire : "#58514b";
  ctx.beginPath();
  ctx.arc(x, y - 4, lit ? 4 : 2.5, 0, Math.PI * 2);
  ctx.fill();
  if (lit) {
    ctx.fillStyle = "rgba(255, 210, 107, 0.25)";
    ctx.beginPath();
    ctx.arc(x, y - 4, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawChest(x, y, opened = false) {
  ctx.fillStyle = opened ? "#7a6748" : "#8f623e";
  ctx.fillRect(x, y, 12, 8);
  ctx.fillStyle = "#d8c27d";
  ctx.fillRect(x + 1, y + 1, 10, 2);
}

function drawLanternGlow(x, y, radius = 18) {
  ctx.fillStyle = "rgba(255, 210, 107, 0.16)";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const p = state.player;
  drawLanternGlow(p.x + p.w / 2, p.y + p.h / 2, 24);
  ctx.fillStyle = "#d9d1bf";
  ctx.fillRect(p.x + 2, p.y, 6, 5);
  ctx.fillStyle = "#4779a1";
  ctx.fillRect(p.x + 1, p.y + 4, 8, 7);
  ctx.fillStyle = "#8b6038";
  ctx.fillRect(p.x, p.y + 11, 4, 1);
  ctx.fillRect(p.x + 6, p.y + 11, 4, 1);
  if (state.player.attackTimer > 0) {
    ctx.fillStyle = "#f7e59f";
    const hitbox = attackHitbox();
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
  }
}

function attackHitbox() {
  const p = state.player;
  switch (p.dir) {
    case "up":
      return rect(p.x - 2, p.y - 8, 14, 8);
    case "down":
      return rect(p.x - 2, p.y + p.h, 14, 8);
    case "left":
      return rect(p.x - 8, p.y - 2, 8, 14);
    default:
      return rect(p.x + p.w, p.y - 2, 8, 14);
  }
}

function drawEnemy(enemy) {
  if (!enemy.alive) return;
  let color = palette.scavenger;
  if (enemy.type === "crow") color = palette.crow;
  if (enemy.type === "hound") color = palette.hound;
  if (enemy.type === "wraith") color = palette.wraith;
  if (enemy.type === "moth") color = "#cbbf72";
  if (enemy.type === "leaper") color = "#4f6d42";
  if (enemy.type === "stalker") color = "#7a5841";
  ctx.fillStyle = color;
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
  ctx.fillStyle = "#f4eee2";
  ctx.fillRect(enemy.x + 2, enemy.y + 2, 2, 2);
  ctx.fillRect(enemy.x + enemy.w - 4, enemy.y + 2, 2, 2);
}

function drawNpc(npc) {
  ctx.fillStyle = npc.color || "#d9cdb9";
  ctx.fillRect(npc.x, npc.y, 10, 12);
  ctx.fillStyle = npc.cloak || "#6d4c7c";
  ctx.fillRect(npc.x + 1, npc.y + 4, 8, 8);
}

function drawPrompt() {
  if (!state.prompt || state.message) return;
  drawPromptLine(state.prompt.text);
}

function drawHearts() {
  const x = 10;
  const y = 10;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = palette.healthBg;
    ctx.fillRect(x + i * 12, y, 10, 8);
    if (i < state.player.hp) {
      ctx.fillStyle = palette.health;
      ctx.fillRect(x + i * 12 + 1, y + 1, 8, 6);
    }
  }
  drawPixelText("Lantern", WIDTH - 10, 16, "#ffe3a3", "right", 8);
}

function drawScreenHeader() {
  drawPanel(8, HEIGHT - 34, 180, 24, `${state.currentScreen}  ${screens[state.currentScreen].name}`, screens[state.currentScreen].region);
}

function grassBackdrop() {
  ctx.fillStyle = palette.grass;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = palette.grassAlt;
  for (let i = 0; i < 80; i += 1) {
    const x = (i * 41) % WIDTH;
    const y = (i * 29) % HEIGHT;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawRoadRect(x, y, w, h, vertical = false) {
  ctx.fillStyle = palette.road;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = palette.roadShade;
  if (vertical) {
    for (let py = y; py < y + h; py += 10) {
      ctx.fillRect(x + Math.floor(w / 2) - 1, py, 2, 5);
    }
  } else {
    for (let px = x; px < x + w; px += 10) {
      ctx.fillRect(px, y + Math.floor(h / 2) - 1, 5, 2);
    }
  }
}

function drawStoneRect(x, y, w, h) {
  ctx.fillStyle = palette.stone;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = palette.stoneDark;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawWaterRect(x, y, w, h) {
  ctx.fillStyle = palette.water;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = palette.waterAlt;
  for (let px = x; px < x + w; px += 14) {
    ctx.fillRect(px, y + ((px + h) % 10), 8, 2);
  }
}

function drawFogBand(x, y, w, h) {
  ctx.fillStyle = palette.fog;
  ctx.fillRect(x, y, w, h);
}

function marshBackdrop() {
  ctx.fillStyle = palette.marsh;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = palette.marshAlt;
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 37) % WIDTH;
    const y = (i * 23) % HEIGHT;
    ctx.fillRect(x, y, 3, 2);
  }
}

function getNearestInteractable(screen) {
  const defs = screen.interactables(state);
  const playerCenter = centerOf(state.player);
  let best = null;
  let bestDistance = Infinity;
  for (const item of defs) {
    const itemCenter = centerOf(item.rect);
    const d = distance(playerCenter, itemCenter);
    if (d < 24 && d < bestDistance) {
      best = item;
      bestDistance = d;
    }
  }
  return best;
}

function getNearestHookTarget(screen) {
  if (!screen.hookTargets) return null;
  const defs = screen.hookTargets(state);
  const playerCenter = centerOf(state.player);
  let best = null;
  let bestDistance = Infinity;
  for (const item of defs) {
    const itemCenter = centerOf(item.rect);
    const d = distance(playerCenter, itemCenter);
    if (d < 32 && d < bestDistance) {
      best = item;
      bestDistance = d;
    }
  }
  return best;
}

function movementInput() {
  let dx = 0;
  let dy = 0;
  if (keysDown.has("ArrowUp") || keysDown.has("KeyW")) dy -= 1;
  if (keysDown.has("ArrowDown") || keysDown.has("KeyS")) dy += 1;
  if (keysDown.has("ArrowLeft") || keysDown.has("KeyA")) dx -= 1;
  if (keysDown.has("ArrowRight") || keysDown.has("KeyD")) dx += 1;
  if (dx !== 0 && dy !== 0) {
    dx *= 0.7071;
    dy *= 0.7071;
  }
  return { dx, dy };
}

function currentSolids() {
  return screens[state.currentScreen].solids(state);
}

function movePlayer(dt) {
  const p = state.player;
  const input = movementInput();
  if (input.dx === 0 && input.dy === 0) return;
  if (Math.abs(input.dx) > Math.abs(input.dy)) {
    p.dir = input.dx > 0 ? "right" : "left";
  } else {
    p.dir = input.dy > 0 ? "down" : "up";
  }
  const speed = p.speed * dt;
  p.x += input.dx * speed;
  resolveCollisions("x");
  p.y += input.dy * speed;
  resolveCollisions("y");
  p.x = clamp(p.x, 0, WIDTH - p.w);
  p.y = clamp(p.y, 0, HEIGHT - p.h);
}

function resolveCollisions(axis) {
  const p = state.player;
  for (const solid of currentSolids()) {
    if (!overlaps(p, solid)) continue;
    if (axis === "x") {
      if (p.dir === "right") p.x = solid.x - p.w;
      if (p.dir === "left") p.x = solid.x + solid.w;
    } else {
      if (p.dir === "down") p.y = solid.y - p.h;
      if (p.dir === "up") p.y = solid.y + solid.h;
    }
  }
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
        showMessage("Fallen", "The road throws you back to the screen edge. This prototype resets your health instead of doing a full death loop.");
        loadScreen(state.currentScreen, "default");
        break;
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
      if (enemy.hp <= 0) enemy.alive = false;
    }
  }
}

function movePlayerTo(x, y, dir = state.player.dir) {
  state.player.x = x;
  state.player.y = y;
  state.player.dir = dir;
}

function handleInteraction() {
  const screen = screens[state.currentScreen];
  const nearest = getNearestInteractable(screen);
  const hookTarget = hasMarshHook() ? getNearestHookTarget(screen) : null;
  const promptParts = [];
  if (nearest) promptParts.push(`[E] ${nearest.label}`);
  if (hookTarget) promptParts.push(`[K] ${hookTarget.label || "Use Marsh Hook"}`);
  state.prompt = promptParts.length ? { text: promptParts.join("   ") } : null;
  if (hookTarget && justPressed("KeyK")) {
    hookTarget.onHook();
    return;
  }
  if (nearest && justPressed("KeyE")) {
    nearest.onInteract();
  }
}

function handleTransitions() {
  if (state.transitionCooldown > 0) return;
  for (const transition of screens[state.currentScreen].transitions(state)) {
    if (overlaps(state.player, transition.rect)) {
      loadScreen(transition.to, transition.spawn);
      return;
    }
  }
}

function enterScreen(id) {
  if (id === "HV-07" && !state.quest.reachedShepherdsRest) {
    state.quest.reachedShepherdsRest = true;
    commitProgress("Checkpoint saved: Shepherd's Rest reached");
    showMessage("Shepherd's Rest", "The upland road finally widens here. Yselle has made camp, Greyfen lies below the southeast descent, and the march no longer waits for another prototype pass.");
  }
  if (id === "GF-10" && !state.quest.reachedFenwatch) {
    state.quest.reachedFenwatch = true;
    commitProgress("Checkpoint saved: Fenwatch Approach reached");
    showMessage("Fenwatch Approach", "The marsh tightens into old military stone here. Fenwatch's buried gate is in front of you now, with the catacomb door still chained fast.");
  }
  if (id === "GF-08" && !state.quest.reachedBellwaterLock) {
    state.quest.reachedBellwaterLock = true;
    commitProgress("Checkpoint saved: Bellwater Lock reached");
    showMessage("Bellwater Lock", "The old flood controls still stand here, rusted into the marsh. From this lock you can fold Greyfen back toward Fenwatch or cross east to the hidden memorial waters.");
  }
  if (id === "FC-01" && !state.quest.fenwatchHallEchoSeen) {
    state.quest.fenwatchHallEchoSeen = true;
    commitProgress("Dungeon state saved: Fenwatch Hall of Names entered");
    showMessage("Hall of Names", "Memorial rows stretch beneath the catacomb ceiling, half-finished and water-stained. Fenwatch was meant to honor the dead. Instead it became the place their truth was stored out of sight.");
  }
}

function loadScreen(id, spawn = "default", options = {}) {
  state.currentScreen = id;
  state.currentSpawn = spawn;
  const screen = screens[id];
  state.enemies = screen.spawnEnemies();
  const point = screen.spawns[spawn] || screen.spawns.default;
  state.player.x = point.x;
  state.player.y = point.y;
  const facingBySpawn = {
    south: "up",
    north: "down",
    east: "left",
    west: "right",
    lift: "left"
  };
  state.player.dir = facingBySpawn[spawn] || "down";
  state.transitionCooldown = 0.25;
  updateCheckpoint(id, spawn);
  updateHud();
  enterScreen(id);
  if (!options.skipSave) {
    saveProgress(`Checkpoint saved: ${id}`);
  }
}

function backgroundRowanSquare() {
  grassBackdrop();
  drawRoadRect(136, 0, 48, HEIGHT, true);
  drawRoadRect(108, 80, 104, 32, false);
  drawHouse(22, 28, 46, 32);
  drawHouse(246, 30, 48, 34);
  drawTree(54, 116);
  drawTree(74, 136);
  drawTree(264, 128);
  drawStoneRect(144, 78, 32, 24);
  ctx.fillStyle = "#a7c8d1";
  ctx.fillRect(150, 84, 20, 12);
}

function backgroundChapelGrounds() {
  grassBackdrop();
  drawRoadRect(0, 82, 116, 28, false);
  drawHouse(170, 28, 90, 54);
  drawStoneRect(156, 96, 112, 18);
  drawStoneRect(186, 124, 24, 18);
  drawTree(54, 46);
  drawTree(78, 64);
  drawTree(42, 130);
}

function backgroundHighroadEdge() {
  grassBackdrop();
  drawRoadRect(136, 0, 48, HEIGHT, true);
  drawStoneRect(56, 34, 58, 22);
  drawStoneRect(222, 40, 42, 28);
  drawTree(46, 146);
  drawTree(272, 144);
}

function backgroundShrineOverlook() {
  grassBackdrop();
  drawRoadRect(0, 84, 104, 24, false);
  drawStoneRect(188, 60, 80, 46);
  drawStoneRect(214, 44, 28, 12);
  drawTree(56, 40);
  drawTree(70, 146);
  drawTree(268, 140);
}

function backgroundHV01() {
  grassBackdrop();
  drawRoadRect(136, 0, 48, HEIGHT, true);
  drawStoneRect(104, 136, 16, 32);
  drawStoneRect(200, 34, 18, 26);
  drawTree(44, 32);
  drawTree(72, 52);
  drawTree(266, 120);
}

function backgroundHV02() {
  grassBackdrop();
  drawRoadRect(128, 0, 64, HEIGHT, true);
  drawStoneRect(82, 26, 26, 26);
  drawStoneRect(214, 114, 30, 22);
  drawTree(42, 148);
  drawTree(278, 48);
}

function backgroundHV03() {
  grassBackdrop();
  drawRoadRect(126, 0, 68, HEIGHT, true);
  drawStoneRect(12, 24, 54, 22);
  drawStoneRect(238, 118, 46, 18);
  drawTree(46, 146);
  drawTree(92, 158);
  drawTree(286, 40);
  drawFogBand(228, 0, 92, 54);
}

function backgroundHV04() {
  grassBackdrop();
  drawStoneRect(84, 24, 152, 132);
  drawRoadRect(136, 24, 48, 132, true);
  drawStoneRect(128, 20, 64, 10);
  drawStoneRect(128, 150, 64, 10);
}

function backgroundHV06() {
  grassBackdrop();
  drawRoadRect(128, 0, 64, HEIGHT, true);
  drawStoneRect(112, 64, 96, 64);
  drawStoneRect(138, 42, 44, 14);
  drawTree(54, 34);
  drawTree(264, 40);
  drawTree(50, 150);
  drawTree(272, 148);
}

function backgroundHV07() {
  grassBackdrop();
  drawRoadRect(126, 0, 68, HEIGHT, true);
  drawRoadRect(126, 78, WIDTH - 126, 36, false);
  drawStoneRect(204, 40, 76, 44);
  drawTree(40, 40);
  drawTree(64, 62);
  drawTree(52, 146);
  drawTree(292, 22);
}

function backgroundHV10() {
  grassBackdrop();
  drawRoadRect(92, 0, 54, 112, true);
  drawRoadRect(92, 108, 138, 24, false);
  drawRoadRect(176, 108, 40, 76, true);
  drawStoneRect(218, 96, 20, 74);
  drawTree(44, 34);
  drawTree(58, 62);
  drawFogBand(160, 126, 160, 66);
}

function backgroundGF01() {
  marshBackdrop();
  drawWaterRect(0, 0, 88, HEIGHT);
  drawWaterRect(252, 0, 68, HEIGHT);
  drawRoadRect(86, 72, 152, 32, false);
  drawStoneRect(132, 58, 56, 20);
  drawReeds(18, 14, 40, 46);
  drawReeds(266, 122, 32, 40);
  drawFogBand(0, 0, WIDTH, 26);
}

function backgroundGF02() {
  marshBackdrop();
  drawWaterRect(202, 0, 118, HEIGHT);
  drawRoadRect(0, 78, 214, 28, false);
  drawStoneRect(104, 48, 44, 22);
  drawStoneRect(222, 104, 38, 18);
  drawReeds(228, 20, 28, 38);
  drawReeds(24, 124, 32, 30);
  drawFogBand(182, 0, 138, 24);
}

function backgroundGF03() {
  marshBackdrop();
  drawWaterRect(0, 112, WIDTH, 80);
  drawRoadRect(132, 0, 40, 124, true);
  drawStoneRect(50, 24, 40, 22);
  drawReeds(18, 120, 88, 44);
  drawReeds(212, 112, 86, 42);
  drawFogBand(0, 0, WIDTH, 20);
}

function backgroundGF04() {
  marshBackdrop();
  drawWaterRect(86, 48, 150, 72);
  drawStoneRect(118, 26, 84, 22);
  drawStoneRect(120, 118, 92, 28);
  drawStoneRect(228, 56, 36, 66);
  drawReeds(32, 42, 28, 62);
  drawReeds(268, 28, 24, 74);
  drawFogBand(0, 0, WIDTH, 18);
}

function backgroundGF05() {
  marshBackdrop();
  drawRoadRect(130, 0, 60, HEIGHT, true);
  drawStoneRect(96, 52, 128, 50);
  drawStoneRect(134, 34, 52, 18);
  drawWaterRect(0, 126, 82, 66);
  drawWaterRect(246, 126, 74, 66);
  drawReeds(18, 124, 42, 42);
  drawReeds(262, 126, 30, 40);
  drawFogBand(0, 0, WIDTH, 24);
}

function backgroundGF06() {
  marshBackdrop();
  drawRoadRect(126, 0, 68, HEIGHT, true);
  drawStoneRect(34, 48, 36, 28);
  drawStoneRect(242, 52, 34, 24);
  drawWaterRect(0, 128, 98, 64);
  drawWaterRect(222, 128, 98, 64);
  drawReeds(20, 126, 46, 42);
  drawReeds(254, 126, 36, 40);
  drawFogBand(0, 0, WIDTH, 18);
}

function backgroundGF07() {
  marshBackdrop();
  drawWaterRect(0, 0, 104, HEIGHT);
  drawWaterRect(216, 0, 104, HEIGHT);
  drawStoneRect(104, 0, 112, HEIGHT);
  drawRoadRect(132, 0, 56, HEIGHT, true);
  drawFogBand(0, 0, WIDTH, 46);
}

function backgroundGF10() {
  marshBackdrop();
  drawStoneRect(96, 24, 128, 124);
  drawRoadRect(132, 0, 56, 148, true);
  drawStoneRect(128, 18, 64, 16);
  drawStoneRect(122, 122, 76, 22);
  drawWaterRect(0, 134, 84, 58);
  drawWaterRect(236, 134, 84, 58);
  drawFogBand(0, 0, WIDTH, 28);
}

function backgroundGF08() {
  marshBackdrop();
  drawWaterRect(0, 94, 112, 98);
  drawWaterRect(208, 0, 112, HEIGHT);
  drawStoneRect(100, 34, 74, 48);
  drawStoneRect(118, 116, 56, 24);
  drawStoneRect(188, 128, 20, 36);
  drawChainSegment(194, 96, 30, true);
  drawHookRing(196, 90, true);
  drawChainSegment(218, 96, 28, true);
  drawHookRing(220, 90, true);
  drawReeds(18, 118, 50, 42);
}

function backgroundGF09() {
  marshBackdrop();
  drawWaterRect(0, 0, 72, HEIGHT);
  drawWaterRect(248, 0, 72, HEIGHT);
  drawStoneRect(112, 42, 96, 84);
  drawStoneRect(136, 54, 48, 28);
  drawReeds(26, 18, 28, 62);
  drawReeds(268, 106, 24, 56);
}

function backgroundFC01() {
  cryptBackdrop();
  drawStoneRect(128, 18, 64, 18);
  drawStoneRect(52, 62, 34, 74);
  drawStoneRect(234, 62, 34, 74);
  drawWaterRect(204, 120, 84, 36);
  drawHookRing(248, 116, true);
  drawChainSegment(248, 86, 28, true);
}

function backgroundFC02() {
  cryptBackdrop();
  drawWaterRect(208, 0, 112, HEIGHT);
  drawStoneRect(112, 44, 42, 22);
  drawStoneRect(176, 82, 20, 56);
  drawChainSegment(166, 36, 40, true);
}

function backgroundFC03() {
  cryptBackdrop();
  drawWaterRect(120, 84, 120, 58);
  drawStoneRect(38, 26, 54, 24);
  drawStoneRect(242, 40, 34, 82);
  drawStoneRect(120, 144, 120, 18);
}

function backgroundFC04() {
  cryptBackdrop();
  drawStoneRect(24, 20, 60, 42);
  drawWaterRect(132, 64, 88, 50);
  drawBell(70, 48);
  drawChainSegment(70, 18, 28, true);
  drawHookRing(172, 90, true);
  if (state.shortcuts.fenwatchBridgeOpen) {
    drawStoneRect(132, 88, 88, 14);
  }
}

function backgroundFC05() {
  cryptBackdrop();
  drawStoneRect(122, 54, 76, 54);
  drawChainSegment(160, 36, 20, true);
  drawHookRing(160, 50, true);
}

function backgroundFC06() {
  cryptBackdrop();
  drawWaterRect(44, 40, 84, 86);
  drawStoneRect(176, 46, 94, 78);
  drawBell(86, 62);
  drawChainSegment(86, 22, 28, true);
  drawPortcullis(128, 136, 64, 18, false);
  drawHookRing(118, 62, true);
}

const screens = {
  "RH-01": {
    name: "Rowan Hollow Square",
    region: "Opening Area",
    spawns: {
      default: { x: 152, y: 126 },
      east: { x: 24, y: 98 },
      north: { x: 154, y: 24 }
    },
    draw() {
      backgroundRowanSquare();
    },
    solids() {
      return [
        rect(18, 24, 54, 40),
        rect(242, 24, 58, 42),
        rect(40, 108, 46, 44),
        rect(244, 112, 48, 42),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT),
        rect(0, HEIGHT - 8, WIDTH, 8)
      ];
    },
    transitions() {
      return [
        { rect: rect(WIDTH - 10, 88, 12, 28), to: "RH-02", spawn: "west" },
        { rect: rect(144, -2, 32, 10), to: "RH-03", spawn: "south" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(116, 82, 28, 22),
          label: "Read village stone",
          onInteract: () => showMessage("Village Stone", "Rowan Hollow still marks the feast-days by bells, even though the road rites that once bound the valley have faded into custom.")
        },
        {
          rect: rect(206, 96, 18, 22),
          label: "Talk to Maelin",
          onInteract: () => {
            let text = "If the mural has stirred, then the road is stirring with it. Go to the chapel cellar first.";
            if (state.npcPhases.maelin === "road_awakened") {
              text = "The chapel remembers more than the village does. Take that light north when you are ready.";
            }
            if (state.npcPhases.maelin === "road_open") {
              text = "You opened the Highroad. Good. Rowan Hollow needed to remember it could still send someone north.";
            }
            showMessage("Maelin", text);
          }
        }
      ];
    },
    npcs() {
      return [
        { x: 210, y: 96, color: "#d6c5b1", cloak: "#6d5443" }
      ];
    },
    spawnEnemies() {
      return [];
    }
  },
  "RH-02": {
    name: "Chapel Grounds",
    region: "Opening Area",
    spawns: {
      default: { x: 24, y: 96 },
      west: { x: 24, y: 96 }
    },
    draw() {
      backgroundChapelGrounds();
      drawBrazier(154, 106, true);
      drawBrazier(270, 106, true);
    },
    solids() {
      return [
        rect(166, 24, 98, 62),
        rect(154, 94, 116, 22),
        rect(34, 34, 58, 38),
        rect(30, 114, 42, 40),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      return [
        { rect: rect(-2, 88, 10, 28), to: "RH-01", spawn: "east" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(186, 124, 24, 18),
          label: state.quest.muralRead ? "Re-read mural" : "Inspect mural",
          onInteract: () => {
            state.quest.muralRead = true;
            commitProgress("Quest saved: Chapel mural inspected");
            showMessage("Chapel Mural", "In fading paint: a crowned figure, an armed Warden, and a dragon stand before one living flame. One bell hangs whole, one cracked. The road beyond Rowan Hollow was part of a covenant, not a trade path alone.");
          }
        },
        {
          rect: rect(116, 74, 16, 22),
          label: "Talk to Brother Theon",
          onInteract: () => {
            let text = "The old cellar keeps older paint than the village deserves. See it before you climb.";
            if (state.npcPhases.theon === "mural_understood") {
              text = "Crown, Warden, witness. There is your road-order. Take the Lantern north. The Highroad will answer sacred fire before it answers you.";
            }
            if (state.npcPhases.theon === "echo_witnessed") {
              text = "The road is speaking in memories again. When stone starts telling the truth, kingdoms tend to grow quiet.";
            }
            showMessage("Brother Theon", text);
          }
        }
      ];
    },
    npcs() {
      return [
        { x: 118, y: 74, color: "#dad0bc", cloak: "#4f6b7f" }
      ];
    },
    spawnEnemies() {
      return [];
    }
  },
  "RH-03": {
    name: "Highroad Edge",
    region: "Opening Area",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 },
      east: { x: 28, y: 92 }
    },
    draw() {
      backgroundHighroadEdge();
      drawBramble(126, 8, 68, 18, state.shortcuts.highroadNorthOpen);
      drawPixelText("North to Highroad Vale", 160, 36, "#f6e4a5", "center", 8);
    },
    solids() {
      const solids = [
        rect(52, 30, 66, 30),
        rect(216, 34, 52, 34),
        rect(26, 122, 46, 38),
        rect(246, 118, 44, 42),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(0, 0, 8, HEIGHT)
      ];
      if (!state.shortcuts.highroadNorthOpen) {
        solids.push(rect(126, 8, 68, 18));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "RH-01", spawn: "north" },
        { rect: rect(WIDTH - 10, 88, 12, 28), to: "RH-04", spawn: "west" }
      ];
      if (state.shortcuts.highroadNorthOpen) {
        transitions.push({ rect: rect(144, -2, 32, 10), to: "HV-01", spawn: "south" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(130, 8, 60, 18),
          label: state.shortcuts.highroadNorthOpen ? "Old road opened" : "Burn brambles",
          onInteract: () => {
            if (!state.quest.muralRead) {
              showMessage("Highroad Brambles", "The Lantern will take the thorns, but the chapel mural still holds the reason you should go. See it first.");
              return;
            }
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.highroadBurned) {
              state.quest.highroadBurned = true;
              commitProgress("Route saved: Highroad brambles cleared");
              showMessage("The Highroad Opens", "Sacred fire eats through the bramble-dark growth. Beyond Rowan Hollow, the old upland road finally lies open.");
            } else {
              showMessage("Opened Road", "The Lantern burned a clean seam through the corruption. The Highroad is passable.");
            }
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [];
    }
  },
  "RH-04": {
    name: "Shrine Overlook",
    region: "Opening Area",
    spawns: {
      default: { x: 26, y: 96 },
      west: { x: 26, y: 96 }
    },
    draw() {
      backgroundShrineOverlook();
      drawBramble(244, 118, 26, 16, state.rewards.shrineCacheCollected);
      drawChest(250, 122, state.rewards.shrineCacheCollected);
    },
    solids() {
      const solids = [
        rect(184, 56, 88, 54),
        rect(34, 30, 38, 38),
        rect(44, 132, 40, 30),
        rect(248, 134, 30, 18),
        rect(0, 0, WIDTH, 8),
        rect(WIDTH - 8, 0, 8, HEIGHT),
        rect(0, HEIGHT - 8, WIDTH, 8)
      ];
      if (!state.rewards.shrineCacheCollected) {
        solids.push(rect(244, 118, 26, 16));
      }
      return solids;
    },
    transitions() {
      return [
        { rect: rect(-2, 88, 10, 28), to: "RH-03", spawn: "east" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(214, 44, 28, 14),
          label: "Inspect cracked bell",
          onInteract: () => showMessage("Cracked Bell", "The bell face is split almost through. Someone scratched a final prayer into the bronze after it broke: 'Light remembers the road.'")
        },
        {
          rect: rect(244, 118, 26, 16),
          label: state.rewards.shrineCacheCollected ? "Open chest" : "Burn vine-chest",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.rewards.shrineCacheCollected) {
              state.rewards.shrineCacheCollected = true;
              commitProgress("Reward saved: Shrine cache collected");
              showMessage("Shrine Cache", "The Lantern peels away the cursed vine wrap. Inside is a small field charm and a note from an earlier pilgrim who feared the road had gone dark.");
            } else {
              showMessage("Shrine Cache", "Only the smell of old ash and oiled leather remains.");
            }
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [];
    }
  },
  "HV-01": {
    name: "Highroad Spur Gate",
    region: "Highroad Vale",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 }
    },
    draw() {
      backgroundHV01();
      drawPixelText("The Highroad", 160, 18, "#f6e4a5", "center", 8);
    },
    solids() {
      return [
        rect(96, 132, 28, 42),
        rect(196, 28, 26, 36),
        rect(16, 18, 70, 56),
        rect(232, 92, 58, 56),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      return [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "RH-03", spawn: "default" },
        { rect: rect(144, -2, 32, 10), to: "HV-02", spawn: "south" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(198, 32, 18, 22),
          label: "Read milestone",
          onInteract: () => showMessage("Milestone", "Greyfen 3 bells. Crown Road 7 bells. Cinderpeak watch 9 bells. Someone gouged away the old Warden marker beneath the distances.")
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("scavenger", 152, 86, { min: 132, max: 176, speed: 18, hp: 2 }),
        makeEnemy("crow", 110, 64, { axis: "y", min: 50, max: 92, speed: 24 })
      ];
    }
  },
  "HV-02": {
    name: "Watcher's Steps Lower",
    region: "Highroad Vale",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 }
    },
    draw() {
      backgroundHV02();
    },
    solids() {
      return [
        rect(74, 18, 40, 42),
        rect(206, 106, 42, 34),
        rect(20, 120, 48, 48),
        rect(254, 18, 46, 46)
      ];
    },
    transitions() {
      return [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "HV-01", spawn: "default" },
        { rect: rect(144, -2, 32, 10), to: "HV-03", spawn: "south" }
      ];
    },
    interactables() {
      return [];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("crow", 152, 72, { axis: "y", min: 56, max: 96, speed: 28 }),
        makeEnemy("scavenger", 140, 118, { min: 128, max: 176, speed: 16, hp: 2 })
      ];
    }
  },
  "HV-03": {
    name: "Watcher's Steps Upper",
    region: "Highroad Vale",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 }
    },
    draw() {
      backgroundHV03();
    },
    solids() {
      return [
        rect(8, 18, 62, 32),
        rect(234, 112, 52, 30),
        rect(20, 126, 90, 50),
        rect(252, 18, 52, 38)
      ];
    },
    transitions() {
      return [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "HV-02", spawn: "default" },
        { rect: rect(144, -2, 32, 10), to: "HV-04", spawn: "south" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(236, 112, 48, 20),
          label: "Survey the road",
          onInteract: () => showMessage("Overlook", "North, the gatehouse sits broken across the old road. East, the low Greyfen mist already stains the valley. Farther still, mountain towers catch the light.")
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("scavenger", 154, 96, { min: 138, max: 174, speed: 18, hp: 2 }),
        makeEnemy("crow", 168, 48, { axis: "x", min: 128, max: 188, speed: 24 })
      ];
    }
  },
  "HV-04": {
    name: "Watchgate South Court",
    region: "Highroad Vale",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 }
    },
    draw() {
      backgroundHV04();
      drawBrazier(108, 96, state.quest.watchgateBrazierA);
      drawBrazier(212, 96, state.quest.watchgateBrazierB);
      if (!state.shortcuts.watchgateShortcutOpen) {
        ctx.fillStyle = "#413933";
        ctx.fillRect(134, 24, 52, 16);
      } else {
        ctx.fillStyle = "#4d443d";
        ctx.fillRect(134, 18, 52, 6);
      }
      ctx.fillStyle = "#7b5a3d";
      ctx.fillRect(190, 56, 8, 16);
    },
    solids() {
      const solids = [
        rect(84, 24, 44, 132),
        rect(192, 24, 44, 132),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
      if (!state.shortcuts.watchgateShortcutOpen) {
        solids.push(rect(134, 24, 52, 16));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "HV-03", spawn: "default" }
      ];
      if (state.shortcuts.watchgateShortcutOpen) {
        transitions.push({ rect: rect(144, -2, 32, 10), to: "HV-06", spawn: "south" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(100, 88, 16, 18),
          label: state.quest.watchgateBrazierA ? "Brazier lit" : "Light brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.watchgateBrazierA) {
              state.quest.watchgateBrazierA = true;
              commitProgress("Gate state saved: Watchgate south brazier lit");
              showMessage("Watchgate Brazier", "Lantern fire catches at once. The stone around the bowl still remembers the rite.");
            }
          }
        },
        {
          rect: rect(204, 88, 16, 18),
          label: state.quest.watchgateBrazierB ? "Brazier lit" : "Light brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.watchgateBrazierB) {
              state.quest.watchgateBrazierB = true;
              commitProgress("Gate state saved: Watchgate north brazier lit");
              showMessage("Watchgate Brazier", "The second fire burns bright enough to throw old heraldry across the stone court.");
            }
          }
        },
        {
          rect: rect(186, 54, 16, 20),
          label: state.shortcuts.watchgateShortcutOpen ? "Gate winch freed" : "Burn winch thorn",
          onInteract: () => {
            if (!state.quest.watchgateBrazierA || !state.quest.watchgateBrazierB) {
              showMessage("Watchgate Winch", "The winch is fused with corruption-thorn and dead weight. The gate braziers need to burn first.");
              return;
            }
            if (!state.quest.watchgateOpen) {
              if (!hasLanternOfDawn()) {
                lanternLockedMessage();
                return;
              }
              state.quest.watchgateOpen = true;
              commitProgress("Shortcut saved: Watchgate opened");
              showMessage("Watchgate Opens", "Sacred fire clears the winch. With a grinding shudder, the old portcullis lifts and the road north opens.");
            }
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("hound", 150, 116, { min: 136, max: 170, speed: 24, hp: 2 }),
        makeEnemy("scavenger", 150, 72, { min: 138, max: 172, speed: 16, hp: 2 })
      ];
    }
  },
  "HV-06": {
    name: "Bell of the Wayside",
    region: "Highroad Vale",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 }
    },
    draw() {
      backgroundHV06();
      drawBrazier(116, 62, state.quest.waysideLit[0]);
      drawBrazier(204, 62, state.quest.waysideLit[1]);
      drawBrazier(116, 126, state.quest.waysideLit[2]);
      drawBrazier(204, 126, state.quest.waysideLit[3]);
      ctx.fillStyle = "#8c7147";
      ctx.fillRect(150, 44, 20, 14);
      if (state.shortcuts.waysideNorthOpen) {
        ctx.fillStyle = "rgba(255, 227, 160, 0.16)";
        ctx.fillRect(112, 60, 96, 72);
      }
    },
    solids() {
      const solids = [
        rect(42, 16, 40, 44),
        rect(238, 18, 38, 42),
        rect(34, 136, 44, 38),
        rect(236, 132, 44, 44)
      ];
      if (!state.shortcuts.waysideNorthOpen) {
        solids.push(rect(138, 0, 44, 8));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "HV-04", spawn: "default" }
      ];
      if (state.shortcuts.waysideNorthOpen) {
        transitions.push({ rect: rect(144, -2, 32, 10), to: "HV-07", spawn: "south" });
      }
      return transitions;
    },
    interactables() {
      const positions = [
        rect(108, 54, 16, 16),
        rect(196, 54, 16, 16),
        rect(108, 118, 16, 16),
        rect(196, 118, 16, 16)
      ];
      const items = positions.map((spot, index) => ({
        rect: spot,
        label: state.quest.waysideLit[index] ? "Brazier lit" : "Light brazier",
        onInteract: () => {
          if (!hasLanternOfDawn()) {
            lanternLockedMessage();
            return;
          }
          if (!state.quest.waysideLit[index]) {
            state.quest.waysideLit[index] = true;
            const litCount = state.quest.waysideLit.filter(Boolean).length;
            if (litCount < 4) {
              commitProgress(`Gate state saved: Wayside brazier ${index + 1} lit`);
              showMessage("Wayside Fire", `The roadside flame catches. ${4 - litCount} braziers remain dark.`);
            } else if (!state.quest.waysideEchoSeen) {
              state.quest.waysideEchoSeen = true;
              commitProgress("Route saved: Bell of the Wayside awakened");
              showMessage("Wayside Echo", "The bell shrine wakes in light. For one broken moment the road fills with ghosted refugees, a Warden warning the escort to turn back, and the shape of a kingdom hiding its own failure.");
            }
          }
        }
      }));
      if (state.shortcuts.waysideNorthOpen) {
        items.push({
          rect: rect(146, 68, 28, 20),
          label: "Read lore tablet",
          onInteract: () => {
            if (!state.rewards.waysideLoreTabletRead) {
              state.rewards.waysideLoreTabletRead = true;
              commitProgress("Lore saved: Wayside tablet read");
            }
            showMessage("Lore Tablet", "What is sealed is not forgotten. The witness keeps the hour even when the kingdom chooses silence.");
          }
        });
        items.push({
          rect: rect(226, 92, 18, 22),
          label: "Talk to Brother Theon",
          onInteract: () => showMessage("Brother Theon", state.rewards.waysideLoreTabletRead ? "The tablet names witness and silence in the same breath. That sounds less like prayer and more like indictment." : "That echo was not rumor. The road itself remembers the lie more faithfully than the kingdom's books do.")
        });
      }
      return items;
    },
    npcs() {
      if (!state.shortcuts.waysideNorthOpen) return [];
      return [
        { x: 228, y: 92, color: "#d6cbb8", cloak: "#4f6b7f" }
      ];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 150, 96, { axis: "y", min: 82, max: 112, speed: 20, hp: 1 }),
        makeEnemy("crow", 68, 88, { axis: "x", min: 54, max: 88, speed: 22 })
      ];
    }
  },
  "HV-07": {
    name: "Shepherd's Rest",
    region: "Highroad Vale",
    spawns: {
      default: { x: 154, y: 154 },
      south: { x: 154, y: 154 },
      descent: { x: 246, y: 136 }
    },
    draw() {
      backgroundHV07();
      drawHouse(208, 40, 70, 38);
      ctx.fillStyle = "rgba(255, 220, 122, 0.22)";
      ctx.fillRect(198, 88, 90, 42);
      drawChest(240, 96, state.rewards.shepherdTradeCacheInspected);
      drawBramble(272, 128, 28, 22, state.shortcuts.greyfenBranchOpen);
    },
    solids() {
      const solids = [
        rect(200, 36, 82, 48),
        rect(18, 18, 62, 56),
        rect(22, 126, 58, 40),
        rect(286, 0, 34, 34)
      ];
      if (!state.shortcuts.greyfenBranchOpen) {
        solids.push(rect(272, 128, 28, 22));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(144, HEIGHT - 2, 32, 10), to: "HV-06", spawn: "default" }
      ];
      if (state.shortcuts.greyfenBranchOpen) {
        transitions.push({ rect: rect(WIDTH - 10, 128, 12, 28), to: "HV-10", spawn: "north" });
      }
      return transitions;
    },
    interactables() {
      const items = [
        {
          rect: rect(222, 98, 22, 18),
          label: "Talk to Yselle",
          onInteract: () => {
            if (state.npcPhases.yselle === "waiting") {
              state.npcPhases.yselle = "met";
              commitProgress("Dialogue saved: Yselle met");
              showMessage("Yselle", "So Rowan Hollow has reopened the road at last. Good. The marsh below still takes names, and the ferrymen keep better history than the crown. Burn open the southeast barricade when you are ready.");
              return;
            }
            if (state.npcPhases.yselle === "memorial_truth") {
              showMessage("Yselle", "You found the hidden Warden memorial, didn't you? Good. Shepherd's Rest survives on the roads the kingdom forgot to erase. Keep listening to places like that.");
              return;
            }
            if (state.npcPhases.yselle === "greyfen_open") {
              showMessage("Yselle", "You cut the Greyfen descent open cleanly enough. Toma keeps the first dock below. If the false marker still stands, he will want to hear what you find.");
              return;
            }
            showMessage("Yselle", "The road remembers more than merchants do. When Greyfen opens, follow what the bells refuse to forget.");
          }
        },
        {
          rect: rect(238, 94, 16, 14),
          label: "Inspect trade chest",
          onInteract: () => {
            if (!state.rewards.shepherdTradeCacheInspected) {
              state.rewards.shepherdTradeCacheInspected = true;
              commitProgress("Side quest saved: Shepherd's Rest trade chest inspected");
              showMessage("Trade Chest", "Empty for now, but the ledger marks Greyfen ferrymen, upland salt, and a delayed marsh pickup. This becomes an early side-quest breadcrumb later.");
              return;
            }
            showMessage("Trade Chest", "Yselle's empty chest still carries the Greyfen route marks. The lock is remembered now, even if the goods are not.");
          }
        },
        {
          rect: rect(270, 126, 28, 24),
          label: state.shortcuts.greyfenBranchOpen ? "Greyfen descent opened" : "Burn Greyfen barricade",
          onInteract: () => {
            if (state.shortcuts.greyfenBranchOpen) {
              showMessage("Greyfen Descent", "The southeast branch stands open now. The air from below smells of wet bronze, reeds, and old stone.");
              return;
            }
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            state.quest.greyfenBranchBurned = true;
            commitProgress("Route saved: Shepherd's Rest Greyfen branch opened");
            showMessage("Greyfen Branch Opens", "The Lantern strips the vine mat from the old descent. Behind it, switchback stone drops into the Greyfen fog.");
          }
        }
      ];
      return items;
    },
    npcs() {
      return [
        { x: 224, y: 98, color: "#d7c8bb", cloak: "#5f7a4a" }
      ];
    },
    spawnEnemies() {
      return [];
    }
  },
  "HV-10": {
    name: "Greyfen Descent",
    region: "Highroad Vale",
    spawns: {
      default: { x: 112, y: 24 },
      north: { x: 112, y: 24 },
      south: { x: 186, y: 150 }
    },
    draw() {
      backgroundHV10();
      drawBramble(220, 120, 16, 28, state.shortcuts.greyfenLiftOpen);
      drawPixelText("Greyfen below", 242, 166, "#f6e4a5", "center", 7);
    },
    solids() {
      const solids = [
        rect(0, 0, 88, HEIGHT),
        rect(146, 0, 174, 102),
        rect(0, 132, 170, 60),
        rect(230, 88, 18, 82),
        rect(248, 0, 72, HEIGHT),
        rect(0, HEIGHT - 8, WIDTH, 8)
      ];
      if (!state.shortcuts.greyfenLiftOpen) {
        solids.push(rect(220, 120, 16, 28));
      }
      return solids;
    },
    transitions() {
      return [
        { rect: rect(96, -2, 52, 10), to: "HV-07", spawn: "descent" },
        { rect: rect(176, HEIGHT - 2, 40, 10), to: "GF-01", spawn: "north" }
      ];
    },
    interactables() {
      const items = [
        {
          rect: rect(220, 120, 18, 28),
          label: state.shortcuts.greyfenLiftOpen ? "Ride chain lift" : "Free chain lift catch",
          onInteract: () => {
            if (!state.shortcuts.greyfenLiftOpen) {
              if (!hasLanternOfDawn()) {
                lanternLockedMessage();
                return;
              }
              state.quest.greyfenLiftFreed = true;
              commitProgress("Shortcut saved: Greyfen chain lift freed");
              showMessage("Chain Lift Freed", "Lantern fire clears the seized catch. The descent winch lurches back to life, opening a quick ride back up to Shepherd's Rest.");
              return;
            }
            loadScreen("HV-07", "descent");
            showMessage("Chain Lift", "The old lift creaks hard, but it cuts the climb back to Shepherd's Rest down to a single rattling ascent.");
          }
        }
      ];
      return items;
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("hound", 176, 138, { axis: "y", min: 118, max: 154, speed: 22, hp: 2 }),
        makeEnemy("moth", 114, 74, { axis: "y", min: 58, max: 96, speed: 20, hp: 1 })
      ];
    }
  },
  "GF-01": {
    name: "Marshfoot Landing",
    region: "Greyfen March",
    spawns: {
      default: { x: 184, y: 26 },
      north: { x: 184, y: 26 },
      east: { x: 26, y: 86 },
      west: { x: 284, y: 86 }
    },
    draw() {
      backgroundGF01();
      drawChest(40, 94, state.rewards.marshfootChestCollected);
      drawPixelText("Greyfen March", 160, 24, "#f6e4a5", "center", 8);
    },
    solids() {
      return [
        rect(0, 0, 84, 66),
        rect(0, 110, 84, 82),
        rect(250, 0, 70, 66),
        rect(250, 110, 70, 82),
        rect(120, 48, 78, 30),
        rect(36, 88, 28, 22),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8)
      ];
    },
    transitions() {
      return [
        { rect: rect(176, -2, 40, 10), to: "HV-10", spawn: "south" },
        { rect: rect(WIDTH - 10, 74, 12, 34), to: "GF-02", spawn: "west" },
        { rect: rect(-2, 74, 10, 34), to: "GF-03", spawn: "east" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(36, 88, 28, 22),
          label: "Open reed cache",
          onInteract: () => {
            if (!state.rewards.marshfootChestCollected) {
              state.rewards.marshfootChestCollected = true;
              commitProgress("Reward saved: Marshfoot reed cache opened");
              showMessage("Reed Cache", "A dry bundle waits above the waterline: lamp oil, a knotted memorial ribbon, and a ferryman's chalk mark for safe passage.");
              return;
            }
            showMessage("Reed Cache", "Only damp cloth and a faint scent of oil remain in the little landing cache.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("leaper", 150, 88, { min: 118, max: 196, speed: 18, hp: 2 }),
        makeEnemy("moth", 224, 60, { axis: "y", min: 40, max: 94, speed: 18, hp: 1 })
      ];
    }
  },
  "GF-02": {
    name: "Ferryman's Reach",
    region: "Greyfen March",
    spawns: {
      default: { x: 24, y: 88 },
      west: { x: 24, y: 88 },
      north: { x: 150, y: 24 }
    },
    draw() {
      backgroundGF02();
      ctx.fillStyle = "#8b6a49";
      ctx.fillRect(212, 84, 64, 10);
      ctx.fillRect(238, 94, 18, 32);
    },
    solids() {
      return [
        rect(100, 46, 52, 28),
        rect(210, 0, 110, HEIGHT),
        rect(12, 128, 54, 42),
        rect(0, 0, 8, HEIGHT),
        rect(0, 0, WIDTH, 8)
      ];
    },
    transitions() {
      return [
        { rect: rect(-2, 74, 10, 34), to: "GF-01", spawn: "east" },
        { rect: rect(140, HEIGHT - 2, 40, 10), to: "GF-05", spawn: "north" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(146, 84, 18, 20),
          label: "Talk to Toma",
          onInteract: () => {
            if (state.npcPhases.toma === "memorial_resolved") {
              if (!state.quest.ferrymanMet) {
                state.quest.ferrymanMet = true;
                commitProgress("Dialogue saved: Toma met at memorial stage");
              }
              showMessage("Toma", "So the hidden isle still stands. Then Greyfen was not completely beaten into forgetting. That's enough to keep a ferryman at his dock a little longer.");
              return;
            }
            if (!state.quest.ferrymanMet) {
              state.quest.ferrymanMet = true;
              commitProgress("Quest saved: Ferryman at Dusk started");
              showMessage("Toma", "I keep the dock because the dead still need naming. If you're walking south, look hard at the official marker on the knoll. Greyfen learned long ago how to bury blame.");
              return;
            }
            if (state.npcPhases.toma === "truth_heard" && state.sideQuests.ferrymanAtDusk !== "completed") {
              state.sideQuests.ferrymanAtDusk = "completed";
              commitProgress("Quest saved: Ferryman at Dusk updated");
              showMessage("Toma", "So the false stone cracked open at last. Then take this dusk ribbon. We tie them for the dead whose names were washed out on purpose.");
              return;
            }
            if (state.npcPhases.toma === "truth_heard") {
              showMessage("Toma", "The official stone lied. The mud didn't. Greyfen keeps both versions, but only one of them still hurts to read.");
              return;
            }
            showMessage("Toma", "South road is drier than it looks until the marker. After that, trust the braziers, not the carved words.");
          }
        },
        {
          rect: rect(196, 90, 18, 22),
          label: "Read memorial dock",
          onInteract: () => showMessage("Dock Names", "Coins, ribbons, and chalked initials cover the posts. The ferrymen of Greyfen remember people the kingdom filed away as numbers.")
        }
      ];
    },
    npcs() {
      return [
        { x: 150, y: 84, color: "#d9cfbc", cloak: "#4b5e6e" }
      ];
    },
    spawnEnemies() {
      return [];
    }
  },
  "GF-03": {
    name: "Reedsplit Crossing",
    region: "Greyfen March",
    spawns: {
      default: { x: 280, y: 88 },
      east: { x: 280, y: 88 },
      south: { x: 150, y: 24 }
    },
    draw() {
      backgroundGF03();
      drawBramble(116, 128, 72, 18, state.quest.sunkenBranchBurned);
    },
    solids() {
      const solids = [
        rect(0, 118, 110, 74),
        rect(210, 116, 110, 76),
        rect(46, 22, 48, 26),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT),
        rect(0, 0, WIDTH, 8)
      ];
      if (!state.quest.sunkenBranchBurned) {
        solids.push(rect(116, 128, 72, 18));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(WIDTH - 10, 74, 12, 34), to: "GF-01", spawn: "west" }
      ];
      if (state.quest.sunkenBranchBurned) {
        transitions.push({ rect: rect(140, HEIGHT - 2, 40, 10), to: "GF-04", spawn: "north" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(116, 126, 72, 20),
          label: state.quest.sunkenBranchBurned ? "Chapel branch opened" : "Burn reed wall",
          onInteract: () => {
            if (state.quest.sunkenBranchBurned) {
              showMessage("Reedsplit Wall", "The corpse-thorn reeds burned back cleanly. The old forecourt path is open now.");
              return;
            }
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            state.quest.sunkenBranchBurned = true;
            commitProgress("Route saved: Reedsplit chapel branch opened");
            showMessage("Reedsplit Opens", "Lantern fire flashes through the corpse-thorn reeds. A half-drowned chapel court lies beyond the smoke.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("stalker", 152, 78, { min: 130, max: 176, speed: 18, hp: 2 }),
        makeEnemy("leaper", 118, 96, { axis: "y", min: 78, max: 108, speed: 16, hp: 2 })
      ];
    }
  },
  "GF-04": {
    name: "Sunken Chapel Forecourt",
    region: "Greyfen March",
    spawns: {
      default: { x: 150, y: 14 },
      north: { x: 150, y: 14 }
    },
    draw() {
      backgroundGF04();
      drawBrazier(120, 86, state.quest.sunkenBraziersLit[0]);
      drawBrazier(200, 86, state.quest.sunkenBraziersLit[1]);
      if (state.quest.sunkenForecourtCleared) {
        ctx.fillStyle = "rgba(255, 227, 160, 0.16)";
        ctx.fillRect(112, 60, 100, 72);
      }
    },
    solids() {
      return [
        rect(84, 46, 22, 78),
        rect(236, 52, 34, 76),
        rect(116, 28, 88, 20),
        rect(114, 118, 102, 30),
        rect(0, 0, 28, HEIGHT),
        rect(292, 0, 28, HEIGHT),
        rect(0, 0, WIDTH, 8)
      ];
    },
    transitions() {
      return [
        { rect: rect(140, -2, 40, 10), to: "GF-03", spawn: "south" }
      ];
    },
    interactables() {
      const items = [
        {
          rect: rect(112, 78, 16, 16),
          label: state.quest.sunkenBraziersLit[0] ? "Brazier lit" : "Light water brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.sunkenBraziersLit[0]) {
              state.quest.sunkenBraziersLit[0] = true;
              commitProgress("Gate state saved: Sunken forecourt west brazier lit");
              showMessage("Reflected Fire", "The west brazier catches in both flame and reflection. One chapel light remains dark.");
            }
          }
        },
        {
          rect: rect(192, 78, 16, 16),
          label: state.quest.sunkenBraziersLit[1] ? "Brazier lit" : "Light water brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.sunkenBraziersLit[1]) {
              state.quest.sunkenBraziersLit[1] = true;
              if (state.quest.sunkenBraziersLit.every(Boolean) && !state.quest.sunkenForecourtCleared) {
                state.quest.sunkenForecourtCleared = true;
                commitProgress("Discovery saved: Sunken Chapel forecourt cleared");
                showMessage("Sunken Bell Answer", "The reflected fires answer each other across the floodwater. The forecourt settles, and the chapel stones ring once beneath the waterline.");
                return;
              }
              commitProgress("Gate state saved: Sunken forecourt east brazier lit");
              showMessage("Reflected Fire", "The east brazier takes the Lantern. The other reflected bowl still waits.");
            }
          }
        }
      ];
      if (state.quest.sunkenForecourtCleared) {
        items.push({
          rect: rect(150, 60, 20, 18),
          label: "Read lore tablet",
          onInteract: () => {
            if (!state.rewards.sunkenLoreTabletRead) {
              state.rewards.sunkenLoreTabletRead = true;
              commitProgress("Lore saved: Sunken Chapel tablet read");
            }
            showMessage("Lore Tablet", "Bell before flood. Name before erasure. Witness before burial. The chapel inscription is older than the official Greyfen grave texts.");
          }
        });
        items.push({
          rect: rect(206, 86, 18, 20),
          label: "Talk to Mirelle",
          onInteract: () => showMessage("Mirelle", state.rewards.sunkenLoreTabletRead ? "The bell inside the chapel belonged to my mother before the water took the nave. If the road is waking, perhaps the bell can be named again." : "When the forecourt lit, I thought I heard the bell answer from under the flood. Nobody in Greyfen talks about that sound anymore.")
        });
      }
      return items;
    },
    npcs() {
      if (!state.quest.sunkenForecourtCleared) return [];
      return [
        { x: 208, y: 86, color: "#d8c9bc", cloak: "#6d5667" }
      ];
    },
    spawnEnemies() {
      return [
        makeEnemy("moth", 170, 70, { axis: "x", min: 142, max: 204, speed: 18, hp: 1 }),
        makeEnemy("wraith", 170, 108, { axis: "x", min: 144, max: 196, speed: 16, hp: 1 })
      ];
    }
  },
  "GF-05": {
    name: "False Marker Knoll",
    region: "Greyfen March",
    spawns: {
      default: { x: 150, y: 24 },
      north: { x: 150, y: 24 },
      south: { x: 150, y: 150 }
    },
    draw() {
      backgroundGF05();
      drawBrazier(108, 94, state.quest.falseMarkerBraziersLit[0]);
      drawBrazier(212, 94, state.quest.falseMarkerBraziersLit[1]);
      ctx.fillStyle = state.quest.falseMarkerRevealed ? "#7d6f57" : "#8f8b82";
      ctx.fillRect(132, 58, 56, 24);
      if (state.quest.falseMarkerRevealed) {
        drawPixelText("Older names cut beneath the lie.", 160, 98, "#f6e4a5", "center", 7);
      }
    },
    solids() {
      const solids = [
        rect(92, 50, 136, 56),
        rect(0, 124, 88, 68),
        rect(246, 124, 74, 68),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT),
        rect(0, 0, WIDTH, 8)
      ];
      if (!state.quest.falseMarkerRevealed) {
        solids.push(rect(132, HEIGHT - 18, 56, 18));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(140, -2, 40, 10), to: "GF-02", spawn: "north" }
      ];
      if (state.quest.falseMarkerRevealed) {
        transitions.push({ rect: rect(140, HEIGHT - 2, 40, 10), to: "GF-06", spawn: "north" });
      }
      return transitions;
    },
    interactables() {
      const items = [
        {
          rect: rect(100, 86, 16, 16),
          label: state.quest.falseMarkerBraziersLit[0] ? "Brazier lit" : "Light memorial brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.falseMarkerBraziersLit[0]) {
              state.quest.falseMarkerBraziersLit[0] = true;
              commitProgress("Gate state saved: False marker west brazier lit");
              showMessage("Memorial Flame", "The west memorial bowl burns reluctantly. Mud bubbles around the marker base.");
            }
          }
        },
        {
          rect: rect(204, 86, 16, 16),
          label: state.quest.falseMarkerBraziersLit[1] ? "Brazier lit" : "Light memorial brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.falseMarkerBraziersLit[1]) {
              state.quest.falseMarkerBraziersLit[1] = true;
              if (state.quest.falseMarkerBraziersLit.every(Boolean) && !state.quest.falseMarkerRevealed) {
                state.quest.falseMarkerRevealed = true;
                commitProgress("Story saved: False Marker Knoll revealed");
                showMessage("Buried Epitaph", "The official inscription cracks in the heat. Beneath it lie older names, Warden marks, and a warning that the dead here were abandoned, not traitors.");
                return;
              }
              commitProgress("Gate state saved: False marker east brazier lit");
              showMessage("Memorial Flame", "The second bowl catches. The marker stone groans under the heat.");
            }
          }
        },
        {
          rect: rect(148, 60, 24, 20),
          label: "Inspect marker",
          onInteract: () => showMessage("False Marker", state.quest.falseMarkerRevealed ? "The top inscription blames the Wardens for the dead below. The buried stone underneath names them as abandoned escorts who were ordered to hold the line alone." : "The public face of the stone accuses the Wardens of breaking faith. Something older pushes up through the mud beneath the carved lie.")
        },
        {
          rect: rect(74, 92, 18, 20),
          label: "Talk to Nara",
          onInteract: () => showMessage("Nara", state.npcPhases.nara === "stone_resolved" ? "So one honest grave still endured out on the water. Then the dead were not wholly given over to the lie after all." : state.quest.falseMarkerRevealed ? "I have tended this mound for years and never once believed the upper carving. Thank you for making the deeper names legible again." : "The stone says one thing, the ground another. I keep tending both, because someone has to.")
        },
        {
          rect: rect(144, 156, 32, 12),
          label: state.quest.falseMarkerRevealed ? "Road south open" : "Road south blocked",
          onInteract: () => showMessage("Memorial Flats", state.quest.falseMarkerRevealed ? "With the marker exposed, the dry route south is readable again. The graves ahead lead toward Fenwatch." : "The southward path is choked with mud and half-buried markers. Reveal the truth at this knoll before pressing deeper.")
        }
      ];
      return items;
    },
    npcs() {
      return [
        { x: 76, y: 92, color: "#d4c5b7", cloak: "#5c6953" }
      ];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 144, 118, { axis: "x", min: 122, max: 176, speed: 16, hp: 1 }),
        makeEnemy("stalker", 196, 122, { axis: "x", min: 178, max: 220, speed: 18, hp: 2 })
      ];
    }
  },
  "GF-06": {
    name: "Memorial Flats",
    region: "Greyfen March",
    spawns: {
      default: { x: 150, y: 24 },
      north: { x: 150, y: 24 },
      south: { x: 150, y: 150 }
    },
    draw() {
      backgroundGF06();
      drawBramble(106, 108, 108, 22, state.quest.graveRowsBurned);
      drawChest(72, 58, state.rewards.memorialHeartCollected);
      drawHookRing(284, 88, true);
    },
    solids() {
      const solids = [
        rect(30, 44, 44, 36),
        rect(238, 48, 42, 32),
        rect(0, 126, 94, 66),
        rect(226, 126, 94, 66),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT),
        rect(0, 0, WIDTH, 8)
      ];
      if (!state.quest.graveRowsBurned) {
        solids.push(rect(106, 108, 108, 22));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(140, -2, 40, 10), to: "GF-05", spawn: "south" }
      ];
      if (state.quest.graveRowsBurned) {
        transitions.push({ rect: rect(140, HEIGHT - 2, 40, 10), to: "GF-07", spawn: "north" });
      }
      if (state.shortcuts.bellwaterBreachOpen) {
        transitions.push({ rect: rect(WIDTH - 10, 74, 12, 34), to: "GF-08", spawn: "west" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(106, 106, 108, 24),
          label: state.quest.graveRowsBurned ? "Dry path opened" : "Burn grave-thorn rows",
          onInteract: () => {
            if (state.quest.graveRowsBurned) {
              showMessage("Memorial Flats", "The thorn-choked rows burned back enough to restore the dry route south.");
              return;
            }
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            state.quest.graveRowsBurned = true;
            commitProgress("Route saved: Memorial Flats grave rows cleared");
            showMessage("Dry Path Restored", "The Lantern burns through the corruption wound around the graves. A narrow dry line reappears through the flats.");
          }
        },
        {
          rect: rect(68, 54, 18, 18),
          label: "Inspect raised tomb",
          onInteract: () => {
            if (!state.rewards.memorialHeartCollected) {
              state.rewards.memorialHeartCollected = true;
              commitProgress("Reward saved: Memorial Flats heart relic collected");
              showMessage("Heart Relic", "A heart relic shard lies wrapped in burial cloth atop the raised tomb. Someone hid strength here for whoever came back to remember.");
              return;
            }
            showMessage("Raised Tomb", "Only the imprint of the relic shard remains in the old burial cloth.");
          }
        },
        {
          rect: rect(270, 74, 24, 26),
          label: state.shortcuts.bellwaterBreachOpen ? "Bellwater breach opened" : "Inspect east breach chain",
          onInteract: () => showMessage("East Breach", state.shortcuts.bellwaterBreachOpen ? "The breach chain has already been hooked free. Bellwater Lock now lies open to the east." : hasMarshHook() ? "That chain eye can be yanked from here with the Marsh Hook." : "A chain eye hangs above the breached wall. You can see Bellwater beyond it, but only a proper hook relic would reach that far.")
        },
        {
          rect: rect(238, 54, 20, 18),
          label: "Read broken headstone",
          onInteract: () => {
            if (!state.rewards.namelessStoneClueRead) {
              state.rewards.namelessStoneClueRead = true;
              commitProgress("Lore saved: Nameless Stone clue found");
            }
            showMessage("Broken Headstone", "A surviving line names a captain transferred 'off the record' before the burial list was rewritten. Nara would understand why that matters.");
          }
        }
      ];
    },
    hookTargets() {
      return [
        {
          rect: rect(278, 80, 16, 16),
          label: state.shortcuts.bellwaterBreachOpen ? "Bellwater breach already open" : "Open Bellwater breach",
          onHook: () => {
            if (!hasMarshHook()) {
              marshHookLockedMessage();
              return;
            }
            if (state.shortcuts.bellwaterBreachOpen) {
              showMessage("Bellwater Breach", "The east breach is already pulled wide enough to enter Bellwater Lock.");
              return;
            }
            state.quest.bellwaterBreachOpened = true;
            commitProgress("Shortcut saved: Bellwater breach opened");
            showMessage("Bellwater Breach", "The Marsh Hook catches the breach chain and tears the wall brace free. Bellwater Lock is now reachable from Memorial Flats.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 152, 92, { axis: "x", min: 126, max: 186, speed: 16, hp: 1 }),
        makeEnemy("leaper", 116, 140, { axis: "x", min: 102, max: 152, speed: 16, hp: 2 }),
        makeEnemy("moth", 198, 88, { axis: "y", min: 70, max: 112, speed: 18, hp: 1 })
      ];
    }
  },
  "GF-07": {
    name: "Drowned Causeway",
    region: "Greyfen March",
    spawns: {
      default: { x: 150, y: 24 },
      north: { x: 150, y: 24 },
      south: { x: 150, y: 150 }
    },
    draw() {
      backgroundGF07();
      drawBrazier(118, 118, state.quest.causewayBraziersLit[0]);
      drawBrazier(202, 118, state.quest.causewayBraziersLit[1]);
      if (!state.shortcuts.causewaySouthOpen) {
        drawFogBand(104, 124, 112, 44);
      }
    },
    solids() {
      const solids = [
        rect(0, 0, 100, HEIGHT),
        rect(220, 0, 100, HEIGHT),
        rect(0, 0, WIDTH, 8)
      ];
      if (!state.shortcuts.causewaySouthOpen) {
        solids.push(rect(124, 136, 72, 24));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(140, -2, 40, 10), to: "GF-06", spawn: "south" }
      ];
      if (state.shortcuts.causewaySouthOpen) {
        transitions.push({ rect: rect(140, HEIGHT - 2, 40, 10), to: "GF-10", spawn: "north" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(110, 110, 16, 18),
          label: state.quest.causewayBraziersLit[0] ? "Brazier lit" : "Light causeway brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.causewayBraziersLit[0]) {
              state.quest.causewayBraziersLit[0] = true;
              commitProgress("Gate state saved: Causeway west brazier lit");
              showMessage("Causeway Flame", "The west causeway fire cuts a channel through the marsh fog.");
            }
          }
        },
        {
          rect: rect(194, 110, 16, 18),
          label: state.quest.causewayBraziersLit[1] ? "Brazier lit" : "Light causeway brazier",
          onInteract: () => {
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            if (!state.quest.causewayBraziersLit[1]) {
              state.quest.causewayBraziersLit[1] = true;
              if (state.quest.causewayBraziersLit.every(Boolean) && !state.quest.causewayCleared) {
                state.quest.causewayCleared = true;
                commitProgress("Route saved: Drowned Causeway cleared");
                showMessage("Fog Cut", "Both braziers flare. The causeway stones appear in clean sequence through the haze, and the path to Fenwatch reveals itself.");
                return;
              }
              commitProgress("Gate state saved: Causeway east brazier lit");
              showMessage("Causeway Flame", "The east brazier answers the west, but the fog still clings farther south.");
            }
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("stalker", 152, 86, { axis: "x", min: 132, max: 174, speed: 18, hp: 2 }),
        makeEnemy("moth", 176, 54, { axis: "y", min: 40, max: 82, speed: 18, hp: 1 }),
        makeEnemy("wraith", 134, 140, { axis: "x", min: 126, max: 186, speed: 16, hp: 1 })
      ];
    }
  },
  "GF-08": {
    name: "Bellwater Lock",
    region: "Greyfen March",
    spawns: {
      default: { x: 24, y: 88 },
      west: { x: 24, y: 88 },
      south: { x: 150, y: 150 },
      east: { x: 282, y: 88 }
    },
    draw() {
      backgroundGF08();
      if (state.shortcuts.bellwaterFenwatchBridgeOpen) {
        drawStoneRect(138, 140, 52, 12);
      }
      if (state.shortcuts.bellwaterMemorialFerryOpen) {
        ctx.fillStyle = "#8b6a49";
        ctx.fillRect(250, 106, 28, 10);
      }
      if (state.rewards.bellwaterTabletRead) {
        ctx.fillStyle = "rgba(255, 227, 160, 0.14)";
        ctx.fillRect(96, 28, 82, 56);
      }
    },
    solids() {
      return [
        rect(0, 92, 110, 100),
        rect(206, 0, 114, 68),
        rect(206, 124, 114, 68),
        rect(96, 28, 22, 56),
        rect(156, 28, 22, 56),
        rect(116, 112, 64, 30),
        rect(186, 122, 26, 42),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(0, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      const transitions = [
        { rect: rect(-2, 74, 10, 34), to: "GF-06", spawn: "west" }
      ];
      if (state.shortcuts.bellwaterFenwatchBridgeOpen) {
        transitions.push({ rect: rect(140, HEIGHT - 2, 40, 10), to: "GF-10", spawn: "west" });
      }
      if (state.shortcuts.bellwaterMemorialFerryOpen) {
        transitions.push({ rect: rect(WIDTH - 10, 74, 12, 34), to: "GF-09", spawn: "west" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(108, 36, 56, 40),
          label: "Read lock tablet",
          onInteract: () => {
            if (!state.rewards.bellwaterTabletRead) {
              state.rewards.bellwaterTabletRead = true;
              commitProgress("Lore saved: Bellwater lock tablet read");
            }
            showMessage("Lock Tablet", "The flood controls were deepened after the retreat, not before it. Greyfen's marsh was made worse on purpose to bury the approach beyond the dead.");
          }
        },
        {
          rect: rect(186, 94, 18, 22),
          label: state.shortcuts.bellwaterFenwatchBridgeOpen ? "Fenwatch bridge open" : "Inspect south bridge chain",
          onInteract: () => showMessage("South Bridge Chain", state.shortcuts.bellwaterFenwatchBridgeOpen ? "The chain bridge now lies open to Fenwatch Approach, turning the long return into a clean shortcut." : hasMarshHook() ? "That bridge chain can be dragged into place from here with the Marsh Hook." : "A heavy bridge chain disappears into the lock floor. The anchor eye is too far to reach by hand.")
        },
        {
          rect: rect(210, 94, 20, 22),
          label: state.shortcuts.bellwaterMemorialFerryOpen ? "Memorial ferry ready" : "Inspect ferry chain",
          onInteract: () => showMessage("Memorial Ferry", state.shortcuts.bellwaterMemorialFerryOpen ? "The little lock ferry is free now. Memorial Isle lies just beyond the reeds to the east." : hasMarshHook() ? "The ferry chain can be snagged from the dock if you set the Marsh Hook cleanly." : "A ferry line sits beyond hand reach. Someone once kept a small memorial crossing here.")
        }
      ];
    },
    hookTargets() {
      return [
        {
          rect: rect(188, 84, 16, 16),
          label: state.shortcuts.bellwaterFenwatchBridgeOpen ? "Bridge already set" : "Pull Fenwatch bridge chain",
          onHook: () => {
            if (!hasMarshHook()) {
              marshHookLockedMessage();
              return;
            }
            if (state.shortcuts.bellwaterFenwatchBridgeOpen) {
              showMessage("Fenwatch Bridge", "The Bellwater bridge is already locked open toward Fenwatch.");
              return;
            }
            state.quest.bellwaterFenwatchBridgeOpened = true;
            commitProgress("Shortcut saved: Bellwater bridge to Fenwatch opened");
            showMessage("Fenwatch Bridge", "The Marsh Hook bites the rusted chain and drags the Bellwater bridge across. Greyfen now folds back toward Fenwatch in one clean return line.");
          }
        },
        {
          rect: rect(212, 84, 16, 16),
          label: state.shortcuts.bellwaterMemorialFerryOpen ? "Ferry already released" : "Pull memorial ferry chain",
          onHook: () => {
            if (!hasMarshHook()) {
              marshHookLockedMessage();
              return;
            }
            if (state.shortcuts.bellwaterMemorialFerryOpen) {
              showMessage("Memorial Ferry", "The east ferry is already floating free for the crossing to Memorial Isle.");
              return;
            }
            state.quest.bellwaterMemorialFerryOpened = true;
            commitProgress("Shortcut saved: Bellwater memorial ferry released");
            showMessage("Memorial Ferry", "The Marsh Hook yanks the ferry chain free. A small memorial skiff settles against the east dock, ready to cross to the hidden isle.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 146, 92, { axis: "x", min: 126, max: 170, speed: 16, hp: 1 }),
        makeEnemy("leaper", 66, 132, { axis: "x", min: 34, max: 86, speed: 16, hp: 2 })
      ];
    }
  },
  "GF-09": {
    name: "Memorial Isle",
    region: "Greyfen March",
    spawns: {
      default: { x: 24, y: 88 },
      west: { x: 24, y: 88 }
    },
    draw() {
      backgroundGF09();
      drawChest(176, 86, state.rewards.memorialIsleHeartCollected);
      if (state.quest.namelessStoneResolved) {
        ctx.fillStyle = "rgba(255, 227, 160, 0.14)";
        ctx.fillRect(130, 54, 60, 30);
      }
    },
    solids() {
      return [
        rect(0, 0, 76, 62),
        rect(0, 114, 76, 78),
        rect(244, 0, 76, 62),
        rect(244, 114, 76, 78),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      return [
        { rect: rect(-2, 74, 10, 34), to: "GF-08", spawn: "east" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(136, 54, 48, 24),
          label: state.quest.namelessStoneResolved ? "Read hidden memorial" : "Inspect hidden memorial",
          onInteract: () => {
            if (!state.quest.namelessStoneResolved) {
              state.quest.namelessStoneResolved = true;
              commitProgress("Quest saved: Nameless Stone resolved");
              showMessage("Hidden Memorial", "The last honest stone in Greyfen names a Warden captain and the families buried beside him. Someone hid this memorial away from the official dead so one truthful grave would survive.");
              return;
            }
            showMessage("Hidden Memorial", "The hidden memorial still stands apart from the official graves, naming the dead as they were rather than as the kingdom needed them to be.");
          }
        },
        {
          rect: rect(172, 82, 18, 18),
          label: "Claim heart relic",
          onInteract: () => {
            if (!state.rewards.memorialIsleHeartCollected) {
              state.rewards.memorialIsleHeartCollected = true;
              commitProgress("Reward saved: Memorial Isle heart relic collected");
              showMessage("Heart Relic", "A heart relic shard rests at the memorial's base, wrapped in oilcloth and ribbon. Someone meant this hidden grave to strengthen whoever finally found it.");
              return;
            }
            showMessage("Memorial Isle", "The relic shard is gone, but the island still feels like a place kept alive by intention rather than chance.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 154, 96, { axis: "x", min: 132, max: 178, speed: 16, hp: 1 }),
        makeEnemy("wraith", 184, 106, { axis: "x", min: 166, max: 202, speed: 16, hp: 1 })
      ];
    }
  },
  "GF-10": {
    name: "Fenwatch Approach",
    region: "Greyfen March",
    spawns: {
      default: { x: 150, y: 24 },
      north: { x: 150, y: 24 },
      west: { x: 24, y: 88 }
    },
    draw() {
      backgroundGF10();
      drawBramble(194, 92, 14, 28, state.shortcuts.fenwatchDoorOpen);
      if (state.shortcuts.bellwaterFenwatchBridgeOpen) {
        drawStoneRect(14, 84, 78, 16);
      }
      if (!state.shortcuts.fenwatchDoorOpen) {
        ctx.fillStyle = "#423c37";
        ctx.fillRect(134, 122, 52, 16);
      } else {
        ctx.fillStyle = "#4d443d";
        ctx.fillRect(134, 118, 52, 8);
      }
      ctx.fillStyle = "#7b5a3d";
      ctx.fillRect(192, 90, 8, 18);
    },
    solids() {
      const solids = [
        rect(94, 22, 36, 126),
        rect(190, 22, 40, 126),
        rect(0, 132, 86, 60),
        rect(234, 132, 86, 60),
        rect(0, 0, WIDTH, 8),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
      if (!state.shortcuts.fenwatchDoorOpen) {
        solids.push(rect(134, 122, 52, 16));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(140, -2, 40, 10), to: "GF-07", spawn: "south" }
      ];
      if (state.shortcuts.bellwaterFenwatchBridgeOpen) {
        transitions.push({ rect: rect(-2, 74, 10, 34), to: "GF-08", spawn: "south" });
      }
      if (state.shortcuts.fenwatchDoorOpen) {
        transitions.push({ rect: rect(140, HEIGHT - 2, 40, 10), to: "FC-01", spawn: "north" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(188, 88, 18, 22),
          label: state.shortcuts.fenwatchDoorOpen ? "Winch freed" : "Burn chain winch thorn",
          onInteract: () => {
            if (state.shortcuts.fenwatchDoorOpen) {
              showMessage("Fenwatch Winch", "The chain winch is clear now. The catacomb door stands open for the next pass.");
              return;
            }
            if (!hasLanternOfDawn()) {
              lanternLockedMessage();
              return;
            }
            state.quest.fenwatchWinchFreed = true;
            commitProgress("Dungeon gate saved: Fenwatch winch freed");
            showMessage("Fenwatch Opens", "The Lantern strips the thorn off the chain winch. With a grinding pull, the catacomb door parts just enough for the way below to breathe.");
          }
        },
        {
          rect: rect(144, 120, 32, 18),
          label: "Inspect catacomb door",
          onInteract: () => showMessage("Fenwatch Catacombs", state.shortcuts.fenwatchDoorOpen ? "The overworld route now reaches the Fenwatch interior. The catacombs below are already playable in this slice." : "The catacomb door is still sealed. Free the chain winch before the way below can open.")
        },
        {
          rect: rect(18, 82, 22, 20),
          label: state.shortcuts.bellwaterFenwatchBridgeOpen ? "Bellwater bridge open" : "Inspect west bridge scar",
          onInteract: () => showMessage("Bellwater Return", state.shortcuts.bellwaterFenwatchBridgeOpen ? "Bellwater now links straight back into Fenwatch Approach. The Marsh Hook has started folding the march back onto itself." : hasMarshHook() ? "There is a return bridge chain here, but it must be pulled from the Bellwater side." : "A scar in the stone shows a return bridge once met Fenwatch here.")
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("hound", 150, 92, { axis: "x", min: 138, max: 170, speed: 20, hp: 2 }),
        makeEnemy("wraith", 154, 62, { axis: "y", min: 46, max: 86, speed: 16, hp: 1 }),
        makeEnemy("moth", 110, 98, { axis: "x", min: 102, max: 126, speed: 18, hp: 1 })
      ];
    }
  },
  "FC-01": {
    name: "Hall of Names",
    region: "Fenwatch Catacombs",
    spawns: {
      default: { x: 150, y: 24 },
      north: { x: 150, y: 24 },
      east: { x: 260, y: 86 },
      west: { x: 54, y: 90 }
    },
    draw() {
      backgroundFC01();
      drawPortcullis(34, 72, 16, 54, state.shortcuts.fenwatchReliquaryOpen);
      drawPixelText("Hall of Names", 160, 30, "#f6e4a5", "center", 8);
    },
    solids() {
      const solids = [
        rect(48, 58, 42, 82),
        rect(230, 58, 42, 82),
        rect(198, 116, 98, 44),
        rect(0, 0, WIDTH, 8),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
      if (!state.shortcuts.fenwatchReliquaryOpen) {
        solids.push(rect(34, 72, 16, 54));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(140, -2, 40, 10), to: "GF-10", spawn: "default" },
        { rect: rect(WIDTH - 10, 74, 12, 34), to: "FC-02", spawn: "west" }
      ];
      if (state.shortcuts.fenwatchReliquaryOpen) {
        transitions.push({ rect: rect(-2, 74, 10, 34), to: "FC-05", spawn: "east" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(126, 58, 68, 30),
          label: "Read memorial rows",
          onInteract: () => showMessage("Hall of Names", "Rows of unfinished names fill the memorial floor. Whole family lines end in scoring marks where the stone was never properly completed.")
        },
        {
          rect: rect(212, 116, 70, 30),
          label: "Inspect flooded trench",
          onInteract: () => showMessage("Flooded Trench", hasMarshHook() ? "The opposite anchor ring is within Marsh Hook reach now, but the true bridge chain is deeper in the gallery." : "A ring glints beyond the flooded trench. Whatever crossed this gap once used a chain relic with far more reach than your hands.")
        }
      ];
    },
    hookTargets() {
      return [];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 154, 106, { axis: "x", min: 132, max: 182, speed: 16, hp: 1 })
      ];
    }
  },
  "FC-02": {
    name: "Sluice Watch",
    region: "Fenwatch Catacombs",
    spawns: {
      default: { x: 24, y: 90 },
      west: { x: 24, y: 90 },
      north: { x: 154, y: 24 }
    },
    draw() {
      backgroundFC02();
      drawPixelText("Sluice Watch", 66, 28, "#f6e4a5", "left", 8);
      if (state.quest.fenwatchSluiceOpened) {
        drawPixelText("Drain channel opened", 20, 160, "#d9d1bf", "left", 7);
      }
    },
    solids() {
      return [
        rect(206, 0, 114, HEIGHT),
        rect(108, 40, 50, 30),
        rect(172, 78, 28, 64),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(0, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      return [
        { rect: rect(-2, 74, 10, 34), to: "FC-01", spawn: "east" },
        { rect: rect(140, HEIGHT - 2, 40, 10), to: "FC-03", spawn: "north" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(156, 38, 22, 30),
          label: state.quest.fenwatchSluiceOpened ? "Sluice lever set" : "Set burial sluice",
          onInteract: () => {
            if (state.quest.fenwatchSluiceOpened) {
              showMessage("Burial Sluice", "The sluice gate is already open. Water continues draining into the lower crypt channel.");
              return;
            }
            state.quest.fenwatchSluiceOpened = true;
            commitProgress("Dungeon state saved: Fenwatch sluice opened");
            showMessage("Burial Sluice", "Old teeth grind as the sluice gate shifts. Somewhere deeper in the crypt, floodwater drops enough to uncover a passable ledge.");
          }
        }
      ];
    },
    hookTargets() {
      return [];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("moth", 130, 96, { axis: "y", min: 80, max: 122, speed: 18, hp: 1 })
      ];
    }
  },
  "FC-03": {
    name: "Drowned Ledger Crypt",
    region: "Fenwatch Catacombs",
    spawns: {
      default: { x: 150, y: 24 },
      north: { x: 150, y: 24 },
      east: { x: 262, y: 84 }
    },
    draw() {
      backgroundFC03();
      if (!state.quest.fenwatchSluiceOpened) {
        drawFogBand(118, 78, 124, 70);
      }
    },
    solids() {
      const solids = [
        rect(36, 22, 60, 32),
        rect(240, 36, 40, 90),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
      if (state.quest.fenwatchSluiceOpened) {
        solids.push(rect(118, 140, 124, 18));
      } else {
        solids.push(rect(118, 82, 124, 64));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(140, -2, 40, 10), to: "FC-02", spawn: "north" }
      ];
      if (state.quest.fenwatchSluiceOpened) {
        transitions.push({ rect: rect(-2, 74, 10, 34), to: "FC-04", spawn: "east" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(42, 24, 46, 24),
          label: "Read drowned ledger",
          onInteract: () => {
            if (!state.rewards.fenwatchLedgerRead) {
              state.rewards.fenwatchLedgerRead = true;
              commitProgress("Lore saved: Fenwatch drowned ledger read");
            }
            showMessage("Drowned Ledger", "A burial tally stops halfway through a retreat column. The final note simply reads: 'Vault sealed before full naming. Ordered above my station.'");
          }
        }
      ];
    },
    hookTargets() {
      return [];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 168, 112, { axis: "x", min: 132, max: 202, speed: 16, hp: 1 }),
        makeEnemy("moth", 206, 64, { axis: "y", min: 48, max: 92, speed: 18, hp: 1 })
      ];
    }
  },
  "FC-04": {
    name: "Chain Gallery",
    region: "Fenwatch Catacombs",
    spawns: {
      default: { x: 264, y: 90 },
      east: { x: 264, y: 90 },
      north: { x: 56, y: 24 },
      west: { x: 24, y: 90 }
    },
    draw() {
      backgroundFC04();
      drawPixelText("Chain Gallery", 160, 28, "#f6e4a5", "center", 8);
    },
    solids() {
      const solids = [
        rect(20, 18, 68, 48),
        rect(126, 58, 100, 60),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8)
      ];
      if (!state.shortcuts.fenwatchBridgeOpen) {
        solids.push(rect(220, 58, 76, 60));
      } else {
        solids.push(rect(220, 58, 18, 60));
      }
      return solids;
    },
    transitions() {
      const transitions = [
        { rect: rect(WIDTH - 10, 74, 12, 34), to: "FC-03", spawn: "east" },
        { rect: rect(46, -2, 24, 10), to: "FC-05", spawn: "south" },
        { rect: rect(-2, 74, 10, 34), to: "FC-01", spawn: "west" }
      ];
      if (state.shortcuts.fenwatchBridgeOpen) {
        transitions.push({ rect: rect(310, 74, 10, 34), to: "FC-06", spawn: "west" });
      }
      return transitions;
    },
    interactables() {
      return [
        {
          rect: rect(58, 24, 20, 34),
          label: state.shortcuts.fenwatchReliquaryOpen ? "Bell chain pulled" : "Pull bell chain",
          onInteract: () => {
            if (state.shortcuts.fenwatchReliquaryOpen) {
              showMessage("Funeral Bell", "The bell chain is already pulled. The reliquary gate above stands open.");
              return;
            }
            state.quest.fenwatchReliquaryGateOpen = true;
            commitProgress("Dungeon state saved: Warden Reliquary gate opened");
            showMessage("Funeral Bell", "The chain drags the drowned bell once through the chamber. Somewhere above, a reliquary gate unbars with a heavy iron snap.");
          }
        },
        {
          rect: rect(150, 72, 44, 20),
          label: state.shortcuts.fenwatchBridgeOpen ? "Bridge chain set" : "Inspect bridge chain",
          onInteract: () => showMessage("Bridge Chain", state.shortcuts.fenwatchBridgeOpen ? "The bridge chain now lies locked in its pulled position, spanning deeper into the vault." : "A chain eye hangs over the flooded cut. It is clearly meant to be yanked from a distance, not by hand.")
        }
      ];
    },
    hookTargets() {
      return [
        {
          rect: rect(164, 74, 18, 18),
          label: state.shortcuts.fenwatchBridgeOpen ? "Bridge already pulled" : "Pull bridge chain",
          onHook: () => {
            if (!hasMarshHook()) {
              marshHookLockedMessage();
              return;
            }
            if (state.shortcuts.fenwatchBridgeOpen) {
              showMessage("Bridge Chain", "The gallery bridge is already extended across the flooded cut.");
              return;
            }
            state.quest.fenwatchBridgePulled = true;
            commitProgress("Dungeon state saved: Chain Gallery bridge pulled");
            showMessage("Bridge Pulled", "The Marsh Hook bites the chain eye and drags the buried bridge into place. The same gallery that taunted you on the first pass now opens deeper into Fenwatch.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 108, 92, { axis: "x", min: 88, max: 118, speed: 16, hp: 1 })
      ];
    }
  },
  "FC-05": {
    name: "Warden Reliquary",
    region: "Fenwatch Catacombs",
    spawns: {
      default: { x: 264, y: 92 },
      east: { x: 264, y: 92 },
      south: { x: 154, y: 24 }
    },
    draw() {
      backgroundFC05();
      drawPixelText("Warden Reliquary", 160, 30, "#f6e4a5", "center", 8);
      drawChest(154, 80, state.items.marshHook);
    },
    solids() {
      return [
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(0, 0, 8, HEIGHT),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      return [
        { rect: rect(WIDTH - 10, 74, 12, 34), to: "FC-01", spawn: "west" },
        { rect: rect(140, HEIGHT - 2, 40, 10), to: "FC-04", spawn: "north" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(150, 74, 24, 20),
          label: state.items.marshHook ? "Reliquary opened" : "Claim Marsh Hook",
          onInteract: () => {
            if (state.items.marshHook) {
              showMessage("Warden Reliquary", "The reliquary dais stands empty now, save for the grooves where the Marsh Hook's chain once rested.");
              return;
            }
            state.items.marshHook = true;
            commitProgress("Item saved: Marsh Hook acquired");
            showMessage("Marsh Hook", "A heavy chain relic rises from the reliquary chest. The Marsh Hook can cross gaps, pull bridge chains, seize distant mechanisms, and rewrite the roads you have already seen.");
          }
        }
      ];
    },
    hookTargets() {
      return [];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [];
    }
  },
  "FC-06": {
    name: "Testimony Vault",
    region: "Fenwatch Catacombs",
    spawns: {
      default: { x: 24, y: 92 },
      west: { x: 24, y: 92 }
    },
    draw() {
      backgroundFC06();
      drawPixelText("Testimony Vault", 160, 28, "#f6e4a5", "center", 8);
      if (state.quest.fenwatchTestimonySeen) {
        ctx.fillStyle = "rgba(255, 227, 160, 0.16)";
        ctx.fillRect(166, 38, 106, 92);
      }
    },
    solids() {
      return [
        rect(36, 36, 96, 94),
        rect(172, 42, 102, 84),
        rect(0, 0, WIDTH, 8),
        rect(0, HEIGHT - 8, WIDTH, 8),
        rect(WIDTH - 8, 0, 8, HEIGHT)
      ];
    },
    transitions() {
      return [
        { rect: rect(-2, 74, 10, 34), to: "FC-04", spawn: "west" }
      ];
    },
    interactables() {
      return [
        {
          rect: rect(136, 58, 42, 34),
          label: state.quest.fenwatchTestimonySeen ? "Read Warden testimony" : "Inspect testimony dais",
          onInteract: () => {
            if (!state.quest.fenwatchTestimonySeen) {
              showMessage("Testimony Dais", "A silent bell hangs over the vault water. The testimony is inscribed beyond reach; the chain must be struck from afar.");
              return;
            }
            showMessage("Warden Testimony", "We held the retreat road by oath. The order to seal Fenwatch came from the crown's own witness-priests. Let the dead be named before the living write us false.");
          }
        },
        {
          rect: rect(142, 134, 38, 18),
          label: "Inspect sealed lower door",
          onInteract: () => {
            if (!state.quest.fenwatchSealDoorSeen) {
              state.quest.fenwatchSealDoorSeen = true;
              commitProgress("Dungeon state saved: Fenwatch lower seal discovered");
            }
            showMessage("Marshal Seal", state.quest.fenwatchTestimonySeen ? "Beyond this seal lies the deeper marshal chamber. That fight belongs to the next dungeon pass." : "A lower seal door waits beneath the testimony vault, but the chamber still holds its history shut.");
          }
        }
      ];
    },
    hookTargets() {
      return [
        {
          rect: rect(108, 56, 20, 20),
          label: state.quest.fenwatchTestimonySeen ? "Bell already struck" : "Hook the oath bell",
          onHook: () => {
            if (!hasMarshHook()) {
              marshHookLockedMessage();
              return;
            }
            if (state.quest.fenwatchTestimonySeen) {
              showMessage("Oath Bell", "The oath bell has already been struck. Fenwatch's testimony still hangs in the air.");
              return;
            }
            state.quest.fenwatchTestimonySeen = true;
            commitProgress("Story saved: Fenwatch testimony revealed");
            showMessage("Echo of Abandonment", "The Marsh Hook snaps the oath bell. Spectral Wardens hold the retreat line while a royal official orders the vault sealed before the dead are named. The dead did not betray the kingdom. They were left to carry its shame.");
          }
        }
      ];
    },
    npcs() {
      return [];
    },
    spawnEnemies() {
      return [
        makeEnemy("wraith", 214, 100, { axis: "x", min: 192, max: 242, speed: 16, hp: 1 }),
        makeEnemy("moth", 156, 80, { axis: "y", min: 58, max: 104, speed: 18, hp: 1 })
      ];
    }
  }
};

function drawScene() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const screen = screens[state.currentScreen];
  screen.draw();
  for (const npc of screen.npcs()) {
    drawNpc(npc);
  }
  for (const enemy of state.enemies) {
    drawEnemy(enemy);
  }
  drawPlayer();
  drawHearts();
  drawScreenHeader();
  drawPrompt();
}

function update(dt) {
  if (state.transitionCooldown > 0) state.transitionCooldown -= dt;
  if (state.player.attackTimer > 0) state.player.attackTimer -= dt;
  if (state.player.invincibleTimer > 0) state.player.invincibleTimer -= dt;

  if (state.message) {
    if (justPressed("Enter") || justPressed("Space") || justPressed("KeyE") || justPressed("Escape")) {
      hideMessage();
    }
    return;
  }

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
  loadScreen("RH-01", "default", { skipSave: true });
  showMessage("Return Light Prototype", "You are starting after Whisperroot with the Lantern of Dawn already in hand. Read the chapel mural, reopen the Highroad, wake the Wayside bell, and push the slice into the first Greyfen exteriors.");
  saveProgress("Journey started: Rowan Hollow");
}

function bootGame() {
  const restored = loadProgress();
  if (restored) {
    const checkpoint = screens[state.checkpoint.screenId] ? state.checkpoint : createDefaultSaveData().checkpoint;
    loadScreen(checkpoint.screenId, checkpoint.spawnId, { skipSave: true });
    showMessage("Journey Restored", "Progress loaded from your last checkpoint. Quest flags, gate states, rewards, dialogue phases, and your latest route checkpoint now carry across reloads.");
  } else {
    startFreshJourney();
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
    showMessage("Save Reset", "The current save was cleared and the journey restarted from Rowan Hollow.");
  });
}

window.ElderfieldDebug = {
  state,
  screens,
  loadScreen: (id, spawn = "default") => loadScreen(id, spawn, { skipSave: true }),
  saveProgress,
  loadProgress,
  clearSavedProgress,
  startFreshJourney,
  buildSaveData,
  getStoredSave() {
    const store = storage();
    const raw = store ? store.getItem(SAVE_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  },
  getTransitions(screenId = state.currentScreen) {
    return screens[screenId].transitions(state).map((transition) => ({
      to: transition.to,
      spawn: transition.spawn
    }));
  }
};

bootGame();
requestAnimationFrame(loop);
