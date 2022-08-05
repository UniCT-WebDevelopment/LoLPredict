//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js
//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request


//valutare se fare queste call in backend e poi il backend passa solo i dati che servono
let key_api = "RGAPI-85b552a9-51c6-45e2-b3ca-3d01b429cfb7";

//funzione definiva?
let summoner_id_player;
let puuid_player;
let winrate_player;
let games_winned = 0;
let games_played;
let last_champion_played;

function sleep(miliseconds) {
    var currentTime = new Date().getTime();

    //console.log(currentTime);
    while (currentTime + miliseconds >= new Date().getTime()) {
        //console.log("aspetta");
    }
 }

function get_info_summoner_name(summoner_name){
    let url_req = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summoner_name + "?api_key=";
    return fetch(url_req + key_api, {
    method: "GET",
    headers:{
        //'Access-Control-Allow-Origin': "Accept",
        'Access-Control-Request-Method': "GET",
        //'Access-Control-Allow-Headers': "Accept"
    }
    })
}

function get_list_matches(puuid, num_games){
    let url_games_req = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?start=0&count=" + num_games + "&api_key=";
    puuid_player = puuid;
    return fetch(url_games_req + key_api, {
        method: "GET",
        headers:{
            'Access-Control-Request-Method': "GET",
        }
    })
}

function analize_matches(data, num_games){
    let last_games_played = JSON.stringify(JSON.stringify(data));
    let first_half_url = "https://europe.api.riotgames.com/lol/match/v5/matches/";
    let second_half_url = "?api_key=" + key_api;

    let name_game = last_games_played.split(',');
    
    for(let i = 0; i < num_games; i++){
        //console.log(name_game[i]);
        if(i == 0){
            name_game[i] = name_game[i].substr(4, 15);
        }
        else if(i == num_games-1){
            name_game[i] = name_game[i].substr(2, 15);
        }
        else{
            name_game[i] = name_game[i].substr(2, 15);
        }
        //console.log(name_game[i]);
    }

    let sum_games = 0;

    for(let j = 0; j < num_games; j++){

        let complete_url = first_half_url + name_game[j] + second_half_url;
        fetch(complete_url, { //gestire errore 429
            method: "GET",
            headers:{
                'Access-Control-Request-Method': "GET",
            }
        })
        .then(response => response.json())
        .then(data => {
            //console.log("eseguendo fetch n" + j);
            sum_games++;
            for(let y = 0; y < 10; y++){
                //console.log("ciclo n " + y + " di richiesta fetch numero " + j);
                //console.log(data.info.participants[y]);
                if(data.info.participants[y].puuid == puuid_player){ 
                    if(data.info.participants[y].win == true){
                        games_winned++;
                        //console.log(games_winned);
                    }
                    break;
                }
            }  
        })
        .then(() => {
            if(sum_games == num_games){
                winrate_player = (games_winned/num_games)*100;
                console.log("winrate player " + winrate_player);
                console.log("num_games " + num_games);
                console.log("games_winned " + games_winned);
            }
        })
        if((j % 15) == 0){
            sleep(2000); //2000 va bene e non dà troppi rallentamenti se non si tocca la funzione sleep
        }

        //console.log("finito ciclo " + j);
    }
}

let champions_player = new Array();

class champion{
    winrate;
    games_played;
    games_winned;
    champion_name;
    constructor(champion_name){
        this.champion_name = champion_name;
        this.winrate = 0;
        this.games_played = 0;
        this.games_winned = 0;
    }
    increase_games_played(){
        this.games_played++;
    }
    increase_games_winned(){
        this.games_winned++;
    }
    calculate_winrate(){
        this.winrate = (this.games_winned/this.games_played)*100;
    }
    check_champion_presence(name){
        if(this.champion_name == name)
            return true;
        else
            return false;
    }
    get_info(){
        console.log("champion " + this.champion_name);
        console.log("winrate " + this.winrate);
        console.log("games played " + this.games_played);
        console.log("games winned " + this.games_winned);
    }
}

function analize_matches_champions(data, num_games){
    let last_games_played = JSON.stringify(JSON.stringify(data));
    let first_half_url = "https://europe.api.riotgames.com/lol/match/v5/matches/";
    let second_half_url = "?api_key=" + key_api;

    let name_game = last_games_played.split(',');
    
    for(let i = 0; i < num_games; i++){
        //console.log(name_game[i]);
        if(i == 0){
            name_game[i] = name_game[i].substr(4, 15);
        }
        else if(i == num_games-1){
            name_game[i] = name_game[i].substr(2, 15);
        }
        else{
            name_game[i] = name_game[i].substr(2, 15);
        }
        //console.log(name_game[i]);
    }

    let sum_games = 0;
    let num_error = 0;

    for(let j = 0; j < num_games; j++){
        let complete_url = first_half_url + name_game[j] + second_half_url;
        fetch(complete_url, {
            method: "GET",
            headers:{
                'Access-Control-Request-Method': "GET",
            }
        })
        .then(response => response.json())
        .then(data => {
            //console.log("eseguendo fetch n" + j);
            sum_games++;
            for(let y = 0; y < 10; y++){
                //console.log("ciclo n " + y + " di richiesta fetch numero " + j);
                //console.log(data.info.participants[y]);
                if(data.info.participants[y].puuid == puuid_player){ 
                    if(data.info.participants[y].win == true){
                        games_winned++;
                    }
                    let presence = false;
                    //console.log(data.info.participants[y].championName);
                    for(let z = 0; z < champions_player.length; z++){
                        if(champions_player[z].check_champion_presence(data.info.participants[y].championName) == true){
                            presence = true;
                            champions_player[z].increase_games_played();
                            if(data.info.participants[y].win == true){
                                champions_player[z].increase_games_winned();
                            }
                            break;
                        }
                    }
                    if(presence == false){
                        let add_champ = new champion(data.info.participants[y].championName);
                        if(data.info.participants[y].win == true){
                            add_champ.increase_games_winned();
                        }
                        add_champ.increase_games_played();
                        champions_player.push(add_champ);
                    }
                    break;
                }
            }  
        })
        .then(() => {
            if(sum_games == num_games){
                winrate_player = (games_winned/num_games)*100;
                for(let i = 0; i < champions_player.length; i++){
                    champions_player[i].calculate_winrate();
                    champions_player[i].get_info();
                }
                console.log("winrate player " + winrate_player);
                console.log("num_games " + num_games);
                console.log("games_winned " + games_winned);
            }
        })
        .catch(() =>{
            num_error++;
            if((num_error+sum_games) == num_games){
                winrate_player = (games_winned/sum_games)*100;
                for(let i = 0; i < champions_player.length; i++){
                    champions_player[i].calculate_winrate();
                    champions_player[i].get_info();
                }
                console.log("winrate player " + winrate_player);
                console.log("num_games " + sum_games);
                console.log("games_winned " + games_winned);
            }
        })
        if((j % 15) == 0){
            sleep(2000); 
        }
    }
}

function get_champion_match(puuid){
    let url_games_req = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?start=0&count=1&api_key=";
    puuid_player = puuid;
    fetch(url_games_req + key_api, {
        method: "GET",
        headers:{
            'Access-Control-Request-Method': "GET",
        }
    })
    .then(response => response.json())
    .then(data => {
        let last_game_played = JSON.stringify(JSON.stringify(data));
        let first_half_url = "https://europe.api.riotgames.com/lol/match/v5/matches/";
        let second_half_url = "?api_key=" + key_api;
        //console.log(last_game_played);
        let name_game = last_game_played.substr(4, 15);
        //console.log(name_game);

        let complete_url = first_half_url + name_game + second_half_url;
        fetch(complete_url, {
            method: "GET",
            headers:{
                'Access-Control-Request-Method': "GET",
            }
        })
        .then(response => response.json())
        .then(data => {
            for(let i = 0; i < 10; i++){
                if(data.info.participants[i].puuid == puuid_player){
                    last_champion_played = data.info.participants[i].championName;
                    break;
                }
            }
        })
        .then(() =>{
            console.log("last champion played: " + last_champion_played);
        })
    })
}

function get_winrate_player(summoner_name, num_games){
    get_info_summoner_name(summoner_name)
    .then(response => response.json())
    .then(data => {
        get_list_matches(data.puuid, num_games)
        .then(response => response.json())
        .then(data => {
            analize_matches(data, num_games);
        })
    })
}

function get_winrate_player_champions(summoner_name, num_games){
    get_info_summoner_name(summoner_name)
    .then(response => response.json())
    .then(data => {
        get_list_matches(data.puuid, num_games)
        .then(response => response.json())
        .then(data => {
            analize_matches_champions(data, num_games);
        })
    })
}

function get_last_champion_played(summoner_name){
    get_info_summoner_name(summoner_name)
    .then(response => response.json())
    .then(data => {
        get_champion_match(data.puuid);
    })
}

//get_winrate_player("AlexNext", 40);
//get_winrate_player_champions("AlexNext", 40); //da usare per mostare le informazioni nel riquadro
//get_last_champion_played("AlexNext"); //utile per mettere immagine del campione nella grafica




//fixare bug dove se chiudi il launcher ti dà il nickname (feature?)

//spostare questo file in main.js facendo diventare modulo? vedere se si può fare tutto sennò si hanno problemi con la fetch

//completare main.js per prendere informazioni      -quali, quelli per il machine learning? le uniche che ormai servono     
//-per alessandro

//to_api_server.js passa le informazioni al render.js che lui li cambia     -è fattibile?

//metodo per prendere dati player da dare al tensorflow    
// -per alessandro?

//dati da prendere - verosimilmente winrate player, winrate con quel champion, winrate contro quello contro cui è, differenza di rank nella partita sia tra la squadre che tra il giocatore e l'avversario
//come salvare modello di tensorflow


//prendere immagini tramite fetch e gestire la grafica bene   
//-per ciccio

//animazioni di attesa e caricamento






//backend.js rimane singolo se lo si fa comunicare con main.js o render.js sennò si mette nel main.js (metterlo modulo in caso)
//render.js metti robe del dom

//MACHINE LEARNING