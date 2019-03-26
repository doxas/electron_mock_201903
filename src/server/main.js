
import {app, BrowserWindow} from 'electron';
import connect from 'electron-connect';

let win;
let client;

function createWindow(){
    win = new BrowserWindow({
        width: 1200,
        height: 800
    });

    win.loadFile('./app/client/index.html');
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
        client.sendMessage('quit', null);
    });

    client = connect.client.create(win);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    win = null;
});
