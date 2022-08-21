# LoL_predict
### Introduction
LoL_predict is an app whose purpose is to dare a prediction on the game that the person who started the application is playing.
### How does it work?
The main informations of the player are shown using the data that is given by the LOL game launcher client and Riot Games official API. In the first case the app listens for events from the LOL Client, in the second case HTTPS Requests on official League of Legends API are made.
The data taken into consideration to make the prediction are the Winrate of the player, the Winrate with the Champion who is currently playing and the difference between the opposing Team and his own going to control both the Elo and the Winrate.
