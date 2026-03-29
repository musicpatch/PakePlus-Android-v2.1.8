const LEVELS = {
  // 第1关：横刀立马（EOP原版，最优81步）
  1: {
    tip: "第1关：横刀立马",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }
    ]
  },

  // 第2关：齐头并进（修复格式+去多余逗号）
  2: {
    tip: "第2关：齐头并进",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 3, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 3, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 2 }
    ]
  },

  // 第3关：左右布兵（精准匹配截图）
  3: {
    tip: "第3关：左右布兵",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 1, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 2, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 4, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 }
    ]
  },

  4: {
    tip: "第4关：一路顺风",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 2, y: 3, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 4 }
    ]
  },

  5: {
    tip: "第5关：插翅难飞",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 0, y: 3, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 3, y: 3, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 1, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 0, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 2 }
    ]
  },

  6: {
    tip: "第6关：双将挡路",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 1, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 }
    ]
  },

  7: {
    tip: "第7关：层层设防",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 1, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 1, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 1, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 1, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 4, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 3 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 3 }
    ]
  },

  8: {
    tip: "第8关：瓮中之鳖",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 2, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 3 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 3 }
    ]
  },

  9: {
    tip: "第9关：四路进兵",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 2, y: 2, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 2, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 2, y: 4, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 0, y: 4, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 }
    ]
  },

  10: {
    tip: "第10关：四面楚歌",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 1 },
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 3, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 2, w: 1, h: 2 },
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 3, w: 2, h: 1 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 0 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 2 },
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }
    ]
  },

  11: {
    tip: "第11关：五将逼宫",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 1 }, // 曹操（中中）
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 2, h: 1 }, // 张飞（左上，竖）
      { type: GAME_CONFIG.pieceTypes.huang,  x: 2, y: 0, w: 2, h: 1 }, // 黄忠（右上，竖）
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 1, w: 1, h: 2 }, // 马超（左中，竖）
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 1, w: 1, h: 2 }, // 赵云（右中，竖）
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 3, w: 2, h: 1 }, // 关羽（中下，横）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 3 }, // 小兵（左下）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 3 }, // 小兵（右下）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 }, // 小兵（最左下）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }  // 小兵（最右下）
    ]
  },

  12: {
    tip: "第12关：夹道藏兵",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 0, y: 0 }, // 曹操（左上）
      { type: GAME_CONFIG.pieceTypes.guan,   x: 3, y: 0, w: 1, h: 2 }, // 关羽（右上，竖）
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 2, w: 2, h: 1 }, // 张飞（左中，竖）
      { type: GAME_CONFIG.pieceTypes.huang,  x: 2, y: 2, w: 2, h: 1 }, // 黄忠（右中，竖）
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 3, w: 2, h: 1 }, // 马超（左下，横）
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 2, y: 3, w: 2, h: 1 }, // 赵云（右下，横）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 0 }, // 小兵（上中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 1 }, // 小兵（中中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 }, // 小兵（最左下）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }  // 小兵（最右下）
    ]
  },

  13: {
    tip: "第13关：峰回路转",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 0, y: 1 }, // 曹操（左中）
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w: 1, h: 2 }, // 黄忠（右上，竖条）
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 2, y: 1, w: 1, h: 2 }, // 张飞（右中，竖条）
      { type: GAME_CONFIG.pieceTypes.ma,     x: 3, y: 2, w: 1, h: 2 }, // 马超（右下，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 1, y: 3, w: 2, h: 1 }, // 赵云（中下，横条）
      { type: GAME_CONFIG.pieceTypes.guan,   x: 2, y: 4, w: 2, h: 1 }, // 关羽（最下，横条）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 }, // 小兵（左上）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 0 }, // 小兵（上中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 0 }, // 小兵（上右）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 4 }  // 小兵（下中）
    ]
  },

  14: {
    tip: "第14关：指挥若定",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 }, // 曹操（中上方）
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 }, // 张飞（左侧，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w: 1, h: 2 }, // 黄忠（右侧，竖条）
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2, w: 2, h: 1 }, // 关羽（中间，横条）
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 3, w: 1, h: 2 }, // 马超（左下，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 3, w: 1, h: 2 }, // 赵云（右下，竖条）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 2 }, // 小兵（左中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 2 }, // 小兵（右中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 }, // 小兵（中下中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 }  // 小兵（中下右）
    ]
  },

  15: {
    tip: "第15关：兵分三路",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 }, // 曹操（中上方）
      { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 1, w: 1, h: 2 }, // 张飞（左侧，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 1, w: 1, h: 2 }, // 黄忠（右侧，竖条）
      { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 2, w: 2, h: 1 }, // 关羽（中间，横条）
      { type: GAME_CONFIG.pieceTypes.ma,     x: 0, y: 3, w: 1, h: 2 }, // 马超（左下，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,   x: 3, y: 3, w: 1, h: 2 }, // 赵云（右下，竖条）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 }, // 小兵（左上）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 }, // 小兵（右上）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 1, y: 3 }, // 小兵（中下中）
      { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 3 }  // 小兵（中下右）
    ]
  },

  16: {
    tip: "第16关：桃花园中",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao,  x: 1, y: 0 }, // 曹操（中上方，2x2）
      { type: GAME_CONFIG.pieceTypes.zhang,   x: 0, y: 1, w: 1, h: 2 }, // 张飞（左侧，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,   x: 3, y: 1, w: 1, h: 2 }, // 黄忠（右侧，竖条）
      { type: GAME_CONFIG.pieceTypes.ma,      x: 1, y: 2, w: 1, h: 2 }, // 马超（左下，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,    x: 2, y: 2, w: 1, h: 2 }, // 赵云（右下，竖条）
      { type: GAME_CONFIG.pieceTypes.guan,    x: 1, y: 4, w: 2, h: 1 }, // 关羽（底部，横条）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 0 }, // 小兵（左上）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 0 }, // 小兵（右上）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 3 }, // 小兵（最左下）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 3 }  // 小兵（最右下）
    ]
  },

  17: {
    tip: "第17关：守口如瓶",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao,  x: 1, y: 0 }, // 曹操（中上方）
      { type: GAME_CONFIG.pieceTypes.zhang,   x: 0, y: 0, w: 1, h: 2 }, // 张飞（左侧，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,   x: 3, y: 0, w: 1, h: 2 }, // 黄忠（右侧，竖条）
      { type: GAME_CONFIG.pieceTypes.ma,      x: 1, y: 2, w: 1, h: 2 }, // 马超（中间，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,    x: 0, y: 4, w: 2, h: 1 }, // 赵云（左下，横条）
      { type: GAME_CONFIG.pieceTypes.guan,    x: 2, y: 4, w: 2, h: 1 }, // 关羽（右下，横条）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 2 }, // 小兵（左中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 2 }, // 小兵（右中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 3 }, // 小兵（左下）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 3 }  // 小兵（右下）
    ]
  },

  18: {
    tip: "第18关：前呼后拥",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao,  x: 2, y: 0 }, // 曹操（右上方）
      { type: GAME_CONFIG.pieceTypes.zhang,   x: 0, y: 1, w: 2, h: 1 }, // 张飞（左中，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,   x: 0, y: 2, w: 2, h: 1 }, // 黄忠（左下，竖条）
      { type: GAME_CONFIG.pieceTypes.ma,      x: 2, y: 2, w: 2, h: 1 }, // 马超（右中，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,    x: 0, y: 3, w: 2, h: 1 }, // 赵云（左下，横条）
      { type: GAME_CONFIG.pieceTypes.guan,    x: 2, y: 3, w: 2, h: 1 }, // 关羽（右下，横条）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 0 }, // 小兵（左上）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 1, y: 0 }, // 小兵（上中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 4 }, // 小兵（右下）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 2, y: 4 }  // 小兵（最右下）
    ]
  },

  19: {
    tip: "第19关：小燕出巢",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao,  x: 1, y: 0 }, // 曹操（中上方）
      { type: GAME_CONFIG.pieceTypes.zhang,   x: 0, y: 0, w: 1, h: 2 }, // 张飞（左侧，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,   x: 3, y: 0, w: 1, h: 2 }, // 黄忠（右侧，竖条）
      { type: GAME_CONFIG.pieceTypes.ma,      x: 0, y: 2, w: 2, h: 1 }, // 马超（左中，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,    x: 2, y: 2, w: 2, h: 1 }, // 赵云（右中，竖条）
      { type: GAME_CONFIG.pieceTypes.guan,    x: 1, y: 3, w: 2, h: 1 }, // 关羽（中间，横条）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 3 }, // 小兵（左中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 4 }, // 小兵（右中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 0, y: 4 }, // 小兵（左下）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 3 }  // 小兵（右下）
    ]
  },

  20: {
    tip: "第20关：屯兵东路",
    pieces: [
      { type: GAME_CONFIG.pieceTypes.caocao,  x: 0, y: 0 }, // 曹操（左上方）
      { type: GAME_CONFIG.pieceTypes.zhang,   x: 2, y: 0, w: 1, h: 2 }, // 张飞（右上，竖条）
      { type: GAME_CONFIG.pieceTypes.huang,   x: 3, y: 0, w: 1, h: 2 }, // 黄忠（最右，竖条）
      { type: GAME_CONFIG.pieceTypes.guan,    x: 0, y: 2, w: 2, h: 1 }, // 关羽（左中，横条）
      { type: GAME_CONFIG.pieceTypes.ma,      x: 0, y: 3, w: 1, h: 2 }, // 马超（左下，竖条）
      { type: GAME_CONFIG.pieceTypes.zhao,    x: 1, y: 3, w: 1, h: 2 }, // 赵云（中下，竖条）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 2, y: 3 }, // 小兵（右中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 3 }, // 小兵（最右中）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 2, y: 2 }, // 小兵（右下）
      { type: GAME_CONFIG.pieceTypes.soldier, x: 3, y: 2 }  // 小兵（最右下）
	  
	  ]
	  },
	       21: {
			   tip: "第20关：守口如瓶",
	      pieces: [
	        { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 1, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 1, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.ma,     x: 1, y: 2, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 4, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.guan,   x: 2, y: 4, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 3 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 3 }
	      ]
	    },
	  
	    // 第2关：层层设防
	    22: {
			tip: "第20关：层层设防",
	      pieces: [
	        { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.huang,  x: 3, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.ma,     x: 1, y: 2, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.zhao,   x: 1, y: 3, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 4, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 3 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 3 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 2 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 2 }
	      ]
	    },
	  
	    // 第3关：近在咫尺
	    23: {
			tip: "第20关：近在咫尺",
	      pieces: [
	        { type: GAME_CONFIG.pieceTypes.caocao, x: 2, y: 3 },
	        { type: GAME_CONFIG.pieceTypes.zhang,  x: 1, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.huang,  x: 2, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.ma,     x: 3, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 2, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.guan,   x: 0, y: 3, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 2, y: 2 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 2 }
	      ]
	    },
	  
	    // 第4关：水泄不通
	    24: {
			tip: "第20关：水泄不通",
	      pieces: [
	        { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.huang,  x: 0, y: 2, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.ma,     x: 2, y: 2, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.zhao,   x: 0, y: 3, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.guan,   x: 2, y: 3, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 0, y: 4 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 4 }
	      ]
	    },
	  
	    // 第5关：一路进军
	    25: {
			tip: "第20关：一路进军",
	      pieces: [
	        { type: GAME_CONFIG.pieceTypes.caocao, x: 1, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.zhang,  x: 0, y: 0, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.huang,  x: 0, y: 2, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.ma,     x: 1, y: 2, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.zhao,   x: 2, y: 2, w: 1, h: 2 },
	        { type: GAME_CONFIG.pieceTypes.guan,   x: 1, y: 4, w: 2, h: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 0 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 1 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 2 },
	        { type: GAME_CONFIG.pieceTypes.soldier,x: 3, y: 3 }
	      ]
	    }
	  };