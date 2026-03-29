// 音效管理模块
const SoundManager = (function() {
  // 音效缓存
  const sounds = {};
  // 音效路径配置
  const soundPaths = {
    slide: "2046/slide.mp3",      // 滑动音效
    winner: "2046/winner.mp3",    // 胜利音效
    fanpai: "mp3/fanpai.mp3"      // 翻面/切换音效
  };

  // 初始化加载所有音效
  function init() {
    Object.keys(soundPaths).forEach(key => {
      const audio = new Audio(soundPaths[key]);
      // 预加载（不自动播放）
      audio.preload = "auto";
      sounds[key] = audio;
    });
    console.log("音效初始化完成");
  }

  // 播放音效
  function play(key, volume = 1.0) {
    if (!sounds[key]) {
      console.warn(`音效${key}未加载`);
      return;
    }
    // 克隆音频对象解决重复播放问题
    const audio = sounds[key].cloneNode();
    audio.volume = volume;
    audio.play().catch(err => {
      // 处理浏览器自动播放限制
      console.log("音效播放失败（需用户交互触发）:", err);
    });
  }

  return {
    init,
    play
  };
})();

// 页面加载完成后初始化音效
document.addEventListener("DOMContentLoaded", () => {
  SoundManager.init();
});