//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js

//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request

let user_info_json;


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
    user_info_json = json;
    //console.log("roba", user_info_json.puuid);
    //$( "<h1>" ).text( json.title ).appendTo( "#data_player");
    //$( "<div>").html( json.html ).appendTo( "#data_player");

})
.fail(function( xhr, status, errorThrown ) {
    alert( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
});   

//let set_puuid = user_info_json.puuid;  //fixare cazzi della richiesta ajax con funzioni asincrone

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
    //$( "<h1>" ).text( json.title ).appendTo( "#data_player");
    //$( "<div>").html( json.html ).appendTo( "#data_player");

})
.fail(function( xhr, status, errorThrown ) {
    alert( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
});   

//dal file esempiogame.json vedere dove è il puuid così da prendere l'elemento corrento dai partecipanti, da lì vedere alla fine se win: true o false

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
    //$( "<h1>" ).text( json.title ).appendTo( "#data_player");
    //$( "<div>").html( json.html ).appendTo( "#data_player");

})
.fail(function( xhr, status, errorThrown ) {
    alert( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
});   
