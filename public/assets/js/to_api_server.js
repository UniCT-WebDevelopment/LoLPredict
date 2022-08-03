//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js
//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request



//valutare se fare queste call in backend e poi il backend passa solo i dati che servono
let key_api = "RGAPI-84c05a14-1945-41db-a906-0460b66f708e";

/*
async function get_data_from_name(){
    fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AlexNext?api_key=" + key_api, {
    method: "GET",
    headers:{
        //'Access-Control-Allow-Origin': "Accept",
        'Access-Control-Request-Method': "GET",
        //'Access-Control-Allow-Headers': "Accept"
    }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        return data;
    })
    .catch((error) => {
        console.log("error: ", error);
    });
}
*/


async function get_data_from_name(summoner_name){ //aggiungere poi come parametro "name" che viene dato dal backend
    let url_req = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summoner_name + "?api_key=";
    $.ajax({
        url: url_req + key_api,
        type: "GET",
        datatype: "json",
        /*headers: {
            //'Access-Control-Allow-Headers': "*",
            
            //'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }*/
    })
    .done(function(json){
        console.log(json);
        return json;
        //console.log("roba", user_info_json.puuid);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
    });
}

async function get_matches_from_puuid(puuid_player){
    let url_req = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid_player + "/ids?start=0&count=50&api_key=";
    //https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/Yv1Ql3_Hf0O_8iiZ_rV5etYEnIAZyAEacPupj2KGQuRTnwedTCOdECWA68ifHe-LABKxJOrlU_V-vg/ids?start=0&count=50&api_key="
    $.ajax({
        url: url_req + key_api,
        type: "GET",
        datatype: "json",
        //'X-Riot-Token': "RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9",
        /*headers: {
            //'Access-Control-Allow-Headers': "*",
            
            //'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }*/
    })
    .done(function(json){
        console.log(json);
        return json;
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
    }); 
}


//TODO dal file esempiogame.json vedere dove è il puuid così da prendere l'elemento corrento dai partecipanti, da lì vedere alla fine se win: true o false

async function get_info_match(){
    $.ajax({
        url: "https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_5995849487?api_key=" + key_api,
        type: "GET",
        datatype: "json",
        //'X-Riot-Token': "RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9",
        /*headers: {
            //'Access-Control-Allow-Headers': "*",
            
            //'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }*/
    })
    .done(function(json){
        console.log(json);
        return json
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
    });   
}

//funzione definiva?
let summoner_id_player;
let puuid_player;
let winrate_player;
let games_winned = 0;
let games_played;

/*
function rejectDelay(reason) {
    return (function(resolve, reject) {
        setTimeout(reject.bind(null, reason), t); 
    });
}
*/

function sleep(miliseconds) {
    var currentTime = new Date().getTime();

    //console.log(currentTime);
    while (currentTime + miliseconds >= new Date().getTime()) {
        //console.log("aspetta");
    }
 }

function get_winrate(num_games, summoner_name){
    games_played = num_games;
    let url_req = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summoner_name + "?api_key=";
    fetch(url_req + key_api, {
    method: "GET",
    headers:{
        //'Access-Control-Allow-Origin': "Accept",
        'Access-Control-Request-Method': "GET",
        //'Access-Control-Allow-Headers': "Accept"
    }
    })
    .then(response => response.json())
    .then(data => {
        let url_games_req = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + data.puuid + "/ids?start=0&count=" + num_games + "&api_key=";
        puuid_player = data.puuid;
        fetch(url_games_req + key_api, {
            method: "GET",
            headers:{
                'Access-Control-Request-Method': "GET",
            }
        })
        .then(response => response.json())
        .then(data => {
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

            //setInterval(compute_winrate(num_games, first_half_url, second_half_url, name_game), 1000);

            for(let j = 0; j < num_games; j++){
                //console.log(name_game);
        
                //https://stackoverflow.com/questions/46240418/http-request-error-code-429-cannot-be-caught
                //https://www.useanvil.com/blog/engineering/throttling-and-consuming-apis-with-429-rate-limits/
        
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
                //await sleep(50);

                //console.log("finito ciclo " + j);
            }
        })
    })
    .catch((error) => {
        console.log("error prima fetch: ", error);
    });
}

get_winrate(50, "Alexnext");
//mettere return nelle fetch e concatenare le varie promise così da riusare i metodi




//to_api_server.js passa le informazioni al render.js che lui li cambia
//backend.js rimane singolo se lo si fa comunicare con main.js o render.js sennò si mette nel main.js (metterlo modulo in caso)
//render.js metti robe del dom

//fare display di Nome, rank e livello nell'html
//prendere informazioni su server api per ottenere informazioni riot
//MACHINE LEARNING




//non funziona se metti await, a caso ma dà le cose in ordine con i console.log dentro ajax
//non si applica la stessa cosa, come dovrebbe essere, con i console log dei valori di ritorno

/*
let user_info_json = get_data_from_name();
let set_puuid =  get_matches_from_puuid();
let info_match =  get_info_match();

console.log(user_info_json);
console.log(set_puuid);
console.log(info_match);


/*
(async () => {
    user_info_json = await get_data_from_name();
    console.log(user_info_json);
})();

(async () => {
    set_puuid = await get_matches_from_puuid();
    console.log(set_puuid);
})();

(async () => {
    info_match = await get_info_match();
    console.log(info_match);
})();

*/