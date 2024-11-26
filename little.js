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
