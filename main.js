const { BrowserWindow, app, ipcMain, dialog, Menu } = require("electron");
const { webContents } = require("electron");
const path = require("path");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const https = require('node:https');

let mainWindow;


const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        titleBarStyle: "hiddenInset",
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(app.getAppPath(), "renderer.js")
        }
    })

    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("./public/index.html");
}

app.whenReady().then(createWindow);

console.log("SONO IL MAIN");

