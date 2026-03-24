# Elderfield Prototype

## Current Slice

This first browser prototype covers:

- Rowan Hollow revisit after Whisperroot
- chapel mural inspection
- Highroad bramble opening with the Lantern of Dawn
- Highroad transition screens
- Watchgate opening
- Bell of the Wayside echo
- Shepherd's Rest opening the Greyfen branch
- first Greyfen exterior screens through Fenwatch Approach
- a persistent Greyfen descent return lift
- the optional Sunken Chapel forecourt branch
- stateful Greyfen NPC and quest reactions
- Memorial Flats, Drowned Causeway, and Fenwatch door progression
- Bellwater Lock and Memorial Isle as Marsh Hook return-loop spaces
- a hidden memorial resolution that changes Greyfen / Shepherd's Rest dialogue
- first Fenwatch Catacombs interior pass with Marsh Hook acquisition
- a chain-and-bell dungeon loop with persistent Fenwatch state
- the Testimony Vault echo revealing Fenwatch's buried war history

Implemented screens:

- `RH-01` Rowan Hollow Square
- `RH-02` Chapel Grounds
- `RH-03` Highroad Edge
- `RH-04` Shrine Overlook
- `HV-01` Highroad Spur Gate
- `HV-02` Watcher's Steps Lower
- `HV-03` Watcher's Steps Upper
- `HV-04` Watchgate South Court
- `HV-06` Bell of the Wayside
- `HV-07` Shepherd's Rest
- `HV-10` Greyfen Descent
- `GF-01` Marshfoot Landing
- `GF-02` Ferryman's Reach
- `GF-03` Reedsplit Crossing
- `GF-04` Sunken Chapel Forecourt
- `GF-05` False Marker Knoll
- `GF-06` Memorial Flats
- `GF-07` Drowned Causeway
- `GF-08` Bellwater Lock
- `GF-09` Memorial Isle
- `GF-10` Fenwatch Approach
- `FC-01` Hall of Names
- `FC-02` Sluice Watch
- `FC-03` Drowned Ledger Crypt
- `FC-04` Chain Gallery
- `FC-05` Warden Reliquary
- `FC-06` Testimony Vault

## Run

Open [index.html](/F:/codex/Elderfield/prototype/index.html) directly in a browser, or serve the folder locally:

```powershell
cd F:\codex\Elderfield\prototype
python -m http.server 8000
```

Then browse to `http://localhost:8000`.

## Controls

- `WASD` / Arrow keys: move
- `J`: slash
- `E`: interact / light / burn
- `K`: Marsh Hook
- `Enter`: close message

## Notes

- This is a static zero-dependency prototype.
- The dungeon content is an intentionally focused vertical slice, not the full final Fenwatch layout.
- Screen IDs and route logic follow the current design docs and are meant to be stable enough for later coding passes.
- Progress now saves to browser `localStorage` and restores across reloads.
- Saved state currently includes quest flags, item flags, shortcut and gate states, collected rewards, NPC dialogue phases, side-quest states, and the latest checkpoint screen/spawn.
- The sidebar `Save State` panel shows the active checkpoint and last save reason, and includes `Save now` / `Reset save` controls for quick testing.
- Greyfen-specific saved state now includes the branch opening at Shepherd's Rest, the descent lift shortcut, Toma/Nara/Mirelle phase changes, the Sunken Chapel branch and forecourt clear, the False Marker reveal, and related side-quest updates.
- The south Greyfen route now also saves Memorial Flats clearance, Drowned Causeway brazier states, Fenwatch arrival, the Fenwatch winch/door state, the Nameless Stone clue pickup, and the Memorial Flats heart relic reward.
- The Marsh Hook return layer now saves Bellwater breach opening, the Bellwater-to-Fenwatch bridge shortcut, the Memorial Isle ferry release, the Bellwater lore tablet, the Memorial Isle heart relic, and the hidden-memorial resolution.
- Fenwatch interior state now saves Hall of Names entry, the sluice route, reliquary gate unlock, Marsh Hook acquisition, Chain Gallery bridge pull, testimony reveal, seal-door discovery, and the relevant lore reads.

## Fenwatch Notes

Implemented:

- six connected Fenwatch screens with an early pre-item loop
- Marsh Hook acquisition in `FC-05`
- prototype Marsh Hook use on hook rings / chain points with `K`
- one immediate post-item recontextualization in `FC-04`
- one history echo in `FC-06`
- first Marsh Hook overworld return layer in Bellwater / Memorial Isle

Placeholder:

- no boss encounter yet
- no full water-level simulation beyond the sluice-state gate
- no lower marshal chamber or full dungeon finale

Next:

- thread Marsh Hook deeper into Highroad / Rowan Hollow return anchors
- build the Bell-Mourned Marshal chamber
- expand Fenwatch with one lower-depth combat / seal room before the boss
