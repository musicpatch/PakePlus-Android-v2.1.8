const CONFIG={
    BOARD_SIZE:13,
    CELL_RATIO:0.4,
    COLORS:{
        BOARD:"#8C9E80",
        BLACK_CHESS:"#333",
        WHITE_CHESS:"#f0f0f0",
        GRID:"#333"
    },
    PLAYER:{
        BLACK:1, // 先手
        WHITE:2  // 后手
    }
};

const GAME_STATE={
    currentMode:"traditional", // traditional/skill
    isPlaying:false,
    cellSize:0,
    boardData:[],
    currentPlayer:CONFIG.PLAYER.BLACK,
    // 玩家配置
    playerConfig:{
        1:{type:"human", heroState:null}, // 黑棋：类型+英雄状态
        2:{type:"human", heroState:null}  // 白棋：类型+英雄状态
    },
    // 技能相关临时状态
    skillTemp:{
        usingSkillPlayer:0, // 正在使用技能的玩家ID
        skillType:"",       // 当前使用的技能类型
        selectedHeroIds:[]  // 已选择的英雄ID（用于独占）
    },
    history:[]
};