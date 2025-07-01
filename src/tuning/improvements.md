# Improvements

There are various ways to test whether some change has improved the engine or not, you can maybe think of testing by measuring
time to get to certain depth or puzzles solved correctly, however, as easy as this methods are, they are only useful when the difference is really notable or we are testing various improvements fast that we want to get an approximation to seriously test them later.

How you should really test a change is by playing some games (the more the better) between the original state and the change,
this can be done via a script or a GUI which usually allows this kind of behaviour. How would we know whether it is better, equal or worse, well, you will end up with a number for the Wins/Draws/Loses, you can intuit it will be good to have more wins than losses, however, how much wins do we need to get to a conclusion, even more, what if we want to know how much better is the new patch, well, statistics come to help so that we are certain of our conclusion, we will even get an ELO difference which is usually included in the new patch changelog. There are various methods, various time controls, we will first explain tolerance and then we will show the most straight forward and used one.

## Tolerance
All conclusions have to be made with a tolerance of error, not just the ELO difference but whether or not our **hypothesis**
is correct. For the tolerance there are lots of distributions (T of Student i.e) and values, the most used tolerance
is for a value of 0.05 which means 95% certainty of the conclusion. Depending on the method, differences and number of games
it will need some different results.

## SPRT (Sequential Probability Ratio Test)
It is a Sequential hypothesis testing method, virtually, all top engines use it today one way or another, here we will
show how to easily do it in our machine using fast chess, which supports pentanomial statistics and its fast and easy to use.
