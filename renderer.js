const { ipcRenderer } = require("electron");

//comando per avviare app electron
//npm run start

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        playerName : document.getElementById("playerName"),
        playerRank: document.getElementById("playerRank"),
        playerLevel : document.getElementById("playerLevel"),
    }

    console.log("sono render");

    //richiamare metodo di backend.js per avere le informazioni quando disponibili
    //prendere informazioni e settare name, level e rank
    ipcRenderer.on("info-player-get", (_,{player_name, player_level,player_ranked_tier, player_ranked_level, icon_id})=>{
        el.playerName.innerHTML = player_name;
        el.playerLevel.innerHTML = player_level;
        el.playerName.style.backgroundImage = "url('http://ddragon.leagueoflegends.com/cdn/12.14.1/img/profileicon/"+icon_id+".png')";

        //console.log(player_ranked_level); //vanno messi i nomi dei parametri passati uguali sia qui che in main.js
        if(player_ranked_level != undefined){
            el.playerRank.innerHTML = player_ranked_tier + player_ranked_level;
            el.playerRank.style.backgroundImage = "url('../ranked-emblems/Emblem_" + player_ranked_tier + ".png')";
        }
    })

})