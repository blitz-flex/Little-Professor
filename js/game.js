import { state, resetGameState, saveHighScore } from './state.js';
import { getDifficultyParams, buildProblem, generateOptions } from './math.js';
import { ui } from './ui.js';
import { timer } from './timer.js';
import { initBackground, launchFireworks } from './effects.js';
import { sfx } from './audio.js';

function generateNextProblem() {
    if (state.totalQuestions === 0) {
        endGame();
        return;
    }

    const problemData = buildProblem();
    state.askedQuestions.add(problemData.key);
    state.currentProblem = problemData.problem;
    state.currentAnswer = problemData.answer;
    state.currentOp = problemData.op;
    state.totalQuestions--;

    const currentIdx = state.maxQuestions - state.totalQuestions;
    const { stageName } = getDifficultyParams(state.difficulty);

    ui.updateHeader(currentIdx, state.maxQuestions, stageName);
    ui.renderProblem(state.currentProblem);

    const opts = generateOptions(state.currentAnswer);
    const labels = ["A", "B", "C", "D"];
    ui.renderOptions(opts, labels, handleAnswerSubmit);

    state.isSubmitting = false;
}

function handleAnswerSubmit(userAnswer) {
    if (state.isSubmitting) return;
    state.isSubmitting = true;

    ui.disableOptions();
    ui.markAnswerEffect(userAnswer, state.currentAnswer);

    if (userAnswer === state.currentAnswer) {
        sfx.playCorrect();
        state.score++;
        state.difficulty++;
        setTimeout(() => generateNextProblem(), 800);
    } else {
        sfx.playWrong();
        state.difficulty = Math.max(1, state.difficulty - 1);
        if (state.currentOp) {
            state.mistakesByOp[state.currentOp] = (state.mistakesByOp[state.currentOp] || 0) + 1;
        }
        setTimeout(() => generateNextProblem(), 1200);
    }
}

function startGame() {
    const levelInput = document.getElementById("level");
    const levelVal = levelInput ? parseInt(levelInput.value) : 1;

    let params = { rank: levelVal, time: 60, questions: 15 };
    if (levelVal === 2) params = { rank: levelVal, time: 120, questions: 25 };
    else if (levelVal === 3) params = { rank: levelVal, time: 180, questions: 35 };

    resetGameState(params);
    ui.showGameScreen();
    ui.updateTimer(state.timeLeft, state.initialTime);
    timer.start((timeLeft, initialTime) => ui.updateTimer(timeLeft, initialTime), endGame);

    generateNextProblem();
}

function endGame() {
    if (state.gameEnded) return;
    state.gameEnded = true;
    timer.stop();

    const percentage = Math.round((state.score / state.maxQuestions) * 100);
    let message = "", msgClass = "";
    if (percentage >= 70) { message = "Excellent work!"; msgClass = "shimmer-text"; }
    else if (percentage >= 50) { message = "Good effort! Try again!"; }
    else { message = "Keep practicing!"; }

    let weakestOp = "None";
    let maxMistakes = 0;
    for (const [op, count] of Object.entries(state.mistakesByOp)) {
        if (count > maxMistakes) {
            maxMistakes = count;
            weakestOp = op;
        }
    }
    const weakestOpText = maxMistakes > 0 ? weakestOp : "None";

    const isNewHighScore = saveHighScore(state.selectedRank, state.score);
    ui.renderHighScores(state.highScores);

    const resultContainer = ui.showEndScreen(
        state.score,
        state.maxQuestions,
        percentage,
        message,
        msgClass,
        isNewHighScore,
        weakestOpText,
        () => {
            // Callback for Try Again button if needed
            state.gameEnded = false;
        }
    );

    if (percentage >= 70) {
        launchFireworks(resultContainer);
    }
}

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    initBackground();

    if (ui.elements.levelCards) {
        ui.elements.levelCards.forEach(card => {
            card.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const lvl = parseInt(target.getAttribute("data-level"));
                const levelInput = document.getElementById("level");
                if (levelInput) levelInput.value = lvl;
                ui.selectLevelCard(target);
            });
        });
    }

    const startBtn = document.getElementById("start-btn");
    if (startBtn) startBtn.addEventListener("click", startGame);

    // Initial setup selection
    ui.renderHighScores(state.highScores);

    if (ui.elements.levelCards && ui.elements.levelCards.length > 0) {
        const firstLevel = ui.elements.levelCards[0];
        const levelInput = document.getElementById("level");
        if (levelInput) levelInput.value = 1;
        ui.selectLevelCard(firstLevel);
    }
});

// Pause game when window loses focus or tab is hidden
window.addEventListener("blur", () => {
    timer.stop();
});

// Resume game when window gains focus
window.addEventListener("focus", () => {
    if (!state.gameEnded && ui.elements.gameScreen && ui.elements.gameScreen.classList.contains("active")) {
        timer.start((timeLeft, initialTime) => ui.updateTimer(timeLeft, initialTime), endGame);
    }
});
