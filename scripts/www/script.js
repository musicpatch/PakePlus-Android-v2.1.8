let currentQuestion = null;
let allQuestions = [];
let remainingQuestions = [];
let usedTipIndexes = [];
let score = 0;
let isGameRunning = false;
let hasViewedAnswer = false;
let answerViewCount = 0;
const MAX_ANSWER_VIEW = 5;

// 1. 彻底修复路径逻辑（现在路径已经正确，这段能正常工作）
function fixFilePath(path) {
  if (!path) return '';
  
  // 先清理路径中的多余斜杠和 ./
  const cleanPath = path.replace(/\/+/g, '/').replace(/\/\.\//g, '/').replace(/^\.\//, '');
  
  // 开发环境
  if (window.location.protocol.startsWith('http')) {
    return cleanPath;
  }
  
  // 本地 file 协议
  try {
    const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1).replace(/\/+$/, '/');
    return basePath + cleanPath;
  } catch (e) {
    return cleanPath;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const answerInput = document.getElementById("answerInput");
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  });

  const bookSelect = document.getElementById("bookSelect");
  bookSelect.addEventListener("change", () => {
    changeCover();
    resetGameState();
    showCustomAlert("已切换题库，请重新开始游戏！");
  });
});

// 2. 重点修改：使用 XMLHttpRequest 替代 fetch（兼容 file:// 协议的关键）
function startGame() {
  if (isGameRunning) {
    showCustomAlert("游戏已在进行中！");
    return;
  }

  const select = document.getElementById("bookSelect");
  const originalPath = select.value;

  if (!originalPath) {
    showCustomAlert("请先选择题库！");
    return;
  }

  const realPath = fixFilePath(originalPath);
  resetGameState();
  isGameRunning = true;

  // ========== 这里是核心修改：用 XMLHttpRequest 代替 fetch ==========
  const xhr = new XMLHttpRequest();
  xhr.open('GET', realPath, true);
  
  // file协议下，成功状态通常是 0，而不是 200
  xhr.onload = function() {
    if (xhr.status === 200 || xhr.status === 0) {
      try {
        const data = JSON.parse(xhr.responseText);
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error("题库为空或格式错误");
        }
        allQuestions = data;
        remainingQuestions = [...allQuestions];
        shuffleArray(remainingQuestions);

        score = 0;
        document.getElementById("score").innerText = score;
        nextQuestion();
        setTimeout(() => {
          getMoreTip(true);
        }, 100);
      } catch (err) {
        resetGameState();
        const errorMsg = `解析题库失败：${err.message}\n请检查JSON格式`;
        showCustomAlert(errorMsg);
        console.error("解析错误：", err);
      }
    } else {
      resetGameState();
      const errorMsg = `无法读取文件（状态码：${xhr.status}）\n请检查文件是否存在：\n${realPath}`;
      showCustomAlert(errorMsg);
    }
  };

  // 网络错误处理
  xhr.onerror = function() {
    resetGameState();
    const errorMsg = `访问文件失败！\n请检查：\n1. 文件是否存在于 ${realPath}\n2. 文件名称是否拼写正确`;
    showCustomAlert(errorMsg);
    console.error("文件读取错误：", xhr);
  };

  xhr.send();
}

function resetGameState() {
  currentQuestion = null;
  allQuestions = [];
  remainingQuestions = [];
  usedTipIndexes = [];
  score = 0;
  isGameRunning = false;
  hasViewedAnswer = false;
  answerViewCount = 0;
  document.getElementById("score").innerText = score;
  document.getElementById("answerInput").value = "";
  document.getElementById("tipsBox").innerText = "请选择题库并开始游戏";
}

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

function getMoreTip(isAuto = false) {
  if (!currentQuestion) {
    if (!isAuto) {
      showCustomAlert("请先开始游戏！");
    }
    return;
  }

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

function showAnswer() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  if (answerViewCount >= MAX_ANSWER_VIEW) {
    showCustomAlert(`查看答案次数已用完（${MAX_ANSWER_VIEW}/${MAX_ANSWER_VIEW}），请答题或跳过！`);
    return;
  }

  answerViewCount++;
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
  
  if (answerViewCount === MAX_ANSWER_VIEW) {
    showCustomAlert(`已用完${MAX_ANSWER_VIEW}次查看答案机会！`);
  }
}

function skipQuestion() {
  if (!currentQuestion) {
    showCustomAlert("请先开始游戏！");
    return;
  }

  score = Math.max(0, score - 1);
  document.getElementById("score").innerText = score;
  
  nextQuestion();
  showCustomAlert(`跳过本题扣1分，当前分数：${score}`);
}

function exitGame() {
  resetGameState();
  showCustomAlert(`已退出游戏\n本轮查看答案次数：${answerViewCount}/${MAX_ANSWER_VIEW}`);
}

function showCustomAlert(msg) {
  document.getElementById("alertText").innerText = msg;
  document.getElementById("customAlert").style.display = "flex";
}

function closeCustomAlert() {
  document.getElementById("customAlert").style.display = "none";
}

function changeCover() {
  const select = document.getElementById("bookSelect");
  const coverImg = document.getElementById("coverImg");
  const selectedOption = select.options[select.selectedIndex];
  const coverSrc = selectedOption.getAttribute("data-cover");
  
  if (coverSrc) {
    coverImg.src = fixFilePath(coverSrc);
  }
}

function shuffleArray(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) return;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}