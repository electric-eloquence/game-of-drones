# [Game of Drones](https://electric-eloquence.io/game-of-drones.html)

## The Donald vs. Karens

[**drone**](https://www.merriam-webster.com/dictionary/drone) &nbsp;noun  
\ *ˈdrōn* \

> one that lives on the labors of others : PARASITE

Game of Drones is a computer simulation of the Prisoner's Dilemma, perhaps the most studied game in Game Theory. The Prisoner's Dilemma presents two players with the decision (dilemma) to cooperate with or defect against the other. (The original premise is that they are prisoners given the option of testifying against the other in exchange for freedom/reduced prison time.) Their decisions are unknown to the other until the time of play. The rewards and penalties in this version are as follows:

* Both cooperate: both gain 1 point
* One cooperates, one defects: cooperator loses 1 point, defector gains 2 points
* Both defect: neither gains nor loses anything

When the Prisoner's Dilemma is to be played multiple times with no knowledge of how many times, the Tit-for-Tat strategy is widely considered to be the most robust. This strategy is remarkably simple:

* Be nice: cooperate by default; when engaging a stranger, cooperate
* Be retaliating: if the other player defects, defect on the next engagement with that player
* Be forgiving: if the formerly defecting player cooperates, cooperate on the next engagement with that player

There are four teams of players in Game of Drones. Each player starts the game with 10 points. On each turn, the player moves (or stays put) on a matrix and when encountering a neighbor, engages in the Prisoner's Dilemma. The team strategies are as follows:

* Snowflakes: play Tit-for-Tat
* Karens: always defect
* Magas: always cooperate with their own and with the Donald, defect against everyone else
* the Donald: always defect

Game of Drones adds some aspects beyond the Prisoner's Dilemma: engagement risk and death. Engagement risk threatens a loss of 1 point per player during engagements. The probability is determined by a user-selected percentage figure. Death occurs when points go to 0.

Snowflakes are at a disadvantage early on, as their niceness leads to a much greater initial point loss than for other teams. To give Snowflakes a fighting chance, engagement risk is introduced after all Snowflakes have acquired a memory of how the other players played.

Karens start out immune to engagement risk. They only suffer risk after all cooperators have died, cooperators being Snowflakes and Magas. This takes the shape of an inverse (perverse) karma where those who produce die so that those who only consume may live.

Magas are alone in incurring ongoing loss to defection. They tend to die off quickly, even with zero engagement risk.

Setting engagement risk low may result in Snowflakes never dying. The simulation will run until it reaches its kill screen.

Setting engagement risk high will almost certainly kill all Snowflakes. After the cooperators have died, the drones' points will wilt away until one or no winner emerges.

The simulation is deterministic and will use the same pseudorandom values to determine moves until the page is refreshed or closed. So long as engagement risk is unchanged, each rerun will play out the same.
