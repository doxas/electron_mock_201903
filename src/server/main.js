
import path from 'path';
import {app, BrowserWindow} from 'electron';
import connect from 'electron-connect';

// constant variable ==========================================================
const IS_DEVELOPMENT = __MODE__ === 'development';
const INDEX_HTML_PATH = IS_DEVELOPMENT ? './app/client/index.html' : './client/index.html';
const MAIN_WINDOW_PARAMETER = {
    width: 1200,
    height: 800,
    webPreferences: {
        nodeIntegration: true
    }
};

// variables ==================================================================
let mainWindow;    // main window
let connectClient; // connector from electron-connect for client

// app events =================================================================
let isLockable = app.requestSingleInstanceLock();
if(isLockable !== true){app.quit();}

app.on('second-instance', () => {
    if(mainWindow != null){
        if(mainWindow.isMinimized() === true){
            mainWindow.restore();
        }
        mainWindow.focus();
    }
});

app.on('ready', () => {
    createMainWindow();
});

app.on('window-all-closed', () => {
    mainWindow = null;
    app.quit();
});

// function ===================================================================
function createMainWindow(){
    // create new browser window
    mainWindow = new BrowserWindow(MAIN_WINDOW_PARAMETER);
    mainWindow.loadFile(INDEX_HTML_PATH);

    mainWindow.on('closed', () => {
        mainWindow = null;
        if(IS_DEVELOPMENT === true){
            connectClient.sendMessage('quit', null);
        }
    });

    if(IS_DEVELOPMENT === true){
        connectClient = connect.client.create(mainWindow);
        mainWindow.webContents.openDevTools();
    }
}

