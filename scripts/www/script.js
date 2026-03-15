let currentQuestion = null;
let allQuestions = [];
let remainingQuestions = [];
let usedTipIndexes = [];
let score = 0;
let isGameRunning = false; // 标记游戏是否在运行
let hasViewedAnswer = false; // 标记当前题是否查看过答案
let answerViewCount = 0; // 查看答案次数（全局限制5次）
const MAX_ANSWER_VIEW = 5; // 最大查看答案次数

// 初始化：监听题库切换事件（核心新增）
document.addEventListener("DOMContentLoaded", () => {
  // 输入框回车提交
  const answerInput = document.getElementById("answerInput");
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  });

  // 题库切换时重置游戏
  const bookSelect = document.getElementById("bookSelect");
  bookSelect.addEventListener("change", () => {
    // 切换封面 + 重置游戏
    changeCover();
    resetGameState();
    showCustomAlert("已切换题库，请重新开始游戏！");
  });
});

// 开始游戏（核心修复：路径适配 PakEPlus 打包）
function startGame() {
  if (isGameRunning) {
    showCustomAlert("游戏已在进行中！");
    return;
  }

  const select = document.getElementById("bookSelect");
  const relativePath = select.value; // 原路径，如 data/129.json

  if (!relativePath) {
    showCustomAlert("请先选择题库！");
    return;
  }

  resetGameState();
  isGameRunning = true;

  // ========== 核心修复：适配 PakEPlus 打包后的路径 ==========
  // 方案1：适配 PakEPlus 本地服务器/打包后的绝对路径
  let fullPath = '';
  // 判断是否是 PakEPlus 调试环境（127.0.0.1 开头）
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    // 本地调试：直接用相对路径
    fullPath = relativePath;
  } else {
    // 打包后：拼接应用根路径（PakEPlus 打包后，文件在应用根目录）
    fullPath = './' + relativePath;
  }

  // 方案2（备选）：如果方案1不行，用 import.meta.url 解析根路径（兼容所有打包工具）
  // const baseUrl = new URL('.', import.meta.url).href;
  // const fullPath = baseUrl + relativePath;

  fetch(fullPath)
    .then(res => {
      if (!res.ok) throw new Error(`加载失败，状态码：${res.status}（路径：${fullPath}）`);
      return res.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("题库为空或格式错误");
      }
      allQuestions = data;
      remainingQuestions = [...allQuestions];
      shuffleArray(remainingQuestions);

      score = 0;
      document.getElementById("score").innerText = score;
      nextQuestion();
      // 自动显示第一条提示
      setTimeout(() => {
        getMoreTip(true);
      }, 100);
    })
    .catch(err => {
      resetGameState();
      // 新增：提示具体路径，方便排查
      showCustomAlert(`题库加载失败：${err.message}\n请检查文件路径是否正确`);
      console.error("题库加载错误：", err);
    });
}

// 重置游戏状态（统一重置所有变量）
function resetGameState() {
  currentQuestion = null;
  allQuestions = [];
  remainingQuestions = [];
  usedTipIndexes = [];
  score = 0;
  isGameRunning = false;
  hasViewedAnswer = false;
  answerViewCount = 0; // 重置查看答案次数
  document.getElementById("score").innerText = score;
  document.getElementById("answerInput").value = "";
  document.getElementById("tipsBox").innerText = "请选择题库并开始游戏";
}

// 下一题
function nextQuestion() {
  hasViewedAnswer = false;
  if (remainingQuestions.length === 0) {
    document.getElementById("tipsBox").innerText = `全部题目已答完！最终得分：${score}\n剩余查看答案次数：${MAX_ANSWER_VIEW - answerViewCount}`;
    isGameRunning = false;
    currentQuestion = null;
    return;
  }

  const randIndex = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions.splice(randIndex, 1)[0];
  usedTipIndexes = [];
  document.getElementById("tipsBox").innerText = "点击「获取提示」开始猜题～";
  document.getElementById("answerInput").value = "";
}

// 获取提示（不扣分）
function getMoreTip(isAuto = false) {
  if (!currentQuestion) {
    if (!isAuto) {
      showCustomAlert("请先开始游戏！");
    }
    return;
  }

  // 查看答案后点击提示，切换新题
  if (hasViewedAnswer) {
    nextQuestion();
    setTimeout(() => {
      getMoreTip(true);
    }, 50);
    return;
  }

  const tips = currentQuestion.tips || [];
  const total = tips.length;
  
  if (total === 0) {
    if (!isAuto) {
      showCustomAlert("本题暂无提示！");
    }
    return;
  }
  
  if (usedTipIndexes.length >= total) {
    if (!isAuto) {
      showCustomAlert("已经没有更多提示了");
    }
    return;
  }

  // 不扣分，仅显示提示
  const unused = [];
  for (let i = 0; i < total; i++) {
    if (!usedTipIndexes.includes(i)) unused.push(i);
  }

  const rand = unused[Math.floor(Math.random() * unused.length)];
  usedTipIndexes.push(rand);

  const tipText = `提示${usedTipIndexes.length}：${tips[rand]}`;
  const box = document.getElementById("tipsBox");
  const defaultTexts = ["请选择题库并开始游戏", "请获取提示，开始猜题", "点击「获取提示」开始猜题～"];
  
  if (defaultTexts.includes(box.innerText)) {
    box.innerText = tipText;
  } else {
    box.innerText += "\n" + tipText;
  }

  box.scrollTop = box.scrollHeight;
}

// 提交答案（保留加分）
function submitAnswer() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  const input = document.getElementById("answerInput");
  const userAns = input.value.trim().toLowerCase();

  if (userAns === "") {
    showCustomAlert("请输入答案");
    return;
  }

  const correctAnswers = Array.isArray(currentQuestion.answer) 
    ? currentQuestion.answer.map(ans => ans.trim().toLowerCase()) 
    : [currentQuestion.answer.trim().toLowerCase()];

  const isCorrect = correctAnswers.includes(userAns);

  if (isCorrect) {
    score += 10;
    document.getElementById("score").innerText = score;
    input.value = "";
    showCustomAlert(`回答正确！+10分\n剩余查看答案次数：${MAX_ANSWER_VIEW - answerViewCount}`);

    if (score === 100) {
      showCustomAlert(`🎉 得分100分！获得胜利！\n本轮查看答案次数：${answerViewCount}/${MAX_ANSWER_VIEW}`);
      resetGameState();
      return;
    }

    nextQuestion();
  } else {
    showCustomAlert("答案不对，再试试～");
  }
}

// 查看答案（不扣分，限制5次）
function showAnswer() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  // 检查查看答案次数
  if (answerViewCount >= MAX_ANSWER_VIEW) {
    showCustomAlert(`查看答案次数已用完（${MAX_ANSWER_VIEW}/${MAX_ANSWER_VIEW}），请答题或跳过！`);
    return;
  }

  // 不扣分，仅计数
  answerViewCount++;
  // 显示答案
  let answerText = "";
  if (Array.isArray(currentQuestion.answer)) {
    answerText = `正确答案：${currentQuestion.answer.join(" / ")}\n剩余查看答案次数：${MAX_ANSWER_VIEW - answerViewCount}`;
  } else {
    answerText = `正确答案：${currentQuestion.answer}\n剩余查看答案次数：${MAX_ANSWER_VIEW - answerViewCount}`;
  }
  
  const box = document.getElementById("tipsBox");
  box.innerText = answerText;
  box.scrollTop = box.scrollHeight;

  hasViewedAnswer = true;
  document.getElementById("answerInput").value = "";
  
  // 提示次数使用情况
  if (answerViewCount === MAX_ANSWER_VIEW) {
    showCustomAlert(`已用完${MAX_ANSWER_VIEW}次查看答案机会！`);
  }
}

// 跳过本题（扣1分）
function skipQuestion() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  // 跳过扣1分，最低0分
  score = Math.max(0, score - 1);
  document.getElementById("score").innerText = score;
  
  nextQuestion();
  showCustomAlert(`跳过本题扣1分，当前分数：${score}`);
}

// 退出游戏
function exitGame() {
  resetGameState();
  showCustomAlert(`已退出游戏\n本轮查看答案次数：${answerViewCount}/${MAX_ANSWER_VIEW}`);
}

// 自定义弹窗
function showCustomAlert(msg) {
  document.getElementById("alertText").innerText = msg;
  document.getElementById("customAlert").style.display = "flex";
}

function closeCustomAlert() {
  document.getElementById("customAlert").style.display = "none";
}

// 切换封面（补充：封面路径也适配 PakEPlus）
function changeCover() {
  const select = document.getElementById("bookSelect");
  const coverImg = document.getElementById("coverImg");
  const selectedOption = select.options[select.selectedIndex];
  const coverSrc = selectedOption.getAttribute("data-cover");
  
  if (coverSrc) {
    // 适配封面图片路径
    let fullCoverPath = '';
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
      fullCoverPath = coverSrc;
    } else {
      fullCoverPath = './' + coverSrc;
    }
    coverImg.src = fullCoverPath;
  }
}

// 随机打乱数组
function shuffleArray(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) return;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}