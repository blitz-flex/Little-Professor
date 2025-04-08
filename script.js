let score = 0;
let currentProblem;
let currentAnswer;
let currentAttempts = 0;
let totalQuestions = 10;
let timeLeft = 60; 
let timerInterval; 

function generatRandNum(level) {
    if (level == 1) return Math.floor(Math.random() * 10);
    if (level == 2) return Math.floor(Math.random() * 20);
    return Math.floor(Math.random() * 50) + 20;
}

function generateRandomOperation() {
    const operations = ["+", "-", "*", "/"];
    return operations[Math.floor(Math.random() * operations.length)];
}

function generateRandomProblem(level) {
    let num1 = generatRandNum(level);
    let num2 = generatRandNum(level);
    const operation = generateRandomOperation();

    let correctAnswer;
    if (operation === "+") {
        correctAnswer = num1 + num2;
    } else if (operation === "-") {
        while (num1 <= num2) {
            num1 = generatRandNum(level);
            num2 = generatRandNum(level);
        }
        correctAnswer = num1 - num2;
    } else if (operation === "*") {
        correctAnswer = num1 * num2;
    } else {
        while (num2 === 0 || num1 % num2 !== 0) {
            num2 = generatRandNum(level);
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
    timeLeft = 60;

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
    
    // Get and display selected level
    const level = document.getElementById("level").value;
    document.querySelector(".selected-level").textContent = `Level: ${level}`;

    // **Generate the first problem immediately**
    generateProblem(parseInt(level));
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

    document.querySelector(".problem").textContent = `${problem}`;
    document.getElementById("answer").value = "";
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

function endGame() {
    clearInterval(timerInterval); // Stop the timer
    
    // Hide game interaction elements
    document.getElementById("answer").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("game-elements").style.display = "none";

    // Create a result container
    const resultContainer = document.createElement("div");
    resultContainer.className = "result-container";
    resultContainer.innerHTML = `
        <h2>Game Over!</h2>
        <p>Final Score: ${score} / 10</p>
        <button id="try-again">Try Again</button>
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
        // Remove result container
        resultContainer.remove();
        
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