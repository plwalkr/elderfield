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
- first Greyfen exterior screens through False Marker Knoll
- a persistent Greyfen descent return lift
- the optional Sunken Chapel forecourt branch
- stateful Greyfen NPC and quest reactions

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
- `Enter`: close message

## Notes

- This is a static zero-dependency prototype.
- Greyfen and Fenwatch are intentionally not included yet.
- Screen IDs and route logic follow the current design docs and are meant to be stable enough for later coding passes.
- Progress now saves to browser `localStorage` and restores across reloads.
- Saved state currently includes quest flags, item flags, shortcut and gate states, collected rewards, NPC dialogue phases, side-quest states, and the latest checkpoint screen/spawn.
- The sidebar `Save State` panel shows the active checkpoint and last save reason, and includes `Save now` / `Reset save` controls for quick testing.
- Greyfen-specific saved state now includes the branch opening at Shepherd's Rest, the descent lift shortcut, Toma/Nara/Mirelle phase changes, the Sunken Chapel branch and forecourt clear, the False Marker reveal, and related side-quest updates.
