const {ipcRenderer} = require('electron')
const selectDirBtn = document.getElementById('select-directory')

// ファイル選択ボタン押下時
selectDirBtn.addEventListener('click', (event) => {
  ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('read-file', (event, data) => {
  let tag = "<table class='view'><thead><tr><th>利用店名</th><th>利用金額</th><th>利用回数</th></tr></thead><tbody>";
  for (var i in data[0].result) {
    // 集計したデータの表示
  	tag += `<tr><td>${data[0].result[i].store}</td><td class="amount">${parseInt(data[0].result[i].amount).toLocaleString()}円</td><td class="count">${parseInt(data[0].result[i].count).toLocaleString()}</td></tr>`;
  }
  tag += "</tbody></table>";
  document.getElementById('file').innerHTML = `読み込んだファイル:${data[0].file}`;
  document.getElementById('total').innerHTML = `合計:${data[0].total.toLocaleString()}円`;
  document.getElementById('view').innerHTML = tag;
})
