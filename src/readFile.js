const {ipcMain, dialog} = require('electron')

var ret = [];
var targetStore = "";

// ファイル選択
ipcMain.on('openFileDialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, (files) => {
    if (files) {
      const fs = require('fs');
      const iconv = require('iconv-lite');
      const path = require('path');
      ret = [];
      targetStore = "";
      fs.readFile(files[0], (err, data) => {
        if (err) throw err;
        let buf = new Buffer(data, 'binary'); // 読み込んだデータをバッファに格納
        let readData = iconv.decode(buf, "Shift_JIS"); // サイトからダウンロードできるCSVはShift_JISのため、文字コード変換を行う
        // 読み込んだCSVの行数分ループ
        readData.split(/\r\n/).forEach(value => {
          if (value != "") {
            let tmp = value.split(',');
            ret.push({
              "date" : tmp[0],
              "store" : tmp[1],
              "amount" : tmp[6]
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
        let read = [];
        read.push({
            file:path.basename(files[0]),
            total:total,
            result:summary
        });
        // 作成したデータをレンダラープロセスに渡す
        event.sender.send('showData', read);
      });
    }
  })
})

// 詳細画面表示
ipcMain.on('showDetail', (event, storeName) => {
  const {BrowserWindow} = require('electron');
  const path = require('path');
  const modalPath = path.join('file://', __dirname, './detail.html');
  let win = new BrowserWindow({ width: 400, height: 320 });
  //win.webContents.openDevTools();

  targetStore = storeName;
  win.on('close', () => { win = null });
  win.loadURL(modalPath);
  win.show();
});

// 詳細表示用データ作成
ipcMain.on('getDetailData', (event) => {
  let tmp = [];
  let total = 0;
  ret.forEach(value => {
    if (targetStore == value.store) {
      total += parseInt(value.amount);
      tmp.push({
        "date" : value.date,
        "amount" : value.amount
      });
    }
  });

  let detail = [];
  detail.push({
      store:targetStore,
      total:total,
      result:tmp
  });

  event.sender.send('showDetail', detail);
});
