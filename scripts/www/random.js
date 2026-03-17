// 启动随机模式
function startRandomMode() {
  resetGame();

  let solvableLayout = null;
  let retryCount = 0;
  const maxRetry = 50;

  while (!solvableLayout && retryCount < maxRetry) {
    retryCount++;
    const randomLayout = generateRandomLayout();
    if (isLayoutSolvable(randomLayout)) {
      solvableLayout = randomLayout;
    }
  }

  if (!solvableLayout) {
    solvableLayout = getClassicLayoutBackup();
  }

  let pieceId = 1;
  solvableLayout.forEach(piece => {
    createPiece(piece.type, piece.x, piece.y, pieceId);
    pieceId++;
  });

  bindPieceDrag();
  console.log(`随机模式生成成功，重试次数：${retryCount}`);
}

// 生成随机布局
function generateRandomLayout() {
  const tempGrid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));
  const layout = [];

  // 曹操位置
  const caoPos = getRandomValidPos(2, 2, tempGrid);
  const caocaoType = { ...GAME_CONFIG.pieceTypes.caocao };
  layout.push({ type: caocaoType, x: caoPos.x, y: caoPos.y });
  occupyTempGrid(caoPos.x, caoPos.y, 2, 2, tempGrid);

  // 五虎将
  const generals = ['guan', 'zhang', 'zhao', 'huang', 'ma'];
  generals.forEach(genName => {
    const isHorizontal = Math.random() > 0.5;
    const genType = { ...GAME_CONFIG.pieceTypes[genName] };
    if (isHorizontal) {
      genType.w = 2;
      genType.h = 1;
    } else {
      genType.w = 1;
      genType.h = 2;
    }
    const genPos = getRandomValidPos(genType.w, genType.h, tempGrid);
    layout.push({ type: genType, x: genPos.x, y: genPos.y });
    occupyTempGrid(genPos.x, genPos.y, genType.w, genType.h, tempGrid);
  });

  // 小兵
  for (let i = 0; i < 4; i++) {
    const soldierType = { ...GAME_CONFIG.pieceTypes.soldier };
    const soldierPos = getRandomValidPos(1, 1, tempGrid);
    layout.push({ type: soldierType, x: soldierPos.x, y: soldierPos.y });
    occupyTempGrid(soldierPos.x, soldierPos.y, 1, 1, tempGrid);
  }

  return layout;
}

// 有解判定
function isLayoutSolvable(layout) {
  const grid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));
  let inversionCount = 0;
  let emptyRowFromBottom = 0;
  const pieceValueMap = {
    caocao: 9, guan: 8, zhang: 7, zhao: 6, huang: 5, ma: 4, soldier: 0
  };
  let soldierIndex = 1;

  layout.forEach(piece => {
    const value = piece.type.name === '小兵' ? soldierIndex++ : pieceValueMap[piece.type.className.split('-')[1]];
    for (let dy = 0; dy < piece.type.h; dy++) {
      for (let dx = 0; dx < piece.type.w; dx++) {
        const y = piece.y + dy;
        const x = piece.x + dx;
        if (y < GAME_CONFIG.rows && x < GAME_CONFIG.cols) {
          grid[y][x] = value;
        }
      }
    }
  });

  const flatGrid = [];
  let emptyPos = { x: 0, y: 0 };
  for (let y = 0; y < GAME_CONFIG.rows; y++) {
    for (let x = 0; x < GAME_CONFIG.cols; x++) {
      flatGrid.push(grid[y][x]);
      if (grid[y][x] === 0) {
        emptyPos = { x, y };
        emptyRowFromBottom = GAME_CONFIG.rows - y;
      }
    }
  }

  for (let i = 0; i < flatGrid.length; i++) {
    if (flatGrid[i] === 0) continue;
    for (let j = i + 1; j < flatGrid.length; j++) {
      if (flatGrid[j] === 0) continue;
      if (flatGrid[i] > flatGrid[j]) inversionCount++;
    }
  }

  return (inversionCount + emptyRowFromBottom) % 2 === 0;
}

// 获取随机有效位置
function getRandomValidPos(w, h, tempGrid) {
  let validPos = null;
  let retry = 0;
  const maxRetry = 100;

  while (!validPos && retry < maxRetry) {
    retry++;
    const x = Math.floor(Math.random() * (GAME_CONFIG.cols - w + 1));
    const y = Math.floor(Math.random() * (GAME_CONFIG.rows - h + 1));
    let isEmpty = true;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (tempGrid[y + dy][x + dx] !== 0) {
          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) break;
    }
    if (isEmpty) validPos = { x, y };
  }

  if (!validPos) {
    validPos = { x: 0, y: 0 };
    outer: for (let y = 0; y < GAME_CONFIG.rows; y++) {
      for (let x = 0; x < GAME_CONFIG.cols; x++) {
        let isEmpty = true;
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            if (y + dy >= GAME_CONFIG.rows || x + dx >= GAME_CONFIG.cols || tempGrid[y + dy][x + dx] !== 0) {
              isEmpty = false;
              break;
            }
          }
          if (!isEmpty) break;
        }
        if (isEmpty) {
          validPos = { x, y };
          break outer;
        }
      }
    }
  }

  return validPos;
}

// 占用临时网格
function occupyTempGrid(x, y, w, h, tempGrid) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (y + dy < GAME_CONFIG.rows && x + dx < GAME_CONFIG.cols) {
        tempGrid[y + dy][x + dx] = 1;
      }
    }
  }
}

// 经典布局兜底
function getClassicLayoutBackup() {
  return [
    { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 1 },
    { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 3, w:2, h:1 },
    { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w:2, h:1 },
    { type: GAME_CONFIG.pieceTypes.huang,  x: 2, y: 0, w:2, h:1 },
    { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 3, w:1, h:2 },
    { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 1, w:1, h:2 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }
  ];
}