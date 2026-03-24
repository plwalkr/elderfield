# Elderfield Visual Standard

This benchmark pass replaces freehand prototype geometry with an atlas-driven screen build. The active standard is the screen in [index.html](/F:/codex/Elderfield/prototype/index.html), powered by [benchmark-atlas.js](/F:/codex/Elderfield/prototype/assets/benchmark-atlas.js), [benchmark-screen.js](/F:/codex/Elderfield/prototype/data/benchmark-screen.js), and [game.js](/F:/codex/Elderfield/prototype/game.js).

## Core Law

- World art is assembled from reusable tiles and sprites, not ad hoc canvas rectangles pretending to be finished environment art.
- One screen should read instantly from a distance: entrance, road line, obstacle line, landmark, and safe NPC space all need clear separation.
- Every screen needs a focal story shape. In the benchmark, the upper-terrace landmark is the dominant read and the road exists to point at it.

## Screen Composition

- Use a 20x12 tile screen at 16x16 per tile. This keeps the ALttP-style readability intact.
- Build composition in layers: ground first, structural tiles second, actors last, foreground only when it genuinely improves depth.
- Favor strong terrain masses over scattered detail. Trees should appear in grouped blocks, not as random single icons.
- Entrances and exits must be readable from the road language alone. The player should know where the map continues before seeing a prompt.

## Terrain Rules

- Cliffs need a strict three-part read: grassy lip, rock face, side cap. Do not use soft blobs or rounded ground islands.
- Paths should be deliberate and directional. They are not decoration; they are composition tools that carry the eye from screen edge to objective.
- Tree groupings should frame or squeeze routes. They should not sit evenly spaced like decorative props.
- Landmark tiles should hold the highest contrast in the upper third of the screen unless a scene has a stronger story reason.

## Structure Rules

- Houses, ruins, shrines, and gate pieces should be built from reusable modules with consistent proportions.
- Roofs and walls need clear material separation. Stone should read as stone, timber as timber, and sacred objects as carved or rune-bound.
- Props that matter to progression must be readable at a glance and should never blend into the terrain silhouette.

## Palette Rules

- Keep material families limited and intentional: moss greens, dusted road ochres, cold stone neutrals, warm timber, controlled rune gold.
- Avoid mushy gradients, soft airbrushing, and smooth vector-looking shading.
- Texture comes from clusters of pixels, tile variation, and contrast steps, not blur.

## Rebuild Rule

- Any future Elderfield overworld screen should be able to answer: where do I enter, where do I want to go, what blocks me, what matters, and what mood am I in, all within the first second.
- If a new screen cannot meet that read using the benchmark’s tile language, it should be rebuilt before more content is added.
