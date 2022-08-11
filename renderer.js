const { ipcRenderer } = require("electron");

//comando per avviare app electron
//npm run start

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        playerInfoContainer: document.getElementById("playerInfoContainer"),
        loadContainer: document.getElementById("caricamento"),
        playerName : document.getElementById("playerName"),
        playerIcon: document.getElementById("playerIcon"),
        playerRank: document.getElementById("playerRank"),
        rankIcon: document.getElementById("rankIcon"),
        playerLevel : document.getElementById("playerLevel"),
        lastChampIcon :document.getElementById("lastChampIcon"),
    }

    const ui = {
        closeBtn : document.getElementById("closeBtn"),
        minBtn : document.getElementById("minBtn"),
        maxBtn : document.getElementById("maxBtn"),
    }

    console.log("sono render");

    //richiamare metodo di backend.js per avere le informazioni quando disponibili
    //prendere informazioni e settare name, level e rank
    ipcRenderer.on("info-player-get", (_,{player_name, player_level,player_ranked_tier, player_ranked_level, icon_id, last_champ, winrate_player, num_games, games_winned})=>{
        el.playerName.innerHTML = player_name;
        el.playerLevel.innerHTML = player_level;
        el.playerIcon.setAttribute("src", "http://ddragon.leagueoflegends.com/cdn/12.14.1/img/profileicon/"+icon_id+".png" );
        el.lastChampIcon.setAttribute("src", "http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/"+last_champ+".png")
        //console.log(player_ranked_level); //vanno messi i nomi dei parametri passati uguali sia qui che in main.js
        if(player_ranked_level != undefined){
            el.playerRank.innerHTML = player_ranked_tier+" "+ player_ranked_level;
            el.rankIcon.setAttribute("src", "../ranked-emblems/Emblem_" + player_ranked_tier + ".png");
        }

        console.log("Eseguo cambio loading screen")
        console.log("RENDERER WINRATE: ", winrate_player, num_games, games_winned);
        
        el.loadContainer.style.display =  "none";
        el.playerInfoContainer.style.display = "grid";
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
})