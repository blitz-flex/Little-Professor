let score = 0;
let currentProblem;
let currentAnswer;
let currentAttempts = 0;
let totalQuestions = 10;
let timeLeft = 60;
let timerInterval;
let isSubmitting = false; // Flag to prevent multiple submissions
let currentMinNum = 0;
let currentMaxNum = 10;
let initialMinNum = 0;
let initialMaxNum = 10;
let streak = 0;

function generateRandNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomOperation() {
    const operations = ["+", "-", "*", "/"];
    return operations[Math.floor(Math.random() * operations.length)];
}

function generateRandomProblem() {
    let num1 = generateRandNum(currentMinNum, currentMaxNum);
    let num2 = generateRandNum(currentMinNum, currentMaxNum);
    const operation = generateRandomOperation();

    let correctAnswer;
    if (operation === "+") {
        correctAnswer = num1 + num2;
    } else if (operation === "-") {
        while (num1 <= num2) {
            num1 = generateRandNum(currentMinNum, currentMaxNum);
            num2 = generateRandNum(currentMinNum, currentMaxNum);
        }
        correctAnswer = num1 - num2;
    } else if (operation === "*") {
        correctAnswer = num1 * num2;
    } else {
        // Regenerate both numbers until they are perfectly divisible and num2 is not 0
        while (num2 === 0 || num1 % num2 !== 0) {
            num1 = generateRandNum(currentMinNum, currentMaxNum);
            num2 = generateRandNum(currentMinNum, currentMaxNum);
        }
        correctAnswer = num1 / num2;
    }

    return {
        problem: `${num1} ${operation} ${num2}`,
        answer: correctAnswer,
    };
}

function startGame() {
    score = 0;
    currentAttempts = 0;
    totalQuestions = 10;
    isSubmitting = false; // Reset flag at game start
    gameEnded = false; // Reset game ended flag

    // Get selected level
    const level = parseInt(document.getElementById("level").value);

    // Set time and initial range based on level
    if (level === 1) {
        timeLeft = 60;
        currentMinNum = 0;
        currentMaxNum = 10;
    } else if (level === 2) {
        timeLeft = 120;
        currentMinNum = 10;
        currentMaxNum = 20;
    } else {
        timeLeft = 180;
        currentMinNum = 20;
        currentMaxNum = 30;
    }
    initialMinNum = currentMinNum;
    initialMaxNum = currentMaxNum;
    streak = 0;

    // Show game elements
    document.getElementById("game-elements").style.display = "block";
    document.getElementById("start").style.display = "none";
    document.getElementById("level").style.display = "none";

    document.getElementById("answer").disabled = false;
    document.getElementById("submit").disabled = false;

    // Reset score and feedback
    document.querySelector(".score").textContent = `Score: 0`;
    document.querySelector(".feedback").textContent = "";
    document.querySelector(".feedback").className = "feedback";

    // Display selected level
    document.querySelector(".selected-level").textContent = `Question: 1`;

    // Update timer display
    document.getElementById("time-left").textContent = timeLeft;

    // Generate the first problem immediately
    generateProblem();
    // Start the timer
    startTimer();
}

// Add keyboard support for submitting answers
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        // Trigger the submitAnswer function when Enter is pressed
        submitAnswer();
    }
});

function generateProblem() {
    if (totalQuestions === 0) {
        endGame();
        return;
    }

    const { problem, answer } = generateRandomProblem();
    currentProblem = problem;
    currentAnswer = answer;
    currentAttempts = 0;
    totalQuestions--;

    // Calculate current question number (10 - remaining = current)
    const currentQuestionNumber = 10 - totalQuestions;
    document.querySelector(".selected-level").textContent = `Question: ${currentQuestionNumber}`;

    const problemElement = document.querySelector(".problem");
    problemElement.textContent = `${problem}`;

    // Add animation class
    problemElement.classList.remove("problem-appear");
    // Trigger reflow to restart animation
    void problemElement.offsetWidth;
    problemElement.classList.add("problem-appear");

    // Clear feedback message when moving to new problem
    const feedbackElement = document.querySelector(".feedback");
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";

    document.getElementById("answer").value = "";
    document.getElementById("answer").focus();
}

function submitAnswer() {
    // Prevent multiple submissions
    if (isSubmitting) {
        return;
    }

    const feedbackElement = document.querySelector(".feedback");
    const userAnswer = parseInt(document.getElementById("answer").value);

    if (isNaN(userAnswer)) {
        feedbackElement.textContent = "Please enter a valid number.";
        feedbackElement.className = "feedback invalid";
        return;
    }

    // Set flag to prevent additional submissions
    isSubmitting = true;

    if (userAnswer === currentAnswer) {
        score++;
        streak++;

        // Adaptive difficulty: Increase challenge after a streak of 2 correct answers
        if (streak >= 2) {
            currentMaxNum += 3;
            currentMinNum += 1;
            streak = 0;
            console.log(`Difficulty increased! Range: ${currentMinNum} - ${currentMaxNum}`);
        }

        feedbackElement.textContent = "Correct!";
        feedbackElement.className = "feedback correct";

        // Add correct answer animation
        addCorrectAnswerEffect();

        // Clear "Correct!" message and move to next problem after animation
        setTimeout(() => {
            generateProblem();
            isSubmitting = false; // Reset flag after moving to next problem
        }, 800);
    } else {
        currentAttempts++;
        streak = 0; // Reset streak on any mistake

        feedbackElement.textContent = `Incorrect! Try again (${3 - currentAttempts} attempts left).`;
        feedbackElement.className = "feedback incorrect";

        if (currentAttempts === 3) {
            feedbackElement.textContent = `Incorrect! ${currentProblem} = ${currentAnswer} `;
            feedbackElement.className = "feedback incorrect";

            // Adaptive difficulty: Slightly decrease difficulty on total failure
            currentMaxNum = Math.max(currentMaxNum - 2, initialMaxNum);
            currentMinNum = Math.max(currentMinNum - 1, initialMinNum);

            // Clear feedback and move to next problem after showing the answer
            setTimeout(() => {
                generateProblem();
                isSubmitting = false; // Reset flag after moving to next problem
            }, 2500);
        } else {
            // If not the final attempt, allow next submission
            isSubmitting = false;
        }
    }

    document.querySelector(".score").textContent = `Score: ${score}`;
}

// Add visual effect for correct answers
function addCorrectAnswerEffect() {
    const problemElement = document.querySelector(".problem");

    // Add glow animation to problem element
    problemElement.classList.add("correct-answer-animation");
    setTimeout(() => {
        problemElement.classList.remove("correct-answer-animation");
    }, 600);

    // Create confetti burst
    createConfettiBurst();
}

// Create simple confetti burst effect
function createConfettiBurst() {
    const problemElement = document.querySelector(".problem");
    const rect = problemElement.getBoundingClientRect();
    const calculatorContainer = document.querySelector(".calculator-container");
    const containerRect = calculatorContainer.getBoundingClientRect();

    // Center position of problem element
    const centerX = rect.left - containerRect.left + rect.width / 2;
    const centerY = rect.top - containerRect.top + rect.height / 2;

    const colors = ["#4ade80", "#60a5fa", "#fbbf24", "#f472b6"];
    const shapes = ["circle", "square"];

    // Create 12 confetti pieces
    for (let i = 0; i < 12; i++) {
        const confetti = document.createElement("div");
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 8 + 6;

        confetti.style.position = "absolute";
        confetti.style.left = centerX + "px";
        confetti.style.top = centerY + "px";
        confetti.style.width = size + "px";
        confetti.style.height = size + "px";
        confetti.style.backgroundColor = color;
        confetti.style.borderRadius = shape === "circle" ? "50%" : "2px";
        confetti.style.pointerEvents = "none";
        confetti.style.zIndex = "100";

        // Calculate direction
        const angle = (Math.PI * 2 * i) / 12;
        const distance = Math.random() * 80 + 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 30; // Slight upward bias

        confetti.animate(
            [
                { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ],
            {
                duration: 800,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            }
        );

        calculatorContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 800);
    }
}

let gameEnded = false; // Add flag to prevent multiple calls

function endGame() {
    // Check if game already ended
    if (gameEnded) {
        return;
    }

    gameEnded = true;
    clearInterval(timerInterval);

    // Prevent multiple calls to endGame
    if (document.querySelector(".result-container")) {
        // Exit if result container already exists
        return;
    }

    // Hide game interaction elements
    document.getElementById("answer").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("game-elements").style.display = "none";

    // Calculate percentage
    const percentage = (score / 10) * 100;

    // Create fireworks container if score is 70% or higher
    let fireworksContainer;
    if (percentage >= 70) {
        fireworksContainer = document.createElement("div");
        fireworksContainer.className = "fireworks-container";
        document.querySelector(".calculator-container").appendChild(fireworksContainer);

        // Launch fireworks continuously for 5 seconds
        launchFireworks(fireworksContainer);
    }

    // Create celebration effect for lower scores
    if (percentage < 70) {
        const celebration = document.createElement("div");
        celebration.className = "celebration";
        document.querySelector(".calculator-container").appendChild(celebration);
    }

    // Create a result container
    const resultContainer = document.createElement("div");
    resultContainer.className = "result-container";

    // Add different messages based on score percentage
    let message = "";
    let messageClass = "";

    if (percentage >= 70) {
        message = "🎉 Excellent work! 🎉";
        messageClass = "shimmer-text";
    } else if (percentage >= 50) {
        message = "Good effort! Try again to improve!";
    } else {
        message = "Keep practicing! You can do better!";
    }

    resultContainer.innerHTML = `
        <h2 class="${messageClass}">Game Over!</h2>
        <p class="${messageClass}">${message}</p>
        <p>Final Score: <span class="score-animation">${score} / 10 (${percentage}%)</span></p>
        <button id="try-again" class="try-again-btn-animation">Try Again</button>
    `;

    // Add styling to the result container
    resultContainer.style.textAlign = "center";
    resultContainer.style.color = "#f8fafc";
    resultContainer.querySelector("h2").style.fontSize = "2rem";
    resultContainer.querySelectorAll("p").forEach(p => {
        p.style.fontSize = "1.5rem";
    });

    const tryAgainButton = resultContainer.querySelector("#try-again");
    tryAgainButton.style.backgroundColor = "#4ade80";
    tryAgainButton.style.border = "none";
    tryAgainButton.style.padding = "1rem 1.5rem";
    tryAgainButton.style.borderRadius = "14px";
    tryAgainButton.style.marginTop = "1rem";
    tryAgainButton.style.cursor = "pointer";

    // Add click event to try again button
    tryAgainButton.onclick = () => {
        // Stop the timer completely
        clearInterval(timerInterval);

        // Reset gameEnded flag
        gameEnded = false;

        // Remove result container and celebration/fireworks
        resultContainer.remove();
        if (document.querySelector(".celebration")) {
            document.querySelector(".celebration").remove();
        }
        if (fireworksContainer) {
            fireworksContainer.remove();
        }

        // Show start and level elements
        document.getElementById("start").style.display = "block";
        document.getElementById("level").style.display = "block";
    };

    // Add result container to the calculator container
    document.querySelector(".calculator-container").appendChild(resultContainer);
}

// Launch fireworks animation
function launchFireworks(container) {
    let fireworkCount = 0;
    const maxFireworks = 20;

    const fireworkInterval = setInterval(() => {
        if (fireworkCount >= maxFireworks) {
            clearInterval(fireworkInterval);
            return;
        }

        createFirework(container);
        fireworkCount++;
    }, 300);
}

// Create a single firework explosion
function createFirework(container) {
    const colors = ["#4ade80", "#60a5fa", "#f472b6", "#a78bfa", "#fbbf24", "#fb923c"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 60 + 20; // Keep in middle-upper area

    // Create multiple particles for explosion effect
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "firework";
        particle.style.backgroundColor = color;
        particle.style.left = x + "%";
        particle.style.top = y + "%";

        // Calculate random direction for explosion
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = Math.random() * 100 + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        particle.style.animation = `fireworkExplode ${Math.random() * 0.5 + 1}s ease-out forwards`;

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").textContent = timeLeft;

        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

