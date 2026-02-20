/* =========================================================
   Little Professor — Adaptive Testing System
   =========================================================

   On correct answer   → difficulty + 1
   On 1 mistake        → difficulty - 1
   On 2 consecutive    → difficulty - 3

   ========================================================= */

let score = 0;
let currentAnswer = null;
let currentProblem = "";
let timeLeft = 60;
let initialTime = 60;
let timerInterval = null;
let isSubmitting = false;
let gameEnded = false;
let maxQuestions = 10;
let totalQuestions = 10;

// Adaptive difficulty
let difficulty = 5;   // current difficulty level (1–∞)
let consecutiveMistakes = 0;   // streak of wrong answers
let correctStreak = 0;   // counts consecutive correct answers
let selectedRank = 1;     // 1: Beginner, 2: Intermediate, 3: Professor

// Uniqueness guard: stores string keys of asked problems
const askedQuestions = new Set();

// Difficulty → number ranges & operations
function getDifficultyParams(d) {
    // Current Level calculation (1-4)
    // Progresses to next level every 2 correct answers
    let stage = Math.min(4, Math.ceil(d / 2));

    let min, max, ops, compound = false, triple = false;

    // Rank Multiplier: Makes numbers larger based on selected rank
    const mult = selectedRank;

    switch (stage) {
        case 1: // Stage 1 (Novice): Basic addition
            min = 0;
            max = 10 + (mult - 1) * 10; // Beginner: 10, Intermediate: 20, Professor: 30
            ops = ["+"];
            break;
        case 2: // Stage 2 (Intermediate): Addition & Subtraction
            min = 0;
            max = 20 + (mult - 1) * 15; // Beginner: 20, Intermediate: 35, Professor: 50
            ops = ["+", "-"];
            break;
        case 3: // Stage 3 (Advanced): Multiplication and range boost
            min = 2;
            max = 30 + (mult - 1) * 20; // Beginner: 30, Intermediate: 50, Professor: 70
            ops = ["+", "-", "*"];
            break;
        case 4: // Stage 4 (Mastery): Complex & Division
            const bonus = Math.max(0, d - 8);
            min = 5 + (mult - 1) * 5;
            max = 50 + (mult - 1) * 25 + (bonus * 5); // Grows beyond 100 on Professor
            ops = ["+", "-", "*", "/"];
            compound = true;
            triple = true; // Flag for level 4
            break;
    }

    return { min, max, ops, compound, triple, stageName: stage };
}

//  Random helpers
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Problem generator
// Returns { problem: string, answer: number } with answer > 0
function buildProblem() {
    const { min, max, ops, compound, triple } = getDifficultyParams(difficulty);

    // Triple (three-step) for Level 4
    if (triple && Math.random() < 0.6) {
        return buildTripleProblem(min, max, ops);
    }
    // Compound (two-step) problems at high difficulty
    if (compound && Math.random() < 0.45) {
        return buildCompoundProblem(min, max, ops);
    }
    return buildSimpleProblem(min, max, ops);
}

function buildSimpleProblem(min, max, ops) {
    const MAX_TRIES = 200;
    for (let t = 0; t < MAX_TRIES; t++) {
        let op = pickFrom(ops);
        let a = randInt(min, max);
        let b = randInt(Math.max(1, min), max);
        let answer;

        if (op === "+") {
            answer = a + b;
        } else if (op === "-") {
            if (a < b) [a, b] = [b, a];   // guarantee a >= b
            answer = a - b;
        } else if (op === "*") {
            // keep numbers smaller for readability
            const cap = Math.min(max, 12);
            a = randInt(Math.max(1, min), cap);
            b = randInt(Math.max(1, min), cap);
            answer = a * b;
        } else {
            // division: construct as b * answer
            b = randInt(Math.max(2, min), Math.min(12, max));
            answer = randInt(Math.max(1, min), Math.min(12, max));
            a = b * answer;
            op = "/";
        }

        if (answer <= 0) continue;           // skip non-positive answers
        const key = `${a}${op}${b}`;
        if (askedQuestions.has(key)) continue;

        return { problem: `${a} ${op} ${b}`, answer, key };
    }
    // Fallback: simple addition
    const a = randInt(1, 10), b = randInt(1, 10);
    return { problem: `${a} + ${b}`, answer: a + b, key: `${a}+${b}` };
}

function buildCompoundProblem(min, max, ops) {
    const MAX_TRIES = 200;
    const safeOps = ops.filter(o => o !== "/"); // avoid division in compound for clarity
    if (safeOps.length === 0) return buildSimpleProblem(min, max, ops);

    for (let t = 0; t < MAX_TRIES; t++) {
        const op1 = pickFrom(safeOps);
        const op2 = pickFrom(safeOps);
        const cap = Math.min(max, 20);

        let n1 = randInt(Math.max(1, min), cap);
        let n2 = randInt(Math.max(1, min), cap);
        let n3 = randInt(Math.max(1, min), Math.max(2, Math.floor(cap / 2)));

        // Prevent negative intermediate
        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];

        let inter;
        if (op1 === "+") inter = n1 + n2;
        else if (op1 === "-") inter = n1 - n2;
        else inter = n1 * n2;

        if (inter <= 0) continue;
        if (op2 === "-" && inter < n3) continue; // Ensure no negative results

        let answer;
        if (op2 === "+") answer = inter + n3;
        else if (op2 === "-") answer = inter - n3;
        else answer = inter * n3;

        if (answer <= 0) continue;

        const key = `(${n1}${op1}${n2})${op2}${n3}`;
        if (askedQuestions.has(key)) continue;

        return { problem: `(${n1} ${op1} ${n2}) ${op2} ${n3}`, answer, key };
    }
    return buildSimpleProblem(min, max, ops);
}

function buildTripleProblem(min, max, ops) {
    const MAX_TRIES = 200;
    const safeOps = ops.filter(o => o !== "/");
    for (let t = 0; t < MAX_TRIES; t++) {
        const op1 = pickFrom(safeOps);
        const op2 = pickFrom(safeOps);
        const op3 = pickFrom(safeOps);
        const cap = Math.min(max, 15);

        let n1 = randInt(Math.max(1, min), cap);
        let n2 = randInt(Math.max(1, min), cap);
        let n3 = randInt(Math.max(1, min), cap);
        let n4 = randInt(1, 10);

        // Step 1: Calculate (n1 op1 n2)
        let res1;
        if (op1 === "+") res1 = n1 + n2;
        else if (op1 === "-") {
            if (n1 < n2) [n1, n2] = [n2, n1];
            res1 = n1 - n2;
        } else res1 = n1 * n2;

        // Step 2: Calculate (res1 op2 n3)
        let res2;
        if (op2 === "+") res2 = res1 + n3;
        else if (op2 === "-") {
            if (res1 < n3) continue;
            res2 = res1 - n3;
        } else res2 = res1 * n3;

        // Step 3: Calculate (res2 op3 n4)
        let res3;
        if (op3 === "+") res3 = res2 + n4;
        else if (op3 === "-") {
            if (res2 < n4) continue;
            res3 = res2 - n4;
        } else res3 = res2 * n4;

        if (res3 > 0 && res3 < 500) {
            const problem = `((${n1} ${op1} ${n2}) ${op2} ${n3}) ${op3} ${n4}`;
            const key = `((${n1}${op1}${n2})${op2}${n3})${op3}${n4}`;
            if (askedQuestions.has(key)) continue;
            return { problem, answer: res3, key };
        }
    }
    return buildCompoundProblem(min, max, ops);
}

//  Distractor generator (all positive)
function generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);
    const spread = Math.max(3, Math.floor(correctAnswer * 0.4));

    let tries = 0;
    while (options.size < 4 && tries < 500) {
        tries++;
        // Generate distractors in a range, offset from correct answer
        const offset = randInt(1, spread);
        const candidate = Math.random() < 0.5
            ? correctAnswer + offset
            : Math.max(1, correctAnswer - offset);   // clamp to positive
        if (candidate > 0) options.add(candidate);
    }

    // If still short, fill with sequential positives
    let fill = correctAnswer + spread;
    while (options.size < 4) {
        options.add(++fill);
    }

    return [...options].sort(() => Math.random() - 0.5);
}


function generateProblem() {
    if (totalQuestions === 0) { endGame(); return; }

    const { problem, answer, key } = buildProblem();
    askedQuestions.add(key);

    currentProblem = problem;
    currentAnswer = answer;
    totalQuestions--;

    // Update header
    const current = maxQuestions - totalQuestions;
    document.getElementById("question-num").textContent = `${current} / ${maxQuestions}`;

    // Display problem
    document.querySelector(".problem-text").textContent = problem;
    const { stageName } = getDifficultyParams(difficulty);
    document.getElementById("game-level").textContent = stageName;

    // Clear feedback
    const fb = document.querySelector(".feedback");
    fb.textContent = "";
    fb.className = "feedback";

    // Render options
    const opts = generateOptions(answer);
    const labels = ["A", "B", "C", "D"];
    const container = document.getElementById("options-container");
    container.innerHTML = "";
    opts.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerHTML = `
            <span class="option-label">${labels[i]}</span>
            <span class="option-value">${opt}</span>
        `;
        btn.onclick = () => submitAnswer(opt);
        container.appendChild(btn);
    });
    startTimer();
    isSubmitting = false;
}

function submitAnswer(userAnswer) {
    if (isSubmitting) return;
    isSubmitting = true;
    stopTimer();

    const allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach(b => b.disabled = true);

    // Find clicked button and correct button by their value span text
    let clickedBtn = null;
    let correctBtn = null;
    allBtns.forEach(b => {
        const val = parseInt(b.querySelector(".option-value").textContent);
        if (val === userAnswer) clickedBtn = b;
        if (val === currentAnswer) correctBtn = b;
    });

    if (userAnswer === currentAnswer) {
        // Correct
        score++;
        difficulty++; // Progression: keeps getting harder

        clickedBtn.classList.add("correct");
        allBtns.forEach(b => { if (b !== clickedBtn) b.classList.add("dimmed"); });

        setTimeout(() => {
            generateProblem();
        }, 800);

    } else {
        // Wrong
        // Mistake made: decrease difficulty by 1
        difficulty = Math.max(1, difficulty - 1);

        clickedBtn.classList.add("wrong");
        correctBtn.classList.add("correct"); // show right answer
        allBtns.forEach(b => {
            if (b !== clickedBtn && b !== correctBtn) b.classList.add("dimmed");
        });

        setTimeout(() => {
            generateProblem();
        }, 2000);
    }

}

// Start / End
function selectLevel(level, element) {
    document.getElementById("level").value = level;
    document.querySelectorAll(".level-card").forEach(c => c.classList.remove("selected"));
    element.classList.add("selected");
}

function startGame() {
    // Reset all state
    score = 0;
    gameEnded = false;
    isSubmitting = false;
    consecutiveMistakes = 0;
    askedQuestions.clear();

    const level = parseInt(document.getElementById("level").value);
    selectedRank = level;

    if (level === 1) { // Beginner
        difficulty = 1;
        timeLeft = 60;
        maxQuestions = 15;
    } else if (level === 2) { // Intermediate
        difficulty = 1;
        timeLeft = 120;
        maxQuestions = 25;
    } else { // Professor
        difficulty = 1;
        timeLeft = 180;
        maxQuestions = 35;
    }

    totalQuestions = maxQuestions;
    initialTime = timeLeft;

    // Switch screen
    document.getElementById("start-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");

    // Reset UI
    const { stageName } = getDifficultyParams(difficulty);
    document.getElementById("game-level").textContent = stageName;
    document.getElementById("time-left").textContent = timeLeft;
    document.getElementById("timer-bar").style.width = "100%";
    document.querySelector(".feedback").textContent = "";
    document.querySelector(".feedback").className = "feedback";

    generateProblem();
}

function endGame() {
    if (gameEnded) return;
    gameEnded = true;
    clearInterval(timerInterval);

    document.getElementById("game-screen").classList.remove("active");

    const percentage = Math.round((score / maxQuestions) * 100);
    let message = "", msgClass = "";
    if (percentage >= 70) { message = "Excellent work!"; msgClass = "shimmer-text"; }
    else if (percentage >= 50) { message = "Good effort! Try again!"; }
    else { message = "Keep practicing!"; }

    const resultContainer = document.createElement("div");
    resultContainer.className = "result-container screen active";
    resultContainer.innerHTML = `
        <h2 class="${msgClass}">Game Over!</h2>
        <p class="subtitle">${message}</p>
        <div class="stats-group" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin: 1.5rem 0;">
            <div class="stat-pill" style="min-width: 200px;">
                <span class="label">FINAL SCORE</span>
                <span class="value">${score} / ${maxQuestions}</span>
            </div>
        </div>
        <button id="try-again" class="primary-btn">Try Again</button>
    `;

    resultContainer.querySelector("#try-again").onclick = () => {
        resultContainer.remove();
        const fw = document.getElementById("active-fireworks");
        if (fw) fw.remove();
        document.getElementById("start-screen").classList.add("active");
    };

    document.querySelector(".app-container").appendChild(resultContainer);
    if (percentage >= 70) launchFireworks(resultContainer);
}

// Timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").textContent = timeLeft;
        document.getElementById("timer-bar").style.width =
            `${(timeLeft / initialTime) * 100}%`;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Fireworks (unchanged)
function launchFireworks(parent) {
    const container = document.createElement("div");
    container.className = "fireworks-container";
    container.id = "active-fireworks";
    parent.appendChild(container);

    function scheduleFirework() {
        if (!document.getElementById("active-fireworks")) return;
        const x = Math.random() * 80 + 10;
        const targetY = Math.random() * 50 + 10;
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
    setTimeout(() => { explodeFirework(container, x, targetY); rocket.remove(); }, duration * 1000);
}

function explodeFirework(container, x, targetY) {
    const palettes = [
        ["#FFD700", "#FFA500", "#FF4500"],
        ["#00F5FF", "#00E5EE", "#7FFFD4"],
        ["#FF00FF", "#DA70D6", "#BA55D3"],
        ["#ADFF2F", "#32CD32", "#00FF7F"]
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];

    for (let i = 0; i < 60; i++) {
        const p = document.createElement("div");
        p.className = "firework-particle";
        const color = palette[Math.floor(Math.random() * palette.length)];
        p.style.backgroundColor = color;
        p.style.left = x + "%";
        p.style.top = targetY + "%";
        p.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

        const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5;
        const velocity = Math.random() * 250 + 100;
        p.style.setProperty("--tx", Math.cos(angle) * velocity + "px");
        p.style.setProperty("--ty", Math.sin(angle) * velocity + "px");

        const dur = Math.random() * 0.6 + 1.2;
        p.style.animation = `fireworkExplode ${dur}s cubic-bezier(0,0,0.4,1) forwards`;
        container.appendChild(p);

        if (Math.random() > 0.7)
            createSparkle(container,
                x + (Math.cos((Math.PI * 2 * i) / 60) * velocity / window.innerWidth * 100),
                targetY + (Math.sin((Math.PI * 2 * i) / 60) * velocity / window.innerHeight * 100));

        setTimeout(() => p.remove(), dur * 1000);
    }
}

function createSparkle(container, x, y) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = x + "%";
    s.style.top = y + "%";
    s.style.setProperty("--duration", (Math.random() * 0.5 + 0.5) + "s");
    container.appendChild(s);
    setTimeout(() => s.remove(), 1000);
}

// ── Background decoration ──────────────────────────────────
function initBackground() {
    const container = document.getElementById("symbols-container");
    const symbols = ["+", "−", "×", "÷", "=", "∑", "π", "∞", "√", "∆", "∫", "≈", "≠", "λ", "μ", "θ"];
    for (let i = 0; i < 60; i++) {
        const s = document.createElement("div");
        s.className = "bg-symbol";
        s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        s.style.left = Math.random() * 100 + "vw";
        s.style.top = Math.random() * 100 + "vh";
        s.style.fontSize = Math.random() * 20 + 15 + "px";
        s.style.opacity = Math.random() * 0.5 + 0.1;
        s.style.animationDuration = Math.random() * 20 + 10 + "s";
        s.style.animationDelay = Math.random() * -30 + "s";
        container.appendChild(s);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initBackground();
    const first = document.querySelector(".level-card");
    if (first) selectLevel(1, first);
});
