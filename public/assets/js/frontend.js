//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js
//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request



//valutare se fare queste call in backend e poi il backend passa solo i dati che servono
let key_api = "RGAPI-83d1f1dc-4f5d-4c4f-b41a-0867b828bef6";

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


//non funziona se metti await, a caso ma dà le cose in ordine con i console.log dentro ajax
//non si applica la stessa cosa, come dovrebbe essere, con i console log dei valori di ritorno

get_data_from_name("AlexNext").then((json) => {
    get_matches_from_puuid(json.puuid);
})

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