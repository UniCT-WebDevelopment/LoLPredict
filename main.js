process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { BrowserWindow, app, ipcMain, dialog, Menu } = require("electron");
const { webContents } = require("electron");
const path = require("path");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const https = require('node:https');

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
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(app.getAppPath(), "renderer.js")
        }
    })

    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("./public/index.html");
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
                    if(lolData.data.gameName != undefined && player_name == null){
                        player_name = lolData.data.gameName;
                        let player_level = lolData.data.lol.level;
                        let player_ranked_tier = lolData.data.lol.rankedLeagueTier;
                        let player_ranked_level = lolData.data.lol.rankedLeagueDivision;
                        //console.log(player_ranked_level);
                        let icon_id = lolData.data.icon;

                        //console.log("PLAYER NAME: " + player_name);
                        mainWindow.webContents.send("info-player-get", {player_name , player_level, player_ranked_tier,player_ranked_level, icon_id});

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

