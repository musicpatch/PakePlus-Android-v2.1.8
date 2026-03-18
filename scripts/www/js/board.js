const Board={
    init(){
        GAME_STATE.boardData = Array(CONFIG.BOARD_SIZE).fill().map(()=>Array(CONFIG.BOARD_SIZE).fill(0));
        const container = document.querySelector(".chess-board-container");
        const boardWidth = container.clientWidth;
        GAME_STATE.cellSize = boardWidth / (CONFIG.BOARD_SIZE + 1);
        const canvas = document.getElementById("chessBoard");
        canvas.width = boardWidth;
        canvas.height = boardWidth;
        this.draw();
    },

    draw(){
        const canvas = document.getElementById("chessBoard");
        const ctx = canvas.getContext("2d");
        const cellSize = GAME_STATE.cellSize;

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = CONFIG.COLORS.BOARD;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        ctx.strokeStyle = CONFIG.COLORS.GRID;
        ctx.lineWidth = 1;
        for(let i=1; i<=CONFIG.BOARD_SIZE; i++){
            ctx.beginPath();
            ctx.moveTo(cellSize, i*cellSize);
            ctx.lineTo(CONFIG.BOARD_SIZE*cellSize, i*cellSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i*cellSize, cellSize);
            ctx.lineTo(i*cellSize, CONFIG.BOARD_SIZE*cellSize);
            ctx.stroke();
        }

        for(let x=0; x<CONFIG.BOARD_SIZE; x++){
            for(let y=0; y<CONFIG.BOARD_SIZE; y++){
                if(GAME_STATE.boardData[x][y] !== 0){
                    this.drawChess(x, y, GAME_STATE.boardData[x][y]);
                }
            }
        }
    },

    drawChess(x, y, player){
        const canvas = document.getElementById("chessBoard");
        const ctx = canvas.getContext("2d");
        const pos = Utils.boardToScreen(x, y);
        const radius = GAME_STATE.cellSize * CONFIG.CELL_RATIO;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2*Math.PI);
        ctx.fillStyle = player === CONFIG.PLAYER.BLACK ? CONFIG.COLORS.BLACK_CHESS : CONFIG.COLORS.WHITE_CHESS;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
    },

    placeChess(x, y, player){
        if(x < 0 || x >= CONFIG.BOARD_SIZE || y < 0 || y >= CONFIG.BOARD_SIZE){
            return false;
        }
        if(GAME_STATE.boardData[x][y] !== 0){
            return false;
        }

        GAME_STATE.boardData[x][y] = player;
        GAME_STATE.history.push({
            x: x, y: y, player: player,
            isSkill: false,
            player1Hero: JSON.parse(JSON.stringify(GAME_STATE.playerConfig[1].heroState)),
            player2Hero: JSON.parse(JSON.stringify(GAME_STATE.playerConfig[2].heroState))
        });

        this.draw();

        if(this.checkWin(x, y)){
            Utils.showToast(`${player === CONFIG.PLAYER.BLACK ? "黑棋" : "白棋"}获胜！`);
            GAME_STATE.isPlaying = false;
            Game.updateButtonState();
            return true;
        }

        return true;
    },

    removeChess(x, y){
        if(x >=0 && x < CONFIG.BOARD_SIZE && y >=0 && y < CONFIG.BOARD_SIZE){
            GAME_STATE.boardData[x][y] = 0;
            this.draw();
            return true;
        }
        return false;
    },

    checkWin(x, y){
        const player = GAME_STATE.boardData[x][y];
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];

        for(let [dx, dy] of dirs){
            let count = 1;
            for(let i=1; i<5; i++){
                const nx = x + dx*i;
                const ny = y + dy*i;
                if(nx <0 || nx >= CONFIG.BOARD_SIZE || ny <0 || ny >= CONFIG.BOARD_SIZE) break;
                if(GAME_STATE.boardData[nx][ny] === player) count++;
                else break;
            }
            for(let i=1; i<5; i++){
                const nx = x - dx*i;
                const ny = y - dy*i;
                if(nx <0 || nx >= CONFIG.BOARD_SIZE || ny <0 || ny >= CONFIG.BOARD_SIZE) break;
                if(GAME_STATE.boardData[nx][ny] === player) count++;
                else break;
            }
            if(count >=5) return true;
        }
        return false;
    },

    regret(){
        if(GAME_STATE.history.length === 0) return false;
        
        const lastStep = GAME_STATE.history.pop();
        GAME_STATE.boardData[lastStep.x][lastStep.y] = 0;
        GAME_STATE.currentPlayer = lastStep.player;
        
        // 恢复英雄状态
        if(lastStep.player1Hero) GAME_STATE.playerConfig[1].heroState = lastStep.player1Hero;
        if(lastStep.player2Hero) GAME_STATE.playerConfig[2].heroState = lastStep.player2Hero;
        
        this.draw();
        Game.updateSkillUI();
        return true;
    }
};