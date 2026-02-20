export const ui = {
    elements: {
        timerBar: document.getElementById("timer-bar"),
        timeLeft: document.getElementById("time-left"),
        questionNum: document.getElementById("question-num"),
        gameLevel: document.getElementById("game-level"),
        problemText: document.querySelector(".problem-text"),
        feedback: document.querySelector(".feedback"),
        optionsContainer: document.getElementById("options-container"),
        startScreen: document.getElementById("start-screen"),
        gameScreen: document.getElementById("game-screen"),
        appContainer: document.querySelector(".app-container"),
        levelCards: document.querySelectorAll(".level-card")
    },
    updateTimer: (timeLeft, initialTime) => {
        if (ui.elements.timeLeft) ui.elements.timeLeft.textContent = timeLeft;
        if (ui.elements.timerBar) ui.elements.timerBar.style.width = `${(timeLeft / initialTime) * 100}%`;
    },
    updateHeader: (currentIdx, maxQuestions, stageName) => {
        if (ui.elements.questionNum) ui.elements.questionNum.textContent = `${currentIdx} / ${maxQuestions}`;
        if (ui.elements.gameLevel) ui.elements.gameLevel.textContent = stageName;
    },
    renderProblem: (problemStr) => {
        if (ui.elements.problemText) ui.elements.problemText.textContent = problemStr;
        if (ui.elements.feedback) {
            ui.elements.feedback.textContent = "";
            ui.elements.feedback.className = "feedback";
        }
    },
    renderOptions: (options, labels, onSelect) => {
        const container = ui.elements.optionsContainer;
        if (!container) return;
        container.innerHTML = "";
        options.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerHTML = `
                <span class="option-label">${labels[i]}</span>
                <span class="option-value">${opt}</span>
            `;
            btn.addEventListener("click", () => onSelect(opt));
            container.appendChild(btn);
        });
    },
    disableOptions: () => {
        document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
    },
    markAnswerEffect: (userAnswer, currentAnswer) => {
        const allBtns = document.querySelectorAll(".option-btn");
        let clickedBtn = null, correctBtn = null;
        allBtns.forEach(b => {
            const val = parseInt(b.querySelector(".option-value").textContent);
            if (val === userAnswer) clickedBtn = b;
            if (val === currentAnswer) correctBtn = b;
        });

        if (userAnswer === currentAnswer) {
            if (clickedBtn) clickedBtn.classList.add("correct");
            allBtns.forEach(b => { if (b !== clickedBtn) b.classList.add("dimmed"); });
        } else {
            if (clickedBtn) clickedBtn.classList.add("wrong");
            if (correctBtn) correctBtn.classList.add("correct");
            allBtns.forEach(b => {
                if (b !== clickedBtn && b !== correctBtn) b.classList.add("dimmed");
            });
        }
    },
    showGameScreen: () => {
        if (ui.elements.startScreen) ui.elements.startScreen.classList.remove("active");
        if (ui.elements.gameScreen) ui.elements.gameScreen.classList.add("active");
    },
    showEndScreen: (score, maxQuestions, percentage, message, msgClass, onTryAgain) => {
        if (ui.elements.gameScreen) ui.elements.gameScreen.classList.remove("active");

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

        resultContainer.querySelector("#try-again").addEventListener("click", () => {
            resultContainer.remove();
            const fw = document.getElementById("active-fireworks");
            if (fw) fw.remove();
            if (ui.elements.startScreen) ui.elements.startScreen.classList.add("active");

            // Re-bind dynamic elements like level selection reset inside onTryAgain?
            // Usually we just show start screen.
            if (onTryAgain) onTryAgain();
        });

        if (ui.elements.appContainer) ui.elements.appContainer.appendChild(resultContainer);
        return resultContainer;
    },
    selectLevelCard: (element) => {
        if (!ui.elements.levelCards) return;
        ui.elements.levelCards.forEach(c => c.classList.remove("selected"));
        element.classList.add("selected");
    }
};
