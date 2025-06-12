let score = 0;
let currentProblem;
let currentAnswer;
let currentAttempts = 0;
let totalQuestions = 10;
let timeLeft = 60; 
let timerInterval; 

function generateRandNum(level) {
    if (level == 1) return Math.floor(Math.random() * 10);
    if (level == 2) return Math.floor(Math.random() * 20);
    return Math.floor(Math.random() * 10) + 20;
}

function generateRandomOperation() {
    const operations = ["+", "-", "*", "/"];
    return operations[Math.floor(Math.random() * operations.length)];
}

function generateRandomProblem(level) {
    let num1 = generateRandNum(level);
    let num2 = generateRandNum(level);
    const operation = generateRandomOperation();

    let correctAnswer;
    if (operation === "+") {
        correctAnswer = num1 + num2;
    } else if (operation === "-") {
        while (num1 <= num2) {
            num1 = generateRandNum(level);
            num2 = generateRandNum(level);
        }
        correctAnswer = num1 - num2;
    } else if (operation === "*") {
        correctAnswer = num1 * num2;
    } else { 
        // Regenerate both numbers until they are perfectly divisible and num2 is not 0
        while (num2 === 0 || num1 % num2 !== 0) {
            num1 = generateRandNum(level);
            num2 = generateRandNum(level);
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
    
    // Get selected level
    const level = parseInt(document.getElementById("level").value);
    
    // Set time based on level
    if (level === 1) {
        timeLeft = 60;  
    } else if (level === 2) {
        timeLeft = 120; 
    } else {
        timeLeft = 180; 
    }

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
    document.querySelector(".selected-level").textContent = `Level: ${level}`;

    // **Generate the first problem immediately**
    generateProblem(level);
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

function generateProblem(level) {
    if (totalQuestions === 0) {
        endGame();
        return;
    }

    const { problem, answer } = generateRandomProblem(level);
    currentProblem = problem;
    currentAnswer = answer;
    currentAttempts = 0;
    totalQuestions--;

    const problemElement = document.querySelector(".problem");
    problemElement.textContent = `${problem}`;
    
    // Add animation class
    problemElement.classList.remove("problem-appear");
    // Trigger reflow to restart animation
    void problemElement.offsetWidth; 
    problemElement.classList.add("problem-appear");
    
    document.getElementById("answer").value = "";
    document.getElementById("answer").focus(); 
}

function submitAnswer() {
    const feedbackElement = document.querySelector(".feedback");
    const userAnswer = parseInt(document.getElementById("answer").value);

    if (isNaN(userAnswer)) {
        feedbackElement.textContent = "Please enter a valid number.";
        feedbackElement.className = "feedback invalid";
        return;
    }

    if (userAnswer === currentAnswer) {
        score++;
        feedbackElement.textContent = "Correct!";
        feedbackElement.className = "feedback correct";
        
        // Add correct answer animation
        addCorrectAnswerEffect();
        
        const level = parseInt(document.getElementById("level").value);
        generateProblem(level);
    } else {
        currentAttempts++;
        feedbackElement.textContent = `Incorrect! Try again (${3 - currentAttempts} attempts left).`;
        feedbackElement.className = "feedback incorrect";

        if (currentAttempts === 3) {
            feedbackElement.textContent = `Incorrect! The correct answer was ${currentAnswer}.`;
            const level = parseInt(document.getElementById("level").value);
            generateProblem(level);
        }
    }

    document.querySelector(".score").textContent = `Score: ${score}`;
}

// Add visual effect for correct answers
function addCorrectAnswerEffect() {
    // Create and add floating particles
    for (let i = 0; i < 10; i++) {
        createParticle();
    }
}

// Create floating particle effect
function createParticle() {
    const particle = document.createElement("div");
    const colors = ["#4ade80", "#60a5fa", "#f472b6", "#a78bfa"];
    
    // Random position around the problem area
    const problemElement = document.querySelector(".problem");
    const rect = problemElement.getBoundingClientRect();
    const calculatorContainer = document.querySelector(".calculator-container");
    const containerRect = calculatorContainer.getBoundingClientRect();
    
    // Position relative to the calculator container
    const x = rect.left - containerRect.left + Math.random() * rect.width;
    const y = rect.top - containerRect.top + Math.random() * rect.height;
    
    // Styling
    particle.style.position = "absolute";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.width = Math.random() * 10 + 5 + "px";
    particle.style.height = particle.style.width;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "100";
    
    // Animation
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 3 + 2;
    const tx = Math.cos(angle) * (Math.random() * 100 + 50);
    const ty = Math.sin(angle) * (Math.random() * 100 + 50);
    
    particle.animate(
        [
            { transform: "translate(0, 0)", opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px)`, opacity: 0 }
        ],
        {
            duration: Math.random() * 1000 + 500,
            easing: "cubic-bezier(0, .9, .57, 1)"
        }
    );
    
    calculatorContainer.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        particle.remove();
    }, 1500);
}

function endGame() {
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

    // Create celebration effect
    const celebration = document.createElement("div");
    celebration.className = "celebration";
    document.querySelector(".calculator-container").appendChild(celebration);

    // Create a result container
    const resultContainer = document.createElement("div");
    resultContainer.className = "result-container";
    
    // Add different messages based on score
    let message = "";
    if (score >= 8) {
        message = "Excellent work!";
    } else if (score >= 5) {
        message = "Good job!";
    } else {
        message = "Keep practicing!";
    }
    
    resultContainer.innerHTML = `
        <h2>Game Over!</h2>
        <p>${message}</p>
        <p>Final Score: <span class="score-animation">${score} / 10</span></p>
        <button id="try-again" class="try-again-btn-animation">Try Again</button>
    `;

    // Add styling to the result container
    resultContainer.style.textAlign = "center";
    resultContainer.style.color = "#f8fafc";
    resultContainer.querySelector("h2").style.fontSize = "2rem";
    resultContainer.querySelector("p").style.fontSize = "1.5rem";
    
    const tryAgainButton = resultContainer.querySelector("#try-again");
    tryAgainButton.style.backgroundColor = "#4ade80";
    tryAgainButton.style.border = "none";
    tryAgainButton.style.padding = "1rem 1.5rem";
    tryAgainButton.style.borderRadius = "14px";
    tryAgainButton.style.marginTop = "1rem";
    tryAgainButton.style.cursor = "pointer";

    // Add click event to try again button
    tryAgainButton.onclick = () => {
        // Remove result container and celebration
        resultContainer.remove();
        if (document.querySelector(".celebration")) {
            document.querySelector(".celebration").remove();
        }
        
        // Show start and level elements
        document.getElementById("start").style.display = "block";
        document.getElementById("level").style.display = "block";
    };

    // Add result container to the calculator container
    document.querySelector(".calculator-container").appendChild(resultContainer);
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