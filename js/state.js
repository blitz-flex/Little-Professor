export const state = {
    score: 0,
    currentAnswer: null,
    currentProblem: "",
    timeLeft: 60,
    initialTime: 60,
    timerInterval: null,
    isSubmitting: false,
    gameEnded: false,
    maxQuestions: 15,
    totalQuestions: 15,
    difficulty: 1,
    consecutiveMistakes: 0,
    selectedRank: 1,
    askedQuestions: new Set()
};

export function resetGameState(levelParams) {
    state.score = 0;
    state.gameEnded = false;
    state.isSubmitting = false;
    state.consecutiveMistakes = 0;
    state.askedQuestions.clear();
    state.selectedRank = levelParams.rank;
    state.difficulty = 1;
    state.timeLeft = levelParams.time;
    state.initialTime = levelParams.time;
    state.maxQuestions = levelParams.questions;
    state.totalQuestions = levelParams.questions;
}
