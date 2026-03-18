// 英雄库 - 支持多技能扩展
const HERO_LIB = [
    {
        id: 1,
        name: "关羽",
        skillName: "拔营",
        skillDesc: "每10步可删除对手1颗棋子",
        // 多技能扩展：后期可加
        // skillName2: "千里走单骑",
        // skillDesc2: "移动自己1颗棋子到任意空位置",
        skillType: "remove",
        skillCost: 1,
        skillMax: 3,
        skillTriggerStep: 10
    },
    {
        id: 2,
        name: "张飞",
        skillName: "爆破",
        skillDesc: "落子后删除3×3范围除中心外所有棋子",
        // 多技能扩展示例：
        // skillName2: "怒吼",
        // skillDesc2: "让对手本回合无法落子",
        skillType: "blast",
        skillCost: 1,
        skillMax: 3,
        skillTriggerStep: 0
    }
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
    if (hero.skillType === "blast") {
        initRemainTimes = hero.skillMax;
    }

    return {
        heroId: heroId,
        heroName: hero.name,
        remainTimes: initRemainTimes,
        currentStep: 0,
        // 多技能扩展：存储第二个技能的状态
        // remainTimes2: hero.skillMax2 || 0,
        // currentStep2: 0
    };
}