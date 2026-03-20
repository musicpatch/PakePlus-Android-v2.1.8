const SkillSystem={
    init(){
        document.getElementById("p1UseSkill").onclick = ()=>{this.useSkill(CONFIG.PLAYER.BLACK);};
        document.getElementById("p2UseSkill").onclick = ()=>{this.useSkill(CONFIG.PLAYER.WHITE);};
        GAME_STATE.skillTemp.fourInARow = {isExist: false, pos: []};
        GAME_STATE.skillTemp.delChess = [];
        GAME_STATE.skillTemp.blockSkill = {player:0, remainRound:0};
        GAME_STATE.skillTemp.blockArea = [];
    },
    getSunQuanPlayerId(){
        const p1Hero = GAME_STATE.playerConfig[1].heroState;
        const p2Hero = GAME_STATE.playerConfig[2].heroState;
        if(p1Hero && p1Hero.heroId === 9) return 1;
        if(p2Hero && p2Hero.heroId === 9) return 2;
        return 0;
    },
    hasSunQuan(){
        return this.getSunQuanPlayerId() !== 0;
    },
    isInBlockArea(x,y,player){
        const enemy = player ===1?2:1;
        return GAME_STATE.skillTemp.blockArea.some(item=>{
            if(item.player !== enemy) return false;
            const dx = Math.abs(x - item.x), dy = Math.abs(y - item.y);
            return dx <=1 && dy <=1;
        });
    },
    recordDelChess(x,y,player){
        GAME_STATE.skillTemp.delChess.push({x,y,player});
    },
    reduceBlockSkillRound(){
        if(GAME_STATE.skillTemp.blockSkill.player ===0) return;
        GAME_STATE.skillTemp.blockSkill.remainRound--;
        if(GAME_STATE.skillTemp.blockSkill.remainRound <=0){
            Utils.showToast(`技能封锁解除！${GAME_STATE.skillTemp.blockSkill.player===1?"黑棋":"白棋"}可正常使用技能`);
            GAME_STATE.skillTemp.blockSkill = {player:0, remainRound:0};
        }
    },
    reduceBlockAreaRound(){
        GAME_STATE.skillTemp.blockArea = GAME_STATE.skillTemp.blockArea.filter(item=>{
            item.round--;
            if(item.round <=0) return false;
            return true;
        });
        if(GAME_STATE.skillTemp.blockArea.length >0){
            Utils.showToast(`区域封锁剩余${GAME_STATE.skillTemp.blockArea[0].round}回合！`);
        }
    },
    // 吕布新技能：3×3清棋（不分敌我，可点击任意位置）
    executeSquareClear(x,y,playerId,heroState){
        this.skillEffect(playerId);
        const board = GAME_STATE.boardData;
        const size = CONFIG.BOARD_SIZE;
        // 清除3×3所有棋子（含中心），记录被删棋子
        for(let dx=-1; dx<=1; dx++){
            for(let dy=-1; dy<=1; dy++){
                const nx = x+dx, ny = y+dy;
                if(nx>=0&&nx<size&&ny>=0&&ny<size){
                    if(board[nx][ny] !==0) this.recordDelChess(nx,ny,board[nx][ny]);
                    board[nx][ny] = 0;
                }
            }
        }
        Board.draw();
        heroState.remainTimes -=1;
        Utils.showToast("方天生效！3×3范围内所有棋子已清除");
        return true;
    },
    useSkill(playerId){
        if(GAME_STATE.skillTemp.blockSkill.player === playerId){
            Utils.showToast(`你被技能封锁，剩余${GAME_STATE.skillTemp.blockSkill.remainRound}回合无法使用技能！`);
            return;
        }
        if(!GAME_STATE.isPlaying){Utils.showToast("游戏未开始！");return;}
        if(GAME_STATE.currentPlayer !== playerId){Utils.showToast("不是你的回合！");return;}
        const heroState = GAME_STATE.playerConfig[playerId].heroState;
        if(!heroState || heroState.remainTimes <= 0){Utils.showToast("技能不可用！");return;}
        const hero = getHeroById(heroState.heroId);
        GAME_STATE.skillTemp.usingSkillPlayer = playerId;
        GAME_STATE.skillTemp.skillType = hero.skillType;

        // 蜀阵营技能
        if(hero.skillType === "double"){
            this.skillEffect(playerId);
            heroState.isDoubleStep = true;
            heroState.remainTimes -= 1;
            Utils.showToast(`开启连下！可连下一手${playerId===1?"黑棋":"白棋"}`);
            Game.updateSkillUI();
            GAME_STATE.skillTemp.usingSkillPlayer = 0;GAME_STATE.skillTemp.skillType = "";
        }else if(hero.skillType === "remove"){
            Utils.showToast("请点击第一颗对手棋子斩除！");
        }else if(hero.skillType === "blast"){
            Utils.showToast("请点击棋盘触发喝阵！");
        }else if(hero.skillType === "clearY"){
            Utils.showToast("请点击棋盘选择行清除（救主）！");
        }
        // 魏阵营技能
        else if(hero.skillType === "coerce"){
            Utils.showToast("请在敌方两子间的单空穴落子（挟令）！");
        }else if(hero.skillType === "clearX"){
            Utils.showToast("请点击棋盘选择行清除（威震）！");
        }else if(hero.skillType === "doubleSep"){
            this.skillEffect(playerId);
            heroState.isDeepStep = true;
            heroState.remainTimes -= 1;
            Utils.showToast(`开启深算！可连放2颗自子（不可相邻）`);
            Game.updateSkillUI();
            GAME_STATE.skillTemp.usingSkillPlayer = 0;GAME_STATE.skillTemp.skillType = "";
        }else if(hero.skillType === "clearAround"){
            Utils.showToast("请点击棋盘落子，清除四周4颗棋子（护主）！");
        }
        // 吴阵营技能
        else if(hero.skillType === "standOff"){
            if(!GAME_STATE.skillTemp.fourInARow.isExist){
                Utils.showToast("对方未形成四子连珠，无法触发鼎峙！");
                GAME_STATE.skillTemp.usingSkillPlayer = 0;GAME_STATE.skillTemp.skillType = "";
                return;
            }
            Utils.showToast("请点击对方四子连珠中第一颗要删除的棋子！");
            heroState.skillTemp.selectCount = 0;
        }else if(hero.skillType === "burnCamp"){
            Utils.showToast("请点击空位置落子，触发烧营清3×3敌方棋子！");
        }else if(hero.skillType === "crossRiver"){
            Utils.showToast("请点击对方1颗棋子转化为己方（不可直接胜利）！");
        }else if(hero.skillType === "bitterFlesh"){
            this.skillEffect(playerId);
            this.executeBitterFlesh(playerId);
            heroState.remainTimes -= 1;
            Game.updateSkillUI();
            GAME_STATE.skillTemp.usingSkillPlayer = 0;GAME_STATE.skillTemp.skillType = "";
        }else if(hero.skillType === "rush"){
            Utils.showToast("请点击空位置落子，清除上下左右敌方棋子（奔袭）！");
        }else if(hero.skillType === "bow"){
            Utils.showToast("请点击空位置落子，清除斜角4颗棋子（烈弓）！");
        }
        // 群雄阵营技能（含吕布新技能）
        else if(hero.skillType === "blockArea"){
            Utils.showToast("请点击空位置落子，触发3×3区域封锁（5回合）！");
        }else if(hero.skillType === "blockSkill"){
            this.skillEffect(playerId);
            const enemy = playerId ===1?2:1;
            GAME_STATE.skillTemp.blockSkill = {player:enemy, remainRound:10};
            heroState.remainTimes -=1;
            Utils.showToast(`擅权生效！对方10回合内无法使用技能！`);
            Game.updateSkillUI();
            GAME_STATE.skillTemp.usingSkillPlayer = 0;GAME_STATE.skillTemp.skillType = "";
        }else if(hero.skillType === "swap"){
            Utils.showToast("请点击空白位置落子，触发3×3棋子互换！");
        }else if(hero.skillType === "resurrect"){
            this.skillEffect(playerId);
            this.executeResurrect(playerId);
            heroState.remainTimes -=1;
            Game.updateSkillUI();
            GAME_STATE.skillTemp.usingSkillPlayer = 0;GAME_STATE.skillTemp.skillType = "";
        }else if(hero.skillType === "squareClear"){// 吕布新技能：优化提示
            Utils.showToast("请点击任意位置（含已有棋子），清除3×3范围内所有棋子（不分敌我）！");
        }
    },
    executeSkill(x, y){
        const playerId = GAME_STATE.skillTemp.usingSkillPlayer;
        const skillType = GAME_STATE.skillTemp.skillType;
        if(playerId === 0 || !skillType) return false;
        const heroState = GAME_STATE.playerConfig[playerId].heroState;
        const hero = getHeroById(heroState.heroId);
        if(!hero) return false;
        let ok = false;
        const enemy = playerId === 1 ? 2 : 1;
        const board = GAME_STATE.boardData;
        const size = CONFIG.BOARD_SIZE;

        // 1. 关羽·斩将
        if(skillType === "remove"){
            if(!heroState.skillTemp.selectCount) heroState.skillTemp.selectCount = 0;
            if(board[x][y] === enemy){
                this.skillEffect(playerId);
                this.recordDelChess(x,y,enemy);
                Board.removeChess(x, y);
                heroState.skillTemp.selectCount++;
                if(heroState.skillTemp.selectCount === 1){
                    Utils.showToast("请点击第二颗对手棋子斩除！");
                    return true;
                }else{
                    heroState.remainTimes -= 1;
                    heroState.skillTemp.selectCount = 0;
                    Utils.showToast("斩将成功！已删除对手2颗棋子");
                    ok = true;
                }
            } else {Utils.showToast("只能斩除对手棋子！");}
        }
        // 2. 张飞·喝阵
        else if(skillType === "blast"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                const placeOk = Board.placeChess(x, y, playerId);
                if(placeOk){
                    for(let dx=-1; dx<=1; dx++){
                        for(let dy=-1; dy<=1; dy++){
                            if(dx===0 && dy===0) continue;
                            const nx = x+dx, ny = y+dy;
                            if(nx>=0&&nx<size&&ny>=0&&ny<size){
                                if(board[nx][ny] !==0) this.recordDelChess(nx,ny,board[nx][ny]);
                                board[nx][ny] = 0;
                            }
                        }
                    }
                    Board.draw();
                    heroState.remainTimes -= 1;
                    Utils.showToast("喝阵成功！");
                    ok = true;
                }
            } else {Utils.showToast("只能在空位置触发喝阵！");}
        }
        // 3. 赵云·救主
        else if(skillType === "clearY"){
            this.skillEffect(playerId);
            for(let nx=0; nx<size; nx++){
                if(board[nx][y] !==0) this.recordDelChess(nx,y,board[nx][y]);
                board[nx][y] = 0;
            }
            Board.draw();
            heroState.remainTimes -= 1;
            Utils.showToast("救主成功！已清除整行棋子");
            ok = true;
        }
        // 4. 曹操·挟令
        else if(skillType === "coerce"){
            if(board[x][y] !== 0){Utils.showToast("仅可在空位置触发挟令！");return false;}
            const hCheck = (x-1>=0 && x+1<size) && board[x-1][y] === enemy && board[x+1][y] === enemy;
            const vCheck = (y-1>=0 && y+1<size) && board[x][y-1] === enemy && board[x][y+1] === enemy;
            if(hCheck || vCheck){
                this.skillEffect(playerId);
                Board.placeChess(x, y, playerId);
                if(hCheck){
                    this.recordDelChess(x-1,y,enemy);this.recordDelChess(x+1,y,enemy);
                    board[x-1][y] = 0; board[x+1][y] = 0;
                }
                if(vCheck){
                    this.recordDelChess(x,y-1,enemy);this.recordDelChess(x,y+1,enemy);
                    board[x][y-1] = 0; board[x][y+1] = 0;
                }
                Board.draw();
                heroState.remainTimes -= 1;
                Utils.showToast("挟令成功！敌方两子已消除");
                ok = true;
            } else {Utils.showToast("非敌方两子间单空穴，无法触发挟令！");}
        }
        // 5. 张辽·威震
        else if(skillType === "clearX"){
            this.skillEffect(playerId);
            for(let ny=0; ny<size; ny++){
                if(board[x][ny] !==0) this.recordDelChess(x,ny,board[x][ny]);
                board[x][ny] = 0;
            }
            Board.draw();
            heroState.remainTimes -= 1;
            Utils.showToast("威震成功！已清除整行棋子");
            ok = true;
        }
        // 6. 许褚·护主
        else if(skillType === "clearAround"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                const placeOk = Board.placeChess(x, y, playerId);
                if(placeOk){
                    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                    dirs.forEach(([dx,dy])=>{
                        const nx = x+dx, ny = y+dy;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size){
                            if(board[nx][ny] !==0) this.recordDelChess(nx,ny,board[nx][ny]);
                            board[nx][ny] = 0;
                        }
                    });
                    Board.draw();
                    heroState.remainTimes -= 1;
                    Utils.showToast("护主成功！四周棋子已清除");
                    ok = true;
                }
            } else {Utils.showToast("只能在空位置落子触发护主！");}
        }
        // 7. 孙权·鼎峙
        else if(skillType === "standOff"){
            const fourInARowPos = GAME_STATE.skillTemp.fourInARow.pos;
            if(board[x][y] !== enemy){
                Utils.showToast("只能删除对方的四子连珠棋子！");
                return false;
            }
            const isInFour = fourInARowPos.some(pos => pos.x === x && pos.y === y);
            if(!isInFour){Utils.showToast("只能删除四子连珠内的棋子！");return false;}
            this.skillEffect(playerId);
            this.recordDelChess(x,y,enemy);
            Board.removeChess(x, y);
            heroState.skillTemp.selectCount++;
            if(heroState.skillTemp.selectCount === 1){
                Utils.showToast("请点击对方四子连珠中第二颗要删除的棋子！");
                return true;
            }else{
                heroState.remainTimes -= 1;
                heroState.skillTemp.selectCount = 0;
                GAME_STATE.skillTemp.fourInARow = {isExist: false, pos: []};
                Utils.showToast("鼎峙成功！已解除对方四子连珠");
                Board.draw();
                ok = true;
            }
        }
        // 8. 周瑜·烧营
        else if(skillType === "burnCamp"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                const placeOk = Board.placeChess(x, y, playerId);
                if(placeOk){
                    for(let dx=-1; dx<=1; dx++){
                        for(let dy=-1; dy<=1; dy++){
                            const nx = x+dx, ny = y+dy;
                            if(nx>=0&&nx<size&&ny>=0&&ny<size && board[nx][ny] === enemy){
                                this.recordDelChess(nx,ny,enemy);
                                board[nx][ny] = 0;
                            }
                        }
                    }
                    Board.draw();
                    heroState.remainTimes -= 1;
                    Utils.showToast("烧营成功！已清除3×3内敌方棋子");
                    ok = true;
                }
            } else {Utils.showToast("只能在空位置落子触发烧营！");}
        }
        // 9. 貂蝉·魅惑
        else if(skillType === "crossRiver"){
            if(board[x][y] === enemy){
                this.skillEffect(playerId);
                const oldVal = board[x][y];
                board[x][y] = playerId;
                const isWin = Board.checkWin(x, y);
                if(isWin){
                    board[x][y] = oldVal;
                    Utils.showToast("转化后将直接胜利，禁止使用该技能！");
                    Board.draw();
                    return false;
                }
                Board.draw();
                heroState.remainTimes -= 1;
                Utils.showToast("魅惑成功！已转化对方1颗棋子为己方");
                ok = true;
            } else {Utils.showToast("只能转化对方的棋子！");}
        }
        // 10. 马超·奔袭
        else if(skillType === "rush"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                const placeOk = Board.placeChess(x, y, playerId);
                if(placeOk){
                    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                    dirs.forEach(([dx,dy])=>{
                        const nx = x+dx, ny = y+dy;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size && board[nx][ny] === enemy){
                            this.recordDelChess(nx,ny,enemy);
                            board[nx][ny] = 0;
                        }
                    });
                    Board.draw();
                    heroState.remainTimes -= 1;
                    Utils.showToast("奔袭成功！已清除上下左右敌方棋子");
                    ok = true;
                }
            } else {Utils.showToast("只能在空位置落子触发奔袭！");}
        }
        // 11. 黄忠·烈弓
        else if(skillType === "bow"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                const placeOk = Board.placeChess(x, y, playerId);
                if(placeOk){
                    const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
                    dirs.forEach(([dx,dy])=>{
                        const nx = x+dx, ny = y+dy;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size){
                            if(board[nx][ny] !==0) this.recordDelChess(nx,ny,board[nx][ny]);
                            board[nx][ny] = 0;
                        }
                    });
                    Board.draw();
                    heroState.remainTimes -= 1;
                    Utils.showToast("烈弓成功！已清除斜角4颗棋子");
                    ok = true;
                }
            } else {Utils.showToast("只能在空位置落子触发烈弓！");}
        }
        // 12. 袁绍·据冀（5回合封锁）
        else if(skillType === "blockArea"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                const placeOk = Board.placeChess(x, y, playerId);
                if(placeOk){
                    GAME_STATE.skillTemp.blockArea.push({x,y,player:playerId,round:5});
                    Board.draw();
                    heroState.remainTimes -= 1;
                    Utils.showToast("据冀成功！3×3范围禁止对方落子5回合");
                    ok = true;
                }
            } else {Utils.showToast("只能在空位置落子触发区域封锁！");}
        }
        // 13. 诸葛亮·妙计
        else if(skillType === "swap"){
            if(board[x][y] === 0){
                this.skillEffect(playerId);
                Board.placeChess(x, y, playerId);
                for(let dx=-1; dx<=1; dx++){
                    for(let dy=-1; dy<=1; dy++){
                        const nx = x+dx, ny = y+dy;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size && (dx!==0||dy!==0)){
                            if(board[nx][ny] === 1) board[nx][ny] = 2;
                            else if(board[nx][ny] === 2) board[nx][ny] = 1;
                        }
                    }
                }
                Board.draw();
                for(let dx=-1; dx<=1; dx++){
                    for(let dy=-1; dy<=1; dy++){
                        const nx = x+dx, ny = y+dy;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size && board[nx][ny] !==0){
                            if(Board.checkWin(nx, ny)){
                                Utils.showToast(`${board[nx][ny]===1?"黑棋":"白棋"}胜利！`);
                                GAME_STATE.isPlaying = false;
                                setTimeout(()=>Game.reset(), 1200);
                            }
                        }
                    }
                }
                heroState.remainTimes -= 1;
                Utils.showToast("妙计成功！3×3范围棋子敌我互换");
                ok = true;
            } else {Utils.showToast("只能在空白位置触发妙计！");}
        }
        // 14. 吕布·方天（新技能：3×3清棋）
        else if(skillType === "squareClear"){
            this.executeSquareClear(x,y,playerId,heroState);
            ok = true;
        }

        GAME_STATE.skillTemp.usingSkillPlayer = 0;
        GAME_STATE.skillTemp.skillType = "";
        if(ok) Game.updateSkillUI();
        return ok;
    },
    // 黄盖·苦肉：随机删对方3颗棋子
    executeBitterFlesh(playerId){
        const enemy = playerId === 1 ? 2 : 1;
        const board = GAME_STATE.boardData;
        const size = CONFIG.BOARD_SIZE;
        const enemyPos = [];
        for(let x=0; x<size; x++){
            for(let y=0; y<size; y++){
                if(board[x][y] === enemy) enemyPos.push({x, y});
            }
        }
        if(enemyPos.length < 3){
            Utils.showToast("敌方棋子不足3颗，苦肉技能失效！");
            return;
        }
        for(let i=0; i<3; i++){
            const randomIdx = Math.floor(Math.random() * enemyPos.length);
            const pos = enemyPos.splice(randomIdx, 1)[0];
            this.recordDelChess(pos.x,pos.y,enemy);
            Board.removeChess(pos.x, pos.y);
        }
        Board.draw();
        Utils.showToast("苦肉成功！已随机删除对方3颗棋子");
    },
    // 华佗·医骨：10次开局机会
    executeResurrect(playerId){
        const board = GAME_STATE.boardData;
        const size = CONFIG.BOARD_SIZE;
        const myDelChess = GAME_STATE.skillTemp.delChess.filter(item=>item.player === playerId);
        if(myDelChess.length === 0){
            Utils.showToast("你无被技能删除的棋子，医骨技能失效！");
            return;
        }
        const emptyPos = [];
        for(let x=0; x<size; x++){
            for(let y=0; y<size; y++){
                if(board[x][y] === 0) emptyPos.push({x,y});
            }
        }
        if(emptyPos.length === 0){
            Utils.showToast("棋盘无空白位置，无法复活棋子！");
            return;
        }
        const randomChess = myDelChess[Math.floor(Math.random() * myDelChess.length)];
        const randomEmpty = emptyPos[Math.floor(Math.random() * emptyPos.length)];
        board[randomEmpty.x][randomEmpty.y] = playerId;
        GAME_STATE.skillTemp.delChess = GAME_STATE.skillTemp.delChess.filter(item=>{
            return !(item.x === randomChess.x && item.y === randomChess.y && item.player === playerId);
        });
        Board.draw();
        if(Board.checkWin(randomEmpty.x, randomEmpty.y)){
            Utils.showToast(`医骨复活成功！${playerId===1?"黑棋":"白棋"}直接胜利！`);
            GAME_STATE.isPlaying = false;
            setTimeout(()=>Game.reset(), 1200);
            return;
        }
        Utils.showToast("医骨成功！已随机复活己方1颗棋子");
    },
    checkFourInARow(){
        const sunQuanId = this.getSunQuanPlayerId();
        if(sunQuanId === 0){
            GAME_STATE.skillTemp.fourInARow = {isExist: false, pos: []};
            return false;
        }
        const checkTarget = sunQuanId === 1 ? 2 : 1;
        const board = GAME_STATE.boardData;
        const size = CONFIG.BOARD_SIZE;
        const dirs = [[1,0],[0,1],[1,1],[1,-1]];
        for(let x=0; x<size; x++){
            for(let y=0; y<size; y++){
                if(board[x][y] !== checkTarget) continue;
                for(let [dx, dy] of dirs){
                    let count = 1;
                    const fourPos = [{x, y}];
                    for(let i=1; i<4; i++){
                        const nx = x + dx*i, ny = y + dy*i;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size && board[nx][ny] === checkTarget){
                            count++;
                            fourPos.push({x:nx, y:ny});
                        }else break;
                    }
                    for(let i=1; i<4 && count <4; i++){
                        const nx = x - dx*i, ny = y - dy*i;
                        if(nx>=0&&nx<size&&ny>=0&&ny<size && board[nx][ny] === checkTarget){
                            count++;
                            fourPos.push({x:nx, y:ny});
                        }else break;
                    }
                    if(count === 4){
                        GAME_STATE.skillTemp.fourInARow = {isExist: true, pos: fourPos};
                        Utils.showToast(`检测到对方四子连珠！可使用孙权鼎峙技能解除`);
                        return true;
                    }
                }
            }
        }
        GAME_STATE.skillTemp.fourInARow = {isExist: false, pos: []};
        return false;
    },
    skillEffect(playerId){
        const board = document.getElementById("chessBoard");
        board.style.animation = "skillFlash 0.8s ease-in-out 2";
        const color = playerId === 1 ? "#0066ff" : "#ff9900";
        board.style.boxShadow = `0 0 15px 5px ${color}`;
        setTimeout(()=>{
            board.style.animation = "";
            board.style.boxShadow = "none";
        }, 1600);
    },
    addStep(playerId){
        const h = GAME_STATE.playerConfig[playerId].heroState;
        if(!h) return;
        const hero = getHeroById(h.heroId);
        if(!hero || hero.skillTriggerStep === 0) return;
        h.currentStep++;
        // 周瑜/吕蒙20步，吕布12步，其他用自身配置
        let triggerStep = hero.skillTriggerStep;
        if(hero.heroId === 10 || hero.heroId ===11) triggerStep =20;
        else if(hero.heroId ===20) triggerStep =12;
        if(h.currentStep >= triggerStep){
            if(h.remainTimes < hero.skillMax){
                h.remainTimes++;
                h.currentStep = 0;
                const tip = `${hero.name} ${hero.skillName}次数+1（可储存）`;
                Utils.showToast(tip);
                Game.updateSkillUI();
            }
        }
        if(this.hasSunQuan()){
            this.checkFourInARow();
        }
    },
    mustUseSkill(playerId){
        if(GAME_STATE.skillTemp.blockSkill.player === playerId) return false;
        const heroState = GAME_STATE.playerConfig[playerId].heroState;
        if(!heroState) return false;
        const hero = getHeroById(heroState.heroId);
        return hero.skillType === "double" && heroState.remainTimes > 0 && GAME_STATE.currentPlayer === playerId;
    },
    isNotAdjacent(x1, y1, x2, y2){
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return !(dx <= 1 && dy <= 1);
    }
};
