// 启动经典模式
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
    createPiece(piece.type, piece.x, piece.y, pieceId);
    pieceId++;
  });

  bindPieceDrag();
}

// 绑定棋子拖动事件
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

// 移动棋子
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