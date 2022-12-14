# LoL_predict
### Introduction
LoL_predict is an app whose purpose is to dare a prediction on the game that the person who started the application is playing.
### How does it work?
The main informations of the player are shown using the data that is given by the LOL game launcher client and Riot Games official API. In the first case the app listens for events from the LOL Client, in the second case HTTPS Requests on official League of Legends API are made.
The data taken into consideration to make the prediction are the Winrate of the player, the Winrate with the Champion who is currently playing, the difference in Elo and Winrate between the opposing team and your own.
* Used Tecnologies: NodeJS, JS, HTML5, CSS, Tensorflow.js library, electron and electron-builder.

### User Interface
* Loading Screen: at first when starting the application a screen appears where the player is expected to create a lobby or do some other similar activity.

  <img src="https://github.com/alaendro/lol_predict/blob/main/docs/lol_p1.PNG" width="500">  
* Main Screen: once the player creates a lobby he will have his data such as Nickname, Elo, Level and Result of the last games on the screen.
  <img src="https://github.com/alaendro/lol_predict/blob/main/docs/lol_p2.PNG" width="500">
* Prediction Box: once the player enters the game the prediction will start and it will be shown in the box on the right.
  <img src="https://github.com/alaendro/lol_predict/blob/main/docs/lol_p3.PNG" width="500">
  
### Prerequisites
* Install NodeJS (latest LTS is recomended).

### Build and Run
* Clone and change directory
* Build your standalone electron app:
```
   $ npm run build
```
 and then execute lol_predict in lol_predict/dist/win-unpacked/
 
* Run your app in dev envrionment:
``` 
   $ npm run start
```

### Authors
LoL_predict is a university project by Alessandro Ingrosso ( @alaendro ) and Francesco Di Bella ( @FrancescoDiBella ), two students of University of Catania.
