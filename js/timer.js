import { state } from './state.js';

export const timer = {
    start: (onTick, onEnd) => {
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            if (onTick) onTick(state.timeLeft, state.initialTime);
            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                if (onEnd) onEnd();
            }
        }, 1000);
    },
    stop: () => {
        clearInterval(state.timerInterval);
    }
};
