const {ipcRenderer} = require('electron');
const selectFile = document.getElementById('selectFile');

// ファイル選択ボタン押下時
selectFile.addEventListener('click', (event) => {
  ipcRenderer.send('openFileDialog');
});

// 集計したデータの表示
ipcRenderer.on('showData', (event, data) => {
  let tag = "<table class='view'><thead><tr><th>利用店名</th><th>利用金額</th><th>利用回数</th></tr></thead><tbody>";
  data[0].result.forEach(value => {
    tag += `<tr><td><a id="detail" href="javascript:detailClick('${value.store}');">${value.store}</a></td><td class="amount">${parseInt(value.amount).toLocaleString()}円</td><td class="count">${parseInt(value.count).toLocaleString()}</td></tr>`;
  }
  tag += "</tbody></table>";
  document.getElementById('file').innerHTML = `読み込んだファイル:${data[0].file}`;
  document.getElementById('total').innerHTML = `合計:${data[0].total.toLocaleString()}円`;
  document.getElementById('view').innerHTML = tag;
});
