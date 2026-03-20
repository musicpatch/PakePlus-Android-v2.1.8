const CONFIG={
    BOARD_SIZE:11,
    CELL_RATIO:0.4,
    COLORS:{
        BOARD:"#A5B996",
        BLACK_CHESS:"#333",
        WHITE_CHESS:"#f0f0f0",
        GRID:"#333"
    },
    PLAYER:{
        BLACK:1,
        WHITE:2
    }
};
const GAME_STATE={
    currentMode:"traditional",
    isPlaying:false,
    cellSize:0,
    boardData:[],
    currentPlayer:CONFIG.PLAYER.BLACK,
    playerConfig:{
        1:{type:"human", heroState:null},
        2:{type:"human", heroState:null}
    },
    skillTemp:{
        usingSkillPlayer:0,
        skillType:"",
        selectedHeroIds:[],
        firstX:null,
        firstY:null,
        fourInARow:{isExist: false, pos: []},
        delChess:[],
        blockSkill:{player:0, remainRound:0},
        blockArea:[]
    },
    history:[]
};
