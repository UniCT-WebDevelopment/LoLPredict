const { ipcRenderer } = require("electron");
//comando per avviare app electron
//npm run start
const _tf = require('./tf_predict.js')
const ciao = require('./index.js')
let isReady = false;
window.addEventListener("DOMContentLoaded", () => {   
    //document.getElementById('load_txt').innerHTML = ciao.fun();
    const el = {
        playerInfoContainer: document.getElementById("playerInfoContainer"),
        loadContainer: document.getElementById("caricamento"),
        playerName : document.getElementById("playerName"),
        playerIcon: document.getElementById("playerIcon"),
        playerRank: document.getElementById("playerRank"),
        rankIcon: document.getElementById("rankIcon"),
        playerLevel : document.getElementById("playerLevel"),
        lastChampIcon :document.getElementById("lastChampIcon"),
        playerStat: document.getElementsByClassName("player_stat")[0],
        winrateCol: document.getElementById("winCol"),
        playerWinrate : document.getElementById("winrate_tot"),
        prediction: document.getElementById("prediction"), //da migliorare, roba di ciccio
        resultText: document.getElementById("result-text"),
    }

    const ui = {
        closeBtn : document.getElementById("closeBtn"),
        minBtn : document.getElementById("minBtn"),
        maxBtn : document.getElementById("maxBtn"),
    }

    console.log("sono render");
    SaveModel()


    //richiamare metodo di backend.js per avere le informazioni quando disponibili
    //prendere informazioni e settare name, level e rank
    ipcRenderer.on("info-player-get", (_,{player_name, player_level,player_ranked_tier, player_ranked_level, icon_id, last_champ, winrate_player, num_games, winrate_champions_array})=>{
        el.playerName.innerHTML = player_name;
        el.playerLevel.innerHTML = player_level;
        el.playerIcon.setAttribute("src", "http://ddragon.leagueoflegends.com/cdn/12.14.1/img/profileicon/"+icon_id+".png" );
        el.lastChampIcon.setAttribute("src", "http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/"+last_champ+".png")
        //console.log(player_ranked_level); //vanno messi i nomi dei parametri passati uguali sia qui che in main.js
        if(player_ranked_level != undefined){
            el.playerRank.innerHTML = player_ranked_tier+" "+ player_ranked_level;
            el.rankIcon.setAttribute("src", "../ranked-emblems/Emblem_" + player_ranked_tier + ".png");
        }

        console.log("Eseguo cambio loading screen");
        console.log("RENDERER WINRATE: ", winrate_player, num_games, winrate_champions_array);
        el.playerWinrate.innerHTML = winrate_player.toFixed(2) + "%";

        for(let i = 0; i < winrate_champions_array.length; i++){
            let champ_name = winrate_champions_array[i].champion_name;

            if(i == 0){
                el.playerStat.getElementsByClassName("champ_vs")[0].getElementsByClassName("champ_vs_name")[0].innerHTML = champ_name;

                el.playerStat.getElementsByClassName("champ_vs")[0].getElementsByClassName("champ_vs_img")[0].setAttribute("src", "http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/"+ champ_name+".png");

                el.playerStat.getElementsByClassName("winrate_vs_champ")[0].innerHTML =  winrate_champions_array[i].winrate.toFixed(2) + "%";

                el.playerStat.getElementsByClassName("games_played")[0].innerHTML =  winrate_champions_array[i].games_played;

                el.playerStat.getElementsByClassName("games_winned")[0].innerHTML =  winrate_champions_array[i].games_winned;

            }else{
               let new_player_stat =  el.playerStat.cloneNode(true);
               
               el.playerStat.getElementsByClassName("champ_vs")[0].getElementsByClassName("champ_vs_name")[0].innerHTML = champ_name;

               el.playerStat.getElementsByClassName("champ_vs")[0].getElementsByClassName("champ_vs_img")[0].setAttribute("src", "http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/"+ champ_name+".png");

                console.log("CHAMP NAME " + winrate_champions_array[i].champion_name);

                el.playerStat.getElementsByClassName("winrate_vs_champ")[0].innerHTML =  winrate_champions_array[i].winrate.toFixed(2) + "%";

                el.playerStat.getElementsByClassName("games_played")[0].innerHTML =  winrate_champions_array[i].games_played;

                el.playerStat.getElementsByClassName("games_winned")[0].innerHTML =  winrate_champions_array[i].games_winned;

                el.winrateCol.appendChild(new_player_stat);
            }
        }

        el.loadContainer.style.display =  "none";
        el.playerInfoContainer.style.display = "grid";
    })

    ipcRenderer.on("value-predicted", (_, {value_predicted}) =>{ //predict
        let color;
        let value = value_predicted.toFixed(2);

        if(value < 30){
            color = "brown";
        }else if(value >= 30 && value < 40){
            color = "rgb(255, 194, 80)";
        }else if(value >= 40 & value < 70){
            color ="rgb(155, 145, 15)";
        }else{
            color = "rgb(0, 146, 98)";
        }

        el.prediction.style.color = color;
        el.resultText.innerHTML = "Pronostico di LoL Predict per la partita in corso:";
        el.prediction.innerHTML = value + "%";
    })

    ipcRenderer.on('predict', (_)=>{
        handlePrediction();
    })

    ipcRenderer.on("end-game", (_)=>{
        el.resultText.innerHTML = "Nessun pronostico da visualizzare";
        el.prediction.innerHTML = "";
        //handleTraining();
    })

    ipcRenderer.on("champ-select", (_)=>{
        el.resultText.innerHTML = "Selezione campioni in corso... Il pronostico verrà calcolato alla fine";
        el.prediction.innerHTML = "";
    })

    ui.closeBtn.addEventListener('click', ()=>{
        ipcRenderer.send('closeApp');
    })

    ui.minBtn.addEventListener('click', ()=>{
        ipcRenderer.send('minimizeApp');
    })

    ui.maxBtn.addEventListener('click', ()=>{
        ipcRenderer.send('maximizeApp');
    })

    async function handlePrediction(){
        console.log("Prima di predict");
        let value_predicted;
        try{
            value_predicted = await _tf.predict();
            console.log("Dentro try dop predict")
        }catch(err){
            console.log("Dentro catch dop predict", err)
        }
        console.log("Dopo try/catch");
        
        //el.playerName.innerHTML = "Dopo di predict"
        let color;
        let value = value_predicted.toFixed(2);

        if(value < 30){
            color = "brown";
        }else if(value >= 30 && value < 40){
            color = "rgb(255, 194, 80)";
        }else if(value >= 40 & value < 70){
            color ="rgb(155, 145, 15)";
        }else{
            color = "rgb(0, 146, 98)";
        }

        el.prediction.style.color = color;
        el.resultText.innerHTML = "Pronostico di LoL Predict per la partita in corso:";
        el.prediction.innerHTML = value + "%";
        //prenderne il valore
        //stamparlo a schermo
    }

    async function SaveModel(){
        _tf.run();
    }

    async function handleTraining(){
        _tf.train();
    }
})