// 启动经典模式
function startClassicMode() {
  resetGame(); // 重置游戏状态
  // 经典模式固定棋子布局
  const classicPieces = [
    { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },  // 曹操：2×2
    { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2 },  // 关羽：横2×1
    { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0 },  // 张飞：竖1×2
    { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0 },  // 黄忠：竖1×2
    { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 2 },  // 赵云：竖1×2
    { type: GAME_CONFIG.pieceTypes.ma,     x: 3, y: 2 },  // 马超：竖1×2
    { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },  // 小兵1
    { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 },  // 小兵2
    { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 },  // 小兵3
    { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }   // 小兵4
  ];

  // 创建所有棋子
  let pieceId = 1;
  classicPieces.forEach(piece => {
    const isCreated = createPiece(piece.type, piece.x, piece.y, pieceId);
    if (isCreated) pieceId++;
  });

  // 绑定滑动事件
  bindPieceDrag();
}

// 绑定棋子滑动事件
function bindPieceDrag() {
  let startX, startY; // 滑动起始坐标
  let currentPiece;   // 当前选中的棋子
  let isDragging = false; // 标记是否正在拖动

  // 遍历所有棋子绑定事件
  GAME_STATE.pieces.forEach(piece => {
    // 触摸开始（移动端）
    piece.el.ontouchstart = (e) => {
      // 首次点击棋子，启动计时器
      if (!GAME_STATE.isPlaying) {
        startTimer();
      }
      isDragging = true;
      currentPiece = piece;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      // 选中样式
      piece.el.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
      piece.el.style.opacity = '0.9';
    };

    // 鼠标按下（PC端）
    piece.el.onmousedown = (e) => {
      // 首次点击棋子，启动计时器
      if (!GAME_STATE.isPlaying) {
        startTimer();
      }
      isDragging = true;
      currentPiece = piece;
      startX = e.clientX;
      startY = e.clientY;
      piece.el.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
      piece.el.style.opacity = '0.9';
    };

    // 触摸移动（移动端）
    piece.el.ontouchmove = (e) => {
      if (!isDragging || !currentPiece || !GAME_STATE.isPlaying) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      currentPiece.el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    // 鼠标移动（PC端）
    piece.el.onmousemove = (e) => {
      if (!isDragging || !currentPiece || !GAME_STATE.isPlaying) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      currentPiece.el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    // 触摸结束（移动端）
    piece.el.ontouchend = (e) => {
      handleDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    // 鼠标松开（PC端）
    piece.el.onmouseup = (e) => {
      handleDragEnd(e.clientX, e.clientY);
    };

    // 取消拖动
    piece.el.ontouchcancel = () => resetDragState();
    piece.el.onmouseleave = () => { if (isDragging) resetDragState(); };
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

  // 处理滑动结束逻辑
  function handleDragEnd(endX, endY) {
    if (!currentPiece || !GAME_STATE.isPlaying) {
      resetDragState();
      return;
    }

    // 清除样式
    currentPiece.el.style.transform = '';
    currentPiece.el.style.boxShadow = '';
    currentPiece.el.style.opacity = '';

    // 计算滑动偏移
    const dx = endX - startX;
    const dy = endY - startY;
    let targetX = currentPiece.x;
    let targetY = currentPiece.y;

    // 判定滑动方向（15px阈值）
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平滑动
      targetX = dx > 15 ? currentPiece.x + 1 : (dx < -15 ? currentPiece.x - 1 : currentPiece.x);
    } else {
      // 垂直滑动
      targetY = dy > 15 ? currentPiece.y + 1 : (dy < -15 ? currentPiece.y - 1 : currentPiece.y);
    }

    // 移动棋子
    movePiece(currentPiece, targetX, targetY);
    // 清空状态
    resetDragState();
  }
}

// 移动棋子
function movePiece(piece, targetX, targetY) {
  // 位置没变化，直接返回
  if (targetX === piece.x && targetY === piece.y) return;

  // 1. 清空旧位置
  for (let dy = 0; dy < piece.h; dy++) {
    for (let dx = 0; dx < piece.w; dx++) {
      const oldY = piece.y + dy;
      const oldX = piece.x + dx;
      if (oldY >= 0 && oldY < GAME_CONFIG.rows && oldX >= 0 && oldX < GAME_CONFIG.cols) {
        GAME_STATE.grid[oldY][oldX] = 0;
      }
    }
  }

  // 2. 检查新位置是否可放
  if (!isAreaEmpty(targetX, targetY, piece.w, piece.h)) {
    // 不可放，恢复旧位置
    occupyGrid(piece.x, piece.y, piece.w, piece.h, piece.id);
    // 震动反馈
    piece.el.style.animation = 'shake 0.2s ease';
    setTimeout(() => { piece.el.style.animation = ''; }, 200);
    return;
  }

  // 3. 可放，更新位置
  piece.x = targetX;
  piece.y = targetY;
  // 平滑移动动画
  piece.el.style.transition = 'left 0.15s ease, top 0.15s ease';
  piece.el.style.left = `${targetX * GAME_CONFIG.cellSize}px`;
  piece.el.style.top = `${targetY * GAME_CONFIG.cellSize}px`;
  // 占用新位置
  occupyGrid(targetX, targetY, piece.w, piece.h, piece.id);

  // 4. 重置过渡
  setTimeout(() => { piece.el.style.transition = ''; }, 150);

  // 5. 更新步数+检查胜利
  GAME_STATE.step++;
  updateUI();
  checkWin();
}

// 震动动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
    75% { transform: translateX(-3px); }
    100% { transform: translateX(0); }
  }
`;
document.head.appendChild(style);