// main.js - 西游猜猜看（100分胜利+修复伪随机）
let currentScore = 0;
let currentQuestionIndex = 0;
let currentHintIndex = 0;
let isGameRunning = false;
let usedQuestions = [];
let shuffledCurrentHints = []; // 存储当前人物的打乱后提示

// 获取元素
const scoreNum = document.getElementById("scoreNum");
const hintBox = document.getElementById("hintBox");
const answerInput = document.getElementById("answerInput");
const startBtn = document.querySelector(".btn-start");
const hintBtn = document.querySelector(".btn-hint");
const submitBtn = document.querySelector(".btn-submit");
const answerBtn = document.querySelector(".btn-answer");
const skipBtn = document.querySelector(".btn-skip");
const exitBtn = document.querySelector(".btn-exit");
// 自定义弹窗元素
const customAlert = document.getElementById("customAlert");
const alertContent = document.getElementById("alertContent");
const alertBtn = document.getElementById("alertBtn");
const alertMask = document.getElementById("alertMask");

// 自定义弹窗函数
function showAlert(text) {
  alertContent.textContent = text;
  customAlert.style.display = "block";
  alertMask.style.display = "block";
  disableAllBtns(true);
}

// 关闭自定义弹窗
function closeAlert() {
  customAlert.style.display = "none";
  alertMask.style.display = "none";
  disableAllBtns(false);
  answerInput.focus();
}

// 禁用/启用所有按钮
function disableAllBtns(isDisabled) {
  if (isGameRunning) {
    hintBtn.disabled = isDisabled;
    submitBtn.disabled = isDisabled;
    answerBtn.disabled = isDisabled;
    skipBtn.disabled = isDisabled;
    startBtn.disabled = true;
    exitBtn.disabled = isDisabled;
  } else {
    hintBtn.disabled = true;
    submitBtn.disabled = true;
    answerBtn.disabled = true;
    skipBtn.disabled = true;
    startBtn.disabled = isDisabled;
    exitBtn.disabled = true;
  }
}

// 绑定弹窗确定按钮
alertBtn.addEventListener("click", closeAlert);

// Fisher-Yates 真随机洗牌算法（无偏）
function shuffleArray(array) {
  const newArr = [...array]; // 复制原数组，不修改原数据
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; // 交换位置
  }
  return newArr;
}

// 1. 随机选题（选题时打乱提示，只打乱一次）
function randomQuestion() {
  if (usedQuestions.length >= gameData.length) {
    usedQuestions = [];
    showAlert("📢 所有题目已答完，重置题库！");
  }
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * gameData.length);
  } while (usedQuestions.includes(randomIndex));
  currentQuestionIndex = randomIndex;
  usedQuestions.push(randomIndex);
  currentHintIndex = 0;
  
  // 选题时用真随机算法打乱提示
  const currentQ = gameData[currentQuestionIndex];
  shuffledCurrentHints = shuffleArray(currentQ.hints);
  
  hintBox.textContent = "请点击「获取提示」查看线索";
  answerInput.value = "";
  answerInput.focus();
}

// 2. 开始游戏
function startGame() {
  if (typeof gameData === "undefined") {
    showAlert("⚠️ 题库加载失败，请检查data.js文件是否存在！");
    return;
  }
  isGameRunning = true;
  currentScore = 0;
  usedQuestions = [];
  scoreNum.textContent = currentScore;
  
  hintBtn.disabled = false;
  submitBtn.disabled = false;
  answerBtn.disabled = false;
  skipBtn.disabled = false;
  startBtn.disabled = true;
  exitBtn.disabled = false;
  
  randomQuestion();
  hintBox.textContent = "游戏开始！点击「获取提示」查看线索";
}

// 3. 获取提示（用提前打乱好的数组）
function getHint() {
  if (!isGameRunning) {
    showAlert("请先点击「开始游戏」！");
    return;
  }
  if (currentHintIndex >= shuffledCurrentHints.length) {
    showAlert("⚠️ 没有更多提示了！");
    return;
  }
  
  hintBox.textContent = `提示 ${currentHintIndex + 1}：${shuffledCurrentHints[currentHintIndex]}`;
  
  currentHintIndex++;
  currentScore = Math.max(0, currentScore - 3);
  scoreNum.textContent = currentScore;
}

// 4. 提交答案（核心修改：100分胜利）
function submitAnswer() {
  if (!isGameRunning) {
    showAlert("请先点击「开始游戏」！");
    return;
  }
  const inputVal = answerInput.value.trim();
  if (inputVal === "") {
    showAlert("请输入你猜测的西游人物名字！");
    return;
  }
  
  const currentQ = gameData[currentQuestionIndex];
  const correctAnswers = [currentQ.name];
  const aliasMap = {
    "孙悟空": ["孙行者", "齐天大圣", "美猴王", "弼马温", "斗战胜佛"],
    "唐僧": ["唐三藏", "唐玄奘", "江流儿", "金蝉子", "旃檀功德佛"],
    "猪八戒": ["猪悟能", "天蓬元帅", "净坛使者", "八戒"],
    "沙和尚": ["沙悟净", "卷帘大将", "金身罗汉", "沙僧"],
    "白龙马": ["玉龙三太子", "八部天龙马"],
    "如来佛祖": ["释迦牟尼", "如来"],
    "观音菩萨": ["观世音", "观自在", "南海观音"],
    "玉皇大帝": ["玉帝", "昊天金阙至尊玉皇大帝"],
    "太上老君": ["老子", "道德天尊"],
    "牛魔王": ["平天大圣"],
    "铁扇公主": ["罗刹女"],
    "红孩儿": ["圣婴大王"],
    "白骨精": ["白骨夫人"],
    "蜘蛛精": ["七仙姑（蜘蛛精）"],
    "玉兔精": ["玉兔仙子"],
    "金角大王": ["金角"],
    "银角大王": ["银角"],
    "太上老君童子": ["金角童子", "银角童子"],
    "六耳猕猴": ["假悟空"],
    "二郎神": ["杨戬", "显圣二郎真君"],
    "哪吒": ["哪吒三太子", "三坛海会大神"],
    "托塔李天王": ["李靖", "李天王"]
  };
  if (aliasMap[currentQ.name]) {
    correctAnswers.push(...aliasMap[currentQ.name]);
  }

  if (correctAnswers.includes(inputVal)) {
    const addScore = Math.max(3, 15 - (currentHintIndex * 3));
    currentScore += addScore;
    scoreNum.textContent = currentScore;
    
    // 核心修改：胜利条件改为100分
    if (currentScore >= 100) {
      showAlert(`🏆 恭喜你！积分达到100分，游戏胜利！\n最终得分：${currentScore}分`);
      exitGame();
      return;
    }
    
    showAlert(`🎉 恭喜答对！正确答案：${currentQ.name}\n本次得分：${addScore}分`);
    randomQuestion();
  } else {
    showAlert(`❌ 回答错误！再试试～`);
    answerInput.select();
  }
}

// 5. 查看答案
function showAnswer() {
  if (!isGameRunning) {
    showAlert("请先点击「开始游戏」！");
    return;
  }
  const currentQ = gameData[currentQuestionIndex];
  showAlert(`✅ 当前题目答案：${currentQ.name}`);
  randomQuestion();
}

// 6. 跳过本题
function skipQuestion() {
  if (!isGameRunning) {
    showAlert("请先点击「开始游戏」！");
    return;
  }
  const currentQ = gameData[currentQuestionIndex];
  showAlert(`⏭️ 已跳过本题，答案：${currentQ.name}`);
  randomQuestion();
}

// 7. 退出游戏
function exitGame() {
  if (!isGameRunning) {
    showAlert("游戏尚未开始！");
    return;
  }
  showAlert(`📤 游戏已退出！\n最终积分：${currentScore}分`);
  
  isGameRunning = false;
  currentScore = 0;
  usedQuestions = [];
  scoreNum.textContent = currentScore;
  hintBox.textContent = "点击「开始游戏」按钮开始挑战";
  answerInput.value = "";
  
  hintBtn.disabled = true;
  submitBtn.disabled = true;
  answerBtn.disabled = true;
  skipBtn.disabled = true;
  startBtn.disabled = false;
  exitBtn.disabled = true;
}

// 绑定按钮事件
startBtn.addEventListener("click", startGame);
hintBtn.addEventListener("click", getHint);
submitBtn.addEventListener("click", submitAnswer);
answerBtn.addEventListener("click", showAnswer);
skipBtn.addEventListener("click", skipQuestion);
exitBtn.addEventListener("click", exitGame);

// 回车提交答案
answerInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter" && isGameRunning) {
    submitBtn.click();
  }
});

// 初始化禁用功能按钮
hintBtn.disabled = true;
submitBtn.disabled = true;
answerBtn.disabled = true;
skipBtn.disabled = true;
exitBtn.disabled = true;