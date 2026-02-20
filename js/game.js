import { state, resetGameState } from './state.js';
import { getDifficultyParams, buildProblem, generateOptions } from './math.js';
import { ui } from './ui.js';
import { timer } from './timer.js';
import { initBackground, launchFireworks } from './effects.js';

function generateNextProblem() {
    if (state.totalQuestions === 0) {
        endGame();
        return;
    }

    const problemData = buildProblem();
    state.askedQuestions.add(problemData.key);
    state.currentProblem = problemData.problem;
    state.currentAnswer = problemData.answer;
    state.totalQuestions--;

    const currentIdx = state.maxQuestions - state.totalQuestions;
    const { stageName } = getDifficultyParams(state.difficulty);

    ui.updateHeader(currentIdx, state.maxQuestions, stageName);
    ui.renderProblem(state.currentProblem);

    const opts = generateOptions(state.currentAnswer);
    const labels = ["A", "B", "C", "D"];
    ui.renderOptions(opts, labels, handleAnswerSubmit);

    timer.start((timeLeft, initialTime) => ui.updateTimer(timeLeft, initialTime), endGame);
    state.isSubmitting = false;
}

function handleAnswerSubmit(userAnswer) {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    timer.stop();

    ui.disableOptions();
    ui.markAnswerEffect(userAnswer, state.currentAnswer);

    if (userAnswer === state.currentAnswer) {
        state.score++;
        state.difficulty++;
        setTimeout(() => generateNextProblem(), 800);
    } else {
        state.difficulty = Math.max(1, state.difficulty - 1);
        setTimeout(() => generateNextProblem(), 2000);
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

    const resultContainer = ui.showEndScreen(
        state.score,
        state.maxQuestions,
        percentage,
        message,
        msgClass,
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
    if (ui.elements.levelCards && ui.elements.levelCards.length > 0) {
        const firstLevel = ui.elements.levelCards[0];
        const levelInput = document.getElementById("level");
        if (levelInput) levelInput.value = 1;
        ui.selectLevelCard(firstLevel);
    }
});
