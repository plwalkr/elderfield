(() => {
  const TILE = 16;

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function fillGrass() {
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

    return { tiles, place };
  }

  function buildBm01Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [9, 10], [10, 10],
      [9, 9], [10, 9],
      [8, 8], [9, 8], [10, 8], [11, 8],
      [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
      [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [19, 6],
      [9, 5], [10, 5],
      [9, 4], [10, 4],
      [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2],
      [2, 8], [3, 8], [4, 8], [5, 8], [6, 8]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildBm01Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      if (tx === 9 || tx === 10) {
        place("stairs", tx, 3);
      } else if (tx === 0) {
        place("cliffLeft", tx, 3);
      } else if (tx === 19) {
        place("cliffRight", tx, 3);
      } else {
        place("cliffFace", tx, 3);
      }
    }

    place("houseRoofL", 1, 0);
    place("houseRoofM", 2, 0);
    place("houseRoofR", 3, 0);
    place("houseWallL", 1, 1);
    place("houseDoor", 2, 1);
    place("houseWallR", 3, 1);

    place("ruinL", 11, 1);
    place("landmarkTopL", 12, 0);
    place("landmarkTopR", 13, 0);
    place("landmarkBaseL", 12, 1);
    place("landmarkBaseR", 13, 1);
    place("ruinR", 14, 1);

    place("ruinL", 2, 6);
    place("ruinR", 3, 6);

    place("treeTL", 0, 8);
    place("treeTR", 1, 8);
    place("treeBL", 0, 9);
    place("treeBR", 1, 9);

    place("treeTL", 15, 7);
    place("treeTR", 16, 7);
    place("treeBL", 15, 8);
    place("treeBR", 16, 8);

    place("treeTL", 17, 4);
    place("treeTR", 18, 4);
    place("treeBL", 17, 5);
    place("treeBR", 18, 5);

    place("treeTL", 17, 8);
    place("treeTR", 18, 8);
    place("treeBL", 17, 9);
    place("treeBR", 18, 9);

    place("sign", 7, 10);
    place("sign", 18, 5);

    return tiles;
  }

  function buildBm02Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6],
      [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
      [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5],
      [10, 6], [11, 6], [12, 6],
      [12, 4], [13, 4], [14, 4],
      [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3], [19, 3],
      [15, 2], [16, 2], [17, 2],
      [2, 7], [3, 7], [4, 7], [5, 7],
      [3, 9], [4, 9], [5, 9], [6, 9],
      [4, 10], [5, 10],
      [9, 7], [10, 7]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildBm02Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 7; tx <= 19; tx += 1) {
      if (tx === 13 || tx === 14) {
        place("stairs", tx, 4);
      } else if (tx === 7) {
        place("cliffLeft", tx, 4);
      } else if (tx === 19) {
        place("cliffRight", tx, 4);
      } else {
        place("cliffFace", tx, 4);
      }
    }

    place("ruinL", 14, 1);
    place("landmarkTopL", 15, 0);
    place("landmarkTopR", 16, 0);
    place("landmarkBaseL", 15, 1);
    place("landmarkBaseR", 16, 1);
    place("ruinR", 17, 1);
    place("ruinR", 18, 2);

    place("houseRoofL", 3, 7);
    place("houseRoofM", 4, 7);
    place("houseRoofR", 5, 7);
    place("houseWallL", 3, 8);
    place("houseDoor", 4, 8);
    place("houseWallR", 5, 8);

    place("ruinL", 6, 7);
    place("ruinR", 7, 7);

    place("treeTL", 0, 7);
    place("treeTR", 1, 7);
    place("treeBL", 0, 8);
    place("treeBR", 1, 8);

    place("treeTL", 9, 8);
    place("treeTR", 10, 8);
    place("treeBL", 9, 9);
    place("treeBR", 10, 9);

    place("treeTL", 15, 8);
    place("treeTR", 16, 8);
    place("treeBL", 15, 9);
    place("treeBR", 16, 9);

    place("treeTL", 17, 6);
    place("treeTR", 18, 6);
    place("treeBL", 17, 7);
    place("treeBR", 18, 7);

    place("sign", 11, 6);
    place("sign", 17, 2);

    return tiles;
  }

  function buildHv01Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [9, 10], [10, 10],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [15, 8],
      [9, 7], [10, 7],
      [9, 6], [10, 6],
      [9, 4], [10, 4],
      [9, 3], [10, 3],
      [8, 2], [9, 2], [10, 2], [11, 2], [12, 2],
      [8, 1], [9, 1], [10, 1], [11, 1], [12, 1]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv01Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      if (tx === 9 || tx === 10) {
        place("stairs", tx, 5);
      } else if (tx === 0) {
        place("cliffLeft", tx, 5);
      } else if (tx === 19) {
        place("cliffRight", tx, 5);
      } else {
        place("cliffFace", tx, 5);
      }
    }

    place("ruinL", 12, 2);
    place("landmarkTopL", 13, 1);
    place("landmarkTopR", 14, 1);
    place("landmarkBaseL", 13, 2);
    place("landmarkBaseR", 14, 2);
    place("ruinR", 15, 2);

    place("ruinL", 14, 7);
    place("ruinR", 15, 7);

    place("treeTL", 2, 2);
    place("treeTR", 3, 2);
    place("treeBL", 2, 3);
    place("treeBR", 3, 3);

    place("treeTL", 0, 8);
    place("treeTR", 1, 8);
    place("treeBL", 0, 9);
    place("treeBR", 1, 9);

    place("treeTL", 17, 7);
    place("treeTR", 18, 7);
    place("treeBL", 17, 8);
    place("treeBR", 18, 8);

    place("sign", 6, 10);

    return tiles;
  }

  function buildHv02Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [9, 10], [10, 10],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [8, 8], [9, 8], [10, 8],
      [3, 9], [4, 9], [5, 9], [6, 9],
      [4, 8], [5, 8],
      [9, 6], [10, 6],
      [8, 5], [9, 5],
      [7, 4], [8, 4],
      [6, 3], [7, 3],
      [6, 2], [7, 2],
      [6, 1], [7, 1],
      [6, 0], [7, 0]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv02Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      if (tx === 9 || tx === 10) {
        place("stairs", tx, 7);
      } else if (tx === 0) {
        place("cliffLeft", tx, 7);
      } else if (tx === 19) {
        place("cliffRight", tx, 7);
      } else {
        place("cliffFace", tx, 7);
      }
    }

    place("ruinL", 2, 8);
    place("ruinR", 3, 8);

    place("ruinL", 2, 2);
    place("landmarkTopL", 3, 1);
    place("landmarkTopR", 4, 1);
    place("landmarkBaseL", 3, 2);
    place("landmarkBaseR", 4, 2);
    place("ruinR", 5, 2);

    place("treeTL", 0, 1);
    place("treeTR", 1, 1);
    place("treeBL", 0, 2);
    place("treeBR", 1, 2);

    place("treeTL", 16, 2);
    place("treeTR", 17, 2);
    place("treeBL", 16, 3);
    place("treeBR", 17, 3);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 13, 9);
    place("sign", 7, 0);

    return tiles;
  }

  function buildHv03Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [6, 11], [7, 11],
      [6, 10], [7, 10],
      [6, 9], [7, 9], [8, 9],
      [7, 8], [8, 8], [9, 8],
      [8, 6], [9, 6],
      [9, 5], [10, 5],
      [10, 4], [11, 4],
      [11, 3], [12, 3],
      [11, 2], [12, 2], [13, 2],
      [11, 1], [12, 1], [13, 1]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv03Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      if (tx === 8 || tx === 9) {
        place("stairs", tx, 7);
      } else if (tx === 0) {
        place("cliffLeft", tx, 7);
      } else if (tx === 19) {
        place("cliffRight", tx, 7);
      } else {
        place("cliffFace", tx, 7);
      }
    }

    place("ruinL", 2, 2);
    place("landmarkTopL", 3, 1);
    place("landmarkTopR", 4, 1);
    place("landmarkBaseL", 3, 2);
    place("landmarkBaseR", 4, 2);
    place("ruinR", 5, 2);

    place("ruinL", 14, 5);
    place("ruinR", 15, 5);

    place("treeTL", 17, 1);
    place("treeTR", 18, 1);
    place("treeBL", 17, 2);
    place("treeBR", 18, 2);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 8);
    place("treeTR", 18, 8);
    place("treeBL", 17, 9);
    place("treeBR", 18, 9);

    place("sign", 15, 6);
    place("sign", 13, 0);

    return tiles;
  }

  function buildHv04Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [8, 10], [9, 10], [10, 10], [11, 10],
      [7, 9], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9],
      [8, 8], [9, 8], [10, 8], [11, 8],
      [9, 7], [10, 7],
      [9, 5], [10, 5],
      [9, 4], [10, 4],
      [9, 3], [10, 3],
      [9, 2], [10, 2], [11, 2]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv04Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      if (tx === 9 || tx === 10) {
        place("stairs", tx, 6);
      } else if (tx === 0) {
        place("cliffLeft", tx, 6);
      } else if (tx === 19) {
        place("cliffRight", tx, 6);
      } else {
        place("cliffFace", tx, 6);
      }
    }

    place("ruinL", 5, 2);
    place("landmarkTopL", 6, 1);
    place("landmarkTopR", 7, 1);
    place("landmarkBaseL", 6, 2);
    place("landmarkBaseR", 7, 2);
    place("ruinL", 4, 4);

    place("landmarkTopL", 11, 1);
    place("landmarkTopR", 12, 1);
    place("landmarkBaseL", 11, 2);
    place("landmarkBaseR", 12, 2);
    place("ruinR", 13, 2);
    place("ruinR", 14, 4);

    place("ruinL", 2, 7);
    place("ruinR", 16, 7);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 6, 7);
    place("sign", 13, 7);
    place("sign", 15, 8);

    return tiles;
  }

  const bm01 = {
    id: "BM-01",
    name: "Warden's Rise",
    region: "Benchmark Overworld",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 },
      terrace: { x: 154, y: 44 },
      east: { x: 276, y: 104 }
    },
    layers: {
      ground: buildBm01Ground(),
      mid: buildBm01Mid(),
      fore: []
    },
    props: {
      npc: { x: 40, y: 34, w: 16, h: 16 },
      landmark: { x: 192, y: 4, w: 32, h: 30 },
      briar: { x: 24, y: 128, w: 48, h: 16 },
      cache: { x: 40, y: 110, w: 16, h: 16 },
      southWaypost: { x: 112, y: 160, w: 16, h: 16 },
      eastWaypost: { x: 288, y: 96, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(304, 96, 16, 32), to: "BM-02", spawn: "west" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 246,
        y: 118,
        min: 222,
        max: 286,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 48, 144, 16),
      rect(176, 48, 144, 16),
      rect(16, 6, 48, 26),
      rect(192, 4, 32, 28),
      rect(32, 96, 32, 16),
      rect(4, 142, 24, 18),
      rect(244, 118, 28, 26),
      rect(276, 70, 28, 26),
      rect(276, 134, 28, 26)
    ]
  };

  const bm02 = {
    id: "BM-02",
    name: "Pilgrim's Cut",
    region: "Benchmark Overworld",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 24, y: 96 },
      west: { x: 24, y: 96 },
      east: { x: 280, y: 48 },
      terrace: { x: 220, y: 56 }
    },
    layers: {
      ground: buildBm02Ground(),
      mid: buildBm02Mid(),
      fore: []
    },
    props: {
      npc: { x: 252, y: 34, w: 16, h: 16 },
      landmark: { x: 240, y: 4, w: 32, h: 30 },
      shelter: { x: 48, y: 112, w: 48, h: 32 },
      pilgrimBriar: { x: 96, y: 144, w: 32, h: 16 },
      pilgrimCache: { x: 104, y: 126, w: 16, h: 16 },
      westWaypost: { x: 16, y: 96, w: 16, h: 16 },
      terraceMarker: { x: 176, y: 90, w: 16, h: 16 },
      eastWaypost: { x: 272, y: 32, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(-2, 88, 16, 32), to: "BM-01", spawn: "east" },
      { rect: rect(304, 32, 16, 32), to: "HV-01", spawn: "south" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 150,
        y: 126,
        min: 120,
        max: 196,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(112, 64, 96, 16),
      rect(240, 64, 80, 16),
      rect(240, 4, 32, 28),
      rect(48, 118, 48, 26),
      rect(96, 122, 32, 12),
      rect(0, 112, 32, 32),
      rect(144, 128, 32, 32),
      rect(240, 128, 32, 32),
      rect(272, 96, 32, 48),
      rect(288, 36, 16, 12)
    ]
  };

  const hv01 = {
    id: "HV-01",
    name: "Highroad Spur Gate",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 },
      north: { x: 154, y: 44 }
    },
    layers: {
      ground: buildHv01Ground(),
      mid: buildHv01Mid(),
      fore: []
    },
    props: {
      landmark: { x: 208, y: 20, w: 32, h: 30 },
      highroadBriar: { x: 128, y: 16, w: 48, h: 16 },
      spurCache: { x: 232, y: 126, w: 16, h: 16 },
      southWaypost: { x: 96, y: 160, w: 16, h: 16 },
      northThreshold: { x: 128, y: 0, w: 48, h: 24 }
    },
    transitions: [
      { rect: rect(128, 0, 48, 8), to: "HV-02", spawn: "south" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 64,
        y: 142,
        min: 44,
        max: 100,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 186,
        y: 126,
        min: 160,
        max: 218,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 80, 144, 16),
      rect(176, 80, 144, 16),
      rect(208, 20, 32, 28),
      rect(224, 122, 32, 10),
      rect(32, 32, 32, 32),
      rect(0, 128, 32, 32),
      rect(272, 112, 32, 32)
    ]
  };

  const hv02 = {
    id: "HV-02",
    name: "Watcher's Steps Lower",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 },
      north: { x: 104, y: 24 }
    },
    layers: {
      ground: buildHv02Ground(),
      mid: buildHv02Mid(),
      fore: []
    },
    props: {
      landmark: { x: 48, y: 20, w: 32, h: 30 },
      stepsCache: { x: 40, y: 142, w: 16, h: 16 },
      southThreshold: { x: 128, y: 160, w: 48, h: 16 },
      northThreshold: { x: 88, y: 0, w: 40, h: 24 }
    },
    transitions: [
      { rect: rect(128, 184, 48, 8), to: "HV-01", spawn: "north" },
      { rect: rect(88, 0, 40, 8), to: "HV-03", spawn: "south" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 212,
        y: 146,
        min: 188,
        max: 264,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 132,
        y: 72,
        min: 104,
        max: 152,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 112, 144, 16),
      rect(176, 112, 144, 16),
      rect(48, 20, 32, 28),
      rect(32, 138, 32, 10),
      rect(0, 16, 32, 32),
      rect(256, 32, 32, 32),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const hv03 = {
    id: "HV-03",
    name: "Watcher's Steps Upper",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 104, y: 160 },
      south: { x: 104, y: 160 },
      north: { x: 154, y: 40 }
    },
    layers: {
      ground: buildHv03Ground(),
      mid: buildHv03Mid(),
      fore: []
    },
    props: {
      landmark: { x: 48, y: 20, w: 32, h: 30 },
      upperBriar: { x: 176, y: 16, w: 48, h: 16 },
      southThreshold: { x: 88, y: 160, w: 40, h: 16 },
      northThreshold: { x: 176, y: 0, w: 48, h: 24 },
      eastLookout: { x: 224, y: 80, w: 32, h: 24 }
    },
    transitions: [
      { rect: rect(88, 184, 40, 8), to: "HV-02", spawn: "north" },
      { rect: rect(176, 0, 48, 8), to: "HV-04", spawn: "south" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 70,
        y: 146,
        min: 46,
        max: 110,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 170,
        y: 72,
        min: 146,
        max: 208,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 112, 128, 16),
      rect(160, 112, 160, 16),
      rect(48, 20, 32, 28),
      rect(0, 144, 32, 32),
      rect(272, 16, 32, 32),
      rect(272, 128, 32, 32),
      rect(224, 90, 32, 12)
    ]
  };

  const hv04 = {
    id: "HV-04",
    name: "Watchgate South Court",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 }
    },
    layers: {
      ground: buildHv04Ground(),
      mid: buildHv04Mid(),
      fore: []
    },
    props: {
      gateStone: { x: 96, y: 20, w: 32, h: 30 },
      leftBrazier: { x: 104, y: 118, w: 16, h: 16 },
      rightBrazier: { x: 200, y: 118, w: 16, h: 16 },
      watchgateGateThorn: { x: 136, y: 16, w: 48, h: 16 },
      watchgateWinchBriar: { x: 224, y: 104, w: 32, h: 16 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      bannerRack: { x: 240, y: 126, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(136, 184, 48, 8), to: "HV-03", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 82,
        y: 146,
        min: 56,
        max: 118,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 214,
        y: 138,
        min: 188,
        max: 250,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 96, 144, 16),
      rect(176, 96, 144, 16),
      rect(96, 20, 32, 28),
      rect(176, 20, 32, 28),
      rect(32, 122, 32, 10),
      rect(256, 122, 32, 10),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  window.ElderfieldBenchmarkScreen = bm01;
  window.ElderfieldBenchmarkScreens = {
    [bm01.id]: bm01,
    [bm02.id]: bm02,
    [hv01.id]: hv01,
    [hv02.id]: hv02,
    [hv03.id]: hv03,
    [hv04.id]: hv04
  };
})();
