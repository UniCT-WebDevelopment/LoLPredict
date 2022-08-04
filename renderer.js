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
    ipcRenderer.on("info-player-get", (_,{player_name, player_level, player_rank})=>{
        el.playerName.innerHTML = player_name;
        el.playerLevel.innerHTML = player_level;

        if(player_rank != undefined){
            el.playerRank.innerHTML = player_rank;
        }
    })

})