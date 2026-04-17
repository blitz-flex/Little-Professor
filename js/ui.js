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
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    updateTimer: (timeLeft, initialTime) => {
        if (ui.elements.timeLeft) ui.elements.timeLeft.textContent = ui.formatTime(timeLeft);
        if (ui.elements.timerBar) {
            ui.elements.timerBar.style.width = `${(timeLeft / initialTime) * 100}%`;
            if (timeLeft <= 10 && timeLeft > 0) {
                ui.elements.timerBar.classList.add("danger");
            } else {
                ui.elements.timerBar.classList.remove("danger");
            }
        }
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
    showEndScreen: (score, maxQuestions, percentage, message, msgClass, isNewHighScore, weakestOpText, onTryAgain) => {
        if (ui.elements.gameScreen) ui.elements.gameScreen.classList.remove("active");

        const resultContainer = document.createElement("div");
        resultContainer.className = "result-container screen active";
        resultContainer.innerHTML = `
            <h2 class="${msgClass}">Game Over!</h2>
            <p class="subtitle">${message}</p>
            ${isNewHighScore ? '<div style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 5px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; margin-top: -10px; animation: bounce 2s infinite;">🏆 NEW HIGH SCORE! 🏆</div>' : ''}
            <div class="stats-group" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin: 2rem 0;">
                <div style="position: relative; width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, rgba(15, 23, 42, 0) 70%); border: 2px dashed rgba(129, 140, 248, 0.4); box-shadow: 0 0 30px rgba(129, 140, 248, 0.2), inset 0 0 20px rgba(129, 140, 248, 0.1); animation: pulse 2s infinite ease-in-out;">
                    <span style="font-family: var(--font-heading); font-size: 3.5rem; font-weight: 800; color: #fff; text-shadow: 0 0 15px rgba(129, 140, 248, 0.6); line-height: 1;">${score}</span>
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 5px;">OUT OF ${maxQuestions}</span>
                </div>
                
                <div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.8rem 1.5rem; border-radius: 100px; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);">
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.15em;">ACCURACY RATE</span>
                    <div style="height: 18px; width: 1px; background: rgba(255, 255, 255, 0.15);"></div>
                    <span style="color: var(--primary); font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; text-shadow: 0 0 12px rgba(129, 140, 248, 0.5);">${percentage}%</span>
                </div>

                <div style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.8rem 1.5rem; border-radius: 100px; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);">
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.15em;">WEAKEST OPERATION</span>
                    <div style="height: 18px; width: 1px; background: rgba(255, 255, 255, 0.15);"></div>
                    <span style="color: #f87171; font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; text-shadow: 0 0 12px rgba(248, 113, 113, 0.5);">${weakestOpText}</span>
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
    },
    renderHighScores: (scores) => {
        const hs1 = document.getElementById("hs-1");
        const hs2 = document.getElementById("hs-2");
        const hs3 = document.getElementById("hs-3");
        if (hs1) hs1.textContent = scores[1] || 0;
        if (hs2) hs2.textContent = scores[2] || 0;
        if (hs3) hs3.textContent = scores[3] || 0;
    }
};
