'use strict';
const electron = require("electron");
const {app, BrowserWindow} = require('electron');
require('./src/readFile');

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
  //darwin:macOS
  //win32:Windows
  //linux:Linux
  if (process.platform != 'darwin') {
    // macOS以外はプロセスを終了させる(macOSの場合はdockに残すためプロセス終了させない)
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function() {
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL('file://' + __dirname + '/src/index.html');
  //mainWindow.webContents.openDevTools();
  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', () => { mainWindow = null });
});
