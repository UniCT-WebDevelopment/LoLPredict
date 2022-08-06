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
let games_played = 0;
let last_champion_played;
let winrate_againts_champion;
let games_againts_champion = 0;
let win_againts_champion = 0;

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
        .catch(() =>{
            num_error++;
            if((num_error+sum_games) == num_games){ //così da fare il calcolo solo una volta
                winrate_player = (games_winned/sum_games)*100;
                console.log("winrate player " + winrate_player);
                console.log("num_games " + sum_games);
                console.log("games_winned " + games_winned);

                console.log("Fetch error: " + num_error);
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
        console.log("Champion: " + this.champion_name);
        console.log("Winrate with " + this.champion_name + ": " + this.winrate);
        console.log("Games played with" + this.champion_name + ": " + this.games_played);
        console.log("Games winned with" + this.champion_name + ": " + this.games_winned);
    }
}

function analize_matches_champions(data, num_games, champion_againts){
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
            let teamid_againts;
            let teamid_player;
            let num_player;
            //console.log("champion againts " + champion_againts);
            for(let y = 0; y < 10; y++){
                //console.log("ciclo n " + y + " di richiesta fetch numero " + j);
                //console.log(data.info.participants[y]);
                if(data.info.participants[y].championName == champion_againts && data.info.participants[y].puuid != puuid_player){
                    games_againts_champion++;
                    teamid_againts = data.info.participants[y].teamId;
                    num_player = y;
                    console.log("campione trovato", games_againts_champion, teamid_againts, num_player);
                }
                if(data.info.participants[y].puuid == puuid_player){
                    teamid_player = data.info.participants[y].teamId;
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
                    if(champion_againts == undefined)
                        break;
                    else{
                        continue;
                    }
                }
                if(teamid_againts != undefined && teamid_player != undefined){
                    console.log("dentro ultimo if");
                    if(teamid_againts == teamid_player){
                        games_againts_champion--;
                    }
                    else{
                        if(data.info.participants[num_player].win != true){
                            win_againts_champion++;
                        }
                    }
                    break;
                }
            }  
        })
        .then(() => {
            if(sum_games == num_games){ //così da fare il calcolo solo una volta
                winrate_player = (games_winned/num_games)*100;
                for(let i = 0; i < champions_player.length; i++){
                    champions_player[i].calculate_winrate();
                    champions_player[i].get_info();
                }
                console.log("winrate player " + winrate_player);
                console.log("num_games " + num_games);
                console.log("games_winned " + games_winned);

                console.log(win_againts_champion, games_againts_champion);
                winrate_againts_champion = (win_againts_champion/games_againts_champion)*100; 
                console.log("Winrate againts " + champion_againts + " is: " + winrate_againts_champion);
            }
        })
        .catch(() =>{
            num_error++;
            if((num_error+sum_games) == num_games){ //così da fare il calcolo solo una volta
                winrate_player = (games_winned/sum_games)*100;
                for(let i = 0; i < champions_player.length; i++){
                    champions_player[i].calculate_winrate();
                    champions_player[i].get_info();
                }
                console.log("winrate player " + winrate_player);
                console.log("num_games " + sum_games);
                console.log("games_winned " + games_winned);

                winrate_againts_champion = (win_againts_champion/games_againts_champion)*100;
                console.log("Winrate againts " + champion_againts + " is " + winrate_againts_champion);

                console.log("Fetch error: " + num_error);
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

function get_winrate_player_champions(summoner_name, num_games, champion_againts = undefined){
    get_info_summoner_name(summoner_name)
    .then(response => response.json())
    .then(data => {
        get_list_matches(data.puuid, num_games)
        .then(response => response.json())
        .then(data => {
            analize_matches_champions(data, num_games, champion_againts);
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
//get_winrate_player_champions("AlexNext", 40); //da usare per mostare le informazioni sia nel riquadro che per il machine learning
//get_winrate_player_champions("AlexNext", 10, "Olaf"); //winrate contro il cammpione con cui è
//si deve eseguire lo stesso codice anche per avere solo l'informazione per lo specifico campione e si scriverebbe una funzione uguale quindi meglio averne una sola così che viene fatta partire una sola volta per il player avversario
//get_last_champion_played("AlexNext"); //utile per mettere immagine del campione nella grafica

//appunto momentaneo, fare nel main.js l'ultimo punto della riga 400, forse meglio fare prima il file json?


//PER CICCIO, INVECE DI RENDERE QUESTO FILE UN MODULO LO SI FA COMUNQUE ESEGUIRE COSì COM'è MA I DATI VENGONO SALVATI SU UN JSON A CUI IL MAIN ACCEDE
//VANTAGGI: NIENTE CAZZI NEL GESTIRE MODULI, FUNZIONI ETC VISTO CHE è TUTTO IN QUESTO FILE, RENDERE MODULO QUESTO FILE NON è POSSIBILE PERCHè NON è UN NODE FILE, TUTTI I DATI SONO SALVATI E NON SI FANNO ALTRE FETCH
//SVANTAGGI: NESSUNO, PERCHè I CONSOLE LOG VANNO POI GESTITI NEL JSON FIN DA SUBITO
//FORSE UNO SVANTAGGIO è GESTIRE LA LETTURA DAL FILE JSON MA NEMMENO COSì TANTO VISTO CHE C'è IL MODULO ADATTO

//fixare bug dove se chiudi il launcher ti dà il nickname (feature?)

//spostare questo file in main.js facendo diventare modulo? vedere se si può fare tutto sennò si hanno problemi con la fetch //probabilmente non si fa

//completare main.js per prendere informazioni      -quali, quelli per il machine learning? le uniche che ormai servono     
//-per alessandro

//to_api_server.js passa le informazioni al render.js che lui li cambia     -è fattibile?

//creare file json per memorizzare i record per i player che si loggano così da non fare troppe richieste all'api, quindi creare metodi analoghi (più semplici da fare)

//metodo per prendere dati player da dare al tensorflow    
// -per alessandro?

//dati da prendere - verosimilmente winrate players, winrate con quel champion, winrate contro quello contro cui è (per entrambi i player), differenza di rank nella partita sia tra la squadre che tra il giocatore e l'avversario
//come salvare modello di tensorflow


//prendere immagini tramite fetch e gestire la grafica bene   
//-per ciccio

//animazioni di attesa e caricamento






//backend.js rimane singolo se lo si fa comunicare con main.js o render.js sennò si mette nel main.js (metterlo modulo in caso)
//render.js metti robe del dom

//MACHINE LEARNING