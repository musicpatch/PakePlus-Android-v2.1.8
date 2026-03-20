function aiThink() {
    if (!GAME_STATE || !GAME_STATE.isPlaying) return;
    const me = GAME_STATE.currentPlayer;
    const enemy = me === CONFIG.PLAYER.BLACK ? CONFIG.PLAYER.WHITE : CONFIG.PLAYER.BLACK;
    const size = CONFIG.BOARD_SIZE;
    const b = GAME_STATE.boardData;

    const scoreChess = (x, y, p) => {
        let total = 0;
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];
        for (let [dx, dy] of dirs) {
            let left = 0, right = 0;
            let leftBlock = false, rightBlock = false;

            for (let i=1; i<=4; i++) {
                const nx = x - dx*i, ny = y - dy*i;
                if (nx<0||nx>=size||ny<0||ny>=size) {leftBlock=true; break;}
                if (b[nx][ny] === p) left++;
                else if (b[nx][ny] !== 0) {leftBlock=true; break;}
                else break;
            }
            for (let i=1; i<=4; i++) {
                const nx = x + dx*i, ny = y + dy*i;
                if (nx<0||nx>=size||ny<0||ny>=size) {rightBlock=true; break;}
                if (b[nx][ny] === p) right++;
                else if (b[nx][ny] !== 0) {rightBlock=true; break;}
                else break;
            }
            const sum = left + right;
            const open = (leftBlock ? 0 : 1) + (rightBlock ? 0 : 1);

            if (sum >=4) total += open===2 ? 1000000 : 500000;
            else if (sum ===3) total += open===2 ? 100000 : 50000;
            else if (sum ===2) total += open===2 ? 10000 : 5000;
            else if (sum ===1) total += open===2 ? 1000 : 500;
        }
        return total;
    };

    const getValidPoints = () => {
        const points = new Set();
        for (let x=0; x<size; x++) {
            for (let y=0; y<size; y++) {
                if (b[x][y] !== 0) {
                    for (let dx=-1; dx<=1; dx++) {
                        for (let dy=-1; dy<=1; dy++) {
                            const nx = x+dx, ny = y+dy;
                            if (nx>=0&&nx<size&&ny>=0&&ny<size&&b[nx][ny]===0) {
                                points.add(`${nx},${ny}`);
                            }
                        }
                    }
                }
            }
        }
        if (points.size === 0) points.add(`${Math.floor(size/2)},${Math.floor(size/2)}`);
        return Array.from(points).map(s => ({x:parseInt(s.split(',')[0]), y:parseInt(s.split(',')[1])}));
    };

    const validPoints = getValidPoints();
    let best = null, maxScore = -Infinity;

    for (let p of validPoints) {
        const x = p.x, y = p.y;
        b[x][y] = me;
        const myScore = scoreChess(x, y, me);
        b[x][y] = 0;
        b[x][y] = enemy;
        const enemyScore = scoreChess(x, y, enemy) * 1.2;
        b[x][y] = 0;
        const total = myScore + enemyScore;
        if (total > maxScore) {
            maxScore = total;
            best = p;
        }
    }

    if (!best) return;
    setTimeout(()=>{
        if (GAME_STATE.isPlaying && Board.placeChess(best.x, best.y, me)) {
            if (GAME_STATE.currentMode === "skill") SkillSystem.addStep(me);
            if (Board.checkWin(best.x, best.y)) {
                Utils.showToast(`${me===1?"黑棋":"白棋"}胜利！`);
                GAME_STATE.isPlaying = false;
                setTimeout(()=>Game.reset(), 1200);
            } else {
                Game.switchPlayer();
                Game.tryAI();
            }
        }
    }, 300);
}
