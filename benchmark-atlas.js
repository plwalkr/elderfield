(() => {
  const TILE = 16;
  const COLS = 8;
  const ROWS = 5;

  const palette = {
    grassDark: "#35512b",
    grassMid: "#4e6f36",
    grassLight: "#769851",
    grassBloom: "#cabd77",
    roadDark: "#6d5535",
    roadMid: "#93764a",
    roadLight: "#b89a6b",
    cliffDark: "#41372f",
    cliffMid: "#5e5348",
    cliffLight: "#877a68",
    barkDark: "#3f2d1e",
    barkMid: "#624730",
    barkLight: "#826045",
    leafDark: "#243821",
    leafMid: "#426638",
    leafLight: "#6d9152",
    roofDark: "#5a2f24",
    roofMid: "#844939",
    roofLight: "#a7644d",
    wallDark: "#655b4a",
    wallMid: "#8f846f",
    wallLight: "#b5aa8b",
    stoneDark: "#4a4946",
    stoneMid: "#716f69",
    stoneLight: "#a6a39a",
    rune: "#d5ca8e",
    briarDark: "#48252a",
    briarMid: "#6e353d",
    briarLight: "#96535c",
    metalDark: "#7d765f",
    metalLight: "#bdb493",
    clothBlue: "#335e89",
    clothGreen: "#4f6d39",
    clothBrown: "#71513a",
    skin: "#d7c3a2",
    furDark: "#302018",
    furMid: "#604230",
    furLight: "#89624c",
    slash: "#efe0a7",
    ink: "#151210"
  };

  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = TILE * COLS;
  atlasCanvas.height = TILE * ROWS;

  const actx = atlasCanvas.getContext("2d");
  actx.imageSmoothingEnabled = false;

  const sprites = {};

  function block(baseX, baseY, x, y, w, h, color) {
    actx.fillStyle = color;
    actx.fillRect(baseX + x, baseY + y, w, h);
  }

  function dots(baseX, baseY, points, color) {
    actx.fillStyle = color;
    for (const [x, y, w = 1, h = 1] of points) {
      actx.fillRect(baseX + x, baseY + y, w, h);
    }
  }

  function frame(baseX, baseY, color) {
    block(baseX, baseY, 0, 0, TILE, 1, color);
    block(baseX, baseY, 0, TILE - 1, TILE, 1, color);
    block(baseX, baseY, 0, 0, 1, TILE, color);
    block(baseX, baseY, TILE - 1, 0, 1, TILE, color);
  }

  function defineSprite(name, col, row, drawer) {
    const baseX = col * TILE;
    const baseY = row * TILE;
    actx.clearRect(baseX, baseY, TILE, TILE);
    drawer(baseX, baseY);
    sprites[name] = { x: baseX, y: baseY, w: TILE, h: TILE };
  }

  function drawGrass(baseX, baseY, variant) {
    block(baseX, baseY, 0, 0, TILE, TILE, palette.grassMid);
    if (variant === 0) {
      dots(baseX, baseY, [[1, 2, 3, 2], [10, 1, 4, 2], [4, 8, 5, 2], [11, 10, 3, 2]], palette.grassDark);
      dots(baseX, baseY, [[6, 3, 3, 1], [2, 12, 4, 1], [12, 6, 2, 2]], palette.grassLight);
      dots(baseX, baseY, [[8, 11], [9, 12], [6, 5], [7, 6]], palette.grassBloom);
    } else if (variant === 1) {
      dots(baseX, baseY, [[2, 3, 4, 2], [9, 4, 5, 2], [3, 11, 3, 2], [11, 11, 3, 2]], palette.grassDark);
      dots(baseX, baseY, [[6, 2, 2, 2], [12, 8, 2, 2], [1, 9, 2, 2], [8, 13, 4, 1]], palette.grassLight);
      dots(baseX, baseY, [[4, 6], [5, 7], [12, 2], [13, 3]], palette.grassBloom);
    } else {
      dots(baseX, baseY, [[1, 1, 4, 3], [12, 3, 3, 2], [5, 10, 6, 2], [1, 12, 3, 1]], palette.grassDark);
      dots(baseX, baseY, [[8, 4, 2, 2], [11, 11, 2, 2], [4, 6, 3, 1], [6, 13, 3, 1]], palette.grassLight);
      dots(baseX, baseY, [[9, 8], [10, 9], [2, 9], [3, 10]], palette.grassBloom);
    }
  }

  function drawRoad(baseX, baseY, variant) {
    block(baseX, baseY, 0, 0, TILE, TILE, palette.roadMid);
    dots(baseX, baseY, [[0, 0, TILE, 2], [0, 14, TILE, 2], [0, 0, 2, TILE], [14, 0, 2, TILE]], palette.roadDark);
    dots(baseX, baseY, [[4, 3, 2, 2], [10, 5, 2, 2], [7, 10, 3, 2], [3, 12, 2, 1]], palette.roadLight);
    if (variant === 0) {
      dots(baseX, baseY, [[6, 1, 4, 1], [5, 7, 6, 1], [2, 9, 3, 1]], palette.roadDark);
    } else {
      dots(baseX, baseY, [[2, 4, 4, 1], [9, 8, 4, 1], [5, 12, 5, 1]], palette.roadDark);
    }
  }

  function drawStair(baseX, baseY) {
    block(baseX, baseY, 0, 0, TILE, TILE, palette.stoneMid);
    dots(baseX, baseY, [[0, 0, TILE, 2], [0, 14, TILE, 2], [0, 0, 2, TILE], [14, 0, 2, TILE]], palette.stoneDark);
    for (let y = 3; y <= 12; y += 3) {
      dots(baseX, baseY, [[2, y, 12, 1]], palette.stoneLight);
      dots(baseX, baseY, [[2, y + 1, 12, 1]], palette.stoneDark);
    }
  }

  function drawCliff(baseX, baseY, side) {
    block(baseX, baseY, 0, 0, TILE, TILE, palette.cliffMid);
    block(baseX, baseY, 0, 0, TILE, 3, palette.grassMid);
    dots(baseX, baseY, [[0, 0, TILE, 1], [0, 2, TILE, 1]], palette.grassLight);
    dots(baseX, baseY, [[3, 5, 3, 2], [9, 6, 4, 2], [2, 10, 5, 2], [11, 11, 3, 2]], palette.cliffDark);
    dots(baseX, baseY, [[6, 5, 2, 1], [8, 9, 3, 1], [4, 13, 2, 1]], palette.cliffLight);
    if (side === "left") {
      block(baseX, baseY, 0, 3, 3, 13, palette.cliffDark);
      dots(baseX, baseY, [[3, 4, 1, 10]], palette.cliffLight);
    }
    if (side === "right") {
      block(baseX, baseY, 13, 3, 3, 13, palette.cliffDark);
      dots(baseX, baseY, [[12, 4, 1, 10]], palette.cliffLight);
    }
  }

  function drawTree(baseX, baseY, part) {
    const canopy = {
      tl: [[2, 2, 12, 10], [4, 1, 8, 2]],
      tr: [[2, 2, 12, 10], [4, 1, 8, 2]],
      bl: [[2, 0, 12, 8], [4, 7, 8, 4]],
      br: [[2, 0, 12, 8], [4, 7, 8, 4]]
    };
    for (const shape of canopy[part]) {
      dots(baseX, baseY, [shape], palette.leafDark);
    }
    if (part === "tl") {
      dots(baseX, baseY, [[3, 3, 10, 8], [5, 2, 6, 2]], palette.leafMid);
      dots(baseX, baseY, [[6, 4, 4, 3], [9, 6, 2, 2], [4, 8, 2, 2]], palette.leafLight);
    }
    if (part === "tr") {
      dots(baseX, baseY, [[3, 3, 10, 8], [5, 2, 6, 2]], palette.leafMid);
      dots(baseX, baseY, [[5, 4, 4, 3], [4, 6, 2, 2], [10, 8, 2, 2]], palette.leafLight);
    }
    if (part === "bl") {
      dots(baseX, baseY, [[3, 1, 10, 8], [5, 9, 6, 2]], palette.leafMid);
      dots(baseX, baseY, [[5, 3, 3, 2], [9, 4, 2, 2], [4, 7, 2, 2]], palette.leafLight);
      dots(baseX, baseY, [[6, 9, 4, 5]], palette.barkDark);
      dots(baseX, baseY, [[7, 9, 2, 5]], palette.barkMid);
      dots(baseX, baseY, [[7, 11, 2, 1]], palette.barkLight);
    }
    if (part === "br") {
      dots(baseX, baseY, [[3, 1, 10, 8], [5, 9, 6, 2]], palette.leafMid);
      dots(baseX, baseY, [[8, 3, 3, 2], [4, 4, 2, 2], [10, 7, 2, 2]], palette.leafLight);
      dots(baseX, baseY, [[6, 9, 4, 5]], palette.barkDark);
      dots(baseX, baseY, [[7, 9, 2, 5]], palette.barkMid);
      dots(baseX, baseY, [[7, 11, 2, 1]], palette.barkLight);
    }
  }

  function drawRoof(baseX, baseY, part) {
    block(baseX, baseY, 1, 3, 14, 10, palette.roofDark);
    block(baseX, baseY, 2, 4, 12, 8, palette.roofMid);
    dots(baseX, baseY, [[3, 5, 10, 1], [4, 8, 8, 1]], palette.roofLight);
    dots(baseX, baseY, [[2, 13, 12, 2]], palette.barkDark);
    if (part === "left") {
      dots(baseX, baseY, [[0, 5, 3, 8], [1, 4, 1, 10]], palette.roofDark);
    } else if (part === "right") {
      dots(baseX, baseY, [[13, 5, 3, 8], [14, 4, 1, 10]], palette.roofDark);
    } else {
      dots(baseX, baseY, [[7, 2, 2, 11]], palette.roofDark);
      dots(baseX, baseY, [[8, 3, 1, 9]], palette.roofLight);
    }
  }

  function drawHouseWall(baseX, baseY, part) {
    block(baseX, baseY, 1, 1, 14, 14, palette.wallDark);
    block(baseX, baseY, 2, 2, 12, 12, palette.wallMid);
    dots(baseX, baseY, [[3, 3, 10, 2], [3, 7, 10, 1], [3, 11, 10, 1]], palette.wallLight);
    if (part === "left") {
      dots(baseX, baseY, [[4, 8, 4, 4]], palette.roadDark);
      dots(baseX, baseY, [[5, 9, 2, 2]], palette.wallLight);
    } else if (part === "door") {
      dots(baseX, baseY, [[5, 5, 6, 10]], palette.barkDark);
      dots(baseX, baseY, [[6, 6, 4, 8]], palette.barkMid);
      dots(baseX, baseY, [[9, 9, 1, 1]], palette.metalLight);
    } else {
      dots(baseX, baseY, [[4, 5, 8, 5]], palette.stoneDark);
      dots(baseX, baseY, [[5, 6, 6, 3]], palette.stoneLight);
      dots(baseX, baseY, [[7, 10, 2, 3]], palette.wallDark);
    }
  }

  function drawLandmark(baseX, baseY, part) {
    block(baseX, baseY, 4, 1, 8, 14, palette.stoneDark);
    block(baseX, baseY, 5, 2, 6, 12, palette.stoneMid);
    dots(baseX, baseY, [[6, 3, 4, 2], [6, 11, 4, 1], [4, 13, 8, 2]], palette.stoneLight);
    if (part === "topLeft") {
      dots(baseX, baseY, [[2, 5, 3, 3], [5, 1, 4, 2]], palette.stoneDark);
      dots(baseX, baseY, [[7, 6, 1, 4]], palette.rune);
    } else if (part === "topRight") {
      dots(baseX, baseY, [[11, 5, 3, 3], [7, 1, 4, 2]], palette.stoneDark);
      dots(baseX, baseY, [[8, 6, 1, 4]], palette.rune);
    } else if (part === "baseLeft") {
      dots(baseX, baseY, [[2, 12, 3, 2], [6, 6, 2, 4]], palette.rune);
    } else {
      dots(baseX, baseY, [[11, 12, 3, 2], [8, 6, 2, 4]], palette.rune);
    }
  }

  function drawRuin(baseX, baseY, part) {
    block(baseX, baseY, 1, 8, 14, 6, palette.stoneDark);
    block(baseX, baseY, 2, 9, 12, 4, palette.stoneMid);
    dots(baseX, baseY, [[3, 10, 10, 1], [4, 12, 4, 1]], palette.stoneLight);
    if (part === "left") {
      dots(baseX, baseY, [[3, 5, 3, 3], [5, 3, 2, 2]], palette.stoneDark);
    } else {
      dots(baseX, baseY, [[10, 5, 3, 3], [9, 3, 2, 2]], palette.stoneDark);
    }
  }

  function drawBriar(baseX, baseY) {
    dots(baseX, baseY, [[0, 10, 16, 4], [2, 6, 4, 3], [10, 5, 4, 3]], palette.briarDark);
    dots(baseX, baseY, [[1, 11, 14, 2], [3, 8, 3, 2], [10, 7, 4, 2]], palette.briarMid);
    dots(baseX, baseY, [[4, 5, 1, 4], [8, 8, 1, 4], [12, 4, 1, 4], [6, 11, 1, 3]], palette.briarLight);
  }

  function drawChest(baseX, baseY, open) {
    block(baseX, baseY, 3, 7, 10, 7, palette.barkDark);
    block(baseX, baseY, 4, 8, 8, 5, palette.barkMid);
    dots(baseX, baseY, [[4, 6, 8, 2]], palette.roadLight);
    dots(baseX, baseY, [[7, 7, 2, 6]], palette.metalDark);
    if (open) {
      dots(baseX, baseY, [[4, 4, 8, 2], [5, 2, 6, 2]], palette.roadLight);
      dots(baseX, baseY, [[5, 9, 6, 2]], palette.ink);
    } else {
      dots(baseX, baseY, [[5, 9, 6, 2]], palette.metalLight);
    }
  }

  function drawSign(baseX, baseY) {
    dots(baseX, baseY, [[6, 3, 4, 5]], palette.barkDark);
    dots(baseX, baseY, [[5, 4, 6, 4]], palette.barkMid);
    dots(baseX, baseY, [[7, 8, 2, 6]], palette.barkDark);
  }

  function drawPlayer(baseX, baseY, dir) {
    dots(baseX, baseY, [[6, 2, 4, 4]], palette.skin);
    dots(baseX, baseY, [[5, 1, 6, 2]], palette.clothGreen);
    if (dir === "up") {
      dots(baseX, baseY, [[5, 6, 6, 5]], palette.clothGreen);
      dots(baseX, baseY, [[6, 7, 4, 5]], palette.clothBlue);
    } else if (dir === "down") {
      dots(baseX, baseY, [[5, 6, 6, 5]], palette.clothBlue);
      dots(baseX, baseY, [[6, 6, 4, 2]], palette.clothGreen);
    } else {
      dots(baseX, baseY, [[5, 6, 6, 5]], palette.clothBlue);
      dots(baseX, baseY, [[4, 7, 2, 3]], palette.clothGreen);
      dots(baseX, baseY, [[10, 7, 2, 3]], palette.clothBrown);
    }
    dots(baseX, baseY, [[5, 11, 2, 3], [9, 11, 2, 3]], palette.barkMid);
    dots(baseX, baseY, [[5, 5, 2, 1], [9, 5, 2, 1]], palette.ink);
  }

  function drawNpc(baseX, baseY) {
    dots(baseX, baseY, [[6, 2, 4, 4]], palette.skin);
    dots(baseX, baseY, [[5, 1, 6, 2], [4, 6, 8, 6]], palette.clothBrown);
    dots(baseX, baseY, [[5, 7, 6, 5]], palette.clothGreen);
    dots(baseX, baseY, [[5, 11, 2, 3], [9, 11, 2, 3]], palette.barkMid);
  }

  function drawHound(baseX, baseY) {
    dots(baseX, baseY, [[3, 7, 9, 5], [2, 8, 2, 3], [11, 8, 3, 2]], palette.furDark);
    dots(baseX, baseY, [[4, 8, 7, 3], [11, 8, 2, 2]], palette.furMid);
    dots(baseX, baseY, [[6, 8, 2, 1], [9, 9, 2, 1]], palette.furLight);
    dots(baseX, baseY, [[4, 12, 2, 3], [9, 12, 2, 3]], palette.furDark);
    dots(baseX, baseY, [[12, 7, 1, 1]], palette.ink);
  }

  function drawSlash(baseX, baseY, orientation) {
    if (orientation === "h") {
      dots(baseX, baseY, [[1, 6, 14, 2], [3, 5, 10, 4]], palette.slash);
      dots(baseX, baseY, [[2, 7, 12, 1]], palette.roadLight);
    } else {
      dots(baseX, baseY, [[6, 1, 2, 14], [5, 3, 4, 10]], palette.slash);
      dots(baseX, baseY, [[7, 2, 1, 12]], palette.roadLight);
    }
  }

  defineSprite("grassA", 0, 0, (x, y) => drawGrass(x, y, 0));
  defineSprite("grassB", 1, 0, (x, y) => drawGrass(x, y, 1));
  defineSprite("grassC", 2, 0, (x, y) => drawGrass(x, y, 2));
  defineSprite("roadA", 3, 0, (x, y) => drawRoad(x, y, 0));
  defineSprite("roadB", 4, 0, (x, y) => drawRoad(x, y, 1));
  defineSprite("stairs", 5, 0, drawStair);
  defineSprite("cliffLeft", 0, 1, (x, y) => drawCliff(x, y, "left"));
  defineSprite("cliffFace", 1, 1, (x, y) => drawCliff(x, y, "mid"));
  defineSprite("cliffRight", 2, 1, (x, y) => drawCliff(x, y, "right"));
  defineSprite("treeTL", 0, 2, (x, y) => drawTree(x, y, "tl"));
  defineSprite("treeTR", 1, 2, (x, y) => drawTree(x, y, "tr"));
  defineSprite("treeBL", 0, 3, (x, y) => drawTree(x, y, "bl"));
  defineSprite("treeBR", 1, 3, (x, y) => drawTree(x, y, "br"));
  defineSprite("houseRoofL", 2, 2, (x, y) => drawRoof(x, y, "left"));
  defineSprite("houseRoofM", 3, 2, (x, y) => drawRoof(x, y, "mid"));
  defineSprite("houseRoofR", 4, 2, (x, y) => drawRoof(x, y, "right"));
  defineSprite("houseWallL", 2, 3, (x, y) => drawHouseWall(x, y, "left"));
  defineSprite("houseDoor", 3, 3, (x, y) => drawHouseWall(x, y, "door"));
  defineSprite("houseWallR", 4, 3, (x, y) => drawHouseWall(x, y, "right"));
  defineSprite("landmarkTopL", 5, 1, (x, y) => drawLandmark(x, y, "topLeft"));
  defineSprite("landmarkTopR", 6, 1, (x, y) => drawLandmark(x, y, "topRight"));
  defineSprite("landmarkBaseL", 5, 2, (x, y) => drawLandmark(x, y, "baseLeft"));
  defineSprite("landmarkBaseR", 6, 2, (x, y) => drawLandmark(x, y, "baseRight"));
  defineSprite("ruinL", 5, 3, (x, y) => drawRuin(x, y, "left"));
  defineSprite("ruinR", 6, 3, (x, y) => drawRuin(x, y, "right"));
  defineSprite("briar", 7, 0, drawBriar);
  defineSprite("chestClosed", 7, 1, (x, y) => drawChest(x, y, false));
  defineSprite("chestOpen", 7, 2, (x, y) => drawChest(x, y, true));
  defineSprite("sign", 7, 3, drawSign);
  defineSprite("playerDown", 0, 4, (x, y) => drawPlayer(x, y, "down"));
  defineSprite("playerUp", 1, 4, (x, y) => drawPlayer(x, y, "up"));
  defineSprite("playerLeft", 2, 4, (x, y) => drawPlayer(x, y, "left"));
  defineSprite("playerRight", 3, 4, (x, y) => drawPlayer(x, y, "right"));
  defineSprite("npcCaretaker", 4, 4, drawNpc);
  defineSprite("enemyHound", 5, 4, drawHound);
  defineSprite("slashH", 6, 4, (x, y) => drawSlash(x, y, "h"));
  defineSprite("slashV", 7, 4, (x, y) => drawSlash(x, y, "v"));

  function drawSprite(ctx, name, x, y, options = {}) {
    const sprite = sprites[name];
    if (!sprite) return;

    ctx.save();
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }
    if (options.flipX || options.flipY) {
      ctx.translate(x + (options.w || sprite.w) / 2, y + (options.h || sprite.h) / 2);
      ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
      ctx.drawImage(
        atlasCanvas,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        -(options.w || sprite.w) / 2,
        -(options.h || sprite.h) / 2,
        options.w || sprite.w,
        options.h || sprite.h
      );
    } else {
      ctx.drawImage(
        atlasCanvas,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        x,
        y,
        options.w || sprite.w,
        options.h || sprite.h
      );
    }
    ctx.restore();
  }

  window.ElderfieldBenchmarkAtlasData = {
    tileSize: TILE,
    palette,
    sprites,
    atlasCanvas,
    drawSprite,
    debugFrame(ctx, name, x, y) {
      drawSprite(ctx, name, x, y);
      ctx.save();
      ctx.strokeStyle = palette.rune;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      ctx.restore();
    }
  };
})();
