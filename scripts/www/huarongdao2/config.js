window.GAME_CONFIG = {
  cols: 4,
  rows: 5,
  cellSize: 60,
  pieceTypes: {
    caocao:  { name:"曹操", w:2, h:2, color:"#e53935" },
    guan:    { name:"关羽", w:2, h:1, color:"#4285f4" },
    zhang:   { name:"张飞", w:1, h:2, color:"#fbbc05" },
    zhao:    { name:"赵云", w:1, h:2, color:"#9c27b0" },
    ma:      { name:"马超", w:1, h:2, color:"#34a853" },
    huang:   { name:"黄忠", w:1, h:2, color:"#ff9800" },
    soldier: { name:"小兵", w:1, h:1, color:"#9e9e9e" }
  },
  exitPos: { x1:1, x2:2, y:4 }
};

window.GAME_STATE = {
  currentLevel: 1,
  passedLevels: [],
  pieces: [],
  grid: [],
  step:0,
  time:0,
  timer:null,
  isPlaying:false,
  tipTimes:0,
  currentTipIndex:0
};