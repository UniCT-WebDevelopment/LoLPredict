process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { BrowserWindow, app, ipcMain, dialog, Menu } = require("electron");
const { webContents } = require("electron");
const path = require("path");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const https = require('node:https');
const api_server = require('./modules/api_riot');

const jsonFilePath = 'information.json';

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
let api_key = "RGAPI-6334d53a-2c05-4ff9-9c84-4209e24b715e";
let gamestarted = false;
let champion_in_json = false;
let champion_played;

//serve per l'ultimo try dove prende le informazioni del campione e per evitare di fare eseguire codici più volte
let num_games_played = 0;
let games_won = 0;
let winrate_champ;
let games_supported = 20;
let code_champion_info_done = false;
let code_teams_info_done = false;
let code_player_name_done = false;
let sum_games = 0;

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    console.log("current time", currentTime);

    //console.log(currentTime);
    while (currentTime + miliseconds >= new Date().getTime()) {
        //console.log("aspetta");
    }
    console.log("while finito a ", new Date().getTime());
 }


let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        minWidth: 900,
        minHeight: 700,
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

function calculate_team_elo(players_tier, players_rank){
    console.log("player_tiers", players_tier, "players_rank", players_rank);
    console.log("player_tiers[1]", players_tier[1], "players_rank[1]", players_rank[1]);

    let result = 0;
    for(let i = 0; i < 5; i++){
        switch(players_tier[i]){
            case "IRON":
                result += 1;
                break;
            case "BRONZE":
                result += 5;
                break;
            case "SILVER":
                result += 9;
                break;
            case "GOLD":
                result += 13;
                break;
            case "PLATINUM":
                result += 17;
                break;
            case "DIAMOND":
                result += 21;
                break;
            case "MASTER":
                result += 25;
                break;
            case "GRANDMASTER":
                result += 27;
                break;
            case "CHALLENGER":
                result += 29;
                break;
        }
    }
    console.log("result pre rank", result);
    for(let i = 0; i < 5; i++){
        switch(players_rank[i]){
            case "II":
                result += 1;
                break;
            case "III":
                result += 2;
                break;
            case "IV":
                result += 3;
                break;
        }
    }
    console.log("result finale", result);

    result = result / 5;
    return result;
}

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
                    if(code_player_name_done == false && lolData.data.gameName != undefined && player_name == null && lolData.uri == '/lol-chat/v1/me'){
                        player_name = lolData.data.gameName;
                        let player_level = lolData.data.lol.level;
                        let player_ranked_tier = lolData.data.lol.rankedLeagueTier;
                        let player_ranked_level = lolData.data.lol.rankedLeagueDivision;
                        //console.log(player_ranked_level);
                        let icon_id = lolData.data.icon;
                        let last_champ;
                        let winrate_obj;
                        //svuotare file json
                        
                        code_player_name_done = true;
                        fs.writeFileSync(jsonFilePath, "{\"lol\" : \"serverStart\"}" ,'utf8', undefined);
                        
                        //gestire il fatto che si posssono non avere partite
                        api_server.get_data_last_champion_played(player_name)
                        .then((res)=>{
                            last_champ = res;
                            api_server.get_winrate_player_champions(player_name, 20)
                            .then((res)=>{
                                winrate_obj = res;
                                let {winrate_player} = winrate_obj;
                                let {num_games} = winrate_obj;
                                let {games_winned} = winrate_obj;
                                mainWindow.webContents.send("info-player-get", {player_name , player_level, player_ranked_tier,
                                                                                player_ranked_level, icon_id, 
                                                                                last_champ, winrate_player, num_games, games_winned
                                                                                });
                            })
                        })
                        .catch((err)=>console.error("ERRORE PROMISE"+ err));

                        let winrate_player_info;
                        let won_player;
                        let lose_player;
                        let num_games_info;
                        fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + player_name +"?api_key=" + api_key)
                        .then(result => result.json())
                        .then(data => {
                            fetch("https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + data.id + "?api_key=" + api_key)
                            .then(result => result.json())
                            .then(data => {
                                console.log("dati dalla seconda fetch", data);
                                for(let k = 0; k < 3; k++){
                                    if(data[k].queueType == "RANKED_SOLO_5x5"){
                                        //console.log("data[k].wins", data[k].wins);
                                        //console.log("data[k].losses", data[k].losses)
                                        won_player = data[k].wins;
                                        lose_player = data[k].losses;
                                        //console.log("dopo assegnazione valori", won_player, lose_player);
                                        num_games_info = won_player + lose_player;
                                        //console.log("numgames_info", num_games_info);
                                        winrate_player_info = (won_player/(num_games_info))*100;
                                        break;
                                    }
                                }
                            })
                            .then(() =>{
                                //console.log("won_player", won_player, "lose_player", lose_player, "num_games_info", num_games_info);
                                let player_info = { "winrate_infos": { "winrate_player": winrate_player_info, "num_games": num_games_info, "games_winned": won_player } };
        
                                let string_obj = JSON.stringify(player_info);
                                let obj_array = new Array();
        
                                fs.readFile('information.json', 'utf8', (err, datas)=>{
                                    if (err){
                                        console.log("errore lettura", err);
                                    } else {
                                        //console.log("datas letti dal file", datas);
                                        let obj = JSON.parse(datas); //now it an object
                                        Array.from(obj).forEach(e =>  obj_array.push(e));
                                       
                                        obj_array.push(player_info);
        
                                        let json_array = JSON.stringify(obj_array,  undefined, 1); //convert it back to json
                                        fs.writeFile('information.json', json_array, 'utf8', function (err) {
                                            if (err) {
                                                console.log("An error occured while writing JSON Object to File.");
                                                return console.log(err);
                                            }
                                            console.log("FILEPATH: "+ jsonFilePath, "obj" + string_obj);
                                            console.log("JSON file has been saved.");
                                        });
                                    }
                                });
                            })
                        });                        
                    }
                } catch(error){
                    console.log("errore nel prendere le informazioni base del giocatore", error);
                }

                try{
                    if(lolData.data.phase == "GameStart"){
                        gamestarted = true;
                        console.log("gamestart = true");
                    }
                }
                catch(error){

                }

                try{ //fa il calcolo della differenza tra team
                    let summonerId;
                    let enemies_tier = new Array(); //gold, plat etc
                    let enemies_rank = new Array(); //I, II, III, IV
                    let allies_tier = new Array();
                    let allies_rank = new Array();
                    let average_elo_enemies;
                    let average_elo_allies;
                    let difference_between_teams;
                    let winrate_allies_array = new Array();
                    let winrate_enemies_array = new Array();
                    
                    if(champion_in_json == true && code_teams_info_done == false){
                        code_teams_info_done = true;
                        console.log("codice per informazioni del player");

                        fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + player_name +"?api_key=" + api_key)
                        .then(result => result.json())
                        .then(data => {

                            summonerId = data.id;
                            summonerId = "U-qjeDymtvZ167R1dHWAMTGEhDexhEb_3LE1CTAKhizKRcg";
                            fetch("https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/"+ summonerId +"?api_key=" + api_key)
                            .then(result => result.json())
                            .then(data => {
                                let call_num = 0;
                                //console.log("dati seconda fetch",data);

                                let participants_array = new Array();
                                let teamId_array = new Array();
                                let teamId_player;

                                for(let i = 0; i < 10; i++){
                                    participants_array.push(data.participants[i].summonerId);
                                    teamId_array.push(data.participants[i].teamId);

                                    if(participants_array[i] == summonerId){
                                        teamId_player = data.participants[i].teamId;
                                    }

                                    //console.log("data.participants[i].summonerId", data.participants[i].summonerId);
                                    //console.log("data.participants[i].teamId", data.participants[i].teamId);
                                }
                                for(let i = 0; i < 10; i++){
                                    fetch("https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + participants_array[i] + "?api_key=" + api_key)
                                    .then(result => result.json())
                                    .then(data =>{
                                        //console.log("partecipanti", participants_array);
                                        //console.log("data terza fetch", data);
                                        //console.log("data[k].queueType", data[0].queueType);
                                        if(teamId_array[i] == teamId_player){
                                            //console.log("dati dei player alleati", data);
                                            for(let k = 0; k < 3; k++){
                                                if(data[k].queueType == "RANKED_SOLO_5x5"){
                                                    allies_tier.push(data[k].tier);
                                                    allies_rank.push(data[k].rank);
                                                    //console.log("data[k].tier", data[k].tier, "data[k].rank", data[k].rank);
                                                    let wins_ally = parseInt(data[k].wins);
                                                    let lose_ally = parseInt(data[k].losses);
                                                    let winrate_ally_guy = wins_ally/(wins_ally + lose_ally);
                                                    winrate_allies_array.push(winrate_ally_guy);
                                                    break;
                                                }
                                            }
                                        }
                                        else{
                                            console.log("dati dei player nemici", data);
                                            for(let k = 0; k < 3; k++){
                                                if(data[k].queueType == "RANKED_SOLO_5x5"){
                                                    enemies_tier.push(data[k].tier);
                                                    enemies_rank.push(data[k].rank);

                                                    let wins_enemy = parseInt(data[k].wins);
                                                    let lose_enemy = parseInt(data[k].losses);
                                                    let winrate_enemy_guy = wins_enemy/(wins_enemy + lose_enemy);
                                                    winrate_enemies_array.push(winrate_enemy_guy);
                                                    break;
                                                }
                                            }
                                            //console.log("enemies tier e enemis rank", enemies_tier, enemies_rank);   
                                        }
                                    })
                                    .then(() =>{
                                        call_num++;
                                        if(call_num == 10){
                                            //console.log("allies tier e allies rank", allies_tier, allies_rank);
                                            //console.log("enemies tier e enemis rank", enemies_tier, enemies_rank);   
    
                                            average_elo_allies = calculate_team_elo(allies_tier, allies_rank);
                                            average_elo_enemies = calculate_team_elo(enemies_tier, enemies_rank);

                                            let average_win_allies = 0;
                                            let average_win_enemies = 0;
                                            for(let i = 0; i < 5; i++){
                                                average_win_allies += winrate_allies_array[i];
                                                average_win_enemies += winrate_enemies_array[i];
                                            }
                                            //console.log("winrate_allies_array", winrate_allies_array);
                                            //console.log("winrate_enemies_array", winrate_enemies_array);

                                            average_win_allies = average_win_allies/5;
                                            average_win_enemies = average_win_enemies/5;

                                            //console.log("valori average_win_allies", average_win_allies, "average_win_enemies", average_win_enemies, "average_elo_allies", average_elo_allies, "average_elo_enemies", average_elo_enemies);

                                            difference_between_teams = (((average_win_allies - average_win_enemies)*10) +((average_elo_allies - average_elo_enemies)*90))/100; //quindi valori negativi non sono buoni


                                            //console.log("average_elo_allies average_elo_enemies difference_between_teams riga 420", average_elo_allies, average_elo_enemies, difference_between_teams);

                                            let obj_difference_between_teams = {"difference_between_teams": difference_between_teams};

                                            let string_obj = JSON.stringify(obj_difference_between_teams);
                                            let obj_array = new Array();
                                            

                                            fs.readFile('information.json', 'utf8', (err, datas)=>{
                                                if (err){
                                                    console.log("errore lettura", err);
                                                } else {
                                                    //console.log("datas letti dal file", datas);
                                                    let obj = JSON.parse(datas); //now it an object
                                                    Array.from(obj).forEach(e =>  obj_array.push(e));
                                                   
                                                    obj_array.push(obj_difference_between_teams);

                                                    let json_array = JSON.stringify(obj_array,  undefined, 1); //convert it back to json
                                                    fs.writeFile('information.json', json_array, 'utf8', function (err) {
                                                        if (err) {
                                                            console.log("An error occured while writing JSON Object to File.");
                                                            return console.log(err);
                                                        }
                                                        console.log("FILEPATH: "+ jsonFilePath, "obj" + string_obj);
                                                        console.log("JSON file has been saved.");
                                                    });
                                                }
                                            });
                                        }
                                    })
                                    .catch((error) =>{
                                        console.log("errore nella terza fetch", error);
                                    })
                                }
                            })
                            .catch((error) =>{
                                console.log("errore nella seconda fetch", error);
                            })
                        })
                        .catch(() =>{
                            console.log("errore nella prima fetch", error);
                        })
                    }
                }
                catch(error){
                    console.log("ha fatto errore lo studio del game", error);
                }

                
                try{ //serve per prendere i dati sul campione che sta giocando
                    if(gamestarted == true && code_champion_info_done == false && lolData.data.gameName == player_name && lolData.data.lol.skinname != undefined){
                        champion_played = lolData.data.lol.skinname; 
                        code_champion_info_done = true;
                        //console.log("codice per prendere i dati sul campione");

                        fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + lolData.data.gameName +"?api_key=" + api_key)
                        .then(result => result.json())
                        .then(data =>{
                            let puuid_player = data.puuid;
                            let url_games_req = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + data.puuid + "/ids?start=0&count=" + games_supported + "&api_key=";
                            fetch(url_games_req + api_key)
                            .then(result => result.json())
                            .then(data => {
                                let last_games_played = JSON.stringify(JSON.stringify(data));
                                let first_half_url = "https://europe.api.riotgames.com/lol/match/v5/matches/";
                                let second_half_url = "?api_key=" + api_key;

                                let name_game = last_games_played.split(',');
                                
                                for(let i = 0; i < games_supported; i++){
                                    if(i == 0){
                                        name_game[i] = name_game[i].substr(4, 15);
                                    }
                                    else if(i == games_supported-1){
                                        name_game[i] = name_game[i].substr(2, 15);
                                    }
                                    else{
                                        name_game[i] = name_game[i].substr(2, 15);
                                    }
                                }

                                let complete_url;
                                for(let z = 0; z < games_supported; z++){ 
                                    complete_url = first_half_url + name_game[z] + second_half_url;
                                    fetch(complete_url)
                                    .then(response => response.json())
                                    .then(data => {
                                        sum_games++;
                                        for(let y = 0; y < 10; y++){
                                            if(data.info.participants[y].puuid == puuid_player){ 
                                                if(data.info.participants[y].championName == champion_played){
                                                    num_games_played++;
                                                    if(data.info.participants[y].win == true){
                                                        games_won++;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    })
                                    .then(() => {
                                        if(sum_games == games_supported){
                                            winrate_champ = games_won/num_games_played;

                                            let obj_winrate;
                                            obj_winrate = {"champion_stats":{ "champion": champion_played, "winrate": winrate_champ, "games_played":num_games_played, "games_winned": games_won}}
                            
                                            let string_obj = JSON.stringify(obj_winrate);
                                            let obj_array = new Array();

                                            fs.readFile('information.json', 'utf8', (err, data)=>{
                                                if (err){
                                                    console.log(err);
                                                } else {
                                                    let obj = JSON.parse(data); //now it an object
                                                    Array.from(obj).forEach(e => obj_array.push(e));
                            
                                                    obj_array.push(obj_winrate);
                            
                                                    let json_array = JSON.stringify(obj_array,  undefined, 1); //convert it back to json
                                                    fs.writeFile('information.json', json_array, 'utf8', function (err) {
                                                        if (err) {
                                                            console.log("An error occured while writing JSON Object to File.");
                                                            return console.log(err);
                                                        }
                                                        console.log("FILEPATH: "+ jsonFilePath, "obj" + string_obj);
                                                        console.log("scrittura in catch");
                                                    });
                                                }
                                            });
                                            champion_in_json = true;
                                        }
                                    })
                                    .catch((error) =>{
                                        num_error++;
                                        if((num_error+sum_games) == games_supported){ 
                                            winrate_champ = games_won/num_games_played;

                                            let obj_winrate;
                                            obj_winrate = {"champion_stats":{ "champion": champion_played, "winrate": winrate_champ, "games_played":num_games_played, "games_winned": games_won}}
                            
                                            let string_obj = JSON.stringify(obj_winrate);
                                            let obj_array = new Array();

                                            fs.readFile('information.json', 'utf8', (err, data)=>{
                                                if (err){
                                                    console.log(err);
                                                } else {
                                                    let obj = JSON.parse(data); //now it an object
                                                    Array.from(obj).forEach(e => obj_array.push(e));
                            
                                                    obj_array.push(obj_winrate);
                                                        
                                                    let json_array = JSON.stringify(obj_array,  undefined, 1); //convert it back to json
                                                    fs.writeFile('information.json', json_array, 'utf8', function (err) {
                                                        if (err) {
                                                            console.log("An error occured while writing JSON Object to File.");
                                                            return console.log(err);
                                                        }
                                                        console.log("FILEPATH: "+ jsonFilePath, "obj" + string_obj);
                                                        console.log("scrittura in catch");
                                                    });
                                                }
                                            });
                                            champion_in_json = true;
                                        }
                                    })
                                    if((z % 15) == 0){
                                        sleep(2000); //2000 va bene e non dà troppi rallentamenti se non si tocca la funzione sleep
                                    }                            
                                }
                            })
                        })

                        
                    }                    
                }
                catch(error){
                    console.log("errore nel prendere le informazioni del campione usato", error);
                    console.log("lolData.data", lolData.data);
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

//aggiungere in caso la possibilità di refreshare i dati nel json mettendo i flag delle variabili a false