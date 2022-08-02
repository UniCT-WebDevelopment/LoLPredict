const { BrowserWindow, app, ipcMain, dialog, Menu } = require("electron");

let mainWindow;


const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        titleBarStyle: "hiddenInset",
    })

    //mainWindow.webContents.openDevTools();
    mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);
