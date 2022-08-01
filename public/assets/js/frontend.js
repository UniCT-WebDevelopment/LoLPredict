//per ottenere informazioni del player tocca capire prima come prendere quei dati stampati dal backend.js

//TODO fare il #data_player dove prende dati dati per ora d default

//risultati machine learning appena si ha machine learning

//https://stackoverflow.com/questions/5618827/ajaxy-add-parameters-to-request


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
    console.log("ci sei riuscito");
    console.log(json);
    $( "<h1>" ).text( json.title ).appendTo( "#data_player");
    $( "<div>").html( json.html ).appendTo( "#data_player");
})
.fail(function( xhr, status, errorThrown ) {
    alert( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
});   



//let link = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AlexNext";


/*

async function getSummonerRank() {
    let link = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AlexNext"+"?api_key=RGAPI-86459c0f-49f2-448e-b5c7-e11cdb91c1a9";
    
    const response = await fetch(link, {
        method: "GET",
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin':'*',
            "Access-Control-Allow-Methods":"GET, POST, DELETE, PUT",
            "Access-Control-Allow-Headers":"X-Requested-With, Content-Type, Authorization, Origin, Accept"
        }
    }); 
    
    let data = await response.json();
    return data;
}

console.log(getSummonerRank());

*/