process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { BrowserWindow, app, ipcMain, dialog, Menu } = require("electron");
const { webContents } = require("electron");
const path = require("path");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const https = require('node:https');
const api_server = require('./modules/api_riot');

//const fetch = require('node-fetch');
//import {get_winrate_player_champions  , get_last_champion_played} from "./public/assets/js/to_api_server";
//const function_player = require("./public/assets/js/to_api_server");

//roba backend
const { data } = require("jquery");
const LCUConnector = require("lcu-connector");
const WebSocket = require('ws');

const MESSAGE_TYPES = {
    WELCOME: 0,
    PREFIX: 1,
    CALL: 2,
    CALLRESULT: 3,
    CALLERROR: 4,
    SUBSCRIBE: 5,
    UNSUBSCRIBE: 6,
    PUBLISH: 7,
    EVENT: 8
};

var lolData = null;
let player_name = null;
//fine

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        minWidth: 600,
        minHeight: 500,
        titleBarStyle: "hiddenInset",
        transparent: true,
        frame:false,
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(app.getAppPath(), "renderer.js")
        }
    })
    mainWindow.setBackgroundColor("rgba(10, 20, 40, 0.8)");
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("./public/index.html");

    ipcMain.on('closeApp', ()=>{
        console.log("CLOSE");
        mainWindow.close();
    })

    ipcMain.on('minimizeApp', ()=>{
        console.log("MIN");
        mainWindow.minimize();
    })

    ipcMain.on('maximizeApp', ()=>{
        console.log("MAX");
        if(mainWindow.isMaximized()){
            mainWindow.unmaximize();
        }else
            mainWindow.maximize();
    })
}

app.whenReady().then(createWindow);

console.log("SONO IL MAIN");

/*
setTimeout(5000, ()=>{
    let options = {
        hostname: '127.0.0.1',
        port: port,
        path:'/lol-service-status/v1/lcu-status',
        method: 'GET',
        rejectUnauthorized: false
    }

    let req = https.request(options, (res)=>{
        console.log('All OK. Server matched our pinned cert or public key');
        console.log('statusCode:', res.statusCode);
        // Print the HPKP values
        console.log('headers:', res.headers['public-key-pins']);
        res.on("data", (d)=>{console.log("\n DATI FETCH \n"+d+"\nDATI FETCH")});
    })

    req.on('error', (e) => {
        console.error("ERROR"+e.message);
      });
    
    req.end();
})
*/

class RiotWSProtocol extends WebSocket {

    constructor(url) {
        super(url, 'wamp');

        this.session = null;
        this.on('message', this._onMessage.bind(this));
    }

    close() {
        super.close();
        this.session = null;
    }

    terminate() {
        super.terminate();
        this.session = null;
    }

    subscribe(topic, callback) {
        super.addListener(topic, callback);
        this.send(MESSAGE_TYPES.SUBSCRIBE, topic);
    }

    unsubscribe(topic, callback) {
        super.removeListener(topic, callback);
        this.send(MESSAGE_TYPES.UNSUBSCRIBE, topic);
    }

    send(type, message) {
        super.send(JSON.stringify([type, message]));
        //console.log("prova console.log", JSON.stringify([type, message]));
    }

    _onMessage(message) {
        const [type, ...data] = JSON.parse(message);
        //lolData = data.payload;

        //console.log("DATI PRESI DA NOI" + lolData + "altri dati\n");

        switch (type) {
            case MESSAGE_TYPES.WELCOME:
                this.session = data[0];
                // this.protocolVersion = data[1];
                // this.details = data[2];
                break;
            case MESSAGE_TYPES.CALLRESULT:
                console.log('Unknown call, if you see this file an issue at https://discord.gg/hPtrMcx with the following data:', data);
                break;
            case MESSAGE_TYPES.TYPE_ID_CALLERROR:
                console.log('Unknown call error, if you see this file an issue at https://discord.gg/hPtrMcx with the following data:', data);
                break;
            case MESSAGE_TYPES.EVENT:
                const [topic, payload] = data;
                lolData = payload;
                //console.log("il playload" + JSON.stringify(payload) +"zono payload");

                //console.log(lolData);
                try{
                    if(lolData.data.gameName != undefined && player_name == null && lolData.uri == '/lol-chat/v1/me'){
                        player_name = lolData.data.gameName;
                        let player_level = lolData.data.lol.level;
                        let player_ranked_tier = lolData.data.lol.rankedLeagueTier;
                        let player_ranked_level = lolData.data.lol.rankedLeagueDivision;
                        //console.log(player_ranked_level);
                        let icon_id = lolData.data.icon;

                        //console.log("PLAYER NAME: " + player_name);
                        mainWindow.webContents.send("info-player-get", {player_name , player_level, player_ranked_tier,player_ranked_level, icon_id});

                        //api_server.get_last_champion_played("AlexNext");
                        api_server.get_winrate_player_champions("AlexNext", 10);
               
                        //get_winrate_player_champions("AlexNext", 10, "Olaf");
                        //get_last_champion_played("AlexNext");
                        /*
                        fetch("https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_5941739548?api_key=RGAPI-85b552a9-51c6-45e2-b3ca-3d01b429cfb7")
                        .then(response => response.json())
                        .then(data => {
                            console.log("dati stampati da fetch" + JSON.stringify(JSON.stringify(data)));
                        })
                        */

                        //codice momentaneo(?) di seguito per vedere differenza di elo tra i vari tizi
                        //visti i dati che vengono forniti dall'app l'idea è sempre quella di utilizzare le api per ottenere il match da cui poi si prendono i partecipanti
                        //serve il summonerId che è salvato dalla API come Id
                        //la funzione ultima da chiamare per calcolare elo etc è 
                        //https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/Z2FkqeYQXUklIqRdkbrKdyV1nSuAxP68x9tqpVsrCDURtpo
                        //dove l'ultimo è il summonerId di un tizio random
                        //da questa funzione si prendono tutti i summonerId o i nickname e si chiama
                        //https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/Z2FkqeYQXUklIqRdkbrKdyV1nSuAxP68x9tqpVsrCDURtpo
                        //che ritorna le informazioni richieste in modo semplice

                        //risolvere la fetch del nodoJS è NECESSARIO per fare funzionare il programma
                        /*
                        if(lolData.phase == 'GameStart'){
                            fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Keycraftsman?api_key=RGAPI-85b552a9-51c6-45e2-b3ca-3d01b429cfb7")
                            .then(result => result.json())
                            .then(data => {
                                console.log("dati del cazzo" + data);
                            })
                        }*/
                    }
                } catch(error){
                    console.log(error);
                }
                
                this.emit(topic, payload);
                break;
            default:
                console.log('Unknown type, if you see this file an issue with at https://discord.gg/hPtrMcx with the following data:', [type, data]);
                break;
        }
    }
}

/** HOW TO USE */
var port;
var pass;

const connector = new LCUConnector();
connector.on('connect', data => {

    console.log('League Client has started', data);

    port = data.port;
    pass = data.pass;

    const ws = new RiotWSProtocol('wss://riot:'+data.password+'@localhost:'+data.port+'/');
    ws.on('open', () => {
        ws.subscribe('OnJsonApiEvent', console.log);
    });
});

connector.on('disconnect', () => {
    console.log('League Client has been closed');
});


connector.start();
console.log('Listening for League Client');

