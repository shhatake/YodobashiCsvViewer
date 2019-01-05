'use strict';
const electron = require("electron");
const {app, BrowserWindow} = require('electron')
const {ipcMain, dialog} = require('electron')

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
  mainWindow.webContents.openDevTools();
  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

// ファイル選択時
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, (files) => {
    if (files) {
      const fs = require('fs');
      const iconv = require('iconv-lite');
      const path = require('path');

      fs.readFile(files[0], (err, data) => {
        if (err) throw err;
        let buf    = new Buffer(data, 'binary'); // 読み込んだデータをバッファに格納
        let readData = iconv.decode(buf, "Shift_JIS"); // サイトからダウンロードできるCSVはShift_JISのため、文字コード変換を行う
        let ret = [];
        // 読み込んだCSVの行数分ループ
        readData.split(/\r\n/).forEach(function(value) {
          if (value != "") {
            let tmp = value.split(',');
            ret.push({
              "store" : tmp[1],
              "amount"  : tmp[6]
            });
          }
         });

        // 店舗単位で集計
        let total = 0;
        let summary = ret.reduce(function (result, current) {
          let element = result.find(function (p) {
            return p.store === current.store
          });
          total += parseInt(current.amount);
          if (element) {
            // 同一店舗名が既にある場合は利用回数と金額を加算していく
            element.count++;
            element.amount = (parseInt(element.amount) + parseInt(current.amount));
          } else {
            // 店舗がない場合は初期化
            result.push({
              store: current.store,
              count: 1,
              amount: current.amount
            });
          }
          return result;
        }, []);

        let view =[];
        view.push({
            file:path.basename(files[0]),
            total:total,
            result:summary
        });
        // 作成したデータをレンダラープロセスに渡す
        event.sender.send('read-file', view);
      });
    }
  })
})
