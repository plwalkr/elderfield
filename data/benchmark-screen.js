(() => {
  const TILE = 16;

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function buildGround() {
    const tiles = [];
    const variants = ["grassA", "grassB", "grassC"];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let ty = 0; ty < 12; ty += 1) {
      for (let tx = 0; tx < 20; tx += 1) {
        place(variants[(tx * 2 + ty) % variants.length], tx, ty);
      }
    }

    const roadTiles = [
      [9, 11], [10, 11],
      [9, 10], [10, 10],
      [9, 9], [10, 9],
      [8, 8], [9, 8], [10, 8],
      [7, 7], [8, 7], [9, 7], [10, 7],
      [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [19, 6],
      [9, 5], [10, 5], [12, 5], [13, 5], [14, 5], [15, 5],
      [9, 4], [10, 4],
      [9, 3], [10, 3],
      [9, 2], [10, 2],
      [4, 2], [5, 2], [6, 2], [7, 2], [8, 2],
      [11, 2], [12, 2], [13, 2], [14, 2], [15, 2],
      [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8],
      [2, 7], [3, 7]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildMid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 1; tx <= 18; tx += 1) {
      if (tx === 9 || tx === 10) {
        place("stairs", tx, 3);
      } else if (tx === 1) {
        place("cliffLeft", tx, 3);
      } else if (tx === 18) {
        place("cliffRight", tx, 3);
      } else {
        place("cliffFace", tx, 3);
      }
    }

    place("houseRoofL", 2, 0);
    place("houseRoofM", 3, 0);
    place("houseRoofR", 4, 0);
    place("houseWallL", 2, 1);
    place("houseDoor", 3, 1);
    place("houseWallR", 4, 1);

    place("landmarkTopL", 13, 0);
    place("landmarkTopR", 14, 0);
    place("landmarkBaseL", 13, 1);
    place("landmarkBaseR", 14, 1);

    place("ruinL", 1, 6);
    place("ruinR", 2, 6);

    place("treeTL", 0, 8);
    place("treeTR", 1, 8);
    place("treeBL", 0, 9);
    place("treeBR", 1, 9);

    place("treeTL", 15, 7);
    place("treeTR", 16, 7);
    place("treeBL", 15, 8);
    place("treeBR", 16, 8);

    place("treeTL", 17, 8);
    place("treeTR", 18, 8);
    place("treeBL", 17, 9);
    place("treeBR", 18, 9);

    place("sign", 7, 10);
    place("sign", 18, 5);

    return tiles;
  }

  window.ElderfieldBenchmarkScreen = {
    id: "BM-01",
    name: "Warden's Rise",
    region: "Benchmark Overworld",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 },
      terrace: { x: 154, y: 44 }
    },
    layers: {
      ground: buildGround(),
      mid: buildMid(),
      fore: []
    },
    props: {
      npc: { x: 56, y: 34, w: 16, h: 16 },
      landmark: { x: 208, y: 6, w: 32, h: 30 },
      briar: { x: 16, y: 128, w: 48, h: 16 },
      cache: { x: 24, y: 106, w: 16, h: 16 },
      southWaypost: { x: 112, y: 160, w: 16, h: 16 },
      eastWaypost: { x: 288, y: 80, w: 16, h: 16 }
    },
    exits: [
      { label: "South road", rect: rect(136, 176, 48, 16) },
      { label: "East cut", rect: rect(304, 88, 16, 32) }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 238,
        y: 104,
        min: 210,
        max: 286,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(16, 48, 128, 16),
      rect(176, 48, 112, 16),
      rect(32, 6, 48, 26),
      rect(208, 4, 32, 28),
      rect(16, 104, 32, 10),
      rect(4, 142, 24, 18),
      rect(244, 126, 24, 18),
      rect(276, 142, 24, 18)
    ]
  };
})();
