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

  function fillMemorialFloor() {
    const tiles = [];
    const variants = ["memorialFloorA", "memorialFloorB"];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let ty = 0; ty < 12; ty += 1) {
      for (let tx = 0; tx < 20; tx += 1) {
        place(variants[(tx + ty) % variants.length], tx, ty);
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

  function buildHv05Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [8, 10], [9, 10], [10, 10], [11, 10],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [8, 8], [9, 8], [10, 8], [11, 8],
      [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6], [18, 6],
      [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
      [13, 5], [14, 5], [15, 5], [16, 5], [17, 5], [18, 5]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv05Mid() {
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

    place("ruinL", 1, 2);
    place("landmarkTopL", 2, 1);
    place("landmarkTopR", 3, 1);
    place("landmarkBaseL", 2, 2);
    place("landmarkBaseR", 3, 2);
    place("ruinR", 4, 2);
    place("ruinL", 1, 4);

    place("ruinL", 14, 2);
    place("landmarkTopL", 15, 1);
    place("landmarkTopR", 16, 1);
    place("landmarkBaseL", 15, 2);
    place("landmarkBaseR", 16, 2);
    place("ruinR", 17, 2);
    place("ruinR", 18, 4);

    place("ruinL", 0, 5);
    place("ruinR", 18, 5);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 9, 5);
    place("sign", 17, 5);

    return tiles;
  }

  function buildHv06Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8],
      [2, 9], [3, 9], [4, 9], [5, 9], [6, 9],
      [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
      [8, 6], [9, 6], [10, 6], [11, 6],
      [8, 4], [9, 4], [10, 4], [11, 4],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [9, 2], [10, 2]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv06Mid() {
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

    place("ruinL", 8, 1);
    place("landmarkTopL", 9, 0);
    place("landmarkTopR", 10, 0);
    place("landmarkBaseL", 9, 1);
    place("landmarkBaseR", 10, 1);
    place("ruinR", 11, 1);

    place("sign", 9, 2);
    place("sign", 7, 4);
    place("sign", 12, 4);
    place("sign", 7, 7);
    place("sign", 12, 7);

    place("ruinL", 4, 7);
    place("ruinR", 5, 7);
    place("ruinL", 14, 7);
    place("ruinR", 15, 7);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    return tiles;
  }

  function buildHv07Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [9, 10], [10, 10],
      [8, 9], [9, 9], [10, 9], [11, 9], [12, 9],
      [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
      [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7], [18, 7],
      [9, 6], [10, 6],
      [9, 5], [10, 5],
      [9, 4], [10, 4],
      [9, 3], [10, 3],
      [9, 2], [10, 2],
      [13, 9], [14, 10], [15, 11]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv07Mid() {
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

    place("houseRoofL", 2, 7);
    place("houseRoofM", 3, 7);
    place("houseRoofR", 4, 7);
    place("houseWallL", 2, 8);
    place("houseDoor", 3, 8);
    place("houseWallR", 4, 8);

    place("ruinL", 5, 8);
    place("ruinR", 6, 8);

    place("ruinL", 11, 6);
    place("landmarkTopL", 12, 5);
    place("landmarkTopR", 13, 5);
    place("landmarkBaseL", 12, 6);
    place("landmarkBaseR", 13, 6);
    place("ruinR", 14, 6);

    place("ruinL", 16, 9);
    place("ruinR", 17, 9);

    place("treeTL", 0, 7);
    place("treeTR", 1, 7);
    place("treeBL", 0, 8);
    place("treeBR", 1, 8);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 1);
    place("treeTR", 18, 1);
    place("treeBL", 17, 2);
    place("treeBR", 18, 2);

    place("sign", 8, 6);
    place("sign", 16, 6);
    place("sign", 15, 10);

    return tiles;
  }

  function buildHv09Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 11], [10, 11],
      [9, 10], [10, 10],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [8, 8], [9, 8], [10, 8], [11, 8],
      [8, 7], [9, 7], [10, 7], [11, 7],
      [9, 6], [10, 6],
      [9, 5], [10, 5],
      [9, 4], [10, 4],
      [9, 3], [10, 3],
      [8, 2], [9, 2], [10, 2], [11, 2],
      [8, 1], [9, 1], [10, 1], [11, 1]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv09Mid() {
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

    place("ruinL", 8, 2);
    place("landmarkTopL", 9, 1);
    place("landmarkTopR", 10, 1);
    place("landmarkBaseL", 9, 2);
    place("landmarkBaseR", 10, 2);
    place("ruinR", 11, 2);

    place("sign", 8, 1);
    place("sign", 11, 1);
    place("sign", 2, 1);
    place("sign", 17, 1);

    place("ruinL", 1, 2);
    place("ruinR", 2, 2);
    place("ruinL", 16, 2);
    place("ruinR", 17, 2);

    place("treeTL", 0, 8);
    place("treeTR", 1, 8);
    place("treeBL", 0, 9);
    place("treeBR", 1, 9);

    place("treeTL", 17, 8);
    place("treeTR", 18, 8);
    place("treeBL", 17, 9);
    place("treeBR", 18, 9);

    return tiles;
  }

  function buildHv10Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [6, 0], [7, 0], [8, 0], [9, 0],
      [6, 1], [7, 1], [8, 1],
      [6, 2], [7, 2],
      [7, 3], [8, 3],
      [8, 4], [9, 4],
      [8, 6], [9, 6], [10, 6], [11, 6],
      [9, 7], [10, 7], [11, 7],
      [9, 8], [10, 8], [11, 8],
      [8, 9], [9, 9], [10, 9],
      [8, 10], [9, 10],
      [8, 11], [9, 11],
      [12, 8], [13, 8], [14, 8],
      [13, 7], [14, 7]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildHv10Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      if (tx === 8 || tx === 9) {
        place("stairs", tx, 5);
      } else if (tx === 0) {
        place("cliffLeft", tx, 5);
      } else if (tx === 19) {
        place("cliffRight", tx, 5);
      } else {
        place("cliffFace", tx, 5);
      }
    }

    place("ruinL", 2, 2);
    place("landmarkTopL", 3, 1);
    place("landmarkTopR", 4, 1);
    place("landmarkBaseL", 3, 2);
    place("landmarkBaseR", 4, 2);
    place("ruinR", 5, 2);

    place("ruinL", 14, 7);
    place("ruinR", 15, 7);
    place("ruinR", 16, 8);

    place("treeTL", 16, 1);
    place("treeTR", 17, 1);
    place("treeBL", 16, 2);
    place("treeBR", 17, 2);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 6, 0);
    place("sign", 7, 6);
    place("sign", 12, 9);

    return tiles;
  }

  function buildCp01Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [8, 11], [9, 11], [10, 11], [11, 11],
      [8, 10], [9, 10], [10, 10], [11, 10],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [9, 8], [10, 8],
      [9, 7], [10, 7],
      [9, 6], [10, 6],
      [9, 5], [10, 5],
      [9, 4], [10, 4],
      [9, 3], [10, 3],
      [8, 2], [9, 2], [10, 2], [11, 2],
      [8, 1], [9, 1], [10, 1], [11, 1]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildCp01Mid() {
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

    place("ruinL", 8, 3);
    place("landmarkTopL", 9, 2);
    place("landmarkTopR", 10, 2);
    place("landmarkBaseL", 9, 3);
    place("landmarkBaseR", 10, 3);
    place("ruinR", 11, 3);

    place("sign", 7, 2);
    place("sign", 12, 2);
    place("sign", 5, 5);
    place("sign", 14, 5);

    place("ruinL", 2, 8);
    place("ruinR", 3, 8);
    place("ruinL", 16, 8);
    place("ruinR", 17, 8);

    return tiles;
  }

  function buildGf01Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 0], [10, 0],
      [9, 1], [10, 1],
      [9, 2], [10, 2],
      [8, 4], [9, 4], [10, 4], [11, 4],
      [8, 5], [9, 5], [10, 5], [11, 5],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6],
      [4, 7], [5, 7], [6, 7],
      [10, 7], [11, 7], [12, 7],
      [3, 8], [4, 8], [5, 8],
      [13, 8], [14, 8],
      [2, 9], [3, 9],
      [14, 9], [15, 9]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildGf01Mid() {
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

    place("ruinL", 4, 6);
    place("landmarkTopL", 5, 5);
    place("landmarkTopR", 6, 5);
    place("landmarkBaseL", 5, 6);
    place("landmarkBaseR", 6, 6);
    place("ruinR", 7, 6);

    place("ruinL", 2, 8);
    place("ruinR", 3, 8);
    place("ruinL", 13, 8);
    place("ruinR", 14, 8);

    place("treeTL", 0, 7);
    place("treeTR", 1, 7);
    place("treeBL", 0, 8);
    place("treeBR", 1, 8);

    place("treeTL", 17, 6);
    place("treeTR", 18, 6);
    place("treeBL", 17, 7);
    place("treeBR", 18, 7);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 2, 7);
    place("sign", 15, 7);

    return tiles;
  }

  function buildGf02Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [0, 6], [1, 6], [2, 6], [3, 6],
      [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
      [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
      [8, 7], [9, 7], [10, 7], [11, 7],
      [9, 8], [10, 8], [11, 8],
      [9, 9], [10, 9], [11, 9],
      [9, 10], [10, 10],
      [9, 11], [10, 11],
      [12, 7], [13, 7],
      [13, 8], [14, 8],
      [14, 9], [15, 9]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildGf02Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 6; tx += 1) {
      if (tx === 5 || tx === 6) {
        place("stairs", tx, 4);
      } else if (tx === 0) {
        place("cliffLeft", tx, 4);
      } else {
        place("cliffFace", tx, 4);
      }
    }

    place("houseRoofL", 1, 1);
    place("houseRoofM", 2, 1);
    place("houseRoofR", 3, 1);
    place("houseWallL", 1, 2);
    place("houseDoor", 2, 2);
    place("houseWallR", 3, 2);

    place("ruinL", 9, 5);
    place("landmarkTopL", 10, 4);
    place("landmarkTopR", 11, 4);
    place("landmarkBaseL", 10, 5);
    place("landmarkBaseR", 11, 5);
    place("ruinR", 12, 5);

    place("ruinL", 14, 8);
    place("ruinR", 15, 8);

    place("treeTL", 17, 2);
    place("treeTR", 18, 2);
    place("treeBL", 17, 3);
    place("treeBR", 18, 3);

    place("treeTL", 0, 8);
    place("treeTR", 1, 8);
    place("treeBL", 0, 9);
    place("treeBR", 1, 9);

    place("treeTL", 17, 8);
    place("treeTR", 18, 8);
    place("treeBL", 17, 9);
    place("treeBR", 18, 9);

    place("sign", 8, 8);
    place("sign", 12, 8);
    place("sign", 15, 7);
    place("sign", 9, 10);

    return tiles;
  }

  function buildGf05Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 0], [10, 0],
      [9, 1], [10, 1],
      [9, 2], [10, 2],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [9, 4], [10, 4],
      [7, 6], [8, 6], [11, 6], [12, 6],
      [6, 7], [7, 7], [12, 7], [13, 7],
      [6, 8], [7, 8], [12, 8], [13, 8],
      [7, 9], [8, 9], [11, 9], [12, 9],
      [9, 10], [10, 10],
      [9, 11], [10, 11]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildGf05Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 4; tx <= 15; tx += 1) {
      if (tx === 9 || tx === 10) {
        place("stairs", tx, 5);
      } else if (tx === 4) {
        place("cliffLeft", tx, 5);
      } else if (tx === 15) {
        place("cliffRight", tx, 5);
      } else {
        place("cliffFace", tx, 5);
      }
    }

    place("ruinL", 8, 2);
    place("landmarkTopL", 9, 1);
    place("landmarkTopR", 10, 1);
    place("landmarkBaseL", 9, 2);
    place("landmarkBaseR", 10, 2);
    place("ruinR", 11, 2);

    place("treeTL", 1, 1);
    place("treeTR", 2, 1);
    place("treeBL", 1, 2);
    place("treeBR", 2, 2);

    place("treeTL", 17, 1);
    place("treeTR", 18, 1);
    place("treeBL", 17, 2);
    place("treeBR", 18, 2);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("ruinL", 3, 8);
    place("ruinR", 4, 8);
    place("ruinL", 14, 8);
    place("ruinR", 15, 8);

    place("sign", 6, 7);
    place("sign", 12, 7);
    place("sign", 4, 9);
    place("sign", 15, 9);

    return tiles;
  }

  function buildGf06Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 0], [10, 0],
      [9, 1], [10, 1],
      [9, 2], [10, 2],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [8, 4], [9, 4], [10, 4], [11, 4],
      [8, 5], [9, 5], [10, 5], [11, 5],
      [8, 6], [9, 6], [10, 6], [11, 6],
      [8, 7], [9, 7], [10, 7], [11, 7],
      [9, 8], [10, 8],
      [9, 9], [10, 9],
      [9, 10], [10, 10],
      [9, 11], [10, 11],
      [3, 4], [4, 4],
      [2, 3], [3, 3], [4, 3]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildGf06Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 6; tx += 1) {
      if (tx === 3 || tx === 4) {
        place("stairs", tx, 5);
      } else if (tx === 0) {
        place("cliffLeft", tx, 5);
      } else if (tx === 6) {
        place("cliffRight", tx, 5);
      } else {
        place("cliffFace", tx, 5);
      }
    }

    place("ruinL", 0, 3);
    place("landmarkTopL", 1, 2);
    place("landmarkTopR", 2, 2);
    place("landmarkBaseL", 1, 3);
    place("landmarkBaseR", 2, 3);
    place("ruinR", 3, 3);

    place("sign", 8, 6);
    place("sign", 11, 6);
    place("sign", 7, 7);
    place("sign", 12, 7);
    place("sign", 6, 8);
    place("sign", 13, 8);
    place("sign", 5, 9);
    place("sign", 14, 9);

    place("ruinL", 4, 8);
    place("ruinR", 5, 8);
    place("ruinL", 14, 7);
    place("ruinR", 15, 7);

    place("treeTL", 17, 1);
    place("treeTR", 18, 1);
    place("treeBL", 17, 2);
    place("treeBR", 18, 2);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 15, 6);

    return tiles;
  }

  function buildGf07Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 0], [10, 0],
      [9, 1], [10, 1],
      [8, 2], [9, 2], [10, 2], [11, 2],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [8, 4], [9, 4], [10, 4], [11, 4],
      [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5],
      [8, 6], [9, 6], [10, 6], [11, 6],
      [9, 7], [10, 7],
      [8, 8], [9, 8], [10, 8], [11, 8],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [9, 10], [10, 10],
      [9, 11], [10, 11]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildGf07Mid() {
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

    place("ruinL", 8, 2);
    place("landmarkTopL", 9, 1);
    place("landmarkTopR", 10, 1);
    place("landmarkBaseL", 9, 2);
    place("landmarkBaseR", 10, 2);
    place("ruinR", 11, 2);

    place("sign", 7, 5);
    place("sign", 12, 5);
    place("sign", 8, 7);
    place("sign", 11, 7);

    place("ruinL", 4, 8);
    place("ruinR", 5, 8);
    place("ruinL", 14, 8);
    place("ruinR", 15, 8);

    place("treeTL", 0, 1);
    place("treeTR", 1, 1);
    place("treeBL", 0, 2);
    place("treeBR", 1, 2);

    place("treeTL", 17, 1);
    place("treeTR", 18, 1);
    place("treeBL", 17, 2);
    place("treeBR", 18, 2);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    place("sign", 15, 7);

    return tiles;
  }

  function buildGf10Ground() {
    const { tiles, place } = fillGrass();
    const roadTiles = [
      [9, 0], [10, 0],
      [9, 1], [10, 1],
      [8, 2], [9, 2], [10, 2], [11, 2],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [8, 4], [9, 4], [10, 4], [11, 4],
      [8, 5], [9, 5], [10, 5], [11, 5],
      [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6],
      [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
      [8, 8], [9, 8], [10, 8], [11, 8],
      [8, 9], [9, 9], [10, 9], [11, 9],
      [9, 10], [10, 10],
      [9, 11], [10, 11]
    ];

    for (const [tx, ty] of roadTiles) {
      place((tx + ty) % 2 === 0 ? "roadA" : "roadB", tx, ty);
    }

    return tiles;
  }

  function buildGf10Mid() {
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

    place("ruinL", 8, 8);
    place("landmarkTopL", 9, 7);
    place("landmarkTopR", 10, 7);
    place("landmarkBaseL", 9, 8);
    place("landmarkBaseR", 10, 8);
    place("ruinR", 11, 8);

    place("ruinL", 5, 7);
    place("ruinR", 6, 7);
    place("ruinL", 13, 7);
    place("ruinR", 14, 7);

    place("sign", 4, 7);
    place("sign", 15, 7);
    place("sign", 12, 6);

    place("treeTL", 0, 1);
    place("treeTR", 1, 1);
    place("treeBL", 0, 2);
    place("treeBR", 1, 2);

    place("treeTL", 17, 1);
    place("treeTR", 18, 1);
    place("treeBL", 17, 2);
    place("treeBR", 18, 2);

    place("treeTL", 0, 9);
    place("treeTR", 1, 9);
    place("treeBL", 0, 10);
    place("treeBR", 1, 10);

    place("treeTL", 17, 9);
    place("treeTR", 18, 9);
    place("treeBL", 17, 10);
    place("treeBR", 18, 10);

    return tiles;
  }

  function buildFc01Ground() {
    const { tiles, place } = fillMemorialFloor();

    for (let ty = 1; ty <= 9; ty += 1) {
      place("cryptWater", 1, ty);
      place("cryptWater", 2, ty);
      place("cryptWater", 17, ty);
      place("cryptWater", 18, ty);
    }

    place("stairs", 9, 10);
    place("stairs", 10, 10);

    return tiles;
  }

  function buildFc01Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      place("cryptWall", tx, 0);
    }

    for (let ty = 1; ty <= 10; ty += 1) {
      place("cryptWall", 0, ty);
      place("cryptWall", 19, ty);
    }

    place("cryptWall", 8, 1);
    place("sealGate", 9, 1);
    place("sealGate", 10, 1);
    place("cryptWall", 11, 1);

    for (let ty = 2; ty <= 7; ty += 1) {
      place(ty % 2 === 0 ? "nameWallA" : "nameWallB", 4, ty);
      place(ty % 2 === 0 ? "nameWallB" : "nameWallA", 5, ty);
      place(ty % 2 === 0 ? "nameWallB" : "nameWallA", 14, ty);
      place(ty % 2 === 0 ? "nameWallA" : "nameWallB", 15, ty);
    }

    place("nameWallA", 9, 4);
    place("nameWallB", 10, 4);
    place("candleStand", 8, 5);
    place("nameWallB", 9, 5);
    place("nameWallA", 10, 5);
    place("candleStand", 11, 5);
    place("nameWallA", 9, 6);
    place("nameWallB", 10, 6);

    place("cryptWall", 3, 3);
    place("cryptWall", 3, 7);
    place("cryptWall", 16, 3);
    place("cryptWall", 16, 7);

    place("candleStand", 8, 9);
    place("candleStand", 11, 9);

    return tiles;
  }

  function buildFc02Ground() {
    const { tiles, place } = fillMemorialFloor();

    for (let ty = 2; ty <= 8; ty += 1) {
      place("cryptWater", 1, ty);
      place("cryptWater", 2, ty);
      place("cryptWater", 17, ty);
      place("cryptWater", 18, ty);
    }

    place("stairs", 9, 10);
    place("stairs", 10, 10);

    return tiles;
  }

  function buildFc02Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      place("cryptWall", tx, 0);
    }

    for (let ty = 1; ty <= 10; ty += 1) {
      place("cryptWall", 0, ty);
      place("cryptWall", 19, ty);
    }

    place("cryptWall", 8, 1);
    place("sealGate", 9, 1);
    place("sealGate", 10, 1);
    place("cryptWall", 11, 1);

    place("cryptWall", 3, 3);
    place("nameWallA", 4, 3);
    place("nameWallB", 4, 4);
    place("cryptWall", 3, 7);
    place("nameWallB", 4, 7);
    place("nameWallA", 4, 8);

    place("cryptWall", 16, 3);
    place("nameWallB", 15, 3);
    place("nameWallA", 15, 4);
    place("cryptWall", 16, 7);
    place("nameWallA", 15, 7);
    place("nameWallB", 15, 8);

    place("cryptWall", 8, 4);
    place("nameWallA", 9, 4);
    place("nameWallB", 10, 4);
    place("cryptWall", 11, 4);
    place("candleStand", 8, 5);
    place("nameWallB", 9, 5);
    place("nameWallA", 10, 5);
    place("candleStand", 11, 5);
    place("candleStand", 8, 7);
    place("candleStand", 11, 7);

    return tiles;
  }

  function buildFc03Ground() {
    const { tiles, place } = fillMemorialFloor();

    for (let ty = 3; ty <= 7; ty += 1) {
      place("cryptWater", 1, ty);
      place("cryptWater", 2, ty);
      place("cryptWater", 17, ty);
      place("cryptWater", 18, ty);
    }

    place("stairs", 9, 10);
    place("stairs", 10, 10);

    return tiles;
  }

  function buildFc03Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      place("cryptWall", tx, 0);
    }

    for (let ty = 1; ty <= 10; ty += 1) {
      place("cryptWall", 0, ty);
      place("cryptWall", 19, ty);
    }

    place("cryptWall", 8, 1);
    place("sealGate", 9, 1);
    place("sealGate", 10, 1);
    place("cryptWall", 11, 1);

    place("cryptWall", 3, 4);
    place("nameWallA", 4, 4);
    place("nameWallB", 4, 5);
    place("candleStand", 5, 5);
    place("cryptWall", 3, 7);

    place("cryptWall", 16, 4);
    place("nameWallB", 15, 4);
    place("nameWallA", 15, 5);
    place("candleStand", 14, 5);
    place("cryptWall", 16, 7);

    place("cryptWall", 8, 3);
    place("nameWallA", 9, 3);
    place("nameWallB", 10, 3);
    place("cryptWall", 11, 3);
    place("candleStand", 8, 4);
    place("nameWallB", 9, 4);
    place("nameWallA", 10, 4);
    place("candleStand", 11, 4);
    place("nameWallA", 9, 5);
    place("nameWallB", 10, 5);
    place("nameWallB", 9, 6);
    place("nameWallA", 10, 6);
    place("candleStand", 8, 7);
    place("candleStand", 11, 7);

    return tiles;
  }

  function buildFc04Ground() {
    const { tiles, place } = fillMemorialFloor();

    for (let ty = 4; ty <= 7; ty += 1) {
      place("cryptWater", 1, ty);
      place("cryptWater", 2, ty);
      place("cryptWater", 17, ty);
      place("cryptWater", 18, ty);
    }

    place("stairs", 9, 10);
    place("stairs", 10, 10);

    return tiles;
  }

  function buildFc04Mid() {
    const tiles = [];

    function place(sprite, tx, ty) {
      tiles.push({ sprite, x: tx * TILE, y: ty * TILE });
    }

    for (let tx = 0; tx <= 19; tx += 1) {
      place("cryptWall", tx, 0);
    }

    for (let ty = 1; ty <= 10; ty += 1) {
      place("cryptWall", 0, ty);
      place("cryptWall", 19, ty);
    }

    place("cryptWall", 8, 1);
    place("sealGate", 9, 1);
    place("sealGate", 10, 1);
    place("cryptWall", 11, 1);

    place("cryptWall", 3, 4);
    place("nameWallA", 4, 4);
    place("nameWallB", 5, 4);
    place("candleStand", 5, 5);
    place("cryptWall", 3, 7);

    place("cryptWall", 16, 4);
    place("nameWallB", 14, 4);
    place("nameWallA", 15, 4);
    place("candleStand", 14, 5);
    place("cryptWall", 16, 7);

    place("cryptWall", 8, 3);
    place("nameWallA", 9, 3);
    place("nameWallB", 10, 3);
    place("cryptWall", 11, 3);

    place("nameWallA", 8, 4);
    place("sealGate", 9, 4);
    place("sealGate", 10, 4);
    place("nameWallB", 11, 4);

    place("candleStand", 8, 5);
    place("sealGate", 9, 5);
    place("sealGate", 10, 5);
    place("candleStand", 11, 5);

    place("nameWallB", 8, 6);
    place("sealGate", 9, 6);
    place("sealGate", 10, 6);
    place("nameWallA", 11, 6);

    place("cryptWall", 8, 7);
    place("nameWallB", 9, 7);
    place("nameWallA", 10, 7);
    place("cryptWall", 11, 7);

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
      south: { x: 154, y: 160 },
      north: { x: 154, y: 40 }
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
      { rect: rect(136, 184, 48, 8), to: "HV-03", spawn: "north" },
      { rect: rect(136, 0, 48, 8), to: "HV-05", spawn: "south" }
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

  const hv05 = {
    id: "HV-05",
    name: "Watchgate Upper Wall",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 },
      east: { x: 280, y: 88 }
    },
    layers: {
      ground: buildHv05Ground(),
      mid: buildHv05Mid(),
      fore: []
    },
    props: {
      wallMarker: { x: 144, y: 80, w: 16, h: 16 },
      wallCache: { x: 48, y: 80, w: 16, h: 16 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      eastDrop: { x: 272, y: 80, w: 32, h: 24 }
    },
    transitions: [
      { rect: rect(136, 184, 48, 8), to: "HV-04", spawn: "north" },
      { rect: rect(304, 72, 16, 32), to: "HV-06", spawn: "west" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 90,
        y: 92,
        min: 68,
        max: 124,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 214,
        y: 92,
        min: 186,
        max: 248,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 112, 144, 16),
      rect(176, 112, 144, 16),
      rect(32, 20, 48, 28),
      rect(240, 20, 48, 28),
      rect(0, 74, 16, 10),
      rect(288, 74, 16, 10),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const hv06 = {
    id: "HV-06",
    name: "Bell of the Wayside",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 24, y: 128 },
      west: { x: 24, y: 128 },
      north: { x: 154, y: 40 }
    },
    layers: {
      ground: buildHv06Ground(),
      mid: buildHv06Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 4, w: 32, h: 30 },
      bellShrine: { x: 144, y: 4, w: 32, h: 30 },
      altarTablet: { x: 144, y: 32, w: 16, h: 16 },
      upperLeftBrazier: { x: 112, y: 64, w: 16, h: 16 },
      upperRightBrazier: { x: 192, y: 64, w: 16, h: 16 },
      lowerLeftBrazier: { x: 112, y: 112, w: 16, h: 16 },
      lowerRightBrazier: { x: 192, y: 112, w: 16, h: 16 },
      westThreshold: { x: 0, y: 112, w: 16, h: 32 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      northSeal: { x: 128, y: 16, w: 64, h: 16 }
    },
    transitions: [
      { rect: rect(-2, 112, 16, 32), to: "HV-05", spawn: "east" },
      { rect: rect(136, 0, 48, 8), to: "HV-07", spawn: "south" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 78,
        y: 138,
        min: 44,
        max: 112,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 226,
        y: 126,
        min: 190,
        max: 252,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 80, 144, 16),
      rect(176, 80, 144, 16),
      rect(144, 4, 32, 28),
      rect(64, 122, 32, 10),
      rect(224, 122, 32, 10),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const hv07 = {
    id: "HV-07",
    name: "Shepherd's Rest",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 160 },
      south: { x: 154, y: 160 },
      north: { x: 154, y: 40 },
      southeast: { x: 240, y: 152 }
    },
    layers: {
      ground: buildHv07Ground(),
      mid: buildHv07Mid(),
      fore: []
    },
    props: {
      npc: { x: 56, y: 126, w: 16, h: 16 },
      landmark: { x: 192, y: 84, w: 32, h: 30 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      eastMarker: { x: 256, y: 96, w: 16, h: 16 },
      southeastMarker: { x: 240, y: 160, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "HV-09", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "HV-06", spawn: "north" },
      { rect: rect(224, 184, 48, 8), to: "HV-10", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 232,
        y: 142,
        min: 208,
        max: 266,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 80, 144, 16),
      rect(176, 80, 144, 16),
      rect(32, 118, 48, 26),
      rect(192, 84, 32, 28),
      rect(80, 106, 16, 10),
      rect(256, 138, 32, 10),
      rect(0, 112, 32, 48),
      rect(272, 16, 32, 32)
    ]
  };

  const hv09 = {
    id: "HV-09",
    name: "North Bell Overlook",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 152 },
      north: { x: 154, y: 40 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildHv09Ground(),
      mid: buildHv09Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 32, w: 32, h: 30 },
      northGate: { x: 136, y: 16, w: 48, h: 16 },
      towerView: { x: 232, y: 16, w: 32, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "CP-01", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "HV-07", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 96,
        y: 146,
        min: 64,
        max: 124,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 0, 136, 16),
      rect(184, 0, 136, 16),
      rect(0, 96, 144, 16),
      rect(176, 96, 144, 16),
      rect(144, 32, 32, 28),
      rect(0, 128, 32, 32),
      rect(272, 128, 32, 32)
    ]
  };

  const cp01 = {
    id: "CP-01",
    name: "Wind Gate",
    region: "Cinderpeak Ascent",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 152 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildCp01Ground(),
      mid: buildCp01Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 32, w: 32, h: 30 },
      northGate: { x: 136, y: 16, w: 48, h: 16 },
      windBell: { x: 224, y: 48, w: 16, h: 16 },
      southView: { x: 48, y: 136, w: 32, h: 16 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 184, 48, 8), to: "HV-09", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 92,
        y: 146,
        min: 64,
        max: 120,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 0, 136, 16),
      rect(184, 0, 136, 16),
      rect(136, 16, 48, 16),
      rect(0, 112, 144, 16),
      rect(176, 112, 144, 16),
      rect(144, 32, 32, 28),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const hv10 = {
    id: "HV-10",
    name: "Greyfen Descent",
    region: "Highroad Vale",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 120, y: 40 },
      north: { x: 120, y: 40 },
      south: { x: 144, y: 160 }
    },
    layers: {
      ground: buildHv10Ground(),
      mid: buildHv10Mid(),
      fore: []
    },
    props: {
      landmark: { x: 48, y: 20, w: 32, h: 30 },
      leftBrazier: { x: 104, y: 112, w: 16, h: 16 },
      rightBrazier: { x: 184, y: 112, w: 16, h: 16 },
      descentBriar: { x: 192, y: 96, w: 48, h: 16 },
      southSeal: { x: 120, y: 160, w: 48, h: 16 },
      nicheCache: { x: 232, y: 126, w: 16, h: 16 },
      northThreshold: { x: 80, y: 0, w: 48, h: 24 },
      southThreshold: { x: 120, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(80, 0, 48, 8), to: "HV-07", spawn: "southeast" },
      { rect: rect(120, 184, 48, 8), to: "GF-01", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 84,
        y: 132,
        min: 52,
        max: 122,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      },
      {
        type: "hound",
        x: 184,
        y: 144,
        min: 148,
        max: 214,
        axis: "x",
        dir: "left",
        speed: 22,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 80, 128, 16),
      rect(160, 80, 160, 16),
      rect(48, 20, 32, 28),
      rect(224, 122, 32, 10),
      rect(256, 118, 32, 18),
      rect(256, 32, 32, 32),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const gf01 = {
    id: "GF-01",
    name: "Marshfoot Entry",
    region: "Greyfen March",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 40 },
      north: { x: 154, y: 40 },
      east: { x: 274, y: 104 }
    },
    layers: {
      ground: buildGf01Ground(),
      mid: buildGf01Mid(),
      fore: []
    },
    props: {
      landmark: { x: 80, y: 84, w: 32, h: 30 },
      marshCache: { x: 32, y: 126, w: 16, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      eastMarker: { x: 240, y: 112, w: 16, h: 16 },
      westMarker: { x: 32, y: 112, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "HV-10", spawn: "south" },
      { rect: rect(304, 96, 16, 48), to: "GF-02", spawn: "west" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 92,
        y: 138,
        min: 58,
        max: 126,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      },
      {
        type: "hound",
        x: 208,
        y: 132,
        min: 176,
        max: 246,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 48, 144, 16),
      rect(176, 48, 144, 16),
      rect(80, 84, 32, 28),
      rect(32, 122, 16, 10),
      rect(0, 112, 32, 48),
      rect(272, 96, 32, 32),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const gf02 = {
    id: "GF-02",
    name: "Ferryman's Reach",
    region: "Greyfen March",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 24, y: 104 },
      west: { x: 24, y: 104 },
      south: { x: 154, y: 160 }
    },
    layers: {
      ground: buildGf02Ground(),
      mid: buildGf02Mid(),
      fore: []
    },
    props: {
      npc: { x: 116, y: 102, w: 16, h: 16 },
      landmark: { x: 160, y: 68, w: 32, h: 30 },
      dockCache: { x: 240, y: 126, w: 16, h: 16 },
      westThreshold: { x: 0, y: 96, w: 16, h: 48 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      eastMarker: { x: 240, y: 112, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(-2, 96, 16, 48), to: "GF-01", spawn: "east" },
      { rect: rect(136, 184, 48, 8), to: "GF-05", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 236,
        y: 144,
        min: 208,
        max: 266,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 64, 96, 16),
      rect(16, 32, 48, 32),
      rect(160, 68, 32, 28),
      rect(224, 122, 48, 10),
      rect(0, 128, 32, 32),
      rect(272, 32, 32, 48),
      rect(272, 128, 32, 32)
    ]
  };

  const gf05 = {
    id: "GF-05",
    name: "False Marker Knoll",
    region: "Greyfen March",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 40 },
      north: { x: 154, y: 40 },
      south: { x: 154, y: 160 }
    },
    layers: {
      ground: buildGf05Ground(),
      mid: buildGf05Mid(),
      fore: []
    },
    props: {
      npc: { x: 56, y: 118, w: 16, h: 16 },
      landmark: { x: 144, y: 20, w: 32, h: 30 },
      leftBrazier: { x: 96, y: 112, w: 16, h: 16 },
      rightBrazier: { x: 208, y: 112, w: 16, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "GF-02", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "GF-06", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 84,
        y: 140,
        min: 52,
        max: 120,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      },
      {
        type: "hound",
        x: 224,
        y: 140,
        min: 196,
        max: 252,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      }
    ],
    baseSolids: [
      rect(64, 80, 80, 16),
      rect(176, 80, 80, 16),
      rect(144, 20, 32, 28),
      rect(48, 118, 32, 10),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const gf06 = {
    id: "GF-06",
    name: "Memorial Flats",
    region: "Greyfen March",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 40 },
      north: { x: 154, y: 40 },
      south: { x: 154, y: 160 }
    },
    layers: {
      ground: buildGf06Ground(),
      mid: buildGf06Mid(),
      fore: []
    },
    props: {
      landmark: { x: 16, y: 32, w: 32, h: 30 },
      graveBriar: { x: 128, y: 128, w: 64, h: 16 },
      clueGraves: { x: 80, y: 126, w: 32, h: 16 },
      tombCache: { x: 64, y: 46, w: 16, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      eastBreach: { x: 240, y: 96, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "GF-05", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "GF-07", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 90,
        y: 144,
        min: 56,
        max: 120,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      },
      {
        type: "hound",
        x: 212,
        y: 146,
        min: 180,
        max: 242,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 80, 48, 16),
      rect(80, 80, 32, 16),
      rect(16, 32, 32, 28),
      rect(0, 144, 32, 32),
      rect(272, 32, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const gf07 = {
    id: "GF-07",
    name: "Drowned Causeway",
    region: "Greyfen March",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 40 },
      north: { x: 154, y: 40 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildGf07Ground(),
      mid: buildGf07Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 20, w: 32, h: 30 },
      leftBrazier: { x: 112, y: 82, w: 16, h: 16 },
      rightBrazier: { x: 192, y: 82, w: 16, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      southSeal: { x: 128, y: 112, w: 64, h: 16 },
      sideChain: { x: 240, y: 112, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "GF-06", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "GF-10", spawn: "north" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 84,
        y: 140,
        min: 56,
        max: 120,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      },
      {
        type: "hound",
        x: 222,
        y: 138,
        min: 188,
        max: 252,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 96, 144, 16),
      rect(176, 96, 144, 16),
      rect(144, 20, 32, 28),
      rect(64, 138, 32, 10),
      rect(224, 138, 32, 10),
      rect(0, 32, 32, 32),
      rect(272, 32, 32, 32),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const gf10 = {
    id: "GF-10",
    name: "Fenwatch Approach",
    region: "Greyfen March",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 40 },
      north: { x: 154, y: 40 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildGf10Ground(),
      mid: buildGf10Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 116, w: 32, h: 30 },
      winchBriar: { x: 192, y: 96, w: 32, h: 16 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 },
      doorSeal: { x: 136, y: 144, w: 48, h: 16 },
      westReturnHint: { x: 48, y: 112, w: 16, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "GF-07", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "FC-01", spawn: "south" }
    ],
    enemySpawns: [
      {
        type: "hound",
        x: 82,
        y: 138,
        min: 56,
        max: 118,
        axis: "x",
        dir: "left",
        speed: 18,
        hp: 2
      },
      {
        type: "hound",
        x: 222,
        y: 138,
        min: 188,
        max: 252,
        axis: "x",
        dir: "left",
        speed: 20,
        hp: 2
      }
    ],
    baseSolids: [
      rect(0, 80, 144, 16),
      rect(176, 80, 144, 16),
      rect(80, 112, 16, 16),
      rect(224, 112, 16, 16),
      rect(144, 116, 32, 28),
      rect(0, 32, 32, 32),
      rect(272, 32, 32, 32),
      rect(0, 144, 32, 32),
      rect(272, 144, 32, 32)
    ]
  };

  const fc01 = {
    id: "FC-01",
    name: "Hall of Names",
    region: "Fenwatch Catacombs",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 152 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildFc01Ground(),
      mid: buildFc01Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 64, w: 32, h: 48 },
      leftRegister: { x: 64, y: 32, w: 32, h: 96 },
      rightRegister: { x: 224, y: 32, w: 32, h: 96 },
      innerSeal: { x: 144, y: 16, w: 32, h: 32 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "FC-02", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "GF-10", spawn: "south" }
    ],
    enemySpawns: [],
    baseSolids: [
      rect(0, 0, 136, 16),
      rect(184, 0, 136, 16),
      rect(0, 16, 16, 176),
      rect(304, 16, 16, 176),
      rect(32, 16, 32, 144),
      rect(256, 16, 32, 144),
      rect(64, 32, 32, 96),
      rect(224, 32, 32, 96),
      rect(144, 64, 32, 48)
    ]
  };

  const fc02 = {
    id: "FC-02",
    name: "Echo of Abandonment",
    region: "Fenwatch Catacombs",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 152 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildFc02Ground(),
      mid: buildFc02Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 64, w: 32, h: 32 },
      leftAlcove: { x: 64, y: 64, w: 32, h: 48 },
      rightAlcove: { x: 224, y: 64, w: 32, h: 48 },
      northSeal: { x: 144, y: 16, w: 32, h: 32 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "FC-03", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "FC-01", spawn: "south" }
    ],
    enemySpawns: [],
    baseSolids: [
      rect(0, 0, 136, 16),
      rect(184, 0, 136, 16),
      rect(0, 16, 16, 176),
      rect(304, 16, 16, 176),
      rect(32, 16, 32, 128),
      rect(256, 16, 32, 128),
      rect(128, 64, 16, 32),
      rect(176, 64, 16, 32)
    ]
  };

  const fc03 = {
    id: "FC-03",
    name: "Warden Testimony",
    region: "Fenwatch Catacombs",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 152 },
      south: { x: 154, y: 152 },
      north: { x: 154, y: 40 }
    },
    layers: {
      ground: buildFc03Ground(),
      mid: buildFc03Mid(),
      fore: []
    },
    props: {
      landmark: { x: 144, y: 48, w: 32, h: 64 },
      leftRecess: { x: 64, y: 64, w: 32, h: 48 },
      rightRecess: { x: 224, y: 64, w: 32, h: 48 },
      northSeal: { x: 144, y: 16, w: 32, h: 32 },
      northThreshold: { x: 136, y: 0, w: 48, h: 24 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 0, 48, 8), to: "FC-04", spawn: "south" },
      { rect: rect(136, 184, 48, 8), to: "FC-02", spawn: "south" }
    ],
    enemySpawns: [],
    baseSolids: [
      rect(0, 0, 136, 16),
      rect(184, 0, 136, 16),
      rect(0, 16, 16, 176),
      rect(304, 16, 16, 176),
      rect(32, 16, 32, 128),
      rect(256, 16, 32, 128),
      rect(128, 48, 16, 64),
      rect(176, 48, 16, 64)
    ]
  };

  const fc04 = {
    id: "FC-04",
    name: "Bell-Mourned Marshal Chamber",
    region: "Fenwatch Catacombs",
    size: { w: 320, h: 192 },
    spawns: {
      default: { x: 154, y: 152 },
      south: { x: 154, y: 152 }
    },
    layers: {
      ground: buildFc04Ground(),
      mid: buildFc04Mid(),
      fore: []
    },
    props: {
      landmark: { x: 136, y: 48, w: 48, h: 64 },
      leftRecess: { x: 64, y: 64, w: 32, h: 48 },
      rightScar: { x: 224, y: 64, w: 32, h: 48 },
      northScar: { x: 136, y: 16, w: 48, h: 32 },
      southThreshold: { x: 136, y: 160, w: 48, h: 16 }
    },
    transitions: [
      { rect: rect(136, 184, 48, 8), to: "FC-03", spawn: "north" }
    ],
    enemySpawns: [],
    baseSolids: [
      rect(0, 0, 320, 16),
      rect(0, 16, 16, 176),
      rect(304, 16, 16, 176),
      rect(32, 16, 32, 128),
      rect(256, 16, 32, 128),
      rect(136, 48, 48, 64)
    ]
  };

  window.ElderfieldBenchmarkScreen = bm01;
  window.ElderfieldBenchmarkScreens = {
    [bm01.id]: bm01,
    [bm02.id]: bm02,
    [hv01.id]: hv01,
    [hv02.id]: hv02,
    [hv03.id]: hv03,
    [hv04.id]: hv04,
    [hv05.id]: hv05,
    [hv06.id]: hv06,
    [hv07.id]: hv07,
    [hv09.id]: hv09,
    [cp01.id]: cp01,
    [hv10.id]: hv10,
    [gf01.id]: gf01,
    [gf02.id]: gf02,
    [gf05.id]: gf05,
    [gf06.id]: gf06,
    [gf07.id]: gf07,
    [gf10.id]: gf10,
    [fc01.id]: fc01,
    [fc02.id]: fc02,
    [fc03.id]: fc03,
    [fc04.id]: fc04
  };
})();
