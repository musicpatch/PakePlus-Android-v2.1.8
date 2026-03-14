// main.js - 水浒猜猜猜核心逻辑（完整功能，可直接运行）
// 初始化全局变量
let currentScore = 0;        // 当前积分
let currentQuestionIndex = 0;// 当前题目索引
let currentHintIndex = 0;    // 当前提示索引
let isGameRunning = false;   // 游戏是否开始

// 获取界面元素（和index.html的ID对应）
const scoreNum = document.getElementById("scoreNum");
const hintBox = document.getElementById("hintBox");
const answerInput = document.getElementById("answerInput");
const startBtn = document.querySelector(".btn-start");
const hintBtn = document.querySelector(".btn-hint");
const submitBtn = document.querySelector(".btn-submit");
const answerBtn = document.querySelector(".btn-answer");
const skipBtn = document.querySelector(".btn-skip");
const exitBtn = document.querySelector(".btn-exit");

// ========== 核心功能函数 ==========
// 1. 随机选择题目（避免重复选同一题）
let usedQuestions = []; // 记录已选过的题目索引
function randomQuestion() {
  // 所有题目都选过则重置
  if (usedQuestions.length >= gameData.length) {
    usedQuestions = [];
    alert("📢 所有题目已答完，重置题库！");
  }

  // 随机选未答过的题目
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * gameData.length);
  } while (usedQuestions.includes(randomIndex));
  
  currentQuestionIndex = randomIndex;
  usedQuestions.push(randomIndex);
  currentHintIndex = 0;
  hintBox.textContent = "请点击「获取提示」查看线索";
  answerInput.value = "";
  answerInput.focus();
}

// 2. 开始游戏
function startGame() {
  if (typeof gameData === "undefined") {
    alert("⚠️ 题库加载失败，请检查data.js文件是否存在！");
    return;
  }
  
  isGameRunning = true;
  currentScore = 0;
  usedQuestions = []; // 重置已选题库
  scoreNum.textContent = currentScore;
  
  // 启用所有功能按钮
  hintBtn.disabled = false;
  submitBtn.disabled = false;
  answerBtn.disabled = false;
  skipBtn.disabled = false;
  startBtn.disabled = true; // 禁用开始按钮
  
  // 随机选第一题
  randomQuestion();
  hintBox.textContent = "游戏开始！点击「获取提示」查看线索";
}

// 3. 获取提示
function getHint() {
  if (!isGameRunning) {
    alert("请先点击「开始游戏」！");
    return;
  }
  
  const currentQ = gameData[currentQuestionIndex];
  if (currentHintIndex >= currentQ.hints.length) {
    alert("⚠️ 没有更多提示了！");
    return;
  }
  
  // 显示当前提示
  hintBox.textContent = `提示 ${currentHintIndex + 1}：${currentQ.hints[currentHintIndex]}`;
  currentHintIndex++;
  
  // 每看一个提示扣2分（最低0分）
  currentScore = Math.max(0, currentScore - 2);
  scoreNum.textContent = currentScore;
}

// 4. 提交答案（新增100分胜利判断）
function submitAnswer() {
  if (!isGameRunning) {
    alert("请先点击「开始游戏」！");
    return;
  }
  
  const inputVal = answerInput.value.trim();
  if (inputVal === "") {
    alert("请输入你猜测的水浒人物名字！");
    answerInput.focus();
    return;
  }
  
  const currentQ = gameData[currentQuestionIndex];
  // 兼容简体/繁体/别名（比如"鲁智深"="鲁达"，"宋江"="宋公明"）
  const correctAnswers = [currentQ.name];
  // 补充常见别名（可选，根据需要扩展）
  const aliasMap = {
    "宋江": ["宋公明", "及时雨"],
    "鲁智深": ["鲁达", "花和尚"],
    "武松": ["武二郎", "行者"],
    "林冲": ["豹子头"],
    "李逵": ["黑旋风"]
  };
  if (aliasMap[currentQ.name]) {
    correctAnswers.push(...aliasMap[currentQ.name]);
  }

  if (correctAnswers.includes(inputVal)) {
    // 答对加分（基础10分，扣除提示扣分）
    const addScore = 10 - (currentHintIndex * 2);
    currentScore += Math.max(0, addScore);
    scoreNum.textContent = currentScore;
    
    // 判断是否达到100分胜利
    if (currentScore >= 100) {
      alert(`🏆 恭喜你！积分达到100分，游戏胜利！\n最终得分：${currentScore}分`);
      exitGame(); // 胜利后自动退出游戏
      return;
    }
    
    alert(`🎉 恭喜答对！正确答案：${currentQ.name}\n本次得分：${Math.max(0, addScore)}分`);
    randomQuestion(); // 下一题
  } else {
    alert(`❌ 回答错误！再试试～`);
    answerInput.select(); // 选中输入框内容，方便重新输入
  }
}

// 5. 查看答案
function showAnswer() {
  if (!isGameRunning) {
    alert("请先点击「开始游戏」！");
    return;
  }
  
  const currentQ = gameData[currentQuestionIndex];
  alert(`✅ 当前题目答案：${currentQ.name}`);
  randomQuestion(); // 查看答案后直接下一题
}

// 6. 跳过本题
function skipQuestion() {
  if (!isGameRunning) {
    alert("请先点击「开始游戏」！");
    return;
  }
  
  const currentQ = gameData[currentQuestionIndex];
  alert(`⏭️ 已跳过本题，答案：${currentQ.name}`);
  randomQuestion(); // 跳过后下一题
}

// 7. 退出游戏
function exitGame() {
  if (!isGameRunning) {
    alert("游戏尚未开始！");
    return;
  }
  
  if (confirm(`📤 确定退出游戏吗？\n当前积分：${currentScore}分`)) {
    isGameRunning = false;
    currentScore = 0;
    usedQuestions = [];
    scoreNum.textContent = currentScore;
    hintBox.textContent = "点击「开始游戏」按钮开始挑战";
    answerInput.value = "";
    answerInput.disabled = false;
    
    // 禁用功能按钮，启用开始按钮
    hintBtn.disabled = true;
    submitBtn.disabled = true;
    answerBtn.disabled = true;
    skipBtn.disabled = true;
    startBtn.disabled = false;
  }
}

// ========== 绑定按钮事件 ==========
startBtn.addEventListener("click", startGame);
hintBtn.addEventListener("click", getHint);
submitBtn.addEventListener("click", submitAnswer);
answerBtn.addEventListener("click", showAnswer);
skipBtn.addEventListener("click", skipQuestion);
exitBtn.addEventListener("click", exitGame);

// 回车提交答案
answerInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter" && isGameRunning) {
    submitAnswer();
  }
});

// 初始化：禁用功能按钮（只有开始游戏后启用）
hintBtn.disabled = true;
submitBtn.disabled = true;
answerBtn.disabled = true;
skipBtn.disabled = true;