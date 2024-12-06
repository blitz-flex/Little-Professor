let score = 0;
        let currentProblem;
        let currentAnswer;
        let currentAttempts = 0;
        let totalQuestions = 10;

function generatRandNum(level) {
  if (level == 1) return Math.floor(Math.random() * 10);
  if (level == 2) return Math.floor(Math.random() * 20);
  return Math.floor(Math.random() * 50) + 20 ; 
  } 

function generateRandomOperation() {
  const operations = ["+", "-", "*", "/"]; // Add subtraction to the operations array
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
    correctAnswer = num1 - num2;
  } else if (operation === "*"){
    correctAnswer = num1 * num2;
  } else {
    while (num2 === 0) 
    num2 = generateRandNum(level);
    correctAnswer = Math.floor(num1 /num2);
  }
    
  return {
    problem: `${num1} ${operation} ${num2} `,
    answer: correctAnswer,
  };
  }
  
function palyGame() {
  score = 0;
            currentAttempts = 0;
            totalQuestions = 10;

            // Hide the "Start" button and the "Select level" dropdown
            document.getElementById("start").style.display = "none";
            document.getElementById("level").style.display = "none"; // Hide the level selector
            document.getElementById("answer").disabled = false;
            document.getElementById("submit").disabled = false;
            document.querySelector(".score").textContent = `Score: 0`;
            document.querySelector(".feedback").textContent = "";

            // Get the selected level and display it on the screen
            const level = document.getElementById("level").value;
            document.querySelector(".selected-level").textContent = `Level: ${level}`;
            
            generateProblem(parseInt(level));
        }

generateRandomProblem(level);
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
      
      

      do {
          const userAnswer = prompt(`${problem}= `);
          // Check if the user's answer is correct
          if (parseInt(userAnswer) === answer) {
              score++;
              break;
          }   else {
              console.log("EEE");
              attemps++;

              // If it's the third attempt, print the correct answer
              if (attemps === 3) {
                console.log(`${problem}= ${answer}` );
              }
          }
      }while (attemps < 3);
  }  
  console.log(`Score: ${score}`);
}

palyGame();