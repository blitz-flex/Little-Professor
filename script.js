let score = 0;
let currentProblem;
let currentAnswer;
let currentAttempts = 0;
let totalQuestions = 10;

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
  const num1 = generatRandNum(level);
  let num2 = generatRandNum(level);
  const operation = generateRandomOperation();

  let correctAnswer;
  if (operation === "+") {
    correctAnswer = num1 + num2;
  } else if (operation === "-") {
    // Ensure subtraction results in positive numbers
    while (num1 <= num2) {
      num1 = generatRandNum(level);
      num2 = generatRandNum(level);
    }
    correctAnswer = num1 - num2;
  } else if (operation === "*") {
    correctAnswer = num1 * num2;
  } else {
    // Ensure division results in positive integers and no remainders
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

    // Hide "Start" button and level selector
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

    generateProblem(parseInt(level));
}

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

    document.querySelector(".problem").textContent = `Solve: ${problem}`;
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
    document.getElementById("answer").disabled = true;
    document.getElementById("submit").disabled = true;
    document.querySelector(".problem").textContent = "Game Over!";
    document.querySelector(".feedback").className = "feedback game-over";
    document.querySelector(".feedback").textContent = `Final Score: ${score} / 10`;

    // Show "Start" button and level selector for replay
    document.getElementById("start").style.display = "block";
    document.getElementById("level").style.display = "block";
    document.querySelector(".selected-level").textContent = ""; // Clear displayed level
}function generateRandomProblem(level) {
  const num1 = generatRandNum(level);
  let num2 = generatRandNum(level);
  const operation = generateRandomOperation();

  let correctAnswer;
  if (operation === "+") {
    correctAnswer = num1 + num2;
  } else if (operation === "-") {
    // Ensure subtraction results in positive numbers
    while (num1 <= num2) {
      num1 = generatRandNum(level);
      num2 = generatRandNum(level);
    }
    correctAnswer = num1 - num2;
  } else if (operation === "*") {
    correctAnswer = num1 * num2;
  } else {
    // Ensure division results in positive integers and no remainders
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