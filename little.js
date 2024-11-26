function littProf() {
    let level;
    
    // Loop until the user enters a valid level (1, 2, or 3)
    do {
        level = prompt("select level: ");
    }   while (level !== "1" && level !== "2" && level !== "3")
    // Convert the level string to an integer and return it
    return parseInt(level);
}
