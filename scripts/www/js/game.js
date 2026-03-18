const Game={
    init(){
        Board.init();
        SkillSystem.init();
        this.bindEvents();
        this.initHeroSelect(); 
        this.updateButtonState();
        this.updateSkillUI();
    },

    // 适配新UI：英雄选择+横排技能描述
    initHeroSelect(){
        const firstHeroSelect = document.getElementById("firstHeroSelect");
        const firstHeroDesc = document.getElementById("firstHeroDesc"); // 新ID
        const secondHeroSelect = document.getElementById("secondHeroSelect");
        const secondHeroDesc = document.getElementById("secondHeroDesc"); // 新ID

        // 清空原有内容
        firstHeroSelect.innerHTML = "";
        secondHeroSelect.innerHTML = "";

        // 填充英雄库（下拉框只显示英雄名）
        HERO_LIB.forEach(hero => {
            const option = document.createElement("option");
            option.value = hero.id;
            option.textContent = hero.name; 
            option.dataset.skillDesc = hero.skillDesc;
            firstHeroSelect.appendChild(option);
        });

        // 先手英雄选择事件
        firstHeroSelect.onchange = ()=>{
            const selectedId = parseInt(firstHeroSelect.value);
            // 更新技能描述（新ID）
            const selectedHero = getHeroById(selectedId);
            firstHeroDesc.textContent = selectedHero.skillDesc;
            
            // 清空后手选项
            secondHeroSelect.innerHTML = "";
            // 获取未选择的英雄
            const unselectedHeroes = getUnselectedHeroes([selectedId]);
            // 填充后手选项
            unselectedHeroes.forEach(hero => {
                const option = document.createElement("option");
                option.value = hero.id;
                option.textContent = hero.name;
                option.dataset.skillDesc = hero.skillDesc;
                secondHeroSelect.appendChild(option);
            });

            // 启用/禁用后手选择框
            secondHeroSelect.disabled = unselectedHeroes.length === 0;
            // 默认选中第一个并更新描述
            if(unselectedHeroes.length > 0){
                secondHeroSelect.selectedIndex = 0;
                const defaultHero = getHeroById(parseInt(secondHeroSelect.value));
                secondHeroDesc.textContent = defaultHero.skillDesc; // 新ID
            } else {
                secondHeroDesc.textContent = "无可用英雄"; // 新ID
            }
        };

        // 后手英雄选择事件
        secondHeroSelect.onchange = ()=>{
            if(secondHeroSelect.options.length === 0) return;
            const selectedId = parseInt(secondHeroSelect.value);
            const selectedHero = getHeroById(selectedId);
            secondHeroDesc.textContent = selectedHero.skillDesc; // 新ID
        };

        // 初始化：默认选中第一个英雄并显示描述
        if(HERO_LIB.length > 0){
            firstHeroSelect.selectedIndex = 0;
            const defaultHero = getHeroById(parseInt(firstHeroSelect.value));
            firstHeroDesc.textContent = defaultHero.skillDesc; // 新ID
            // 触发onchange，初始化后手选择框
            firstHeroSelect.onchange();
        }
    },

    bindEvents(){
        // 玩家类型选择
        document.getElementById("p1_type").onchange = (e)=>{
            GAME_STATE.playerConfig[1].type = e.target.value;
        };
        document.getElementById("p2_type").onchange = (e)=>{
            GAME_STATE.playerConfig[2].type = e.target.value;
        };

        // 模式切换
        document.getElementById("traditionalMode").onclick = ()=>{
            GAME_STATE.currentMode = "traditional";
            document.getElementById("traditionalMode").classList.add("active");
            document.getElementById("skillMode").classList.remove("active");
            document.getElementById("heroSelectRow").style.display = "none";
            document.getElementById("skillStateContainer").style.display = "none";
            this.reset();
        };
        document.getElementById("skillMode").onclick = ()=>{
            GAME_STATE.currentMode = "skill";
            document.getElementById("skillMode").classList.add("active");
            document.getElementById("traditionalMode").classList.remove("active");
            document.getElementById("heroSelectRow").style.display = "block";
            document.getElementById("skillStateContainer").style.display = "block";
            this.reset();
        };

        // 开始游戏
        document.getElementById("startGame").onclick = ()=>{
            if(GAME_STATE.currentMode === "skill"){
                const firstHeroId = parseInt(document.getElementById("firstHeroSelect").value);
                const secondHeroSelect = document.getElementById("secondHeroSelect");
                if(!secondHeroSelect.options.length){
                    Utils.showToast("请选择先手英雄！");
                    return;
                }
                const secondHeroId = parseInt(secondHeroSelect.value);

                GAME_STATE.playerConfig[1].heroState = initHeroSkillState(firstHeroId);
                GAME_STATE.playerConfig[2].heroState = initHeroSkillState(secondHeroId);
                this.updateSkillUI();
            }else{
                GAME_STATE.playerConfig[1].heroState = null;
                GAME_STATE.playerConfig[2].heroState = null;
            }

            GAME_STATE.isPlaying = true;
            this.updateButtonState();
            this.tryAI();
        };

        // 暂停游戏
        document.getElementById("pauseGame").onclick = ()=>{
            GAME_STATE.isPlaying = !GAME_STATE.isPlaying;
            this.updateButtonState();
            Utils.showToast(GAME_STATE.isPlaying ? "游戏继续" : "游戏暂停");
        };

        // 悔步
        document.getElementById("regretStep").onclick = ()=>{
            if(Board.regret()){
                Utils.showToast("悔步成功");
                this.updateButtonState();
                this.updateSkillUI();
                this.tryAI();
            }else{
                Utils.showToast("没有可悔的步数");
            }
        };

        // 棋盘点击
        document.getElementById("chessBoard").onclick = (e)=>{
            this.handleBoardClick(e);
        };
    },

    handleBoardClick(e){
        if(!GAME_STATE.isPlaying) return;

        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const boardPos = Utils.screenToBoard(clickX, clickY);

        if(!boardPos.isValid) return;

        // 优先处理技能使用
        if(GAME_STATE.skillTemp.usingSkillPlayer !== 0){
            SkillSystem.executeSkill(boardPos.x, boardPos.y);
            this.updateSkillUI();
            return;
        }

        // 检查当前玩家类型
        const currentPlayerType = GAME_STATE.playerConfig[GAME_STATE.currentPlayer].type;
        if(currentPlayerType === "ai"){
            Utils.showToast("当前是AI回合，请等待");
            return;
        }

        // 正常落子 + 关羽步数统计
        if(Board.placeChess(boardPos.x, boardPos.y, GAME_STATE.currentPlayer)){
            if(GAME_STATE.currentMode === "skill"){
                SkillSystem.addStep(GAME_STATE.currentPlayer);
            }
            this.switchPlayer();
            this.updateSkillUI();
            this.tryAI();
        }
    },

    switchPlayer(){
        GAME_STATE.currentPlayer = GAME_STATE.currentPlayer === CONFIG.PLAYER.BLACK ? CONFIG.PLAYER.WHITE : CONFIG.PLAYER.BLACK;
    },

    reset(){
        GAME_STATE.isPlaying = false;
        GAME_STATE.currentPlayer = CONFIG.PLAYER.BLACK;
        GAME_STATE.skillTemp = {
            usingSkillPlayer:0,
            skillType:"",
            selectedHeroIds:[]
        };
        GAME_STATE.history = [];
        GAME_STATE.playerConfig[1].heroState = null;
        GAME_STATE.playerConfig[2].heroState = null;
        Board.init();
        this.updateButtonState();
        this.updateSkillUI();
    },

    updateButtonState(){
        document.getElementById("startGame").disabled = GAME_STATE.isPlaying;
        document.getElementById("pauseGame").disabled = !GAME_STATE.isPlaying;
        document.getElementById("regretStep").disabled = !GAME_STATE.isPlaying || GAME_STATE.history.length === 0;
    },

    updateSkillUI(){
        // 黑棋技能信息
        const p1HeroState = GAME_STATE.playerConfig[1].heroState;
        const p1SkillInfo = document.getElementById("p1SkillInfo");
        const p1UseSkillBtn = document.getElementById("p1UseSkill");
        
        if(p1HeroState && GAME_STATE.currentMode === "skill"){
            const hero = getHeroById(p1HeroState.heroId);
            p1SkillInfo.textContent = `黑棋：${p1HeroState.heroName}（剩余${p1HeroState.remainTimes}次）`;
            p1UseSkillBtn.disabled = p1HeroState.remainTimes <= 0 || !GAME_STATE.isPlaying || GAME_STATE.currentPlayer !== 1;
        }else{
            p1SkillInfo.textContent = "黑棋：未选择英雄";
            p1UseSkillBtn.disabled = true;
        }

        // 白棋技能信息
        const p2HeroState = GAME_STATE.playerConfig[2].heroState;
        const p2SkillInfo = document.getElementById("p2SkillInfo");
        const p2UseSkillBtn = document.getElementById("p2UseSkill");
        
        if(p2HeroState && GAME_STATE.currentMode === "skill"){
            const hero = getHeroById(p2HeroState.heroId);
            p2SkillInfo.textContent = `白棋：${p2HeroState.heroName}（剩余${p2HeroState.remainTimes}次）`;
            p2UseSkillBtn.disabled = p2HeroState.remainTimes <= 0 || !GAME_STATE.isPlaying || GAME_STATE.currentPlayer !== 2;
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

// 页面加载完成初始化
window.onload = ()=>{
    Game.init();
};