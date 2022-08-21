# LoL_predict
### Introduction
LoL_predict is an app whose purpose is to dare a prediction on the game that the person who started the application is playing.
### How does it work?
The main informations of the player are shown using the data that is given by the LOL game launcher client and Riot Games official API. In the first case the app listens for events from the LOL Client, in the second case HTTPS Requests on official League of Legends API are made.
The data taken into consideration to make the prediction are the Winrate of the player, the Winrate with the Champion who is currently playing, the difference in Elo and Winrate between the opposing team and your own.
### User Interface
* Loading Screen: at first when starting the application a screen appears where the player is expected to create a lobby or do some other similar activity.
  * INSERIRE SCREENSHOT
* Main Screen: once the player creates a lobby he will have his data such as Nickname, Elo, Level and Result of the last games on the screen.
  * INSERIRE SCREENSHOT
* Prediction Box: once the player enters the game the prediction will start and it will be shown in the box on the right.
  * INSERIRE SCREENSHOT
  
### Prerequisites
* Install NodeJS (latest LTS is recomended).

### Build and Run
--- cioaoo ---
