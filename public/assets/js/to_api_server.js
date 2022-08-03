//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js
//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request


//valutare se fare queste call in backend e poi il backend passa solo i dati che servono
let key_api = "RGAPI-84c05a14-1945-41db-a906-0460b66f708e";

//funzione definiva?
let summoner_id_player;
let puuid_player;
let winrate_player;
let games_winned = 0;
let games_played;

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
            console.log("eseguendo fetch n" + j);
            for(let y = 0; y < 10; y++){
                console.log("ciclo n " + y + " di richiesta fetch numero " + j);
                //console.log(data.info.participants[y]);
                if(data.info.participants[y].puuid == puuid_player){ 
                    if(data.info.participants[y].win == true){
                        games_winned++;
                        console.log(games_winned);
                    }
                    break;
                }
            }  
        })
        .then(() => {
            winrate_player = (games_winned/num_games)*100;
            console.log("winrate player " + winrate_player);
            console.log("num_games " + num_games);
            console.log("games_winned " + games_winned);
        })
        if((j % 15) == 0){
            sleep(2000); //2000 va bene e non dà troppi rallentamenti se non si tocca la funzione sleep
        }

        //console.log("finito ciclo " + j);
    }
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

get_winrate_player("AlexNext", 50); 

/* //prova per vedere se funzionava 
function d(){
    return fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AlexNext?api_key=" + key_api);
}

d().then(response => response.json())
.then(data => {
    console.log(data.puuid);
});
*/

//to_api_server.js passa le informazioni al render.js che lui li cambia
//backend.js rimane singolo se lo si fa comunicare con main.js o render.js sennò si mette nel main.js (metterlo modulo in caso)
//render.js metti robe del dom

//fare display di Nome, rank e livello nell'html
//prendere informazioni su server api per ottenere informazioni riot
//MACHINE LEARNING