// 英雄库 - 三国五子棋技能（含蜀/魏/吴+群雄阵营）
const HERO_LIB = [
    // 蜀阵营
    {id: 1, name: "关羽", skillName: "斩将", skillDesc: "每10步可删除对手2颗棋子", skillType: "remove", skillCost: 1, skillMax: 3, skillTriggerStep: 10},
    {id: 2, name: "张飞", skillName: "喝阵", skillDesc: "落子后删除3×3范围除中心外所有棋子", skillType: "blast", skillCost: 1, skillMax: 3, skillTriggerStep: 0},
    {id: 3, name: "刘备", skillName: "招贤", skillDesc: "每8步可连下一手同色棋子（强制使用）", skillType: "double", skillCost: 1, skillMax: 3, skillTriggerStep: 8},
    {id: 4, name: "赵云", skillName: "救主", skillDesc: "开局获3次，可清除棋盘整行Y轴所有棋子", skillType: "clearY", skillCost: 1, skillMax: 3, skillTriggerStep: 0},
    // 魏阵营
    {id: 5, name: "曹操", skillName: "挟令", skillDesc: "敌方两子间单空穴，落子后消除该两子，每7步获1次", skillType: "coerce", skillCost: 1, skillMax: 3, skillTriggerStep: 7},
    {id: 6, name: "张辽", skillName: "威震", skillDesc: "开局获3次，可清除棋盘整行X轴所有棋子", skillType: "clearX", skillCost: 1, skillMax: 3, skillTriggerStep: 0},
    {id: 7, name: "司马懿", skillName: "深算", skillDesc: "每10步获1次，可连续放2颗自子（不可相邻）", skillType: "doubleSep", skillCost: 1, skillMax: 3, skillTriggerStep: 10},
    {id: 8, name: "许褚", skillName: "护主", skillDesc: "开局获5次，落子后清除棋子上下左右4颗相邻棋子", skillType: "clearAround", skillCost: 1, skillMax: 5, skillTriggerStep: 0},
    // 吴阵营（含吕蒙20步连下）
    {id: 9, name: "孙权", skillName: "鼎峙", skillDesc: "开局获2次，对方四子连珠时删其任意2颗", skillType: "standOff", skillCost: 1, skillMax: 2, skillTriggerStep: 0},
    {id: 10, name: "周瑜", skillName: "烧营", skillDesc: "每20步获1次，落子后清3×3内所有敌方棋子", skillType: "burnCamp", skillCost: 1, skillMax: 3, skillTriggerStep: 20},
    {id: 11, name: "吕蒙", skillName: "渡江", skillDesc: "每20步可连下一手同色棋子（强制使用）", skillType: "double", skillCost: 1, skillMax: 3, skillTriggerStep: 20},
    {id: 12, name: "黄盖", skillName: "苦肉", skillDesc: "每10步获1次，不落子随机删对方3颗棋子", skillType: "bitterFlesh", skillCost: 1, skillMax: 3, skillTriggerStep: 10}, // 改：删3子
    {id: 13, name: "貂蝉", skillName: "魅惑", skillDesc: "每10步获1次，转对方1子为己有（不可直接胜）", skillType: "crossRiver", skillCost: 1, skillMax: 3, skillTriggerStep: 10},
    {id: 14, name: "马超", skillName: "奔袭", skillDesc: "每15步获1次，空位置落子并清除上下左右敌方棋子", skillType: "rush", skillCost: 1, skillMax: 3, skillTriggerStep: 15},
    {id: 15, name: "黄忠", skillName: "烈弓", skillDesc: "每10步获1次，落子后清除斜角4颗棋子（不分敌我）", skillType: "bow", skillCost: 1, skillMax: 3, skillTriggerStep: 10},
    // 群雄阵营（含所有调整）
    {id: 16, name: "袁绍", skillName: "据冀", skillDesc: "每10步获1次，落子后3×3范围禁止对方落子5回合", skillType: "blockArea", skillCost: 1, skillMax: 3, skillTriggerStep: 10}, // 改：5回合
    {id: 17, name: "董卓", skillName: "擅权", skillDesc: "每15步获1次，让对方10回合内无法使用技能", skillType: "blockSkill", skillCost: 1, skillMax: 3, skillTriggerStep: 15},
    {id: 18, name: "诸葛亮", skillName: "妙计", skillDesc: "每10步获1次，空白处落子，3×3棋子敌我互换", skillType: "swap", skillCost: 1, skillMax: 3, skillTriggerStep: 10},
    {id: 19, name: "华佗", skillName: "医骨", skillDesc: "开局获10次，随机复活己方被技能删除的棋子", skillType: "resurrect", skillCost: 1, skillMax: 10, skillTriggerStep: 0}, // 改：10次
    {id: 20, name: "吕布", skillName: "方天", skillDesc: "每12步获1次，点击任意位置清除3×3范围内所有棋子（不分敌我）", skillType: "squareClear", skillCost: 1, skillMax: 3, skillTriggerStep: 12} // 新技能：3×3清棋
];
function getHeroById(heroId) {
    return HERO_LIB.find(hero => hero.id === heroId) || null;
}
function getUnselectedHeroes(selectedIds) {
    return HERO_LIB.filter(hero => !selectedIds.includes(hero.id));
}
function initHeroSkillState(heroId) {
    const hero = getHeroById(heroId);
    if (!hero) return null;
    
    let initRemainTimes = 0;
    if (hero.skillTriggerStep === 0) {
        initRemainTimes = hero.skillMax;
    }
    return {
        heroId: heroId,
        heroName: hero.name,
        remainTimes: initRemainTimes,
        currentStep: 0,
        isDoubleStep: false,
        isDeepStep: false,
        skillTemp: {}
    };
}
