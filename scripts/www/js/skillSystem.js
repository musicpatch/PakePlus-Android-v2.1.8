const SkillSystem={
    init(){
        document.getElementById("p1UseSkill").onclick = ()=>{
            this.useSkill(CONFIG.PLAYER.BLACK);
        };
        document.getElementById("p2UseSkill").onclick = ()=>{
            this.useSkill(CONFIG.PLAYER.WHITE);
        };
    },

    useSkill(playerId){
        if(!GAME_STATE.isPlaying){
            Utils.showToast("游戏未开始！");
            return;
        }
        if(GAME_STATE.currentPlayer !== playerId){
            Utils.showToast("不是你的回合！");
            return;
        }

        const heroState = GAME_STATE.playerConfig[playerId].heroState;
        if(!heroState){
            Utils.showToast("未选择英雄！");
            return;
        }
        if(heroState.remainTimes <= 0){
            Utils.showToast(`技能次数不足！`);
            return;
        }

        const hero = getHeroById(heroState.heroId);
        GAME_STATE.skillTemp.usingSkillPlayer = playerId;
        GAME_STATE.skillTemp.skillType = hero.skillType;

        // 直接进入技能等待，不弹多余确认框
        if(hero.skillType === "remove"){
            Utils.showToast("请点击对手棋子删除！");
        } else if(hero.skillType === "blast"){
            Utils.showToast("请点击棋盘使用爆破！");
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

        if(skillType === "remove"){
            const enemy = playerId === 1 ? 2 : 1;
            if(GAME_STATE.boardData[x][y] === enemy){
                Board.removeChess(x, y);
                heroState.remainTimes -= 1;
                Utils.showToast("拔营成功！");
                ok = true;
            } else {
                Utils.showToast("只能删除对手棋子！");
            }
        }
        else if(skillType === "blast"){
            if(GAME_STATE.boardData[x][y] === 0){
                // 落子
                GAME_STATE.boardData[x][y] = playerId;
                // 爆破 3×3
                for(let dx=-1; dx<=1; dx++){
                    for(let dy=-1; dy<=1; dy++){
                        if(dx===0 && dy===0) continue;
                        const nx = x+dx;
                        const ny = y+dy;
                        if(nx>=0 && nx<CONFIG.BOARD_SIZE && ny>=0 && ny<CONFIG.BOARD_SIZE){
                            GAME_STATE.boardData[nx][ny] = 0;
                        }
                    }
                }
                Board.draw();
                heroState.remainTimes -= 1;
                Utils.showToast("爆破成功！");
                ok = true;

                if(Board.checkWin(x,y)){
                    Utils.showToast(`${playerId===1?"黑棋":"白棋"}获胜！`);
                    GAME_STATE.isPlaying = false;
                    Game.updateButtonState();
                }
            } else {
                Utils.showToast("只能在空位置爆破！");
            }
        }

        Game.updateSkillUI();

        GAME_STATE.skillTemp.usingSkillPlayer = 0;
        GAME_STATE.skillTemp.skillType = "";

        if(ok){
            Game.switchPlayer();
            Game.tryAI();
        }

        return ok;
    },

    // 关羽步数计数（修复点）
    addStep(playerId){
        const h = GAME_STATE.playerConfig[playerId].heroState;
        if(!h) return;
        const hero = getHeroById(h.heroId);
        if(!hero || hero.skillTriggerStep === 0) return;

        h.currentStep++;
        if(h.currentStep >= hero.skillTriggerStep){
            if(h.remainTimes < hero.skillMax){
                h.remainTimes++;
                h.currentStep = 0;
                Utils.showToast(`${hero.name} 技能次数+1`);
                Game.updateSkillUI();
            }
        }
    }
};