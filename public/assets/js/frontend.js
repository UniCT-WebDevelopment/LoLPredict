//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js

//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request



//valutare se fare queste call in backend e poi il backend passa solo i dati che servono
//sistemare le chiamate con i parametri e mettere la key una variabile così che sia facilmente accessibile se cambia
//let key_api;


async function get_data_from_name(){ //aggiungere poi come parametro "name" che viene dato dal backend
    $.ajax({
        url: "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AlexNext?api_key=RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9",
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

        //console.log("roba", user_info_json.puuid);
    })
    .fail(function( xhr, status, errorThrown ) {
        alert( "Sorry, there was a problem!" );
        console.log( "Error: " + errorThrown );
        console.log( "Status: " + status );
    });
}

async function get_matches_from_puuid(){
    $.ajax({
        url: "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/Yv1Ql3_Hf0O_8iiZ_rV5etYEnIAZyAEacPupj2KGQuRTnwedTCOdECWA68ifHe-LABKxJOrlU_V-vg/ids?start=0&count=50&api_key=RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9",
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
        url: "https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_5995849487?api_key=RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9",
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


let user_info_json = await get_data_from_name();
let set_puuid = await get_matches_from_puuid();
let info_match = await get_info_match();

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