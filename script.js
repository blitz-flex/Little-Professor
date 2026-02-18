let score = 0;
let currentProblem;
let currentAnswer;
let currentAttempts = 0;
let totalQuestions = 10;
let timeLeft = 60;
let initialTime = 60;
let timerInterval;
let isSubmitting = false;
let currentMinNum = 0;
let currentMaxNum = 10;
let initialMinNum = 0;
let initialMaxNum = 10;
let lastAnswer = null;
let currentTier = 0;
let streak = 0;
let gameEnded = false;

function generateRandNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomOperation() {
    let operations = ["+", "-"];
    if (currentTier >= 1) operations.push("*");
    if (currentTier >= 2) operations.push("/");
    return operations[Math.floor(Math.random() * operations.length)];
}

function generateRandomProblem() {
    let num1;
    const chainChance = currentTier >= 2 ? 0.7 : 0.3;
    if (streak >= 1 && lastAnswer !== null && Math.random() < chainChance && lastAnswer < currentMaxNum * 2) {
        num1 = lastAnswer;
    } else {
        num1 = generateRandNum(currentMinNum, currentMaxNum);
    }

    let num2 = generateRandNum(currentMinNum, currentMaxNum);

    if (currentTier >= 3) {
        let op1 = generateRandomOperation();
        let op2 = generateRandomOperation();
        if (op1 === "/") op1 = "+";
        if (op2 === "/") op2 = "*";

        let n1 = num1, n2 = num2, n3 = generateRandNum(currentMinNum, Math.floor(currentMaxNum / 2));
        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];

        let intermediate;
        if (op1 === "+") intermediate = n1 + n2;
        else if (op1 === "-") intermediate = n1 - n2;
        else intermediate = n1 * n2;

        if (op2 === "-" && intermediate < n3) [intermediate, n3] = [n3, intermediate];

        let finalResult;
        if (op2 === "+") finalResult = intermediate + n3;
        else if (op2 === "-") finalResult = intermediate - n3;
        else finalResult = intermediate * n3;

        return {
            problem: `(${n1} ${op1} ${n2}) ${op2} ${n3}`,
            answer: finalResult
        };
    }

    const operation = generateRandomOperation();
    let correctAnswer;
    if (operation === "+") {
        correctAnswer = num1 + num2;
    } else if (operation === "-") {
        if (num1 < num2) [num1, num2] = [num2, num1];
        correctAnswer = num1 - num2;
    } else if (operation === "*") {
        correctAnswer = num1 * num2;
    } else {
        num2 = generateRandNum(Math.max(1, Math.floor(currentMinNum / 2)), Math.max(2, Math.floor(currentMaxNum / 2)));
        let tempAnswer = generateRandNum(currentMinNum, currentMaxNum);
        num1 = num2 * tempAnswer;
        correctAnswer = tempAnswer;
    }

    return {
        problem: `${num1} ${operation} ${num2}`,
        answer: correctAnswer,
    };
}

function selectLevel(level, element) {
    document.getElementById("level").value = level;
    document.querySelectorAll(".level-card").forEach(card => card.classList.remove("selected"));
    element.classList.add("selected");
}

function startGame() {
    score = 0;
    currentAttempts = 0;
    totalQuestions = 10;
    isSubmitting = false;
    gameEnded = false;
    lastAnswer = null;
    currentTier = 0;
    streak = 0;

    const level = parseInt(document.getElementById("level").value);

    if (level === 1) {
        timeLeft = 60;
        currentMinNum = 0;
        currentMaxNum = 10;
    } else if (level === 2) {
        timeLeft = 120;
        currentMinNum = 10;
        currentMaxNum = 20;
    } else {
        timeLeft = 180;
        currentMinNum = 20;
        currentMaxNum = 30;
    }
    initialTime = timeLeft;
    initialMinNum = currentMinNum;
    initialMaxNum = currentMaxNum;

    // Switch screens
    document.getElementById("start-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");

    // Reset UI
    document.getElementById("game-score").textContent = "0";
    document.querySelector(".feedback").textContent = "";
    document.querySelector(".feedback").className = "feedback";
    document.getElementById("time-left").textContent = timeLeft;
    document.getElementById("timer-bar").style.width = "100%";

    generateProblem();
    startTimer();
}

function generateProblem() {
    if (totalQuestions === 0) {
        endGame();
        return;
    }

    const { problem, answer } = generateRandomProblem();
    currentProblem = problem;
    currentAnswer = answer;
    lastAnswer = answer;
    currentAttempts = 0;
    totalQuestions--;

    const currentQuestionNumber = 10 - totalQuestions;
    document.getElementById("question-num").textContent = `${currentQuestionNumber} / 10`;

    const problemElement = document.querySelector(".problem-text");
    problemElement.textContent = problem;

    const feedbackElement = document.querySelector(".feedback");
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";

    generateOptions();
}

function generateOptions() {
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    const options = [currentAnswer];
    while (options.length < 4) {
        let distractor;
        const offset = generateRandNum(1, 10);
        distractor = Math.random() > 0.5 ? currentAnswer + offset : currentAnswer - offset;

        if (distractor !== currentAnswer && !options.includes(distractor)) {
            options.push(distractor);
        }
    }

    options.sort(() => Math.random() - 0.5);

    const labels = ["A", "B", "C", "D"];
    options.forEach((opt, index) => {
        const button = document.createElement("button");
        button.className = "option-btn";
        button.innerHTML = `
            <span class="option-label">${labels[index]}</span>
            <span class="option-value">${opt}</span>
        `;
        button.onclick = () => submitAnswer(opt);
        optionsContainer.appendChild(button);
    });
}

function submitAnswer(userAnswer) {
    if (isSubmitting) return;

    const feedbackElement = document.querySelector(".feedback");
    const optionButtons = document.querySelectorAll(".option-btn");

    optionButtons.forEach(btn => btn.disabled = true);
    isSubmitting = true;

    if (userAnswer === currentAnswer) {
        score++;
        streak++;

        let isLevelUp = false;
        if (currentTier >= 1) currentMaxNum += 2;
        if (streak >= 2) {
            currentTier++;
            currentMaxNum += 8;
            currentMinNum += 2;
            streak = 0;
            isLevelUp = true;
        }

        if (isLevelUp) {
            feedbackElement.textContent = `Level Up! Complexity Tier ${currentTier}`;
            feedbackElement.className = "feedback difficulty-up";
        } else {
            feedbackElement.textContent = "Correct!";
            feedbackElement.className = "feedback correct";
        }

        document.querySelector(".problem-card").classList.add("correct-answer-animation");

        setTimeout(() => {
            document.querySelector(".problem-card").classList.remove("correct-answer-animation");
            generateProblem();
            isSubmitting = false;
        }, 800);
    } else {
        streak = 0;
        currentTier = 0;
        lastAnswer = null;
        currentMaxNum = initialMaxNum;
        currentMinNum = initialMinNum;

        feedbackElement.textContent = `Incorrect! ${currentProblem} = ${currentAnswer}`;
        feedbackElement.className = "feedback incorrect";

        setTimeout(() => {
            generateProblem();
            isSubmitting = false;
        }, 2000);
    }

    document.getElementById("game-score").textContent = score;
}



function endGame() {
    if (gameEnded) return;
    gameEnded = true;
    clearInterval(timerInterval);

    document.getElementById("game-screen").classList.remove("active");

    const percentage = (score / 10) * 100;
    const resultContainer = document.createElement("div");
    resultContainer.className = "result-container screen active";

    let message = "";
    let messageClass = "";
    if (percentage >= 70) {
        message = "Excellent work!";
        messageClass = "shimmer-text";
    } else if (percentage >= 50) {
        message = "Good effort! Try again!";
    } else {
        message = "Keep practicing!";
    }

    resultContainer.innerHTML = `
        <h2 class="${messageClass}">Game Over!</h2>
        <p class="subtitle">${message}</p>
        <div class="stat-pill" style="min-width: 200px; margin: 1rem 0;">
            <span class="label">FINAL SCORE</span>
            <span class="value">${score} / 10 (${percentage}%)</span>
        </div>
        <button id="try-again" class="primary-btn">Try Again</button>
    `;

    resultContainer.querySelector("#try-again").onclick = () => {
        resultContainer.remove();
        const activeFireworks = document.getElementById("active-fireworks");
        if (activeFireworks) {
            activeFireworks.remove();
        }
        document.getElementById("start-screen").classList.add("active");
    };

    document.querySelector(".app-container").appendChild(resultContainer);

    if (percentage >= 70) {
        launchFireworks(resultContainer);
    }
}

function launchFireworks(parent) {
    const container = document.createElement("div");
    container.className = "fireworks-container";
    container.id = "active-fireworks";
    parent.appendChild(container);

    function scheduleFirework() {
        if (!document.getElementById("active-fireworks")) return;

        const x = Math.random() * 80 + 10;
        const targetY = Math.random() * 50 + 10; // % of parent card
        const duration = Math.random() * 0.5 + 0.8;

        createRocket(container, x, targetY, duration);

        setTimeout(scheduleFirework, Math.random() * 400 + 400);
    }

    scheduleFirework();
}

function createRocket(container, x, targetY, duration) {
    const rocket = document.createElement("div");
    rocket.className = "rocket";
    rocket.style.left = x + "%";
    rocket.style.setProperty("--target-y", targetY + "%");
    rocket.style.setProperty("--duration", duration + "s");

    container.appendChild(rocket);

    setTimeout(() => {
        explodeFirework(container, x, targetY);
        rocket.remove();
    }, duration * 1000);
}

function explodeFirework(container, x, targetY) {
    // Sophisticated 'Jewel & Gold' palette
    const palettes = [
        ["#FFD700", "#FFA500", "#FF4500"], // Gold & Sunset
        ["#00F5FF", "#00E5EE", "#7FFFD4"], // Cyan & Aquamarine
        ["#FF00FF", "#DA70D6", "#BA55D3"], // Magenta & Orchid
        ["#ADFF2F", "#32CD32", "#00FF7F"]  // Lime & Green
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "firework-particle";
        const color = palette[Math.floor(Math.random() * palette.length)];
        particle.style.backgroundColor = color;
        particle.style.left = x + "%";
        particle.style.top = targetY + "%";

        // Sophisticated glow
        particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        // Randomize velocity for a more 'natural' ragged edge explosion
        const velocity = Math.random() * 250 + 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty("--tx", tx + "px");
        particle.style.setProperty("--ty", ty + "px");

        // Randomize duration slightly for each particle
        const duration = Math.random() * 0.6 + 1.2;
        particle.style.animation = `fireworkExplode ${duration}s cubic-bezier(0, 0, 0.4, 1) forwards`;

        container.appendChild(particle);

        if (Math.random() > 0.7) {
            createSparkle(container, x + (tx / window.innerWidth * 100), targetY + (ty / window.innerHeight * 100));
        }

        setTimeout(() => particle.remove(), duration * 1000);
    }
}

function createSparkle(container, x, y) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = x + "%";
    sparkle.style.top = y + "%";
    sparkle.style.setProperty("--duration", (Math.random() * 0.5 + 0.5) + "s");

    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").textContent = timeLeft;

        const progress = (timeLeft / initialTime) * 100;
        document.getElementById("timer-bar").style.width = `${progress}%`;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function initBackground() {
    const container = document.getElementById("symbols-container");
    const symbols = ["+", "−", "×", "÷", "=", "∑", "π", "∞", "√"];

    for (let i = 0; i < 20; i++) {
        const symbol = document.createElement("div");
        symbol.className = "bg-symbol";
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        symbol.style.left = Math.random() * 100 + "vw";
        symbol.style.top = Math.random() * 100 + "vh";
        symbol.style.fontSize = Math.random() * 20 + 20 + "px";
        symbol.style.animationDuration = Math.random() * 10 + 15 + "s";
        symbol.style.animationDelay = Math.random() * -20 + "s";

        container.appendChild(symbol);
    }
}

// Initial state
document.addEventListener("DOMContentLoaded", () => {
    initBackground();
    const firstLevel = document.querySelector(".level-card");
    if (firstLevel) selectLevel(1, firstLevel);
});
