import { state } from './state.js';

const CONFIG = {
    DIFFICULTY_MIN: 1,
    DIFFICULTY_MAX: 15,
    DIFFICULTY_INCREMENT: 0.5,
    WEAK_OP_BONUS: 2,
    MAX_BUILD_TRIES: 50,
    FALLBACK_RETRIES: 10,
    ASKED_CLEAR_THRESHOLD: 50,
    COMPOUND_CHANCE: 0.4,
    TRIPLE_CHANCE: 0.2,
    TRIPLE_MIN_DIFFICULTY: 10,
    TRIPLE_ANSWER_MAX: 1000,
};

export function randInt(min, max) {
    if (min > max) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function clampDifficulty(d) {
    return Math.max(CONFIG.DIFFICULTY_MIN, Math.min(CONFIG.DIFFICULTY_MAX, d));
}

export const TIER_NAMES = ['Warmup', 'Building', 'Challenge', 'Expert'];

const TIER_BOUNDS = [
    { tier: 1, min: 1, max: 2 },
    { tier: 2, min: 2.5, max: 4 },
    { tier: 3, min: 4.5, max: 6 },
    { tier: 4, min: 6.5, max: CONFIG.DIFFICULTY_MAX },
];

export function getTierInfo(difficulty) {
    const d = clampDifficulty(difficulty);
    const bounds = TIER_BOUNDS.find(b => d <= b.max) ?? TIER_BOUNDS[3];
    const span = bounds.max - bounds.min;
    const progress = span === 0 ? 1 : (d - bounds.min) / span;

    return {
        tier: bounds.tier,
        name: TIER_NAMES[bounds.tier - 1],
        progress: Math.max(0, Math.min(1, progress)),
    };
}

export function computeDifficultyDelta(isCorrect) {
    return isCorrect ? CONFIG.DIFFICULTY_INCREMENT : -CONFIG.DIFFICULTY_INCREMENT;
}

function getOperandCaps(rank, max) {
    const cap = Math.min(max, 15 + rank * 5);
    const multCap = Math.min(max, 10 + rank * 2);
    return { cap, multCap };
}

function createProblem({ problem, answer, key, op, opsUsed }) {
    return {
        problem,
        answer,
        key,
        op,
        opsUsed: opsUsed ?? [op],
    };
}

export function pickWeightedOp(allowedOps, mistakesByOp) {
    if (!allowedOps.length) return "+";

    const maxMistakes = Math.max(...allowedOps.map(op => mistakesByOp[op] || 0));
    if (maxMistakes === 0) return pickFrom(allowedOps);

    const weights = allowedOps.map(op => {
        const base = 1;
        return (mistakesByOp[op] || 0) === maxMistakes ? base + CONFIG.WEAK_OP_BONUS : base;
    });

    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < allowedOps.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return allowedOps[i];
    }
    return allowedOps[allowedOps.length - 1];
}

function evalMultiply(a, b, multCap) {
    return a * Math.min(b, multCap);
}

function buildSimpleOperands(min, max, op, rank) {
    const { cap, multCap } = getOperandCaps(rank, max);
    let a = randInt(min, max);
    let b = randInt(min, max);
    let answer;

    if (op === "+") {
        answer = a + b;
    } else if (op === "-") {
        if (a < b) [a, b] = [b, a];
        answer = a - b;
    } else if (op === "*") {
        a = randInt(min, cap);
        b = randInt(Math.max(1, min), multCap);
        answer = a * b;
    } else {
        b = randInt(2, multCap);
        answer = randInt(1, multCap);
        a = b * answer;
        op = "/";
    }

    if (answer < 0) return null;
    return { a, b, op, answer };
}

function buildSimpleProblem(min, max, ops) {
    const rank = state.selectedRank || 1;
    const mistakes = state.mistakesByOp;

    for (let t = 0; t < CONFIG.MAX_BUILD_TRIES; t++) {
        const op = pickWeightedOp(ops, mistakes);
        const pair = buildSimpleOperands(min, max, op, rank);
        if (!pair) continue;

        const key = `${pair.a}${pair.op}${pair.b}`;
        if (state.askedQuestions.has(key)) continue;

        return createProblem({
            problem: `${pair.a} ${pair.op} ${pair.b}`,
            answer: pair.answer,
            key,
            op: pair.op,
            opsUsed: [pair.op],
        });
    }

    if (state.askedQuestions.size > CONFIG.ASKED_CLEAR_THRESHOLD) {
        state.askedQuestions.clear();
    }

    for (let t = 0; t < CONFIG.FALLBACK_RETRIES; t++) {
        const op = pickWeightedOp(ops, mistakes);
        const pair = buildSimpleOperands(min, max, op, rank);
        if (!pair) continue;

        const key = `${pair.a}${pair.op}${pair.b}_${Date.now()}`;
        return createProblem({
            problem: `${pair.a} ${pair.op} ${pair.b}`,
            answer: pair.answer,
            key,
            op: pair.op,
            opsUsed: [pair.op],
        });
    }

    const fallbackOp = ops[0];
    const pair = buildSimpleOperands(min, max, fallbackOp, rank);
    const a = pair?.a ?? randInt(min, max);
    const b = pair?.b ?? randInt(min, max);
    const finalOp = pair?.op ?? fallbackOp;
    const answer = pair?.answer ?? a + b;

    return createProblem({
        problem: `${a} ${finalOp} ${b}`,
        answer,
        key: `${a}${finalOp}${b}_${Date.now()}`,
        op: finalOp,
        opsUsed: [finalOp],
    });
}

function buildCompoundProblem(min, max, ops) {
    const safeOps = ops.filter(o => o !== "/");
    if (safeOps.length === 0) return buildSimpleProblem(min, max, ops);

    const rank = state.selectedRank || 1;
    const mistakes = state.mistakesByOp;
    const { cap, multCap } = getOperandCaps(rank, max);

    for (let t = 0; t < CONFIG.MAX_BUILD_TRIES; t++) {
        const op1 = pickWeightedOp(safeOps, mistakes);
        const op2 = pickWeightedOp(safeOps, mistakes);

        let n1 = randInt(min, cap);
        let n2 = randInt(min, cap);
        let n3 = randInt(min, cap);

        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];
        let inter = op1 === "+"
            ? n1 + n2
            : op1 === "-"
                ? n1 - n2
                : evalMultiply(n1, n2, multCap);

        let answer;
        if (op2 === "+") answer = inter + n3;
        else if (op2 === "-") {
            if (inter < n3) continue;
            answer = inter - n3;
        } else {
            answer = evalMultiply(inter, n3, multCap);
        }

        if (answer <= 0) continue;

        const problem = `(${n1} ${op1} ${n2}) ${op2} ${n3}`;
        if (state.askedQuestions.has(problem)) continue;

        return createProblem({
            problem,
            answer,
            key: problem,
            op: "Compound",
            opsUsed: [op1, op2],
        });
    }
    return buildSimpleProblem(min, max, ops);
}

function buildTripleProblem(min, max, ops) {
    const safeOps = ops.filter(o => o !== "/");
    if (safeOps.length === 0) return buildSimpleProblem(min, max, ops);

    const rank = state.selectedRank || 1;
    const mistakes = state.mistakesByOp;
    const { cap, multCap } = getOperandCaps(rank, max);

    for (let t = 0; t < CONFIG.MAX_BUILD_TRIES; t++) {
        const op1 = pickWeightedOp(safeOps, mistakes);
        const op2 = pickWeightedOp(safeOps, mistakes);
        const op3 = pickWeightedOp(safeOps, mistakes);

        let n1 = randInt(min, cap);
        let n2 = randInt(min, cap);
        let n3 = randInt(min, cap);
        let n4 = randInt(min, cap);

        if (op1 === "-" && n1 < n2) [n1, n2] = [n2, n1];
        let res1 = op1 === "+"
            ? n1 + n2
            : op1 === "-"
                ? n1 - n2
                : evalMultiply(n1, n2, multCap);

        if (op2 === "-" && res1 < n3) continue;
        let res2 = op2 === "+"
            ? res1 + n3
            : op2 === "-"
                ? res1 - n3
                : evalMultiply(res1, n3, multCap);

        if (op3 === "-" && res2 < n4) continue;
        let res3 = op3 === "+"
            ? res2 + n4
            : op3 === "-"
                ? res2 - n4
                : evalMultiply(res2, n4, multCap);

        if (res3 > 0 && res3 < CONFIG.TRIPLE_ANSWER_MAX) {
            const problem = `((${n1} ${op1} ${n2}) ${op2} ${n3}) ${op3} ${n4}`;
            if (state.askedQuestions.has(problem)) continue;
            return createProblem({
                problem,
                answer: res3,
                key: problem,
                op: "Complex",
                opsUsed: [op1, op2, op3],
            });
        }
    }
    return buildCompoundProblem(min, max, ops);
}

export function getDifficultyParams(d) {
    const cappedD = clampDifficulty(d);
    const { tier, progress } = getTierInfo(cappedD);
    const mult = state.selectedRank || 1;
    const withinTier = Math.round(progress * 2);

    let min = 1;
    let max = 10;
    let ops = ["+"];
    let compound = false;
    let triple = false;

    switch (tier) {
        case 1:
            max = 10 + (mult * 5) + withinTier;
            ops = ["+"];
            break;
        case 2:
            max = 15 + (mult * 10) + withinTier;
            ops = ["+", "-"];
            break;
        case 3:
            min = 2;
            max = 20 + (mult * 15) + withinTier * 2;
            ops = ["+", "-", "*"];
            break;
        case 4:
            min = 3;
            max = 30 + (mult * 20) + Math.round((cappedD - 6.5) * 3);
            ops = ["+", "-", "*", "/"];
            compound = progress >= 0.5 && Math.random() < CONFIG.COMPOUND_CHANCE;
            triple = cappedD >= CONFIG.TRIPLE_MIN_DIFFICULTY && Math.random() < CONFIG.TRIPLE_CHANCE;
            break;
    }

    return { min, max, ops, compound, triple, stageName: tier };
}

export function buildProblem() {
    const { min, max, ops, compound, triple } = getDifficultyParams(state.difficulty);

    if (triple) return buildTripleProblem(min, max, ops);
    if (compound) return buildCompoundProblem(min, max, ops);
    return buildSimpleProblem(min, max, ops);
}

export function generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);

    while (options.size < 4) {
        let offset;
        const rand = Math.random();
        if (rand < 0.4) offset = randInt(1, 2);
        else if (rand < 0.7) offset = 10;
        else offset = randInt(3, 8);

        const candidate = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
        if (candidate >= 0) options.add(candidate);
    }

    return [...options].sort(() => Math.random() - 0.5);
}
