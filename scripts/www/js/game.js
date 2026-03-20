const Game={
    init(){
        // 确保Board和SkillSystem已初始化
        if(!Board || !SkillSystem) {
            Utils.showToast("游戏初始化失败，请刷新页面重试！");
            return;
        }
        Board.init();
        SkillSystem.init();
        this.bindEvents();
        this.initHeroSelect(); 
        this.updateButtonState();
        this.updateSkillUI();
        this.updateConfigLock();
    },
    initHeroSelect(){
        const firstHeroSelect = document.getElementById("firstHeroSelect");
        const firstHeroDesc = document.getElementById("firstHeroDesc");
        const secondHeroSelect = document.getElementById("secondHeroSelect");
        const secondHeroDesc = document.getElementById("secondHeroDesc");
        firstHeroSelect.innerHTML = "";
        secondHeroSelect.innerHTML = "";
        
        // 兼容边界：如果HERO_LIB为空，不进行遍历
        if(!HERO_LIB || HERO_LIB.length === 0){
            firstHeroDesc.textContent = "无可用英雄";
            secondHeroDesc.textContent = "无可用英雄";
            return;
        }
        
        HERO_LIB.forEach(hero => {
            const option = document.createElement("option");
            option.value = hero.id;
            option.textContent = hero.name; 
            option.dataset.skillDesc = hero.skillDesc;
            firstHeroSelect.appendChild(option);
        });
        firstHeroSelect.onchange = ()=>{
            if(GAME_STATE.isPlaying) return;
            const selectedId = parseInt(firstHeroSelect.value);
            const selectedHero = getHeroById(selectedId);
            firstHeroDesc.textContent = selectedHero ? selectedHero.skillDesc : "无技能描述";
            
            secondHeroSelect.innerHTML = "";
            const unselectedHeroes = getUnselectedHeroes([selectedId]);
            unselectedHeroes.forEach(hero => {
                const option = document.createElement("option");
                option.value = hero.id;
                option.textContent = hero.name;
                option.dataset.skillDesc = hero.skillDesc;
                secondHeroSelect.appendChild(option);
            });
            secondHeroSelect.disabled = unselectedHeroes.length === 0 || GAME_STATE.isPlaying;
            if(unselectedHeroes.length > 0){
                secondHeroSelect.selectedIndex = 0;
                const defaultHero = getHeroById(parseInt(secondHeroSelect.value));
                secondHeroDesc.textContent = defaultHero ? defaultHero.skillDesc : "无技能描述";
            } else {
                secondHeroDesc.textContent = "无可用英雄";
            }
        };
        secondHeroSelect.onchange = ()=>{
            if(GAME_STATE.isPlaying || secondHeroSelect.options.length === 0) return;
            const selectedId = parseInt(secondHeroSelect.value);
            const selectedHero = getHeroById(selectedId);
            secondHeroDesc.textContent = selectedHero ? selectedHero.skillDesc : "无技能描述";
        };
        // 初始化默认选中第一个英雄
        if(HERO_LIB.length > 0){
            firstHeroSelect.selectedIndex = 0;
            const defaultHero = getHeroById(parseInt(firstHeroSelect.value));
            firstHeroDesc.textContent = defaultHero ? defaultHero.skillDesc : "无技能描述";
            firstHeroSelect.onchange();
        }
    },
    bindEvents(){
        // 绑定模式切换事件
        document.getElementById("traditionalMode").onclick = ()=>{
            if(!GAME_STATE.isPlaying){
                GAME_STATE.currentMode = "traditional";
                document.getElementById("traditionalMode").classList.add("active");
                document.getElementById("skillMode").classList.remove("active");
                document.getElementById("heroSelectRow").style.display = "none";
                document.getElementById("skillStateContainer").style.display = "none";
                this.reset();
            }
        };
        document.getElementById("skillMode").onclick = ()=>{
            if(!GAME_STATE.isPlaying){
                GAME_STATE.currentMode = "skill";
                document.getElementById("skillMode").classList.add("active");
                document.getElementById("traditionalMode").classList.remove("active");
                document.getElementById("heroSelectRow").style.display = "block";
                document.getElementById("skillStateContainer").style.display = "block";
                this.reset();
            }
        };
        // 绑定开始游戏事件
        document.getElementById("startGame").onclick = ()=>{
            this.reset();
            if(GAME_STATE.currentMode === "skill"){
                const firstHeroId = parseInt(document.getElementById("firstHeroSelect").value);
                const secondHeroId = parseInt(document.getElementById("secondHeroSelect").value);
                if(isNaN(firstHeroId) || isNaN(secondHeroId)){
                    Utils.showToast("请选择有效英雄！");
                    return;
                }
                GAME_STATE.playerConfig[1].heroState = initHeroSkillState(firstHeroId);
                GAME_STATE.playerConfig[2].heroState = initHeroSkillState(secondHeroId);
            }else{
                GAME_STATE.playerConfig[1].heroState = null;
                GAME_STATE.playerConfig[2].heroState = null;
            }
            GAME_STATE.isPlaying = true;
            this.updateButtonState();
            this.updateSkillUI();
            this.updateConfigLock();
            this.tryAI();
        };
        // 绑定投降事件
        document.getElementById("pauseGame").onclick = ()=>{
            if(GAME_STATE.isPlaying){
                GAME_STATE.isPlaying = false;
                Utils.showToast("你已认输，游戏结束！");
                this.reset();
                this.updateConfigLock();
            }
        };
        // 绑定悔步事件
        document.getElementById("regretStep").onclick = ()=>{
            if(Board.regret()){
                setTimeout(()=>Game.tryAI(), 100);
            }
        };
        // 绑定棋盘点击事件
        document.getElementById("chessBoard").onclick = (e)=>{
            this.handleBoardClick(e);
        };
        // 绑定玩家类型选择事件
        document.getElementById("p1_type").onchange = (e)=>{
            if(!GAME_STATE.isPlaying){
                GAME_STATE.playerConfig[1].type = e.target.value;
            }
        };
        document.getElementById("p2_type").onchange = (e)=>{
            if(!GAME_STATE.isPlaying){
                GAME_STATE.playerConfig[2].type = e.target.value;
            }
        };
    },
    updateConfigLock(){
        const isLocked = GAME_STATE.isPlaying;
        document.getElementById("traditionalMode").disabled = isLocked;
        document.getElementById("skillMode").disabled = isLocked;
        document.getElementById("firstHeroSelect").disabled = isLocked;
        document.getElementById("secondHeroSelect").disabled = isLocked || (document.getElementById("secondHeroSelect").options && document.getElementById("secondHeroSelect").options.length === 0);
        document.getElementById("p1_type").disabled = isLocked;
        document.getElementById("p2_type").disabled = isLocked;
    },
    handleBoardClick(e){
        if(!GAME_STATE.isPlaying) return;
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const boardPos = Utils.screenToBoard(clickX, clickY);
        if(!boardPos || !boardPos.isValid) return;
        const {x, y} = boardPos;
        const currentPlayer = GAME_STATE.currentPlayer;
        const currentPlayerType = GAME_STATE.playerConfig[currentPlayer].type;
        const heroState = GAME_STATE.playerConfig[currentPlayer].heroState;

        // 袁绍区域封锁检测
        if(SkillSystem.isInBlockArea(x,y,currentPlayer)){
            Utils.showToast("该位置被区域封锁，无法落子！");
            return;
        }
        // 1. 技能使用中
        if(GAME_STATE.skillTemp.usingSkillPlayer !== 0){
            const success = SkillSystem.executeSkill(x, y);
            if(success){
                this.updateSkillUI();
                this.updateButtonState();
                this.switchPlayer();
                this.tryAI();
            }
            return;
        }
        // 2. AI回合
        if(currentPlayerType === "ai"){
            Utils.showToast("AI思考中，请稍等！");
            return;
        }
        // 3. 刘备/吕蒙 强制使用技能
        if(GAME_STATE.currentMode === "skill" && SkillSystem.mustUseSkill(currentPlayer)){
            Utils.showToast(`请先使用技能！`);
            return;
        }
        // 4. 司马懿·深算逻辑
        if(GAME_STATE.currentMode === "skill" && heroState && heroState.isDeepStep){
            if(GAME_STATE.skillTemp.firstX === null && GAME_STATE.skillTemp.firstY === null){
                if(Board.placeChess(x, y, currentPlayer)){
                    GAME_STATE.skillTemp.firstX = x;
                    GAME_STATE.skillTemp.firstY = y;
                    Utils.showToast("深算第一子已落！请落第二子（不可相邻）");
                    if(GAME_STATE.currentMode === "skill") SkillSystem.addStep(currentPlayer);
                    this.updateSkillUI();
                }else{
                    Utils.showToast("该位置已有棋子，无法落子！");
                }
                return;
            }else{
                const firstX = GAME_STATE.skillTemp.firstX;
                const firstY = GAME_STATE.skillTemp.firstY;
                if(SkillSystem.isNotAdjacent(firstX, firstY, x, y)){
                    if(Board.placeChess(x, y, currentPlayer)){
                        Utils.showToast("深算成功！两颗棋子已落子");
                        heroState.isDeepStep = false;
                        GAME_STATE.skillTemp.firstX = null;
                        GAME_STATE.skillTemp.firstY = null;
                        if(GAME_STATE.currentMode === "skill") SkillSystem.addStep(currentPlayer);
                        this.switchPlayer();
                        this.updateSkillUI();
                        this.tryAI();
                    }else{
                        Utils.showToast("该位置已有棋子，第二子落子失败！");
                    }
                }else{
                    Utils.showToast("两颗棋子相邻！深算失败");
                    heroState.isDeepStep = false;
                    GAME_STATE.skillTemp.firstX = null;
                    GAME_STATE.skillTemp.firstY = null;
                    this.updateSkillUI();
                }
                return;
            }
        }
        // 5. 正常落子/刘备/吕蒙连下
        if(Board.placeChess(x, y, currentPlayer)){
            if(GAME_STATE.isPlaying){
                if(GAME_STATE.currentMode === "skill"){
                    SkillSystem.addStep(currentPlayer);
                    if(SkillSystem.hasSunQuan()){
                        SkillSystem.checkFourInARow(currentPlayer);
                    }
                }
                if(heroState && heroState.isDoubleStep){
                    Utils.showToast(`技能生效！继续下${currentPlayer===1?"黑棋":"白棋"}`);
                    heroState.isDoubleStep = false;
                }else{
                    this.switchPlayer();
                }
                this.updateSkillUI();
                this.tryAI();
            }
        }else{
            Utils.showToast("该位置已有棋子，无法落子！");
        }
    },
    switchPlayer(){
        SkillSystem.reduceBlockSkillRound();
        SkillSystem.reduceBlockAreaRound();
        GAME_STATE.currentPlayer = GAME_STATE.currentPlayer === CONFIG.PLAYER.BLACK ? CONFIG.PLAYER.WHITE : CONFIG.PLAYER.BLACK;
        this.updateSkillUI();
        this.updateButtonState();
    },
    reset(){
        GAME_STATE.isPlaying = false;
        GAME_STATE.currentPlayer = CONFIG.PLAYER.BLACK;
        GAME_STATE.skillTemp = {
            usingSkillPlayer: 0,
            skillType: "",
            selectedHeroIds: [],
            firstX: null,
            firstY: null,
            fourInARow: {isExist: false, pos: []},
            delChess:[],
            blockSkill:{player:0, remainRound:0},
            blockArea:[]
        };
        GAME_STATE.history = [];
        for(let p in GAME_STATE.playerConfig){
            const heroState = GAME_STATE.playerConfig[p].heroState;
            if(heroState){
                heroState.isDoubleStep = false;
                heroState.isDeepStep = false;
                heroState.currentStep = 0;
                heroState.skillTemp = {};
            }
        }
        Board.init();
        this.updateButtonState();
        this.updateSkillUI();
        this.updateConfigLock();
    },
    updateButtonState(){
        document.getElementById("startGame").disabled = GAME_STATE.isPlaying;
        document.getElementById("pauseGame").disabled = !GAME_STATE.isPlaying;
        const isAiGame = GAME_STATE.playerConfig[1].type === "ai" || GAME_STATE.playerConfig[2].type === "ai";
        document.getElementById("regretStep").disabled = !GAME_STATE.isPlaying || GAME_STATE.history.length === 0 || isAiGame;
    },
    updateSkillUI(){
        const p1HeroState = GAME_STATE.playerConfig[1].heroState;
        const p1SkillInfo = document.getElementById("p1SkillInfo");
        const p1UseSkillBtn = document.getElementById("p1UseSkill");
        const p2HeroState = GAME_STATE.playerConfig[2].heroState;
        const p2SkillInfo = document.getElementById("p2SkillInfo");
        const p2UseSkillBtn = document.getElementById("p2UseSkill");
        if(GAME_STATE.currentMode !== "skill" || !GAME_STATE.isPlaying){
            p1SkillInfo.textContent = "黑棋：未选择";
            p1UseSkillBtn.disabled = true;
            p2SkillInfo.textContent = "白棋：未选择";
            p2UseSkillBtn.disabled = true;
            return;
        }
        // 董卓技能封锁UI提示+禁用
        const p1Blocked = GAME_STATE.skillTemp.blockSkill.player === 1;
        const p2Blocked = GAME_STATE.skillTemp.blockSkill.player === 2;
        if(p1HeroState){
            p1SkillInfo.textContent = `黑棋：${p1HeroState.heroName}（剩余${p1HeroState.remainTimes}次）${p1Blocked?"【技能被封】":""}`;
            p1UseSkillBtn.disabled = GAME_STATE.playerConfig[1].type === "ai" || p1HeroState.remainTimes <= 0 || GAME_STATE.currentPlayer !== 1 || p1Blocked;
        }else{
            p1SkillInfo.textContent = "黑棋：未选择英雄";
            p1UseSkillBtn.disabled = true;
        }
        if(p2HeroState){
            p2SkillInfo.textContent = `白棋：${p2HeroState.heroName}（剩余${p2HeroState.remainTimes}次）${p2Blocked?"【技能被封】":""}`;
            p2UseSkillBtn.disabled = GAME_STATE.playerConfig[2].type === "ai" || p2HeroState.remainTimes <= 0 || GAME_STATE.currentPlayer !== 2 || p2Blocked;
        }else{
            p2SkillInfo.textContent = "白棋：未选择英雄";
            p2UseSkillBtn.disabled = true;
        }
    },
    tryAI(){
        if(!GAME_STATE.isPlaying) return;
        const currentType = GAME_STATE.playerConfig[GAME_STATE.currentPlayer].type;
        if(currentType === "ai"){
            aiThink();
        }
    }
};
window.onload = ()=>{
    Game.init();
};
// 棋盘尺寸切换 安全功能 不影响任何游戏逻辑
document.querySelectorAll('.board-size-btn').forEach(btn=>{
    btn.onclick = function(){
        if(GAME_STATE.isPlaying) return;
        document.querySelectorAll('.board-size-btn').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        let size = parseInt(this.dataset.size);
        CONFIG.BOARD_SIZE = size;
        Game.reset();
        Utils.showToast("棋盘尺寸："+size+"×"+size);
    }
});
// 棋盘尺寸切换
document.querySelectorAll('.board-size-btn').forEach(btn=>{
    btn.onclick = function(){
        if(GAME_STATE.isPlaying) return;
        document.querySelectorAll('.board-size-btn').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        let size = parseInt(this.dataset.size);
        CONFIG.BOARD_SIZE = size;
        Game.reset();
        Utils.showToast("棋盘尺寸："+size+"×"+size);
    }
});

// 棋盘颜色切换（不影响任何游戏逻辑）
document.querySelectorAll('.color-btn').forEach(btn=>{
    btn.onclick = function(){
        if(GAME_STATE.isPlaying) return;
        document.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        let c = this.dataset.color;
        CONFIG.COLORS.BOARD = c;
        Board.draw();
        Utils.showToast("已切换棋盘配色");
    }
});
