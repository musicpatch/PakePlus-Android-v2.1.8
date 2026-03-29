// ---------- 游戏常量 ----------
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;          // 减小格子，适配竖屏

const SHAPES = [
    [[1,1,1,1]],                    // I
    [[1,1,1],[0,1,0]],              // T
    [[1,1,1],[1,0,0]],              // L
    [[1,1,1],[0,0,1]],              // J
    [[1,1],[1,1]],                  // O
    [[0,1,1],[1,1,0]],              // S
    [[1,1,0],[0,1,1]]               // Z
];

const COLORS = [
    '#00FFFF', '#FF00FF', '#FFFF00',
    '#0000FF', '#00FF00', '#FF7F00', '#FF0000'
];

// ---------- DOM 元素 ----------
const boardCanvas = document.getElementById('tetris-board');
const previewCanvas = document.getElementById('preview-canvas');
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('high-score');
const linesSpan = document.getElementById('lines');
const levelSpan = document.getElementById('level');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const rotateBtn = document.getElementById('rotate-btn');
const hardDropBtn = document.getElementById('hard-drop-btn');

// ---------- 游戏状态 ----------
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;
let score = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;
let lines = 0;
let level = 1;
let gameActive = false;      // 游戏是否进行中（未结束）
let isPaused = false;
let dropInterval = 1000;
let lastDropTime = 0;
let animationId = null;

// ---------- Canvas 设置 ----------
function setupCanvases() {
    boardCanvas.width = COLS * BLOCK_SIZE;
    boardCanvas.height = ROWS * BLOCK_SIZE;
    previewCanvas.width = 96;
    previewCanvas.height = 96;
}
setupCanvases();

const boardCtx = boardCanvas.getContext('2d');
const previewCtx = previewCanvas.getContext('2d');

// ---------- 辅助绘图函数 ----------
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    // 网格线
    boardCtx.strokeStyle = '#333';
    for (let y = 0; y <= ROWS; y++) {
        boardCtx.beginPath();
        boardCtx.moveTo(0, y * BLOCK_SIZE);
        boardCtx.lineTo(boardCanvas.width, y * BLOCK_SIZE);
        boardCtx.stroke();
        boardCtx.beginPath();
        boardCtx.moveTo(y * BLOCK_SIZE, 0);
        boardCtx.lineTo(y * BLOCK_SIZE, boardCanvas.height);
        boardCtx.stroke();
    }
    // 固定块
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(boardCtx, x, y, COLORS[board[y][x] - 1]);
            }
        }
    }
    // 当前活动块
    if (currentPiece && gameActive && !isPaused) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(boardCtx, currentPiece.x + x, currentPiece.y + y, COLORS[currentPiece.type]);
                }
            }
        }
    }
}

function drawPreview() {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    if (!nextPiece) return;
    const shape = nextPiece.shape;
    const color = COLORS[nextPiece.type];
    const blockW = previewCanvas.width / 4;
    const blockH = previewCanvas.height / 4;
    const offsetX = (4 - shape[0].length) / 2;
    const offsetY = (4 - shape.length) / 2;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                previewCtx.fillStyle = color;
                previewCtx.fillRect((offsetX + x) * blockW, (offsetY + y) * blockH, blockW - 1, blockH - 1);
                previewCtx.strokeStyle = '#333';
                previewCtx.strokeRect((offsetX + x) * blockW, (offsetY + y) * blockH, blockW - 1, blockH - 1);
            }
        }
    }
}

// ---------- 游戏逻辑 ----------
function createRandomPiece() {
    const type = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[type].map(row => [...row]);
    return {
        x: Math.floor((COLS - shape[0].length) / 2),
        y: 0,
        shape: shape,
        type: type
    };
}

function checkCollision(piece, offX, offY) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offX;
                const newY = piece.y + y + offY;
                if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
                    return true;
                }
                if (newY < 0) return true;
            }
        }
    }
    return false;
}

function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    board[boardY][boardX] = currentPiece.type + 1;
                }
            }
        }
    }
    // 消除满行
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        const points = [0, 40, 100, 300, 1200];
        score += points[linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 80);
        updateUI();
    }
    // 生成下一块
    currentPiece = nextPiece;
    nextPiece = createRandomPiece();
    if (checkCollision(currentPiece, 0, 0)) {
        gameOver();
    }
    updateUI();
}

function gameOver() {
    if (!gameActive) return;
    gameActive = false;
    isPaused = false;
    cancelAnimationFrame(animationId);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetrisHighScore', highScore);
        updateUI();
    }
    alert(`游戏结束！得分: ${score}`);
    startOverlay.style.display = 'flex';
}

function rotatePiece() {
    if (!gameActive || isPaused || !currentPiece) return;
    const oldShape = currentPiece.shape;
    const rotated = oldShape[0].map((_, idx) => oldShape.map(row => row[idx]).reverse());
    const testPiece = { ...currentPiece, shape: rotated };
    if (!checkCollision(testPiece, 0, 0)) {
        currentPiece.shape = rotated;
    } else {
        for (let offset of [-1, 1]) {
            if (!checkCollision(testPiece, offset, 0)) {
                currentPiece.shape = rotated;
                currentPiece.x += offset;
                break;
            }
        }
    }
    drawBoard();
}

function movePiece(dx) {
    if (!gameActive || isPaused || !currentPiece) return;
    if (!checkCollision(currentPiece, dx, 0)) {
        currentPiece.x += dx;
        drawBoard();
    }
}

function hardDrop() {
    if (!gameActive || isPaused || !currentPiece) return;
    while (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
    }
    lockPiece();
    drawBoard();
    drawPreview();
    lastDropTime = performance.now();
}

function stepDown(now) {
    if (!gameActive || isPaused || !currentPiece) return false;
    if (checkCollision(currentPiece, 0, 1)) {
        lockPiece();
        drawBoard();
        drawPreview();
        if (!gameActive) return false;
        lastDropTime = now;
        return true;
    } else {
        currentPiece.y++;
        drawBoard();
        return false;
    }
}

function updateUI() {
    scoreSpan.textContent = score;
    highScoreSpan.textContent = highScore;
    linesSpan.textContent = lines;
    levelSpan.textContent = level;
}

// ---------- 游戏循环 ----------
function gameLoop(timestamp) {
    if (!gameActive || isPaused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    if (timestamp - lastDropTime >= dropInterval) {
        stepDown(timestamp);
        lastDropTime = timestamp;
    }
    drawBoard();
    drawPreview();
    animationId = requestAnimationFrame(gameLoop);
}

// ---------- 开始/重置 ----------
function startNewGame() {
    // 重置所有数据
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    gameActive = true;
    isPaused = false;
    highScore = localStorage.getItem('tetrisHighScore') || 0;
    updateUI();
    currentPiece = createRandomPiece();
    nextPiece = createRandomPiece();
    if (checkCollision(currentPiece, 0, 0)) {
        gameActive = false;
        alert("初始化失败，请重试");
        startOverlay.style.display = 'flex';
        return;
    }
    startOverlay.style.display = 'none';
    lastDropTime = performance.now();
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
    drawBoard();
    drawPreview();
}

// 重置游戏（显示覆盖层）
function resetGame() {
    if (animationId) cancelAnimationFrame(animationId);
    gameActive = false;
    isPaused = false;
    startOverlay.style.display = 'flex';
}

// 暂停/继续（点击画布触发）
function togglePause() {
    if (!gameActive) return;
    isPaused = !isPaused;
    if (!isPaused) {
        lastDropTime = performance.now();
    }
    drawBoard();  // 刷新显示（暂停时隐藏当前块）
}

// ---------- 事件绑定 ----------
startBtn.addEventListener('click', startNewGame);
resetBtn.addEventListener('click', resetGame);

leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movePiece(-1); });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movePiece(1); });
rotateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rotatePiece(); });
hardDropBtn.addEventListener('touchstart', (e) => { e.preventDefault(); hardDrop(); });

// 鼠标支持
leftBtn.addEventListener('mousedown', () => movePiece(-1));
rightBtn.addEventListener('mousedown', () => movePiece(1));
rotateBtn.addEventListener('mousedown', rotatePiece);
hardDropBtn.addEventListener('mousedown', hardDrop);

// 点击游戏板暂停/继续
boardCanvas.addEventListener('click', () => togglePause());

// 键盘支持
document.addEventListener('keydown', (e) => {
    if (!gameActive || isPaused) return;
    switch (e.key) {
        case 'ArrowLeft': movePiece(-1); break;
        case 'ArrowRight': movePiece(1); break;
        case 'ArrowUp': rotatePiece(); break;
        case 'ArrowDown': hardDrop(); break;
        case ' ': case 'Space': togglePause(); e.preventDefault(); break;
    }
});

// 初始化显示
updateUI();
drawBoard();
drawPreview();
startOverlay.style.display = 'flex';
gameActive = false;