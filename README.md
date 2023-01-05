# Threes Scorekeeper

Scorekeeping web app for the card game _Threes_. Supports desktop and mobile with a responsive design.

_Built with TypeScript, React, Chakra UI, Node, MongoDB._

This application fully facilitates the scorekeeping process and displays the current wild card to players + a live view of the scoreboard to all players. It also enables players to maintain a digital record of their play history. It _doesn't_ have actual game play functionality (yet?).

## Explanation of _Threes_

This card game is a variation of _Rummy_. It is played with two standard 52-card decks combined for a total of 104 cards (shuffled).

The goal of this game is to get the _least amount of points_. In each round the goal is to get to zero by strategically discarding cards to form _matching combinations_ in order to 'eliminate' the cards in hand. There are 11 total rounds with each round corresponding to a rank (3 thru Kings/13).

Each player takes a turn dealing the cards, and it goes clockwise around the table each round. (See "dealer bonus" below dealer's point-reduction oppurtunity.)

Players start Round 1 with Three as the _wild card_. This means any card with a rank of Three is wild. 

Players always start with and must maintain in their hand the number of cards corresponding to the round, i.e. on the first round everyone has 3 cards, the second round everyone has 4 cards, etc.

During a round, each player takes a turn going around the table until somebody "goes out". At start of turn, a player can either draw a card from the top of the deck or from the top of the discard pile. They must choose one of the cards in their hand to discard after this action. 

A player "goes out" once they have eliminated all their cards with matching combinations. This ends the round after all other players take one last turn.

Cards in a hand can be eliminated by having either a run of the same suit of at least length 3 _or_ at least 3 of the same face value cards (any suit). The _wild card_ corresponding to the current round counts for any card.

At the end of a round, a player's score is calculated by adding the face value (rank) of each _non-eliminated_ card in their hand. For example, if a player has a 5, a Queen, and a King, they would get 5+12+13 = 30 points that round.

### Round 1 (Threes)

Example combinations that fully cancel each other out: 

1. RUN of 3 - [Jack of Hearts], [Queen of Hearts], [King of Hearts]
2. SAME FACE VALUE - [5 of Diamonds], [5 of Hearts], [5 of Spades]
3. RUN of 3 - [Ace of Clubs], [2 of Clubs], [3 of Clubs]

### Round 2 (Fours)

On Round 2, fours are wild. The same rules as above apply, but now every player starts with 4 cards.

Example combinations that fully cancel each other out: 
1. RUN of 4 - [10 of Hearts], [Jack of Hearts], [Queen of Hearts], [King of Hearts]
2. SAME FACE VALUE - [5 of Diamonds], [5 of Hearts], [5 of Spades], [5 of Hearts]
3. RUN of 4 - [Ace of Clubs], [2 of Clubs], [3 of Clubs], [4 of Clubs]

Example partial combinations:
1. [6 of Hearts], [Jack of Hearts], [Queen of Hearts], [King of Hearts]
   
   Single RUN of 3 cards, one unmatched card [6]. SCORE = 6

2. [5 of Diamonds], [5 of Hearts], [5 of Spades], [Queen of Hearts]
   
   3 same face value, 1 unmatched card [Queen]. SCORE = 12

### Rounds 5...King
...

## Winner
The winner is the player with the least total points summed across all the rounds.


## Dealer Bonus [-20 points]
If the dealer "cuts" the deck perfectly such that they drew exactly the amount of cards needed for the round, they get a point reduction of -20 points.

For example, on Round 1 with 5 players, the dealer would need to draw exactly 15 cards (3 cards * 5 players) in one go.

On the last round (Kings) with 5 players, the dealer would need to draw exactly 65 cards (13 cards * 5 players) in one go.
