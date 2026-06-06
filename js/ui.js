import { getTierInfo } from './math.js';

export const ui = {
    elements: {
        timerBar: document.getElementById("timer-bar"),
        timeLeft: document.getElementById("time-left"),
        questionNum: document.getElementById("question-num"),
        tierPill: document.getElementById("tier-pill"),
        tierName: document.getElementById("tier-name"),
        tierIntensity: document.getElementById("tier-intensity"),
        problemText: document.querySelector(".problem-text"),
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
    renderTier: (difficulty) => {
        const { tier, name, progress } = getTierInfo(difficulty);
        const fillPct = Math.round(progress * 100);

        if (ui.elements.tierName) ui.elements.tierName.textContent = name;
        if (ui.elements.tierPill) {
            ui.elements.tierPill.className = `stat-pill tier-pill tier-${tier}`;
        }
        if (ui.elements.tierIntensity) {
            ui.elements.tierIntensity.querySelectorAll('.tier-seg').forEach((seg, i) => {
                const tierIndex = i + 1;
                const fill = seg.querySelector('.tier-seg-fill');
                seg.classList.remove('active', 'current', 'completed');
                seg.removeAttribute('data-tier');

                if (tierIndex < tier) {
                    seg.classList.add('active', 'completed');
                    seg.dataset.tier = String(tierIndex);
                    if (fill) fill.style.width = '100%';
                } else if (tierIndex === tier) {
                    if (fillPct > 0) {
                        seg.classList.add('active', 'current');
                        if (fill) fill.style.width = `${fillPct}%`;
                    } else if (fill) {
                        fill.style.width = '0%';
                    }
                } else if (fill) {
                    fill.style.width = '0%';
                }
            });
        }
    },
    updateHeader: (currentIdx, maxQuestions, difficulty) => {
        if (ui.elements.questionNum) ui.elements.questionNum.textContent = `${currentIdx} / ${maxQuestions}`;
        ui.renderTier(difficulty);
    },
    renderProblem: (problemStr) => {
        if (ui.elements.problemText) ui.elements.problemText.textContent = problemStr;
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
            ${isNewHighScore ? '<div class="high-score-banner">🏆 NEW HIGH SCORE! 🏆</div>' : ''}
            <div class="stats-group" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin: 2rem 0;">
                <div class="score-ring">
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
