const { ipcRenderer } = require("electron");

//comando per avviare app electron
//npm run start

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        playerName : document.getElementById("playerName"),
        playerRank: document.getElementById("playerRank"),
        playerLevel : document.getElementById("playerLevel"),
    }

    //richiamare metodo di backend.js per avere le informazioni quando disponibili
    //prendere informazioni e settare name, level e rank
    playerName.innerHTML = "FRA"

})