// AI思考并落子
function aiThink(){
    // 游戏未开始则退出
    if(!GAME_STATE.isPlaying) return;

    const me = GAME_STATE.currentPlayer;
    const enemy = me === CONFIG.PLAYER.BLACK ? CONFIG.PLAYER.WHITE : CONFIG.PLAYER.BLACK;
    const emptyPositions = [];

    // 收集所有空位置
    for(let x=0; x<CONFIG.BOARD_SIZE; x++){
        for(let y=0; y<CONFIG.BOARD_SIZE; y++){
            if(GAME_STATE.boardData[x][y] === 0){
                emptyPositions.push({x:x, y:y});
            }
        }
    }

    // 没有空位置
    if(emptyPositions.length === 0) return;

    // AI策略：1. 优先赢 2. 优先堵 3. 随机落子
    let targetPos = null;

    // 1. 检查自己是否能赢
    for(let pos of emptyPositions){
        // 模拟落子
        GAME_STATE.boardData[pos.x][pos.y] = me;
        if(Board.checkWin(pos.x, pos.y)){
            targetPos = pos;
            GAME_STATE.boardData[pos.x][pos.y] = 0; // 恢复
            break;
        }
        GAME_STATE.boardData[pos.x][pos.y] = 0; // 恢复
    }

    // 2. 检查是否需要堵对手
    if(!targetPos){
        for(let pos of emptyPositions){
            // 模拟对手落子
            GAME_STATE.boardData[pos.x][pos.y] = enemy;
            if(Board.checkWin(pos.x, pos.y)){
                targetPos = pos;
                GAME_STATE.boardData[pos.x][pos.y] = 0; // 恢复
                break;
            }
            GAME_STATE.boardData[pos.x][pos.y] = 0; // 恢复
        }
    }

    // 3. 随机落子
    if(!targetPos){
        targetPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    }

    // AI延迟落子（模拟思考）
    setTimeout(()=>{
        // 执行落子
        if(Board.placeChess(targetPos.x, targetPos.y, me)){
            // ↓↓↓ 这里就是AI加步数的代码 ↓↓↓
            // 技能模式下：给当前AI玩家累计步数（关羽技能用）
            if(GAME_STATE.currentMode === "skill"){
                SkillSystem.addStep(me);
            }
            // ↑↑↑ AI加步数的代码 ↑↑↑
            
            // 切换玩家
            Game.switchPlayer();
            // 检查下一个是否是AI
            Game.tryAI();
        }
    }, 500);
}