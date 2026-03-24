# Elderfield Prototype

## Active Pass

The active prototype is now a visual benchmark pass, not a world-expansion pass.

It covers one benchmark overworld screen:

- `BM-01` Warden's Rise
- readable terrace cliffs and stair approach
- deliberate road composition from south entrance to terrace focal point
- grouped trees rather than scattered decorative props
- one watch-house
- one NPC
- one enemy patrol
- one landmark focal point
- two clean exit reads
- one optional reward pocket behind a Lantern-clearable briar gate
- save/load, pause, debug, movement, combat, and a small progression loop

## Structure

- [assets/benchmark-atlas.js](/F:/codex/Elderfield/prototype/assets/benchmark-atlas.js): builds the reusable sprite atlas used by the active screen
- [data/benchmark-screen.js](/F:/codex/Elderfield/prototype/data/benchmark-screen.js): screen composition data for `BM-01`
- [game.js](/F:/codex/Elderfield/prototype/game.js): runtime systems, save/load, pause, debug, combat, and progression
- [VISUAL_STANDARD.md](/F:/codex/Elderfield/prototype/VISUAL_STANDARD.md): short rules doc for rebuilding the rest of the game to this benchmark

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
- `Escape`: pause
- `` ` ``: debug overlay
- `Enter`: close message

## Notes

- This is a static zero-dependency prototype.
- The active world art path is now atlas-driven. Scene code no longer draws cliffs, roads, houses, and trees as freehand prototype geometry.
- The benchmark screen is intentionally small. The point is to lock visual law before rebuilding more of the overworld.
- Progress now saves to browser `localStorage` and restores across reloads.
- Saved state currently includes progression flags for the landmark, NPC phase, briar gate, reward collection, inventory, and the current checkpoint.
- The sidebar `Save State` panel shows the active checkpoint and last save reason, and includes `Save now` / `Reset save` controls for quick testing.
- The debug overlay draws collision and interaction boxes so benchmark readability can be checked without guessing.
