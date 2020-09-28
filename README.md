# wikiracing.io

**Now up and running on [wikiracing.io](https://www.wikiracing.io/)!**

wikiracing.io is an online multiplayer *io* game based on the concept of Wiki racing. :tada::tada:

## How It Works :nut_and_bolt:
1. Go to [wikiracing.io](https://www.wikiracing.io/).
2. Type in your username and create a new room.
3. Send out the room code to your friends and tell them to hop on!
4. Select a combination of start and target pages. 
5. Start the race! The first person to reach the target page gets a point.
6. Repeat steps 4 and 5. 
7. Have fun!

## How Its Build :wrench:
The back-end of the [wikiracing.io](https://www.wikiracing.io/) is built using Flask. The flexibility of Flask is great, and support for socket.io makes it especially great for multiplayer names. The backend is deployed on Heroku, and handles the game logic, the scoring system and the delivery of Wikipedia pages (using the Requests library and Wikipedia API). 

The front-end relies entirely upon React, making API calls to the back-end. React contains a plethora of useful libraries that make it easy to develop an interactive web app. Some of the great ones we used are react-router-dom, react-hook-forms, and react-html-parser. The front-end is hosted on Netlify. 

## Wishlist :gift:
1. Add a ranking system, awarding points to the first three players to finish. The person with the highest score at the end wins.
2. Add a 'Give Up' button during the race.
3. Assign a difficulty to each page combination.
5. Add timed game mode.

## About Us :two_men_holding_hands:
wikiracing.io was built by [Vimal Raj](https://github.com/vimalrj7) and [Sameer Bharatia](https://github.com/sameerbharatia).

## License :hammer:
This repository does not have a license as of yet.




