function littProf() {
    let level;

    // Loop until the user enters a valid level (1, 2, or 3)
    do {
        level = prompt("select level: ");
    }   while (level !== "1" && level !== "2" && level !== "3")
    // Convert the level string to an integer and return it
    return parseInt(level);
}

function generatRandNum(level) {
    if (level == 1) {
        //Generates a random number between 0 and 4 and returns it.
        return Math.floor(Math.random() * 5);
    }   else if (level == 2) {
        return Math.floor(Math.random() * 10);
    }   else {
        return Math.floor(Math.random() * 20);
    } 
}
function generateRandomOperation() {
    const operations = ["+", "-"]; // Add subtraction to the operations array
    return operations[Math.floor(Math.random() * operations.length)];
    }
    
    function generateRandomProblem(level) {
    const num1 = generatRandNum(level);
    const num2 = generatRandNum(level);
    const operation = generateRandomOperation();
    
    let correctAnswer;
    if (operation === "+") {
      correctAnswer = num1 + num2;
    } else if (operation === "-") {
      correctAnswer = num1 - num2;
    }
    
    return {
      problem: `${num1} ${operation} ${num2} `,
      answer: correctAnswer
    };
    }
    

function palyGame() {
    const level = littProf();
    let score = 0;
    
    // Loop 10 times to generate and solve 10 problems
    for (let i = 0; i< 5; i++){
        
        const { problem, answer } = generateRandomProblem(level);
        let attemps = 0;
        
        // Loop until the user answers correctly or reaches 3 attempts

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
