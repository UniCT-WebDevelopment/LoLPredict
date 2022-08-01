//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js

//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request

$.ajax({
    url: "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AlexNext",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
        XRiotToken: "RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9"
    },
    origin: "*",
    type: "POST",
    datatype: "json",
})
.done(function(json){
    $( "<h1>" ).text( json.title ).appendTo( "#data_player");
    $( "<div>").html( json.html ).appendTo( "#data_player");
})
.fail(function( xhr, status, errorThrown ) {
    alert( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
});   