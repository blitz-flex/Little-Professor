import { state } from './state.js';

export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getDifficultyParams(d) {
    let stage = Math.min(4, Math.ceil(d / 2));
    let min, max, ops, compound = false, triple = false;
    const mult = state.selectedRank;

    switch (stage) {
        case 1:
            min = 0;
            max = 10 + (mult - 1) * 10;
            ops = ["+"];
            break;
        case 2:
            min = 0;
            max = 20 + (mult - 1) * 15;
            ops = ["+", "-"];
            break;
        case 3:
            min = 2;
            max = 30 + (mult - 1) * 20;
            ops = ["+", "-", "*"];
            break;
        case 4:
            const bonus = Math.max(0, d - 8);
            min = 5 + (mult - 1) * 5;
            max = 50 + (mult - 1) * 25 + (bonus * 5);
            ops = ["+", "-", "*", "/"];
            compound = true;
            triple = true;
            break;
    }

    return { min, max, ops, compound, triple, stageName: stage };
}

export function buildProblem() {
    const { min, max, ops, compound, triple } = getDifficultyParams(state.difficulty);

    if (triple && Math.random() < 0.6) return buildTripleProblem(min, max, ops);
    if (compound && Math.random() < 0.45) return buildCompoundProblem(min, max, ops);
    return buildSimpleProblem(min, max, ops);
}

function buildSimpleProblem(min, max, ops) {
    const MAX_TRIES = 200;
    for (let t = 0; t < MAX_TRIES; t++) {
        let op = pickFrom(ops);
        let a = randInt(min, max);
        let b = randInt(Math.max(1, min), max);
        let answer;

        if (op === "+") answer = a + b;
        else if (op === "-") {
            if (a < b) [a, b] = [b, a];
            answer = a - b;
        } else if (op === "*") {
            const cap = Math.min(max, 12);
            a = randInt(Math.max(1, min), cap);
            b = randInt(Math.max(1, min), cap);
            answer = a * b;
        } else {
            b = randInt(Math.max(2, min), Math.min(12, max));
            answer = randInt(Math.max(1, min), Math.min(12, max));
            a = b * answer;
            op = "/";
        }

        if (answer <= 0) continue;
        const key = `${a}${op}${b}`;
        if (state.askedQuestions.has(key)) continue;

        return { problem: `${a} ${op} ${b}`, answer, key };
    }
    const a = randInt(1, 10), b = randInt(1, 10);
    return { problem: `${a} + ${b}`, answer: a + b, key: `${a}+${b}` };
}

function buildCompoundProblem(min, max, ops) {
    const MAX_TRIES = 200;
    const safeOps = ops.filter(o => o !== "/");
    if (safeOps.length === 0) return buildSimpleProblem(min, max, ops);

    for (let t = 0; t < MAX_TRIES; t++) {
        const op1 = pickFrom(safeOps);
        const op2 = pickFrom(safeOps);
        const cap = Math.min(max, 20);

        let n1 = randInt(Math.max(1, min), cap);
        let n2 = randInt(Math.max(1, min), cap);
        let n3 = randInt(Math.max(1, min), Math.max(2, Math.floor(cap / 2)));

        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];
        let inter;
        if (op1 === "+") inter = n1 + n2;
        else if (op1 === "-") inter = n1 - n2;
        else inter = n1 * n2;

        if (inter <= 0) continue;
        if (op2 === "-" && inter < n3) continue;

        let answer = (op2 === "+") ? inter + n3 : (op2 === "-" ? inter - n3 : inter * n3);
        if (answer <= 0) continue;

        const key = `(${n1}${op1}${n2})${op2}${n3}`;
        if (state.askedQuestions.has(key)) continue;

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

        let res1;
        if (op1 === "+") res1 = n1 + n2;
        else if (op1 === "-") {
            if (n1 < n2) [n1, n2] = [n2, n1];
            res1 = n1 - n2;
        } else res1 = n1 * n2;

        let res2;
        if (op2 === "+") res2 = res1 + n3;
        else if (op2 === "-") {
            if (res1 < n3) continue;
            res2 = res1 - n3;
        } else res2 = res1 * n3;

        let res3;
        if (op3 === "+") res3 = res2 + n4;
        else if (op3 === "-") {
            if (res2 < n4) continue;
            res3 = res2 - n4;
        } else res3 = res2 * n4;

        if (res3 > 0 && res3 < 500) {
            const problem = `((${n1} ${op1} ${n2}) ${op2} ${n3}) ${op3} ${n4}`;
            const key = `((${n1}${op1}${n2})${op2}${n3})${op3}${n4}`;
            if (state.askedQuestions.has(key)) continue;
            return { problem, answer: res3, key };
        }
    }
    return buildCompoundProblem(min, max, ops);
}

export function generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);
    const spread = Math.max(3, Math.floor(correctAnswer * 0.4));
    let tries = 0;

    while (options.size < 4 && tries < 500) {
        tries++;
        const offset = randInt(1, spread);
        const candidate = Math.random() < 0.5 ? correctAnswer + offset : Math.max(1, correctAnswer - offset);
        if (candidate > 0) options.add(candidate);
    }

    let fill = correctAnswer + spread;
    while (options.size < 4) {
        options.add(++fill);
    }

    return [...options].sort(() => Math.random() - 0.5);
}
