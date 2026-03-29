// 通用工具函数
function $(id) { return document.getElementById(id); }
function clearBoard() {
  const board = $("board");
  board.innerHTML = ""; // 清空棋盘DOM
}

// 全局新增：保存当前布局的初始状态
let INITIAL_LAYOUT = null;

// 更新UI
function updateUI() {
  $("step-num").innerText = GAME_STATE.step;
  $("level-num").innerText = GAME_STATE.currentLevel;
  // 格式化时间
  const m = String(Math.floor(GAME_STATE.time / 60)).padStart(2, "0");
  const s = String(GAME_STATE.time % 60).padStart(2, "0");
  $("time-num").innerText = `${m}:${s}`;
  $("tip-text").innerText = LEVELS[GAME_STATE.currentLevel]?.tip || "华容道";
}

// 启动计时器
function startTimer() {
  if (GAME_STATE.timer) clearInterval(GAME_STATE.timer);
  GAME_STATE.isPlaying = true;
  GAME_STATE.timer = setInterval(() => {
    GAME_STATE.time++;
    updateUI();
  }, 1000);
}

// 重置游戏（保留原有逻辑，新增记录初始布局参数）
function resetGame(needRecordLayout = true) {
  // 清空原有状态
  GAME_STATE.pieces = [];
  GAME_STATE.step = 0;
  GAME_STATE.time = 0;
  GAME_STATE.isPlaying = false;
  clearInterval(GAME_STATE.timer);
  
  // 核心：初始化网格
  GAME_STATE.grid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));
  
  // 清空棋盘DOM
  clearBoard();
  // 更新UI
  updateUI();

  // 如果需要记录初始布局，先清空原有记录
  if (needRecordLayout) {
    INITIAL_LAYOUT = null;
  }
}

// 新增：保存初始布局（棋子位置）
function saveInitialLayout() {
  INITIAL_LAYOUT = GAME_STATE.pieces.map(piece => ({
    type: piece.type,
    x: piece.x,
    y: piece.y,
    w: piece.w,
    h: piece.h
  }));
}

// 新增：恢复初始布局（核心复原逻辑）
function restoreInitialLayout() {
  if (!INITIAL_LAYOUT) return;

  // 暂停游戏（避免拖动冲突）
  const wasPlaying = GAME_STATE.isPlaying;
  GAME_STATE.isPlaying = false;
  clearInterval(GAME_STATE.timer);

  // 清空棋盘和网格
  clearBoard();
  GAME_STATE.pieces = [];
  GAME_STATE.grid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));

  // 重新创建初始布局的棋子
  let pieceId = 1;
  INITIAL_LAYOUT.forEach(piece => {
    createPiece(piece.type, piece.x, piece.y, pieceId, piece.w, piece.h);
    pieceId++;
  });

  // 重新绑定拖动事件
  bindPieceDrag();

  // 恢复游戏状态（步数/时间不变，仅恢复位置）
  GAME_STATE.isPlaying = wasPlaying;
  if (wasPlaying) {
    startTimer();
  }
  updateUI();
}

// 创建棋子（原有逻辑不变）
function createPiece(type, x, y, id, w, h) {
  const pieceW = w || type.w;
  const pieceH = h || type.h;
  
  // 创建棋子DOM
  const el = document.createElement("div");
  el.className = `piece w${pieceW} h${pieceH}`;
  el.style.left = `${x * GAME_CONFIG.cellSize}px`;
  el.style.top = `${y * GAME_CONFIG.cellSize}px`;
  el.style.backgroundColor = type.color;
  el.innerText = type.name;
  
  // 棋子数据对象
  const piece = {
    id: id,
    type: type,
    x: x,
    y: y,
    w: pieceW,
    h: pieceH,
    el: el
  };
  
  // 添加到棋盘
  $("board").appendChild(el);
  // 添加到状态
  GAME_STATE.pieces.push(piece);
  // 占用网格
  occupyGrid(x, y, pieceW, pieceH, id);
  
  return piece;
}

// 占用网格（原有逻辑不变）
function occupyGrid(x, y, w, h, id) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const gridY = y + dy;
      const gridX = x + dx;
      if (gridY >= 0 && gridY < GAME_CONFIG.rows && gridX >= 0 && gridX < GAME_CONFIG.cols) {
        GAME_STATE.grid[gridY][gridX] = id;
      }
    }
  }
}

// 检查区域是否为空（原有逻辑不变）
function isAreaEmpty(x, y, w, h) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const gridY = y + dy;
      const gridX = x + dx;
      // 超出边界
      if (gridY < 0 || gridY >= GAME_CONFIG.rows || gridX < 0 || gridX >= GAME_CONFIG.cols) {
        return false;
      }
      // 已有棋子
      if (GAME_STATE.grid[gridY][gridX] !== 0) {
        return false;
      }
    }
  }
  return true;
}

// 检查胜利（原有逻辑不变）
function checkWin() {
  // 找到曹操
  const caocao = GAME_STATE.pieces.find(p => p.type.name === "曹操");
  if (!caocao) return false;
  
  const exit = GAME_CONFIG.exitPos;
  // 曹操底部到达出口行
  const caoBottomY = caocao.y + caocao.h - 1;
  // 曹操覆盖出口列
  const coverExitX = caocao.x <= exit.x1 && (caocao.x + caocao.w - 1) >= exit.x2;
  
  if (caoBottomY === exit.y && coverExitX) {
    // 通关
    GAME_STATE.isPlaying = false;
    clearInterval(GAME_STATE.timer);
    // 显示通关提示
    showAlert("恭喜通关", `第${GAME_STATE.currentLevel}关\n步数：${GAME_STATE.step}\n用时：${$("time-num").innerText}`);
    // 标记通关
    if (!GAME_STATE.passedLevels.includes(GAME_STATE.currentLevel)) {
      GAME_STATE.passedLevels.push(GAME_STATE.currentLevel);
    }
    return true;
  }
  return false;
}

// 显示弹窗（原有逻辑不变）
function showAlert(title, content) {
  $("alert-title").innerText = title;
  $("alert-content").innerText = content;
  $("customAlert").style.display = "flex";
}

// 启动经典模式（新增保存初始布局）
function startClassicMode() {
  resetGame();
  const classicPieces = [
    { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
    { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2 },
    { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0 },
    { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0 },
    { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 2 },
    { type: GAME_CONFIG.pieceTypes.ma,     x: 3, y: 2 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }
  ];

  let pieceId = 1;
  classicPieces.forEach(piece => {
    createPiece(piece.type, piece.x, piece.y, pieceId, piece.w, piece.h);
    pieceId++;
  });

  // 保存经典模式初始布局
  saveInitialLayout();
  bindPieceDrag();
}

// 绑定棋子拖动事件（原有逻辑不变）
function bindPieceDrag() {
  let startX, startY;
  let currentPiece;
  let isDragging = false;

  GAME_STATE.pieces.forEach(piece => {
    // 触摸/鼠标按下
    piece.el.ontouchstart = piece.el.onmousedown = (e) => {
      if (!GAME_STATE.isPlaying) startTimer();
      isDragging = true;
      currentPiece = piece;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
      piece.el.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
      piece.el.style.opacity = '0.9';
    };

    // 触摸/鼠标移动
    piece.el.ontouchmove = piece.el.onmousemove = (e) => {
      if (!isDragging || !currentPiece || !GAME_STATE.isPlaying) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      currentPiece.el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    // 触摸/鼠标松开
    piece.el.ontouchend = piece.el.onmouseup = (e) => {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      handleDragEnd(clientX, clientY);
    };

    // 取消拖动
    piece.el.ontouchcancel = piece.el.onmouseleave = () => resetDragState();
  });

  // 重置拖动状态
  function resetDragState() {
    if (currentPiece) {
      currentPiece.el.style.transform = '';
      currentPiece.el.style.boxShadow = '';
      currentPiece.el.style.opacity = '';
    }
    isDragging = false;
    currentPiece = null;
  }

  // 处理拖动结束
  function handleDragEnd(endX, endY) {
    if (!currentPiece || !GAME_STATE.isPlaying) {
      resetDragState();
      return;
    }

    currentPiece.el.style.transform = '';
    currentPiece.el.style.boxShadow = '';
    currentPiece.el.style.opacity = '';

    const dx = endX - startX;
    const dy = endY - startY;
    let targetX = currentPiece.x;
    let targetY = currentPiece.y;

    // 判定拖动方向（15px阈值）
    if (Math.abs(dx) > Math.abs(dy)) {
      targetX = dx > 15 ? currentPiece.x + 1 : (dx < -15 ? currentPiece.x - 1 : currentPiece.x);
    } else {
      targetY = dy > 15 ? currentPiece.y + 1 : (dy < -15 ? currentPiece.y - 1 : currentPiece.y);
    }

    movePiece(currentPiece, targetX, targetY);
    resetDragState();
  }
}

// 移动棋子（原有逻辑不变）
function movePiece(piece, targetX, targetY) {
  if (targetX === piece.x && targetY === piece.y) return;

  // 清空旧位置
  for (let dy = 0; dy < piece.h; dy++) {
    for (let dx = 0; dx < piece.w; dx++) {
      const oldY = piece.y + dy;
      const oldX = piece.x + dx;
      if (oldY >= 0 && oldY < GAME_CONFIG.rows && oldX >= 0 && oldX < GAME_CONFIG.cols) {
        GAME_STATE.grid[oldY][oldX] = 0;
      }
    }
  }

  // 检查新位置
  if (!isAreaEmpty(targetX, targetY, piece.w, piece.h)) {
    occupyGrid(piece.x, piece.y, piece.w, piece.h, piece.id);
    piece.el.style.animation = 'shake 0.2s ease';
    setTimeout(() => { piece.el.style.animation = ''; }, 200);
    return;
  }

  // 更新位置
  piece.x = targetX;
  piece.y = targetY;
  piece.el.style.transition = 'left 0.15s ease, top 0.15s ease';
  piece.el.style.left = `${targetX * GAME_CONFIG.cellSize}px`;
  piece.el.style.top = `${targetY * GAME_CONFIG.cellSize}px`;
  occupyGrid(targetX, targetY, piece.w, piece.h, piece.id);

  setTimeout(() => { piece.el.style.transition = ''; }, 150);

  // 更新步数+检查胜利
  GAME_STATE.step++;
  updateUI();
  checkWin();
}

// 启动随机模式（新增保存初始布局）
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
    createPiece(piece.type, piece.x, piece.y, pieceId, piece.w, piece.h);
    pieceId++;
  });

  // 保存随机模式初始布局
  saveInitialLayout();
  bindPieceDrag();
  console.log(`随机模式生成成功，重试次数：${retryCount}`);
}

// 生成随机布局（原有逻辑不变）
function generateRandomLayout() {
  const tempGrid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));
  const layout = [];

  // 曹操位置
  const caoPos = getRandomValidPos(2, 2, tempGrid);
  const caocaoType = { ...GAME_CONFIG.pieceTypes.caocao };
  layout.push({ type: caocaoType, x: caoPos.x, y: caoPos.y, w:2, h:2 });
  occupyTempGrid(caoPos.x, caoPos.y, 2, 2, tempGrid);

  // 五虎将
  const generals = ['guan', 'zhang', 'zhao', 'huang', 'ma'];
  generals.forEach(genName => {
    const isHorizontal = Math.random() > 0.5;
    const genType = { ...GAME_CONFIG.pieceTypes[genName] };
    let w, h;
    if (isHorizontal) {
      w = 2;
      h = 1;
    } else {
      w = 1;
      h = 2;
    }
    const genPos = getRandomValidPos(w, h, tempGrid);
    layout.push({ type: genType, x: genPos.x, y: genPos.y, w: w, h: h });
    occupyTempGrid(genPos.x, genPos.y, w, h, tempGrid);
  });

  // 小兵
  for (let i = 0; i < 4; i++) {
    const soldierType = { ...GAME_CONFIG.pieceTypes.soldier };
    const soldierPos = getRandomValidPos(1, 1, tempGrid);
    layout.push({ type: soldierType, x: soldierPos.x, y: soldierPos.y, w:1, h:1 });
    occupyTempGrid(soldierPos.x, soldierPos.y, 1, 1, tempGrid);
  }

  return layout;
}

// 有解判定（原有逻辑不变）
function isLayoutSolvable(layout) {
  const grid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));
  let inversionCount = 0;
  let emptyRowFromBottom = 0;
  const pieceValueMap = {
    "曹操": 9, 
    "关羽": 8, 
    "张飞": 7, 
    "赵云": 6, 
    "黄忠": 5, 
    "马超": 4, 
    "小兵": 0
  };
  let soldierIndex = 1;

  layout.forEach(piece => {
    const pieceName = piece.type.name;
    const value = pieceName === '小兵' ? soldierIndex++ : pieceValueMap[pieceName];
    for (let dy = 0; dy < piece.h || dy < piece.type.h; dy++) {
      for (let dx = 0; dx < piece.w || dx < piece.type.w; dx++) {
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

// 获取随机有效位置（原有逻辑不变）
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

// 占用临时网格（原有逻辑不变）
function occupyTempGrid(x, y, w, h, tempGrid) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (y + dy < GAME_CONFIG.rows && x + dx < GAME_CONFIG.cols) {
        tempGrid[y + dy][x + dx] = 1;
      }
    }
  }
}

// 经典布局兜底（原有逻辑不变）
function getClassicLayoutBackup() {
  return [
    { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
    { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2, w:2, h:1 },
    { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w:1, h:2 },
    { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w:1, h:2 },
    { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 2, w:1, h:2 },
    { type: GAME_CONFIG.pieceTypes.ma,     x: 3, y: 2, w:1, h:2 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 },
    { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }
  ];
}

// 启动闯关模式（新增保存初始布局）
function startLevelMode(level) {
  resetGame();
  GAME_STATE.currentLevel = level;
  
  const levelData = LEVELS[level];
  if (!levelData) {
    showAlert("提示", "该关卡暂未解锁");
    startClassicMode();
    return;
  }

  let pieceId = 1;
  levelData.pieces.forEach(piece => {
    createPiece(piece.type, piece.x, piece.y, pieceId, piece.w, piece.h);
    pieceId++;
  });

  // 保存闯关模式初始布局
  saveInitialLayout();
  bindPieceDrag();
  updateUI();
}

// 初始化事件绑定（新增复原按钮点击事件）
function initEvent() {
  // 模式切换
  $("btn-random").onclick = () => {
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    $("btn-random").classList.add("active");
    startRandomMode(); // 随机模式会重建棋盘 → 不会空白
  };

  $("btn-level").onclick = () => {
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    $("btn-level").classList.add("active");
    startLevelMode(GAME_STATE.currentLevel); // 闯关会加载当前关 → 不会空白
  };

  // ===== 新增：复原按钮点击事件 =====
  $("btn-reset-layout").onclick = () => {
    if (!INITIAL_LAYOUT) {
      showAlert("提示", "暂无可复原的布局");
      return;
    }
    restoreInitialLayout();
  };

  // 提示按钮点击事件（修复后）
  $("btn-show-tip").onclick = () => {
    const tipContent = `华容道游戏规则：
1. 核心目标：将2×2大小的「曹操」方块移动到棋盘下方的出口位置；
2. 移动规则：所有棋子仅可水平/垂直移动，不可斜向或重叠；
3. 辅助棋子：关羽（2×1）、张飞/赵云等（1×2）、小兵（1×1）可辅助腾出移动空间；
4. 通关技巧：尽量减少移动步数，优先为曹操方块腾出向下的路径。

作者邮箱：280024205@qq.com`;
    // 先关闭已有弹窗，避免冲突
    $("customAlert").style.display = "none";
    // 显示提示弹窗
    showAlert("华容道规则提示", tipContent);
    // 阻止事件冒泡，避免触发其他逻辑
    return false;
  };

  // 弹窗关闭（修复后）
  $("alert-ok").onclick = () => {
    const alertTitle = $("alert-title").innerText;
    $("customAlert").style.display = "none";

    // 仅通关/全部通关弹窗触发下一关逻辑，提示弹窗不触发
    if (alertTitle === "恭喜通关" || alertTitle === "全部通关") {
      if ($("btn-level").classList.contains("active")) {
        const nextLevel = GAME_STATE.currentLevel + 1;
        if (LEVELS[nextLevel]) {
          startLevelMode(nextLevel);
        } else {
          // 全部通关后仅提示，不重复触发
          showAlert("全部通关", "已通关所有关卡！");
        }
      } else if ($("btn-random").classList.contains("active")) {
        startRandomMode();
      } else {
        startClassicMode();
      }
    }
    // 提示弹窗仅关闭，无任何额外操作
  };

  // 选关面板
  $("btn-select-level").onclick = () => {
    buildLevelGrid();
    $("levelMask").style.display = "flex";
  };

  $("level-close").onclick = () => {
    $("levelMask").style.display = "none";
  };
}

// 构建选关网格（原有逻辑不变）
function buildLevelGrid() {
  const grid = $("level-grid");
  grid.innerHTML = "";

  // 遍历所有关卡
  for (let i = 1; i <= Object.keys(LEVELS).length; i++) {
    const btn = document.createElement("button");
    btn.className = "level-item";
    if (i === GAME_STATE.currentLevel) btn.classList.add("current");
    if (GAME_STATE.passedLevels.includes(i)) btn.classList.add("passed");
    btn.innerText = i;

    btn.onclick = () => {
      startLevelMode(i);
      $("levelMask").style.display = "none";
      document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
      $("btn-level").classList.add("active");
    };

    grid.appendChild(btn);
  }
}

// 页面加载完成初始化（原有逻辑不变）
window.onload = () => {
  // 初始化样式（抖动动画）
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
  `;
  document.head.appendChild(style);

  // 初始化事件
  initEvent();
  // 默认启动第一关
  startLevelMode(1);
};