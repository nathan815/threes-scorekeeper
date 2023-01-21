# Threes Scorekeeper

[![Frontend CI](https://github.com/nathan815/threes-scorekeeper/actions/workflows/frontend.yml/badge.svg)](https://github.com/nathan815/threes-scorekeeper/actions/workflows/frontend.yml)
[![Backend CI](https://github.com/nathan815/threes-scorekeeper/actions/workflows/backend.yml/badge.svg)](https://github.com/nathan815/threes-scorekeeper/actions/workflows/backend.yml)

Scorekeeping web app for the card game _Threes_. Supports desktop and mobile with a responsive design.

_Built with TypeScript, React, Chakra UI, Node, MongoDB._

This application fully facilitates the scorekeeping process and displays the current wild card to players + a live view of the scoreboard to all players. It also enables players to maintain a digital record of their play history. It _doesn't_ have online game play functionality (yet?).

## Screenshots

### Pre-start game view (host)
<img width="1680" alt="Screen Shot 2023-01-14 at 12 48 42 AM" src="https://user-images.githubusercontent.com/1972782/212457980-55f79abc-6094-42f3-9d5b-8aaf93cbe276.png">



### Game view (host)
<img width="1680" alt="Screen Shot 2023-01-14 at 12 46 59 AM" src="https://user-images.githubusercontent.com/1972782/212457943-f9b02799-9e7a-4529-a89c-ea024d2aba3a.png">




## Local Setup
Nodejs v18+ required.

Install Git hooks: `./hooks/install` 

Prettier will automatically run on any staged files when committing.


### Backend

`cd backend`

`npm install`

`npm start`

### Frontend

`cd frontend`

`npm install`

`npm start`

----

# Explanation of _Threes_

_See also https://en.wikipedia.org/wiki/Three_thirteen_

This card game is a variation of _Rummy_. It is played with two standard 52-card decks combined (jokers removed) for a total of 104 cards. There are 11 total rounds and can be played with 2-8 players.

The objective of this game is to get the _least amount of points_. In each round the goal is to eliminate all cards ("go out") by strategically discarding cards to form _matching sets_. There are 11 total rounds with each round corresponding to a rank (3 thru 13/Kings).

Each player takes a turn dealing the cards, and it goes clockwise around the table each round. (See "dealer bonus" below dealer's point-reduction oppurtunity.)

Players start Round 1 with Three as the _wild card_. This means any card with a rank of Three is wild. 

Players always start with and must maintain in their hand the number of cards corresponding to the round, i.e. on the first round everyone has 3 cards, the second round everyone has 4 cards, etc.

During a round, each player takes a turn going around the table until somebody "goes out". At start of turn, a player can either draw a card from the top of the deck or from the top of the discard pile. They must choose one of the cards in their hand to discard after this action. 

A player "goes out" once they have eliminated all their cards with matching sets. All other players get to take one last turn. Then all player's points are recorded, cards are shuffled, and the next round begins.

Cards in a hand can be eliminated by having either a run of at least 3 cards (same suit) _or_ at least 3 of the same face value cards (any suit). The _wild card_ corresponding to the current round counts for any card.

At the end of a round, a player's score is calculated by adding the face value (rank) of each _non-eliminated_ card in their hand. For example, if a player has a 5, a Queen, and a King, they would get 5+12+13 = 30 points that round.

### Round 1 (Threes)

Example qualifying sets:

1. RUN of 3 - [Jack of Hearts], [Queen of Hearts], [King of Hearts]
2. SAME FACE VALUE - [5 of Diamonds], [5 of Hearts], [5 of Spades]
3. RUN of 3 - [Ace of Clubs], [2 of Clubs], [3 of Clubs]

### Round 2 (Fours)

On Round 2, fours are wild. The same rules as above apply, but now every player starts with 4 cards.

Example qualifying sets:
1. RUN of 4 - [10 of Hearts], [Jack of Hearts], [Queen of Hearts], [King of Hearts]
2. SAME FACE VALUE - [5 of Diamonds], [5 of Hearts], [5 of Spades], [5 of Hearts]
3. RUN of 4 - [Ace of Clubs], [2 of Clubs], [3 of Clubs], [4 of Clubs]

Example partial sets:
1. [6 of Hearts], [Jack of Hearts], [Queen of Hearts], [King of Hearts]
   
   Single RUN of 3 cards, one unmatched card [6]. POINTS = 6

2. [5 of Diamonds], [5 of Hearts], [5 of Spades], [Queen of Hearts]
   
   3 same face value, one unmatched card [Queen]. POINTS = 12

### Rounds 5...King
...

### Winner
The winner is the player with the least total points summed across all the rounds.


### Dealer Bonus [-20 points]
If the dealer cuts the deck at the exact amount of cards needed for the round, they get a point reduction of -20 points.

Examples:

* On Round 1 with 5 players, the dealer would need to pick up exactly 16 cards (3 cards * 5 players + 1 to put face up on deck).
* On the last round (Kings) with 5 players, the dealer would need to pick up exactly 66 cards (13 cards * 5 players + 1).
