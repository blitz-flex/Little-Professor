# Little Professor

[Little Professor" by Texas Instruments](https://youtu.be/ZuJwzH9BIgs?si=vHdYxDB7JH-Ip2ly)

As a child, David's one of the first toys was "Little Professor", a calculator that posed ten different math problems for David. If the toy displayed 4 + 0 =, David would write 4, and for 4 + 1 =, he would write 5. If David gave an incorrect answer, the toy would display "EEE". Finally, after three incorrect answers for the same calculation, the toy would simply show the correct answer (e.g., 4 + 0 = 4 or 4 + 1 = 5).
Write a program that:

 - Prompts the user to choose a game level. If the user does not enter 1, 2, or 3, the program should ask the same question again.
- Randomly generates ten (10) math problems, formatted as X + Y =, where both X and Y are positive integers.
- Asks the user to solve each problem. If the answer is incorrect (or not a number at all), the program should print "EEE" and print the same problem again, allowing the user a total of three attempts to solve this problem. If the user still cannot write the correct answer after three attempts, the program should write the correct answer itself.
- Finally, the program should print the user's score: the number of correct answers out of 10. Create your program as follows, where one function prompts (and re-asks if necessary) the user to choose a game level and returns 1, 2, or 3; the second function returns a randomly generated positive integer, taking into account the level number, or prints an error message if the level is not 1, 2, or 3.
