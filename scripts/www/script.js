let currentQuestion = null;
let allQuestions = [];
let remainingQuestions = [];
let usedTipIndexes = [];
let score = 0;

// 开始游戏
function startGame() {
  const select = document.getElementById("bookSelect");
  const path = select.value;

  if (!path) {
    showCustomAlert("请先选择题库！");
    return;
  }

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error("加载失败");
      return res.json();
    })
    .then(data => {
      if (!data || data.length === 0) {
        showCustomAlert("题库为空");
        return;
      }
      // 大题：随机打乱，不重复
      allQuestions = data;
      remainingQuestions = [...allQuestions];
      shuffleArray(remainingQuestions);

      score = 0;
      document.getElementById("score").innerText = score;
      nextQuestion();
      showCustomAlert("游戏开始！");
    })
    .catch(err => {
      showCustomAlert("题库加载失败，请检查文件路径");
      console.error(err);
    });
}

// 下一题（大题不重复）
function nextQuestion() {
  if (remainingQuestions.length === 0) {
    document.getElementById("tipsBox").innerText = "全部题目已答完！";
    currentQuestion = null;
    return;
  }

  // 随机取一题（不会再出现）
  const randIndex = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions.splice(randIndex, 1)[0];
  usedTipIndexes = []; // 重置提示随机记录
  document.getElementById("tipsBox").innerText = "请获取提示，开始猜题";
}

// 获取提示：小题内随机不重复
function getMoreTip() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  const total = currentQuestion.tips.length;
  if (usedTipIndexes.length >= total) {
    showCustomAlert("已经没有更多提示了");
    return;
  }

  // 找出没用过的提示索引
  const unused = [];
  for (let i = 0; i < total; i++) {
    if (!usedTipIndexes.includes(i)) unused.push(i);
  }

  // 随机抽一条
  const rand = unused[Math.floor(Math.random() * unused.length)];
  usedTipIndexes.push(rand);

  const tipText = `提示${usedTipIndexes.length}：${currentQuestion.tips[rand]}`;
  const box = document.getElementById("tipsBox");

  if (box.innerText === "请选择题库并开始游戏" || box.innerText === "请获取提示，开始猜题") {
    box.innerText = tipText;
  } else {
    box.innerText += "\n" + tipText;
  }

  box.scrollTop = box.scrollHeight;
}

// 提交答案（新增：支持多个别名答案）
function submitAnswer() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  const input = document.getElementById("answerInput");
  const userAns = input.value.trim();

  if (userAns === "") {
    showCustomAlert("请输入答案");
    return;
  }

  // 核心改动：支持单个答案 或 多个别名答案
  let isCorrect = false;
  if (Array.isArray(currentQuestion.answer)) {
    // 如果answer是数组（多个别名），判断输入是否在数组里
    isCorrect = currentQuestion.answer.includes(userAns);
  } else {
    // 如果是普通字符串，按原逻辑判断
    isCorrect = userAns === currentQuestion.answer;
  }

  if (isCorrect) {
    score += 10;
    document.getElementById("score").innerText = score;
    input.value = "";
    showCustomAlert("回答正确！+10分");

    if (score >= 100) {
      showCustomAlert("得分100分！获得胜利，本轮游戏结束。");
      score = 0;
      currentQuestion = null;
      remainingQuestions = [];
      document.getElementById("score").innerText = score;
      document.getElementById("tipsBox").innerText = "请选择题库并开始游戏";
      return;
    }

    nextQuestion();
  } else {
    showCustomAlert("答案不对，再试试～");
  }
}

// 查看答案
function showAnswer() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }
  // 优化：如果是多个答案，展示所有正确答案
  let answerText = "";
  if (Array.isArray(currentQuestion.answer)) {
    answerText = "正确答案：" + currentQuestion.answer.join(" / ");
  } else {
    answerText = "正确答案：" + currentQuestion.answer;
  }
  showCustomAlert(answerText);
}

// 跳过本题
function skipQuestion() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }
  showCustomAlert("跳过本题！");
  nextQuestion();
}

// 退出游戏
function exitGame() {
  currentQuestion = null;
  allQuestions = [];
  remainingQuestions = [];
  usedTipIndexes = [];
  score = 0;
  document.getElementById("score").innerText = score;
  document.getElementById("answerInput").value = "";
  document.getElementById("tipsBox").innerText = "请选择题库并开始游戏";
  showCustomAlert("已退出游戏");
}

// 自定义弹窗
function showCustomAlert(msg) {
  document.getElementById("alertText").innerText = msg;
  document.getElementById("customAlert").style.display = "flex";
}

function closeCustomAlert() {
  document.getElementById("customAlert").style.display = "none";
}

// 切换封面
function changeCover() {
  const select = document.getElementById("bookSelect");
  const coverImg = document.getElementById("coverImg");
  const selectedOption = select.options[select.selectedIndex];
  const coverSrc = selectedOption.getAttribute("data-cover");
  if (coverSrc) {
    coverImg.src = coverSrc;
  }
}

// 随机打乱数组
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}