import { state } from './state.js';

export function randInt(min, max) {
    // Ensures that min < max
    if (min > max) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getDifficultyParams(d) {
    // Difficulty Cap: Prevent infinite difficulty scaling
    const cappedD = Math.min(15, d); 
    const stage = Math.min(4, Math.ceil(cappedD / 2));
    const mult = state.selectedRank || 1;

    let min = 1;
    let max = 10;
    let ops = ["+"];
    let compound = false;
    let triple = false;

    switch (stage) {
        case 1:
            max = 10 + (mult * 5); // Rank 1: 15, Rank 3: 25
            ops = ["+"];
            break;
        case 2:
            max = 15 + (mult * 10); // Rank 1: 25, Rank 3: 45
            ops = ["+", "-"];
            break;
        case 3:
            min = 2;
            max = 20 + (mult * 15); // Rank 1: 35, Rank 3: 65
            ops = ["+", "-", "*"];
            break;
        case 4:
            min = 3;
            max = 30 + (mult * 20) + ((cappedD - 8) * 5);
            ops = ["+", "-", "*", "/"];
            compound = Math.random() < 0.4; // 40% chance 
            triple = cappedD >= 10 && Math.random() < 0.2; // Very complex only after level 10
            break;
    }

    return { min, max, ops, compound, triple, stageName: stage };
}

export function buildProblem() {
    const { min, max, ops, compound, triple } = getDifficultyParams(state.difficulty);

    if (triple) return buildTripleProblem(min, max, ops);
    if (compound) return buildCompoundProblem(min, max, ops);
    return buildSimpleProblem(min, max, ops);
}

function buildSimpleProblem(min, max, ops) {
    const MAX_TRIES = 50;
    const mult = state.selectedRank || 1;
    
    for (let t = 0; t < MAX_TRIES; t++) {
        let op = pickFrom(ops);
        let a = randInt(min, max);
        let b = randInt(min, max);
        let answer;

        if (op === "+") {
            answer = a + b;
        } else if (op === "-") {
            if (a < b) [a, b] = [b, a]; // Avoid negative answers
            answer = a - b;
        } else if (op === "*") {
            const cap = Math.min(max, 10 + mult * 2);
            a = randInt(min, cap);
            b = randInt(Math.max(1, min), cap);
            answer = a * b;
        } else { // Division
            // Division Bug Fix: Logical division without remainder
            const cap = Math.min(max, 10 + mult * 2);
            b = randInt(2, cap);
            answer = randInt(1, cap);
            a = b * answer; // a is always divisible by b
            op = "/";
        }

        if (answer < 0) continue;
        
        const key = `${a}${op}${b}`;
        if (state.askedQuestions.has(key)) continue;

        return { problem: `${a} ${op} ${b}`, answer, key };
    }
    
    // If many questions are asked and repeat, clear memory with a better fallback
    if (state.askedQuestions.size > 50) state.askedQuestions.clear();
    const fallbackA = randInt(min, max);
    const fallbackB = randInt(min, max);
    return { 
        problem: `${fallbackA} + ${fallbackB}`, 
        answer: fallbackA + fallbackB, 
        key: `${fallbackA}+${fallbackB}_${Date.now()}` 
    };
}

function buildCompoundProblem(min, max, ops) {
    const safeOps = ops.filter(o => o !== "/");
    if (safeOps.length === 0) return buildSimpleProblem(min, max, ops);
    const mult = state.selectedRank || 1;

    for (let t = 0; t < 50; t++) {
        const op1 = pickFrom(safeOps);
        const op2 = pickFrom(safeOps);
        const cap = Math.min(max, 15 + mult * 5);

        let n1 = randInt(min, cap);
        let n2 = randInt(min, cap);
        let n3 = randInt(min, cap);

        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];
        let inter = (op1 === "+") ? n1 + n2 : (op1 === "-" ? n1 - n2 : n1 * Math.min(n2, 10));

        let answer;
        if (op2 === "+") answer = inter + n3;
        else if (op2 === "-") {
            if (inter < n3) continue;
            answer = inter - n3;
        } else {
            answer = inter * Math.min(n3, 5);
        }

        if (answer <= 0) continue;

        const problem = `(${n1} ${op1} ${n2}) ${op2} ${n3}`;
        if (state.askedQuestions.has(problem)) continue;

        return { problem, answer, key: problem };
    }
    return buildSimpleProblem(min, max, ops);
}

function buildTripleProblem(min, max, ops) {
    const safeOps = ops.filter(o => o !== "/");
    if (safeOps.length === 0) return buildSimpleProblem(min, max, ops);

    for (let t = 0; t < 50; t++) {
        const op1 = pickFrom(safeOps);
        const op2 = pickFrom(safeOps);
        const op3 = pickFrom(safeOps);

        let n1 = randInt(1, 10);
        let n2 = randInt(1, 10);
        let n3 = randInt(1, 10);
        let n4 = randInt(1, 10);

        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];
        let res1 = (op1 === "+") ? n1 + n2 : (op1 === "-" ? n1 - n2 : n1 * n2);

        if (op2 === "-" && res1 < n3) continue;
        let res2 = (op2 === "+") ? res1 + n3 : (op2 === "-" ? res1 - n3 : res1 * n3);

        if (op3 === "-" && res2 < n4) continue;
        let res3 = (op3 === "+") ? res2 + n4 : (op3 === "-" ? res2 - n4 : res2 * n4);

        if (res3 > 0 && res3 < 1000) {
            const problem = `((${n1} ${op1} ${n2}) ${op2} ${n3}) ${op3} ${n4}`;
            if (state.askedQuestions.has(problem)) continue;
            return { problem, answer: res3, key: problem };
        }
    }
    return buildCompoundProblem(min, max, ops);
}

export function generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);
    
    // Generating plausible answer options
    while (options.size < 4) {
        let offset;
        const rand = Math.random();
        // Often mistaken by 1, 2, or 10
        if (rand < 0.4) offset = randInt(1, 2);
        else if (rand < 0.7) offset = 10;
        else offset = randInt(3, 8);
        
        const candidate = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
        if (candidate >= 0) options.add(candidate); // Excluding negative answers
    }

    return [...options].sort(() => Math.random() - 0.5);
}
