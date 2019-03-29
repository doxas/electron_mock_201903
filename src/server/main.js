
import path from 'path';
import {app, BrowserWindow} from 'electron';
import connect from 'electron-connect';

// constant variable ==========================================================
const IS_DEVELOPMENT = __MODE__ === 'development';
const INDEX_HTML_PATH = path.resolve(process.cwd(), './app/client/index.html');
const MAIN_WINDOW_PARAMETER = {
    width: 1200,
    height: 800,
    webPreferences: {
        nodeIntegration: true
    }
};

// variables ==================================================================
let mainWindow;
let connectClient;

// app events =================================================================
app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    mainWindow = null;
    process.exit(0);
});

// function ===================================================================
function createMainWindow(){
    mainWindow = new BrowserWindow(MAIN_WINDOW_PARAMETER);
    mainWindow.loadFile(INDEX_HTML_PATH);

    if(IS_DEVELOPMENT === true){
        connectClient = connect.client.create(mainWindow);
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        if(IS_DEVELOPMENT === true){
            connectClient.sendMessage('quit', null);
        }
    });
}

