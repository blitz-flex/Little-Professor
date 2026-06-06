export const state = {
    score: 0,
    currentAnswer: null,
    currentProblem: "",
    currentOp: "",
    currentOpsUsed: [],
    timeLeft: 60,
    initialTime: 60,
    timerInterval: null,
    isSubmitting: false,
    gameEnded: false,
    maxQuestions: 15,
    totalQuestions: 15,
    difficulty: 1,
    selectedRank: 1,
    askedQuestions: new Set(),
    mistakesByOp: { "+": 0, "-": 0, "*": 0, "/": 0 },
    highScores: JSON.parse(localStorage.getItem('little-professor-highscores')) || { 1: 0, 2: 0, 3: 0 }
};

const TRACKED_OPS = ["+", "-", "*", "/"];

export function recordMistakes(mistakesByOp, opsUsed) {
    const ops = opsUsed?.length ? opsUsed : [];
    for (const op of ops) {
        if (TRACKED_OPS.includes(op)) {
            mistakesByOp[op] = (mistakesByOp[op] || 0) + 1;
        }
    }
}

export function saveHighScore(rank, score) {
    if (score > state.highScores[rank]) {
        state.highScores[rank] = score;
        localStorage.setItem('little-professor-highscores', JSON.stringify(state.highScores));
        return true;
    }
    return false;
}

export function resetGameState(levelParams) {
    state.score = 0;
    state.gameEnded = false;
    state.isSubmitting = false;
    state.askedQuestions.clear();
    state.selectedRank = levelParams.rank;
    state.difficulty = 1;
    state.timeLeft = levelParams.time;
    state.initialTime = levelParams.time;
    state.maxQuestions = levelParams.questions;
    state.totalQuestions = levelParams.questions;
    state.mistakesByOp = { "+": 0, "-": 0, "*": 0, "/": 0 };
    state.currentOp = "";
    state.currentOpsUsed = [];
}
