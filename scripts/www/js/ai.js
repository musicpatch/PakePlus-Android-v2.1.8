function aiThink() {
    if (!GAME_STATE || !GAME_STATE.isPlaying) return;

    const me = GAME_STATE.currentPlayer;
    const enemy = me === CONFIG.PLAYER_BLACK ? CONFIG.PLAYER_WHITE : CONFIG.PLAYER_BLACK;
    const size = CONFIG.BOARD_SIZE;
    const b = GAME_STATE.boardData;

    const score = (x, y, p) => {
        let s = 0;
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];
        for (let [dx, dy] of dirs) {
            let c = 1, bl = 0, ed = 0;
            for (let i = 1; ; i++) {
                let nx = x+dx*i, ny = y+dy*i;
                if (nx<0||nx>=size||ny<0||ny>=size) break;
                if (b[nx][ny] === p) c++;
                else { bl = b[nx][ny] === 0 ? 1 : 0; break; }
            }
            for (let i = 1; ; i++) {
                let nx = x-dx*i, ny = y-dy*i;
                if (nx<0||nx>=size||ny<0||ny>=size) break;
                if (b[nx][ny] === p) c++;
                else { ed = b[nx][ny] === 0 ? 1 : 0; break; }
            }
            const open = bl + ed;
            if (c >=5) s += 1000000;
            else if (c ===4) s += open ===2 ? 100000 : open ===1 ? 50000 : 0;
            else if (c ===3) s += open ===2 ? 10000 : open ===1 ? 5000 : 0;
            else if (c ===2) s += open ===2 ? 1000 : open ===1 ? 500 : 0;
            else if (c ===1) s += 10;
        }
        return s;
    };

    let best = null, max = -1;
    for (let x=0;x<size;x++){
        for (let y=0;y<size;y++){
            if (b[x][y]!==0) continue;
            b[x][y] = me; const my = score(x,y,me); b[x][y]=0;
            b[x][y] = enemy; const en = score(x,y,enemy); b[x][y]=0;
            const total = my * 1.1 + en;
            if (total > max) { max = total; best = {x,y}; }
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
    }, 500);
}