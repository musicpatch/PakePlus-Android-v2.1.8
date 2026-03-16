// 全局配置常量
const GAME_CONFIG = {
  cols: 4,          // 棋盘列数
  rows: 5,          // 棋盘行数
  cellSize: 80,     // 单个格子尺寸（px）
  exitPos: {        // 出口位置（底部中间）
    x1: 1, x2: 2,   // 出口覆盖列1-2
    y: 4            // 出口在第4行（最后一行）
  },
  // 棋子类型定义
  pieceTypes: {
    caocao: { w:2, h:2, className: 'piece-caocao', name: '曹操' },
    guan:   { w:2, h:1, className: 'piece-guan',   name: '关羽' },
    zhang:  { w:1, h:2, className: 'piece-zhang',  name: '张飞' },
    huang:  { w:1, h:2, className: 'piece-huang',  name: '黄忠' },
    zhao:   { w:1, h:2, className: 'piece-zhao',   name: '赵云' },
    ma:     { w:1, h:2, className: 'piece-ma',     name: '马超' },
    soldier:{ w:1, h:1, className: 'piece-soldier', name: '小兵' }
  }
};

// 全局游戏状态
let GAME_STATE = {
  step: 0,          // 步数
  time: 0,          // 计时（秒）
  timer: null,      // 计时器
  isPlaying: false, // 是否游戏中（初始为false，点击棋子才改为true）
  pieces: [],       // 棋子数组
  grid: []          // 棋盘网格（标记占位）
};

// 初始化棋盘网格
function initGrid() {
  GAME_STATE.grid = Array(GAME_CONFIG.rows).fill().map(() => Array(GAME_CONFIG.cols).fill(0));
}

// 格式化时间（秒→00:00）
function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// 更新UI（步数+时间）
function updateUI() {
  document.getElementById('step-num').innerText = GAME_STATE.step;
  document.getElementById('time-num').innerText = formatTime(GAME_STATE.time);
}

// 启动计时器
function startTimer() {
  clearInterval(GAME_STATE.timer);
  GAME_STATE.time = 0;
  GAME_STATE.isPlaying = true;
  updateUI();
  GAME_STATE.timer = setInterval(() => {
    if (!GAME_STATE.isPlaying) return;
    GAME_STATE.time++;
    updateUI();
  }, 1000);
}

// 停止计时器
function stopTimer() {
  clearInterval(GAME_STATE.timer);
  GAME_STATE.isPlaying = false;
}

// 重置游戏
function resetGame() {
  stopTimer();
  GAME_STATE.step = 0;
  GAME_STATE.pieces = [];
  // 清空棋盘上的棋子DOM
  document.getElementById('board').querySelectorAll('.piece').forEach(p => p.remove());
  initGrid();
  updateUI();
}

// 占用棋盘格子
function occupyGrid(x, y, w, h, pieceId) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const targetY = y + dy;
      const targetX = x + dx;
      if (targetY >= 0 && targetY < GAME_CONFIG.rows && targetX >= 0 && targetX < GAME_CONFIG.cols) {
        GAME_STATE.grid[targetY][targetX] = pieceId;
      }
    }
  }
}

// 检查目标区域是否为空
function isAreaEmpty(x, y, w, h) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const targetY = y + dy;
      const targetX = x + dx;
      // 检查是否穿墙
      if (targetY < 0 || targetY >= GAME_CONFIG.rows || targetX < 0 || targetX >= GAME_CONFIG.cols) {
        return false;
      }
      // 检查是否重叠
      if (GAME_STATE.grid[targetY][targetX] !== 0) {
        return false;
      }
    }
  }
  return true;
}

// 胜利判定
function checkWin() {
  // 找到曹操棋子
  const caocao = GAME_STATE.pieces.find(p => p.type.name === '曹操');
  if (!caocao) return false;

  const exit = GAME_CONFIG.exitPos;
  // 曹操底部的y坐标
  const caocaoBottomY = caocao.y + caocao.h - 1;
  // 曹操是否覆盖出口的x范围，且底部触碰到出口y位置
  const isXMatch = caocao.x <= exit.x1 && (caocao.x + caocao.w - 1) >= exit.x2;
  const isYMatch = caocaoBottomY >= exit.y;

  if (isXMatch && isYMatch) {
    GAME_STATE.isPlaying = false;
    stopTimer();
    // 延迟300ms提示，让棋子回正
    setTimeout(() => {
      // 替换原生alert为自定义弹窗
      showCustomAlert('🎉 恭喜！曹操已到达出口，游戏胜利！');
    }, 300);
    return true;
  }
  return false;
}

// 新增：自定义弹窗函数（无原生标题，样式更美观）
function showCustomAlert(message) {
  // 先移除已存在的弹窗（避免重复）
  const oldAlert = document.querySelector('.custom-alert');
  if (oldAlert) oldAlert.remove();

  // 创建弹窗DOM
  const alertEl = document.createElement('div');
  alertEl.className = 'custom-alert';
  alertEl.innerHTML = `
    <div class="custom-alert-content">
      <p>${message}</p>
      <button class="custom-alert-btn" onclick="this.closest('.custom-alert').remove()">确定</button>
    </div>
  `;
  // 添加到页面
  document.body.appendChild(alertEl);
}

// 创建棋子DOM并添加到棋盘
function createPiece(type, x, y, pieceId) {
  // 检查目标区域是否可放
  if (!isAreaEmpty(x, y, type.w, type.h)) return false;

  const pieceEl = document.createElement('div');
  pieceEl.classList.add('piece', type.className);
  pieceEl.innerText = type.name;
  // 设置棋子尺寸和位置
  pieceEl.style.width = `${type.w * GAME_CONFIG.cellSize}px`;
  pieceEl.style.height = `${type.h * GAME_CONFIG.cellSize}px`;
  pieceEl.style.left = `${x * GAME_CONFIG.cellSize}px`;
  pieceEl.style.top = `${y * GAME_CONFIG.cellSize}px`;

  // 添加到棋盘
  document.getElementById('board').appendChild(pieceEl);

  // 保存棋子数据到全局
  const pieceData = {
    id: pieceId,
    type: type,
    x: x,
    y: y,
    w: type.w,
    h: type.h,
    el: pieceEl
  };
  GAME_STATE.pieces.push(pieceData);
  // 占用对应格子
  occupyGrid(x, y, type.w, type.h, pieceId);

  return pieceData;
}